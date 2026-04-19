"use client"

import { useState } from "react"
import type { WpThemeCount, WpStakeholderCount } from "@/lib/panoraima/types"

interface Props {
  themes: WpThemeCount[]
  stakeholders: WpStakeholderCount[]
  color: string
}

const STAKEHOLDER_LABELS: Record<string, string> = {
  academia: "Academia",
  industry: "Industry",
  sme: "SMEs",
  public_sector: "Public sector",
  ngo: "NGOs",
  ecosystem: "Ecosystem",
}

export default function ThemeCloud({ themes, stakeholders, color }: Props) {
  const [lens, setLens] = useState<"themes" | "stakeholders">("themes")

  const data = lens === "themes"
    ? themes.slice(0, 14)
    : stakeholders.map((s) => ({ theme: STAKEHOLDER_LABELS[s.type] || s.type, count: s.count }))

  const max = Math.max(1, ...data.map((d) => d.count))

  return (
    <section>
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
            Corpus analysis
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
            What the whole corpus talks about
          </h2>
          <p className="mt-1 text-sm text-gray-500 max-w-xl">
            Keyword distribution across all documents. Toggle to see the stakeholder types
            most frequently referenced across the evidence.
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 text-[11px] font-semibold">
          <button
            onClick={() => setLens("themes")}
            className={`px-3 py-1 rounded transition-colors ${
              lens === "themes" ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50"
            }`}
          >
            Themes
          </button>
          <button
            onClick={() => setLens("stakeholders")}
            className={`px-3 py-1 rounded transition-colors ${
              lens === "stakeholders" ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50"
            }`}
          >
            Stakeholders
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 p-6 md:p-8">
        <div className="space-y-3">
          {data.map((d, i) => {
            const pct = (d.count / max) * 100
            return (
              <div key={d.theme} className="group flex items-center gap-4">
                <div className="w-32 md:w-44 flex-shrink-0 text-sm font-medium text-navy-900 text-right">
                  {d.theme}
                </div>
                <div className="flex-1 relative h-7 bg-gray-50 rounded-md overflow-hidden">
                  <div
                    className="h-full rounded-md transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color}ee, ${color}aa)`,
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                  <span
                    className="absolute inset-y-0 left-3 flex items-center text-[11px] font-mono font-bold text-white mix-blend-difference"
                    style={{ textShadow: "0 0 2px rgba(0,0,0,0.4)" }}
                  >
                    {d.count}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
