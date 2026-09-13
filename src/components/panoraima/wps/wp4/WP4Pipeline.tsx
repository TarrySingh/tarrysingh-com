"use client"

import { useMemo, useState } from "react"
import { FileText, FolderOpen, ClipboardCheck, Rocket, ArrowRight, ExternalLink, ChevronRight, Search, X } from "lucide-react"
import type { Wp4Registry, Wp4LE } from "@/lib/panoraima/types"
import { RUST, TRACK_COLOR, ROLE_COLOR, TRACK_ORDER, TRACK_SHORT } from "./wp4constants"

interface Props {
  registry: Wp4Registry
}

type StageState = "done" | "active" | "partial" | "todo" | "locked"

// flat, refined dot/line states — ink-filled done, rust active, muted-green
// partial, light-gray todo/locked. No bright fills, no rings, no shadows.
const STATE_STYLE: Record<StageState, { dot: string; icon: string; line: string; text: string; label: string }> = {
  done:    { dot: "bg-[#16181D] border-[#16181D]", icon: "text-white",     line: "bg-[#16181D]",   text: "text-[#3A3E46]", label: "Done" },
  active:  { dot: "border-[#C0492B]",              icon: "text-[#C0492B]", line: "bg-[#E7E7EA]",   text: "text-[#9A3318]", label: "In progress" },
  partial: { dot: "border-[#5E8C7B]",              icon: "text-[#3F7D5E]", line: "bg-[#E7E7EA]",   text: "text-[#2E6B4E]", label: "Partial" },
  todo:    { dot: "border-[#E7E7EA]",              icon: "text-[#C2C5CB]", line: "bg-[#E7E7EA]",   text: "text-[#5B616B]", label: "Not started" },
  locked:  { dot: "border-[#EEEEF0]",              icon: "text-[#D7D7DB]", line: "bg-[#E7E7EA]",   text: "text-[#6B7280]", label: "Locked" },
}


/** The QA/QC state, named, so the filter bar and the stepper cannot drift apart. */
type StageFilter = "all" | "needs-us" | "awaiting-reviewer" | "with-author" | "reviewed" | "no-material"

function stageBucket(le: Wp4LE): Exclude<StageFilter, "all"> {
  if (!le.materials.has) return "no-material"
  if (le.review_done && !le.revision_requested) return "reviewed"
  // RealAI-authored LEs are never waiting on RealAI to review: they wait on whoever is
  // named as reviewer. Lumping them into "needs-us" overstated our own backlog by four.
  if (le.completeness?.is_author) return "awaiting-reviewer"
  if (le.revision_requested || (le.wiki_status || "").toLowerCase().includes("under revision")) return "with-author"
  if (le.early_feedback) return "with-author"
  return "needs-us"
}

const STAGE_LABEL: Record<Exclude<StageFilter, "all">, string> = {
  "needs-us": "Waiting on RealAI",
  "awaiting-reviewer": "Ours, awaiting a reviewer",
  "with-author": "With the author",
  reviewed: "Reviewed",
  "no-material": "No material yet",
}

interface Stage { key: string; label: string; icon: typeof FileText; state: StageState; note: string }

