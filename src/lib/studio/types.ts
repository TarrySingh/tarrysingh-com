import type { SeriesRef } from "@/lib/blog/series"

export type DispatchCategory = "Essays" | "Notes" | "Studio"
export type DispatchTheme = "editorial" | "studio" | "setpiece"

export interface DispatchFrontmatter {
  title: string
  date: string // ISO YYYY-MM-DD
  category: DispatchCategory
  excerpt: string
  hero?: string
  theme?: DispatchTheme
  linkedin_url?: string
  draft?: boolean
  tags?: string[]
  /** Series axis (Dispatches v2). Emitted to .mdx by buildMdx. */
  series?: SeriesRef
  /** Explicit bespoke cover PNG path; omit for slug-deterministic cover. */
  cover?: string
  /**
   * Editor-only flag. Set by `reopenPublished()` when an existing
   * `content/blog/<slug>.mdx` is loaded back into the studio_drafts
   * table for editing. Tells `/api/studio/publish` to call
   * `publishDispatch({ allowOverwrite: true })` so the same file gets
   * updated in-place rather than rejected as `slug_already_exists`.
   * Never written to the .mdx file — `buildMdx` is allowlist-based.
   */
  was_published?: boolean
}

export interface DispatchDraft {
  slug: string
  frontmatter: DispatchFrontmatter
  /**
   * Body in Markdown (MDX-compatible). Round-trips through Tiptap
   * via turndown (HTML → MD) on save and `marked` (MD → HTML) on load.
   */
  body: string
  updatedAt: string // ISO
}

export const DEFAULT_FRONTMATTER: DispatchFrontmatter = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  category: "Notes",
  excerpt: "",
  hero: "",
  theme: "editorial",
  linkedin_url: "",
  draft: true,
  tags: [],
}

export const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}
