/* ============================================================
   EXECUTIVE PROFILE · PDF RESUMES

   npx tsx scripts/cv/pdf.tsx [--source <dir>] [--out <dir>]
                              [--only executive-cv,one-page-summary,board-bio]
                              [--draft] [--strict] [--png] [--html]
                              [--allow-fallback-fonts]

   Reads <source>/build/gated.json (written by scripts/cv/sync.ts), renders
   three A4 artefacts with the React components in src/components/cv/print,
   prints them with headless Chromium (playwright-core) and writes

     <out>/executive-cv.pdf        exactly 2 pages
     <out>/one-page-summary.pdf    exactly 1 page
     <out>/board-bio.pdf           exactly 1 page
     <out>/manifest.json           sourceHash, page counts, sizes, checksums

   Source folder: --source, else $CV_SOURCE_DIR, else
   ~/Documents/GitHub/tarrysingh-cv-private.
   Output folder: --out, else <source>/build/pdf. It must lie outside this
   repository: the PDFs carry gated content and are never committed.

   No Next server is needed. The page is self-contained HTML with inline
   CSS; the only network use is Google Fonts (Gloock, IBM Plex Serif and
   IBM Plex Mono), and every other request is blocked.

   --draft                 page-count and font problems become warnings
                           instead of failures (use while the content is
                           still being written)
   --strict                an under-filled page (below 55%) or any placeholder
                           left in the source becomes a failure (use before
                           a real publish)
   --png                   also write PNG previews to <out>/preview via
                           pdftoppm (if installed)
   --html                  also write the rendered HTML to <out>/html
   --allow-fallback-fonts  continue when the web fonts did not load

   Optional private input: <source>/board-bio.md, a hand-written third-person
   bio of about 150 words, used verbatim for the board biography. Without
   it the bio is taken from the executive summary when that is already in
   the third person, or composed from the structured data.

   Exit codes: 0 ok, 1 failure, 2 usage.
   ============================================================ */

import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, isAbsolute, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { PDFDocument } from "pdf-lib"
import { chromium } from "playwright-core"
import type { Browser, Page } from "playwright-core"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { BoardBio, ExecutiveCv, FIT_LEVELS, OnePager, REQUIRED_FONTS, buildView, composeBoardBio, htmlDocument } from "../../src/components/cv/print"
import type { BoardBioText as BioText, View } from "../../src/components/cv/print"
import { GatedProfileSchema, findPlaceholders } from "../../src/lib/cv/schema"

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = realpathSync(join(HERE, "..", ".."))

type Kind = "executive-cv" | "one-page-summary" | "board-bio"
const KINDS: Kind[] = ["executive-cv", "one-page-summary", "board-bio"]
const EXPECTED_PAGES: Record<Kind, number> = { "executive-cv": 2, "one-page-summary": 1, "board-bio": 1 }
const TITLES: Record<Kind, string> = {
  "executive-cv": "Executive CV",
  "one-page-summary": "One-page summary",
  "board-bio": "Board biography",
}

/** Density dial values, largest first. 0.9 keeps body text at 8.1 pt or above. */
const SCALES = [1.06, 1.03, 1, 0.97, 0.94, 0.92, 0.9]
const SCALES_ONE_PAGE = [1.06, 1.03, 1, 0.97, 0.94, 0.92, 0.9, 0.88, 0.86]
const OVERFLOW_TOLERANCE_PX = 1

/* ── CLI ───────────────────────────────────────────────────────────────── */

type Args = {
  source: string
  out: string | null
  only: Kind[]
  draft: boolean
  strict: boolean
  png: boolean
  html: boolean
  allowFallbackFonts: boolean
}

function fail(message: string): never {
  console.error(`\ncv:pdf · FAILED\n  ${message.replace(/\n/g, "\n  ")}\n`)
  process.exit(1)
}

function usage(message?: string): never {
  if (message) console.error(`cv:pdf: ${message}`)
  console.error(
    "usage: tsx scripts/cv/pdf.tsx [--source <dir>] [--out <dir>] [--only <kind,…>] [--draft] [--strict] [--png] [--html] [--allow-fallback-fonts]",
  )
  process.exit(2)
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    source: process.env.CV_SOURCE_DIR || join(homedir(), "Documents", "GitHub", "tarrysingh-cv-private"),
    out: null,
    only: KINDS,
    draft: false,
    strict: false,
    png: false,
    html: false,
    allowFallbackFonts: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const value = () => {
      const v = argv[++i]
      if (!v) usage(`${a} needs a value`)
      return v
    }
    if (a === "--source") args.source = value()
    else if (a === "--out") args.out = value()
    else if (a === "--only") {
      const wanted = value().split(",").map((s) => s.trim())
      const bad = wanted.filter((k) => !KINDS.includes(k as Kind))
      if (bad.length) usage(`unknown artefact: ${bad.join(", ")}`)
      args.only = wanted as Kind[]
    } else if (a === "--draft") args.draft = true
    else if (a === "--strict") args.strict = true
    else if (a === "--png") args.png = true
    else if (a === "--html") args.html = true
    else if (a === "--allow-fallback-fonts") args.allowFallbackFonts = true
    else usage(`unknown argument ${a}`)
  }
  return args
}

