import {
  formatMoney,
  formatSpan,
  formatTeam,
  kindLabel,
  txt,
  txts,
  toRoman,
  yearFraction,
} from "@/lib/cv/format"
import type {
  BoardRoleT,
  EraT,
  PublicationT,
  RoleT,
  TalkT,
} from "@/lib/cv/schema"

/**
 * Career Meridian · data model (server side, pure).
 *
 * Turns eras, roles, board roles, publications and talks into a small,
 * serialisable structure for the client component. Placeholders are
 * dropped here, so the chart never draws an unknown date or label.
 */

export const MERIDIAN_LANES = [
  { id: "founder-ceo", label: "Founder · CEO", short: "Founder" },
  { id: "executive", label: "Executive", short: "Executive" },
  { id: "board-advisory", label: "Board · Advisory", short: "Board" },
  { id: "thought-leadership", label: "Thought leadership", short: "Thought" },
] as const

export type MeridianLaneId = (typeof MERIDIAN_LANES)[number]["id"]

export type MeridianBand = {
  id: string
  numeral: string
  title: string
  wave: string | null
  from: number
  to: number
}

export type MeridianItem = {
  id: string
  lane: MeridianLaneId
  /** Sub-row inside the lane (overlapping items stack). */
  row: number
  kind: "role" | "board" | "mark"
  from: number
  to: number
  ongoing: boolean
  title: string
  org: string | null
  span: string | null
  /** Extra lines for the card (scope, first outcome). */
  lines: string[]
  /** In-page anchor to the detailed entry, when the page has one. */
  href: string | null
}

export type MeridianData = {
  from: number
  to: number
  now: number
  bands: MeridianBand[]
  items: MeridianItem[]
  /** Sub-rows per lane (at least 1). */
  rows: Record<MeridianLaneId, number>
}

const LANE_IDS = new Set<string>(MERIDIAN_LANES.map((l) => l.id))
const START_YEAR = 1995

function endOf(end: string | number, now: number): { to: number | null; ongoing: boolean } {
  if (end === "present") return { to: now, ongoing: true }
  const y = yearFraction(end)
  if (y == null) return { to: null, ongoing: false }
  // A bare year ends at the close of that year; "YYYY-MM" at the month's end.
  return { to: typeof end === "number" ? y + 1 : y + 1 / 12, ongoing: false }
}

type BuildInput = {
  eras: EraT[]
  roles: RoleT[]
  boardRoles: BoardRoleT[]
  publications: PublicationT[]
  talks: TalkT[]
  /** Dossier: card shows scope and first outcome, and bars link to entries. */
  detailed: boolean
  now?: Date
}

