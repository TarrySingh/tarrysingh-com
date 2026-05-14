import Anthropic from "@anthropic-ai/sdk"

/**
 * Thin wrapper around the Anthropic SDK for the Studio Editor's
 * Continue / Rewrite buttons.
 *
 * Defaults:
 *   - Model:           claude-opus-4-5-20250929 (override via STUDIO_AI_MODEL)
 *   - Thinking budget: 4000 tokens (override via STUDIO_AI_THINKING_TOKENS)
 *   - Max output:      2048 tokens (override via STUDIO_AI_MAX_TOKENS)
 *
 * The system prompt encodes the studio voice — Plex Serif body,
 * IBM Plex Mono small-caps, Gloock display headings, McKinsey-cold
 * meets scientific-illustration-honest. British English. One italic
 * close per page. No SaaS slop. No surveillance vocabulary.
 */

// SDK 0.79.0 supports: claude-opus-4-6, claude-opus-4-5, claude-opus-4-5-20251101,
// claude-opus-4-1, claude-opus-4-1-20250805, plus the sonnet/haiku tiers. The
// SDK's Model type also accepts `(string & {})`, so newer model IDs work too —
// override via STUDIO_AI_MODEL when a fresher Opus ships.
const DEFAULT_MODEL = "claude-opus-4-6"
const DEFAULT_THINKING_TOKENS = 4000
const DEFAULT_MAX_TOKENS = 2048

const STUDIO_SYSTEM_PROMPT = `You are an editorial assistant writing in the voice of Tarry Singh's Dispatches on tarrysingh.com.

Voice rules (non-negotiable):

  - Plex Serif body, Gloock display headings, IBM Plex Mono small-caps for labels.
  - McKinsey-cold meets scientific-illustration-honest. Never both clinical and dry.
  - British English: -ise / -our / -re / -our (organise, colour, centre, behaviour, modelling, analyse).
  - Never use SaaS-marketing slop: leverage, ideate, unlock, seamless, supercharge, revolutionary, game-changing, best-in-class, world-class, thought leader, synergy.
  - Never use surveillance vocabulary or hedge-talk (very unique, really really).
  - One italic close per page — the final paragraph should carry a single italicised phrase.
  - No emoji.
  - First paragraph carries the whole argument. A reader who never scrolls past should still know the claim.
  - Plates and figures are working drawings, not posters. Honest about projections vs measurements.

Format rules:

  - Output Markdown only. No HTML, no YAML, no commentary about what you wrote.
  - Use ## for section headings, ### for sub-sections.
  - Em dashes (—) not double hyphens.
  - Smart quotes ('') not straight quotes ('').
  - Match the surrounding rhythm: if the existing prose runs in short paragraphs, keep paragraphs short.`

interface ContinueInput {
  fullDocument: string
  beforeCursor: string
  afterCursor: string
}

interface RewriteInput {
  selection: string
  instruction?: string
  surroundingContext: string
}

interface FrontmatterInput {
  title: string
  body: string
}

interface HeroPromptInput {
  title: string
  excerpt?: string
  category?: "Essays" | "Notes" | "Studio"
}

interface AIResult {
  ok: true
  output: string
  thinking?: string
  inputTokens: number
  outputTokens: number
}

export interface AIFrontmatterSuggestion {
  category: "Essays" | "Notes" | "Studio"
  excerpt: string
  tags: string[]
}

interface AIFrontmatterResult {
  ok: true
  suggestion: AIFrontmatterSuggestion
  thinking?: string
  inputTokens: number
  outputTokens: number
}

interface AIHeroPromptResult {
  ok: true
  prompt: string
  thinking?: string
  inputTokens: number
  outputTokens: number
}

interface AIError {
  ok: false
  error: string
  /** Raw upstream error message — surfaced when STUDIO_AI_DEBUG=1 so
   *  UAT can see exactly what Anthropic rejected. Off by default. */
  debug?: string
  /** The model id we actually sent to the API (helps confirm the env
   *  var override is taking effect). Surfaced when STUDIO_AI_DEBUG=1. */
  modelUsed?: string
}

