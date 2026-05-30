import type { MetadataRoute } from "next"
import { getAllPosts, getAllTags } from "@/lib/blog/posts"
import { getAllSeriesWithCounts } from "@/lib/blog/series-queries"

const SITE = "https://tarrysingh.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/experiments`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/synaptic`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/synaptic/symphony`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/synaptic/memphis`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
  ]

  const posts = await getAllPosts()
  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly",
    priority: 0.7,
  }))

  // Dispatches v2 — series landing pages, for every series with ≥1 post.
  const series = await getAllSeriesWithCounts()
  const seriesRoutes: MetadataRoute.Sitemap = series
    .filter((s) => s.count > 0)
    .map((s) => ({
      url: `${SITE}/blog/series/${s.key}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }))

  // Sprint 4.5 — per-tag index pages (/blog/tag/<tag>) for every tag
  // that appears on at least one published Dispatch.
  const tags = await getAllTags()
  const tagRoutes: MetadataRoute.Sitemap = tags.map(({ tag }) => ({
    url: `${SITE}/blog/tag/${encodeURIComponent(tag)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }))

  return [...staticRoutes, ...postRoutes, ...seriesRoutes, ...tagRoutes]
}
