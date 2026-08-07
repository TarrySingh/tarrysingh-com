/**
 * Scan published Dispatches against the slop contract.
 *
 * Single source of truth is src/lib/studio/dispatch-slop.ts — the same scanner
 * the daily writer runs post-generation, so a local scan and the publish-path
 * log can never disagree.
 *
 * Usage:
 *   npm run blog:slop            # ranked summary across the corpus
 *   npm run blog:slop -- --hard  # hard violations only
 *   npm run blog:slop -- <slug>  # one post, with every matching line
 */
import fs from "node:fs"
import path from "node:path"
import { scanDispatchSlop, summariseSlop } from "../src/lib/studio/dispatch-slop"

const args = process.argv.slice(2)
const hardOnly = args.includes("--hard")
const target = args.find((a) => !a.startsWith("--"))

const DIR = path.join(process.cwd(), "content", "blog")
const files = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".mdx"))
  .filter((f) => (target ? f.includes(target) : true))
  .sort()

const perFile: { file: string; hard: number; soft: number; summary: string }[] = []
const byRule = new Map<string, { n: number; files: Set<string>; label: string; sev: string }>()

for (const f of files) {
  const raw = fs.readFileSync(path.join(DIR, f), "utf8")
  let hits = scanDispatchSlop(raw)
  if (hardOnly) hits = hits.filter((h) => h.severity === "hard")
  if (hits.length === 0) continue

  const hard = hits.filter((h) => h.severity === "hard").length
  perFile.push({ file: f, hard, soft: hits.length - hard, summary: summariseSlop(hits) })

  for (const h of hits) {
    const e = byRule.get(h.id) ?? { n: 0, files: new Set<string>(), label: h.label, sev: h.severity }
    e.n++
    e.files.add(f)
    byRule.set(h.id, e)
  }

  if (target) {
    console.log(`\n${f}`)
    for (const h of hits) {
      console.log(`  [${h.severity}] ${h.id}: ${h.match}`)
    }
  }
}

if (target) process.exit(0)

console.log(`scanned ${files.length} posts · ${perFile.length} with violations\n`)
console.log("BY RULE")
;[...byRule.entries()]
  .sort((a, b) => b[1].files.size - a[1].files.size)
  .forEach(([id, e]) =>
    console.log(
      `  ${e.sev === "hard" ? "HARD" : "soft"}  ${String(e.files.size).padStart(3)} files  ${String(e.n).padStart(4)} hits  ${id} — ${e.label}`,
    ),
  )

console.log("\nWORST FILES")
perFile
  .sort((a, b) => b.hard - a.hard || b.soft - a.soft)
  .slice(0, 15)
  .forEach((p) =>
    console.log(`  ${String(p.hard).padStart(3)} hard ${String(p.soft).padStart(3)} soft  ${p.file}`),
  )
