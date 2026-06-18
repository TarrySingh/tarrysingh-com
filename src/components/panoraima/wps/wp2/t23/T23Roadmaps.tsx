"use client"

import { useState } from "react"
import { CalendarDays, ArrowRight, Info, Landmark } from "lucide-react"
import type { Task23Detail, T23Roadmap } from "@/lib/panoraima/types"
import {
  INK, SLATE, MUTE, FAINT, LINE, SURFACE,
  COBALT, COBALT_SOFT, COBALT_LINE, NAVY, NAVY_2, OK, OK_SOFT,
  KICKER, NUM,
} from "../../../consortiumTokens"

interface Props {
  detail: Task23Detail
}

const KIND_META: Record<string, { label: string; style: React.CSSProperties }> = {
  dated:      { label: "Calendar-driven", style: { background: COBALT_SOFT, color: COBALT, borderColor: COBALT_LINE } },
  sequential: { label: "Stage-gated",     style: { background: SURFACE,     color: SLATE,  borderColor: LINE } },
  reference:  { label: "Coordination",    style: { background: OK_SOFT,     color: OK,     borderColor: OK } },
}

export default function T23Roadmaps({ detail }: Props) {
  const [activePartner, setActivePartner] = useState<string>(detail.roadmaps[0]?.partner ?? "")
  const active = detail.roadmaps.find(r => r.partner === activePartner) ?? detail.roadmaps[0]

  return (
    <section>
      <div className="mb-6">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full border ${KICKER}`}
          style={{ color: MUTE, borderColor: LINE, background: SURFACE }}
        >
          Partner roadmaps
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
          Four accreditation paths compared
        </h2>
        <p className="mt-1 text-sm max-w-xl" style={{ color: MUTE }}>
          UNINA filed a calendar of six dated deadlines. Sofia sketched a
          4-stage pipeline. TUD is still deciding between two routes. HAW
          runs the consortium-wide coordination.
        </p>
      </div>

      <div className="rounded-3xl border bg-white overflow-hidden" style={{ borderColor: LINE }}>
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-2 border-b" style={{ borderColor: LINE, background: SURFACE }}>
          {detail.roadmaps.map(r => {
            const isActive = r.partner === active?.partner
            return (
              <button
                key={r.partner}
                onClick={() => setActivePartner(r.partner)}
                className="px-4 py-2 rounded-xl text-[12px] font-bold transition-all"
                style={
                  isActive
                    ? { background: NAVY, color: "#FFFFFF" }
                    : { color: SLATE }
                }
              >
                {r.partner}
                <span className={`ml-2 text-[9px] font-mono opacity-60 ${NUM}`}>
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
              <Landmark className="w-5 h-5" style={{ color: COBALT }} />
              <h3 className="text-lg md:text-xl font-bold leading-tight" style={{ color: INK }}>
                {active.title}
              </h3>
              <span
                className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                style={KIND_META[active.kind]?.style ?? { background: SURFACE, color: SLATE, borderColor: LINE }}
              >
                <CalendarDays className="w-3 h-3" />
                {KIND_META[active.kind]?.label ?? active.kind}
              </span>
            </div>

            <Timeline roadmap={active} />

            {active.note && (
              <div
                className="mt-6 rounded-xl border-l-2 p-4"
                style={{ background: COBALT_SOFT, borderColor: COBALT }}
              >
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: COBALT }} />
                  <p className="text-[13px] leading-relaxed" style={{ color: SLATE }}>{active.note}</p>
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
    <ol className="relative border-l-2 pl-6 space-y-4" style={{ borderColor: LINE }}>
      {roadmap.phases.map((ph, i) => (
        <li key={i} className="relative">
          <span
            className="absolute -left-[33px] top-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-mono font-bold"
            style={{ background: isDated ? COBALT : NAVY_2 }}
          >
            {i + 1}
          </span>

          {ph.date && (
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider mb-0.5" style={{ color: COBALT }}>
              {new Date(ph.date).toLocaleDateString("en-GB", {
                year: "numeric", month: "short", day: "numeric",
              })}
            </div>
          )}

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-bold" style={{ color: INK }}>{ph.actor}</span>
            <ArrowRight className="w-3 h-3" style={{ color: FAINT }} />
            <span className="text-sm leading-snug" style={{ color: SLATE }}>{ph.action}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