function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  return new Anthropic({ apiKey: key })
}

function modelConfig() {
  return {
    model: process.env.STUDIO_AI_MODEL || DEFAULT_MODEL,
    thinkingTokens: Number(process.env.STUDIO_AI_THINKING_TOKENS) || DEFAULT_THINKING_TOKENS,
    maxTokens: Number(process.env.STUDIO_AI_MAX_TOKENS) || DEFAULT_MAX_TOKENS,
  }
}

export async function aiContinue(
  input: ContinueInput,
): Promise<AIResult | AIError> {
  const client = getClient()
  if (!client) return { ok: false, error: "ai_unconfigured" }

  const { model, thinkingTokens, maxTokens } = modelConfig()

  const userPrompt = `Continue the Dispatch from where the cursor is.

Existing text BEFORE the cursor:

${input.beforeCursor}

[CURSOR HERE]

${input.afterCursor || "(end of document)"}

Continue from the cursor. Write 1–3 paragraphs that pick up the prose naturally. Stop when the thought is complete — don't pad. Match the voice of the existing text exactly.

Return Markdown only.`

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: maxTokens + thinkingTokens,
      thinking: { type: "enabled", budget_tokens: thinkingTokens },
      system: STUDIO_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    })
    return extractResult(msg)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ tag: "studio.ai.continue_error", model, error: message }))
    const debug = process.env.STUDIO_AI_DEBUG === "1"
    return {
      ok: false,
      error: "ai_call_failed",
      ...(debug ? { debug: message, modelUsed: model } : {}),
    } as AIError
  }
}

export async function aiRewrite(
  input: RewriteInput,
): Promise<AIResult | AIError> {
  const client = getClient()
  if (!client) return { ok: false, error: "ai_unconfigured" }

  const { model, thinkingTokens, maxTokens } = modelConfig()

  const instruction = input.instruction?.trim() || "Tighten the prose; preserve the meaning; keep the voice."

  const userPrompt = `Rewrite the selected passage in the studio voice.

Surrounding context (do NOT rewrite this — it's here for tone reference):

${input.surroundingContext}

SELECTION TO REWRITE:

${input.selection}

Instruction: ${instruction}

Return only the rewritten passage in Markdown. Do not echo the original. Do not add commentary. Do not include the surrounding context.`

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: maxTokens + thinkingTokens,
      thinking: { type: "enabled", budget_tokens: thinkingTokens },
      system: STUDIO_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    })
    return extractResult(msg)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ tag: "studio.ai.rewrite_error", model, error: message }))
    const debug = process.env.STUDIO_AI_DEBUG === "1"
    return {
      ok: false,
      error: "ai_call_failed",
      ...(debug ? { debug: message, modelUsed: model } : {}),
    } as AIError
  }
}

/**
 * Suggest `{category, excerpt, tags}` from a Dispatch's `{title, body}`.
 *
 * Used by the Studio Editor's "Suggest" buttons in FrontmatterForm —
 * removes the most-skipped step in publishing (Sprint 4.1 in the
 * roadmap; see `docs/reports/sprint-4-plus-roadmap.md`).
 *
 * Returns Markdown-free strings; the route handler is responsible
 * for client-side display. Tags are lowercase dash-separated phrases.
 * Category is one of the three Dispatch categories.
 *
 * Token budget: 1500 thinking, 512 output (tighter than continue/rewrite).
 */
