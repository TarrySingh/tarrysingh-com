"use client"

/**
 * SynapticSubscribe — a museum-grade "subscribe for the next plate" card for the
 * dark Synaptic Cartography plates (chokepoint-paradox, symphony, memphis,
 * software-3, …). Reuses the dispatches wiring (POST /api/newsletter/subscribe)
 * but wears the studio's folio dress: a dark glass slab over the page starfield,
 * an accent bloom, a faint cartographic graticule, a Gloock display headline,
 * IBM Plex Serif/Mono inks, and a single italic close line.
 *
 * It themes itself: `accent`/`accentHi` default to the surrounding plate's
 * palette (`--project-accent` on Symphony/Memphis) and fall back to studio gold,
 * so the same component glows violet, amber, gold or cyan depending on the room.
 * Reduced-motion safe; keyboard-reachable; SSR-safe.
 */

import { useState } from "react"

type Status = "idle" | "loading" | "sent" | "error"

interface Props {
  /** small-caps eyebrow */
  kicker?: string
  /** the Gloock display line */
  title?: string
  /** the italic serif invitation */
  blurb?: string
  /** folio mark on the right of the header rule */
  folio?: string
  /** accent + its highlight; default to the plate palette, then studio gold */
  accent?: string
  accentHi?: string
}

