import { getAllPosts, type BlogPostMeta } from "./posts"
import { SERIES, SERIES_KEYS, type SeriesKey, type SeriesMeta } from "./series"

/**
 * Dispatches v2 — series/notes queries (SERVER-ONLY).
 *
 * Separated from series.ts because these touch posts.ts → node:fs and
 * must never be pulled into a client bundle. Used by The Front index and
 * the Series landing pages (server components).
 */

/**
 * All posts in a series, ordered by `part` ascending (not by date — a
 * series reads in narrative order).
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
