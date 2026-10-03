import type { MetadataRoute } from "next"

const SITE = "https://tarrysingh.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/experiments/panoraima",
          "/api",
          // Executive profile: the gated layer and its API (Phase 3). The
          // public teaser stays crawlable so its noindex meta can be read.
          "/curriculumvitae/dossier",
          "/api/cv",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
