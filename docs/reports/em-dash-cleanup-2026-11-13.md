# Em-dash leak: root cause, gate, and cleanup list (2026-11-13)

Found by the weekly ai-slop-watch run. House contract §1 requires zero em-dashes, title and excerpt included. On `main` at c23e40b, **73 of 218 posts carry 168 em-dashes**, including 17 of the 21 posts dated since 2026-10-20.

**Status: proposal only. No article body or frontmatter has been changed.** Tarry approves the cleanup below before anything touches `content/blog`.

## 1. Where the dashes come from

| Where | Dashes | Posts | Source |
|---|---|---|---|
| Frontmatter (excerpt, 6 titles) | 110 | 72 | The claude.ai frontmatter routine `trig_018yqkoYDg5rBrnKJseFmQs1`. Its prompt asks for an em-dash in every excerpt (the line reads "An em dash ... where natural"), and STEP 3 tells it to dollar-quote so "em dashes need no escaping". |
| Body | 58 | 11 | Mostly August and September posts written before the zero rule held. Since 2026-10-20, only `industry-comparison-no-industry-agreement-on-what-counts` has body dashes. |

62 of the 73 posts have dashes **only** in frontmatter. Since 2026-10-20, 16 of 17 do. The article writers (`ai-backup-writer.ts`, the Cowork runbook) already state the zero rule and are not the leak.

Secondary entry points, fixed in this PR:

- The Studio continue/rewrite system prompt (`src/lib/studio/ai.ts`) still said "Em dashes", with the character stripped out.
- Both nudge-card prompts (`ai.ts`, `scripts/blog/bake-nudge-card.mjs`) asked for em-dashes outright.
- The `blog:new` template modelled four.

The slop scan on the publish path was **non-blocking** (log only). That is why nothing stopped the leak.

## 2. What this PR changes

1. `src/lib/studio/em-dash.ts`: `countEmDashes()` sees every spelling that renders as a dash: the literal U+2014, named and numeric entities with or without the semicolon and with zero padding, and JS escapes inside MDX expressions. It ignores code and URLs. `scrubEmDashes()` handles short metadata: a pair of dashes becomes commas (parentheses when the aside already holds a comma), and a single dash becomes a colon. Covered by unit tests (`npm run blog:test`).
2. **Ingest scrub** (`process-article.ts`): the title and excerpt are scrubbed before the draft and the approval email exist. Tarry still reviews the result. Bodies are never rewritten.
3. **Blocking publish gate** (`publish.ts`): a new post with any em-dash fails with `em_dash`, and so does an update that adds dashes compared with `main`. Editing an old dashed post is never blocked, and a cleanup edit always passes. The draft stays in Supabase. The approve page and the editor say how many dashes there are and what to use instead.
4. Scanner (`dispatch-slop.ts`): the em-dash rule uses the shared counter. Main's previous entity check (`&mdash;|&#8212;|&#x2014;`) missed entities without the semicolon, zero-padded entities and `\u2014` escapes. None of those occur in `content/blog` today.
5. Scanner drift: ported 18 rules from `claude/chokepoint-paradox`, plus the uncommitted `source-identification-hedge` rule, by three-way merge against the fork point d9b6922. Main's own fixes are kept: a2994a6, 4a543fe, the entity check and the Title Case name guard. Burstiness now uses sd/mean. Restored `npm run blog:slop`.

**Still outside the repo, and the real root cause:** the routine prompt. Until it changes, the ingest scrub catches its dashes.

## 3. Scanner before / after (`npm run blog:slop`, 218 posts)

| | Before (main c23e40b) | After (this branch) |
|---|---|---|
| Posts with any violation | 204 | 205 |
| Rules that fire | 25 | 28 |
| Total hits | 1,103 | 1,140 |
| Hard hits | 504 | 505 |
| em-dash rule | 73 files | 73 files (unchanged; no entity or escape spellings in the corpus) |

