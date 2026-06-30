"use client"

import { useMemo, useState } from "react"
import {
  PenLine, Eye, AlertTriangle, FileCheck2, FileX2,
  ExternalLink, CalendarClock, CheckCircle2, ListTodo, Hourglass, FileWarning,
  FileText, Copy, Download, X,
} from "lucide-react"
import type { Wp4Registry, Wp4LE, Wp4Completeness } from "@/lib/panoraima/types"
import {
  RUST, TRACK_ORDER, TRACK_COLOR, TRACK_SHORT, statusStyle, ROLE_LABEL, ROLE_COLOR,
} from "./wp4constants"

// An LE "needs action" from RealAI's side when its wiki page is mid-flight.
function needsAction(le: Wp4LE): boolean {
  return le.wiki_status === "review" || le.wiki_status === "development"
}

function hasRole(le: Wp4LE, kind: "authoring" | "reviewing"): boolean {
  return le.realai.roles.some(r =>
    kind === "authoring"
      ? r.role === "author" || r.role === "co-author"
      : r.role === "reviewer",
  )
}

// The role label this LE holds within a given column.
function columnRole(le: Wp4LE, kind: "authoring" | "reviewing"): string {
  if (kind === "reviewing") return "reviewer"
  // prefer "author" over "co-author" for the badge if both somehow present
  return le.realai.roles.some(r => r.role === "author") ? "author" : "co-author"
}

