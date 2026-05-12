import Link from "next/link"
import { Cartouche } from "@/components/editorial/Cartouche"
import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { SmallCaps } from "@/components/editorial/SmallCaps"
import { RamaswamyCortexHero } from "@/components/synaptic/RamaswamyCortexHero"
import { RamaswamyPedigree } from "@/components/synaptic/RamaswamyPedigree"

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

export default function RamaswamyPartnerPage() {
  return (
    <>
      {/* breadcrumb */}
      <header className="syn-column pb-6 pt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <Link
            href="/synaptic/symphony"
            className="syn-small-caps hover:opacity-80"
            style={{ color: "var(--symphony-violet-hi)" }}
          >
            ← Return to the planisphere
          </Link>
          <SmallCaps>Plate VII · Newcastle / Ramaswamy · O2 lead</SmallCaps>
        </div>
        <Hairline className="mt-6" />
      </header>

      {/* hero plate */}
      <section className="px-6 pb-12 pt-8 sm:px-12 lg:px-24">
        <RamaswamyCortexHero />
      </section>

      {/* title block */}
      <section className="syn-column space-y-6 pt-8 text-center">
        <SmallCaps>Newcastle University · School of Computing</SmallCaps>
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
          Sri Ramaswamy
        </h1>
        <ItalicCaption className="mx-auto max-w-3xl">
          Chair of computational neuroscience. Co-author of the four-scale
          neuromodulatory framework SYMPHONY transposes from cortex to
          code. Lead of Objective O2 and co-lead of the ethics layer of O5.
        </ItalicCaption>
      </section>

      <div className="syn-column">
        <Hairline className="my-16" />
      </div>

      {/* §1 Bio */}
      <section className="syn-column space-y-8">
        <div className="space-y-3">
          <SmallCaps>I · Position</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            From Blue Brain to the chair at Newcastle
          </h2>
        </div>
        <p style={proseStyle}>
          Sri Ramaswamy is chair of computational neuroscience at
          Newcastle University&rsquo;s School of Computing. His twenty-year
          arc moves from the digital reconstruction of cortical
          microcircuits at the Blue Brain Project at EPFL through an
          independent group on biologically-grounded artificial neural
          networks to the foundational framework that gives SYMPHONY its
          mathematical primary source: the four-scale neuromodulatory
          formulation in <em>Trends in Neurosciences</em>, 2022.
        </p>
        <p style={proseStyle}>
          The pedigree is the moat. Mei, Muller &amp; Ramaswamy (2022) is
          not a paper SYMPHONY references politely from a distance — it is
          the mathematical scaffolding on which O2 is built, with the
          third author as the consortium&rsquo;s objective lead.
        </p>
      </section>

      {/* §2 The 2022 paper */}
      <section className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>II · The 2022 paper</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Mei · Muller · Ramaswamy — four scales, one substrate
          </h2>
        </div>
        <p style={proseStyle}>
          The 2022 paper formalised a four-scale framework for integrating
          neuromodulation into deep networks — hyperparameter scale
          (global gain), plasticity scale (connectivity reshape),
          neuronal scale (per-node gating), and dendritic scale
          (branch-local computation). The simulation evidence showed three
          behavioural properties that SYMPHONY requires from its
          substrate.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { n: "i", t: "Faster adaptation", b: "New tasks reach competence in fewer training steps than a non-modulated baseline." },
            { n: "ii", t: "Higher cumulative reward", b: "Across task sequences the modulated network accumulates more reward than the static one." },
            { n: "iii", t: "Resistance to catastrophic forgetting", b: "The same network retains old skills as new ones land — the prerequisite for a substrate that survives an engineer's day." },
          ].map((c) => (
            <Cartouche key={c.n} title={`Property ${c.n}`} meta="Mei et al. 2022">
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
        <ItalicCaption className="max-w-3xl">
          SYMPHONY&rsquo;s critical uncertainty is whether these three
          properties survive transposition from a continuous perceptual
          domain to a discrete symbolic one. That question is what O2
          resolves.
        </ItalicCaption>
      </section>

      {/* §3 Pedigree */}
      <section className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>III · Pedigree</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Twenty years from cortex to code
          </h2>
        </div>
        <RamaswamyPedigree />
      </section>

      {/* §4 Role */}
      <section className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>IV · Role in SYMPHONY</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            O2 lead · co-lead of the ethics layer of O5
          </h2>
        </div>
        <Cartouche title="Objective O2" meta="M18 decision milestone">
          <p style={{ color: "var(--ink)", lineHeight: 1.6, fontSize: "0.98rem" }}>
            Implement, on the substrate produced by O1, a computational
            instantiation of the four-scale framework of Mei, Muller &amp;
            Ramaswamy (2022), adapted from continuous perceptual signals
            to discrete symbolic activations. <strong style={{ color: "var(--symphony-amber-hi)" }}>Threshold</strong>:
            a single trained substrate demonstrates statistically
            significant (p &lt; 0.01, paired test, ≥ 30 task instances)
            task-appropriate subnetwork activation across at least three
            distinct engineering task classes (localisation, impact
            analysis, refactoring candidate discovery), with F1 ≥ 0.6
            versus expert-annotated relevance.
          </p>
        </Cartouche>
        <p style={proseStyle}>
          Newcastle co-leads the ethics layer of O5 — the equitable-access
          user study — bringing the school&rsquo;s established protocol for
          stratified pre-registered behavioural studies in computing
          education.
        </p>
      </section>

      {/* footer */}
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
