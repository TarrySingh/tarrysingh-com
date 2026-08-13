/** Count HARD FIGURES per paragraph, not just percentages. */
import fs from "node:fs"
import path from "node:path"
const DIR = "content/blog"
// a percentage, a currency amount, a multiplier, or a number carrying a scale
// word / unit / thousands separator. Bare small integers ("three cohorts") are
// not counted: they are ordinary English, not a statistic.
const FIG = /\d[\d.,]*\s?%|[$€£₩¥₦]\s?\d[\d.,]*(?:\s?(?:million|billion|trillion|thousand))?|\d[\d.,]*\s?x\b|\d[\d.,]*\s?(?:million|billion|trillion|thousand)\b|\b\d{1,3}(?:,\d{3})+\b|\d[\d.,]*\s?(?:GW|MW|kW|TWh|GB|TB|PB|percentage points?|megawatts?|gigawatts?|tokens?|parameters?|hours?|minutes?)\b/gi
const rows = []
for (const f of fs.readdirSync(DIR).filter(f=>f.endsWith(".mdx"))) {
  const raw = fs.readFileSync(path.join(DIR,f),"utf8")
  const body = raw.replace(/^---[\s\S]*?\n---\n/, "").replace(/```[\s\S]*?```/g,"")
  const dumps = []
  for (const p of body.split(/\n\s*\n/)) {
    const t = p.trim()
    if (t.length < 120 || /^[#>|\-*!]/.test(t)) continue
    const n = (t.match(FIG) ?? []).length
    if (n >= 4) dumps.push({n, t})
  }
  if (dumps.length) rows.push({f, count: dumps.length, worst: Math.max(...dumps.map(d=>d.n)), dumps})
}
rows.sort((a,b)=> b.worst - a.worst || b.count - a.count)
const totalP = rows.reduce((s,r)=>s+r.count,0)
console.log(`${rows.length} files, ${totalP} dump paragraphs (4+ hard figures)\n`)
for (const r of rows) console.log(`  ${String(r.worst).padStart(2)} worst  ${String(r.count).padStart(2)} paras  ${r.f}`)
if (process.argv[2]) {
  const r = rows.find(x=>x.f.includes(process.argv[2]))
  if (r) for (const d of r.dumps) console.log(`\n[${d.n} figures] ${d.t.slice(0,400)}`)
}
