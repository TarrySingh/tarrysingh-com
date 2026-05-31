/**
 * Sprint 8 — serializer self-test. Pure, no test runner required:
 *   npx tsx src/lib/synaptic/editor/serialize.test.ts
 *
 * Exercises findExportInitializer / replaceExportInitializer / tsLiteral against
 * the real chipplate-data.ts so we KNOW Publish will only ever touch the named
 * editable exports and leave the code-owned tail byte-for-byte intact.
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import {
  findExportInitializer,
  replaceExportInitializer,
  tsLiteral,
  type TsValue,
} from "./serialize"

const here = dirname(fileURLToPath(import.meta.url))
const CHIP = join(here, "..", "chipplate-data.ts")
const src = readFileSync(CHIP, "utf8")

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
function slice(name: string): string {
  const r = findExportInitializer(src, name)
  if (!r) throw new Error(`not found: ${name}`)
  return src.slice(r[0], r[1])
}

console.log("findExportInitializer:")
ok(
  "CHIP_HINT bounds the exact string literal",
  slice("CHIP_HINT") === '"Click any numbered anchor to inspect its role"',
  JSON.stringify(slice("CHIP_HINT")),
)
ok(
  "CHIP_ARIA_LABEL captures a wrapped multi-line string",
  slice("CHIP_ARIA_LABEL").startsWith('"MEMPHIS chip plate') &&
    slice("CHIP_ARIA_LABEL").endsWith('"'),
)
ok(
  "CHIP_DISPLAY_NAME",
  slice("CHIP_DISPLAY_NAME") === '"Chip Plate · Memphis"',
  JSON.stringify(slice("CHIP_DISPLAY_NAME")),
)
{
  const a = slice("CHIP_ANNOTATIONS")
  ok(
    "CHIP_ANNOTATIONS bounds the whole array literal",
    a.startsWith("[") && a.endsWith("]") && (a.match(/id:/g) ?? []).length === 6,
    `${a.slice(0, 12)}…${a.slice(-6)} ids=${(a.match(/id:/g) ?? []).length}`,
  )
}
ok("missing export returns null", findExportInitializer(src, "NOPE_X") === null)

console.log("replaceExportInitializer (surgical, tail-preserving):")
{
  const out = replaceExportInitializer(src, "CHIP_HINT", '"NEW HINT TEXT"')
  // The serializer swaps ONLY the value literal, preserving the author's exact
  // whitespace — here CHIP_HINT wraps its value onto the next line (`=\n  "…"`).
  ok("new value present", /export const CHIP_HINT =\s*"NEW HINT TEXT"/.test(out))
  ok(
    "old value gone",
    !out.includes("Click any numbered anchor to inspect its role"),
  )
  ok("code-owned tail preserved (computeIntensities)", out.includes("export function computeIntensities()"))
  ok("geometry preserved (CHIP_N)", out.includes("export const CHIP_N = 22"))
  ok("sibling export untouched (CHIP_ARIA_LABEL)", out.includes("MEMPHIS chip plate"))
  // Everything from CHIP_N onward must be byte-identical to the original tail.
  const tailFrom = "export type ChipPhase"
  ok(
    "post-edit tail is byte-identical",
    out.slice(out.indexOf(tailFrom)) === src.slice(src.indexOf(tailFrom)),
  )
}

console.log("tsLiteral (authoring style):")
{
  const ann: TsValue = [
    {
      id: "01",
      title: "Edited title",
      subtitle: "sub",
      body: "body",
      anchor: { x: 330, y: 240 },
      color: "#e8b87a",
    },
  ]
  const lit = tsLiteral(ann, { inlineSmallObjects: true }, 0)
  ok("inlines small {x,y} object", lit.includes("anchor: { x: 330, y: 240 }"))
  ok("bare identifier keys", lit.includes("id: \"01\""))
  ok("trailing comma on entries", /color: "#e8b87a",\n/.test(lit))
  ok("emoji/unicode-safe string round-trip", tsLiteral("a · b") === '"a · b"')
  ok("drops undefined keys", !tsLiteral({ a: 1, b: undefined } as TsValue).includes("b"))
  ok(
    "inlines small primitive arrays",
    tsLiteral([-10, 20, 60, -30], { inlineSmallArrays: true }) === "[-10, 20, 60, -30]",
  )
  ok(
    "keeps object arrays multiline",
    tsLiteral([{ a: 1 }], { inlineSmallArrays: true }).includes("\n"),
  )
}

console.log("full annotation-array swap (the Publish path):")
{
  // Rebuild the array from the existing one with one edited body, preserving
  // anchors/colors, and confirm the swap keeps the file coherent.
  const rebuilt: TsValue = [
    { id: "01", title: "CA3 recurrent collaterals", subtitle: "associative pattern completion", body: "EDITED BODY ONE", anchor: { x: 330, y: 240 }, color: "#e8b87a" },
  ]
  const out = replaceExportInitializer(
    src,
    "CHIP_ANNOTATIONS",
    tsLiteral(rebuilt, { inlineSmallObjects: true }, 0),
  )
  ok("edited body present", out.includes("EDITED BODY ONE"))
  ok("anchor preserved in output", out.includes("anchor: { x: 330, y: 240 }"))
  ok("ChipAnnotation type decl untouched", out.includes("export type ChipAnnotation"))
  ok("CHIP_INTENSITIES tail preserved", out.includes("export const CHIP_INTENSITIES = computeIntensities()"))
}

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
