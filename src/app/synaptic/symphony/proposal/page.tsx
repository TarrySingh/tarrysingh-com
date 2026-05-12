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
  { id: "evidence", label: "4 · Evidence" },
  { id: "objectives", label: "5 · Objectives" },
  { id: "consortium", label: "6 · Consortium" },
  { id: "applications", label: "7 · Applications" },
  { id: "gtm", label: "8 · Go-to-market" },
  { id: "funder", label: "9 · Funder brief" },
  { id: "risks", label: "10 · Risks" },
  { id: "roadmap", label: "11 · Roadmap" },
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

export default function SymphonyProposalPage() {
  return (
    <>
      {/* breadcrumb / header */}
      <header className="syn-column pb-8 pt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <Link
            href="/synaptic/symphony"
            className="syn-small-caps hover:opacity-80"
            style={{ color: "var(--symphony-violet-hi)" }}
          >
            ← Return to the planisphere
          </Link>
          <SmallCaps>Synaptic Cartography · Plate II · The full proposal</SmallCaps>
        </div>
        <Hairline className="mt-6" />
        <div className="mt-12 text-center">
          <SmallCaps>EIC Pathfinder 2026 · proposal dossier</SmallCaps>
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
            SYMPHONY
          </h1>
          <ItalicCaption className="mx-auto mt-5 max-w-3xl">
            Bridging neuroscience, control theory and software engineering — a
            multi-scale neuromodulated substrate for task-adaptive code
            understanding.
          </ItalicCaption>
          <p
            className="syn-small-caps mt-3"
            style={{
              color: "var(--ink-dim)",
              letterSpacing: "0.3em",
            }}
          >
            · the complete dossier ·
          </p>
        </div>
      </header>

      {/* Section 0 — Abstract */}
      <section id="abstract" className="syn-column space-y-6 pt-24">
        <SmallCaps>0 · Abstract</SmallCaps>
        <p style={proseInkStyle}>
          SYMPHONY will establish the first <em>neuromimetic knowledge
          substrate</em> for software systems: a representation in which
          modules, functions, tests, commit history and design decisions
          are encoded as nodes in a multi-scale network whose activation
          patterns are reconfigured, on demand, by task-specific
          neuromodulatory signals. A code representation that behaves less
          like a document and more like a nervous system — foregrounding
          what the engineer&rsquo;s current task needs.
        </p>
        <p style={proseStyle}>
          Five objectives across 36 months deliver a four-layer extraction
          pipeline (M12), a neuromodulatory reconfiguration mechanism
          (M18), a low-bandwidth task-control interface (M24), a 20&nbsp;%
          F1 lift over LLM and knowledge-graph baselines (M30), and a user
          study with at least 60 stratified engineers (M33). The consortium
          pairs Real AI, Newcastle (Ramaswamy), CREATE-PRISMA / UNINA
          (Siciliano) and UP&nbsp;Robotics.
        </p>
        <ItalicCaption className="max-w-3xl">
          SYMPHONY targets TRL 1–4 and aligns with EIC Pathfinder for a
          persistent, task-adaptive, auditable substrate of code
          understanding.
        </ItalicCaption>
      </section>

      {/* Section 1 — Problem */}
      <section id="problem" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>1 · The problem</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Two ceilings, both visible this decade
          </h2>
        </div>
        <p style={proseStyle}>
          Current approaches to machine code understanding divide into two
          families, each with a structural ceiling we expect to hit within
          this decade.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <Cartouche title="Statistical" meta="LLM agents">
            <p style={{ color: "var(--ink)", lineHeight: 1.55, fontSize: "0.95rem" }}>
              Claude Opus 4.5 crossed 80&nbsp;% on SWE-bench Verified in
              December 2025. Independent re-evaluation at ICSE 2025
              Companion dropped leading SWE-agent configurations from
              12.47&nbsp;% to 3.97&nbsp;% once solution leakage and weak
              test cases were removed. ICLR 2026 SWE-Bench+ replicated the
              collapse on SWE-agent 1.0 with Claude 3.5 (57.6&nbsp;% →
              31.8&nbsp;%). Production LLM context windows remain in the
              low hundreds of thousands of tokens while industrial
              codebases span millions — retrieval augmentation supplies
              local relevance, not system-level coherence.
            </p>
          </Cartouche>
          <Cartouche title="Structural" meta="static analysis · EAKG">
            <p style={{ color: "var(--ink)", lineHeight: 1.55, fontSize: "0.95rem" }}>
              SonarQube, PMD, IntelliJ inspections, architecture recovery
              and architecture knowledge graphs capture what is explicitly
              encoded — call graphs, dependency edges, type hierarchies,
              declared interfaces. They do not capture the design rationale
              or the contextual activation of architectural knowledge.
              Avgeriou et al. (2007) identified that tier as the hardest
              software-engineering knowledge to externalise, and it
              remains so.
            </p>
          </Cartouche>
        </div>
        <p style={proseStyle}>
          The widening gap between software-system complexity (roughly
          doubling every four years since 1970) and individual human
          comprehension capacity (close to flat across the same period) is
          the addressable problem. SYMPHONY proposes to close it not by
          enlarging the engineer, but by reshaping the substrate they
          navigate.
        </p>
      </section>

      {/* Section 2 — Solution */}
      <section id="solution" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>2 · The solution</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            A neuromimetic substrate, three advances
          </h2>
        </div>
        <p style={proseStyle}>
          SYMPHONY&rsquo;s advance is not to improve either of the two
          incumbent families but to combine their information content under
          a different organising principle drawn from biology. Both
          cortical neuromodulation in the mammalian brain and descending
          corticospinal modulation in the vertebrate motor system are
          mechanisms by which a fixed underlying network produces
          qualitatively different, task-appropriate activation patterns in
          response to low-bandwidth descending signals.
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <NumberedDisk number="i" tone="violet" size={52} />
            <h3 className="syn-display" style={subHeading}>
              Multi-layer extraction
            </h3>
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.6, fontSize: "0.95rem" }}>
              Structural, behavioural, historical and rationale layers
              unified in a single graph-resident representation built for
              activation-based retrieval, not query-based retrieval.
            </p>
          </div>
          <div className="space-y-3">
            <NumberedDisk number="ii" tone="violet" size={52} />
            <h3 className="syn-display" style={subHeading}>
              Context-dependent activation
            </h3>
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.6, fontSize: "0.95rem" }}>
              A single substrate state surfaces different subnetworks under
              an externally specified task token, using the four-scale
              neuromodulatory primitives of Mei, Muller &amp; Ramaswamy
              (2022) as the mathematical template.
            </p>
          </div>
          <div className="space-y-3">
            <NumberedDisk number="iii" tone="violet" size={52} />
            <h3 className="syn-display" style={subHeading}>
              Low-bandwidth control
            </h3>
            <p style={{ color: "var(--ink-cool)", lineHeight: 1.6, fontSize: "0.95rem" }}>
              Borrowed from Siciliano-school haptic shared control — a
              narrow scalar control surface, not a prompt window.
              Composable, auditable, bounded. This is the property that
              makes the substrate amenable to industrial governance.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — Novelty */}
      <section id="novelty" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>3 · The novelty</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Three disciplines, one substrate
          </h2>
        </div>
        <p style={proseStyle}>
          The category SYMPHONY seeds is the <em>auditable code-comprehension
          substrate</em> — a class of artefact that does not exist today
          and is structurally distinct from both the dominant LLM-agent
          platforms (GitHub Copilot, Cursor, Claude Code, Replit Agent)
          and the legacy static-analysis toolchains. Its novelty sits at
          the intersection of three mature fields that have not yet been
          combined in this way.
        </p>
        <div className="space-y-6">
          <div
            className="rounded-2xl border p-6"
            style={{
              borderColor: "rgba(244,196,130,0.35)",
              background:
                "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <SmallCaps>Neuroscience · the mechanism</SmallCaps>
            <h3
              className="syn-display mt-3"
              style={{ ...subHeading, color: "var(--symphony-amber-hi)" }}
            >
              Four-scale neuromodulation, transposed
            </h3>
            <p className="mt-3" style={proseInkStyle}>
              Mei, Muller &amp; Ramaswamy (<em>Trends in Neurosciences</em>,
              2022) formalised a four-scale framework for integrating
              neuromodulation into deep networks — hyperparameter,
              plasticity, neuronal and dendritic. SYMPHONY transposes that
              framework from its native perceptual and motor domains into
              a symbolic and structural domain (source code) where signals
              are discrete, hierarchical, and linguistic. <em>This is the
              load-bearing scientific bet.</em>
            </p>
          </div>
          <div
            className="rounded-2xl border p-6"
            style={{
              borderColor: "rgba(108,180,194,0.35)",
              background:
                "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <SmallCaps>Robotics · the control surface</SmallCaps>
            <h3
              className="syn-display mt-3"
              style={{ ...subHeading, color: "var(--memphis-teal)" }}
            >
              Haptic shared control, in software
            </h3>
            <p className="mt-3" style={proseInkStyle}>
              Selvaggio, Pacchierotti, Giordano &amp; Siciliano showed
              across a decade of RA-L / ICRA / T-RO papers (2018–2025)
              that a low-bandwidth supervisory signal reshapes a
              high-degree-of-freedom autonomous controller into
              qualitatively distinct task behaviours — without rewriting
              the controller. SYMPHONY adopts that architectural primitive
              as the task-baton interface: a small set of scalar modulatory
              signals, intentionally narrow, so behaviour is composable,
              auditable and bounded.
            </p>
          </div>
          <div
            className="rounded-2xl border p-6"
            style={{
              borderColor: "rgba(166,152,212,0.35)",
              background:
                "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <SmallCaps>Foundation models · the substrate engineering</SmallCaps>
            <h3
              className="syn-display mt-3"
              style={{ ...subHeading, color: "var(--symphony-violet-hi)" }}
            >
              Next-generation, situated, auditable
            </h3>
            <p className="mt-3" style={proseInkStyle}>
              Real AI&rsquo;s Hominis programme builds foundation models
              for the real world — situated, auditable and compute-aware,
              trained at Leonardo / CINECA on EuroHPC allocation time.
              SYMPHONY uses that engineering base to assemble the
              substrate at industrial scale, but inverts the usual
              foundation-model deployment shape: instead of a fixed model
              serving prompts, the substrate is a slow, persistent
              representation whose <em>activation</em> is steered by the
              engineer&rsquo;s task — a different system primitive.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 — Evidence */}
      <section id="evidence" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>4 · Evidence</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Three converging lines support the mechanism
          </h2>
        </div>
        <p style={proseStyle}>
          At TRL 1–4 the question is whether the mechanism is sound, not
          whether an industrial artefact exists. Three independent lines
          of published evidence support it.
        </p>
        <ul className="space-y-4">
          <li className="flex gap-4">
            <span
              className="syn-display flex-shrink-0"
              style={{ color: "var(--symphony-amber-hi)", fontSize: "1.4rem" }}
            >
              i.
            </span>
            <p style={proseStyle}>
              <span style={{ color: "var(--ink)" }}>Simulation.</span>{" "}
              Mei, Muller &amp; Ramaswamy (2022) demonstrated, in
              simulation, that neuromodulatory units at the four scales
              produce the three behaviours SYMPHONY requires — faster
              adaptation, higher cumulative reward across task sequences,
              and resistance to catastrophic forgetting.
            </p>
          </li>
          <li className="flex gap-4">
            <span
              className="syn-display flex-shrink-0"
              style={{ color: "var(--symphony-amber-hi)", fontSize: "1.4rem" }}
            >
              ii.
            </span>
            <p style={proseStyle}>
              <span style={{ color: "var(--ink)" }}>Hardware.</span>{" "}
              The Siciliano-school programme (RA-L 2018; ICRA 2019;
              IROS 2019; RA-L 2020; T-RO 2022; ICUAS 2025; RAS 2025;
              JIRS 2023) and Caccavale &amp; Finzi (TopiCS 2021,
              Autonomous Robots 2019) showed in physical hardware that
              low-bandwidth supervisory signals produce qualitatively
              distinct, context-appropriate behaviours from a single
              underlying autonomous controller — the architectural property
              SYMPHONY transposes.
            </p>
          </li>
          <li className="flex gap-4">
            <span
              className="syn-display flex-shrink-0"
              style={{ color: "var(--symphony-amber-hi)", fontSize: "1.4rem" }}
            >
              iii.
            </span>
            <p style={proseStyle}>
              <span style={{ color: "var(--ink)" }}>Failure mode.</span>{" "}
              The SWE-bench re-evaluations cited above, plus the
              context-window ceiling documented across LLM
              architecture-recovery work in 2024–2025, establish that the
              current dominant statistical approach is <em>not</em> on a
              trajectory to close the gap by incremental scaling alone.
              SYMPHONY is therefore not a scaling bet.
            </p>
          </li>
        </ul>
      </section>

      {/* Section 5 — Objectives */}
      <section id="objectives" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>5 · Objectives</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Five objectives, two reporting periods
          </h2>
        </div>
        <p style={proseStyle}>
          Each objective carries a quantitative threshold, a decision
          milestone, and a documented alternative path if the threshold
          is missed. RP1 closes at M12; RP2 closes at M36. The full
          objective table (with thresholds, milestones and partner leads)
          sits on the parent /synaptic/symphony page — section V.
        </p>
        <ItalicCaption className="max-w-3xl">
          O1 multi-layer extraction (M12) · O2 neuromodulatory reconfig
          (M18) · O3 low-bandwidth control (M24) · O4 benchmarked
          advantage (M30) · O5 equitable-access study (M33).
        </ItalicCaption>
      </section>

      {/* Section 6 — Consortium */}
      <section id="consortium" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>6 · Consortium</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Four partners across three EU member states
          </h2>
        </div>
        <p style={proseStyle}>
          <span style={{ color: "var(--ink)" }}>Real AI (NL)</span>{" "}
          coordinates and leads O1, O4. Founded by Tarry Singh; builds
          Hominis on EuroHPC allocation time at Leonardo / CINECA.{" "}
          <span style={{ color: "var(--ink)" }}>Newcastle (UK)</span> —
          Sri Ramaswamy, chair in computational neuroscience, third author
          of Mei-Muller-Ramaswamy 2022; Blue Brain alumnus. Leads O2 and
          co-leads ethics for O5. <span style={{ color: "var(--ink)" }}>CREATE-PRISMA / UNINA
          (IT)</span> — Bruno Siciliano, director of PRISMA Lab, ERC
          Advanced Grant holder, Engelberger laureate; leads O3.{" "}
          <span style={{ color: "var(--ink)" }}>UP Robotics (HR)</span> —
          industrial-automation demonstrator codebase, supplies half the
          held-out task instances for O4 evaluation.
        </p>
      </section>

      {/* Section 7 — Applications */}
      <section id="applications" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>7 · Industry applications</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Four sectoral pathways
          </h2>
        </div>
        <p style={proseStyle}>
          Downstream impact concentrates in four sectors where the cost
          of opaque, undocumented or unmaintainable software is already
          material and growing.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              tag: "Industrial automation",
              title: "PLC code · robot programs · SCADA",
              body: "The European industrial base operates on code that routinely outlives the engineers who wrote it. UP Robotics confirms the pattern across its customer installations in Croatia and the wider region. A substrate that lets a maintenance engineer ask the engineering question directly, with a control surface procurement can audit, on real industrial code.",
            },
            {
              tag: "Critical infrastructure",
              title: "Telecom · grid SCADA · rail signalling",
              body: "Telecommunications stacks, electricity-grid SCADA, public-administration legacy systems and rail signalling are dominated by software written across multiple decades and multiple contractors, with the implicit knowledge that bound it together largely retired. The cost of comprehension here is sovereign.",
            },
            {
              tag: "Sovereign AI tooling",
              title: "European code-AI under European governance",
              body: "Code-comprehension and code-generation tooling is presently dominated by US-headquartered platforms operated under non-European governance. The 2026 EU policy push for sovereign foundation models and EU-jurisdiction inference creates a procurement-grade window for an auditable, European-jurisdiction code-AI stack.",
            },
            {
              tag: "Scientific software",
              title: "Research-software sustainability",
              body: "Two decades of EU-funded computational artefacts — CERN analysis pipelines, ESA flight-software toolchains, EBI bioinformatics platforms — whose long-tail maintenance falls disproportionately on early-career researchers. A substrate that surfaces design rationale and historical context is precisely the sustainability tool the EU&rsquo;s open-science programmes have been asking for.",
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
                style={{
                  ...subHeading,
                  fontSize: "1.1rem",
                  color: "var(--ink)",
                }}
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

      {/* Section 8 — Go-to-market */}
      <section id="gtm" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>8 · Go-to-market</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            The JV path, the IP strategy, the follow-on
          </h2>
        </div>
        <p style={proseStyle}>
          The consortium has agreed in principle on a{" "}
          <span style={{ color: "var(--ink)" }}>Real AI × UP Robotics
          joint venture</span> as the primary exploitation vehicle for the
          SYMPHONY substrate. Terms are set out in the Consortium Agreement
          at grant preparation and refined into a binding term sheet by
          M40. Newcastle and CREATE retain academic ownership of their
          respective contributions — the neuromodulation framework and the
          haptic shared-control formalism — and grant the JV a
          non-exclusive, royalty-bearing licence for industrial use.
        </p>
        <Cartouche title="IP strategy" meta="four categories">
          <div className="space-y-3" style={{ color: "var(--ink-cool)", lineHeight: 1.55, fontSize: "0.92rem" }}>
            <p>
              <span style={{ color: "var(--ink)" }}>(i) The four-layer
              graph schema and the substrate&rsquo;s neuromodulated
              activation mechanism</span> — open under Apache-2.0 and
              CC-BY 4.0, with a single defensive patent application
              planned by Real AI to prevent enclosure by third parties.
            </p>
            <p>
              <span style={{ color: "var(--ink)" }}>(ii) The task-baton
              control formalism</span> — Newcastle and CREATE retain
              academic IP; JV gets a non-exclusive, royalty-bearing
              licence for industrial deployment.
            </p>
            <p>
              <span style={{ color: "var(--ink)" }}>(iii) Industrial
              integration code and SCADA-specific adapters</span> —
              proprietary to the JV, sold or licensed to industrial
              customers under standard commercial terms.
            </p>
            <p>
              <span style={{ color: "var(--ink)" }}>(iv) Benchmark
              datasets and the O5 user-study protocol</span> — open
              under CC-BY 4.0 to support replication and meta-research.
            </p>
          </div>
        </Cartouche>
        <p style={proseStyle}>
          <span style={{ color: "var(--ink)" }}>EIC Transition follow-on.</span>{" "}
          Primary follow-on instrument is EIC Transition, applied for in
          Year 4 (target submission window M37–M40, immediately after
          project end). The Transition application will use SYMPHONY&rsquo;s
          O4 quantitative advantage and O5 user-study evidence as its core
          scientific case, with a TRL-5 industrial pilot at UP Robotics as
          its technological case.
        </p>
        <p style={proseStyle}>
          <span style={{ color: "var(--ink)" }}>Regulation, certification, standardisation.</span>{" "}
          Three regimes bear on downstream deployment and are tracked from
          project start: the AI Act&rsquo;s high-risk classification (a
          code-comprehension substrate in regulated industries likely
          falls within Annex III); the Cyber Resilience Act&rsquo;s
          software-of-unknown-pedigree provisions; and emerging
          code-attribution obligations. Working notes are contributed to
          CEN-CENELEC JTC 21 (AI) by M30 and ISO/IEC JTC 1/SC 42 by
          Year&nbsp;4.
        </p>
      </section>

      {/* Section 9 — Funder brief */}
      <section id="funder" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>9 · The investment thesis</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            A compelling brief to funders and VCs
          </h2>
        </div>
        <p style={proseStyle}>
          SYMPHONY is a deep-tech research bet whose value compounds on
          three layers: the science, the European procurement window for
          sovereign code-AI, and the commercial JV that the consortium has
          committed to from grant signature.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: "I",
              h: "Why this, why now",
              b: "Independent re-evaluation has publicly cracked the SWE-bench narrative. The incumbent statistical approach to code understanding is documented as not on a trajectory to close the comprehension gap by scaling alone. The market is short an architecturally distinct alternative, and the EU is short a sovereign one.",
            },
            {
              n: "II",
              h: "Why this consortium",
              b: "The mathematical primary source for the mechanism (Ramaswamy, Newcastle) and the architectural primary source for the control surface (Siciliano, CREATE-PRISMA) are co-investigators. The industrial coalface is supplied by UP Robotics. Real AI integrates and coordinates. The pedigree depth is the moat — it cannot be assembled by a competing team in less than five years.",
            },
            {
              n: "III",
              h: "What you get by Year 5",
              b: "A JV term sheet executed by M40; an EIC Transition grant secured by Year 5; a defensive system-architecture patent filed; at least one industrial pilot beyond UP Robotics' existing customer base contracted; the JV cash-positive on bilateral industrial contracts under both the project EIC follow-on and the post-project commercial path.",
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
                  color: "var(--symphony-amber-hi)",
                  lineHeight: 1,
                }}
              >
                {c.n}
              </span>
              <h3
                className="syn-display mt-2"
                style={{ ...subHeading, fontSize: "1.1rem", color: "var(--ink)" }}
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
        <Cartouche title="Verifiable Year-5 markers" meta="commitments">
          <ul className="space-y-2" style={{ color: "var(--ink)", lineHeight: 1.55, fontSize: "0.95rem" }}>
            <li>· JV term sheet executed by M40.</li>
            <li>· EIC Transition grant secured by Year 5.</li>
            <li>· Defensive system-architecture patent filed.</li>
            <li>· At least one industrial pilot beyond UP Robotics&rsquo; existing customer base contracted.</li>
            <li>· The auditable code-comprehension substrate category recognised by name in at least one EU AI Act / Cyber Resilience Act consultation response.</li>
          </ul>
        </Cartouche>
        <p style={proseStyle}>
          The EIC Investor Programme and Real AI&rsquo;s existing European
          deep-tech investor network are the two routes for parallel
          private capital. Targeted briefings are part of the project
          dissemination plan from M18.
        </p>
      </section>

      {/* Section 10 — Risks */}
      <section id="risks" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>10 · Risks and what we do about them</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            The critical uncertainty, the harms, the barriers
          </h2>
        </div>
        <Cartouche title="The critical uncertainty" meta="§1.2">
          <p style={proseInkStyle}>
            Whether multi-scale neuromodulation — demonstrated in
            continuous perceptual and motor domains characterised by
            embodied feedback — transfers to a symbolic and structural
            domain (source code) where the signals are discrete,
            hierarchical, and linguistic. This is not a question of
            engineering polish; it is a question of whether the biological
            principle generalises. The five objectives are constructed so
            their decision milestones surface a clear answer within 36
            months.
          </p>
        </Cartouche>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Misuse for IP exfiltration",
              b: "A substrate trained on a proprietary codebase could externalise design rationale in ways that defeat normal IP protections. Mitigation: technically, the substrate is bound to its training codebase and cannot be queried about unexposed projects; legally, training corpora are bounded by Consortium Agreement IP clauses.",
            },
            {
              t: "Deskilling of junior engineers",
              b: "A substrate that surfaces answers too easily can erode the apprenticeship value of unfamiliar code. The O5 user study detects this directly: a pre-registered secondary endpoint measures 30-day retention with a non-inferiority margin such that a positive speed effect cannot come at the cost of substantive deskilling.",
            },
            {
              t: "Energy footprint of training",
              b: "DNSH commitment in §1.3 already binds SYMPHONY to per-paper tCO₂e reporting (Green Algorithms methodology) and an absolute compute-budget cap declared in the DMP. Make this a published metric in M30 / M36 deliverables; an over-budget month triggers a documented re-plan rather than overrun.",
            },
          ].map((r) => (
            <div
              key={r.t}
              className="rounded-xl border p-5"
              style={{
                borderColor: "rgba(200,180,255,0.18)",
                background:
                  "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <h3
                className="syn-display"
                style={{ ...subHeading, fontSize: "1.05rem", color: "var(--ink)" }}
              >
                {r.t}
              </h3>
              <p
                className="mt-3"
                style={{
                  color: "var(--ink-cool)",
                  lineHeight: 1.6,
                  fontSize: "0.92rem",
                }}
              >
                {r.b}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 11 — Roadmap */}
      <section id="roadmap" className="syn-column space-y-8 pt-32">
        <div className="space-y-3">
          <SmallCaps>11 · Roadmap</SmallCaps>
          <h2 className="syn-display" style={sectionHeading}>
            Thirty-six months, five milestones, one transition
          </h2>
        </div>
        <ol className="space-y-3" style={{ color: "var(--ink-cool)", lineHeight: 1.6, fontSize: "0.95rem" }}>
          <li>
            <span className="syn-mono" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>M01–M06</span>
            <span> · Project kick-off, Consortium Agreement, dissemination plan (D1.2), comms officer onboarded, regulatory-watch begins.</span>
          </li>
          <li>
            <span className="syn-mono" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>M12 · O1</span>
            <span> · Multi-layer extraction pipeline. ≥ 90 % function coverage, ≥ 80 % inter-module dependencies on both demonstrator codebases. RP1 closes.</span>
          </li>
          <li>
            <span className="syn-mono" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>M18 · O2</span>
            <span> · Neuromodulatory reconfiguration. F1 ≥ 0.6 against expert ground-truth across ≥ 3 task classes, p &lt; 0.01.</span>
          </li>
          <li>
            <span className="syn-mono" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>M24 · O3</span>
            <span> · Low-bandwidth control. Task-switch &lt; 500 ms, state-preservation ≥ 0.95 across ≥ 100 trials.</span>
          </li>
          <li>
            <span className="syn-mono" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>M30 · O4</span>
            <span> · Benchmark advantage. ≥ 20 % relative F1 lift on task-relevant-subgraph recovery, ≥ 15 % in expert-rated actionability. Primary publication submitted to Nature Machine Intelligence.</span>
          </li>
          <li>
            <span className="syn-mono" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>M33 · O5</span>
            <span> · Equitable-access user study. ≥ 60 engineers stratified; significant time-to-first-correct-change reduction for under-represented strata; 30-day retention non-inferior.</span>
          </li>
          <li>
            <span className="syn-mono" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>M36</span>
            <span> · Project close. RP2 closes. Final D-deliverables, public dataset release.</span>
          </li>
          <li>
            <span className="syn-mono" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>M37–M40</span>
            <span> · EIC Transition submission window. JV term sheet executed.</span>
          </li>
          <li>
            <span className="syn-mono" style={{ color: "var(--ink)", letterSpacing: "var(--track-mono)" }}>Year 5</span>
            <span> · EIC Transition grant secured. Industrial pilot beyond UP Robotics contracted. Defensive patent filed.</span>
          </li>
        </ol>
      </section>

      {/* Closing */}
      <footer className="syn-column pb-24 pt-40 text-center">
        <ItalicCaption className="mx-auto max-w-2xl">
          Same substrate. Different harmonies.
        </ItalicCaption>
        <div className="pt-10">
          <Link
            href="/synaptic/symphony"
            className="syn-small-caps inline-flex items-center gap-2 hover:opacity-80"
            style={{ color: "var(--symphony-violet-hi)" }}
          >
            ← Return to the planisphere
          </Link>
        </div>
      </footer>

      <JumpNav sections={SECTIONS} />
    </>
  )
}
