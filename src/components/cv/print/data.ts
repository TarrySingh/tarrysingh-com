/**
 * Executive profile · print view model.
 *
 * Turns a validated GatedProfile into plain, render-ready values for the
 * three PDF artefacts. Everything that is still a placeholder is dropped
 * here, once, so the components never have to think about it.
 *
 * Pure TypeScript: no node, no next/*, no React. Content arrives as an
 * argument and is never stored in this repository.
 */
import { isPlaceholder } from "../../../lib/cv/schema"
import type { GatedProfile } from "../../../lib/cv/schema"

/* ── Small helpers ─────────────────────────────────────────────────────── */

/** True when a string is empty or still carries an intake placeholder. */
export function isBlank(value: unknown): boolean {
  if (typeof value !== "string") return true
  const t = value.trim()
  return t === "" || isPlaceholder(t) || t.includes("[PLACEHOLDER")
}

/** The trimmed string, or null when blank or a placeholder. */
export function clean(value: string | null | undefined): string | null {
  return isBlank(value) ? null : (value as string).trim()
}

function cleanList(values: ReadonlyArray<string | null | undefined>): string[] {
  return values.map(clean).filter((v): v is string => v !== null)
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatAmount(n: number): string {
  const t = (x: number) => Number(x.toFixed(1)).toString()
  if (n >= 1e9) return `${t(n / 1e9)}bn`
  if (n >= 1e6) return `${t(n / 1e6)}m`
  if (n >= 1e3) return `${t(n / 1e3)}k`
  return t(n)
}

type MoneyLike = {
  currency: string
  exact: number | null
  rangeLow: number | null
  rangeHigh: number | null
}

export function money(m: MoneyLike | null | undefined): string | null {
  if (!m || isBlank(m.currency)) return null
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

type TeamLike = { direct: number | null; total: number | null } | null | undefined

function teamLine(t: TeamLike): string | null {
  if (!t) return null
  if (t.total != null) return `Team ${t.total.toLocaleString("en-GB")}`
  if (t.direct != null) return `Team ${t.direct.toLocaleString("en-GB")}`
  return null
}

/** A metric value: a number, a low/high range, or null for a placeholder. */
function metricValue(v: unknown): string | null {
  if (typeof v === "number") return v.toLocaleString("en-GB")
  if (v && typeof v === "object" && "low" in v && "high" in v) {
    const r = v as { low: number; high: number }
    return `${r.low.toLocaleString("en-GB")}–${r.high.toLocaleString("en-GB")}`
  }
  return null
}

function joinMetric(value: string, unit: string | null, timeframe: string | null): string {
  const u = clean(unit)
  const tight = u !== null && /^(%|% under|%\s)/.test(u)
  const body = u ? (tight ? `${value}${u}` : /^\s/.test(unit as string) ? `${value}${unit}` : `${value} ${u}`) : value
  const tf = clean(timeframe)
  return tf ? `${body} in ${tf}` : body
}

type YM = { y: number; m: number }

function parseYM(v: unknown): YM | null {
  if (typeof v === "number") return { y: v, m: 1 }
  if (typeof v !== "string") return null
  const m = /^(\d{4})-(\d{2})$/.exec(v)
  return m ? { y: Number(m[1]), m: Number(m[2]) } : null
}

const key = (p: YM) => p.y * 12 + (p.m - 1)

function monthYear(p: YM): string {
  return `${MONTHS[p.m - 1]} ${p.y}`
}

function lowerFirst(s: string): string {
  // keep acronyms and proper nouns intact: lower-case only an ordinary word
  return /^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s
}

/* ── View types ────────────────────────────────────────────────────────── */

export type Lane = "founder-ceo" | "executive" | "board-advisory" | "thought-leadership"

export type OutcomeView = {
  id: string
  text: string
  metric: string | null
  signature: boolean
  roleId: string
  /** "Organisation · 2019–2021" */
  context: string
}

export type RoleView = {
  id: string
  title: string
  org: string
  lane: Lane | null
  eraId: string | null
  start: YM
  end: YM
  present: boolean
  startLabel: string
  endLabel: string
  /** "2019–2021" or "2019–present" */
  years: string
  reportingLine: string | null
  /** "Team 140 · EUR 40–60m budget" parts, already formatted */
  scope: string[]
  geography: string[]
  mandate: string | null
  outcomes: OutcomeView[]
}

export type EraView = { id: string; title: string; wave: string | null; start: number; end: number }

export type FigureView = { value: string; label: string }

export type ProgrammeView = {
  id: string
  title: string
  /** Anonymised descriptor, exactly as in the data. Never the client's name. */
  descriptor: string | null
  sector: string | null
  years: string | null
  role: string | null
  scale: string | null
  result: string | null
  featured: boolean
}

export type MatrixCellView = { competency: string; rating: "strong" | "partial" }

export type SeatView = { title: string; primary: boolean }

export type BoardView = { title: string; org: string; years: string; detail: string | null }

export type EducationView = { institution: string; qualification: string; years: string | null }

export type View = {
  name: string
  positioning: string | null
  base: string | null
  /** Public role address, only if the data carries one. */
  contactEmail: string | null
  summary: string[]
  closingLine: string | null
  figures: FigureView[]
  /** Things the print layout had to leave out, for the build log. */
  warnings: string[]
  eras: EraView[]
  roles: RoleView[]
  /** Signature achievements, most recent first, 6 to 8 when the data allows. */
  signature: OutcomeView[]
  programmes: ProgrammeView[]
  /** seat -> pillar -> best cell */
  matrix: Record<"CEO" | "CAIO" | "CTO", Record<"People" | "Process" | "Technology", MatrixCellView | null>>
  hasMatrix: boolean
  seats: SeatView[]
  mandate: { label: string; values: string[] }[]
  board: BoardView[]
  education: EducationView[]
  credentials: string[]
  languages: string[]
  sectors: string[]
  /** Whole years of career, rounded down to five ("30"), or null. */
  careerYears: number | null
  currentRoles: RoleView[]
  sourceHash: string
  generatedLabel: string
}

/* ── Build ─────────────────────────────────────────────────────────────── */

/** A proof-figure label must stay a caption, not a sentence. */
const MAX_FIGURE_LABEL = 100

const LANES = new Set(["founder-ceo", "executive", "board-advisory", "thought-leadership"])

export function buildView(g: GatedProfile, now: Date = new Date()): View {
  const nowYM: YM = { y: now.getUTCFullYear(), m: now.getUTCMonth() + 1 }
  const profile = g.profile

  /* roles */
  const roles: RoleView[] = []
  for (const r of g.roles) {
    const title = clean(r.title)
    const org = clean(r.organisation.name)
    const start = parseYM(r.start)
    const present = r.end === "present"
    const end = present ? nowYM : parseYM(r.end)
    if (!title || !org || !start || !end) continue
    const years = `${start.y}–${present ? "present" : end.y}`
    const sameYear = !present && start.y === end.y
    const scope: string[] = []
    if (r.scope) {
      const team = teamLine(r.scope.teamSize)
      if (team) scope.push(team)
      const amount = money(r.scope.budget)
      const kind = r.scope.budget && !isBlank(r.scope.budget.kind) ? r.scope.budget.kind : null
      if (amount) scope.push(kind ? `${amount} ${kind}` : amount)
    }
    const context = `${org} · ${sameYear ? start.y : years}`
    const outcomes: OutcomeView[] = []
    for (const o of r.outcomes) {
      const text = clean(o.statement)
      if (!text) continue
      let metric: string | null = null
      if (o.metric) {
        const v = metricValue(o.metric.value)
        if (v) metric = joinMetric(v, o.metric.unit, o.metric.timeframe)
      }
      outcomes.push({ id: o.id, text, metric, signature: o.signature, roleId: r.id, context })
    }
    roles.push({
      id: r.id,
      title,
      org,
      lane: typeof r.lane === "string" && LANES.has(r.lane) ? (r.lane as Lane) : null,
      eraId: r.eraId,
      start,
      end,
      present,
      startLabel: monthYear(start),
      endLabel: present ? "present" : monthYear(end),
      years,
      reportingLine: clean(r.reportingLine),
      scope,
      geography: cleanList(r.scope?.geography ?? []),
      mandate: clean(r.mandate?.text),
      outcomes,
    })
  }
  // most recent first: roles still running, then by start date, newest first
  roles.sort((a, b) => Number(b.present) - Number(a.present) || key(b.start) - key(a.start))

  /* signature achievements */
  const allOutcomes = roles.flatMap((r) => r.outcomes)
  const flagged = allOutcomes.filter((o) => o.signature)
  let signature = flagged.slice(0, 8)
  if (signature.length < 6) {
    const chosen = new Set(signature.map((o) => o.id))
    for (const o of allOutcomes) {
      if (signature.length >= 6) break
      if (!chosen.has(o.id) && o.metric) {
        signature = [...signature, o]
        chosen.add(o.id)
      }
    }
  }

  /* eras */
  const eras: EraView[] = []
  for (const e of g.eras) {
    const title = clean(e.title)
    const start = typeof e.start === "number" ? e.start : null
    const end = typeof e.end === "number" ? e.end : e.end === "present" ? nowYM.y : null
    if (!title || start === null || end === null) continue
    eras.push({ id: e.id, title, wave: clean(e.wave), start, end })
  }
  eras.sort((a, b) => a.start - b.start)

  /* proof figures */
  const figures: FigureView[] = []
  const warnings: string[] = []
  for (const f of g.proofFigures) {
    const value = clean(f.value)
    const label = clean(f.label)
    if (!value || !label) continue
    if (label.length > MAX_FIGURE_LABEL || figures.length >= 4) {
      warnings.push(
        label.length > MAX_FIGURE_LABEL
          ? `proof figure "${value}" skipped: its label is ${label.length} characters (limit ${MAX_FIGURE_LABEL}); shorten it in profile.yaml`
          : `proof figure "${value}" skipped: only four figures fit the layout`,
      )
      continue
    }
    figures.push({ value, label })
  }

  /* programmes */
  const programmes: ProgrammeView[] = g.programmes
    .map((p): ProgrammeView | null => {
      const title = clean(p.title)
      if (!title) return null
      const s = parseYM(p.start)
      const e = p.end === "present" ? nowYM : parseYM(p.end)
      const years = s && e ? (s.y === e.y ? String(s.y) : `${s.y}–${p.end === "present" ? "present" : e.y}`) : null
      const scaleParts: string[] = []
      const amount = money(p.budget)
      if (amount) {
        const kind = p.budget && !isBlank(p.budget.kind) ? p.budget.kind : null
        scaleParts.push(kind ? `${amount} ${kind}` : amount)
      }
      if (scaleParts.length === 0) {
        const team = teamLine(p.teamSize)
        if (team) scaleParts.push(team)
      }
      let result: string | null = null
      for (const o of p.outcomes) {
        const stmt = clean(o.statement)
        const v = metricValue(o.value)
        const metric = clean(o.metric)
        if (stmt) {
          result = stmt
        } else if (metric && v) {
          result = `${metric}: ${joinMetric(v, o.unit, o.timeframe)}`
        }
        if (result) break
      }
      return {
        id: p.id,
        title,
        descriptor: clean(p.client?.descriptor),
        sector: clean(p.sector),
        years,
        role: clean(p.role),
        scale: scaleParts.length ? scaleParts.join(" · ") : null,
        result,
        featured: p.featured,
      }
    })
    .filter((p): p is ProgrammeView => p !== null)
    .sort((a, b) => Number(b.featured) - Number(a.featured))

  /* leadership matrix */
  const seatsKeys = ["CEO", "CAIO", "CTO"] as const
  const pillars = ["People", "Process", "Technology"] as const
  const matrix = {} as View["matrix"]
  let hasMatrix = false
  for (const seat of seatsKeys) {
    matrix[seat] = { People: null, Process: null, Technology: null }
    for (const pillar of pillars) {
      const cells = (g.matrix ?? [])
        .filter((c) => c.seat === seat && c.pillar === pillar && !isBlank(c.competency))
        .sort((a, b) => Number(b.rating === "strong") - Number(a.rating === "strong"))
      const best = cells[0]
      if (best) {
        matrix[seat][pillar] = { competency: best.competency.trim(), rating: best.rating }
        hasMatrix = true
      }
    }
  }

  /* openness */
  const o = g.openness
  const seats: SeatView[] = (o?.targetSeats ?? [])
    .map((s) => ({ title: clean(s.title), primary: s.emphasis === "primary" }))
    .filter((s): s is SeatView => s.title !== null)
    .sort((a, b) => Number(b.primary) - Number(a.primary))
  const mandate: View["mandate"] = []
  if (o) {
    const add = (label: string, values: string[]) => {
      if (values.length) mandate.push({ label, values })
    }
    add("Sectors", cleanList(o.sectors))
    add("Company stage", cleanList(o.companyStages))
    add("Geographies", cleanList(o.geographies))
    add("Format", cleanList(o.formats as string[]).map((f) => f.charAt(0).toUpperCase() + f.slice(1)))
    const avail = clean(o.availability)
    if (avail) add("Availability", [avail])
    const horizon = clean(o.timeHorizon)
    if (horizon) add("Horizon", [horizon])
    const reloc = clean(o.relocation)
    if (reloc) add("Mobility", [reloc])
  }

  /* board, education, credentials, languages */
  const board: BoardView[] = g.boardRoles
    .map((b): BoardView | null => {
      const title = clean(b.title)
      const org = clean(b.organisation.name)
      const s = parseYM(b.start)
      const e = b.end === "present" ? nowYM : parseYM(b.end)
      if (!title || !org || !s) return null
      const years = `${s.y}–${b.end === "present" || !e ? "present" : e.y}`
      const committees = cleanList(b.committees)
      return { title, org, years, detail: committees.length ? committees.join(", ") : clean(b.remit) }
    })
    .filter((b): b is BoardView => b !== null)

  const education: EducationView[] = g.education
    .map((e): EducationView | null => {
      const institution = clean(e.institution)
      const qualification = clean(e.qualification)
      if (!institution || !qualification) return null
      const field = clean(e.field)
      const q = field && !qualification.toLowerCase().includes(field.toLowerCase()) ? `${qualification}, ${field}` : qualification
      const sy = typeof e.start === "number" ? e.start : null
      const ey = typeof e.end === "number" ? e.end : null
      const years = ey && sy && ey !== sy ? `${sy}–${ey}` : ey ? String(ey) : sy ? String(sy) : null
      return { institution, qualification: q, years }
    })
    .filter((e): e is EducationView => e !== null)

  const credentials = g.credentials
    .map((c) => {
      const name = clean(c.name)
      const issuer = clean(c.issuer)
      if (!name) return null
      const yr = typeof c.year === "number" ? ` ${c.year}` : ""
      return issuer ? `${name}, ${issuer}${yr}` : `${name}${yr}`
    })
    .filter((c): c is string => c !== null)

  const languages = g.languages
    .map((l) => {
      const name = clean(l.language)
      const level = clean(l.level)
      if (!name) return null
      if (!level) return name
      return level === "native" ? `${name} (native)` : `${name} (${level})`
    })
    .filter((l): l is string => l !== null)

  const sectors = cleanList(g.sectors.map((s) => s.label))

  /* career length, rounded down to the nearest five, only when it is real */
  const firstYear = Math.min(
    ...[...roles.map((r) => r.start.y), ...eras.map((e) => e.start)].filter((n) => Number.isFinite(n)),
  )
  const careerYears =
    Number.isFinite(firstYear) && nowYM.y - firstYear >= 10 ? Math.floor((nowYM.y - firstYear) / 5) * 5 : null

  const contact = profile?.contact
  const contactEmail =
    contact && contact.visibility === "public" && !isBlank(contact.email) ? contact.email.trim() : null

  const summaryText = clean(profile?.summary?.text)
  const generated = new Date(g.generatedAt)

  return {
    name: clean(profile?.name) ?? "Name pending",
    positioning: clean(profile?.positioning),
    base: clean(profile?.base),
    contactEmail,
    summary: summaryText ? summaryText.split(/\n{2,}/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean) : [],
    closingLine: clean(profile?.closingLine?.text),
    figures,
    warnings,
    eras,
    roles,
    signature,
    programmes,
    matrix,
    hasMatrix,
    seats,
    mandate,
    board,
    education,
    credentials,
    languages,
    sectors,
    careerYears,
    currentRoles: roles.filter((r) => r.present && r.lane !== "board-advisory"),
    sourceHash: g.sourceHash,
    generatedLabel: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(generated),
  }
}

/* ── Board bio ─────────────────────────────────────────────────────────── */

const PAST_TENSE =
  /^(?:[A-Za-z]+ed|Led|Built|Grew|Took|Cut|Ran|Won|Sold|Set|Drove|Brought|Made|Oversaw|Rebuilt|Began|Chose|Drew|Gave|Held|Kept|Left|Put|Rose|Saw|Sent|Spent|Stood|Wrote)\b/

const FIRST_PERSON = /\b(I|I'm|I've|I'd|my|me|mine|we|our|us)\b/

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

/** Whole sentences of `text`, kept while the running total stays within `max` words. */
function sentencesWithin(text: string, max: number): string {
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text]
  const kept: string[] = []
  let total = 0
  for (const s of parts) {
    const n = words(s)
    if (kept.length > 0 && total + n > max) break
    kept.push(s.trim())
    total += n
  }
  return kept.join(" ")
}

export type BoardBioText = { paragraphs: string[]; source: "override" | "summary" | "composed" | "none"; words: number }

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}

/**
 * Third-person bio of about 150 words.
 *  1. `override`: hand-written text from <private>/board-bio.md, used verbatim.
 *  2. The executive summary, when it is already written in the third person.
 *  3. A composition from structured facts, in safe sentence templates.
 */
export function composeBoardBio(v: View, override?: string | null): BoardBioText {
  const manual = override?.trim()
  if (manual) {
    const paragraphs = manual.split(/\n{2,}/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean)
    return { paragraphs, source: "override", words: words(paragraphs.join(" ")) }
  }

  const summary = v.summary.join(" ")
  if (summary && !FIRST_PERSON.test(summary)) {
    // Whole paragraphs while they fit; a long first paragraph is cut at a sentence.
    const paragraphs: string[] = []
    let total = 0
    for (const p of v.summary) {
      const n = words(p)
      if (paragraphs.length > 0 && total + n > 170) break
      if (paragraphs.length === 0 && n > 170) {
        paragraphs.push(sentencesWithin(p, 165))
        break
      }
      paragraphs.push(p)
      total += n
    }
    return { paragraphs, source: "summary", words: words(paragraphs.join(" ")) }
  }

  const sentences: string[] = []
  const sectorList = v.sectors.length ? v.sectors : cleanList(v.mandate.find((m) => m.label === "Sectors")?.values ?? [])
  const lead: string[] = []
  if (v.base) lead.push(`Based in ${v.base}, ${v.name}`)
  else lead.push(v.name)
  if (v.careerYears) {
    lead.push(`has led technology-driven change for more than ${v.careerYears} years`)
  } else {
    lead.push("leads technology-driven change")
  }
  if (sectorList.length) lead.push(`across ${listJoin(sectorList.slice(0, 4).map(lowerFirst))}`)
  sentences.push(`${lead.join(" ")}.`)

  if (v.currentRoles.length) {
    const cur = v.currentRoles.slice(0, 2).map((r) => `${r.title} at ${r.org}`)
    sentences.push(`His current ${cur.length > 1 ? "roles are" : "role is"} ${listJoin(cur)}.`)
  }

  const acts = v.signature
    .filter((o) => PAST_TENSE.test(o.text))
    .slice(0, 2)
    .map((o) => lowerFirst(o.text.replace(/\.$/, "")))
  if (acts[0]) sentences.push(`He ${acts[0]}.`)
  if (acts[1]) sentences.push(`He also ${acts[1]}.`)

  if (v.board.length) {
    const b = Array.from(new Set(v.board.slice(0, 3).map((x) => x.org)))
    sentences.push(`He holds board and advisory roles at ${listJoin(b)}.`)
  }
  if (v.education.length) {
    const e = v.education[0]
    sentences.push(`He holds ${/^(a|an|the)\s/i.test(e.qualification) ? "" : "a "}${e.qualification} from ${e.institution}.`)
  }

  const text = sentencesWithin(sentences.join(" "), 165)
  return sentences.length ? { paragraphs: [text], source: "composed", words: words(text) } : { paragraphs: [], source: "none", words: 0 }
}

/* ── Fit levels (executive CV) ─────────────────────────────────────────── */

export type FitLevel = {
  /** Roles shown in full; the rest are compressed to one line each. */
  fullRoles: number
  /** Achievements shown per role. */
  perRole: number
  programmes: number
  /** Signature achievements on page 1. */
  signature: number
  /** Which page carries the leadership matrix strip. */
  matrixPage: 1 | 2
  /** Credentials listed (education is always listed in full). */
  credentials: number
  /** Show the role and scale line under each programme. */
  programmeDetail: boolean
}

const BASE_LEVELS: Omit<FitLevel, "matrixPage">[] = [
  { fullRoles: 6, perRole: 3, programmes: 6, signature: 8, credentials: 6, programmeDetail: true },
  { fullRoles: 5, perRole: 3, programmes: 6, signature: 8, credentials: 6, programmeDetail: true },
  { fullRoles: 5, perRole: 2, programmes: 6, signature: 8, credentials: 5, programmeDetail: false },
  { fullRoles: 4, perRole: 2, programmes: 5, signature: 8, credentials: 4, programmeDetail: false },
  { fullRoles: 4, perRole: 2, programmes: 4, signature: 7, credentials: 4, programmeDetail: false },
  { fullRoles: 3, perRole: 2, programmes: 4, signature: 6, credentials: 3, programmeDetail: false },
  { fullRoles: 3, perRole: 1, programmes: 3, signature: 6, credentials: 3, programmeDetail: false },
  { fullRoles: 2, perRole: 1, programmes: 3, signature: 6, credentials: 2, programmeDetail: false },
]

/**
 * From richest to leanest. Each base level is tried with the matrix on page 1
 * and then on page 2, so a crowded first page sheds the matrix before it sheds
 * any of the person's achievements. The fitter walks down until both fit.
 */
export const FIT_LEVELS: FitLevel[] = BASE_LEVELS.flatMap((l) =>
  ([1, 2] as const).map((matrixPage) => ({ ...l, matrixPage })),
)
