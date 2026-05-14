import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getAllPosts, formatPostDate, type BlogPostMeta } from "@/lib/blog/posts"
import { NewsletterCard } from "@/components/blog/NewsletterCard"
import { ReturningReaderHero } from "@/components/blog/ReturningReaderHero"

export const metadata: Metadata = {
  title: "Dispatches — Tarry Singh",
  description:
    "Notes and essays from the studio. Infrequent, opinionated, and quietly written.",
  openGraph: {
    title: "Dispatches — Tarry Singh",
    description:
      "Notes and essays from the studio. Infrequent, opinionated, and quietly written.",
    type: "website",
  },
}

const categoryAccent: Record<BlogPostMeta["category"], string> = {
  Essays: "bg-gold-500",
  Notes: "bg-blue-500",
  Studio: "bg-rose-500",
}

export default async function BlogIndex() {
  const posts = await getAllPosts()

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="relative bg-gradient-to-b from-navy-50/50 to-white pt-28 md:pt-36 pb-6 md:pb-10">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.22em] text-gold-600 border border-gold-200 bg-gold-50 mb-6"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            Dispatches
          </span>
          <h1
            className="text-4xl md:text-5xl text-navy-900 mb-5 tracking-tight"
            style={{ fontFamily: "var(--font-display), 'Gloock', serif" }}
          >
            Quietly written. Infrequent.
          </h1>
          <p
            className="text-base md:text-lg text-navy-600 leading-relaxed"
            style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
          >
            Notes from the studio — essays on AI strategy, on the craft of
            drawing speculative architectures, and the occasional dispatch from
            whatever I happen to be building. No newsletter cadence, no
            content calendar. Posts when they are ready.
          </p>
          <ReturningReaderHero />
        </div>
      </section>

      {/* Posts list */}
      <section className="max-w-3xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        {posts.length === 0 ? (
          <p
            className="text-sm text-navy-500 italic"
            style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
          >
            No posts yet. The first plate is on the desk.
          </p>
        ) : (
          <ul className="space-y-10">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block border-b border-navy-100/70 pb-10 last:border-0"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        categoryAccent[post.category]
                      }`}
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
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-navy-100 bg-white px-2 py-0.5 text-[9.5px] uppercase tracking-[0.22em] text-navy-500 group-hover:border-gold-300 group-hover:text-navy-700 transition-colors"
                          style={{
                            fontFamily:
                              "var(--font-mono), 'IBM Plex Mono', monospace",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <span
                    className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-navy-500 group-hover:text-navy-900 transition-colors"
                    style={{
                      fontFamily:
                        "var(--font-mono), 'IBM Plex Mono', monospace",
                    }}
                  >
                    Read
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Newsletter card */}
      <section
        id="newsletter"
        className="max-w-3xl mx-auto px-6 lg:px-8 pb-14 md:pb-20 scroll-mt-24"
      >
        <NewsletterCard variant="wide" />
      </section>

      {/* Footer marker */}
      <section className="max-w-3xl mx-auto px-6 lg:px-8 pb-20 md:pb-28">
        <div className="flex items-center gap-4 text-navy-300">
          <div className="h-px flex-1 bg-navy-100" />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.32em]"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            Dispatches · feed at{" "}
            <Link
              href="/blog/rss.xml"
              className="text-navy-500 hover:text-gold-700 transition-colors"
            >
              /blog/rss.xml
            </Link>
          </span>
          <div className="h-px flex-1 bg-navy-100" />
        </div>
      </section>
    </div>
  )
}
