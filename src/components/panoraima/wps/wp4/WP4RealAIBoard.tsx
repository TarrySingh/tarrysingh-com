"use client"

import { useMemo } from "react"
import {
  PenLine, Eye, AlertTriangle, FileCheck2, FileX2,
  ExternalLink, CalendarClock, CheckCircle2, ListTodo, Hourglass, FileWarning,
} from "lucide-react"
import type { Wp4Registry, Wp4LE, Wp4Completeness } from "@/lib/panoraima/types"
import {
  RUST, TRACK_COLOR, TRACK_SHORT, statusStyle, ROLE_LABEL, ROLE_COLOR,
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
    <div className="inline-flex items-baseline gap-1.5 rounded-lg border border-[#E7E7EA] bg-white px-3 py-1.5">
      <span
        className="text-lg font-bold tabular-nums leading-none tracking-[-0.02em]"
        style={accent ? { color: RUST } : { color: "#16181D" }}
      >
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#9CA3AF]">{label}</span>
    </div>
  )
}

// Per-card completeness signal: authors see what's outstanding; reviewers see
// whether the LE is ready for them to pick up.
function CompletenessRow({
  completeness, kind,
}: {
  completeness: Wp4Completeness
  kind: "authoring" | "reviewing"
}) {
  if (kind === "reviewing") {
    return completeness.ready_to_review ? (
      <div className="mt-2.5">
        <span className="inline-flex items-center gap-1 rounded bg-[#16181D] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
          <CheckCircle2 className="w-2.5 h-2.5" />
          Ready to review
        </span>
      </div>
    ) : (
      <div className="mt-2.5">
        <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-500">
          <Hourglass className="w-2.5 h-2.5" />
          Awaiting author content
        </span>
      </div>
    )
  }

  // Authoring column
  if (completeness.author_needs.length === 0) {
    return (
      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#2E6A4B]">
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
        Complete
      </div>
    )
  }

  return (
    <div className="mt-2.5 border-t border-[#E7E7EA] pt-2.5">
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: RUST }}>
        <ListTodo className="w-3 h-3 flex-shrink-0" />
        Needs
      </div>
      <div className="mt-1 text-[11px] font-medium leading-snug text-[#4F535B]">
        {completeness.author_needs.join(" · ")}
      </div>
    </div>
  )
}

