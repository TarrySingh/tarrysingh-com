#!/usr/bin/env node
/**
 * The Living Report — Phase C assembler.
 *
 * Reads the extraction fleet's output (docs/humanoid-robotics/extraction/
 * batch-*.json) and mechanically converts the 375 records into a draft
 * curated manifest:
 *   - consecutive records tagged `instrument:X` collapse into ONE live
 *     instrument page (with a "Replaces source slides A–B" trace)
 *   - `merge-with:N` bullets fold into their target where shapes allow
 *   - archetypes map onto the deck template kinds; charts parse into the
 *     generic ChartSlide where the transcribed points are parseable
 *   - chapter accents rotate per divider section
 *
 * Emits:
 *   src/components/humanoid/deck/manifest.full.ts  (the draft manifest)
 *   docs/humanoid-robotics/extraction/attention.json (hand-polish queue)
 *
 * The slice manifest.ts stays untouched until the hand-polish pass swaps
 * the full manifest in.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const EXT = join(ROOT, "docs", "humanoid-robotics", "extraction")
const OUT_TS = join(ROOT, "src", "components", "humanoid", "deck", "manifest.ts")
const OUT_ATTN = join(EXT, "attention.json")

/* ---------------- load ---------------- */
const files = readdirSync(EXT).filter((f) => /^batch-\d{2}\.json$/.test(f)).sort()
const records = files.flatMap((f) => JSON.parse(readFileSync(join(EXT, f), "utf8")))
records.sort((a, b) => a.src - b.src)
console.log(`loaded ${records.length} records from ${files.length} batches`)

const attention = []
const note = (src, why, payload) => attention.push({ src, why, ...(payload ? { payload } : {}) })

/* ---------------- helpers ---------------- */
const PALETTE = ["var(--c-cyan)", "var(--c-green)", "var(--c-amber)", "var(--c-blue)", "var(--c-violet)", "var(--c-red)", "var(--c-magenta)"]
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]

const cleanStr = (s) => (typeof s === "string" ? s.trim() : s)
const nonEmpty = (a) => Array.isArray(a) && a.length > 0

/**
 * Design bar: auto-highlight stat phrases as {{...}} so every page gets
 * the chapter-accent "blue number" treatment instead of grey text walls.
 * Matches money, percents/ranges, multipliers, big counts, ISO refs,
 * year ranges, ± tolerances. Single pass; records carry no prior braces.
 */
const HL_RE = /(\$[\d.,]+\s?[BMKk]?\b(?:\s?(?:billion|million|trillion))?|±?[\d.,]+\s?(?:–|—|-|to)\s?[\d.,]+\s?%|[\d.,]+\s?%|[\d.,]+\s?[x×]\b|\b\d{1,3}(?:,\d{3})+\+?|ISO(?:\/TS)?\s?[\d:.-]+|\b(?:19|20)\d{2}\s?[–—-]\s?(?:19|20)?\d{2}\b|±\s?[\d.]+\s?\w+)/g
const autoHl = (t) => (typeof t === "string" ? t.replace(HL_RE, "{{$1}}") : t)

/** "Label: 23%" / "Label — 41" / {label,value} → ChartSlide data rows */
function parseChartData(chart) {
  const rows = []
  const push = (label, raw) => {
    const m = String(raw).match(/-?\d+(?:[.,]\d+)?/)
    if (m && label) rows.push({ label: String(label).trim(), value: parseFloat(m[0].replace(",", ".")) })
  }
  for (const s of chart?.series ?? []) {
    if (typeof s === "object" && s !== null && "points" in s) {
      const pts = String(s.points)
      const pairs = pts.split(/[;,]/).map((p) => p.split(/[:=—–]/)).filter((p) => p.length >= 2)
      if (pairs.length >= 2) pairs.forEach(([l, v]) => push(l, v))
      else push(s.name, pts)
    }
  }
  return rows
}