function StatPill({
  label, value, accent,
}: {
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div className="inline-flex items-baseline gap-1.5 rounded-lg border border-[#DCDDE1] bg-white px-3 py-1.5 shadow-[0_1px_3px_rgba(20,22,27,0.06)]">
      <span
        className="text-lg font-bold tabular-nums leading-none tracking-[-0.02em]"
        style={accent ? { color: RUST } : { color: "#16181D" }}
      >
        {value}
      </span>
      <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-[#444A55]">{label}</span>
    </div>
  )
}

// Per-card completeness signal: authors see what's outstanding; reviewers see
// whether the LE is ready for them to pick up.
function CompletenessRow({
  completeness, kind, reviewDone,
}: {
  completeness: Wp4Completeness
  kind: "authoring" | "reviewing"
  reviewDone?: boolean
}) {
  if (kind === "reviewing") {
    if (reviewDone) {
      return (
        <div className="mt-2.5">
          <span className="inline-flex items-center gap-1 rounded border border-[#BFE2CC] bg-[#E7F4EC] px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#1F6B41]">
            <CheckCircle2 className="w-3 h-3" />
            Reviewed
          </span>
        </div>
      )
    }
    return completeness.ready_to_review ? (
      <div className="mt-2.5">
        <span className="inline-flex items-center gap-1 rounded bg-[#16181D] px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-white">
          <CheckCircle2 className="w-3 h-3" />
          Ready to review
        </span>
      </div>
    ) : (
      <div className="mt-2.5">
        <span className="inline-flex items-center gap-1 rounded border border-[#D7D9DE] bg-[#F1F2F4] px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#444A55]">
          <Hourglass className="w-3 h-3" />
          Awaiting author content
        </span>
      </div>
    )
  }

  // Authoring column
  if (completeness.author_needs.length === 0) {
    return (
      <div className="mt-2.5 flex items-center gap-1.5 text-[13px] font-bold text-[#1F6B41]">
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
        Complete
      </div>
    )
  }

  return (
    <div className="mt-2.5 border-t border-[#DCDDE1] pt-2.5">
      <div className="flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: RUST }}>
        <ListTodo className="w-3 h-3 flex-shrink-0" />
        Needs
      </div>
      <div className="mt-1 text-[13px] font-medium leading-snug text-[#3A3E46]">
        {completeness.author_needs.join(" · ")}
      </div>
    </div>
  )
}

function LECard({ le, kind }: { le: Wp4LE; kind: "authoring" | "reviewing" }) {
  const reviewed = !!le.review_done
  const flagged = needsAction(le) && !reviewed
  const ss = statusStyle(le.status)
  const trackColor = TRACK_COLOR[le.track] ?? TRACK_COLOR["Unknown"]
  const role = columnRole(le, kind)
  const roleColor = ROLE_COLOR[role] ?? "#3F434C"
  const title = le.title?.trim() || le.code

  return (
    <div className="relative rounded-xl border border-[#DCDDE1] bg-white p-5 md:p-6 shadow-[0_1px_3px_rgba(20,22,27,0.06)] transition-all duration-150 hover:shadow-[0_4px_14px_rgba(20,22,27,0.08)] hover:border-[#16181D]/25">
      {(flagged || reviewed) && (
        <span
          className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full"
          style={{ background: reviewed ? "#2E6A4B" : RUST }}
          aria-hidden
        />
      )}

      {/* Top row: track dot + code + role + external link */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-[2px] flex-shrink-0"
            style={{ background: trackColor }}
            title={le.track}
          />
          <span className="font-mono text-[13.5px] font-bold tracking-[0.02em] text-[#16181D] truncate">
            {le.code}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="font-mono text-[11px] font-bold uppercase tracking-[0.1em]"
            style={{ color: roleColor }}
          >
            {ROLE_LABEL[role] ?? role}
          </span>
          {le.wiki_page && (
            <a
              href={le.wiki_page}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-[#646B78] hover:text-[#16181D] transition-colors"
              aria-label="Open wiki page"
              title="Open wiki page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="mt-2 text-[15px] md:text-[16px] font-bold leading-snug text-[#16181D] line-clamp-2">
        {title}
      </h4>

      {/* Status + track + due */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 rounded border px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] ${ss.bg} ${ss.text}`}>
          <span className="w-1.5 h-1.5 rounded-[2px]" style={{ background: ss.color }} />
          {ss.label}
        </span>
        <span className="inline-flex items-center rounded border border-[#D7D9DE] bg-[#F1F2F4] px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#3A3E46]">
          {TRACK_SHORT[le.track] ?? le.track}
        </span>
        {(le.realai_wiki_gap || le.off_wiki) && (
          <span
            className="inline-flex items-center gap-1 rounded border border-[#E6BFB4] bg-[#FBEAE5] px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#9A3318]"
            title={le.off_wiki
              ? "This code isn't on the wiki master yet — it exists only in the SharePoint registry."
              : "This LE is on the wiki, but the wiki doesn't list RealAI as reviewer yet — the assignment is only in the SharePoint M&F registry (marked 'RAI')."}
          >
            <FileWarning className="w-3 h-3" />
            {le.off_wiki ? "not on wiki" : "RealAI not on wiki yet"}
          </span>
        )}
        {le.due_date && (
          <span className="inline-flex items-center gap-1 font-mono text-[12px] font-semibold tabular-nums text-[#5B616B]">
            <CalendarClock className="w-3 h-3 text-[#646B78]" />
            {le.due_date}
          </span>
        )}
      </div>

      {/* Completeness — what's outstanding for this LE's role */}
      {le.completeness && (
        <CompletenessRow completeness={le.completeness} kind={kind} reviewDone={le.review_done} />
      )}

      {/* Footer: materials + needs-action flag */}
      <div className="mt-3 pt-2.5 border-t border-[#DCDDE1] flex items-center justify-between gap-2">
        {le.materials.has ? (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1F6B41] tabular-nums">
            <FileCheck2 className="w-3.5 h-3.5" />
            {le.materials.count} {le.materials.count === 1 ? "file" : "files"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#5B616B]">
            <FileX2 className="w-3.5 h-3.5" />
            no materials yet
          </span>
        )}
        {flagged && (
          <span
            className="inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-white"
            style={{ background: RUST }}
          >
            <AlertTriangle className="w-3 h-3" />
            needs action
          </span>
        )}
      </div>
    </div>
  )
}

function BoardColumn({
  title, icon: Icon, items, kind, hint,
}: {
  title: string
  icon: typeof PenLine
  items: Wp4LE[]
  kind: "authoring" | "reviewing"
  hint: string
}) {
  const actionCount = items.filter(needsAction).length
  return (
    <div className="rounded-xl border border-[#DCDDE1] bg-white p-5 md:p-6 shadow-[0_1px_3px_rgba(20,22,27,0.06)]">
      <div className="flex items-start justify-between gap-2 pb-4 mb-4 border-b border-[#DCDDE1]">
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className="w-4 h-4 text-[#444A55] flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="flex items-baseline gap-1.5 text-base font-bold tracking-[-0.01em] text-[#16181D] leading-none">
              {title}
              <span className="font-mono text-[13.5px] font-bold tabular-nums text-[#5B616B]">
                {items.length}
              </span>
            </h3>
            <p className="mt-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-[#5B616B]">{hint}</p>
          </div>
        </div>
        {actionCount > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] tabular-nums text-white flex-shrink-0"
            style={{ background: RUST }}
          >
            <AlertTriangle className="w-3 h-3" />
            {actionCount}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#DCDDE1] bg-white p-6 text-center font-mono text-[13px] font-semibold uppercase tracking-[0.12em] text-[#5B616B]">
          Nothing assigned here
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map(le => (
            <LECard key={`${kind}-${le.code}`} le={le} kind={kind} />
          ))}
        </div>
      )}
    </div>
  )
}

// Pill counts recomputed over an arbitrary slice of the board so they respond to
// the track filter. Definitions mirror build_wp4_registry's summary.realai.
function pillCounts(les: Wp4LE[]) {
  let author = 0, reviewer = 0, needs = 0, authorTodo = 0, ready = 0, reviewed = 0
  for (const le of les) {
    const c = le.completeness
    if (le.realai.roles.some(r => r.role === "reviewer")) reviewer++
    if (c?.is_author) author++
    if (le.review_done) reviewed++
    if (c && (c.author_needs.length > 0 || c.ready_to_review)) needs++
    if (c && c.author_needs.length > 0) authorTodo++
    if (c && !c.is_author && c.ready_to_review) ready++
  }
  return { author, reviewer, needs, authorTodo, ready, reviewed }
}

// One-line state for an LE in the update report.
function reportState(le: Wp4LE): string {
  if (le.review_done) return "Reviewed (posted to wiki)"
  const c = le.completeness
  if (c?.ready_to_review) return "Ready to review"
  if (c && c.author_needs.length > 0) return "Author content outstanding"
  if (le.realai_wiki_gap || le.off_wiki) return "Pending wiki listing"
  return "In progress"
}

// Build a plain-text status report for a track lead — copy into an email or send as-is.
function buildReport(
  track: string | null,
  les: Wp4LE[],
  counts: ReturnType<typeof pillCounts>,
  registry: Wp4Registry,
): string {
  const trackName = track ?? "all tracks"
  const date = new Date(registry.refreshed_at || registry.generated_at)
    .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  const gap = les.filter(le => le.realai_wiki_gap || le.off_wiki).length
  const L: string[] = []
  L.push("RealAI — WP4 review status update")
  L.push(`Track: ${trackName}`)
  L.push(`Date: ${date}`)
  L.push("Prepared by: RealAI (reviewing: Tannistha & Monira; authoring: Tarry Singh)")
  L.push("")
  L.push("SUMMARY")
  L.push(`RealAI is on ${les.length} Learning Event${les.length === 1 ? "" : "s"} in ${trackName}: ${counts.author} as author, ${counts.reviewer} as reviewer.`)
  L.push(`Reviewed and posted: ${counts.reviewed}.  Ready to review: ${counts.ready}.  Author content outstanding: ${counts.authorTodo}.`)
  if (gap) L.push(`${gap} not yet listed with RealAI as reviewer on the wiki master (the assignment is in the SharePoint M&F registry).`)
  L.push("")
  L.push("LEARNING EVENTS")
  const ordered = [...les].sort((a, b) => {
    const rank = (le: Wp4LE) => le.review_done ? 0 : le.completeness?.ready_to_review ? 1 : 2
    return rank(a) - rank(b) || a.code.localeCompare(b.code)
  })
  for (const le of ordered) {
    const roles = le.realai.roles.map(r => ROLE_LABEL[r.role] ?? r.role).join(", ") || "—"
    let title = le.title?.trim() || ""
    if (title.startsWith(le.code)) title = title.slice(le.code.length).replace(/^[\s—:-]+/, "").trim()
    L.push("")
    L.push(`${le.code} — ${title}`)
    L.push(`    Status: ${le.status || "—"}  |  RealAI: ${roles}  |  ${reportState(le)}`)
    if (le.review_note) L.push(`    What we found: ${le.review_note}`)
    if (le.review_done && le.wiki_page) L.push(`    Full review: ${le.wiki_page.replace("/wiki/", "/wiki/Talk:")}`)
  }
  L.push("")
  L.push("Each reviewed LE has the full RealAI review on its wiki Discussion tab. Happy to walk through any of these.")
  return L.join("\n")
}

function FilterChip({
  label, count, color, active, onClick,
}: {
  label: string
  count: number
  color?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] transition-all ${
        active
          ? "border-[#16181D] bg-[#16181D] text-white shadow-[0_2px_8px_rgba(20,22,27,0.18)]"
          : "border-[#DCDDE1] bg-white text-[#444A55] hover:border-[#16181D]/40 hover:text-[#16181D]"
      }`}
    >
      {color && (
        <span className="w-2 h-2 rounded-[2px]" style={{ background: color }} aria-hidden />
      )}
      {label}
      <span className={`tabular-nums ${active ? "text-white/70" : "text-[#9CA3AF]"}`}>{count}</span>
    </button>
  )
}

export default function WP4RealAIBoard({ registry }: { registry: Wp4Registry }) {
  const board = registry.realai_board
  const [track, setTrack] = useState<string | null>(null)   // null = all tracks

  // RealAI LE count per track — drives the filter-chip badges
  const trackCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const le of board) m[le.track] = (m[le.track] ?? 0) + 1
    return m
  }, [board])

  // the board narrowed to the active track filter; everything below reflects it
  const filtered = useMemo(
    () => (track ? board.filter(le => le.track === track) : board),
    [board, track],
  )
  const counts = useMemo(() => pillCounts(filtered), [filtered])
  const wikiGapCount = useMemo(
    () => filtered.filter(le => le.realai_wiki_gap || le.off_wiki).length, [filtered])
  const authoring = useMemo(
    () => filtered.filter(le => hasRole(le, "authoring")), [filtered])
  const reviewing = useMemo(
    () => filtered.filter(le => hasRole(le, "reviewing")), [filtered])

  // Update report — a plain-text status the user can mail to the track lead.
  const [showReport, setShowReport] = useState(false)
  const [copied, setCopied] = useState(false)
  const reportText = useMemo(
    () => buildReport(track, filtered, counts, registry), [track, filtered, counts, registry])
  const trackLabel = track ?? "all tracks"
  const copyReport = () => {
    navigator.clipboard?.writeText(reportText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }).catch(() => {})
  }
  const downloadReport = () => {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `RealAI-WP4-update-${(track ?? "all-tracks").replace(/\W+/g, "-")}.txt`
    document.body.appendChild(a); a.click()
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 200)
  }
  const mailtoHref =
    `mailto:?subject=${encodeURIComponent(`RealAI — WP4 review status update: ${trackLabel}`)}` +
    `&body=${encodeURIComponent(reportText)}`

  return (
    <section>
      <div className="mb-8">
        <div className="font-mono text-[13px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: RUST }}>
          RealAI commitments
        </div>
        <h2 className="text-2xl md:text-[2rem] font-bold tracking-[-0.02em] text-[#16181D]">
          What&apos;s ours
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#444A55] max-w-2xl">
          The Learning Events RealAI authors or reviews, with status and what needs
          action next. Routing: Authoring &rarr; Tarry; Reviewing &rarr; Tannistha &amp; Monira.
        </p>

        {/* Track filter — All + the five wiki tracks (counts are RealAI's LEs) */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#5B616B] mr-1.5">
            Filter by track
          </span>
          <FilterChip
            label="All tracks"
            count={board.length}
            active={track === null}
            onClick={() => setTrack(null)}
          />
          {TRACK_ORDER.map(t => (
            <FilterChip
              key={t}
              label={TRACK_SHORT[t] ?? t}
              color={TRACK_COLOR[t]}
              count={trackCounts[t] ?? 0}
              active={track === t}
              onClick={() => setTrack(track === t ? null : t)}
            />
          ))}
          <button
            type="button"
            onClick={() => setShowReport(true)}
            className="sm:ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[#DCDDE1] bg-white px-3 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-[#16181D] hover:border-[#16181D]/50 hover:bg-[#FAFAF9] transition-all"
            title={`Generate an emailable status report for ${trackLabel}`}
          >
            <FileText className="w-3.5 h-3.5" style={{ color: RUST }} />
            Create update report
          </button>
        </div>

        {/* Summary strip — reflects the active track filter */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatPill label="Authoring" value={counts.author} accent />
          <StatPill label="Reviewing" value={counts.reviewer} />
          <StatPill label="Needs action" value={counts.needs} accent />
          <StatPill label="LEs needing content" value={counts.authorTodo} />
          <StatPill label="Ready to review" value={counts.ready} />
          {counts.reviewed > 0 && (
            <div className="inline-flex items-baseline gap-1.5 rounded-lg border border-[#BFE2CC] bg-[#E7F4EC] px-3 py-1.5 shadow-[0_1px_3px_rgba(20,22,27,0.06)]">
              <span className="text-lg font-bold tabular-nums leading-none tracking-[-0.02em]" style={{ color: "#1F6B41" }}>{counts.reviewed}</span>
              <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1F6B41]">Reviewed &#10003;</span>
            </div>
          )}
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-[#5B616B] ml-1 tabular-nums">
            · {track ? `${filtered.length} of ${board.length}` : board.length} LEs on RealAI&apos;s plate
          </span>
          {!!wikiGapCount && (
            <span
              className="inline-flex items-center gap-1 rounded border border-[#E6BFB4] bg-[#FBEAE5] px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#9A3318] tabular-nums"
              title="LEs where RealAI is assigned in the SharePoint M&F registry (marked 'RAI') but the wiki doesn't list us as reviewer yet"
            >
              <FileWarning className="w-3 h-3" />
              {wikiGapCount} where wiki omits RealAI
            </span>
          )}
        </div>
      </div>

      {/* Two-column board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <BoardColumn
          title="Authoring"
          icon={PenLine}
          items={authoring}
          kind="authoring"
          hint="LEs RealAI writes — drafting & materials"
        />
        <BoardColumn
          title="Reviewing"
          icon={Eye}
          items={reviewing}
          kind="reviewing"
          hint="LEs RealAI reviews — quality gate"
        />
      </div>

      {/* Update report modal — emailable status for the track lead */}
      {showReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowReport(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-[#DCDDE1] bg-white shadow-[0_24px_70px_rgba(20,22,27,0.35)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#E7E7EA] px-5 py-3.5">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 flex-shrink-0" style={{ color: RUST }} />
                <span className="font-bold text-[15px] text-[#16181D] truncate">
                  Update report &middot; <span className="capitalize">{trackLabel}</span>
                </span>
              </div>
              <button
                onClick={() => setShowReport(false)}
                className="text-[#646B78] hover:text-[#16181D] transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-[13px] text-[#444A55] mb-3">
                A plain-text status for the {track ? trackLabel : "relevant"} track lead &mdash; copy it into an email, download it, or open it in your mail client.
              </p>
              <textarea
                readOnly
                value={reportText}
                onFocus={e => e.currentTarget.select()}
                className="w-full h-72 rounded-lg border border-[#DCDDE1] bg-[#FAFAF9] p-3 font-mono text-[12px] leading-relaxed text-[#16181D] resize-none focus:outline-none focus:border-[#16181D]/40"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={copyReport}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-bold text-white transition-all"
                  style={{ background: copied ? "#1F6B41" : RUST }}
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy to clipboard"}
                </button>
                <button
                  onClick={downloadReport}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCDDE1] bg-white px-3.5 py-2 text-[13px] font-bold text-[#16181D] hover:border-[#16181D]/40 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Download .txt
                </button>
                <a
                  href={mailtoHref}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCDDE1] bg-white px-3.5 py-2 text-[13px] font-bold text-[#16181D] hover:border-[#16181D]/40 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
