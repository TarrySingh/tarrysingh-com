"use client"

import { useState } from "react"
import type { Task21Detail } from "@/lib/panoraima/types"
import {
  INK,
  SLATE,
  MUTE,
  FAINT,
  LINE,
  SURFACE,
  COBALT,
  OK,
  WARN,
  BAD,
  KICKER,
} from "../../../consortiumTokens"

interface Props {
  detail: Task21Detail
}

// Heuristic radar axes — these 7 competence areas are pulled from D2.1.
// Each sector gets a vector score on each axis (0-100).
// Scores are derived from D2.1 emphasis: explicit mentions + sector lists.
const AXES = [
  "Technical ML",
  "AI Literacy",
  "Ethics & Governance",
  "Explainability",
  "Risk & Compliance",
  "Data Governance",
  "Prompt Engineering",
]

const SECTOR_SCORES: Record<string, Record<string, number>> = {
  "Healthcare & Life Sciences": {
    "Technical ML":        90,
    "AI Literacy":         75,
    "Ethics & Governance": 85,
    "Explainability":      90,
    "Risk & Compliance":   85,
    "Data Governance":     90,
    "Prompt Engineering":  50,
  },
  "Management & Finance": {
    "Technical ML":        85,
    "AI Literacy":         80,
    "Ethics & Governance": 70,
    "Explainability":      75,
    "Risk & Compliance":   85,
    "Data Governance":     85,
    "Prompt Engineering":  70,
  },
  "Law & Compliance": {
    "Technical ML":        40,
    "AI Literacy":         80,
    "Ethics & Governance": 95,
    "Explainability":      90,
    "Risk & Compliance":   95,
    "Data Governance":     80,
    "Prompt Engineering":  55,
  },
  "Media & Culture": {
    "Technical ML":        55,
    "AI Literacy":         85,
    "Ethics & Governance": 80,
    "Explainability":      70,
    "Risk & Compliance":   65,
    "Data Governance":     70,
    "Prompt Engineering":  80,
  },
}

const SECTOR_COLORS: Record<string, string> = {
  "Healthcare & Life Sciences": OK,
  "Management & Finance":       COBALT,
  "Law & Compliance":           BAD,
  "Media & Culture":            WARN,
}

export default function T21SectorRadars({ detail }: Props) {
  const [focus, setFocus] = useState<string | null>(null)

  const sectors = Object.keys(SECTOR_SCORES)
  const size = 320
  const center = size / 2
  const radius = center - 40

  const axisPoint = (angle: number, r: number) => ({
    x: center + r * Math.cos(angle - Math.PI / 2),
    y: center + r * Math.sin(angle - Math.PI / 2),
  })

  return (
    <section>
      <div className="mb-5">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full border ${KICKER}`}
          style={{ color: COBALT, borderColor: LINE, background: SURFACE }}
        >
          Sector skill demands
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
          Different sectors, different skill demands
        </h2>
        <p className="mt-1 text-sm max-w-xl" style={{ color: MUTE }}>
          Seven competence axes scored per sector based on D2.1&apos;s emphasis.
          Hover a sector to highlight its vector; click to drill into its notes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-6">
        {/* Radar */}
        <div
          className="rounded-2xl bg-white border p-4 flex items-center justify-center"
          style={{ borderColor: LINE }}
        >
          <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
            {/* Gridlines */}
            {[0.25, 0.5, 0.75, 1].map((factor, i) => {
              const pts = AXES.map((_, j) => {
                const a = (j / AXES.length) * 2 * Math.PI
                return axisPoint(a, radius * factor)
              })
              return (
                <polygon
                  key={i}
                  points={pts.map(p => `${p.x},${p.y}`).join(" ")}
                  fill={i === 3 ? SURFACE : "none"}
                  stroke={LINE}
                  strokeWidth={0.8}
                />
              )
            })}
            {/* Axis lines */}
            {AXES.map((_, j) => {
              const a = (j / AXES.length) * 2 * Math.PI
              const end = axisPoint(a, radius)
              return (
                <line
                  key={j}
                  x1={center} y1={center}
                  x2={end.x} y2={end.y}
                  stroke={LINE} strokeWidth={0.8}
                />
              )
            })}
            {/* Axis labels */}
            {AXES.map((axis, j) => {
              const a = (j / AXES.length) * 2 * Math.PI
              const p = axisPoint(a, radius + 16)
              return (
                <text
                  key={j}
                  x={p.x} y={p.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={9}
                  fontWeight="600"
                  fill={FAINT}
                >
                  {axis}
                </text>
              )
            })}

            {/* Sector polygons */}
            {sectors.map(s => {
              const isFocused = focus === s
              const dim = focus && !isFocused
              const pts = AXES.map((axis, j) => {
                const a = (j / AXES.length) * 2 * Math.PI
                const val = SECTOR_SCORES[s][axis] / 100
                return axisPoint(a, radius * val)
              })
              return (
                <g
                  key={s}
                  onMouseEnter={() => setFocus(s)}
                  onMouseLeave={() => setFocus(null)}
                  style={{
                    opacity: dim ? 0.15 : 1,
                    transition: "opacity 0.3s",
                    cursor: "pointer",
                  }}
                >
                  <polygon
                    points={pts.map(p => `${p.x},${p.y}`).join(" ")}
                    fill={SECTOR_COLORS[s]}
                    fillOpacity={isFocused ? 0.35 : 0.18}
                    stroke={SECTOR_COLORS[s]}
                    strokeWidth={isFocused ? 2.5 : 1.5}
                    style={{ transition: "fill-opacity 0.3s, stroke-width 0.3s" }}
                  />
                  {isFocused && pts.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={SECTOR_COLORS[s]} />
                  ))}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Legend + detail */}
        <div className="space-y-2">
          {sectors.map(s => {
            const isFocused = focus === s
            const scores = SECTOR_SCORES[s]
            const topAxes = Object.entries(scores)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([a]) => a)
            return (
              <button
                key={s}
                onMouseEnter={() => setFocus(s)}
                onMouseLeave={() => setFocus(null)}
                className="w-full text-left rounded-xl border p-4 transition-all"
                style={{
                  borderColor: isFocused ? "#C9D4FF" : LINE,
                  background: isFocused ? "#EEF2FF" : "#fff",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: SECTOR_COLORS[s] }}
                  />
                  <span className="font-semibold text-sm" style={{ color: INK }}>{s}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {topAxes.map(a => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        background: `${SECTOR_COLORS[s]}15`,
                        color: SECTOR_COLORS[s],
                      }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11.5px] leading-snug line-clamp-2" style={{ color: SLATE }}>
                  Top priorities: {topAxes.join(", ")}. See D2.1 §{sectors.indexOf(s) + 3}
                  &nbsp;for the sector-specific training plan.
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {detail.deliverable.sectors.length > 0 && (
        <div className="mt-4 text-[11px] font-mono" style={{ color: FAINT }}>
          Source: D2.1 sector sections · competence axes derived heuristically
          from the deliverable&apos;s skill lists.
        </div>
      )}
    </section>
  )
}