/* ---------------- per-record conversion ---------------- */
function convert(r, ctx) {
  const base = {
    src: r.src,
    ...(ctx.chap ? { chap: ctx.chap } : {}),
    ...(r.eyebrow ? { eyebrow: cleanStr(r.eyebrow) } : {}),
    ...(r.locked ? { locked: true } : {}),
  }
  const title = cleanStr(r.title) || "(untitled)"

  switch (r.archetype) {
    case "title":
      return { kind: "title", ...base, kicker: cleanStr(r.eyebrow) || "Global Market Analysis · 2026 Edition", title, sub: cleanStr(r.body?.[0]) || "", meta: cleanStr(r.body?.[1]) || "Tarry Singh · June 2026" }
    case "divider": {
      ctx.section += 1
      ctx.chap = PALETTE[(ctx.section - 1) % PALETTE.length]
      const numeral = ROMAN[ctx.section - 1] ?? String(ctx.section)
      const topics = (r.bullets ?? []).map((b, j) => ({ n: b.lead || `${ctx.section}.${j + 1}`, t: b.text || b.lead }))
      return { kind: "divider", ...base, chap: ctx.chap, numeral, part: `Part ${numeral}`, title, topics: topics.slice(0, 8) }
    }
    case "bullets":
      return { kind: "bullets", ...base, title, bullets: (r.bullets ?? []).map((b) => ({ lead: cleanStr(b.lead) || "", text: autoHl(cleanStr(b.text)) || "" })), ...(r.callout ? { callout: { k: cleanStr(r.callout.k) || "Insight", text: autoHl(cleanStr(r.callout.text)) || "" } } : {}) }
    case "stats": {
      const stats = (r.stats ?? []).map((st) => ({ big: cleanStr(st.big), lab: cleanStr(st.lab) })).filter((st) => st.big)
      if (!stats.length) { note(r.src, "stats archetype with no stats — bullets fallback"); return convertFallback(r, base, title) }
      return { kind: "stats", ...base, title, stats, ...(nonEmpty(r.body) ? { body: r.body.map((t) => autoHl(cleanStr(t))) } : {}), ...(r.callout?.text ? { foot: cleanStr(r.callout.text) } : {}) }
    }
    case "diagram": {
      const steps = (r.bullets ?? []).map((b, j) => ({ k: cleanStr(b.lead) || `Stage ${j + 1}`, d: autoHl(cleanStr(b.text)) || "" })).filter((st) => st.d || st.k)
      if (steps.length >= 2) return { kind: "flow", ...base, title, ...(nonEmpty(r.body) ? { sub: cleanStr(r.body[0]) } : {}), steps: steps.slice(0, 6), ...(r.callout?.text ? { foot: cleanStr(r.callout.text) } : {}) }
      note(r.src, "diagram without steps — bullets fallback")
      return convertFallback(r, base, title)
    }
    case "twoPanel": {
      const side = (p, accent) => ({ name: cleanStr(p?.name) || "", tag: cleanStr(p?.tag) || "", accent, rows: (p?.rows ?? []).map((row) => ({ t: cleanStr(row.t) || "", items: (row.items ?? []).map(([m, t]) => [["+", "−", "~"].includes(m) ? m : "~", cleanStr(t)]) })), ...(p?.ex ? { ex: cleanStr(p.ex) } : {}) })
      return { kind: "twoPanel", ...base, title, ...(nonEmpty(r.body) ? { sub: cleanStr(r.body[0]) } : {}), L: side(r.twoPanel?.L, "var(--c-blue)"), R: side(r.twoPanel?.R, "var(--c-amber)") }
    }
    case "case": {
      const c = r.caseStudy ?? {}
      return { kind: "case", ...base, co: cleanStr(c.co) || "", robot: cleanStr(c.robot) || title, site: cleanStr(c.site) || "", task: cleanStr(c.task) || "", results: (c.results ?? []).map(cleanStr), roi: cleanStr(c.roi) || "" }
    }
    case "table":
      return { kind: "table", ...base, title, columns: (r.table?.columns ?? []).map((c) => cleanStr(c) ?? ""), rows: (r.table?.rows ?? []).map((row) => row.map((cell) => cleanStr(cell) ?? "—")), ...(r.callout?.text ? { foot: cleanStr(r.callout.text) } : {}) }
    case "timeline":
      return { kind: "timeline", ...base, title, stops: (r.timeline ?? []).map((t) => ({ when: cleanStr(t.when), what: cleanStr(t.what), detail: cleanStr(t.detail) })) }
    case "chart": {
      const data = parseChartData(r.chart)
      const ctype = r.chart?.type === "donut" ? "donut" : r.chart?.type === "bar" ? "bar" : "hbar"
      if (data.length >= 2) {
        return { kind: "chart", ...base, title, ...(nonEmpty(r.body) ? { sub: cleanStr(r.body[0]) } : {}), ctype, data, ...(nonEmpty(r.chart?.annotations) ? { foot: r.chart.annotations.map(cleanStr).join(" · ") } : {}) }
      }
      note(r.src, "chart data not mechanically parseable — hand-build", r.chart)
      return { kind: "bullets", ...base, title, bullets: (r.chart?.annotations ?? r.body ?? []).map((t) => ({ lead: "", text: cleanStr(t) })), callout: { k: "Hand-polish", text: "Chart pending native rebuild (see attention.json)." } }
    }
    case "quote":
      return { kind: "bullets", ...base, title, bullets: [], callout: { k: cleanStr(r.callout?.k) || "—", text: autoHl(cleanStr(r.callout?.text)) || autoHl(cleanStr(r.body?.[0])) || "" } }
    default: {
      note(r.src, `archetype "${r.archetype}" → bullets fallback`)
      return convertFallback(r, base, title)
    }
  }
}

function convertFallback(r, base, title) {
  const bullets = nonEmpty(r.bullets)
    ? r.bullets.map((b) => ({ lead: cleanStr(b.lead) || "", text: autoHl(cleanStr(b.text)) || "" }))
    : (r.body ?? []).map((t) => ({ lead: "", text: autoHl(cleanStr(t)) }))
  return { kind: "bullets", ...base, title, bullets, ...(r.callout ? { callout: { k: cleanStr(r.callout.k) || "Insight", text: autoHl(cleanStr(r.callout.text)) || "" } } : {}) }
}

