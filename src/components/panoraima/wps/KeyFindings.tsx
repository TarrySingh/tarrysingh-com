"use client"

import { useState } from "react"
import { Quote, Sparkles, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import type { WpQuote } from "@/lib/panoraima/types"
import { NAVY, INK, SLATE, MUTE, FAINT, LINE, SURFACE, COBALT, COBALT_SOFT } from "../consortiumTokens"

interface Props {
  findings: WpQuote[]
  regionQuotes: WpQuote[]
  deliverableName?: string | null
  color: string
}

type Filter = "all" | "quote" | "finding"

export default function KeyFindings({ findings, regionQuotes, deliverableName, color }: Props) {
  const [filter, setFilter] = useState<Filter>("all")
  const [idx, setIdx] = useState(0)

  // Merge findings from D2.1 with region-sourced quotes
  const all: WpQuote[] = [
    ...findings.map((f) => ({ ...f, source_file: f.source_file || deliverableName || undefined })),
    ...regionQuotes,
  ]
  const filtered = filter === "all" ? all : all.filter((q) => q.kind === filter)

  if (filtered.length === 0) {
    return null
  }

  const visible = idx >= filtered.length ? 0 : idx
  const quote = filtered[visible]

  return (
    <section>
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
        <div>
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: MUTE, border: `1px solid ${LINE}`, background: SURFACE }}
          >
            Key findings
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
            What the research actually says
          </h2>
          <p className="mt-1 text-sm max-w-xl" style={{ color: SLATE }}>
            Pull-quotes from the deliverable and direct field quotes from focus-group
            interviews. Use arrows (or the filter) to browse.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div
            className="flex rounded-lg p-0.5 font-mono text-[11px] font-semibold"
            style={{ border: `1px solid ${LINE}`, background: "#FFFFFF" }}
          >
            {(["all", "finding", "quote"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setIdx(0) }}
                className="px-3 py-1 rounded transition-colors capitalize"
                style={
                  filter === f
                    ? { background: NAVY, color: "#FFFFFF" }
                    : { color: SLATE }
                }
                onMouseEnter={(e) => { if (filter !== f) e.currentTarget.style.background = COBALT_SOFT }}
                onMouseLeave={(e) => { if (filter !== f) e.currentTarget.style.background = "transparent" }}
              >
                {f === "all" ? "All" : f === "finding" ? "Findings" : "Field quotes"}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-mono tabular-nums" style={{ color: FAINT }}>
            {visible + 1} / {filtered.length}
          </span>
          <button
            onClick={() => setIdx((i) => (i - 1 + filtered.length) % filtered.length)}
            className="w-9 h-9 rounded-full transition flex items-center justify-center"
            style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, color: SLATE }}
            onMouseEnter={(e) => { e.currentTarget.style.background = COBALT_SOFT; e.currentTarget.style.color = COBALT }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = SLATE }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % filtered.length)}
            className="w-9 h-9 rounded-full transition flex items-center justify-center"
            style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, color: SLATE }}
            onMouseEnter={(e) => { e.currentTarget.style.background = COBALT_SOFT; e.currentTarget.style.color = COBALT }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = SLATE }}
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Big quote card */}
      <div
        className="relative rounded-3xl p-8 md:p-12 overflow-hidden"
        style={{ background: NAVY }}
      >
        <div
          aria-hidden
          className="absolute -top-24 -right-20 w-96 h-96 rounded-full opacity-20"
          style={{ background: `radial-gradient(${color}, transparent 60%)` }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-5" style={{ color: "#7DA0FF" }}>
            {quote.kind === "finding" ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                  Finding from deliverable
                </span>
              </>
            ) : (
              <>
                <Quote className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                  Field interview
                </span>
              </>
            )}
          </div>

          <Quote className="w-10 h-10 text-white/10 mb-2" aria-hidden />
          <p className="text-lg md:text-2xl font-bold text-white leading-snug tracking-tight max-w-4xl">
            &ldquo;{quote.text}&rdquo;
          </p>

          {quote.source_file && (
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2 text-[11px] text-white/60">
              <FileText className="w-3.5 h-3.5" />
              <span className="font-mono truncate">{quote.source_file}</span>
              {quote.task && (
                <>
                  <span className="text-white/30">·</span>
                  <span>Task {quote.task}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dot indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {filtered.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === visible ? "w-6" : "w-1.5"}`}
            style={{ background: i === visible ? COBALT : LINE }}
            onMouseEnter={(e) => { if (i !== visible) e.currentTarget.style.background = MUTE }}
            onMouseLeave={(e) => { if (i !== visible) e.currentTarget.style.background = LINE }}
            aria-label={`Go to quote ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
