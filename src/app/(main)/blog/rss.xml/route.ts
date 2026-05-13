import { getAllPosts } from "@/lib/blog/posts"

const SITE = "https://tarrysingh.com"
const TITLE = "Dispatches — Tarry Singh"
const DESCRIPTION =
  "Notes and essays from Tarry Singh's studio: AI strategy, deep-tech architectures, and the craft of drawing speculative work."

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export const dynamic = "force-static"
export const revalidate = 3600

export async function GET() {
  const posts = await getAllPosts()
  const lastBuild = new Date().toUTCString()
  const latestPost = posts[0]
  const latestDate = latestPost
    ? new Date(latestPost.date).toUTCString()
    : lastBuild

  const items = posts
    .map((post) => {
      const url = `${SITE}/blog/${post.slug}`
      const pubDate = new Date(post.date).toUTCString()
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(TITLE)}</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(DESCRIPTION)}</description>
    <language>en-gb</language>
    <lastBuildDate>${latestDate}</lastBuildDate>
    <generator>tarrysingh.com</generator>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
