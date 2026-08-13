/**
 * Numeric house style for the SYNAPTIC surface.
 *
 * The corpus sweep only ever ran over content/blog. The Chokepoint chapters and
 * the synaptic pages are prose too, and they were never in scope, so the
 * flagship shipped 26 spelled-out percentages while the blog reported clean:
 * "a gross margin north of fifty per cent", "an eighty-eight per cent gap",
 * "between eight hundred and a thousand per cent".
 *
 * Found by scanning the live page. An earlier source check missed it because
 * `git grep -E` silently ignores a (?!...) lookahead and returned zero matches.
 *
 * NOT TOUCHED: `TwentyPercentMirage`. It is a component identifier, appearing in
 * an import, a JSX tag and a module path. Renaming an identifier to satisfy a
 * prose rule breaks the build.
 *
 * Usage: node fix-synaptic-percent.mjs [--write]
 */
import fs from "node:fs"
import path from "node:path"

const WRITE = process.argv.includes("--write")

const SMALL = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90,
}
const W = Object.keys(SMALL).join("|")
const PHRASE = `(?:${W})(?:[-\\s](?:${W}))*`

function val(p) {
  return p
    .toLowerCase()
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .reduce((a, w) => a + (SMALL[w] ?? 0), 0)
}

/** Phrases whose arithmetic a generic rule would get wrong. Order matters. */
const SPECIAL = [
  [/\bhundredth of a per\\s*cent\b/gi, "0.01%"],
  [/\bhalf a per\\s*cent\b/gi, "0.5%"],
  [/\beight hundred and a thousand per\\s*cent\b/gi, "800% and 1,000%"],
]

function convert(text, log) {
  let out = text
  for (const [re, rep] of SPECIAL) {
    out = out.replace(re, (m) => {
      log(m, rep)
      return rep
    })
  }
  // "fifteen to twenty per cent" -> "15-20%"  (a span, so one dash, unit once)
  out = out.replace(new RegExp(`\\b(${PHRASE}) to (${PHRASE}) per\\s*cent\\b`, "gi"), (m, a, b) => {
    const r = `${val(a)}-${val(b)}%`
    log(m, r)
    return r
  })
  // the general case: "eighty-eight per cent" -> "88%"
  out = out.replace(new RegExp(`\\b(${PHRASE}) per\\s*cent\\b`, "gi"), (m, a) => {
    const r = `${val(a)}%`
    log(m, r)
    return r
  })
  // already a numeral: "above 80 per cent" -> "above 80%"
  out = out.replace(/\b(\d[\d.,]*) per\\s*cent\b/gi, (m, a) => {
    const r = `${a}%`
    log(m, r)
    return r
  })
  return out
}

/**
 * Files whose "per cent" IS the rule or the detector. A script must never edit
 * the instructions: ai-backup-writer.ts quotes "Forty Per Cent Escalated to the
 * Board" as the BAD example, and dispatch-slop.ts carries the pattern it
 * matches. Rewriting either silently deletes the rule it exists to enforce.
 */
const SKIP = [
  "src/lib/studio/ai-backup-writer.ts",
  "src/lib/studio/dispatch-slop.ts",
]

const files = []
;(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) {
      if (!/node_modules|\.next/.test(p)) walk(p)
    } else if (/\.(tsx|ts)$/.test(e.name)) files.push(p)
  }
})("src")

let total = 0
const touched = []
for (const p of files.sort()) {
  if (SKIP.some((x) => p.endsWith(x))) continue
  const raw = fs.readFileSync(p, "utf8")
  if (!/per\\s*cent(?!age|ile)/i.test(raw)) continue
  const changes = []
  const log = (a, b) => changes.push([a, b])
  // Skip lines carrying the component identifier; it contains "Percent".
  const rebuilt = raw
    .split("\n")
    .map((l) => (/TwentyPercentMirage/.test(l) ? l : convert(l, log)))
    .join("\n")
  if (!changes.length) continue
  total += changes.length
  touched.push(p)
  console.log(`\n${p}  (${changes.length})`)
  changes.forEach(([a, b]) => console.log(`   ${a}  ->  ${b}`))
  if (WRITE) fs.writeFileSync(p, rebuilt)
}
console.log(`\n${WRITE ? "APPLIED" : "DRY RUN"} — ${total} changes across ${touched.length} files`)
if (!WRITE && total) console.log("Re-run with --write to apply.")
