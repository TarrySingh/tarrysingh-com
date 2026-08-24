import type { Metadata } from "next"
import Link from "next/link"
import { getAllPosts, formatPostDate, type BlogPostMeta } from "@/lib/blog/posts"
import { getAllSeriesWithCounts } from "@/lib/blog/series-queries"
import { type SeriesKey } from "@/lib/blog/series"
import { NewsletterCard } from "@/components/blog/NewsletterCard"
import { PlateCover } from "@/components/blog/PlateCover"
import { FrontControls } from "@/components/blog/FrontControls"

export const metadata: Metadata = {
  title: "Dispatches · Tarry Singh",
  description:
    "Field notes and essays from the studio, AI strategy, deep-tech architecture, and the economics underneath. Infrequent, opinionated, quietly written.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Dispatches · Tarry Singh",
    description:
      "Field notes and essays from the studio, AI strategy, deep-tech architecture, and the economics underneath.",
    type: "website",
  },
}

const mono = {
  fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
} as const
const display = {
  fontFamily: "var(--font-display), 'Gloock', serif",
} as const
const serif = {
  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
} as const

/**
 * Lower-cased haystack a card is searched against: title, summary, tags,
 * category and series name. Built on the SERVER so the client island only has
 * to do substring tests, and so the text ships in the HTML either way.
 */
function searchKey(post: BlogPostMeta): string {
  return [
    post.title,
    post.excerpt,
    post.category,
    post.series?.key ?? "",
    ...(post.tags ?? []),
  ]
    .join(" ")
    .toLowerCase()
}

const categoryAccent: Record<BlogPostMeta["category"], string> = {
  Essays: "#c98e4f",
  Notes: "#849cc8",
  Studio: "#e5a896",
}

function MetaRow({ post }: { post: BlogPostMeta }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: categoryAccent[post.category] }}
      />
      <span
        className="text-[10.5px] font-semibold uppercase tracking-[0.22em]"
        style={{ ...mono, color: "rgba(246,234,208,0.7)" }}
      >
        {post.category}
      </span>
      <span style={{ color: "rgba(246,234,208,0.3)" }}>·</span>
      <time
        className="text-[10.5px] tracking-wide"
        style={{ ...mono, color: "rgba(246,234,208,0.5)" }}
        dateTime={post.date}
      >
        {formatPostDate(post.date)}
      </time>
      <span style={{ color: "rgba(246,234,208,0.3)" }}>·</span>
      <span
        className="text-[10.5px] tracking-wide"
        style={{ ...mono, color: "rgba(246,234,208,0.5)" }}
      >
        {post.readingTimeMinutes} min
      </span>
    </div>
  )
}

