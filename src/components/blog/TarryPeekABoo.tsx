"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

type Status = "idle" | "loading" | "sent" | "error"

const STORAGE_KEY = "dispatches.tarry-peek.dismissedAt"
const DISMISS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const SCROLL_THRESHOLD = 0.4 // a bit earlier than the studio-voice peek
//                              (0.6) so finishers also see the mascot
//                              clearly while there's still page to read.
const MIN_SCROLLABLE_PX = 240

interface Props {
  /** Path to the mascot image. Defaults to the existing portrait JPG;
   *  swap to /tarry-mascot.svg once the illustrated version lands. */
  src?: string
  alt?: string
  /** Slug tag for the subscribe POST's `source` field — lets cadence
   *  attribution separate mascot signups from peek / footer ones. */
  slug?: string
  /** "right" (default) or "left" — flip the edge if a page calls for it. */
  side?: "left" | "right"
}

/**
 * Josh-Comeau-style mascot peek. A roundel of Tarry slides in from the
 * page edge at ~40 % scroll, half-tucked behind the edge like he's
 * peeking around the corner. Hover (or tap on touch) expands a small
 * speech-bubble panel with an inline subscribe pill. × dismisses for
 * 30 days via localStorage.
 *
 * Asset is prop-driven so the photo cutout ships today and the
 * illustrated SVG / 3D version can drop in with no layout change.
 *
 * Coexistence: the global studio-voice NewsletterPeek auto-suppresses
 * on /blog/[slug] routes so the two don't fight for the same corner.
 */
export function TarryPeekABoo({
  src = "/tarry-portrait.jpg",
  alt = "Tarry Singh",
  slug,
  side = "right",
}: Props) {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  // Mount-time eligibility + scroll listener.
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const at = Number(raw)
        if (Number.isFinite(at) && Date.now() - at < DISMISS_WINDOW_MS) return
      }
    } catch {
      // localStorage disabled — treat as fresh.
    }

    const onScroll = () => {
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      )
      const scrollable = docHeight - window.innerHeight
      if (scrollable < MIN_SCROLLABLE_PX) return
      const progress = window.scrollY / scrollable
      if (progress >= SCROLL_THRESHOLD) {
        setVisible(true)
        window.removeEventListener("scroll", onScroll)
      }
    }
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
          source: slug ? `blog-tarry-peek:${slug}` : "blog-tarry-peek",
        }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      setStatus("sent")
      setMessage("Filed. See you in the next one.")
      setEmail("")
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

  // When tucked: ~70 % of the avatar pokes out from the edge (Tarry's
  // face fully visible; only the back of the head behind the edge).
  // When expanded: the whole avatar + speech bubble slide fully in.
  const isRight = side === "right"
  const tuckedTransform = isRight
    ? "translateX(30%)"
    : "translateX(-30%)"
  const expandedTransform = "translateX(0)"
  const transform = expanded ? expandedTransform : tuckedTransform

  return (
    <div
      ref={wrapperRef}
      role="region"
      aria-label="Subscribe to Dispatches — Tarry peeks in"
      className={`fixed top-1/2 z-50 print:hidden ${isRight ? "right-0" : "left-0"}`}
      style={{
        transform: `translateY(-50%)`,
        transition: "transform 480ms cubic-bezier(0.22,1,0.36,1)",
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Local keyframes for the initial slide-in. */}
      <style>{`
        @keyframes syn-mascot-rise {
          0%   { opacity: 0; transform: translateX(${isRight ? "100%" : "-100%"}); }
          100% { opacity: 1; transform: ${tuckedTransform}; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-syn-mascot-noanim] { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div
        data-syn-mascot-noanim
        className={`flex items-center gap-3 ${isRight ? "flex-row-reverse" : "flex-row"}`}
        style={{
          transform,
          transition: "transform 380ms cubic-bezier(0.22,1,0.36,1)",
          animation: "syn-mascot-rise 520ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* The avatar roundel — always visible (when tucked, half of
            it shows; the rest is past the viewport edge). */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Hide subscribe pill" : "Show subscribe pill"}
          className="group relative h-[112px] w-[112px] cursor-pointer focus:outline-none"
          style={{
            transform: isRight ? "rotate(-6deg)" : "rotate(6deg)",
            transformOrigin: "center",
            filter: "drop-shadow(0 14px 28px rgba(15,23,42,0.32))",
          }}
        >
          <div
            className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-gold-300 bg-white transition-transform duration-300 group-hover:scale-[1.04]"
            style={{
              boxShadow:
                "inset 0 0 0 2px rgba(255,255,255,0.65), 0 0 0 1px rgba(184,134,11,0.45)",
            }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="112px"
              priority={false}
              style={{
                objectFit: "cover",
                objectPosition: "center 26%",
              }}
            />
          </div>
          {/* small "psst" kicker that hovers next to the tucked avatar
              so a casual scroller knows what it is without expanding */}
          {!expanded ? (
            <span
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-navy-900 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-white opacity-90"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                [isRight ? "right" : "left"]: "calc(100% + 8px)",
              }}
            >
              psst
            </span>
          ) : null}
        </button>

        {/* The speech-bubble panel — only mounted/visible when expanded
            so it doesn't capture pointer events while tucked.
            Width is the smaller of 320 px and (viewport − avatar − gap
            − safety-margin) so the bubble never extends past the
            opposite viewport edge on mobile. */}
        {expanded ? (
          <div
            className="relative rounded-2xl border border-navy-200/80 bg-white p-4 shadow-[0_18px_44px_-22px_rgba(15,23,42,0.4),0_2px_4px_rgba(15,23,42,0.06)]"
            style={{
              // 112 (avatar) + 12 (gap) + 16 (edge margin) = 140 px
              width: "min(320px, calc(100vw - 140px))",
              animation:
                "syn-mascot-rise 320ms cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-x-4 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(184,134,11,0.55) 50%, transparent 100%)",
              }}
            />

            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss for 30 days"
              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="mb-2 flex items-center gap-2">
              <span
                className="text-[9.5px] font-semibold uppercase tracking-[0.32em] text-gold-700"
                style={{
                  fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                }}
              >
                Psst, from Tarry
              </span>
            </div>

            <h3
              className="mb-2 text-[1.05rem] leading-[1.2] text-navy-900 tracking-tight"
              style={{
                fontFamily: "var(--font-display), 'Gloock', serif",
              }}
            >
              Tomorrow&apos;s Dispatch in your inbox?
            </h3>

            <p
              className="mb-3 text-[0.82rem] italic leading-relaxed text-navy-600"
              style={{
                fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
              }}
            >
              One a day, never a funnel.
            </p>

            <form
              onSubmit={onSubmit}
              noValidate
              className="flex flex-col gap-1.5"
            >
              <label htmlFor="tarry-mascot-email" className="sr-only">
                Email address
              </label>
              <input
                id="tarry-mascot-email"
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
                className="min-h-[40px] w-full rounded-full border border-navy-200 bg-white px-3.5 py-2 text-sm text-navy-900 placeholder:text-navy-300 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300 disabled:opacity-60"
                style={{
                  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                }}
              />
              <button
                type="submit"
                disabled={status === "loading" || status === "sent"}
                className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-gold-400 bg-navy-900 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-navy-800 hover:border-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="mt-2 min-h-[1rem] text-[10px]"
              aria-live="polite"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                letterSpacing: "0.04em",
              }}
            >
              {message ? (
                <p
                  className={
                    status === "sent" ? "text-gold-700" : "text-rose-600"
                  }
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
        ) : null}
      </div>
    </div>
  )
}
