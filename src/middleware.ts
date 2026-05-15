import { NextRequest, NextResponse } from "next/server"

/**
 * Middleware responsibilities:
 *   1. Basic Auth gate for /experiments/panoraima/* (consortium-only view).
 *      Credentials are PANORAIMA_USER / PANORAIMA_PASS env vars.
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- 1) PANORAIMA Basic Auth ------------------------------------------
  if (pathname.startsWith(PANORAIMA_PREFIX)) {
    if (!checkBasicAuth(request, "PANORAIMA_USER", "PANORAIMA_PASS")) {
      return unauthorizedResponse("PANORAIMA Dashboard")
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
