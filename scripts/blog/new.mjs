#!/usr/bin/env node
/**
 * npm run blog:new <kebab-slug>
 *
 * Scaffolds a fresh Dispatch draft at content/blog/_drafts/<slug>.mdx
 * with valid frontmatter (today's date, default category, empty
 * excerpt + body) so the author doesn't fight YAML every time.
 *
 * The _drafts/ tree is git-tracked but excluded from production
 * builds — see scripts/blog/_README.md.
 */

import { mkdir, readFile, writeFile, access } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..", "..")
const DRAFTS_DIR = join(ROOT, "content", "blog", "_drafts")
const LIVE_DIR = join(ROOT, "content", "blog")

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/

function fail(msg) {
  console.error(`\x1b[31m✗\x1b[0m ${msg}`)
  process.exit(1)
}

function ok(msg) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`)
}

function info(msg) {
  console.log(`  ${msg}`)
}

async function fileExists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

function todayIso() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((w) => (w.length > 3 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase())
}

function buildScaffold(slug) {
  return `---
title: "${titleFromSlug(slug)}"
date: "${todayIso()}"
category: "Notes"
excerpt: "A one- or two-sentence summary that becomes the index card and the LinkedIn post body."
hero: ""
theme: "editorial"
linkedin_url: ""
draft: true
tags: []
---

The first paragraph carries the whole argument. Make it stand
on its own — a reader who never scrolls past should still know
what you're claiming.

## A heading lives here

Plex Serif body at 1.85 line-height. Headings render in Gloock.
Code fences (\`\`\`ts ... \`\`\`) compile through Shiki at build
time — zero client-side JS.

Images use \`next/image\` automatically with alt-text as the
caption.

## Closing thought

End with one short italic line — the studio convention is
*one italic close per page*.

— *the studio*
`
}

async function main() {
  const slug = (process.argv[2] ?? "").trim()
  if (!slug) {
    fail(
      "usage: npm run blog:new <kebab-slug>\n  example: npm run blog:new notes-on-drawing-a-chip-that-sleeps",
    )
  }
  if (!SLUG_RE.test(slug)) {
    fail(
      `slug must match ${SLUG_RE} (lowercase letters, digits, hyphens; no leading/trailing hyphen).`,
    )
  }

  const draftPath = join(DRAFTS_DIR, `${slug}.mdx`)
  const livePath = join(LIVE_DIR, `${slug}.mdx`)

  if (await fileExists(draftPath)) {
    fail(`draft already exists at content/blog/_drafts/${slug}.mdx`)
  }
  if (await fileExists(livePath)) {
    fail(
      `a published Dispatch already exists with this slug at content/blog/${slug}.mdx. Pick another slug.`,
    )
  }

  await mkdir(DRAFTS_DIR, { recursive: true })
  await writeFile(draftPath, buildScaffold(slug), "utf8")

  ok(`drafted content/blog/_drafts/${slug}.mdx`)
  info("")
  info("next:")
  info(`  1. open the file, write the body`)
  info(`  2. npm run blog:audit ${slug}      # voice + style check`)
  info(`  3. npm run blog:promote ${slug}    # move into content/blog/, build, push`)
  info("")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
