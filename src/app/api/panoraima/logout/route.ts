import { NextResponse } from "next/server"
import {
  PANORAIMA_COOKIE,
  PANORAIMA_LOGIN_PATH,
  readSessionToken,
} from "@/lib/panoraima/auth"
import { logAccess } from "@/lib/panoraima/members"

/** GET /api/panoraima/logout — clears the session cookie. */
export const runtime = "nodejs"

export async function GET(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${PANORAIMA_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=")
  const session = await readSessionToken(cookie)
  if (session) {
    await logAccess({ event: "sign_out", email: session.email })
  }

  const url = new URL(PANORAIMA_LOGIN_PATH, request.url)
  const response = NextResponse.redirect(url)
  response.cookies.set(PANORAIMA_COOKIE, "", { path: "/", maxAge: 0 })
  response.headers.set("Cache-Control", "no-store")
  return response
}
