import Link from "next/link"
import { Cartouche } from "@/components/editorial/Cartouche"
import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { NumberedDisk } from "@/components/editorial/NumberedDisk"
import { SmallCaps } from "@/components/editorial/SmallCaps"
import { JumpNav } from "@/components/synaptic/JumpNav"

const SECTIONS = [
  { id: "abstract", label: "0 · Abstract" },
  { id: "problem", label: "1 · Problem" },
  { id: "solution", label: "2 · Solution" },
  { id: "novelty", label: "3 · Novelty" },
  { id: "validation", label: "4 · Validation" },
  { id: "applications", label: "5 · Applications" },
  { id: "uncertainty", label: "6 · Uncertainty" },
  { id: "thesis", label: "7 · Thesis" },
] as const

const proseStyle = {
  color: "var(--ink-cool)",
  fontSize: "var(--text-body)",
  lineHeight: 1.7,
  maxWidth: "62ch",
} as const

const proseInkStyle = { ...proseStyle, color: "var(--ink)" } as const

const sectionHeading = {
  color: "var(--ink)",
  fontSize: "2.2rem",
  lineHeight: 1.1,
  margin: 0,
  letterSpacing: "var(--track-display)",
} as const

const subHeading = {
  color: "var(--ink)",
  fontSize: "1.25rem",
  lineHeight: 1.2,
  margin: 0,
  letterSpacing: "0.02em",
} as const

