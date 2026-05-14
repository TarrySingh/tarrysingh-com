"use client"

import { useEffect, useState } from "react"
import { logNudge } from "@/lib/nudge/log"

const SESSION_KEY_PREFIX = "tch:milestone:"
const MILESTONE_FRACTION = 0.6 // 60% of scrollable depth

interface Props {
  /** Dispatch slug — used to scope the localStorage flag so the nudge fires once per post per browser. */
  slug: string
  /** Word count for the post. The nudge only mounts on posts ≥ 1500 words. */
  wordCount: number
}

/**
 * Sprint 5.5.2 — reading-progress milestone nudge.
 *
 * Mounts on long Dispatches only (≥ 1500 words). Listens to scroll
 * position via passive listener; the first time (scrollY + viewport)
 * crosses 60% of document height, an inline nudge surfaces near the
 * top of the viewport: "You've made it through the middle. The
 * argument turns from here. If you want the next one in your
 * inbox: …" + a single-line email field that wires through to the
 * existing /api/newsletter/subscribe pipeline.
 *
 * Fires once per browser per slug — the localStorage flag never expires
 * (returning readers don't get re-nudged on the same post).
 */
export function ReadingMilestoneNudge({ slug, wordCount }: Props) {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Only render on long posts. Avoids the nudge appearing on Notes-shaped
  // 500-word pieces where 60% reads in 90 seconds and the surfacing
  // feels jumpy.
  if (wordCount < 1500) return null

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.localStorage.getItem(SESSION_KEY_PREFIX + slug) === "1") return

    let fired = false
    function onScroll() {
      if (fired) return
      const doc = document.documentElement
      const scrolled = window.scrollY + window.innerHeight
      const total = doc.scrollHeight
      if (total === 0) return
      const frac = scrolled / total
      if (frac >= MILESTONE_FRACTION) {
        fired = true
        setVisible(true)
        try {
          window.localStorage.setItem(SESSION_KEY_PREFIX + slug, "1")
        } catch {
          // Storage may be unavailable (privacy mode); soldier on
          // without the once-per-browser guarantee.
        }
        logNudge("reading-milestone", "view", slug)
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll() // fire immediately if the user starts mid-doc (e.g. an anchor link)
    return () => window.removeEventListener("scroll", onScroll)
  }, [slug])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("loading")
    setErrorMessage("")
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "blog-reading-milestone",
          context: { slug, nudge: "reading-milestone" },
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok || (j && j.ok === false)) {
        setStatus("error")
        setErrorMessage(j?.error ?? `subscribe_failed_${res.status}`)
        return
      }
      setStatus("ok")
      logNudge("reading-milestone", "submit", slug)
    } catch (err) {
      setStatus("error")
      setErrorMessage(err instanceof Error ? err.message : "network_error")
    }
  }

  function onDismiss() {
    setVisible(false)
    logNudge("reading-milestone", "dismiss", slug)
  }

  if (!visible) return null
  return (
    <aside
      className="fixed inset-x-4 bottom-6 mx-auto z-30 max-w-xl rounded-2xl border border-gold-200 bg-white/95 backdrop-blur-md p-5 md:p-6 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)]"
      aria-label="Reading milestone newsletter nudge"
    >
          {status === "ok" ? (
            <p
              className="text-sm italic text-navy-700"
              style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
            >
              You&rsquo;re on the list. The next Dispatch lands when it&rsquo;s ready —
              <em> no cadence theatre.</em>
            </p>
          ) : (
            <>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-700 mb-2"
                style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
              >
                You&rsquo;ve made it through the middle
              </p>
              <p
                className="text-base italic text-navy-700 leading-relaxed mb-4"
                style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
              >
                The argument turns from here. If you want the next one in your inbox —
                no schedule, no marketing — leave an address.
              </p>
              <form
                onSubmit={onSubmit}
                className="flex flex-col sm:flex-row gap-2 sm:items-stretch"
                noValidate
              >
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email webauthn"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status === "error") setStatus("idle")
                  }}
                  placeholder="you@quiet-mailbox.com"
                  disabled={status === "loading"}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-full border border-navy-200 bg-white text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all duration-200 disabled:opacity-60"
                  style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gold-400 bg-navy-900 text-white text-[10px] font-semibold uppercase tracking-[0.22em] hover:bg-navy-800 transition-colors disabled:opacity-60 whitespace-nowrap"
                  style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
                >
                  {status === "loading" ? "Sending…" : "Subscribe"}
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-400 hover:text-navy-700 self-center px-2"
                  style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
                >
                  Not today
                </button>
              </form>
              {status === "error" ? (
                <p
                  className="mt-2 text-xs text-rose-600"
                  style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
                >
                  ✗ {errorMessage}
                </p>
              ) : null}
            </>
          )}
    </aside>
  )
}