export async function aiFrontmatter(
  input: FrontmatterInput,
): Promise<AIFrontmatterResult | AIError> {
  const client = getClient()
  if (!client) return { ok: false, error: "ai_unconfigured" }

  const { model } = modelConfig()
  const thinkingTokens = Math.min(
    Number(process.env.STUDIO_AI_THINKING_TOKENS) || DEFAULT_THINKING_TOKENS,
    1500,
  )
  const maxTokens = 512

  const userPrompt = `Read this Dispatch and propose its frontmatter.

TITLE: ${input.title || "(untitled)"}

BODY:

${input.body}

Return STRICT JSON only — no prose, no markdown fences. The shape is:

{
  "category": "Essays" | "Notes" | "Studio",
  "excerpt": "80–300 character editorial pull-quote that reads as the studio's own voice. Plex-Serif rhythm. No SaaS slop. One italic close is allowed but not required.",
  "tags": ["lowercase-dash-separated", "..."] // 3–5 tags, drawn from the body's actual subject matter
}

Category guidance:
  - "Essays" = long-form argumentative prose; carries a thesis.
  - "Notes" = working notes from the studio; smaller scale, more observational.
  - "Studio" = process / craft / tool reflections; how the work gets made.

Return JSON only. No code fences. No preamble.`

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: maxTokens + thinkingTokens,
      thinking: { type: "enabled", budget_tokens: thinkingTokens },
      system: STUDIO_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    })
    const textBlocks = msg.content.filter(
      (b): b is Anthropic.Messages.TextBlock => b.type === "text",
    )
    const thinkingBlocks = msg.content.filter(
      (b): b is Anthropic.Messages.ThinkingBlock => b.type === "thinking",
    )
    const raw = textBlocks.map((b) => b.text).join("\n").trim()
    const suggestion = parseFrontmatterJSON(raw)
    if (!suggestion) {
      console.error(
        JSON.stringify({
          tag: "studio.ai.frontmatter_parse_error",
          model,
          raw: raw.slice(0, 500),
        }),
      )
      const debug = process.env.STUDIO_AI_DEBUG === "1"
      return {
        ok: false,
        error: "ai_frontmatter_parse_error",
        ...(debug ? { debug: raw.slice(0, 500), modelUsed: model } : {}),
      } as AIError
    }
    return {
      ok: true,
      suggestion,
      thinking: thinkingBlocks.map((b) => b.thinking).join("\n").trim() || undefined,
      inputTokens: msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ tag: "studio.ai.frontmatter_error", model, error: message }))
    const debug = process.env.STUDIO_AI_DEBUG === "1"
    return {
      ok: false,
      error: "ai_call_failed",
      ...(debug ? { debug: message, modelUsed: model } : {}),
    } as AIError
  }
}

/**
 * Synthesise an image-generation prompt for a Dispatch hero image
 * (Sprint 5). Output is a 60–100 word natural-language prompt
 * targeting an editorial-illustration image-gen model (FLUX.1 or SDXL).
 *
 * Constraints baked into the prompt instruction:
 *   - studio palette (cream paper, midnight indigo, copper)
 *   - editorial-illustration register (NOT photoreal, NOT SaaS gradients,
 *     NOT pixar-cute, NOT stock-photo cliches)
 *   - 16:9 aspect, hero-image framing
 *   - no human faces (avoids the photoreal-human uncanny valley)
 *
 * Token budget: 1500 thinking, 256 output — short, focused.
 */