/* ---------------- curation walk ---------------- */
const INSTRUMENT_TITLES = {
  "market-model": "Five analyst forecasts. One live model.",
  "concentration": "An early oligopoly, charted live.",
  "war-map": "The supply chain is the battlefield — live.",
  "spec-comparator": "The contenders, re-rankable.",
  "roi": "The payback math, live.",
  "sankey": "Where every hardware dollar goes.",
  "ecosystem": "The whole field is one network — drag it.",
  "deploy-timeline": "From first paycheck to scaled fleets.",
  "frameworks": "East versus West, framework by framework.",
  "tech-deep-dive": "The sensing stack, measured.",
  "app-cases": "The deployments that proved the case.",
  "growth-drivers": "Empty jobs and falling costs.",
  "case-study-map": "Five regions, five playbooks.",
}

const ctx = { section: 0, chap: undefined }
const out = []
const mergedAway = new Set()

/* Design bar: each live instrument appears at most once per section and
   three times across the whole deck — repeats render as native charts/
   content instead of the same widget over and over. */
const instGlobal = {}
let instSection = {}

// pre-pass: register merge targets
for (const r of records) {
  const m = /^merge-with:(\d+)/.exec(r.curation ?? "")
  if (m) mergedAway.add(r.src)
}

for (let k = 0; k < records.length; k++) {
  const r = records[k]
  if (mergedAway.has(r.src)) {
    // fold into the nearest previous kept page when shapes allow
    const target = out[out.length - 1]
    if (target?.kind === "bullets" && nonEmpty(r.bullets)) {
      target.bullets.push(...r.bullets.map((b) => ({ lead: cleanStr(b.lead) || "", text: cleanStr(b.text) || "" })))
      target.replaces = target.replaces ? `${target.replaces.replace(/ · s\d+$/, "")} + s${r.src}` : `Absorbs source slide ${r.src}`
    } else {
      note(r.src, "merge-with target shape mismatch — kept standalone")
      out.push(convert(r, ctx))
    }
    continue
  }
  if (r.archetype === "divider") instSection = {} // new section → fresh instrument budget
  const inst = /^instrument:([a-z-]+)/.exec(r.curation ?? "")
  if (inst && INSTRUMENT_TITLES[inst[1]] && !instSection[inst[1]] && (instGlobal[inst[1]] ?? 0) < 3) {
    instSection[inst[1]] = true
    instGlobal[inst[1]] = (instGlobal[inst[1]] ?? 0) + 1
    // collapse the consecutive run with the same instrument suggestion
    let end = k
    while (end + 1 < records.length && (records[end + 1].curation ?? "").startsWith(`instrument:${inst[1]}`)) end++
    const span = end > k ? `Replaces source slides ${r.src}–${records[end].src}` : `Replaces source slide ${r.src}`
    out.push({
      kind: "instrument",
      src: r.src,
      ...(ctx.chap ? { chap: ctx.chap } : {}),
      ...(r.eyebrow ? { eyebrow: cleanStr(r.eyebrow) } : {}),
      ...(r.locked ? { locked: true } : {}),
      title: cleanStr(r.title) || INSTRUMENT_TITLES[inst[1]],
      ...(nonEmpty(r.body) ? { sub: cleanStr(r.body[0]) } : {}),
      instrument: inst[1],
      replaces: span,
    })
    k = end
    continue
  }
  out.push(convert(r, ctx))
}

/* ---------------- TOC by divider sections ---------------- */
const toc = []
let group = { label: "Front matter", slides: [] }
out.forEach((s, idx) => {
  if (s.kind === "divider") {
    if (group.slides.length) toc.push(group)
    group = { label: `${s.part} — ${s.title}`, slides: [idx] }
  } else {
    group.slides.push(idx)
  }
})
if (group.slides.length) toc.push(group)

/* ---------------- emit ---------------- */
const header = `import type { Slide, TocGroup } from "./types"

/**
 * The Living Report — FULL curated manifest (draft).
 * GENERATED by scripts/humanoid/build-manifest.mjs from the Phase-B
 * extraction fleet's records — then hand-polished. Source PNGs remain
 * the ground truth (docs/humanoid-robotics/full-deck, gitignored).
 * ${records.length} source slides → ${out.length} curated pages.
 */
`
const body = `export const SLIDES: Slide[] = ${JSON.stringify(out, null, 2)}

export const TOC: TocGroup[] = ${JSON.stringify(toc, null, 2)}

export const DECK_TITLE = "The State of Humanoid Robotics"
export const DECK_EDITION = "2026 Edition"
`
writeFileSync(OUT_TS, header + body)
writeFileSync(OUT_ATTN, JSON.stringify(attention, null, 2))

const kinds = {}
out.forEach((s) => { kinds[s.kind] = (kinds[s.kind] ?? 0) + 1 })
console.log(`pages: ${out.length}  (from ${records.length} slides)`)
console.log(`kinds:`, kinds)
console.log(`locked pages: ${out.filter((s) => s.locked).length}`)
console.log(`attention items: ${attention.length} → ${OUT_ATTN}`)
console.log(`manifest → ${OUT_TS}`)
