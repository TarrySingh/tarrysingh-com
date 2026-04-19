"use client"

import { History, AlertCircle, HelpCircle } from "lucide-react"
import type { Task23Detail } from "@/lib/panoraima/types"

interface Props {
  detail: Task23Detail
}

export default function T23HcaimLegacy({ detail }: Props) {
  const hc = detail.hcaim_legacy

  return (
    <section>
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Open question · HCAIM legacy
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          Can we reuse what HCAIM already built?
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          A shortcut through the accreditation maze — if the consortium can
          decide whether to extend HCAIM&apos;s Masters programme or launch
          PANORAIMA as a greenfield one.
        </p>
      </div>

      <div className="rounded-3xl border border-gold-200 bg-gradient-to-br from-gold-50/40 via-white to-navy-50/30 p-6 md:p-8">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gold-500 text-white flex items-center justify-center flex-shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-navy-900 leading-tight">
              {hc.name}
            </h3>
            <p className="mt-2 text-[13.5px] text-gray-700 leading-relaxed">
              {hc.description}
            </p>
          </div>
        </div>

        {/* Flagged-by quotes */}
        <div className="grid md:grid-cols-2 gap-3 mb-5">
          {hc.flagged_by.map((f, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-navy-500 mb-2">
                <AlertCircle className="w-3 h-3 text-rose-500" />
                Flagged by — {f.who}
              </div>
              <p className="text-[13px] text-gray-700 italic leading-relaxed">
                &ldquo;{f.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* Open question callout */}
        <div className="rounded-2xl bg-navy-900 text-white p-5 md:p-6 flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-gold-500 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-4 h-4 text-navy-900" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400 mb-1.5">
              The open question
            </div>
            <p className="text-[14.5px] leading-relaxed">
              {hc.open_question}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
