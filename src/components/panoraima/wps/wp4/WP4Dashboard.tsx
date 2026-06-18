"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Layers, BookOpen, Users, FolderOpen, Bell } from "lucide-react"
import type { Wp4Registry } from "@/lib/panoraima/types"
import { TRACK_ORDER, TRACK_COLOR } from "./wp4constants"
import WP4Overview from "./WP4Overview"
import WP4RealAIBoard from "./WP4RealAIBoard"
import WP4Pipeline from "./WP4Pipeline"
import WP4Guides from "./WP4Guides"
import WP4StatusViews from "./WP4StatusViews"
import WP4Explorer from "./WP4Explorer"

interface Props {
  registry: Wp4Registry
}

function Counter({ target, duration = 1300 }: { target: number; duration?: number }) {
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

  return (
    <div className="relative min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 pt-24 md:pt-32 pb-28">
        <div
          aria-hidden
          className="absolute inset-0 opacity-80"
          style={{
            background: `radial-gradient(circle at 18% 22%, rgba(16,185,129,0.4), transparent 46%),
                         radial-gradient(circle at 82% 60%, rgba(201,169,110,0.3), transparent 46%),
                         radial-gradient(circle at 50% 100%, rgba(56,92,145,0.25), transparent 46%)`,
          }}
        />
        <div aria-hidden className="absolute inset-0 noise-overlay" />

        {/* faint track ribbon */}
        <div aria-hidden className="absolute right-6 top-28 hidden md:flex flex-col gap-1.5 opacity-60">
          {TRACK_ORDER.map(t => {
            const n = s.by_track[t] ?? 0
            return (
              <div key={t} className="flex items-center gap-2 justify-end">
                <span className="text-[10px] font-mono text-white/50 tabular-nums">{n}</span>
                <div className="h-1.5 rounded-full" style={{ width: Math.max(12, n * 1.4), background: TRACK_COLOR[t] }} />
              </div>
            )
          })}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400 border border-gold-500/30 bg-gold-500/5">
              WP4 · Learning materials tool
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300 border border-emerald-400/25 bg-emerald-400/5">
              {registry.data_sources.wiki.status === "snapshot" ? "Wiki snapshot · Phase A" : "Live"}
            </span>
          </div>

          <h1 className="animate-fade-up delay-100 text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-5 max-w-3xl">
            <Counter target={s.total_les} /> learning events.
            <br />
            <span className="gradient-text"><Counter target={trackCount} /> tracks.</span>
            <br />
            <Counter target={s.realai.total} /> are RealAI&apos;s.
          </h1>
          <p className="animate-fade-up delay-200 text-base md:text-lg text-navy-100/80 leading-relaxed max-w-2xl">
            {registry.tagline} RealAI authors <strong className="text-white">{s.realai.author}</strong> and
            reviews <strong className="text-white">{s.realai.reviewer}</strong> — and the daily monitor
            pings the right teammate the moment new material lands.
          </p>

          <div className="animate-fade-up delay-300 mt-12 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {[
              { label: "Learning events", value: s.total_les,            icon: BookOpen },
              { label: "With materials",  value: s.with_materials,       icon: FolderOpen },
              { label: "Pending",         value: s.materials_pending,    icon: Layers },
              { label: "RealAI's",        value: s.realai.total,         icon: Users },
              { label: "Need action",     value: s.realai.needs_action,  icon: Bell },
            ].map(t => (
              <div key={t.label} className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-4 md:p-5 hover:bg-white/10 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-100/60">
                  <t.icon className="w-3 h-3" />
                  {t.label}
                </div>
                <div className="mt-1.5 text-2xl md:text-3xl font-bold text-white tabular-nums">
                  <Counter target={t.value} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
      </section>

      {/* Toolbar */}
      <div className="relative z-20 -mt-24 max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-navy-950/60 backdrop-blur-md border border-white/10 shadow-xl px-4 md:px-5 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/experiments/panoraima/wps" className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              All WPs
            </Link>
            <Link href="/experiments/panoraima/wps/wp3" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white transition-colors">
              <Layers className="w-3.5 h-3.5" />
              WP3 competences
            </Link>
          </div>
          <Link href="/experiments/panoraima" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            Consortium view
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-24 pt-10">
        <div className="space-y-16 md:space-y-20">
          <section className="animate-fade-up"><WP4Overview registry={registry} /></section>
          <section className="animate-fade-up"><WP4RealAIBoard registry={registry} /></section>
          <section className="animate-fade-up"><WP4Pipeline registry={registry} /></section>
          <section className="animate-fade-up"><WP4Guides registry={registry} /></section>
          <section className="animate-fade-up"><WP4StatusViews registry={registry} /></section>
          <section className="animate-fade-up"><WP4Explorer registry={registry} /></section>

          <footer className="pt-10 border-t border-gray-100">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600 mb-1">
              About this tool
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
              Built from the synced SharePoint <code className="font-mono text-gray-700">WP4</code> folder
              (Learning Materials, Lesson plans, per-track registries) merged on Learning-Event code with a
              snapshot of RealAI&apos;s commitments from the wiki Learning Event Master List.
              Phase B will pull all {registry.data_sources.wiki.master_list_total ?? 455} LE pages live via
              the MediaWiki API. Daily monitoring + alerts route new material to the responsible RealAI
              teammate.
              Generated&nbsp;{new Date(registry.generated_at).toLocaleDateString("en-GB", {
                year: "numeric", month: "short", day: "numeric",
              })}.
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
