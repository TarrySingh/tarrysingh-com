import type { Metadata } from "next"
import Link from "next/link"
import { listDrafts } from "@/lib/studio/drafts-store"
import { isPublished } from "@/lib/studio/reopen"
import { DraftListItem } from "@/components/studio/DraftListItem"

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
    const all = await listDrafts()
    // The desk holds only unpublished work. A draft whose slug is already
    // live on /blog isn't a draft — it's on the wall; its row is a
    // leftover from editing or a best-effort post-publish cleanup that
    // didn't run. Hide those so the dashboard matches its own promise.
    // (Live posts stay editable directly at /studio/editor/<slug>.)
    const live = await Promise.all(all.map((d) => isPublished(d.slug)))
    drafts = all.filter((_, i) => !live[i])
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
      <main className="mx-auto max-w-3xl px-4 pt-12 pb-24 sm:px-6 sm:pt-20 lg:px-8">
        <header className="mb-10 sm:mb-12">
          {/* Kicker row — stacks on phone so the pill never crushes
              the "Studio · Dispatches" kicker, then reflows into one
              row at sm: (640 px+). */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <span
              className="text-[10.5px] font-semibold uppercase tracking-[0.32em] text-gold-700"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              }}
            >
              Studio · Dispatches
            </span>
            <span className="hidden h-px flex-1 bg-navy-200/60 sm:block" />
            <Link
              href="/studio/editor"
              className="inline-flex min-h-[44px] items-center justify-center self-start rounded-full border border-gold-400 bg-navy-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-navy-800 sm:self-auto"
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
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-navy-200 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50"
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
              <DraftListItem key={d.slug} draft={d} />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
