/**
 * Sprint — auto-publish pipeline. Parsing helpers for the daily-
 * article ingestion route.
 *
 * Source articles arrive as raw Markdown with this convention:
 *
 *   2026-05-15_watts-not-weights-the-energy-story-reshaping-ai.md
 *
 *   # Title goes here
 *
 *   *By Tarry Singh — May 15, 2026*
 *
 *   First paragraph of body…
 *
 *   ## Section heading
 *
 *   …
 *
 * The parsing job is to:
 *   1. Derive a stable slug from the filename (strip the YYYY-MM-DD_ prefix).
 *   2. Extract the H1 → frontmatter.title; remove it from the body so the
 *      `/blog/<slug>` template doesn't double-render it.
 *   3. Strip the byline line (the template already shows author + date).
 *   4. Normalise the body: trim leading/trailing whitespace; collapse
 *      3+ consecutive blank lines to 2.
 *
 * Failure modes are returned as error codes (not exceptions) so the
 * route handler can render friendly 422s.
 */

import { SLUG_RE } from "./types"

export interface ParseInput {
  /** Source filename (with or without leading path components). */
  filename: string
  /** Raw .md content as a UTF-8 string. */
  content: string
}

export interface ParseResult {
  ok: true
  slug: string
  title: string
  /** Raw Markdown body with H1 + byline removed and whitespace normalised. */
  body: string
  /** Word count of the cleaned body — useful for the email summary. */
  wordCount: number
}

export interface ParseError {
  ok: false
  error:
    | "missing_filename"
    | "missing_content"
    | "invalid_slug"
    | "no_h1_title"
    | "body_too_short"
}

const MIN_BODY_WORDS = 50

/**
 * `2026-05-15_watts-not-weights-the-energy-story-reshaping-ai.md`
 *  → slug: `watts-not-weights-the-energy-story-reshaping-ai`
 *
 * Falls back to the basename without extension if the YYYY-MM-DD_ prefix
 * is absent. Final slug is validated against the studio's SLUG_RE so it
 * round-trips through `/studio/editor/<slug>` and the publish flow.
 */
export function slugFromFilename(filename: string): string | null {
  if (!filename) return null
  // Strip directory components if any leaked in.
  const basename = filename.split("/").pop() ?? filename
  // Drop the .md extension.
  const noExt = basename.replace(/\.mdx?$/i, "")
  // Strip a leading YYYY-MM-DD_ prefix if present.
  const stripped = noExt.replace(/^\d{4}-\d{2}-\d{2}_/, "")
  // Lowercase + collapse whitespace + dash-normalise just in case.
  const slug = stripped
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
  if (!slug || !SLUG_RE.test(slug)) return null
  return slug
}

/**
 * Detect a markdown byline line. Conservative — only matches the exact
 * pattern Tarry's daily articles use to avoid stripping legitimate
 * italicised text in the body.
 *
 * Matches:
 *   *By Tarry Singh — May 15, 2026*
 *   *By Tarry Singh - May 15, 2026*
 *   _By Tarry Singh — May 15, 2026_
 *   By Tarry Singh — May 15, 2026     (rare; no italics)
 */
function isBylineLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  // Strip surrounding *…* or _…_ italic markers if present.
  const inner = trimmed.replace(/^[*_]+|[*_]+$/g, "").trim()
  return /^By\s+[A-Z][\w\-' ]+\s+[—\-–]\s+\w+/i.test(inner)
}

/**
 * Read a YAML frontmatter block from the head of the file, if present.
 *
 * Recognised shape:
 *
 *   ---
 *   title: "Some title"        ← only the `title` key is required;
 *   date:  2026-05-19           others are tolerated + ignored
 *   ...
 *   ---
 *   …body starts here…
 *
 * We don't pull a full YAML parser in for one field — the daily-article
 * frontmatter is always a flat key:value list. `title:` may be wrapped
 * in single or double quotes or bare; whitespace tolerated.
 *
 * Returns null if no leading `---` block exists or the block carries no
 * `title:` field. In that case the caller falls back to H1 scanning.
 */
