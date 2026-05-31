import { NextRequest, NextResponse } from "next/server"
import { upsertDraft, deleteDraft } from "@/lib/studio/drafts-store"
import {
  type DispatchFrontmatter,
  type DispatchCategory,
  SLUG_RE,
} from "@/lib/studio/types"
import { isSeriesKey, type SeriesRef } from "@/lib/blog/series"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface SaveBody {
  slug?: unknown
  frontmatter?: unknown
  body?: unknown
}

const ALLOWED_CATEGORIES: ReadonlySet<DispatchCategory> = new Set([
  "Essays",
  "Notes",
  "Studio",
])

/** Lenient SeriesRef validator — keep a well-formed series, drop garbage. */
function parseSeriesRef(value: unknown): SeriesRef | undefined {
  if (typeof value !== "object" || value === null) return undefined
  const s = value as Record<string, unknown>
  if (!isSeriesKey(s.key) || typeof s.part !== "number") return undefined
  const ref: SeriesRef = { key: s.key, part: s.part }
  if (typeof s.total === "number") ref.total = s.total
  return ref
}

function parseFrontmatter(value: unknown): DispatchFrontmatter | null {
  if (typeof value !== "object" || value === null) return null
  const v = value as Record<string, unknown>
  if (typeof v.title !== "string") return null
  if (typeof v.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v.date)) return null
  if (typeof v.category !== "string" || !ALLOWED_CATEGORIES.has(v.category as DispatchCategory)) return null
  if (typeof v.excerpt !== "string") return null
  return {
    title: v.title,
    date: v.date,
    category: v.category as DispatchCategory,
    excerpt: v.excerpt,
    hero: typeof v.hero === "string" ? v.hero : undefined,
    theme:
      v.theme === "studio"
        ? "studio"
        : v.theme === "setpiece"
          ? "setpiece"
          : "editorial",
    linkedin_url: typeof v.linkedin_url === "string" ? v.linkedin_url : undefined,
    draft: typeof v.draft === "boolean" ? v.draft : true,
    tags: Array.isArray(v.tags) ? (v.tags as unknown[]).filter((t): t is string => typeof t === "string") : [],
    // Preserve the Dispatches-v2 fields the editor can carry. Dropping
    // these here silently wiped a post's series/cover on every studio
    // edit, and — fatally — lost was_published, so updating a live post
    // was rejected as slug_already_exists.
    series: parseSeriesRef(v.series),
    cover: typeof v.cover === "string" ? v.cover : undefined,
    was_published: v.was_published === true ? true : undefined,
  }
}

/**
 * POST /api/studio/save
 *
 * Upserts a Dispatch draft in Supabase. Save is idempotent on slug
 * (keep saving the same slug = same row updated).
 *
 * Body: { slug, frontmatter, body }
 *   slug         — lowercase-kebab, validated against SLUG_RE
 *   frontmatter  — DispatchFrontmatter shape; title, date, category, excerpt required
 *   body         — markdown string (can be empty during early drafts)
 */
export async function POST(req: NextRequest) {
  let body: SaveBody
  try {
    body = (await req.json()) as SaveBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : ""
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ ok: false, error: "invalid_slug" }, { status: 422 })
  }
  const frontmatter = parseFrontmatter(body.frontmatter)
  if (!frontmatter) {
    return NextResponse.json({ ok: false, error: "invalid_frontmatter" }, { status: 422 })
  }
  const text = typeof body.body === "string" ? body.body : ""

  try {
    await upsertDraft({
      slug,
      frontmatter,
      body: text,
      updatedAt: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true, slug, savedAt: new Date().toISOString() })
  } catch (err) {
    console.error(JSON.stringify({ tag: "studio.api.save_error", slug, error: err instanceof Error ? err.message : String(err) }))
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 })
  }
}

/**
 * DELETE /api/studio/save?slug=<slug> — delete a draft (used after
 * publish + the trash icon in the drafts list).
 */
export async function DELETE(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug") ?? ""
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ ok: false, error: "invalid_slug" }, { status: 422 })
  }
  try {
    await deleteDraft(slug)
    return NextResponse.json({ ok: true, slug })
  } catch (err) {
    console.error(JSON.stringify({ tag: "studio.api.delete_error", slug, error: err instanceof Error ? err.message : String(err) }))
    return NextResponse.json({ ok: false, error: "delete_failed" }, { status: 500 })
  }
}
