"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"

type Status = "idle" | "loading" | "sent" | "error"

const STORAGE_KEY = "dispatches.peek.dismissedAt"
const DISMISS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const SCROLL_THRESHOLD = 0.6 // fraction of total document height
const MIN_SCROLL_PX = 600 // also require an absolute floor so very short
//                          pages don't fire immediately on a tiny scroll

/**
 * Studio-voice peek card — the small companion to the wide
 * NewsletterCard. Slides up from bottom-right after the visitor
 * scrolls past ~1.2 viewport heights, hides once dismissed (×) or
 * once a successful submit completes. The dismissal is stored in
 * localStorage for 30 days so repeat visitors don't get badgered.
 *
 * Aesthetic: same vocabulary as the wide card (Plex Mono small-caps
 * "DISPATCHES" label, Gloock display, Plex Serif body, copper
 * border, navy submit pill). No character, no illustration.
 */
export function NewsletterPeek() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  // Mount-time eligibility + scroll listener.
  useEffect(() => {
    if (typeof window === "undefined") return

    // Honour an existing dismissal.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const at = Number(raw)
        if (Number.isFinite(at) && Date.now() - at < DISMISS_WINDOW_MS) {
          return
        }
      }
    } catch {
      // localStorage might be disabled; treat as fresh.
    }

    // Trigger when the reader has scrolled past 60 % of the total
    // document height (and ≥ 600 px so very short pages don't fire
    // immediately). Document height is measured live each tick because
    // lazy-loaded sections / images can extend it as the visitor
    // scrolls.
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      )
      const ratio = docHeight > 0 ? scrolled / docHeight : 0
      if (ratio >= SCROLL_THRESHOLD && window.scrollY >= MIN_SCROLL_PX) {
        setVisible(true)
        window.removeEventListener("scroll", onScroll)
      }
    }

    // Initial check in case the page loads scrolled (e.g. anchor link).
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  function persistDismissal() {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch {
      // ignore
    }
  }

  function dismiss() {
    persistDismissal()
    setVisible(false)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error")
      setMessage("That email doesn't look right.")
      return
    }
    setStatus("loading")
    setMessage("")
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          source: window.location.pathname,
        }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      setStatus("sent")
      setMessage("Filed. Welcome to the list.")
      setEmail("")
      // Auto-dismiss 4s after success so the visitor isn't stared at.
      window.setTimeout(() => {
        persistDismissal()
        setVisible(false)
      }, 4000)
    } catch {
      setStatus("error")
      setMessage("Snagged on our side. Try again in a moment.")
    }
  }

  if (!visible) return null

  return (
    <div
      ref={wrapperRef}
      role="region"
      aria-label="Subscribe to Dispatches"
      className="fixed bottom-5 right-5 z-50 w-[min(360px,calc(100vw-2.5rem))] print:hidden"
      style={{
        animation: "syn-peek-rise 480ms cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {/* Local keyframes via style tag so the peek is self-contained. */}
      <style>{`
        @keyframes syn-peek-rise {
          0%   { opacity: 0; transform: translate3d(0, 24px, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-syn-peek-noanim] { animation: none !important; }
        }
      `}</style>

      <div
        data-syn-peek-noanim
        className="relative rounded-2xl border border-navy-200/80 bg-white p-5 shadow-[0_18px_44px_-22px_rgba(15,23,42,0.35),0_2px_4px_rgba(15,23,42,0.05)]"
      >
        <div
          className="absolute inset-x-5 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(184,134,11,0.55) 50%, transparent 100%)",
          }}
          aria-hidden
        />

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 h-7 w-7 inline-flex items-center justify-center rounded-full text-navy-400 hover:bg-navy-50 hover:text-navy-900 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="mb-3 flex items-center gap-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold-700"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            Dispatches
          </span>
          <span className="h-px flex-1 bg-navy-100" />
        </div>

        <h3
          className="text-xl text-navy-900 tracking-tight leading-[1.15] mb-2"
          style={{ fontFamily: "var(--font-display), 'Gloock', serif" }}
        >
          Quietly written.
        </h3>

        <p
          className="text-[0.875rem] leading-relaxed text-navy-600 mb-4"
          style={{
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
          }}
        >
          Once a fortnight, never more. What I&apos;m building, what
          I&apos;m reading. No funnels.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-2" noValidate>
          <label htmlFor="dispatches-peek-email" className="sr-only">
            Email address
          </label>
          <input
            id="dispatches-peek-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@quiet-mailbox.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === "error") {
                setStatus("idle")
                setMessage("")
              }
            }}
            disabled={status === "loading" || status === "sent"}
            className="w-full px-3.5 py-2.5 rounded-full border border-navy-200 bg-white text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all duration-200 disabled:opacity-60"
            style={{
              fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "sent"}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-gold-400 bg-navy-900 text-white text-[10.5px] font-semibold uppercase tracking-[0.22em] hover:bg-navy-800 hover:border-gold-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            {status === "loading"
              ? "Filing…"
              : status === "sent"
              ? "Filed"
              : "Subscribe"}
          </button>
        </form>

        <div
          className="min-h-[1.25rem] mt-2.5 text-[11px]"
          aria-live="polite"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            letterSpacing: "0.04em",
          }}
        >
          {message ? (
            <p
              className={status === "sent" ? "text-gold-700" : "text-rose-600"}
            >
              {message}
            </p>
          ) : (
            <p className="text-navy-300">
              One click to unsubscribe · no tracking
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
