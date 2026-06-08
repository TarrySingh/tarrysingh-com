"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import LinkExt from "@tiptap/extension-link"
import Typography from "@tiptap/extension-typography"
import Image from "@tiptap/extension-image"
import { htmlToMarkdown, markdownToEditorHtml } from "@/lib/studio/serialize"
import katex from "katex"
import type { AIFrontmatterSuggestion } from "@/lib/studio/ai"
import { MermaidDiagram } from "@/components/blog/MermaidDiagram"
import { SERIES, SERIES_KEYS, type SeriesKey } from "@/lib/blog/series"
import { HistoryPane } from "./HistoryPane"
import {
  type DispatchFrontmatter,
  type DispatchCategory,
  slugifyTitle,
  SLUG_RE,
} from "@/lib/studio/types"

interface Props {
  initialSlug: string | null
  initialFrontmatter: DispatchFrontmatter
  initialBody: string
}

type SaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: string }
  | { kind: "error"; message: string }

type PublishStatus =
  | { kind: "idle" }
  | { kind: "publishing" }
  | { kind: "published"; blogUrl: string; commitUrl: string }
  | { kind: "error"; message: string }

type AIStatus =
  | { kind: "idle" }
  | { kind: "running"; action: "continue" | "rewrite" }
  | { kind: "done"; output: string; thinking?: string; action: "continue" | "rewrite" }
  | { kind: "error"; message: string }

type FrontmatterAIStatus =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "done"; suggestion: AIFrontmatterSuggestion; thinking?: string }
  | { kind: "error"; message: string; hint?: string; wordCount?: number }

type UploadStatus =
  | { kind: "idle" }
  | { kind: "uploading"; filename: string; queued: number; total: number }
  | { kind: "error"; message: string; hint?: string }

type HeroAIStatus =
  | { kind: "idle" }
  | { kind: "running" }
  | {
      kind: "done"
      url: string
      prompt: string
      model: string
      provider: string
      durationMs: number
      bytesUploaded: number
      thinking?: string
    }
  | { kind: "error"; message: string; hint?: string; debug?: string }

// Near-instant autosave: save ~1s after the last keystroke. Short
// enough to feel continuous (you never lose work mid-edit), long
// enough not to hammer the save endpoint on every character. The
// empty-body guard in save() still prevents an autosave from wiping a
// draft. (Was 4000ms — tightened Sprint 11 per the live-edit ask.)
const AUTOSAVE_DELAY_MS = 1000

const CATEGORIES: DispatchCategory[] = ["Essays", "Notes", "Studio"]

