import Link from "next/link"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { ArrowLeft } from "lucide-react"
import { getPostAllowDraft, formatPostDate } from "@/lib/blog/posts"
import { mdxComponents } from "@/lib/blog/mdx-components"
import { ReadModeToggle } from "@/components/blog/ReadModeToggle"
import { ReadRail } from "@/components/blog/ReadRail"
import { SERIES } from "@/lib/blog/series"

/**
 * THE ENGINE ROOM — the flagship essay, hosted as Synaptic Plate V.
 *
 * The 30,000-word field manual and its fifteen interactive instruments render
 * here, at /synaptic/loop-harness, not under /blog — same strategy as the
 * Chokepoint plate (/blog stays free for the derivative articles). We reuse
 * "The Read" reader: <article id="read-root"> owns the data-read-mode surface
 * and the light/dark toggle; the essay MDX (still draft in content/blog, read
 * via getPostAllowDraft) renders through the shared mdx components, so every
 * instrument, code block and dark/light rule behaves exactly as it did on the
 * blog. /blog/the-engine-room 307-redirects here.
 */

const SLUG = "the-engine-room"
const mono = { fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }

export default async function EngineRoomEssayPage() {
  const post = await getPostAllowDraft(SLUG)
  if (!post) notFound()

  const hasMath = post.body.includes("$$")
  const seriesMeta = post.series ? SERIES[post.series.key] : null
  const isEssay = post.category === "Essays"

  return (
    <article
      id="read-root"
      data-read-mode="dark"
      suppressHydrationWarning
      className={`read-loop-surface theme-editorial min-h-screen ${isEssay ? "read-dropcap" : ""}`}
    >
      {/* No-flash: apply the stored read-mode before the body paints. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var m=localStorage.getItem('dispatch-read-mode');if(m==='dark'||m==='light'){var r=document.getElementById('read-root');if(r)r.setAttribute('data-read-mode',m)}}catch(e){}})()",
        }}
      />

      {/* Article header */}
      <header className="relative pt-28 md:pt-36 pb-10 md:pb-14">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              href="/synaptic"
              data-read-kicker
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-400 hover:text-navy-900 transition-colors"
              style={mono}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              The studio
            </Link>
            <ReadModeToggle />
          </div>

          <div className="flex items-center gap-3 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            <span
              data-read-meta
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400"
              style={mono}
            >
              {post.category}
            </span>
            <span data-read-meta className="text-navy-200">
              ·
            </span>
            <time
              data-read-meta
              className="text-[11px] tracking-wide text-navy-400"
              style={mono}
              dateTime={post.date}
            >
              {formatPostDate(post.date)}
            </time>
            <span data-read-meta className="text-navy-200">
              ·
            </span>
            <span
              data-read-meta
              className="text-[11px] tracking-wide text-navy-400"
              style={mono}
            >
              {post.readingTimeMinutes} min read
            </span>
          </div>

          {seriesMeta && post.series ? (
            <span
              data-read-meta
              className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400"
              style={mono}
            >
              {seriesMeta.name} · Part {post.series.part}
              {post.series.total ? ` of ${post.series.total}` : ""}
            </span>
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
            style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
          >
            {post.excerpt}
          </p>
        </div>
      </header>

      {/* Body */}
      <section className="max-w-3xl mx-auto px-6 lg:px-8 pb-10 md:pb-16">
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
      </section>

      {/* Footer: cartouche + back to the studio */}
      <footer className="max-w-3xl mx-auto px-6 lg:px-8 pb-24 md:pb-32">
        <div className="mt-10 pt-10 border-t border-navy-100">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.32em] text-navy-400 mb-2"
            style={mono}
          >
            Cartouche
          </div>
          <div
            className="text-sm text-navy-700"
            style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
          >
            <em>{post.title}</em> · Synaptic Cartography ·{" "}
            {formatPostDate(post.date)} · T. Singh
          </div>
        </div>

        <div className="mt-12 flex items-center gap-4 text-navy-300">
          <div className="h-px flex-1 bg-navy-100" />
          <Link
            href="/synaptic"
            className="text-[10px] font-semibold uppercase tracking-[0.32em] text-navy-500 hover:text-gold-700 transition-colors"
            style={mono}
          >
            ← Back to the studio
          </Link>
          <div className="h-px flex-1 bg-navy-100" />
        </div>
      </footer>
    </article>
  )
}
