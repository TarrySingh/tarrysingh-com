"use client"

import { useMemo } from "react"
import {
  PenLine, Eye, AlertTriangle, FileCheck2, FileX2,
  ExternalLink, CalendarClock, Sparkles,
} from "lucide-react"
import type { Wp4Registry, Wp4LE } from "@/lib/panoraima/types"
import {
  TRACK_COLOR, TRACK_SHORT, statusStyle, ROLE_LABEL, ROLE_COLOR,
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

// The role label this LE holds within a given column (gold for author/co-author).
function columnRole(le: Wp4LE, kind: "authoring" | "reviewing"): string {
  if (kind === "reviewing") return "reviewer"
  // prefer "author" over "co-author" for the badge if both somehow present
  return le.realai.roles.some(r => r.role === "author") ? "author" : "co-author"
}

function StatPill({
  label, value, tone,
}: {
  label: string
  value: number
  tone: "gold" | "sky" | "rose"
}) {
  const toneMap = {
    gold: { dot: "#c9a96e", text: "text-gold-700", ring: "border-gold-200 bg-gold-50" },
    sky:  { dot: "#0ea5e9", text: "text-sky-700",  ring: "border-sky-200 bg-sky-50" },
    rose: { dot: "#f43f5e", text: "text-rose-700", ring: "border-rose-200 bg-rose-50" },
  }[tone]
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${toneMap.ring}`}>
      <span className="w-2 h-2 rounded-full" style={{ background: toneMap.dot }} />
      <span className={`text-lg font-bold tabular-nums leading-none ${toneMap.text}`}>{value}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">{label}</span>
    </div>
  )
}

function LECard({ le, kind }: { le: Wp4LE; kind: "authoring" | "reviewing" }) {
  const flagged = needsAction(le)
  const ss = statusStyle(le.status)
  const trackColor = TRACK_COLOR[le.track] ?? TRACK_COLOR["Unknown"]
  const role = columnRole(le, kind)
  const roleColor = ROLE_COLOR[role] ?? "#64748b"
  const title = le.title?.trim() || le.code

  return (
    <div
      className={`relative rounded-2xl bg-white p-4 transition-all duration-200 hover:shadow-md ${
        flagged
          ? "border border-gold-200 ring-1 ring-gold-300 border-l-4 border-l-gold-400 shadow-sm"
          : "border border-gray-100 hover:border-navy-200"
      }`}
    >
      {/* Top row: code + track dot + external link */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: trackColor }}
            title={le.track}
          />
          <span className="font-mono text-[12px] font-bold text-navy-900 truncate">
            {le.code}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border"
            style={{ borderColor: `${roleColor}44`, color: roleColor, background: `${roleColor}11` }}
          >
            {ROLE_LABEL[role] ?? role}
          </span>
          {le.wiki_page && (
            <a
              href={le.wiki_page}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-gray-300 hover:text-navy-500 transition-colors"
              aria-label="Open wiki page"
              title="Open wiki page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="mt-2 text-[13px] font-semibold text-navy-900 leading-snug line-clamp-2">
        {title}
      </h4>

      {/* Status + due */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ss.bg} ${ss.text}`}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: ss.color }} />
          {ss.label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
          {TRACK_SHORT[le.track] ?? le.track}
        </span>
        {le.due_date && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 tabular-nums">
            <CalendarClock className="w-3 h-3 text-gray-400" />
            {le.due_date}
          </span>
        )}
      </div>

      {/* Footer: materials + needs-action flag */}
      <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between gap-2">
        {le.materials.has ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 tabular-nums">
            <FileCheck2 className="w-3.5 h-3.5" />
            {le.materials.count} {le.materials.count === 1 ? "file" : "files"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
            <FileX2 className="w-3.5 h-3.5" />
            no materials yet
          </span>
        )}
        {flagged && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 border border-gold-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-700">
            <AlertTriangle className="w-2.5 h-2.5" />
            needs action
          </span>
        )}
      </div>
    </div>
  )
}

function BoardColumn({
  title, icon: Icon, accent, items, kind, hint,
}: {
  title: string
  icon: typeof PenLine
  accent: string
  items: Wp4LE[]
  kind: "authoring" | "reviewing"
  hint: string
}) {
  const actionCount = items.filter(needsAction).length
  return (
    <div className="rounded-3xl border border-gray-100 bg-gray-50/60 p-4 md:p-5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
            style={{ background: accent }}
          >
            <Icon className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900 leading-none">
              {title} <span className="tabular-nums text-gray-400">({items.length})</span>
            </h3>
            <p className="mt-1 text-[11px] text-gray-500">{hint}</p>
          </div>
        </div>
        {actionCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 border border-gold-200 px-2 py-0.5 text-[10px] font-bold text-gold-700 tabular-nums flex-shrink-0">
            <AlertTriangle className="w-3 h-3" />
            {actionCount}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-[12px] text-gray-400">
          Nothing assigned here.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map(le => (
            <LECard key={`${kind}-${le.code}`} le={le} kind={kind} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function WP4RealAIBoard({ registry }: { registry: Wp4Registry }) {
  const { author, reviewer, needs_action } = registry.summary.realai

  const board = registry.realai_board

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
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          RealAI commitments
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          What&apos;s ours
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          The Learning Events RealAI authors or reviews, with status and what needs
          action next. Routing: Authoring &rarr; Tarry; Reviewing &rarr; Tannistha &amp; Monira.
        </p>
      </div>

      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-2.5 mb-6">
        <StatPill label="Authoring" value={author} tone="gold" />
        <StatPill label="Reviewing" value={reviewer} tone="sky" />
        <StatPill label="Needs action" value={needs_action} tone="rose" />
        <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 ml-1">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          {board.length} LEs on RealAI&apos;s plate
        </span>
      </div>

      {/* Two-column board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <BoardColumn
          title="Authoring"
          icon={PenLine}
          accent={ROLE_COLOR["author"]}
          items={authoring}
          kind="authoring"
          hint="LEs RealAI writes — drafting & materials"
        />
        <BoardColumn
          title="Reviewing"
          icon={Eye}
          accent={ROLE_COLOR["reviewer"]}
          items={reviewing}
          kind="reviewing"
          hint="LEs RealAI reviews — quality gate"
        />
      </div>
    </section>
  )
}
