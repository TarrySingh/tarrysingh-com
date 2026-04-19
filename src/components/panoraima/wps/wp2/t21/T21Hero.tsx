"use client"

import { useEffect, useRef, useState } from "react"
import { Users, Globe, Layers, Clock, Briefcase } from "lucide-react"
import type { Task21Detail } from "@/lib/panoraima/types"
import { T21_COUNTRY_COORDS } from "@/lib/panoraima/types"

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

function projectEurope(lat: number, lng: number, w = 520, h = 320) {
  const minLng = -12, maxLng = 40, minLat = 35, maxLat = 62
  const x = ((lng - minLng) / (maxLng - minLng)) * w
  const y = h - ((lat - minLat) / (maxLat - minLat)) * h
  return { x, y }
}

export default function T21Hero({ detail }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const interviewCount =
    (detail.working_groups.netherlands.interviews.filter(i => !i.empty).length) +
    (detail.working_groups.hamburg.interviews.length) +
    (detail.working_groups.ireland.sessions.length)

  const stakeholders = detail.stats.stakeholders_estimated
  const countries = detail.stats.countries.length
  const sectors = detail.stats.sectors.length
  const videoMin = detail.stats.video_minutes_estimated ?? 0
  const papers = detail.desktop_research.topics.reduce((n, t) => n + t.count, 0)

  const W = 520, H = 320

  return (
    <section className="relative overflow-hidden bg-navy-950 pt-24 md:pt-32 pb-20">
      <div
        aria-hidden
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(circle at 15% 25%, rgba(139, 92, 246, 0.55), transparent 45%),
                       radial-gradient(circle at 82% 65%, rgba(201, 169, 110, 0.28), transparent 45%),
                       radial-gradient(circle at 50% 100%, rgba(56, 92, 145, 0.25), transparent 45%)`,
        }}
      />
      <div aria-hidden className="absolute inset-0 noise-overlay" />

      {/* Country dots map in background */}
      <svg
        aria-hidden
        viewBox={`0 0 ${W} ${H}`}
        className="absolute right-0 top-16 md:top-24 opacity-75 w-[320px] md:w-[520px] pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="t21-dot-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E4CE9D" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E4CE9D" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="t21-edge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(201, 169, 110, 0)" />
            <stop offset="50%" stopColor="rgba(201, 169, 110, 0.35)" />
            <stop offset="100%" stopColor="rgba(201, 169, 110, 0)" />
          </linearGradient>
        </defs>

        {Object.entries(T21_COUNTRY_COORDS).map(([name, c], i) => {
          const { x, y } = projectEurope(c.lat, c.lng, W, H)
          return (
            <g
              key={name}
              style={{
                transformOrigin: `${x}px ${y}px`,
                animation: mounted ? `t21-pulse 3.5s ease-in-out infinite ${i * 250}ms` : "none",
              }}
            >
              <circle cx={x} cy={y} r={15} fill="url(#t21-dot-glow)" />
              <circle cx={x} cy={y} r={3.5} fill="#E4CE9D" />
            </g>
          )
        })}
      </svg>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400 border border-gold-500/30 bg-gold-500/5">
            WP2 · T2.1 · Deep dive
          </span>
        </div>

        <h1 className="animate-fade-up delay-100 text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-5 max-w-3xl">
          <Counter target={stakeholders} suffix="+" /> stakeholders.
          <br />
          <span className="gradient-text"><Counter target={countries} /> countries.</span>
          <br />
          <Counter target={sectors} /> sectors.
        </h1>
        <p className="animate-fade-up delay-200 text-base md:text-lg text-navy-100/80 leading-relaxed max-w-2xl">
          {detail.description}
        </p>

        {/* KPI tiles */}
        <div className="animate-fade-up delay-300 mt-12 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {[
            { label: "Stakeholders", value: stakeholders, icon: Users, accent: "from-gold-400 to-gold-600" },
            { label: "Countries",    value: countries,    icon: Globe, accent: "from-sky-400 to-sky-600" },
            { label: "Sectors",      value: sectors,      icon: Layers, accent: "from-emerald-400 to-emerald-600" },
            { label: "Interviews",   value: interviewCount, icon: Briefcase, accent: "from-rose-400 to-rose-600" },
            { label: "Papers cited", value: papers,       icon: Clock, accent: "from-violet-400 to-violet-600" },
          ].map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-4 md:p-5 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={`absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r ${s.accent} opacity-80`} />
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-100/60">
                <s.icon className="w-3 h-3" />
                {s.label}
              </div>
              <div className="mt-1.5 text-2xl md:text-3xl font-bold text-white tabular-nums">
                <Counter target={s.value} />
              </div>
            </div>
          ))}
        </div>

        {videoMin > 0 && (
          <div className="animate-fade-up delay-500 mt-6 inline-flex items-center gap-2 text-[12px] text-navy-100/70">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Plus <strong className="text-white">~{videoMin} minutes</strong> of focus-group
            video recorded across the Irish working group.
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />

      <style jsx global>{`
        @keyframes t21-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1);   }
          50%      { opacity: 1;    transform: scale(1.15); }
        }
      `}</style>
    </section>
  )
}
