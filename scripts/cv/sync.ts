/* ============================================================
   EXECUTIVE PROFILE · SYNC

   npx tsx scripts/cv/sync.ts [--source <dir>] [--public-out <file>]
                              [--strict] [--dry-run]

   Reads <source>/profile.yaml from the PRIVATE folder (outside this
   public repository), validates it against src/lib/cv/schema.ts and
   writes two exports, each stamped with sourceHash + generatedAt:

     src/content/cv/public.json   public items only     (committed)
     <source>/build/gated.json    public + gated items  (never in this repo)

   Source folder: --source, else $CV_SOURCE_DIR, else
   ~/Documents/GitHub/tarrysingh-cv-private.

   --strict    fail while any placeholder or missing budget amount
               remains (use before a real publish, Phase 4)
   --dry-run   validate and report; write nothing

   Exit codes: 0 ok · 1 validation or safety failure · 2 usage.
   ============================================================ */

import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { homedir } from "node:os"
import { dirname, isAbsolute, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
// `yaml` is present in node_modules as a transitive dependency (not yet
// declared in package.json). It is only needed here, never at build time.
import { parse as parseYaml } from "yaml"
import {
  COLLECTIONS,
  ExportDataSchema,
  findConfidentialNameLeaks,
  findPlaceholders,
  findVisibilityViolations,
  ProfileSourceSchema,
  toGated,
  toPublic,
  validateIntegrity,
  type ExportData,
  type ProfileSource,
} from "../../src/lib/cv/schema"

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = realpathSync(join(HERE, "..", ".."))
const DEFAULT_PUBLIC_OUT = join(REPO_ROOT, "src", "content", "cv", "public.json")
const DEFAULT_SOURCE = join(homedir(), "Documents", "GitHub", "tarrysingh-cv-private")

type Args = {
  source: string
  publicOut: string
  strict: boolean
  dryRun: boolean
}

function usage(message?: string): never {
  if (message) console.error(`cv:sync · ${message}`)
  console.error(
    "usage: npx tsx scripts/cv/sync.ts [--source <dir>] [--public-out <file>] [--strict] [--dry-run]",
  )
  process.exit(2)
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    source: process.env.CV_SOURCE_DIR || DEFAULT_SOURCE,
    publicOut: DEFAULT_PUBLIC_OUT,
    strict: false,
    dryRun: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const [flag, inline] = argv[i].split(/=([\s\S]*)/, 2)
    const value = () => {
      const v = inline ?? argv[++i]
      if (!v) usage(`${flag} needs a value`)
      return v
    }
    switch (flag) {
      case "--source":
        args.source = value()
        break
      case "--public-out":
        args.publicOut = value()
        break
      case "--strict":
        args.strict = true
        break
      case "--dry-run":
        args.dryRun = true
        break
      case "--help":
      case "-h":
        return usage()
      default:
        usage(`unknown argument ${argv[i]}`)
    }
  }
  return args
}

function fail(message: string): never {
  console.error(`\ncv:sync · FAILED · ${message}`)
  process.exit(1)
}

function isInside(child: string, parent: string): boolean {
  const rel = relative(parent, child)
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))
}

function git(cwd: string, args: string[]): string | null {
  try {
    return execFileSync("git", ["-C", cwd, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 10_000,
    }).trim()
  } catch {
    return null
  }
}

/**
 * The private folder must not live inside this repository, nor inside any
 * other checkout of it, and should not have a git remote at all.
 */
