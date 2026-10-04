import "server-only"

import type { GatedProfile } from "./schema"

/**
 * Executive profile · where the gated layer's content comes from.
 *
 * CONTRACT (other modules import exactly these names):
 *   loadGatedProfile()  production: downloads gated.json from the private
 *                       Supabase Storage bucket (CV_STORAGE_BUCKET, default
 *                       "cv-private"), validates it with GatedProfileSchema
 *                       and caches it briefly in memory. Local development:
 *                       reads <CV_SOURCE_DIR>/build/gated.json. Gated content
 *                       is never bundled into the build or committed.
 *   loadMasterPdf()     the master PDF for an artefact storage key, from the
 *                       same bucket (development: <CV_SOURCE_DIR>/build/pdf/).
 *
 * STUB: the bodies are implemented by the access build step.
 */

export async function loadGatedProfile(): Promise<GatedProfile> {
  throw new Error("gated profile store not configured")
}

export async function loadMasterPdf(_storageKey: string): Promise<Uint8Array> {
  throw new Error("gated profile store not configured")
}
