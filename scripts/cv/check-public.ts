/* ============================================================
   EXECUTIVE PROFILE · PUBLIC-LEAK GUARD   (runs as `prebuild`)

   npx tsx scripts/cv/check-public.ts [--file <public.json>]

   This repository is public. Exit 1 when the committed public subset
   (default src/content/cv/public.json) contains:
     · any item whose visibility is not "public", or a list item
       without a visibility at all
     · any field whose NAME suggests private data (compensation,
       salary, address, date of birth, phone, referee, …)
     · any VALUE that looks like a phone number, or an email address
       outside profile.contact.email
     · anything that does not match the public schema
   and when the folder holding it contains anything but public.json
   (gated.json or profile.yaml must never be copied into the repo).

   Confidential-name gate (local only): when the private folder holds
   confidential-names.txt (one NDA client name per line, # comments),
   exit 1 if any of them appears, case-insensitively on word
   boundaries, in public.json or any source file under
   src/app/curriculumvitae, src/components/cv or src/lib/cv. The list
   itself never enters this repo; on Vercel it is absent and the gate
   is skipped. Private folder: $CV_SOURCE_DIR, else
   ~/Documents/GitHub/tarrysingh-cv-private.
   ============================================================ */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { homedir } from "node:os"
import { basename, dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  findNonPublicItems,
  findPlaceholders,
  PublicProfileSchema,
} from "../../src/lib/cv/schema"

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, "..", "..")
const DEFAULT_FILE = join(REPO_ROOT, "src", "content", "cv", "public.json")

/** Whole-word matches on camelCase / snake_case / kebab-case key parts. */
const BANNED_KEY_WORDS = new Set([
  "compensation",
  "salary",
  "salaries",
  "remuneration",
  "bonus",
  "fee",
  "fees",
  "pay",
  "payroll",
  "address",
  "addresses",
  "street",
  "postcode",
  "zip",
  "phone",
  "telephone",
  "mobile",
  "whatsapp",
  "birth",
  "birthday",
  "dob",
  "age",
  "nationality",
  "passport",
  "ssn",
  "bsn",
  "marital",
  "spouse",
  "religion",
  "health",
  "iban",
  "referee",
  "referees",
  "leaving",
  "confidential",
  "nda",
  "password",
  "secret",
])

/** Substring matches on the key with separators removed (e.g. dateofbirth). */
const BANNED_KEY_FRAGMENTS = [
  "compensation",
  "salary",
  "remuneration",
  "address",
  "phone",
  "birth",
  "passport",
  "referee",
  "marital",
  "nationality",
]

