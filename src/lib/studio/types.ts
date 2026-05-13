export type DispatchCategory = "Essays" | "Notes" | "Studio"
export type DispatchTheme = "editorial" | "studio"

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
