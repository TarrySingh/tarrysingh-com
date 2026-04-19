"use client"

import { useState } from "react"
import { Quote, Sparkles, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import type { WpQuote } from "@/lib/panoraima/types"

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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
            Key findings
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
            What the research actually says
          </h2>
          <p className="mt-1 text-sm text-gray-500 max-w-xl">
            Pull-quotes from the deliverable and direct field quotes from focus-group
            interviews. Use arrows (or the filter) to browse.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 text-[11px] font-semibold">
            {(["all", "finding", "quote"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setIdx(0) }}
                className={`px-3 py-1 rounded transition-colors capitalize ${
                  filter === f ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50"
                }`}
              >
                {f === "all" ? "All" : f === "finding" ? "Findings" : "Field quotes"}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-mono text-gray-400 tabular-nums">
            {visible + 1} / {filtered.length}
          </span>
          <button
            onClick={() => setIdx((i) => (i - 1 + filtered.length) % filtered.length)}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 text-navy-600 hover:bg-navy-50 transition flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % filtered.length)}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 text-navy-600 hover:bg-navy-50 transition flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Big quote card */}
      <div
        className="relative rounded-3xl p-8 md:p-12 overflow-hidden shadow-xl"
        style={{
          background:
            `linear-gradient(135deg, #0A1628 0%, ${color}ee 120%)`,
        }}
      >
        <div
          aria-hidden
          className="absolute -top-24 -right-20 w-96 h-96 rounded-full opacity-20"
          style={{ background: `radial-gradient(${color}, transparent 60%)` }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-5 text-gold-300">
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
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2 text-[11px] text-navy-100/60">
              <FileText className="w-3.5 h-3.5" />
              <span className="font-mono truncate">{quote.source_file}</span>
              {quote.task && (
                <>
                  <span className="text-navy-100/30">·</span>
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
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === visible ? "bg-navy-900 w-6" : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to quote ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
