#!/usr/bin/env node
// Word-gate for THE ENGINE ROOM. Counts RENDERED prose words per chapter and the
// total, the way a reader sees them: HTML comments, fenced code blocks, and the
// [[INSTRUMENT: ...]] placement markers are excluded; markdown syntax is stripped.
// Target: exactly 30,000 across P + Ch1..Ch12.
import fs from "node:fs"
import path from "node:path"

const DIR = path.resolve("docs/Loop-Harness-Engineering/prose")
const ORDER = ["P", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
const BUDGET = { P: 1000, "1": 2000, "2": 2200, "3": 2000, "4": 2200, "5": 1900, "6": 2400, "7": 5200, "8": 2500, "9": 2500, "10": 1900, "11": 2100, "12": 2100 }

function renderedWords(md) {
  let s = md
  s = s.replace(/^<!--[\s\S]*?-->/m, "")               // leading HTML comment
  s = s.replace(/```[\s\S]*?```/g, "")                  // fenced code blocks
  s = s.replace(/^\s*\[\[INSTRUMENT:[^\]]*\]\]\s*$/gm, "") // instrument markers
  s = s.replace(/`[^`]*`/g, " ")                        // inline code
  s = s.replace(/^#{1,6}\s+/gm, "")                     // heading hashes
  s = s.replace(/^\s*>\s?/gm, "")                       // blockquote markers
  s = s.replace(/[*_]{1,3}/g, "")                       // emphasis
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")         // links -> text
  const words = s.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w))
  return words.length
}

let total = 0
const rows = []
for (const id of ORDER) {
  const f = path.join(DIR, `ch-${id}.md`)
  if (!fs.existsSync(f)) { rows.push([id, "MISSING", BUDGET[id] || 0, ""]); continue }
  const n = renderedWords(fs.readFileSync(f, "utf8"))
  total += n
  const b = BUDGET[id] || 0
  const d = n - b
  rows.push([id, n, b, (d >= 0 ? "+" : "") + d])
}
const w = (s, n) => String(s).padEnd(n)
const wr = (s, n) => String(s).padStart(n)
console.log(`${w("ch", 5)}${wr("words", 8)}${wr("budget", 8)}${wr("delta", 8)}`)
for (const [id, n, b, d] of rows) console.log(`${w(id, 5)}${wr(n, 8)}${wr(b, 8)}${wr(d, 8)}`)
console.log("-".repeat(29))
console.log(`${w("TOTAL", 5)}${wr(total, 8)}${wr(30000, 8)}${wr((total - 30000 >= 0 ? "+" : "") + (total - 30000), 8)}`)
console.log(`\ngap to 30,000: ${30000 - total}`)
