"use client"

import { useEffect, useRef, useState } from "react"
import { Users, Globe, Layers, Clock, Briefcase } from "lucide-react"
import type { Task21Detail } from "@/lib/panoraima/types"
import ConsortiumPlate from "../../../ConsortiumPlate"
import { KICKER, NUM } from "../../../consortiumTokens"

interface Props {
  detail: Task21Detail
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

export default function T21Hero({ detail }: Props) {
  const interviewCount =
    (detail.working_groups.netherlands.interviews.filter(i => !i.empty).length) +
    (detail.working_groups.hamburg.interviews.length) +
    (detail.working_groups.ireland.sessions.length)

  const stakeholders = detail.stats.stakeholders_estimated
  const countries = detail.stats.countries.length
  const sectors = detail.stats.sectors.length
  const videoMin = detail.stats.video_minutes_estimated ?? 0
  const papers = detail.desktop_research.topics.reduce((n, t) => n + t.count, 0)

  return (
    <section className="relative overflow-hidden bg-[#051C2C] pt-24 md:pt-32 pb-20">
      <ConsortiumPlate variant="hero" network={false} className="absolute inset-0" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full ${KICKER} text-[10px] text-[#7DA0FF] border border-[#2251FF]/40 bg-[#2251FF]/10`}>
            WP2 · T2.1 · Deep dive
          </span>
        </div>

        <h1 className="animate-fade-up delay-100 text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-5 max-w-3xl">
          <Counter target={stakeholders} suffix="+" /> stakeholders.
          <br />
          <span className="text-[#7DA0FF]"><Counter target={countries} /> countries.</span>
          <br />
          <Counter target={sectors} /> sectors.
        </h1>
        <p className="animate-fade-up delay-200 text-base md:text-lg text-white/70 leading-relaxed max-w-2xl">
          {detail.description}
        </p>

        {/* KPI tiles */}
        <div className="animate-fade-up delay-300 mt-12 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {[
            { label: "Stakeholders", value: stakeholders, icon: Users },
            { label: "Countries",    value: countries,    icon: Globe },
            { label: "Sectors",      value: sectors,      icon: Layers },
            { label: "Interviews",   value: interviewCount, icon: Briefcase },
            { label: "Papers cited", value: papers,       icon: Clock },
          ].map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm p-4 md:p-5 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute top-0 left-0 h-[2px] w-full bg-[#2251FF]" />
              <div className={`flex items-center gap-1.5 ${KICKER} text-[10px] tracking-[0.18em] text-white/55`}>
                <s.icon className="w-3 h-3" />
                {s.label}
              </div>
              <div className={`mt-1.5 text-2xl md:text-3xl font-bold text-white ${NUM}`}>
                <Counter target={s.value} />
              </div>
            </div>
          ))}
        </div>

        {videoMin > 0 && (
          <div className="animate-fade-up delay-500 mt-6 inline-flex items-center gap-2 text-[12px] text-white/65">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7DA0FF] animate-pulse" />
            Plus <strong className="text-white">~{videoMin} minutes</strong> of focus-group
            video recorded across the Irish working group.
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#F7F8FA] to-transparent pointer-events-none z-20" />
    </section>
  )
}
