import type { Metadata } from "next"
import Link from "next/link"
import { listDrafts } from "@/lib/studio/drafts-store"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Studio — Dispatches",
  description: "The writing surface for tarrysingh.com Dispatches.",
  robots: { index: false, follow: false },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function StudioHome() {
  // Drafts may fail to load if Supabase env isn't configured —
  // surface gracefully rather than crashing.
  let drafts: Awaited<ReturnType<typeof listDrafts>> = []
  let loadError: string | null = null
  try {
    drafts = await listDrafts()
  } catch (err) {
    loadError = err instanceof Error ? err.message : "drafts_unavailable"
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fbf7ec 0%, #f5efe1 100%)",
      }}
    >
      <main className="mx-auto max-w-3xl px-6 pt-20 pb-24 lg:px-8">
        <header className="mb-12">
          <div className="mb-5 flex items-center gap-3">
            <span
              className="text-[10.5px] font-semibold uppercase tracking-[0.32em] text-gold-700"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              }}
            >
              Studio · Dispatches
            </span>
            <span className="h-px flex-1 bg-navy-200/60" />
            <Link
              href="/studio/editor"
              className="rounded-full border border-gold-400 bg-navy-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-navy-800"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              }}
            >
              + New Dispatch
            </Link>
          </div>
          <h1
            className="text-3xl md:text-4xl text-navy-900 tracking-tight"
            style={{ fontFamily: "var(--font-display), 'Gloock', serif" }}
          >
            Where the next plate is on the desk.
          </h1>
          <p
            className="mt-4 text-navy-600 italic leading-relaxed"
            style={{
              fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            }}
          >
            Drafts live here until they earn the wall. One click to
            publish to <code className="font-mono text-sm">/blog</code>.
          </p>
        </header>

        {loadError ? (
          <section
            className="rounded-2xl border border-rose-300 bg-rose-50 p-5"
            style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
          >
            <p className="text-sm text-rose-700">
              Drafts service is unavailable. Set <code>SUPABASE_URL</code> +{" "}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> in the Vercel project and
              run the migration at{" "}
              <code>docs/migrations/2026-05-13-studio-drafts.sql</code>.
            </p>
            <p className="mt-3 text-xs text-rose-500">{loadError}</p>
          </section>
        ) : drafts.length === 0 ? (
          <section
            className="rounded-2xl border border-navy-200/80 bg-white p-10 text-center"
            style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
          >
            <p className="text-lg text-navy-700 mb-2">
              The desk is clear.
            </p>
            <p className="text-sm text-navy-500 italic mb-6">
              Press the pill above to start a new Dispatch.
            </p>
            <Link
              href="/studio/editor"
              className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              }}
            >
              + New Dispatch
            </Link>
          </section>
        ) : (
          <ul className="space-y-3">
            {drafts.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/studio/editor/${d.slug}`}
                  className="group block rounded-xl border border-navy-200/80 bg-white p-5 transition-all duration-200 hover:border-gold-400 hover:bg-white hover:shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-navy-300" />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.28em] text-navy-400"
                      style={{
                        fontFamily:
                          "var(--font-mono), 'IBM Plex Mono', monospace",
                      }}
                    >
                      {d.frontmatter.category}
                    </span>
                    <span className="text-navy-200">·</span>
                    <span
                      className="text-[10px] tracking-wide text-navy-400"
                      style={{
                        fontFamily:
                          "var(--font-mono), 'IBM Plex Mono', monospace",
                      }}
                    >
                      last touched {formatDate(d.updatedAt)}
                    </span>
                  </div>
                  <h2
                    className="text-xl text-navy-900 tracking-tight group-hover:text-gold-700 transition-colors"
                    style={{
                      fontFamily: "var(--font-display), 'Gloock', serif",
                    }}
                  >
                    {d.frontmatter.title || "(untitled)"}
                  </h2>
                  {d.frontmatter.excerpt ? (
                    <p
                      className="mt-2 text-sm text-navy-600 leading-relaxed line-clamp-2"
                      style={{
                        fontFamily:
                          "var(--font-serif), 'IBM Plex Serif', serif",
                      }}
                    >
                      {d.frontmatter.excerpt}
                    </p>
                  ) : null}
                  <p
                    className="mt-2 text-[10px] uppercase tracking-[0.22em] text-navy-300"
                    style={{
                      fontFamily:
                        "var(--font-mono), 'IBM Plex Mono', monospace",
                    }}
                  >
                    slug: {d.slug}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
