"use client"

import { useEffect, useRef, useState } from "react"
import ConsortiumPlate from "./ConsortiumPlate"
import { COBALT } from "./consortiumTokens"

interface Props {
  totalEvents: number
  totalSubmissions: number
  totalChallenges: number
}

/** Animated numeric counter that eases to its target. */
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
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])
  return <span>{val}{suffix}</span>
}

export default function HeroSection({ totalEvents, totalSubmissions, totalChallenges }: Props) {
  const stats = [
    { label: "Consortium partners", value: 15 },
    { label: "Events tracked", value: totalEvents },
    { label: "Progress reports", value: totalSubmissions },
    { label: "Challenges logged", value: totalChallenges },
  ]

  return (
    <section className="relative overflow-hidden" style={{ background: "#051C2C" }}>
      {/* Cartographic plate — the real consortium network over a navy graticule */}
      <ConsortiumPlate variant="hero" className="absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 md:pt-36 pb-16">
        <div className="max-w-3xl">
          <span className="animate-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 border border-white/15 bg-white/5 mb-6">
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: COBALT, boxShadow: `0 0 8px ${COBALT}` }} />
            EU Horizon Europe · Live dashboard
          </span>
          <h1 className="animate-fade-up delay-100 text-4xl md:text-6xl font-bold tracking-[-0.03em] text-white leading-[1.04] mb-5">
            Fifteen labs.<br />
            Eight countries.<br />
            One year of <span style={{ color: "#7DA0FF" }}>AI education.</span>
          </h1>
          <p className="animate-fade-up delay-200 text-base md:text-lg leading-relaxed max-w-2xl text-white/70">
            <strong className="text-white font-semibold">PANORAIMA</strong> brings together universities and
            research labs from across Europe to build the next generation of AI education. This dashboard
            tracks every PMC meeting, worksprint, and progress report as the project unfolds.
          </p>
        </div>

        {/* Stats strip — corporate KPI cards: cobalt top-rule, mono label, tabular figure */}
        <div className="animate-fade-up delay-300 mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm px-5 py-5 hover:bg-white/[0.07] transition-colors duration-300"
            >
              <div className="absolute top-0 left-0 h-[2px] w-full" style={{ background: COBALT, opacity: 0.85 }} />
              <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/55">
                {s.label}
              </div>
              <div className="mt-2 text-3xl md:text-[2.4rem] font-bold text-white tabular-nums leading-none">
                <Counter target={s.value} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* spacer so the overlapping toolbar has a navy backdrop */}
      <div className="h-24" />
    </section>
  )
}
