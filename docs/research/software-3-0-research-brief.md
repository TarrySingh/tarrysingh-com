# Research brief — "Software 3.0 — Age of Hyper Automation"

Internal working brief for the flagship essay. Verified across 5 deep sweeps (mid-2026 cutoff). **HISTORICAL vs PROJECTION marked. ARK figures are bull-case envelopes — label as such and pair with consensus where space allows.** Write date context: **June 2026** (Artemis II has flown; Starcloud-1 ran an H100 in orbit Nov 2025).

---

## A. AI lineage (§2 + AILongArc plate)

| Year | Event | Who / where | Significance |
|---|---|---|---|
| 1958 | Perceptron paper | Frank Rosenblatt, Cornell Aero Lab | First trainable learning machine (concept 1957; **Mark I hardware demo 23 Jun 1960**) |
| 1969 | *Perceptrons* | Minsky & Papert, MIT | XOR limit → **first AI winter** (causation contested) |
| 1974 | Backprop derived | Paul Werbos (Harvard thesis) | Reverse-mode diff; overlooked a decade |
| 1986 | Backprop popularised | Rumelhart, **Hinton** & Williams, *Nature* 323:533 | Made multilayer training practical |
| ~1987–93 | **Second AI winter** | field-wide | Expert-system/LISP collapse |
| 2012 | **AlexNet** wins ImageNet | Krizhevsky, Sutskever, **Hinton**, U. Toronto | 15.3% top-5; 2 GPUs → deep-learning era |
| 2017 | **Transformer** "Attention Is All You Need" | Vaswani et al., Google (arXiv 12 Jun 2017) | Basis of every LLM |
| 2018 | GPT-1 | Radford et al., OpenAI (11 Jun 2018) | Generative pre-training recipe |
| 2019 | **2018 Turing Award** | Hinton, LeCun, Bengio (ACM, 27 Mar 2019) | "Fathers of the deep-learning revolution" |
| 2020 | GPT-3 + scaling laws | OpenAI (Brown; Kaplan 23 Jan 2020) | 175B; capability becomes predictable |
| 2022 | Chinchilla | Hoffmann et al., DeepMind | Scale data & params equally (corrects Kaplan) |
| 2022 | **ChatGPT** | OpenAI, **30 Nov 2022** | LLMs go mainstream |
| 2023 | GPT-4 | OpenAI, 14 Mar 2023 | Multimodal frontier |
| 2024 | **Hinton Nobel — Physics** | Hinton & Hopfield (8 Oct 2024) | NOT chemistry (that was AlphaFold/Hassabis-Jumper) |
| 2023–26 | **The agentic turn** | OpenAI/Anthropic/Google | Reasoning + tools + MCP (Nov 2024) → autonomous agents |

**Date traps:** perceptron 1957/58 (idea) vs 1960 (Mark I machine); backprop "derived 1974, popularised 1986"; AlexNet **2012** (not the 2017 CACM reprint); ChatGPT Nov **2022**; Hinton's Nobel is **Physics 2024** with **Hopfield**.

---

## B. The two curves (§3) + compute/energy

**Cost of intelligence — the defensible "wow":** GPT-3-level quality fell **$60 → $0.06 per million tokens, 2021→2024 (~1,000×, ≈10×/yr)** — a16z "LLMflation" (Appenzeller, Nov 2024). Epoch AI (Mar 2025): median **~50×/yr** across benchmarks, ~200×/yr post-2024.
- **HONESTY ANCHOR:** frontier *list* price only fell ~4× (GPT-4 $60→~$15); naïve 10×/yr → 2040 gives physically absurd sub-attodollar numbers — **the curve must bend to an energy/silicon floor.** And **Jevons/token-cost illusion**: unit price ↓99.7% but total spend ↑ (per-task tokens 2k→50k–500k with agents; Goldman: **24× token demand by 2030**). Abundance comes through *volume*, not just price.

| Year | $/M tokens, GPT-3-class | Status |
|---|---|---|
| 2021 | $60 | HIST |
| 2023 | ~$0.60 | HIST |
| 2024 | $0.06 | HIST |
| 2025 | ~$0.006 | HIST/early |
| 2030 | floor-bound (illustrative ~10⁻⁷, *bends*) | PROJ |

