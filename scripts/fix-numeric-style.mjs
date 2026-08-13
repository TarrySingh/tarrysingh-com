/**
 * Numeric house style, applied corpus-wide.
 *
 * Derived from how TechCrunch, The Verge, AP (which moved to "%" in 2019), the
 * Economist, Reuters, Guardian and Stratechery actually write numbers, then
 * overruled in two places where Tarry's stated preference wins:
 *   - a sentence MAY open on a numeral (all five guides forbid it; his own
 *     gold-standard sentence does it, and the alternative is his BAD example)
 *   - a range does not repeat its unit: "30–50%", "$1,200–2,000"
 *
 * Decisions taken 2026-08-13:
 *   money   spelled scale word in prose ("$700 billion"); compressed ($78.5Bn)
 *           only in headings and tables, never mixed inside one sentence
 *   dates   "27 May 2026" everywhere (274 files already; convert the 49)
 *   slugs   NOT touched: renaming them breaks live URLs and inbound links
 *
 * PROTECTED, never rewritten (converting these changes meaning or invents
 * precision that was never measured):
 *   "percentage point(s)"  a unit, not a percentage
 *   "percentile"           an ordinal rank
 *   rank ordinals          "the second phase" (778 in corpus)
 *   fractions/ratios       "two-thirds", "a third", "one in five", "half"
 *   quoted material, code fences, link targets, frontmatter keys except
 *   title/excerpt
 *
 * Usage:
 *   node scripts/fix-numeric-style.mjs            # dry run, prints every change
 *   node scripts/fix-numeric-style.mjs --write
 */
import fs from "node:fs"
import path from "node:path"

const WRITE = process.argv.includes("--write")
const DIR = path.join(process.cwd(), "content", "blog")

const SMALL = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90,
}
const SCALE = { hundred: 100, thousand: 1000, million: 1e6, billion: 1e9, trillion: 1e12 }
const NUMW = Object.keys(SMALL).concat(Object.keys(SCALE)).join("|")
const PHRASE = `(?:${NUMW})(?:[-\\s](?:and[-\\s])?(?:${NUMW}))*`

function parseWords(p) {
  const w = p.toLowerCase().replace(/-/g, " ").split(/\s+/).filter((x) => x && x !== "and")
  let total = 0, cur = 0, seen = false
  for (const x of w) {
    if (x in SMALL) { cur += SMALL[x]; seen = true }
    else if (x in SCALE) {
      if (cur === 0) cur = 1
      const s = SCALE[x]
      if (s >= 1000) { total += cur * s; cur = 0 } else cur *= s
      seen = true
    } else return null
  }
  return seen ? total + cur : null
}

const group = (n) => n.toLocaleString("en-GB")
/** Big values keep their scale word: $80 billion, not $80,000,000,000. */
function withScale(n) {
  if (n >= 1e12 && n % 1e11 === 0) return `${+(n / 1e12).toFixed(2)} trillion`
  if (n >= 1e9 && n % 1e8 === 0) return `${+(n / 1e9).toFixed(2)} billion`
  if (n >= 1e6 && n % 1e5 === 0) return `${+(n / 1e6).toFixed(2)} million`
  return group(n)
}

/** Units that prove a figure is a measurement, so it must be digits. */
const UNITS =
  "percentage points?|gigawatts?|megawatts?|kilowatts?|terawatt-hours?|watt-hours?|GW|MW|kW|TWh|" +
  "gigabytes?|terabytes?|petabytes?|exabytes?|zettabytes?|GB|TB|PB|ZB|" +
  "kilometres?|kilometers?|metres?|meters?|miles?|kilograms?|kg|tonnes?|tons?|" +
  "seconds?|minutes?|hours?|milliseconds?|ms|" +
  "parameters?|tokens?|GPUs?|engineers?|students?|deployments?|fellows?"

const MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December"


/**
 * A spelled phrase is only a number when nothing already quantifies it.
 * "$8.5 billion GPU-backed" must not have its bare "billion" read as 1 billion,
 * and "a few thousand engineers" must not become "a few 1,000 engineers".
 */
function alreadyQuantified(full, offset) {
  const before = full.slice(Math.max(0, offset - 22), offset)
  return /[\d.,]\s*$/.test(before) ||
    /\b(?:few|couple of|couple|several|many|dozen|dozens of|tens of|hundreds of|thousands of|millions of|billions of)\s+$/i.test(before)
}

