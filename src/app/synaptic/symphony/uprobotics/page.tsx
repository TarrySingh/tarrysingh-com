import Link from "next/link"
import { Cartouche } from "@/components/editorial/Cartouche"
import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { SmallCaps } from "@/components/editorial/SmallCaps"
import { UpRoboticsFactoryHero } from "@/components/synaptic/UpRoboticsFactoryHero"

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

export default function UpRoboticsPartnerPage() {
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
          <SmallCaps>UP Robotics · industrial demonstrator</SmallCaps>
        </div>
        <Hairline className="mt-6" />
      </header>

      <section className="px-6 pb-12 pt-8 sm:px-12 lg:px-24">
        <UpRoboticsFactoryHero />
      </section>

      <section className="syn-column space-y-6 pt-8 text-center">
        <SmallCaps>UP Robotics · Zagreb · Croatia</SmallCaps>
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
          UP Robotics
        </h1>
        <ItalicCaption className="mx-auto max-w-3xl">
          The Croatian industrial-automation shop whose production-system
          codebase the SYMPHONY substrate has to survive contact with.
          Demonstrator partner; supplier of half the held-out task
          instances for the O4 evaluation.
        </ItalicCaption>
      </section>

      <div className="syn-column">
        <Hairline className="my-16" />
      </div>

      <section className="syn-column space-y-8">
        <div className="space-y-3">
          <SmallCaps>I · Role</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            The industrial coalface
          </h2>
        </div>
        <p style={proseStyle}>
          UP Robotics is the engineering shop that supplies SYMPHONY&rsquo;s
          industrial-automation demonstrator codebase. Where Newcastle
          contributes the mathematical primary source, CREATE the
          architectural primary source, and Real AI the integration and
          coordination, UP Robotics contributes <em>the production system
          that the substrate has to survive contact with</em>.
        </p>
        <p style={proseStyle}>
          Industrial code does not behave like open-source code. It is
          structured by IEC 61131-3 conventions, written in vendor-specific
          dialects (KRL, KAREL, RAPID, URScript, ladder logic, structured
          text), versioned across decades, and lived in by a small number
          of maintenance engineers whose institutional memory is the
          system&rsquo;s rationale layer.
        </p>
      </section>

      <section className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>II · Four data streams</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            What UP Robotics contributes to the substrate
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { t: "PLC code", b: "Ladder diagrams, structured text and function block diagrams from the programmable-logic controllers that run the line. Real-time-predictable, rarely commented, decades of authorship." },
            { t: "Robot programs", b: "Vendor-specific motion routines, path libraries, calibration files for the manipulators and end-effectors. Often touched by many engineers over a single system's life." },
            { t: "SCADA configs", b: "Supervisory-control configurations, HMI screens, alarm databases, historian tags. The layer operators see — the one that survives engineer turnover." },
            { t: "Maintenance logs", b: "Years of maintenance-engineer log entries — fault descriptions, repair notes, replacement-part references. The closest thing the system has to a rationale layer." },
          ].map((c, i) => (
            <Cartouche key={i} title={["I", "II", "III", "IV"][i]} meta="stream">
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
          <SmallCaps>III · Why this matters</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Without a real industrial system, SYMPHONY is a paper claim
          </h2>
        </div>
        <p style={proseStyle}>
          A neuromimetic knowledge substrate that works on a curated open-
          source benchmark but breaks on production industrial code is a
          publication, not a contribution to European industrial
          competitiveness. The O4 benchmark mixes 100 instances from
          OSS issue trackers with 100 instances from UP Robotics&rsquo;s
          maintenance logs precisely to surface this failure mode if it
          exists.
        </p>
        <Cartouche title="O4 evaluation protocol" meta="M30 decision milestone">
          <p style={{ color: "var(--ink)", lineHeight: 1.6, fontSize: "0.98rem" }}>
            200 engineering-task instances. Half sourced from open-source
            issue trackers, half from UP Robotics&rsquo; maintenance logs.
            Threshold: ≥ 20 % relative F1 improvement on task-relevant-
            subgraph recovery and ≥ 15 % expert-rated actionability,
            averaged across task classes — against three named baselines
            (frontier LLM agent, EAKG static-analysis pipeline, LLM + RAG).
          </p>
        </Cartouche>
        <p style={proseStyle}>
          If improvement holds on OSS but fails on industrial code, the
          §1.3 alternative path narrows the claimed scope and documents
          the domain-transfer gap as a scientific finding. The fact that
          this alternative exists at all is what makes the protocol
          honest.
        </p>
      </section>

      <section className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>IV · The exploitation vehicle</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Real AI × UP Robotics — the joint venture
          </h2>
        </div>
        <p style={proseStyle}>
          UP Robotics and Real AI have agreed in principle on a joint
          venture as the primary exploitation vehicle for the SYMPHONY
          substrate. UP Robotics brings the customer relationships in
          industrial automation across Croatia and the wider region; Real
          AI brings the foundation-model engineering and the coordinator
          role. Read the full{" "}
          <Link
            href="/synaptic/symphony/proposal#gtm"
            style={{ color: "var(--symphony-violet-hi)" }}
            className="hover:opacity-80"
          >
            go-to-market and IP plan
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
