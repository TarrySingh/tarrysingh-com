"use client"

import { useEffect, useRef, useState } from "react"
import { Users, Building2, MessageSquare, Sparkles, BookOpen } from "lucide-react"
import type { Task22Detail } from "@/lib/panoraima/types"
import ConsortiumPlate from "../../../ConsortiumPlate"
import { NAVY, COBALT, KICKER, NUM } from "../../../consortiumTokens"

interface Props {
  detail: Task22Detail
}

function Counter({ target, duration = 1400, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const raf = useRef<number | null>(null)
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(eased * target))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [target, duration])
  return <span>{val}{suffix}</span>
}

export default function T22Hero({ detail }: Props) {
  const { participant_count, institution_count, question_count, finding_count, ai_skills_ranked } = detail.kpis

  return (
    <section className="relative overflow-hidden pt-24 md:pt-32 pb-20" style={{ background: NAVY }}>
      <ConsortiumPlate variant="hero" network={false} className="absolute inset-0" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full ${KICKER} text-[10px]`}
            style={{ color: COBALT, border: `1px solid ${COBALT}55`, background: `${COBALT}14` }}
          >
            WP2 · T2.2 · Deep dive
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 border border-white/15 bg-white/[0.04]">
            UNIWA-led
          </span>
        </div>

        <h1 className="animate-fade-up delay-100 text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-5 max-w-3xl">
          <Counter target={participant_count} /> academics.
          <br />
          <span style={{ color: "#7DA0FF" }}><Counter target={institution_count} /> universities.</span>
          <br />
          1 focus group.
        </h1>
        <p className="animate-fade-up delay-200 text-base md:text-lg text-white/70 leading-relaxed max-w-2xl">
          {detail.tagline}
          {" "}On <strong className="text-white">4&nbsp;July&nbsp;2025</strong>, UNIWA ran a
          two-hour ethics-approved focus group with 17 academics across 8 partner universities
          to distill how the consortium itself wants to teach responsible AI.
        </p>

        <div className="animate-fade-up delay-300 mt-12 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {[
            { label: "Participants", value: participant_count,  icon: Users },
            { label: "Universities", value: institution_count,  icon: Building2 },
            { label: "Questions",    value: question_count,     icon: MessageSquare },
            { label: "Findings",     value: finding_count,      icon: Sparkles },
            { label: "AI skills",    value: ai_skills_ranked,   icon: BookOpen },
          ].map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/10 p-4 md:p-5 hover:bg-white/[0.07] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute top-0 left-0 h-[2px] w-full" style={{ background: COBALT }} />
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                <s.icon className="w-3 h-3" />
                {s.label}
              </div>
              <div className={`mt-1.5 text-2xl md:text-3xl font-bold text-white ${NUM}`}>
                <Counter target={s.value} />
              </div>
            </div>
          ))}
        </div>

        <div className="animate-fade-up delay-500 mt-6 inline-flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-white/65">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: COBALT }} />
            <strong className="text-white">{detail.kpis.consent_total}</strong>&nbsp;signed consent forms
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            Ethics approval: UNIWA Committee, Jun&nbsp;16&nbsp;2025
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            Instrument: Mentimeter + Microsoft&nbsp;Teams
          </span>
        </div>
      </div>
    </section>
  )
}
