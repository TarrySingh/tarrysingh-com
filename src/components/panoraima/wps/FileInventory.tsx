"use client"

import { useMemo, useState } from "react"
import type { WpStats } from "@/lib/panoraima/types"

interface Props {
  stats: WpStats
  color: string
}

// Canonical palette for file types (subdued so it never competes with the page chrome)
const EXT_COLORS: Record<string, string> = {
  ".pdf":  "#ef4444",
  ".docx": "#2563eb",
  ".pptx": "#f59e0b",
  ".xlsx": "#10b981",
  ".rtf":  "#6366f1",
  ".potx": "#f97316",
  ".docm": "#1d4ed8",
  ".odt":  "#7c3aed",
  ".mp4":  "#db2777",
  ".mp3":  "#a21caf",
  ".vtt":  "#0ea5e9",
  ".txt":  "#4b5563",
}

const TYPE_LABELS: Record<string, string> = {
  deliverable:  "Deliverables",
  focus_group:  "Focus groups",
  meeting:      "Meetings",
  research:     "Research",
  presentation: "Presentations",
  admin:        "Admin",
  template:     "Templates",
  other:        "Other",
}

function DonutChart({
  data,
  size = 180,
  thickness = 26,
}: {
  data: { label: string; value: number; color: string }[]
  size?: number
  thickness?: number
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  let offset = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="File type distribution">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={thickness} />
      {data.map((d, i) => {
        const frac = d.value / total
        const len = frac * circumference
        const dasharray = `${len} ${circumference - len}`
        const segment = (
          <circle
            key={d.label}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth={thickness}
            strokeDasharray={dasharray}
            strokeDashoffset={-offset}
            style={{
              transformOrigin: "center",
              transform: "rotate(-90deg)",
              transition: "stroke-dasharray 0.6s ease",
            }}
          />
        )
        offset += len
        return segment
      })}
      <text
        x={center}
        y={center - 6}
        textAnchor="middle"
        className="fill-navy-900"
        style={{ fontSize: 28, fontWeight: 700 }}
      >
        {total}
      </text>
      <text
        x={center}
        y={center + 14}
        textAnchor="middle"
        className="fill-gray-400"
        style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}
      >
        files
      </text>
    </svg>
  )
}

export default function FileInventory({ stats, color }: Props) {
  const [lens, setLens] = useState<"ext" | "type">("ext")

  const data = useMemo(() => {
    if (lens === "ext") {
      return Object.entries(stats.by_ext || {})
        .filter(([, n]) => n > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([k, v]) => ({ label: k, value: v, color: EXT_COLORS[k] || "#9ca3af" }))
    }
    return Object.entries(stats.by_type || {})
      .filter(([, n]) => n > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([k, v], i) => ({
        label: TYPE_LABELS[k] || k,
        value: v,
        color: [
          color,
          "#2563eb",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#7c3aed",
          "#0ea5e9",
          "#6b7280",
        ][i % 8],
      }))
  }, [stats, lens, color])

  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
            File inventory
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
            What&apos;s in the folder
          </h2>
          <p className="mt-1 text-sm text-gray-500 max-w-xl">
            {stats.total_files} files across the whole work package. Toggle the lens to see
            format (pdf / docx / …) or purpose (deliverable / meeting / research / …).
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 text-[11px] font-semibold">
          <button
            onClick={() => setLens("ext")}
            className={`px-3 py-1 rounded transition-colors ${
              lens === "ext" ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50"
            }`}
          >
            By format
          </button>
          <button
            onClick={() => setLens("type")}
            className={`px-3 py-1 rounded transition-colors ${
              lens === "type" ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50"
            }`}
          >
            By purpose
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8 md:gap-12 items-center">
          <div className="flex justify-center">
            <DonutChart data={data} size={200} thickness={30} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {data.map((d) => {
              const pct = Math.round((d.value / (stats.total_files || 1)) * 100)
              return (
                <div
                  key={d.label}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-sm font-medium text-navy-900 truncate">
                      {d.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 flex-shrink-0">
                    <span className="text-sm font-bold tabular-nums text-navy-900">
                      {d.value}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
