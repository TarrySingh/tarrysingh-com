import { createServiceClient } from "@/lib/supabase/server"
import type { PlateContent } from "./types"

/**
 * Sprint 8 — Supabase overlay for in-progress plate-content edits.
 *
 * Schema lives in docs/migrations/2026-05-17-synaptic-plate-drafts.sql.
 * The live Synaptic site reads only from the typed .ts files in
 * `src/lib/synaptic/`. The editor at `/studio/synaptic` reads/writes
 * drafts here while Tarry is editing; Publish writes the draft back
 * to the .ts file via Octokit and deletes the row.
 */

const TABLE = "synaptic_plate_drafts"

interface DraftRow {
  plate_id: string
  content: PlateContent
  updated_at: string
}

export async function getPlateDraft(
  plateId: string,
): Promise<{ content: PlateContent; updatedAt: string } | null> {
  const sb = createServiceClient()
  const { data, error } = await sb
    .from(TABLE)
    .select("plate_id, content, updated_at")
    .eq("plate_id", plateId)
    .maybeSingle()
  if (error) {
    console.error(
      JSON.stringify({ tag: "synaptic.draft.get_error", plateId, error }),
    )
    return null
  }
  if (!data) return null
  const row = data as DraftRow
  return { content: row.content, updatedAt: row.updated_at }
}

export interface PlateDraftSummary {
  plateId: string
  displayName: string
  updatedAt: string
}

export async function listPlateDrafts(): Promise<PlateDraftSummary[]> {
  const sb = createServiceClient()
  const { data, error } = await sb
    .from(TABLE)
    .select("plate_id, content, updated_at")
    .order("updated_at", { ascending: false })
  if (error) {
    console.error(JSON.stringify({ tag: "synaptic.draft.list_error", error }))
    return []
  }
  return ((data as DraftRow[] | null) ?? []).map((row) => ({
    plateId: row.plate_id,
    displayName: row.content.displayName ?? row.plate_id,
    updatedAt: row.updated_at,
  }))
}

export async function upsertPlateDraft(
  plateId: string,
  content: PlateContent,
): Promise<void> {
  const sb = createServiceClient()
  const { error } = await sb.from(TABLE).upsert(
    {
      plate_id: plateId,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "plate_id" },
  )
  if (error) {
    console.error(
      JSON.stringify({ tag: "synaptic.draft.upsert_error", plateId, error }),
    )
    throw new Error(`synaptic_draft_upsert_failed: ${error.message}`)
  }
}

export async function deletePlateDraft(plateId: string): Promise<void> {
  const sb = createServiceClient()
  const { error } = await sb.from(TABLE).delete().eq("plate_id", plateId)
  if (error) {
    console.error(
      JSON.stringify({ tag: "synaptic.draft.delete_error", plateId, error }),
    )
    throw new Error(`synaptic_draft_delete_failed: ${error.message}`)
  }
}
