/**
 * Dispatches v2 — Series axis (pure data, no server deps).
 *
 * A "series" is a second organising axis perpendicular to category
 * (Essays / Notes / Studio). Posts opt in via frontmatter:
 *
 *   series: { key: "economics", part: 3, total: 6 }
 *
 * IMPORTANT: this module is import-safe from CLIENT components (the
 * studio editor imports SERIES/SERIES_KEYS). Keep it free of `node:fs`
 * / posts.ts — the fs-using query helpers live in series-queries.ts.
 */

export type SeriesKey =
  | "sovereign"
  | "enterprise"
  | "build"
  | "workforce"
  | "economics"
  | "software-3"

/** The shape carried in a post's frontmatter. */
export interface SeriesRef {
  key: SeriesKey
  /** 1-based position within the series. */
  part: number
  /** Optional known total, for "Part 3 of 6". */
  total?: number
}

export interface SeriesMeta {
  key: SeriesKey
  name: string
  tagline: string
}

export const SERIES: Record<SeriesKey, SeriesMeta> = {
  sovereign: {
    key: "sovereign",
    name: "Sovereign & Geopolitical AI",
    tagline:
      "Regulation, export controls, sovereign compute, and the talent flows that move with them.",
  },
  enterprise: {
    key: "enterprise",
    name: "AI in the Enterprise",
    tagline:
      "Vertical industries putting AI into production — finance, health, energy, manufacturing, education, mobility, and the emerging frontier.",
  },
  build: {
    key: "build",
    name: "The Build",
    tagline:
      "Design patterns, HPC and AI infrastructure, and the architecture of agent systems.",
  },
  workforce: {
    key: "workforce",
    name: "Workforce & Human Ingenuity",
    tagline:
      "Reskilling, upskilling, productivity, and the AI-literacy thread running through all of it.",
  },
  economics: {
    key: "economics",
    name: "The Economics of AI",
    tagline:
      "Capex cycles, hyperscaler spend, M&A, and the debt stack underneath the boom.",
  },
  "software-3": {
    key: "software-3",
    name: "Software 3.0",
    tagline:
      "Intent becomes the program, agents become the workforce, and automation crosses from the screen into the world. The most plausible breathtaking future, mapped to 2040.",
  },
}

export const SERIES_KEYS = Object.keys(SERIES) as SeriesKey[]

export function isSeriesKey(value: unknown): value is SeriesKey {
  return (
    typeof value === "string" && (SERIES_KEYS as string[]).includes(value)
  )
}

export function getSeries(key: SeriesKey): SeriesMeta {
  return SERIES[key]
}
