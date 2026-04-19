"use client"

import Link from "next/link"
import { ArrowLeft, ExternalLink, Layers } from "lucide-react"
import type { Task21Detail } from "@/lib/panoraima/types"
import T21Hero from "./T21Hero"
import T21Deliverable from "./T21Deliverable"
import T21Methodology from "./T21Methodology"
import T21StakeholderMatrix from "./T21StakeholderMatrix"
import T21SectorRadars from "./T21SectorRadars"
import T21EmergingRoles from "./T21EmergingRoles"
import T21EvidenceLibrary from "./T21EvidenceLibrary"
import T21VideoVault from "./T21VideoVault"

interface Props {
  detail: Task21Detail
}

export default function T21Dashboard({ detail }: Props) {
  return (
    <div className="relative min-h-screen bg-white">
      <T21Hero detail={detail} />

      {/* Toolbar pinned on hero bottom */}
      <div className="relative z-20 -mt-24 max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-navy-950/60 backdrop-blur-md border border-white/10 shadow-xl px-4 md:px-5 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/experiments/panoraima/wps"
              className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All WPs
            </Link>
            <Link
              href="/experiments/panoraima/wps/wp2"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              WP2 overview
            </Link>
          </div>
          <Link
            href="/experiments/panoraima"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Consortium view
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-24 pt-10">
        <div className="space-y-16 md:space-y-20">
          <section className="animate-fade-up">
            <T21Deliverable detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T21Methodology detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T21StakeholderMatrix detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T21SectorRadars detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T21EmergingRoles detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T21EvidenceLibrary detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T21VideoVault detail={detail} />
          </section>

          <footer className="pt-10 border-t border-gray-100">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600 mb-1">
              About this deep-dive
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
              Extracted from the PANORAIMA SharePoint{" "}
              <code className="font-mono text-gray-700">WP2 / Task 2.1</code> folder by
              a task-specific parser that reads the published Deliverable 2.1 PDF,
              the Irish stakeholder register xlsx, each working group&apos;s native
              artefacts and the 54-paper desktop research library.
              Generated&nbsp;{new Date(detail.generated_at).toLocaleDateString("en-GB", {
                year: "numeric", month: "short", day: "numeric",
              })}.
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