function LECard({ le, kind }: { le: Wp4LE; kind: "authoring" | "reviewing" }) {
  const flagged = needsAction(le)
  const ss = statusStyle(le.status)
  const trackColor = TRACK_COLOR[le.track] ?? TRACK_COLOR["Unknown"]
  const role = columnRole(le, kind)
  const roleColor = ROLE_COLOR[role] ?? "#3F434C"
  const title = le.title?.trim() || le.code

  return (
    <div className="relative rounded-xl border border-[#E7E7EA] bg-white p-5 transition-colors duration-150 hover:border-[#16181D]/20">
      {flagged && (
        <span
          className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full"
          style={{ background: RUST }}
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
          <span className="font-mono text-[12px] font-bold tracking-[0.02em] text-[#16181D] truncate">
            {le.code}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em]"
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
              className="text-[#9CA3AF] hover:text-[#16181D] transition-colors"
              aria-label="Open wiki page"
              title="Open wiki page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="mt-2 text-[13px] font-semibold leading-snug text-[#16181D] line-clamp-2">
        {title}
      </h4>

      {/* Status + track + due */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] ${ss.bg} ${ss.text}`}>
          <span className="w-1.5 h-1.5 rounded-[2px]" style={{ background: ss.color }} />
          {ss.label}
        </span>
        <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-600">
          {TRACK_SHORT[le.track] ?? le.track}
        </span>
        {le.off_wiki && (
          <span
            className="inline-flex items-center gap-1 rounded border border-[#E9CFC6] bg-[#FBEAE5] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[#A53C22]"
            title="In the SharePoint LearningEvents registry (marked 'RAI') but not yet on the wiki master — look it up in SharePoint"
          >
            <FileWarning className="w-2.5 h-2.5" />
            SharePoint · not in wiki
          </span>
        )}
        {le.due_date && (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] tabular-nums text-[#9CA3AF]">
            <CalendarClock className="w-3 h-3 text-[#9CA3AF]" />
            {le.due_date}
          </span>
        )}
      </div>

      {/* Completeness — what's outstanding for this LE's role */}
      {le.completeness && (
        <CompletenessRow completeness={le.completeness} kind={kind} />
      )}

      {/* Footer: materials + needs-action flag */}
      <div className="mt-3 pt-2.5 border-t border-[#E7E7EA] flex items-center justify-between gap-2">
        {le.materials.has ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#2E6A4B] tabular-nums">
            <FileCheck2 className="w-3.5 h-3.5" />
            {le.materials.count} {le.materials.count === 1 ? "file" : "files"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#9CA3AF]">
            <FileX2 className="w-3.5 h-3.5" />
            no materials yet
          </span>
        )}
        {flagged && (
          <span
            className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-white"
            style={{ background: RUST }}
          >
            <AlertTriangle className="w-2.5 h-2.5" />
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
    <div className="rounded-xl border border-[#E7E7EA] bg-white p-5 md:p-6">
      <div className="flex items-start justify-between gap-2 pb-4 mb-4 border-b border-[#E7E7EA]">
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="flex items-baseline gap-1.5 text-base font-bold tracking-[-0.01em] text-[#16181D] leading-none">
              {title}
              <span className="font-mono text-[12px] font-bold tabular-nums text-[#9CA3AF]">
                {items.length}
              </span>
            </h3>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#9CA3AF]">{hint}</p>
          </div>
        </div>
        {actionCount > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] tabular-nums text-white flex-shrink-0"
            style={{ background: RUST }}
          >
            <AlertTriangle className="w-2.5 h-2.5" />
            {actionCount}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E7E7EA] bg-white p-6 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-[#9CA3AF]">
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

export default function WP4RealAIBoard({ registry }: { registry: Wp4Registry }) {
  const { author, reviewer, needs_action, author_todo, ready_to_review } =
    registry.summary.realai

  const board = registry.realai_board
  const offWikiCount = useMemo(() => board.filter(le => le.off_wiki).length, [board])

  const authoring = useMemo(
    () => board.filter(le => hasRole(le, "authoring")),
    [board],
  )
  const reviewing = useMemo(
    () => board.filter(le => hasRole(le, "reviewing")),
    [board],
  )

  return (
    <section>
      <div className="mb-8">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: RUST }}>
          RealAI commitments
        </div>
        <h2 className="text-2xl md:text-[2rem] font-bold tracking-[-0.02em] text-[#16181D]">
          What&apos;s ours
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#6B7280] max-w-2xl">
          The Learning Events RealAI authors or reviews, with status and what needs
          action next. Routing: Authoring &rarr; Tarry; Reviewing &rarr; Tannistha &amp; Monira.
        </p>

        {/* Summary strip */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <StatPill label="Authoring" value={author} accent />
          <StatPill label="Reviewing" value={reviewer} />
          <StatPill label="Needs action" value={needs_action} accent />
          {typeof author_todo === "number" && (
            <StatPill label="LEs needing content" value={author_todo} />
          )}
          {typeof ready_to_review === "number" && (
            <StatPill label="Ready to review" value={ready_to_review} />
          )}
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#9CA3AF] ml-1 tabular-nums">
            · {board.length} LEs on RealAI&apos;s plate
          </span>
          {!!offWikiCount && (
            <span
              className="inline-flex items-center gap-1 rounded border border-[#E9CFC6] bg-[#FBEAE5] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[#A53C22] tabular-nums"
              title="M&F reviews marked 'RAI' in the SharePoint registry but not yet added to the wiki master"
            >
              <FileWarning className="w-2.5 h-2.5" />
              {offWikiCount} from SharePoint · awaiting wiki
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
    </section>
  )
}
