"use client"

import { useEffect, useRef, useState } from "react"
import { Building2, BookOpen, HandshakeIcon, CheckCircle2, HelpCircle } from "lucide-react"
import type { Task23Detail } from "@/lib/panoraima/types"
import ConsortiumPlate from "../../../ConsortiumPlate"
import { COBALT, OK, WARN } from "../../../consortiumTokens"

interface Props {
  detail: Task23Detail
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

const BAND_COLOR: Record<string, string> = {
  ready:        OK,          // submitted / ready (corporate emerald)
  coordinating: WARN,        // partial / needs coordination (corporate amber)
  waiting:      "#97A0AD",   // awaiting info (FAINT on navy)
}

export default function T23Hero({ detail }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const { partners_total, existing_programmes, partners_need_help, partners_ready, partners_waiting } = detail.kpis
  const W = 520, H = 320

  return (
    <section className="relative overflow-hidden bg-[#051C2C] pt-24 md:pt-32 pb-20">
      <ConsortiumPlate variant="hero" network={false} className="absolute inset-0" />

      {/* Partner dots colour-coded by band */}
      <svg
        aria-hidden
        viewBox={`0 0 ${W} ${H}`}
        className="absolute right-0 top-16 md:top-24 opacity-85 w-[320px] md:w-[520px] pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="t23-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7DA0FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7DA0FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {detail.partners.map((p, i) => {
          const [lng, lat] = p.coords
          const { x, y } = projectEurope(lat, lng, W, H)
          const color = BAND_COLOR[p.band] ?? "#7DA0FF"
          return (
            <g
              key={p.abbr}
              style={{
                transformOrigin: `${x}px ${y}px`,
                animation: mounted ? `t23-pulse 3.5s ease-in-out infinite ${i * 220}ms` : "none",
              }}
            >
              <circle cx={x} cy={y} r={17} fill="url(#t23-glow)" />
              <circle cx={x} cy={y} r={4} fill={color} stroke="white" strokeWidth="1" strokeOpacity="0.6" />
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill={p.abbr === "HAW" ? "#7DA0FF" : "#A9C0FF"}
                opacity="0.8"
                fontFamily="monospace"
              >
                {p.abbr}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="inline-flex items-center font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7DA0FF]">
            WP2 · T2.3 · Deep dive
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 border border-white/15 bg-white/5">
            HAW-led
          </span>
        </div>

        <h1 className="animate-fade-up delay-100 text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-5 max-w-3xl">
          <Counter target={partners_total} /> partners.
          <br />
          <span className="text-[#7DA0FF]"><Counter target={existing_programmes} /> existing programmes.</span>
          <br />
          1 new Masters to accredit.
        </h1>
        <p className="animate-fade-up delay-200 text-base md:text-lg text-white/70 leading-relaxed max-w-2xl">
          {detail.tagline}
          {" "}Coordinated by <strong className="text-white">{detail.coordinator_person}</strong> at HAW Hamburg,
          with <strong className="text-white">{detail.ops_contact.name}</strong> at the EQA office
          as the operational contact.
        </p>

        <div className="animate-fade-up delay-300 mt-12 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {[
            { label: "Partners",        value: partners_total,       icon: Building2 },
            { label: "Existing progs.", value: existing_programmes,  icon: BookOpen },
            { label: "Need help",       value: partners_need_help,   icon: HandshakeIcon },
            { label: "Already set",     value: partners_ready,       icon: CheckCircle2 },
            { label: "Awaiting info",   value: partners_waiting,     icon: HelpCircle },
          ].map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-4 md:p-5 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute top-0 left-0 h-[2px] w-full" style={{ background: COBALT }} />
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                <s.icon className="w-3 h-3" />
                {s.label}
              </div>
              <div className="mt-1.5 text-2xl md:text-3xl font-bold text-white tabular-nums">
                <Counter target={s.value} />
              </div>
            </div>
          ))}
        </div>

        <div className="animate-fade-up delay-500 mt-6 inline-flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-white/70">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: BAND_COLOR.ready }} />
            Ready to go
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: BAND_COLOR.coordinating }} />
            Need coordination
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: BAND_COLOR.waiting }} />
            Awaiting info
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />

      <style jsx global>{`
        @keyframes t23-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1);    }
          50%      { opacity: 1;    transform: scale(1.18); }
        }
      `}</style>
    </section>
  )
}