export function buildMeridian(input: BuildInput): MeridianData | null {
  const nowDate = input.now ?? new Date()
  const now = nowDate.getUTCFullYear() + nowDate.getUTCMonth() / 12
  const raw: Omit<MeridianItem, "row">[] = []

  for (const r of input.roles) {
    const lane = txt(r.lane)
    if (!lane || !LANE_IDS.has(lane)) continue
    const from = yearFraction(r.start)
    const { to, ongoing } = endOf(r.end, now)
    const title = txt(r.title)
    if (from == null || to == null || !title) continue
    const lines: string[] = []
    if (input.detailed && r.scope) {
      const team = r.scope.teamSize ? formatTeam(r.scope.teamSize) : null
      const budget = r.scope.budget ? formatMoney(r.scope.budget) : null
      const kind = r.scope.budget ? kindLabel(r.scope.budget.kind) : null
      if (team) lines.push(`Team ${team}`)
      if (budget) lines.push(kind ? `${kind} ${budget}` : budget)
      const geo = txts(r.scope.geography)
      if (geo.length) lines.push(geo.join(" · "))
    }
    if (input.detailed) {
      const first = r.outcomes.map((o) => txt(o.statement)).find(Boolean)
      if (first) lines.push(first)
    }
    raw.push({
      id: r.id,
      lane: lane as MeridianLaneId,
      kind: "role",
      from,
      to: Math.max(to, from + 0.25),
      ongoing,
      title,
      org: txt(r.organisation.name),
      span: formatSpan(r.start, r.end),
      lines,
      href: input.detailed ? `#${r.id}` : null,
    })
  }

  for (const b of input.boardRoles) {
    const from = yearFraction(b.start)
    const { to, ongoing } = endOf(b.end, now)
    const title = txt(b.title)
    if (from == null || to == null || !title) continue
    const lines = txts([kindLabel(b.kind), b.committees.length ? `Committees: ${txts(b.committees).join(", ")}` : null])
    raw.push({
      id: b.id,
      lane: "board-advisory",
      kind: "board",
      from,
      to: Math.max(to, from + 0.25),
      ongoing,
      title,
      org: txt(b.organisation.name),
      span: formatSpan(b.start, b.end),
      lines,
      href: input.detailed ? `#${b.id}` : null,
    })
  }

  const marks: Array<{ id: string; year: number | string | null; title: string; org: string | null; kind: string | null }> = [
    ...input.publications.map((p) => ({
      id: p.id,
      year: p.year,
      title: p.title,
      org: txt(p.venue),
      kind: kindLabel(p.kind),
    })),
    ...input.talks.map((t) => ({
      id: t.id,
      year: t.year,
      title: t.title,
      org: txt(t.event),
      kind: kindLabel(t.kind),
    })),
  ]
  for (const m of marks) {
    const from = typeof m.year === "number" ? m.year : null
    const title = txt(m.title)
    if (from == null || !title) continue
    raw.push({
      id: m.id,
      lane: "thought-leadership",
      kind: "mark",
      from: from + 0.2,
      to: from + 0.8,
      ongoing: false,
      title,
      org: m.org,
      span: String(from),
      lines: m.kind ? [m.kind] : [],
      href: null,
    })
  }

  const bands: MeridianBand[] = []
  input.eras.forEach((e, i) => {
    const from = yearFraction(e.start)
    const end = e.end === "present" ? now : yearFraction(e.end)
    const title = txt(e.title)
    if (from == null || end == null || !title) return
    bands.push({
      id: e.id,
      numeral: toRoman(i + 1),
      title,
      wave: txt(e.wave),
      from,
      to: e.end === "present" ? now : end + 1,
    })
  })

  // Eras that share a boundary year must not overlap: each band ends where
  // the next one starts.
  bands.sort((a, b) => a.from - b.from)
  for (let i = 0; i < bands.length - 1; i++) {
    if (bands[i].to > bands[i + 1].from) bands[i].to = bands[i + 1].from
  }

  if (raw.length === 0 && bands.length === 0) return null

  const earliest = Math.min(
    START_YEAR,
    ...raw.map((r) => r.from),
    ...bands.map((b) => b.from),
  )
  const from = Math.floor(earliest)
  const to = now + 0.75

  // Greedy row packing per lane, by start date.
  const rows = Object.fromEntries(MERIDIAN_LANES.map((l) => [l.id, 1])) as Record<
    MeridianLaneId,
    number
  >
  const items: MeridianItem[] = []
  for (const lane of MERIDIAN_LANES) {
    const ends: number[] = []
    const inLane = raw
      .filter((r) => r.lane === lane.id)
      .sort((a, b) => a.from - b.from || b.to - a.to)
    for (const r of inLane) {
      let row = ends.findIndex((end) => end <= r.from + 0.01)
      if (row === -1) {
        row = ends.length
        ends.push(r.to)
      } else {
        ends[row] = r.to
      }
      items.push({ ...r, row })
    }
    rows[lane.id] = Math.max(1, ends.length)
  }
  items.sort((a, b) => a.from - b.from || a.lane.localeCompare(b.lane))

  return { from, to, now, bands, items, rows }
}
