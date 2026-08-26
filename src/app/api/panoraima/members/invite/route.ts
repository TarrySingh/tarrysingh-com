import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { PANORAIMA_COOKIE, readSessionToken } from "@/lib/panoraima/auth"
import {
  INVITE_TTL_MINUTES,
  can,
  createLoginToken,
  findMemberById,
  markInvited,
  resolveRole,
} from "@/lib/panoraima/members"

/**
 * POST /api/panoraima/members/invite  { id }
 *
 * Sends (or resends) a welcome email containing a sign-in link to one member.
 * Adding a member never emails anyone on its own: invites are a deliberate,
 * per-person action so a mistyped address cannot fire off a confusing email
 * to a partner institution.
 *
 * Invite links last INVITE_TTL_MINUTES (7 days) rather than the 30 minutes a
 * plain sign-in link gets, because an invite has to survive an inbox.
 */

export const runtime = "nodejs"

const FROM = "PANORAIMA Dashboard <studio@tarrysingh.com>"

function siteUrl(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.nextUrl.origin ||
    "https://www.tarrysingh.com"
  )
}

export async function POST(request: NextRequest) {
  const session = await readSessionToken(
    request.cookies.get(PANORAIMA_COOKIE)?.value,
  )
  if (!session || !can(resolveRole(session.email, session.role), "manage_members")) {
    return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const id = typeof body.id === "string" ? body.id : ""
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 })
  }

  const member = await findMemberById(id)
  if (!member) {
    return NextResponse.json({ ok: false, error: "No such member." }, { status: 404 })
  }
  if (member.disabled) {
    return NextResponse.json(
      { ok: false, error: "That account is suspended. Re-enable it first." },
      { status: 400 },
    )
  }

  const key = process.env.RESEND_API_KEY
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "Email is not configured (RESEND_API_KEY missing)." },
      { status: 500 },
    )
  }

  const token = await createLoginToken(member.email, INVITE_TTL_MINUTES)
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Could not create an invite link." },
      { status: 500 },
    )
  }

  const link = `${siteUrl(request)}/api/panoraima/magic/verify?token=${encodeURIComponent(token)}`
  const greeting = member.display_name ? `Hello ${member.display_name},` : "Hello,"
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#16181D">
      <p>${greeting}</p>
      <p>
        You have been given access to the PANORAIMA consortium dashboard, which
        tracks the project's work packages, learning events and review status.
      </p>
      <p style="margin:22px 0">
        <a href="${link}"
           style="background:#B23E22;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:700;display:inline-block">
          Open the dashboard
        </a>
      </p>
      <p>
        The link signs you in directly, so there is no password to remember. It
        is valid for 7 days and can be used once. After that you can request a
        fresh link from the sign-in page at any time.
      </p>
      <p style="color:#5B616B;font-size:13px">
        If you were not expecting this, you can ignore this email.
      </p>
    </div>`

  try {
    const resend = new Resend(key)
    const sent = await resend.emails.send({
      from: FROM,
      to: [member.email],
      subject: "Your access to the PANORAIMA consortium dashboard",
      html,
    })
    if (sent.error) {
      console.error("[panoraima/invite] send failed:", sent.error)
      return NextResponse.json(
        { ok: false, error: "The email could not be sent." },
        { status: 502 },
      )
    }
  } catch (err) {
    console.error("[panoraima/invite] send threw:", err)
    return NextResponse.json(
      { ok: false, error: "The email could not be sent." },
      { status: 502 },
    )
  }

  await markInvited(member.email)
  return NextResponse.json({ ok: true, email: member.email })
}
