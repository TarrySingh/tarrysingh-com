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
const HL_RE = /(\$[\d.,]+\s?[BMKk]?\b(?:\s?(?:billion|million|trillion))?|±?[\d.,]+\s?(?:–|—|-|to)\s?[\d.,]+\s?%|[\d.,]+\s?%|[\d.,]+(?:\s?[x×]\s?[\d.,]+)+[x×]?|[\d.,]+\s?[x×]\b|\b\d{1,3}(?:,\d{3})+\+?|ISO(?:\/TS)?\s?[\d:.-]+|\b(?:19|20)\d{2}\s?[–—-]\s?(?:19|20)?\d{2}\b|±\s?[\d.]+\s?\w+)/g
const autoHl = (t) =>
  typeof t === "string"
    ? t.replace(HL_RE, "{{$1}}").replace(/\}\}(\s*)\{\{/g, "$1").replace(/\{\{\s*\}\}/g, "")
    : t

/* ---------------- design-bar scrubbers ---------------- */
// Trailing source chip-tags glued onto sentences, e.g. " [Fast-Track | Centralized]".
const CHIP_BRACKET_RE = /\s*\[[^[\]]*\|[^[\]]*\]\s*$/
// Source chip/logo rows transcribed inline: "… Tags: A, B, C" / "[chips] A, B" / "Badges: …".
const CHIP_LABEL_RE = /[\s;.,—–-]*\b(?:Tags?|Chips?|Badges?|Logos?|Pills?|Icons?)\s*:\s*.*$/i
const CHIP_BRACKET_PREFIX_RE = /^\s*\[(?:chips?|badges?|logos?|tags?)\]\s*/i
// Dangling "see the other field" transcription pointers.
const POINTER_RE = /\b(?:see (?:the )?(?:table|timeline|chart|figure)(?:\s+(?:field|above|below|left|right))?|transcribed in (?:the )?\w+ field|values? in (?:the )?\w+ field)\b/i
// Title prefixes that leak the source widget/layout framing.
const TITLE_PREFIX_RE = /^(?:Interactive\s+Data|Data\s+Chart|Interactive\s+Visuali[sz]ation|Interactive\s+Map|Two[\s-]Column\s+Comparative|Comparative\s+(?:Analysis|Table)|Side[\s-]by[\s-]side|Interactive|Chart|Visualization|Diagram)\s*[:—-]\s*/i
// Bullets/foots that are scraped UI narration, not content.
const UI_NARRATION_RE = /^(?:hover|click|drag|toggle|zoom|adjust|select|tap|scroll|legend\b|legend:|the chart (?:shows|displays|above|below)|chart shows|dashed (?:line|vertical|zero)|x-?axis|y-?axis|bars? (?:show|represent)|colou?r(?:ed)? (?:bar|line|coded)|grey\/|\(grey\)|\(colou?red\)|interactive (?:map|visuali|chart|dashboard|panel)|adjust parameters|use the slider)/i
const CLIP_NOTE_RE = /\((?:text )?(?:clipped|truncated|cut off|not visible|partially|small print|approx\.?|estimated|unlabel|un-kickered)[^)]*\)|\[(?:row )?truncated[^\]]*\]|\[chart[^\]]*\]/gi
// numbered process lead: "1." / "2)" / "Step 3:" / "1. Interface Mapping"
const NUM_LEAD_RE = /^\s*(?:step\s*)?\d+\s*[.)\]:-]\s*/i

const scrubText = (t) => {
  if (typeof t !== "string") return t
  let s = t.replace(CHIP_BRACKET_PREFIX_RE, "").replace(CLIP_NOTE_RE, "").replace(CHIP_LABEL_RE, "").replace(CHIP_BRACKET_RE, "").trim()
  s = s.replace(/\s{2,}/g, " ").replace(/\s+([.,;:])/g, "$1").replace(/[\s;,]+$/, "")
  return s
}
const scrubTitle = (t) => (typeof t === "string" ? t.replace(TITLE_PREFIX_RE, "").trim() : t)
const scrubKicker = (k) => (typeof k === "string" ? k.replace(/\s*\([^)]*\)\s*$/, "").trim() : k)
const stripNumLead = (s) => (typeof s === "string" ? s.replace(NUM_LEAD_RE, "").trim() : s)
const isPointer = (t) => typeof t === "string" && POINTER_RE.test(t)
const isUiNarration = (t) => typeof t === "string" && UI_NARRATION_RE.test(t.trim())
const isEmptyish = (t) => !t || (typeof t === "string" && t.replace(/[\s—–-]/g, "").length < 2)

