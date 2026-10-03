import { yearOf } from "./format"
import { isPlaceholder } from "./placeholder"
import type { ProgrammeT } from "./schema"

export type Tally = { label: string; count: number }

export type ProgrammeBudgetTotal = {
  kind: string
  currency: string
  /** Set when every budget in the sum is exact. */
  exact: number | null
  /** Set when at least one budget in the sum is a range. */
  low: number | null
  high: number | null
  programmes: number
}

export type PublicProgrammeSummary = {
  count: number
  sectors: Tally[]
  themes: Tally[]
  yearSpan: { from: number; to: number | "present" } | null
  /** Omitted (null) unless EVERY public programme has a public, concrete budget. */
  budgetTotal: ProgrammeBudgetTotal | null
}

function tally(labels: string[]): Tally[] {
  const counts = new Map<string, number>()
  for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1)
  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

function yearSpan(programmes: readonly ProgrammeT[]): PublicProgrammeSummary["yearSpan"] {
  const starts = programmes
    .map((p) => yearOf(p.start))
    .filter((y): y is number => y != null)
  if (starts.length === 0) return null
  const from = Math.min(...starts)
  if (programmes.some((p) => p.end === "present")) return { from, to: "present" }
  const ends = programmes
    .map((p) => yearOf(p.end))
    .filter((y): y is number => y != null)
  if (ends.length === 0) return null
  return { from, to: Math.max(...ends) }
}

/**
 * The only budget total the teaser may show: a sum across ALL public
 * programmes, and only when every one of them carries a public budget of the
 * same kind and currency with a concrete amount. Any gap omits the total,
 * because a partial sum would misstate the record.
 */
function budgetTotal(programmes: readonly ProgrammeT[]): ProgrammeBudgetTotal | null {
  if (programmes.length === 0) return null
  let kind: string | null = null
  let currency: string | null = null
  let low = 0
  let high = 0
  let allExact = true
  for (const p of programmes) {
    const b = p.budget
    if (!b || b.visibility !== "public") return null
    if (isPlaceholder(b.kind) || isPlaceholder(b.currency)) return null
    if (kind === null) {
      kind = b.kind
      currency = b.currency
    } else if (b.kind !== kind || b.currency !== currency) {
      return null
    }
    if (b.exact != null) {
      low += b.exact
      high += b.exact
    } else if (b.rangeLow != null && b.rangeHigh != null) {
      allExact = false
      low += b.rangeLow
      high += b.rangeHigh
    } else {
      return null
    }
  }
  if (kind === null || currency === null) return null
  return allExact
    ? { kind, currency, exact: low, low: null, high: null, programmes: programmes.length }
    : { kind, currency, exact: null, low, high, programmes: programmes.length }
}

/**
 * Aggregates ONLY public programme facts for the teaser: count, sector
 * spread, theme spread, year span and (conditionally) a budget total.
 * Defensive by design: programmes that are not public are ignored even if
 * unfiltered data is passed in, so gated programmes never leak into a count.
 */
export function summarisePublicProgrammes(
  programmes: readonly ProgrammeT[],
): PublicProgrammeSummary {
  const pub = programmes.filter((p) => p.visibility === "public")
  return {
    count: pub.length,
    sectors: tally(pub.map((p) => p.sector)),
    themes: tally(pub.flatMap((p) => p.themes)),
    yearSpan: yearSpan(pub),
    budgetTotal: budgetTotal(pub),
  }
}
