/**
 * Corpus-wide: "per cent" -> "%", and spelled-out numbers in front of it -> digits.
 *
 * Tarry, 2026-08-10, with examples:
 *   "62 per cent of organisations"          BAD
 *   "62% of organisations"                  GOOD
 *   "Forty Per Cent Escalated to the Board" BAD
 *   "40% Escalated to the Board"            GOOD
 *
 * An earlier rule of mine said to prefer "per cent" in prose and to convert
 * figures to their spoken form, which is exactly backwards: it made the phrasing
 * verbose AND pushed spelled-out numbers to the front of sentences. This undoes
 * both, deterministically. Values never change; only their rendering.
 *
 * Usage:
 *   node scripts/fix-percent-style.mjs           # dry run
 *   node scripts/fix-percent-style.mjs --write   # apply
 */
import fs from "node:fs"
import path from "node:path"

const WRITE = process.argv.includes("--write")
const DIR = path.join(process.cwd(), "content", "blog")

const UNITS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19,
}
const TENS = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90,
}

/** "sixty-two" -> 62, "forty" -> 40, "twelve" -> 12. Null if not a number word. */
function wordToNumber(raw) {
  const s = raw.toLowerCase().replace(/\s+/g, "-")
  if (s in UNITS) return UNITS[s]
  if (s in TENS) return TENS[s]
  const m = s.match(/^([a-z]+)-([a-z]+)$/)
  if (m && m[1] in TENS && m[2] in UNITS && UNITS[m[2]] < 10) {
    return TENS[m[1]] + UNITS[m[2]]
  }
  return null
}

const NUMWORD =
  "(?:twenty|thirty|forty|fourty|fifty|sixty|seventy|eighty|ninety)(?:[-\\s](?:one|two|three|four|five|six|seven|eight|nine))?|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen"

function convert(text) {
  let n = 0
  let out = text

  // 1. Spelled-out number + "per cent"/"percent"  ->  digits + %
  out = out.replace(
    new RegExp(`\\b(${NUMWORD})\\s+per\\s?cent\\b`, "gi"),
    (whole, word) => {
      const v = wordToNumber(word.replace(/‑/g, "-"))
      if (v === null) return whole
      n++
      return `${v}%`
    },
  )

  // 2. Digits + "per cent"/"percent"  ->  digits + %
  out = out.replace(/(\d[\d.,]*)\s*per\s?cent\b/gi, (_w, d) => {
    n++
    return `${d}%`
  })

  // 3. Bare "per cent"/"percentage point(s)" left over: only collapse the
  //    two-word spelling to one word where it is not attached to a figure, so
  //    "percentage points" stays intact and readable.
  out = out.replace(/\bper cent\b/g, () => {
    n++
    return "%"
  })
  out = out.replace(/\bPer Cent\b/g, () => {
    n++
    return "%"
  })

  // Tidy artefacts: "% of" spacing, and a stray space before %.
  out = out.replace(/\s+%/g, "%")
  return { out, n }
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort()
let touched = 0
let total = 0
const report = []

for (const f of files) {
  const p = path.join(DIR, f)
  const raw = fs.readFileSync(p, "utf8")
  // Never rewrite inside fenced code blocks.
  const parts = raw.split(/(```[\s\S]*?```)/g)
  let n = 0
  const rebuilt = parts
    .map((seg) => {
      if (seg.startsWith("```")) return seg
      const r = convert(seg)
      n += r.n
      return r.out
    })
    .join("")

  if (n === 0) continue
  touched++
  total += n
  report.push({ f, n })
  if (WRITE) fs.writeFileSync(p, rebuilt)
}

console.log(`${WRITE ? "APPLIED" : "DRY RUN"} — ${touched} files, ${total} conversions\n`)
report.sort((a, b) => b.n - a.n).slice(0, 15).forEach((r) => console.log(`  ${String(r.n).padStart(3)}  ${r.f}`))
if (!WRITE && touched) console.log(`\nRe-run with --write to apply.`)