// chart-data sanity: real distribution, not years/identical/placeholder
const allSame = (xs) => xs.length > 0 && xs.every((v) => v === xs[0])
const looksLikeYears = (rows) => rows.length > 0 && rows.every((r) => r.value >= 1990 && r.value <= 2100 && Number.isInteger(r.value))
const chartIsGarbage = (rows) =>
  rows.length < 3 || allSame(rows.map((r) => r.value)) || looksLikeYears(rows) ||
  rows.some((r) => /\(right node\)|\(left node\)|panel|see (?:table|timeline|chart)/i.test(r.label))

/* ---------------- redraw overrides (targeted fleet output) ---------------- */
// extraction/redraw/<src>.json files replace the base record for that src.
const REDRAW_DIR = join(EXT, "redraw")
const overrides = {}
try {
  for (const f of readdirSync(REDRAW_DIR)) {
    if (!/\.json$/.test(f)) continue
    const rec = JSON.parse(readFileSync(join(REDRAW_DIR, f), "utf8"))
    const recs = Array.isArray(rec) ? rec : [rec]
    for (const o of recs) if (o && o.src != null) overrides[o.src] = o
  }
} catch { /* no redraw dir yet */ }
const overrideCount = Object.keys(overrides).length

/** "Label: 23%" / "Label — 41" / "Phase 1: Pilot: 42" → ChartSlide data rows.
 * Robust to labels containing their own colon: the value is the TRAILING
 * number of each segment; everything before it (minus the separator) is the
 * label. Primary segment split on ';', fallback ',' only when no ';'. */
