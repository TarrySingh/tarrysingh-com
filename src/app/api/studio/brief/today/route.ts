import { NextRequest, NextResponse } from "next/server"
import { amsterdamDateToday, getBrief } from "@/lib/studio/daily-brief"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Read endpoint for Claude Cowork's morning fetch.
 *
 * GET /api/studio/brief/today
 *
 * Accepts the token in EITHER of two transports:
 *
 *   1. Authorization: Bearer ${STUDIO_BRIEF_READ_TOKEN}   ← curl / server
 *   2. ?token=${STUDIO_BRIEF_READ_TOKEN}                  ← Cowork web_fetch
 *
 * Cowork's `web_fetch` tool can only send a URL — it has no API for
 * setting custom headers. So the same shared secret is also accepted
 * as a query param. Security model is identical (shared secret); the
 * URL is the carrier instead of the header. Briefs are writing notes,
 * not credentials — low blast radius if a URL leaks.
 *
 * Returns the brief for today's Amsterdam-local date. Cowork's prompt
 * fetches this URL before generating the article. If `decision === "yes"`
 * Cowork folds the brief into the day's instructions; otherwise the
 * rotation runs untouched.
 *
 * Response (200):
 *   { ok: true, forDate, decision: 'pending'|'yes'|'no', brief: string }
 * Response (401):
 *   { ok: false, error: 'unauthorized' }
 */

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.STUDIO_BRIEF_READ_TOKEN
  if (!expected) return false
  // 1. Authorization: Bearer <token>
  const header = req.headers.get("authorization") ?? ""
  if (header.startsWith("Bearer ")) {
    if (header.slice(7).trim() === expected) return true
  }
  // 2. ?token=<token>
  const qsToken = new URL(req.url).searchParams.get("token")?.trim() ?? ""
  if (qsToken && qsToken === expected) return true
  return false
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
