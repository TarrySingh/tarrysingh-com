import { NextRequest, NextResponse } from "next/server"
import {
  PANORAIMA_COOKIE,
  PANORAIMA_LOGIN_PATH,
  readSessionToken,
} from "@/lib/panoraima/auth"
import {
  ACCESS_PATH,
  isDevPreview,
  readSessionSecret,
  sessionCookieName,
} from "@/lib/cv/access/env"
import { verifySession } from "@/lib/cv/access/session"

/**
 * Middleware responsibilities:
 *   1. Auth gate for /experiments/panoraima/* (consortium-only view).
 *      Visitors without a session are redirected to a real login form at
 *      /experiments/panoraima/login rather than being shown the browser's
 *      bare "Authentication required." text. A signed session cookie is the
 *      normal path; Basic Auth is still accepted so existing bookmarks,
 *      curl calls and scripts keep working. Credentials for both are the
 *      PANORAIMA_USER / PANORAIMA_PASS env vars.
 *      Also stamps X-Robots-Tag: noindex so accidental indexing is prevented.
 *   2. Basic Auth gate for /studio/* and /api/studio/* (Tarry's writing
 *      surface). Credentials are STUDIO_USER / STUDIO_PASS env vars.
 *      Also stamps X-Robots-Tag: noindex.
 *   3. Anonymous sim_user_id cookie for token-based routes.
 *   4. Executive profile dossier gate (/curriculumvitae/dossier and
 *      /api/cv/download): a signed per-grant session cookie. This is the
 *      FIRST gate only; the pages and the download route re-check the grant
 *      against the database on every request (see lib/cv/access/server.ts).
 *      Fails closed when CV_ACCESS_ENABLED is not "true" or the session
 *      secret is missing. Returns before the sim_user_id logic, so the
 *      gated area sets no other cookie.
 */

const PANORAIMA_PREFIX = "/experiments/panoraima"
const DOSSIER_PREFIX = "/curriculumvitae/dossier"
const CV_DOWNLOAD_PREFIX = "/api/cv/download"
const PANORAIMA_ADMIN_PREFIX = "/experiments/panoraima/admin"
const STUDIO_PREFIX = "/studio"
const STUDIO_API_PREFIX = "/api/studio"

// Sprint — auto-publish pipeline. Two studio API endpoints use their
// own auth model (HMAC for ingest, signed token for approve) instead
// of Basic Auth because:
//   - the LaunchAgent calling /api/studio/ingest is unattended and
//     shouldn't have to embed STUDIO_USER/STUDIO_PASS
//   - the approval email click on /api/studio/approve lands in a
//     fresh browser session that won't have Basic Auth cached
// These prefixes bypass the studio Basic Auth gate but still go
// through the rest of middleware.
const STUDIO_API_HMAC_PATHS = [
  "/api/studio/ingest",
  "/api/studio/approve",
  // Silent-failure alert posted by the LaunchAgent watcher after N
  // consecutive ingest failures. Same HMAC auth as /api/studio/ingest.
  "/api/studio/alert",
  // Daily-brief loop — all three carry their own signed-token or
  // bearer auth (not Basic-Auth), and the email flow opens them in a
  // fresh browser session that won't have Basic-Auth cached.
  "/api/studio/brief/submit",
  "/api/studio/brief/decline",
  "/api/studio/brief/today",
  // The Yes-button form page itself.
  "/studio/brief",
]

function unauthorizedResponse(realm: string): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${realm}", charset="UTF-8"`,
      "Cache-Control": "no-store",
    },
  })
}