function assertSourceIsPrivate(source: string): void {
  if (isInside(source, REPO_ROOT)) {
    fail(`source ${source} is inside this public repository; keep it in the private folder`)
  }
  const repoRemote = git(REPO_ROOT, ["remote", "get-url", "origin"])
  const sourceRemotes = git(source, ["remote", "-v"])
  if (sourceRemotes) {
    const urls = new Set(
      sourceRemotes
        .split("\n")
        .map((line) => line.split(/\s+/)[1])
        .filter(Boolean),
    )
    if (repoRemote && urls.has(repoRemote)) {
      fail(`source ${source} is inside a checkout of the public repository (${repoRemote})`)
    }
    console.warn(
      `cv:sync · WARNING · the private folder has a git remote (${[...urls].join(", ")}). ` +
        "It is meant to stay local.",
    )
  }
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>
    return `{${Object.keys(record)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify(record[k])}`)
      .join(",")}}`
  }
  return JSON.stringify(value) ?? "null"
}

/**
 * Hash of the validated source (canonical JSON, so comments and formatting
 * in profile.yaml do not change it). Each artefact's renderedFromHash is
 * excluded, otherwise recording it would change the hash it records.
 */
function computeSourceHash(source: ProfileSource): string {
  const canonical = {
    ...source,
    artefacts: source.artefacts.map((a) => ({ ...a, renderedFromHash: null })),
  }
  return `sha256:${createHash("sha256").update(stableStringify(canonical)).digest("hex")}`
}

function formatIssues(error: { issues: Array<{ path: Array<string | number>; message: string }> }): string {
  return error.issues
    .slice(0, 40)
    .map((issue) => {
      const path = issue.path
        .map((p, i) => (typeof p === "number" ? `[${p}]` : i === 0 ? p : `.${p}`))
        .join("")
      return `  ${path || "(root)"}: ${issue.message}`
    })
    .join("\n")
}

/**
 * Writes the export unless only generatedAt would change, so re-running the
 * sync on unchanged content leaves public.json untouched (no noisy diffs).
 */
function writeExport(
  file: string,
  audience: "public" | "gated",
  data: ExportData,
  sourceHash: string,
  dryRun: boolean,
): "written" | "unchanged" | "dry-run" {
  const { schemaVersion, ...blocks } = data
  const build = (generatedAt: string) =>
    `${JSON.stringify({ audience, schemaVersion, sourceHash, generatedAt, ...blocks }, null, 2)}\n`

  if (existsSync(file)) {
    try {
      const current = readFileSync(file, "utf8")
      const previous = JSON.parse(current) as { generatedAt?: unknown }
      if (typeof previous.generatedAt === "string" && build(previous.generatedAt) === current) {
        return "unchanged"
      }
    } catch {
      // unreadable or malformed: overwrite below
    }
  }
  if (dryRun) return "dry-run"
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, build(new Date().toISOString()))
  return "written"
}

function countByVisibility(source: ProfileSource): string[] {
  return COLLECTIONS.map((key) => {
    const items = source[key] as Array<{ visibility: string }>
    const n = (v: string) => items.filter((i) => i.visibility === v).length
    return `  ${key.padEnd(13)} ${String(items.length).padStart(3)}  public ${n("public")} · gated ${n("gated")} · private ${n("private")}`
  })
}

function budgetsWithoutAmount(data: ExportData): string[] {
  const missing: string[] = []
  data.programmes.forEach((p, i) => {
    const b = p.budget
    if (b && b.exact == null && (b.rangeLow == null || b.rangeHigh == null)) {
      missing.push(`programmes[${i}].budget`)
    }
  })
  data.roles.forEach((r, i) => {
    const b = r.scope?.budget
    if (b && b.exact == null && (b.rangeLow == null || b.rangeHigh == null)) {
      missing.push(`roles[${i}].scope.budget`)
    }
  })
  return missing
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))

  if (!existsSync(args.source) || !statSync(args.source).isDirectory()) {
    fail(`source folder not found: ${args.source} (use --source or CV_SOURCE_DIR)`)
  }
  const source = realpathSync(args.source)
  assertSourceIsPrivate(source)

  const yamlPath = join(source, "profile.yaml")
  if (!existsSync(yamlPath)) fail(`no profile.yaml in ${source}`)

  // 1. parse
  let raw: unknown
  try {
    raw = parseYaml(readFileSync(yamlPath, "utf8"), { prettyErrors: true })
  } catch (error) {
    fail(`profile.yaml is not valid YAML:\n${(error as Error).message}`)
  }

  // 2. validate shape
  const parsed = ProfileSourceSchema.safeParse(raw)
  if (!parsed.success) {
    fail(`profile.yaml does not match the schema:\n${formatIssues(parsed.error)}`)
  }
  const data = parsed.data

  // 3. validate integrity
  const integrity = validateIntegrity(data)
  for (const w of integrity.warnings) console.warn(`cv:sync · warning · ${w}`)
  if (integrity.errors.length > 0) {
    fail(`integrity check:\n  ${integrity.errors.join("\n  ")}`)
  }

  // 4. filter
  const sourceHash = computeSourceHash(data)
  const publicData = toPublic(data)
  const gatedData = toGated(data)

  // 5. defence in depth: re-check both exports independently
  const publicLeaks = [
    ...findVisibilityViolations(publicData, ["public"]),
    ...findConfidentialNameLeaks(data, publicData, "public"),
  ]
  if (publicLeaks.length > 0) fail(`public export would leak:\n  ${publicLeaks.join("\n  ")}`)
  const gatedLeaks = [
    ...findVisibilityViolations(gatedData, ["public", "gated"]),
    ...findConfidentialNameLeaks(data, gatedData, "gated"),
  ]
  if (gatedLeaks.length > 0) fail(`gated export would leak:\n  ${gatedLeaks.join("\n  ")}`)
  ExportDataSchema.parse(publicData)
  ExportDataSchema.parse(gatedData)

  // 6. completeness
  const publicPlaceholders = findPlaceholders(publicData)
  const gatedPlaceholders = findPlaceholders(gatedData)
  const missingAmounts = budgetsWithoutAmount(gatedData)
  if (args.strict && (gatedPlaceholders.length > 0 || missingAmounts.length > 0)) {
    fail(
      `--strict: ${gatedPlaceholders.length} placeholders and ${missingAmounts.length} budgets without an amount remain, e.g.\n  ` +
        [...gatedPlaceholders, ...missingAmounts].slice(0, 15).join("\n  "),
    )
  }

  // 7. write
  const publicOut = resolve(args.publicOut)
  const gatedOut = join(source, "build", "gated.json")
  if (isInside(gatedOut, REPO_ROOT)) fail(`refusing to write gated.json inside the repository: ${gatedOut}`)
  if (isInside(publicOut, source)) fail("refusing to write public.json into the private folder")

  const publicResult = writeExport(publicOut, "public", publicData, sourceHash, args.dryRun)
  const gatedResult = writeExport(gatedOut, "gated", gatedData, sourceHash, args.dryRun)

  // ── Phase 3 · TODO (deliberately not implemented: no network calls) ──────
  // 1. Upload build/gated.json to the private Supabase Storage bucket
  //    ($CV_STORAGE_BUCKET, service role from .env.local), keyed by sourceHash.
  // 2. Upload the master PDFs from build/pdf/ next to it.
  // 3. Refuse to upload while any artefact's renderedFromHash !== sourceHash,
  //    i.e. the PDFs were not regenerated for the current source.
  const rendered = data.artefacts.filter((a) => a.renderedFromHash === sourceHash).length

  const rel = (p: string) => (isInside(p, REPO_ROOT) ? relative(REPO_ROOT, p) : p)
  console.log(
    [
      "",
      "cv:sync · ok",
      `  source        ${yamlPath}`,
      `  sourceHash    ${sourceHash}`,
      "",
      ...countByVisibility(data),
      "",
      `  public.json   ${rel(publicOut)} · ${publicResult} · ${publicPlaceholders.length} placeholders`,
      `  gated.json    ${gatedOut} · ${gatedResult} · ${gatedPlaceholders.length} placeholders`,
      `  artefacts     ${rendered}/${data.artefacts.length} rendered for this source hash (Phase 4)`,
      `  storage       upload not implemented (Phase 3 TODO; no network calls made)`,
      "",
    ].join("\n"),
  )
}

main()
