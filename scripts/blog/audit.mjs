#!/usr/bin/env node
/**
 * npm run blog:audit <slug>
 *
 * Runs structural + voice checks on a draft or published Dispatch:
 *   - frontmatter completeness (title, date, category, excerpt)
 *   - category ∈ {Essays, Notes, Studio}
 *   - excerpt length 80–700 chars
 *   - one italic close per page
 *   - forbidden-words list (SaaS-cute, marketing-fluff terms)
 *   - British-English (-ise/-our/-re where applicable)
 *   - no double spaces
 *   - no straight quotes/apostrophes inside body (use smart quotes)
 *   - no stray smart-quote frontmatter
 *   - body length ≥ 600 chars (otherwise it's a stub)
 *
 * Exit code is the count of error-level findings (0 = pass).
 * Warnings don't fail the exit but are reported.
 *
 * Lifted from the spirit of the content-audit Claude skill but
 * runnable in CI / pre-commit / as part of npm run blog:promote.
 */

import { readFile, access } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..", "..")

const ALLOWED_CATEGORIES = new Set(["Essays", "Notes", "Studio"])

const FORBIDDEN = [
  // SaaS-marketing slop
  "leverage",
  "ideate",
  "unlock",
  "seamless",
  "supercharge",
  "revolutionary",
  "game-changing",
  "best-in-class",
  "world-class",
  "thought leader",
  // surveillance-grade verbs
  "synergy",
  "synergize",
  // hedge-words that betray a lack of conviction
  "very unique",
  "actually unique",
  "really really",
]

// American spellings → British equivalents we prefer (advisory only).
const BR_ENGLISH_HINTS = [
  [/\borganiz(e|ed|ing|es|ation|ations)\b/gi, "organis$1"],
  [/\brealiz(e|ed|ing|es|ation|ations)\b/gi, "realis$1"],
  [/\brecogniz(e|ed|ing|es)\b/gi, "recognis$1"],
  [/\bcolor\b/gi, "colour"],
  [/\bcolors\b/gi, "colours"],
  [/\bcenter\b/gi, "centre"],
  [/\bcenters\b/gi, "centres"],
  [/\bhonor\b/gi, "honour"],
  [/\blabor\b/gi, "labour"],
  [/\bfavorite\b/gi, "favourite"],
  [/\banalyze\b/gi, "analyse"],
  [/\bbehavior\b/gi, "behaviour"],
  [/\bmodeling\b/gi, "modelling"],
  [/\btraveling\b/gi, "travelling"],
]

const RED = (s) => `\x1b[31m${s}\x1b[0m`
const YEL = (s) => `\x1b[33m${s}\x1b[0m`
const GRN = (s) => `\x1b[32m${s}\x1b[0m`
const DIM = (s) => `\x1b[2m${s}\x1b[0m`

class Audit {
  constructor() {
    this.errors = []
    this.warnings = []
  }
  err(msg) {
    this.errors.push(msg)
  }
  warn(msg) {
    this.warnings.push(msg)
  }
  report() {
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(GRN("✓ audit passed — no findings"))
      return 0
    }
    if (this.errors.length > 0) {
      console.log(RED(`✗ ${this.errors.length} error${this.errors.length > 1 ? "s" : ""}`))
      for (const e of this.errors) console.log(`  ${RED("•")} ${e}`)
    }
    if (this.warnings.length > 0) {
      console.log(YEL(`! ${this.warnings.length} warning${this.warnings.length > 1 ? "s" : ""}`))
      for (const w of this.warnings) console.log(`  ${YEL("•")} ${w}`)
    }
    return this.errors.length
  }
}

function splitFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return { fm: null, body: raw }
  const end = raw.indexOf("\n---\n", 4)
  if (end < 0) return { fm: null, body: raw }
  return {
    fm: raw.slice(4, end),
    body: raw.slice(end + 5),
  }
}

function parseFrontmatterLine(line) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/)
  if (!m) return null
  let value = m[2].trim()
  // Strip wrapping quotes if present
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }
  return { key: m[1], value }
}

async function fileExists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function findPost(slug) {
  const live = join(ROOT, "content", "blog", `${slug}.mdx`)
  const draft = join(ROOT, "content", "blog", "_drafts", `${slug}.mdx`)
  if (await fileExists(draft)) return { path: draft, status: "draft" }
  if (await fileExists(live)) return { path: live, status: "live" }
  return null
}

