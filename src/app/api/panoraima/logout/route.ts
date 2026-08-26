import { NextResponse } from "next/server"
import { PANORAIMA_COOKIE, PANORAIMA_LOGIN_PATH } from "@/lib/panoraima/auth"

/** GET /api/panoraima/logout — clears the session cookie. */
export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(PANORAIMA_LOGIN_PATH, request.url)
  const response = NextResponse.redirect(url)
  response.cookies.set(PANORAIMA_COOKIE, "", { path: "/", maxAge: 0 })
  response.headers.set("Cache-Control", "no-store")
  return response
}
