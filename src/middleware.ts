import { NextRequest, NextResponse } from "next/server"

/**
 * Middleware responsibilities:
 *   1. Basic Auth gate for /experiments/panoraima/* (internal consortium view).
 *      Credentials are PANORAIMA_USER / PANORAIMA_PASS env vars.
 *      Also stamps X-Robots-Tag: noindex so accidental indexing is prevented.
 *   2. Anonymous sim_user_id cookie for token-based routes.
 */

const PANORAIMA_PREFIX = "/experiments/panoraima"

function unauthorizedResponse(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="PANORAIMA Dashboard", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  })
}

function checkBasicAuth(request: NextRequest): boolean {
  const header = request.headers.get("authorization")
  if (!header?.startsWith("Basic ")) return false
  const expectedUser = process.env.PANORAIMA_USER || ""
  const expectedPass = process.env.PANORAIMA_PASS || ""
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
    if (!checkBasicAuth(request)) return unauthorizedResponse()
    const res = NextResponse.next()
    res.headers.set("X-Robots-Tag", "noindex, nofollow")
    return res
  }

  // --- 2) Anonymous sim_user_id cookie (existing behavior, untouched) ---
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
    "/experiments/agent-and-me/:path*",
    "/experiments/panoraima/:path*",
  ],
}
