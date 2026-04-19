"use client"

import { useState } from "react"
import { CalendarDays, ArrowRight, Info, Landmark } from "lucide-react"
import type { Task23Detail, T23Roadmap } from "@/lib/panoraima/types"

interface Props {
  detail: Task23Detail
}

const KIND_META: Record<string, { label: string; cls: string }> = {
  dated:      { label: "Calendar-driven", cls: "bg-violet-100 text-violet-800 border-violet-200" },
  sequential: { label: "Stage-gated",     cls: "bg-sky-100    text-sky-800    border-sky-200" },
  reference:  { label: "Coordination",    cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
}

export default function T23Roadmaps({ detail }: Props) {
  const [activePartner, setActivePartner] = useState<string>(detail.roadmaps[0]?.partner ?? "")
  const active = detail.roadmaps.find(r => r.partner === activePartner) ?? detail.roadmaps[0]

  return (
    <section>
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Partner roadmaps
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          Four accreditation paths compared
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          UNINA filed a calendar of six dated deadlines. Sofia sketched a
          4-stage pipeline. TUD is still deciding between two routes. HAW
          runs the consortium-wide coordination.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-100 bg-gray-50/60">
          {detail.roadmaps.map(r => {
            const isActive = r.partner === active?.partner
            return (
              <button
                key={r.partner}
                onClick={() => setActivePartner(r.partner)}
                className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                  isActive
                    ? "bg-navy-900 text-white shadow-md"
                    : "text-navy-700 hover:bg-white"
                }`}
              >
                {r.partner}
                <span className={`ml-2 text-[9px] font-mono opacity-60`}>
                  {r.phases.length}&nbsp;phases
                </span>
              </button>
            )
          })}
        </div>

        {/* Active roadmap */}
        {active && (
          <div key={active.partner} className="p-5 md:p-7 animate-fade-in">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <Landmark className="w-5 h-5 text-gold-600" />
              <h3 className="text-lg md:text-xl font-bold text-navy-900 leading-tight">
                {active.title}
              </h3>
              <span
                className={`ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  KIND_META[active.kind]?.cls ?? "bg-gray-100 text-gray-700"
                }`}
              >
                <CalendarDays className="w-3 h-3" />
                {KIND_META[active.kind]?.label ?? active.kind}
              </span>
            </div>

            <Timeline roadmap={active} />

            {active.note && (
              <div className="mt-6 rounded-xl bg-gold-50/40 border-l-2 border-gold-400 p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-gray-700 leading-relaxed">{active.note}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function Timeline({ roadmap }: { roadmap: T23Roadmap }) {
  const isDated = roadmap.kind === "dated"

  return (
    <ol className="relative border-l-2 border-navy-100 pl-6 space-y-4">
      {roadmap.phases.map((ph, i) => (
        <li key={i} className="relative">
          <span className={`absolute -left-[33px] top-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-mono font-bold ${
            isDated ? "bg-violet-600" : "bg-sky-600"
          }`}>
            {i + 1}
          </span>

          {ph.date && (
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-700 mb-0.5">
              {new Date(ph.date).toLocaleDateString("en-GB", {
                year: "numeric", month: "short", day: "numeric",
              })}
            </div>
          )}

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-bold text-navy-900">{ph.actor}</span>
            <ArrowRight className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-gray-700 leading-snug">{ph.action}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
