"use client"

import { useEffect, useRef, useState } from "react"
import { Trophy } from "lucide-react"
import type { Task22Detail } from "@/lib/panoraima/types"

interface Props {
  detail: Task22Detail
}

// Editorial colour key — rough semantic grouping of the 14 ranked skills
const SKILL_COLOR: Record<string, string> = {
  "Explainability":              "#c9a96e",   // gold — top of rank
  "Ethics":                      "#c9a96e",
  "Critical thinking":           "#c9a96e",
  "Human Oversight":             "#0ea5e9",
  "AI & ML Literacy for everyone": "#0ea5e9",
  "Fairness":                    "#0ea5e9",
  "Interdisciplinarity":         "#10b981",
  "Legal Compliance":            "#10b981",
  "Responsibility":              "#10b981",
  "Identify data overfitting":   "#8b5cf6",
  "Optimisation":                "#8b5cf6",
  "Resilience":                  "#8b5cf6",
  "Transparency":                "#64748b",
  "Cross-disciplinary roles":    "#64748b",
}

export default function T22SkillsRanked({ detail }: Props) {
  const skills = detail.focus_group.ai_skills_ranked
  const containerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setInView(true) }),
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const maxRank = skills.length

  return (
    <section>
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          The 14 AI skills academia asked for
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          Ranked by how often academics cited each skill
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          From the report&apos;s explicit
          <span className="italic"> &quot;from more to less frequent&quot;</span> list.
          Explainability and Ethics dominated the conversation; transparency and
          cross-disciplinary roles were mentioned but less frequently.
        </p>
      </div>

      <div ref={containerRef} className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
        <ol className="space-y-2.5">
          {skills.map((s, i) => {
            const widthPct = ((maxRank - i) / maxRank) * 100   // rank 1 → 100%, rank 14 → ~7%
            const color = SKILL_COLOR[s.name] ?? "#64748b"
            const isTop3 = i < 3
            return (
              <li key={s.name} className="flex items-center gap-3">
                <span className={`w-8 text-right text-[11px] font-mono font-bold tabular-nums ${
                  isTop3 ? "text-gold-600" : "text-gray-400"
                }`}>
                  #{s.rank}
                </span>
                <div className="flex-1 relative h-9 rounded-lg bg-gray-50 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out"
                    style={{
                      width: inView ? `${widthPct}%` : "0%",
                      background: `linear-gradient(90deg, ${color}dd, ${color}aa)`,
                      transitionDelay: `${i * 60}ms`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className={`text-[13px] font-semibold relative z-10 ${
                      isTop3 ? "text-white" : "text-navy-900"
                    }`}>
                      {s.name}
                    </span>
                    {isTop3 && (
                      <Trophy className="w-3.5 h-3.5 text-white/80 relative z-10" />
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#c9a96e" }} />
            Top trio (explainability, ethics, critical thinking)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#0ea5e9" }} />
            Oversight & literacy cluster
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#10b981" }} />
            Interdisciplinarity & governance
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#8b5cf6" }} />
            Technical craft
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#64748b" }} />
            Other
          </span>
        </div>
      </div>
    </section>
  )
}
