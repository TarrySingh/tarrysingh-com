import { NextRequest, NextResponse } from "next/server"

/**
 * Stub newsletter subscribe endpoint.
 *
 * For now it validates the request shape, logs the submission, and
 * returns 200. The RealAI-CRM bridge lands in P3: this handler will
 * then HMAC-sign the payload and POST it to the CRM's
 * /api/webhooks/tarrysingh endpoint, which enrols the lead in the
 * "Tarrysingh Welcome" cadence and queues a Resend confirmation.
 *
 * Until then, treat this as a public dead-letter office. Nothing
 * persists. Submissions during this window will be replayed by hand
 * once the bridge is live.
 */

interface SubscribeBody {
  email?: unknown
  source?: unknown
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
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
  const source =
    typeof body.source === "string" && body.source.length > 0
      ? body.source
      : "/"

  if (!email || !isValidEmail(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "invalid_email" },
      { status: 422 },
    )
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const ua = req.headers.get("user-agent") ?? "unknown"

  console.log(
    JSON.stringify({
      tag: "dispatches.subscribe.pending_bridge",
      email,
      source,
      ip,
      ua,
      ts: new Date().toISOString(),
    }),
  )

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405 },
  )
}
