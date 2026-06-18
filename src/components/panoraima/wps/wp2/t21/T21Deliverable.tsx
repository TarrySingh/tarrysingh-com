"use client"

import { useState } from "react"
import {
  CheckCircle2, FileText, ExternalLink,
  Zap, TrendingUp, Target, BookOpen, Briefcase, Shield,
  ChevronLeft, ChevronRight,
} from "lucide-react"
import type { Task21Detail, T21KeyInsight } from "@/lib/panoraima/types"
import {
  NAVY, NAVY_2, COBALT, OK, WARN, SLATE,
} from "../../../consortiumTokens"

interface Props {
  detail: Task21Detail
}

const INSIGHT_ICON: Record<string, typeof Zap> = {
  "High AI Uptake": Zap,
  "Diverging Skill Demands": TrendingUp,
  "Cross-Sectoral Gaps": Target,
  "Preferred Learning Formats": BookOpen,
  "Emerging Job Roles": Briefcase,
  "Ethical & Inclusion Challenges": Shield,
}

// Restrained corporate set (COBALT primary, then NAVY_2 / OK / WARN / SLATE) —
// no rainbow. OK reads "uptake/strong", WARN reads "gaps/at-risk".
const INSIGHT_COLOR: Record<string, string> = {
  "High AI Uptake": OK,
  "Diverging Skill Demands": COBALT,
  "Cross-Sectoral Gaps": WARN,
  "Preferred Learning Formats": NAVY_2,
  "Emerging Job Roles": SLATE,
  "Ethical & Inclusion Challenges": COBALT,
}

export default function T21Deliverable({ detail }: Props) {
  const d = detail.deliverable
  const [activeIdx, setActiveIdx] = useState(0)

  const insights = d.key_insights ?? []
  const versions = d.versions ?? []

  if (!d) return null

  return (
    <section>
      <div className="mb-5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2251FF] border border-[#C9D4FF] bg-[#EEF2FF]">
          The deliverable
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-[#0A1F33]">
          Deliverable 2.1 — Market &amp; Needs Analysis
        </h2>
        <p className="mt-1 text-sm text-[#51607A] max-w-xl">
          The culmination of Task 2.1 — {d.size_kb ? `${(d.size_kb / 1024).toFixed(1)} MB` : ""} PDF,
          published {d.date}. Four draft iterations fed into one release.
        </p>
      </div>

      {/* Version rail */}
      {versions.length > 0 && (
        <div className="mb-8 rounded-2xl border border-[#E3E7ED] bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-[#6B7686]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] font-semibold text-[#51607A]">
              Version history
            </span>
          </div>
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-[2px] bg-[#E3E7ED]" />
            <div className="relative flex items-start justify-between gap-4">
              {versions.map((v, i) => (
                <div key={v.file + i} className="flex flex-col items-center min-w-0 flex-1 text-center">
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white ${
                      v.is_final ? "bg-[#2251FF]" : v.is_archive ? "bg-[#97A0AD]" : "bg-[#0A2540]"
                    }`}
                  >
                    {v.is_final ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-white tabular-nums">{i + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-[11px] font-mono font-semibold text-[#0A1F33]">
                    {v.label}
                  </div>
                  <div className="text-[10px] text-[#97A0AD] truncate max-w-[120px]">
                    {v.file.replace(/\.(pdf|docx)$/i, "").replace(/PANORAIMA_W2-\s*/i, "").slice(0, 40)}
                  </div>
                  {v.size_kb && (
                    <div className="text-[9px] text-[#97A0AD] font-mono tabular-nums mt-0.5">
                      {v.size_kb >= 1024 ? `${(v.size_kb / 1024).toFixed(1)} MB` : `${v.size_kb} KB`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Big callout with exec summary */}
      {d.executive_summary && (
        <div className="mb-8 rounded-3xl p-8 md:p-10 relative overflow-hidden"
             style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_2} 100%)` }}>
          <div aria-hidden className="absolute -top-20 -right-10 w-96 h-96 rounded-full opacity-15"
               style={{ background: `radial-gradient(${COBALT}, transparent 60%)` }} />
          <div className="relative z-10">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] font-semibold text-[#7DA0FF] mb-3">
              Executive summary
            </div>
            <p className="text-base md:text-lg text-white/95 leading-relaxed max-w-4xl">
              {d.executive_summary.length > 1200
                ? d.executive_summary.slice(0, 1200) + "…"
                : d.executive_summary}
            </p>
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
              <div className="text-[11px] font-mono text-white/60 truncate">
                {d.pdf_file}
              </div>
              <a
                href="https://stichtinghogeschoolutrecht.sharepoint.com/sites/PANORAIMA"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold bg-[#2251FF] text-white hover:bg-[#1D43D8] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open full report
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Six key insight cards — horizontal scroll carousel */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-end justify-between mb-4 gap-4">
            <h3 className="text-lg font-bold text-[#0A1F33]">
              Six headline findings
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#97A0AD] tabular-nums">
                {activeIdx + 1} / {insights.length}
              </span>
              <button
                onClick={() => setActiveIdx((i) => (i - 1 + insights.length) % insights.length)}
                className="w-8 h-8 rounded-full bg-white border border-[#E3E7ED] hover:bg-[#EEF2FF] hover:border-[#C9D4FF] transition-colors flex items-center justify-center"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 text-[#51607A]" />
              </button>
              <button
                onClick={() => setActiveIdx((i) => (i + 1) % insights.length)}
                className="w-8 h-8 rounded-full bg-white border border-[#E3E7ED] hover:bg-[#EEF2FF] hover:border-[#C9D4FF] transition-colors flex items-center justify-center"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4 text-[#51607A]" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, i) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                isActive={i === activeIdx}
                onClick={() => setActiveIdx(i)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function InsightCard({
  insight, isActive, onClick,
}: { insight: T21KeyInsight; isActive: boolean; onClick: () => void }) {
  const Icon = INSIGHT_ICON[insight.title] || Zap
  const color = INSIGHT_COLOR[insight.title] || COBALT

  return (
    <button
      onClick={onClick}
      className={`relative text-left rounded-2xl p-5 border transition-all duration-300 overflow-hidden ${
        isActive
          ? "bg-[#051C2C] text-white border-[#051C2C] shadow-xl scale-[1.02]"
          : "bg-white text-[#0A1F33] border-[#E3E7ED] hover:border-[#C9D4FF] hover:shadow-md"
      }`}
    >
      {isActive && (
        <div
          aria-hidden
          className="absolute -top-16 -right-10 w-48 h-48 rounded-full opacity-20"
          style={{ background: `radial-gradient(${color}, transparent 60%)` }}
        />
      )}
      <div className="relative">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
          style={{
            background: isActive ? `${color}30` : `${color}15`,
            color,
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className={`font-mono text-[10px] uppercase tracking-[0.2em] font-semibold mb-1 tabular-nums ${
          isActive ? "text-[#7DA0FF]" : "text-[#97A0AD]"
        }`}>
          Finding {insight.id}
        </div>
        <div className={`text-base font-bold mb-2 ${isActive ? "text-white" : "text-[#0A1F33]"}`}>
          {insight.title}
        </div>
        <p className={`text-[12.5px] leading-relaxed line-clamp-5 ${
          isActive ? "text-white/80" : "text-[#51607A]"
        }`}>
          {insight.body.replace(/^(and\s+|•\s+|eal-world|ks\s+\.+)/i, "")}
        </p>
      </div>
    </button>
  )
}