function isInside(child: string, parent: string): boolean {
  const rel = relative(parent, child)
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))
}

/* ── Browser ───────────────────────────────────────────────────────────── */

function chromiumCandidates(): string[] {
  const found: string[] = []
  const cache = join(homedir(), "Library", "Caches", "ms-playwright")
  if (existsSync(cache)) {
    for (const dir of readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()) {
      for (const arch of ["chrome-mac-arm64", "chrome-mac"]) {
        const exe = join(cache, dir, arch, "Chromium.app", "Contents", "MacOS", "Chromium")
        if (existsSync(exe)) found.push(exe)
      }
    }
  }
  found.push("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
  return found.filter((p) => existsSync(p))
}

async function launch(): Promise<Browser> {
  const errors: string[] = []
  try {
    return await chromium.launch({ headless: true })
  } catch (e) {
    errors.push(`playwright default: ${(e as Error).message.split("\n")[0]}`)
  }
  for (const executablePath of chromiumCandidates()) {
    try {
      return await chromium.launch({ headless: true, executablePath })
    } catch (e) {
      errors.push(`${executablePath}: ${(e as Error).message.split("\n")[0]}`)
    }
  }
  return fail(`no usable Chromium found:\n${errors.join("\n")}`)
}

/** Only fonts may leave the machine. Everything else is blocked. */
async function lockdown(page: Page): Promise<void> {
  await page.route("**/*", (route) => {
    const url = route.request().url()
    const ok =
      url.startsWith("data:") ||
      url.startsWith("about:") ||
      /^https:\/\/fonts\.googleapis\.com\//.test(url) ||
      /^https:\/\/fonts\.gstatic\.com\//.test(url)
    return ok ? route.continue() : route.abort()
  })
}

/* ── Measuring ─────────────────────────────────────────────────────────── */

type SheetMetrics = { overflowPx: number; widthOverflowPx: number; fill: number }

async function measure(page: Page): Promise<SheetMetrics[]> {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll<HTMLElement>(".sheet")).map((sheet) => {
      const body = sheet.querySelector<HTMLElement>(".body")!
      const top = body.getBoundingClientRect().top
      let used = 0
      for (const el of Array.from(body.children) as HTMLElement[]) {
        if (el.classList.contains("close")) continue
        used = Math.max(used, el.getBoundingClientRect().bottom - top)
      }
      return {
        overflowPx: body.scrollHeight - body.clientHeight,
        widthOverflowPx: body.scrollWidth - body.clientWidth,
        fill: used / body.clientHeight,
      }
    })
  })
}

const fits = (m: SheetMetrics[]) =>
  m.every((s) => s.overflowPx <= OVERFLOW_TOLERANCE_PX && s.widthOverflowPx <= OVERFLOW_TOLERANCE_PX)

async function setDensity(page: Page, k: number): Promise<void> {
  await page.evaluate((v) => {
    document.getElementById("density")!.textContent = `:root{--k:${v}}`
  }, k)
}

async function loadHtml(page: Page, html: string): Promise<{ missingFonts: string[] }> {
  await page.setContent(html, { waitUntil: "networkidle" })
  // Chromium loads a face only when text uses it, so ask for every face we rely
  // on. An empty result means the face could not be fetched.
  const missingFonts: string[] = await page.evaluate(async (specs) => {
    const bad: string[] = []
    for (const spec of specs) {
      try {
        const faces = await document.fonts.load(spec)
        if (faces.length === 0) bad.push(spec)
      } catch {
        bad.push(spec)
      }
    }
    await document.fonts.ready
    return bad
  }, [...REQUIRED_FONTS])
  return { missingFonts }
}

/* ── Rendering one artefact ────────────────────────────────────────────── */

type Rendered = {
  html: string
  k: number
  levelIndex: number
  metrics: SheetMetrics[]
  missingFonts: string[]
  fitted: boolean
}

type Builder = (levelIndex: number) => string

/** One pass of the fitter: these fit levels, tried at these densities. */
type Pass = { levels: number[]; scales: number[] }

/**
 * Prefer type size over content: first try the richer levels at a comfortable
 * size, then the same levels slightly smaller, and only then trim further.
 */
