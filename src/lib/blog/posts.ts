import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import readingTime from "reading-time"
import { isSeriesKey, type SeriesRef } from "./series"

export type BlogCategory = "Essays" | "Notes" | "Studio"

export type BlogTheme = "editorial" | "studio" | "setpiece"

export interface BlogFrontmatter {
  title: string
  date: string
  category: BlogCategory
  excerpt: string
  hero?: string
  theme?: BlogTheme
  linkedin_url?: string
  draft?: boolean
  tags?: string[]
  /** Series axis (Dispatches v2). See src/lib/blog/series.ts. */
  series?: SeriesRef
  /** Explicit bespoke cover PNG path. Omit → slug-deterministic cover. */
  cover?: string
}

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string
  readingTimeText: string
  readingTimeMinutes: number
  /** Word count from the `reading-time` library — used to gate
   *  Sprint 5.5.2 reading-milestone nudge (only fires on ≥ 1500 words). */
  wordCount: number
}

export interface BlogPost extends BlogPostMeta {
  body: string
}

const CONTENT_DIR = path.join(process.cwd(), "content", "blog")

async function listMdxFiles(): Promise<string[]> {
  try {
    const entries = await fs.readdir(CONTENT_DIR)
    return entries.filter(
      (f) =>
        f.endsWith(".mdx") &&
        // Skip the _drafts subdirectory (it's a dir, not a .mdx file, but
        // belt-and-braces) and any file whose name starts with _ — the
        // underscore prefix is the blog tooling convention for "in
        // progress; not on the wall yet."
        !f.startsWith("_"),
    )
  } catch {
    return []
  }
}

function parseFrontmatter(raw: string, slug: string): BlogPost {
  const { data, content } = matter(raw)
  const fm = data as Partial<BlogFrontmatter>

  if (!fm.title || !fm.date || !fm.category || !fm.excerpt) {
    throw new Error(
      `[blog] ${slug}.mdx is missing required frontmatter (title · date · category · excerpt)`,
    )
  }

  const rt = readingTime(content)

  return {
    slug,
    title: fm.title,
    date: fm.date,
    category: fm.category,
    excerpt: fm.excerpt,
    hero: fm.hero,
    theme: fm.theme ?? "editorial",
    linkedin_url: fm.linkedin_url,
    draft: fm.draft ?? false,
    tags: fm.tags ?? [],
    series: parseSeries(fm.series, slug),
    cover: typeof fm.cover === "string" ? fm.cover : undefined,
    readingTimeText: rt.text,
    readingTimeMinutes: Math.max(1, Math.round(rt.minutes)),
    wordCount: rt.words,
    body: content,
  }
}

/**
 * Lenient series parser — accepts `{ key, part, total? }`, warns and
 * ignores anything malformed rather than throwing (a bad series field
 * shouldn't 500 the whole blog).
 */
function parseSeries(raw: unknown, slug: string): SeriesRef | undefined {
  if (raw == null) return undefined
  if (typeof raw !== "object") {
    console.warn(`[blog] ${slug}.mdx: \`series\` must be an object {key, part}; ignoring.`)
    return undefined
  }
  const s = raw as { key?: unknown; part?: unknown; total?: unknown }
  if (!isSeriesKey(s.key) || typeof s.part !== "number") {
    console.warn(`[blog] ${slug}.mdx: \`series\` needs a valid key + numeric part; ignoring.`)
    return undefined
  }
  return {
    key: s.key,
    part: s.part,
    ...(typeof s.total === "number" ? { total: s.total } : {}),
  }
}

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  const files = await listMdxFiles()
  const posts: BlogPostMeta[] = []

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "")
    const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8")
    const post = parseFrontmatter(raw, slug)
    if (post.draft && process.env.NODE_ENV === "production") continue
    posts.push({
      slug: post.slug,
      title: post.title,
      date: post.date,
      category: post.category,
      excerpt: post.excerpt,
      hero: post.hero,
      theme: post.theme,
      linkedin_url: post.linkedin_url,
      draft: post.draft,
      tags: post.tags,
      series: post.series,
      cover: post.cover,
      readingTimeText: post.readingTimeText,
      readingTimeMinutes: post.readingTimeMinutes,
      wordCount: post.wordCount,
    })
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : -1))
  return posts
}

export async function getPostSlugs(): Promise<string[]> {
  const posts = await getAllPosts()
  return posts.map((p) => p.slug)
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const file = path.join(CONTENT_DIR, `${slug}.mdx`)
  try {
    const raw = await fs.readFile(file, "utf8")
    const post = parseFrontmatter(raw, slug)
    if (post.draft && process.env.NODE_ENV === "production") return null
    return post
  } catch {
    return null
  }
}

export function formatPostDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Sprint 5.5.1 — read an AI-baked footer "nudge card" for a slug.
 * Returns the card markdown if `content/blog/_nudges/<slug>.md`
 * exists; null otherwise. The post template renders it in a styled
 * block above the existing newsletter card when present.
 *
 * Bake new cards via `npm run blog:bake-nudge <slug>`.
 */
export async function getNudgeCard(slug: string): Promise<string | null> {
  const file = path.join(process.cwd(), "content", "blog", "_nudges", `${slug}.md`)
  try {
    const raw = await fs.readFile(file, "utf8")
    return raw.trim() || null
  } catch {
    return null
  }
}

/**
 * Return all unique tags across the (non-draft) post tree, sorted by
 * post count desc then alpha. Used by /blog/tag/[tag] (Sprint 4.5) +
 * by sitemap.xml to emit per-tag pages.
 */
export async function getAllTags(): Promise<Array<{ tag: string; count: number }>> {
  const posts = await getAllPosts()
  const counts = new Map<string, number>()
  for (const p of posts) {
    for (const t of p.tags ?? []) {
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => (b.count - a.count) || a.tag.localeCompare(b.tag))
}

/**
 * Filter posts by tag (case-insensitive). Returns the same metadata
 * shape as getAllPosts so /blog/tag/[tag] can reuse the index card
 * markup unchanged.
 */
export async function getPostsByTag(tag: string): Promise<BlogPostMeta[]> {
  const posts = await getAllPosts()
  const t = tag.trim().toLowerCase()
  return posts.filter((p) =>
    (p.tags ?? []).some((tt) => tt.trim().toLowerCase() === t),
  )
}
