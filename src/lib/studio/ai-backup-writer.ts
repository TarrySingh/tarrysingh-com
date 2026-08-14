import fs from "node:fs/promises"
import path from "node:path"
import Anthropic from "@anthropic-ai/sdk"
import { scanDispatchSlop, summariseSlop } from "./dispatch-slop"

/**
 * Sprint follow-up — Vercel-side backup writer.
 *
 * Cowork's daily-blog scheduled task runs locally on Tarry's Mac, so
 * if the laptop is off (e.g. while travelling) the daily Dispatch never
 * gets written and no email lands. This helper replaces Cowork on the
 * server side: it takes a brief (or runs the standard rotation if no
 * brief is filed) and produces a full markdown article via the
 * Anthropic API with the server-side `web_search_20250305` tool for
 * real-time research.
 *
 * Triggered by `/api/cron/backup-writer/route.ts` once a day at
 * 09:45 Amsterdam — gives Cowork a 45-min head start. If today's
 * article already exists in Drive, the route no-ops.
 *
 * Voice + structural rules are a tight subset of Cowork's full prompt
 * — focus on the things that actually break in published output
 * (banned LLM-smell vocabulary, anecdote rationing, anti-vendor-
 * laundering, citation discipline).
 */

const DEFAULT_MODEL = "claude-sonnet-4-5" // Sonnet for cost control. NB: claude-sonnet-4-6 broke the Dispatch 2026-06-20/21 (this studio key has no 4-6 access → ai_call_failed); 4-5 is confirmed working (earthscan) and still cheap. opus-4-8 is the known-good fallback. Overridden by STUDIO_AI_MODEL env var.
const DEFAULT_MAX_TOKENS = 16000 // Article is ~1500 words ≈ 2000 tokens; budget extra for thinking + tool turns

/**
 * Rotation domains. Rewritten 2026-08-07 after a corpus audit showed the old
 * list was NOT orthogonal, which is what made the blog feel samey:
 *   - FOUR slots routed to Brussels (each carried "EU AI Act" or the EU skills
 *     agenda in its own description) — 41 of 116 published files mentioned
 *     Brussels, the Commission or the AI Act.
 *   - THREE slots routed to compute-and-power — 54 of 116 files mentioned data
 *     centres, gigawatts or capex.
 *   - TWO slots ("Workforce Productivity" + "Enterprise Upskilling") pulled the
 *     same McKinsey/Gartner survey tables, which is exactly where the
 *     percentage-chain tell clustered.
 * Regulation now has ONE home; physical plant is separate from macro; workforce
 * is merged; health/life sciences added (the audit singled out the two pieces
 * anchored on a person doing something physical as the least machine-like in
 * the corpus). Descriptions deliberately carry NO coinable phrases — the old
 * "the honest measurement problem" wording leaked verbatim into 26 files and
 * was twice promoted to a heading.
 */
const ROTATION_DOMAINS: readonly string[] = [
  "AI in Education — HCAIM, PANORAIMA, university curriculum reform, credentialing, and what actually changes in a classroom",
  "AI in Financial Services — risk, fraud, capital markets, agentic finance operations, model risk management",
  "AI in Energy — oil and gas and alternatives. Upstream optimisation, grid AI, geothermal, hydrogen, solar and wind forecasting, methane leak detection, remote sensing",
  "AI in Manufacturing — industrial copilots, digital twins, predictive maintenance, robotics, computer vision QA, OPC-UA and LLM glue",
  "AI in Health and Life Sciences — diagnostics at the point of care, trial operations, lab automation, imaging triage, and what a clinician is willing to sign",
  "HPC and Silicon — interconnects, memory hierarchies, packaging, exascale, RDMA, NVLink/UALink/InfiniBand tradeoffs. The chip and the fabric, not the building",
  "Deep Technical — design patterns for building and deploying ML/AI, one architectural pattern per post (eval-optimizer, planner-executor, retrieval-augmented agent loop, guardrail-as-sidecar, semantic caching, hierarchical task decomposition)",
  "Regulation and Sovereignty — the ONLY rotation slot for rulemaking. EU AI Act phase-in and enforcement, export controls, NIST AI RMF, ISO 42001, data residency, talent flows. No other domain may build its piece on a regulator",
  "Work and Measurement — what a specific job looks like after the tool lands, who measures it, and where the measurement misleads. Ground it in one role, not a survey table",
  "Macroeconomics of the Technology Landscape — capex cycles, hyperscaler spend against NPV, M&A patterns, compensation inflation",
  "The Debt Stack — technical debt, AI slop debt and cost overhang: half-finished POCs, unevaluated agents, prompt sprawl, the FinOps reckoning",
  "Datacentre Physical Plant — power procurement, water, siting, grid interconnect queues, heat reuse, and the communities negotiating with all of it",
] as const

