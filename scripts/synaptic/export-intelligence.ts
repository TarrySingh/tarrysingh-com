import fs from "node:fs"
import path from "node:path"
import { getManuscript } from "../../src/lib/synaptic/intelligence-without-permission/manuscript"
import { sources } from "../../src/lib/synaptic/intelligence-without-permission/sources"
import manifest from "../../docs/plans/intelligence-without-permission/production-manifest.json"

const manuscript=getManuscript()
const output=[
  "# Intelligence Without Permission",
  "Tarry Singh · Synaptic · Complete research draft · 9 September 2026",
  `${manuscript.words.toLocaleString("en-US")} narrative words · 18 sections · 38 figures in the web edition, including 10 optional 3D studies. Captions, headings and sources are excluded from the narrative count.`,
  "This reading copy contains the complete prose and source notes. Interactive figures are available in the web edition; figure markers below identify their position and purpose. The article is a local draft, not a published announcement.",
]
for(const c of manuscript.chapters){
  output.push(`## ${c.id === "prologue" || c.id === "coda" ? "" : c.id+" · "}${c.title}`)
  output.push(c.source.replace(/<Source id="(S\d+)"\s*\/>/g,(_,id)=>`[^${id}]`).replace(/<Figure id="(V\d+)"\s*\/>/g,(_,id)=>{
    const f=manifest.figures.find(f=>f.id===id)!
    return `> **Figure ${id.slice(1)} · ${f.title} (${f.dimension})** — ${f.evidence_kind}. See the corresponding figure in the web edition.`
  }).trim())
}
output.push("## Sources and reading notes", "Research cut-off: 9 September 2026. A source link records provenance, not independent replication. Some sources support figure data or context.")
for(const [id,s] of Object.entries(sources).sort(([a],[b])=>Number(a.slice(1))-Number(b.slice(1))))output.push(`[^${id}]: [${s.title}](${s.url}). ${s.note}`)
const destination=path.join(process.cwd(),"public/synaptic/intelligence-without-permission/intelligence-without-permission.md")
fs.writeFileSync(destination,output.join("\n\n")+"\n")
console.log(`Exported ${manuscript.words} narrative words to ${destination}`)
