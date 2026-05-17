"use client"

import { useState } from "react"
import Image from "next/image"

type Status = "idle" | "loading" | "sent" | "error"

interface Props {
  /** Path to the mascot image. Defaults to the photo cutout that ships
   *  today; swap to /tarry-mascot.svg once the illustrated version lands.
   *  No other changes needed — the component is asset-agnostic. */
  src?: string
  /** Alt text + speech-bubble copy override hook. */
  alt?: string
  /** Slug — used as the `source` field on the subscribe POST so cadence
   *  attribution can tell mascot signups apart from peek / footer. */
  slug?: string
}

/**
 * Studio-voice riff on Josh Comeau's signature upside-down mascot.
 *
 * A polaroid-rounded cutout of Tarry hangs at the foot of every
 * Dispatch, rotated a few degrees off true, with a small speech
 * bubble and an inline subscribe pill. Same studio palette + Plex
 * register as the rest of the site — editorial, not cartoon.
 *
 * The asset path is a prop so we can ship the photo today and swap
 * to an SVG/illustrated version later without touching the layout.
 *
 * Mounted on the per-Dispatch page just above the wide NewsletterCard.
 * It's additive, not a replacement for the 60 %-scroll NewsletterPeek;
 * the peek catches mid-readers, this catches finishers.
 */
export function TarryPeekABoo({
  src = "/tarry-portrait.jpg",
  alt = "Tarry Singh",
  slug,
}: Props) {
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
          source: slug ? `blog-tarry-peek:${slug}` : "blog-tarry-peek",
        }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      setStatus("sent")
      setMessage("Filed. See you in the next one.")
      setEmail("")
    } catch {
      setStatus("error")
      setMessage("Snagged on our side. Try again in a moment.")
    }
  }

  return (
    <aside
      aria-label="Tarry says hi"
      className="relative mt-16 overflow-hidden rounded-2xl border border-gold-200/60"
      style={{
        background:
          "linear-gradient(180deg, #fdfaf2 0%, #f6efd9 55%, #efe4c0 100%)",
      }}
    >
      {/* gentle horizontal hairline — Josh's wave is a real SVG curve;
          for the studio register, a single copper rule reads more
          editorial than playful */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[112px] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(184,134,11,0.55) 50%, transparent 100%)",
        }}
      />

      <div className="flex flex-col items-center px-6 pt-10 pb-12 sm:px-10 sm:pt-12 sm:pb-14">
        {/* The mascot itself — polaroid roundel with a slight tilt.
            Asset is prop-driven so the photo / SVG / 3D swap is one
            line of caller code. */}
        <div
          className="relative h-[120px] w-[120px] sm:h-[140px] sm:w-[140px]"
          style={{
            transform: "rotate(-5deg)",
            transformOrigin: "center",
            filter: "drop-shadow(0 12px 24px rgba(15,23,42,0.18))",
          }}
        >
          <div
            className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-gold-300 bg-white"
            style={{
              boxShadow:
                "inset 0 0 0 2px rgba(255,255,255,0.65), 0 0 0 1px rgba(184,134,11,0.35)",
            }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="140px"
              priority={false}
              style={{
                objectFit: "cover",
                objectPosition: "center 26%",
              }}
            />
          </div>
        </div>

        {/* speech-bubble kicker — Plex Mono small-caps, copper rule
            already overhead does the visual job of a tail */}
        <p
          className="mt-6 text-[10.5px] font-semibold uppercase tracking-[0.32em] text-gold-700"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          Psst — from Tarry
        </p>

        <h3
          className="mt-3 max-w-[28ch] text-center text-2xl text-navy-900 tracking-tight sm:text-3xl"
          style={{
            fontFamily: "var(--font-display), 'Gloock', serif",
            lineHeight: 1.18,
          }}
        >
          Want tomorrow&apos;s Dispatch in your inbox?
        </h3>

        <p
          className="mt-3 max-w-[44ch] text-center text-[0.95rem] italic text-navy-600"
          style={{
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            lineHeight: 1.55,
          }}
        >
          Once a day, never a funnel. What I&apos;m writing, what I&apos;m
          reading, what the field actually shipped.
        </p>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-6 flex w-full max-w-[420px] flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="tarry-peek-email" className="sr-only">
            Email address
          </label>
          <input
            id="tarry-peek-email"
            type="email"
            inputMode="email"
            autoComplete="email webauthn"
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
            className="min-h-[44px] flex-1 rounded-full border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300 disabled:opacity-60"
            style={{
              fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "sent"}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-gold-400 bg-navy-900 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-navy-800 hover:border-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
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
          className="mt-3 min-h-[1.25rem] text-center text-[11px]"
          aria-live="polite"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            letterSpacing: "0.04em",
          }}
        >
          {message ? (
            <p className={status === "sent" ? "text-gold-700" : "text-rose-600"}>
              {message}
            </p>
          ) : (
            <p className="text-navy-400">
              One click to unsubscribe · no tracking
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}
