import Link from "next/link"
import type { ReactNode } from "react"

import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { SmallCaps } from "@/components/editorial/SmallCaps"
import { JumpNav } from "@/components/synaptic/JumpNav"
import { FullDeck } from "@/components/synaptic/FullDeck"

import { TwentyFortyPlanisphere } from "@/components/blog/TwentyFortyPlanisphere"
import { ThreeErasOfSoftware } from "@/components/blog/ThreeErasOfSoftware"
import { AILongArc } from "@/components/blog/AILongArc"
import { ComputePricePerformance } from "@/components/blog/ComputePricePerformance"
import { CostOfIntelligence } from "@/components/blog/CostOfIntelligence"
import { EnergyScissors } from "@/components/blog/EnergyScissors"
import { FirmMorph } from "@/components/blog/FirmMorph"
import { OutputPerPerson } from "@/components/blog/OutputPerPerson"
import { HumanoidAdoption } from "@/components/blog/HumanoidAdoption"
import { RobotaxiCostPerMile } from "@/components/blog/RobotaxiCostPerMile"
import { GenomeCostCurve } from "@/components/blog/GenomeCostCurve"
import { OffWorldStack } from "@/components/blog/OffWorldStack"
import { AbundanceProjection } from "@/components/blog/AbundanceProjection"
import { SilverThread } from "@/components/blog/SilverThread"
import { Convergence } from "@/components/blog/Convergence"

const SECTIONS = [
  { id: "thread", label: "· The Silver Thread" },
  { id: "eras", label: "I · Three Eras" },
  { id: "long-arc", label: "II · The Long Arc" },
  { id: "curves", label: "III · Two Curves" },
  { id: "firm", label: "IV · The Firm" },
  { id: "off-screen", label: "V · Off the Screen" },
  { id: "biology", label: "VI · Biology" },
  { id: "off-world", label: "VII · Off-World" },
  { id: "abundance", label: "VIII · Abundance" },
  { id: "deck", label: "IX · Full Deck" },
] as const

const ESSAY = "/blog/software-3-0-age-of-hyper-automation"

/** A wide, breakout-neutralised stage for one instrument. Rendered eagerly
 *  (like the blog) so section anchors land precisely — `minHeight` is accepted
 *  for call-site intent but no longer reserves a lazy placeholder. */
