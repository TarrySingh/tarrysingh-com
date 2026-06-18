"use client"

import { FileText, Target, Package, MapPin } from "lucide-react"
import type { WorkPackageDetail } from "@/lib/panoraima/types"
import ConsortiumPlate from "../ConsortiumPlate"
import { KICKER, NUM } from "../consortiumTokens"

interface Props {
  detail: WorkPackageDetail
}

export default function WPHero({ detail }: Props) {
  const totalFiles = detail.stats?.total_files ?? 0
  const deliverables = detail.tasks.reduce((n, t) => n + (t.deliverables?.length ?? 0), 0)
  const regions = Object.keys(detail.stats?.by_region ?? {}).length
  const tasks = detail.tasks.filter((t) => t.id.startsWith("T")).length

  return (
    <section className="relative overflow-hidden bg-[#051C2C] pt-24 md:pt-32 pb-16 md:pb-20">
      <ConsortiumPlate variant="hero" network={false} className="absolute inset-0" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-semibold text-white border border-white/15 bg-white/5"
            aria-hidden
          >
            {detail.emoji}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[#7DA0FF] border border-[#2251FF]/40 bg-[#2251FF]/10 ${KICKER}`}>
            {detail.wp} · Work package
          </span>
        </div>

        <h1 className="animate-fade-up delay-100 text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-4 max-w-3xl">
          {detail.name}
        </h1>
        <p className="animate-fade-up delay-200 text-base md:text-lg text-white/70 leading-relaxed max-w-2xl">
          {detail.description}
        </p>

        <div className="animate-fade-up delay-300 mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Files analysed", value: totalFiles, icon: FileText },
            { label: "Tasks", value: tasks, icon: Target },
            { label: "Deliverables", value: deliverables, icon: Package },
            { label: "Regions", value: regions, icon: MapPin },
          ].map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm p-5 md:p-6 hover:bg-white/10 transition-colors"
            >
              <div className="absolute top-0 left-0 h-[2px] w-full bg-[#2251FF] opacity-70" />
              <div className={`flex items-center gap-2 text-white/55 ${KICKER}`}>
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </div>
              <div className={`mt-2 text-3xl md:text-4xl font-bold text-white ${NUM}`}>
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
