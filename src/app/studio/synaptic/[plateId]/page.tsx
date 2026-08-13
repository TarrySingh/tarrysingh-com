import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getPlateEntry } from "@/lib/synaptic/registry"
import { getAdapter } from "@/lib/synaptic/editor/adapters"
import { getPlateDraft } from "@/lib/synaptic/content-store"
import { PlateEditor } from "@/components/studio/synaptic/PlateEditor"
import type { PlateContent } from "@/lib/synaptic/types"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Edit plate · Studio",
  robots: { index: false, follow: false },
}

export default async function EditPlatePage({
  params,
}: {
  params: Promise<{ plateId: string }>
}) {
  const { plateId } = await params
  const entry = getPlateEntry(plateId)
  if (!entry) notFound()

  const adapter = getAdapter(plateId)
  if (!adapter) {
    // Registered in the library but not yet wired for editing (no adapter).
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #fbf7ec 0%, #f5efe1 100%)",
        }}
      >
        <main className="mx-auto max-w-2xl px-6 pt-24 text-center">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.28em] text-navy-400"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            Extraction pending
          </p>
          <h1
            className="mt-4 text-2xl text-navy-900"
            style={{ fontFamily: "var(--font-display), 'Gloock', serif" }}
          >
            {entry.displayName} isn&rsquo;t wired for editing yet.
          </h1>
          <p
            className="mt-3 text-navy-600 italic"
            style={{ fontFamily: "var(--font-serif), serif" }}
          >
            This plate is in the library but its copy hasn&rsquo;t been
            extracted into an editable adapter.
          </p>
          <Link
            href="/studio/synaptic"
            className="mt-8 inline-flex min-h-[44px] items-center rounded-full border border-navy-200 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-700 hover:bg-navy-50"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            ← Plate library
          </Link>
        </main>
      </div>
    )
  }

  let content: PlateContent = adapter.load()
  let source: "draft" | "file" = "file"
  let updatedAt: string | undefined
  let degraded = false
  try {
    const draft = await getPlateDraft(plateId)
    if (draft) {
      content = draft.content
      source = "draft"
      updatedAt = draft.updatedAt
    }
  } catch {
    degraded = true
  }

  return (
    <PlateEditor
      plateId={plateId}
      displayName={entry.displayName}
      slots={entry.slots}
      previewPath={entry.previewPath}
      group={entry.group}
      initialContent={content}
      initialSource={source}
      initialUpdatedAt={updatedAt}
      degraded={degraded}
    />
  )
}
