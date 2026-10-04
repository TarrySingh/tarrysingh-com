/* ============================================================
   EXECUTIVE PROFILE · UPLOAD TO THE PRIVATE BUCKET

   npm run cv:upload -- [--source <dir>] [--allow-stale] [--dry-run]

   Uploads the gated layer's content to the PRIVATE Supabase Storage
   bucket (CV_STORAGE_BUCKET, default "cv-private"):

     <source>/build/gated.json   ->  gated.json
     <source>/build/pdf/*.pdf    ->  pdf/<name>.pdf        (upsert)

   Source folder: --source, else $CV_SOURCE_DIR, else
   ~/Documents/GitHub/tarrysingh-cv-private.

   Refuses when:
     - gated.json fails GatedProfileSchema
     - a PDF is not a PDF, or has an unacceptable file name
     - an artefact's renderedFromHash differs from gated.json's
       sourceHash (the PDF was rendered from older content);
       --allow-stale overrides this one check

   Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local, so
   the target project is whichever one that file points at; the host is
   printed before anything is sent. Run `npm run cv:sync` and the PDF
   build first.

   Exit codes: 0 ok · 1 failure or refusal · 2 usage.
   ============================================================ */

import { loadEnvConfig } from "@next/env"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { homedir } from "node:os"
import { join, resolve } from "node:path"
import { parseArgs } from "node:util"
import { DEFAULT_BUCKET } from "../../src/lib/cv/access/env"
import { pdfFileName } from "../../src/lib/cv/access/keys"
import { isPlaceholder, GatedProfileSchema } from "../../src/lib/cv/schema"
import { createServiceClient } from "../../src/lib/supabase/server"

loadEnvConfig(process.cwd(), true)

const MAX_PDF_BYTES = 24 * 1024 * 1024

function usage(message?: string): never {
  if (message) console.error(`cv:upload · ${message}`)
  console.error("usage: npm run cv:upload -- [--source <dir>] [--allow-stale] [--dry-run]")
  process.exit(2)
}

function refuse(message: string): never {
  console.error(`cv:upload · refused: ${message}`)
  process.exit(1)
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      source: { type: "string" },
      "allow-stale": { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
    },
    strict: true,
    allowPositionals: false,
  })

  const source = resolve(
    values.source ??
      process.env.CV_SOURCE_DIR ??
      join(homedir(), "Documents", "GitHub", "tarrysingh-cv-private"),
  )
  const gatedPath = join(source, "build", "gated.json")
  const pdfDir = join(source, "build", "pdf")
  if (!existsSync(gatedPath)) usage(`${gatedPath} not found; run cv:sync first`)

  // 1) gated.json must be a valid gated export.
  const gatedText = readFileSync(gatedPath, "utf8")
  let gatedRaw: unknown
  try {
    gatedRaw = JSON.parse(gatedText)
  } catch {
    refuse("gated.json is not valid JSON")
  }
  const parsed = GatedProfileSchema.safeParse(gatedRaw)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 10)
      .map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
    refuse(`gated.json fails GatedProfileSchema\n${issues.join("\n")}`)
  }
  const gated = parsed.data

  // 2) Masters.
  const pdfs: Array<{ name: string; bytes: Buffer }> = []
  if (existsSync(pdfDir)) {
    for (const file of readdirSync(pdfDir).sort()) {
      if (!file.toLowerCase().endsWith(".pdf")) continue
      const name = pdfFileName(file)
      if (!name) refuse(`unacceptable PDF file name: ${file}`)
      const path = join(pdfDir, file)
      if (statSync(path).size > MAX_PDF_BYTES) refuse(`${file} is larger than 24 MB`)
      const bytes = readFileSync(path)
      if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") refuse(`${file} is not a PDF`)
      pdfs.push({ name, bytes })
    }
  }

  // 3) Drift guard and reality check for each artefact.
  const have = new Set(pdfs.map((p) => p.name))
  for (const a of gated.artefacts) {
    const label = `${a.id} (${a.kind})`
    const name = a.storageKey ? pdfFileName(a.storageKey) : null
    if (!a.storageKey) {
      console.warn(`cv:upload · warning: ${label} has no storageKey; the download will be unavailable`)
    } else if (!name) {
      refuse(`${label} has an unacceptable storageKey`)
    } else if (!have.has(name)) {
      console.warn(`cv:upload · warning: ${label} points at ${name}, which is not in build/pdf/`)
    }
    if (isPlaceholder(a.filename)) {
      console.warn(`cv:upload · warning: ${label} still has a placeholder filename`)
    }
    if (a.storageKey && a.renderedFromHash && a.renderedFromHash !== gated.sourceHash) {
      if (!values["allow-stale"]) {
        refuse(`${label} was rendered from older content (renderedFromHash differs from sourceHash); rebuild the PDFs, or pass --allow-stale`)
      }
      console.warn(`cv:upload · warning: ${label} is stale (allowed by --allow-stale)`)
    } else if (a.storageKey && !a.renderedFromHash) {
      console.warn(`cv:upload · warning: ${label} has no renderedFromHash; staleness cannot be checked`)
    }
  }

  const bucket = process.env.CV_STORAGE_BUCKET?.trim() || DEFAULT_BUCKET
  let host = "(SUPABASE_URL not set)"
  try {
    host = new URL(process.env.SUPABASE_URL ?? "").host
  } catch {
    /* reported below */
  }
  console.log(`cv:upload · target ${host} / bucket "${bucket}"`)
  console.log(`cv:upload · gated.json ${gated.sourceHash.slice(0, 19)}… and ${pdfs.length} PDF(s)`)
  if (values["dry-run"]) {
    console.log("cv:upload · dry run, nothing sent")
    return
  }

  let client
  try {
    client = createServiceClient()
  } catch {
    return refuse("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local")
  }
  const store = client.storage.from(bucket)

  const put = async (path: string, body: Buffer, contentType: string) => {
    const { error } = await store.upload(path, body, { contentType, upsert: true, cacheControl: "0" })
    if (error) {
      const hint = /not found/i.test(error.message)
        ? ` (is migration 003_profile_access.sql applied, so bucket "${bucket}" exists?)`
        : ""
      refuse(`upload of ${path} failed: ${error.message}${hint}`)
    }
    console.log(`cv:upload · uploaded ${path}`)
  }

  for (const p of pdfs) await put(`pdf/${p.name}`, p.bytes, "application/pdf")
  // gated.json goes last: it is the pointer the site reads, so it only ever
  // names masters that are already in place.
  await put("gated.json", Buffer.from(gatedText, "utf8"), "application/json")
  console.log("cv:upload · done")
}

main().catch((err: unknown) => {
  console.error(`cv:upload · ${err instanceof Error ? err.message : "failed"}`)
  process.exit(1)
})
