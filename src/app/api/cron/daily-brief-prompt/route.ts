import { NextRequest, NextResponse } from "next/server"
import { sendBriefPromptEmail } from "@/lib/studio/email"
import { makeBriefToken } from "@/lib/studio/brief-token"
import {
  amsterdamDateTomorrow,
  upsertPendingBrief,
} from "@/lib/studio/daily-brief"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

/**
 * Daily-brief prompt — fires the evening "anything to fold into
 * tomorrow's Dispatch?" email at 23:00 Europe/Amsterdam.
 *
 * Cron schedule is hard-set to both 21:00 UTC and 22:00 UTC in
 * vercel.json. This route checks Amsterdam-local hour internally and
 * only sends when it's exactly 23:00 there — so the same code works
 * across CEST (UTC+2) and CET (UTC+1) without a yearly DST edit.
 *
 *  - CEST (summer): 21:00 UTC = 23:00 Amsterdam → send · 22:00 UTC = 00:00 → skip
 *  - CET  (winter): 21:00 UTC = 22:00 Amsterdam → skip · 22:00 UTC = 23:00 → send
 *
 * Auth: Authorization: Bearer ${CRON_SECRET} (Vercel auto-injects on
 * cron triggers; `?force=1` lets Tarry curl-trigger for tonight's
 * test without waiting for the schedule).
 */

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.get("authorization") ?? ""
  if (!header.startsWith("Bearer ")) return false
  return header.slice(7).trim() === secret
}

function amsterdamHour(now: Date = new Date()): number {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    hour12: false,
  })
  const parts = fmt.formatToParts(now).find((p) => p.type === "hour")
  return parts ? Number(parts.value) : NaN
}

function getOrigin(req: NextRequest): string {
  return (
    process.env.SITE_ORIGIN ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(req.url).origin
  )
}

async function handleTick(req: NextRequest) {
  const url = new URL(req.url)
  const force = url.searchParams.get("force") === "1"
  const hour = amsterdamHour()

  // Window of opportunity is 23:00–23:59 Amsterdam. Outside that, skip
  // unless ?force=1 lets Tarry trigger for testing.
  if (!force && hour !== 23) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "outside_amsterdam_send_window",
      amsterdamHour: hour,
    })
  }

  const approvalSecret = process.env.STUDIO_APPROVAL_SECRET
  if (!approvalSecret) {
    return NextResponse.json(
      { ok: false, error: "approval_secret_unset" },
      { status: 503 },
    )
  }

  // We're sending the evening prompt for TOMORROW's Dispatch.
  const forDate = amsterdamDateTomorrow()

  try {
    await upsertPendingBrief(forDate)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { ok: false, error: "brief_row_insert_failed", debug: message },
      { status: 502 },
    )
  }

  const token = makeBriefToken({ forDate }, approvalSecret)
  const origin = getOrigin(req)
  const yesUrl = `${origin}/studio/brief/${encodeURIComponent(forDate)}?token=${encodeURIComponent(token)}`
  const noUrl = `${origin}/api/studio/brief/decline?token=${encodeURIComponent(token)}`

  const sent = await sendBriefPromptEmail({ forDate, yesUrl, noUrl })
  if (!sent.ok) {
    console.error(
      JSON.stringify({
        tag: "studio.brief_cron.email_failed",
        forDate,
        error: sent.error,
      }),
    )
    return NextResponse.json(
      { ok: false, error: sent.error, debug: sent.debug },
      { status: 502 },
    )
  }

  console.log(
    JSON.stringify({
      tag: "studio.brief_cron.ok",
      forDate,
      amsterdamHour: hour,
      emailId: sent.emailId,
    }),
  )
  return NextResponse.json({
    ok: true,
    forDate,
    amsterdamHour: hour,
    emailId: sent.emailId,
  })
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }
  return handleTick(req)
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }
  return handleTick(req)
}