function executivePasses(levels: number): Pass[] {
  const all = Array.from({ length: levels }, (_, i) => i)
  // FIT_LEVELS holds each base level twice (matrix on page 1, then page 2).
  const rich = all.slice(0, 6)
  const mid = all.slice(6, 12)
  const lean = all.slice(12)
  const comfortable = SCALES.filter((k) => k >= 0.97)
  const tight = SCALES.filter((k) => k < 0.97)
  return [
    { levels: rich, scales: comfortable },
    { levels: rich, scales: tight },
    { levels: mid, scales: comfortable },
    { levels: mid, scales: tight },
    { levels: lean, scales: SCALES },
  ].filter((p) => p.levels.length > 0)
}

async function fitDocument(page: Page, kind: Kind, build: Builder, passes: Pass[]): Promise<Rendered> {
  let last: Rendered | null = null
  for (const pass of passes) {
    for (const levelIndex of pass.levels) {
      const html = build(levelIndex)
      const { missingFonts } = await loadHtml(page, html)
      for (const k of pass.scales) {
        await setDensity(page, k)
        const metrics = await measure(page)
        last = {
          html: html.replace(/:root\{--k:[\d.]+\}/, `:root{--k:${k}}`),
          k,
          levelIndex,
          metrics,
          missingFonts,
          fitted: fits(metrics),
        }
        if (last.fitted) return last
      }
    }
  }
  if (!last) fail(`${kind}: nothing rendered`)
  return last
}

/* ── Main ──────────────────────────────────────────────────────────────── */

const sha256 = (buf: Uint8Array) => createHash("sha256").update(buf).digest("hex")

