import Link from "next/link"
import { Cartouche } from "@/components/editorial/Cartouche"
import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { NumberedDisk } from "@/components/editorial/NumberedDisk"
import { SmallCaps } from "@/components/editorial/SmallCaps"
import { JumpNav } from "@/components/synaptic/JumpNav"

const SECTIONS = [
  { id: "abstract", label: "0 · Abstract" },
  { id: "vision", label: "1 · Vision" },
  { id: "problem", label: "2 · Problem" },
  { id: "breakthrough", label: "3 · Breakthrough" },
  { id: "objectives", label: "4 · Objectives" },
  { id: "validation", label: "5 · Validation" },
  { id: "applications", label: "6 · Applications" },
  { id: "uncertainty", label: "7 · Uncertainty" },
  { id: "thesis", label: "8 · Thesis" },
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

const breakthroughs = [
  {
    n: "I",
    name: "Co-implementation of consolidation mechanisms",
    body: "STDP, replay-driven consolidation, two-phase processing and neuromodulation are interdependent components of a single biological memory mechanism — yet every existing approach implemented each in isolation. MEMPHIS is the first system where all four emerge from the intrinsic dynamics of a single physical substrate.",
  },
  {
    n: "II",
    name: "Stochastic memristive substrate with network-level properties",
    body: "Prior work treated memristive stochasticity, variability and nonlinear conductance updates as non-idealities to be mitigated. MEMPHIS inverts the premise: those device-level properties become the substrate of biological-like learning at network scale, rather than something to fight.",
  },
  {
    n: "III",
    name: "Physical convergence of substrate and computational principles",
    body: "Three classical barriers — STDP voltage-time integration vs. spike timing, CA3 attractor connectivity statistics, and memristive switching scales — are addressed not by waveform engineering but by physically co-designing devices and circuit motifs so that the hippocampal computational primitives are intrinsic to the material.",
  },
]

const objectives = [
  {
    n: "O1",
    name: "Biologically validated CA3 ↔ CA1 circuit model",
    threshold: "≥ 80 % of neurons match in vivo electrophysiology (firing rates, STDP weight changes, sharp-wave ripple statistics)",
    body: "A computational model reproducing associative encoding, novelty-gated updating, bidirectional replay, two-phase dynamics and neuromodulatory control. Verified against in vivo rat-hippocampus recordings.",
  },
  {
    n: "O2",
    name: "Self-organising memristive substrate",
    threshold: "Switching energy < 10 fJ per synaptic event · stable, reproducible switching · verified learning curves · power-law noise dynamics",
    body: "Memristive devices with synaptic properties physically compatible with the CA3 ↔ CA1 model — STDP timescales matching biology, physically differentiated excitatory and inhibitory analogues, stochastic network topology.",
  },
  {
    n: "O3",
    name: "Proof-of-principle: consolidation emerges from material",
    threshold: "Measurable task-performance improvement after offline phase vs. online-only baseline · energy ≥ 2 orders below GPU · competitive with existing neuromorphic chips · validated on a robotic navigation task",
    body: "Demonstrate that hippocampal consolidation mechanisms emerge from the intrinsic dynamics of the memristive CA3 ↔ CA1 module. The decisive experiment.",
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
          <SmallCaps>MEMPHIS · the complete dossier · v5X</SmallCaps>
        </div>
        <Hairline className="mt-6" />
        <div className="mt-12 text-center">
          <SmallCaps>MEMPHIS · post-von-Neumann neuromorphic substrate</SmallCaps>
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
            A hippocampal · memristive · neuromorphic architecture where
            STDP, replay-driven consolidation, two-phase processing and
            neuromodulation are not programmed but emerge from the
            intrinsic dynamics of a physical material.
          </ItalicCaption>
          <p
            className="syn-small-caps mt-3"
            style={{ color: "var(--ink-dim)", letterSpacing: "0.3em" }}
          >
            · the first system where adaptation is a material property ·
          </p>
        </div>
      </header>

      {/* 0 Abstract */}
      <section id="abstract" className="syn-column space-y-6 pt-24">
        <SmallCaps>0 · Abstract</SmallCaps>
        <p style={proseInkStyle}>
          MEMPHIS will establish proof-of-principle that hippocampal
          consolidation mechanisms — STDP, replay-driven memory
          consolidation, two-phase processing, and neuromodulation — can
          emerge from the intrinsic dynamics of a self-organising
          memristive substrate. A neuromorphic chip in which adaptation
          is a <em>material property</em>, not an algorithmic feature
          layered over silicon.
        </p>
        <p style={proseStyle}>
          The decisive experiment is a CA3 ↔ CA1 module that improves
          task performance after an offline phase — without further
          training data, with energy per synaptic operation at least
          two orders of magnitude below GPU baselines and below the
          ~10 pJ/event of Loihi and TrueNorth. The work targets TRL 4 in
          36 months, with three objectives, a five-partner consortium,
          and a route through EIC Transition to industrial pilots in
          edge AI, autonomous robotics and implantable neurotechnology.
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

      {/* 1 Vision */}
      <section id="vision" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>1 · The long-term vision</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            A material that learns, consolidates, and never recharges
          </h2>
        </div>
        <p style={proseStyle}>
          The long-term vision is a new class of artificial intelligence:
          spiking, adaptive, and physically embodied computation inspired
          by selected functional principles of the mammalian hippocampus.
          Not biological intelligence in full — a more specific and
          credible objective. Demonstrate that biologically grounded
          mechanisms can be realised as material properties of a
          neuromorphic substrate.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "A new computational primitive", b: "Adaptation as material property, not algorithmic feature. STDP, replay and two-phase consolidation emerge from the substrate's physical dynamics. Inherently compatible with multimodal sensory input and continuous operation." },
            { t: "Energy-efficient by construction", b: "Consolidation and energy efficiency arise from the same dynamics rather than from separate optimisations — a single architectural property, inseparable in principle." },
            { t: "Agents that accumulate knowledge", b: "Systems that gain task-relevant knowledge over their operational lifetime without recharging or retraining. Not achievable by combining existing efficient hardware with existing adaptive algorithms; the two properties have to be architecturally fused." },
          ].map((c, i) => (
            <div key={i} className="space-y-2">
              <NumberedDisk number={["I", "II", "III"][i]} tone="amber" size={48} />
              <h3 className="syn-display mt-2" style={subHeading}>
                {c.t}
              </h3>
              <p
                style={{ color: "var(--ink-cool)", fontSize: "0.95rem", lineHeight: 1.6 }}
              >
                {c.b}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 2 Problem */}
      <section id="problem" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>2 · The problem</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Two fields, one missing convergence
          </h2>
        </div>
        <p style={proseStyle}>
          Two fields independently reached a point of convergence and
          stopped. Bio-inspired approaches demonstrated real advantages
          in continual learning, but were implemented on deterministic
          digital hardware that preserved the von-Neumann separation of
          memory and computation. Memristive devices reached synaptic
          plasticity characteristics in the lab, but were used in
          isolation — without the network-level mechanisms (replay,
          neuromodulation, two-phase processing) that make biological
          learning work.
        </p>
        <p style={proseStyle}>
          Bringing the two streams together is not a software port. It
          is a physical co-design problem. The substrate has to{" "}
          <em>be</em> the algorithm.
        </p>
      </section>

      {/* 3 Breakthrough */}
      <section id="breakthrough" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>3 · Three breakthroughs</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            What makes MEMPHIS the first
          </h2>
        </div>
        <div className="space-y-6">
          {breakthroughs.map((b, i) => (
            <div
              key={b.n}
              className="rounded-2xl border p-6"
              style={{
                borderColor:
                  i === 1 ? "rgba(229,168,150,0.45)" : "rgba(244,196,130,0.45)",
                background:
                  "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <div className="flex items-baseline gap-4">
                <span
                  className="syn-display"
                  style={{
                    fontSize: "2rem",
                    color: "var(--memphis-amber-hi)",
                    lineHeight: 1,
                  }}
                >
                  {b.n}
                </span>
                <h3
                  className="syn-display"
                  style={{ ...subHeading, fontSize: "1.35rem" }}
                >
                  {b.name}
                </h3>
              </div>
              <p
                className="mt-3"
                style={{
                  color: "var(--ink)",
                  fontSize: "0.98rem",
                  lineHeight: 1.6,
                }}
              >
                {b.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Objectives */}
      <section id="objectives" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>4 · Three objectives</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            What we ship over 36 months
          </h2>
        </div>
        <div className="space-y-4">
          {objectives.map((o) => (
            <div
              key={o.n}
              className="rounded-2xl border p-6"
              style={{
                borderColor: "rgba(200,180,255,0.22)",
                background:
                  "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <div className="flex items-baseline gap-4">
                <span
                  className="syn-display"
                  style={{
                    fontSize: "2.4rem",
                    color: "var(--memphis-amber-hi)",
                    lineHeight: 1,
                  }}
                >
                  {o.n}
                </span>
                <div className="flex-1">
                  <h3 className="syn-display" style={{ ...subHeading, fontSize: "1.35rem" }}>
                    {o.name}
                  </h3>
                  <p
                    className="mt-2"
                    style={{
                      color: "var(--ink-cool)",
                      fontSize: "0.95rem",
                      lineHeight: 1.55,
                    }}
                  >
                    {o.body}
                  </p>
                  <p
                    className="syn-mono mt-3"
                    style={{
                      color: "var(--memphis-amber-hi)",
                      fontSize: "0.78rem",
                      letterSpacing: "var(--track-mono)",
                      textTransform: "uppercase",
                      lineHeight: 1.5,
                    }}
                  >
                    Threshold · {o.threshold}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 Validation */}
      <section id="validation" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>5 · The decisive experiment</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            CA3 ↔ CA1 module — recall, replay, consolidation
          </h2>
        </div>
        <Cartouche title="Validation protocol" meta="proof of principle">
          <p style={proseInkStyle}>
            A small-scale memristive spiking network (the CA3 ↔ CA1
            module visible at the centre of the chip plate) performs
            associative recall on a held-out test set. The system then
            enters an offline phase — no external input, only intrinsic
            dynamics replaying the stored traces. Memristive thresholds
            shift, redundant weights fade, salient patterns are
            reinforced. After the offline phase, the same test set is
            re-evaluated. The expected result: improved recall
            performance achieved without further training data, with
            energy per synaptic operation at least two orders of
            magnitude below the GPU baseline.
          </p>
        </Cartouche>
        <p style={proseStyle}>
          This is the proof of principle. It demonstrates — in physical
          hardware, not in simulation — that adaptive learning and
          memory optimisation can emerge from intrinsic system dynamics.
          If the experiment lands, the architectural principle
          generalises; if it does not, the failure mode is informative
          for the next-generation memristive design.
        </p>
      </section>

      {/* 6 Applications */}
      <section id="applications" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>6 · Industry applications</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Where &lt; 10 fJ per synaptic event changes the unit economics
          </h2>
        </div>
        <p style={proseStyle}>
          The target switching energy — below 10 fJ per 100×100 nm
          device — sits three orders of magnitude below existing
          neuromorphic platforms (Intel Loihi, IBM TrueNorth), six
          orders below GPU-based AI, and approaches the biological
          benchmark of ~100 fJ per synaptic event. The corollary is
          that entire product categories become physically possible
          that today are not.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              tag: "Edge AI",
              title: "Inference under µW budgets",
              body: "Battery-powered or energy-harvesting devices that need on-device adaptation — environmental sensors, agricultural monitoring, condition-based maintenance. Today's silicon either does inference (small, dumb) or learning (large, plugged-in). MEMPHIS does both inside the energy envelope of a coin cell.",
            },
            {
              tag: "Autonomous robotics",
              title: "Continuous learning, no cloud",
              body: "Mobile platforms — drones, agricultural robots, logistics, flexible manufacturing — that cannot afford cloud retraining and cannot afford catastrophic forgetting. The hippocampal-replay primitive maps onto exactly this constraint. WP2 includes a robotic-navigation validation task.",
            },
            {
              tag: "Implantable neurotech",
              title: "Multi-year operation under thermal limits",
              body: "Closed-loop neurotechnology — sense, interpret, act, learn — running for years on a milliwatt budget without cloud retraining or replacement surgery. Privacy-preserving by construction. MEMPHIS targets the architectural precursor; full clinical pathway is downstream.",
            },
            {
              tag: "European leadership",
              title: "Sovereign neuromorphic stack",
              body: "Validated memristive design primitives establish a European foundation for next-generation neuromorphic hardware — reducing dependence on imported and energy-intensive solutions. High-value EU jobs in hardware design, AI engineering, and advanced robotics.",
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

      {/* 7 Uncertainty */}
      <section id="uncertainty" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>7 · Critical uncertainty</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Device-to-device tolerance versus the replay dynamics
          </h2>
        </div>
        <Cartouche title="The honest question" meta="MEMPHIS v5X">
          <p style={proseInkStyle}>
            Whether memristive devices can be matched and stabilised at
            the precision required by the replay-driven dynamics. The
            biology demands a tighter device-to-device tolerance than
            today&rsquo;s memristive arrays routinely deliver. The
            engineering question is whether self-organisation can close
            that gap inside the operating regime, not whether it must.
            MEMPHIS&rsquo;s second breakthrough — treating stochasticity
            as substrate rather than noise — is the bet that it can.
            Proof of principle for the CA3 ↔ CA1 module is what tests
            the bet.
          </p>
        </Cartouche>
      </section>

      {/* 8 Investment thesis */}
      <section id="thesis" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>8 · The investment thesis</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Why MEMPHIS belongs in the next deep-tech portfolio
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: "I",
              h: "Energy maths is unforgiving",
              b: "10 fJ/event vs. 10 pJ/event for Loihi / TrueNorth · vs. ~1 nJ/event GPU-equivalent for foundation-model inference. Three orders of magnitude below state-of-the-art neuromorphic, six below GPU. The CFO maths writes itself for any edge or implantable deployment.",
            },
            {
              n: "II",
              h: "Architectural moat",
              b: "MEMPHIS does not need a new memristive material to win — it needs the architectural property that bio-replay imposes on the device array. The device roadmap is being pushed independently by half a dozen industrial labs. MEMPHIS rides that wave with a 3–5 year lead in the system-level integration.",
            },
            {
              n: "III",
              h: "Sister to SYMPHONY",
              b: "MEMPHIS is the hardware substrate that SYMPHONY's neuromodulated software substrate eventually needs. Co-developed roadmaps, shared editorial discipline, one consortium philosophy. A portfolio bet across two pillars of the post-von-Neumann era, not a single shot.",
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
        <Cartouche title="Verifiable end-of-project markers" meta="month 36">
          <ul className="space-y-2" style={{ color: "var(--ink)", lineHeight: 1.55, fontSize: "0.95rem" }}>
            <li>· CA3 ↔ CA1 model validated against in vivo electrophysiology at ≥ 80 % neuron-level agreement (O1).</li>
            <li>· Self-organising memristive substrate with switching energy &lt; 10 fJ per event (O2).</li>
            <li>· Proof of principle: offline-phase task-performance improvement, demonstrated on a robotic navigation task (O3).</li>
            <li>· EIC Transition application submitted in Year 4 against the O3 evidence base.</li>
            <li>· Industrial-pilot route via edge-AI or assistive-robotics partners contracted by Year 5.</li>
          </ul>
        </Cartouche>
        <p style={proseStyle}>
          MEMPHIS is at TRL 1–4. The deliverable is a proof of
          principle, not a product. The value is in the IP position, the
          device-co-design relationship with the memristive labs that
          are 3–5 years ahead of where the field expects them to be, and
          the architectural priority over any team that arrives at the
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
