import type { ReactNode } from "react"

import { ChokepointPrologue } from "@/components/blog/ChokepointPrologue"
import { OvertureDashboard } from "@/components/blog/OvertureDashboard"
import { FourStrokeEngine } from "@/components/blog/FourStrokeEngine"
import { WealthTransferMinimap } from "@/components/blog/WealthTransferMinimap"
import { FromScratchGiants } from "@/components/blog/FromScratchGiants"
import { SeventeenHundredMeter } from "@/components/blog/SeventeenHundredMeter"
import { ValleyOfDeath } from "@/components/blog/ValleyOfDeath"
import { TwoClocks } from "@/components/blog/TwoClocks"

/** A wide, breakout-neutralised stage for one instrument. `.cp-gallery`
 *  cancels the PlateFrame blog-column breakout margins. */
function Stage({ children, max = 1160 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/** A gallery room: a centred kicker + short intro, then its instrument(s). */
function Room({ kicker, intro, children }: { kicker: string; intro: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-28 sm:mt-32">
      <div className="mx-auto max-w-2xl text-center">
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "var(--cp-wonder-hi, #f4cd86)",
          }}
        >
          {kicker}
        </p>
        <p
          className="mt-4 text-lg leading-relaxed"
          style={{ color: "var(--cp-muted, rgba(238,242,255,0.72))", fontFamily: "var(--font-serif), serif" }}
        >
          {intro}
        </p>
      </div>
      <div className="mt-10">
        <Stage>{children}</Stage>
      </div>
    </section>
  )
}

export default function ChokepointParadoxPage() {
  return (
    <main className="mx-auto w-full px-5 pb-32 pt-24 sm:pt-32">
      <header className="cp-hero-rise mx-auto max-w-3xl text-center">
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "var(--cp-wonder-hi, #f4cd86)",
          }}
        >
          Synaptic · a field guide to the machine
        </p>

        <h1
          className="syn-display mt-7 text-balance text-4xl font-extrabold leading-[1.04] sm:text-6xl"
          style={{ color: "var(--cp-ink, #eef2ff)" }}
        >
          The Chokepoint Paradox
        </h1>

        <p
          className="mt-5 text-sm font-semibold uppercase sm:text-base"
          style={{
            color: "var(--cp-leverage-hi, #9ad8ef)",
            letterSpacing: "0.22em",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          Europe Holds the Key, Washington Owns the Lock
        </p>

        <p
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed"
          style={{ color: "var(--cp-muted, rgba(238,242,255,0.72))", fontFamily: "var(--font-serif), serif" }}
        >
          Europe is the richest savings bloc on Earth and Wall Street&rsquo;s biggest charity case. It
          trains the engineers, writes the papers, owns the one irreplaceable machine in the chip supply
          chain &mdash; and ships the equity, the talent and a quarter-trillion euros a year west to the
          firms that out-compete it. This is not a failure of genius. It is a failure of nerve, and it has
          names.
        </p>
      </header>

      {/* V46 — the whole indictment at a glance */}
      <section className="mt-16">
        <Stage max={1100}>
          <OvertureDashboard />
        </Stage>
      </section>

      {/* PROLOGUE — prose + V1 + V2, in essay flow */}
      <ChokepointPrologue />

      {/* V3 + V4 + V5 — Chapter 1, the Netherlands canary (PREVIEW — prose to follow) */}
      <Room
        kicker="I · The Canary — the Netherlands in high resolution"
        intro="The country that builds the machine is Europe in miniature: the richest of savings, the best of science, and a polite, structural refusal to back itself. Three instruments — what the gap costs each citizen, where the research bleeds out, and why a 40-year strategy keeps resetting every four."
      >
        <SeventeenHundredMeter />
        <div className="mt-10">
          <ValleyOfDeath />
        </div>
        <div className="mt-10">
          <TwoClocks />
        </div>
      </Room>

      {/* V9 + V47 — the engine and where you are in it */}
      <Room
        kicker="III · The Standing Order"
        intro="Europe saves more than anyone and funds everyone but itself. Here is the machine that does it, four strokes to a turn, wider every cycle — and the toggle that runs it backwards."
      >
        <FourStrokeEngine />
        <div className="mt-10">
          <WealthTransferMinimap active={3} />
        </div>
      </Room>

      {/* V34 — the from-scratch giants, now vs the next wave */}
      <Room
        kicker="X · The Quarter-Trillion Tribute"
        intro="Count the companies built from scratch in the last 50 years that crossed $10bn. America mints them by the hundred; “under 50” quietly disqualifies most of Europe. Now flip to the next wave — the AI and space cohort — and watch the same machine run again."
      >
        <FromScratchGiants />
      </Room>

      <p
        className="mx-auto mt-24 max-w-xl text-center text-[12px]"
        style={{
          color: "var(--cp-muted, rgba(238,242,255,0.4))",
          fontFamily: "var(--font-mono), monospace",
          letterSpacing: "0.08em",
        }}
      >
        ◷ Flagship in assembly — 5 of 50 instruments, ~45,000 words to come. Built one instrument at a time.
      </p>
    </main>
  )
}
