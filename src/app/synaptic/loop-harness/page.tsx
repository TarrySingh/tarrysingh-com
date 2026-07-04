import type { ReactNode } from "react"

import { TheLoop } from "@/components/loop/TheLoop"
import { HarnessExploded } from "@/components/loop/HarnessExploded"
import { VerifierGap } from "@/components/loop/VerifierGap"
import { ContextRot } from "@/components/loop/ContextRot"
import { HarnessOfRecord } from "@/components/loop/HarnessOfRecord"

/**
 * THE ENGINE ROOM - Loop & Harness Engineering (Synaptic Plate V).
 * LH-P1 scaffold: page header + the two calibration exemplars (V1, V4).
 * The remaining thirteen instruments and the 30,000-word prose land in
 * LH-P2/P3. Route is noindex until ship (see layout.tsx).
 */

function Stage({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="lh-gallery mx-auto w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

export default function LoopHarnessPage() {
  return (
    <main className="mx-auto w-full px-5 pb-32 pt-24 sm:pt-32">
      <header className="lh-rise mx-auto max-w-3xl text-center">
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "var(--lh-signal-hi, #8df0b4)",
          }}
        >
          Synaptic · Plate V · work in progress
        </p>

        <h1
          className="syn-display mt-7 text-balance text-4xl font-extrabold leading-[1.04] sm:text-6xl"
          style={{ color: "var(--lh-ink, #e9f2ec)" }}
        >
          The Engine Room
        </h1>

        <p
          className="mt-5 text-sm font-semibold uppercase sm:text-base"
          style={{
            color: "var(--lh-verdict-hi, #f4cd86)",
            letterSpacing: "0.22em",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          Loop &amp; Harness Engineering
        </p>

        <p
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed"
          style={{
            color: "var(--lh-muted, rgba(233,242,236,0.66))",
            fontFamily: "var(--font-serif), serif",
          }}
        >
          Everyone argues about models. Whether a model ever does useful work is
          decided by two other things: the loop it runs in, and the standing
          structure that loop runs inside. This is a 30,000-word field manual for
          the engineers who will build both. Two calibration instruments are live
          below; thirteen more, and the prose, are under construction.
        </p>
      </header>

      {/* CALIBRATION · the two exemplars that set the bar for the fleet */}
      <section className="mt-20">
        <div className="mx-auto mb-2 max-w-3xl text-center">
          <span
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.24em",
              color: "var(--lh-muted, rgba(233,242,236,0.6))",
              textTransform: "uppercase",
            }}
          >
            The instruments · V1 to V5 live
          </span>
        </div>

        <Stage>
          <TheLoop />
        </Stage>

        <Stage>
          <HarnessExploded />
        </Stage>

        <Stage>
          <VerifierGap />
        </Stage>

        <Stage>
          <ContextRot />
        </Stage>

        <Stage>
          <HarnessOfRecord />
        </Stage>
      </section>

      <p
        className="mx-auto mt-24 max-w-xl text-center text-[12px]"
        style={{
          color: "var(--lh-muted, rgba(233,242,236,0.4))",
          fontFamily: "var(--font-mono), monospace",
          letterSpacing: "0.08em",
        }}
      >
        © 2026 tarrysingh.com
      </p>
    </main>
  )
}
