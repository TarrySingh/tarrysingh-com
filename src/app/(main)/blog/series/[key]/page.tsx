import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { formatPostDate, type BlogPostMeta } from "@/lib/blog/posts"
import { SERIES, SERIES_KEYS, isSeriesKey } from "@/lib/blog/series"
import { getPostsBySeries } from "@/lib/blog/series-queries"
import { PlateCover } from "@/components/blog/PlateCover"
import { NewsletterCard } from "@/components/blog/NewsletterCard"

const mono = {
  fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
} as const
const display = {
  fontFamily: "var(--font-display), 'Gloock', serif",
} as const
const serif = {
  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
} as const

const categoryAccent: Record<BlogPostMeta["category"], string> = {
  Essays: "#c98e4f",
  Notes: "#849cc8",
  Studio: "#e5a896",
}

export function generateStaticParams() {
  return SERIES_KEYS.map((key) => ({ key }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>
}): Promise<Metadata> {
  const { key } = await params
  if (!isSeriesKey(key)) return { title: "Not found" }
  const meta = SERIES[key]
  const posts = await getPostsBySeries(key)
  const lead = posts[0]
  const ogImage = lead
    ? lead.cover || `/blog/covers/${lead.slug}.png`
    : undefined
  return {
    title: `${meta.name} · Dispatches · Tarry Singh`,
    description: meta.tagline,
    alternates: { canonical: `/blog/series/${key}` },
    openGraph: {
      title: meta.name,
      description: meta.tagline,
      type: "website",
      images: ogImage
        ? [{ url: ogImage, width: 1800, height: 1200, alt: meta.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.name,
      description: meta.tagline,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function SeriesLandingPage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params
  if (!isSeriesKey(key)) notFound()
  const meta = SERIES[key]
  const posts = await getPostsBySeries(key)
  if (posts.length === 0) notFound()

  const SITE = "https://tarrysingh.com"
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: meta.name,
    description: meta.tagline,
    url: `${SITE}/blog/series/${key}`,
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: posts.length,
      itemListElement: posts.map((p, i) => ({
        "@type": "ListItem",
        position: p.series?.part ?? i + 1,
        url: `${SITE}/blog/${p.slug}`,
        name: p.title,
      })),
    },
  }

  return (
    <div
      data-theme="front"
      style={{ background: "#0c1828", color: "#f6ead0", minHeight: "100vh" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Masthead */}
      <section className="mx-auto max-w-4xl px-6 pt-28 md:pt-36 pb-10 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] transition-colors hover:text-[#f4c482]"
          style={{ ...mono, color: "rgba(246,234,208,0.55)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dispatches
        </Link>
        <p
          className="mt-10 text-[11px] font-semibold uppercase tracking-[0.32em]"
          style={{ ...mono, color: "#c98e4f" }}
        >
          Series · {posts.length} {posts.length === 1 ? "part" : "parts"}
        </p>
        <h1
          className="mt-4 max-w-3xl text-4xl md:text-6xl tracking-tight"
          style={{ ...display, lineHeight: 1.05 }}
        >
          {meta.name}
        </h1>
        <p
          className="mt-5 max-w-2xl text-base md:text-lg leading-relaxed"
          style={{ ...serif, color: "rgba(246,234,208,0.66)" }}
        >
          {meta.tagline}
        </p>
      </section>

      {/* Reading order */}
      <section className="mx-auto max-w-4xl px-6 pb-16 lg:px-8">
        <ol className="space-y-10">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group grid gap-6 sm:grid-cols-[200px_1fr] sm:items-center"
              >
                <div
                  className="overflow-hidden rounded-xl"
                  style={{
                    aspectRatio: "3 / 2",
                    border: "1px solid rgba(201,142,79,0.2)",
                  }}
                >
                  <PlateCover
                    slug={post.slug}
                    cover={post.cover}
                    detail="card"
                    width={600}
                    height={400}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div>
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-2xl md:text-3xl tabular-nums"
                      style={{ ...display, color: "#c98e4f", lineHeight: 1 }}
                    >
                      {String(post.series?.part ?? 0).padStart(2, "0")}
                    </span>
                    <span
                      className="text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                      style={{ ...mono, color: "rgba(246,234,208,0.5)" }}
                    >
                      Part {post.series?.part}
                    </span>
                    <span style={{ color: "rgba(246,234,208,0.25)" }}>·</span>
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: categoryAccent[post.category] }}
                    />
                    <time
                      className="text-[10.5px] tracking-wide"
                      style={{ ...mono, color: "rgba(246,234,208,0.5)" }}
                      dateTime={post.date}
                    >
                      {formatPostDate(post.date)}
                    </time>
                  </div>
                  <h2
                    className="mt-2 text-xl md:text-2xl tracking-tight transition-colors group-hover:text-[#f4c482]"
                    style={{ ...display, lineHeight: 1.12 }}
                  >
                    {post.title}
                  </h2>
                  <p
                    className="mt-2 text-[0.95rem] leading-[1.7]"
                    style={{ ...serif, color: "rgba(246,234,208,0.62)" }}
                  >
                    {post.excerpt.length > 180
                      ? post.excerpt.slice(0, 180).trimEnd() + "…"
                      : post.excerpt}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Newsletter + footer */}
      <section
        id="newsletter"
        className="mx-auto max-w-3xl px-6 pb-14 lg:px-8 scroll-mt-24"
      >
        <NewsletterCard variant="wide" />
      </section>
      <section className="mx-auto max-w-4xl px-6 pb-20 lg:px-8">
        <div
          className="flex items-center gap-4"
          style={{ color: "rgba(246,234,208,0.3)" }}
        >
          <div
            className="h-px flex-1"
            style={{ background: "rgba(246,234,208,0.12)" }}
          />
          <Link
            href="/blog"
            className="text-[10px] font-semibold uppercase tracking-[0.32em] transition-colors hover:text-[#c98e4f]"
            style={mono}
          >
            All Dispatches
          </Link>
          <div
            className="h-px flex-1"
            style={{ background: "rgba(246,234,208,0.12)" }}
          />
        </div>
      </section>
    </div>
  )
}
