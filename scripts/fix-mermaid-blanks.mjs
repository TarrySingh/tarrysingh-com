/**
 * Repair Mermaid diagrams shattered by the citation-split bug.
 *
 * Same root cause as scripts/fix-citation-splits.mjs: the writer joined the
 * model's response text blocks with "\n\n". When a citation boundary fell
 * INSIDE a ```mermaid fence, blank lines were injected into the diagram source.
 * Mermaid's parser treats those as a break in the graph definition, so the
 * diagram fails to render — which is why charts stopped appearing.
 *
 * The prose repair deliberately skips fenced regions, so it left these alone.
 * This pass strips blank lines inside ```mermaid fences only. Nothing else in
 * the file is touched: no other fence language, no prose, no frontmatter.
 *
 * Usage:
 *   node scripts/fix-mermaid-blanks.mjs          # dry run
 *   node scripts/fix-mermaid-blanks.mjs --write  # apply
 */
import fs from "node:fs"
import path from "node:path"

const WRITE = process.argv.includes("--write")
const DIR = path.join(process.cwd(), "content", "blog")

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort()

let touched = 0
let totalStripped = 0
const report = []

for (const f of files) {
  const p = path.join(DIR, f)
  const lines = fs.readFileSync(p, "utf8").split("\n")
  const out = []
  let inMermaid = false
  let stripped = 0

  for (const line of lines) {
    if (!inMermaid && /^\s*```mermaid\b/.test(line)) {
      inMermaid = true
      out.push(line)
      continue
    }
    if (inMermaid && /^\s*```\s*$/.test(line)) {
      inMermaid = false
      out.push(line)
      continue
    }
    if (inMermaid && line.trim() === "") {
      stripped++
      continue // drop the injected blank line
    }
    out.push(line)
  }

  if (stripped === 0) continue
  touched++
  totalStripped += stripped
  report.push({ file: f, stripped })
  if (WRITE) fs.writeFileSync(p, out.join("\n"))
}

console.log(`${WRITE ? "REPAIRED" : "DRY RUN"} — scanned ${files.length} posts`)
console.log(`diagrams with injected blank lines: ${touched} files`)
console.log(`blank lines stripped:               ${totalStripped}\n`)
report
  .sort((a, b) => b.stripped - a.stripped)
  .forEach((r) => console.log(`  ${String(r.stripped).padStart(3)}  ${r.file}`))
if (!WRITE && touched) console.log(`\nRe-run with --write to apply.`)
