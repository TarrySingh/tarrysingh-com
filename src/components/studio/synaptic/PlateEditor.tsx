"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import type { PlateContent } from "@/lib/synaptic/types"
import type { SlotCategory } from "@/lib/synaptic/registry"
import { PlatePreview } from "./PlatePreview"

const MONO = "var(--font-mono), 'IBM Plex Mono', monospace"
const DISPLAY = "var(--font-display), 'Gloock', serif"
const SERIF = "var(--font-serif), 'IBM Plex Serif', serif"

type SaveState = "idle" | "saving" | "saved" | "error"
type PublishState = "idle" | "publishing" | "done" | "error"

interface PublishResult {
  ok: boolean
  outcome?: "updated" | "unchanged"
  commitUrl?: string
  previewPath?: string
  error?: string
}

const labelCls =
  "block text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-400 mb-1.5"
const inputCls =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-[15px] text-navy-900 outline-none transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-200"

export function PlateEditor({
  plateId,
  displayName,
  slots,
  previewPath,
  group,
  initialContent,
  initialSource,
  initialUpdatedAt,
  degraded,
}: {
  plateId: string
  displayName: string
  slots: SlotCategory[]
  previewPath?: string
  group?: string
  initialContent: PlateContent
  initialSource: "draft" | "file"
  initialUpdatedAt?: string
  degraded: boolean
}) {
  const [content, setContent] = useState<PlateContent>(initialContent)
  const [source, setSource] = useState<"draft" | "file">(initialSource)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [savedAt, setSavedAt] = useState<string | undefined>(initialUpdatedAt)
  const [publishState, setPublishState] = useState<PublishState>("idle")
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null)

  // Skip autosave on the mount render and on programmatic resets (discard).
  const suppressSave = useRef(true)

  // Some plates' items carry a subtitle (chip/arm/vision/hominis); others
  // (rose sectors, ramaswamy beats) don't. Decide once from the initial load
  // so the field doesn't vanish mid-edit when cleared.
  const showAnnotationSubtitles = useMemo(
    () => (initialContent.annotations ?? []).some((a) => (a.subtitle ?? "") !== ""),
    [initialContent],
  )

  useEffect(() => {
    if (suppressSave.current) {
      suppressSave.current = false
      return
    }
    if (degraded) return
    setSaveState("saving")
    setPublishResult(null)
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/studio/synaptic/draft", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plateId, content }),
        })
        const data = await res.json()
        if (data.ok) {
          setSaveState("saved")
          setSavedAt(data.savedAt)
          setSource("draft")
        } else {
          setSaveState("error")
        }
      } catch {
        setSaveState("error")
      }
    }, 800)
    return () => clearTimeout(t)
  }, [content, plateId, degraded])

  // ---- immutable update helpers ----
  const patch = useCallback((p: Partial<PlateContent>) => {
    setContent((c) => ({ ...c, ...p }))
  }, [])
  const updateAnnotation = useCallback(
    (id: string, field: "title" | "subtitle" | "body", value: string) => {
      setContent((c) => ({
        ...c,
        annotations: c.annotations?.map((a) =>
          a.id === id ? { ...a, [field]: value } : a,
        ),
      }))
    },
    [],
  )
  const updateCaption = useCallback((id: string, value: string) => {
    setContent((c) => ({
      ...c,
      captions: c.captions?.map((cap) =>
        cap.id === id ? { ...cap, text: value } : cap,
      ),
    }))
  }, [])
  const updateProse = useCallback(
    (blockId: string, idx: number, value: string) => {
      setContent((c) => ({
        ...c,
        prose: c.prose?.map((b) =>
          b.id === blockId
            ? { ...b, paragraphs: b.paragraphs.map((p, i) => (i === idx ? value : p)) }
            : b,
        ),
      }))
    },
    [],
  )

  async function onPublish() {
    if (degraded || publishState === "publishing") return
    setPublishState("publishing")
    setPublishResult(null)
    try {
      // Persist the latest copy first, then commit it.
      await fetch("/api/studio/synaptic/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plateId, content }),
      })
      const res = await fetch("/api/studio/synaptic/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plateId }),
      })
      const data = (await res.json()) as PublishResult
      if (data.ok) {
        setPublishState("done")
        setPublishResult(data)
        setSource("file") // draft cleared server-side
        setSaveState("idle")
      } else {
        setPublishState("error")
        setPublishResult(data)
      }
    } catch {
      setPublishState("error")
      setPublishResult({ ok: false, error: "network_error" })
    }
  }

  async function onDiscard() {
    if (
      !window.confirm(
        "Discard your draft and revert to the published copy? This can't be undone.",
      )
    )
      return
    try {
      await fetch(`/api/studio/synaptic/draft?plateId=${encodeURIComponent(plateId)}`, {
        method: "DELETE",
      })
      const res = await fetch(
        `/api/studio/synaptic/draft?plateId=${encodeURIComponent(plateId)}`,
      )
      const data = await res.json()
      if (data.ok) {
        suppressSave.current = true // don't re-save the reverted content
        setContent(data.content)
        setSource("file")
        setSaveState("idle")
        setPublishResult(null)
        setPublishState("idle")
      }
    } catch {
      /* leave the editor as-is on failure */
    }
  }

  const saveLabel =
    degraded
      ? "drafts offline"
      : saveState === "saving"
        ? "saving…"
        : saveState === "saved"
          ? `saved${savedAt ? ` · ${new Date(savedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : ""}`
          : saveState === "error"
            ? "save failed"
            : source === "draft"
              ? "draft loaded"
              : "from published file"

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fbf7ec 0%, #f5efe1 100%)",
      }}
    >
      {/* Sticky header */}
      <header
        className="sticky top-0 z-10 border-b border-navy-200/70 backdrop-blur"
        style={{ background: "rgba(251,247,236,0.85)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/studio/synaptic"
              className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-500 hover:text-navy-800"
              style={{ fontFamily: MONO }}
            >
              ← Library
            </Link>
            <span className="hidden h-4 w-px bg-navy-200 sm:block" />
            <h1
              className="truncate text-base text-navy-900 sm:text-lg"
              style={{ fontFamily: DISPLAY }}
            >
              {displayName}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span
              className={`hidden text-[10px] font-semibold uppercase tracking-[0.18em] sm:inline ${
                saveState === "error" ? "text-rose-500" : "text-navy-400"
              }`}
              style={{ fontFamily: MONO }}
            >
              {saveLabel}
            </span>
            <button
              type="button"
              onClick={onPublish}
              disabled={degraded || publishState === "publishing"}
              className="inline-flex min-h-[40px] items-center rounded-full border border-gold-400 bg-navy-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ fontFamily: MONO }}
            >
              {publishState === "publishing" ? "publishing…" : "Publish to main"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_minmax(320px,420px)] lg:px-8">
        {/* ---- Form ---- */}
        <div className="space-y-7">
          {degraded && (
            <div
              className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800"
              style={{ fontFamily: SERIF }}
            >
              Draft storage is offline, so edits won&rsquo;t autosave and
              Publish is disabled. Configure Supabase + run the
              <code className="mx-1">synaptic_plate_drafts</code> migration.
            </div>
          )}

          {publishResult && (
            <div
              className={`rounded-xl border p-4 text-sm ${
                publishResult.ok
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-rose-300 bg-rose-50 text-rose-700"
              }`}
              style={{ fontFamily: SERIF }}
            >
              {publishResult.ok ? (
                <>
                  {publishResult.outcome === "unchanged"
                    ? "No changes vs the published copy — nothing to commit."
                    : "Published. Vercel will redeploy in ~90s."}{" "}
                  {publishResult.commitUrl && (
                    <a
                      className="font-semibold underline"
                      href={publishResult.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View commit ↗
                    </a>
                  )}
                  {previewPath && (
                    <>
                      {" · "}
                      <a
                        className="font-semibold underline"
                        href={previewPath}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open live plate ↗
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>Publish failed: {publishResult.error ?? "unknown_error"}.</>
              )}
            </div>
          )}

          {/* Identity */}
          <section className="rounded-2xl border border-navy-200/80 bg-white p-5">
            <SectionTitle>Plate</SectionTitle>
            <div className="space-y-4">
              <div>
                <label className={labelCls} style={{ fontFamily: MONO }}>
                  Display name
                </label>
                <input
                  className={inputCls}
                  style={{ fontFamily: SERIF }}
                  value={content.displayName ?? ""}
                  onChange={(e) => patch({ displayName: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} style={{ fontFamily: MONO }}>
                  Hint <span className="text-navy-300">· interaction prompt</span>
                </label>
                <input
                  className={inputCls}
                  style={{ fontFamily: SERIF }}
                  value={content.hint ?? ""}
                  onChange={(e) => patch({ hint: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} style={{ fontFamily: MONO }}>
                  Aria label <span className="text-navy-300">· screen-reader description</span>
                </label>
                <textarea
                  className={inputCls}
                  style={{ fontFamily: SERIF }}
                  rows={3}
                  value={content.ariaLabel ?? ""}
                  onChange={(e) => patch({ ariaLabel: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Annotations */}
          {slots.includes("annotations") &&
            content.annotations &&
            content.annotations.length > 0 && (
              <section className="rounded-2xl border border-navy-200/80 bg-white p-5">
                <SectionTitle>
                  Annotations <Count>{content.annotations.length}</Count>
                </SectionTitle>
                <div className="space-y-5">
                  {content.annotations.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-xl border border-navy-100 bg-navy-50/40 p-4"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-[11px] font-semibold text-white"
                          style={{ fontFamily: MONO, background: a.color || "#c98e4f" }}
                        >
                          {a.id}
                        </span>
                        {a.anchor && (
                          <span
                            className="text-[9.5px] uppercase tracking-[0.16em] text-navy-300"
                            style={{ fontFamily: MONO }}
                          >
                            anchor {a.anchor.x},{a.anchor.y}
                            {a.color ? ` · ${a.color}` : ""} · positioned in code
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        <FieldRow label="Title">
                          <input
                            className={inputCls}
                            style={{ fontFamily: SERIF }}
                            value={a.title}
                            onChange={(e) =>
                              updateAnnotation(a.id, "title", e.target.value)
                            }
                          />
                        </FieldRow>
                        {showAnnotationSubtitles && (
                          <FieldRow label="Subtitle">
                            <input
                              className={inputCls}
                              style={{ fontFamily: SERIF }}
                              value={a.subtitle}
                              onChange={(e) =>
                                updateAnnotation(a.id, "subtitle", e.target.value)
                              }
                            />
                          </FieldRow>
                        )}
                        <FieldRow label="Body">
                          <textarea
                            className={inputCls}
                            style={{ fontFamily: SERIF }}
                            rows={3}
                            value={a.body}
                            onChange={(e) =>
                              updateAnnotation(a.id, "body", e.target.value)
                            }
                          />
                        </FieldRow>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Captions */}
          {slots.includes("captions") &&
            content.captions &&
            content.captions.length > 0 && (
              <section className="rounded-2xl border border-navy-200/80 bg-white p-5">
                <SectionTitle>
                  Captions <Count>{content.captions.length}</Count>
                </SectionTitle>
                <div className="space-y-3">
                  {content.captions.map((c) => (
                    <FieldRow key={c.id} label={c.id}>
                      <textarea
                        className={inputCls}
                        style={{ fontFamily: SERIF }}
                        rows={2}
                        value={c.text}
                        onChange={(e) => updateCaption(c.id, e.target.value)}
                      />
                    </FieldRow>
                  ))}
                </div>
              </section>
            )}

          {/* Prose */}
          {slots.includes("prose") && content.prose && content.prose.length > 0 && (
            <section className="rounded-2xl border border-navy-200/80 bg-white p-5">
              <SectionTitle>
                Prose <Count>{content.prose.length}</Count>
              </SectionTitle>
              <div className="space-y-5">
                {content.prose.map((block) => (
                  <div key={block.id}>
                    <div
                      className="mb-2 text-[9.5px] uppercase tracking-[0.16em] text-navy-300"
                      style={{ fontFamily: MONO }}
                    >
                      {block.id}
                    </div>
                    <div className="space-y-2">
                      {block.paragraphs.map((p, i) => (
                        <textarea
                          key={i}
                          className={inputCls}
                          style={{ fontFamily: SERIF }}
                          rows={3}
                          value={p}
                          onChange={(e) => updateProse(block.id, i, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <span
              className="text-[10px] uppercase tracking-[0.16em] text-navy-300"
              style={{ fontFamily: MONO }}
            >
              {group ? `${group} · ` : ""}{plateId}
            </span>
            <button
              type="button"
              onClick={onDiscard}
              disabled={source !== "draft"}
              className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-rose-500 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:text-navy-300"
              style={{ fontFamily: MONO }}
            >
              Discard draft
            </button>
          </div>
        </div>

        {/* ---- Live preview ---- */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <PlatePreview content={content} previewPath={previewPath} />
          <p
            className="mt-3 px-1 text-[11px] italic leading-relaxed text-navy-400"
            style={{ fontFamily: SERIF }}
          >
            This previews the copy. The rendered plate visual updates on the live
            page after you publish.
          </p>
        </div>
      </main>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-navy-500"
      style={{ fontFamily: MONO }}
    >
      {children}
    </h2>
  )
}

function Count({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-gold-100 px-1.5 py-0.5 text-[9.5px] text-gold-700">
      {children}
    </span>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="mb-1 block text-[9.5px] font-semibold uppercase tracking-[0.18em] text-navy-400"
        style={{ fontFamily: MONO }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}
