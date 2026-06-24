import type { ReactNode } from "react"

import { ChokepointJumpNav } from "@/components/blog/ChokepointJumpNav"
import { ChokepointPrologue } from "@/components/blog/ChokepointPrologue"
import { OvertureDashboard } from "@/components/blog/OvertureDashboard"
import { ChokepointChapterOne } from "@/components/blog/ChokepointChapterOne"
import { ChokepointChapterTwo } from "@/components/blog/ChokepointChapterTwo"
import { ChokepointChapterThree } from "@/components/blog/ChokepointChapterThree"
import { ChokepointChapterFour } from "@/components/blog/ChokepointChapterFour"
import { ChokepointChapterFive } from "@/components/blog/ChokepointChapterFive"
import { ChokepointChapterSix } from "@/components/blog/ChokepointChapterSix"
import { ChokepointChapterSeven } from "@/components/blog/ChokepointChapterSeven"
import { ChokepointChapterEight } from "@/components/blog/ChokepointChapterEight"
import { ChokepointChapterNine } from "@/components/blog/ChokepointChapterNine"
import { ChokepointChapterTen } from "@/components/blog/ChokepointChapterTen"
import { ChokepointChapterEleven } from "@/components/blog/ChokepointChapterEleven"
import { ChokepointChapterTwelve } from "@/components/blog/ChokepointChapterTwelve"

/** A wide, breakout-neutralised stage for one instrument. `.cp-gallery`
 *  cancels the PlateFrame blog-column breakout margins. */
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
      <ChokepointJumpNav />

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

      {/* CHAPTER 1 — prose + V3/V4/V5, in essay flow */}
      <ChokepointChapterOne />

      {/* CHAPTER 2 — prose + V6/V7/V8, in essay flow */}
      <ChokepointChapterTwo />

      {/* CHAPTER 3 — prose + V9/V10/V11/V12, in essay flow */}
      <ChokepointChapterThree />

      {/* CHAPTER 4 — prose + V13/V14/V15, in essay flow */}
      <ChokepointChapterFour />

      {/* CHAPTER 5 — prose + V18/V19/V20, in essay flow */}
      <ChokepointChapterFive />

      {/* CHAPTER 6 — prose + V21/V22/V23, in essay flow */}
      <ChokepointChapterSix />

      {/* CHAPTER 7 — prose + V24/V25/V26, in essay flow */}
      <ChokepointChapterSeven />

      {/* CHAPTER 8 — prose + V27/V28/V29, in essay flow */}
      <ChokepointChapterEight />

      {/* CHAPTER 9 — prose + V30/V31/V32, in essay flow */}
      <ChokepointChapterNine />

      {/* CHAPTER 10 — prose + V33 / V34 treemap / V35 / V36, in essay flow */}
      <ChokepointChapterTen />

      {/* CHAPTER 11 — prose + V37/V38/V39, in essay flow */}
      <ChokepointChapterEleven />

      {/* CHAPTER 12 + CODA — prose + V40/V41/V42, the constructive turn */}
      <ChokepointChapterTwelve />

      <p
        className="mx-auto mt-24 max-w-xl text-center text-[12px]"
        style={{
          color: "var(--cp-muted, rgba(238,242,255,0.4))",
          fontFamily: "var(--font-mono), monospace",
          letterSpacing: "0.08em",
        }}
      >
        ◷ Spine complete — Prologue, 12 chapters &amp; Coda, ~40 instruments live; now deepening every chapter toward the ~45,000-word floor. Built one instrument at a time.
      </p>
    </main>
  )
}