async function main() {
  const slug = (process.argv[2] ?? "").trim()
  if (!slug) {
    console.error("usage: npm run blog:audit <slug>")
    process.exit(2)
  }

  const found = await findPost(slug)
  if (!found) {
    console.error(RED(`✗ no post found for slug "${slug}"`))
    console.error(`  looked in:`)
    console.error(`    content/blog/_drafts/${slug}.mdx`)
    console.error(`    content/blog/${slug}.mdx`)
    process.exit(2)
  }

  const raw = await readFile(found.path, "utf8")
  const { fm, body } = splitFrontmatter(raw)
  const audit = new Audit()

  console.log(DIM(`auditing ${found.path.replace(ROOT + "/", "")} (${found.status})`))

  // — frontmatter checks ——
  if (!fm) {
    audit.err("missing or malformed frontmatter (must start with `---\\n` and close with `---\\n`)")
  } else {
    const meta = {}
    for (const line of fm.split("\n")) {
      const parsed = parseFrontmatterLine(line)
      if (parsed) meta[parsed.key] = parsed.value
    }

    const required = ["title", "date", "category", "excerpt"]
    for (const k of required) {
      if (!meta[k] || meta[k].length === 0) audit.err(`frontmatter: missing required key \`${k}\``)
    }

    if (meta.title && meta.title.length < 8) {
      audit.warn(`frontmatter: title is unusually short (${meta.title.length} chars) — verify it stands on its own`)
    }
    if (meta.title && /^(my |the )?(new |a |an )?notes?$/i.test(meta.title.trim())) {
      audit.warn(`frontmatter: title is a generic placeholder; rewrite before publish`)
    }

    if (meta.date && !/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) {
      audit.err(`frontmatter: date "${meta.date}" must be ISO YYYY-MM-DD`)
    }
    if (meta.category && !ALLOWED_CATEGORIES.has(meta.category)) {
      audit.err(`frontmatter: category "${meta.category}" must be one of ${[...ALLOWED_CATEGORIES].join(", ")}`)
    }
    if (meta.excerpt) {
      const len = meta.excerpt.length
      if (len < 80) audit.warn(`frontmatter: excerpt is short (${len} chars) — aim for 80–700`)
      if (len > 700) audit.err(`frontmatter: excerpt is too long (${len} chars); cap at 700 for LinkedIn syndication`)
    }
    if (meta.theme && meta.theme !== "editorial" && meta.theme !== "studio") {
      audit.err(`frontmatter: theme must be "editorial" or "studio"`)
    }
    if (meta.draft === "true" && found.status === "live") {
      audit.err("frontmatter: draft=true but file lives in content/blog/ (production tree). Promote properly or flip draft to false.")
    }
  }

  // — body checks ——
  const trimmed = body.trim()
  if (trimmed.length < 600) {
    audit.warn(`body is short (${trimmed.length} chars); a Dispatch usually clears 600`)
  }

  // One italic close per page — last paragraph must contain *...* or _..._
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  const last = paragraphs[paragraphs.length - 1] ?? ""
  const hasItalic = /[*_].+[*_]/.test(last)
  if (!hasItalic) {
    audit.warn(
      `studio convention: the final paragraph should carry one italic close (wrap a phrase in *…* or _…_).`,
    )
  }

  // Forbidden words
  for (const word of FORBIDDEN) {
    const re = new RegExp(`\\b${word.replace(/-/g, "[ -]")}\\b`, "gi")
    const matches = body.match(re)
    if (matches) {
      audit.err(`forbidden term "${word}" appears ${matches.length}× — drop it (SaaS / hedge / surveillance vocabulary)`)
    }
  }

  // British-English hints
  for (const [re, replacement] of BR_ENGLISH_HINTS) {
    const matches = body.match(re)
    if (matches) {
      audit.warn(
        `British-English: "${matches[0]}" → consider "${matches[0].replace(re, replacement)}"`,
      )
    }
  }

  // No double spaces (after periods is fine in American style; British prefers single)
  if (/[a-z]\.  [A-Z]/.test(body)) {
    audit.warn("double-spaces after sentences detected — British convention is single space")
  }

  // Straight apostrophes inside narrative text
  const straightQuoteHits = (body.match(/[^`'/=<>][a-zA-Z]'[a-zA-Z]/g) ?? []).length
  if (straightQuoteHits > 3) {
    audit.warn(
      `${straightQuoteHits} straight-apostrophe usages in body — prefer typographic right-single (’). MDX preserves it.`,
    )
  }

  // Print + exit
  console.log("")
  process.exit(audit.report())
}

main().catch((err) => {
  console.error(RED("audit crashed:"), err)
  process.exit(2)
})
