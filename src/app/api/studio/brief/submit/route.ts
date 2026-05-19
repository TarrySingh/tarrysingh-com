import { NextRequest, NextResponse } from "next/server"
import { verifyBriefToken } from "@/lib/studio/brief-token"
import { setBriefDecision } from "@/lib/studio/daily-brief"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/studio/brief/submit
 *
 * Body: { token: string, brief: string }
 * Auth: signed token (HMAC + 30 h TTL) from the evening prompt email.
 *
 * Records `decision = yes` plus the brief text on the matching
 * studio_daily_briefs row.
 */

const MAX_BRIEF_LENGTH = 8000

export async function POST(req: NextRequest) {
  const secret = process.env.STUDIO_APPROVAL_SECRET
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "approval_secret_unset" },
      { status: 503 },
    )
  }

  let body: { token?: unknown; brief?: unknown }
  try {
    body = (await req.json()) as { token?: unknown; brief?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const token = typeof body.token === "string" ? body.token : ""
  const brief = typeof body.brief === "string" ? body.brief.trim() : ""
  if (!token) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 })
  }
  if (!brief || brief.length < 4) {
    return NextResponse.json({ ok: false, error: "brief_too_short" }, { status: 422 })
  }
  if (brief.length > MAX_BRIEF_LENGTH) {
    return NextResponse.json(
      { ok: false, error: "brief_too_long" },
      { status: 422 },
    )
  }

  const verify = verifyBriefToken(token, secret)
  if (!verify.ok) {
    return NextResponse.json(
      { ok: false, error: verify.error },
      { status: verify.error === "expired" ? 410 : 401 },
    )
  }

  try {
    await setBriefDecision(verify.payload.forDate, "yes", brief)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { ok: false, error: "brief_save_failed", debug: message },
      { status: 502 },
    )
  }

  console.log(
    JSON.stringify({
      tag: "studio.brief.submitted",
      forDate: verify.payload.forDate,
      length: brief.length,
    }),
  )
  return NextResponse.json({
    ok: true,
    forDate: verify.payload.forDate,
  })
}