export default async function BlogIndex() {
  const posts = await getAllPosts()
  const flagship = posts.find((p) => p.category === "Essays") ?? posts[0]
  const gridPosts = posts.filter(
    (p) => p.slug !== flagship?.slug && p.category !== "Notes",
  )
  const notes = posts.filter((p) => p.category === "Notes")
  const seriesCounts = await getAllSeriesWithCounts()
  const activeSeries: SeriesKey[] = seriesCounts
    .filter((s) => s.count > 0)
    .map((s) => s.key)

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Dispatches · Tarry Singh",
    description:
      "Field notes and essays from the studio, AI strategy, deep-tech architecture, and the economics underneath.",
    url: "https://tarrysingh.com/blog",
    author: {
      "@type": "Person",
      name: "Tarry Singh",
      url: "https://tarrysingh.com",
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
          __html: JSON.stringify(blogLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Masthead */}
      <section className="relative mx-auto max-w-6xl px-6 pt-28 md:pt-36 pb-8 lg:px-8">
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.32em]"
          style={{ ...mono, color: "#c98e4f" }}
        >
          Dispatches
        </span>
        <h1
          className="mt-4 max-w-2xl text-4xl md:text-6xl tracking-tight"
          style={{ ...display, lineHeight: 1.05 }}
        >
          Field notes from the studio.
        </h1>
        <p
          className="mt-5 max-w-xl text-base md:text-lg leading-relaxed"
          style={{ ...serif, color: "rgba(246,234,208,0.66)" }}
        >
          Essays on AI strategy, the architecture of agent systems, and the
          economics underneath, drawn as working plates. No cadence, no
          content calendar. Posts when they are ready.
        </p>
        <div className="mt-8">
          <FrontControls activeSeries={activeSeries} gridTotal={gridPosts.length} />
        </div>
      </section>

      {/* Flagship hero */}
      {flagship ? (
        <section className="mx-auto max-w-6xl px-6 pb-12 lg:px-8">
          <Link
            href={`/blog/${flagship.slug}`}
            className="group relative block overflow-hidden rounded-2xl"
            style={{ border: "1px solid rgba(201,142,79,0.25)" }}
          >
            <div className="relative" style={{ aspectRatio: "21 / 9" }}>
              <PlateCover
                slug={flagship.slug}
                cover={flagship.cover}
                register={undefined}
                detail="full"
                width={1400}
                height={600}
                className="absolute inset-0 h-full w-full"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(12,24,40,0) 35%, rgba(12,24,40,0.55) 70%, rgba(12,24,40,0.92) 100%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                <MetaRow post={flagship} />
                <h2
                  className="mt-3 max-w-3xl text-3xl md:text-5xl tracking-tight transition-colors group-hover:text-[#f4c482]"
                  style={{ ...display, lineHeight: 1.06 }}
                >
                  {flagship.title}
                </h2>
                <p
                  className="mt-3 hidden max-w-2xl text-base leading-relaxed md:block"
                  style={{ ...serif, color: "rgba(246,234,208,0.72)" }}
                >
                  {flagship.excerpt}
                </p>
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      {/* Grid + Notes stream */}
      <section className="mx-auto max-w-6xl px-6 pb-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          {/* Essay / Studio grid */}
          <div>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
              {gridPosts.map((post) => (
                <article
                  key={post.slug}
                  data-card="grid"
                  data-category={post.category}
                  data-series={post.series?.key ?? ""}
                  data-search={searchKey(post)}
                >
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <div
                      className="mb-4 overflow-hidden rounded-xl"
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
                        className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <MetaRow post={post} />
                    <h3
                      className="mt-2.5 text-xl md:text-2xl tracking-tight transition-colors group-hover:text-[#f4c482]"
                      style={{ ...display, lineHeight: 1.12 }}
                    >
                      {post.title}
                    </h3>
                    <p
                      className="mt-2 text-[0.95rem] leading-[1.7]"
                      style={{ ...serif, color: "rgba(246,234,208,0.62)" }}
                    >
                      {post.excerpt.length > 150
                        ? post.excerpt.slice(0, 150).trimEnd() + "…"
                        : post.excerpt}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
            {/* Portal target: FrontControls renders Load-more here so the
                button sits under the grid while its state stays in the island. */}
            <div id="blog-loadmore" className="flex justify-center" />
          </div>

          {/* Notes stream */}
          {notes.length > 0 ? (
            <aside className="lg:border-l lg:pl-8" style={{ borderColor: "rgba(246,234,208,0.12)" }}>
              <p
                className="mb-5 text-[10px] font-semibold uppercase tracking-[0.32em]"
                style={{ ...mono, color: "rgba(246,234,208,0.55)" }}
              >
                Notes
              </p>
              <ul className="space-y-6">
                {notes.map((post) => (
                  <li
                    key={post.slug}
                    data-card="note"
                    data-category={post.category}
                    data-series={post.series?.key ?? ""}
                    data-search={searchKey(post)}
                  >
                    <Link href={`/blog/${post.slug}`} className="group block">
                      <time
                        className="text-[10px] uppercase tracking-[0.22em]"
                        style={{ ...mono, color: "rgba(246,234,208,0.55)" }}
                        dateTime={post.date}
                      >
                        {formatPostDate(post.date)}
                      </time>
                      <h3
                        className="mt-1.5 text-base leading-snug transition-colors group-hover:text-[#f4c482]"
                        style={{ ...serif, color: "rgba(246,234,208,0.9)" }}
                      >
                        {post.title}
                      </h3>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </section>

      {/* Newsletter + footer */}
      <section
        id="newsletter"
        className="mx-auto max-w-3xl px-6 pb-14 lg:px-8 scroll-mt-24"
      >
        <NewsletterCard variant="wide" />
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-8">
        <div className="flex items-center gap-4" style={{ color: "rgba(246,234,208,0.3)" }}>
          <div className="h-px flex-1" style={{ background: "rgba(246,234,208,0.12)" }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.32em]"
            style={mono}
          >
            Dispatches · feed at{" "}
            <Link
              href="/blog/rss.xml"
              className="transition-colors hover:text-[#c98e4f]"
            >
              /blog/rss.xml
            </Link>
          </span>
          <div className="h-px flex-1" style={{ background: "rgba(246,234,208,0.12)" }} />
        </div>
      </section>
    </div>
  )
}