New rules that fire: `announced-importance` (soft, 17 files / 20 hits), `stranded-auxiliary-contrast` (soft, 14 / 16), `vague-connection` (hard, 1 / 1). The other 16 ported rules fire on zero posts.

## 4. Ranked cleanup list (for approval)

Ranked by dash count, then newest first. "Frontmatter" counts title and excerpt dashes; "Body" counts the article.

| # | Post | Date | Dashes | Frontmatter | Body | Where |
|---|---|---|---|---|---|---|
| 1 | `the-700-billion-bet-wall-street-just-stopped` | 2026-08-01 | 19 | 1 | 18 | excerpt+body |
| 2 | `rate-ford-can-absorb-waymo-cannot` | 2026-09-18 | 12 | 2 | 10 | excerpt+body |
| 3 | `two-clocks-riyadh-one-deficit` | 2026-08-25 | 9 | 2 | 7 | excerpt+body |
| 4 | `where-delhivery-missing-profit-went` | 2026-08-14 | 8 | 2 | 6 | excerpt+body |
| 5 | `two-billion-puebla-ovens-first` | 2026-09-24 | 7 | 1 | 6 | excerpt+body |
| 6 | `the-underwriter-reads-second` | 2026-09-14 | 5 | 3 | 2 | excerpt+body |
| 7 | `64-gigabyte-card-can-still-answer` | 2026-11-12 | 4 | 4 | 0 | excerpt |
| 8 | `case-file-second-pair-eyes` | 2026-11-01 | 4 | 4 | 0 | title+excerpt |
| 9 | `newsroom-that-named-its-terms` | 2026-09-16 | 4 | 2 | 2 | excerpt+body |
| 10 | `rate-cut-model-nubank-first-billion` | 2026-09-06 | 4 | 4 | 0 | title+excerpt |
| 11 | `industry-comparison-no-industry-agreement-on-what-counts` | 2026-10-23 | 3 | 0 | 3 | body |
| 12 | `sonepat-off-india-peak` | 2026-10-17 | 3 | 2 | 1 | excerpt+body |
| 13 | `supervisor-who-missed-the-branch-era` | 2026-10-04 | 3 | 3 | 0 | title+excerpt |
| 14 | `emtek-30-percent-indonesias-ad-curve` | 2026-09-30 | 3 | 3 | 0 | excerpt |
| 15 | `scribe-writes-fluent-notes-who-writes-doctor` | 2026-09-09 | 3 | 1 | 2 | excerpt+body |
| 16 | `extra-handlebars-belong-to-menlo-park` | 2026-11-11 | 2 | 2 | 0 | excerpt |
| 17 | `school-link-brazil-paid-once` | 2026-11-08 | 2 | 2 | 0 | title+excerpt |
| 18 | `who-carries-agents-hypermarket-books` | 2026-11-05 | 2 | 2 | 0 | excerpt |
| 19 | `person-time-cannot-tell-courier` | 2026-11-03 | 2 | 2 | 0 | excerpt |
| 20 | `foundry-up-coast-africas-gpu-racks` | 2026-10-31 | 2 | 2 | 0 | excerpt |
| 21 | `singapore-checks-who-pays-for-ad` | 2026-10-28 | 2 | 2 | 0 | excerpt |
| 22 | `shoprite-twelve-thousand-no-baseline` | 2026-10-22 | 2 | 2 | 0 | excerpt |
| 23 | `the-four-boxes-every-assessment-now-needs` | 2026-10-15 | 2 | 2 | 0 | excerpt |
| 24 | `the-invoice-that-retires-the-chatbot` | 2026-10-13 | 2 | 2 | 0 | excerpt |
| 25 | `the-interconnect-decision-that-moved-upstream` | 2026-10-08 | 2 | 2 | 0 | excerpt |
| 26 | `the-feedback-that-ships-without-the-grade` | 2026-10-03 | 2 | 2 | 0 | excerpt |
| 27 | `store-production-prompts-in-your-application-code` | 2026-09-19 | 2 | 2 | 0 | excerpt |
| 28 | `what-southeast-asian-carrier-buys` | 2026-09-13 | 2 | 2 | 0 | title+excerpt |
| 29 | `before-the-tugs-the-substation` | 2026-09-11 | 2 | 2 | 0 | excerpt |
| 30 | `seoul-overruled-world-benchmark` | 2026-09-03 | 2 | 2 | 0 | excerpt |
| 31 | `the-18-you-cannot-name` | 2026-09-02 | 2 | 2 | 0 | excerpt |
| 32 | `your-scan-is-done-your-report-is-not` | 2026-09-01 | 2 | 2 | 0 | excerpt |
| 33 | `the-orphan-line-item` | 2026-08-23 | 2 | 1 | 1 | excerpt+body |
| 34 | `certificate-and-the-roster-gulf-telco-classrooms` | 2026-08-16 | 2 | 2 | 0 | title+excerpt |
| 35 | `dubai-draws-robotaxi-map-one-street` | 2026-11-13 | 1 | 1 | 0 | excerpt |
| 36 | `who-gets-last-hour-docomo-battery` | 2026-11-07 | 1 | 1 | 0 | excerpt |
| 37 | `yard-position-comes-due-first` | 2026-11-06 | 1 | 1 | 0 | excerpt |
| 38 | `iron-does-not-take-orders` | 2026-11-02 | 1 | 1 | 0 | excerpt |
| 39 | `contract-test-macaiba-wind` | 2026-10-29 | 1 | 1 | 0 | excerpt |
| 40 | `witness-holds-one-fact-back` | 2026-10-27 | 1 | 1 | 0 | excerpt |
| 41 | `priced-like-junk-rented-like-gold` | 2026-10-26 | 1 | 1 | 0 | excerpt |
| 42 | `the-twenty-three-wells-that-did-not-get` | 2026-10-17 | 1 | 1 | 0 | excerpt |
| 43 | `the-insurance-that-does-not-yet-cover-the` | 2026-10-16 | 1 | 1 | 0 | excerpt |
| 44 | `welder-ai-module-plan-still-drafted` | 2026-10-15 | 1 | 1 | 0 | excerpt |
| 45 | `the-auction-that-did-not-run` | 2026-10-14 | 1 | 1 | 0 | excerpt |
| 46 | `who-signs-the-ghost-citation` | 2026-10-13 | 1 | 1 | 0 | excerpt |
| 47 | `the-validation-report-nobody-reads-at-23-00` | 2026-10-07 | 1 | 1 | 0 | excerpt |
| 48 | `the-inspection-that-already-ran` | 2026-10-06 | 1 | 1 | 0 | excerpt |
| 49 | `the-auditor-who-certifies-satellite-math` | 2026-10-05 | 1 | 1 | 0 | excerpt |
| 50 | `the-fixed-cost-that-nobody-priced` | 2026-10-04 | 1 | 1 | 0 | excerpt |
| 51 | `nelson-mandela-bay-audits-the-curriculum` | 2026-10-03 | 1 | 1 | 0 | excerpt |
| 52 | `the-73-ai-services-your-network-already-has` | 2026-10-01 | 1 | 1 | 0 | excerpt |
| 53 | `the-73-you-never-see` | 2026-09-29 | 1 | 1 | 0 | excerpt |
| 54 | `compute-bill-under-j-mid` | 2026-09-23 | 1 | 1 | 0 | excerpt |
| 55 | `the-actuary-aida-never-meets` | 2026-09-22 | 1 | 1 | 0 | excerpt |
| 56 | `the-chart-you-validated-twelve-seconds-faster` | 2026-09-17 | 1 | 1 | 0 | excerpt |
| 57 | `the-defect-you-cannot-photograph` | 2026-09-12 | 1 | 1 | 0 | excerpt |
| 58 | `chinese-merchant-ai-buyer-ai-fraudster` | 2026-09-10 | 1 | 1 | 0 | excerpt |
| 59 | `the-permit-you-can-now-block` | 2026-09-08 | 1 | 1 | 0 | excerpt |
| 60 | `the-six-things-you-rate-that-never-make` | 2026-09-05 | 1 | 1 | 0 | excerpt |
| 61 | `the-certificate-you-did-not-list` | 2026-09-04 | 1 | 1 | 0 | excerpt |
| 62 | `the-similarity-threshold-you-adjust-on-tuesday-and` | 2026-09-03 | 1 | 1 | 0 | excerpt |
| 63 | `hangzhou-priced-legal-ai-discount` | 2026-09-01 | 1 | 1 | 0 | excerpt |
| 64 | `before-the-compute-arrives-the-extension-agent` | 2026-08-28 | 1 | 1 | 0 | excerpt |
| 65 | `two-ledgers-in-a-kagome-field` | 2026-08-27 | 1 | 1 | 0 | excerpt |
| 66 | `the-bill-that-ended-the-pilot` | 2026-08-26 | 1 | 1 | 0 | excerpt |
| 67 | `what-can-you-actually-test` | 2026-08-24 | 1 | 1 | 0 | excerpt |
| 68 | `the-five-minute-window` | 2026-08-22 | 1 | 1 | 0 | excerpt |
| 69 | `the-interconnect-nobody-can-buy` | 2026-08-21 | 1 | 1 | 0 | excerpt |
| 70 | `the-16-out-of-237` | 2026-08-20 | 1 | 1 | 0 | excerpt |
| 71 | `when-the-model-works-and-the-line-does` | 2026-08-19 | 1 | 1 | 0 | excerpt |
| 72 | `the-invisible-optimisation-tax` | 2026-08-18 | 1 | 1 | 0 | excerpt |
| 73 | `jakarta-claims-desk-copayment-rule` | 2026-08-17 | 1 | 1 | 0 | excerpt |

