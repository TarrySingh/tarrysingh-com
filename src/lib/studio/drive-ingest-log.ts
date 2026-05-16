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
