"use client"

import { History, AlertCircle, HelpCircle } from "lucide-react"
import type { Task23Detail } from "@/lib/panoraima/types"
import {
  INK,
  SLATE,
  MUTE,
  FAINT,
  LINE,
  SURFACE,
  COBALT,
  COBALT_SOFT,
  COBALT_LINE,
  NAVY,
  BAD,
} from "../../../consortiumTokens"

interface Props {
  detail: Task23Detail
}

export default function T23HcaimLegacy({ detail }: Props) {
  const hc = detail.hcaim_legacy

  return (
    <section>
      <div className="mb-6">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: MUTE, border: `1px solid ${LINE}`, background: SURFACE }}
        >
          Open question · HCAIM legacy
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
          Can we reuse what HCAIM already built?
        </h2>
        <p className="mt-1 text-sm max-w-xl" style={{ color: MUTE }}>
          A shortcut through the accreditation maze, if the consortium can
          decide whether to extend HCAIM&apos;s Masters programme or launch
          PANORAIMA as a greenfield one.
        </p>
      </div>

      <div
        className="rounded-3xl p-6 md:p-8"
        style={{ border: `1px solid ${COBALT_LINE}`, background: COBALT_SOFT }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-11 h-11 rounded-xl text-white flex items-center justify-center flex-shrink-0"
            style={{ background: COBALT }}
          >
            <History className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold leading-tight" style={{ color: INK }}>
              {hc.name}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: SLATE }}>
              {hc.description}
            </p>
          </div>
        </div>

        {/* Flagged-by quotes */}
        <div className="grid md:grid-cols-2 gap-3 mb-5">
          {hc.flagged_by.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-4"
              style={{ border: `1px solid ${LINE}` }}
            >
              <div
                className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] mb-2"
                style={{ color: SLATE }}
              >
                <AlertCircle className="w-3 h-3" style={{ color: BAD }} />
                Flagged by, {f.who}
              </div>
              <p className="text-[13px] italic leading-relaxed" style={{ color: SLATE }}>
                &ldquo;{f.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* Open question callout */}
        <div
          className="rounded-2xl text-white p-5 md:p-6 flex items-start gap-4"
          style={{ background: NAVY }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: COBALT }}
          >
            <HelpCircle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5"
              style={{ color: "#7DA0FF" }}
            >
              The open question
            </div>
            <p className="text-[14.5px] leading-relaxed text-white/90">
              {hc.open_question}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
