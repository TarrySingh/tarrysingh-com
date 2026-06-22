import { createServiceClient } from "@/lib/supabase/server"

/**
 * Sprint 9.1 — server-side helper for `studio_drive_ingest_log`.
 *
 * Schema lives in docs/migrations/2026-05-16-studio-drive-ingest-log.sql.
 * One row per Google Drive file_id; `modified_time_iso` is the
 * high-water mark used by the cron to decide "have I already seen
 * this version of the file?"
 */

const TABLE = "studio_drive_ingest_log"

export type DriveIngestStatus = "ingested" | "skipped" | "failed"

export interface DriveIngestRow {
  file_id: string
  filename: string
  slug: string | null
  modified_time_iso: string
  status: DriveIngestStatus
  email_id: string | null
  failure_reason: string | null
  first_seen_at: string
  last_seen_at: string
}

export async function getDriveIngest(
  fileId: string,
): Promise<DriveIngestRow | null> {
  const sb = createServiceClient()
  const { data, error } = await sb
    .from(TABLE)
    .select(
      "file_id,filename,slug,modified_time_iso,status,email_id,failure_reason,first_seen_at,last_seen_at",
    )
    .eq("file_id", fileId)
    .maybeSingle()
  if (error) {
    console.error(
      JSON.stringify({ tag: "studio.drive_log.get_error", fileId, error }),
    )
    return null
  }
  return (data as DriveIngestRow | null) ?? null
}

/**
 * Returns the latest `modified_time_iso` across the whole log — the
 * cron uses this as the `modifiedTime > X` filter for Drive's `q`,
 * so we ask Drive only for files newer than the most-recent ingest.
 * Returns null when the log is empty (first run).
 */
export async function getHighWaterModifiedTime(): Promise<string | null> {
  const sb = createServiceClient()
  const { data, error } = await sb
    .from(TABLE)
    .select("modified_time_iso")
    .order("modified_time_iso", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error(
      JSON.stringify({ tag: "studio.drive_log.high_water_error", error }),
    )
    return null
  }
  if (!data) return null
  return (data as { modified_time_iso: string }).modified_time_iso
}

/**
 * Transient-failure reasons a later cron tick should RETRY rather than
 * treat as terminal. A 529 overload, a Drive download blip, or any AI
 * call failure are expected to clear on their own. Terminal reasons
 * (no_h1_title, filename_not_dated_article, older_than_age_floor,
 * already_have_draft_for_today, *_parse_error) never become valid on
 * retry, so they stay skipped.
 */
function isRetryableFailureReason(reason: string | null): boolean {
  if (!reason) return false
  return (
    reason.startsWith("ai_frontmatter:ai_call_failed") ||
    reason.startsWith("awaiting_frontmatter:") ||
    reason.startsWith("drive_download:") ||
    /\b(?:overloaded|timeout|429|500|502|503|529|econn|network|fetch failed)\b/i.test(reason)
  )
}

/**
 * Rows that failed on a transient error recently enough to be worth a
 * retry. Bounded to the last 48h (the cron's hard age floor) so a
 * permanently-stuck file isn't retried forever. Capped per tick.
 */
export async function getRetryableFailures(limit = 5): Promise<DriveIngestRow[]> {
  const sb = createServiceClient()
  const cutoffIso = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  const { data, error } = await sb
    .from(TABLE)
    .select(
      "file_id,filename,slug,modified_time_iso,status,email_id,failure_reason,first_seen_at,last_seen_at",
    )
    .eq("status", "failed")
    .gte("last_seen_at", cutoffIso)
    .order("last_seen_at", { ascending: true })
    .limit(50)
  if (error) {
    console.error(JSON.stringify({ tag: "studio.drive_log.retryables_error", error }))
    return []
  }
  const rows = (data as DriveIngestRow[] | null) ?? []
  return rows.filter((r) => isRetryableFailureReason(r.failure_reason)).slice(0, limit)
}

export interface RecordIngestInput {
  fileId: string
  filename: string
  modifiedTimeIso: string
  status: DriveIngestStatus
  slug?: string | null
  emailId?: string | null
  failureReason?: string | null
}

/**
 * Upsert one row. Updates `last_seen_at` to now; `first_seen_at` is
 * preserved on conflict (insert-only default).
 */
export async function recordDriveIngest(
  input: RecordIngestInput,
): Promise<void> {
  const sb = createServiceClient()
  const nowIso = new Date().toISOString()
  const { error } = await sb.from(TABLE).upsert(
    {
      file_id: input.fileId,
      filename: input.filename,
      slug: input.slug ?? null,
      modified_time_iso: input.modifiedTimeIso,
      status: input.status,
      email_id: input.emailId ?? null,
      failure_reason: input.failureReason ?? null,
      last_seen_at: nowIso,
    },
    { onConflict: "file_id" },
  )
  if (error) {
    console.error(
      JSON.stringify({
        tag: "studio.drive_log.upsert_error",
        fileId: input.fileId,
        error,
      }),
    )
    throw new Error(`drive_ingest_log_upsert_failed: ${error.message}`)
  }
}
