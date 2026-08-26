import { NextRequest, NextResponse } from "next/server"
import {
  PANORAIMA_COOKIE,
  SESSION_COOKIE_OPTIONS,
  SHARED_CREDENTIAL_IDENTITY,
  createSessionToken,
} from "@/lib/panoraima/auth"
import {
  findMemberByEmail,
  normaliseEmail,
  resolveRole,
  logAccess,
  touchLastLogin,
  verifyPassword,
} from "@/lib/panoraima/members"

/**
 * POST /api/panoraima/login
 *
 * Two ways in:
 *   1. A named member signing in with their own email and password.
 *   2. The legacy shared consortium credential (PANORAIMA_USER /
 *      PANORAIMA_PASS). That credential is already circulating among
 *      partners, so it grants the view-only member role, never admin.
 *
 * Deliberately outside the middleware matcher so it stays reachable while
 * logged out.
 */

export const runtime = "nodejs"

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clientIp(request: NextRequest): string | null {
  return (
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    null
  )
}

function fail() {
  return NextResponse.json(
    { ok: false, error: "That username and password did not match." },
    { status: 401 },
  )
}

export async function POST(request: NextRequest) {
  let username = ""
  let password = ""

  const contentType = request.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}))
    username = typeof body.username === "string" ? body.username : ""
    password = typeof body.password === "string" ? body.password : ""
  } else {
    const form = await request.formData().catch(() => null)
    username = String(form?.get("username") ?? "")
    password = String(form?.get("password") ?? "")
  }

  if (!username || !password) return fail()

  const sharedUser = process.env.PANORAIMA_USER || ""
  const sharedPass = process.env.PANORAIMA_PASS || ""

  if (!sharedPass) {
    console.error("[panoraima/login] PANORAIMA_PASS is not set")
    return NextResponse.json(
      { ok: false, error: "Login is not configured. Contact the site owner." },
      { status: 500 },
    )
  }

  let identity: { email: string; role: "admin" | "member" } | null = null

  // 1) Shared consortium credential -> view-only member.
  if (sharedUser && username === sharedUser && password === sharedPass) {
    identity = { email: SHARED_CREDENTIAL_IDENTITY, role: "member" }
  }

  // 2) Named member signing in with their own password.
  if (!identity && username.includes("@")) {
    const email = normaliseEmail(username)
    const member = await findMemberByEmail(email)
    if (member && !member.disabled) {
      const ok = await verifyPassword(password, member.password_hash)
      if (ok) {
        identity = { email: member.email, role: resolveRole(member.email, member.role) }
      }
    }
  }

  if (!identity) {
    await pause(600)
    await logAccess({
      event: "sign_in_failed",
      email: username.includes("@") ? username : null,
      detail: username.includes("@") ? "password" : "shared credential",
      ip: clientIp(request),
    })
    return fail()
  }

  const token = await createSessionToken(identity)
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Could not start a session." },
      { status: 500 },
    )
  }

  if (identity.email !== SHARED_CREDENTIAL_IDENTITY) {
    await touchLastLogin(identity.email)
    await logAccess({
      event: "sign_in_password",
      email: identity.email,
      ip: clientIp(request),
    })
  } else {
    await logAccess({
      event: "sign_in_shared",
      detail: "shared consortium credential",
      ip: clientIp(request),
    })
  }

  const response = NextResponse.json({ ok: true, role: identity.role })
  response.cookies.set(PANORAIMA_COOKIE, token, SESSION_COOKIE_OPTIONS)
  response.headers.set("Cache-Control", "no-store")
  return response
}
