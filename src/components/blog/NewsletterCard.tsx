"use client"

import { useState } from "react"

type Status = "idle" | "loading" | "sent" | "error"

interface NewsletterCardProps {
  variant?: "wide" | "compact"
}

/**
 * Editorial DISPATCHES card.
 *
 * Visual grammar matches the Synaptic Cartography studio set:
 * mono small-caps section label, Gloock display, IBM Plex Serif body,
 * hairline copper rule, copper-bordered submit pill. No illustration,
 * no character, no SaaS gloss. Reads as a member of the studio set,
 * not a pop-up.
 */
export function NewsletterCard({ variant = "wide" }: NewsletterCardProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")

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
          source:
            typeof window !== "undefined" ? window.location.pathname : "/",
        }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      setStatus("sent")
      setMessage("Filed. Welcome to the dispatches list.")
      setEmail("")
    } catch {
      setStatus("error")
      setMessage("Something snagged. Try again in a moment?")
    }
  }

  const isCompact = variant === "compact"

  return (
    <aside
      className={`relative w-full border border-navy-200/80 bg-white ${
        isCompact ? "p-7 md:p-8" : "p-8 md:p-10"
      } rounded-2xl shadow-[0_1px_0_rgba(15,23,42,0.04)] overflow-hidden`}
    >
      <div
        className="absolute inset-x-8 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(184,134,11,0.55) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      <header className="mb-5">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-[10.5px] font-semibold uppercase tracking-[0.32em] text-gold-700"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            Dispatches
          </span>
          <span className="h-px flex-1 bg-navy-100" />
          <span
            className="text-[10.5px] tracking-[0.28em] uppercase text-navy-400"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            № 01
          </span>
        </div>

        <h3
          className={`text-navy-900 tracking-tight ${
            isCompact ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
          } leading-[1.1]`}
          style={{ fontFamily: "var(--font-display), 'Gloock', serif" }}
        >
          Quietly written. Infrequent.
        </h3>
      </header>

      <p
        className={`text-navy-600 leading-relaxed mb-7 max-w-prose ${
          isCompact ? "text-[0.98rem]" : "text-[1.05rem]"
        }`}
        style={{
          fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
        }}
      >
        What I&apos;m building. What I&apos;m reading. No funnels.
      </p>

      <form
        onSubmit={onSubmit}
        className="flex flex-col sm:flex-row gap-3 sm:items-stretch"
        noValidate
      >
        <label htmlFor="dispatches-email" className="sr-only">
          Email address
        </label>
        <input
          id="dispatches-email"
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
          className="flex-1 min-w-0 px-4 py-3 rounded-full border border-navy-200 bg-white text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all duration-200 disabled:opacity-60"
          style={{
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
          }}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "sent"}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gold-400 bg-navy-900 text-white text-[11px] font-semibold uppercase tracking-[0.22em] hover:bg-navy-800 hover:border-gold-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          {status === "loading" ? "Filing…" : status === "sent" ? "Filed" : "Subscribe"}
        </button>
      </form>

      <div className="min-h-[1.5rem] mt-4" aria-live="polite">
        {message ? (
          <p
            className={`text-xs ${
              status === "sent" ? "text-gold-700" : "text-rose-600"
            }`}
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              letterSpacing: "0.06em",
            }}
          >
            {message}
          </p>
        ) : null}
      </div>

      <footer className="mt-2 pt-5 border-t border-navy-100/70 flex items-center justify-between gap-4">
        <span
          className="text-[10px] uppercase tracking-[0.28em] text-navy-300"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          Unsubscribe in one click · no tracking pixels
        </span>
        <a
          href="/blog/rss.xml"
          className="text-[10px] uppercase tracking-[0.28em] text-navy-400 hover:text-gold-700 transition-colors whitespace-nowrap"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          RSS →
        </a>
      </footer>
    </aside>
  )
}
