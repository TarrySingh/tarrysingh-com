/**
 * Sprint 8 — adapter round-trip test:
 *   npx tsx src/lib/synaptic/editor/adapters.test.ts
 *
 * Proves the ChipPlate adapter loads the committed module into PlateContent and
 * serializes it back without losing values or the code-owned tail.
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { getAdapter, isEditorReady } from "./adapters"

const here = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(here, "..", "chipplate-data.ts"), "utf8")

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

const a = getAdapter("chip-plate")
ok("chip-plate is editor-ready", a !== null && isEditorReady("chip-plate"))
ok("unextracted plate has no adapter", getAdapter("two-phase-dynamics") === null)

if (a) {
  const loaded = a.load()
  console.log("load():")
  ok("6 annotations", loaded.annotations?.length === 6)
  ok("displayName", loaded.displayName === "Chip Plate · Memphis")
  ok("ariaLabel", (loaded.ariaLabel ?? "").startsWith("MEMPHIS chip plate"))
  ok("hint", loaded.hint === "Click any numbered anchor to inspect its role")
  ok(
    "annotation carries anchor + color",
    !!loaded.annotations?.[0].anchor && !!loaded.annotations?.[0].color,
  )

  console.log("serialize() round-trip (no edits):")
  const out = a.serialize(loaded, src)
  for (const id of ["01", "02", "03", "04", "05", "06"]) {
    ok(`annotation ${id} present`, out.includes(`id: "${id}"`))
  }
  ok("computeIntensities preserved", out.includes("export function computeIntensities()"))
  ok("CHIP_INTENSITIES preserved", out.includes("export const CHIP_INTENSITIES = computeIntensities()"))
  ok("ChipAnnotation type preserved", out.includes("export type ChipAnnotation"))
  ok("anchors preserved (inline)", out.includes("anchor: { x: 330, y: 240 }"))
  ok(
    "re-serialize is stable",
    a.serialize(a.load(), out) === out,
  )

  console.log("serialize() with an edit:")
  const edited = a.load()
  edited.annotations![0].body = "EDIT — associative recall, rewritten."
  edited.hint = "Tap a marker."
  const out2 = a.serialize(edited, src)
  ok("edited body present", out2.includes("EDIT — associative recall, rewritten."))
  ok("edited hint present", /CHIP_HINT =\s*"Tap a marker\."/.test(out2))
  ok("tail still intact after edit", out2.includes("export const CHIP_INTENSITIES = computeIntensities()"))
}

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
