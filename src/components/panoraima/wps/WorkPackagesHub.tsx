"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { WpHubMeta } from "@/lib/panoraima/types"
import WPCard from "./WPCard"

interface Props {
  meta: WpHubMeta
}

export default function WorkPackagesHub({ meta }: Props) {
  // Hide WP1 from this hub (it has its own consortium dashboard)
  const wps = meta.wps.filter((w) => w.wp !== "WP1")

  const activeCount = wps.filter((w) => w.status === "active").length
  const totalFiles = wps.reduce((n, w) => n + (w.stats?.total_files ?? 0), 0)
  const totalDeliverables = wps.reduce((n, w) => n + (w.deliverable_count ?? 0), 0)

  return (
    <div className="relative min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 pt-24 md:pt-32 pb-12 md:pb-16">
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.4), transparent 45%), radial-gradient(circle at 80% 60%, rgba(201, 169, 110, 0.25), transparent 45%), radial-gradient(circle at 50% 100%, rgba(56, 92, 145, 0.3), transparent 45%)",
          }}
        />
        <div aria-hidden className="absolute inset-0 noise-overlay" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href="/experiments/panoraima"
            className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-navy-100/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to consortium view
          </Link>

          <span className="animate-fade-up inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 border border-gold-500/30 bg-gold-500/5 mb-5">
            Work packages · Deep dive
          </span>

          <h1 className="animate-fade-up delay-100 text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.05] mb-4">
            Six streams of work, <span className="gradient-text">one project</span>
          </h1>
          <p className="animate-fade-up delay-200 text-base md:text-lg text-navy-100/75 leading-relaxed max-w-2xl">
            PANORAIMA runs six active work packages beyond project management. Each one owns a
            slice of the mission — from market research in four countries to responsible-AI
            ethics to consortium-wide dissemination. Pick a card to dive in.
          </p>

          {/* Mini stats */}
          <div className="animate-fade-up delay-300 mt-10 flex flex-wrap gap-6 md:gap-10">
            {[
              { label: "Active WPs", value: activeCount, of: wps.length },
              { label: "Files analysed", value: totalFiles },
              { label: "Deliverables", value: totalDeliverables },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-100/60">
                  {s.label}
                </div>
                <div className="mt-1 text-3xl md:text-4xl font-bold text-white tabular-nums">
                  {s.value}
                  {s.of != null && (
                    <span className="text-lg font-semibold text-navy-100/50 ml-1">
                      / {s.of}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {wps.map((w, i) => (
            <WPCard key={w.wp} entry={w} delay={i * 80} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600 mb-2">
            About this hub
          </div>
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
            Auto-generated from the consortium SharePoint. Each WP folder is walked, classified
            by task, stakeholder region and document type, then summarised into a dashboard.
            Re-run <code className="font-mono text-gray-700">refresh-panoraima.sh --wps=WP2</code>{" "}
            to refresh any single package; the rest are left untouched.
          </p>
        </div>
      </section>
    </div>
  )
}
