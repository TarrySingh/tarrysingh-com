"use client"

import { useState } from "react"
import { ShieldCheck, FileText, Users, Video, BookMarked, ChevronRight } from "lucide-react"
import type { Task22Detail, T22EthicsStage } from "@/lib/panoraima/types"

interface Props {
  detail: Task22Detail
}

function iconFor(stage: T22EthicsStage) {
  const s = stage.stage.toLowerCase()
  if (s.includes("confirmation")) return ShieldCheck
  if (s.includes("consent"))      return Users
  if (s.includes("executed"))     return Video
  if (s.includes("finalised"))    return BookMarked
  return FileText
}

export default function T22EthicsTrail({ detail }: Props) {
  const trail = detail.ethics_trail
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  const fmtDate = (iso: string) => {
    if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso
    return new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric", month: "short", day: "numeric",
    })
  }

  return (
    <section>
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Governance trail
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          Research governance — from application to report
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          The ethics process behind the focus group, traced through the actual
          files in the SharePoint archive. Click a node to see the file.
        </p>
      </div>

      {/* Horizontal timeline */}
      <div className="relative">
        <div className="absolute left-0 right-0 top-[22px] h-0.5 bg-gradient-to-r from-gray-200 via-gold-300 to-emerald-300 rounded-full" />
        <div className="relative grid grid-cols-2 md:grid-cols-7 gap-4">
          {trail.map((stage, i) => {
            const Icon = iconFor(stage)
            const isActive = activeIdx === i
            return (
              <button
                key={i}
                onClick={() => setActiveIdx(isActive ? null : i)}
                className="group relative flex flex-col items-center text-center focus:outline-none"
              >
                <span
                  className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    stage.pivotal
                      ? "bg-gold-500 text-white shadow-lg shadow-gold-500/30 group-hover:scale-110"
                      : "bg-white border-2 border-gray-200 text-gray-500 group-hover:border-navy-400 group-hover:text-navy-700"
                  } ${isActive ? "ring-4 ring-gold-200" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <div className="mt-3 text-[10px] font-mono font-bold tabular-nums text-gray-400">
                  {fmtDate(stage.date)}
                </div>
                <div className={`mt-0.5 text-[11.5px] font-semibold leading-tight ${
                  stage.pivotal ? "text-navy-900" : "text-gray-700"
                }`}>
                  {stage.stage}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Detail panel */}
      {activeIdx !== null && (
        <div className="mt-8 animate-fade-in rounded-2xl border border-gold-200 bg-gold-50/40 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-700">
                  {trail[activeIdx].pivotal ? "Pivotal moment" : "Intermediate step"}
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  {fmtDate(trail[activeIdx].date)}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-navy-900 leading-tight">
                {trail[activeIdx].stage}
              </h3>
              <p className="mt-2 text-[13.5px] text-gray-700 leading-relaxed">
                {trail[activeIdx].note}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-navy-600 break-all">
                <FileText className="w-3 h-3 flex-shrink-0" />
                <span>{trail[activeIdx].file}</span>
                {trail[activeIdx].kb > 0 && (
                  <span className="text-gray-400 flex-shrink-0">· {trail[activeIdx].kb} KB</span>
                )}
              </div>
            </div>
            <button
              className="text-[11px] font-semibold text-gray-500 hover:text-navy-900 whitespace-nowrap"
              onClick={() => setActiveIdx(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 text-[11px] text-gray-500 flex items-center gap-2">
        <ChevronRight className="w-3 h-3" />
        3 pivotal moments (UNIWA approval · FG executed · Report finalised) are
        highlighted in gold; intermediate application versions sit between them
        in white.
      </div>
    </section>
  )
}