export function SynapticSubscribe({
  kicker = "Dispatches · Synaptic Cartography",
  title = "More plates are coming.",
  blurb = "Each one takes its time. Leave an address and you'll be first through the door when the next plate opens, what I'm building, what I'm reading. Quiet, infrequent, never a funnel.",
  folio = "№ ∞",
  accent = "var(--project-accent, #e8b54a)",
  accentHi = "var(--project-accent-hi, #f6d38a)",
}: Props) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")
  const busy = status === "loading" || status === "sent"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error")
      setMessage("That address doesn't look right.")
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
          source: typeof window !== "undefined" ? window.location.pathname : "/synaptic",
        }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      setStatus("sent")
      setMessage("Filed. You'll be first through the door.")
      setEmail("")
    } catch {
      setStatus("error")
      setMessage("Something snagged, try again in a moment?")
    }
  }

  const ink = "var(--ink, #eef2ff)"
  const inkSoft = "var(--ink-soft, rgba(238,242,255,0.62))"
  const inkDim = "var(--ink-dim, rgba(238,242,255,0.4))"

  return (
    <section
      className="syn-sub mx-auto my-16 w-full max-w-2xl"
      aria-label="Subscribe for the next plate"
    >
      <style>{`
        @keyframes synsub-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes synsub-draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes synsub-bloom{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.85;transform:scale(1.08)}}
        .syn-sub [data-rise]{animation:synsub-rise 760ms cubic-bezier(.33,0,.2,1) both}
        .syn-sub [data-rise="1"]{animation-delay:60ms}
        .syn-sub [data-rise="2"]{animation-delay:140ms}
        .syn-sub [data-rise="3"]{animation-delay:230ms}
        .syn-sub [data-rise="4"]{animation-delay:320ms}
        .syn-sub [data-rule]{transform-origin:left center;animation:synsub-draw 900ms cubic-bezier(.33,0,.2,1) both;animation-delay:120ms}
        .syn-sub [data-bloom]{animation:synsub-bloom 7s ease-in-out infinite}
        .syn-sub input::placeholder{color:${inkDim}}
        .syn-sub .synsub-pill:hover{transform:translateY(-1px)}
        @media (prefers-reduced-motion: reduce){
          .syn-sub [data-rise],.syn-sub [data-rule],.syn-sub [data-bloom]{animation:none}
        }
      `}</style>

      <div
        className="relative overflow-hidden rounded-[20px] border px-7 py-9 sm:px-11 sm:py-11"
        style={{
          borderColor: "var(--cp-hair, rgba(150,180,230,0.20))",
          background:
            "linear-gradient(168deg, rgba(22,33,62,0.55) 0%, rgba(11,18,40,0.72) 60%, rgba(8,13,30,0.82) 100%)",
          backdropFilter: "blur(7px)",
          WebkitBackdropFilter: "blur(7px)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* accent bloom, upper-right */}
        <div
          data-bloom
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full"
          style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 68%)`, opacity: 0.16, filter: "blur(6px)" }}
        />
        {/* faint cartographic graticule, lower-left */}
        <svg
          aria-hidden
          viewBox="0 0 220 220"
          className="pointer-events-none absolute -bottom-16 -left-12 h-56 w-56"
          style={{ opacity: 0.14 }}
        >
          <g fill="none" stroke={accent} strokeWidth="0.7">
            {[34, 64, 94, 124].map((r) => (
              <circle key={r} cx="110" cy="110" r={r} />
            ))}
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2
              return <line key={i} x1="110" y1="110" x2={110 + Math.cos(a) * 124} y2={110 + Math.sin(a) * 124} />
            })}
          </g>
        </svg>

        {/* top accent hairline */}
        <div
          data-rule
          aria-hidden
          className="absolute inset-x-7 top-0 h-px sm:inset-x-11"
          style={{ background: `linear-gradient(90deg, transparent, ${accent} 50%, transparent)`, opacity: 0.7 }}
        />

        <div className="relative">
          {/* header rule */}
          <div data-rise="1" className="mb-7 flex items-center gap-3">
            <span
              className="syn-mono text-[10.5px] uppercase"
              style={{ color: accentHi, letterSpacing: "0.28em", fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            >
              {kicker}
            </span>
            <span className="h-px flex-1" style={{ background: "var(--cp-hair, rgba(150,180,230,0.18))" }} />
            <span
              className="text-[10.5px] uppercase"
              style={{ color: inkDim, letterSpacing: "0.26em", fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
            >
              {folio}
            </span>
          </div>

          {/* headline */}
          <h2
            data-rise="2"
            className="syn-display"
            style={{
              fontFamily: "var(--font-display), 'Gloock', 'Italiana', serif",
              fontSize: "clamp(30px, 4.6vw, 46px)",
              lineHeight: 1.04,
              letterSpacing: "var(--track-display, 0.01em)",
              color: ink,
              margin: 0,
            }}
          >
            {title}
          </h2>

          {/* invitation */}
          <p
            data-rise="3"
            className="mt-4 max-w-xl"
            style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif", color: inkSoft, fontSize: "1.02rem", lineHeight: 1.6 }}
          >
            {blurb}
          </p>

          {/* form */}
          <form data-rise="4" onSubmit={onSubmit} noValidate className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <label htmlFor="synsub-email" className="sr-only">Email address</label>
            <input
              id="synsub-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder="you@quiet-mailbox.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === "error") { setStatus("idle"); setMessage("") }
              }}
              disabled={busy}
              className="min-w-0 flex-1 rounded-full px-5 py-3 text-[15px] transition-all duration-200 focus:outline-none disabled:opacity-60"
              style={{
                fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                color: ink,
                background: "rgba(8,13,30,0.55)",
                border: "1px solid var(--cp-hair, rgba(150,180,230,0.24))",
                boxShadow: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = accent
                e.currentTarget.style.boxShadow = `0 0 0 3px color-mix(in srgb, ${accent} 22%, transparent)`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--cp-hair, rgba(150,180,230,0.24))"
                e.currentTarget.style.boxShadow = "none"
              }}
            />
            <button
              type="submit"
              disabled={busy}
              className="synsub-pill inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-7 py-3 text-[11px] font-semibold uppercase transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                letterSpacing: "0.2em",
                color: "#0a1024",
                background: `linear-gradient(180deg, ${accentHi}, ${accent})`,
                border: `1px solid ${accent}`,
                boxShadow: `0 6px 22px color-mix(in srgb, ${accent} 30%, transparent)`,
              }}
            >
              {status === "loading" ? "Filing…" : status === "sent" ? "Filed ✓" : "Subscribe →"}
            </button>
          </form>

          {/* live message */}
          <div className="mt-3 min-h-[1.25rem]" aria-live="polite">
            {message ? (
              <p
                className="text-[12px]"
                style={{
                  fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                  letterSpacing: "0.05em",
                  color: status === "sent" ? accentHi : "var(--cp-squeeze, #e0607a)",
                }}
              >
                {message}
              </p>
            ) : null}
          </div>

          {/* footer micro + close */}
          <div
            className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t pt-5"
            style={{ borderColor: "var(--cp-hair, rgba(150,180,230,0.14))" }}
          >
            <span
              className="text-[10px] uppercase"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace", letterSpacing: "0.24em", color: inkDim }}
            >
              Unsubscribe in one click · no tracking pixels
            </span>
            <a
              href="/blog/rss.xml"
              className="text-[10px] uppercase transition-opacity hover:opacity-100"
              style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace", letterSpacing: "0.24em", color: inkSoft, opacity: 0.8 }}
            >
              RSS →
            </a>
          </div>

          <p
            className="mt-5 text-center"
            style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif", fontStyle: "italic", color: inkDim, fontSize: "0.92rem" }}
          >
            Plates from a studio that takes its time.
          </p>
        </div>
      </div>
    </section>
  )
}
