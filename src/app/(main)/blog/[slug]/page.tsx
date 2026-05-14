import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import remarkGfm from "remark-gfm"
import { ArrowLeft, Linkedin } from "lucide-react"
import {
  formatPostDate,
  getAllPosts,
  getPost,
  type BlogPostMeta,
} from "@/lib/blog/posts"
import { mdxComponents } from "@/lib/blog/mdx-components"
import { NewsletterCard } from "@/components/blog/NewsletterCard"
import { ReadingMilestoneNudge } from "@/components/blog/ReadingMilestoneNudge"
import { QuietExitIntent } from "@/components/blog/QuietExitIntent"
import { HighlightToShare } from "@/components/blog/HighlightToShare"

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Not found" }
  return {
    title: `${post.title} — Tarry Singh`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      images: post.hero ? [{ url: post.hero }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.hero ? [post.hero] : undefined,
    },
  }
}

const categoryAccent: Record<BlogPostMeta["category"], string> = {
  Essays: "bg-gold-500",
  Notes: "bg-blue-500",
  Studio: "bg-rose-500",
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const isStudioTheme = post.theme === "studio"
  // Studio variant: cream paper + the same Synaptic palette tokens. Editorial
  // (default) keeps the gradient-to-white background the existing seed posts use.
  // SP3-08 from the Sprint 3 UAT — the field was parsed but not rendered.
  const articleClass = isStudioTheme
    ? "theme-studio bg-[#fbf7ec]"
    : "theme-editorial bg-white"
  const headerClass = isStudioTheme
    ? "relative pt-28 md:pt-36 pb-10 md:pb-14"
    : "relative bg-gradient-to-b from-navy-50/40 to-white pt-28 md:pt-36 pb-10 md:pb-14"

  return (
    <article className={articleClass}>
      {/* Article header */}
      <header className={headerClass}>
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

          <div className="flex items-center gap-3 mb-5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                categoryAccent[post.category]
              }`}
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              }}
            >
              {post.category}
            </span>
            <span className="text-navy-200">·</span>
            <time
              className="text-[11px] tracking-wide text-navy-400"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              }}
              dateTime={post.date}
            >
              {formatPostDate(post.date)}
            </time>
            <span className="text-navy-200">·</span>
            <span
              className="text-[11px] tracking-wide text-navy-400"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              }}
            >
              {post.readingTimeMinutes} min read
            </span>
          </div>

          {post.tags && post.tags.length > 0 ? (
            <div className="mb-5 flex flex-wrap items-center gap-1.5">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="rounded-full border border-navy-200 bg-white/60 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.22em] text-navy-600 transition-colors hover:border-gold-400 hover:text-gold-700"
                  style={{
                    fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                  }}
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}

          <h1
            className="text-3xl md:text-5xl text-navy-900 tracking-tight leading-[1.1] mb-6"
            style={{ fontFamily: "var(--font-display), 'Gloock', serif" }}
          >
            {post.title}
          </h1>

          <p
            className="text-lg md:text-xl text-navy-600 leading-relaxed italic"
            style={{
              fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            }}
          >
            {post.excerpt}
          </p>
        </div>
      </header>

      {/* Body */}
      <section className="max-w-3xl mx-auto px-6 lg:px-8 pb-10 md:pb-16">
        <div className="prose-tarry">
          <MDXRemote
            source={post.body}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [
                    rehypeAutolinkHeadings,
                    {
                      behavior: "append",
                      properties: {
                        className: ["heading-anchor"],
                        ariaLabel: "Link to section",
                      },
                    },
                  ],
                ],
              },
            }}
          />
        </div>
        {/* Sprint 5.5.2 — reading-progress milestone. Only mounts on long posts. */}
        <ReadingMilestoneNudge slug={post.slug} wordCount={post.wordCount} />
        {/* Sprint 5.5.3 — highlight-to-share floating chip */}
        <HighlightToShare slug={post.slug} />
      </section>

      {/* Footer: cartouche + LinkedIn link */}
      <section className="max-w-3xl mx-auto px-6 lg:px-8 pb-20 md:pb-28">
        <div className="mt-10 pt-10 border-t border-navy-100">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.32em] text-navy-400 mb-2"
                style={{
                  fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                }}
              >
                Cartouche
              </div>
              <div
                className="text-sm text-navy-700"
                style={{
                  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                }}
              >
                <em>{post.title}</em> · Dispatches, {formatPostDate(post.date)} ·
                T. Singh
              </div>
            </div>

            {post.linkedin_url ? (
              <a
                href={post.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-navy-200 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700 hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-colors"
                style={{
                  fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                }}
              >
                <Linkedin className="h-3.5 w-3.5" />
                Discuss on LinkedIn
              </a>
            ) : null}
          </div>
        </div>

        <div id="newsletter" className="mt-10 scroll-mt-24">
          <NewsletterCard variant="compact" />
        </div>
        {/* Sprint 5.5.4 — quiet exit-intent (desktop scroll-up only) */}
        <QuietExitIntent slug={post.slug} />

        <div className="mt-12 flex items-center gap-4 text-navy-300">
          <div className="h-px flex-1 bg-navy-100" />
          <Link
            href="/blog"
            className="text-[10px] font-semibold uppercase tracking-[0.32em] text-navy-500 hover:text-gold-700 transition-colors"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            ← Back to dispatches
          </Link>
          <div className="h-px flex-1 bg-navy-100" />
        </div>
      </section>
    </article>
  )
}
