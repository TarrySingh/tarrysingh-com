/**
 * Second numeric pass: the classes the first sweep could not reach.
 *
 * fix-numeric-style.mjs converted 295 figures but left 4 classes behind, and
 * one of them was its own bug. Its "quantity" rule read
 *   (PHRASE)\s+(hundred|thousand|million|billion|trillion)
 * where PHRASE itself already contained the scale words, so on "Eighty billion"
 * the leading group greedily swallowed both words and the rule then demanded a
 * SECOND scale word that was not there. It therefore only ever fired on
 * three-word forms like "two hundred thousand". Every two-word quantity in the
 * corpus survived. Fixed here by matching one maximal run of number-words and
 * converting it whole.
 *
 * Classes handled:
 *   spelled-quantity    "Eighty billion"        -> "80 billion"
 *   spelled-unit        "Forty-two megawatts"   -> "42 megawatts"
 *   currency-as-word    "15 million euros"      -> "EUR 15 million" (symbol)
 *   spelled-multiplier  "twenty times the"      -> "20x the"
 *
 * Guards carried over from the first sweep, both of which caught real
 * corruption in dry run before anything was written:
 *   - never convert after a digit ("$8.5 billion" must not become "$8.5 1bn")
 *   - never convert after a vague quantifier ("a few thousand engineers")
 * Plus one new guard: never convert a fraction or ratio, and never touch a
 * number-word that is part of a proper noun or a hyphenated adjective phrase
 * that reads as a name.
 *
 * Usage:
 *   node scripts/fix-numeric-residue.mjs            # dry run, prints every change
 *   node scripts/fix-numeric-residue.mjs --write
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
const ALL = Object.keys(SMALL).concat(Object.keys(SCALE))
/**
 * A run MUST START with a small number-word. A bare scale word is not a spelled
 * quantity and matching one corrupts ordinary English, which the dry run proved
 * on three shapes before anything was written:
 *   "more than a million observations" -> "a 1 million observations"
 *   "multi-million-euro gas leaks"     -> "multi-1 million-euro gas leaks"
 *   "one and a third million people"   -> "one and a third 1 million people"
 */
const RUN = `(?:${Object.keys(SMALL).join("|")})(?:[-\\s](?:and[-\\s])?(?:${ALL.join("|")}))*`

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
/** Big round values keep the scale word: "80 billion", not "80,000,000,000". */
function withScale(n) {
  if (n >= 1e12 && n % 1e11 === 0) return `${+(n / 1e12).toFixed(2)} trillion`
  if (n >= 1e9 && n % 1e8 === 0) return `${+(n / 1e9).toFixed(2)} billion`
  if (n >= 1e6 && n % 1e5 === 0) return `${+(n / 1e6).toFixed(2)} million`
  return group(n)
}

const UNITS =
  "percentage points?|gigawatts?|megawatts?|kilowatts?|terawatt-hours?|GW|MW|kW|TWh|" +
  "gigabytes?|terabytes?|petabytes?|GB|TB|PB|kilometres?|kilometers?|metres?|meters?|miles?|" +
  "kilograms?|tonnes?|seconds?|minutes?|hours?|milliseconds?|parameters?|tokens?|GPUs?"

/** Vague quantifiers and preceding digits both make a scale word legitimate. */
function blocked(full, offset) {
  const before = full.slice(Math.max(0, offset - 24), offset)
  // `\d[.,]?` and NOT `[\d.,]`: the loose class treats a sentence-ending full
  // stop as "a digit already quantifies this", so every spelled quantity that
  // OPENED a sentence was silently skipped. "GAAP margins of 74.9%. Eighty
  // billion in fresh buyback" was left alone for that reason, and so were
  // "Forty-two megawatts.", "Twenty thousand tokens ago", "Forty gigabytes".
  // This is the same guard the first sweep used, which is why it under-fired.
  // A bare digit, with no trailing punctuation allowed. Permitting "." here
  // still swallowed a sentence boundary: "...on May 21. Ninety-five thousand
  // students" read as already-quantified. Real cases always end on the digit
  // itself ("$8.5 billion", "1,000 tonnes"), so nothing is lost.
  return /\d\s*$/.test(before) ||
    /\b(?:few|couple of|couple|several|many|dozens? of|tens of|hundreds of|thousands of|millions of|billions of)\s+$/i.test(before)
}

const CUR = { dollars: "$", euros: "€", pounds: "£", yen: "¥", won: "₩" }

