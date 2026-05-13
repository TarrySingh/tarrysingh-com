import { NextRequest, NextResponse } from "next/server"
import { postLeadToCrm } from "@/lib/crm/post-lead"
import { verifyUnsubscribeToken } from "@/lib/crm/unsubscribe-token"

export const runtime = "nodejs"

/**
 * One-click unsubscribe endpoint.
 *
 * Called either:
 *   - by the user from /blog/unsubscribe (POST after viewing the
 *     confirmation page), or
 *   - by mail clients that honour List-Unsubscribe-Post: One-Click
 *     (POST directly, no UI), per RFC 8058.
 *
 * Either way it verifies the HMAC token from the URL, then posts a
 * source="unsubscribe" event to RealAI-CRM. The CRM handler upserts
 * CadenceUnsubscribe (keyed on the email — idempotent), which halts
 * all current and future cadence sends for that address.
 *
 * Both POST and GET are accepted: GET is the human path from the
 * email-client URL ("here is the unsubscribe page"). POST is the
 * machine path. Both end at the same effect.
 */

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function handle(email: string, token: string) {
  const secret = process.env.CRM_UNSUBSCRIBE_TOKEN_SECRET
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "unsubscribe_unconfigured" },
      { status: 503 },
    )
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "invalid_email" },
      { status: 422 },
    )
  }
  if (!token || !verifyUnsubscribeToken(email, token, secret)) {
    return NextResponse.json(
      { ok: false, error: "invalid_token" },
      { status: 403 },
    )
  }

  const result = await postLeadToCrm({
    source: "unsubscribe",
    lead: { email },
    context: {
      consent: false,
      reason: "user_clicked_unsubscribe_link",
      tags: ["dispatches", "tarrysingh-com"],
    },
  })

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "crm_unavailable", eventId: result.eventId },
      { status: 502 },
    )
  }
  return NextResponse.json({
    ok: true,
    outcome: result.outcome,
    eventId: result.eventId,
  })
}

export async function POST(req: NextRequest) {
  let body: { email?: unknown; token?: unknown } = {}
  try {
    body = await req.json()
  } catch {
    // empty body is fine; fall through to query-param path
  }
  const url = new URL(req.url)
  const email =
    (typeof body.email === "string" && body.email.trim()) ||
    (url.searchParams.get("e") ?? "")
  const token =
    (typeof body.token === "string" && body.token.trim()) ||
    (url.searchParams.get("t") ?? "")

  return handle(email.toLowerCase(), token)
}

export async function GET(req: NextRequest) {
  // RFC 8058 one-click clients sometimes preflight with GET — accept
  // for compatibility and still process. Most clients hit POST.
  const url = new URL(req.url)
  const email = (url.searchParams.get("e") ?? "").toLowerCase()
  const token = url.searchParams.get("t") ?? ""
  return handle(email, token)
}
