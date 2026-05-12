import Image from "next/image"
import coverPlate from "@proposals/SYMPHONY/plates/plate-II-cover-planisphere.png"
import visionBanner from "@proposals/SYMPHONY/plates/plate-I-vision.png"
import statisticalCeiling from "@proposals/SYMPHONY/plates/plate-V-statistical-ceiling.png"
import comprehensionGap from "@proposals/SYMPHONY/plates/plate-IV-comprehension-gap.png"
import substrateScales from "@proposals/SYMPHONY/plates/plate-II-substrate-x-scales.png"
import consortiumPlate from "@proposals/SYMPHONY/plates/plate-III-consortium.png"
import ramaswamyPlate from "@proposals/SYMPHONY/plates/plate-VII-ramaswamy-blue-brain.png"
import sicilianoPlate from "@proposals/SYMPHONY/plates/plate-VIII-siciliano-prisma.png"
import hominisPlate from "@proposals/SYMPHONY/plates/plate-VI-hominis.png"
import { Cartouche } from "@/components/editorial/Cartouche"
import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { NumberedDisk } from "@/components/editorial/NumberedDisk"
import { SmallCaps } from "@/components/editorial/SmallCaps"
import { ComprehensionGap } from "@/components/synaptic/ComprehensionGap"
import { ConsortiumGraph } from "@/components/synaptic/ConsortiumGraph"
import { HominisCathedral } from "@/components/synaptic/HominisCathedral"
import { JumpNav } from "@/components/synaptic/JumpNav"
import { RamaswamyPedigree } from "@/components/synaptic/RamaswamyPedigree"
import { StatisticalCeiling } from "@/components/synaptic/StatisticalCeiling"
import { SubstrateScales } from "@/components/synaptic/SubstrateScales"
import { SymphonyStudio } from "@/components/synaptic/SymphonyStudio"
import { VisionHorizon } from "@/components/synaptic/VisionHorizon"

const SECTIONS = [
  { id: "vision", label: "I · Vision" },
  { id: "breakthrough", label: "II · Breakthrough" },
  { id: "substrate", label: "III · Substrate" },
  { id: "evidence", label: "IV · Evidence" },
  { id: "objectives", label: "V · Objectives" },
  { id: "consortium", label: "VI · Consortium" },
  { id: "dossier", label: "VII · Dossier" },
] as const

