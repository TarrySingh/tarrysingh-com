#!/usr/bin/env node
/**
 * Sprint 5.5.1 — Bake an AI-personalised footer nudge card for a
 * Dispatch.
 *
 * Calls Claude Opus extended-thinking with the same studio voice
 * system prompt as the editor's AI Continue/Rewrite. The output is
 * a 60-90 word card that references the specific argument of the
 * piece and invites the reader to subscribe — without using a
 * single SaaS-marketing or tracking-vocabulary verb.
 *
 * Output goes to content/blog/_nudges/<slug>.md, which the blog
 * post template reads at build time and renders in a styled block
 * above the existing newsletter card.
 *
 * Usage:
 *   npm run blog:bake-nudge <slug>             # bake a card for one Dispatch
 *   npm run blog:bake-nudge -- --all           # bake cards for all Dispatches
 *   npm run blog:bake-nudge -- --all --force   # re-bake even where a card exists
 *
 * Env:
 *   ANTHROPIC_API_KEY                       (required)
 *   STUDIO_AI_MODEL=claude-sonnet-4-6         (optional)
 *   STUDIO_AI_THINKING_TOKENS=4000          (optional; clamped to 1500 here)
 *
 * Cost: ~one AI call per Dispatch, tiny token footprint. <$0.01.
 */

import { readdir, readFile, writeFile, mkdir, access } from "node:fs/promises"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import Anthropic from "@anthropic-ai/sdk"
import matter from "gray-matter"

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, "..", "..")
const CONTENT_DIR = join(REPO_ROOT, "content", "blog")
const NUDGES_DIR = join(CONTENT_DIR, "_nudges")

const MODEL = process.env.STUDIO_AI_MODEL || "claude-sonnet-4-6"
const THINKING_TOKENS = Math.min(
  Number(process.env.STUDIO_AI_THINKING_TOKENS) || 4000,
  1500,
)
const MAX_TOKENS = 300

const STUDIO_SYSTEM_PROMPT = `You are an editorial assistant writing in the voice of Tarry Singh's Dispatches on tarrysingh.com.

Voice rules (non-negotiable):
  - Plex Serif body, Gloock display headings.
  - McKinsey-cold meets scientific-illustration-honest. Never both clinical and dry.
  - British English: -ise / -our / -re (organise, colour, centre, behaviour, modelling, analyse).
  - Never use SaaS-marketing slop: leverage, ideate, unlock, seamless, supercharge, revolutionary, game-changing, best-in-class, world-class, thought leader, synergy.
  - Never use tracking-vocabulary: convert, optimise, acquire, capture, monetise.
  - One italic close per page — the final phrase or sentence in italics, nothing else.
  - No emoji.
  - Em dashes (—), smart quotes ('').
  - Honest about the work — no funnel performance.`

function userPromptFor(post) {
  return `Read this Dispatch and write a 60-90 word footer "nudge card" that earns the reader's subscription on the strength of the argument they just read.

TITLE: ${post.title}
${post.excerpt ? `\nEXCERPT: ${post.excerpt}\n` : ""}
BODY:

${post.body}

Constraints:

  - 60-90 words. Plex Serif rhythm. ONE italic close at the very end (no other italics).
  - First sentence must REFERENCE the specific argument of this piece, not a generic line. Name the actual claim.
  - Invite the reader to subscribe to "the next Dispatch" or "one quiet plate when it ships" — never "newsletter."
  - No SaaS slop. No tracking vocabulary.
  - Plain prose in Markdown. No headings.

Return only the card text. No commentary. No preamble.`
}

async function fileExists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function listSlugs() {
  const entries = await readdir(CONTENT_DIR)
  return entries
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => f.replace(/\.mdx$/, ""))
}

async function readPost(slug) {
  const raw = await readFile(join(CONTENT_DIR, `${slug}.mdx`), "utf8")
  const { data, content } = matter(raw)
  return {
    slug,
    title: data.title || slug,
    excerpt: data.excerpt || "",
    body: content,
  }
}

async function bake(slug, { force = false } = {}) {
  const out = join(NUDGES_DIR, `${slug}.md`)
  if (!force && (await fileExists(out))) {
    console.log(`  ↷ ${slug} — already baked (use --force to re-bake)`)
    return { ok: true, skipped: true }
  }

  const post = await readPost(slug)
  if (!post.body.trim()) {
    console.log(`  ✗ ${slug} — empty body, skipped`)
    return { ok: false, error: "empty_body" }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not set. Aborting.")
    process.exit(1)
  }
  const client = new Anthropic({ apiKey })

  const start = Date.now()
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS + THINKING_TOKENS,
      thinking: { type: "enabled", budget_tokens: THINKING_TOKENS },
      system: STUDIO_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPromptFor(post) }],
    })
    const textBlocks = msg.content.filter((b) => b.type === "text")
    const card = textBlocks
      .map((b) => b.text)
      .join("\n")
      .trim()
    if (!card) {
      console.log(`  ✗ ${slug} — empty card`)
      return { ok: false, error: "empty_card" }
    }
    await mkdir(NUDGES_DIR, { recursive: true })
    await writeFile(out, card + "\n", "utf8")
    const ms = Date.now() - start
    console.log(`  ✓ ${slug} — baked (${card.length} chars · ${(ms / 1000).toFixed(1)}s)`)
    return { ok: true, skipped: false }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.log(`  ✗ ${slug} — ${message}`)
    return { ok: false, error: message }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const force = args.includes("--force")
  const all = args.includes("--all")
  const slugs = all ? await listSlugs() : args.filter((a) => !a.startsWith("--"))

  if (slugs.length === 0) {
    console.log(
      "Usage:\n  npm run blog:bake-nudge <slug>\n  npm run blog:bake-nudge -- --all [--force]",
    )
    process.exit(0)
  }

  console.log(`Baking nudge cards for ${slugs.length} Dispatch(es)…`)
  let ok = 0
  let skipped = 0
  let failed = 0
  for (const slug of slugs) {
    const r = await bake(slug, { force })
    if (r.ok && r.skipped) skipped++
    else if (r.ok) ok++
    else failed++
  }
  console.log(`\nBaked: ${ok}  ·  Skipped: ${skipped}  ·  Failed: ${failed}`)
}

await main()