## 5. Proposed fix (not run)

Contract §1: put back the mark the dash displaced. Never default to a comma. Two tiers:

**Tier 1, frontmatter (110 dashes, 72 posts): mechanical, reviewed as a diff.** Run the same `scrubEmDashes()` the ingest path now uses on the `title:` and `excerpt:` lines only, as a dry run that prints a before/after for every changed line. Tarry reads the diff, and any line he dislikes gets hand-edited instead. Then one commit. Sample output on today's posts:

- Title, "Sunday Essay" + dash + "The Case File..." → `Sunday Essay: The Case File and the Second Pair of Eyes` (single dash → colon)
- Excerpt, "For government inference" + dash pair around "confined by the 2025 guideline to provincial networks" → commas
- Excerpt, "Two figures per pool" + dash pair around "the largest model that fits in one node, and peak-hour response time" → parentheses, because the aside already holds a comma

**Tier 2, bodies (58 dashes, 11 posts): one decision per dash, by a human or an assisted pass Tarry approves.** These are prose, so no blind replacement. Rules for the pass:

| Dash shape | Replace with |
|---|---|
| Pair around an aside with no internal comma | commas |
| Pair around a list or an aside that holds commas | parentheses, or lift it into its own sentence |
| Single dash before a list, an example or an explanation of what precedes | colon |
| Single dash joining two independent clauses | semicolon, or a full stop when the second clause stands alone |
| Single dash before a trailing afterthought or summary noun phrase | comma or colon, read aloud |
| Inside a quotation from a source | keep the quote verbatim, or paraphrase outside the quote marks |
| Line-initial dash continuing the previous sentence | rejoin the sentence, then apply the rows above |

