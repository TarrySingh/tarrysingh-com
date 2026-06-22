import { createServiceClient } from "@/lib/supabase/server"
import type { DispatchCategory } from "./types"

/**
 * Claude-Code-prepared frontmatter store.
 *
 * The daily-Dispatch pipeline used to call the Anthropic API (`aiFrontmatter`)
 * to derive {category, excerpt, tags} for each article — which coupled the blog
 * to the API budget (an API usage-cap took the Dispatch down for two days in
 * June 2026). Instead, a Claude Code session (interactive or a scheduled cloud
 * routine) generates the frontmatter and stashes it here, keyed by slug. The
 * cron then reads the body from Drive + this frontmatter and builds the draft +
 * approval email exactly as before — no API call in the path.
 *
 *   create table studio_prepared_frontmatter (
 *     slug        text primary key,
 *     category    text not null,
 *     excerpt     text not null,
 *     tags        jsonb not null default '[]'::jsonb,
 *     source      text not null default 'claude-code',
 *     created_at  timestamptz not null default now()
 *   );
 */

const TABLE = "studio_prepared_frontmatter"

export interface PreparedFrontmatter {
  category: DispatchCategory
  excerpt: string
  tags: string[]
}

export async function getPreparedFrontmatter(
  slug: string,
): Promise<PreparedFrontmatter | null> {
  const sb = createServiceClient()
  const { data, error } = await sb
    .from(TABLE)
    .select("category, excerpt, tags")
    .eq("slug", slug)
    .maybeSingle()
  if (error) {
    console.error(
      JSON.stringify({ tag: "studio.prepared_fm.get_error", slug, error }),
    )
    return null
  }
  if (!data) return null
  const row = data as { category: string; excerpt: string; tags: unknown }
  return {
    category: (row.category as DispatchCategory) || "Essays",
    excerpt: row.excerpt || "",
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
  }
}

export async function upsertPreparedFrontmatter(input: {
  slug: string
  category: DispatchCategory
  excerpt: string
  tags: string[]
  source?: string
}): Promise<void> {
  const sb = createServiceClient()
  const { error } = await sb.from(TABLE).upsert(
    {
      slug: input.slug,
      category: input.category,
      excerpt: input.excerpt,
      tags: input.tags,
      source: input.source ?? "claude-code",
    },
    { onConflict: "slug" },
  )
  if (error) {
    console.error(
      JSON.stringify({
        tag: "studio.prepared_fm.upsert_error",
        slug: input.slug,
        error,
      }),
    )
    throw new Error("prepared_frontmatter_upsert_failed")
  }
}
