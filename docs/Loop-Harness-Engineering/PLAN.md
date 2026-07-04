# THE ENGINE ROOM — Loop & Harness Engineering
### Synaptic Plate V · master plan · v1 (2026-07-04)

A 30,000-word (exactly), code-heavy, engineering-driven long-form essay with 15
sophisticated interactive instruments, live at `/synaptic/loop-harness` on
tarrysingh.com, feeding derivative articles to realai.eu Insights and
earthscan.io. The discipline it names — **Loop & Harness Engineering** — is the
engineering core of Real AI's AIOps strategy.

---

## 0. Non-negotiables (verbatim from Tarry, restated as gates)

| # | Non-negotiable | Enforced by |
|---|---|---|
| 1 | **Absolutely zero AI slop** | THREE binding artifacts, adopted wholesale: (a) the Insights & Instrument Contract (CORE, `realai-v2/docs/INSIGHTS-INSTRUMENT-CONTRACT-CORE.md`) — truth gate, do-not-use list, red-team; (b) the **living anti-LLM-smell contract** (`~/.claude/projects/-Users-tarrysingh-Documents-GitHub/memory/feedback_anti_llm_smell_contract.md`, weekly-refreshed by the `ai-slop-watch` cron) — NO em-dash, the banned-vocab + banned-phrase + structural-tell lists; (c) the **shared scanner** `realai-v2/scripts/check-llm-smell.mjs` — ported into tarrysingh-com in LH-P1 and wired as a pre-commit + CI gate over the Engine Room chapters AND instrument label strings (SVG text renders on the page; it is prose). |
| 2 | **Very engineering-driven** | Real configs, real code panes, real terminal traces in every chapter; every instrument encodes a mechanism, not a metaphor. |
| 3 | **15 sophisticated interactive visualizations** | The instrument roster in §4 — each RIS-grade (zone engine, expandable, deterministic, screenshot-QA'd at 3 widths), each *argues* its insight, each interaction-distinct from the other 14 AND from the existing synaptic catalogue. |
| 4 | **30,000 words to the dot** | Word-gate script counts rendered prose; the chapter budget in §5 sums to exactly 30,000; final polish tunes to the dot. |
| 5 | **Extremely thorough internet research** | P0 research fleet: 10 sweep angles × adversarial re-verification → Source Ledger + claim bank + do-not-use list (chokepoint discipline, ~130+ sources expected). |
| 6 | **Future disruptive roles, real human-machine partnership** | Grounded in WORKBank/Human Agency Scale (Shao et al. 2025) — the H3 "equal partnership" finding (45.2% of occupations), the 47.5% agency gap — plus the role cartography chapter. |
| 7 | **Use case: AI Loop & Harness Researcher** (trains a full frontier model + agentic stack from scratch on private corporate data) | Chapter 8 + instrument V11 — the end-to-end privately-owned-stack argument, parameterized by company archetype, with honest compute/cost/team envelopes. |
| 8 | **Use case: AI Loop & Harness R&D Researcher** (materials / multi-omics / drug discovery) — 100% realistic, market-relevant, no hallucination | Chapter 9 + instrument V12 — anchored ONLY to shipped systems (A-Lab, GNoME, Coscientist, AlphaFold-class, Insilico/Recursion pipelines), each claim red-teamed. |
| 9 | **Corporate-data chapter ≥ 5,000 words** using the handover package | Chapter 7 (budgeted 5,200 words) built on `HANDOVER-data-asymmetry.md` — frozen figures, frozen copy, Data Iceberg + Vault Bore instruments. |
| 10 | **Link to Real AI's AIOps strategy** | Chapter 12 + instrument V15 (the AIOps Command Deck); products-as-advice per contract criterion B; derivative pipeline in §9. |
| 11 | **Quality no less than 10/10** (Tarry, 2026-07-04) | The CORE contract's "floor ≥8, target 10" does NOT apply to this flagship: **10/10 on all five criteria IS the ship floor.** Anything judged below 10 in red-team/design-panel goes back, not forward. |
| 12 | **Audience locked**: engineers, software developers, engineering managers — startups, scaleups, enterprises | The BINDING's named expert reader: *a staff engineer or EM who has shipped (or is about to ship) an agent system to production.* Voice: engineering-native — code first, mechanisms named plainly (sandbox, eval, RLAIF), zero business-fluff, zero hand-holding. Criterion A is judged against this reader nodding in five seconds. |
| 13 | **CTA layer with real provenance** (Tarry, 2026-07-04) | Four CTA moments, contract-compliant (data → advice → pointer, never pitch): see §6b. Includes the O&G/Earthscan six-years-of-automated-MLOps provenance, the Real AI "before it had a name" provenance, and the **Hominis Agentic OS** allusion pointing to realai.eu. |

---

## 1. Thesis (one paragraph)

Everyone argues about models. Almost nobody talks about the two things that
decide whether a model ever does useful work: the **loop** (goal → plan → act →
verify → persist → continue/stop) and the **harness** (the standing structure —
context, permissions, hooks, verifiers, tools, memory — the loop runs inside).
The same anatomy that makes a hobbyist's `.claude/` folder converge is what
makes RLHF converge at frontier labs and what will make a self-driving
laboratory converge on a new material. Loop & Harness Engineering is the
discipline of building those two layers deliberately — and it is the highest-
leverage engineering role of the next decade, because the model is becoming a
commodity while the loop and the harness around *your data and your process*
cannot be bought. That is the sovereign wedge, and the essay closes it into an
operating strategy: AIOps.

**Naming decision (flag for Tarry):** Gartner spent "AIOps" years ago on
AI-for-IT-operations (anomaly detection, incident response). Our expert readers
will notice. Recommendation: the *discipline* is named **Loop & Harness
Engineering** throughout the essay; **AIOps** is used as Real AI's *strategy
brand* for operating agent fleets in the enterprise, with one honest sidebar in
Ch12 acknowledging and deliberately outgrowing the Gartner sense ("IT ops
watched the machines; AIOps runs the machines that work"). Alternative if Tarry
prefers: coin "AgentOps" — noting that term also has a tooling company attached.
Decision needed before Ch12 drafts.

---

## 2. Route, design language, kit

- **Route:** `/synaptic/loop-harness` — `robots: noindex` until Tarry ships it.
- **Series slot:** Plate V (after Chokepoint's Plate IV).
- **Working title:** `THE ENGINE ROOM — Loop & Harness Engineering`
  (alternatives: "CLOSED LOOP", "THE LOOP & THE HARNESS"). Subtitle direction:
  *"How working machines are actually made to work — and the people who will
  run them."*
- **Palette `.syn-loop`** (new room in globals.css): graphite blue-black field
  (`#0a0e18` family), **phosphor green** `#4ade80`-family as the ONE scarce
  accent (the live signal), signal **amber** for verdicts/warnings, rose
  reserved strictly for danger (contract §3.4), cool ink `#e6edf3`. Terminal
  aesthetic: IBM Plex Mono carries more weight than any previous plate; Gloock
  stays for display.
- **`loop-kit.tsx`** — the shared instrument kit, built ONCE to the RIS spec
  (contract §3.1) and inherited by all 15: zone-engine lanes (no overlap by
  construction), `⤢ expand` modal frame, seeded-deterministic RNG (SSR === CSR),
  reduced-motion static states, `CodePane` (syntax-highlighted config/terminal
  panes with copy affordance) and `TerminalTrace` (typed-log replay) primitives.
- Reuses: PlateFrame/read-chart-kit patterns, LazyMount, JumpNav,
  SynapticSubscribe (already themes itself), inline subscribe bands, OG-image
  pattern, plate-cover workflow, per-chapter `Sources` ledger component.
- **Anti-slop tooling (LH-P1 deliverable):** port `check-llm-smell.mjs` from
  realai-v2 into `scripts/` here, scoped to the Engine Room chapter components
  + instrument files; run in the gate alongside tsc/eslint/word-gate. Keep the
  realai-v2 copy as the single upstream; ours tracks it.
- **Term-of-art exemptions (write into the BINDING):** the *noun* "harness"
  and "loop" are the essay's technical subject and are exempt; the figurative
  *verb* "harness" ("harness the power of") stays banned. Same logic for
  "hooks", "pipeline". No other exemptions without Tarry's sign-off.

---

## 3. Source spine (already in hand)

| Source | What it feeds |
|---|---|
| `loop-harness.docx` / PDF pp.1–14 (ArchiveExplorer) | Vocabulary + hobbyist base case: the harness organs (enumerated qualitatively, NOT as a fixed "7" count — DO-NOT-USE forbids a fixed `.claude/` file count), 5 loop steps, 3 failure modes; 91.6% vs 71% (arXiv 2606.10209 — a Ch3/V4 figure ONLY, do not reuse as the opening hook); the 11 fake-done shortcuts (recut to the citable UPenn agent-cheating taxonomy, see LEDGER-ADDENDUM Ch2). The essay *starts* here and scales it 6 orders of magnitude. **Struck 2026-07-04: the "+90.2% multi-agent (arXiv 2606.10209)" line was a fabrication (that paper has no multi-agent architecture); the only live 90.2% is Anthropic's internal multi-agent eval, tagged Ch2/Ch5. It is on DO-NOT-USE and must never re-enter.** |
| PDF pp.15–27 (WORKBank deck) | Human Agency Scale H1–H5; desire-capability zones (46.1/12.9/24.3/16.7); 41% YC misalignment; 45.2% prefer H3; 47.5% agency gap; org-architecture shifts; 68% hybrid integration. Feeds Ch10–11. **Verify against the actual Shao et al. 2025 paper in P0 — the deck is a secondary artifact.** |
| `docs/Loop-Harness-Engineering/files/HANDOVER-data-asymmetry.md` + `data-iceberg.svg/html` | Chapter 7 centerpiece. Figures + copy FROZEN per handover (44 TB / 15T tokens vs 10–20 ZB; 1:1,000,000,000; >99.9999%; "distribution, not volume"). **Adaptation note:** handover assumes Astro/MDX; tarrysingh.com is Next.js App Router — build as a client component (`next/dynamic`, IntersectionObserver hydration) honouring every other spec line (frozen data module, scroll phases, reduced-motion final frame, <15KB, © Tarry Singh, banned strings). Keep it standalone-portable for realai.eu per the handover. |
| `realai-v2/docs/INSIGHTS-INSTRUMENT-CONTRACT-CORE.md` | The BINDING enforcement standard (§7 ship-gate). We write a thin **BINDING for tarrysingh.com/synaptic**: Tarry's first-person practitioner voice (not McKinsey), the `.syn-loop` palette, Hominis/Real AI product map for products-as-advice, repo paths + gates (`tsc`, `eslint`, deploy-READY, word-gate). |
| This week's dispatch outage (real logs, real 400, real fix `6c9cb1d`) | The prologue cold open — a loop that filed its goal every night and died silently every morning for want of one alert hook. TRUE story, our own logs. |

---

## 4. The 15 instruments (each argues an insight; forms all distinct)

| # | Name | Form (distinct) | The insight it argues | Chapter |
|---|---|---|---|---|
| V1 | **The Loop** | Live orbit simulation — Plan→Act→Verify→Persist ring; reader removes a stage and watches divergence | A loop without verification doesn't fail — it *succeeds at the wrong thing*, compounding | Prologue/Ch2 |
| V2 | **The Harness, Exploded** | Interactive exploded schematic at three scales (hobbyist `.claude/` → team CI → frontier lab), click-through to real config at each scale | Same seven organs at every scale; only the flesh changes | Ch1 |
| V3 | **The Verifier Gap** | Game-sim: set verifier strictness, watch the 11 fake-done shortcuts leak through; "confident garbage" counter | Verification asymmetry is the load-bearing wall; weak verifiers manufacture fake progress | Ch2 |
| V4 | **Context Rot** | Interactive decay curve + ghost band (91.6% prune-vs-71% full-history); slider stuffs the window | Context is a budget, not a backpack | Ch3 |
| V5 | **The Harness of Record** | Eval-saturation timeline matrix (pick a capability → which benchmarks are alive/saturated) | When public benchmarks saturate, the eval harness moves *inside* the company — private evals are the new moat | Ch4 |
| V6 | **Fan-out Economics** | Draggable orchestrator/worker tree → wall-clock vs tokens vs quality Pareto | Fan-out wins exactly when sub-tasks are independent; otherwise the orchestrator drowns | Ch5 |
| V7 | **The Reactor** | Closed-cycle flow (NOT an orrery — chokepoint owns that form): pretrain→SFT→RLHF/RLAIF→evals→deploy→data flywheel, hover for real infra envelopes | Frontier training is the original loop-and-harness; the lab IS a harness | Ch6 |
| V8 | **The Goodhart Dial** | Reward-proxy dial + true-objective divergence plot, annotated with documented reward-hacking cases | Optimize the proxy hard enough and the proxy detaches from the goal — in RL and in KPIs | Ch6 |
| V9 | **The Data Iceberg** | Scroll-driven descent + 1:10⁹ ratio counter (handover-specified, frozen) | The training set is the tip; the value is underwater | Ch7 |
| V10 | **The Vault Bore** | Drill-core strata explorer of ONE enterprise's data (ERP/CRM/mail/sensors/docs/logs) with entropy, value, model-readiness per stratum; toggle "what public models saw" (≈0) | The honest version: the gap is distribution, not volume — and which strata are worth training on | Ch7 |
| V11 | **The Private Frontier Run-Book** | 12-stage pipeline stepper, parameterized by company archetype (mid-cap / bank / manufacturer): curation→tokenizer→(continued-pretrain vs LoRA vs RAG decision tree)→SFT on process data→RLAIF w/ company constitution→private evals→deploy→drift loop; real cost/compute/team bands per stage | A company CAN own its end-to-end stack — here is the run-book, the price, and the team | Ch8 |
| V12 | **The Self-Driving Lab** | Closed DMTA-loop campaign sim: allocate budget across hypothesis-gen / synthesis / assay-verification; anchored to A-Lab, GNoME, Coscientist | In R&D too, verification is the bottleneck — the same lesson at laboratory scale | Ch9 |
| V13 | **The Agency Spectrum** | H1–H5 interactive: drag real WORKBank task categories onto the scale; desire-vs-capability quadrant w/ the 41% misalignment overlay | Workers aren't resisting AI — they're voting H3 equal partnership; capital is building H1 | Ch10 |
| V14 | **The Role Constellation** | Scarcity-vs-adoption-time scatter with career-path edges (graph, NOT a planisphere — software-3 owns that): the emerging roles, each expandable to a real day-one task list | The new jobs are loop-and-harness-shaped; here is who gets hired and what they do on Monday | Ch11 |
| V15 | **The AIOps Command Deck** | Fleet observatory: loops running, verifier pass-rates, context budgets, memory freshness, drift alarms — an enterprise agent fleet operated as a fleet | Operating intelligence is a discipline with a control room — this is what Real AI builds | Ch12 |

Contract rules binding every instrument: roomy meet-canvas · zone engine ·
`⤢ expand` · deterministic render · reduced-motion static state · ONE scarce
accent · danger colour for danger only · titled axes/ticks/method note ·
verdict readout · screenshot-QA at desktop/tablet/mobile, inline AND expanded.

---

## 5. Chapter map — budgets sum to exactly 30,000

| § | Chapter | Words | Instruments |
|---|---|---:|---|
| P | **Prologue — The Morning the Loop Died** (our own six-day silent failure; anatomy of the smallest broken loop) | 1,000 | V1 |
| 1 | **Two Layers, One Discipline** (loop vs harness; naming the discipline; layer-diagnosis; the `.claude/` folder as the smallest complete organism) | 2,000 | V2 |
| 2 | **The Anatomy of Convergence** (goal specs, plan-act-verify, state on disk, fresh context; when loops converge — and the three ways they die) | 2,200 | V3 |
| 3 | **Context Is a Budget** (context rot, memory vs vault, pruning discipline, context engineering as resource management) | 2,000 | V4 |
| 4 | **The Verification Economy** (verifier asymmetry; evals as harnesses; benchmark saturation; private evals as moat) | 2,200 | V5 |
| 5 | **Fan-out and the Orchestra** (multi-agent patterns, orchestration economics, when parallelism pays) | 1,900 | V6 |
| 6 | **The Original Loop** (frontier training as loop+harness; RLHF/RLAIF mechanics; reward hacking; the lab as harness) | 2,400 | V7 + V8 |
| 7 | **The Vault** (the corporate-data chapter — the richest big-data vault; the asymmetry; distribution-not-volume; the enterprise data engine) | **5,200** | V9 + V10 |
| 8 | **Use Case I — The Private Frontier** (the AI Loop & Harness Researcher trains a company's full model + agentic stack from scratch) | 2,500 | V11 |
| 9 | **Use Case II — The Discovery Loop** (the R&D Researcher: materials, multi-omics, drug discovery; self-driving labs; 100% shipped-systems-only) | 2,500 | V12 |
| 10 | **The Partnership Question** (WORKBank; the Human Agency Scale; what workers actually chose; H3 vs the H1 capital is funding) | 1,900 | V13 |
| 11 | **The New Roles** (predictions with dates and salary logic: Loop & Harness Engineer, Verifier Engineer, Context Curator, Data-Vault Steward, Agent-Fleet Operator, Harness Auditor, Evals Economist…) | 2,100 | V14 |
| 12 | **Operating Intelligence + Coda** (the AIOps strategy; the command deck; the honest Gartner sidebar; what to do Monday) | 2,100 | V15 |
| | **TOTAL** | **30,000** | 15 |

Structure discipline per chapter (adapted from the contract's flagship shape):
opening tension → the mechanism (with code) → verified evidence (source+year
inline) → the instrument → what-to-do (advice; Real AI products only where the
data leads) → bridge. One italic close line per chapter, Tarry's register.

---

## 6. The two flagship use cases — realism contract

**Ch8 — The Private Frontier.** The strong argument Tarry asked for: the
enterprise's proprietary corpus is structurally out-of-distribution for every
public model (Ch7 proves it) → whoever owns the loop+harness around that corpus
owns compounding capability nobody can rent. The run-book is staged honestly:
most companies should NOT pretrain from scratch — the instrument's decision
tree makes continued-pretrain vs LoRA-fleet vs RAG-first an *engineering
decision with thresholds* (corpus token count, domain drift, latency, secrecy),
and the "full frontier stack" tier is costed truthfully (what a 7B/70B-class
private run actually takes in GPUs, months, people — sourced from published
training reports: LLM Foundry/MosaicML, NeMo, Llama/DeepSeek papers). The
agentic stack on top (private evals, verifier fleet, constitution, drift loop)
is where the Researcher role lives. Zero magic; every number sourced or
labelled as an engineering estimate with its assumptions shown.

**Ch9 — The Discovery Loop.** Only shipped systems: A-Lab (Berkeley),
GNoME (DeepMind), Coscientist (Boiko et al., Nature 2023), ChemCrow,
AlphaFold-class structure prediction, Insilico/Recursion-style pipelines,
FutureHouse-style literature agents — each claim re-verified in P0 with
publication + independent coverage (including the published *critiques* — e.g.
the A-Lab controversy about phase identification — the essay gains authority by
carrying the criticism). The use case is a composite campaign narrated at
engineering altitude (what the loop does at 03:00 when an assay fails), with
the honest boundary: where autonomy ends today and the human PI's H4/H5
judgment begins. Market relevance = the named, real budget lines pharma/
materials companies already spend.

---

## 6b. Audience & CTA architecture

**The named expert reader (criterion A):** a staff engineer / senior developer /
engineering manager at a startup, scaleup or enterprise who has shipped — or is
six weeks from shipping — an agent system to production. They have opinions
about eval design. They have been burned by a demo that died in prod. The essay
speaks their language natively: real configs, real failure logs, mechanisms
named plainly. (Note: the Agent OS *marketing* voice bans "sandbox/kernel/WASM"
for client-facing copy — that rule does NOT apply here; our reader wants the
mechanism. When we point at the realai.eu page we borrow its one-liner, not its
vocabulary constraints.)

**Four CTA moments — each obeys data → advice → pointer, never pitch:**

| Where | The advice the data forces | The pointer | Provenance woven in |
|---|---|---|---|
| Ch7 · The Vault | Your proprietary corpus needs a sovereign stack — models you own, not rent | Hominis Foundation Stack → realai.eu | Real AI: "we were building loops and harnesses before either had a name" (founder-attested) |
| Ch8 · Private Frontier | The layer between your models and your data is a harness; buy-or-build it deliberately | **Hominis Agentic OS** ("give your AI a real computer to work on — one you fully control"; its Deployment Harness) → realai.eu | The Hominis stack (model → agentic OS → apps) IS the run-book's architecture made product |
| Ch9 · Discovery Loop | Closed-loop R&D is already normal in energy; the discipline transfers | Earthscan → earthscan.io | **Six years of automated MLOps in production O&G AI** — the loops ran before the vocabulary existed (founder-attested) |
| Ch12 · Operating Intelligence | Operating agent fleets is a discipline with a control room | Real AI AIOps strategy + the Agent OS layer → realai.eu | The command deck (V15) as the strategy made visible |

Rules: max four; each a short passage inside the chapter's advice beat, no
banners, no superlatives-as-fact. Provenance claims are **founder-attested** —
the red team labels them as such, and P3 asks Tarry for one concrete receipt
each (a 2019-era pipeline artefact, an Earthscan MLOps run log, a date) so the
engineering audience gets evidence, not assertion.

---

## 7. Research plan (P0) — the sweep angles

Workflow fan-out, one agent per angle, adversarial re-verification per the
contract, output = Source Ledger v1 + claim bank + do-not-use list:

1. Agent harnesses & loops in practice (Anthropic engineering corpus: agent SDK, multi-agent research, context engineering; Ralph pattern; production loop repos)
2. Frontier training loops (RLHF/RLAIF/DPO mechanics; Constitutional AI; published training-run reports & costs)
3. Reward hacking & Goodhart (Anthropic/METR/DeepMind documented cases)
4. Evals & benchmarks (lm-evaluation-harness lineage — the word "harness" already lives here; SWE-bench/GPQA/HLE/ARC-AGI saturation data; private-evals movement)
5. Context engineering research (context-rot studies incl. arXiv 2606.10209 — VERIFY this cite exists as claimed; Chroma/Anthropic long-context findings)
6. Enterprise private-stack economics (continued pretraining vs LoRA vs RAG literature; MosaicML/NeMo/HF enterprise; sovereign-AI deployments in EU banking/industry)
7. The data asymmetry (IDC DataSphere, FineWeb, Llama 3 — re-verify the handover's frozen figures independently)
8. Self-driving labs & AI-for-science (A-Lab + critiques, GNoME, Coscientist, polaris/omics benchmarks, drug-discovery pipelines with clinical-stage assets)
9. WORKBank / labor science (Shao et al. 2025 primary paper; Anthropic Economic Index; METR task-horizon)
10. Role/market signals (job postings data for agent/AI-ops roles, salary surveys, "forward-deployed engineer" precedent)

Rule: every number that survives into the claim bank carries source+year+URL;
everything dropped goes on the do-not-use list so it can never re-enter.

---

## 8. Build phases (micro-commits to main; route noindex until ship)

| Phase | Work | Exit gate |
|---|---|---|
| **P0** | Research fleet (10 angles) → Source Ledger + claim bank + do-not-use; write the tarrysingh BINDING doc | Every planned chapter has ≥8 verified anchors; use-case chapters have ≥15 each |
| **P1** | Scaffold: route + layout + `.syn-loop` palette + JumpNav + OG placeholder; build `loop-kit.tsx` (RIS) ; **calibration**: V1 + V4 exemplars → Tarry sign-off at desktop AND tablet, inline AND expanded (contract §6) | tsc/eslint clean; two exemplars signed off |
| **P2** | Instrument fleet V2–V15 in 4 reviewable batches (design-panel → build → 3-width screenshot QA per batch); Data Iceberg built to handover spec (Next.js adaptation) | All 15 pass §7 checklist visual items |
| **P3** | Prose, chapter by chapter against the claim bank; per-chapter Sources; code panes wired | Each chapter within ±5% of budget; voice-gated |
| **P4** | Red team: numeric re-verification (+web), do-not-use compliance, brand guardrails, domain fidelity; **dedicated buildability audit of Ch8/Ch9** (the no-hallucination gate) | Zero unresolved highs/mediums |
| **P5** | Word-gate to **exactly 30,000** · full visual QA sweep · museum-grade plate cover (Plate V folio) · `/synaptic` card + homepage Studio card + OG · ship-gate checklist 100% green | Deploy READY; Tarry flips noindex |
| **P6** | Derivative pipeline: realai.eu Insights versions (contract-native), earthscan energy-loop angle, LinkedIn syndication | First derivative live |

Estimated effort: ~10 focused sessions (P2 and P3 are 3–4 each), several
hundred micro-commits, in the chokepoint cadence.

---

## 9. Decision points for Tarry

1. **Title**: "THE ENGINE ROOM" (recommended) vs "CLOSED LOOP" vs "THE LOOP & THE HARNESS".
2. **AIOps naming**: discipline = Loop & Harness Engineering, strategy brand = AIOps with the honest Gartner sidebar (recommended) — or coin a fresh term.
3. **Accent**: phosphor green (recommended, terminal-true) vs electric cyan (closer to chokepoint kinship).
4. **Role list in Ch11**: I'll propose ~8 roles with day-one task lists; Tarry prunes/adds from Real AI hiring reality.
5. **The prologue uses our real outage** (recommended — it is the thesis in miniature) — comfort check that the story is fair game to publish.
6. **Em-dash policy collision (needs a ruling).** The living anti-slop contract
   bans the em-dash outright (the #1 tell) and realai-v2 enforces that on prose
   AND instrument labels. But tarrysingh.com's existing house voice — the
   dispatch writer prompt, the chokepoint essay, the synaptic plates — uses em
   dashes deliberately as a signature. Recommendation: **the Engine Room
   follows the anti-slop contract in full (zero em-dashes; middot `·` as the
   instrument-label separator, which the synaptic kit already favours)** since
   this plate doubles as the realai.eu derivative source. Decide separately
   whether the wider tarrysingh.com house style migrates; this plan does not
   force that.
7. **Provenance attribution for the six-years claim.** "Our O&G AI startup —
   six years of automated MLOps" spans the deepkapha-era energy work through
   Earthscan. Confirm during P3 how to attribute it (Earthscan as the named
   vehicle, or "our energy-AI practice, now Earthscan"), and supply one
   concrete receipt per provenance claim (a dated pipeline artefact or run
   log) so the claims carry evidence for an engineering reader.