Order: posts 1 to 5 hold 47 of the 58 body dashes, so they come first. Commit locally per post, then **push once** (every push to `main` triggers a ~7-minute Vercel production build). Re-run `npm run blog:slop -- --hard` afterwards; the em-dash rule should report 0 files.

### Appendix: every body dash, in context

The suggested mark is a heuristic starting point; the pass decides.

### the-700-billion-bet-wall-street-just-stopped
- single → colon, or semicolon if the right side is a full clause: `The company's Q2 free cash flow turned negative at $5.9 billion—a first for the quarter`
- single → colon, or semicolon if the right side is a full clause: `—and for the first time since the LLM cycle began, spending more was punished rather than celebrated.`
- pair → commas: `Roughly 75 per cent of that—around $450 billion—is directly tied to AI infrastructure`
- single → colon, or semicolon if the right side is a full clause: `That is not a rounding error—that is a 25:1 ratio of spend to revenue.`
- single → colon, or semicolon if the right side is a full clause: `Barclays analysts now see a drop of almost 90 per cent in Meta's free cash flow and are modelling negative FCF for 2027 and 2028—"somewhat shocking to us but likely what we eventually see for all comp`
- single → colon, or semicolon if the right side is a full clause: `Free cash flow negative in a growth cycle is not automatically disqualifying—AWS spent years in the red.`
- single → colon, or semicolon if the right side is a full clause: `—commitments that do not appear in the depreciation schedule but will constrain capital allocation for years.`
- single → colon, or semicolon if the right side is a full clause: `—but supply constraints in an unproven end market are not the same thing as inelastic demand.`
- single → colon, or semicolon if the right side is a full clause: `The 30-day correlation between major AI spenders and semiconductor stocks collapsed from +0.78 to near zero—the lowest reading in 4.5 years`
- single → colon, or semicolon if the right side is a full clause: `Over the 12 months to July 2026, the S&P 500 has outperformed most of the five hyperscalers—a notable reversal for a group that led the index through the first phase of the AI rally; investors have gr`
- single → colon, or semicolon if the right side is a full clause: `But the question is not *is there demand*—it is *can you price that demand high enough to cover depreciation, interest, and opportunity cost*?`
- single → colon, or semicolon if the right side is a full clause: `That means the capex does not just fund GPUs—it funds transmission, substations, gas turbines, cooling loops.`
- pair → commas: `Microsoft's deal to restart Three Mile Island—an 837-megawatt arrangement valued at over $1 billion—provides the carbon-free baseload power necessary to support massive AI training clusters`
- single → colon, or semicolon if the right side is a full clause: `*%% caption: The fork in AI capex economics—Wall Street is pricing the two outcomes separately as of July 2026.*`
- single → colon, or semicolon if the right side is a full clause: `**Show me the utilisation.** Not projected—actual.`
- single → colon, or semicolon if the right side is a full clause: `—how much of that is locked at a margin that covers the cost of capital after depreciation?`

