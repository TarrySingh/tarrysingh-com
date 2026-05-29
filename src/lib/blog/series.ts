import { getAllPosts, type BlogPostMeta } from "./posts"

/**
 * Dispatches v2 — Series axis.
 *
 * A "series" is a second organising axis perpendicular to category
 * (Essays / Notes / Studio). Posts opt in via frontmatter:
 *
 *   series: { key: "economics", part: 3, total: 6 }
 *
 * The five series were locked in the design brief. This registry is the
 * single source of truth for their display names + taglines; the Front
 * filter, the Series landing pages, and the per-post "Part N of M"
 * breadcrumb all read from here.
 */

export type SeriesKey =
  | "sovereign"
  | "enterprise"
  | "build"
  | "workforce"
  | "economics"

/** The shape carried in a post's frontmatter. */
export interface SeriesRef {
  key: SeriesKey
  /** 1-based position within the series. */
  part: number
  /** Optional known total, for "Part 3 of 6". */
  total?: number
}

export interface SeriesMeta {
  key: SeriesKey
  name: string
  tagline: string
}

export const SERIES: Record<SeriesKey, SeriesMeta> = {
  sovereign: {
    key: "sovereign",
    name: "Sovereign & Geopolitical AI",
    tagline:
      "Regulation, export controls, sovereign compute, and the talent flows that move with them.",
  },
  enterprise: {
    key: "enterprise",
    name: "AI in the Enterprise",
    tagline:
      "Vertical industries putting AI into production — finance, health, energy, manufacturing, education, mobility, and the emerging frontier.",
  },
  build: {
    key: "build",
    name: "The Build",
    tagline:
      "Design patterns, HPC and AI infrastructure, and the architecture of agent systems.",
  },
  workforce: {
    key: "workforce",
    name: "Workforce & Human Ingenuity",
    tagline:
      "Reskilling, upskilling, productivity, and the AI-literacy thread running through all of it.",
  },
  economics: {
    key: "economics",
    name: "The Economics of AI",
    tagline:
      "Capex cycles, hyperscaler spend, M&A, and the debt stack underneath the boom.",
  },
}

export const SERIES_KEYS = Object.keys(SERIES) as SeriesKey[]

export function isSeriesKey(value: unknown): value is SeriesKey {
  return (
    typeof value === "string" && (SERIES_KEYS as string[]).includes(value)
  )
}

export function getSeries(key: SeriesKey): SeriesMeta {
  return SERIES[key]
}

/**
 * All posts in a series, ordered by `part` ascending (not by date —
 * a series reads in narrative order).
 */
export async function getPostsBySeries(
  key: SeriesKey,
): Promise<BlogPostMeta[]> {
  const posts = await getAllPosts()
  return posts
    .filter((p) => p.series?.key === key)
    .sort((a, b) => (a.series?.part ?? 0) - (b.series?.part ?? 0))
}

/** Every series with its current post count (zero-count series included). */
export async function getAllSeriesWithCounts(): Promise<
  Array<SeriesMeta & { count: number }>
> {
  const posts = await getAllPosts()
  return SERIES_KEYS.map((key) => ({
    ...SERIES[key],
    count: posts.filter((p) => p.series?.key === key).length,
  }))
}

/** The "Notes" stream — posts in the existing Notes category. */
export async function getNotes(): Promise<BlogPostMeta[]> {
  const posts = await getAllPosts()
  return posts.filter((p) => p.category === "Notes")
}