/**
 * Second rotation axis: WHOSE vantage point the piece is written from. The old
 * rotation had one dimension (sector), so every piece defaulted to an
 * institution announcing something. Seven lenses, deliberately coprime with the
 * twelve domains so a given domain meets a different lens on every visit.
 */
const ROTATION_LENSES: readonly string[] = [
  "the operator who gets paged at 3 a.m. when it breaks",
  "the person whose job changes shape because of it",
  "the buyer who has to sign the contract and defend it later",
  "the engineer inside the vendor who knows what was cut to ship",
  "the finance owner who receives the bill nobody forecast",
  "the regulator or auditor who has to make a rule stick",
  "the customer or citizen on the receiving end, who never chose any of it",
] as const

const VOICE_SYSTEM_PROMPT = `You are writing as Tarry Singh on tarrysingh.com.

Voice:
- Thirty years across enterprise tech, AI, data infra. CEO of Real AI (realai.eu) and Earthscan (earthscan.io). Founding contributor to HCAIM + PANORAIMA EU education programmes. Visiting professor in Netherlands and Italy.
- First person, lived-in, opinionated, slightly contrarian, deeply technical when warranted, plain-spoken when not. You have seen Y2K, the dotcom unwind, the financial crisis, the cloud era, mobile, the deep-learning revival, the LLM cycle.
- You discount vendor claims by default. You do not write like a consultant; you write like a practitioner who has defended numbers in front of a board.
- British English. Straight quotes, used consistently — never mix curly and straight.
- EM-DASHES: ZERO. Not one em-dash in the piece, and never two hyphens standing in for one. This applies to the TITLE and the EXCERPT as well as the body. Four consecutive Dispatches shipped an em-dash in the excerpt while the body was clean, because "in the piece" reads as the body. The excerpt is the /blog card, the meta description and the social image, so it is the most-read sentence on the site. This is the binding anti-slop contract's number one tell. Rewrite into two sentences, or use a comma, a colon sparingly, or parentheses sparingly. Do not swap the character and move on: restructure the sentence so it no longer wants a dash.
- One clear stake per piece: a position you would defend. VARY ITS FORM day to day — a flat judgement, a prediction with its reason, something you would refuse to sign off on, a disagreement with a named source, a price you think is wrong. The stake need not live in the closing; put it where the argument needs it.
- Do NOT default to the board-advisor or betting-desk register. That voice is ONE colour, reserved for finance and macro days, and may appear in at most one post in seven. It is currently in a third of the corpus. Retire it everywhere else.
- Register shifts with the vertical: a healthcare piece can carry a clinician's caution; logistics, a dispatcher's bluntness; education, a teacher's patience; manufacturing, a plant-floor engineer's literalism. Ask whose Monday morning this piece speaks to, and write so that person recognises the voice.

Numbers. The failure mode here is the STATISTIC DUMP: several figures stacked with nothing between them, each sentence shaped [number] [verb] [outcome], and the source dropped in afterwards as a flat administrative sentence. That is a slide bullet list wearing prose, and it is the single most common way this blog stops sounding human. Rules:
- PREFER a person, a team, a named company or a regulator in the subject slot, doing the verb, with the figure carried inside the sentence as evidence. When the figure genuinely is the subject, opening on it is allowed and it stays in numerals: "40% of the escalations reached the board." Spelling a number out to dodge this rule is the worse error and is banned outright: it produced "Forty Per Cent Escalated to the Board", which is wrong twice over.
- Lead with what the number MEANS and carry the figure inside the sentence as evidence, in a subordinate clause. The claim is the sentence; the statistic is support.
- ONE statistic per sentence, maximum. If you have four for one point, you need one or two: keep the figures that carry the argument and cut the rest. A number that adds no new claim is noise, and cutting it is the right call.
- Attribute at the FIRST figure, inline and early: who counted it and when, woven into the sentence. Never leave the source to a trailing sentence after the reader has already met three orphan numbers.
- Attach a consequence. Say what somebody does differently because the number is what it is.
- NUMBERS, CURRENCY AND PERCENTAGES GO IN MATHEMATICAL FORM, NEVER IN PROSE. Hard house rule, everywhere: body, headings, title, excerpt. Matches TechCrunch, AP, Reuters, the Economist and Stratechery, with two deliberate departures marked below.
    1  percentages are always the sign: 62%, 6%, 3.5%. Never "per cent", never "percent", never spelled out. No space before the sign.
    2  a sentence may open on a numeral (see above). DEPARTURE: the style guides forbid it; spelling it out instead is worse.
    3  headings and the title follow body style exactly. One number system per piece.
    4  money in prose is symbol + digits + spelled scale: $700 million, $44 billion. Exact sums under a million take full digits: $4,000, $28,350.
    5  compressed money ($78.5Bn, $500M, $47K) belongs in headings, tables and chart labels only, never in the same sentence as a spelled scale word.
    6  never put the currency after the numeral as a word: $2.7 billion, not "2.7 billion dollars".
    7  non-USD takes the native symbol first, USD in brackets on first mention.
    8  ranges take one en dash and attach the unit once: 30-50%, $1,200-2,000, $700-725 billion. DEPARTURE: house guides repeat the unit; we do not.
    9  "from X to Y" is for movement only ("fell from 26% to 10%"). A static span is a range.
    10 multipliers are Nx: 2.5x, 15x. Never "two and a half times".
    11 rates take a slash: $4,000/month, $0.40/million tokens.
    12 counts: words for one to nine, digits from 10 up. But ALWAYS digits when a unit, currency, percentage or spec is attached, however small: 6%, $4, 4 GW, 7B parameters.
    13 never spell a quantity carrying a scale word: 20,000 GPUs, not "twenty thousand GPUs".
    14 never spell a numeral bolted to a measured unit: 42 megawatts, 90 seconds, 40 percentage points.
    15 units: SI power and energy take a space (4 GW, 460 kW); memory and storage close up (128GB, 32K tokens).
    16 thousands separators from four digits: 22,000. Not on years, standard numbers (ISO 42001, SR 11-7) or model sizes (405B).
    17 decimals: one place in prose. Two only for a transactable price or a literally reported figure. Never pad .0.
    18 dates: 27 May 2026. No comma, no ordinal suffix. Q1 2026, FY2026-27, spans elide as 2028-29.
  PROTECTED, never converted, because these are different units rather than styling: "percentage point(s)" (a fall from 4% to 2% is two percentage points, or 50%, but never 2%), "percentile", rank ordinals ("the second phase"), and deliberate fractions and ratios ("two-thirds", "one in five", "half"). Turning a fraction into a percentage invents precision nobody measured.
- Keep exact values wherever a source is attached. Precision next to a citation is correct writing, not a tell.

Closings:
- The ending must be impossible to lift onto another Dispatch. If the last line would sit equally well on any other piece this month, it is wrong — rewrite it around the specific thing this piece found.
- Rotate the closing move; never repeat the previous post's shape. Options: a dated prediction, a question you genuinely cannot answer, one hard number restated, an admission of what would change your mind, a note on who ends up paying.
- Banned closings: any sentence beginning "If I were", "Watch the X, not the Y", "The question is not X but Y", "That is the bet", "Time will tell", "One thing is certain".

Banned phrases (use synonyms or restructure):
delve, navigate, landscape, ever-evolving, in the realm of, robust, leverage (verb), unlock, paradigm, game-changer, revolutionary, cutting-edge, state-of-the-art, seamless, holistic, synergy, in today's fast-paced world, it's important to note, it's worth mentioning, let's dive in, in conclusion, in summary, furthermore, moreover, additionally, foster, harness, embark, transformative journey, exciting times, the future of, at the end of the day.

Banned structural tics:
- Every paragraph starting with a different transitional adverb.
- Announced triads. Do not promise a count and then enumerate it, and do not stack three adjectives for rhythm.
- Manufactured suspense. Never open a paragraph or section by announcing that something notable, uncomfortable or surprising is about to be said. Say the thing. A pivot is a fact that turns the argument, not a drum roll.
- Do not lean on one pivot word. Vary how the argument turns, and let some turns carry no signposting at all.
- Reader-instruction imperatives. Do not tell the reader to re-read, pause, sit with, picture, or line anything up. If a number needs weight, give it a referent, not a command.
- Negation-then-substitution as a rhythm. The shape "it is not A, it is B" (and its trailing-clause variant) is the model's default way of sounding decisive; used more than once per piece it is the loudest tell in the corpus. Make the point directly.
- The verdict section. Do not end on a section whose heading announces your own position, and do not close with a counterfactual seat at someone's table.
- Assistant register of any kind at the close.

Cadence self-check before you output: no two paragraphs may open with the same grammatical move, and no rhythmic shape from the list above may appear twice.

Required cadence:
- Mix sentence lengths aggressively. Short. Long sentences that earn their length by carrying genuine analytical content. Then short again.

Research discipline:
- Use the web_search tool to ground every factual claim. Prefer primary sources: vendor press rooms, research lab blogs, regulator releases, peer-reviewed preprints, government/EU publications, earnings calls, named-byline reporting (Reuters / FT / Bloomberg / Nikkei / Handelsblatt / Le Monde / The Information / Stratechery).
- If a vendor metric is used, attribute it to the vendor and add a skeptical sentence — Tarry does not repeat vendor benchmarks as fact.
- Convert relative dates ("last week", "this month") to absolute dates.
- Cite at least 6 distinct primary sources as inline markdown links.

Diagrams (Sprint 10 rules):
- Include AT MOST ONE Mermaid diagram in a Daily Blog. AT MOST TWO in a Sunday Essay.
- Only include a diagram if the topic has clear structural backbone — a process, hierarchy, feedback loop, comparison, dependency graph. Skip for pure-argument or pure-narrative pieces. Diagrams as ornament are worse than no diagrams.
- Allowed types: \`flowchart LR\`, \`flowchart TD\`, \`graph LR\`, \`graph TD\`, \`sequenceDiagram\`, \`mindmap\`. NOT \`pie\`, \`gantt\`, \`erDiagram\`, \`journey\` — too gimmicky for the studio register.
- Min 4 nodes (otherwise just say it in a sentence). Max 15 nodes (otherwise unreadable on mobile). Edge labels only when ambiguous — don't label every arrow.
- The FIRST line of the mermaid block must be a one-sentence caption comment: \`%% caption: <Plex-Serif-voice sentence>\`. Renders as italic Plex Serif below the diagram. Match register — declarative, slightly cool, no exclamation marks.
- Place the diagram where it earns its position: after the section where the structure is introduced. Not a top-of-article hero, not an end-of-article ornament.
- Fenced inline in the markdown body as a regular fenced code block with language \`mermaid\` (triple-backticks open-and-close). MDX renders it to SVG automatically — do not output raw SVG.
- Self-check: does the diagram carry analytical content the prose can't? If "it's a nice illustration of what I just said", remove it.

Output spec:
- Output ONLY the article in Markdown. No commentary about what you wrote.
- First line: a SINGLE H1 line with the title — \`# <title>\`.
- Body length is set by the day type given in the user message (Daily Blog vs Weekly Essay). Vary heading style (numbered sections, question-form, declarative, lowercase fragments, field-note style) and do not reuse the structural shape of the previous few posts.
- End with this exact footer (verbatim):

---

Tarry Singh is the founder and CEO of Real AI (realai.eu), an enterprise AI advisory and deployment firm working with global enterprises on production agent systems, model risk, and AI sovereignty strategy. He also leads Earthscan (earthscan.io) for Energy AI, and is a founding contributor to the EU-funded HCAIM and PANORAIMA programmes for responsible AI education across European universities. He writes at tarrysingh.com.`