const PHONE_RE = /(?:^|[\s(:])\+\d[\d\s().-]{7,}\d/
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
const EMAIL_ALLOWED_AT = new Set(["profile.contact.email"])
const ALLOWED_FILES = new Set(["public.json", ".gitkeep", ".DS_Store"])

function keyWords(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

function suspiciousKey(key: string): boolean {
  if (keyWords(key).some((w) => BANNED_KEY_WORDS.has(w))) return true
  const compact = key.toLowerCase().replace(/[^a-z0-9]/g, "")
  return BANNED_KEY_FRAGMENTS.some((f) => compact.includes(f))
}

function joinPath(path: string, key: string | number): string {
  if (typeof key === "number") return `${path}[${key}]`
  return path ? `${path}.${key}` : key
}

function scanKeysAndValues(json: unknown): string[] {
  const problems: string[] = []
  const visit = (value: unknown, path: string) => {
    if (Array.isArray(value)) {
      value.forEach((v, i) => visit(v, joinPath(path, i)))
      return
    }
    if (value !== null && typeof value === "object") {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        const at = joinPath(path, k)
        if (suspiciousKey(k)) problems.push(`${at}: field name suggests private data`)
        visit(v, at)
      }
      return
    }
    if (typeof value === "string") {
      if (PHONE_RE.test(value)) problems.push(`${path}: value looks like a phone number`)
      if (EMAIL_RE.test(value) && !EMAIL_ALLOWED_AT.has(path)) {
        problems.push(`${path}: email address outside profile.contact.email`)
      }
    }
  }
  visit(json, "")
  return problems
}

const PRIVATE_DIR =
  process.env.CV_SOURCE_DIR || join(homedir(), "Documents", "GitHub", "tarrysingh-cv-private")
const NAMES_FILE = join(PRIVATE_DIR, "confidential-names.txt")
const NAME_SCAN_DIRS = ["src/app/curriculumvitae", "src/components/cv", "src/lib/cv"]
const NAME_SCAN_EXT = /\.(tsx?|jsx?|mjs|cjs|css|json|md|mdx|txt|svg|html)$/i

function loadConfidentialNames(): string[] | null {
  if (!existsSync(NAMES_FILE)) return null
  return readFileSync(NAMES_FILE, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Unicode-aware word boundary: no letter or digit on either side. */
function nameMatcher(names: string[]): RegExp | null {
  if (names.length === 0) return null
  const alt = names
    .map((n) => n.normalize("NFC"))
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
    .join("|")
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${alt})(?![\\p{L}\\p{N}])`, "giu")
}

function walk(dir: string, out: string[]): void {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (NAME_SCAN_EXT.test(name)) out.push(full)
  }
}

/** Never prints the matched name itself, only where it was found. */
function scanConfidentialNames(publicFile: string): { problems: string[]; skipped: boolean } {
  const names = loadConfidentialNames()
  if (names === null) return { problems: [], skipped: true }
  const re = nameMatcher(names)
  if (!re) return { problems: [], skipped: false }
  const files = [publicFile]
  for (const d of NAME_SCAN_DIRS) walk(join(REPO_ROOT, d), files)
  const problems: string[] = []
  for (const f of files) {
    const lines = readFileSync(f, "utf8").normalize("NFC").split(/\n/)
    lines.forEach((line, i) => {
      re.lastIndex = 0
      if (re.test(line)) problems.push(`${display(f)}:${i + 1}: names a confidential client (see confidential-names.txt)`)
    })
  }
  return { problems, skipped: false }
}

function parseArgs(argv: string[]): string {
  let file = DEFAULT_FILE
  for (let i = 0; i < argv.length; i++) {
    const [flag, inline] = argv[i].split(/=([\s\S]*)/, 2)
    if (flag === "--file") {
      const v = inline ?? argv[++i]
      if (!v) {
        console.error("cv:check · --file needs a value")
        process.exit(2)
      }
      file = resolve(v)
    } else {
      console.error(`cv:check · unknown argument ${argv[i]}\nusage: npx tsx scripts/cv/check-public.ts [--file <public.json>]`)
      process.exit(2)
    }
  }
  return file
}

/** Repo-relative when inside the repo, absolute otherwise. */
function display(path: string): string {
  const rel = relative(REPO_ROOT, path)
  return rel.startsWith("..") ? path : rel
}

function main(): void {
  const file = parseArgs(process.argv.slice(2))
  const shown = display(file)
  const problems: string[] = []

  if (!existsSync(file)) {
    console.error(`cv:check · FAILED · ${shown} is missing (run npm run cv:sync)`)
    process.exit(1)
  }

  let json: unknown
  try {
    json = JSON.parse(readFileSync(file, "utf8"))
  } catch (error) {
    console.error(`cv:check · FAILED · ${shown} is not valid JSON: ${(error as Error).message}`)
    process.exit(1)
  }

  const audience = (json as { audience?: unknown } | null)?.audience
  if (audience !== "public") problems.push(`audience is ${JSON.stringify(audience)}, expected "public"`)

  problems.push(...findNonPublicItems(json))
  problems.push(...scanKeysAndValues(json))

  const parsed = PublicProfileSchema.safeParse(json)
  if (!parsed.success) {
    for (const issue of parsed.error.issues.slice(0, 20)) {
      problems.push(`schema · ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    }
  }

  const names = scanConfidentialNames(file)
  problems.push(...names.problems)
  if (names.skipped) console.log("cv:check · confidential-name gate skipped (no private names list here)")

  const dir = dirname(file)
  for (const name of readdirSync(dir)) {
    if (name === basename(file) || ALLOWED_FILES.has(name)) continue
    problems.push(
      `unexpected file ${display(join(dir, name))}: only public.json belongs here; gated and private material stays in the private folder`,
    )
  }

  if (problems.length > 0) {
    console.error(`cv:check · FAILED · ${shown} · ${problems.length} problem(s)`)
    for (const p of problems.slice(0, 50)) console.error(`  ${p}`)
    if (problems.length > 50) console.error(`  … and ${problems.length - 50} more`)
    process.exit(1)
  }

  let items = 0
  const count = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(count)
    else if (value !== null && typeof value === "object") {
      if ((value as { visibility?: unknown }).visibility === "public") items++
      Object.values(value as Record<string, unknown>).forEach(count)
    }
  }
  count(json)
  console.log(
    `cv:check · ok · ${shown} · ${items} public items · ${findPlaceholders(json).length} placeholders`,
  )
}

main()