function stagesFor(le: Wp4LE): Stage[] {
  const c = le.completeness
  const ws = (le.wiki_status || "").toLowerCase()
  const hasMaterials = le.materials.has

  // ① Lesson plan (wiki)
  let plan: StageState = "todo"
  let planNote = "no outcomes or teaching plan yet"
  if (c) {
    if (c.instructions_written && c.outcomes_present) { plan = "done"; planNote = "outcomes + teaching plan written" }
    else if (c.outcomes_present || c.instructions_written) { plan = "partial"; planNote = c.instructions_written ? "teaching plan written, outcomes missing" : "outcomes set, teaching plan missing" }
  }

  // ② Material (SharePoint)
  const material: StageState = hasMaterials ? "done" : (plan === "done" ? "active" : "todo")
  const materialNote = hasMaterials ? `${le.materials.count} file${le.materials.count === 1 ? "" : "s"} dropped` : "no material dropped yet"

  // ③ QA/QC review.
  // Our own review record comes FIRST. The wiki status only ever describes the author's
  // side of the LE and never says "reviewed", so deriving this stage from the status
  // string alone left every LE we had signed off still reading "in review", and left
  // Production permanently locked for all of them.
  let review: StageState = "locked"
  let reviewNote = "awaiting material"
  if (!hasMaterials) {
    // QA/QC is a gate on the MATERIAL, so it stays locked. But many LEs have had their
    // lesson plan reviewed already, and saying only "awaiting material" hides that work.
    review = "locked"
    reviewNote = le.review_done ? "plan reviewed, awaiting material" : "awaiting material"
  } else if (le.review_done && !le.revision_requested) {
    review = "done"
    reviewNote = "reviewed by RealAI"
  } else if (le.revision_requested) {
    review = "active"
    reviewNote = "revision requested, back with the author"
  } else if (le.early_feedback) {
    review = "todo"
    reviewNote = "early feedback given, not yet submitted to us"
  } else if (ws.includes("under revision")) {
    review = "active"
    reviewNote = "with the author"
  } else if (ws.includes("final") || ws.includes("production") || ws.includes("done")) {
    review = "done"
    reviewNote = "reviewed"
  } else {
    review = "todo"
    reviewNote = "ready for QA/QC"
  }

  // ④ Production → WP5
  const production: StageState = (plan === "done" && material === "done" && review === "done") ? "done" : "locked"

  return [
    { key: "plan",       label: "Lesson plan",   icon: FileText,       state: plan,       note: planNote },
    { key: "material",   label: "Material",      icon: FolderOpen,     state: material,   note: materialNote },
    { key: "review",     label: "QA / QC",       icon: ClipboardCheck, state: review,     note: reviewNote },
    { key: "production", label: "Production",    icon: Rocket,         state: production, note: production === "done" ? "ready for WP5" : "→ WP5 (MSc Fall 2027)" },
  ]
}