function convert(text, log) {
  let out = text

  // currency-as-word: "15 million euros" -> "EUR 15 million"; "2.7 billion dollars" -> "$2.7 billion"
  out = out.replace(
    /\b(\d[\d.,]*)\s+(hundred|thousand|million|billion|trillion)?\s*(dollars|euros|pounds|yen|won)\b/gi,
    (w, num, scale, cur) => {
      const r = `${CUR[cur.toLowerCase()]}${num}${scale ? ` ${scale.toLowerCase()}` : ""}`
      log("currency", w, r)
      return r
    },
  )

  // spelled-multiplier: "twenty times the" -> "20x the"
  out = out.replace(
    new RegExp(`\\b(${RUN})\\s+times\\s+(?=(?:more|less|faster|slower|higher|lower|bigger|larger|smaller|the)\\b)`, "gi"),
    (w, a, offset, full) => {
      const v = parseWords(a)
      if (v === null || blocked(full, offset)) return w
      const r = `${v}x `
      log("multiplier", w, r)
      return r
    },
  )

  // spelled-unit: "Forty-two megawatts" -> "42 megawatts". The UNIT stays a word.
  out = out.replace(
    new RegExp(`\\b(${RUN})\\s+(${UNITS})\\b`, "gi"),
    (w, a, unit, offset, full) => {
      const v = parseWords(a)
      if (v === null || blocked(full, offset)) return w
      const r = `${withScale(v)} ${unit}`
      log("unit", w, r)
      return r
    },
  )

  // spelled-quantity: one maximal run of number-words carrying a scale word.
  // Only convert when the value reaches 100, so counts of one to nine stay as
  // words per house style ("three regulators" is correct English).
  out = out.replace(new RegExp(`\\b(${RUN})\\b`, "gi"), (w, _a, offset, full) => {
    if (blocked(full, offset)) return w
    if (!/\b(hundred|thousand|million|billion|trillion)\b/i.test(w)) return w
    // A hyphenated compound adjective needs a rewrite this rule cannot do:
    // "a seven-hundred-billion-dollar capex programme" must become
    // "a $700 billion capex programme", which means dropping the trailing
    // currency word too. Mechanical substitution would leave "700
    // billion-dollar". Left for hand-editing; the gate still reports them.
    if (full[offset + w.length] === "-") return w
    // A Title Case run running into another capitalised word is a NAME, not a
    // figure: Nigeria's "Three Million Technical Talent programme" must not be
    // renamed to "3 million Technical Talent". Rewriting an institution is a
    // factual error, not a style fix.
    if (/^[A-Z]/.test(w) && /^\s+[A-Z]/.test(full.slice(offset + w.length, offset + w.length + 3))) return w
    const v = parseWords(w)
    if (v === null || v < 100) return w
    const r = withScale(v)
    log("quantity", w, r)
    return r
  })

  // Currency, a second time. The quantity rule above can MINT a violation the
  // first currency pass could not see: "twenty-six trillion dollars" is not a
  // digit-led amount until the quantity rule has turned it into "26 trillion
  // dollars". Re-running the same rule closes the ordering gap.
  out = out.replace(
    /\b(\d[\d.,]*)\s+(hundred|thousand|million|billion|trillion)?\s*(dollars|euros|pounds|yen|won)\b/gi,
    (w, num, scale, cur) => {
      const r = `${CUR[cur.toLowerCase()]}${num}${scale ? ` ${scale.toLowerCase()}` : ""}`
      log("currency", w, r)
      return r
    },
  )

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

  // Skip fenced code and markdown link TARGETS. Link TEXT is prose and is
  // converted: "[110 billion won, or about $73 million](url)" is a sentence.
  const parts = raw.split(/(```[\s\S]*?```|\]\([^)]*\))/g)
  const rebuilt = parts
    .map((seg) => (seg.startsWith("```") || seg.startsWith("](") ? seg : convert(seg, log)))
    .join("")

  if (!changes.length) continue
  total += changes.length
  touched.push(f)
  console.log(`\n${f}  (${changes.length})`)
  changes.forEach(([k, a, b]) => console.log(`   [${k}] ${a}  ->  ${b}`))
  if (WRITE) fs.writeFileSync(p, rebuilt)
}

console.log(`\n${WRITE ? "APPLIED" : "DRY RUN"} — ${total} changes across ${touched.length} files`)
console.log("by class: " + [...byKind.entries()].map(([k, n]) => `${k}=${n}`).join("  "))
if (!WRITE && total) console.log("Re-run with --write to apply.")
