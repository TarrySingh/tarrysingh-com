import type { ReactNode } from "react"

import { SmallCaps } from "@/components/editorial/SmallCaps"
import { ChokepointParadox } from "@/components/blog/ChokepointParadox"

/** A wide, breakout-neutralised stage for one instrument (mirrors the
 *  Software-3 gallery's `Stage`). `.cp-gallery` cancels the PlateFrame
 *  blog-column breakout margins. */
function Stage({ children, max = 1160 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

export default function ChokepointParadoxPage() {
  return (
    <main className="mx-auto w-full px-5 pb-32 pt-24 sm:pt-32">
      <header className="cp-hero-rise mx-auto max-w-3xl text-center">
        <SmallCaps>Synaptic · A field guide to the machine</SmallCaps>

        <h1
          className="syn-display mt-7 text-balance text-4xl font-extrabold leading-[1.05] sm:text-6xl"
          style={{ color: "#eaf2ff" }}
        >
          The Chokepoint Paradox
        </h1>

        <p
          className="mt-5 text-sm font-semibold uppercase sm:text-base"
          style={{
            color: "var(--cp-leverage-hi, #7dd3fc)",
            letterSpacing: "0.22em",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          Europe Holds the Key, Washington Owns the Lock
        </p>

        <p
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed"
          style={{ color: "rgba(234,242,255,0.72)", fontFamily: "var(--font-serif), serif" }}
        >
          Europe is the richest savings bloc on Earth and Wall Street&rsquo;s biggest charity case. It
          trains the engineers, writes the papers, owns the one irreplaceable machine in the chip supply
          chain &mdash; and ships the equity, the talent and a quarter-trillion euros a year west to the
          firms that out-compete it. This is not a failure of genius. It is a failure of nerve, and it has
          names.
        </p>
      </header>

      <section className="mt-20">
        <Stage>
          <ChokepointParadox />
        </Stage>
      </section>

      <p
        className="mx-auto mt-16 max-w-xl text-center text-[12px]"
        style={{
          color: "rgba(234,242,255,0.4)",
          fontFamily: "var(--font-mono), monospace",
          letterSpacing: "0.08em",
        }}
      >
        ◷ Flagship in assembly — 50 instruments, ~45,000 words. Being built one instrument at a time.
      </p>
    </main>
  )
}
