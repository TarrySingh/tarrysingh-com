# 08 · Content strategy

What goes on each page, in what order, in what voice. This file complements `04-design-system.md` (which governs *how* it looks) by governing *what it says*.

---

## Voice in one sentence

*The voice of a senior scientist writing for two equally serious peers: a programme reviewer and a partner-level VC, both of whom respect their own time.*

If a sentence wouldn't earn a nod in a Wellcome Trust grant panel meeting, cut it. If a sentence wouldn't earn a nod in a London deep-tech partner's Friday-reading folder, cut it.

---

## Cover — copy specification

**Above the fold:**

- Series mark (mono small-caps, top-left): `PLATE  ·  MMXXVI`
- Right-aligned mark: `SERIES  I`
- Title (display serif, very large): `SYNAPTIC CARTOGRAPHY`
- Italic subtitle (one line, IBM Plex Serif Italic):
  > *Two plates from a studio that takes its time.*

**Below the plate-cards (each card has its own italic caption):**

- Under MEMPHIS card: *Memory and computation, co-localised.*
- Under SYMPHONY card: *Same substrate. Different harmonies.*

**Page bottom hairline + footer:**

- Mono small-caps: `T.  SINGH  ·  ANNO  2026`
- Right-aligned: link to `/consortium`

That is the entire copy of the cover. **No tagline-paragraph. No mission statement. No CTA button.**

---

## MEMPHIS — copy outline

Section 1 — **Header strip.**
```
PLATE  I  ·  MMXXVI                              FIG. 1.2.2
ANNO 2026 · FOLIO 1.2.2                     CORE SCIENCE → TECHNOLOGY
                                            BREAKTHROUGH
```

Section 2 — **Hero block.**
- Title: `MEMPHIS`
- Italic subtitle: *a hippocampal · memristive · neuromorphic architecture*
- Ornament: `· STUDY OF A SYNAPTIC SUBSTRATE ·`

Section 3 — **The breakthrough (prose).** Four paragraphs, lifted and tightened from §1.2.2 of the proposal:

> The core breakthrough of MEMPHIS lies in the integration of hippocampal-inspired computational principles with a self-organising memristive hardware substrate, enabling a new class of ultra-low-power, adaptive computing systems in which memory and computation are co-localised.

> This represents a fundamental departure from conventional architectures, where processing and memory are physically and functionally separated. MEMPHIS implements a two-phase computational paradigm: online, event-driven processing for real-time interaction, and offline replay-driven consolidation for memory optimisation and generalisation — within the same physical system.

> A decisive validation will be the demonstration that a small-scale memristive spiking network (CA3-CA1 module) can perform associative recall and memory consolidation through replay-driven dynamics, achieving improved task performance after offline processing without additional external input.

> This experiment establishes that adaptive learning and memory optimisation can emerge directly from intrinsic system dynamics, without reliance on conventional training pipelines.

Section 4 — **Five advances.** Each as a numbered card, in this order, with this exact copy:

| # | Title | Body |
| --- | --- | --- |
| I | Computational paradigm | Distributed, event-driven computation inspired by biological circuits — not sequential, energy-intensive processing. |
| II | Learning capability | Continuous and adaptive learning through replay-driven consolidation, addressing catastrophic forgetting without separating training and deployment. |
| III | Memory optimisation | Hardware-embedded sleep-like processes — replay and synaptic scaling — for long-term memory formation and restructuring. |
| IV | Hardware substrate | Self-organising memristive systems as physically-grounded synaptic plasticity, targeting competitive energy efficiency and high integration density, subject to experimental validation. |
| V | System-level functionality | Biologically-inspired modulatory pathways for prioritisation and adaptive memory processing — extending beyond current neuromorphic implementations. |

Section 5 — **Decision milestones.** A small inline timeline. Show M12, M18, M24, M30, M33 with one-line success thresholds on hover.

Section 6 — **Critical uncertainty card.**
- Title (small caps): `CRITICAL UNCERTAINTY`
- Body (italic serif): *Whether memristive devices can be matched and stabilised at the precision required by the replay-driven dynamics.*
- Sub-body (regular serif, smaller): One paragraph naming the specific failure mode and the fallback (e.g. lower-density device with stricter calibration).

Section 7 — **Consortium strip.** Four cards, name + lead PI + one-line credentials.

Section 8 — **Closing italic.** Centred, large.
> *Memory and computation, co-localised.*

---

## SYMPHONY — copy outline

Same template, with Symphony's content:

- Title: `SYMPHONY`
- Italic subtitle: *a neuromimetic knowledge substrate for software systems* (or: *a planisphere of the neuromimetic code substrate*)
- Ornament: `· NERVOUS SYSTEM FOR SOFTWARE ·`

**The breakthrough (prose).** Three short paragraphs lifted from §1.2:

> SYMPHONY will establish the first neuromimetic knowledge substrate for software systems — a representation in which modules, functions, data flows, contracts, tests, commit history, and design decisions are encoded as nodes in a multi-scale network whose activation patterns are reconfigured, on demand, by task-specific neuromodulatory signals.

> In plain terms: a code representation that behaves less like a document to be re-read and more like a nervous system that foregrounds the structures relevant to the engineer's current task.

> Two families of current approaches dominate, each with a structural ceiling. Statistical: LLM agents, whose headline SWE-bench numbers fall sharply under independent re-evaluation. Structural: static analysis and architecture knowledge graphs, which capture explicit structure but not design rationale. SYMPHONY's advance is not to improve either — it is to combine their information content under a different organising principle drawn from biology.

**Three advances (i, ii, iii).** As three cards.

| # | Title | Body |
| --- | --- | --- |
| i | Multi-layer extraction into a single substrate | Structural, behavioural, historical, and rationale layers unified in a single graph-resident representation built for activation-based retrieval rather than query-based retrieval. |
| ii | Context-dependent activation | A single substrate state that surfaces different subnetworks depending on an externally-specified task token, using the neuromodulatory primitives of Mei, Muller & Ramaswamy (2022). |
| iii | Low-bandwidth task control | An intentionally narrow task interface — a small set of scalar modulatory signals, not a prompt window — borrowed from Siciliano-school haptic shared control. Composable, auditable, bounded. |

**Five objectives O1–O5.** Each as a card. Lift the exact text from §1.3 of the proposal. Each card has: title, partner, decision milestone, success threshold, alternative direction.

**Critical uncertainty.**
> *Whether multi-scale neuromodulation, demonstrated in continuous perceptual and motor domains, transfers to the symbolic and structural domain of source code.*

**Preliminary evidence triad.** Three cards: Mei/Muller/Ramaswamy 2022 · Siciliano-school shared control 2018–2022 · SWE-bench re-evaluation 2024–2025. Each card has a one-line summary plus DOI / arXiv link.

**Closing italic.**
> *Same substrate. Different harmonies.*

---

## Consortium — copy

Four cards, one-line each. (Edit names/titles to match the final consortium agreement before launch.)

- **Real AI.** Lead: Tarry Singh. Programme integration, engineering, evaluation.
- **Newcastle University.** Lead: Dr. S. Ramaswamy. Neuromodulation theory; human-subjects user study.
- **CREATEPRISMA Lab, Università di Napoli Federico II.** Lead: Prof. B. Siciliano. Low-bandwidth shared-control derivation.
- **UP Robotics.** Lead: [to be filled]. Industrial codebase ingestion and validation.

Plus, for MEMPHIS specifically, list the memristive-hardware partner separately if distinct.

---

## Contact — copy

- `tarry@…` (Gloock, ~3rem display).
- One italic line: *For correspondence, programme review, or investment enquiry.*
- Calendly embed: *30 minutes. Direct conversation, not a sales call.*
- IP block: *Proposal materials are © T. Singh and named consortium partners. Available under controlled disclosure to qualified reviewers on request.*

---

## Footnotes & citations

Every numerical claim has a footnote. Use a `<Footnote n>` component that renders as a tiny mono superscript in the body and an expanded reference at the page bottom. Examples:

- The SWE-bench Verified claim → footnote with Anthropic's December 2025 blog post URL.
- The ICSE 2025 Companion re-evaluation → footnote with DOI.
- The Mei/Muller/Ramaswamy 2022 paper → footnote with DOI to *Trends in Neurosciences*.

Citations on this site are not optional. They are the difference between an editorial and a press release.

---

## Forbidden words (final list)

`leverage` (as verb), `unlock`, `revolutionary`, `game-changing`, `powerful`, `next-generation`, `cutting-edge`, `state-of-the-art` (use "the current state of the art" descriptively, never as a positive label), `AI-powered`, `seamlessly`, `effortlessly`, `delightful`, `journey`, `solution` (as in "our solution"), `solutions`, `synergy`, `mission-critical`, `disruptive`, `paradigm shift` (we discuss paradigms, not shifts).

If you catch yourself reaching for one, the sentence is doing weak work. Rewrite it.