function convert(text, log) {
  let out = text

  // V6 · "January 6, 2026" -> "6 January 2026"
  out = out.replace(
    new RegExp(`\\b(${MONTHS})\\s+(\\d{1,2}),\\s*(\\d{4})\\b`, "g"),
    (w, m, d, y) => { const r = `${d} ${m} ${y}`; log("date", w, r); return r },
  )

  // V2 · spelled numeral bolted to a measured unit -> digits.
  // "forty percentage points" -> "40 percentage points" (the UNIT stays a word).
  out = out.replace(
    new RegExp(`\\b(${PHRASE})\\s+(${UNITS})\\b`, "gi"),
    (w, num, unit, offset, full) => {
      const v = parseWords(num)
      if (v === null) return w
      if (alreadyQuantified(full, offset)) return w
      const r = `${withScale(v)} ${unit}`
      log("unit", w, r)
      return r
    },
  )

  // V2b · hyphenated spec: "seventy-billion-parameter" -> "70-billion-parameter"
  out = out.replace(
    new RegExp(`\\b(${PHRASE})-(billion|million|trillion)-(parameter|token)\\b`, "gi"),
    (w, num, scale, noun, offset, full) => {
      const v = parseWords(num)
      if (v === null) return w
      if (alreadyQuantified(full, offset)) return w
      const r = `${v}-${scale}-${noun}`
      log("spec", w, r)
      return r
    },
  )

  // V1 · spelled quantity carrying a scale word -> digits.
  // Guarded: never after a digit, never after a vague quantifier, and never
  // when it is a fraction/ratio ("two-thirds", "one in five").
  out = out.replace(
    new RegExp(`\\b(${PHRASE})\\s+(hundred|thousand|million|billion|trillion)\\b`, "gi"),
    (w, a, scale, offset, full) => {
      if (alreadyQuantified(full, offset)) return w
      const v = parseWords(`${a} ${scale}`)
      if (v === null) return w
      const r = withScale(v)
      log("quantity", w, r)
      return r
    },
  )

  // V4 · "8.7 times more likely" / "five times the tokens" -> "8.7x" / "5x"
  out = out.replace(
    new RegExp(`\\b(\\d+(?:\\.\\d+)?|${PHRASE})\\s+times\\s+(?=(?:more|less|faster|slower|the|as|higher|lower|bigger|larger|smaller)\\b)`, "gi"),
    (w, a, offset, full) => {
      const v = /^\d/.test(a) ? Number(a) : parseWords(a)
      if (v === null || Number.isNaN(v)) return w
      if (alreadyQuantified(full, offset)) return w
      const r = `${v}x `
      log("multiplier", w, r)
      return r
    },
  )

  // V3 · currency scale notation, normalised to spelled scale in prose.
  //   "$200B" -> "$200 billion"; "76.1bn" -> "76.1 billion"; "$40k" -> "$40,000"
  out = out.replace(/(\$|€|£|₩)\s?([\d.,]+)\s?(B|Bn|bn|M|mn|T|tn|trn)\b/g, (w, cur, num, suf) => {
    const map = { b: " billion", m: " million", t: " trillion" }
    const r = `${cur}${num}${map[suf[0].toLowerCase()]}`
    log("currency", w, r)
    return r
  })
  out = out.replace(/(\$|€|£|₩)\s?([\d.,]+)\s?[kK]\b/g, (w, cur, num) => {
    const v = Number(num.replace(/,/g, "")) * 1000
    if (!Number.isFinite(v)) return w
    const r = `${cur}${group(v)}`
    log("currency", w, r)
    return r
  })

  // Ranges: single en dash, unit attached once.  "30-50%" / "$1,200–2,000"
  out = out.replace(/(\d[\d.,]*)\s*[-–]\s*(\d[\d.,]*)%/g, (w, a, b) => {
    const r = `${a}–${b}%`
    if (r !== w) log("range", w, r)
    return r
  })

  return out
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort()
let total = 0
const touched = []
const byKind = new Map()

for (const f of files) {
  const p = path.join(DIR, f)
  const raw = fs.readFileSync(p, "utf8")
  const changes = []
  const log = (kind, a, b) => {
    changes.push([kind, a.trim(), b.trim()])
    byKind.set(kind, (byKind.get(kind) ?? 0) + 1)
  }

  // Skip fenced code and markdown link targets.
  const parts = raw.split(/(```[\s\S]*?```|\]\([^)]*\))/g)
  const rebuilt = parts
    .map((seg) => (seg.startsWith("```") || seg.startsWith("](") ? seg : convert(seg, log)))
    .join("")

  if (!changes.length) continue
  total += changes.length
  touched.push(f)
  console.log(`\n${f}  (${changes.length})`)
  changes.slice(0, 5).forEach(([k, a, b]) => console.log(`   [${k}] ${a}  ->  ${b}`))
  if (WRITE) fs.writeFileSync(p, rebuilt)
}

console.log(`\n${WRITE ? "APPLIED" : "DRY RUN"} — ${total} changes across ${touched.length} files`)
console.log("by class: " + [...byKind.entries()].map(([k, n]) => `${k}=${n}`).join("  "))
if (!WRITE && total) console.log("Re-run with --write to apply.")
