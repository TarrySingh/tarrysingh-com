"use client"

import { useEffect, useState } from "react"

/** The essay's sections, in reading order. `id` matches the anchor on each
 *  <section>; `roman` is the rail tick label, `title` the expanded label. */
const SECTIONS: { id: string; roman: string; title: string }[] = [
  { id: "prologue", roman: "·", title: "Prologue" },
  { id: "chapter-1", roman: "I", title: "The Canary" },
  { id: "chapter-2", roman: "II", title: "The Map Out" },
  { id: "chapter-3", roman: "III", title: "The Standing Order" },
  { id: "chapter-4", roman: "IV", title: "The Crown Jewel" },
  { id: "chapter-5", roman: "V", title: "Tenant Farms" },
  { id: "chapter-6", roman: "VI", title: "The Finishing School" },
  { id: "chapter-7", roman: "VII", title: "The Electrons" },
  { id: "chapter-8", roman: "VIII", title: "The Re-Armament" },
  { id: "chapter-9", roman: "IX", title: "The Moat" },
  { id: "chapter-10", roman: "X", title: "The Ledger" },
  { id: "chapter-11", roman: "XI", title: "The Accelerant" },
  { id: "chapter-12", roman: "XII", title: "The Turn" },
]

/**
 * A slim, theme-aware tick-rail pinned to the right edge on large screens.
 * Scroll-spy highlights the section in view; clicking a tick smooth-scrolls to
 * it. Hidden under lg and for reduced-motion users it simply jumps (no smooth).
 * Pure CSS-variable theming (`--cp-*`), so it re-colours with the Read flip.
 */
export function ChokepointJumpNav() {
  const [active, setActive] = useState<string>("prologue")

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (els.length === 0) return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id)
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const go = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  }

  return (
    <nav
      aria-label="Chapters"
      className="pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <ul className="pointer-events-auto flex flex-col gap-1">
        {SECTIONS.map((s) => {
          const on = active === s.id
          return (
            <li key={s.id} className="group flex items-center justify-end gap-2">
              <span
                className="whitespace-nowrap text-[11px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  letterSpacing: "0.12em",
                  color: on ? "var(--cp-leverage-hi, #9ad8ef)" : "var(--cp-muted, rgba(238,242,255,0.6))",
                }}
                aria-hidden
              >
                {s.title}
              </span>
              <button
                type="button"
                onClick={() => go(s.id)}
                aria-label={`Jump to ${s.title}`}
                aria-current={on ? "true" : undefined}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] transition-all"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  color: on ? "var(--cp-bg, #070a14)" : "var(--cp-muted, rgba(238,242,255,0.5))",
                  background: on ? "var(--cp-leverage-hi, #9ad8ef)" : "transparent",
                  border: `1px solid ${on ? "var(--cp-leverage-hi, #9ad8ef)" : "var(--cp-hair, rgba(238,242,255,0.18))"}`,
                  transform: on ? "scale(1)" : "scale(0.82)",
                }}
              >
                {s.roman}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
