import type { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/blog/posts"

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

  return [...staticRoutes, ...postRoutes]
}
