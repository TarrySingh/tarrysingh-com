/**
 * Sprint 8 — editable copy for the StatisticalCeiling plate.
 * Every user-facing string in src/components/synaptic/StatisticalCeiling.tsx
 * reads from this module.
 */

export const STAT_CEILING_DISPLAY_NAME = "Statistical Ceiling · Symphony"

export const STAT_CEILING_ARIA_LABEL =
  "The statistical ceiling, SWE-bench Verified headline scores against independent re-evaluation."

export const STAT_CEILING_PLATE_MARKER = "PLATE V · MMXXVI · FIG. 1.2.b"
export const STAT_CEILING_BANNER = "SWE-BENCH VERIFIED · HEADLINE vs FILTERED"
export const STAT_CEILING_TITLE = "The statistical ceiling"
export const STAT_CEILING_Y_AXIS_LABEL = "% RESOLVED"
export const STAT_CEILING_CEILING_LABEL = "HEADLINE CEILING ≈ 80 %"
export const STAT_CEILING_LEGEND_HEADLINE = "HEADLINE"
export const STAT_CEILING_LEGEND_FILTERED = "INDEPENDENTLY RE-EVALUATED"
export const STAT_CEILING_SERIES_HEADLINE = "Headline score"
export const STAT_CEILING_SERIES_FILTERED = "After filtering"
export const STAT_CEILING_EMPTY_STATE =
  "Three SWE-bench Verified configurations, three headlines, three independent re-evaluations. Hover or click any bar to inspect the measurement and its citation."
export const STAT_CEILING_FOOTER =
  "The headline number is a ceiling, not a result. SYMPHONY is not a scaling bet, it is an architectural bet built on the failure mode this chart names."

export type StatCeilingRow = {
  /** Code-owned. */
  id: string
  label: string
  detail: string
  /** Code-owned. */
  headline: number
  /** Code-owned. */
  filtered: number
  date: string
  source: string
}

export const STAT_CEILING_ROWS: ReadonlyArray<StatCeilingRow> = [
  {
    id: "opus45",
    label: "Claude Opus 4.5",
    detail: "first across the 80 % line",
    headline: 80.9,
    filtered: 80.9,
    date: "Dec 2025",
    source:
      "Anthropic announcement (December 2025). No independent re-evaluation has been published yet; the filtered bar is provisional.",
  },
  {
    id: "sweagent10",
    label: "SWE-agent 1.0 · Claude 3.5",
    detail: "headline vs. filtered",
    headline: 57.6,
    filtered: 31.8,
    date: "Mar 2026",
    source:
      "SWE-Bench+ at ICLR 2026, filters solution leakage and weak test cases.",
  },
  {
    id: "sweagentlead",
    label: "SWE-agent · leading config",
    detail: "headline vs. re-evaluated",
    headline: 12.47,
    filtered: 3.97,
    date: "May 2025",
    source:
      "ICSE 2025 Companion · stripping solution leakage from a leading SWE-agent configuration.",
  },
]
