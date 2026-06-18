"use client"

import { useState } from "react"
import type { WpThemeCount, WpStakeholderCount } from "@/lib/panoraima/types"
import { INK, SLATE, FAINT, LINE, SURFACE, NAVY, KICKER } from "../consortiumTokens"

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
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full border ${KICKER}`}
            style={{ color: FAINT, borderColor: LINE, background: SURFACE }}
          >
            Corpus analysis
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
            What the whole corpus talks about
          </h2>
          <p className="mt-1 text-sm max-w-xl" style={{ color: SLATE }}>
            Keyword distribution across all documents. Toggle to see the stakeholder types
            most frequently referenced across the evidence.
          </p>
        </div>
        <div
          className="flex rounded-lg border bg-white p-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ borderColor: LINE }}
        >
          <button
            onClick={() => setLens("themes")}
            className="px-3 py-1 rounded transition-colors"
            style={
              lens === "themes"
                ? { background: NAVY, color: "#fff" }
                : { color: SLATE }
            }
          >
            Themes
          </button>
          <button
            onClick={() => setLens("stakeholders")}
            className="px-3 py-1 rounded transition-colors"
            style={
              lens === "stakeholders"
                ? { background: NAVY, color: "#fff" }
                : { color: SLATE }
            }
          >
            Stakeholders
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border p-6 md:p-8" style={{ borderColor: LINE }}>
        <div className="space-y-3">
          {data.map((d, i) => {
            const pct = (d.count / max) * 100
            return (
              <div key={d.theme} className="group flex items-center gap-4">
                <div
                  className="w-32 md:w-44 flex-shrink-0 text-sm font-medium text-right"
                  style={{ color: INK }}
                >
                  {d.theme}
                </div>
                <div
                  className="flex-1 relative h-7 rounded-md overflow-hidden"
                  style={{ background: SURFACE }}
                >
                  <div
                    className="h-full rounded-md transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: color,
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                  <span
                    className="absolute inset-y-0 left-3 flex items-center text-[11px] font-mono font-bold tabular-nums text-white mix-blend-difference"
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
