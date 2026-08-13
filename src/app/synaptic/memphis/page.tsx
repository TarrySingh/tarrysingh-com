import Image from "next/image"
import Link from "next/link"
import chipPlate from "@proposals/MEMPHIS/plates/plate-I-chip.png"
import { Cartouche } from "@/components/editorial/Cartouche"
import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { NumberedDisk } from "@/components/editorial/NumberedDisk"
import { SmallCaps } from "@/components/editorial/SmallCaps"
import { Ca3Ca1Circuit } from "@/components/synaptic/Ca3Ca1Circuit"
import { ChipPlate } from "@/components/synaptic/ChipPlate"
import { EnergyGradient } from "@/components/synaptic/EnergyGradient"
import { JumpNav } from "@/components/synaptic/JumpNav"
import { StdpWindow } from "@/components/synaptic/StdpWindow"
import { SynapticSubscribe } from "@/components/synaptic/SynapticSubscribe"
import { TwoPhaseDynamics } from "@/components/synaptic/TwoPhaseDynamics"

const SECTIONS = [
  { id: "breakthrough", label: "I · Breakthrough" },
  { id: "circuit", label: "II · Circuit" },
  { id: "stdp", label: "III · STDP" },
  { id: "phases", label: "IV · Phases" },
  { id: "energy", label: "V · Energy" },
  { id: "advances", label: "VI · Advances" },
  { id: "vision", label: "VII · Vision" },
] as const

const advances = [
  {
    numeral: "I",
    dimension: "Computational paradigm",
    body: "Distributed, event-driven computation inspired by biological circuits, not sequential and energy-intensive.",
  },
  {
    numeral: "II",
    dimension: "Learning capability",
    body: "Continuous, replay-consolidated adaptation that addresses catastrophic forgetting without separating training from deployment.",
  },
  {
    numeral: "III",
    dimension: "Memory optimisation",
    body: "Hardware-embedded sleep-like processes, replay and synaptic scaling, for long-term memory formation and restructuring.",
  },
  {
    numeral: "IV",
    dimension: "Hardware substrate",
    body: "Self-organising memristive systems as a physically grounded implementation of synaptic plasticity, targeting competitive energy efficiency and high integration density.",
  },
  {
    numeral: "V",
    dimension: "System-level functionality",
    body: "Biologically-inspired modulatory pathways for prioritisation and adaptive memory processing, beyond current neuromorphic implementations.",
  },
] as const

