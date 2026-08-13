"use client"

import Link from "next/link"
import { ArrowLeft, ExternalLink, Layers, FileText } from "lucide-react"
import type { Task23Detail } from "@/lib/panoraima/types"
import T23Hero from "./T23Hero"
import T23TaskBrief from "./T23TaskBrief"
import T23Landscape from "./T23Landscape"
import T23Roadmaps from "./T23Roadmaps"
import T23StatusMatrix from "./T23StatusMatrix"
import T23HcaimLegacy from "./T23HcaimLegacy"

interface Props {
  detail: Task23Detail
}

export default function T23Dashboard({ detail }: Props) {
  return (
    <div className="relative min-h-screen bg-[#F7F8FA]">
      <T23Hero detail={detail} />

      <div className="relative z-20 -mt-24 max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#051C2C]/85 backdrop-blur-md border border-white/10 px-4 md:px-5 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/experiments/panoraima/wps"
              className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65 hover:text-[#7DA0FF] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All WPs
            </Link>
            <Link
              href="/experiments/panoraima/wps/wp2"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65 hover:text-[#7DA0FF] transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              WP2 overview
            </Link>
            <Link
              href="/experiments/panoraima/wps/wp2/t21"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65 hover:text-[#7DA0FF] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              T2.1
            </Link>
            <Link
              href="/experiments/panoraima/wps/wp2/t22"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65 hover:text-[#7DA0FF] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              T2.2
            </Link>
          </div>
          <Link
            href="/experiments/panoraima"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65 hover:text-[#7DA0FF] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Consortium view
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-24 pt-10">
        <div className="space-y-16 md:space-y-20">
          <section className="animate-fade-up">
            <T23TaskBrief detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T23Landscape detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T23Roadmaps detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T23StatusMatrix detail={detail} />
          </section>

          <section className="animate-fade-up">
            <T23HcaimLegacy detail={detail} />
          </section>

          {/* Document inventory — inline since there are only 2 files */}
          <section className="animate-fade-up">
            <div className="mb-6">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2251FF] border border-[#C9D4FF] bg-[#EEF2FF]">
                Source files
              </span>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-[#0A1F33]">
                Everything T2.3 is built on
              </h2>
              <p className="mt-1 text-sm text-[#51607A] max-w-xl">
                Just two documents, the HAW task-brief deck and the
                &ldquo;ausgef&uuml;llt&rdquo; (filled-in) partner status
                spreadsheet.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {detail.catalogue.map(entry => (
                <div
                  key={entry.rel_path}
                  className="rounded-xl border border-[#E3E7ED] bg-white p-5 flex items-start gap-3 hover:border-[#C9D4FF] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] text-[#2251FF] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2251FF]">
                      {entry.bucket}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-[#0A1F33] leading-tight break-all">
                      {entry.file}
                    </div>
                    <div className="mt-1 text-[11px] font-mono tabular-nums text-[#97A0AD]">
                      {entry.ext.toUpperCase()} · {entry.kb} KB · {entry.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="pt-10 border-t border-[#E3E7ED]">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2251FF] mb-1">
              About this deep-dive
            </div>
            <p className="text-sm text-[#51607A] leading-relaxed max-w-2xl">
              Extracted from the PANORAIMA SharePoint{" "}
              <code className="font-mono text-[#0A1F33]">WP2 / Task 2.3</code> folder
              by a task-specific parser that reads the 4-slide HAW task brief
              and the 8-partner accreditation status register. Each partner&apos;s
              own words about its local accreditation pathway are preserved
              verbatim.
              Generated&nbsp;
              {new Date(detail.generated_at).toLocaleDateString("en-GB", {
                year: "numeric", month: "short", day: "numeric",
              })}.
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
