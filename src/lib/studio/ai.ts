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

interface AIResult {
  ok: true
  output: string
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