function Stage({
  max = 1280,
  children,
}: {
  minHeight?: number
  max?: number
  children: ReactNode
}) {
  return (
    <div className="sw3-gallery mx-auto w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/** A gallery room: numbered kicker + a short intro, then its instrument(s). */
function Room({
  id,
  kicker,
  children,
  intro,
}: {
  id: string
  kicker: string
  intro: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className="pt-32">
      <div className="syn-column space-y-6">
        <SmallCaps>{kicker}</SmallCaps>
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          {intro}
        </p>
      </div>
      <div className="mt-12 space-y-16">{children}</div>
    </section>
  )
}

export default function Software3Page() {
  return (
    <div data-read-mode="dark" style={{ background: "transparent" }}>
      {/* ── Folio header ──────────────────────────────────────────── */}
      <header className="syn-column pt-16">
        <div className="flex items-baseline justify-between gap-6">
          <div>
            <SmallCaps>Software 3.0 · MMXXVI</SmallCaps>
            <p className="mt-1" style={{ color: "var(--ink-dim)" }}>
              An age of hyper-automation
            </p>
          </div>
          <div className="text-right">
            <SmallCaps>Folio III</SmallCaps>
            <p className="mt-1" style={{ color: "var(--ink-dim)" }}>
              Synaptic Cartography
            </p>
          </div>
        </div>
        <Hairline className="mt-4" />
      </header>

      {/* ── Hero — the title block + the 2040 Planisphere ─────────── */}
      <section id="top" className="sw3-hero-rise">
        <div className="syn-column pt-16 text-center">
          <SmallCaps>Plate I · The instrument</SmallCaps>
          <h1
            className="syn-display mx-auto mt-6"
            style={{
              fontSize: "clamp(2.75rem, 8vw, 7rem)",
              lineHeight: 1.02,
              color: "var(--ink)",
            }}
          >
            Software 3.0
          </h1>
          <p
            className="mx-auto mt-5"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "clamp(1.05rem, 2.4vw, 1.6rem)",
              color: "var(--ink-soft)",
              maxWidth: "30ch",
            }}
          >
            The age of hyper-automation — a map to 2040.
          </p>
          <ItalicCaption className="mx-auto mt-6 max-w-2xl">
            Thirteen instruments from the essay, at full size and fully alive.
            Drag the year-hand below from 2025 to 2040 — each ring is a frontier,
            each node a forecast on the record, lighting as it comes due.
          </ItalicCaption>
        </div>

        <div className="mt-12">
          <div
            className="sw3-gallery mx-auto w-full px-2 sm:px-4"
            style={{ maxWidth: 880 }}
          >
            <TwentyFortyPlanisphere />
          </div>
        </div>
      </section>

      {/* ── Overture — The Silver Thread (the flagship new centerpiece) ── */}
      <section id="thread" className="pt-24">
        <div className="syn-column space-y-6 text-center">
          <SmallCaps>Plate II · The silver thread</SmallCaps>
          <h2
            className="syn-display mx-auto"
            style={{
              fontSize: "clamp(1.9rem, 4.5vw, 3.25rem)",
              lineHeight: 1.06,
              color: "var(--ink)",
            }}
          >
            One intent, cascading outward
          </h2>
          <p
            style={{
              color: "var(--ink-cool)",
              fontSize: "var(--text-body)",
              lineHeight: 1.6,
              maxWidth: "62ch",
              marginInline: "auto",
            }}
          >
            The whole essay in one gesture. A single stated intent at the apex,
            its signal descending and branching through six frontiers, reaching
            one shell further every year. This is the thread the rings are strung
            on — the silver lining of the title.
          </p>
        </div>
        <div className="mt-10">
          <Stage minHeight={780} max={1180}>
            <SilverThread />
          </Stage>
        </div>
      </section>

      <div className="syn-column">
        <Hairline className="my-20" />
      </div>

      {/* ── The gallery rooms ─────────────────────────────────────── */}
      <Room
        id="eras"
        kicker="I · Three eras of software"
        intro={
          <>
            Andrej Karpathy&rsquo;s lineage, in one gesture. Software 1.0 is
            written by hand; 2.0 is <em>trained</em> from data; 3.0 is{" "}
            <em>instructed</em> in plain intent. Tap through the three and watch
            the same particles re-form — code lattice, neural mesh, and a single
            spark of intent radiating to a fleet of agents.
          </>
        }
      >
        <Stage minHeight={640}>
          <ThreeErasOfSoftware />
        </Stage>
      </Room>

      <Room
        id="long-arc"
        kicker="II · The long arc"
        intro={
          <>
            Seventy years on a logarithmic spiral — from Rosenblatt&rsquo;s
            perceptron in 1958, through two AI winters drawn as cold valleys, to
            the agentic turn of the present. A field declared dead twice, and
            back faster each time. Hover a milestone to read it.
          </>
        }
      >
        <Stage minHeight={820} max={1180}>
          <AILongArc />
        </Stage>
      </Room>

      <Room
        id="curves"
        kicker="III · The two curves"
        intro={
          <>
            The whole argument rides on two exponentials: the price of raw
            computation, falling for a century across five paradigms, and the
            cost of a unit of <em>intelligence</em>, which collapsed a
            thousandfold in three years. Cheap, then nearly free — and then the
            bill the abundance runs up.
          </>
        }
      >
        <Stage minHeight={640}>
          <ComputePricePerformance />
        </Stage>
        <Stage minHeight={600}>
          <CostOfIntelligence />
        </Stage>
        <Stage minHeight={640}>
          <EnergyScissors />
        </Stage>
      </Room>

      <Room
        id="firm"
        kicker="IV · The firm, reinvented"
        intro={
          <>
            Coase said a firm grows until coordinating one more task inside it
            costs more than buying it on the market. When coordination becomes
            software, that boundary collapses. Slide the leverage and watch one
            bounded company dissolve into a constellation of agent-amplified
            micro-firms.
          </>
        }
      >
        <Stage minHeight={640}>
          <FirmMorph />
        </Stage>
      </Room>

      <Room
        id="off-screen"
        kicker="V · Automation leaves the screen"
        intro={
          <>
            The expensive part was always the mind, and the mind is now on a
            cost curve. As cheap intelligence acquires hands, the deflation that
            was confined to bits begins, for the first time, to reach atoms —
            output per person, the humanoid&rsquo;s arrival, the price of a mile.
          </>
        }
      >
        <Stage minHeight={620}>
          <OutputPerPerson />
        </Stage>
        <Stage minHeight={620}>
          <HumanoidAdoption />
        </Stage>
        <Stage minHeight={620}>
          <RobotaxiCostPerMile />
        </Stage>
      </Room>

      <Room
        id="biology"
        kicker="VI · Biology becomes engineering"
        intro={
          <>
            The cost of reading a genome fell faster than Moore&rsquo;s Law — a
            ten-million-fold collapse, and still falling. When biology turns into
            a read-write medium, medicine stops reacting to symptoms and starts
            reading the substrate.
          </>
        }
      >
        <Stage minHeight={620}>
          <GenomeCostCurve />
        </Stage>
      </Room>

      <Room
        id="off-world"
        kicker="VII · The industrial base goes off-world"
        intro={
          <>
            Drag the altitude-hand upward. The realistic off-world stack of 2040
            is three things and no more — orbital compute at pilot scale, the
            first genuine lunar footholds, and Mars at the very edge of
            plausibility. The higher you climb, the fainter the marks: that
            fading is the honesty.
          </>
        }
      >
        <Stage minHeight={980} max={720}>
          <OffWorldStack />
        </Stage>
      </Room>

      <Room
        id="abundance"
        kicker="VIII · The near-zero-marginal-cost economy"
        intro={
          <>
            The economy these curves are building: intelligence, energy and the
            reading of biology collapsing together toward a floor. When the
            things that were expensive become, one after another, nearly free to
            reproduce, the question stops being <em>will there be enough</em> and
            becomes <em>who will own it</em>.
          </>
        }
      >
        <Stage minHeight={620}>
          <AbundanceProjection />
        </Stage>
        <Stage minHeight={660}>
          <Convergence />
        </Stage>
      </Room>

      {/* ── IX · The full deck — the contact-sheet wall ───────────── */}
      <section id="deck" className="syn-column pt-32">
        <SmallCaps>IX · The full deck</SmallCaps>
        <p
          className="mt-6"
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          Fifteen instruments, one wall. Every plate in the gallery — tap a card
          to jump straight to it.
        </p>
        <div className="mt-10">
          <FullDeck />
        </div>
      </section>

      {/* ── Dossier ───────────────────────────────────────────────── */}
      <section className="syn-column pb-8 pt-32 text-center">
        <SmallCaps>Read on</SmallCaps>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Link
            href={ESSAY}
            className="group block rounded-xl border p-6 text-left transition-opacity hover:opacity-90"
            style={{ borderColor: "var(--sw3-hair)", background: "rgba(20,22,52,0.5)" }}
          >
            <SmallCaps>The essay</SmallCaps>
            <p className="syn-display mt-2" style={{ fontSize: "1.5rem", color: "var(--ink)" }}>
              Age of Hyper Automation →
            </p>
            <p className="mt-2" style={{ color: "var(--ink-cool)", fontSize: "0.95rem" }}>
              Fifteen thousand words on the path to 2040 — every instrument here,
              in its argument.
            </p>
          </Link>
          <Link
            href="/synaptic"
            className="group block rounded-xl border p-6 text-left transition-opacity hover:opacity-90"
            style={{ borderColor: "var(--sw3-hair)", background: "rgba(20,22,52,0.5)" }}
          >
            <SmallCaps>The studio</SmallCaps>
            <p className="syn-display mt-2" style={{ fontSize: "1.5rem", color: "var(--ink)" }}>
              Back to Synaptic →
            </p>
            <p className="mt-2" style={{ color: "var(--ink-cool)", fontSize: "0.95rem" }}>
              The other cartographies — SYMPHONY, MEMPHIS, and the substrate they
              share.
            </p>
          </Link>
        </div>
      </section>

      <footer className="syn-column pb-24 pt-20 text-center">
        <ItalicCaption className="mx-auto max-w-xl">
          Execution is becoming free. The deciding is not.
        </ItalicCaption>
      </footer>

      <JumpNav sections={SECTIONS} accentVar="--sw3-accent-hi" />
    </div>
  )
}