### rate-ford-can-absorb-waymo-cannot
- single → colon, or semicolon if the right side is a full clause: `Which of two US car companies is being priced correctly by the capital markets — the one that raised its full-year profit guidance twice this summer, or the one that reported an operating loss five ti`
- pair → parentheses: `In its most mature market — San Francisco, at roughly 25% ride-share share — [the Sacra estimate of a 63% contribution margin at unit level](https://sacra.com/research/waymo-at-355m-year/) is defensib`
- pair → parentheses: `Both have anchor investors — Volkswagen at Rivian, the Saudi Public Investment Fund at Lucid — with reasons of their own to hold the line.`
- single → colon, or semicolon if the right side is a full clause: `The Federal Open Market Committee [raised the target range for the federal funds rate](https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm) by 25 basis points to 3.75-4.00% o`
- pair → parentheses: `The Sacra bull case — 63% SF contribution margin, path to profitability by 2027-28 — is arithmetically fine at these rates.`
- pair → parentheses: `What sat behind the rate — inflation in the 1980s, credit conditions in 2008, energy prices in 2022 — was less material than the rate itself.`

### two-clocks-riyadh-one-deficit
- single → colon, or semicolon if the right side is a full clause: `"We have no ego — absolutely no ego," he said.`
- pair → parentheses: `The physical build — Aramco Digital's Groq deployment, the Humain–Nvidia campus, MGX's stakes across the American AI stack — has vendor contracts already in ink, cash-payback windows in the two-to-fou`
- pair → commas: `The AI-in-curriculum line for six million students is the most politically defensible — no one in Riyadh wants to be the minister who cancels schoolchildren's AI textbooks — but it is also the most te`
- pair → parentheses: `My reading is that the education-and-training clock is the one most likely to slip on the government side, offset partially by more foreign-vendor content — Microsoft, Nvidia, Coursera, and the Chines`

