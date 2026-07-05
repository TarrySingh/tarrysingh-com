import fs from "node:fs"
import path from "node:path"

const ROOT = "/Users/tarrysingh/tarry-chokepoint-wt"
const SRC = path.join(ROOT, "docs/Loop-Harness-Engineering/prose")
const OUT = path.join(ROOT, "content/blog/the-engine-room.mdx")
const ORDER = ["P", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]

const MAP = {
  "V1 The Loop": "TheLoop",
  "V2 The Harness, Exploded": "HarnessExploded",
  "V3 The Verifier Gap": "VerifierGap",
  "V4 Context Rot": "ContextRot",
  "V5 The Harness of Record": "HarnessOfRecord",
  "V6 Fan-out Economics": "FanoutEconomics",
  "V7 The Reactor": "TheReactor",
  "V8 The Goodhart Dial": "GoodhartDial",
  "V9 The Data Iceberg": "DataIceberg",
  "V10 The Vault Bore": "VaultBore",
  "V11 The Private Frontier Run-Book": "PrivateFrontierRunbook",
  "V12 The Self-Driving Lab": "SelfDrivingLab",
  "V13 The Agency Spectrum": "AgencySpectrum",
  "V14 The Role Constellation": "RoleConstellation",
  "V15 The AIOps Command Deck": "AIOpsCommandDeck",
}

const frontmatter = `---
title: "The Engine Room: Loop & Harness Engineering"
date: "2026-07-05"
category: "Essays"
excerpt: "Everyone argues about models. Whether a model ever does useful work is decided by two other things: the loop it runs in, and the standing structure that loop runs inside. A 30,000-word field manual for the engineers who will build both, from a hobbyist's .claude folder to a frontier training run to a self-driving lab, with fifteen interactive instruments."
theme: "editorial"
tags: ["loop-harness-engineering", "ai-agents", "agentic-ai", "context-engineering", "evals", "aiops", "mlops", "frontier-training", "enterprise-ai"]
series: { key: "loop-harness", part: 1 }
draft: true
---
`

let usedMarkers = 0
const bodies = ORDER.map((id) => {
  let md = fs.readFileSync(path.join(SRC, `ch-${id}.md`), "utf8")
  md = md.replace(/^<!--[\s\S]*?-->\s*/, "") // strip the words/claims comment header
  md = md.replace(/^\s*\[\[INSTRUMENT:\s*([^\]]+?)\s*\]\]\s*$/gm, (_, name) => {
    const comp = MAP[name.trim()]
    if (!comp) throw new Error(`Unmapped instrument marker: "${name}"`)
    usedMarkers++
    return `<${comp} />`
  })
  return md.trim()
})

const out = frontmatter + "\n" + bodies.join("\n\n") + "\n"
fs.writeFileSync(OUT, out)

// sanity: no leftover markers, no raw HTML comments, all 15 instruments placed
const leftover = (out.match(/\[\[INSTRUMENT/g) || []).length
const comments = (out.match(/<!--/g) || []).length
console.log(`wrote ${OUT}`)
console.log(`bytes: ${out.length}`)
console.log(`instruments placed: ${usedMarkers} (leftover markers: ${leftover})`)
console.log(`stray HTML comments: ${comments}`)
const placed = Object.values(MAP).filter((c) => out.includes(`<${c} />`))
console.log(`distinct components present: ${placed.length}/15`)
const missing = Object.values(MAP).filter((c) => !out.includes(`<${c} />`))
if (missing.length) console.log(`MISSING: ${missing.join(", ")}`)
