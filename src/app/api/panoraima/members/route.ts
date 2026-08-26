import { NextRequest, NextResponse } from "next/server"
import { PANORAIMA_COOKIE, readSessionToken } from "@/lib/panoraima/auth"
import {
  addMember,
  can,
  listMembers,
  removeMember,
  resolveRole,
  setMemberDisabled,
  setMemberRole,
  type PanoraimaRole,
} from "@/lib/panoraima/members"

/**
 * Member management. Admin only.
 *
 * These paths sit outside the middleware matcher, so each handler verifies
 * the session cookie itself rather than trusting an upstream header.
 */

export const runtime = "nodejs"

async function requireAdmin(request: NextRequest) {
  const session = await readSessionToken(
    request.cookies.get(PANORAIMA_COOKIE)?.value,
  )
  if (!session) return null
  const role = resolveRole(session.email, session.role)
  if (!can(role, "manage_members")) return null
  return session
}

const denied = () =>
  NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 })

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request)
  if (!session) return denied()
  return NextResponse.json({ ok: true, members: await listMembers() })
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin(request)
  if (!session) return denied()

  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === "string" ? body.email : ""
  const role: PanoraimaRole = body.role === "admin" ? "admin" : "member"
  const displayName =
    typeof body.displayName === "string" && body.displayName.trim()
      ? body.displayName.trim()
      : null

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "An email address is required." },
      { status: 400 },
    )
  }

  const result = await addMember({
    email,
    role,
    displayName,
    invitedBy: session.email,
  })
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
  }
  return NextResponse.json({ ok: true, member: result.member })
}

export async function PATCH(request: NextRequest) {
  const session = await requireAdmin(request)
  if (!session) return denied()

  const body = await request.json().catch(() => ({}))
  const id = typeof body.id === "string" ? body.id : ""
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 })
  }

  if (body.role === "admin" || body.role === "member") {
    const ok = await setMemberRole(id, body.role)
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Could not change that role." },
        { status: 500 },
      )
    }
  }

  if (typeof body.disabled === "boolean") {
    const ok = await setMemberDisabled(id, body.disabled)
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Could not change that account." },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdmin(request)
  if (!session) return denied()

  const id = request.nextUrl.searchParams.get("id") || ""
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 })
  }
  const ok = await removeMember(id)
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Could not remove that member." },
      { status: 500 },
    )
  }
  return NextResponse.json({ ok: true })
}
