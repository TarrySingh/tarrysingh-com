import { NextRequest, NextResponse } from "next/server"
import {
  PANORAIMA_COOKIE,
  PANORAIMA_LOGIN_PATH,
  SESSION_COOKIE_OPTIONS,
  createSessionToken,
} from "@/lib/panoraima/auth"
import {
  consumeLoginToken,
  findMemberByEmail,
  resolveRole,
  touchLastLogin,
} from "@/lib/panoraima/members"

/**
 * GET /api/panoraima/magic/verify?token=...
 *
 * Burns the single-use token, starts a session and lands the visitor on the
 * dashboard. Failures go back to the login page with a reason rather than
 * showing a bare error.
 */

export const runtime = "nodejs"

const DASHBOARD = "/experiments/panoraima"

function backToLogin(request: NextRequest, reason: string) {
  const url = new URL(PANORAIMA_LOGIN_PATH, request.nextUrl.origin)
  url.searchParams.set("error", reason)
  const res = NextResponse.redirect(url)
  res.headers.set("Cache-Control", "no-store")
  return res
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  if (!token) return backToLogin(request, "missing")

  const email = await consumeLoginToken(token)
  if (!email) return backToLogin(request, "expired")

  const member = await findMemberByEmail(email)
  if (!member || member.disabled) return backToLogin(request, "revoked")

  const session = await createSessionToken({
    email: member.email,
    role: resolveRole(member.email, member.role),
  })
  if (!session) return backToLogin(request, "failed")

  await touchLastLogin(member.email)

  const res = NextResponse.redirect(new URL(DASHBOARD, request.nextUrl.origin))
  res.cookies.set(PANORAIMA_COOKIE, session, SESSION_COOKIE_OPTIONS)
  res.headers.set("Cache-Control", "no-store")
  return res
}