**Compute price-performance:** GPU FLOP/$ doubles **~2.5 yr** (Epoch; *not* annual "Huang's law" — recent gains are low-precision FP16/FP8 + utilisation). **Training compute grows 4–5×/yr** (Epoch; frontier 5.3×/yr). Kurzweil LOAR: calc/sec per $1,000 → "one human brain (10¹⁶ cps) for $1,000 ~2023"; **2029 human-level AI, 2045 singularity** (*The Singularity Is Nearer*, 2024) — **trajectory right, dates optimistic** (skeptics: S-curve saturation; Armstrong's strict audit ~42% hit-rate).

**AI energy (IEA *Energy and AI*, Apr 2025):** data-centre electricity **415 TWh (2024) → ~945 TWh (2030)** (≈ Japan today), **~1.5% → ~3%** of global. Training runs **100–150 MW (2024) → 4–16 GW (2030)**; >100 GW AI capacity worldwide by 2030 (Epoch/EPRI). Energy is the binding real-world constraint on the abundance thesis.

---

## C. ARK / Cathie Wood (§4–6) — **bull case, labelled**

- **Humanoids:** **$26T+ annual revenue opportunity** (Big Ideas 2025) = household ~$13T (unpaid-labour valuation) + manufacturing ~$13T (% of ~$32T 2030 mfg GDP). Robot NPV vs US worker ($46/hr → ~$550k NPV) drives adoption as price falls (Optimus at-scale << breakeven). **Consensus far lower** (Goldman ~$38bn humanoid market by 2035) — ARK counts unpaid labour. No ARK unit-curve; any 2040 line is interpolated.
- **Robotaxi:** enterprise value **$28T (2024) → ~$34T by 2030**; ride-hail TAM ~$10T at $0.25/mi; **50M fleet 2030**. Cost/mile: human ride-hail ~$2.00 → owned car ~$0.70 (flat 1934–2016) → **robotaxi ~$0.25 (2030)** / Cybercab ~$0.20; $15k Cybercab (Wright's Law). The "100 years flat then collapse" cost/mile is the cleanest plate.
- **Genome (least controversial — industry agrees on shape):** whole-genome cost **~$2.7B (2003) → ~$1,000 (2015) → ~$200 (2023) → sub-$100 (2024) → ~$1–10 (2030 proj)**; **10¹⁰ decline, faster than Moore.** Multi-omics: read 100× cheaper, write 1,000× cheaper by 2030; AI drugs **4× cheaper ($2.4B→$0.6B), ~40% faster, 5× R&D return.**
- **AI productivity:** working-time automated by 2030 = 31%/61%/81% → productivity surplus **$22T/$57T/$117T**; 2030 software market **$3.5T/$7T/$13T** (note: "$14T by 2030"). **GDP inflection: ARK 7.3% global real growth by 2030 vs IMF 3.1%.**
- **Great Wealth Reshuffle:** disruptive innovation **$16T (2024) → $140T (2030) @ 38% CAGR**, inside ~$220T total equity → **>2/3 of global equity** (most aggressive claim — label "ARK bull case").

---

## D. The firm + abundance economics (§4, §8, §9)

- **Goldman (Mar 2023):** +7% global GDP (~$7T), **+1.5pp productivity/10yr**, 300M jobs exposed, ~2/3 US occupations, up to 1/4 work substitutable.
- **McKinsey (Jun 2023):** **$2.6–4.4T/yr** (63 use cases), 60–70% of work-time automatable, +0.1–0.6pp productivity through 2040.
- **WEF Future of Jobs:** 2023 = **net −14M** (69M created / 83M lost); 2025 = **net +78M** (170M / 92M), 22% churn. *The reversal is rhetorically powerful — even the same body's outlook brightened.*
- **Acemoglu (NBER 2024, MIT, Nobel '24) — THE doom steelman:** only **~5% of tasks** cheaply automatable/10yr → **~0.7% TFP, ~1.1% GDP**; "GDP can rise while welfare falls"; hits low-education workers + women hardest.
- **Altman "Moore's Law for Everything" (2021):** prices halve every ~2 yr; "power shifts from labor to capital… most people worse off" unless policy adapts → **American Equity Fund** (2.5% of company value in *shares* + 2.5% land value) → **~$13,500/adult/yr**. One-person-$1B-company bet (**median ~2028**). **Equity, not just cash** = the answer to UBI-dependency.
- **Rifkin *Zero Marginal Cost Society* (2014)** + **Diamandis *Abundance* (2012, "6 D's": digitised→deceptive→disruptive→demonetised→dematerialised→democratised).** Both predate LLMs — **the intelligence-deflation thesis is our extension of their logic, not their claim (frame honestly).**
- **Firm-reinvented illustration:** Midjourney — sub-200-person, zero-VC, hundreds of $M revenue (per *estimates* — use "reportedly"; exact $/employee is soft).

**Two counter-narratives to steelman then transcend:** (A) **Doom/Acemoglu** — extrapolation dressed as analysis; gains regressive, funnel to capital. *Answer:* new task creation (WEF reversal), agentic compounding; his distributional warning is an argument about **ownership/policy**, the very lever we reach for. (B) **UBI-dependency** — decouple income from labour. *Answer:* UBI treats the symptom (no income), not the disease (**no ownership**); broadened ownership (equity funds, data dividends, Rifkin's Collaborative Commons) severs income-from-labour *without* severing agency. "The pie becomes nearly free to copy; the only question is **who holds the deed** — a choice, not a fate."

---

## E. Off-world (§7) — **sober; this section guards the essay's credibility**

| ~Year | Milestone | Who | Confidence |
|---|---|---|---|
| Nov 2025 | First DC-class GPU (H100) in orbit | Starcloud + NVIDIA | done [N] |
| Dec 2025 | First LLM run + first in-orbit training in space | Starcloud (Gemma/nanoGPT) | done [N] |
| Apr 2026 | Artemis II crewed lunar flyby | NASA | done [N] |
| early 2027 | 2 prototype TPU sats (Project Suncatcher) | Google + Planet Labs | announced [A] |
| 2027 | Starcloud-2 commercial GPU smallsat | Starcloud | announced [A] |
| ~2028 | Artemis IV — first crewed lunar landing since 1972 (III became a LEO docking test, Feb 2026) | NASA | scheduled, will slip [A] |
| 2029–30 | China crewed lunar landing | CNSA | target [A] |
| 2031–35 | ILRS lunar "basic station" + ISRU demos | CNSA/Roscosmos | target [A] |
| early-mid 2030s | First *uncrewed* Starship to Mars (Musk slipped Mars 5–7 yr, Feb 2026, Moon-first) | SpaceX | uncertain [A] |
| ~2040 | First crewed Mars landing — NASA's "audacious," unfunded goal | NASA/SpaceX | aspirational [S] |
| centuries | Terraforming Mars | — | **not possible w/ present tech** — Jakosky & Edwards, *Nature Astronomy* 2018 [S] |

**Physics:** orbital DC pros = continuous solar, no water, launch <$200/kg by mid-2030s (Google). **Hard limits** = radiative cooling only (∝T⁴; 1 MW ≈ 3,000–10,000 m² radiator — the wall), +20–40 ms latency (training not inference), radiation bit-flips, no servicing. Google itself names 4 hurdles — *the companies are sober even where coverage isn't.* **Honesty anchor:** by 2040 the realistic off-world stack = orbital AI compute at pilot scale + first lunar footholds/ISRU demos + at best first Mars bootprints; lunar mining / Mars settlement / terraforming are a centuries-arc named as **aspiration, not forecast**.

---

## F. The 2040 Planisphere — prediction nodes (year × ring)

Rings inner→outer: **Code(1.0) · Models(2.0) · Agents(3.0) · Embodiment · Biology · Off-world.** Bearing = year 2025→2040. Each node = an attributed forecast; filaments couple rings as cheap intelligence cascades outward.

- Agents/Code — 2026 AI writes a majority of new code · 2028 first one-person $1B company (Altman bet) · 2029 Kurzweil human-level AI.
- Models — 2025 GPT-3-quality ~$0.006/M (a16z) · 2030 AI software $7–14T + 4–16 GW training runs (Epoch/ARK).
- Embodiment — 2030 robotaxi ~$34T EV / 50M fleet / $0.25 mi (ARK) · 2030–35 humanoids $26T TAM (ARK).
- Biology — 2030 ~$1–10 whole genome (ARK) · 2030 AI drugs $2.4B→$0.6B.
- Off-world — 2027 Suncatcher TPU sats · 2028 Artemis IV lunar landing · 2030 China crewed Moon · 2035 ILRS + launch <$200/kg · 2040 first Mars bootprints (aspirational).
- Rim/beyond-2040 — 2045 Kurzweil singularity; terraforming = centuries (honesty marker at the dial's edge).

---

## Citations (inline, house style — person/institution · source · year)
Rosenblatt 1958 · Minsky & Papert 1969 · Werbos 1974 · Rumelhart-Hinton-Williams *Nature* 1986 · Krizhevsky-Sutskever-Hinton 2012 · Vaswani et al. (Google) 2017 · Kaplan (OpenAI) 2020 · Hoffmann (DeepMind) 2022 · ACM Turing 2018/19 · Nobel Physics 2024 · Kurzweil *The Singularity Is Nearer* 2024 · Epoch AI 2024–25 · a16z (Appenzeller) 2024 · IEA *Energy and AI* 2025 · ARK *Big Ideas* 2024 & 2025 · Goldman Sachs (Briggs & Kodnani) 2023 · McKinsey MGI 2023 · WEF *Future of Jobs* 2023 & 2025 · Acemoglu NBER 2024 · Altman *Moore's Law for Everything* 2021 · Rifkin 2014 · Diamandis & Kotler 2012 · Google Research *Project Suncatcher* 2025 · Starcloud 2025–26 · NASA Artemis 2026 · Jakosky & Edwards *Nature Astronomy* 2018.
