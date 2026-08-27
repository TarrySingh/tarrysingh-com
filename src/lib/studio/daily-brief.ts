import { createServiceClient } from "@/lib/supabase/server"

/**
 * Server-side helper for `studio_daily_briefs`.
 *
 * One row per Amsterdam-local target date. The evening cron upserts
 * a `pending` row; the form submit / decline endpoints flip it to
 * `yes` / `no`; Cowork's morning fetch reads it.
 */

const TABLE = "studio_daily_briefs"

export type BriefDecision = "pending" | "yes" | "no" | "done"

export interface DailyBriefRow {
  for_date: string
  decision: BriefDecision
  brief: string
  prompt_sent_at: string
  decided_at: string | null
}

/**
 * Today's Amsterdam-local date in YYYY-MM-DD form (no time zone
 * libraries — we format the Date through Intl.DateTimeFormat). Used
 * by Cowork's morning fetch endpoint.
 */
export function amsterdamDateToday(now: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  // `en-CA` returns YYYY-MM-DD naturally.
  return fmt.format(now)
}

/**
 * Tomorrow's Amsterdam-local date. The evening cron at 23:00 Amsterdam
 * is asking about TOMORROW's article, not today's.
 */
export function amsterdamDateTomorrow(now: Date = new Date()): string {
  const today = amsterdamDateToday(now)
  const [y, m, d] = today.split("-").map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + 1))
  return amsterdamDateToday(next)
}

export async function getBrief(forDate: string): Promise<DailyBriefRow | null> {
  const sb = createServiceClient()
  const { data, error } = await sb
    .from(TABLE)
    .select("for_date, decision, brief, prompt_sent_at, decided_at")
    .eq("for_date", forDate)
    .maybeSingle()
  if (error) {
    console.error(
      JSON.stringify({ tag: "studio.brief.get_error", forDate, error }),
    )
    return null
  }
  return (data as DailyBriefRow | null) ?? null
}

/**
 * Upsert a `pending` row when the evening prompt email is sent.
 * Idempotent — calling twice for the same date is a no-op.
 */
export async function upsertPendingBrief(forDate: string): Promise<void> {
  const sb = createServiceClient()
  const existing = await getBrief(forDate)
  if (existing) return
  const { error } = await sb.from(TABLE).insert({
    for_date: forDate,
    decision: "pending",
    brief: "",
    prompt_sent_at: new Date().toISOString(),
  })
  if (error) {
    console.error(
      JSON.stringify({ tag: "studio.brief.insert_error", forDate, error }),
    )
    throw new Error(`brief_insert_failed: ${error.message}`)
  }
}

export async function setBriefDecision(
  forDate: string,
  /**
   * "done" marks a brief as CONSUMED. Without a terminal state a brief that
   * has been written stays decision="yes" forever and the writer would pick
   * it up again the next morning.
   */
  decision: "yes" | "no" | "done",
  brief: string = "",
): Promise<void> {
  const sb = createServiceClient()
  const { error } = await sb
    .from(TABLE)
    .upsert(
      {
        for_date: forDate,
        decision,
        brief: decision === "no" ? "" : brief,
        decided_at: new Date().toISOString(),
        // Preserve prompt_sent_at on the existing row (Supabase
        // ignores keys not in our payload on upsert+onConflict).
      },
      { onConflict: "for_date" },
    )
  if (error) {
    console.error(
      JSON.stringify({
        tag: "studio.brief.decision_error",
        forDate,
        decision,
        error,
      }),
    )
    throw new Error(`brief_decision_failed: ${error.message}`)
  }
}
