"use client"

import Link from "next/link"
import { ArrowLeft, ExternalLink, Layers } from "lucide-react"
import type { Task22Detail } from "@/lib/panoraima/types"
import T22Hero from "./T22Hero"
import T22Protocol from "./T22Protocol"
import T22EthicsTrail from "./T22EthicsTrail"
import T22Participants from "./T22Participants"
import T22Questions from "./T22Questions"
import T22Findings from "./T22Findings"
import T22SkillsRanked from "./T22SkillsRanked"
import T22PedagogicFramework from "./T22PedagogicFramework"
import T22DesktopResearch from "./T22DesktopResearch"

interface Props {
  detail: Task22Detail
}

export default function T22Dashboard({ detail }: Props) {
  return (
    <div className="relative min-h-screen bg-[#F7F8FA]">
      <T22Hero detail={detail} />

      {/* Toolbar pinned on hero bottom */}
      <div className="relative z-20 -mt-24 max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#051C2C]/80 backdrop-blur-md border border-white/10 px-4 md:px-5 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/experiments/panoraima/wps"
              className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 hover:text-[#7DA0FF] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All WPs
            </Link>
            <Link
              href="/experiments/panoraima/wps/wp2"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 hover:text-[#7DA0FF] transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              WP2 overview
            </Link>
            <Link
              href="/experiments/panoraima/wps/wp2/t21"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 hover:text-[#7DA0FF] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              T2.1 deep-dive
            </Link>
          </div>
          <Link
            href="/experiments/panoraima"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 hover:text-[#7DA0FF] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Consortium view
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-24 pt-10">
        <div className="space-y-16 md:space-y-20">
          <section className="animate-fade-up">
            <T22Protocol detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T22EthicsTrail detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T22Participants detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T22Questions detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T22Findings detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T22SkillsRanked detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T22PedagogicFramework detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T22DesktopResearch detail={detail} />
          </section>

          <footer className="pt-10 border-t border-[#E3E7ED]">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2251FF] mb-1">
              About this deep-dive
            </div>
            <p className="text-sm text-[#51607A] leading-relaxed max-w-2xl">
              Extracted from the PANORAIMA SharePoint{" "}
              <code className="font-mono text-[#0A1F33]">WP2 / Task 2.2</code> folder by
              a task-specific parser that reads the UNIWA research protocol, the
              ethics application trail, the 42-row participant register, the
              two-hour Mentimeter focus-group report, the{" "}
              {detail.pedagogic_framework.source_slide_count}-slide pedagogic
              framework deck and the 4-paper desktop research library. Total
              source: {detail.kpis.file_count} files across 8 partner
              universities.
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
