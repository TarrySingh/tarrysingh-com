"use client"

import { FileText, FolderOpen, ClipboardCheck, Rocket, ArrowRight, ExternalLink, ChevronRight } from "lucide-react"
import type { Wp4Registry, Wp4LE } from "@/lib/panoraima/types"
import { TRACK_COLOR } from "./wp4constants"

interface Props {
  registry: Wp4Registry
}

type StageState = "done" | "active" | "partial" | "todo" | "locked"

const STATE_STYLE: Record<StageState, { dot: string; ring: string; text: string; label: string }> = {
  done:    { dot: "bg-emerald-500", ring: "ring-emerald-200", text: "text-emerald-700", label: "Done" },
  active:  { dot: "bg-gold-500",    ring: "ring-gold-200",    text: "text-gold-700",    label: "In progress" },
  partial: { dot: "bg-sky-500",     ring: "ring-sky-200",     text: "text-sky-700",     label: "Partial" },
  todo:    { dot: "bg-gray-300",    ring: "ring-gray-100",    text: "text-gray-400",    label: "Not started" },
  locked:  { dot: "bg-gray-200",    ring: "ring-gray-100",    text: "text-gray-300",    label: "Locked" },
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
    <div className="flex items-center">
      {stages.map((s, i) => {
        const st = STATE_STYLE[s.state]
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center text-center min-w-[64px]">
              <div className={`w-8 h-8 rounded-full ${st.dot} ring-4 ${st.ring} flex items-center justify-center text-white shadow-sm`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-700">{s.label}</div>
              <div className={`text-[9.5px] ${st.text} leading-tight max-w-[88px]`}>{s.note}</div>
            </div>
            {i < stages.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded ${stages[i + 1].state === "todo" || stages[i + 1].state === "locked" ? "bg-gray-100" : "bg-emerald-200"}`} />
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
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Production pipeline · Wiki ↔ SharePoint
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          From lesson plan to classroom
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-2xl">
          Two artifacts per Learning Event, tracked separately: the{" "}
          <strong className="text-navy-700">lesson plan</strong> on the wiki, and the{" "}
          <strong className="text-navy-700">material</strong> (pptx · notebook · code) dropped in its
          SharePoint folder. Material is QA/QC&apos;d by reviewers, then handed to WP5 for the MSc
          roll-out (Fall 2027). Below: where each of RealAI&apos;s LEs sits.
        </p>
      </div>

      {/* Legend of the flow */}
      <div className="mb-6 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
        {[
          { icon: FileText, t: "Lesson plan (wiki)" },
          { icon: FolderOpen, t: "Material (SharePoint)" },
          { icon: ClipboardCheck, t: "QA/QC review" },
          { icon: Rocket, t: "Production → WP5" },
        ].map((x, i, arr) => (
          <span key={x.t} className="inline-flex items-center gap-1.5">
            <x.icon className="w-3.5 h-3.5 text-navy-500" />
            {x.t}
            {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-gray-300 ml-1" />}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        {board.map((le) => {
          const stages = stagesFor(le)
          const role = le.completeness?.is_author ? "Author" : "Reviewer"
          return (
            <div key={le.code} className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5 hover:shadow-md transition-shadow">
              <div className="grid md:grid-cols-[260px,1fr] gap-4 items-center">
                {/* LE identity + the wiki↔SharePoint mapping */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TRACK_COLOR[le.track] || "#64748b" }} />
                    <span className="font-mono text-xs font-bold text-navy-900">{le.code}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-700 bg-gold-50 border border-gold-200 px-1.5 py-0.5 rounded-full">
                      {role}
                    </span>
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-navy-900 leading-tight line-clamp-2">
                    {le.title || le.code}
                  </div>
                  {/* mapping row */}
                  <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-gray-500">
                    {le.wiki_page ? (
                      <a href={le.wiki_page} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-navy-600 hover:text-navy-900 font-medium">
                        <FileText className="w-3 h-3" /> wiki LE <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" /> wiki LE</span>
                    )}
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <span className="inline-flex items-center gap-1">
                      <FolderOpen className="w-3 h-3" />
                      {le.materials.has ? `${le.materials.count} file${le.materials.count === 1 ? "" : "s"}` : "SharePoint: empty"}
                    </span>
                  </div>
                </div>

                {/* 4-stage stepper */}
                <div className="md:pl-4 md:border-l border-gray-100">
                  <Stepper stages={stages} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-[11px] text-gray-400 flex items-start gap-2">
        <ClipboardCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span>
          QA/QC stage reflects the wiki status (which tracks the <em>lesson plan</em>). Material-level
          review sign-off isn&apos;t tracked in the source yet — it&apos;ll light up once reviewers record it
          (a planned in-tool action), or via a wiki/SharePoint status we wire in.
        </span>
      </div>
    </section>
  )
}
