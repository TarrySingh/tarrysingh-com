"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, ArrowUpRight } from "lucide-react"
import type { Wp4Registry } from "@/lib/panoraima/types"
import { TRACK_ORDER, TRACK_COLOR, RUST } from "./wp4constants"
import WP4Overview from "./WP4Overview"
import WP4RealAIBoard from "./WP4RealAIBoard"
import WP4Pipeline from "./WP4Pipeline"
import WP4Guides from "./WP4Guides"
import WP4StatusViews from "./WP4StatusViews"
import WP4Explorer from "./WP4Explorer"

interface Props {
  registry: Wp4Registry
}

function Counter({ target, duration = 1100 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0)
  const raf = useRef<number | null>(null)
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * target))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])
  return <span>{val}</span>
}

export default function WP4Dashboard({ registry }: Props) {
  const s = registry.summary
  const trackCount = TRACK_ORDER.filter(t => (s.by_track[t] ?? 0) > 0).length

  const stats = [
    { label: "Learning events", value: s.total_les },
    { label: "With materials", value: s.with_materials },
    { label: "Awaiting", value: s.materials_pending },
    { label: "RealAI's", value: s.realai.total },
    { label: "Need action", value: s.realai.needs_action, accent: true },
  ]

  return (
    <div className="relative min-h-screen bg-white text-[#16181D]">
      {/* ── Masthead ─────────────────────────────────────────────── */}
      <header className="border-b border-[#E7E7EA]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-8">
          {/* breadcrumb / chrome */}
          <div className="flex items-center justify-between gap-3 mb-10">
            <div className="flex items-center gap-4 text-[13px] font-semibold tracking-[0.04em] text-[#444A55]">
              <Link href="/experiments/panoraima/wps" className="inline-flex items-center gap-1.5 hover:text-[#16181D] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> All work packages
              </Link>
              <span className="text-[#9CA3AF]">/</span>
              <span className="font-mono uppercase tracking-[0.12em] text-[#16181D]">WP4</span>
            </div>
            <Link href="/experiments/panoraima" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#444A55] hover:text-[#16181D] transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Consortium
            </Link>
          </div>

          <div className="font-mono text-[13px] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: RUST }}>
            Curriculum &amp; Pilot Programmes · Learning-materials tool
          </div>
          <h1 className="text-4xl md:text-[3.4rem] font-bold tracking-[-0.02em] leading-[1.04] max-w-3xl">
            {registry.title}
          </h1>
          <p className="mt-4 text-[16px] md:text-[17px] leading-relaxed text-[#3A3E46] max-w-2xl">
            {registry.tagline} RealAI authors <span className="font-bold text-[#16181D]">{s.realai.author}</span> and
            reviews <span className="font-bold text-[#16181D]">{s.realai.reviewer}</span> Learning Events; the daily
            monitor flags new material to the right teammate.
          </p>

          {/* stat band */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-5 border-t border-[#E7E7EA]">
            {stats.map((st, i) => (
              <div key={st.label} className={`py-5 ${i > 0 ? "md:border-l border-[#E7E7EA] md:pl-6" : ""}`}>
                <div className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#5B616B]">
                  {st.label}
                </div>
                <div className="mt-2 text-[2.6rem] leading-none font-bold tabular-nums tracking-[-0.03em]"
                     style={st.accent ? { color: RUST } : undefined}>
                  <Counter target={st.value} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* track micro-ledger */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 pb-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {TRACK_ORDER.filter(t => (s.by_track[t] ?? 0) > 0).map(t => (
              <div key={t} className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-[2px]" style={{ background: TRACK_COLOR[t] }} />
                <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-[#444A55]">{t}</span>
                <span className="font-mono text-[13px] font-bold tabular-nums text-[#16181D]">{s.by_track[t]}</span>
              </div>
            ))}
            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-[#5B616B]">· {trackCount} tracks</span>
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <div className="space-y-16 md:space-y-24">
          <WP4Overview registry={registry} />
          <WP4RealAIBoard registry={registry} />
          <WP4Pipeline registry={registry} />
          <WP4Guides registry={registry} />
          <WP4StatusViews registry={registry} />
          <WP4Explorer registry={registry} />
        </div>

        <footer className="mt-24 pt-8 border-t border-[#E7E7EA] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: RUST }}>
              About this tool
            </div>
            <p className="text-[14.5px] leading-relaxed text-[#444A55]">
              The Learning Event registry is the wiki Master List ({registry.data_sources.wiki.master_total ?? 455} LEs);
              SharePoint is where material is dropped against it. RealAI&apos;s LEs carry full wiki content +
              completeness analysis; the daily monitor routes new drops to the responsible teammate.
              Generated {new Date(registry.generated_at).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}.
            </p>
          </div>
          <Link href="/experiments/panoraima/wps/wp3"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#16181D] hover:gap-2.5 transition-all">
            WP3 competences <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </footer>
      </main>
    </div>
  )
}