export default function MemphisPage() {
  return (
    <>
      {/* studio header */}
      <header className="syn-column pt-16">
        <div className="flex items-start justify-between syn-small-caps" style={{ color: "var(--ink-dim)" }}>
          <div>
            <div style={{ color: "var(--ink)", letterSpacing: "0.2em", fontSize: "0.78rem" }}>
              PLATE  I  ·  MMXXVI
            </div>
            <div className="mt-1">Anno 2026 · Folio 1.2.2</div>
          </div>
          <div className="text-right">
            <div style={{ color: "var(--ink)", letterSpacing: "0.2em", fontSize: "0.78rem" }}>
              FIG. 1.2.2
            </div>
            <div className="mt-1">Core science → technology</div>
            <div>breakthrough</div>
          </div>
        </div>
        <Hairline className="mt-4" />

        {/* title block — above the plate */}
        <div className="mt-12 text-center">
          <h1
            className="syn-display"
            style={{
              fontSize: "clamp(72px, 12vw, 180px)",
              letterSpacing: "0.08em",
              color: "var(--ink)",
              lineHeight: 1,
              margin: 0,
            }}
          >
            MEMPHIS
          </h1>
          <ItalicCaption className="mx-auto mt-4 max-w-3xl" >
            a hippocampal · memristive · neuromorphic architecture
          </ItalicCaption>
          <p
            className="syn-small-caps mt-2"
            style={{
              color: "var(--ink-dim)",
              letterSpacing: "0.3em",
            }}
          >
            · study of a synaptic substrate ·
          </p>
        </div>
      </header>

      {/* hero plate */}
      <section className="px-6 pb-12 pt-16 sm:px-12 lg:px-24 print:hidden">
        <ChipPlate />
      </section>

      <figure className="relative hidden w-full print:block">
        <Image
          src={chipPlate}
          alt="MEMPHIS Plate I, a hippocampal-memristive chip plate: amber and rose memristor cells over a ceramic substrate with a silicon die, set in the MEMPHIS warm-midnight palette."
          sizes="100vw"
          placeholder="blur"
          className="block h-auto w-full"
        />
      </figure>

      <div className="syn-column">
        <Hairline className="my-16" />
      </div>

      <section id="breakthrough" className="syn-column space-y-8">
        <SmallCaps>I · The core breakthrough</SmallCaps>
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          The core breakthrough of MEMPHIS lies in the integration of
          hippocampal-inspired computational principles with a
          self-organising memristive hardware substrate, enabling a new
          class of ultra-low-power, adaptive computing systems in which
          memory and computation are co-localised.
        </p>
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          This is a fundamental departure from conventional architectures,
          in which processing and memory sit on opposite sides of a bus.
          MEMPHIS implements a two-phase computational paradigm, online
          event-driven processing for real-time interaction; offline
          replay-driven consolidation for memory optimisation, inside
          the same physical system.
        </p>
        <ItalicCaption className="max-w-3xl">
          The decisive validation: a small-scale memristive spiking network
          (CA3-CA1) performs associative recall and replay-driven
          consolidation, improving task performance after offline
          processing without further external input.
        </ItalicCaption>
      </section>

      {/* Plate M-III — circuit anatomy */}
      <section id="circuit" className="syn-column space-y-6 pt-32">
        <div className="space-y-3">
          <SmallCaps>II · The circuit MEMPHIS reproduces</SmallCaps>
          <p style={{ color: "var(--ink-cool)", lineHeight: 1.6, maxWidth: "62ch" }}>
            Six labelled circuit motifs anchor the device-co-design problem.
            Hover any node to read its role; the incident edges light up to
            show its couplings to the rest of the substrate.
          </p>
        </div>
        <Ca3Ca1Circuit />
      </section>

      {/* Plate M-I — STDP window */}
      <section id="stdp" className="syn-column space-y-6 pt-32">
        <div className="space-y-3">
          <SmallCaps>III · The learning primitive</SmallCaps>
          <p style={{ color: "var(--ink-cool)", lineHeight: 1.6, maxWidth: "62ch" }}>
            Move the cursor across the curve. A pre-synaptic spike that
            precedes a post-synaptic spike strengthens the connection; reverse
            the order and the connection weakens. MEMPHIS demands the
            memristive substrate produce this window <em>intrinsically</em>{" "}
            from device physics, not from a software training rule applied
            over the top.
          </p>
        </div>
        <StdpWindow />
      </section>

      {/* Plate M-II — two-phase dynamics */}
      <section id="phases" className="syn-column space-y-6 pt-32">
        <div className="space-y-3">
          <SmallCaps>IV · Two phases, one substrate</SmallCaps>
          <p style={{ color: "var(--ink-cool)", lineHeight: 1.6, maxWidth: "62ch" }}>
            Online events drive sparse, salient computation. Offline intrinsic
            dynamics replay and consolidate, without external input.
            One physical substrate, two regimes.
          </p>
        </div>
        <TwoPhaseDynamics />
      </section>

      {/* Plate M-V — energy gradient */}
      <section id="energy" className="syn-column space-y-6 pt-32">
        <div className="space-y-3">
          <SmallCaps>V · The energy gradient</SmallCaps>
          <p style={{ color: "var(--ink-cool)", lineHeight: 1.6, maxWidth: "62ch" }}>
            Per-synaptic-event energy on a log axis. GPU AI sits six orders
            of magnitude above mammalian cortex. MEMPHIS targets the
            biological benchmark, three orders below today&rsquo;s best
            neuromorphic silicon.
          </p>
        </div>
        <EnergyGradient />
      </section>

      <section id="advances" className="syn-column space-y-10 pt-32">
        <SmallCaps>VI · Five advances beyond the state of the art</SmallCaps>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {advances.map((a) => (
            <div key={a.numeral} className="space-y-4">
              <NumberedDisk number={a.numeral} tone="amber" size={56} />
              <h3
                className="syn-display"
                style={{
                  fontSize: "1.4rem",
                  color: "var(--ink)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {a.dimension}
              </h3>
              <p style={{ color: "var(--ink-cool)", lineHeight: 1.6 }}>
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="vision" className="syn-column space-y-8 pt-32">
        <SmallCaps>VII · Contribution to the long-term vision</SmallCaps>
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          A hippocampal-inspired neuromorphic system with integrated
          learning and memory consolidation is a concrete step toward
          post–von-Neumann computing, paradigms in which intelligence
          emerges from the interaction between computation, memory and
          physical substrate, not from their separation.
        </p>
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          The proposed system establishes three things at once: the
          scientific basis for replay-driven learning in artificial
          systems, the technological feasibility of ultra-low-power
          adaptive hardware, and a scalable framework for future
          brain-inspired architectures in AI and robotics.
        </p>
        <ItalicCaption className="max-w-3xl">
          The project focuses on a constrained hippocampal module, but
          the principles developed here are directly extendable to more
          complex cognitive systems, embedded inside the dynamics of the
          physical hardware itself.
        </ItalicCaption>
      </section>

      <section className="syn-column pt-32">
        <Cartouche title="The critical uncertainty" meta="MEMPHIS brief">
          <p
            style={{
              color: "var(--ink)",
              fontSize: "var(--text-body)",
              lineHeight: 1.6,
            }}
          >
            Whether memristive devices can be matched and stabilised at
            the precision required by the replay-driven dynamics. The
            biology demands a tighter device-to-device tolerance than
            today&rsquo;s memristive arrays routinely deliver; the
            engineering question is whether self-organisation can close
            that gap inside the operating regime, not whether it must.
          </p>
        </Cartouche>
      </section>

      <section className="syn-column pt-24 text-center">
        <SmallCaps>VIII · Read the full submission</SmallCaps>
        <div className="mx-auto mt-6 max-w-2xl">
          <Link
            href="/synaptic/memphis/proposal"
            className="block rounded-2xl border p-8 transition-opacity hover:opacity-90"
            style={{
              borderColor: "rgba(255,210,150,0.45)",
              background:
                "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow:
                "0 0 0 1px rgba(255,210,150,0.18), 0 12px 40px rgba(0,0,0,0.45)",
            }}
          >
            <span
              className="syn-display block"
              style={{
                fontSize: "1.6rem",
                color: "var(--memphis-amber-hi)",
                letterSpacing: "var(--track-display)",
                lineHeight: 1.2,
              }}
            >
              The full MEMPHIS proposal →
            </span>
            <span
              className="syn-small-caps mt-3 block"
              style={{ color: "var(--ink-dim)" }}
            >
              Problem · solution · novelty · validation · applications · investment thesis
            </span>
          </Link>
        </div>
      </section>

      <div className="syn-column">
        <SynapticSubscribe />
      </div>

      <footer className="syn-column pb-24 pt-32 text-center">
        <ItalicCaption className="mx-auto max-w-2xl">
          Memory and computation, co-localised.
        </ItalicCaption>
      </footer>

      <JumpNav sections={SECTIONS} accentVar="--memphis-amber-hi" />
    </>
  )
}
