/* ============================================================
   HEADLESS PLATE-COVER GENERATOR

   Renders public/blog/covers/<slug>.png for every content/blog/*.mdx
   that lacks a committed cover, using the SAME src/lib/blog/plate-engine
   as the browser PlateCanvas. Because both paths run the identical
   deterministic engine, the committed PNG is pixel-identical to the
   runtime fallback — no Python/Pillow port, no JS↔Python parity problem.

   Rendering uses @napi-rs/canvas (prebuilt N-API binary, zero system
   libraries) so this runs unchanged on macOS locally and ubuntu in CI.

   Run by .github/workflows/plate-covers.yml on publish, and locally via
   `npm run covers` (add `-- --force` to regenerate all, `-- --slug=foo`
   for one).

   Override path: set `cover:` in a post's frontmatter, OR commit a
   hand-made public/blog/covers/<slug>.png — the script never overwrites
   an existing PNG unless --force is passed.
   ============================================================ */

import { createCanvas } from "@napi-rs/canvas"
import matter from "gray-matter"
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { renderPlate } from "../../src/lib/blog/plate-engine"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, "..", "..")
const CONTENT = join(ROOT, "content", "blog")
const OUT = join(ROOT, "public", "blog", "covers")

// One canonical 3:2 plate per slug at hero-grade density. object-fit:cover
// crops it to the 21:9 flagship hero or the 3:2 grid card at render time.
const W = 1800
const H = 1200

const force = process.argv.includes("--force")
const slugArg = process.argv.find((a) => a.startsWith("--slug="))
const only = slugArg ? slugArg.slice("--slug=".length) : null

mkdirSync(OUT, { recursive: true })

const files = readdirSync(CONTENT).filter((f) => f.endsWith(".mdx"))
let made = 0
let skipped = 0

for (const file of files) {
  const slug = file.replace(/\.mdx$/, "")
  if (only && slug !== only) continue

  const fm = matter(readFileSync(join(CONTENT, file), "utf8")).data as {
    cover?: string
  }
  // Explicit bespoke cover declared in frontmatter → never generate.
  if (fm.cover) {
    skipped++
    continue
  }

  const dest = join(OUT, `${slug}.png`)
  if (existsSync(dest) && !force) {
    skipped++
    continue
  }

  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext("2d")
  const register = renderPlate(
    ctx as unknown as CanvasRenderingContext2D,
    W,
    H,
    { slug, detail: "full" },
  )
  writeFileSync(dest, canvas.toBuffer("image/png"))
  made++
  console.log(`  ▸ ${slug}.png  [${register}]`)
}

console.log(
  `\nplate covers: ${made} generated, ${skipped} skipped (${files.length} posts total)`,
)