function extractFrontmatter(
  lines: readonly string[],
): { title: string; bodyStartIndex: number } | null {
  // Find the first non-blank line. Frontmatter must start at the top.
  let i = 0
  while (i < lines.length && lines[i].trim() === "") i++
  if (i >= lines.length || lines[i].trim() !== "---") return null
  const openIdx = i
  // Scan forward for the closing `---`.
  let closeIdx = -1
  for (let j = openIdx + 1; j < lines.length; j++) {
    if (lines[j].trim() === "---") {
      closeIdx = j
      break
    }
  }
  if (closeIdx === -1) return null

  let title = ""
  for (let j = openIdx + 1; j < closeIdx; j++) {
    const m = lines[j].match(/^\s*title\s*:\s*(.+?)\s*$/i)
    if (m) {
      let raw = m[1].trim()
      // Strip surrounding quotes.
      if (
        (raw.startsWith('"') && raw.endsWith('"')) ||
        (raw.startsWith("'") && raw.endsWith("'"))
      ) {
        raw = raw.slice(1, -1)
      }
      title = raw.trim()
      break
    }
  }
  if (!title) return null

  return { title, bodyStartIndex: closeIdx + 1 }
}

/**
 * Collapse 3+ consecutive blank lines to 2; trim ends; remove leading
 * blank lines.
 */
function normaliseWhitespace(body: string): string {
  return body
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^[\s\n]+/, "")
    .replace(/\s+$/, "")
    .trim()
}

/**
 * Parse a daily article into the shape the studio's draft store +
 * publish pipeline expects.
 */
export function parseDailyArticle(
  input: ParseInput,
): ParseResult | ParseError {
  if (!input.filename || typeof input.filename !== "string") {
    return { ok: false, error: "missing_filename" }
  }
  if (!input.content || typeof input.content !== "string") {
    return { ok: false, error: "missing_content" }
  }

  const slug = slugFromFilename(input.filename)
  if (!slug) {
    return { ok: false, error: "invalid_slug" }
  }

  // Two supported source-file formats:
  //
  //   Format A (original): `# Title` H1 on a line, optional `*By …*`
  //                        byline, then body.
  //   Format B (new):      YAML frontmatter (`---` … `---`) carrying
  //                        `title: "…"` (plus optional date / domain /
  //                        sources), then body. Claude Cowork started
  //                        emitting this on 2026-05-19.
  //
  // We try B first (cheap regex), and only fall back to scanning for
  // an H1 if no frontmatter block is present at the very top.
  const lines = input.content.replace(/\r\n/g, "\n").split("\n")
  let bodyStartIndex = 0
  let title = ""

  const fm = extractFrontmatter(lines)
  if (fm) {
    title = fm.title
    bodyStartIndex = fm.bodyStartIndex
  } else {
    // Format A — scan for the first `# Title` line.
    let h1Index = -1
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^#\s+(.+?)\s*$/)
      if (m) {
        h1Index = i
        title = m[1].trim()
        break
      }
    }
    if (h1Index === -1 || !title) {
      return { ok: false, error: "no_h1_title" }
    }
    bodyStartIndex = h1Index + 1
  }

  // Body = everything AFTER the title source, with byline removed.
  const tail = lines.slice(bodyStartIndex)
  const tailFiltered: string[] = []
  let droppedByline = false
  for (const line of tail) {
    if (!droppedByline && isBylineLine(line)) {
      droppedByline = true
      continue
    }
    tailFiltered.push(line)
  }
  const body = normaliseWhitespace(tailFiltered.join("\n"))

  // Sanity-check body length.
  const wordCount = body.split(/\s+/).filter(Boolean).length
  if (wordCount < MIN_BODY_WORDS) {
    return { ok: false, error: "body_too_short" }
  }

  return {
    ok: true,
    slug,
    title,
    body,
    wordCount,
  }
}
