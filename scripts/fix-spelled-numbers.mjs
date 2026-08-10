/**
 * House style: numerals and symbols, never words.
 *
 * Tarry, 2026-08-10, quoting a live paragraph:
 *   "roughly 30 to 50 per cent ... For a four thousand dollar per month
 *    inference budget, expect twelve hundred to two thousand dollars per month"
 *   BAD.  Wants: "30-50%", "$4,000/month", "$1,200-2,000".
 *
 * So: spelled-out quantities become digits, currency gets its symbol, and a
 * range written with "to" between two figures becomes an en-dash range.
 * Values never change; only their rendering. Code fences and URLs are skipped.
 *
 * Usage:
 *   node scripts/fix-spelled-numbers.mjs           # dry run, shows every change
 *   node scripts/fix-spelled-numbers.mjs --write
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

/** "twelve hundred" -> 1200, "four thousand" -> 4000, "two" -> 2. */
function parseWords(phrase) {
  const words = phrase.toLowerCase().replace(/-/g, " ").split(/\s+/).filter(Boolean)
  let total = 0
  let current = 0
  let sawAny = false
  for (const w of words) {
    if (w === "and") continue
    if (w in SMALL) {
      current += SMALL[w]
      sawAny = true
    } else if (w in SCALE) {
      if (current === 0) current = 1
      const s = SCALE[w]
      if (s >= 1000) {
        total += current * s
        current = 0
      } else {
        current *= s
      }
      sawAny = true
    } else return null
  }
  if (!sawAny) return null
  return total + current
}

const NUM = "(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|trillion)"
const PHRASE = `${NUM}(?:[-\\s]${NUM})*`

/**
 * Big money keeps its scale word, because "$30,000,000,000" is unreadable and
 * nobody writes it. Returns [number, scaleWord] so a range can share one scale.
 */
function scaleOf(n) {
  if (n >= 1e12) return [n / 1e12, " trillion"]
  if (n >= 1e9) return [n / 1e9, " billion"]
  if (n >= 1e6) return [n / 1e6, " million"]
  return [n, ""]
}
const trim = (x) => String(Number(x.toFixed(2)))
const fmt = (n) => {
  const [v, s] = scaleOf(n)
  return s ? `${trim(v)}${s}` : v.toLocaleString("en-GB")
}

/**
 * A bare scale word ("billion dollars") is only a number when nothing else is
 * already quantifying it. These would each be corrupted by a blind replace:
 *   "2.7 billion dollars"        -> "2.7 $1 billion"
 *   "a couple of hundred dollars"-> "a couple of $100"
 *   "a few thousand dollars"     -> "a few $1,000"
 * So refuse the match whenever a digit or a vague quantifier sits in front.
 */
function guardedByQuantifier(text, offset) {
  const before = text.slice(Math.max(0, offset - 24), offset)
  return /[\d.,]\s*$/.test(before) ||
    /\b(?:few|couple of|couple|several|many|dozen|dozens of|hundreds of|thousands of|millions of|billions of)\s+$/i.test(before)
}

/**
 * "a billion dollars": the article IS the number, so consume it.
 * "a four thousand dollar budget": the article is a real article, so keep it.
 * Distinguished by whether the phrase opens on a scale word.
 */
const articleIsTheNumber = (phrase) =>
  /^(?:hundred|thousand|million|billion|trillion)\b/i.test(phrase.trim())

/** A four-digit year must never be read as the low end of a range. */
const isYear = (s) => /^(?:19|20)\d{2}$/.test(String(s).replace(/[.,]/g, ""))

