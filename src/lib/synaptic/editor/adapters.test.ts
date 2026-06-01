/**
 * Sprint 8 — adapter round-trip tests for every editor-ready plate:
 *   npx tsx src/lib/synaptic/editor/adapters.test.ts
 *
 * For each registered plate: load() → PlateContent, serialize() back into the
 * real module source, and assert (a) it's stable, (b) an edit persists, and
 * (c) code-owned values (colours, angles, years, weights, geometry) survive.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { PLATE_REGISTRY } from "../registry"
import { getAdapter, isEditorReady } from "./adapters"

let passed = 0
let failed = 0
function ok(name: string, cond: boolean, extra?: string) {
  if (cond) {
    passed += 1
    console.log(`  ✓ ${name}`)
  } else {
    failed += 1
    console.error(`  ✗ ${name}${extra ? ` — ${extra}` : ""}`)
  }
}

// Code-owned tokens that must survive a no-edit round-trip, per plate.
const PRESERVE: Record<string, string[]> = {
  "chip-plate": ["computeIntensities", "CHIP_N = 22", "{ x: 330, y: 240 }", "#e8b87a"],
  "two-phase-dynamics": ["ONLINE EVENT-DRIVEN", "Σ EVENTS"],
  "siciliano-rose": ["SicilianoSector", "Keep the gradient", "id: \"haptic\""],
  "hominis-cathedral": ["#6cb4c2", "capital: \"III\"", "EUROHPC"],
  "vision-horizon": ["#a698d4", "x: 0.5", "height: 0.92"],
  "siciliano-arm-hero": ["[-10, 20, 60, -30]", "#f4c482", "angles:"],
  "ramaswamy-pedigree": ["year: 2005", "year: 2022", "\"primary\"", "RamaswamyBeat"],
  "symphony-planisphere": ["wedgePath", "VIEW = 800", "seedPositions", "LOCALISATION", "RATIONALE"],
  "uprobotics-factory-hero": ["#f4c482", "y: 280", "y: 580", "UpRoboticsStream"],
  "ca3-ca1-circuit": ["x: 140", "#c98e4f", "type Spot"],
  "energy-gradient": ["type Tier", "#849cc8", "millions of years"],
  "stdp-window": ["PLATE M-I", "Δw"],
  "comprehension-gap": ["year: 1970", "complexity: 1", "type Era"],
  "consortium-graph": ["isCoordinator: true", "CONSORTIUM_EDGES", "type Partner"],
  "hominis-hero": ["#f4c482", "id: \"situated\"", "HominisPillar"],
  "ramaswamy-cortex-hero": ["y: 200", "RAMASWAMY_CORTEX_LAYERS", "Layer I"],
  "statistical-ceiling": ["headline: 80.9", "filtered: 31.8", "StatCeilingRow"],
  "substrate-scales": ["SUBSTRATE_LAYERS", "η", "Hyperparameter"],
}

for (const entry of PLATE_REGISTRY) {
  console.log(`\n${entry.id}:`)
  const adapter = getAdapter(entry.id)
  ok("editor-ready", adapter !== null && isEditorReady(entry.id))
  if (!adapter) continue

  const src = readFileSync(join(process.cwd(), entry.contentPath), "utf8")
  const loaded = adapter.load()
  ok("load() has a displayName", typeof loaded.displayName === "string" && loaded.displayName.length > 0)

  const slotCount =
    (loaded.annotations?.length ?? 0) +
    (loaded.captions?.length ?? 0) +
    (loaded.prose?.length ?? 0)
  ok("load() surfaces editable slots", slotCount > 0, `slots=${slotCount}`)

  // No-edit round-trip preserves code-owned tokens.
  const out = adapter.serialize(loaded, src)
  for (const token of PRESERVE[entry.id] ?? []) {
    ok(`preserves \`${token}\``, out.includes(token))
  }

  // Idempotent: serializing the reloaded content reproduces the same output.
  ok("re-serialize is stable", adapter.serialize(adapter.load(), out) === out)

  // An edit persists. Prefer an annotation; fall back to a caption.
  const edited = adapter.load()
  const MARK = "ZZ_EDIT_MARK"
  if (edited.annotations && edited.annotations.length > 0) {
    edited.annotations[0].body = `${MARK} body`
    const out2 = adapter.serialize(edited, src)
    ok("annotation edit persists", out2.includes(`${MARK} body`))
    ok("edit keeps code-owned tokens", (PRESERVE[entry.id] ?? []).every((t) => out2.includes(t)))
  } else if (edited.captions && edited.captions.length > 0) {
    edited.captions[0].text = `${MARK} caption`
    const out2 = adapter.serialize(edited, src)
    ok("caption edit persists", out2.includes(`${MARK} caption`))
  }
}

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
