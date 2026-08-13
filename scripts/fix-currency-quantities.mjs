/**
 * Spelled quantities that are ANCHORED BY A CURRENCY WORD.
 *
 * This is deliberately the narrow case. An earlier, broader attempt tried to
 * convert every spelled quantity carrying a scale word and kept producing
 * errors on literary prose, because English uses the same words rhetorically:
 *
 *   "it needs only a thousand prudent people"   -> "1,000 prudent people" WRONG
 *   "we point it at a million more things"      -> "1 million more things"  WRONG
 *   "one to one billion"                        -> "1-1 billion"            WRONG
 *
 * A following currency word removes the ambiguity: "some three hundred billion
 * euros" is a statistic, always. So only that shape is converted, and the
 * currency comes from the word already in the text, never invented.
 *
 * FRACTION GUARD. "half a trillion dollars" and "a quarter of a trillion euros"
 * must not be touched: converting the tail gives "up to half $1 trillion".
 * Deliberate fractions are protected house style anyway.
 *
 * Usage: node fix-currency-quantities.mjs [--write]
 */
import fs from "node:fs"
import path from "node:path"

const WRITE = process.argv.includes("--write")

const UNIT = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30,
  forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
}
const SCALE = { thousand: 1000, million: 1e6, billion: 1e9, trillion: 1e12 }
const CUR = { euro: "€", euros: "€", dollar: "$", dollars: "$", pound: "£", pounds: "£" }

const UW = Object.keys(UNIT).join("|")
// `[-\s]+` and NOT `[-\s]`: the class matches exactly ONE character, and a JSX
// wrap puts a newline plus ten spaces between words. "put about five\n
// hundred million euros" therefore never matched, and the phrase shipped.
// Fourth distinct line-wrap failure in this work; every one came from
// assuming a single separator.
const NUM = `(?:a|an|${UW})(?:[-\\s]+(?:and[-\\s]+)?(?:${UW}|hundred))*`
const BIG = Object.keys(SCALE).join("|")
const CW = Object.keys(CUR).join("|")

/** A fraction in front means the phrase is idiomatic and stays as words. */
const FRACTION = /\b(?:half|a third of|a quarter of|two-thirds of|three-quarters of|third of|quarter of)\s*$/i

function parse(p) {
  let total = 0, cur = 0, seen = false
  for (const x of p.toLowerCase().replace(/-/g, " ").split(/\s+/).filter((w) => w && w !== "and")) {
    if (x === "a" || x === "an") { seen = true; continue }
    if (x in UNIT) { cur += UNIT[x]; seen = true; continue }
    if (x === "hundred") { cur = (cur || 1) * 100; seen = true; continue }
    if (x in SCALE) { total += (cur || 1) * SCALE[x]; cur = 0; seen = true; continue }
    return null
  }
  return seen ? total + cur : null
}

/** Value expressed against its own scale word: 300000000000 -> "300 billion". */
function inScale(n, big) {
  const s = SCALE[big.toLowerCase()]
  return `${+(n / s).toFixed(2)}`
}

function convert(text, log) {
  let out = text

  // RANGE first: "forty to fifty billion dollars" -> "$40-50 billion"
  out = out.replace(
    new RegExp(`\\b(${NUM})\\s+to\\s+(${NUM})[-\\s]+(${BIG})\\s+(${CW})\\b`, "gi"),
    (m, a, b, big, cw, off, full) => {
      if (FRACTION.test(full.slice(Math.max(0, off - 24), off))) return m
      const lo = parse(`${a} ${big}`), hi = parse(`${b} ${big}`)
      if (lo === null || hi === null) return m
      const r = `${CUR[cw.toLowerCase()]}${inScale(lo, big)}-${inScale(hi, big)} ${big.toLowerCase()}`
      log(m, r)
      return r
    },
  )

  // SINGLE: "some three hundred billion euros" -> "some €300 billion"
  out = out.replace(
    new RegExp(`\\b(${NUM})[-\\s]+(${BIG})\\s+(${CW})\\b`, "gi"),
    (m, a, big, cw, off, full) => {
      if (FRACTION.test(full.slice(Math.max(0, off - 24), off))) return m
      const v = parse(`${a} ${big}`)
      if (v === null) return m
      // Sums below a million take full digits, per house style: "$4,000", not
      // "$4 thousand". Without this, "a thousand dollars" became "$1 thousand".
      const r =
        big.toLowerCase() === "thousand"
          ? `${CUR[cw.toLowerCase()]}${v.toLocaleString("en-GB")}`
          : `${CUR[cw.toLowerCase()]}${inScale(v, big)} ${big.toLowerCase()}`
      log(m, r)
      return r
    },
  )
  return out
}

const files = []
;(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) { if (!/node_modules|\.next/.test(p)) walk(p) }
    else if (/\.tsx$/.test(e.name)) files.push(p)
  }
})("src")

let total = 0
const touched = []
for (const p of files.sort()) {
  const raw = fs.readFileSync(p, "utf8")
  const changes = []
  // Flatten only for matching across a JSX line wrap would reorder the file, so
  // match on the raw text and allow whitespace (including newlines) inside.
  const out = convert(raw, (a, b) => changes.push([a.replace(/\s+/g, " "), b]))
  if (!changes.length) continue
  total += changes.length
  touched.push(p)
  console.log(`\n${p.split("/").pop()}  (${changes.length})`)
  changes.forEach(([a, b]) => console.log(`   ${a}  ->  ${b}`))
  if (WRITE) fs.writeFileSync(p, out)
}
console.log(`\n${WRITE ? "APPLIED" : "DRY RUN"} — ${total} changes across ${touched.length} files`)
if (!WRITE && total) console.log("Re-run with --write to apply.")