export function StudioEditor({
  initialSlug,
  initialFrontmatter,
  initialBody,
}: Props) {
  const router = useRouter()
  const [slug, setSlug] = useState(initialSlug ?? "")
  const [slugTouched, setSlugTouched] = useState(initialSlug !== null)
  const [frontmatter, setFrontmatter] = useState<DispatchFrontmatter>(initialFrontmatter)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ kind: "idle" })
  const [publishStatus, setPublishStatus] = useState<PublishStatus>({ kind: "idle" })
  const [aiStatus, setAIStatus] = useState<AIStatus>({ kind: "idle" })
  const [showPreview, setShowPreview] = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const [rewriteInstruction, setRewriteInstruction] = useState("")
  const [frontmatterAIStatus, setFrontmatterAIStatus] = useState<FrontmatterAIStatus>({ kind: "idle" })
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ kind: "idle" })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [heroAIStatus, setHeroAIStatus] = useState<HeroAIStatus>({ kind: "idle" })
  const [showHistory, setShowHistory] = useState(false)

  const initialHtml = useMemo(
    () => markdownToEditorHtml(initialBody),
    [initialBody],
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Typography,
      LinkExt.configure({ openOnClick: false, autolink: false }),
      Placeholder.configure({
        placeholder: "Open with the claim. A reader who doesn't scroll past should still know what you're saying.",
      }),
      CharacterCount.configure({ limit: 100000 }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "studio-image",
        },
      }),
    ],
    content: initialHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "studio-prose focus:outline-none min-h-[60vh]",
      },
    },
  })

  // Auto-derive slug from title until the user manually edits it.
  useEffect(() => {
    if (slugTouched) return
    const candidate = slugifyTitle(frontmatter.title)
    if (candidate && candidate !== slug) setSlug(candidate)
  }, [frontmatter.title, slugTouched, slug])

  const wordCount = editor?.storage.characterCount?.words?.() ?? 0
  const charCount = editor?.storage.characterCount?.characters?.() ?? 0
  const readingTimeMin = Math.max(1, Math.round(wordCount / 220))

  // Autosave — debounced. The trigger has empty deps so it stays
  // referentially stable (otherwise editor.on("update", handler)
  // would re-subscribe on every render). The save() function is
  // routed through a ref so the timer always calls the *latest*
  // version with up-to-date slug + frontmatter — avoids the
  // stale-closure bug that silently aborted Stage B B4.
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveRef = useRef<(opts?: { silent?: boolean }) => Promise<boolean>>(
    () => Promise.resolve(false),
  )
  const triggerAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(
      () => void saveRef.current({ silent: true }),
      AUTOSAVE_DELAY_MS,
    )
  }, [])

  useEffect(() => {
    if (!editor) return
    const handler = () => triggerAutosave()
    editor.on("update", handler)
    return () => {
      editor.off("update", handler)
    }
  }, [editor, triggerAutosave])

  // CRITICAL: do NOT autosave on mount. The previous `useEffect(() =>
  // triggerAutosave(), [frontmatter, slug])` fired on initial render too —
  // before the Tiptap editor finished loading `initialHtml` from the
  // server-side draft. Result: 4 seconds after mount, autosave ran with an
  // empty editor and overwrote the saved body with "". This wiped a 387-
  // word draft during Stage B B4 UAT (2026-05-14).
  //
  // Autosave now triggers ONLY from real user input:
  //   - editor.on("update")            — typing in the body (above)
  //   - setFm() via the frontmatter inputs (below)
  //   - the slug input's onChange      — wired in FrontmatterForm via setSlug
  function setFm<K extends keyof DispatchFrontmatter>(key: K, value: DispatchFrontmatter[K]) {
    setFrontmatter((prev) => ({ ...prev, [key]: value }))
    triggerAutosave()
  }

  const getCurrentBodyMarkdown = useCallback((): string => {
    if (!editor) return ""
    return htmlToMarkdown(editor.getHTML()).trim()
  }, [editor])

  const save = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false
      if (!slug || !SLUG_RE.test(slug)) {
        if (!silent) setSaveStatus({ kind: "error", message: "Choose a valid slug (lowercase letters, digits, hyphens)." })
        return false
      }
      if (!frontmatter.title.trim()) {
        if (!silent) setSaveStatus({ kind: "error", message: "Title is required before saving." })
        return false
      }
      const body = getCurrentBodyMarkdown()
      // Belt-and-braces: never overwrite an existing-draft's body with an
      // empty string from an autosave. If the user genuinely deletes the
      // whole body they can save manually; silent autosave never wipes.
      if (silent && initialSlug && body.length === 0) {
        return false
      }
      setSaveStatus({ kind: "saving" })
      try {
        const res = await fetch("/api/studio/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, frontmatter, body }),
        })
        const j = (await res.json()) as { ok: boolean; error?: string; savedAt?: string }
        if (!res.ok || !j.ok) {
          setSaveStatus({ kind: "error", message: j.error ?? `save_failed_${res.status}` })
          return false
        }
        setSaveStatus({ kind: "saved", at: j.savedAt ?? new Date().toISOString() })
        // If we just saved a freshly-named draft, navigate to its canonical URL.
        if (!initialSlug && slug) {
          router.replace(`/studio/editor/${slug}`)
        }
        return true
      } catch (err) {
        setSaveStatus({
          kind: "error",
          message: err instanceof Error ? err.message : "network_error",
        })
        return false
      }
    },
    [slug, frontmatter, getCurrentBodyMarkdown, initialSlug, router],
  )

  // Keep saveRef pointing at the latest save() so debounced autosave
  // timers don't fire with stale slug/frontmatter values.
  useEffect(() => {
    saveRef.current = save
  }, [save])

  async function onPublish() {
    const saved = await save({ silent: false })
    if (!saved) return
    // Streamlined "Update live" path: an already-published post reopened
    // via Edit-this-post carries was_published=true. Updating it is a
    // deliberate one-tap action — the content is already public, so skip
    // the confirm dialog. A first-time publish to a brand-new
    // /blog/<slug> still confirms, since that exposes a new public URL.
    const isUpdate = frontmatter.was_published === true
    if (
      !isUpdate &&
      !confirm(`Publish "${frontmatter.title}" to www.tarrysingh.com/blog/${slug}?\n\nThis commits straight to main.`)
    ) {
      return
    }
    setPublishStatus({ kind: "publishing" })
    try {
      const res = await fetch("/api/studio/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
      const j = (await res.json()) as
        | { ok: true; blogUrl: string; commitUrl: string }
        | { ok: false; error: string }
      if (!res.ok || !j.ok) {
        setPublishStatus({
          kind: "error",
          message: (j as { error?: string }).error ?? `publish_failed_${res.status}`,
        })
        return
      }
      setPublishStatus({ kind: "published", blogUrl: j.blogUrl, commitUrl: j.commitUrl })
    } catch (err) {
      setPublishStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "network_error",
      })
    }
  }

  async function onAIContinue() {
    if (!editor) return
    const html = editor.getHTML()
    const body = htmlToMarkdown(html)
    const selFrom = editor.state.selection.from
    const docSize = editor.state.doc.content.size
    const beforeText = editor.state.doc.textBetween(0, selFrom, "\n\n")
    const afterText = editor.state.doc.textBetween(selFrom, docSize, "\n\n")

    setAIStatus({ kind: "running", action: "continue" })
    try {
      const res = await fetch("/api/studio/ai/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullDocument: body, beforeCursor: beforeText, afterCursor: afterText }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) {
        setAIStatus({ kind: "error", message: j.error ?? `ai_failed_${res.status}` })
        return
      }
      // Insert at cursor.
      const insertHtml = markdownToEditorHtml(j.output)
      editor.chain().focus().insertContent(insertHtml).run()
      setAIStatus({ kind: "done", output: j.output, thinking: j.thinking, action: "continue" })
    } catch (err) {
      setAIStatus({ kind: "error", message: err instanceof Error ? err.message : "network_error" })
    }
  }

  // Upload one or more image files to /api/studio/upload, then insert
  // each at the current cursor position. Used by drop, paste, and the
  // click-to-pick toolbar button. Files arrive in user-perceived order.
  const uploadAndInsertImagesRef = useRef<(files: File[]) => Promise<void>>(
    async () => {},
  )

  async function uploadAndInsertImages(files: File[]) {
    if (!editor || files.length === 0) return
    const imageFiles = files.filter((f) => f.type.startsWith("image/"))
    if (imageFiles.length === 0) return
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      setUploadStatus({
        kind: "uploading",
        filename: file.name,
        queued: i,
        total: imageFiles.length,
      })
      const form = new FormData()
      form.append("file", file)
      form.append("alt", file.name.replace(/\.[a-z0-9]+$/i, ""))
      try {
        const res = await fetch("/api/studio/upload", {
          method: "POST",
          body: form,
        })
        const j = await res.json()
        if (!res.ok || !j.ok) {
          setUploadStatus({
            kind: "error",
            message: j.error ?? `upload_failed_${res.status}`,
            hint: j.hint,
          })
          return // bail on first failure; queued files don't auto-retry
        }
        editor.chain().focus().setImage({ src: j.url, alt: j.alt || file.name }).run()
      } catch (err) {
        setUploadStatus({
          kind: "error",
          message: err instanceof Error ? err.message : "network_error",
        })
        return
      }
    }
    setUploadStatus({ kind: "idle" })
    triggerAutosave()
  }

  // Keep the ref pointing at the latest closure so the editor.view.dom
  // listeners below always call up-to-date editor state.
  useEffect(() => {
    uploadAndInsertImagesRef.current = uploadAndInsertImages
  })

  // Wire native drop/paste on the editor DOM. Tiptap's editorProps
  // handleDrop/handlePaste would also work, but the ref-via-closure
  // dance there is uglier than this useEffect.
  useEffect(() => {
    if (!editor) return
    const dom = editor.view.dom

    function onDrop(e: DragEvent) {
      const files = Array.from(e.dataTransfer?.files ?? [])
      const images = files.filter((f) => f.type.startsWith("image/"))
      if (images.length === 0) return
      e.preventDefault()
      void uploadAndInsertImagesRef.current(images)
    }

    function onPaste(e: ClipboardEvent) {
      const items = Array.from(e.clipboardData?.items ?? [])
      const files: File[] = []
      for (const item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const f = item.getAsFile()
          if (f) files.push(f)
        }
      }
      if (files.length === 0) return
      e.preventDefault()
      void uploadAndInsertImagesRef.current(files)
    }

    dom.addEventListener("drop", onDrop)
    dom.addEventListener("paste", onPaste)
    return () => {
      dom.removeEventListener("drop", onDrop)
      dom.removeEventListener("paste", onPaste)
    }
  }, [editor])

  function onPickImage() {
    fileInputRef.current?.click()
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = "" // allow re-picking the same file
    if (files.length > 0) void uploadAndInsertImages(files)
  }

  async function onSuggestFrontmatter() {
    if (!editor) return
    const body = htmlToMarkdown(editor.getHTML())
    setFrontmatterAIStatus({ kind: "running" })
    try {
      const res = await fetch("/api/studio/ai/frontmatter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: frontmatter.title, body }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) {
        setFrontmatterAIStatus({
          kind: "error",
          message: j.error ?? `ai_failed_${res.status}`,
          hint: j.hint,
          wordCount: j.wordCount,
        })
        return
      }
      setFrontmatterAIStatus({ kind: "done", suggestion: j.suggestion, thinking: j.thinking })
    } catch (err) {
      setFrontmatterAIStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "network_error",
      })
    }
  }

  function applyFrontmatterSuggestion() {
    if (frontmatterAIStatus.kind !== "done") return
    const s = frontmatterAIStatus.suggestion
    setFrontmatter((prev) => ({
      ...prev,
      category: s.category,
      excerpt: s.excerpt,
      tags: s.tags,
    }))
    triggerAutosave()
    setFrontmatterAIStatus({ kind: "idle" })
  }

  function dismissFrontmatterSuggestion() {
    setFrontmatterAIStatus({ kind: "idle" })
  }

  async function onGenerateHero(customPrompt?: string) {
    setHeroAIStatus({ kind: "running" })
    try {
      const res = await fetch("/api/studio/ai/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: frontmatter.title,
          excerpt: frontmatter.excerpt || undefined,
          category: frontmatter.category,
          customPrompt: customPrompt || undefined,
        }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) {
        setHeroAIStatus({
          kind: "error",
          message: j.error ?? `hero_failed_${res.status}`,
          hint: j.hint,
          debug: j.debug,
        })
        return
      }
      setHeroAIStatus({
        kind: "done",
        url: j.url,
        prompt: j.prompt,
        model: j.model,
        provider: j.provider,
        durationMs: j.durationMs,
        bytesUploaded: j.bytesUploaded,
        thinking: j.thinking,
      })
    } catch (err) {
      setHeroAIStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "network_error",
      })
    }
  }

  function applyHero() {
    if (heroAIStatus.kind !== "done") return
    setFrontmatter((prev) => ({ ...prev, hero: heroAIStatus.url }))
    triggerAutosave()
    setHeroAIStatus({ kind: "idle" })
  }

  function dismissHero() {
    setHeroAIStatus({ kind: "idle" })
  }

  async function onAIRewrite() {
    if (!editor) return
    const { from, to } = editor.state.selection
    if (from === to) {
      setAIStatus({ kind: "error", message: "Select a passage first." })
      return
    }
    const selectionText = editor.state.doc.textBetween(from, to, "\n\n")
    const docSize = editor.state.doc.content.size
    const contextBefore = editor.state.doc.textBetween(Math.max(0, from - 600), from, "\n\n")
    const contextAfter = editor.state.doc.textBetween(to, Math.min(docSize, to + 600), "\n\n")
    const surroundingContext = `${contextBefore}\n\n[SELECTION]\n\n${contextAfter}`

    setAIStatus({ kind: "running", action: "rewrite" })
    try {
      const res = await fetch("/api/studio/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selection: selectionText,
          instruction: rewriteInstruction || undefined,
          surroundingContext,
        }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) {
        setAIStatus({ kind: "error", message: j.error ?? `ai_failed_${res.status}` })
        return
      }
      const replaceHtml = markdownToEditorHtml(j.output)
      editor.chain().focus().deleteRange({ from, to }).insertContent(replaceHtml).run()
      setAIStatus({ kind: "done", output: j.output, thinking: j.thinking, action: "rewrite" })
    } catch (err) {
      setAIStatus({ kind: "error", message: err instanceof Error ? err.message : "network_error" })
    }
  }

  const previewHtml = useMemo(() => {
    if (!editor) return ""
    return renderMathInHtml(editor.getHTML())
  }, [editor])

  // Sprint 11 — resizable composer/preview split (lg+ only).
  // `splitPct` = width of the composer pane as a % of the row; the
  // preview takes the rest. Persisted to localStorage so the layout
  // sticks across sessions. Clamped to 30–75 so neither pane can
  // collapse to an unreadable ribbon (the old fixed 1fr_1fr is why
  // the preview sometimes felt like a narrow tall column).
  const SPLIT_MIN = 30
  const SPLIT_MAX = 75
  const splitContainerRef = useRef<HTMLDivElement | null>(null)
  const [splitPct, setSplitPct] = useState(50)
  const [splitDragging, setSplitDragging] = useState(false)
  const splitPctRef = useRef(splitPct)
  splitPctRef.current = splitPct

  useEffect(() => {
    try {
      const saved = localStorage.getItem("studio:splitPct")
      if (saved) {
        const n = Number(saved)
        if (Number.isFinite(n)) setSplitPct(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, n)))
      }
    } catch {
      /* localStorage unavailable — keep the 50% default */
    }
  }, [])

  useEffect(() => {
    if (!splitDragging) return
    function onMove(e: PointerEvent) {
      const el = splitContainerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width === 0) return
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      setSplitPct(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, Math.round(pct))))
    }
    function onUp() {
      setSplitDragging(false)
      try {
        localStorage.setItem("studio:splitPct", String(splitPctRef.current))
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [splitDragging])

  // Double-click the divider to reset to a clean 50/50.
  const resetSplit = useCallback(() => {
    setSplitPct(50)
    try {
      localStorage.setItem("studio:splitPct", "50")
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #fbf7ec 0%, #f5efe1 100%)",
      }}
    >
      <header className="sticky top-0 z-20 border-b border-navy-200/80 bg-[rgba(251,247,236,0.92)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 lg:px-8">
          <Link
            href="/studio"
            className="inline-flex h-11 items-center rounded-full px-3 text-[10.5px] font-semibold uppercase tracking-[0.24em] text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            aria-label="Back to Studio"
          >
            <span className="sm:hidden text-base leading-none">←</span>
            <span className="hidden sm:inline tracking-[0.28em]">← Studio</span>
          </Link>
          <span className="hidden sm:inline-block h-4 w-px bg-navy-200/60" />
          <SaveBadge status={saveStatus} />
          {frontmatter.was_published ? (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-gold-300 bg-gold-50/70 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-gold-700"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
              title="Editing a published post. Edits autosave to the draft; click Update live to push them to the blog."
            >
              ● Live post
            </span>
          ) : null}
          <span className="flex-1" />
          <span
            className="hidden md:inline-block text-[10px] uppercase tracking-[0.22em] text-navy-400"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
          >
            {wordCount} words · {readingTimeMin} min · {charCount} chars
          </span>
          <button
            onClick={() => setShowPreview((v) => !v)}
            aria-label={showPreview ? "Hide preview" : "Show preview"}
            title="Preview"
            className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-full border border-navy-200 bg-white px-3 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
          >
            <span className="sm:hidden text-base">{showPreview ? "✕" : "👁"}</span>
            <span className="hidden sm:inline">{showPreview ? "Hide preview" : "Preview"}</span>
          </button>
          {slug ? (
            <button
              onClick={() => setShowHistory(true)}
              aria-label="Version history"
              title="Version history"
              className="hidden md:inline-flex h-11 min-w-[44px] items-center justify-center rounded-full border border-navy-200 bg-white px-3 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            >
              History
            </button>
          ) : null}
          <button
            onClick={() => void save()}
            disabled={saveStatus.kind === "saving"}
            aria-label="Save draft"
            className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-full border border-navy-200 bg-white px-3 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50 disabled:opacity-50"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
          >
            <span className="sm:hidden">💾</span>
            <span className="hidden sm:inline">Save draft</span>
          </button>
          <button
            onClick={() => void onPublish()}
            disabled={publishStatus.kind === "publishing"}
            aria-label={
              publishStatus.kind === "publishing"
                ? frontmatter.was_published
                  ? "Updating live post…"
                  : "Publishing…"
                : frontmatter.was_published
                  ? "Update live post"
                  : "Publish"
            }
            title={
              frontmatter.was_published
                ? "Commit your edits to the live post (one tap, no re-confirm)"
                : "Publish to the blog"
            }
            className="inline-flex h-11 items-center justify-center rounded-full border border-gold-400 bg-navy-900 px-3 sm:px-4 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-navy-800 disabled:opacity-50"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
          >
            {publishStatus.kind === "publishing"
              ? frontmatter.was_published
                ? "Updating…"
                : "Publishing…"
              : frontmatter.was_published
                ? "Update live"
                : "Publish"}
          </button>
        </div>
        {publishStatus.kind === "published" ? (
          <div
            className="mx-auto max-w-6xl px-6 pb-3 lg:px-8 text-xs"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
          >
            <span className="text-gold-700">{frontmatter.was_published ? "✓ Updated live post" : "✓ Published"}</span>
            <span className="text-navy-300"> · </span>
            <a href={publishStatus.blogUrl} target="_blank" rel="noopener noreferrer" className="text-navy-700 underline decoration-gold-300 hover:decoration-gold-500">
              {publishStatus.blogUrl}
            </a>
            <span className="text-navy-300"> · </span>
            <a href={publishStatus.commitUrl} target="_blank" rel="noopener noreferrer" className="text-navy-500 underline decoration-navy-200 hover:decoration-navy-400">
              commit
            </a>
            <span className="text-navy-300"> (Vercel will deploy in ~90 s)</span>
          </div>
        ) : null}
        {publishStatus.kind === "error" ? (
          <div className="mx-auto max-w-6xl px-6 pb-3 lg:px-8 text-xs text-rose-600"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
          >
            ✗ Publish failed: {publishStatus.message}
          </div>
        ) : null}
      </header>

      {/* Sprint 6 — sticky touch toolbar (mobile only) */}
      <TouchToolbar editor={editor} onPickImage={onPickImage} />

      {/* Sprint 7 — version-history pane (toggled from header) */}
      {showHistory && slug ? (
        <HistoryPane
          slug={slug}
          onClose={() => setShowHistory(false)}
          onReverted={() => {
            // Drop the pane; the parent could refetch the draft body here,
            // but for v1 we let Tarry reload the editor manually so a partial
            // unsaved edit isn't silently wiped.
            setShowHistory(false)
          }}
        />
      ) : null}

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-8 pb-36 sm:pb-24 lg:px-8">
        {/* Sprint 6 — mobile word-count strip (header hides this below md) */}
        <div
          className="mb-4 md:hidden flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-navy-400"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          <span>{wordCount} words · {readingTimeMin} min</span>
          <span>{charCount} chars</span>
        </div>
        <div
          ref={splitContainerRef}
          className={`${showPreview ? "lg:flex lg:items-start" : ""} ${splitDragging ? "select-none" : ""}`}
          style={showPreview ? ({ "--split": `${splitPct}%` } as React.CSSProperties) : undefined}
        >
          {/* — composer — */}
          <section className={showPreview ? "space-y-6 lg:min-w-0 lg:shrink-0 lg:grow-0 lg:basis-[var(--split)] lg:pr-4" : "space-y-6"}>
            <FrontmatterForm
              slug={slug}
              setSlug={(s) => {
                setSlug(s)
                setSlugTouched(true)
                triggerAutosave()
              }}
              frontmatter={frontmatter}
              setFm={setFm}
              frontmatterAIStatus={frontmatterAIStatus}
              onSuggestFrontmatter={onSuggestFrontmatter}
              applyFrontmatterSuggestion={applyFrontmatterSuggestion}
              dismissFrontmatterSuggestion={dismissFrontmatterSuggestion}
              heroAIStatus={heroAIStatus}
              onGenerateHero={onGenerateHero}
              applyHero={applyHero}
              dismissHero={dismissHero}
            />

            <div className="rounded-2xl border border-navy-200/80 bg-white p-4 sm:p-6 md:p-8">
              <EditorToolbar
                onPickImage={onPickImage}
                uploadStatus={uploadStatus}
              />
              <EditorContent editor={editor} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/avif"
                multiple
                hidden
                onChange={onFileInputChange}
              />
            </div>

            <AIPanel
              status={aiStatus}
              showThinking={showThinking}
              setShowThinking={setShowThinking}
              rewriteInstruction={rewriteInstruction}
              setRewriteInstruction={setRewriteInstruction}
              onContinue={onAIContinue}
              onRewrite={onAIRewrite}
            />
          </section>

          {/* — live preview — desktop: resizable side pane; mobile: full-screen overlay */}
          {showPreview ? (
            <>
              {/* Drag handle — lg+ only. Drag to resize, double-click to reset 50/50. */}
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize editor and preview"
                title="Drag to resize · double-click to reset"
                onPointerDown={(e) => {
                  e.preventDefault()
                  setSplitDragging(true)
                }}
                onDoubleClick={resetSplit}
                className="group hidden lg:flex lg:w-4 lg:shrink-0 lg:cursor-col-resize lg:self-stretch items-center justify-center"
              >
                <span
                  className={`h-16 w-1 rounded-full transition-colors ${splitDragging ? "bg-gold-500" : "bg-navy-200 group-hover:bg-gold-400"}`}
                />
              </div>
              {/* Desktop: preview grows to fill the remaining width */}
              <aside className="hidden lg:block lg:grow lg:basis-0 lg:min-w-0 space-y-6">
                <PreviewPane
                  title={frontmatter.title}
                  excerpt={frontmatter.excerpt}
                  category={frontmatter.category}
                  date={frontmatter.date}
                  bodyHtml={previewHtml}
                />
              </aside>
              {/* Mobile: full-screen overlay below the sticky header */}
              <div
                className="lg:hidden fixed inset-0 z-30 overflow-y-auto bg-[#fbf7ec] pt-16 pb-32 px-4"
                role="dialog"
                aria-label="Live preview"
                aria-modal="true"
              >
                <div className="mx-auto max-w-2xl">
                  <div
                    className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-gold-700"
                    style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
                  >
                    Live preview
                    <span className="h-px flex-1 bg-navy-100" />
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-navy-200 bg-white px-4 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50"
                      style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
                    >
                      ✕ Close
                    </button>
                  </div>
                  <PreviewPane
                    title={frontmatter.title}
                    excerpt={frontmatter.excerpt}
                    category={frontmatter.category}
                    date={frontmatter.date}
                    bodyHtml={previewHtml}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>

      <style>{`
        .studio-prose {
          font-family: var(--font-serif), 'IBM Plex Serif', Georgia, serif;
          font-size: 18px;
          line-height: 1.78;
          color: #0f172a;
        }
        .studio-prose p { margin: 0 0 1.1em 0; }
        .studio-prose h2 {
          font-family: var(--font-display), 'Gloock', serif;
          font-size: 28px;
          margin: 1.6em 0 0.5em;
          color: #0f172a;
        }
        .studio-prose h3 {
          font-family: var(--font-serif), 'IBM Plex Serif', serif;
          font-size: 22px;
          font-weight: 600;
          margin: 1.4em 0 0.4em;
          color: #0f172a;
        }
        .studio-prose blockquote {
          border-left: 2px solid #b45309;
          padding-left: 1.2em;
          font-style: italic;
          color: #475569;
          margin: 1.2em 0;
        }
        .studio-prose code {
          font-family: var(--font-mono), 'IBM Plex Mono', Menlo, monospace;
          font-size: 0.92em;
          background: #f8fafc;
          padding: 2px 6px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }
        .studio-prose pre {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 20px;
          overflow-x: auto;
        }
        .studio-prose pre code { background: none; border: none; padding: 0; }
        .studio-prose a {
          color: #b45309;
          text-decoration: underline;
          text-decoration-color: #fcd34d;
          text-decoration-thickness: 2px;
          text-underline-offset: 4px;
        }
        .studio-prose strong { font-weight: 600; }
        .studio-prose ul, .studio-prose ol { padding-left: 1.4em; margin: 0.8em 0; }
        .studio-prose li { margin: 0.3em 0; }
        .studio-prose hr {
          border: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(180,134,11,0.35), transparent);
          margin: 2em 0;
        }
        .studio-prose img,
        .studio-image {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 1.6em auto;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
        }
        .studio-prose .ProseMirror-selectednode.studio-image,
        .studio-prose img.ProseMirror-selectednode {
          outline: 2px solid #b45309;
          outline-offset: 4px;
        }
        .studio-prose .is-empty::before {
          color: #94a3b8;
          font-style: italic;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────

/**
 * Sprint 6 — sticky touch toolbar.
 *
 * Renders only when the viewport is touch-driven (matchMedia
 * `pointer: coarse`). Holds H2 / H3 / bold / italic / blockquote /
 * code / link / undo / redo / image. Each button is 44×44 minimum
 * (Apple HIG floor). Markdown shortcuts (`##` → H2, `**bold**`, etc.)
 * fail on most mobile keyboards because autocorrect intercepts the
 * surrounding characters — this toolbar replaces the shortcuts on
 * touch surfaces.
 *
 * Fixed to the bottom of the viewport, sitting above the iOS Safari
 * keyboard via env(safe-area-inset-bottom).
 */
function TouchToolbar({
  editor,
  onPickImage,
}: {
  editor: Editor | null
  onPickImage: () => void
}) {
  const [touchMode, setTouchMode] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mql = window.matchMedia("(pointer: coarse)")
    const update = () => setTouchMode(mql.matches)
    update()
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [])

  if (!touchMode || !editor) return null
  // Hoisted to local so nested arrow functions get narrowed-non-null.
  const ed: Editor = editor

  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    ed.isActive(name, attrs)

  const btnClass = (active: boolean) =>
    [
      "inline-flex h-11 w-11 items-center justify-center rounded-lg border text-[12px] font-semibold",
      "transition-colors",
      active
        ? "border-gold-400 bg-gold-50 text-gold-700"
        : "border-navy-200 bg-white text-navy-700 hover:bg-navy-50",
    ].join(" ")

  const onLink = () => {
    const previous = (ed.getAttributes("link").href as string | undefined) ?? ""
    const url = window.prompt("Link URL", previous)
    if (url === null) return
    if (url === "") {
      ed.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    ed.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-200/80 bg-[rgba(251,247,236,0.96)] backdrop-blur-md md:hidden"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.4rem)",
      }}
      role="toolbar"
      aria-label="Editor formatting toolbar"
    >
      <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2">
        <button
          type="button"
          aria-label="Heading 2"
          onClick={() => ed.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btnClass(isActive("heading", { level: 2 }))}
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          H2
        </button>
        <button
          type="button"
          aria-label="Heading 3"
          onClick={() => ed.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btnClass(isActive("heading", { level: 3 }))}
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          H3
        </button>
        <span className="h-6 w-px shrink-0 bg-navy-200" />
        <button
          type="button"
          aria-label="Bold"
          onClick={() => ed.chain().focus().toggleBold().run()}
          className={btnClass(isActive("bold"))}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          aria-label="Italic"
          onClick={() => ed.chain().focus().toggleItalic().run()}
          className={btnClass(isActive("italic"))}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          aria-label="Inline code"
          onClick={() => ed.chain().focus().toggleCode().run()}
          className={btnClass(isActive("code"))}
        >
          {"</>"}
        </button>
        <span className="h-6 w-px shrink-0 bg-navy-200" />
        <button
          type="button"
          aria-label="Blockquote"
          onClick={() => ed.chain().focus().toggleBlockquote().run()}
          className={btnClass(isActive("blockquote"))}
        >
          &ldquo;
        </button>
        <button
          type="button"
          aria-label="Bullet list"
          onClick={() => ed.chain().focus().toggleBulletList().run()}
          className={btnClass(isActive("bulletList"))}
        >
          •
        </button>
        <button
          type="button"
          aria-label="Numbered list"
          onClick={() => ed.chain().focus().toggleOrderedList().run()}
          className={btnClass(isActive("orderedList"))}
        >
          1.
        </button>
        <span className="h-6 w-px shrink-0 bg-navy-200" />
        <button
          type="button"
          aria-label="Link"
          onClick={onLink}
          className={btnClass(isActive("link"))}
        >
          🔗
        </button>
        <button
          type="button"
          aria-label="Insert image"
          onClick={onPickImage}
          className={btnClass(false)}
        >
          🖼
        </button>
        <span className="h-6 w-px shrink-0 bg-navy-200" />
        <button
          type="button"
          aria-label="Undo"
          onClick={() => ed.chain().focus().undo().run()}
          disabled={!ed.can().undo()}
          className={btnClass(false) + " disabled:opacity-40"}
        >
          ↶
        </button>
        <button
          type="button"
          aria-label="Redo"
          onClick={() => ed.chain().focus().redo().run()}
          disabled={!ed.can().redo()}
          className={btnClass(false) + " disabled:opacity-40"}
        >
          ↷
        </button>
      </div>
    </div>
  )
}

function EditorToolbar({
  onPickImage,
  uploadStatus,
}: {
  onPickImage: () => void
  uploadStatus: UploadStatus
}) {
  const mono = { fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" } as const
  const isUploading = uploadStatus.kind === "uploading"
  return (
    <div className="-mt-2 mb-4 flex items-center gap-3 border-b border-navy-100 pb-3">
      <button
        type="button"
        onClick={onPickImage}
        disabled={isUploading}
        title="Drop, paste, or click to upload an image (PNG / JPEG / WebP / SVG / GIF / AVIF, max 8 MiB)"
        className="rounded-full border border-navy-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50 disabled:opacity-50"
        style={mono}
      >
        {isUploading ? "Uploading…" : "+ Image"}
      </button>
      <span
        className="text-[10px] tracking-wide text-navy-400"
        style={mono}
      >
        drop · paste · click — Supabase Storage, content-addressed CDN
      </span>
      <span className="flex-1" />
      {isUploading ? (
        <span
          className="text-[10px] uppercase tracking-[0.22em] text-gold-700"
          style={mono}
        >
          {uploadStatus.queued + 1}/{uploadStatus.total} · {uploadStatus.filename}
        </span>
      ) : null}
      {uploadStatus.kind === "error" ? (
        <span
          className="text-[10px] uppercase tracking-[0.22em] text-rose-600"
          style={mono}
        >
          ✗ {uploadStatus.hint ?? uploadStatus.message}
        </span>
      ) : null}
    </div>
  )
}

function SaveBadge({ status }: { status: SaveStatus }) {
  const mono = { fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" } as const
  // Sprint 6 — short forms on mobile (the header is tight on a phone).
  if (status.kind === "idle")
    return (
      <span className="text-[10px] uppercase tracking-[0.22em] text-navy-300 truncate" style={mono} title="Ready">
        <span className="sm:hidden">●</span>
        <span className="hidden sm:inline">Ready</span>
      </span>
    )
  if (status.kind === "saving")
    return (
      <span className="text-[10px] uppercase tracking-[0.22em] text-navy-400 truncate" style={mono} title="Saving…">
        <span className="sm:hidden">↻</span>
        <span className="hidden sm:inline">Saving…</span>
      </span>
    )
  if (status.kind === "saved")
    return (
      <span className="text-[10px] uppercase tracking-[0.22em] text-gold-700 truncate" style={mono} title="Saved">
        <span className="sm:hidden">✓</span>
        <span className="hidden sm:inline">Saved</span>
      </span>
    )
  return (
    <span className="text-[10px] uppercase tracking-[0.22em] text-rose-600 truncate max-w-[10rem] sm:max-w-none" style={mono} title={`Save error: ${status.message}`}>
      <span className="sm:hidden">✗</span>
      <span className="hidden sm:inline">Save error: {status.message}</span>
    </span>
  )
}

function FrontmatterForm({
  slug,
  setSlug,
  frontmatter,
  setFm,
  frontmatterAIStatus,
  onSuggestFrontmatter,
  applyFrontmatterSuggestion,
  dismissFrontmatterSuggestion,
  heroAIStatus,
  onGenerateHero,
  applyHero,
  dismissHero,
}: {
  slug: string
  setSlug: (s: string) => void
  frontmatter: DispatchFrontmatter
  setFm: <K extends keyof DispatchFrontmatter>(k: K, v: DispatchFrontmatter[K]) => void
  frontmatterAIStatus: FrontmatterAIStatus
  onSuggestFrontmatter: () => void
  applyFrontmatterSuggestion: () => void
  dismissFrontmatterSuggestion: () => void
  heroAIStatus: HeroAIStatus
  onGenerateHero: (customPrompt?: string) => void
  applyHero: () => void
  dismissHero: () => void
}) {
  const isSuggesting = frontmatterAIStatus.kind === "running"
  return (
    <div className="rounded-2xl border border-navy-200/80 bg-white p-4 sm:p-6 md:p-7 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <label className="block text-[10px] uppercase tracking-[0.28em] text-navy-400 mb-2"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
          >Title</label>
          <input
            type="text"
            value={frontmatter.title}
            onChange={(e) => setFm("title", e.target.value)}
            placeholder="The piece begins with the claim."
            className="w-full bg-transparent text-2xl sm:text-3xl md:text-4xl tracking-tight focus:outline-none text-navy-900"
            style={{ fontFamily: "var(--font-display), 'Gloock', serif" }}
          />
        </div>
        <button
          type="button"
          onClick={onSuggestFrontmatter}
          disabled={isSuggesting}
          title="Ask Claude to propose category, excerpt, and tags from the body. Needs at least 200 words."
          className="mt-7 shrink-0 rounded-full border border-gold-300 bg-gold-50/60 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-700 transition-colors hover:bg-gold-100 disabled:opacity-50"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          {isSuggesting ? "Thinking…" : "✨ Suggest frontmatter"}
        </button>
      </div>

      {frontmatterAIStatus.kind === "error" ? (
        <div
          className="rounded-md border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-700"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          {frontmatterAIStatus.message === "body_too_short" && frontmatterAIStatus.hint
            ? frontmatterAIStatus.hint
            : frontmatterAIStatus.message}
        </div>
      ) : null}

      {frontmatterAIStatus.kind === "done" ? (
        <FrontmatterSuggestionBlock
          suggestion={frontmatterAIStatus.suggestion}
          current={frontmatter}
          onApply={applyFrontmatterSuggestion}
          onDismiss={dismissFrontmatterSuggestion}
        />
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.28em] text-navy-400 mb-2"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
          >Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-from-title"
            className="w-full rounded-md border border-navy-200 px-3 py-2 text-sm font-mono text-navy-900 focus:outline-none focus:border-gold-400"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-[0.28em] text-navy-400 mb-2"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
          >Category</label>
          <select
            value={frontmatter.category}
            onChange={(e) => setFm("category", e.target.value as DispatchCategory)}
            className="w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 focus:outline-none focus:border-gold-400"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-[0.28em] text-navy-400 mb-2"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >Excerpt (80–700 chars; also the LinkedIn body)</label>
        <textarea
          value={frontmatter.excerpt}
          onChange={(e) => setFm("excerpt", e.target.value)}
          rows={2}
          placeholder="One or two sentences that summarise the piece. Becomes the /blog index card and the LinkedIn post body."
          className="w-full rounded-md border border-navy-200 px-3 py-2 text-sm italic text-navy-700 focus:outline-none focus:border-gold-400 resize-y"
          style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
        />
        <p className="mt-1 text-[10px] text-navy-300"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          {frontmatter.excerpt.length} / 700 chars
        </p>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-[10px] uppercase tracking-[0.28em] text-navy-400 hover:text-navy-700"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          More frontmatter (hero, theme, series, cover, tags, linkedin_url)
        </summary>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] uppercase tracking-[0.28em] text-navy-400 mb-2"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            >Hero image URL</label>
            <input
              type="text"
              value={frontmatter.hero ?? ""}
              onChange={(e) => setFm("hero", e.target.value)}
              placeholder="/blog/hero-name.png or paste/generate below"
              className="w-full rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:outline-none focus:border-gold-400"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            />
            <HeroGeneratorBlock
              heroAIStatus={heroAIStatus}
              onGenerateHero={onGenerateHero}
              applyHero={applyHero}
              dismissHero={dismissHero}
              hasTitle={frontmatter.title.trim().length > 0}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.28em] text-navy-400 mb-2"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            >Theme</label>
            <select
              value={frontmatter.theme ?? "editorial"}
              onChange={(e) => setFm("theme", e.target.value as "editorial" | "studio")}
              className="w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 focus:outline-none focus:border-gold-400"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            >
              <option value="editorial">editorial (default)</option>
              <option value="studio">studio</option>
            </select>
          </div>
          <div className="col-span-2 grid grid-cols-[1fr_auto] gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.28em] text-navy-400 mb-2"
                style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
              >Series</label>
              <select
                value={frontmatter.series?.key ?? ""}
                onChange={(e) => {
                  const key = e.target.value
                  if (!key) {
                    setFm("series", undefined)
                    return
                  }
                  setFm("series", {
                    key: key as SeriesKey,
                    part: frontmatter.series?.part ?? 1,
                    ...(frontmatter.series?.total ? { total: frontmatter.series.total } : {}),
                  })
                }}
                className="w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 focus:outline-none focus:border-gold-400"
                style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
              >
                <option value="">— none —</option>
                {SERIES_KEYS.map((k) => (
                  <option key={k} value={k}>{SERIES[k].name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.28em] text-navy-400 mb-2"
                style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
              >Part</label>
              <input
                type="number"
                min={1}
                disabled={!frontmatter.series}
                value={frontmatter.series?.part ?? ""}
                onChange={(e) => {
                  if (!frontmatter.series) return
                  setFm("series", {
                    ...frontmatter.series,
                    part: Math.max(1, Number(e.target.value) || 1),
                  })
                }}
                className="w-20 rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:outline-none focus:border-gold-400 disabled:opacity-40"
                style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
              />
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] uppercase tracking-[0.28em] text-navy-400 mb-2"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            >Cover PNG (optional — omit for slug-deterministic cover)</label>
            <input
              type="text"
              value={frontmatter.cover ?? ""}
              onChange={(e) => setFm("cover", e.target.value || undefined)}
              placeholder="/blog/covers/<slug>.bespoke.png"
              className="w-full rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:outline-none focus:border-gold-400"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] uppercase tracking-[0.28em] text-navy-400 mb-2"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            >LinkedIn URL (optional, surfaces a "Discuss on LinkedIn" pill)</label>
            <input
              type="url"
              value={frontmatter.linkedin_url ?? ""}
              onChange={(e) => setFm("linkedin_url", e.target.value)}
              placeholder="https://linkedin.com/posts/..."
              className="w-full rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:outline-none focus:border-gold-400"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] uppercase tracking-[0.28em] text-navy-400 mb-2"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            >Tags (comma-separated)</label>
            <input
              type="text"
              value={(frontmatter.tags ?? []).join(", ")}
              onChange={(e) => setFm("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="studio, writing, ai"
              className="w-full rounded-md border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:outline-none focus:border-gold-400"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            />
          </div>
        </div>
      </details>
    </div>
  )
}

function AIPanel({
  status,
  showThinking,
  setShowThinking,
  rewriteInstruction,
  setRewriteInstruction,
  onContinue,
  onRewrite,
}: {
  status: AIStatus
  showThinking: boolean
  setShowThinking: (v: boolean) => void
  rewriteInstruction: string
  setRewriteInstruction: (v: string) => void
  onContinue: () => void
  onRewrite: () => void
}) {
  const isRunning = status.kind === "running"
  return (
    <div className="rounded-2xl border border-navy-200/80 bg-white p-4 sm:p-5 md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold-700"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          Studio · AI
        </span>
        <span className="h-px flex-1 bg-navy-100" />
        <span className="text-[10px] uppercase tracking-[0.22em] text-navy-300"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          Claude Opus · 4K extended thinking
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-[1fr_1fr_auto]">
        <button
          onClick={onContinue}
          disabled={isRunning}
          className="inline-flex h-11 items-center justify-center rounded-full border border-navy-200 bg-white px-4 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50 disabled:opacity-50"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          {isRunning && status.action === "continue" ? "Thinking…" : "Continue from cursor"}
        </button>
        <button
          onClick={onRewrite}
          disabled={isRunning}
          className="inline-flex h-11 items-center justify-center rounded-full border border-navy-200 bg-white px-4 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50 disabled:opacity-50"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          {isRunning && status.action === "rewrite" ? "Thinking…" : "Rewrite selection"}
        </button>
        <input
          type="text"
          value={rewriteInstruction}
          onChange={(e) => setRewriteInstruction(e.target.value)}
          placeholder="rewrite instruction (optional)"
          className="h-11 rounded-md border border-navy-200 px-3 text-sm text-navy-900 focus:outline-none focus:border-gold-400 sm:col-span-2 md:col-span-1"
          style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
        />
      </div>

      {status.kind === "error" ? (
        <p className="mt-3 text-xs text-rose-600"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          {status.message}
        </p>
      ) : null}

      {status.kind === "done" && status.thinking ? (
        <details className="mt-3" open={showThinking} onToggle={(e) => setShowThinking((e.target as HTMLDetailsElement).open)}>
          <summary className="cursor-pointer text-[10px] uppercase tracking-[0.28em] text-navy-400 hover:text-navy-700"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
          >
            Thinking trace ({status.thinking.length} chars)
          </summary>
          <pre className="mt-3 max-h-64 overflow-y-auto rounded-md bg-navy-50 p-3 text-xs leading-relaxed text-navy-700 whitespace-pre-wrap"
            style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
          >
            {status.thinking}
          </pre>
        </details>
      ) : null}
    </div>
  )
}

function FrontmatterSuggestionBlock({
  suggestion,
  current,
  onApply,
  onDismiss,
}: {
  suggestion: AIFrontmatterSuggestion
  current: DispatchFrontmatter
  onApply: () => void
  onDismiss: () => void
}) {
  const mono = { fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" } as const
  const serif = { fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" } as const
  const currentTags = current.tags ?? []
  const categoryChanges = current.category !== suggestion.category
  const excerptChanges = current.excerpt !== suggestion.excerpt
  const tagsChanges =
    currentTags.length !== suggestion.tags.length ||
    !currentTags.every((t, i) => t === suggestion.tags[i])

  return (
    <div className="rounded-xl border border-gold-200 bg-gold-50/30 p-4">
      <div className="mb-3 flex items-center gap-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold-700"
          style={mono}
        >
          ✨ Suggestion
        </span>
        <span className="h-px flex-1 bg-gold-200" />
        <button
          type="button"
          onClick={onApply}
          className="rounded-full border border-gold-400 bg-navy-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-navy-800"
          style={mono}
        >
          Apply all
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full border border-navy-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-600 transition-colors hover:bg-navy-50"
          style={mono}
        >
          Dismiss
        </button>
      </div>

      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.22em] text-navy-400" style={mono}>
            Category {categoryChanges ? <span className="text-gold-600">· change</span> : <span className="text-navy-300">· unchanged</span>}
          </dt>
          <dd className="mt-1 text-navy-800" style={mono}>
            {categoryChanges ? (
              <>
                <span className="text-navy-400 line-through">{current.category}</span>{" "}
                <span className="text-navy-300">→</span>{" "}
                <span className="font-semibold">{suggestion.category}</span>
              </>
            ) : (
              suggestion.category
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.22em] text-navy-400" style={mono}>
            Excerpt ({suggestion.excerpt.length} chars) {excerptChanges ? <span className="text-gold-600">· change</span> : <span className="text-navy-300">· unchanged</span>}
          </dt>
          <dd className="mt-1 italic text-navy-700" style={serif}>
            {suggestion.excerpt}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.22em] text-navy-400" style={mono}>
            Tags {tagsChanges ? <span className="text-gold-600">· change</span> : <span className="text-navy-300">· unchanged</span>}
          </dt>
          <dd className="mt-1 flex flex-wrap gap-1.5">
            {suggestion.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-navy-200 bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-navy-700"
                style={mono}
              >
                {t}
              </span>
            ))}
          </dd>
        </div>
      </dl>
      <p
        className="mt-3 text-[10px] uppercase tracking-[0.22em] text-navy-400"
        style={mono}
      >
        "Apply all" overwrites the three fields above. Title + slug are untouched.
      </p>
    </div>
  )
}

function HeroGeneratorBlock({
  heroAIStatus,
  onGenerateHero,
  applyHero,
  dismissHero,
  hasTitle,
}: {
  heroAIStatus: HeroAIStatus
  onGenerateHero: (customPrompt?: string) => void
  applyHero: () => void
  dismissHero: () => void
  hasTitle: boolean
}) {
  const mono = { fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" } as const
  const serif = { fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" } as const

  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [draftPrompt, setDraftPrompt] = useState("")

  const isRunning = heroAIStatus.kind === "running"
  const isDone = heroAIStatus.kind === "done"

  // When a generation completes, pre-fill the prompt editor with the
  // prompt that produced it — so "Edit prompt" gives the author the
  // current studio-voice prompt as a starting point, not a blank slate.
  useEffect(() => {
    if (heroAIStatus.kind === "done") {
      setDraftPrompt(heroAIStatus.prompt)
    } else if (heroAIStatus.kind === "idle") {
      setShowPromptEditor(false)
      setDraftPrompt("")
    }
  }, [heroAIStatus])

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onGenerateHero()}
          disabled={isRunning || !hasTitle}
          title={hasTitle ? "Synthesise a prompt + generate the hero image (FLUX schnell ~5–10 s, ~$0.003)" : "Add a title first."}
          className="rounded-full border border-gold-300 bg-gold-50/60 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-700 transition-colors hover:bg-gold-100 disabled:opacity-50 disabled:cursor-not-allowed"
          style={mono}
        >
          {isRunning ? "Generating…" : "✨ Generate hero"}
        </button>
        {isDone ? (
          <>
            <button
              type="button"
              onClick={applyHero}
              className="rounded-full border border-gold-400 bg-navy-900 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-navy-800"
              style={mono}
            >
              Use it
            </button>
            <button
              type="button"
              onClick={() => onGenerateHero()}
              className="rounded-full border border-navy-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50"
              style={mono}
            >
              Regenerate
            </button>
            <button
              type="button"
              onClick={() => setShowPromptEditor((v) => !v)}
              className="rounded-full border border-navy-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50"
              style={mono}
            >
              {showPromptEditor ? "Hide prompt" : "Edit prompt"}
            </button>
            <button
              type="button"
              onClick={dismissHero}
              className="rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-500 transition-colors hover:text-navy-700"
              style={mono}
            >
              Dismiss
            </button>
          </>
        ) : null}
        <span className="flex-1" />
        {!isRunning && !isDone ? (
          <span className="text-[10px] tracking-wide text-navy-400" style={mono}>
            Claude proposes a prompt · FLUX schnell renders · 16:9 hero · uploaded to Supabase
          </span>
        ) : null}
        {isRunning ? (
          <span className="text-[10px] uppercase tracking-[0.22em] text-gold-700" style={mono}>
            Synthesising prompt → rendering → uploading…
          </span>
        ) : null}
      </div>

      {heroAIStatus.kind === "error" ? (
        <div
          className="rounded-md border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-700 space-y-1"
          style={mono}
        >
          <div>✗ {heroAIStatus.hint ?? heroAIStatus.message}</div>
          {heroAIStatus.debug ? (
            <div className="break-all text-[10px] text-rose-500 normal-case tracking-normal">
              {heroAIStatus.debug}
            </div>
          ) : null}
        </div>
      ) : null}

      {isDone ? (
        <div className="rounded-xl border border-gold-200 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroAIStatus.url}
            alt="Generated hero preview"
            className="block w-full rounded-md"
            style={{ aspectRatio: "16 / 9", objectFit: "cover" }}
          />
          <p
            className="mt-3 text-[11px] italic leading-relaxed text-navy-700"
            style={serif}
          >
            {heroAIStatus.prompt}
          </p>
          <p
            className="mt-2 text-[9px] uppercase tracking-[0.22em] text-navy-400"
            style={mono}
          >
            {heroAIStatus.provider} · {heroAIStatus.model} · {Math.round(heroAIStatus.durationMs / 100) / 10}s · {(heroAIStatus.bytesUploaded / 1024).toFixed(1)} KiB
          </p>
        </div>
      ) : null}

      {isDone && showPromptEditor ? (
        <div className="space-y-2">
          <label
            className="block text-[10px] uppercase tracking-[0.28em] text-navy-400"
            style={mono}
          >
            Custom prompt (Regenerate with this prompt uses your edit verbatim)
          </label>
          <textarea
            value={draftPrompt}
            onChange={(e) => setDraftPrompt(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-navy-200 px-3 py-2 text-sm italic text-navy-700 focus:outline-none focus:border-gold-400 resize-y"
            style={serif}
          />
          <button
            type="button"
            onClick={() => onGenerateHero(draftPrompt)}
            disabled={isRunning || !draftPrompt.trim()}
            className="rounded-full border border-gold-400 bg-navy-900 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-navy-800 disabled:opacity-50"
            style={mono}
          >
            Regenerate with this prompt
          </button>
        </div>
      ) : null}
    </div>
  )
}

// Sprint 10 follow-up — render `<pre><code class="language-mermaid">…</code></pre>`
// blocks in the editor preview as live Mermaid diagrams, matching the
// published /blog/<slug> rendering path. Marked emits HTML-entity-encoded
// content inside the code block; we decode it, lift any `%% caption: …`
// first line (same convention as src/lib/blog/mdx-components.tsx), and
// mount the existing MermaidDiagram component in place. Non-mermaid HTML
// stays on the dangerouslySetInnerHTML path so we don't have to re-walk
// the rest of marked's output as React.
const MERMAID_BLOCK_RE = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g

function decodeHtmlEntities(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
}

// Render the editor's protected math — ```math fenced blocks and `$…$` inline
// code — as KaTeX in the preview, matching the published /blog render. Pure
// string transform on the Tiptap HTML; a no-op for posts without math.
function renderMathInHtml(html: string): string {
  if (!html.includes("language-math") && !/<code>\$[^$<]+\$<\/code>/.test(html)) {
    return html
  }
  let out = html.replace(
    /<pre><code class="language-math">([\s\S]*?)<\/code><\/pre>/g,
    (m, tex: string) => {
      try {
        return `<div class="katex-block">${katex.renderToString(
          decodeHtmlEntities(tex).trim(),
          { displayMode: true, throwOnError: false },
        )}</div>`
      } catch {
        return m
      }
    },
  )
  out = out.replace(/<code>\$([^$<]+?)\$<\/code>/g, (m, tex: string) => {
    try {
      return katex.renderToString(decodeHtmlEntities(tex), {
        displayMode: false,
        throwOnError: false,
      })
    } catch {
      return m
    }
  })
  return out
}

function extractCaption(code: string): { code: string; caption?: string } {
  const m = code.match(/^%%\s*caption:\s*(.+?)\s*$/m)
  if (!m) return { code }
  const cleaned = code.replace(m[0], "").replace(/^\n+/, "")
  return { code: cleaned, caption: m[1] }
}

function renderBodyWithMermaid(bodyHtml: string): ReactNode {
  // Quick path: nothing mermaid-shaped — keep the original behaviour so
  // nothing else regresses for ordinary Dispatches.
  if (!bodyHtml.includes('class="language-mermaid"')) {
    return <div className="studio-prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
  }

  const parts: ReactNode[] = []
  let lastIdx = 0
  let i = 0
  // RegExp.exec on a /g regex is stateful; reset before walking.
  MERMAID_BLOCK_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = MERMAID_BLOCK_RE.exec(bodyHtml)) !== null) {
    if (match.index > lastIdx) {
      parts.push(
        <div
          key={`html-${i}`}
          className="studio-prose"
          dangerouslySetInnerHTML={{ __html: bodyHtml.slice(lastIdx, match.index) }}
        />,
      )
    }
    const decoded = decodeHtmlEntities(match[1]).trim()
    const { code, caption } = extractCaption(decoded)
    parts.push(<MermaidDiagram key={`mermaid-${i}`} code={code} caption={caption} />)
    lastIdx = match.index + match[0].length
    i++
  }
  if (lastIdx < bodyHtml.length) {
    parts.push(
      <div
        key={`html-${i}`}
        className="studio-prose"
        dangerouslySetInnerHTML={{ __html: bodyHtml.slice(lastIdx) }}
      />,
    )
  }
  return <>{parts}</>
}

function PreviewPane({
  title,
  excerpt,
  category,
  date,
  bodyHtml,
}: {
  title: string
  excerpt: string
  category: string
  date: string
  bodyHtml: string
}) {
  return (
    <div className="sticky top-20 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-navy-200/80 bg-white p-4 sm:p-6 md:p-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold-700"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          Live preview
        </span>
        <span className="h-px flex-1 bg-navy-100" />
      </div>

      <div className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-navy-400"
        style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
        <span>{category}</span>
        <span className="text-navy-200">·</span>
        <span>{date}</span>
      </div>

      <h1 className="text-2xl md:text-3xl text-navy-900 tracking-tight leading-[1.1] mb-4"
        style={{ fontFamily: "var(--font-display), 'Gloock', serif" }}
      >
        {title || "(untitled)"}
      </h1>
      {excerpt ? (
        <p className="italic text-navy-600 mb-6"
          style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
        >
          {excerpt}
        </p>
      ) : null}

      {renderBodyWithMermaid(bodyHtml)}
    </div>
  )
}
