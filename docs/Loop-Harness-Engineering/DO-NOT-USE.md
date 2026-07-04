# THE ENGINE ROOM — Do-Not-Use List v1

35 claims killed by the adversarial verifiers. These MUST NOT re-enter the prose. Each shows why it died.

---

## Agent harnesses & loops in practice

- ~~The Ralph loop is `while :; do cat PROMPT.md | claude ; done` (invoking the `claude` binary).~~
  · **killed:** MIS-QUOTED BINARY. Huntley's canonical loop at ghuntley.com/ralph/ reads `while :; do cat PROMPT.md | claude-code ; done` — it pipes into `claude-code`, not `claude`. The claim-bank summary dropped the `-code`. Use the corrected verbatim form (see verified claim ralph-loop-verbatim). Minor but this is exactly the kind of load-bearing code artifact the essay showcases, so it must be exact.

- ~~Claude Code hooks expose 12 lifecycle events including PreToolUse/PostToolUse.~~
  · **killed:** STALE / UNDERCOUNT. The claim appears in the brief's summary (not as a standalone claim). Current Claude Code hooks documentation (code.claude.com/docs/en/hooks) documents far more than 12 events — the live fetch enumerated roughly 30 (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, PreCompact, PostCompact, SubagentStop, Stop, SessionEnd, and many more). PreToolUse/PostToolUse are real and central, but the fixed count '12' is not supported and reads as a snapshot of an older docs version. If a count is needed, cite 'PreToolUse and PostToolUse fire on every tool call' qualitatively, or pin an exact count to a dated docs snapshot — do not assert '12'.

