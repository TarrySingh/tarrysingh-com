import { NextRequest, NextResponse } from "next/server"

/**
 * Middleware to assign an anonymous user ID cookie (`sim_user_id`)
 * for token management and purchase tracking.
 * Runs on API routes that need user identification.
 */
export function middleware(request: NextRequest) {
  const existing = request.cookies.get("sim_user_id")?.value

  if (existing) {
    return NextResponse.next()
  }

  // Generate anonymous user ID
  const userId = crypto.randomUUID()
  const response = NextResponse.next()

  response.cookies.set("sim_user_id", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60, // 1 year
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
  ],
}