function convert(text, log) {
  let out = text

  // "twelve hundred to two thousand dollars" -> "$1,200-2,000"
  // "three to four trillion dollars"         -> "$3-4 trillion"  (shared scale)
  out = out.replace(
    new RegExp(`\\b(${PHRASE})\\s+to\\s+(${PHRASE})\\s+dollars\\b`, "gi"),
    (whole, a, b) => {
      let x = parseWords(a), y = parseWords(b)
      if (x === null || y === null) return whole
      // "three to four trillion" parses the low side as bare 3; lift it to the
      // high side's scale so the range means what it says.
      const [, hiScale] = scaleOf(y)
      let rep
      if (hiScale) {
        const div = { " trillion": 1e12, " billion": 1e9, " million": 1e6 }[hiScale]
        if (x < div) x = x * div
        rep = `$${trim(x / div)}-${trim(y / div)}${hiScale}`
      } else {
        rep = `$${fmt(x)}-${fmt(y)}`
      }
      log(whole, rep)
      return rep
    },
  )

  // "four thousand dollar per month" / "a billion dollars a year"
  //   -> "$4,000/month" / "$1 billion/year"
  // The optional leading article is CONSUMED: "a billion dollars" must not
  // become "a $1 billion".
  out = out.replace(
    new RegExp(`\\b(?:(an?)\\s+)?(${PHRASE})\\s+dollars?\\s+(?:per|a)\\s+(month|year|week|day)\\b`, "gi"),
    (whole, _art, a, unit, offset, full) => {
      const x = parseWords(a)
      if (x === null) return whole
      if (guardedByQuantifier(full, offset)) return whole
      const keep = _art && !articleIsTheNumber(a) ? `${_art} ` : ""
      const rep = `${keep}$${fmt(x)}/${unit.toLowerCase()}`
      log(whole, rep)
      return rep
    },
  )

  // plain "four thousand dollars" / "a billion dollars" -> "$4,000" / "$1 billion"
  out = out.replace(
    new RegExp(`\\b(?:(an?)\\s+)?(${PHRASE})\\s+dollars?\\b`, "gi"),
    (whole, _art, a, offset, full) => {
      const x = parseWords(a)
      if (x === null) return whole
      if (guardedByQuantifier(full, offset)) return whole
      const keep = _art && !articleIsTheNumber(a) ? `${_art} ` : ""
      const rep = `${keep}$${fmt(x)}`
      log(whole, rep)
      return rep
    },
  )

  // "30 to 50%" -> "30-50%". Never when the left side is a year: "from 2004 to
  // 69%" is a start date and a value, not a range.
  out = out.replace(/\b(\d[\d.,]*)\s+to\s+(\d[\d.,]*)%/g, (whole, a, b) => {
    if (isYear(a)) return whole
    log(whole, `${a}-${b}%`)
    return `${a}-${b}%`
  })

  // "$4,000 per month" -> "$4,000/month"
  out = out.replace(/(\$[\d.,]+)\s+(?:per|a)\s+(month|year|week|day)\b/gi, (whole, amt, unit) => {
    log(whole, `${amt}/${unit.toLowerCase()}`)
    return `${amt}/${unit.toLowerCase()}`
  })

  return out
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort()
let total = 0
const touched = []

for (const f of files) {
  const p = path.join(DIR, f)
  const raw = fs.readFileSync(p, "utf8")
  const changes = []
  const log = (a, b) => changes.push(`${a}  ->  ${b}`)

  // Skip fenced code, and protect markdown link targets.
  const parts = raw.split(/(```[\s\S]*?```|\]\([^)]*\))/g)
  const rebuilt = parts
    .map((seg) => (seg.startsWith("```") || seg.startsWith("](") ? seg : convert(seg, log)))
    .join("")

  if (!changes.length) continue
  total += changes.length
  touched.push(f)
  console.log(`\n${f}`)
  changes.forEach((c) => console.log(`   ${c}`))
  if (WRITE) fs.writeFileSync(p, rebuilt)
}

console.log(`\n${WRITE ? "APPLIED" : "DRY RUN"} — ${total} conversions across ${touched.length} files`)
if (!WRITE && total) console.log("Re-run with --write to apply.")
