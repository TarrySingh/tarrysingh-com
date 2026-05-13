import Link from "next/link"
import { Cartouche } from "@/components/editorial/Cartouche"
import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { SmallCaps } from "@/components/editorial/SmallCaps"
import { HominisHero } from "@/components/synaptic/HominisHero"

const proseStyle = {
  color: "var(--ink-cool)",
  fontSize: "var(--text-body)",
  lineHeight: 1.7,
  maxWidth: "62ch",
} as const

const sectionHeading = {
  color: "var(--ink)",
  fontSize: "2.2rem",
  lineHeight: 1.1,
  margin: 0,
  letterSpacing: "var(--track-display)",
} as const

export default function TarryPartnerPage() {
  return (
    <>
      <header className="syn-column pb-6 pt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <Link
            href="/synaptic/symphony"
            className="syn-small-caps hover:opacity-80"
            style={{ color: "var(--symphony-violet-hi)" }}
          >
            ← Return to the planisphere
          </Link>
          <SmallCaps>Plate VI · Real AI · O1 + O4 lead · Coordinator</SmallCaps>
        </div>
        <Hairline className="mt-6" />
      </header>

      <section className="px-6 pb-12 pt-8 sm:px-12 lg:px-24">
        <HominisHero />
      </section>

      <section className="syn-column space-y-6 pt-8 text-center">
        <SmallCaps>Real AI · Coordinator · Hominis programme</SmallCaps>
        <h1
          className="syn-display"
          style={{
            fontSize: "clamp(64px, 10vw, 144px)",
            color: "var(--ink)",
            lineHeight: 0.95,
            letterSpacing: "0.06em",
            margin: 0,
          }}
        >
          Tarry Singh
        </h1>
        <ItalicCaption className="mx-auto max-w-3xl">
          Founder of Real AI. Three decades across data and AI delivery at
          industrial scale, with a current focus on{" "}
          <em>foundation models for the real world</em>: Hominis — a family
          of situated, auditable, compute-aware foundation models trained
          on allocation time at Leonardo, the EuroHPC supercomputer at
          CINECA, Bologna.
        </ItalicCaption>
      </section>

      <div className="syn-column">
        <Hairline className="my-16" />
      </div>

      <section className="syn-column space-y-8">
        <div className="space-y-3">
          <SmallCaps>I · Position</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Real AI, three decades, one substrate
          </h2>
        </div>
        <p style={proseStyle}>
          Tarry Singh founded Real AI to build the European stack for
          foundation models that hold up under real-world deployment —
          situated, auditable, and compute-aware. Before Real AI, three
          decades of data-and-AI delivery at industrial scale across
          banking, energy, manufacturing and pharma. The pattern across
          every engagement: the systems that succeed are the ones that
          show their work and survive contact with regulated production
          environments.
        </p>
        <p style={proseStyle}>
          The Hominis programme is the engineering vehicle for that
          pattern. The SYMPHONY consortium is its first proof point at the
          intersection of foundation models, neuroscience and robotics.
        </p>
      </section>

      <section className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>II · The Hominis programme</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Foundation models for the real world
          </h2>
        </div>
        <p style={proseStyle}>
          Hominis is a family of foundation models calibrated to three
          properties — the three pillars of the cathedral above:
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "Situated", b: "Trained on the context the model will be deployed into — industrial-automation logs, EU regulatory text, multi-lingual scientific corpora — not just the open web." },
            { t: "Auditable", b: "Every output traceable to a substrate region; every adaptation to a task token. Compositional control surfaces, bounded behaviour, external evaluation built in." },
            { t: "Compute-aware", b: "Trained on EuroHPC allocation at Leonardo / CINECA. Per-paper tCO₂e reporting; absolute compute-budget caps declared in the DMP." },
          ].map((c, i) => (
            <Cartouche key={i} title={["I", "II", "III"][i]} meta="pillar">
              <h3
                className="syn-display"
                style={{ fontSize: "1.1rem", color: "var(--ink)", lineHeight: 1.2, margin: 0 }}
              >
                {c.t}
              </h3>
              <p
                className="mt-3"
                style={{ color: "var(--ink-cool)", fontSize: "0.92rem", lineHeight: 1.55 }}
              >
                {c.b}
              </p>
            </Cartouche>
          ))}
        </div>
      </section>

      <section className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>III · Coordination of SYMPHONY</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Holding the four partners on one substrate
          </h2>
        </div>
        <p style={proseStyle}>
          As coordinator, Real AI runs the consortium spine: project
          management, financial reporting, dissemination, regulatory
          watch, the Consortium Agreement, the Data Management Plan, and
          the open-science discipline. The work is invisible when it goes
          well, which is the point.
        </p>
        <p style={proseStyle}>
          On the science side, Real AI integrates the contributions of the
          three other partners into a single substrate: ingests Newcastle&rsquo;s
          neuromodulatory framework as the O2 mechanism, threads CREATE&rsquo;s
          haptic shared-control formalism through as O3&rsquo;s task baton,
          and trains on UP Robotics&rsquo;s industrial-automation
          demonstrator codebase for O1 and O4.
        </p>
      </section>

      <section className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>IV · Role in SYMPHONY</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            O1 and O4 · the extraction pipeline and the benchmark
          </h2>
        </div>
        <Cartouche title="Objective O1" meta="M12 decision milestone">
          <p style={{ color: "var(--ink)", lineHeight: 1.6, fontSize: "0.98rem" }}>
            Build an automated pipeline that ingests a software system and
            emits a four-layer representation (structural, behavioural,
            historical, rationale) over a single graph.{" "}
            <strong style={{ color: "var(--symphony-amber-hi)" }}>Threshold</strong>:
            coverage ≥ 90 % of functions and ≥ 80 % of inter-module
            dependencies on the two demonstrator codebases.
          </p>
        </Cartouche>
        <Cartouche title="Objective O4" meta="M30 decision milestone">
          <p style={{ color: "var(--ink)", lineHeight: 1.6, fontSize: "0.98rem" }}>
            Demonstrate, on a pre-registered evaluation protocol, that the
            SYMPHONY substrate outperforms three named baselines: (a) a
            frontier LLM agent, (b) a best-in-class static-analysis +
            knowledge-graph pipeline, and (c) an LLM + RAG baseline — on a
            held-out benchmark of 200 engineering-task instances.{" "}
            <strong style={{ color: "var(--symphony-amber-hi)" }}>Threshold</strong>:
            ≥ 20 % relative F1 improvement on task-relevant-subgraph recovery
            and ≥ 15 % in expert-rated actionability.
          </p>
        </Cartouche>
      </section>

      <section className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>V · The exploitation vehicle</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            The Real AI × UP Robotics joint venture
          </h2>
        </div>
        <p style={proseStyle}>
          Beyond the science, Real AI and UP Robotics have agreed in
          principle on a joint venture as the primary exploitation vehicle
          for the SYMPHONY substrate. Terms are set out in the Consortium
          Agreement at grant preparation; the JV term sheet is targeted
          for execution by M40. Newcastle and CREATE retain academic IP and
          grant the JV a non-exclusive, royalty-bearing licence for
          industrial use. Read the{" "}
          <Link
            href="/synaptic/symphony/proposal#gtm"
            style={{ color: "var(--symphony-violet-hi)" }}
            className="hover:opacity-80"
          >
            full go-to-market and IP plan
          </Link>{" "}
          in the proposal.
        </p>
      </section>

      <footer className="syn-column pb-24 pt-40 text-center">
        <ItalicCaption className="mx-auto max-w-2xl">
          Same substrate. Different harmonies.
        </ItalicCaption>
        <div className="pt-10">
          <Link
            href="/synaptic/symphony"
            className="syn-small-caps hover:opacity-80"
            style={{ color: "var(--symphony-violet-hi)" }}
          >
            ← Return to the planisphere
          </Link>
        </div>
      </footer>
    </>
  )
}
