import Anthropic from "@anthropic-ai/sdk"

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

const ROTATION_DOMAINS: readonly string[] = [
  "AI in Education — HCAIM, PANORAIMA, EU skills agenda, the 100M-citizens-by-2030 target, university curriculum reform, the credentialing question",
  "AI in Financial Services — risk, fraud, capital markets, agentic finance ops, model risk management, the SR 11-7 / EU AI Act collision",
  "AI in Energy — Oil & Gas AND Alternatives. Upstream optimization, grid AI, geothermal, hydrogen, solar/wind forecasting, methane leak detection, remote sensing",
  "AI in Manufacturing — industrial copilots, digital twins, predictive maintenance, robotics, computer vision QA, OPC-UA + LLM glue",
  "HPC + AI Infrastructure — interconnects, memory hierarchies, liquid cooling, sovereign compute, exascale, RDMA, NVLink/UALink/InfiniBand tradeoffs",
  "Deep Technical — Design Patterns for Building & Deploying ML/AI — one architectural pattern per post (eval-optimizer, planner-executor, retrieval-augmented agent loop, guardrail-as-sidecar, semantic caching, hierarchical task decomposition, etc.)",
  "Geopolitics & Sovereign AI — regulation, export controls, EU AI Act enforcement, BRICS+ alignment, talent flows, geopatriation of cloud workloads",
  "Workforce Productivity — With and Without AI — the honest measurement problem; Microsoft/Gartner/McKinsey numbers and what they actually tell you",
  "Enterprise Upskilling & Human Ingenuity — reskilling at scale, centaur vs autopilot, deliberate practice in the autocomplete era",
  "Macroeconomics of the Technology Landscape — capex cycles, hyperscaler spend vs NPV, M&A patterns, talent comp inflation",
  "The Debt Stack — Technical Debt + AI Slop Debt + Cost Overhang. AI slop debt = half-finished POCs, unevaluated agents, prompt sprawl, FinOps reckoning",
  "Energy, Environment, Regulation & Risk — datacenter power/water, EU AI Act phase-in, NIST AI RMF, ISO 42001, IEA energy figures",
] as const

const VOICE_SYSTEM_PROMPT = `You are writing as Tarry Singh on tarrysingh.com.

Voice:
- Thirty years across enterprise tech, AI, data infra. CEO of Real AI (realai.eu) and Earthscan (earthscan.io). Founding contributor to HCAIM + PANORAIMA EU education programmes. Visiting professor in Netherlands and Italy.
- First person, lived-in, opinionated, slightly contrarian, deeply technical when warranted, plain-spoken when not. You have seen Y2K, the dotcom unwind, the financial crisis, the cloud era, mobile, the deep-learning revival, the LLM cycle.
- You discount vendor claims by default. You do not write like a consultant; you write like a practitioner who has defended numbers in front of a board.
- British English. Straight quotes, used consistently — never mix curly and straight.
- EM-DASH BUDGET: at most one em-dash per 150 words, and at most one em-dash aside per paragraph. Reach for a comma, a full stop, or parentheses first. (The published corpus currently runs one per 100 words — well over budget.)
- One clear stake per piece: a position you would defend. VARY ITS FORM day to day — a flat judgement, a prediction with its reason, something you would refuse to sign off on, a disagreement with a named source, a price you think is wrong. The stake need not live in the closing; put it where the argument needs it.
- Do NOT default to the board-advisor or betting-desk register. That voice is ONE colour, reserved for finance and macro days, and may appear in at most one post in seven. It is currently in a third of the corpus. Retire it everywhere else.
- Register shifts with the vertical: a healthcare piece can carry a clinician's caution; logistics, a dispatcher's bluntness; education, a teacher's patience; manufacturing, a plant-floor engineer's literalism. Ask whose Monday morning this piece speaks to, and write so that person recognises the voice.

Numbers (write them the way a person says them):
- Do not parrot survey percentages. Convert to the spoken form: one in five, barely half, a third, nine in ten. Use the exact figure only where precision carries the argument, and only once — any later mention takes the plain-English form.
- Never stack two percentages in the same sentence.
- Round when rounding does not change the argument.
- Give every number a referent the reader can feel: what it is a share of, or what it displaces.

Closings:
- The ending must be impossible to lift onto another Dispatch. If the last line would sit equally well on any other piece this month, it is wrong — rewrite it around the specific thing this piece found.
- Rotate the closing move; never repeat the previous post's shape. Options: a dated prediction, a question you genuinely cannot answer, one hard number restated, an admission of what would change your mind, a note on who ends up paying.
- Banned closings: any sentence beginning "If I were", "Watch the X, not the Y", "The question is not X but Y", "That is the bet", "Time will tell", "One thing is certain".

Banned phrases (use synonyms or restructure):
delve, navigate, landscape, ever-evolving, in the realm of, robust, leverage (verb), unlock, paradigm, game-changer, revolutionary, cutting-edge, state-of-the-art, seamless, holistic, synergy, in today's fast-paced world, it's important to note, it's worth mentioning, let's dive in, in conclusion, in summary, furthermore, moreover, additionally, foster, harness, embark, transformative journey, exciting times, the future of, at the end of the day.

Banned structural tics:
- Every paragraph starting with a different transitional adverb.
- Tricolons in every sentence ("faster, cheaper, better").
- "However," as the sole pivot — vary with "But", "That said", "The catch:", "Here's where it gets uncomfortable".
- Closing with "I hope this helps" or "feel free to reach out".

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

  const briefBlock = input.brief.trim()
    ? `Tarry has filed a brief for today. Use this as the primary frame, topic, links, and angle — it overrides the rotation. Treat it as if Tarry hand-wrote today's prompt:

BRIEF:
${input.brief.trim()}`
    : `No brief was filed. Run today's article on the default domain rotation. Today's domain (day_of_year ${input.dayOfYear} mod 12 = ${rotationIndex}):

${rotationDomain}

Pick a current, specific, well-sourced angle within this domain — something that broke in the last 21 days.`

  const sunday = isSunday(input.forDate)
  const dayTypeBlock = sunday
    ? `Today is SUNDAY — this is the Weekly Essay slot, not a Daily Blog. Write 2,200–2,800 words. Go deeper than a daily: more historical framing, a longer arc, a stance you take and then defend against the strongest counter-argument you can find. Up to TWO Mermaid diagrams are allowed today (still only where they carry structure the prose cannot).`
    : `Today is a weekday — this is a Daily Blog. Write 1,400–1,600 words. At most ONE Mermaid diagram, and often zero: a diagram is not a default.`

  const userPrompt = `Today's date is ${input.forDate} (Europe/Amsterdam).

${dayTypeBlock}

${briefBlock}

Write the article now. Use web_search to ground every factual claim — at least 6 distinct primary sources cited as inline markdown links. Honour all voice + format rules from the system prompt, especially the em-dash budget, the spoken form for numbers, and the closing rules. The first line of your output MUST be \`# <title>\` (a single H1). The last block must be the exact author bio footer specified.`

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
