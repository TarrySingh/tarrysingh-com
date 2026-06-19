"use client"

import { useState, type ReactNode } from "react"

import { ChokepointParadox } from "@/components/blog/ChokepointParadox"
import { SKINS, SKIN_ORDER, fontVar, type SkinKey } from "@/components/blog/chokepoint-skins"

function Stage({ children, max = 1160 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

export default function ChokepointParadoxPage() {
  const [skin, setSkin] = useState<SkinKey>("atlas")
  const s = SKINS[skin]

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: s.pageBg }}>
      {/* AUDITION control — temporary; retires once a direction is chosen */}
      <div
        className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-2 px-5 pt-8"
        style={{ color: s.muted }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.18em",
            color: s.kicker,
          }}
        >
          ◷ Audition · pick a direction
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          {SKIN_ORDER.map((k) => {
            const active = k === skin
            return (
              <button
                key={k}
                onClick={() => setSkin(k)}
                aria-pressed={active}
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12,
                  padding: "6px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  color: active ? s.accent : s.ink,
                  border: `1px solid ${active ? s.accent : `rgba(${s.inkRGB}, 0.28)`}`,
                  background: active ? `rgba(${s.inkRGB}, 0.06)` : "transparent",
                }}
              >
                {SKINS[k].name}
              </button>
            )
          })}
        </div>
      </div>

      <main className="mx-auto w-full px-5 pb-32 pt-12 sm:pt-16">
        <header className="cp-hero-rise mx-auto max-w-3xl text-center">
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              letterSpacing: "0.2em",
              color: s.kicker,
            }}
          >
            Synaptic · a field guide to the machine
          </p>

          <h1
            className="mt-7 text-balance text-4xl leading-[1.04] sm:text-6xl"
            style={{ color: s.ink, fontFamily: fontVar(s.titleFont), fontWeight: 800 }}
          >
            The Chokepoint Paradox
          </h1>

          <p
            className="mt-5 text-sm font-semibold uppercase sm:text-base"
            style={{ color: s.accent, letterSpacing: "0.22em", fontFamily: "var(--font-mono), monospace" }}
          >
            Europe Holds the Key, Washington Owns the Lock
          </p>

          <p
            className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed"
            style={{ color: s.muted, fontFamily: "var(--font-serif), serif" }}
          >
            Europe is the richest savings bloc on Earth and Wall Street&rsquo;s biggest charity case. It
            trains the engineers, writes the papers, owns the one irreplaceable machine in the chip supply
            chain &mdash; and ships the equity, the talent and a quarter-trillion euros a year west to the
            firms that out-compete it. This is not a failure of genius. It is a failure of nerve, and it has
            names.
          </p>

          <p className="mt-6 text-[13px]" style={{ color: s.muted, fontStyle: "italic" }}>
            {s.blurb}
          </p>
        </header>

        <section className="mt-16">
          <Stage>
            <ChokepointParadox skinKey={skin} />
          </Stage>
        </section>

        <p
          className="mx-auto mt-16 max-w-xl text-center text-[12px]"
          style={{ color: s.muted, fontFamily: "var(--font-mono), monospace", letterSpacing: "0.08em" }}
        >
          ◷ Flagship in assembly — 50 instruments, ~45,000 words. Switch skins above to audition the look.
        </p>
      </main>
    </div>
  )
}
