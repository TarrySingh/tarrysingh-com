import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const manifestPath = path.join(root, "docs/plans/intelligence-without-permission/production-manifest.json")
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
const sourceRegistry = fs.readFileSync(path.join(root, "src/lib/synaptic/intelligence-without-permission/sources.ts"), "utf8")
const renderer = fs.readFileSync(path.join(root, "src/components/synaptic/intelligence-without-permission/Figure.tsx"), "utf8")
let total = 0
const figures = []
const issues = []
for (const chapter of manifest.chapters) {
  const file = path.join(root, "content/synaptic/intelligence-without-permission", `${chapter.id}.mdx`)
  if (!fs.existsSync(file)) { issues.push(`Missing chapter ${chapter.id}`); continue }
  const source = fs.readFileSync(file, "utf8")
  const prose = source.replace(/<!--[\s\S]*?-->/g, "").replace(/<Figure\s[^>]*\/>/g, "").replace(/<Source\s[^>]*\/>/g, "").replace(/```[\s\S]*?```/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/<[^>]+>/g, "").replace(/^#{1,6}\s.+$/gm, "")
  const words = (prose.match(/[\p{L}\p{N}]+(?:[’'−-][\p{L}\p{N}]+)*/gu) || []).length
  total += words
  chapter.narrative_words = words
  chapter.status = "drafted"
  const chapterFigures = [...source.matchAll(/<Figure id="(V\d+)"/g)].map(match => match[1])
  figures.push(...chapterFigures)
  for (const id of chapter.figure_ids) if (!chapterFigures.includes(id)) issues.push(`Chapter ${chapter.id} lacks ${id}`)
  for (const [,id] of source.matchAll(/<Source id="(S\d+)"/g)) if (!sourceRegistry.includes(`${id}:`)) issues.push(`Undefined source ${id}`)
  console.log(`${chapter.id.padEnd(8)} ${String(words).padStart(5)} words / ${chapter.target_words} planned · ${chapterFigures.join(", ")}`)
}
for (const id of figures) if (!renderer.includes(`case "${id}"`)) issues.push(`Missing renderer ${id}`)
if (new Set(figures).size !== figures.length) issues.push("Duplicate figure in manuscript")
if (total < 40000) issues.push(`Narrative is ${40000-total} words below minimum`)
if (figures.length !== 38) issues.push(`Expected 38 figures; found ${figures.length}`)
console.log(`\nTOTAL ${total.toLocaleString("en-US")} narrative words · ${figures.length} figure placements`)
if (process.argv.includes("--update")) {
  manifest.narrative_words_written = total
  manifest.figures_built = figures.filter(id => renderer.includes(`case "${id}"`)).length
  manifest.status = issues.length ? "production_in_progress" : "complete_draft_pending_browser_review"
  manifest.figures.forEach(figure => {
    if (renderer.includes(`case "${figure.id}"`)) { figure.status = "implemented_pending_browser_review"; figure.asset_status = "built" }
  })
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2)+"\n")
}
if (issues.length) { console.log(`\n${issues.length} outstanding requirements:\n${issues.join("\n")}`); if (!process.argv.includes("--draft")) process.exitCode = 1 }
