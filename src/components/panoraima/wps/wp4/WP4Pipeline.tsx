"use client"

import { FileText, FolderOpen, ClipboardCheck, Rocket, ArrowRight, ExternalLink, ChevronRight } from "lucide-react"
import type { Wp4Registry, Wp4LE } from "@/lib/panoraima/types"
import { RUST, TRACK_COLOR, ROLE_COLOR } from "./wp4constants"

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

  // ③ QA/QC review — partial signal: wiki status only tracks the plan, material-QA isn't tracked yet
  let review: StageState = "locked"
  let reviewNote = "awaiting material"
  if (ws.includes("final") || ws.includes("production") || ws.includes("done")) { review = "done"; reviewNote = "reviewed" }
  else if (ws.includes("review")) { review = "active"; reviewNote = "in review" }
  else if (hasMaterials) { review = "todo"; reviewNote = "ready for QA/QC" }

  // ④ Production → WP5
  const production: StageState = (plan === "done" && material === "done" && review === "done") ? "done" : "locked"

  return [
    { key: "plan",       label: "Lesson plan",   icon: FileText,       state: plan,       note: planNote },
    { key: "material",   label: "Material",      icon: FolderOpen,     state: material,   note: materialNote },
    { key: "review",     label: "QA / QC",       icon: ClipboardCheck, state: review,     note: reviewNote },
    { key: "production", label: "Production",    icon: Rocket,         state: production, note: production === "done" ? "ready for WP5" : "→ WP5 (MSc Fall 2027)" },
  ]
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

      <div className="space-y-3">
        {board.map((le) => {
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

      <div className="mt-5 flex items-start gap-2 text-[13px] leading-relaxed text-[#5B616B]">
        <ClipboardCheck className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
        <span>
          QA/QC stage reflects the wiki status (which tracks the <em>lesson plan</em>). Material-level
          review sign-off isn&apos;t tracked in the source yet, it&apos;ll light up once reviewers record it
          (a planned in-tool action), or via a wiki/SharePoint status we wire in.
        </span>
      </div>
    </section>
  )
}
