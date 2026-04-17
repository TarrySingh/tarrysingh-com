"use client"

import { useEffect, useRef, useState } from "react"
import { PARTNERS } from "@/lib/panoraima/types"
import { projectEurope } from "./helpers"

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
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const W = 640
  const H = 360
  const hubPartners = PARTNERS.slice(0, 15)

  return (
    <section className="relative overflow-hidden bg-navy-950">
      {/* Animated mesh gradient */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(circle at 18% 28%, rgba(56, 92, 145, 0.55), transparent 45%),
            radial-gradient(circle at 78% 64%, rgba(201, 169, 110, 0.28), transparent 45%),
            radial-gradient(circle at 52% 98%, rgba(139, 92, 246, 0.22), transparent 45%)
          `,
        }}
      />
      <div aria-hidden className="absolute inset-0 noise-overlay" />

      {/* Animated network of dots representing partners */}
      <svg
        aria-hidden
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full opacity-70"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="partner-dot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E4CE9D" stopOpacity="1" />
            <stop offset="100%" stopColor="#E4CE9D" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="edge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(201, 169, 110, 0)" />
            <stop offset="50%" stopColor="rgba(201, 169, 110, 0.45)" />
            <stop offset="100%" stopColor="rgba(201, 169, 110, 0)" />
          </linearGradient>
        </defs>

        {/* Edges between close-by partners */}
        {hubPartners.map((p1, i) => hubPartners.slice(i + 1).map((p2, j) => {
          const a = projectEurope(p1.lat, p1.lng, W, H)
          const b = projectEurope(p2.lat, p2.lng, W, H)
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d > 180) return null
          return (
            <line
              key={`edge-${i}-${j}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="url(#edge)"
              strokeWidth={0.6}
              style={{
                opacity: mounted ? 0.7 : 0,
                transition: `opacity 1.2s ease-out ${200 + (i + j) * 40}ms`,
              }}
            />
          )
        }))}

        {/* Partner dots */}
        {hubPartners.map((p, i) => {
          const { x, y } = projectEurope(p.lat, p.lng, W, H)
          return (
            <g key={p.code} style={{
              transformOrigin: `${x}px ${y}px`,
              animation: mounted ? `pulse-subtle 4s ease-in-out infinite ${i * 200}ms` : "none",
            }}>
              <circle cx={x} cy={y} r={14} fill="url(#partner-dot)" />
              <circle cx={x} cy={y} r={3} fill="#E4CE9D" />
            </g>
          )
        })}
      </svg>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 md:pt-36 pb-16">
        <div className="max-w-3xl">
          <span className="animate-fade-up inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 border border-gold-500/30 bg-gold-500/5 mb-6">
            EU Horizon Europe · Live Dashboard
          </span>
          <h1 className="animate-fade-up delay-100 text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-5">
            Fifteen labs.
            <br />
            <span className="gradient-text">Eight countries.</span>
            <br />
            One year of AI education.
          </h1>
          <p className="animate-fade-up delay-200 text-base md:text-lg text-navy-100/80 leading-relaxed max-w-2xl">
            <strong className="text-white">PANORAIMA</strong> brings together universities and research
            labs from across Europe to build the next generation of AI education. This dashboard
            tracks every PMC meeting, worksprint, and progress report as the project unfolds.
          </p>
        </div>

        {/* Stats strip */}
        <div className="animate-fade-up delay-300 mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Consortium partners", value: 15, accent: "from-gold-400 to-gold-600" },
            { label: "Events tracked",       value: totalEvents, accent: "from-sky-400 to-sky-600" },
            { label: "Progress reports",     value: totalSubmissions, accent: "from-emerald-400 to-emerald-600" },
            { label: "Challenges logged",    value: totalChallenges, accent: "from-rose-400 to-rose-600" },
          ].map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-5 md:p-6 hover:bg-white/10 transition-colors group"
            >
              <div className={`absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r ${s.accent} opacity-70`} />
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-100/60">
                {s.label}
              </div>
              <div className="mt-2 text-3xl md:text-4xl font-bold text-white tabular-nums">
                <Counter target={s.value} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
    </section>
  )
}