function parseChartData(chart) {
  const rows = []
  const seen = new Set()
  const pushSeg = (seg) => {
    const m = String(seg).match(/^(.*?)[\s:=—–-]+(-?[\d][\d.,]*)\s*%?\+?$/)
    if (!m) return
    const label = m[1].replace(/[:\-–—\s]+$/, "").trim()
    const value = parseFloat(m[2].replace(/,/g, ""))
    if (label && Number.isFinite(value) && !seen.has(label)) { seen.add(label); rows.push({ label, value }) }
  }
  for (const s of chart?.series ?? []) {
    if (typeof s === "object" && s !== null && "points" in s) {
      const pts = String(s.points)
      const segs = pts.includes(";") ? pts.split(";") : pts.split(",")
      segs.forEach(pushSeg)
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
  const title = scrubTitle(cleanStr(r.title)) || "(untitled)"

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
      if (bulletsAreNumberedProcess(r.bullets)) { note(r.src, "numbered bullets → flow"); return bulletsToFlow(r, base, title) }
      return { kind: "bullets", ...base, title, bullets: cleanBullets(r.bullets), ...(r.callout ? { callout: { k: scrubKicker(cleanStr(r.callout.k)) || "Insight", text: autoHl(scrubText(cleanStr(r.callout.text))) || "" } } : {}) }
    case "stats": {
      const stats = (r.stats ?? []).map((st) => ({ big: cleanStr(st.big), lab: cleanStr(st.lab) })).filter((st) => st.big)
      if (!stats.length) { note(r.src, "stats archetype with no stats — bullets fallback"); return convertFallback(r, base, title) }
      return { kind: "stats", ...base, title, stats, ...(nonEmpty(r.body) ? { body: r.body.map((t) => autoHl(cleanStr(t))) } : {}), ...(r.callout?.text ? { foot: cleanStr(r.callout.text) } : {}) }
    }
    case "diagram": {
      const steps = (r.bullets ?? []).map((b, j) => ({ k: scrubText(stripNumLead(cleanStr(b.lead))) || `Stage ${j + 1}`, d: autoHl(scrubText(stripNumLead(cleanStr(b.text)))) || "" })).filter((st) => st.d || st.k)
      if (steps.length >= 2) return { kind: "flow", ...base, title, ...(nonEmpty(r.body) ? { sub: cleanStr(r.body[0]) } : {}), steps: steps.slice(0, 6), ...(r.callout?.text ? { foot: scrubText(cleanStr(r.callout.text)) } : {}) }
      note(r.src, "diagram without steps — bullets fallback")
      return convertFallback(r, base, title)
    }
    case "twoPanel": {
      const side = (p, accent) => ({ name: cleanStr(p?.name) || "", tag: cleanStr(p?.tag) || "", accent, rows: (p?.rows ?? []).map((row) => ({ t: cleanStr(row.t) || "", items: (row.items ?? []).map(([m, t]) => [["+", "−", "~"].includes(m) ? m : "~", scrubText(cleanStr(t))]).filter(([, t]) => !isEmptyish(t) && !isPointer(t)) })).filter((row) => row.t || row.items.length), ...(p?.ex ? { ex: scrubText(cleanStr(p.ex)) } : {}) })
      const L = side(r.twoPanel?.L, "var(--c-blue)"), R = side(r.twoPanel?.R, "var(--c-amber)")
      if (!L.rows.length && !R.rows.length) { note(r.src, "twoPanel with no usable rows — flag for redraw"); return needsRedraw(r, base, title) }
      return { kind: "twoPanel", ...base, title, ...(nonEmpty(r.body) ? { sub: cleanStr(r.body[0]) } : {}), L, R }
    }
    case "case": {
      const c = r.caseStudy ?? {}
      return { kind: "case", ...base, co: cleanStr(c.co) || "", robot: cleanStr(c.robot) || title, site: cleanStr(c.site) || "", task: cleanStr(c.task) || "", results: (c.results ?? []).map(cleanStr), roi: cleanStr(c.roi) || "" }
    }
    case "table":
      return { kind: "table", ...base, title, columns: (r.table?.columns ?? []).map((c) => cleanStr(c) ?? ""), rows: (r.table?.rows ?? []).map((row) => row.map((cell) => { const s = scrubText(cleanStr(cell)); return isEmptyish(s) ? "—" : s })), ...(r.callout?.text ? { foot: scrubText(cleanStr(r.callout.text)) } : {}) }
    case "timeline":
      return { kind: "timeline", ...base, title, stops: (r.timeline ?? []).map((t) => ({ when: cleanStr(t.when), what: cleanStr(t.what), detail: cleanStr(t.detail) })) }
    case "chart": {
      const data = parseChartData(r.chart)
      const ctype = r.chart?.type === "donut" ? "donut" : r.chart?.type === "bar" ? "bar" : "hbar"
      if (data.length >= 3 && !chartIsGarbage(data)) {
        const annotations = (r.chart?.annotations ?? []).map(scrubText).filter((a) => !isEmptyish(a) && !isUiNarration(a))
        return { kind: "chart", ...base, title, ...(nonEmpty(r.body) ? { sub: cleanStr(r.body[0]) } : {}), ctype, data, ...(annotations.length ? { foot: annotations.join(" · ") } : {}) }
      }
      // unparseable / garbage chart — try stat band from clean annotations, else flag for redraw
      const statish = (r.chart?.annotations ?? r.body ?? []).map(scrubText).filter((a) => !isEmptyish(a) && !isUiNarration(a) && /\d/.test(a))
      note(r.src, "chart not mechanically renderable — redraw", { type: r.chart?.type, rows: data.length })
      return needsRedraw(r, base, title, statish)
    }
    case "quote":
      return { kind: "bullets", ...base, title, bullets: [], callout: { k: scrubKicker(cleanStr(r.callout?.k)) || "—", text: autoHl(scrubText(cleanStr(r.callout?.text))) || autoHl(scrubText(cleanStr(r.body?.[0]))) || "" } }
    default: {
      note(r.src, `archetype "${r.archetype}" → bullets fallback`)
      return convertFallback(r, base, title)
    }
  }
}

// scrub a bullet list: drop UI-narration/pointers/empty, strip chips, highlight stats
function cleanBullets(arr) {
  return (arr ?? [])
    .map((b) => ({ lead: scrubText(cleanStr(b.lead)) || "", text: scrubText(cleanStr(b.text)) || "" }))
    .filter((b) => !isUiNarration(b.text) && !isUiNarration(b.lead) && !isPointer(b.text) && !(isEmptyish(b.text) && isEmptyish(b.lead)))
    .map((b) => ({ lead: b.lead, text: autoHl(b.text) }))
}

// numbered-process bullets ("1. Map", "2) Test") → a designed step-flow
function bulletsAreNumberedProcess(arr) {
  const b = (arr ?? []).filter((x) => !isEmptyish(cleanStr(x.lead)) || !isEmptyish(cleanStr(x.text)))
  if (b.length < 3) return false
  const numbered = b.filter((x) => NUM_LEAD_RE.test(cleanStr(x.lead) || "") || NUM_LEAD_RE.test(cleanStr(x.text) || "")).length
  return numbered >= Math.ceil(b.length * 0.6)
}
function bulletsToFlow(r, base, title) {
  const steps = (r.bullets ?? [])
    .map((b) => {
      const lead = stripNumLead(scrubText(cleanStr(b.lead)) || "")
      const text = stripNumLead(scrubText(cleanStr(b.text)) || "")
      return { k: lead || text.split(/[.:—-]/)[0].slice(0, 40), d: autoHl(lead && text ? text : text || lead) }
    })
    .filter((s) => s.k || s.d)
    .slice(0, 6)
  return { kind: "flow", ...base, title, ...(nonEmpty(r.body) ? { sub: cleanStr(r.body[0]) } : {}), steps, ...(r.callout?.text ? { foot: scrubText(cleanStr(r.callout.text)) } : {}) }
}

function convertFallback(r, base, title) {
  const bullets = nonEmpty(r.bullets) ? cleanBullets(r.bullets) : cleanBullets((r.body ?? []).map((t) => ({ lead: "", text: t })))
  return { kind: "bullets", ...base, title, bullets, ...(r.callout ? { callout: { k: scrubKicker(cleanStr(r.callout.k)) || "Insight", text: autoHl(scrubText(cleanStr(r.callout.text))) || "" } } : {}) }
}

// Pages whose source data couldn't be salvaged mechanically: queue the src
// for the targeted redraw fleet, and ship a clean interim page (never a
// placeholder UI-scrape). Real annotations with numbers become a stat note.
const redrawQueue = []
function needsRedraw(r, base, title, statish = []) {
  redrawQueue.push({ src: r.src, title, why: r.archetype, locked: !!r.locked })
  const lines = (statish.length ? statish : (r.body ?? []).map(scrubText)).filter((t) => !isEmptyish(t) && !isUiNarration(t))
  return {
    kind: "bullets", ...base, title,
    bullets: lines.slice(0, 5).map((t) => ({ lead: "", text: autoHl(t) })),
    callout: { k: "Native chart in progress", text: "This figure is being rebuilt as a native interactive — the underlying numbers are shown above." },
  }
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
const dropped = []
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
  const r = overrides[records[k].src] ? { ...records[k], ...overrides[records[k].src] } : records[k]
  if (r.drop) { dropped.push(r.src); continue } // redraw fleet marked this page redundant
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
      title: scrubTitle(cleanStr(r.title)) || INSTRUMENT_TITLES[inst[1]],
      ...(nonEmpty(r.body) ? { sub: cleanStr(r.body[0]) } : {}),
      instrument: inst[1],
      replaces: span,
    })
    k = end
    continue
  }
  // instrument-curated but capped/section-dup: drop pure "see the interactive" pointer pages
  if (inst && INSTRUMENT_TITLES[inst[1]] && !hasRealContent(r)) {
    note(r.src, `redundant ${inst[1]} pointer page dropped (instrument already placed)`)
    dropped.push(r.src)
    continue
  }
  const page = convert(r, ctx)
  if (page) out.push(page); else { dropped.push(r.src) }
}

