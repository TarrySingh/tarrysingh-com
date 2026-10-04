import "server-only"

import { createServiceClient } from "@/lib/supabase/server"
import { DEFAULT_BUCKET } from "./access/env"
import { pdfFileName } from "./access/keys"
import { GatedProfileSchema, type GatedProfile } from "./schema"

/**
 * Executive profile · where the gated layer's content comes from.
 *
 * CONTRACT (other modules import exactly these names):
 *   loadGatedProfile()  production: downloads gated.json from the private
 *                       Supabase Storage bucket (CV_STORAGE_BUCKET, default
 *                       "cv-private"), validates it with GatedProfileSchema
 *                       and caches it briefly in memory (60 s). Local
 *                       development: reads <CV_SOURCE_DIR>/build/gated.json.
 *                       Gated content is never bundled into the build or
 *                       committed.
 *   loadMasterPdf()     the master PDF for an artefact storage key, from the
 *                       same bucket under "pdf/" (development:
 *                       <CV_SOURCE_DIR>/build/pdf/).
 *
 * Development means NODE_ENV=development with VERCEL unset. `next build`
 * inlines NODE_ENV=production, so the filesystem branch is absent from
 * deployed bundles.
 */

const CACHE_TTL_MS = 60_000

let cache: { at: number; profile: GatedProfile } | null = null

function isLocalDev(): boolean {
  return process.env.NODE_ENV === "development" && !process.env.VERCEL
}

async function localBuildDir(): Promise<string> {
  const { homedir } = await import("node:os")
  const { join } = await import("node:path")
  const source =
    process.env.CV_SOURCE_DIR?.trim() ||
    join(homedir(), "Documents", "GitHub", "tarrysingh-cv-private")
  return join(source, "build")
}

function bucketName(): string {
  return process.env.CV_STORAGE_BUCKET?.trim() || DEFAULT_BUCKET
}

export async function loadGatedProfile(): Promise<GatedProfile> {
  if (isLocalDev()) {
    const { readFile } = await import("node:fs/promises")
    const { join } = await import("node:path")
    const raw = await readFile(join(await localBuildDir(), "gated.json"), "utf8")
    return GatedProfileSchema.parse(JSON.parse(raw))
  }

  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.profile

  const { data, error } = await createServiceClient()
    .storage.from(bucketName())
    .download("gated.json")
  if (error || !data) throw new Error("gated profile unavailable")
  const profile = GatedProfileSchema.parse(JSON.parse(await data.text()))
  cache = { at: Date.now(), profile }
  return profile
}

export async function loadMasterPdf(storageKey: string): Promise<Uint8Array> {
  const name = pdfFileName(storageKey)
  if (!name) throw new Error("invalid storage key")

  if (isLocalDev()) {
    const { readFile } = await import("node:fs/promises")
    const { join } = await import("node:path")
    return new Uint8Array(await readFile(join(await localBuildDir(), "pdf", name)))
  }

  const { data, error } = await createServiceClient()
    .storage.from(bucketName())
    .download(`pdf/${name}`)
  if (error || !data) throw new Error("master pdf unavailable")
  return new Uint8Array(await data.arrayBuffer())
}
