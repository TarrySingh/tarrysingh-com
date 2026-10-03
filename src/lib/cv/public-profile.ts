import raw from "@/content/cv/public.json"
import { assertPublicOnly, PublicProfileSchema, type PublicProfile } from "./schema"

let cached: PublicProfile | null = null

/**
 * The committed public subset (src/content/cv/public.json, written by
 * `npm run cv:sync`). Validated when the page renders at build time: a
 * malformed file, or anything in it that is not public, fails the build.
 */
export function getPublicProfile(): PublicProfile {
  if (cached) return cached
  assertPublicOnly(raw)
  cached = PublicProfileSchema.parse(raw)
  return cached
}
