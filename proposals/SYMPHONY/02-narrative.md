# SYMPHONY — full narrative

> Source of truth for `/symphony` long-form prose. Lift verbatim, lightly edit, do not reword aggressively.

## §1.2 Science-towards-technology breakthrough

### The scientific leap

SYMPHONY will establish the first neuromimetic knowledge substrate for software systems: a computational representation of code in which the elements of a software system — modules, functions, data flows, contracts, tests, commit history, design decisions — are encoded as nodes in a multi-scale network whose activation patterns are reconfigured, on demand, by task-specific neuromodulatory signals.

In plain terms: a code representation that behaves less like a document to be re-read and more like a nervous system that foregrounds the structures relevant to the engineer's current task.

### State of the art and its ceiling

Current approaches to machine code understanding divide into two families, each with a structural ceiling we expect to hit within this decade.

The first is **statistical**: large language model (LLM) agents. These set the current public headline performance — Claude Opus 4.5 reached 80.9% on SWE-bench Verified in December 2025, the first model to cross the 80% threshold on that benchmark. The headline is misleading. Independent re-evaluation published at ICSE 2025 Companion showed that once instances resolved through solution leakage or weak test cases are removed, the measured resolution rate of a leading SWE-agent configuration drops from 12.47% to 3.97%. A parallel ICLR 2026 submission (SWE-Bench+) replicated the effect, reporting that SWE-agent 1.0 with Claude 3.5 fell from 57.6% to 31.8% on SWE-bench Verified after filtering. The frontier is further constrained by context: industrial codebases routinely span millions of tokens while production LLM context windows remain in the low hundreds of thousands, and retrieval augmentation provides local relevance without system-level coherence. LLM agents are, at present, pattern-matchers with short memories; they do not build a durable, navigable representation of the system they are acting on.

The second is **structural**: static analysis tools (SonarQube, PMD, IntelliJ inspections), architecture recovery tools, and architecture knowledge graphs (ArchiMate-derived Enterprise Architecture Knowledge Graphs). These capture what is explicitly encoded in the source — call graphs, dependency edges, type hierarchies, declared interfaces. They do not capture the design rationale, the contextual activation of architectural knowledge, or the reasons a decision was made; that tier of knowledge has been recognised since Avgeriou et al. (2007) as the hardest part of software engineering to externalise and remains so.

### Symphony's organising principle

Symphony's advance is not to improve either family but to combine their information content under a different organising principle drawn from biology. Both neuromodulation in the mammalian cortex and descending corticospinal modulation in the vertebrate motor system are mechanisms by which a fixed underlying network produces qualitatively different, task-appropriate activation patterns in response to low-bandwidth descending signals.

Mei, Muller and Ramaswamy (*Trends in Neurosciences*, 2022) formalised a four-scale framework for integrating such neuromodulation into deep networks — adjusting hyperparameters, scaling connectivity through plasticity, modulating specific neurons, and reconfiguring dendritic computation — and showed in simulation that artificial neuromodulation yields higher task rewards, faster learning, and reduced catastrophic forgetting.

Siciliano and colleagues' haptic shared control programme demonstrated a cognate principle in a physical setting: a high-DOF autonomous robot controller is shaped in real time by a low-bandwidth human input through haptic active constraints, so that qualitatively different task behaviours — surgical needle grasping, dual-arm manipulation, teleoperated cutting — are obtained by reshaping the controller's operating regime rather than by rewriting the controller itself.

The three failure modes these biological mechanisms address — interference between tasks, the cost of exhaustive re-evaluation, and the need for persistent memory that is nevertheless responsive to context — are precisely the failure modes that limit current code-understanding systems.

### The ambition

To transpose that principle from its native perceptual and motor domains into a symbolic and structural domain (source code) and to show, at proof-of-principle scale, that a neuromimetic knowledge substrate can hold a consistent representation of a non-trivial real-world codebase while responding to engineering tasks — debugging, refactoring, dependency impact analysis, onboarding a new developer — with task-appropriate reconfiguration rather than brute re-reading.

### Novelty

Three specific advances distinguish Symphony from all adjacent work:

1. **Multi-layer extraction into a single substrate.** Existing architecture-recovery pipelines produce either a single view (static analysis output, dependency diagram, architecture knowledge graph) or a document corpus (READMEs, commit messages, issue trackers) treated separately. Symphony will unify structural, behavioural, historical and rationale layers in a single graph-resident representation built for activation-based retrieval rather than query-based retrieval.

2. **Context-dependent activation.** No existing representation of a codebase alters its own salience profile in response to the engineer's declared task. Symphony's substrate will maintain a single state of the system but surface different subnetworks depending on an externally specified task token, using the neuromodulatory primitives of Mei, Muller and Ramaswamy (2022) as the mathematical template.

3. **Low-bandwidth task control.** Borrowing from Siciliano's haptic shared-control architecture, Symphony's task interface will be intentionally narrow — a small set of scalar modulatory signals, not a prompt window — so that a system's behaviour under different engineering tasks is composable, auditable, and bounded. This is the property that makes the substrate amenable to future industrial governance, in contrast to the unbounded prompt-response surface of current LLM agents.

### Chain to the long-term vision

The vision requires, minimally: (a) a representation capable of holding an industrial-scale codebase coherently; (b) a mechanism for reconfiguring that representation on demand without rebuilding it; (c) a narrow control surface that can be audited. The three advances above supply, in sequence, exactly these three requirements. Success in SYMPHONY is therefore not a sufficient condition for the vision, but it is the decisive enabling condition.

### Preliminary evidence

At TRL 1–4 the question is whether the mechanism is sound, not whether an industrial artefact exists. Three converging lines of published evidence support the mechanism:

- Mei, Muller and Ramaswamy (*Trends in Neurosciences*, 2022) demonstrated, in simulation, that introducing neuromodulatory units into deep networks at the four scales above produces the three behavioural properties Symphony requires from its substrate — faster adaptation to new tasks, higher cumulative reward across task sequences, and resistance to catastrophic forgetting between tasks.
- Selvaggio, Pacchierotti, Giordano, Siciliano and colleagues (RA-L 2018; ICRA 2019; IROS 2019; RA-L 2020; T-RO 2022; ICUAS 2025; RAS 2025; JIRS 2023) together with Caccavale and Finzi (TopiCS 2021; Autonomous Robots 2019) demonstrated in hardware that low-bandwidth supervisory and shared-control signals produce qualitatively distinct, context-appropriate behaviours from a single underlying autonomous control system — the architectural property Symphony will transpose.
- The failure evidence on the statistical side — the SWE-bench re-evaluations cited above, and the context-window ceiling documented across LLM architecture-recovery work in 2024–2025 — establishes that the current dominant approach is not on a trajectory to close the gap by incremental scaling alone.

### The critical uncertainty

Whether multi-scale neuromodulation, which is demonstrated in perceptual and motor domains characterised by continuous signals and embodied feedback, transfers to a symbolic and structural domain (source code) where the "signals" are discrete, hierarchical, and linguistic. This is not a question of engineering polish; it is a question of whether the biological principle generalises. §1.3 sets concrete, decision-quality objectives whose success criteria will resolve this uncertainty within the project duration.

## §1.3 Objectives

SYMPHONY pursues the proof of principle that a neuromimetic knowledge substrate can hold a coherent, task-adaptive representation of a real software system and outperform current code-understanding approaches on engineering tasks that stress context-dependence and long-range structural memory. The programme is organised around five objectives O1–O5 delivered across a 36-month action structured in two reporting periods (RP1: M1–M12; RP2: M13–M36).

**O1 — Multi-layer extraction pipeline.** Build an automated pipeline that ingests a software system and emits a four-layer representation (structural, behavioural, historical, rationale) over a single graph. *Threshold:* coverage ≥ 90% of functions and ≥ 80% of inter-module dependencies on the two demonstrator codebases (a large open-source system selected at M3 and a production industrial-automation codebase supplied by UP Robotics). *Verification:* automated differential testing against ground-truth call/dependency graphs from established static analysers. *Decision milestone:* **M12**. *Alternative if missed:* drop the rationale layer to a lightweight commit-message classifier and proceed with three layers. *Lead:* Real AI with UP Robotics.

**O2 — Neuromodulatory reconfiguration mechanism.** Implement, on the graph from O1, a computational instantiation of the four-scale framework of Mei, Muller & Ramaswamy (2022), adapted from continuous perceptual signals to discrete symbolic activations. *Threshold:* a single trained substrate demonstrates statistically significant (p < 0.01, paired test, ≥ 30 task instances) task-appropriate subnetwork activation across at least three distinct engineering task classes (localisation, impact analysis, refactoring candidate discovery), with F1 ≥ 0.6 versus expert-annotated relevance. *Decision milestone:* **M18**. *Alternative:* retreat to single-scale neuron-level modulation (scale 3), the mathematically best-understood regime. *Lead:* Newcastle (Ramaswamy) with Real AI.

**O3 — Low-bandwidth task control interface.** Derive a narrow scalar control interface by which engineering-task tokens reshape the substrate's activation regime without modifying its stored structure. *Threshold:* task-switching latency < 500 ms and state-preservation score ≥ 0.95 (cosine similarity between post-switch resting state and pre-task baseline), over ≥ 100 task-switching trials on both demonstrator codebases. *Decision milestone:* **M24**. *Alternative:* substitute a fixed-vocabulary gating module retaining auditability but sacrificing compositionality. *Lead:* CREATEPRISMA / UNINA (Siciliano) with Newcastle.

**O4 — Benchmarked advantage over state-of-the-art baselines.** Demonstrate, on a pre-registered evaluation protocol, that the SYMPHONY substrate outperforms three named baselines: (a) a frontier LLM agent, (b) a best-in-class static-analysis + knowledge-graph pipeline (ArchiMate/EAKG), and (c) an LLM + RAG baseline — on a held-out benchmark of 200 engineering-task instances sourced half from OSS issue trackers and half from UP Robotics maintenance logs. *Threshold:* ≥ 20% relative F1 improvement on task-relevant-subgraph recovery and ≥ 15% in expert-rated actionability, averaged across task classes. *Decision milestone:* **M30**. *Alternative:* if improvement holds on OSS but fails on industrial code, narrow claimed scope and document the domain-transfer gap as a scientific finding. *Lead:* Real AI with three-person external advisory panel.

**O5 — Equitable-access user study of task-adaptive code comprehension.** Run a pre-registered user study with ≥ 60 engineers stratified across gender, career stage, and native-language proficiency, comparing onboarding performance on a previously unseen codebase with versus without the SYMPHONY substrate. *Primary endpoint:* statistically significant (p < 0.05) reduction in time-to-first-correct-change for under-represented strata, with no disadvantage for any stratum. *Secondary endpoint:* 30-day retention of code understanding via a follow-up structured task, with a non-inferiority margin pre-registered such that a positive speed effect cannot come at the cost of a substantive deskilling effect on retention. *Decision milestone:* **M33**. *Alternative:* reframe as a formative study with publishable pilot data; if secondary endpoint flags deskilling, document scaffolded-disclosure deployment patterns. *Lead:* Newcastle ethics with Real AI.
