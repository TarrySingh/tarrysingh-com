"use client"

import { useEffect, useState } from "react"
import { logNudge } from "@/lib/nudge/log"

const COOKIE = "tch:visit-count"
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const m = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&") + "=([^;]*)"),
  )
  return m ? decodeURIComponent(m[1]) : null
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`
}

/**
 * Sprint 5.5.5 — second-visit recognizer.
 *
 * On the 2nd+ visit to /blog (anonymous, first-party cookie only, no
 * cross-site tracking, no fingerprinting), surfaces a single discreet
 * line near the top of the index page acknowledging the return + a
 * "Subscribe ↓" pill that scrolls to the existing NewsletterCard at
 * the foot of the page. Permanently disappears after subscribe.
 *
 * No nudge on the first visit — the studio earns the second one.
 */
export function ReturningReaderHero() {
  const [variant, setVariant] = useState<"hidden" | "second" | "third-plus">("hidden")

  useEffect(() => {
    const prev = parseInt(readCookie(COOKIE) ?? "0", 10) || 0
    const next = prev + 1
    writeCookie(COOKIE, String(next))
    if (next === 2) setVariant("second")
    else if (next >= 3) setVariant("third-plus")
    else setVariant("hidden")
    if (next >= 2) logNudge("returning-reader", "view")
  }, [])

  if (variant === "hidden") return null

  const copy =
    variant === "second"
      ? "You've been here before. The next Dispatch, when it's ready, in your inbox, no cadence theatre."
      : "Back again. Tarry doesn't post on a schedule, but he does send Dispatches to a small list when one ships."

  function scrollToNewsletter() {
    if (typeof document === "undefined") return
    const el = document.getElementById("newsletter")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-full border border-gold-200 bg-gold-50/40 px-4 py-2">
      <span
        className="text-[10px] uppercase tracking-[0.28em] text-gold-700"
        style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
      >
        Returning reader
      </span>
      <span className="h-3 w-px bg-gold-200" />
      <span
        className="text-sm italic text-navy-700"
        style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
      >
        {copy}
      </span>
      <button
        type="button"
        onClick={scrollToNewsletter}
        className="ml-1 rounded-full border border-gold-400 bg-navy-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-navy-800"
        style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
      >
        Subscribe ↓
      </button>
    </div>
  )
}
