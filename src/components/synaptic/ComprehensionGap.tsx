"use client"

import { useMemo, useState } from "react"
import {
  COMPREHENSION_ARIA_LABEL,
  COMPREHENSION_PLATE_MARKER,
  COMPREHENSION_HEADER_EYEBROW,
  COMPREHENSION_TITLE,
  COMPREHENSION_LOG_SCALE_LABEL,
  COMPREHENSION_LEGEND_COMPLEXITY,
  COMPREHENSION_LEGEND_COMPREHENSION,
  COMPREHENSION_LEGEND_GAP,
  COMPREHENSION_PANEL_YEAR_PREFIX,
  COMPREHENSION_PANEL_COMPLEXITY_LABEL,
  COMPREHENSION_PANEL_COMPREHENSION_LABEL,
  COMPREHENSION_FOOTER,
  COMPREHENSION_ERAS as ERAS,
} from "@/lib/synaptic/comprehension-gap-content"

const VW = 1200
const VH = 820
const PAD_TOP = 168
const PAD_BOTTOM = 156
const PAD_LEFT = 100
const PAD_RIGHT = 380
const PLOT_W = VW - PAD_LEFT - PAD_RIGHT
const PLOT_H = VH - PAD_TOP - PAD_BOTTOM
const MIN_LOG = 0
const MAX_LOG = Math.log10(50000)

const PANEL_X = VW - PAD_RIGHT + 32
const PANEL_W = PAD_RIGHT - 64
const PANEL_PAD = 24
const PANEL_INNER_W = PANEL_W - PANEL_PAD * 2

const yForVal = (v: number) => {
  const l = Math.log10(Math.max(v, 1))
  const t = (l - MIN_LOG) / (MAX_LOG - MIN_LOG)
  return PAD_TOP + PLOT_H - t * PLOT_H
}
const xForYear = (y: number) => {
  const t = (y - 1970) / (2030 - 1970)
  return PAD_LEFT + t * PLOT_W
}

