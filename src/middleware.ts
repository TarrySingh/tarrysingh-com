import { NextRequest, NextResponse } from "next/server"
import {
  PANORAIMA_COOKIE,
  PANORAIMA_LOGIN_PATH,
  verifySessionToken,
} from "@/lib/panoraima/auth"

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
 */

const PANORAIMA_PREFIX = "/experiments/panoraima"
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

    const hasSession = await verifySessionToken(
      request.cookies.get(PANORAIMA_COOKIE)?.value,
    )
    // Basic Auth remains valid so bookmarks and scripts are not broken.
    const hasBasicAuth =
      hasSession || checkBasicAuth(request, "PANORAIMA_USER", "PANORAIMA_PASS")

    if (!hasSession && !hasBasicAuth) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = PANORAIMA_LOGIN_PATH
      loginUrl.search = ""
      loginUrl.searchParams.set("next", pathname + request.nextUrl.search)
      const res = NextResponse.redirect(loginUrl)
      res.headers.set("X-Robots-Tag", "noindex, nofollow")
      res.headers.set("Cache-Control", "no-store")
      return res
    }

    const res = NextResponse.next()
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
    "/api/tokens/:path*",
    "/api/simulation/:path*",
    "/api/stripe/:path*",
    "/api/studio/:path*",
    "/experiments/agent-and-me/:path*",
    "/experiments/panoraima/:path*",
    "/studio/:path*",
  ],
}
