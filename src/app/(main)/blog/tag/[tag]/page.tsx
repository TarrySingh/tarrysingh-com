import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, ArrowLeft } from "lucide-react"
import {
  formatPostDate,
  getAllTags,
  getPostsByTag,
  type BlogPostMeta,
} from "@/lib/blog/posts"

/**
 * /blog/tag/[tag]
 *
 * Filtered Dispatches index — same card markup as /blog, scoped to
 * a single tag. Sprint 4.5 deliverable; pairs with the chip rows
 * added to the post header + index card.
 *
 * Tag values are stored lowercase in frontmatter (Studio Editor
 * normalises on save); the route is case-insensitive so a stale
 * link `Strategy` resolves the same as `strategy`.
 */

export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map(({ tag }) => ({ tag: encodeURIComponent(tag) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const decoded = decodeURIComponent(tag)
  return {
    title: `Dispatches · ${decoded} · Tarry Singh`,
    description: `All Dispatches tagged "${decoded}".`,
    robots: { index: true, follow: true },
  }
}

const categoryAccent: Record<BlogPostMeta["category"], string> = {
  Essays: "bg-gold-500",
  Notes: "bg-blue-500",
  Studio: "bg-rose-500",
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const decoded = decodeURIComponent(tag).trim()
  if (!decoded) notFound()

  const posts = await getPostsByTag(decoded)
  if (posts.length === 0) notFound()

  return (
    <div className="bg-white">
      <section className="relative bg-gradient-to-b from-navy-50/50 to-white pt-28 md:pt-36 pb-6 md:pb-10">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-400 hover:text-navy-900 transition-colors mb-8"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dispatches
          </Link>

          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.22em] text-gold-700 border border-gold-200 bg-gold-50 mb-6"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            tag · {decoded}
          </span>
          <h1
            className="text-3xl md:text-4xl text-navy-900 mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-display), 'Gloock', serif" }}
          >
            Filed under <em>{decoded}</em>.
          </h1>
          <p
            className="text-base text-navy-600 leading-relaxed italic"
            style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
          >
            {posts.length === 1
              ? "One Dispatch carries this tag."
              : `${posts.length} Dispatches carry this tag.`}
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        <ul className="space-y-10">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block border-b border-navy-100/70 pb-10 last:border-0"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${categoryAccent[post.category]}`}
                  />
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400"
                    style={{
                      fontFamily:
                        "var(--font-mono), 'IBM Plex Mono', monospace",
                    }}
                  >
                    {post.category}
                  </span>
                  <span className="text-navy-200">·</span>
                  <time
                    className="text-[11px] font-medium tracking-wide text-navy-400"
                    style={{
                      fontFamily:
                        "var(--font-mono), 'IBM Plex Mono', monospace",
                    }}
                    dateTime={post.date}
                  >
                    {formatPostDate(post.date)}
                  </time>
                  <span className="text-navy-200">·</span>
                  <span
                    className="text-[11px] tracking-wide text-navy-400"
                    style={{
                      fontFamily:
                        "var(--font-mono), 'IBM Plex Mono', monospace",
                    }}
                  >
                    {post.readingTimeMinutes} min read
                  </span>
                </div>
                <h2
                  className="text-2xl md:text-3xl text-navy-900 mb-3 tracking-tight group-hover:text-gold-700 transition-colors"
                  style={{
                    fontFamily: "var(--font-display), 'Gloock', serif",
                  }}
                >
                  {post.title}
                </h2>
                <p
                  className="text-[1rem] leading-[1.75] text-navy-600 mb-4 max-w-2xl"
                  style={{
                    fontFamily:
                      "var(--font-serif), 'IBM Plex Serif', serif",
                  }}
                >
                  {post.excerpt}
                </p>
                {post.tags && post.tags.length > 0 ? (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-navy-100 bg-white px-2 py-0.5 text-[9.5px] uppercase tracking-[0.22em] text-navy-500 group-hover:border-gold-300 group-hover:text-navy-700 transition-colors"
                        style={{
                          fontFamily:
                            "var(--font-mono), 'IBM Plex Mono', monospace",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
                <span
                  className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-navy-500 group-hover:text-navy-900 transition-colors"
                  style={{
                    fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                  }}
                >
                  Read
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-6 lg:px-8 pb-20 md:pb-28">
        <div className="flex items-center gap-4 text-navy-300">
          <div className="h-px flex-1 bg-navy-100" />
          <Link
            href="/blog"
            className="text-[10px] font-semibold uppercase tracking-[0.32em] text-navy-500 hover:text-gold-700 transition-colors"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            ← All Dispatches
          </Link>
          <div className="h-px flex-1 bg-navy-100" />
        </div>
      </section>
    </div>
  )
}
