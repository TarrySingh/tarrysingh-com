/**
 * Full-corpus LIVE anti-slop sweep.
 *
 * Everything else in this repo checks the source files. This checks what the
 * public actually receives: it fetches every published Dispatch from production
 * and asserts the tells are gone from the RENDERED page, so the guarantee is
 * measured across the whole corpus rather than sampled.
 *
 * Also reports diagram coverage, because a diagram that fails to render is
 * invisible in the source check but obvious to a reader.
 *
 * Usage:
 *   node scripts/live-slop-sweep.mjs
 *   node scripts/live-slop-sweep.mjs --origin http://localhost:3230
 */
import fs from "node:fs"
import path from "node:path"

const argOrigin = process.argv.indexOf("--origin")
const ORIGIN = argOrigin > -1 ? process.argv[argOrigin + 1] : "https://www.tarrysingh.com"
const CONCURRENCY = 6
const DIR = path.join(process.cwd(), "content", "blog")

// Published slugs only (skip drafts).
const slugs = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".mdx"))
  .filter((f) => {
    const raw = fs.readFileSync(path.join(DIR, f), "utf8")
    return !/^draft:\s*true/m.test(raw)
  })
  .map((f) => f.replace(/\.mdx$/, ""))
  .sort()

/** Rendered article text, chrome removed. */
function articleText(html) {
  // The reader wraps the post in <article id="read-root">.
  const m = html.match(/<article[^>]*id="read-root"[\s\S]*?<\/article>/)
  const region = m ? m[0] : html
  return region
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
}

const TELLS = [
  ["em-dash", /—/g],
  ["counterfactual-seat", /\bif I (?:were|was|sat)\b[^.?!]{0,60}\b(?:board|committee|seat|table|chair)\b/gi],
  ["wager-stake", /\b(?:I'?d|I would|I'?ll) (?:bet|wager|take the over)\b|\bbet against\b|\bthe smart money\b/gi],
  ["manufactured-suspense", /\bhere(?:'|’)?s (?:where|what|why|the thing|the catch)\b|\bwhere it gets (?:uncomfortable|interesting|ugly)\b/gi],
  ["reader-imperative", /\bread (?:that|this|those) (?:again|twice|side by side)\b|\bsit with (?:that|this|it)\b|\blet (?:that|this) sink in\b/gi],
  ["watch-not", /\bwatch the [^,.]{2,40}, not the\b/gi],
  ["assistant-register", /\bI hope this helps\b|\bfeel free to reach out\b|\bas an AI\b/gi],
  ["humility-coda", /\bwhat I (?:do not|don't) know\b|\bI cannot (?:yet )?(?:predict|tell)\b/gi],
  ["awkward-fraction", /\bin every (?:thousand|hundred)\b/gi],
]

/**
 * Decimal percentages are reported separately and are NOT counted as a tell.
 * Precision next to a source is correct writing: a 2026-08-08 rewrite pass that
 * rounded "31.5%" to "about a third" beside a live citation destroyed the claim,
 * so the rule now protects cited figures instead of stripping them. Rendered
 * HTML gives no reliable way to tell "cited" from "uncited" (the link markup is
 * gone by then), so the source-side scanner owns that judgement and this sweep
 * only reports the count for visibility.
 */
const DECIMAL_PCT = /\b\d+\.\d+\s?%/g

async function fetchOne(slug) {
  const url = `${ORIGIN}/blog/${slug}`
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(30000) })
    if (!res.ok) return { slug, status: res.status, error: `HTTP ${res.status}` }
    const html = await res.text()
    const text = articleText(html)
    const hits = {}
    for (const [id, re] of TELLS) {
      const n = (text.match(re) ?? []).length
      if (n) hits[id] = n
    }
    const figures = (html.match(/data-read-surface/g) ?? []).length
    const renderError = /Mermaid render error/.test(html)
    const decimalPct = (text.match(DECIMAL_PCT) ?? []).length
    return { slug, status: res.status, hits, figures, renderError, decimalPct, words: text.split(" ").length }
  } catch (e) {
    return { slug, error: e instanceof Error ? e.message : String(e) }
  }
}

async function run() {
  console.log(`LIVE SWEEP · ${ORIGIN} · ${slugs.length} published posts\n`)
  const results = []
  for (let i = 0; i < slugs.length; i += CONCURRENCY) {
    const batch = slugs.slice(i, i + CONCURRENCY)
    results.push(...(await Promise.all(batch.map(fetchOne))))
    process.stdout.write(`\r  fetched ${Math.min(i + CONCURRENCY, slugs.length)}/${slugs.length}`)
  }
  console.log("\n")

  const errors = results.filter((r) => r.error)
  const ok = results.filter((r) => !r.error)
  const dirty = ok.filter((r) => Object.keys(r.hits).length > 0)
  const withFigures = ok.filter((r) => r.figures > 0)
  const renderErrors = ok.filter((r) => r.renderError)

  const byTell = new Map()
  for (const r of ok) {
    for (const [id, n] of Object.entries(r.hits)) {
      const e = byTell.get(id) ?? { files: 0, hits: 0 }
      e.files++
      e.hits += n
      byTell.set(id, e)
    }
  }

  console.log("=== RESULT ===")
  console.log(`  fetched OK         ${ok.length}/${slugs.length}`)
  console.log(`  fetch errors       ${errors.length}`)
  console.log(`  CLEAN pages        ${ok.length - dirty.length}`)
  console.log(`  pages with a tell  ${dirty.length}`)
  console.log(`  pages w/ diagram   ${withFigures.length}  (${withFigures.reduce((n, r) => n + r.figures, 0)} figures)`)
  console.log(`  mermaid errors     ${renderErrors.length}`)
  const dp = ok.reduce((n, r) => n + (r.decimalPct ?? 0), 0)
  console.log(`  decimal % (FYI)    ${dp} across ${ok.filter((r) => r.decimalPct).length} pages — cited precision, not a tell`)

  if (byTell.size) {
    console.log("\n=== TELLS FOUND LIVE ===")
    ;[...byTell.entries()]
      .sort((a, b) => b[1].files - a[1].files)
      .forEach(([id, e]) => console.log(`  ${String(e.files).padStart(3)} pages  ${String(e.hits).padStart(4)} hits  ${id}`))
  }

  if (dirty.length) {
    console.log("\n=== PAGES NEEDING WORK ===")
    dirty
      .sort((a, b) => Object.values(b.hits).reduce((x, y) => x + y, 0) - Object.values(a.hits).reduce((x, y) => x + y, 0))
      .slice(0, 25)
      .forEach((r) =>
        console.log(`  ${r.slug}\n      ${Object.entries(r.hits).map(([k, v]) => `${k}×${v}`).join(", ")}`),
      )
  }
  if (renderErrors.length) {
    console.log("\n=== MERMAID RENDER ERRORS ===")
    renderErrors.forEach((r) => console.log(`  ${r.slug}`))
  }
  if (errors.length) {
    console.log("\n=== FETCH ERRORS ===")
    errors.forEach((r) => console.log(`  ${r.slug}: ${r.error}`))
  }

  fs.writeFileSync(
    path.join(process.cwd(), "live-sweep-report.json"),
    JSON.stringify({ origin: ORIGIN, at: new Date().toISOString(), results }, null, 2),
  )
  console.log("\nfull report -> live-sweep-report.json")
  process.exit(dirty.length || renderErrors.length ? 1 : 0)
}

run()
