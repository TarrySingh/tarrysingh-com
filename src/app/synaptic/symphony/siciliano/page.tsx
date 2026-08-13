import Link from "next/link"
import { Cartouche } from "@/components/editorial/Cartouche"
import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { SmallCaps } from "@/components/editorial/SmallCaps"
import { SicilianoArmHero } from "@/components/synaptic/SicilianoArmHero"
import { SicilianoRose } from "@/components/synaptic/SicilianoRose"

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

export default function SicilianoPartnerPage() {
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
          <SmallCaps>Plate VIII · CREATE / PRISMA · O3 lead</SmallCaps>
        </div>
        <Hairline className="mt-6" />
      </header>

      <section className="px-6 pb-12 pt-8 sm:px-12 lg:px-24">
        <SicilianoArmHero />
      </section>

      <section className="syn-column space-y-6 pt-8 text-center">
        <SmallCaps>CREATE · PRISMA Lab · UNINA · Naples</SmallCaps>
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
          Bruno Siciliano
        </h1>
        <ItalicCaption className="mx-auto max-w-3xl">
          Director of PRISMA Lab, Projects of Industrial and Service
          Manipulation Robotics, at CREATE / UNINA. ERC Advanced Grant
          holder, Engelberger Award laureate. Lead of Objective O3.
        </ItalicCaption>
        <p
          className="syn-small-caps pt-2"
          style={{ color: "var(--symphony-amber)", letterSpacing: "0.3em" }}
        >
          · keep the gradient ·
        </p>
      </section>

      <div className="syn-column">
        <Hairline className="my-16" />
      </div>

      <section className="syn-column space-y-8">
        <div className="space-y-3">
          <SmallCaps>I · Position</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            PRISMA Lab, four decades of robotics
          </h2>
        </div>
        <p style={proseStyle}>
          Bruno Siciliano directs PRISMA Lab at CREATE, Centro di Ricerca
          per l&rsquo;Ingegneria Elettronica e Telecomunicazioni
          dell&rsquo;Università di Napoli Federico II. PRISMA &mdash;
          Projects of Industrial and Service Manipulation Robotics
          &mdash; spans seven domains of modern robotics: industrial
          manipulation, service robotics, aerial robotics, surgical
          robotics, haptic shared control, human-robot interaction, and
          motion planning.
        </p>
        <p style={proseStyle}>
          The lab&rsquo;s body of work is the architectural primary source
          for SYMPHONY&rsquo;s task-baton interface. Across a decade of
          RA-L, ICRA, T-RO and IROS papers (2018–2025), the
          Selvaggio-Pacchierotti-Giordano-Siciliano programme demonstrated
          in <em>physical hardware</em> that a low-bandwidth supervisory
          signal can reshape a high-degree-of-freedom autonomous
          controller into qualitatively different task behaviours
, without rewriting the controller. The hero above is what
          that looks like in cartoon form.
        </p>
      </section>

      <section className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>II · The seven domains of PRISMA</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            The rose, and the architectural primitive in its centre
          </h2>
        </div>
        <SicilianoRose />
        <ItalicCaption className="max-w-3xl">
          Seven domains of PRISMA. The haptic shared-control sector is the
          one SYMPHONY transposes, but the rest of the rose is the depth
          of evidence the lab brings to bear on the transposition.
        </ItalicCaption>
      </section>

      <section className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>III · Awards and standing</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            ERC Advanced Grant · Engelberger Award · Springer Handbook
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "ERC Advanced Grant", b: "European Research Council's senior funding tier, granted to investigators whose work has redefined a research field. Siciliano has held an ERC Advanced Grant in robotics." },
            { t: "Engelberger Award", b: "The IRC's lifetime-achievement award in robotics, named for Joseph Engelberger, considered the father of industrial robotics. Siciliano is a laureate." },
            { t: "Editor, Springer Handbook of Robotics", b: "The standard reference work for the field. Two editions co-edited with Oussama Khatib, the textbook every robotics engineer trains on." },
          ].map((c, i) => (
            <Cartouche key={i} title={["I", "II", "III"][i]} meta="award">
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
          <SmallCaps>IV · Role in SYMPHONY</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            O3 lead · the low-bandwidth control interface
          </h2>
        </div>
        <Cartouche title="Objective O3" meta="M24 decision milestone">
          <p style={{ color: "var(--ink)", lineHeight: 1.6, fontSize: "0.98rem" }}>
            Derive a narrow scalar control interface by which engineering-task
            tokens reshape the substrate&rsquo;s activation regime without
            modifying its stored structure.{" "}
            <strong style={{ color: "var(--symphony-amber-hi)" }}>Threshold</strong>:
            task-switching latency &lt; 500 ms and state-preservation score
            ≥ 0.95 (cosine similarity between post-switch resting state and
            pre-task baseline), over ≥ 100 task-switching trials on both
            demonstrator codebases.
          </p>
        </Cartouche>
        <p style={proseStyle}>
          CREATE-PRISMA leads O3 with Newcastle as a deputy partner,
          mapping the haptic shared-control formalism (active constraints,
          virtual fixtures, admittance-based teleoperation) onto a discrete
          symbolic substrate. The result is the task baton: a small set
          of scalar modulatory signals, not a prompt window.
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