const advances = [
  {
    numeral: "I",
    dimension: "Computational paradigm",
    body: "Distributed, event-driven computation inspired by biological circuits — not sequential and energy-intensive. Energy is spent only when events flow.",
  },
  {
    numeral: "II",
    dimension: "Learning capability",
    body: "Continuous, replay-consolidated adaptation that addresses catastrophic forgetting without separating training from deployment. The chip never stops learning.",
  },
  {
    numeral: "III",
    dimension: "Memory optimisation",
    body: "Hardware-embedded sleep-like processes — replay and synaptic scaling — for long-term memory formation and restructuring. Learning continues in the dark.",
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
]

export default function MemphisProposalPage() {
  return (
    <>
      {/* breadcrumb */}
      <header className="syn-column pb-8 pt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <Link
            href="/synaptic/memphis"
            className="syn-small-caps hover:opacity-80"
            style={{ color: "var(--memphis-amber-hi)" }}
          >
            ← Return to the chip plate
          </Link>
          <SmallCaps>MEMPHIS · the complete dossier</SmallCaps>
        </div>
        <Hairline className="mt-6" />
        <div className="mt-12 text-center">
          <SmallCaps>MEMPHIS · neuromorphic substrate</SmallCaps>
          <h1
            className="syn-display mt-6"
            style={{
              fontSize: "clamp(56px, 10vw, 132px)",
              letterSpacing: "0.08em",
              color: "var(--ink)",
              lineHeight: 1,
              margin: 0,
            }}
          >
            MEMPHIS
          </h1>
          <ItalicCaption className="mx-auto mt-5 max-w-3xl">
            A hippocampal · memristive · neuromorphic architecture — memory
            and computation co-localised on a self-organising substrate
            driven by two-phase replay dynamics.
          </ItalicCaption>
          <p
            className="syn-small-caps mt-3"
            style={{ color: "var(--ink-dim)", letterSpacing: "0.3em" }}
          >
            · post — von Neumann computing ·
          </p>
        </div>
      </header>

      {/* 0 Abstract */}
      <section id="abstract" className="syn-column space-y-6 pt-24">
        <SmallCaps>0 · Abstract</SmallCaps>
        <p style={proseInkStyle}>
          MEMPHIS is a neuromorphic chip that co-locates memory and
          computation through a self-organising memristive substrate
          driven by hippocampal-inspired two-phase dynamics — and is the
          first such system to demonstrate offline replay-driven memory
          consolidation on physical hardware.
        </p>
        <p style={proseStyle}>
          The decisive experiment is a small-scale memristive spiking
          network (a CA3-CA1 module) that performs associative recall and
          memory consolidation through replay-driven dynamics, achieving
          improved task performance after offline processing{" "}
          <em>without additional external input</em>. Adaptive learning
          and memory optimisation emerge directly from intrinsic system
          dynamics, not from conventional training pipelines.
        </p>
        <ItalicCaption className="max-w-3xl">
          Sister microsite to{" "}
          <Link
            href="/synaptic/symphony"
            style={{ color: "var(--symphony-violet-hi)" }}
          >
            SYMPHONY
          </Link>
          {" "}within the Synaptic Cartography series — both bet that the
          next computing era is biological, structured and auditable, not
          larger and more centralised.
        </ItalicCaption>
      </section>

      {/* 1 Problem */}
      <section id="problem" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>1 · The problem</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            The von Neumann bottleneck has run out of room
          </h2>
        </div>
        <p style={proseStyle}>
          Conventional computing architectures separate memory from
          processing across a high-bandwidth bus. Every operation pays for
          shuffling activations between the two — a cost that has come to
          dominate the energy budget of any system doing inference at
          scale. The bus is also where catastrophic forgetting lives,
          where training and deployment have to be separated, and where
          adaptive learning at the edge becomes impractical.
        </p>
        <p style={proseStyle}>
          The systems that escape this bottleneck — biological brains —
          do not separate memory from computation. They co-locate them.
          MEMPHIS asks whether the architectural principle that lets the
          mammalian hippocampus consolidate memories without retraining
          can be implemented in hardware as ultra-low-power,
          continuously-learning neuromorphic compute.
        </p>
      </section>

      {/* 2 Solution */}
      <section id="solution" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>2 · The solution</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Hippocampus on memristors, two phases, one die
          </h2>
        </div>
        <p style={proseStyle}>
          MEMPHIS implements a two-phase computational paradigm on a
          self-organising memristive crossbar. Online, event-driven
          processing for real-time interaction. Offline, replay-driven
          consolidation for memory optimisation and generalisation. Both
          phases live on the same physical substrate. The crossbar
          itself is the memory <em>and</em> the compute: each memristor
          intersection stores a synaptic weight and performs analogue
          multiply-accumulate in place.
        </p>
        <p style={proseStyle}>
          A CA3-CA1 module sits at the centre of the die — the canonical
          hippocampal motif transposed to silicon. The CA3 recurrent
          collaterals implement an auto-associative network capable of
          pattern completion from partial cues. The CA1 layer compares
          the reconstructed prediction against current input and signals
          novelty, mismatch, and drive for replay.
        </p>
      </section>

      {/* 3 Novelty */}
      <section id="novelty" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>3 · Five advances beyond the state of the art</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Where each dimension departs
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {advances.map((a) => (
            <div key={a.numeral} className="space-y-3">
              <NumberedDisk number={a.numeral} tone="amber" size={56} />
              <h3 className="syn-display" style={subHeading}>
                {a.dimension}
              </h3>
              <p
                style={{
                  color: "var(--ink-cool)",
                  fontSize: "0.96rem",
                  lineHeight: 1.6,
                }}
              >
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Validation */}
      <section id="validation" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>4 · The decisive experiment</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            CA3 ↔ CA1 module — recall, replay, consolidation
          </h2>
        </div>
        <Cartouche title="Validation protocol" meta="proof of principle">
          <p style={proseInkStyle}>
            A small-scale memristive spiking network (the CA3-CA1 module
            visible at the centre of the chip plate) performs associative
            recall on a held-out test set. The system then enters an
            offline phase — no external input, only intrinsic dynamics
            replaying the stored traces. After the offline phase, the
            same test set is re-evaluated. The expected result: improved
            recall performance, achieved without further training data.
          </p>
        </Cartouche>
        <p style={proseStyle}>
          This is the proof of principle. It demonstrates — in physical
          hardware, not in simulation — that adaptive learning and memory
          optimisation can emerge from intrinsic system dynamics. If the
          experiment lands, the architectural principle generalises; if
          it does not, the failure mode is informative for the
          next-generation memristive design.
        </p>
      </section>

      {/* 5 Applications */}
      <section id="applications" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>5 · Industry applications</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Where ultra-low-power adaptive compute changes the unit economics
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              tag: "Edge AI · IoT",
              title: "Inference under µW budgets",
              body: "Battery-powered or energy-harvesting devices that need on-device adaptation — environmental sensors, agricultural monitoring, condition-based maintenance. Today's silicon either does inference (small, dumb) or learning (large, plugged-in). MEMPHIS does both within the energy budget of a coin cell.",
            },
            {
              tag: "Autonomous robotics",
              title: "Continuous adaptation in the field",
              body: "Mobile platforms — drones, agricultural robots, undersea vehicles — that cannot afford retraining cycles in the cloud and cannot afford catastrophic forgetting when the environment shifts. The hippocampal-replay primitive maps onto exactly this constraint.",
            },
            {
              tag: "Always-on perception",
              title: "Speech · vision · proprioception",
              body: "Voice interfaces, security cameras, wearable health monitors that need to update their models against the user's specific context over months and years. MEMPHIS's two-phase paradigm lets adaptation happen during idle / sleep cycles without paying the always-on inference cost.",
            },
            {
              tag: "Defence and aerospace",
              title: "Constrained-environment adaptation",
              body: "Satellite-borne autonomy, in-pipeline robotics, anywhere bandwidth back to a training cluster is limited or contested. The system that learns in the dark is the system that survives radio silence.",
            },
          ].map((item) => (
            <div
              key={item.tag}
              className="rounded-xl border p-5"
              style={{
                borderColor: "rgba(200,180,255,0.18)",
                background:
                  "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <SmallCaps>{item.tag}</SmallCaps>
              <h3
                className="syn-display mt-3"
                style={{ ...subHeading, fontSize: "1.1rem" }}
              >
                {item.title}
              </h3>
              <p
                className="mt-3"
                style={{
                  color: "var(--ink-cool)",
                  lineHeight: 1.6,
                  fontSize: "0.92rem",
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 Uncertainty */}
      <section id="uncertainty" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>6 · Critical uncertainty</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Device-to-device tolerance versus the replay dynamics
          </h2>
        </div>
        <Cartouche title="The honest question" meta="MEMPHIS brief">
          <p style={proseInkStyle}>
            Whether memristive devices can be matched and stabilised at
            the precision required by the replay-driven dynamics. The
            biology demands a tighter device-to-device tolerance than
            today&rsquo;s memristive arrays routinely deliver. The
            engineering question is whether self-organisation can close
            that gap inside the operating regime, not whether it must.
            We expect the proof of principle to land for the CA3-CA1
            module; scaling beyond it depends on memristive-device
            roadmaps that are themselves on a 3–5 year horizon.
          </p>
        </Cartouche>
      </section>

      {/* 7 Investment thesis */}
      <section id="thesis" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>7 · The investment thesis</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Why MEMPHIS belongs in the next deep-tech portfolio
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: "I",
              h: "Architectural, not material",
              b: "MEMPHIS does not require a new memristive material to win; it requires the architectural property that bio-replay imposes on the device array. The device roadmap is being driven independently by half a dozen industrial labs — MEMPHIS rides that wave.",
            },
            {
              n: "II",
              h: "Energy maths is unforgiving",
              b: "The total cost of cloud inference is now visible to every CFO with a foundation-model budget. A 100× energy reduction at the edge is not a feature; it is the precondition for entire product categories that today are infeasible.",
            },
            {
              n: "III",
              h: "Sister to SYMPHONY",
              b: "MEMPHIS is the hardware substrate that SYMPHONY's neuromodulated software substrate eventually needs. Co-developed roadmaps; shared editorial discipline; one consortium philosophy. A portfolio bet, not a single shot.",
            },
          ].map((c) => (
            <div
              key={c.n}
              className="rounded-xl border p-5"
              style={{
                borderColor: "rgba(255,210,150,0.35)",
                background:
                  "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow:
                  "0 0 0 1px rgba(255,210,150,0.18), 0 12px 40px rgba(0,0,0,0.45)",
              }}
            >
              <span
                className="syn-display"
                style={{
                  fontSize: "2rem",
                  color: "var(--memphis-amber-hi)",
                  lineHeight: 1,
                }}
              >
                {c.n}
              </span>
              <h3
                className="syn-display mt-2"
                style={{
                  ...subHeading,
                  fontSize: "1.1rem",
                  color: "var(--ink)",
                }}
              >
                {c.h}
              </h3>
              <p
                className="mt-3"
                style={{
                  color: "var(--ink-cool)",
                  lineHeight: 1.6,
                  fontSize: "0.92rem",
                }}
              >
                {c.b}
              </p>
            </div>
          ))}
        </div>
        <p style={proseStyle}>
          MEMPHIS is at TRL 1–4. The deliverable is a proof of principle,
          not a product. The value is in the IP position, the device-co-
          design relationship with the memristive labs that are 3–5 years
          ahead of where the field expects them to be, and the
          architectural priority over any team that arrives at the
          insight later.
        </p>
      </section>

      <footer className="syn-column pb-24 pt-40 text-center">
        <ItalicCaption className="mx-auto max-w-2xl">
          Memory and computation, co-localised.
        </ItalicCaption>
        <div className="pt-10">
          <Link
            href="/synaptic/memphis"
            className="syn-small-caps hover:opacity-80"
            style={{ color: "var(--memphis-amber-hi)" }}
          >
            ← Return to the chip plate
          </Link>
        </div>
      </footer>

      <JumpNav sections={SECTIONS} accentVar="--memphis-amber-hi" />
    </>
  )
}
