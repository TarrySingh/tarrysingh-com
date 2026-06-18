"use client"

import { useMemo, useState } from "react"
import type { WpStats } from "@/lib/panoraima/types"
import {
  INK,
  SLATE,
  MUTE,
  FAINT,
  LINE,
  LINE_SOFT,
  SURFACE,
  COBALT,
  COBALT_DK,
  OK,
  WARN,
  BAD,
} from "../consortiumTokens"

interface Props {
  stats: WpStats
  color: string
}

// Canonical palette for file types — desaturated to the corporate navy→cobalt→teal family
// (status hues reused for the few document classes that map cleanly to OK/WARN/BAD).
const EXT_COLORS: Record<string, string> = {
  ".pdf":  BAD,        // brick
  ".docx": COBALT,     // cobalt
  ".pptx": WARN,       // amber
  ".xlsx": OK,         // emerald
  ".rtf":  "#1C5286",  // navy-cobalt mid
  ".potx": WARN,       // amber
  ".docm": COBALT_DK,  // pressed cobalt
  ".odt":  "#143A63",  // deep navy
  ".mp4":  "#2E7FA6",  // teal-blue
  ".mp3":  "#36A08C",  // teal
  ".vtt":  "#2251FF",  // cobalt
  ".txt":  MUTE,       // muted slate
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
      <circle cx={center} cy={center} r={radius} fill="none" stroke={LINE_SOFT} strokeWidth={thickness} />
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
        fill={INK}
        className="tabular-nums"
        style={{ fontSize: 28, fontWeight: 700 }}
      >
        {total}
      </text>
      <text
        x={center}
        y={center + 14}
        textAnchor="middle"
        fill={FAINT}
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
        .map(([k, v]) => ({ label: k, value: v, color: EXT_COLORS[k] || FAINT }))
    }
    return Object.entries(stats.by_type || {})
      .filter(([, n]) => n > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([k, v], i) => ({
        label: TYPE_LABELS[k] || k,
        value: v,
        color: [
          color,
          COBALT,
          OK,
          WARN,
          BAD,
          "#143A63",
          "#2E7FA6",
          MUTE,
        ][i % 8],
      }))
  }, [stats, lens, color])

  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.18em] border"
            style={{ color: FAINT, borderColor: LINE, background: SURFACE }}
          >
            File inventory
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
            What&apos;s in the folder
          </h2>
          <p className="mt-1 text-sm max-w-xl" style={{ color: SLATE }}>
            {stats.total_files} files across the whole work package. Toggle the lens to see
            format (pdf / docx / …) or purpose (deliverable / meeting / research / …).
          </p>
        </div>
        <div
          className="flex rounded-lg border bg-white p-0.5 text-[11px] font-semibold"
          style={{ borderColor: LINE }}
        >
          <button
            onClick={() => setLens("ext")}
            className="px-3 py-1 rounded transition-colors"
            style={
              lens === "ext"
                ? { background: COBALT, color: "#fff" }
                : { color: SLATE }
            }
          >
            By format
          </button>
          <button
            onClick={() => setLens("type")}
            className="px-3 py-1 rounded transition-colors"
            style={
              lens === "type"
                ? { background: COBALT, color: "#fff" }
                : { color: SLATE }
            }
          >
            By purpose
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border p-6 md:p-8" style={{ borderColor: LINE }}>
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
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors hover:border-[#C9D4FF]"
                  style={{ borderColor: LINE_SOFT }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-sm font-medium truncate" style={{ color: INK }}>
                      {d.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 flex-shrink-0">
                    <span className="text-sm font-bold tabular-nums" style={{ color: INK }}>
                      {d.value}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums" style={{ color: FAINT }}>
                      {pct}%
                    </span>
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
