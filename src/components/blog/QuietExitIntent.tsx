"use client"

import { useEffect, useState } from "react"
import { logNudge } from "@/lib/nudge/log"

const FLAG_KEY = "tch:exit-intent:fired"
// Tunable trip thresholds — the cumulative spec is "rapid upward
// scroll from deep reading position". Both must hold.
const DEEP_FRACTION = 0.55 // must have read at least 55% of doc
const FAST_UPWARD_DELTA = 280 // px / 250 ms — felt-fast "I'm going back to the top"
const TICK_MS = 250

interface Props {
  slug: string
}

/**
 * Sprint 5.5.4 — quiet exit-intent (desktop scroll-up only).
 *
 * Most "exit-intent" pop-ups are dark patterns — mouse-leave detection
 * on the top edge, screen-locking modals. This one isn't. It mounts
 * only on pointers: fine (mouse-driven, i.e. desktop) and triggers
 * only on a rapid upward scroll from deep reading position. Once per
 * browser, ever — localStorage flag is permanent.
 *
 * On mobile, the existing NewsletterPeek slide-up already does the
 * "I'm leaving but want to remember" job, so this stays silent.
 */
export function QuietExitIntent({ slug }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    // localStorage flag — once per browser, ever.
    try {
      if (window.localStorage.getItem(FLAG_KEY) === "1") return
    } catch {
      return
    }
    // Pointer media — only fire on mouse-driven viewports.
    if (
      window.matchMedia &&
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return
    }

    let lastY = window.scrollY
    let armed = false
    const interval = window.setInterval(() => {
      const y = window.scrollY
      const delta = lastY - y // positive = scrolled upward
      lastY = y
      const doc = document.documentElement
      const frac = (y + window.innerHeight) / doc.scrollHeight
      if (!armed && frac >= DEEP_FRACTION) {
        armed = true
        return
      }
      if (armed && delta >= FAST_UPWARD_DELTA) {
        setVisible(true)
        try {
          window.localStorage.setItem(FLAG_KEY, "1")
        } catch {
          // Ignore — fail quietly if storage is unavailable.
        }
        window.clearInterval(interval)
        logNudge("exit-intent", "view", slug)
      }
    }, TICK_MS)
    return () => window.clearInterval(interval)
  }, [slug])

  async function onCopyLink() {
    try {
      const url = typeof window !== "undefined" ? window.location.href : ""
      await navigator.clipboard.writeText(url)
      logNudge("exit-intent", "submit", slug) // count copy-link as a positive action
    } catch {
      // Clipboard may be unavailable — silently ignore.
    }
  }

  function onDismiss() {
    setVisible(false)
    logNudge("exit-intent", "dismiss", slug)
  }

  if (!visible) return null
  return (
    <aside
      role="dialog"
      aria-label="Bookmark this Dispatch or subscribe"
      className="fixed right-6 top-24 z-30 w-80 rounded-2xl border border-gold-200 bg-white/95 backdrop-blur-md p-5 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)]"
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-700 mb-2"
        style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
      >
        Heading back up?
      </p>
      <p
        className="text-sm italic text-navy-700 leading-relaxed mb-4"
        style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
      >
        Bookmark this — or take the studio with you. One quiet
        Dispatch when the next one is ready.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCopyLink}
          className="rounded-full border border-navy-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          Copy link
        </button>
        <a
          href="#newsletter"
          onClick={() => {
            setVisible(false)
            logNudge("exit-intent", "submit", slug)
          }}
          className="rounded-full border border-gold-400 bg-navy-900 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-navy-800"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          Subscribe ↓
        </a>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-400 hover:text-navy-700 self-center px-1"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          Dismiss
        </button>
      </div>
    </aside>
  )
}