export function ComprehensionGap() {
  const [hover, setHover] = useState<number | null>(null)
  const [pinned, setPinned] = useState<number>(6)
  const idx = hover ?? pinned
  const active = ERAS[idx]

  const complexityPath = useMemo(
    () =>
      ERAS.map(
        (e, i) => `${i === 0 ? "M" : "L"} ${xForYear(e.year)} ${yForVal(e.complexity)}`,
      ).join(" "),
    [],
  )
  const comprehensionPath = useMemo(
    () =>
      ERAS.map(
        (e, i) =>
          `${i === 0 ? "M" : "L"} ${xForYear(e.year)} ${yForVal(e.comprehension)}`,
      ).join(" "),
    [],
  )
  const gapArea = useMemo(() => {
    const top = ERAS.map((e) => `${xForYear(e.year)},${yForVal(e.complexity)}`).join(" ")
    const bot = ERAS.slice()
      .reverse()
      .map((e) => `${xForYear(e.year)},${yForVal(e.comprehension)}`)
      .join(" ")
    return `${top} ${bot}`
  }, [])

  return (
    <figure className="syn-symphony">
      <div
        className="rounded-[var(--radius-card)] border"
        style={{
          borderColor: "rgba(200,180,255,0.22)",
          background:
            "linear-gradient(180deg, rgba(28,38,80,0.92), rgba(14,20,45,0.96))",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="block h-auto w-full"
          role="img"
          aria-label={COMPREHENSION_ARIA_LABEL}
        >
          <defs>
            <linearGradient id="syn-gap-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a2154" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="syn-gap-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c98e4f" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#c98e4f" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="syn-gap-complex" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f4c482" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffd596" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="syn-gap-comp" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6cb4c2" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#9bd0d8" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-gap-bg)" />

          {/* studio header — row 1: plate marker */}
          <text
            x={PAD_LEFT}
            y={42}
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={13}
            letterSpacing={4}
            fill="rgba(220,200,160,0.85)"
          >
            {COMPREHENSION_PLATE_MARKER}
          </text>
          <text
            x={VW - PAD_LEFT}
            y={42}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            letterSpacing={3}
            fill="rgba(220,200,160,0.65)"
          >
            {COMPREHENSION_HEADER_EYEBROW}
          </text>
          <line
            x1={PAD_LEFT}
            x2={VW - PAD_LEFT}
            y1={58}
            y2={58}
            stroke="rgba(220,200,160,0.35)"
            strokeWidth={0.8}
          />
          {/* studio header — row 2: title */}
          <text
            x={PAD_LEFT}
            y={108}
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={42}
            fill="var(--ink)"
            letterSpacing={1.5}
          >
            {COMPREHENSION_TITLE}
          </text>

          {/* y-axis log gridlines */}
          {[1, 10, 100, 1000, 10000, 100000].map((tick) => {
            if (Math.log10(tick) > MAX_LOG + 0.1) return null
            const y = yForVal(tick)
            const label =
              tick === 1
                ? "1×"
                : tick >= 1000
                  ? `${tick / 1000}k×`
                  : `${tick}×`
            return (
              <g key={`y-${tick}`}>
                <line
                  x1={PAD_LEFT}
                  x2={VW - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="rgba(220,200,160,0.10)"
                  strokeWidth={0.6}
                />
                <text
                  x={PAD_LEFT - 14}
                  y={y + 4}
                  textAnchor="end"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={12}
                  fill="rgba(220,200,160,0.7)"
                  letterSpacing={1.5}
                >
                  {label}
                </text>
              </g>
            )
          })}
          <text
            x={PAD_LEFT - 14}
            y={PAD_TOP - 18}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            letterSpacing={2}
            fill="rgba(220,200,160,0.55)"
          >
            {COMPREHENSION_LOG_SCALE_LABEL}
          </text>

          {/* gap shaded area */}
          <polygon points={gapArea} fill="url(#syn-gap-fill)" />

          {/* comprehension line */}
          <path
            d={comprehensionPath}
            fill="none"
            stroke="url(#syn-gap-comp)"
            strokeWidth={2.2}
            strokeOpacity={0.95}
          />

          {/* complexity line */}
          <path
            d={complexityPath}
            fill="none"
            stroke="url(#syn-gap-complex)"
            strokeWidth={2.6}
            strokeOpacity={1}
          />

          {/* x-axis decade tick marks */}
          {ERAS.map((e) => {
            const x = xForYear(e.year)
            return (
              <line
                key={`xt-${e.year}`}
                x1={x}
                x2={x}
                y1={PAD_TOP + PLOT_H}
                y2={PAD_TOP + PLOT_H + 6}
                stroke="rgba(220,200,160,0.4)"
                strokeWidth={0.8}
              />
            )
          })}

          {/* era markers — minimal inline labels to avoid collisions; full detail lives in the side panel */}
          {ERAS.map((e, i) => {
            const x = xForYear(e.year)
            const cy = yForVal(e.complexity)
            const my = yForVal(e.comprehension)
            const isActive = idx === i
            const isMilestone = e.year === 2025 || e.year === 2026
            const labelHere = isActive

            // Year labels — keep 2025/2026 on one row each to avoid stacking collisions
            const yearY = VH - PAD_BOTTOM + 26

            return (
              <g
                key={`era-${e.year}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setPinned(i)}
                style={{ cursor: "pointer" }}
              >
                {/* hit column */}
                <rect
                  x={x - PLOT_W / (ERAS.length * 2)}
                  y={PAD_TOP - 12}
                  width={PLOT_W / ERAS.length}
                  height={PLOT_H + 24}
                  fill="transparent"
                />
                {/* active scrub line */}
                {isActive ? (
                  <line
                    x1={x}
                    x2={x}
                    y1={PAD_TOP}
                    y2={PAD_TOP + PLOT_H}
                    stroke="rgba(255,210,150,0.55)"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                  />
                ) : null}
                {/* dots on each line */}
                <circle
                  cx={x}
                  cy={cy}
                  r={isActive ? 9 : isMilestone ? 7 : 4}
                  fill="#ffd596"
                  stroke="#0d1027"
                  strokeWidth={2}
                />
                <circle
                  cx={x}
                  cy={my}
                  r={isActive ? 7 : isMilestone ? 5 : 3.5}
                  fill="#9bd0d8"
                  stroke="#0d1027"
                  strokeWidth={2}
                />
                {/* connector at milestone */}
                {isMilestone ? (
                  <line
                    x1={x}
                    x2={x}
                    y1={my}
                    y2={cy}
                    stroke="rgba(255,210,150,0.45)"
                    strokeWidth={1}
                  />
                ) : null}
                {/* year label */}
                <text
                  x={x}
                  y={yearY}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={isMilestone ? 13 : 12}
                  fill={isActive ? "var(--ink)" : "rgba(220,200,160,0.7)"}
                  letterSpacing={1.5}
                >
                  {e.year}
                </text>
                {/* compact era label below the year — only when active */}
                {labelHere ? (
                  <text
                    x={x}
                    y={VH - PAD_BOTTOM + 46}
                    textAnchor={
                      i < 2 ? "start" : i > ERAS.length - 3 ? "end" : "middle"
                    }
                    fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
                    fontStyle="italic"
                    fontSize={13}
                    fill="#ffd596"
                  >
                    {e.era}
                  </text>
                ) : null}
              </g>
            )
          })}

          {/* legend */}
          <g transform={`translate(${PAD_LEFT}, ${VH - 26})`}>
            <line x1={0} x2={28} y1={0} y2={0} stroke="url(#syn-gap-complex)" strokeWidth={2.6} />
            <text
              x={36}
              y={4}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={12}
              letterSpacing={2}
              fill="rgba(220,200,160,0.78)"
            >
              {COMPREHENSION_LEGEND_COMPLEXITY}
            </text>
            <line x1={224} x2={252} y1={0} y2={0} stroke="url(#syn-gap-comp)" strokeWidth={2.2} />
            <text
              x={260}
              y={4}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={12}
              letterSpacing={2}
              fill="rgba(220,200,160,0.78)"
            >
              {COMPREHENSION_LEGEND_COMPREHENSION}
            </text>
            <rect x={500} y={-8} width={18} height={14} fill="url(#syn-gap-fill)" />
            <text
              x={526}
              y={4}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={12}
              letterSpacing={2}
              fill="rgba(220,200,160,0.78)"
            >
              {COMPREHENSION_LEGEND_GAP}
            </text>
          </g>

          {/* side panel — active era */}
          <g transform={`translate(${PANEL_X}, ${PAD_TOP - 56})`}>
            <rect
              x={0}
              y={0}
              width={PANEL_W}
              height={PLOT_H + 110}
              rx={10}
              fill="rgba(13,16,39,0.7)"
              stroke="rgba(255,210,150,0.35)"
              strokeWidth={1.2}
            />
            <text
              x={PANEL_PAD}
              y={36}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={3}
              fill="rgba(220,200,160,0.65)"
            >
              {COMPREHENSION_PANEL_YEAR_PREFIX}{active.year}
            </text>
            <foreignObject
              x={PANEL_PAD}
              y={50}
              width={PANEL_INNER_W}
              height={88}
            >
              <div
                style={{
                  fontFamily: "var(--font-display), Gloock, serif",
                  fontSize: "22px",
                  lineHeight: 1.15,
                  letterSpacing: "0.01em",
                  color: "var(--ink)",
                }}
              >
                {active.era}
              </div>
            </foreignObject>
            <g transform={`translate(${PANEL_PAD}, 154)`}>
              <text
                fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                fontSize={10}
                letterSpacing={2}
                fill="rgba(220,200,160,0.55)"
              >
                {COMPREHENSION_PANEL_COMPLEXITY_LABEL}
              </text>
              <text
                y={32}
                fontFamily="var(--font-display), Gloock, serif"
                fontSize={32}
                fill="#ffd596"
                letterSpacing={1}
              >
                {active.complexity.toLocaleString()}×
              </text>
            </g>
            <g transform={`translate(${PANEL_PAD}, 214)`}>
              <text
                fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                fontSize={10}
                letterSpacing={2}
                fill="rgba(220,200,160,0.55)"
              >
                {COMPREHENSION_PANEL_COMPREHENSION_LABEL}
              </text>
              <text
                y={32}
                fontFamily="var(--font-display), Gloock, serif"
                fontSize={32}
                fill="#9bd0d8"
                letterSpacing={1}
              >
                {active.comprehension.toFixed(2)}×
              </text>
            </g>
            <line
              x1={PANEL_PAD}
              x2={PANEL_W - PANEL_PAD}
              y1={272}
              y2={272}
              stroke="rgba(220,200,160,0.25)"
              strokeWidth={0.6}
            />
            <foreignObject
              x={PANEL_PAD}
              y={288}
              width={PANEL_INNER_W}
              height={PLOT_H - 120}
            >
              <div
                style={{
                  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                  fontSize: "13.5px",
                  lineHeight: 1.6,
                  color: "var(--ink-cool)",
                }}
              >
                {active.detail}
                {active.source ? (
                  <div
                    style={{
                      marginTop: "12px",
                      fontFamily:
                        "var(--font-mono), 'IBM Plex Mono', monospace",
                      fontSize: "11px",
                      letterSpacing: "1.5px",
                      color: "rgba(220,200,160,0.65)",
                    }}
                  >
                    {active.source}
                  </div>
                ) : null}
              </div>
            </foreignObject>
          </g>
        </svg>

        <div
          className="border-t px-6 py-4"
          style={{
            borderColor: "rgba(200,180,255,0.16)",
            color: "var(--ink-cool)",
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            fontStyle: "italic",
            fontSize: "0.98rem",
            lineHeight: 1.5,
          }}
        >
          {COMPREHENSION_FOOTER}
        </div>
      </div>
    </figure>
  )
}
