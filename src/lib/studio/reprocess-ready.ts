import fs from "node:fs/promises"
import path from "node:path"
import { createServiceClient } from "@/lib/supabase/server"
import { processArticle } from "./process-article"
import { amsterdamDateToday } from "./daily-brief"
import { getAllPosts } from "@/lib/blog/posts"

/**
 * Ship today's Dispatch when its article is already `ready` in
 * studio_prepared_frontmatter but never became a draft.
 *
 * The gap this closes: the backup-writer path hands processArticle a freshly
 * generated body WITHOUT going through Drive. If no prepared frontmatter is
 * `ready` yet, processArticle stashes the body `awaiting` and returns. The
 * frontmatter later flips to `ready` — via the daily cloud routine, or the
 * heartbeat's deterministic self-heal — but nothing re-runs processArticle,
 * because the Drive-ingest retry only re-reads Drive files and a backup-writer
 * article has none. So the body sits `ready` forever: no draft, no email. That
 * is the `process:awaiting_frontmatter / no_prepared_frontmatter` failure Tarry
 * was getting every morning.
 *
 * This reprocessor runs every ingest-drive tick. It reconstructs the article
 * from the stashed title + body and runs it through the same processArticle, so
 * the draft + approval email fire exactly as on the Drive path. Deliberately
 * narrow and idempotent:
 *   - today's article_date only (never resurrects yesterday's dedup-orphans),
 *   - skips entirely if a Dispatch for today already published,
 *   - skips any row whose slug is already in content/blog,
 *   - relies on processArticle's same-day dedup for the second-writer case,
 *   - flips each handled row to a terminal `drafted` status so it fires once.
 */
export async function reprocessReadyStashed(origin: string): Promise<{
  today: string
  shipped: string[]
  skipped: string[]
  errors: { slug: string; reason: string }[]
}> {
  const today = amsterdamDateToday()
  const out = {
    today,
    shipped: [] as string[],
    skipped: [] as string[],
    errors: [] as { slug: string; reason: string }[],
  }
  const sb = createServiceClient()

  const { data, error } = await sb
    .from("studio_prepared_frontmatter")
    .select("slug, title, body, article_date")
    .eq("status", "ready")
    .eq("article_date", today)
    .not("body", "is", null)
    .order("created_at", { ascending: true })
  if (error) {
    out.errors.push({ slug: "*", reason: `query:${error.message}` })
    return out
  }
  const rows =
    (data as
      | { slug: string; title: string | null; body: string | null }[]
      | null) ?? []
  if (rows.length === 0) return out

  const markDrafted = async (slug: string) => {
    await sb
      .from("studio_prepared_frontmatter")
      .update({ status: "drafted" })
      .eq("slug", slug)
      .eq("status", "ready")
  }

  // Guard: has a public Dispatch for today already shipped? If so, retire
  // today's ready rows without shipping a duplicate.
  let publishedToday = false
  try {
    publishedToday = (await getAllPosts()).some((p) => p.date === today)
  } catch {
    /* posts read failed — processArticle's own dedup still guards */
  }

  for (const row of rows) {
    const slug = row.slug
    const title = (row.title ?? "").trim()
    const body = (row.body ?? "").trim()
    if (!title || !body) {
      out.skipped.push(slug)
      continue
    }

    let published = publishedToday
    if (!published) {
      try {
        await fs.access(
          path.join(process.cwd(), "content", "blog", `${slug}.mdx`),
        )
        published = true
      } catch {
        published = false
      }
    }
    if (published) {
      await markDrafted(slug)
      out.skipped.push(slug)
      continue
    }

    // Reconstruct the article: the stashed body has the H1 stripped, so
    // prepend it back as the title for parseDailyArticle to re-derive.
    const content = `# ${title}\n\n${body}`
    const filename = `${today}_${slug}.md`
    const res = await processArticle({ filename, content, origin })
    if (res.ok) {
      await markDrafted(slug)
      out.shipped.push(slug)
    } else if (res.stage === "duplicate") {
      await markDrafted(slug)
      out.skipped.push(slug)
    } else {
      // Leave it `ready` so the next tick retries (e.g. a transient email
      // failure); log the reason for visibility.
      out.errors.push({ slug, reason: `${res.stage}:${res.error}` })
    }
  }
  return out
}