type ManifestEntry = {
  file: string
  title: string
  pages: number
  expectedPages: number
  bytes: number
  sha256: string
  density: number
  fitLevel: number
  fill: number[]
  bioSource?: BioText["source"]
  bioWords?: number
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const source = resolve(args.source)
  if (isInside(source, REPO_ROOT)) fail(`the source folder must be outside this repository: ${source}`)

  const gatedPath = join(source, "build", "gated.json")
  if (!existsSync(gatedPath)) fail(`${gatedPath} not found. Run: npm run cv:sync`)
  const parsed = GatedProfileSchema.safeParse(JSON.parse(readFileSync(gatedPath, "utf8")))
  if (!parsed.success) {
    fail(
      `gated.json does not match the schema:\n${parsed.error.issues
        .slice(0, 8)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("\n")}`,
    )
  }
  const gated = parsed.data

  const out = resolve(args.out ?? join(source, "build", "pdf"))
  if (isInside(out, REPO_ROOT)) fail(`refusing to write PDFs inside the repository: ${out}`)
  mkdirSync(out, { recursive: true })

  const placeholders = findPlaceholders(gated).length
  if (args.strict && placeholders > 0) fail(`--strict: ${placeholders} placeholder value(s) remain in gated.json`)

  const now = new Date()
  const view: View = buildView(gated, now)
  const bioFile = join(source, "board-bio.md")
  const bio: BioText = composeBoardBio(view, existsSync(bioFile) ? readFileSync(bioFile, "utf8") : null)

  const builders: Record<Kind, { build: Builder; passes: Pass[] }> = {
    "executive-cv": {
      build: (i) =>
        htmlDocument({
          title: `${view.name} · ${TITLES["executive-cv"]}`,
          body: renderToStaticMarkup(<ExecutiveCv view={view} level={FIT_LEVELS[i]} now={now} />),
        }),
      passes: executivePasses(FIT_LEVELS.length),
    },
    "one-page-summary": {
      build: () =>
        htmlDocument({
          title: `${view.name} · ${TITLES["one-page-summary"]}`,
          body: renderToStaticMarkup(<OnePager view={view} now={now} />),
        }),
      passes: [{ levels: [0], scales: SCALES_ONE_PAGE }],
    },
    "board-bio": {
      build: () =>
        htmlDocument({
          title: `${view.name} · ${TITLES["board-bio"]}`,
          body: renderToStaticMarkup(<BoardBio view={view} bio={bio} />),
        }),
      passes: [{ levels: [0], scales: SCALES_ONE_PAGE }],
    },
  }

  const browser = await launch()
  const problems: string[] = []
  const warnings: string[] = [...view.warnings]
  const manifest: Record<string, ManifestEntry> = {}

  try {
    const context = await browser.newContext({ locale: "en-GB", viewport: { width: 794, height: 1123 } })
    for (const kind of args.only) {
      const page = await context.newPage()
      await lockdown(page)
      await page.emulateMedia({ media: "print" })
      const problemsBefore = problems.length
      const { build, passes } = builders[kind]
      const rendered = await fitDocument(page, kind, build, passes)

      if (rendered.missingFonts.length) {
        const msg = `${kind}: web fonts not loaded (${rendered.missingFonts.join("; ")}); the PDF would use fallbacks`
        if (args.allowFallbackFonts || args.draft) warnings.push(msg)
        else problems.push(msg)
      }
      if (!rendered.fitted) {
        const worst = Math.max(...rendered.metrics.map((m) => m.overflowPx))
        problems.push(
          `${kind}: content does not fit ${EXPECTED_PAGES[kind]} page(s) even at the leanest setting (overflow ${Math.round(worst)} px). Shorten the source text.`,
        )
      }
      rendered.metrics.forEach((m, i) => {
        if (m.fill < 0.55) {
          const msg = `${kind}: page ${i + 1} is only ${Math.round(m.fill * 100)}% full; the content may be incomplete`
          if (args.strict) problems.push(msg)
          else warnings.push(msg)
        }
      })

      // Print at the density the fitter settled on.
      await setDensity(page, rendered.k)
      const raw = await page.pdf({
        width: "210mm",
        height: "297mm",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
        tagged: true,
        outline: false,
      })

      const pdf = await PDFDocument.load(raw)
      pdf.setTitle(`${view.name} · ${TITLES[kind]}`)
      pdf.setAuthor(view.name)
      pdf.setSubject(TITLES[kind])
      pdf.setKeywords(["confidential"])
      pdf.setCreator("tarrysingh.com")
      pdf.setProducer("tarrysingh.com")
      pdf.setLanguage("en-GB")
      pdf.setCreationDate(now)
      pdf.setModificationDate(now)
      const bytes = await pdf.save()
      const pages = pdf.getPageCount()

      if (pages !== EXPECTED_PAGES[kind]) {
        const msg = `${kind}: ${pages} pages, expected exactly ${EXPECTED_PAGES[kind]}`
        if (args.draft) warnings.push(msg)
        else problems.push(msg)
      }

      // A failed artefact never replaces a good one: it goes to <kind>.failed.pdf.
      const file = problems.length > problemsBefore ? `${kind}.failed.pdf` : `${kind}.pdf`
      writeFileSync(join(out, file), bytes)
      // A good render supersedes this script's own earlier failed render.
      if (file === `${kind}.pdf`) rmSync(join(out, `${kind}.failed.pdf`), { force: true })
      if (args.html) {
        mkdirSync(join(out, "html"), { recursive: true })
        writeFileSync(join(out, "html", `${kind}.html`), rendered.html)
      }
      manifest[kind] = {
        file,
        title: TITLES[kind],
        pages,
        expectedPages: EXPECTED_PAGES[kind],
        bytes: bytes.byteLength,
        sha256: sha256(bytes),
        density: rendered.k,
        fitLevel: rendered.levelIndex,
        fill: rendered.metrics.map((m) => Number(m.fill.toFixed(2))),
        ...(kind === "board-bio" ? { bioSource: bio.source, bioWords: bio.words } : {}),
      }
      await page.close()
    }
    await context.close()
  } finally {
    await browser.close()
  }

  // The manifest vouches for the PDFs, so it is only written when all is well.
  // After a failure the previous manifest (and its sourceHash) stays as it was,
  // which keeps the sync step's drift guard honest.
  if (problems.length === 0) {
    writeFileSync(
      join(out, "manifest.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          generatedAt: now.toISOString(),
          sourceHash: gated.sourceHash,
          draft: args.draft,
          placeholdersInSource: placeholders,
          warnings,
          artefacts: manifest,
        },
        null,
        2,
      ) + "\n",
    )
  }

  if (args.png) {
    try {
      mkdirSync(join(out, "preview"), { recursive: true })
      for (const kind of args.only) {
        const file = manifest[kind]?.file
        if (file) execFileSync("pdftoppm", ["-png", "-r", "80", join(out, file), join(out, "preview", kind)])
      }
    } catch {
      warnings.push("--png: pdftoppm is not installed or failed; no previews written")
    }
  }

  console.log(
    [
      "",
      `cv:pdf · ${problems.length ? "FAILED" : "ok"}`,
      `  source        ${gatedPath}`,
      `  sourceHash    ${gated.sourceHash}`,
      `  placeholders  ${placeholders} still in the source (skipped in the PDFs)`,
      `  output        ${out}`,
      "",
      ...Object.entries(manifest).map(
        ([k, m]) =>
          `  ${k.padEnd(18)} ${m.pages}/${m.expectedPages} page(s) · ${(m.bytes / 1024).toFixed(0)} KB · density ${m.density} · level ${m.fitLevel} · fill ${m.fill.map((f) => `${Math.round(f * 100)}%`).join("/")}`,
      ),
      ...(warnings.length ? ["", "  warnings", ...warnings.map((w) => `    ${w}`)] : []),
      ...(problems.length ? ["", "  problems", ...problems.map((w) => `    ${w}`)] : []),
      "",
    ].join("\n"),
  )
  if (problems.length) process.exit(1)
}

main().catch((e) => fail(e instanceof Error ? e.stack ?? e.message : String(e)))
