"use client"

import { useState } from "react"

type Status = "idle" | "loading" | "sent" | "error"

type SynapticSubscribeInlineProps = {
  /** Accent CSS var, e.g. "--symphony-violet-hi" or "--memphis-amber-hi".
   *  Defaults to the surrounding plate's --project-accent, then violet. */
  accent?: string
  className?: string
}

/**
 * Slim inline DISPATCHES band for the long-form Synaptic essays.
 *
 * The lighter sibling of {@link SynapticSubscribe} (the folio dispatch card
 * that closes each plate): this one is a low, horizontal panel meant to sit
 * *between major sections*, every few thousand words, as a natural reading
 * break rather than a closing call. Same Synaptic Cartography grammar —
 * midnight panel, copper hairline, syn-small-caps / syn-display / syn-mono —
 * so the two registers read as one set: slim bands through the read, the
 * folio card at the foot.
 *
 * Posts the same payload to `/api/newsletter/subscribe`, tagging `source`
 * with `#synaptic-inline` so mid-essay conversions stay legible in the CRM
 * funnel and distinct from the foot card.
 */
export function SynapticSubscribeInline({
  accent = "var(--project-accent, var(--symphony-violet-hi))",
  className = "",
}: SynapticSubscribeInlineProps) {
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
          source:
            typeof window !== "undefined"
              ? `${window.location.pathname}#synaptic-inline`
              : "/synaptic#synaptic-inline",
        }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      setStatus("sent")
      setMessage("Filed. Welcome to the dispatches list.")
      setEmail("")
    } catch {
      setStatus("error")
      setMessage("Something snagged — try again in a moment?")
    }
  }

  // `accent` may be a raw var name (--foo) or a full color expression.
  const accentColor = accent.startsWith("--") ? `var(${accent})` : accent

  return (
    <aside
      className={`relative overflow-hidden rounded-[var(--radius-card)] border p-6 md:p-8 ${className}`}
      style={{
        borderColor: "var(--panel-edge)",
        backgroundColor: "var(--panel-deep)",
        boxShadow: "var(--shadow-card)",
      }}
      aria-label="Subscribe to Dispatches"
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
          opacity: 0.55,
        }}
        aria-hidden
      />

      <header
        className="mb-4 flex items-baseline justify-between gap-4 border-b pb-3"
        style={{ borderColor: "var(--hairline)" }}
      >
        <span className="syn-small-caps" style={{ color: accentColor }}>
          Dispatches
        </span>
        <span className="syn-small-caps" style={{ color: "var(--ink-dim)" }}>
          Quietly written · infrequent
        </span>
      </header>

      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "44ch",
            margin: 0,
          }}
        >
          Following the argument? Get the next dispatch in your inbox — what
          I&rsquo;m building, what I&rsquo;m reading. No funnels.
        </p>

        <form
          onSubmit={onSubmit}
          className="flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:items-stretch"
          noValidate
        >
          <label htmlFor="synaptic-inline-email" className="sr-only">
            Email address
          </label>
          <input
            id="synaptic-inline-email"
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
            disabled={busy}
            className="syn-mono min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm outline-none transition-colors duration-200 disabled:opacity-60"
            style={{
              borderColor: "var(--panel-edge)",
              backgroundColor: "rgba(8,12,30,0.55)",
              color: "var(--ink)",
              letterSpacing: "var(--track-mono)",
            }}
          />
          <button
            type="submit"
            disabled={busy}
            className="syn-small-caps inline-flex items-center justify-center whitespace-nowrap rounded-full border px-5 py-2.5 transition-opacity duration-200 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              borderColor: accentColor,
              color: accentColor,
              backgroundColor: "rgba(8,12,30,0.35)",
            }}
          >
            {status === "loading"
              ? "Filing…"
              : status === "sent"
                ? "Filed"
                : "Subscribe"}
          </button>
        </form>
      </div>

      <div className="min-h-[1.25rem]" aria-live="polite">
        {message ? (
          <p
            className="syn-mono mt-3"
            style={{
              color: status === "sent" ? accentColor : "var(--ink-cool)",
              fontSize: "0.75rem",
              letterSpacing: "var(--track-mono)",
            }}
          >
            {message}
          </p>
        ) : null}
      </div>
    </aside>
  )
}
