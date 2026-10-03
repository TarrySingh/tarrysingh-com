import type { Metadata } from "next"

/**
 * Executive profile · route configuration.
 *
 * PROFILE_INDEXABLE is the single switch for search-engine indexing of the
 * public teaser at /curriculumvitae. It stays `false` until the owner decides
 * otherwise: the page is shared by direct link only, is not linked from the
 * site navigation and is not listed in sitemap.ts. The access page is never
 * indexed, whatever this flag says.
 */
export const PROFILE_INDEXABLE: boolean = false

export const PROFILE_PATHS = {
  root: "/curriculumvitae",
  access: "/curriculumvitae/access",
  privacy: "/curriculumvitae/privacy",
  /** Phase 3: the gated layer. Disallowed in robots.ts; never prefetched. */
  dossier: "/curriculumvitae/dossier",
} as const

export const PROFILE_TITLE = "Executive profile — Tarry Singh"

const NOINDEX: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false, noimageindex: true },
}

/** Robots policy for the teaser and privacy notice (follows PROFILE_INDEXABLE). */
export const PROFILE_ROBOTS: NonNullable<Metadata["robots"]> = PROFILE_INDEXABLE
  ? { index: true, follow: true }
  : NOINDEX

/** Robots policy for pages that must never be indexed (access, dossier). */
export const PROFILE_ROBOTS_NEVER: NonNullable<Metadata["robots"]> = NOINDEX
