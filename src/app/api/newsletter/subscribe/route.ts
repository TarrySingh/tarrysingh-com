import { NextRequest, NextResponse } from "next/server"
import { postLeadToCrm } from "@/lib/crm/post-lead"

export const runtime = "nodejs"

/**
 * Dispatches newsletter signup endpoint.
 *
 * Validates the request shape, forwards an HMAC-signed Lead v1
 * payload to RealAI-CRM at /api/webhooks/tarrysingh (cloned from
 * the earthscan webhook contract), and returns success/failure to
 * the form.
 *
 * Failure-mode rules:
 *   - Always returns ok=true to the visitor when the email shape is
 *     valid. If the CRM is unreachable we degrade to a logged-only
 *     outcome and the lead is replayed by hand from Vercel logs.
 *     Losing a subscriber to a CRM outage would be a worse failure
 *     than a soft success.
 *   - Returns 422 only when the email itself is malformed — that's
 *     a user-facing correctable problem.
 *   - Returns 400 only when the JSON body is unparseable.
 *
 * CRM-side wiring lives in realai-crm/src/app/api/webhooks/tarrysingh
 * (clone of earthscan/route.ts). Three env vars there:
 *   TARRYSINGH_WEBHOOK_SECRET (must match CRM_WEBHOOK_SECRET here),
 *   TARRYSINGH_WEBHOOK_OWNER_USER_ID, TARRYSINGH_AUTO_ENROLL_CADENCE_ID.
 */

interface SubscribeBody {
  email?: unknown
  source?: unknown
  referrer?: unknown
  utm_source?: unknown
  utm_medium?: unknown
  utm_campaign?: unknown
  utm_term?: unknown
  utm_content?: unknown
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined
}

export async function POST(req: NextRequest) {
  let body: SubscribeBody
  try {
    body = (await req.json()) as SubscribeBody
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    )
  }

  const email = typeof body.email === "string" ? body.email.trim() : ""
  if (!email || !isValidEmail(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "invalid_email" },
      { status: 422 },
    )
  }

  const source = asString(body.source) ?? "/"
  const referrer = asString(body.referrer) ?? req.headers.get("referer") ?? undefined
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined
  const ua = req.headers.get("user-agent") ?? undefined

  const utm = {
    source: asString(body.utm_source),
    medium: asString(body.utm_medium),
    campaign: asString(body.utm_campaign),
    term: asString(body.utm_term),
    content: asString(body.utm_content),
  }
  const hasUtm = Object.values(utm).some((v) => v !== undefined)

  const result = await postLeadToCrm({
    source: "newsletter",
    lead: { email },
    context: {
      consent: true,
      referrer,
      tags: ["dispatches", "tarrysingh-com"],
      ...(hasUtm ? { utm } : {}),
      page: source,
      ip,
      userAgent: ua,
    },
  })

  if (!result.ok) {
    // The CRM is reachable but rejected the payload (signature or
    // schema). That's a developer bug, not a user one — but the
    // visitor shouldn't see a stack trace. Return a vague soft
    // failure; the structured log line in post-lead.ts already
    // captured everything for triage.
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

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405 },
  )
}
