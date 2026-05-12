# Ethics self-assessment  (≤ 5,000 chars)  ·  4,882

## 1. Gender dimension in research

SYMPHONY addresses gender at two levels. At the level of the core science, gender is not a primary variable in the neuromodulatory or symbolic-processing mechanisms targeted at proof-of-principle: graph-resident representation, multi-scale neuromodulation, and low-bandwidth control do not encode biological or social variables where gender is a primary factor.

At the level of human evaluation, gender is an explicit pre-registered stratification dimension. The O5 user study (n at least 60) is stratified across gender, career stage, and native-language proficiency. The primary endpoint measures time-to-first-correct-change for under-represented strata, and a pre-registered non-inferiority margin ensures no stratum is disadvantaged. Recruitment uses gender-balanced channels; qualitative data are analysed with awareness of gender-related differences in interaction patterns and self-reported confidence. Effects are reported per stratum so aggregate gains cannot mask sub-population harm.

## 2. Open science practices

SYMPHONY follows a robust open-science strategy aligned with Horizon Europe requirements while protecting Key Exploitable Results.

- Open access publications: all peer-reviewed outputs will be published in open-access venues or made immediately available via repositories (Zenodo, OpenAIRE), with preprints where appropriate.
- FAIR data management: a consortium DMP guides all research data under the FAIR principles. Benchmark instances, evaluation traces and user-study aggregates are deposited in recognised repositories with rich metadata; restricted access is used only where GDPR or industrial confidentiality apply.
- Pre-registration and reproducible methods: O4 and O5 protocols are pre-registered before data collection. Code, prompts, baselines, seeds and analysis scripts are released alongside the manuscript.
- Open-source software: the four-layer extraction pipeline, the neuromodulatory reconfiguration module, the low-bandwidth control library and the benchmarking harness are released under permissive licences (Apache-2.0 / MIT).
- Responsible openness: openness is balanced with IP protection. Results with commercial potential are assessed and protected (provisional patents, controlled disclosure) before public release.
- Engagement: plain-language materials and a public-facing project site translate concepts for software engineers, neuroscientists and policymakers.

## 3. Ethical considerations of AI

SYMPHONY is an AI research project; AI ethics is central, not peripheral. The project applies the European Commission's Ethics Guidelines for Trustworthy AI across all seven requirements.

- Transparency and interpretability: the substrate is graph-resident and activation-based. Every retrieval is traceable to specific nodes, edges and modulatory scalars; there is no opaque prompt window. Activation profiles are logged and inspectable.
- Human agency and oversight: the low-bandwidth task-control interface preserves the engineer's authorship and accountability. The substrate proposes; the human disposes.
- Reliability and robustness: O4 is pre-registered against three named baselines (a frontier LLM agent, an architecture knowledge-graph pipeline, an LLM+RAG baseline) with adjudication by a three-person external advisory panel. Failures of expert-rated actionability are reported, not hidden.
- Privacy and data governance: full GDPR / UK GDPR compliance under Art. 6(1)(a) consent and Art. 89 scientific-research provisions where applicable.
- Diversity, non-discrimination and fairness: O5 stratification (above), with a non-inferiority margin guarding against deskilling of junior or under-represented users.
- Societal and environmental well-being: see DNSH below.
- Accountability: a consortium Ethics Manager (M1) and external advisory panel (M6) provide independent oversight throughout.

**Dual-use awareness.** Software for code understanding could in principle be misused for offensive cyber or reverse engineering. SYMPHONY's task-control surface is intentionally narrow and auditable so misuse pathways are bounded and inspectable; sensitive design details are released under controlled disclosure.

## 4. Do-No-Harm — environmental and sustainability

SYMPHONY adheres to the Do No Significant Harm (DNSH) principle. The project involves no hazardous chemicals, GMOs, animal subjects or biological agents. Its environmental footprint is computational only; training and benchmarking runs are documented (kWh, location, carbon intensity) consistent with EU AI Act guidance on environmental reporting, and carbon-aware scheduling is preferred where it does not bias results. The substrate is explicitly designed to reduce the compute cost of code understanding versus brute-force LLM rescanning of entire codebases; energy efficiency is reported alongside F1 as a secondary outcome of O4.