/** Small filter chip. Mirrors the board's FilterChip so the two sections read as one tool. */
function Chip({ label, count, color, active, onClick }: {
  label: string; count?: number; color?: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em] transition-colors ${
        active
          ? "bg-[#16181D] text-white border-[#16181D]"
          : "bg-white text-[#3F434C] border-[#DCDDE1] hover:border-[#16181D]/40"
      }`}
    >
      {color && <span className="w-1.5 h-1.5 rounded-[2px]" style={{ background: color }} aria-hidden />}
      {label}
      {count !== undefined && (
        <span className={active ? "text-white/70" : "text-[#8A8F98]"}>{count}</span>
      )}
    </button>
  )
}

function Stepper({ stages }: { stages: Stage[] }) {
  return (
    <div className="flex items-start">
      {stages.map((s, i) => {
        const st = STATE_STYLE[s.state]
        return (
          <div key={s.key} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center text-center min-w-[64px]">
              <div className={`w-8 h-8 rounded-full border-2 bg-white ${st.dot} flex items-center justify-center`}>
                <s.icon className={`w-3.5 h-3.5 ${st.icon}`} strokeWidth={1.75} />
              </div>
              <div className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#14161B]">{s.label}</div>
              <div className={`mt-1 text-[11px] leading-snug max-w-[92px] ${st.text}`}>{s.note}</div>
            </div>
            {i < stages.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mt-4 ${STATE_STYLE[stages[i + 1].state].line}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function WP4Pipeline({ registry }: Props) {
  const board = registry.realai_board
  const [track, setTrack] = useState<string | null>(null)
  const [stage, setStage] = useState<StageFilter>("all")
  const [q, setQ] = useState("")

  const trackCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const le of board) m[le.track] = (m[le.track] ?? 0) + 1
    return m
  }, [board])

  const stageCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const le of board) { const b = stageBucket(le); m[b] = (m[b] ?? 0) + 1 }
    return m
  }, [board])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return board.filter(le => {
      if (track && le.track !== track) return false
      if (stage !== "all" && stageBucket(le) !== stage) return false
      if (needle) {
        const hay = `${le.code} ${le.title ?? ""} ${le.author ?? ""}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
  }, [board, track, stage, q])

  // Group by track so "all tracks" is scannable instead of one 89-card scroll.
  const grouped = useMemo(() => {
    const m = new Map<string, Wp4LE[]>()
    for (const le of filtered) {
      const arr = m.get(le.track) ?? []
      arr.push(le); m.set(le.track, arr)
    }
    const known: string[] = [...TRACK_ORDER]
    const order = [...known, ...[...m.keys()].filter(k => !known.includes(k))]
    return order.filter(k => m.has(k)).map(k => [k, m.get(k)!] as const)
  }, [filtered])

  const resetAll = () => { setTrack(null); setStage("all"); setQ("") }
  const isFiltered = track !== null || stage !== "all" || q.trim() !== ""

  return (
    <section>
      {/* ── Section header ───────────────────────────────────────── */}
      <div className="mb-8">
        <div className="font-mono text-[13px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: RUST }}>
          Production pipeline · Wiki ↔ SharePoint
        </div>
        <h2 className="text-2xl md:text-[2rem] font-bold tracking-[-0.02em] text-[#14161B]">
          From lesson plan to classroom
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#444A55] max-w-2xl">
          Two artifacts per Learning Event, tracked separately: the{" "}
          <span className="font-semibold text-[#14161B]">lesson plan</span> on the wiki, and the{" "}
          <span className="font-semibold text-[#14161B]">material</span> (pptx · notebook · code) dropped in its
          SharePoint folder. Material is QA/QC&apos;d by reviewers, then handed to WP5 for the MSc
          roll-out (Fall 2027). Below: where each of RealAI&apos;s LEs sits.
        </p>
      </div>

      {/* Legend of the flow */}
      <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[12px] uppercase tracking-[0.12em] text-[#444A55]">
        {[
          { icon: FileText, t: "Lesson plan (wiki)" },
          { icon: FolderOpen, t: "Material (SharePoint)" },
          { icon: ClipboardCheck, t: "QA/QC review" },
          { icon: Rocket, t: "Production → WP5" },
        ].map((x, i, arr) => (
          <span key={x.t} className="inline-flex items-center gap-1.5">
            <x.icon className="w-4 h-4 text-[#6B7280]" strokeWidth={1.75} />
            {x.t}
            {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-[#D7D7DB] ml-1" strokeWidth={1.75} />}
          </span>
        ))}
      </div>

      {/* Filter bar: track, stage, free text. Keeps 89 cards navigable without
          hiding anything behind an extra click. */}
      <div className="mb-5 rounded-xl border border-[#E7E7EA] bg-[#FBFBFA] p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip label="All tracks" count={board.length} active={track === null} onClick={() => setTrack(null)} />
          {TRACK_ORDER.filter(tr => trackCounts[tr]).map(tr => (
            <Chip key={tr} label={TRACK_SHORT[tr] ?? tr} color={TRACK_COLOR[tr]}
                  count={trackCounts[tr]} active={track === tr}
                  onClick={() => setTrack(track === tr ? null : tr)} />
          ))}
          <div className="relative ml-auto">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AA0A8]" strokeWidth={1.75} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Find a code, title or author"
              aria-label="Search learning events"
              className="w-[230px] rounded-lg border border-[#DCDDE1] bg-white py-1.5 pl-8 pr-7 text-[13px] text-[#16181D] placeholder:text-[#9AA0A8] focus:border-[#16181D]/40 focus:outline-none"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9AA0A8] hover:text-[#16181D]">
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Chip label="Every stage" count={board.length} active={stage === "all"} onClick={() => setStage("all")} />
          {(Object.keys(STAGE_LABEL) as Exclude<StageFilter, "all">[])
            // "Waiting on RealAI" always shows, even at zero. An absent chip reads as an
            // oversight; a chip reading 0 is the status, and that is the point of it.
            .filter(s => stageCounts[s] || s === "needs-us")
            .map(s => (
              <Chip key={s} label={STAGE_LABEL[s]} count={stageCounts[s] ?? 0} active={stage === s}
                    onClick={() => setStage(stage === s ? "all" : s)} />
            ))}
          {isFiltered && (
            <button type="button" onClick={resetAll}
                    className="ml-auto font-mono text-[11px] uppercase tracking-[0.1em] text-[#6B7280] underline underline-offset-2 hover:text-[#16181D]">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-[#E7E7EA] bg-white px-5 py-8 text-center text-[14px] text-[#5B616B]">
          No Learning Event matches that. <button type="button" onClick={resetAll} className="underline underline-offset-2">Clear the filters</button>.
        </p>
      )}

      {grouped.map(([tr, les]) => (
        <div key={tr} className="mb-7">
          <div className="mb-2.5 flex items-center gap-2 border-b border-[#E7E7EA] pb-1.5">
            <span className="w-2 h-2 rounded-[2px]" style={{ background: TRACK_COLOR[tr] ?? "#8A8F98" }} aria-hidden />
            <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-[#16181D]">{tr}</h3>
            <span className="font-mono text-[12px] text-[#8A8F98]">{les.length}</span>
          </div>
          <div className="space-y-3">
        {les.map((le) => {
          const stages = stagesFor(le)
          const isAuthor = le.completeness?.is_author
          const role = isAuthor ? "Author" : "Reviewer"
          return (
            <div key={le.code} className="rounded-xl border border-[#E7E7EA] bg-white p-5 md:p-6 shadow-[0_1px_3px_rgba(20,22,27,0.06)] hover:shadow-[0_4px_14px_rgba(20,22,27,0.08)] hover:border-[#16181D]/25 transition-all">
              <div className="grid md:grid-cols-[260px,1fr] gap-5 items-center">
                {/* LE identity + the wiki↔SharePoint mapping */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-[2px] flex-shrink-0" style={{ background: TRACK_COLOR[le.track] || "#9CA3AF" }} />
                    <span className="font-mono text-[13.5px] font-bold tabular-nums text-[#14161B]">{le.code}</span>
                    <span
                      className="font-mono text-[11px] uppercase tracking-[0.1em] px-2 py-1 rounded text-white"
                      style={{ background: ROLE_COLOR[isAuthor ? "author" : "reviewer"] }}
                    >
                      {role}
                    </span>
                  </div>
                  <div className="mt-1.5 text-[15px] md:text-[16px] font-bold text-[#14161B] leading-snug line-clamp-2">
                    {le.title || le.code}
                  </div>
                  {/* mapping row */}
                  <div className="mt-2.5 flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.1em] text-[#6B7280]">
                    {le.wiki_page ? (
                      <a href={le.wiki_page} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#444A55] hover:text-[#14161B] transition-colors">
                        <FileText className="w-3.5 h-3.5" strokeWidth={1.75} /> wiki LE <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" strokeWidth={1.75} /> wiki LE</span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-[#D7D7DB]" strokeWidth={1.75} />
                    <span className="inline-flex items-center gap-1">
                      <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
                      {le.materials.has ? `${le.materials.count} file${le.materials.count === 1 ? "" : "s"}` : "SharePoint: empty"}
                    </span>
                  </div>
                </div>

                {/* 4-stage stepper */}
                <div className="md:pl-5 md:border-l border-[#E7E7EA]">
                  <Stepper stages={stages} />
                </div>
              </div>
            </div>
          )
        })}
          </div>
        </div>
      ))}

      <div className="mt-5 flex items-start gap-2 text-[13px] leading-relaxed text-[#5B616B]">
        <ClipboardCheck className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
        <span>
          QA/QC reflects RealAI&apos;s own review record first, then the wiki status. An LE reads
          &quot;reviewed by RealAI&quot; once the review is posted, &quot;revision requested&quot; while it is back with
          the author, and &quot;early feedback given&quot; where we have read material the author has not yet
          submitted. Where no material exists the gate stays locked, and says so even if the plan has
          already been reviewed. Production opens only when plan, material and QA/QC are all done.
        </span>
      </div>
    </section>
  )
}
