import type { Metadata } from "next"
import Link from "next/link"
import { PLATE_REGISTRY, type PlateRegistryEntry } from "@/lib/synaptic/registry"
import { isEditorReady } from "@/lib/synaptic/editor/adapters"
import { listPlateDrafts } from "@/lib/synaptic/content-store"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Studio — Synaptic plates",
  description: "Edit the copy in the Synaptic plate library.",
  robots: { index: false, follow: false },
}

const MONO = "var(--font-mono), 'IBM Plex Mono', monospace"
const DISPLAY = "var(--font-display), 'Gloock', serif"
const SERIF = "var(--font-serif), 'IBM Plex Serif', serif"

function formatWhen(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function groupLabel(group?: string): string {
  if (!group) return "Other"
  return group.charAt(0).toUpperCase() + group.slice(1)
}

export default async function SynapticStudioHome() {
  let lastEdited: Record<string, string> = {}
  let loadError: string | null = null
  try {
    const drafts = await listPlateDrafts()
    lastEdited = Object.fromEntries(drafts.map((d) => [d.plateId, d.updatedAt]))
  } catch (err) {
    loadError = err instanceof Error ? err.message : "drafts_unavailable"
  }

  // Preserve registry order, bucket by group.
  const groups: { key: string; label: string; plates: PlateRegistryEntry[] }[] = []
  for (const entry of PLATE_REGISTRY) {
    const key = entry.group ?? "other"
    let bucket = groups.find((g) => g.key === key)
    if (!bucket) {
      bucket = { key, label: groupLabel(entry.group), plates: [] }
      groups.push(bucket)
    }
    bucket.plates.push(entry)
  }

  const readyCount = PLATE_REGISTRY.filter((p) => isEditorReady(p.id)).length

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fbf7ec 0%, #f5efe1 100%)",
      }}
    >
      <main className="mx-auto max-w-3xl px-4 pt-12 pb-24 sm:px-6 sm:pt-20 lg:px-8">
        <header className="mb-10 sm:mb-12">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <span
              className="text-[10.5px] font-semibold uppercase tracking-[0.32em] text-gold-700"
              style={{ fontFamily: MONO }}
            >
              Studio · Synaptic
            </span>
            <span className="hidden h-px flex-1 bg-navy-200/60 sm:block" />
            <Link
              href="/studio"
              className="inline-flex min-h-[44px] items-center justify-center self-start rounded-full border border-navy-200 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50 sm:self-auto"
              style={{ fontFamily: MONO }}
            >
              ← Dispatches
            </Link>
          </div>
          <h1
            className="text-3xl md:text-4xl text-navy-900 tracking-tight"
            style={{ fontFamily: DISPLAY }}
          >
            The plate library.
          </h1>
          <p
            className="mt-4 text-navy-600 italic leading-relaxed"
            style={{ fontFamily: SERIF }}
          >
            Edit the copy that rides on each Synaptic plate. Saving keeps a
            draft; Publish writes it back to the plate&rsquo;s module and
            redeploys. {readyCount} of {PLATE_REGISTRY.length} plates are wired
            for editing.
          </p>
        </header>

        {loadError && (
          <section
            className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-5"
            style={{ fontFamily: SERIF }}
          >
            <p className="text-sm text-amber-800">
              Draft service unavailable — you can still open a plate, but
              autosave won&rsquo;t persist. Set <code>SUPABASE_URL</code> +{" "}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> and run the migration at{" "}
              <code>docs/migrations/2026-05-17-synaptic-plate-drafts.sql</code>.
            </p>
            <p className="mt-2 text-xs text-amber-600">{loadError}</p>
          </section>
        )}

        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.key}>
              <h2
                className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-navy-400"
                style={{ fontFamily: MONO }}
              >
                {group.label}
              </h2>
              <ul className="space-y-3">
                {group.plates.map((plate) => {
                  const ready = isEditorReady(plate.id)
                  const edited = lastEdited[plate.id]
                  const inner = (
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div
                          className="truncate text-lg text-navy-900"
                          style={{ fontFamily: DISPLAY }}
                        >
                          {plate.displayName}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {plate.slots.map((slot) => (
                            <span
                              key={slot}
                              className="rounded-full bg-navy-50 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-navy-500"
                              style={{ fontFamily: MONO }}
                            >
                              {slot}
                            </span>
                          ))}
                          {edited && (
                            <span
                              className="text-[10px] italic text-gold-700"
                              style={{ fontFamily: SERIF }}
                            >
                              · draft saved {formatWhen(edited)}
                            </span>
                          )}
                        </div>
                      </div>
                      {ready ? (
                        <span
                          className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-700"
                          style={{ fontFamily: MONO }}
                        >
                          Edit →
                        </span>
                      ) : (
                        <span
                          className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-300"
                          style={{ fontFamily: MONO }}
                        >
                          extraction pending
                        </span>
                      )}
                    </div>
                  )
                  return (
                    <li key={plate.id}>
                      {ready ? (
                        <Link
                          href={`/studio/synaptic/${plate.id}`}
                          className="block rounded-2xl border border-navy-200/80 bg-white p-5 transition-colors hover:border-gold-400 hover:bg-gold-50/30"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className="block rounded-2xl border border-dashed border-navy-200/70 bg-white/50 p-5 opacity-70">
                          {inner}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