### where-delhivery-missing-profit-went
- pair → parentheses: `A handful of applications — route optimisation, port-side crane orchestration, warehouse pick-and-place — reliably pay back.`
- pair → commas: `Its headline finding — battered around badly enough in the year since to warrant the salt — was that only about 5% of enterprise generative-AI pilots produced measurable P&L impact.`
- pair → parentheses: `The honest reading of Delhivery's quarter is that the company is still doing the fundamentals — 55% more parcels, revenue up, cash-flow positive, integration finishing — and paying, in real rupees thi`

### two-billion-puebla-ovens-first
- pair → commas: `The announcement was covered in parallel by [Food Business News](https://www.foodbusinessnews.net/articles/28685-grupo-bimbo-plans-2-billion-mexico-investment), which added the detail that Servitje de`
- pair → commas: `When Bimbo Bakeries USA later reported a 30% reduction in demand-forecasting error using Zebra's Work Cloud Demand Intelligence — the vendor primary is [the Zebra deployment write-up](https://www.zebr`
- single → colon, or semicolon if the right side is a full clause: `Anything that moves the waste line meaningfully has to fight for its position against physical realities the model cannot argue with — oven throughput, dough hydration windows, route density, refriger`
- single → colon, or semicolon if the right side is a full clause: `It notes that Warburtons in the UK, Grupo Bimbo, Aryzta and half a dozen others are rebuilding factories at the same time, chasing the same efficiency gains, and that the shared claim is a version of `

### the-underwriter-reads-second
- pair → parentheses: `Any pitch a vendor brings to a Japanese or Korean life or non-life insurer this quarter that promises full-cycle decisioning — underwriting, claims adjudication, and payout authorisation all under a s`

### newsroom-that-named-its-terms
- pair → parentheses: `The finding is that African newsroom workers cluster into three postures — optimists, pessimists, pragmatists — with pragmatists dominant in daily practice.`

### industry-comparison-no-industry-agreement-on-what-counts
- pair → commas: `Across a sample of 1,450+ engineering organisations, median batch size—lines changed per pull request—roughly doubled between Q1 2025 and Q1 2026, with the median growing 97.5% for organisations with `
- single → colon, or semicolon if the right side is a full clause: `A study of experienced open-source developers working in their own repos found that AI coding assistants made those developers 19% slower, while the same developers believed the tools had sped them up`

### sonepat-off-india-peak
- single → colon, or semicolon if the right side is a full clause: `India has roughly [1.59 crore registered manufacturing MSMEs — about 21 percent of all MSMEs, producing 35.4 percent of manufacturing value added and 48.58 percent of exports](https://www.pwc.in/asset`

### scribe-writes-fluent-notes-who-writes-doctor
- pair → commas: `Reflection — the specific cognitive act of prioritising a patient's problem list before writing it down — gets thinner.`

### the-orphan-line-item
- single → colon, or semicolon if the right side is a full clause: `The Commission recognises that the infrastructure is not ready — harmonised standards are not published, notified bodies are not designated in sufficient numbers, and many member states have not estab`