function hasRealContent(r) {
  if ((r.bullets ?? []).filter((b) => !isUiNarration(cleanStr(b.text)) && !isEmptyish(cleanStr(b.text))).length >= 2) return true
  if (nonEmpty(r.stats)) return true
  if ((r.table?.rows ?? []).length >= 2) return true
  if ((r.timeline ?? []).length >= 2) return true
  if ((r.twoPanel?.L?.rows ?? []).length || (r.twoPanel?.R?.rows ?? []).length) return true
  if (parseChartData(r.chart).length >= 3) return true
  if (r.caseStudy && (r.caseStudy.task || (r.caseStudy.results ?? []).length)) return true
  return false
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
writeFileSync(join(EXT, "redraw-queue.json"), JSON.stringify(redrawQueue, null, 2))

const kinds = {}
out.forEach((s) => { kinds[s.kind] = (kinds[s.kind] ?? 0) + 1 })
console.log(`pages: ${out.length}  (from ${records.length} slides)`)
console.log(`kinds:`, kinds)
console.log(`locked pages: ${out.filter((s) => s.locked).length}`)
console.log(`overrides applied: ${overrideCount}`)
console.log(`dropped (redundant/empty): ${dropped.length} → [${dropped.join(", ")}]`)
console.log(`redraw queue: ${redrawQueue.length} → ${join(EXT, "redraw-queue.json")} [${redrawQueue.map((x) => x.src).join(", ")}]`)
console.log(`attention items: ${attention.length} → ${OUT_ATTN}`)
console.log(`manifest → ${OUT_TS}`)
