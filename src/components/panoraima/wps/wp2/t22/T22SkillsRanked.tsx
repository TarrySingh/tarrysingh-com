"use client"

import { useEffect, useRef, useState } from "react"
import { Trophy } from "lucide-react"
import type { Task22Detail } from "@/lib/panoraima/types"
import {
  INK,
  SLATE,
  MUTE,
  NAVY_2,
  COBALT,
  OK,
  SURFACE,
  LINE,
  KICKER,
  CARD,
} from "../../../consortiumTokens"

interface Props {
  detail: Task22Detail
}

// Corporate colour key — restrained semantic grouping of the 14 ranked skills.
// COBALT leads (top trio), then NAVY_2 / OK / SLATE / MUTE — one cool family.
const SKILL_COLOR: Record<string, string> = {
  "Explainability":              COBALT,   // cobalt — top of rank
  "Ethics":                      COBALT,
  "Critical thinking":           COBALT,
  "Human Oversight":             NAVY_2,
  "AI & ML Literacy for everyone": NAVY_2,
  "Fairness":                    NAVY_2,
  "Interdisciplinarity":         OK,
  "Legal Compliance":            OK,
  "Responsibility":              OK,
  "Identify data overfitting":   SLATE,
  "Optimisation":                SLATE,
  "Resilience":                  SLATE,
  "Transparency":                MUTE,
  "Cross-disciplinary roles":    MUTE,
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
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full border ${KICKER}`}
          style={{ color: MUTE, borderColor: LINE, background: SURFACE }}
        >
          The 14 AI skills academia asked for
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
          Ranked by how often academics cited each skill
        </h2>
        <p className="mt-1 text-sm max-w-xl" style={{ color: SLATE }}>
          From the report&apos;s explicit
          <span className="italic"> &quot;from more to less frequent&quot;</span> list.
          Explainability and Ethics dominated the conversation; transparency and
          cross-disciplinary roles were mentioned but less frequently.
        </p>
      </div>

      <div ref={containerRef} className={`${CARD} p-6 md:p-8`}>
        <ol className="space-y-2.5">
          {skills.map((s, i) => {
            const widthPct = ((maxRank - i) / maxRank) * 100   // rank 1 → 100%, rank 14 → ~7%
            const color = SKILL_COLOR[s.name] ?? MUTE
            const isTop3 = i < 3
            return (
              <li key={s.name} className="flex items-center gap-3">
                <span
                  className="w-8 text-right text-[11px] font-mono font-bold tabular-nums"
                  style={{ color: isTop3 ? COBALT : MUTE }}
                >
                  #{s.rank}
                </span>
                <div
                  className="flex-1 relative h-9 rounded-lg overflow-hidden"
                  style={{ background: SURFACE }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out"
                    style={{
                      width: inView ? `${widthPct}%` : "0%",
                      background: color,
                      transitionDelay: `${i * 60}ms`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span
                      className="text-[13px] font-semibold relative z-10"
                      style={{ color: isTop3 ? "#FFFFFF" : INK }}
                    >
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

        <div
          className="mt-5 pt-5 border-t flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px]"
          style={{ borderColor: LINE, color: MUTE }}
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COBALT }} />
            Top trio (explainability, ethics, critical thinking)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: NAVY_2 }} />
            Oversight & literacy cluster
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: OK }} />
            Interdisciplinarity & governance
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: SLATE }} />
            Technical craft
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: MUTE }} />
            Other
          </span>
        </div>
      </div>
    </section>
  )
}
