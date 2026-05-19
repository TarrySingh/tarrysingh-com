import { NextRequest, NextResponse } from "next/server"
import { amsterdamDateToday, getBrief } from "@/lib/studio/daily-brief"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Read endpoint for Claude Cowork's morning fetch.
 *
 * GET /api/studio/brief/today
 *   Authorization: Bearer ${STUDIO_BRIEF_READ_TOKEN}
 *
 * Returns the brief for today's Amsterdam-local date. Cowork's prompt
 * fetches this URL before generating the article. If `decision === "yes"`
 * Cowork folds the brief into the day's instructions; otherwise the
 * rotation runs untouched.
 *
 * Auth is a static bearer token (separate from CRON_SECRET so Cowork's
 * prompt doesn't carry the Vercel cron secret). Set
 * STUDIO_BRIEF_READ_TOKEN on Vercel and paste the same string into
 * Cowork's prompt.
 *
 * Response (200):
 *   { ok: true, forDate, decision: 'pending'|'yes'|'no', brief: string }
 * Response (401):
 *   { ok: false, error: 'unauthorized' }
 */

function isAuthorized(req: NextRequest): boolean {
  const token = process.env.STUDIO_BRIEF_READ_TOKEN
  if (!token) return false
  const header = req.headers.get("authorization") ?? ""
  if (!header.startsWith("Bearer ")) return false
  return header.slice(7).trim() === token
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    )
  }
  const forDate = amsterdamDateToday()
  const row = await getBrief(forDate)
  if (!row) {
    return NextResponse.json({
      ok: true,
      forDate,
      decision: "no",
      brief: "",
      note: "no_row_for_date — treat as no brief",
    })
  }
  return NextResponse.json({
    ok: true,
    forDate,
    decision: row.decision,
    brief: row.decision === "yes" ? row.brief : "",
  })
}
