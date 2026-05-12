import Image from "next/image"
import coverPlate from "@proposals/SYMPHONY/plates/plate-II-cover-planisphere.png"
import visionBanner from "@proposals/SYMPHONY/plates/plate-I-vision.png"
import statisticalCeiling from "@proposals/SYMPHONY/plates/plate-V-statistical-ceiling.png"
import comprehensionGap from "@proposals/SYMPHONY/plates/plate-IV-comprehension-gap.png"
import substrateScales from "@proposals/SYMPHONY/plates/plate-II-substrate-x-scales.png"
import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { SmallCaps } from "@/components/editorial/SmallCaps"

export default function SymphonyPage() {
  return (
    <>
      <figure className="relative w-full">
        <Image
          src={coverPlate}
          alt="SYMPHONY cover plate — a planisphere of the neuromimetic code substrate, with a violet task-baton sweeping twelve sectors of code knowledge."
          priority
          sizes="100vw"
          placeholder="blur"
          className="block h-auto w-full"
        />
      </figure>

      <header className="syn-column space-y-6 pt-24">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-1">
          <SmallCaps>Plate II</SmallCaps>
          <SmallCaps>Anno 2026</SmallCaps>
          <SmallCaps>Cover · Planisphere</SmallCaps>
        </div>
        <h1
          className="syn-display"
          style={{
            fontSize: "var(--text-display)",
            color: "var(--ink)",
            lineHeight: 0.95,
            margin: 0,
          }}
        >
          SYMPHONY
        </h1>
        <ItalicCaption className="max-w-3xl">
          A neuromimetic knowledge substrate for software systems —
          multi-scale neuromodulation and low-bandwidth shared control for
          task-adaptive code comprehension.
        </ItalicCaption>
      </header>

      <div className="syn-column">
        <Hairline className="my-16" />
      </div>

      <section className="syn-column space-y-8">
        <SmallCaps>I · The long-term vision</SmallCaps>
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          SYMPHONY will establish the first neuromimetic knowledge substrate
          for software systems: a computational representation of code in which
          the elements of a software system — modules, functions, data flows,
          contracts, tests, commit history, design decisions — are encoded as
          nodes in a multi-scale network whose activation patterns are
          reconfigured, on demand, by task-specific neuromodulatory signals.
        </p>
        <ItalicCaption className="max-w-3xl">
          In plain terms — a code representation that behaves less like a
          document to be re-read and more like a nervous system that
          foregrounds the structures relevant to the engineer&rsquo;s current
          task.
        </ItalicCaption>
      </section>

      <figure className="mt-24 lg:mx-auto lg:max-w-[90vw]">
        <Image
          src={visionBanner}
          alt="SYMPHONY vision banner — a panoramic plate setting out the long-term programme: a multi-scale neuromimetic substrate spanning modules, functions, tests, commits and design rationale."
          sizes="(min-width: 1280px) 90vw, 100vw"
          placeholder="blur"
          className="block h-auto w-full"
        />
        <figcaption className="syn-column pt-4">
          <SmallCaps>Plate I · Panoramic vision</SmallCaps>
        </figcaption>
      </figure>

      <section className="syn-column space-y-8 pt-32">
        <SmallCaps>II · The science-to-technology breakthrough</SmallCaps>
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          Current approaches to machine code understanding divide into two
          families, each with a structural ceiling we expect to hit within
          this decade. The first is statistical — large-language-model
          agents whose headline benchmark performance does not survive
          independent re-evaluation. The second is structural — call graphs,
          dependency edges, architecture knowledge graphs — which capture
          what is explicitly declared but not the design rationale that
          governs software change.
        </p>
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          SYMPHONY&rsquo;s advance is not to improve either family but to
          combine their information content under an organising principle
          drawn from biology. The two charts below anchor the ceiling
          argument; the substrate figure that follows shows what we propose
          to build in its place.
        </p>
      </section>

      <section className="syn-column pt-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <figure>
            <Image
              src={statisticalCeiling}
              alt="Plate V — Statistical ceiling chart: published SWE-bench Verified scores compared with independently re-evaluated resolution rates after solution-leakage filtering. Headline scores above 80 per cent collapse to single digits."
              sizes="(min-width: 1024px) 50vw, 100vw"
              placeholder="blur"
              className="block h-auto w-full rounded-[var(--radius-tight)]"
            />
            <figcaption className="pt-3">
              <SmallCaps>Plate V · Statistical ceiling</SmallCaps>
              <p
                className="pt-2"
                style={{
                  color: "var(--ink-dim)",
                  fontSize: "0.92rem",
                  lineHeight: 1.5,
                }}
              >
                Published SWE-bench Verified scores against independent
                re-evaluation. Independent ICSE 2025 Companion and ICLR 2026
                replication studies both find a headline collapse once
                solution leakage and weak test cases are removed.
              </p>
            </figcaption>
          </figure>
          <figure>
            <Image
              src={comprehensionGap}
              alt="Plate IV — Comprehension gap chart: software-system complexity grows exponentially from 1970 to 2030 while individual human comprehension capacity is flat. The widening gap is the addressable problem for SYMPHONY."
              sizes="(min-width: 1024px) 50vw, 100vw"
              placeholder="blur"
              className="block h-auto w-full rounded-[var(--radius-tight)]"
            />
            <figcaption className="pt-3">
              <SmallCaps>Plate IV · Comprehension gap</SmallCaps>
              <p
                className="pt-2"
                style={{
                  color: "var(--ink-dim)",
                  fontSize: "0.92rem",
                  lineHeight: 1.5,
                }}
              >
                Software-system complexity against individual human
                comprehension capacity, 1970–2030. The widening gap is the
                problem the substrate is built to address — through
                task-adaptive activation, not exhaustive re-reading.
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="syn-column space-y-10 pt-32">
        <SmallCaps>III · The substrate, four layers × four scales</SmallCaps>
        <figure className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Image
            src={substrateScales}
            alt="Plate II — Substrate × scales: SYMPHONY's representation in code-system space (structural, behavioural, historical, rationale) crossed with the four neuromodulatory scales of Mei, Muller and Ramaswamy (2022) — hyperparameter, plasticity-driven connectivity, neuronal gain, and dendritic computation."
            sizes="(min-width: 1024px) 55vw, 100vw"
            placeholder="blur"
            className="block h-auto w-full rounded-[var(--radius-tight)]"
          />
          <figcaption>
            <ItalicCaption>
              Four code-system layers crossed with four neuromodulatory
              scales. The substrate is the cell of the matrix the engineer
              activates next, not the entire matrix re-read.
            </ItalicCaption>
            <p
              className="pt-4"
              style={{
                color: "var(--ink-dim)",
                fontSize: "0.92rem",
                lineHeight: 1.5,
              }}
            >
              The vertical axis lists the four representational layers the
              substrate unifies. The horizontal axis lists the four
              neuromodulatory scales adapted from Mei, Muller &amp;
              Ramaswamy (<em>Trends in Neurosciences</em>, 2022).
            </p>
          </figcaption>
        </figure>
      </section>

      <footer className="syn-column pb-24 pt-32 text-center">
        <ItalicCaption className="mx-auto max-w-2xl">
          Same substrate. Different harmonies.
        </ItalicCaption>
      </footer>
    </>
  )
}