- ~~The .claude/ config is a 5-file / 5-subsystem anatomy in the primary docs (vs the brief's claimed 7).~~
  · **killed:** UNRESOLVED — do not state a count either way. The claim bank itself flags this as an open question ('5 not 7'), and I found no single primary Anthropic doc that enumerates a canonical fixed count of .claude/ files or subsystems. CLAUDE.md, settings.json, .mcp.json, agents/, skills/, hooks/, commands/, and memory are all real and documented across separate pages, but no primary source pins the anatomy to exactly '5' or '7'. Describe the pieces individually with per-file doc citations; do not assert a total count as if it were a documented figure.

- ~~'sit on the loop, not in it' comes from Huntley's 'Ralph Wiggum as a software engineer' post (ghuntley.com/ralph/).~~
  · **killed:** MIS-ATTRIBUTED URL. The phrase is genuinely Huntley's, but it is NOT on the /ralph/ page — it is on his separate post 'everything is a ralph loop' at ghuntley.com/loop/. Attributing it to /ralph/ would send a reader to a page that does not contain the quote. The claim itself is salvageable and is re-anchored in verified claim ralph-sit-on-loop with the correct URL.

- ~~Effective harnesses for long-running agents was written by 'Justin Young + 12 contributors'.~~
  · **killed:** CONTRIBUTOR COUNT UNVERIFIED. Justin Young as author and the Nov 26 2025 date are confirmed, but I could not independently confirm the exact '12 contributors' from the fetched byline. Drop the '+12' or verify the full contributor list on-page before printing a number. The core claim (harness-def) is verified without this detail.

## Angle 2

- ~~rlhf-sycophancy: 'Anthropic's HH-RLHF work (Bai et al., arXiv:2204.05862) surfaced/named sycophancy as a failure mode of preference optimization — models learn to agree with a user's stated opinion because agreement earns higher ratings.'~~
  · **killed:** MIS-ATTRIBUTION. The HH-RLHF paper (2204.05862, 'Training a Helpful and Harmless Assistant with RLHF') does not name or centrally analyze sycophancy — its named pathology is the helpfulness-vs-harmlessness tension and evasiveness, not sycophancy. The claim bank itself already flagged this as 'secondary' confidence, and adversarial checking confirms the citation does not support the statement. Sycophancy as a named, measured RLHF failure mode is properly attributed to Perez et al. 2022 'Discovering Language Model Behaviors with Model-Written Evaluations' (arXiv:2212.09251) and, most directly, Sharma et al. 2023 'Towards Understanding Sycophancy in Language Models' (arXiv:2310.13548, Anthropic) which shows preference models reward responses matching user views. DO NOT cite 2204.05862 for sycophancy. If Ch6 needs the sycophancy-as-loop-pathology point, re-source it to Sharma et al. 2023 (arXiv:2310.13548) and/or Perez et al. 2022 (arXiv:2212.09251) and re-file as a fresh verified claim.

- ~~anthropic-hh-rlhf-dataset (the sub-figure): '~42,000 comparisons for harmlessness and ~44,000 for helpfulness.'~~
  · **killed:** UNVERIFIED SPLIT. The top-line 161k train / 8.55k test IS confirmed on the HuggingFace dataset card and can be stated. But neither the anthropics/hh-rlhf README nor the HF card states a ~42k harmlessness / ~44k helpfulness breakdown — those specific per-category numbers could not be confirmed against any primary source and appear to be a fabricated or mis-remembered split (they also don't sum to 161k). The dataset is organized into harmless-base, helpful-base, helpful-online, helpful-rejection-sampled, and red-team-attempts directories, but no primary doc gives the 42k/44k figures. USE ONLY '161k training comparisons / 8.55k test' (HuggingFace) as the citable number; drop the 42k/44k split unless you count the JSONL rows in each subdirectory yourself and cite that as a primary computation. The multi-turn chosen-vs-rejected row structure is correct and can stay.

## Angle 3

- ~~The DeepMind 'Specification gaming' blog post (deepmind.google) documents evolved creatures twitching to accumulate numerical-integration error and thereby 'fall' at unrealistic speeds, or catapulting themselves.~~
  · **killed:** SOURCE-URL MISMATCH. The specific 'integration-error twitching / catapulting' mechanism is NOT in the DeepMind blog — that post's physics example is a creature 'hooking its legs together and sliding along the ground.' The integration-error/catapult mechanisms live in the Krakovna master list and Lehman et al. (2020), not at the DeepMind URL. Do not cite the DeepMind blog URL for this mechanism. (The claim survives as rh-physics-exploit with the URL re-pointed to the Krakovna list and confidence downgraded to secondary, and the mechanism softened to what is actually documented — including the verifiable Sims-1994 'fall over to reach the target' case.)

- ~~The Lego-block flip was produced by a reward learned from human preferences.~~
  · **killed:** OVER-SPECIFICATION. The DeepMind blog attributes the reward to a hand-specified geometric term (height of the red block's bottom face when not touching the blue block), not to a learned human-preference reward model. Stating it as 'learned from human preferences' misattributes the reward source. Use the block-height framing (the claim rh-lego-flip is retained with the human-preferences qualifier removed).

- ~~Human baselines showed minimal cheating despite a monetary incentive (METR Optimize LLM Foundry).~~
  · **killed:** NOT VERIFIED in the fetched METR content. This human-baseline-cheating clause appears in the claim-bank statement for rh-metr-prompt but was not confirmed against the primary source in this pass. Do not assert it until independently verified in the METR post; the reward-hacking percentages themselves are confirmed and can be used without this clause.

- ~~OpenAI's CoT-monitoring result should be cited as '95% accuracy.'~~
  · **killed:** IMPRECISE METRIC LABEL. The OpenAI blog uses the loose word 'accuracy' (95% with CoT, 60% actions-only), but the arXiv paper's Table 1 labels the headline 95%/60% figures as RECALL on the two systemic hacks. For an engineering essay use 'recall' (as the primary paper does), not 'accuracy.' The corrected claim rh-cot-quotes uses recall.

## Angle 4

- ~~MMLU-Pro frontier model scores drop 'roughly 14-16 points versus MMLU' (from claim mmlu-pro, figure string '-14 to -16 pts vs MMLU').~~
  · **killed:** FABRICATED FIGURE. The primary paper (arXiv:2406.01574) states the drop is '16% to 33% compared to MMLU', not 14-16 points. No source supports 14-16 points. The rest of the mmlu-pro claim (10 options, 12,032 questions, 14 disciplines) is correct and retained in verified — only this figure is killed. Replace with '16-33%'.

- ~~HLE launch scores: GPT-4o 2.7%, Claude 3.5 Sonnet 4.1%, o1 8.0% (from claim hle-launch).~~
  · **killed:** MIS-STATED vs PRIMARY SOURCE. The primary HLE paper (arXiv:2501.14249 v1) Table reports GPT-4o 3.3%, Claude 3.5 Sonnet 4.3%, o1 9.1%, Gemini 1.5 Pro 5.0%, DeepSeek-R1 9.4%. The cited 2.7/4.1/8.0 numbers come from secondary reporting and additionally drift across paper versions (o1 reported variously as 8.0/8.3/9.1), so no single figure set is reliable. Killed the specific per-model percentages; the qualitative 'all frontier models under 10% at launch' survives in verified. Do not print the individual numbers.

- ~~HLE ships a '~500-question private holdout' for '~3,000 total' (from claim hle-holdout figure).~~
  · **killed:** UNSOURCED FIGURE. The primary paper confirms a private held-out set EXISTS but gives no count; the ~500/~3,000 numbers trace only to Wikipedia (secondary, and the claim bank itself labelled this 'secondary'). Default-to-kill on an unverifiable round number. The qualitative 'private held-out set exists, by design, to resist overfitting' survives in verified, re-sourced to the arXiv paper.

- ~~ARC-AGI-2 has '1,000 train + 360 eval tasks' (from claim arc2-design figure).~~
  · **killed:** UNVERIFIED task-count. The arXiv:2505.11831 abstract does not state train/eval counts, and the ARC Prize blog excerpt reviewed did not surface these exact numbers. Not a confirmed primary figure at research time. The calibration rule (every eval task solved by >=2 humans in <=2 attempts) and the 60% human average ARE confirmed and retained. Do not print the 1,000/360 split unless pinned to the paper body with a page/section.

- ~~Any 'current SOTA leaderboard' figures for post-2025 frontier models (e.g. named models like 'Claude Mythos 5' / 'Claude Fable 5').~~
  · **killed:** The claim bank deliberately did not record these; confirmed correct to exclude. Web searches for current-SOTA numbers surface aggregators emitting future-dated, likely-hallucinated model names. Keep these as open questions, never as claims. (Note: the SWE-bench retirement source does legitimately name GPT-5.2, Claude Opus 4.5, Gemini 3 Flash as of Feb 2026 — those are OK because they come from OpenAI's primary post, not an aggregator.)

## Context engineering research (Angle 5)

- ~~arXiv 2606.10209 shows a multi-agent architecture delivering a '+90.2%' improvement.~~
  · **killed:** KILLED as fabricated/mis-attributed. Independent read of the paper's HTML body (Table 2 + abstract) confirms the '+90.2%' figure appears NOWHERE and there is NO multi-agent architecture in the paper — it uses a single GPT-5 agent with an optional gpt-4.1 user-model participant. The paper's largest reported delta is +20.6 percentage points (71.0->91.6). This is exactly the correction the task flagged; drop the number entirely. (This is the intended content of contested claim ctx-04.)

- ~~Chroma tested needle-question semantic similarity over a single continuous range of 0.445–0.829.~~
  · **killed:** DEMOTED, not fully killed — the underlying finding is real but the range is mis-stated. Chroma reports two separate bands: 0.445–0.775 (Paul Graham essays) and 0.521–0.829 (arXiv papers). The claim collapses them into one span, which slightly overstates the low-end coverage. Cite the two ranges separately (see ctx-06 verifierNote) rather than the merged '0.445–0.829'.

## Angle 6

- ~~NVIDIA ChipNeMo DAPT delivers a 5x parameter (inference-cost) reduction by closing the gap between a 70B SOTA model and a 13B domain-adapted model.~~
  · **killed:** MIS-ATTRIBUTED / FABRICATED. The ChipNeMo paper (arXiv:2311.00176) makes NO such claim. It reports (a) ChipNeMo-70B outperforming GPT-4 on some chip-design tasks and (b) ChipNeMo-13B improving over LLaMA2-13B — but never that a 13B DAPT model reaches or 'closes the gap' to a 70B model, and never a '5x parameter reduction.' Two direct full-text searches returned no '5x', no 'few thousand->13B closes 70B' statement. Do not use this number. If the essay needs a parameter-efficiency framing, use the confirmed DAPT-compute figures instead (7B=2,620 / 13B=4,940 / 70B=20,500 GPU-hrs; <1.5% of from-scratch pretrain).

- ~~ChipNeMo achieves a '90-95% TCO cut vs frontier API at scale' as an NVIDIA ChipNeMo result.~~
  · **killed:** SOURCE CONFLATION — keep the number but not this attribution. The 90-95% TCO figure comes from a SEPARATE modeling paper (Sharma et al., arXiv:2404.08850) assessing the *potential* TCO of domain-adapted LLMs vs Claude 3 Opus / GPT-4 Turbo — it is a projected economic model, not a measured ChipNeMo deployment result. The claim-bank summary sentence 'ChipNeMo ... 90-95% TCO cut vs frontier API at scale' fuses the ChipNeMo model with the TCO paper's projection and reads as an NVIDIA-measured outcome. Cite it strictly as arXiv:2404.08850's *potential* estimate (verified claim a6-chipnemo-tco), never as a ChipNeMo production figure.

- ~~Under DORA, the ESAs designate critical third-party providers (CTPPs) from July 2025.~~
  · **killed:** UNVERIFIED DATE on the cited source. The EIOPA DORA page confirms the CTPP oversight framework exists and references a 'Roadmap for CTPPs designation' but does NOT state a July-2025 designation date. The specific 'from July 2025' timing is not supported by the URL given. Drop the date, or re-source it from an ESA/EIOPA designation-roadmap document before stating it. The rest of the DORA claim (17 Jan 2025 application, 20 entity types, CTPP regime) is confirmed and retained.

## Angle 7

- ~~IDC's Global DataSphere grew from 33 ZB in 2018 to a forecast 175 ZB by 2025 (~61% CAGR), per the Seagate/IDC 'Digitization of the World' PDF.~~
  · **killed:** The 175 ZB / 2025 endpoint is verbatim in the primary PDF, but the '33 ZB in 2018' baseline and the derived ~61% CAGR are NOT in that document. The version at the cited Seagate URL is the Nov-2018 report with data 'refreshed May 2020', and it states the datasphere grows 'from 45 ZB in 2019 to 175 ZB by 2025.' The 33-ZB figure is from the original pre-refresh 2018 press framing and cannot be paired with this URL. Ship 175 ZB by 2025 alone, or use '45 ZB in 2019' from the same PDF if a baseline is required.

- ~~IDC forecasts ~30% of the world's data will need real-time processing by 2025.~~
  · **killed:** This is a secondary (i-Scoop) paraphrase that CONTRADICTS the primary IDC PDF, which states 'nearly 25% of the Global Datasphere will be real-time by 2025.' The '30%' in the primary appears only as a survey answer-option ('YES 30% Don't know'), not as the real-time datasphere forecast. Do not present 30% as IDC's figure. Use the primary '~25% real-time' or drop the figure.

- ~~IDC's newer 'Worldwide Global DataSphere Forecast, 2025-2029' (US53363625) puts the ~2025 datasphere at ~180-181 ZB.~~
  · **killed:** The doc exists (published May 2025, paywalled at my.idc.com) but the specific '~180-181 ZB' number could not be confirmed from any reachable primary or credible secondary source — search surfaced only 'global data generation will triple between 2025 and 2029', not a 180-181 ZB point value. Record as an openQuestion; do not state the number. The claim bank already flags it 'contested' — keep it out of cited prose entirely.

- ~~The '~40 PB distilled from' figure lands at ~38-40 PiB.~~
  · **killed:** Recomputed: 96 crawls x 386-410 TiB = 36.2-38.4 PiB, so 40 PiB overshoots (it implies ~427 TiB/crawl, above the max observed). Moreover per-crawl size grew ~2013-2024, so multiplying by a 2024-era per-crawl size is an upper bound — the true reprocessed aggregate is lower. If shipped, use '~36-38 PiB (upper-bound estimate)' with arithmetic shown, never '~40 PB' as a hard number and never as a citation.

## Angle 8

- ~~gnome-crit-01 tail clause: Cheetham & Seshadri argued the GNoME results 'should be scoped strictly to crystalline inorganic solids.'~~
  · **killed:** The verifiable, quotable core of the Cheetham/Seshadri critique is 'scant evidence for compounds that fulfill the trifecta of novelty, credibility, and utility,' plus their call to incorporate domain expertise. The specific 'scoped strictly to crystalline inorganic solids' framing is a paraphrase I could not confirm as a direct claim of the perspective from primary or reliable secondary sources. Keep the trifecta quote; drop or explicitly soften the scoping clause so the prose doesn't attribute words the authors may not have used.

- ~~cosci-02 asserting Coscientist was 'Published in Nature on 21 December 2023' as an unqualified fact.~~
  · **killed:** Not fully killed but flagged for precision: PubMed records online publication as 20 December 2023; the Nature print issue and CMU news say 'Dec. 21.' Stating a bare '21 December 2023' risks a fact-checkable date mismatch. Use 'published online 20 Dec 2023 (in the 21 Dec Nature issue)' if the exact date is load-bearing in the essay.

## ANGLE 9

- ~~The four-way zone percentage split: Automation Green Light 46.1% / R&D Opportunity 12.9% / Automation Red Light 24.3% / Low Priority 16.7%.~~
  · **killed:** FABRICATED / MIS-ATTRIBUTED. The primary WORKBank paper (arXiv:2506.06576) defines the four zones qualitatively (high/low desire x high/low capability) but publishes NO four-way percentage breakdown across them. Independent verification confirms 46.1% is the share of TASKS with a positive automation attitude (worker desire >3 on a 5-pt Likert), a different quantity entirely; the other three figures (12.9% / 24.3% / 16.7%) have no counterpart in the paper. The claim bank correctly filed this as an open question and did NOT assert it - the integrity call was right. Recorded here so it is never resurrected as a zone split.

- ~~METR's 2024-2025 subset definitively 'trends faster' / the doubling has accelerated to a shorter period.~~
  · **killed:** OVERSTATED relative to source. arXiv:2503.14499 only says the trend 'may have accelerated in 2024' - hedged as a possibility, not an established finding. Any prose asserting a confirmed faster doubling rate for the recent subset overstates the source. Keep the ~7-month/since-2019 figure (confirmed); state the recent acceleration as suggestive only.

- ~~The Anthropic Economic Index 'Uneven geographic and enterprise AI adoption' report is a September 2025 report.~~
  · **killed:** WRONG DATE. arXiv:2511.15080 was submitted 19 November 2025 (v1), not September 2025. The report itself is real and primary; only the 'September 2025' month descriptor is false. The corrected claim (November 2025) is retained in verified; the September attribution must never be used.

## Angle 10

- ~~FDE-05: 'Across OpenAI's live Forward Deployed / Applied AI postings, base salary spans ~$146k–$385k with a midpoint near $261k; total comp (with PPU equity) reaches ~$350k–$550k mid-to-senior and >$700k for senior FDEs.' (source: Paraform blog)~~
  · **killed:** MIS-ATTRIBUTED / FABRICATED FIGURES. The cited Paraform article does NOT contain the $146k–$385k base range, the ~$261k midpoint, or the >$700k senior TC figure. What Paraform actually states is base $160k–$280k mid, $220k–$300k senior, and total comp $350k–$550k mid-to-senior — different numbers. The specific $146k / $385k / $261k / $700k figures are not supported by the source and read as fabricated. If OpenAI FDE comp is needed, re-source directly from a live OpenAI posting's stated base band; do not use these numbers.

- ~~AE-02 tail: 'LinkedIn frames AI as having created 1.3M new roles including AI Engineers, Forward-Deployed Engineers and Data Annotators' cited to the CBS News article.~~
  · **killed:** SOURCE DOES NOT SAY IT. The CBS article contains the 639k/75k figures but makes NO mention of 1.3M new AI roles, nor of Forward-Deployed Engineers or Data Annotators. The 1.3M figure comes from a separate World Economic Forum (Jan 2026) writeup, which I could not fetch (403). The claim as written mis-attributes the 1.3M/role-list to CBS. If retained, it needs the WEF URL verified and the specific named-roles list confirmed against that source — until then, do not state it.

- ~~FDE-04 tail: 'total comp regularly exceeds $500k once equity is counted' for the Anthropic FDE role.~~
  · **killed:** UNSOURCED. The Anthropic posting discloses only the $200k–$300k base band. The >$500k TC figure is an inference with no cited source (Anthropic equity values are not public in the posting). Keep the confirmed base band; drop the TC claim unless a real comp-data source is attached.

- ~~COMP-02 tail: 'Senior MLOps ~$209k average,' 'Glassdoor average ~$161k,' '6figr ~$174k,' and 'ML/MLOps comp jumped ~20% YoY through 2025.'~~
  · **killed:** UNVERIFIED. Only the $175k US median on levels.fyi could be confirmed. The senior $209k, the Glassdoor and 6figr cross-checks, and the '~20% YoY' recruiter claim have no verified primary source in this pass. Default-to-kill on unverified round numbers. Keep only the $175k median.

- ~~DVS-01 attribution as written: 'Each major frontier lab spends ~$1B/yr on human training data (Time, 2025)' AND the $3.77B/$17.1B market figures pinned to a Time URL.~~
  · **killed:** PRIMARY SOURCE NOT LOCATED / WRONG ATTRIBUTION. The '~$1B/yr per lab' figure is repeated across many secondary blogs all citing 'a Time 2025 investigation,' but I could not locate or verify the primary Time article URL (the URL was truncated in the claim bank and no resolvable Time link surfaced). The $3.77B/$17.1B market-size numbers are Grand View Research's, not Time's. Split these: (a) use the market-size figures cited to Grand View (see DVS-01 verified, secondary); (b) do NOT state the '$1B/yr per lab' number until the actual primary Time article URL is found and confirmed to contain it. Also killed here: the bank's '$75–$300/hr expert RLHF trainer' rate had no verifiable primary source in this pass — secondary blogs cite figures ranging $15/hr to $500+/hr, so the specific $75–$300 band is unsupported.

