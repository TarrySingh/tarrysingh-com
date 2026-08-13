import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { marked } from "marked"
import { ArrowLeft, Linkedin } from "lucide-react"
import {
  formatPostDate,
  getAllPosts,
  getPost,
  getNudgeCard,
  type BlogPostMeta,
} from "@/lib/blog/posts"
import { mdxComponents } from "@/lib/blog/mdx-components"
import { NewsletterCard } from "@/components/blog/NewsletterCard"
import { ReadingMilestoneNudge } from "@/components/blog/ReadingMilestoneNudge"
import { QuietExitIntent } from "@/components/blog/QuietExitIntent"
import { HighlightToShare } from "@/components/blog/HighlightToShare"
import { TarryPeekABoo } from "@/components/blog/TarryPeekABoo"
import { ReadModeToggle } from "@/components/blog/ReadModeToggle"
import { ReadRail } from "@/components/blog/ReadRail"
import { SetPiece } from "@/components/blog/SetPiece"
import { SERIES } from "@/lib/blog/series"
import { getPostsBySeries } from "@/lib/blog/series-queries"

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
  // Every post carries a slug-deterministic plate cover; an explicit
  // bespoke `cover` in frontmatter wins. Resolved absolute via the root
  // layout's metadataBase so social scrapers accept it.
  const ogImage = post.cover || `/blog/covers/${slug}.png`
  return {
    title: `${post.title} · Tarry Singh`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      images: [{ url: ogImage, width: 1800, height: 1200, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
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
  // The Engine Room now lives at /synaptic/loop-harness (the Chokepoint pattern);
  // /blog stays free for its derivative articles.
  if (slug === "the-engine-room") redirect("/synaptic/loop-harness")
  const post = await getPost(slug)
  if (!post) notFound()

  // Dispatches v2 — The Set Piece register. Opt-in via `theme: "setpiece"`;
  // the scroll-driven feature replaces The Read for this post.
  if (post.theme === "setpiece") return <SetPiece post={post} />

  // Sprint 5.5.1 — AI-baked footer nudge card, if one was generated
  // at publish time via `npm run blog:bake-nudge <slug>`.
  const nudgeCard = await getNudgeCard(slug)

  // Math (KaTeX) is opt-in per post, gated on the presence of block `$$` math.
  // This keeps currency like "$700 billion" in economics posts from ever being
  // parsed as math. The studio serializer gates on the same `$$` signal.
  const hasMath = post.body.includes("$$")

  // Dispatches v2 — series context (gated; renders nothing until a post
  // carries `series` via the #9 backfill / the editor). Siblings power
  // the masthead breadcrumb + the "Continue the series" foot.
  const seriesMeta = post.series ? SERIES[post.series.key] : null
  const seriesPosts = post.series
    ? (await getPostsBySeries(post.series.key)).filter(
        (p) => p.slug !== post.slug,
      )
    : []
  // Hero cover — explicit bespoke only for now; Phase 2 wires the
  // slug-deterministic /blog/covers/<slug>.png default.
  const coverSrc = post.cover || post.hero || null

  // Dispatches v2 — structured data. Image is the canonical plate cover
  // (always present), made absolute for crawlers; breadcrumb mirrors the
  // on-page trail Home › Dispatches › [Series] › Post.
  const SITE = "https://tarrysingh.com"
  const canonical = `${SITE}/blog/${slug}`
  const rawImage = post.cover || `/blog/covers/${slug}.png`
  const schemaImage = rawImage.startsWith("http") ? rawImage : `${SITE}${rawImage}`
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    image: schemaImage,
    url: canonical,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    author: { "@type": "Person", name: "Tarry Singh", url: SITE },
    publisher: { "@type": "Person", name: "Tarry Singh", url: SITE },
    articleSection: post.category,
    ...(post.tags && post.tags.length ? { keywords: post.tags.join(", ") } : {}),
    ...(post.wordCount ? { wordCount: post.wordCount } : {}),
  }
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Dispatches", item: `${SITE}/blog` },
      ...(post.series && seriesMeta
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: seriesMeta.name,
              item: `${SITE}/blog/series/${post.series.key}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: post.series && seriesMeta ? 4 : 3,
        name: post.title,
        item: canonical,
      },
    ],
  }

  const isStudioTheme = post.theme === "studio"
  // Dispatches v2 — "The Read" unifies on a cream paper surface driven by
  // the light/dark tokens ([data-read-mode] in globals.css). The legacy
  // theme-studio / theme-editorial class is kept for light-mode colour
  // continuity, but the background now comes from --read-bg so the dark
  // toggle flips the whole surface. Drop-cap on Essays only.
  const articleClass = [
    "read-dispatch",
    isStudioTheme ? "theme-studio" : "theme-editorial",
    post.category === "Essays" ? "read-dropcap" : "",
  ]
    .filter(Boolean)
    .join(" ")
  const headerClass = "relative pt-28 md:pt-36 pb-10 md:pb-14"
  // Some plates read dark by default. THE ENGINE ROOM is a terminal-graphite
  // essay whose fifteen instruments were built and tuned in dark mode, so it
  // opens dark; the reader's stored preference still overrides (no-flash below).
  const defaultReadMode = post.series?.key === "loop-harness" ? "dark" : "light"

  return (
    <article
      id="read-root"
      data-read-mode={defaultReadMode}
      suppressHydrationWarning
      className={articleClass}
    >
      {/* No-flash: apply the stored read-mode before the body paints.
          Runs as the parser reaches it (read-root is already open). React
          keeps data-read-mode="light" but never re-controls this
          server-rendered element, so the imperative flip is safe. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var m=localStorage.getItem('dispatch-read-mode');if(m==='dark'||m==='light'){var r=document.getElementById('read-root');if(r)r.setAttribute('data-read-mode',m)}}catch(e){}})()",
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Article header */}
      <header className={headerClass}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              href="/blog"
              data-read-kicker
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-400 hover:text-navy-900 transition-colors"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dispatches
            </Link>
            <ReadModeToggle />
          </div>

          <div className="flex items-center gap-3 mb-5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                categoryAccent[post.category]
              }`}
            />
            <span
              data-read-meta
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              }}
            >
              {post.category}
            </span>
            <span data-read-meta className="text-navy-200">·</span>
            <time
              data-read-meta
              className="text-[11px] tracking-wide text-navy-400"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              }}
              dateTime={post.date}
            >
              {formatPostDate(post.date)}
            </time>
            <span data-read-meta className="text-navy-200">·</span>
            <span
              data-read-meta
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
                  data-read-pill
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

          {post.series && seriesMeta ? (
            <Link
              href={`/blog/series/${post.series.key}`}
              data-read-meta
              className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400 hover:text-gold-700 transition-colors"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              }}
            >
              {seriesMeta.name} · Part {post.series.part}
              {post.series.total ? ` of ${post.series.total}` : ""}
            </Link>
          ) : null}

          <h1
            data-read-title
            className="text-3xl md:text-5xl text-navy-900 tracking-tight leading-[1.1] mb-6"
            style={{ fontFamily: "var(--font-display), 'Gloock', serif" }}
          >
            {post.title}
          </h1>

          <p
            data-read-excerpt
            className="text-lg md:text-xl text-navy-600 leading-relaxed italic"
            style={{
              fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            }}
          >
            {post.excerpt}
          </p>

          {coverSrc ? (
            <div
              data-read-hair
              className="mt-8 overflow-hidden rounded-xl"
              style={{
                aspectRatio: "21 / 9",
                border: "1px solid var(--read-hair, rgba(13,27,61,0.12))",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverSrc}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </header>

      {/* Body */}
      <section className="max-w-3xl mx-auto px-6 lg:px-8 pb-10 md:pb-16">
        {/* TOC + scroll-progress rail (client island; reads the rendered headings) */}
        <ReadRail />
        <div className="prose-tarry">
          <MDXRemote
            source={post.body}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: hasMath ? [remarkGfm, remarkMath] : [remarkGfm],
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
                  ...(hasMath ? [rehypeKatex] : []),
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

        {post.series && seriesMeta && seriesPosts.length > 0 ? (
          <nav
            aria-label="More in this series"
            data-read-hair
            className="mt-10 border-t border-navy-100 pt-8"
          >
            <p
              data-read-meta
              className="mb-4 text-[10px] font-semibold uppercase tracking-[0.32em] text-navy-400"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              }}
            >
              Continue · {seriesMeta.name}
            </p>
            <ul className="space-y-3">
              {seriesPosts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex items-baseline gap-3"
                  >
                    <span
                      data-read-meta
                      className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-navy-400"
                      style={{
                        fontFamily:
                          "var(--font-mono), 'IBM Plex Mono', monospace",
                      }}
                    >
                      Part {p.series?.part}
                    </span>
                    <span
                      data-read-excerpt
                      className="text-base text-navy-800 group-hover:text-gold-700 transition-colors"
                      style={{
                        fontFamily:
                          "var(--font-serif), 'IBM Plex Serif', serif",
                      }}
                    >
                      {p.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {nudgeCard ? (
          <aside
            className="mt-10 rounded-2xl border border-gold-200 bg-gold-50/40 p-6 md:p-8"
            aria-label="Footer nudge card"
            data-nudge="footer-card"
          >
            <div className="mb-3 flex items-center gap-3">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold-700"
                style={{
                  fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                }}
              >
                If the argument held
              </span>
              <span className="h-px flex-1 bg-gold-200" />
            </div>
            <div
              className="text-base md:text-lg leading-[1.78] text-navy-800 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_em]:italic [&_strong]:font-semibold"
              style={{
                fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
              }}
              dangerouslySetInnerHTML={{
                __html: marked.parse(nudgeCard, { async: false }) as string,
              }}
            />
          </aside>
        ) : null}
        {/* Josh-Comeau-style mascot — Tarry pops in at the foot of
            every Dispatch with an inline subscribe pill. Photo cutout
            today; swap to an illustrated SVG by passing `src` later. */}
        <TarryPeekABoo slug={post.slug} />
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

        {/*
          Edit pill — public link but the target route is Basic-Auth
          gated by the studio middleware, so only Tarry can act on it.
          The studio/editor/[slug] page auto-reopens any published post
          into a draft via reopenPublished(), so this is a one-click
          edit loop for live posts. Plain <a> rather than next/link to
          avoid prefetching the gated route on hover.
        */}
        <div className="mt-6 flex justify-end">
          <a
            href={`/studio/editor/${post.slug}`}
            rel="nofollow noopener"
            className="text-[10px] font-medium uppercase tracking-[0.28em] text-navy-300 hover:text-gold-700 transition-colors"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            Edit this post →
          </a>
        </div>
      </section>
    </article>
  )
}