export async function aiHeroPrompt(
  input: HeroPromptInput,
): Promise<AIHeroPromptResult | AIError> {
  const client = getClient()
  if (!client) return { ok: false, error: "ai_unconfigured" }

  const { model } = modelConfig()
  const thinkingTokens = Math.min(
    Number(process.env.STUDIO_AI_THINKING_TOKENS) || DEFAULT_THINKING_TOKENS,
    1500,
  )
  const maxTokens = 256

  const heroSystem = `You are an art director writing an image-generation prompt for the hero image of a Tarry Singh Dispatch on tarrysingh.com.

VISUAL VOICE (non-negotiable):

  - Studio palette only: cream paper (#fbf7ec), midnight indigo (#0d1b3d), copper accent (#b45309), occasional warm gold and rose. No teal-blue corporate gradients, no neon, no rainbows.
  - Editorial illustration register: think McKinsey commissioned-illustration, scientific working-drawing, NYT op-ed cartouche. Hatching, line weight variation, restrained palette.
  - NO photoreal humans. NO photoreal anything. NO Pixar-cute. NO stock-photo cliches (suits, handshakes, lightbulbs, gears). NO SaaS-marketing aesthetics.
  - NO text in the image. NO captions. NO labels. (The post template adds the title separately.)
  - Aspect ratio: 16:9 hero composition. Subject central; framing leaves a quiet zone in the upper-left or upper-right where a title could float.
  - Honest about the subject — if the Dispatch argues something specific, the image carries that argument visually, not generically.

OUTPUT FORMAT:

  - A single 60–100 word natural-language image-gen prompt in plain text. No quotes. No preamble. No "Here is the prompt:". No mention of word count or aspect ratio in the output (the gen call handles those separately).
  - Begin with the subject + medium + light, then add palette, register, and one specific compositional detail.
  - End with negative-prompt-style exclusions ONLY if essential.`

  const userPrompt = `Compose a hero-image prompt for this Dispatch:

TITLE: ${input.title || "(untitled)"}
EXCERPT: ${input.excerpt || "(no excerpt yet)"}
CATEGORY: ${input.category || "Notes"}

Return only the image-gen prompt. Plain text. No commentary.`

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: maxTokens + thinkingTokens,
      thinking: { type: "enabled", budget_tokens: thinkingTokens },
      system: heroSystem,
      messages: [{ role: "user", content: userPrompt }],
    })
    const textBlocks = msg.content.filter(
      (b): b is Anthropic.Messages.TextBlock => b.type === "text",
    )
    const thinkingBlocks = msg.content.filter(
      (b): b is Anthropic.Messages.ThinkingBlock => b.type === "thinking",
    )
    const prompt = textBlocks.map((b) => b.text).join("\n").trim()
    if (!prompt) {
      return { ok: false, error: "ai_empty_prompt" }
    }
    return {
      ok: true,
      prompt,
      thinking: thinkingBlocks.map((b) => b.thinking).join("\n").trim() || undefined,
      inputTokens: msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ tag: "studio.ai.hero_prompt_error", model, error: message }))
    const debug = process.env.STUDIO_AI_DEBUG === "1"
    return {
      ok: false,
      error: "ai_call_failed",
      ...(debug ? { debug: message, modelUsed: model } : {}),
    } as AIError
  }
}

/**
 * Parse the model's JSON reply defensively. Strips code fences if present,
 * validates required keys + types + value domains. Returns null on any
 * shape mismatch — the route handler surfaces `ai_frontmatter_parse_error`.
 */
function parseFrontmatterJSON(raw: string): AIFrontmatterSuggestion | null {
  let trimmed = raw.trim()
  // Strip ```json ... ``` or ``` ... ``` wrappers if the model adds them.
  if (trimmed.startsWith("```")) {
    trimmed = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim()
  }
  // Some models add a preamble or trailing prose around the JSON. Find
  // the first { … last } and parse that.
  const first = trimmed.indexOf("{")
  const last = trimmed.lastIndexOf("}")
  if (first === -1 || last === -1 || last <= first) return null
  const jsonSlice = trimmed.slice(first, last + 1)
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonSlice)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== "object") return null
  const p = parsed as Record<string, unknown>
  const category = p.category
  const excerpt = p.excerpt
  const tags = p.tags
  if (
    category !== "Essays" &&
    category !== "Notes" &&
    category !== "Studio"
  ) {
    return null
  }
  if (typeof excerpt !== "string" || excerpt.length < 20) return null
  if (!Array.isArray(tags)) return null
  const tagsClean = tags
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    .slice(0, 5)
  return {
    category,
    excerpt: excerpt.trim(),
    tags: tagsClean,
  }
}

function extractResult(msg: Anthropic.Messages.Message): AIResult {
  const textBlocks = msg.content.filter(
    (b): b is Anthropic.Messages.TextBlock => b.type === "text",
  )
  const thinkingBlocks = msg.content.filter(
    (b): b is Anthropic.Messages.ThinkingBlock => b.type === "thinking",
  )
  return {
    ok: true,
    output: textBlocks.map((b) => b.text).join("\n").trim(),
    thinking: thinkingBlocks.map((b) => b.thinking).join("\n").trim() || undefined,
    inputTokens: msg.usage.input_tokens,
    outputTokens: msg.usage.output_tokens,
  }
}
