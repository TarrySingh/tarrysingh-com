"use client"

import { useEffect, useRef, useState } from "react"
import { logNudge } from "@/lib/nudge/log"

const MIN_SELECTION_CHARS = 15
const MAX_QUOTE_CHARS = 280

interface Props {
  slug: string
  /** Constrain the selection-detection to text inside this CSS selector
   *  (defaults to .prose-tarry — the article body). Prevents the chip
   *  from popping up over the header or sidebar text. */
  scopeSelector?: string
}

/**
 * Sprint 5.5.3 — highlight-to-share.
 *
 * When a reader selects ≥ 15 chars inside the article body, a small
 * floating chip surfaces above the selection: "Share on LinkedIn"
 * (opens LinkedIn's share intent with the quote pre-filled) and
 * "Copy quote" (clipboard with quote + canonical URL).
 *
 * No analytics SDK. No event listeners outside the article scope.
 * Hides on selection collapse, on scroll, and on click outside the
 * chip itself.
 */
export function HighlightToShare({ slug, scopeSelector = ".prose-tarry" }: Props) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [quote, setQuote] = useState("")
  const chipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const scope = document.querySelector(scopeSelector) as HTMLElement | null
    if (!scope) return

    function onSelectionChange() {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setVisible(false)
        return
      }
      const range = sel.getRangeAt(0)
      const text = sel.toString().trim()
      if (text.length < MIN_SELECTION_CHARS) {
        setVisible(false)
        return
      }
      // Must be inside the article scope.
      if (!scope || !scope.contains(range.commonAncestorContainer)) {
        setVisible(false)
        return
      }
      const rect = range.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) {
        setVisible(false)
        return
      }
      // Position chip ~10px above the top of the selection, centered.
      const top = rect.top + window.scrollY - 50
      const left = rect.left + rect.width / 2 + window.scrollX
      setPos({ top, left })
      setQuote(text.slice(0, MAX_QUOTE_CHARS))
      setVisible(true)
    }

    function onScroll() {
      setVisible(false)
    }

    function onMouseDown(e: MouseEvent) {
      // Clicking the chip itself shouldn't dismiss it.
      const chip = chipRef.current
      if (chip && e.target instanceof Node && chip.contains(e.target)) return
      setVisible(false)
    }

    document.addEventListener("selectionchange", onSelectionChange)
    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("mousedown", onMouseDown)
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange)
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("mousedown", onMouseDown)
    }
  }, [scopeSelector])

  useEffect(() => {
    if (visible) logNudge("highlight-share", "view", slug)
  }, [visible, slug])

  function shareToLinkedIn() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    const linkedInUrl =
      "https://www.linkedin.com/sharing/share-offsite/?url=" +
      encodeURIComponent(url)
    window.open(linkedInUrl, "_blank", "noopener,noreferrer,width=720,height=620")
    logNudge("highlight-share", "submit", slug)
    setVisible(false)
  }

  async function copyQuote() {
    try {
      const url = typeof window !== "undefined" ? window.location.href : ""
      const body = `"${quote}"\n\n— ${url}`
      await navigator.clipboard.writeText(body)
      logNudge("highlight-share", "submit", slug)
    } catch {
      // Clipboard unavailable — silently ignore.
    }
    setVisible(false)
  }

  if (!visible) return null
  return (
    <div
      ref={chipRef}
      role="toolbar"
      aria-label="Share this passage"
      className="absolute z-40 inline-flex items-center gap-1 rounded-full border border-navy-200 bg-white/95 backdrop-blur-md px-2 py-1.5 shadow-[0_4px_14px_-6px_rgba(15,23,42,0.25)]"
      style={{
        top: pos.top,
        left: pos.left,
        transform: "translateX(-50%)",
      }}
    >
      <button
        type="button"
        onClick={shareToLinkedIn}
        className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50"
        style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
      >
        Share on LinkedIn
      </button>
      <span className="h-3 w-px bg-navy-200" />
      <button
        type="button"
        onClick={copyQuote}
        className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50"
        style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
      >
        Copy quote
      </button>
    </div>
  )
}
