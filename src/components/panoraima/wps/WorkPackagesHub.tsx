"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { WpHubMeta, LargeFilesManifest } from "@/lib/panoraima/types"
import WPCard from "./WPCard"
import LargeFilesNotice from "./LargeFilesNotice"
import ConsortiumPlate from "../ConsortiumPlate"
import { NAVY, INK, SLATE, LINE, COBALT } from "../consortiumTokens"

interface Props {
  meta: WpHubMeta
  largeFiles?: LargeFilesManifest | null
}

export default function WorkPackagesHub({ meta, largeFiles }: Props) {
  // Hide WP1 from this hub (it has its own consortium dashboard)
  const wps = meta.wps.filter((w) => w.wp !== "WP1")

  const activeCount = wps.filter((w) => w.status === "active").length
  const totalFiles = wps.reduce((n, w) => n + (w.stats?.total_files ?? 0), 0)
  const totalDeliverables = wps.reduce((n, w) => n + (w.deliverable_count ?? 0), 0)

  return (
    <div className="relative min-h-screen bg-white">
      {/* Hero */}
      <section
        className="relative overflow-hidden pt-24 md:pt-32 pb-12 md:pb-16"
        style={{ backgroundColor: NAVY }}
      >
        {/* Cartographic consortium plate (whole-consortium WP overview → network on) */}
        <ConsortiumPlate variant="hero" className="absolute inset-0" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href="/experiments/panoraima"
            className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to consortium view
          </Link>

          <span
            className="animate-fade-up inline-flex items-center px-3 py-1 rounded-full font-mono text-[11px] font-semibold uppercase tracking-[0.2em] mb-5"
            style={{ color: "#7DA0FF", border: "1px solid rgba(125,160,255,0.3)", backgroundColor: "rgba(125,160,255,0.08)" }}
          >
            Work packages · Deep dive
          </span>

          <h1 className="animate-fade-up delay-100 text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.05] mb-4">
            Six streams of work, one project
          </h1>
          <p className="animate-fade-up delay-200 text-base md:text-lg text-white/70 leading-relaxed max-w-2xl">
            PANORAIMA runs six active work packages beyond project management. Each one owns a
            slice of the mission, from market research in four countries to responsible-AI
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
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                  {s.label}
                </div>
                <div className="mt-1 text-3xl md:text-4xl font-bold text-white tabular-nums">
                  {s.value}
                  {s.of != null && (
                    <span className="text-lg font-semibold text-white/45 ml-1">
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

        {/* Large files that live in SharePoint only (skipped by syncs) */}
        {largeFiles && <LargeFilesNotice manifest={largeFiles} />}

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t" style={{ borderColor: LINE }}>
          <div
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] mb-2"
            style={{ color: COBALT }}
          >
            About this hub
          </div>
          <p className="text-sm leading-relaxed max-w-2xl" style={{ color: SLATE }}>
            Auto-generated from the consortium SharePoint. Each WP folder is walked, classified
            by task, stakeholder region and document type, then summarised into a dashboard.
            Re-run <code className="font-mono" style={{ color: INK }}>refresh-panoraima.sh --wps=WP2</code>{" "}
            to refresh any single package; the rest are left untouched.
          </p>
        </div>
      </section>
    </div>
  )
}
