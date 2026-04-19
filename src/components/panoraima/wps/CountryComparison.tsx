"use client"

import { useState } from "react"
import { Quote, FileText, Tag } from "lucide-react"
import type { WpRegionSummary } from "@/lib/panoraima/types"

interface Props {
  regions: WpRegionSummary[]
  color: string
}

const FLAGS: Record<string, string> = {
  Greece: "🇬🇷",
  Germany: "🇩🇪",
  Ireland: "🇮🇪",
  Netherlands: "🇳🇱",
}

export default function CountryComparison({ regions, color }: Props) {
  const [active, setActive] = useState<string>(regions[0]?.region ?? "")

  if (regions.length === 0) return null

  const current = regions.find((r) => r.region === active) ?? regions[0]

  return (
    <section>
      <div className="mb-5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Country lens
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          What each working group surfaced
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          Four country working groups, four different emphases. Pick a country to see its
          dominant themes and pull quotes.
        </p>
      </div>

      {/* Country tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {regions.map((r) => {
          const isActive = r.region === current.region
          return (
            <button
              key={r.region}
              onClick={() => setActive(r.region)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                isActive
                  ? "bg-navy-900 text-white border-navy-900 shadow-md"
                  : "bg-white text-navy-700 border-gray-200 hover:border-navy-200 hover:bg-navy-50"
              }`}
            >
              <span className="text-lg" aria-hidden>{FLAGS[r.region] || "🌍"}</span>
              <span className="font-semibold text-sm">{r.region}</span>
              <span
                className={`text-[10px] font-mono tabular-nums ${
                  isActive ? "text-gold-300" : "text-gray-400"
                }`}
              >
                {r.file_count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1fr] gap-5">
        {/* Left — themes */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-navy-600" />
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-navy-900">
              Dominant themes
            </h3>
          </div>
          {current.top_themes.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No themes detected yet.</p>
          ) : (
            <div className="space-y-3">
              {current.top_themes.map((t) => {
                const max = current.top_themes[0].count
                const pct = (t.count / max) * 100
                return (
                  <div key={t.theme} className="flex items-center gap-3">
                    <div className="w-36 text-sm text-navy-800 font-medium text-right">
                      {t.theme}
                    </div>
                    <div className="flex-1 h-5 bg-gray-50 rounded-md overflow-hidden relative">
                      <div
                        className="h-full rounded-md transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}dd, ${color}88)`,
                        }}
                      />
                      <span className="absolute inset-y-0 left-2.5 flex items-center text-[10px] font-mono font-bold text-white" style={{ mixBlendMode: "difference" }}>
                        {t.count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right — quotes */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <Quote className="w-4 h-4 text-navy-600" />
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-navy-900">
              Pull quotes
            </h3>
          </div>
          {current.quotes.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No pull quotes extracted yet from {current.region}&apos;s documents.
            </p>
          ) : (
            <div className="space-y-4">
              {current.quotes.map((q, i) => (
                <div key={i} className="relative pl-5 border-l-2 border-gold-300">
                  <Quote
                    className="w-3 h-3 text-gold-500 absolute -left-[7px] top-1 bg-white"
                    aria-hidden
                  />
                  <p className="text-[13px] text-navy-800 italic leading-relaxed">
                    &ldquo;{q.text}&rdquo;
                  </p>
                  {q.source_file && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
                      <FileText className="w-3 h-3" />
                      <span className="truncate">{q.source_file}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