export default function SymphonyPage() {
  return (
    <>
      <div className="print:hidden">
        <SymphonyStudio />
      </div>

      <figure className="relative hidden w-full print:block">
        <Image
          src={coverPlate}
          alt="SYMPHONY cover plate — a planisphere of the neuromimetic code substrate, with a violet task-baton sweeping twelve sectors of code knowledge."
          sizes="100vw"
          placeholder="blur"
          className="block h-auto w-full"
        />
      </figure>

      <div className="syn-column">
        <Hairline className="my-16" />
      </div>

      <section id="vision" className="syn-column space-y-8">
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

      <div className="mt-24 print:hidden lg:mx-auto lg:max-w-[90vw]">
        <VisionHorizon />
        <p className="syn-column pt-4">
          <SmallCaps>Plate I · Panoramic vision</SmallCaps>
        </p>
      </div>
      <figure className="hidden print:block lg:mx-auto lg:max-w-[90vw]">
        <Image
          src={visionBanner}
          alt="SYMPHONY vision banner — a panoramic plate setting out the long-term programme: a multi-scale neuromimetic substrate spanning modules, functions, tests, commits and design rationale."
          sizes="(min-width: 1280px) 90vw, 100vw"
          placeholder="blur"
          className="block h-auto w-full"
        />
      </figure>

      <section id="breakthrough" className="syn-column space-y-8 pt-32">
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
          <div className="print:hidden">
            <StatisticalCeiling />
            <div className="pt-3">
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
            </div>
          </div>
          <figure className="hidden print:block">
            <Image
              src={statisticalCeiling}
              alt="Plate V — Statistical ceiling chart: published SWE-bench Verified scores compared with independently re-evaluated resolution rates after solution-leakage filtering. Headline scores above 80 per cent collapse to single digits."
              sizes="(min-width: 1024px) 50vw, 100vw"
              placeholder="blur"
              className="block h-auto w-full rounded-[var(--radius-tight)]"
            />
          </figure>
          <div className="print:hidden">
            <ComprehensionGap />
            <div className="pt-3">
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
            </div>
          </div>
          <figure className="hidden print:block">
            <Image
              src={comprehensionGap}
              alt="Plate IV — Comprehension gap chart: software-system complexity grows exponentially from 1970 to 2030 while individual human comprehension capacity is flat. The widening gap is the addressable problem for SYMPHONY."
              sizes="(min-width: 1024px) 50vw, 100vw"
              placeholder="blur"
              className="block h-auto w-full rounded-[var(--radius-tight)]"
            />
          </figure>
        </div>
      </section>

      <section id="substrate" className="syn-column space-y-10 pt-32">
        <SmallCaps>III · The substrate, four layers × four scales</SmallCaps>
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="print:hidden">
            <SubstrateScales />
          </div>
          <figure className="hidden print:block">
            <Image
              src={substrateScales}
              alt="Plate II — Substrate × scales: SYMPHONY's representation in code-system space (structural, behavioural, historical, rationale) crossed with the four neuromodulatory scales of Mei, Muller and Ramaswamy (2022) — hyperparameter, plasticity-driven connectivity, neuronal gain, and dendritic computation."
              sizes="(min-width: 1024px) 55vw, 100vw"
              placeholder="blur"
              className="block h-auto w-full rounded-[var(--radius-tight)]"
            />
          </figure>
          <div>
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
          </div>
        </div>
      </section>

      <section className="syn-column pt-16">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-4">
            <NumberedDisk number="i" tone="violet" size={56} />
            <h3
              className="syn-display"
              style={{
                fontSize: "1.5rem",
                color: "var(--ink)",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Multi-layer extraction
            </h3>
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.6 }}>
              Existing architecture-recovery pipelines produce either a
              single view or a separate document corpus. SYMPHONY unifies
              structural, behavioural, historical and rationale layers in a
              single graph-resident representation, built for
              activation-based retrieval rather than query-based retrieval.
            </p>
          </div>
          <div className="space-y-4">
            <NumberedDisk number="ii" tone="violet" size={56} />
            <h3
              className="syn-display"
              style={{
                fontSize: "1.5rem",
                color: "var(--ink)",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Context-dependent activation
            </h3>
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.6 }}>
              No existing representation alters its own salience profile in
              response to the engineer&rsquo;s declared task. SYMPHONY&rsquo;s
              substrate maintains a single state of the system but surfaces
              different subnetworks under a task token, using the four-scale
              neuromodulatory primitives of Mei, Muller &amp; Ramaswamy
              (2022) as the mathematical template.
            </p>
          </div>
          <div className="space-y-4">
            <NumberedDisk number="iii" tone="violet" size={56} />
            <h3
              className="syn-display"
              style={{
                fontSize: "1.5rem",
                color: "var(--ink)",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Low-bandwidth task control
            </h3>
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.6 }}>
              Borrowing from Siciliano&rsquo;s haptic shared-control
              architecture, the task interface is intentionally narrow — a
              small set of scalar modulatory signals, not a prompt window —
              so that behaviour under different engineering tasks is
              composable, auditable, and bounded.
            </p>
          </div>
        </div>
      </section>

      <section id="evidence" className="syn-column space-y-8 pt-32">
        <SmallCaps>IV · Preliminary evidence</SmallCaps>
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          At TRL 1–4 the question is whether the mechanism is sound, not
          whether an industrial artefact exists. Three converging lines of
          published evidence support the mechanism.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          <Cartouche title="Simulation" meta="2022">
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.5, fontSize: "0.95rem" }}>
              Mei, Muller &amp; Ramaswamy (<em>Trends in Neurosciences</em>,
              2022) — neuromodulatory units at four scales yield faster
              adaptation, higher cumulative reward and resistance to
              catastrophic forgetting in deep networks.
            </p>
          </Cartouche>
          <Cartouche title="Hardware" meta="2018–2025">
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.5, fontSize: "0.95rem" }}>
              Selvaggio, Pacchierotti, Giordano &amp; Siciliano (RA-L 2018;
              ICRA 2019; T-RO 2022; RAS 2025) — low-bandwidth supervisory
              signals reshape high-DOF autonomous controllers into
              qualitatively distinct task behaviours.
            </p>
          </Cartouche>
          <Cartouche title="Failure" meta="ICSE 2025 · ICLR 2026">
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.5, fontSize: "0.95rem" }}>
              SWE-bench re-evaluations show 80 %+ headline scores collapse
              to single digits or 30 % once leakage is removed —
              incremental scaling does not close the comprehension gap.
            </p>
          </Cartouche>
        </div>
      </section>

      <section id="objectives" className="syn-column space-y-8 pt-32">
        <div className="space-y-4">
          <SmallCaps>V · Five objectives, two reporting periods</SmallCaps>
          <ItalicCaption className="max-w-3xl">
            Each objective carries a quantitative threshold, a decision
            milestone, and a documented alternative path if the threshold
            is missed. RP1 closes at M12; RP2 closes at M36.
          </ItalicCaption>
        </div>

        <div
          className="overflow-x-auto rounded-[var(--radius-card)] border"
          style={{
            borderColor: "var(--panel-edge)",
            backgroundColor: "var(--panel-deep)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                <th className="syn-small-caps px-5 py-4">No.</th>
                <th className="syn-small-caps px-5 py-4">Objective</th>
                <th className="syn-small-caps px-5 py-4">Threshold</th>
                <th className="syn-small-caps px-5 py-4">Milestone</th>
                <th className="syn-small-caps px-5 py-4">Lead</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--ink-cool)" }}>
              <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                <td className="syn-display px-5 py-5" style={{ color: "var(--symphony-violet)", fontSize: "1.4rem" }}>O1</td>
                <td className="px-5 py-5" style={{ color: "var(--ink)" }}>Multi-layer extraction pipeline</td>
                <td className="px-5 py-5">≥ 90 % function coverage, ≥ 80 % inter-module dependencies on both demonstrator codebases</td>
                <td className="syn-mono px-5 py-5" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>M12</td>
                <td className="px-5 py-5">Real AI · UP Robotics</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                <td className="syn-display px-5 py-5" style={{ color: "var(--symphony-violet)", fontSize: "1.4rem" }}>O2</td>
                <td className="px-5 py-5" style={{ color: "var(--ink)" }}>Neuromodulatory reconfiguration mechanism</td>
                <td className="px-5 py-5">F1 ≥ 0.6 vs expert annotation, <em>p</em> &lt; 0.01 paired across ≥ 30 instances and ≥ 3 task classes</td>
                <td className="syn-mono px-5 py-5" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>M18</td>
                <td className="px-5 py-5">Newcastle · Real AI</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                <td className="syn-display px-5 py-5" style={{ color: "var(--symphony-violet)", fontSize: "1.4rem" }}>O3</td>
                <td className="px-5 py-5" style={{ color: "var(--ink)" }}>Low-bandwidth task control interface</td>
                <td className="px-5 py-5">Task-switching latency &lt; 500 ms; state-preservation ≥ 0.95 over ≥ 100 trials</td>
                <td className="syn-mono px-5 py-5" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>M24</td>
                <td className="px-5 py-5">CREATE-PRISMA · Newcastle</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                <td className="syn-display px-5 py-5" style={{ color: "var(--symphony-violet)", fontSize: "1.4rem" }}>O4</td>
                <td className="px-5 py-5" style={{ color: "var(--ink)" }}>Benchmarked advantage over LLM and KG baselines</td>
                <td className="px-5 py-5">≥ 20 % relative F1 lift on task-relevant-subgraph recovery; ≥ 15 % in expert-rated actionability</td>
                <td className="syn-mono px-5 py-5" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>M30</td>
                <td className="px-5 py-5">Real AI · external advisory</td>
              </tr>
              <tr>
                <td className="syn-display px-5 py-5" style={{ color: "var(--symphony-violet)", fontSize: "1.4rem" }}>O5</td>
                <td className="px-5 py-5" style={{ color: "var(--ink)" }}>Equitable-access user study (≥ 60 engineers)</td>
                <td className="px-5 py-5">Significant reduction in time-to-first-correct-change for under-represented strata, non-inferior 30-day retention</td>
                <td className="syn-mono px-5 py-5" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>M33</td>
                <td className="px-5 py-5">Newcastle ethics · Real AI</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="consortium" className="syn-column space-y-8 pt-32">
        <SmallCaps>VI · The consortium</SmallCaps>
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          Four partners across three EU member states pair complementary
          expertise: cortical neuromodulation from Newcastle (Ramaswamy);
          haptic shared control from CREATE-PRISMA / UNINA (Siciliano);
          foundation models for the real world from Real AI; and an
          industrial-automation demonstrator codebase from UP Robotics.
          Each lead carries a published, decade-spanning record in the
          slice of the work they own.
        </p>
        <div className="mx-auto w-full max-w-4xl print:hidden">
          <ConsortiumGraph />
          <p className="pt-3 text-center">
            <SmallCaps>Plate III · Consortium</SmallCaps>
          </p>
        </div>
        <figure className="hidden print:block">
          <Image
            src={consortiumPlate}
            alt="Plate III — Consortium plate naming the four SYMPHONY partners: Real AI · Newcastle (Ramaswamy) · CREATE / PRISMA (Siciliano) · UP Robotics, with their roles and the project's three reporting decision points."
            sizes="(min-width: 1024px) 80vw, 100vw"
            placeholder="blur"
            className="mx-auto block h-auto w-full max-w-4xl rounded-[var(--radius-tight)]"
          />
        </figure>
      </section>

      <section className="syn-column pt-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="print:hidden">
            <RamaswamyPedigree />
            <p className="pt-3">
              <SmallCaps>Plate VII · Ramaswamy / Blue Brain</SmallCaps>
            </p>
          </div>
          <figure className="hidden print:block">
            <Image
              src={ramaswamyPlate}
              alt="Plate VII — Newcastle / Sri Ramaswamy / Blue Brain heritage plate: cortical-column anatomy with neuromodulator beams and a pedigree timeline from 2005 to 2026."
              sizes="(min-width: 1024px) 45vw, 100vw"
              placeholder="blur"
              className="block h-auto w-full rounded-[var(--radius-tight)]"
            />
          </figure>
          <div className="space-y-5">
            <SmallCaps>Newcastle University · School of Computing</SmallCaps>
            <h3
              className="syn-display"
              style={{
                fontSize: "2rem",
                color: "var(--ink)",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Sri Ramaswamy
            </h3>
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.6 }}>
              Chair of computational neuroscience at Newcastle&rsquo;s School
              of Computing. Third author of Mei, Muller &amp; Ramaswamy
              (<em>Trends in Neurosciences</em>, 2022) — the four-scale
              neuromodulatory framework that SYMPHONY transposes from
              continuous perceptual signals into the discrete symbolic
              domain of source code. A Blue Brain Project alumnus whose
              pedigree spans cortical microcircuit reconstruction from 2005
              to today.
            </p>
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.6 }}>
              Newcastle leads <strong style={{ color: "var(--ink)" }}>O2</strong> — the implementation of the four-scale neuromodulatory mechanism on the substrate produced by O1 — and co-leads the ethics layer of <strong style={{ color: "var(--ink)" }}>O5</strong>.
            </p>
          </div>
        </div>
      </section>

      <section className="syn-column pt-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5 lg:order-2">
            <SmallCaps>CREATE · PRISMA Lab · UNINA</SmallCaps>
            <h3
              className="syn-display"
              style={{
                fontSize: "2rem",
                color: "var(--ink)",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Bruno Siciliano
            </h3>
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.6 }}>
              Director of the PRISMA Lab — Projects of Industrial and
              Service Manipulation Robotics — at CREATE / UNINA in Naples.
              ERC Advanced Grant holder and Engelberger Award laureate.
              The Siciliano-school programme on haptic shared control
              demonstrated, in hardware, that a low-bandwidth descending
              signal can reshape a high-DOF autonomous controller&rsquo;s
              operating regime without rewriting it — the architectural
              property SYMPHONY transposes from physical manipulation into
              the symbolic control of a code substrate.
            </p>
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.6 }}>
              CREATE-PRISMA leads <strong style={{ color: "var(--ink)" }}>O3</strong> — the derivation of a narrow scalar control interface by which task tokens reshape the substrate&rsquo;s activation regime without modifying its stored structure.
            </p>
            <ItalicCaption className="pt-2">
              Keep the gradient.
            </ItalicCaption>
          </div>
          <figure className="lg:order-1">
            <Image
              src={sicilianoPlate}
              alt="Plate VIII — CREATE / Bruno Siciliano / PRISMA Lab plate: a seven-sector PRISMA rose with the ERC and Engelberger awards, ERC grants and the lab's motto Keep the gradient."
              sizes="(min-width: 1024px) 45vw, 100vw"
              placeholder="blur"
              className="block h-auto w-full rounded-[var(--radius-tight)]"
            />
            <figcaption className="pt-3">
              <SmallCaps>Plate VIII · Siciliano / PRISMA</SmallCaps>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="syn-column pt-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="print:hidden">
            <HominisCathedral />
            <p className="pt-3">
              <SmallCaps>Plate VI · Hominis cathedral</SmallCaps>
            </p>
          </div>
          <figure className="hidden print:block">
            <Image
              src={hominisPlate}
              alt="Plate VI — Hominis cathedral plate: Real AI's foundation-model programme depicted as a three-pillar cathedral standing on the Leonardo / CINECA HPC foundation."
              sizes="(min-width: 1024px) 45vw, 100vw"
              placeholder="blur"
              className="block h-auto w-full rounded-[var(--radius-tight)]"
            />
          </figure>
          <div className="space-y-5">
            <SmallCaps>Real AI · Coordinator</SmallCaps>
            <h3
              className="syn-display"
              style={{
                fontSize: "2rem",
                color: "var(--ink)",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Tarry Singh
            </h3>
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.6 }}>
              Founder of Real AI. Three decades across data and AI delivery
              at industrial scale, with a current focus on foundation models
              for the real world: <em>Hominis</em>, a family of situated,
              auditable, compute-aware foundation models trained on
              allocation time at Leonardo — the EuroHPC supercomputer at
              CINECA, Bologna.
            </p>
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.6 }}>
              Real AI coordinates SYMPHONY end-to-end and leads <strong style={{ color: "var(--ink)" }}>O1</strong> — the four-layer extraction pipeline — and <strong style={{ color: "var(--ink)" }}>O4</strong>, the pre-registered benchmark against frontier LLM and knowledge-graph baselines.
            </p>
          </div>
        </div>
      </section>

      <section className="syn-column pt-24">
        <div className="mx-auto max-w-3xl space-y-5">
          <SmallCaps>UP Robotics · Industrial demonstrator</SmallCaps>
          <h3
            className="syn-display"
            style={{
              fontSize: "2rem",
              color: "var(--ink)",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            The fourth partner
          </h3>
          <p style={{ color: "var(--ink-cool)", lineHeight: 1.6 }}>
            UP Robotics contributes the industrial-automation demonstrator
            codebase. The O1 pipeline that builds the substrate and the
            O4 benchmark that validates it must both survive contact with
            this code — a production system whose maintenance logs supply
            half of the held-out task instances. Without a real industrial
            system in the loop, SYMPHONY is a paper claim.
          </p>
          <Hairline />
        </div>
      </section>

      <section className="syn-column pt-32">
        <Cartouche title="The critical uncertainty" meta="§1.2">
          <p
            style={{
              color: "var(--ink)",
              fontSize: "var(--text-body)",
              lineHeight: 1.6,
            }}
          >
            Whether multi-scale neuromodulation — demonstrated in continuous
            perceptual and motor domains characterised by embodied feedback —
            transfers to a symbolic and structural domain (source code) where
            the signals are discrete, hierarchical, and linguistic. This is
            not a question of engineering polish; it is a question of
            whether the biological principle generalises.
          </p>
          <p
            style={{
              color: "var(--ink-cool)",
              fontSize: "var(--text-body)",
              lineHeight: 1.6,
              marginTop: "1rem",
            }}
          >
            The five objectives above are constructed so that their decision
            milestones surface a clear answer within the project&rsquo;s
            36 months — not by retreat to a less ambitious aim, but by
            forcing the question into a measurable outcome.
          </p>
        </Cartouche>
      </section>

      <section id="dossier" className="syn-column pt-24 text-center">
        <SmallCaps>VII · Read the full submission</SmallCaps>
        <div className="pt-6">
          <a
            href="/dossiers/Symphony-Additional-Information-Dossier.docx"
            download
            className="syn-display inline-flex items-baseline gap-3 transition-opacity hover:opacity-80"
            style={{
              fontSize: "1.6rem",
              color: "var(--symphony-violet-hi)",
              letterSpacing: "var(--track-display)",
              lineHeight: 1.2,
            }}
          >
            Download the dossier
            <span aria-hidden style={{ fontSize: "1.4rem" }}>→</span>
          </a>
        </div>
        <p
          className="syn-small-caps pt-3"
          style={{ color: "var(--ink-dim)" }}
        >
          25 pages · .docx · 7.6 MB · Symphony additional-information submission
        </p>
      </section>

      <footer className="syn-column pb-24 pt-32 text-center">
        <ItalicCaption className="mx-auto max-w-2xl">
          Same substrate. Different harmonies.
        </ItalicCaption>
      </footer>

      <JumpNav sections={SECTIONS} />
    </>
  )
}
