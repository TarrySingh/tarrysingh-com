import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import {
  createLoginToken,
  findMemberByEmail,
  normaliseEmail,
} from "@/lib/panoraima/members"

/**
 * POST /api/panoraima/magic/request
 *
 * Emails a single-use sign-in link to an address that is on the member list.
 * The response is deliberately identical whether or not the address is a
 * member, so the endpoint cannot be used to enumerate who has access.
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
  const body = await request.json().catch(() => ({}))
  const raw = typeof body.email === "string" ? body.email : ""
  const email = normaliseEmail(raw)

  // Same answer either way — no membership oracle.
  const genericOk = NextResponse.json({
    ok: true,
    message: "If that address is on the member list, a sign-in link is on its way.",
  })

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return genericOk

  const member = await findMemberByEmail(email)
  if (!member || member.disabled) return genericOk

  const token = await createLoginToken(email)
  if (!token) return genericOk

  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error("[panoraima/magic] RESEND_API_KEY not set; cannot send link")
    return genericOk
  }

  const link = `${siteUrl(request)}/api/panoraima/magic/verify?token=${encodeURIComponent(token)}`
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#16181D">
      <p>Here is your sign-in link for the PANORAIMA consortium dashboard.</p>
      <p style="margin:22px 0">
        <a href="${link}"
           style="background:#B23E22;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:700;display:inline-block">
          Sign in to the dashboard
        </a>
      </p>
      <p style="color:#5B616B;font-size:13px">
        This link works once and expires in 30 minutes. If you did not ask for
        it you can ignore this email.
      </p>
    </div>`

  try {
    const resend = new Resend(key)
    await resend.emails.send({
      from: FROM,
      to: [email],
      subject: "Your PANORAIMA dashboard sign-in link",
      html,
    })
  } catch (err) {
    console.error("[panoraima/magic] send failed:", err)
  }

  return genericOk
}
