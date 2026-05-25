import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import { upsertDraft } from "./drafts-store"
import { type DispatchDraft, type DispatchFrontmatter, SLUG_RE } from "./types"

/**
 * Re-open a published Dispatch for editing.
 *
 * Background: when a Dispatch is published via `publishDispatch`, the
 * draft row in `studio_drafts` is deleted and the canonical content
 * lives only at `content/blog/<slug>.mdx` on `main`. The studio
 * editor at `/studio/editor/<slug>` would then 404 because
 * `getDraft(slug)` returns nothing.
 *
 * This helper closes the loop: read the `.mdx` from the deployed
 * bundle's filesystem (same path the public blog page reads from),
 * parse its frontmatter + body, and upsert a draft back into
 * `studio_drafts` with `frontmatter.was_published = true`. The editor
 * then loads the draft normally. On publish, the `was_published`
 * flag tells `publishDispatch` to update the existing file in place
 * rather than reject the slug as already taken.
 *
 * Filesystem read is deliberately the same path `src/lib/blog/posts.ts`
 * uses. In a Vercel deployment, `content/blog/*.mdx` is bundled with
 * the serverless function root, so `process.cwd() + '/content/blog/'`
 * resolves at runtime. After a fresh publish, there is a ~90-second
 * window where the new file is on `main` but not yet in the deployed
 * function bundle — during that window the reopened content is the
 * previous version. Acceptable: the user just published, the editor
 * still has their work in front of them, no need to immediately re-edit.
 */

const CONTENT_DIR = path.join(process.cwd(), "content", "blog")

export type ReopenOutcome =
  | { ok: true; draft: DispatchDraft }
  | {
      ok: false
      error: "invalid_slug" | "not_published" | "parse_failed" | "save_failed"
      debug?: string
    }

export async function reopenPublished(rawSlug: string): Promise<ReopenOutcome> {
  const slug = rawSlug.trim()
  if (!slug || !SLUG_RE.test(slug)) {
    return { ok: false, error: "invalid_slug" }
  }

  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  let raw: string
  try {
    raw = await fs.readFile(filePath, "utf8")
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === "ENOENT") return { ok: false, error: "not_published" }
    return {
      ok: false,
      error: "parse_failed",
      debug: err instanceof Error ? err.message : String(err),
    }
  }

  let parsed: ReturnType<typeof matter>
  try {
    parsed = matter(raw)
  } catch (err) {
    return {
      ok: false,
      error: "parse_failed",
      debug: err instanceof Error ? err.message : String(err),
    }
  }

  const data = parsed.data as Partial<DispatchFrontmatter>
  if (!data.title || !data.date || !data.category || !data.excerpt) {
    return {
      ok: false,
      error: "parse_failed",
      debug: "frontmatter missing required fields",
    }
  }

  const frontmatter: DispatchFrontmatter = {
    title: data.title,
    date: data.date,
    category: data.category,
    excerpt: data.excerpt,
    hero: data.hero ?? "",
    theme: data.theme ?? "editorial",
    linkedin_url: data.linkedin_url ?? "",
    draft: data.draft ?? false,
    tags: data.tags ?? [],
    was_published: true,
  }

  const body = parsed.content.trim()
  const draft: DispatchDraft = {
    slug,
    frontmatter,
    body,
    updatedAt: new Date().toISOString(),
  }

  try {
    await upsertDraft(draft)
  } catch (err) {
    return {
      ok: false,
      error: "save_failed",
      debug: err instanceof Error ? err.message : String(err),
    }
  }

  return { ok: true, draft }
}
