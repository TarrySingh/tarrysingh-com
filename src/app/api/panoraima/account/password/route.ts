import { NextRequest, NextResponse } from "next/server"
import {
  PANORAIMA_COOKIE,
  SHARED_CREDENTIAL_IDENTITY,
  readSessionToken,
} from "@/lib/panoraima/auth"
import {
  findMemberByEmail,
  logAccess,
  setMemberPassword,
  verifyPassword,
} from "@/lib/panoraima/members"

/**
 * POST /api/panoraima/account/password
 *
 * Lets the signed-in member set or change their own password. Identity comes
 * from the session cookie, never from the request body, so one member cannot
 * set another's password.
 *
 * If a password already exists the current one must be supplied, so a
 * borrowed session cannot lock the real owner out. A member who arrived by
 * magic link and has no password yet can set one directly.
 */

export const runtime = "nodejs"

const MIN_LENGTH = 10

export async function GET(request: NextRequest) {
  const session = await readSessionToken(
    request.cookies.get(PANORAIMA_COOKIE)?.value,
  )
  if (!session || session.email === SHARED_CREDENTIAL_IDENTITY) {
    return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 })
  }
  const member = await findMemberByEmail(session.email)
  return NextResponse.json({
    ok: true,
    email: session.email,
    role: session.role,
    hasPassword: Boolean(member?.password_hash),
  })
}

export async function POST(request: NextRequest) {
  const session = await readSessionToken(
    request.cookies.get(PANORAIMA_COOKIE)?.value,
  )
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 })
  }
  if (session.email === SHARED_CREDENTIAL_IDENTITY) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "The shared login is not a personal account. Ask for an invite to set your own password.",
      },
      { status: 403 },
    )
  }

  const body = await request.json().catch(() => ({}))
  const password = typeof body.password === "string" ? body.password : ""
  const confirm = typeof body.confirm === "string" ? body.confirm : ""
  const current = typeof body.current === "string" ? body.current : ""

  if (password.length < MIN_LENGTH) {
    return NextResponse.json(
      { ok: false, error: `Use at least ${MIN_LENGTH} characters.` },
      { status: 400 },
    )
  }
  if (password !== confirm) {
    return NextResponse.json(
      { ok: false, error: "The two passwords do not match." },
      { status: 400 },
    )
  }

  const member = await findMemberByEmail(session.email)
  if (!member || member.disabled) {
    return NextResponse.json(
      { ok: false, error: "That account is no longer active." },
      { status: 403 },
    )
  }

  const hadPassword = Boolean(member.password_hash)
  if (hadPassword) {
    const ok = await verifyPassword(current, member.password_hash)
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "That current password is not right." },
        { status: 403 },
      )
    }
    if (current === password) {
      return NextResponse.json(
        { ok: false, error: "That is already your password." },
        { status: 400 },
      )
    }
  }

  const saved = await setMemberPassword(session.email, password)
  if (!saved) {
    return NextResponse.json(
      { ok: false, error: "Could not save that password." },
      { status: 500 },
    )
  }

  await logAccess({
    event: hadPassword ? "password_changed" : "password_set",
    email: session.email,
    ip:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip"),
  })

  return NextResponse.json({ ok: true, hadPassword })
}
