"use client"

import { useMemo, useState } from "react"
import type { PartnerCode, TimelineEvent } from "@/lib/panoraima/types"
import { PARTNERS, WORK_PACKAGES } from "@/lib/panoraima/types"
import { wpActivityByEvent } from "./helpers"

interface Props {
  events: TimelineEvent[]
  onEventClick: (id: string) => void
}

export default function WorkPackageLens({ events, onEventClick }: Props) {
  const [focusedWp, setFocusedWp] = useState<string | null>(null)

  const series = useMemo(() => wpActivityByEvent(events.filter(e => e.has_progress_reports)), [events])

  const maxVal = Math.max(
    ...series.flatMap(s => WORK_PACKAGES.map(wp => (s as Record<string, number | string>)[wp.id] as number))
  ) || 1

  // Aggregate: which partners mentioned each WP most often
  const wpPartnerCounts = useMemo(() => {
    const counts: Record<string, Record<PartnerCode, number>> = {}
    WORK_PACKAGES.forEach(wp => {
      counts[wp.id] = Object.fromEntries(PARTNERS.map(p => [p.code, 0])) as Record<PartnerCode, number>
    })
    events.forEach(e => {
      Object.entries(e.partners).forEach(([code, p]) => {
        if (p.submitted && p.wp_focus) {
          p.wp_focus.forEach(w => {
            if (counts[w]) counts[w][code as PartnerCode] = (counts[w][code as PartnerCode] ?? 0) + 1
          })
        }
      })
    })
    return counts
  }, [events])

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
            Work package lens
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
            Which work packages moved when
          </h2>
          <p className="mt-1 text-sm text-gray-500 max-w-xl">
            Each band shows how many partners reported activity on that WP. Hover a WP name to focus.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-[200px,1fr] gap-6">
        {/* Legend */}
        <div className="space-y-2">
          {WORK_PACKAGES.map(wp => {
            const dim = focusedWp && focusedWp !== wp.id
            const total = Object.values(wpPartnerCounts[wp.id] || {}).reduce((a, b) => a + b, 0)
            return (
              <button
                key={wp.id}
                onMouseEnter={() => setFocusedWp(wp.id)}
                onMouseLeave={() => setFocusedWp(null)}
                className={`w-full text-left rounded-lg border border-gray-100 p-3 transition-all ${
                  dim ? "opacity-40" : "opacity-100"
                } ${focusedWp === wp.id ? "bg-navy-50 border-navy-200" : "bg-white hover:bg-gray-50"}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{ background: wp.color }}
                  />
                  <span className="font-mono text-xs font-bold text-navy-900">{wp.id}</span>
                  <span className="ml-auto text-[10px] font-mono text-gray-400">
                    {total}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 mt-1 leading-tight">{wp.name}</div>
              </button>
            )
          })}
        </div>

        {/* Stacked area chart */}
        <div className="relative rounded-2xl bg-white border border-gray-100 p-6">
          <svg viewBox="0 0 800 280" className="w-full h-auto" preserveAspectRatio="none">
            <defs>
              {WORK_PACKAGES.map(wp => (
                <linearGradient key={wp.id} id={`grad-${wp.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={wp.color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={wp.color} stopOpacity="0.35" />
                </linearGradient>
              ))}
            </defs>

            {/* Horizontal gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map(pct => (
              <line
                key={pct}
                x1="0" x2="800"
                y1={240 - pct * 220}
                y2={240 - pct * 220}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            ))}

            {/* Plot each WP as a band */}
            {WORK_PACKAGES.map((wp, wpIdx) => {
              const dim = focusedWp && focusedWp !== wp.id
              const points = series.map((s, i) => {
                const val = (s as Record<string, number | string>)[wp.id] as number
                const x = (i / Math.max(1, series.length - 1)) * 800
                const y = 240 - (val / maxVal) * 220
                return { x, y, val }
              })
              // Create smooth path
              const pathD = points.reduce((acc, p, i) => {
                if (i === 0) return `M ${p.x} ${p.y}`
                const prev = points[i - 1]
                const cpX = (prev.x + p.x) / 2
                return `${acc} Q ${cpX} ${prev.y} ${cpX} ${(prev.y + p.y) / 2} T ${p.x} ${p.y}`
              }, "")
              const areaD = `${pathD} L ${points[points.length - 1].x} 240 L ${points[0].x} 240 Z`

              return (
                <g
                  key={wp.id}
                  style={{
                    opacity: dim ? 0.1 : 0.88,
                    transition: "opacity 0.25s",
                  }}
                >
                  <path d={areaD} fill={`url(#grad-${wp.id})`} />
                  <path d={pathD} fill="none" stroke={wp.color} strokeWidth="1.5" />
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x} cy={p.y} r={focusedWp === wp.id ? 4 : 2.5}
                      fill="white"
                      stroke={wp.color}
                      strokeWidth="1.5"
                      style={{ transition: "r 0.2s" }}
                    />
                  ))}
                </g>
              )
            })}

            {/* Event labels */}
            {series.map((s, i) => {
              const x = (i / Math.max(1, series.length - 1)) * 800
              return (
                <g key={s.event}>
                  <line x1={x} y1={240} x2={x} y2={248} stroke="#cbd5e1" />
                  <text
                    x={x}
                    y={268}
                    fontSize="10"
                    fontFamily="monospace"
                    fill="#64748b"
                    textAnchor="middle"
                    style={{ cursor: "pointer" }}
                    onClick={() => onEventClick(s.event)}
                  >
                    {s.label.replace(" ", "\u00a0")}
                  </text>
                </g>
              )
            })}
          </svg>
          <div className="mt-3 text-[11px] text-gray-400 text-center">
            y-axis: partners active in WP ·{" "}
            <span className="text-gray-500">click month to open that event</span>
          </div>
        </div>
      </div>
    </div>
  )
}
