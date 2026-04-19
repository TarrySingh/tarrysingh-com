"use client"

import { FileText, Target, Package, MapPin } from "lucide-react"
import type { WorkPackageDetail } from "@/lib/panoraima/types"

interface Props {
  detail: WorkPackageDetail
}

export default function WPHero({ detail }: Props) {
  const totalFiles = detail.stats?.total_files ?? 0
  const deliverables = detail.tasks.reduce((n, t) => n + (t.deliverables?.length ?? 0), 0)
  const regions = Object.keys(detail.stats?.by_region ?? {}).length
  const tasks = detail.tasks.filter((t) => t.id.startsWith("T")).length

  return (
    <section className="relative overflow-hidden bg-navy-950 pt-24 md:pt-32 pb-16 md:pb-20">
      <div
        aria-hidden
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(circle at 18% 28%, ${detail.color}40, transparent 45%),
                       radial-gradient(circle at 78% 64%, rgba(201, 169, 110, 0.28), transparent 45%),
                       radial-gradient(circle at 52% 98%, rgba(56, 92, 145, 0.22), transparent 45%)`,
        }}
      />
      <div aria-hidden className="absolute inset-0 noise-overlay" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-semibold text-white"
            style={{ background: detail.color }}
            aria-hidden
          >
            {detail.emoji}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400 border border-gold-500/30 bg-gold-500/5">
            {detail.wp} · Work package
          </span>
        </div>

        <h1 className="animate-fade-up delay-100 text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-4 max-w-3xl">
          {detail.name}
        </h1>
        <p className="animate-fade-up delay-200 text-base md:text-lg text-navy-100/80 leading-relaxed max-w-2xl">
          {detail.description}
        </p>

        <div className="animate-fade-up delay-300 mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Files analysed", value: totalFiles, icon: FileText, accent: "from-sky-400 to-sky-600" },
            { label: "Tasks", value: tasks, icon: Target, accent: "from-gold-400 to-gold-600" },
            { label: "Deliverables", value: deliverables, icon: Package, accent: "from-emerald-400 to-emerald-600" },
            { label: "Regions", value: regions, icon: MapPin, accent: "from-rose-400 to-rose-600" },
          ].map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-5 md:p-6 hover:bg-white/10 transition-colors"
            >
              <div
                className={`absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r ${s.accent} opacity-70`}
              />
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-100/60">
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </div>
              <div className="mt-2 text-3xl md:text-4xl font-bold text-white tabular-nums">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}
