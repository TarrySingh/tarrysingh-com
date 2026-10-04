import { isPlaceholder } from "./placeholder"

/**
 * Display helpers for the executive profile. Placeholders always pass through
 * untouched so the page can style them as placeholders.
 */

const ROMAN: Array<[number, string]> = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
]

export function toRoman(n: number): string {
  let rest = Math.max(0, Math.floor(n))
  let out = ""
  for (const [value, glyph] of ROMAN) {
    while (rest >= value) {
      out += glyph
      rest -= value
    }
  }
  return out
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/** 1995 → "1995"; "2019-03" → "Mar 2019"; "present" → "present". */
export function formatPoint(value: string | number): string {
  if (typeof value === "number") return String(value)
  if (isPlaceholder(value) || value === "present") return value
  const m = /^(\d{4})-(\d{2})$/.exec(value)
  if (!m) return value
  return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`
}

/** Calendar year of a year or "YYYY-MM" value; null for placeholders. */
export function yearOf(value: string | number): number | null {
  if (typeof value === "number") return value
  const m = /^(\d{4})-\d{2}$/.exec(value)
  return m ? Number(m[1]) : null
}

/** "2026-10-03T…Z" → "3 October 2026". */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso))
}

function trimmed(x: number): string {
  return Number(x.toFixed(1)).toString()
}

/** 45_000_000 → "45m"; 1_200_000_000 → "1.2bn" (British style). */
export function formatAmount(n: number): string {
  if (n >= 1e9) return `${trimmed(n / 1e9)}bn`
  if (n >= 1e6) return `${trimmed(n / 1e6)}m`
  if (n >= 1e3) return `${trimmed(n / 1e3)}k`
  return trimmed(n)
}

type MoneyLike = {
  currency: string
  exact: number | null
  rangeLow: number | null
  rangeHigh: number | null
}

/** "EUR 45m" or "EUR 40–60m"; null when the amount is not yet known. */
export function formatMoney(m: MoneyLike): string | null {
  if (isPlaceholder(m.currency)) return null
  if (m.exact != null) return `${m.currency} ${formatAmount(m.exact)}`
  if (m.rangeLow != null && m.rangeHigh != null) {
    const lo = formatAmount(m.rangeLow)
    const hi = formatAmount(m.rangeHigh)
    const loUnit = lo.replace(/^[\d.]+/, "")
    const hiUnit = hi.replace(/^[\d.]+/, "")
    const loShown = loUnit === hiUnit ? lo.slice(0, lo.length - loUnit.length) : lo
    return `${m.currency} ${loShown}–${hi}`
  }
  return null
}

type TeamLike = {
  direct: number | null
  total: number | null
  includesVendors: boolean | null
}

/** "12 direct · 140 total, including vendors"; null when unknown. */
export function formatTeam(t: TeamLike): string | null {
  const parts: string[] = []
  if (t.direct != null) parts.push(`${t.direct.toLocaleString("en-GB")} direct`)
  if (t.total != null) parts.push(`${t.total.toLocaleString("en-GB")} total`)
  if (parts.length === 0) return null
  const vendors = t.includesVendors ? ", including vendors" : ""
  return `${parts.join(" · ")}${vendors}`
}

/* ── Clean-text helpers: placeholders render as nothing ─────────────────── */

/**
 * The display text of a content value, or null when it is empty or still a
 * `[PLACEHOLDER: …]`. Pages use this so unfinished data degrades to absence
 * rather than to bracketed text.
 */
export function txt(value: string | number | null | undefined): string | null {
  if (value == null) return null
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : null
  const s = value.trim()
  if (s === "" || isPlaceholder(s)) return null
  return s
}

/** Only the values that are real (not empty, not placeholders). */
export function txts(values: ReadonlyArray<string | number | null | undefined>): string[] {
  return values.map(txt).filter((v): v is string => v != null)
}

/** "supervisory-board" → "Supervisory board"; placeholders → null. */
export function kindLabel(kind: string | null | undefined): string | null {
  const k = txt(kind)
  if (!k) return null
  const words = k.replace(/-/g, " ")
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * A start–end span, or null when the start is unknown.
 * "2019-03" + "present" → "Mar 2019 – present"; 1995 + 2001 → "1995–2001".
 */
export function formatSpan(
  start: string | number | null | undefined,
  end: string | number | null | undefined,
): string | null {
  const s = start == null || isPlaceholder(start) ? null : formatPoint(start)
  if (!s) return null
  const e = end == null || isPlaceholder(end) ? null : formatPoint(end)
  if (!e || e === s) return s
  const spaced = /\s/.test(s) || /\s/.test(e) || e === "present"
  return spaced ? `${s} – ${e}` : `${s}–${e}`
}

/** Fractional year for charts: 2019 → 2019, "2019-07" → 2019.5. */
export function yearFraction(value: string | number | null | undefined): number | null {
  if (value == null) return null
  if (typeof value === "number") return value
  const m = /^(\d{4})-(\d{2})$/.exec(value)
  if (m) return Number(m[1]) + (Number(m[2]) - 1) / 12
  if (/^\d{4}$/.test(value)) return Number(value)
  return null
}

type NumberOrRangeLike = number | { low: number; high: number } | string

/** 42 → "42"; {low: 40, high: 60} → "40–60"; placeholders → null. */
export function formatValue(
  value: NumberOrRangeLike,
  unit?: string | null,
): string | null {
  let core: string | null
  if (typeof value === "number") core = value.toLocaleString("en-GB")
  else if (typeof value === "string") core = txt(value)
  else core = `${value.low.toLocaleString("en-GB")}–${value.high.toLocaleString("en-GB")}`
  if (!core) return null
  const u = txt(unit ?? null)
  if (!u) return core
  if (u === "%" || u === "pp") return `${core}${u === "pp" ? " pp" : "%"}`
  if (u === "x" || u === "×") return `${core}×`
  return `${core} ${u}`
}

/** CEFR code → reader-facing label. */
export function cefrLabel(level: string | null | undefined): string | null {
  const l = txt(level)
  if (!l) return null
  return l === "native" ? "Native" : `CEFR ${l}`
}

/** Split prose into paragraphs on blank lines. */
export function paragraphs(text: string | null | undefined): string[] {
  const t = txt(text)
  if (!t) return []
  return t
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
}
