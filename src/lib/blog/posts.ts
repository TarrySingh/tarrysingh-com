import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import readingTime from "reading-time"

export type BlogCategory = "Essays" | "Notes" | "Studio"

export type BlogTheme = "editorial" | "studio"

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
}

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string
  readingTimeText: string
  readingTimeMinutes: number
}

export interface BlogPost extends BlogPostMeta {
  body: string
}

const CONTENT_DIR = path.join(process.cwd(), "content", "blog")

async function listMdxFiles(): Promise<string[]> {
  try {
    const entries = await fs.readdir(CONTENT_DIR)
    return entries.filter((f) => f.endsWith(".mdx"))
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
    readingTimeText: rt.text,
    readingTimeMinutes: Math.max(1, Math.round(rt.minutes)),
    body: content,
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
      readingTimeText: post.readingTimeText,
      readingTimeMinutes: post.readingTimeMinutes,
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
