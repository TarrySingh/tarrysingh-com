/**
 * Fact-integrity signature diff for content rewrites.
 *
 * When agents de-slop published articles, the ONLY unacceptable failure is a
 * changed fact. Style can be argued about; a number that silently moved, a
 * link that now points elsewhere, or an invented statistic is a credibility
 * failure. The anti-slop contract is explicit about this: "never invent a
 * detail to beat the slop scanner. A fake specific is worse than a generic
 * sentence."
 *
 * So: extract a signature from each file (every number, every URL, every
 * four-digit year) BEFORE the rewrite and AFTER, and diff the multisets. Prose
 * may change freely; the signature must not.
 *
 * Usage:
 *   node scripts/fact-integrity.mjs <git-ref>      # default: HEAD
 *
 * Exit 1 if any file's signature changed.
 */
import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"

const REF = process.argv[2] || "HEAD"
const DIR = path.join(process.cwd(), "content", "blog")

/** Numbers, URLs and years — the things that must survive a style edit. */
function signature(text) {
  // Strip frontmatter and fenced code: not prose, and diagrams are rewritten
  // wholesale when added.
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, "").replace(/```[\s\S]*?```/g, "")
  const urls = (body.match(/https?:\/\/[^\s)\]]+/g) ?? []).map((u) => u.replace(/[.,;]+$/, ""))
  // Numbers with their magnitude words attached where present, so "10.3 million"
  // and "10.3" are distinguishable.
  const nums = (
    body.match(/\b\d[\d,.]*\s?(?:%|per cent|percent|bn|billion|million|trillion|k|MW|GW|TWh|ZB|PB|TB)?/gi) ?? []
  )
    .map((n) =>
      n
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        // Trailing sentence punctuation is NOT part of the fact. Restructuring a
        // sentence legitimately moves a comma or full stop next to a number, and
        // that must not read as fact drift.
        .replace(/[.,;:]+$/, "")
        // "70%" and "70 per cent" are the same fact in different house styles;
        // normalise so only VALUE changes surface here. (Style is the scanner's
        // job, via percent-style-mixed.)
        .replace(/\s?(?:per cent|percent)$/, "%")
        .replace(/\s?%$/, "%"),
    )
    .filter((n) => n.length > 0)
  return {
    urls: urls.sort(),
    nums: nums.sort(),
  }
}

function multisetDiff(a, b) {
  const count = (arr) => {
    const m = new Map()
    for (const x of arr) m.set(x, (m.get(x) ?? 0) + 1)
    return m
  }
  const ca = count(a)
  const cb = count(b)
  const lost = []
  const gained = []
  for (const [k, n] of ca) {
    const d = n - (cb.get(k) ?? 0)
    if (d > 0) lost.push(`${k}${d > 1 ? ` ×${d}` : ""}`)
  }
  for (const [k, n] of cb) {
    const d = n - (ca.get(k) ?? 0)
    if (d > 0) gained.push(`${k}${d > 1 ? ` ×${d}` : ""}`)
  }
  return { lost, gained }
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort()
let bad = 0
let checked = 0
const report = []

for (const f of files) {
  let before
  try {
    before = execSync(`git show ${REF}:content/blog/${f}`, {
      encoding: "utf8",
      maxBuffer: 40 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    })
  } catch {
    continue // new file, nothing to compare
  }
  checked++
  const after = fs.readFileSync(path.join(DIR, f), "utf8")
  const sa = signature(before)
  const sb = signature(after)

  const u = multisetDiff(sa.urls, sb.urls)
  const n = multisetDiff(sa.nums, sb.nums)
  if (u.lost.length || u.gained.length || n.lost.length || n.gained.length) {
    bad++
    report.push({ f, u, n })
  }
}

console.log(`fact-integrity vs ${REF}: checked ${checked} posts, ${bad} with signature drift\n`)
for (const r of report) {
  console.log(r.f)
  if (r.u.lost.length) console.log(`   URL lost:    ${r.u.lost.join("  ")}`)
  if (r.u.gained.length) console.log(`   URL gained:  ${r.u.gained.join("  ")}`)
  if (r.n.lost.length) console.log(`   num lost:    ${r.n.lost.slice(0, 12).join("  ")}`)
  if (r.n.gained.length) console.log(`   num gained:  ${r.n.gained.slice(0, 12).join("  ")}`)
  console.log("")
}
if (bad) {
  console.log(`REVIEW REQUIRED: ${bad} file(s) changed a number or a link.`)
  process.exit(1)
}
console.log("clean — every number and link survived the rewrite.")