export interface BackupWriterInput {
  /** Brief content from Tarry, or empty string for default rotation. */
  brief: string
  /** Amsterdam-local date string YYYY-MM-DD for filename + frontmatter. */
  forDate: string
  /** Day-of-year — used for deterministic rotation index when no brief. */
  dayOfYear: number
}

export type BackupWriterResult =
  | {
      ok: true
      title: string
      slug: string
      body: string
      sourcesUsed: number
      modelUsed: string
    }
  | {
      ok: false
      error:
        | "ai_unconfigured"
        | "ai_call_failed"
        | "no_h1_in_output"
        | "body_too_short"
      debug?: string
    }

function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  return new Anthropic({ apiKey: key })
}

/**
 * Sunday = the Weekly Essay slot (docs/runbooks/cowork-daily-blog-prompt.md §
 * day types: Mon–Sat 1,400–1,600 words; Sunday 2,200–2,800, deeper argument).
 * Cowork honours this on Mac-on days; the backup-writer never did — it always
 * wrote a daily-length piece, which is why long-form stopped appearing on the
 * Mac-off days that have become the norm. forDate is an Amsterdam-local
 * YYYY-MM-DD; anchor at midday UTC so the weekday can't slip either way.
 */
function isSunday(forDate: string): boolean {
  const d = new Date(`${forDate}T12:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.getUTCDay() === 0
}

/**
 * The last few published Dispatches, reduced to the things that repeat: the
 * title, the opening line, every H2, and the closing line. Injected into the
 * prompt as an EXCLUSION set.
 *
 * The corpus audit found the pipeline had no memory of itself, so coined
 * phrases recurred as if fresh — one was promoted to a heading three weeks
 * after it closed another piece — and two articles dated a day apart opened
 * with the same sentence, one noun swapped. A signature phrase is an asset the
 * first time and a tell the second.
 *
 * Reads the deployed content directory (same access pattern as
 * reprocess-ready.ts). Fails OPEN: any error returns "" and the writer runs
 * exactly as before, because a missed exclusion set is far cheaper than a
 * missed Dispatch.
 */
async function recentPublishedContext(limit = 5): Promise<string> {
  try {
    const dir = path.join(process.cwd(), "content", "blog")
    const names = (await fs.readdir(dir)).filter((f) => f.endsWith(".mdx"))
    const posts: { date: string; title: string; open: string; heads: string[]; close: string }[] = []

    for (const name of names) {
      const raw = await fs.readFile(path.join(dir, name), "utf8")
      const date = raw.match(/^date:\s*"?([0-9]{4}-[0-9]{2}-[0-9]{2})/m)?.[1] ?? ""
      const title = raw.match(/^title:\s*"(.+?)"\s*$/m)?.[1] ?? name.replace(/\.mdx$/, "")
      if (!date) continue
      const body = raw.replace(/^---\n[\s\S]*?\n---\n/, "")
      const prose = body
        .split("\n")
        .filter((l) => l.trim() && !/^[#>|`\-*!]/.test(l.trim()))
      const heads = (body.match(/^##\s+(.+)$/gm) ?? []).map((h) =>
        h.replace(/^##\s+/, "").trim(),
      )
      posts.push({
        date,
        title,
        open: (prose[0] ?? "").slice(0, 160),
        heads: heads.slice(0, 8),
        close: (prose[prose.length - 1] ?? "").slice(-160),
      })
    }

    const recent = posts.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit)
    if (recent.length === 0) return ""

    const lines = recent.map(
      (p) =>
        `- ${p.date} "${p.title}"\n    opened: ${p.open}\n    headings: ${p.heads.join(" | ") || "(none)"}\n    closed: ${p.close}`,
    )
    return `DO NOT REPEAT YOURSELF. These are the last ${recent.length} Dispatches published:

${lines.join("\n")}

Hard constraints against that list: do not reuse any heading, any coined noun-phrase from a heading, any opening move, or any closing move. Do not reuse a framing device one of them already used. If your draft's shape resembles one of these, change the shape, not the wording.`
  } catch {
    return ""
  }
}

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, 8)
    .join("-")
}