function checkBasicAuth(
  request: NextRequest,
  userEnv: string,
  passEnv: string,
): boolean {
  const header = request.headers.get("authorization")
  if (!header?.startsWith("Basic ")) return false
  const expectedUser = process.env[userEnv] || ""
  const expectedPass = process.env[passEnv] || ""
  if (!expectedUser || !expectedPass) return false
  try {
    const [user, ...rest] = atob(header.slice(6)).split(":")
    const pass = rest.join(":")
    return user === expectedUser && pass === expectedPass
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- 1) PANORAIMA gate: session cookie, or Basic Auth as a fallback ----
  if (pathname.startsWith(PANORAIMA_PREFIX)) {
    // The login form itself must stay reachable, or the redirect below loops.
    if (pathname === PANORAIMA_LOGIN_PATH) {
      const res = NextResponse.next()
      res.headers.set("X-Robots-Tag", "noindex, nofollow")
      return res
    }

    const session = await readSessionToken(
      request.cookies.get(PANORAIMA_COOKIE)?.value,
    )

    // The shared credential is already circulating among partners, so Basic
    // Auth grants the view-only member role and never admin.
    const hasBasicAuth =
      !session && checkBasicAuth(request, "PANORAIMA_USER", "PANORAIMA_PASS")

    if (!session && !hasBasicAuth) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = PANORAIMA_LOGIN_PATH
      loginUrl.search = ""
      loginUrl.searchParams.set("next", pathname + request.nextUrl.search)
      const res = NextResponse.redirect(loginUrl)
      res.headers.set("X-Robots-Tag", "noindex, nofollow")
      res.headers.set("Cache-Control", "no-store")
      return res
    }

    const role = session?.role ?? "member"

    // Member management is admin-only. Anyone else is sent back to the
    // dashboard rather than shown a page they cannot use.
    if (pathname.startsWith(PANORAIMA_ADMIN_PREFIX) && role !== "admin") {
      const res = NextResponse.redirect(
        new URL(PANORAIMA_PREFIX, request.nextUrl.origin),
      )
      res.headers.set("Cache-Control", "no-store")
      return res
    }

    // Downstream server components read these to decide what to render.
    const res = NextResponse.next({
      request: {
        headers: (() => {
          const h = new Headers(request.headers)
          h.set("x-panoraima-role", role)
          h.set("x-panoraima-email", session?.email ?? "shared")
          return h
        })(),
      },
    })
    res.headers.set("X-Robots-Tag", "noindex, nofollow")
    return res
  }

  // --- 2) Studio Editor Basic Auth (single-user) ------------------------
  if (
    pathname.startsWith(STUDIO_PREFIX) ||
    pathname.startsWith(STUDIO_API_PREFIX)
  ) {
    // HMAC/signed-token-authenticated studio endpoints bypass Basic Auth.
    const usesHmacAuth = STUDIO_API_HMAC_PATHS.some((p) =>
      pathname === p || pathname.startsWith(p + "/"),
    )
    if (!usesHmacAuth) {
      if (!checkBasicAuth(request, "STUDIO_USER", "STUDIO_PASS")) {
        return unauthorizedResponse("Studio")
      }
    }
    const res = NextResponse.next()
    res.headers.set("X-Robots-Tag", "noindex, nofollow")
    return res
  }

  // --- 2b) Executive profile dossier gate (signed session cookie) -------
  if (
    pathname === DOSSIER_PREFIX ||
    pathname.startsWith(DOSSIER_PREFIX + "/") ||
    pathname === CV_DOWNLOAD_PREFIX ||
    pathname.startsWith(CV_DOWNLOAD_PREFIX + "/")
  ) {
    const gated = (res: NextResponse) => {
      res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive")
      res.headers.set("Cache-Control", "private, no-store")
      return res
    }
    const toAccess = (closed: boolean) => {
      const url = request.nextUrl.clone()
      url.pathname = ACCESS_PATH
      url.search = ""
      if (closed) url.searchParams.set("e", "closed")
      return gated(NextResponse.redirect(url, 303))
    }

    // Local preview only; impossible in a production build (NODE_ENV is
    // inlined as "production") and on Vercel (VERCEL is set).
    if (isDevPreview(process.env)) return gated(NextResponse.next())

    const secret = readSessionSecret(process.env)
    // Kill switch off, or the secret is missing or weak: closed.
    if (!secret) return toAccess(true)

    const session = await verifySession(
      request.cookies.get(sessionCookieName(process.env))?.value,
      secret,
    )
    if (!session) return toAccess(false)
    return gated(NextResponse.next())
  }

  // --- 3) Anonymous sim_user_id cookie (existing behavior, untouched) ---
  const existing = request.cookies.get("sim_user_id")?.value
  if (existing) return NextResponse.next()

  const userId = crypto.randomUUID()
  const response = NextResponse.next()
  response.cookies.set("sim_user_id", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  })
  return response
}

export const config = {
  matcher: [
    "/api/cv/download/:path*",
    "/curriculumvitae/dossier/:path*",
    "/api/tokens/:path*",
    "/api/simulation/:path*",
    "/api/stripe/:path*",
    "/api/studio/:path*",
    "/experiments/agent-and-me/:path*",
    "/experiments/panoraima/:path*",
    "/studio/:path*",
  ],
}
