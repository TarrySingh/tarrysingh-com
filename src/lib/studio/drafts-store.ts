import { createServiceClient } from "@/lib/supabase/server"
import type { DispatchDraft, DispatchFrontmatter } from "./types"

/**
 * Server-side drafts store backed by Supabase.
 *
 * Schema (see docs/migrations/2026-05-13-studio-drafts.sql):
 *
 *   create table studio_drafts (
 *     slug         text primary key,
 *     frontmatter  jsonb not null,
 *     body         text not null,
 *     updated_at   timestamptz default now()
 *   );
 *
 * Drafts persist server-side so the editor can be opened from any
 * device and resume work. Publishing reads the draft, commits it
 * to main via Octokit, then deletes the row.
 */

const TABLE = "studio_drafts"

interface DraftRow {
  slug: string
  frontmatter: DispatchFrontmatter
  body: string
  updated_at: string
}

export async function listDrafts(): Promise<DispatchDraft[]> {
  const sb = createServiceClient()
  const { data, error } = await sb
    .from(TABLE)
    .select("slug, frontmatter, body, updated_at")
    .order("updated_at", { ascending: false })
  if (error) {
    console.error(JSON.stringify({ tag: "studio.drafts.list_error", error }))
    return []
  }
  return ((data as DraftRow[] | null) ?? []).map(rowToDraft)
}

export async function getDraft(slug: string): Promise<DispatchDraft | null> {
  const sb = createServiceClient()
  const { data, error } = await sb
    .from(TABLE)
    .select("slug, frontmatter, body, updated_at")
    .eq("slug", slug)
    .maybeSingle()
  if (error) {
    console.error(JSON.stringify({ tag: "studio.drafts.get_error", slug, error }))
    return null
  }
  if (!data) return null
  return rowToDraft(data as DraftRow)
}

export async function upsertDraft(draft: DispatchDraft): Promise<void> {
  const sb = createServiceClient()
  const { error } = await sb.from(TABLE).upsert(
    {
      slug: draft.slug,
      frontmatter: draft.frontmatter,
      body: draft.body,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" },
  )
  if (error) {
    console.error(JSON.stringify({ tag: "studio.drafts.upsert_error", slug: draft.slug, error }))
    throw new Error("supabase_upsert_failed")
  }
}

export async function deleteDraft(slug: string): Promise<void> {
  const sb = createServiceClient()
  const { error } = await sb.from(TABLE).delete().eq("slug", slug)
  if (error) {
    console.error(JSON.stringify({ tag: "studio.drafts.delete_error", slug, error }))
    throw new Error("supabase_delete_failed")
  }
}

function rowToDraft(row: DraftRow): DispatchDraft {
  return {
    slug: row.slug,
    frontmatter: row.frontmatter,
    body: row.body,
    updatedAt: row.updated_at,
  }
}