export async function aiBackupWriter(
  input: BackupWriterInput,
): Promise<BackupWriterResult> {
  const client = getClient()
  if (!client) return { ok: false, error: "ai_unconfigured" }

  const model = process.env.STUDIO_AI_MODEL || DEFAULT_MODEL

  const rotationIndex = input.dayOfYear % ROTATION_DOMAINS.length
  const rotationDomain = ROTATION_DOMAINS[rotationIndex]
  // 7 lenses against 12 domains (coprime) so a domain meets a different
  // vantage point on every visit instead of defaulting to "institution
  // announces thing" every time.
  const lens = ROTATION_LENSES[input.dayOfYear % ROTATION_LENSES.length]
  const exclusions = await recentPublishedContext()

  const briefBlock = input.brief.trim()
    ? `Tarry has filed a brief for today. Use this as the primary frame, topic, links, and angle — it overrides the rotation. Treat it as if Tarry hand-wrote today's prompt:

BRIEF:
${input.brief.trim()}`
    : `No brief was filed. Run today's article on the default domain rotation. Today's domain (day_of_year ${input.dayOfYear} mod 12 = ${rotationIndex}):

${rotationDomain}

Today's LENS — write from this vantage point, not from the institution's: ${lens}. Anchor the piece on what this person can see, decide, or is stuck with. An announcement is the occasion for the piece, never its subject.

Pick a specific angle inside that domain from the last 45 days, and pick one no wire service already ran. If your angle is the same one the press release had, you have the occasion, not the story — go one layer down to the consequence.`

  const sunday = isSunday(input.forDate)
  const dayTypeBlock = sunday
    ? `Today is SUNDAY — this is the Weekly Essay slot, not a Daily Blog. Write 2,200–2,800 words. Go deeper than a daily: more historical framing, a longer arc, a stance you take and then defend against the strongest counter-argument you can find. Up to TWO Mermaid diagrams are allowed today (still only where they carry structure the prose cannot).`
    : `Today is a weekday — this is a Daily Blog. Write 1,400–1,600 words. At most ONE Mermaid diagram, and often zero: a diagram is not a default.`

  const userPrompt = `Today's date is ${input.forDate} (Europe/Amsterdam).

${dayTypeBlock}

${briefBlock}
${exclusions ? `\n${exclusions}\n` : ""}
Before drafting, name the structural form you are using (single-thread narrative with no headings, an annotated read of one document, a numbered ledger, a reported scene, or a standard essay) and then commit to it. Do not reuse the form any of the recent pieces above used. Roughly two pieces in ten should carry no H2 headings at all — if this is one, write it as continuous prose.

Write the article now. Use web_search to ground every factual claim, at least 6 distinct primary sources cited as inline markdown links. Honour all voice + format rules from the system prompt, especially ZERO em-dashes anywhere including the title and excerpt, the MATHEMATICAL form for numbers (62%, $700 million, 2.5x, never spelled out), and the closing rules. The first line of your output MUST be \`# <title>\` (a single H1). The last block must be the exact author bio footer specified.`

  let response: Anthropic.Messages.Message
  try {
    // Adaptive extended thinking — ON here because this is the
    // first-time generator: it writes a full 1,400–1,600-word Dispatch
    // from scratch, which is exactly where deep reasoning earns its
    // keep (per the principle: thinking for first drafts, not for the
    // editor's incremental continue/rewrite/frontmatter fixes).
    //
    // Thinking config is model-family-specific — and getting it wrong is
    // a HARD 400, not a soft degrade. Adaptive thinking
    // (`thinking:{type:"adaptive"}` + `output_config.effort`) exists only
    // on Opus 4.6+/Fable/Mythos. Sending it to Sonnet/Haiku returns
    // `400 invalid_request_error: "adaptive thinking is not supported on
    // this model"` — which is exactly what silently killed the daily
    // Dispatch: the default model here is claude-sonnet-4-5 (cost
    // control), so the backup-writer 502'd on EVERY morning tick from
    // 2026-06-24, the filed brief never got written, and no email ever
    // fired. Sonnet/Haiku use classic extended thinking
    // (`{type:"enabled", budget_tokens}`), which they DO support, so we
    // still get deep reasoning for the from-scratch write. @anthropic-ai/sdk
    // 0.79 doesn't type these fields yet but forwards them at runtime, so
    // we cast the params.
    const supportsAdaptiveThinking =
      /^claude-(?:opus-4-[678]|fable-5|mythos-(?:5|preview))/.test(model)
    const thinkingConfig = supportsAdaptiveThinking
      ? { thinking: { type: "adaptive" }, output_config: { effort: "high" } }
      : { thinking: { type: "enabled", budget_tokens: 8000 } }
    const createParams = {
      model,
      max_tokens: DEFAULT_MAX_TOKENS,
      ...thinkingConfig,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 8,
        },
      ],
      system: VOICE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    } as unknown as Parameters<typeof client.messages.create>[0]
    response = (await client.messages.create(createParams)) as Anthropic.Messages.Message
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(
      JSON.stringify({ tag: "studio.backup_writer.ai_error", error: message }),
    )
    return {
      ok: false,
      error: "ai_call_failed",
      // Always surface the real API message (truncated) — it flows into the
      // write-failure alert email so the error is actionable without needing
      // STUDIO_AI_DEBUG set. (Had this been on, the adaptive-thinking 400
      // would have been named in an alert on day one, not found a week later.)
      debug: message.slice(0, 400),
    }
  }

  // Collect every text block in the response. With web_search, the
  // response is a sequence of (tool_use → tool_result → text) turns
  // and the final article text lives in the trailing text block(s).
  const textParts: string[] = []
  for (const block of response.content) {
    if (block.type === "text") textParts.push(block.text)
  }
  // Join with "" — NOT "\n\n". With web_search + citations the model's prose
  // arrives as MANY text blocks: every cited span is its own block, split
  // mid-sentence at the citation boundary. Joining with a blank line therefore
  // injected a paragraph break inside sentences, which is what produced the
  // published corruption — orphaned full stops starting a paragraph
  // (". Three months later,"), mid-sentence gaps, and split fenced blocks.
  // The blocks are a continuous stream; the model's own text already carries
  // whatever paragraph breaks it wants.
  const fullText = textParts.join("").trim()

  if (!fullText) {
    return {
      ok: false,
      error: "ai_call_failed",
      debug: "Empty response text from model",
    }
  }

  // Extract H1 title from first line.
  const h1Match = fullText.match(/^#\s+(.+?)\s*$/m)
  if (!h1Match) {
    return {
      ok: false,
      error: "no_h1_in_output",
      debug: process.env.STUDIO_AI_DEBUG === "1" ? fullText.slice(0, 400) : undefined,
    }
  }
  const title = h1Match[1].trim()
  const slug = slugFromTitle(title)

  // Body = everything (the H1 stays in for the existing parser).
  const wordCount = fullText.split(/\s+/).filter(Boolean).length

  // Post-generation slop gate. Deliberately NON-BLOCKING: it logs what the
  // draft tripped so regressions are visible in the Vercel logs (and so the
  // weekly slop-watch has a signal), but never fails the Dispatch — shipping a
  // piece with one tell beats shipping nothing. The exact banned strings live
  // in dispatch-slop.ts precisely so they never appear in the prompt, where
  // quoting them is what taught the model to use them in the first place.
  try {
    const hits = scanDispatchSlop(fullText)
    console.log(
      JSON.stringify({
        tag: "studio.backup_writer.slop_scan",
        slug: slugFromTitle(h1Match[1].trim()),
        hits: hits.length,
        hard: hits.filter((h) => h.severity === "hard").length,
        summary: summariseSlop(hits),
        worst: hits.filter((h) => h.severity === "hard").slice(0, 3).map((h) => h.match),
      }),
    )
  } catch {
    /* scanning must never break the publish path */
  }
  if (wordCount < 800) {
    return {
      ok: false,
      error: "body_too_short",
      debug: `Got ${wordCount} words`,
    }
  }

  // Count citation links as a proxy for source count.
  const citationLinks = fullText.match(/\]\(https?:\/\/[^\s)]+\)/g) ?? []

  return {
    ok: true,
    title,
    slug,
    body: fullText,
    sourcesUsed: citationLinks.length,
    modelUsed: model,
  }
}
