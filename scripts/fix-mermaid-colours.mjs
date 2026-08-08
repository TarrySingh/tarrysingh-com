/**
 * Strip hardcoded colours from mermaid diagrams so they follow the reader theme.
 *
 * MermaidDiagram.tsx now derives its palette from the reader's --read-* tokens,
 * so a diagram automatically matches whatever page it sits on (Slate on /blog,
 * the warm register on /synaptic). A diagram that hardcodes fill:#e63946 opts
 * out of that and renders off-theme in both light and dark mode.
 *
 * These directives pre-date the theming work. This pass removes ONLY colour:
 * `style X fill:#...` lines and `classDef` colour declarations. Layout,
 * direction, node shapes, edges and labels are untouched, so the diagram's
 * meaning is unchanged.
 *
 * Usage:
 *   node scripts/fix-mermaid-colours.mjs           # dry run
 *   node scripts/fix-mermaid-colours.mjs --write   # apply
 */
import fs from "node:fs"
import path from "node:path"

const WRITE = process.argv.includes("--write")
const DIR = path.join(process.cwd(), "content", "blog")

/** A line that exists only to set colour. */
function isColourOnlyLine(line) {
  const t = line.trim()
  if (!/^(?:style|classDef|linkStyle)\b/.test(t)) return false
  // Only drop it if every declaration on it is cosmetic.
  const decls = t.replace(/^(?:style|classDef|linkStyle)\s+\S+\s*/, "")
  if (!decls) return false
  return decls
    .split(",")
    .every((d) => /^\s*(?:fill|stroke|color|stroke-width|stroke-dasharray|font-weight|font-size|opacity)\s*:/.test(d))
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort()
let touched = 0
let removed = 0
const report = []

for (const f of files) {
  const p = path.join(DIR, f)
  const raw = fs.readFileSync(p, "utf8")
  let n = 0

  const out = raw.replace(/```mermaid\n([\s\S]*?)```/g, (whole, block) => {
    const kept = block
      .split("\n")
      .filter((l) => {
        if (isColourOnlyLine(l)) {
          n++
          return false
        }
        return true
      })
      // A blank line inside a mermaid fence breaks the parser, so never leave
      // one behind where a style line used to be.
      .filter((l, i, arr) => !(l.trim() === "" && (i === arr.length - 1 || arr[i + 1]?.trim() === "")))
    let body = kept.join("\n").replace(/\n{2,}/g, "\n")
    if (!body.endsWith("\n")) body += "\n"
    return "```mermaid\n" + body + "```"
  })

  if (n === 0) continue
  touched++
  removed += n
  report.push({ f, n })
  if (WRITE) fs.writeFileSync(p, out)
}

console.log(`${WRITE ? "APPLIED" : "DRY RUN"} — ${touched} files, ${removed} colour lines removed\n`)
report.sort((a, b) => b.n - a.n).forEach((r) => console.log(`  ${String(r.n).padStart(3)}  ${r.f}`))
if (!WRITE && touched) console.log("\nRe-run with --write to apply.")
