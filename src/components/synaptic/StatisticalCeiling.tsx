"use client"

import { useState } from "react"

type CeilingRow = {
  label: string
  detail: string
  headline: number
  filtered: number
  source: string
}

const ROWS: ReadonlyArray<CeilingRow> = [
  {
    label: "Claude Opus 4.5",
    detail: "first model across the 80 % line, SWE-bench Verified",
    headline: 80.9,
    filtered: 80.9,
    source: "Anthropic announcement · December 2025 · no independent re-evaluation yet",
  },
  {
    label: "SWE-agent 1.0 · Claude 3.5",
    detail: "headline vs filtered SWE-bench Verified",
    headline: 57.6,
    filtered: 31.8,
    source: "SWE-Bench+ · ICLR 2026 · removes solution leakage and weak test cases",
  },
  {
    label: "SWE-agent · leading config",
    detail: "headline vs filtered resolution rate",
    headline: 12.47,
    filtered: 3.97,
    source: "ICSE 2025 Companion · independent re-evaluation strips solution leakage",
  },
]

const PAD_TOP = 26
const PAD_BOTTOM = 60
const PAD_LEFT = 70
const PAD_RIGHT = 24
const VW = 600
const VH = 380
const PLOT_H = VH - PAD_TOP - PAD_BOTTOM
const PLOT_W = VW - PAD_LEFT - PAD_RIGHT
const BAR_GROUP_GAP = 18
const BAR_GAP = 6

export function StatisticalCeiling() {
  const [hover, setHover] = useState<{ row: number; series: "headline" | "filtered" } | null>(null)
  const active = hover ? ROWS[hover.row] : null

  const groupW = (PLOT_W - BAR_GROUP_GAP * (ROWS.length - 1)) / ROWS.length
  const barW = (groupW - BAR_GAP) / 2

  const yForPct = (pct: number) => PAD_TOP + PLOT_H - (pct / 100) * PLOT_H

  return (
    <figure className="syn-symphony">
      <div
        className="rounded-[var(--radius-tight)] border p-4"
        style={{
          borderColor: "rgba(200,180,255,0.18)",
          background:
            "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Statistical ceiling — SWE-bench Verified headline scores against independently re-evaluated resolution rates. Claude Opus 4.5 reaches 80.9 %; SWE-agent configurations collapse from 57.6 % to 31.8 % and from 12.47 % to 3.97 % under filtered re-evaluation."
        >
          <defs>
            <linearGradient id="syn-ceiling-headline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd596" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#c98e4f" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="syn-ceiling-filtered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8b8ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#5a4a8a" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* y-axis gridlines + labels at 0 / 25 / 50 / 75 / 100 */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = yForPct(tick)
            return (
              <g key={`y-${tick}`}>
                <line
                  x1={PAD_LEFT}
                  x2={VW - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="rgba(220,200,160,0.14)"
                  strokeWidth={tick === 0 ? 1 : 0.6}
                />
                <text
                  x={PAD_LEFT - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={10}
                  fill="rgba(220,200,160,0.7)"
                  letterSpacing={1}
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {/* 80 % ceiling guide-line */}
          <line
            x1={PAD_LEFT}
            x2={VW - PAD_RIGHT}
            y1={yForPct(80)}
            y2={yForPct(80)}
            stroke="#ffd596"
            strokeOpacity={0.45}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <text
            x={VW - PAD_RIGHT}
            y={yForPct(80) - 6}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={10}
            fill="#ffd596"
            letterSpacing={1}
          >
            CEILING ≈ 80 %
          </text>

          {/* bar groups */}
          {ROWS.map((r, i) => {
            const groupX = PAD_LEFT + i * (groupW + BAR_GROUP_GAP)
            const hX = groupX
            const fX = groupX + barW + BAR_GAP
            const hY = yForPct(r.headline)
            const fY = yForPct(r.filtered)
            const hH = PAD_TOP + PLOT_H - hY
            const fH = PAD_TOP + PLOT_H - fY
            const isHActive = hover?.row === i && hover.series === "headline"
            const isFActive = hover?.row === i && hover.series === "filtered"
            return (
              <g key={`row-${i}`}>
                {/* headline bar */}
                <rect
                  x={hX}
                  y={hY}
                  width={barW}
                  height={hH}
                  fill="url(#syn-ceiling-headline)"
                  opacity={isHActive ? 1 : 0.85}
                  onMouseEnter={() => setHover({ row: i, series: "headline" })}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                />
                <text
                  x={hX + barW / 2}
                  y={hY - 6}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={11}
                  fill="#ffd596"
                  letterSpacing={1}
                >
                  {r.headline.toFixed(r.headline % 1 === 0 ? 0 : 1)}
                </text>

                {/* filtered bar */}
                <rect
                  x={fX}
                  y={fY}
                  width={barW}
                  height={fH}
                  fill="url(#syn-ceiling-filtered)"
                  opacity={isFActive ? 1 : 0.85}
                  onMouseEnter={() => setHover({ row: i, series: "filtered" })}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                />
                <text
                  x={fX + barW / 2}
                  y={fY - 6}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={11}
                  fill="#c8b8ff"
                  letterSpacing={1}
                >
                  {r.filtered.toFixed(r.filtered % 1 === 0 ? 0 : 1)}
                </text>

                {/* x-axis label */}
                <text
                  x={groupX + groupW / 2}
                  y={VH - PAD_BOTTOM + 18}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={10}
                  fill="rgba(220,200,160,0.88)"
                  letterSpacing={1}
                >
                  {r.label}
                </text>
                <text
                  x={groupX + groupW / 2}
                  y={VH - PAD_BOTTOM + 32}
                  textAnchor="middle"
                  fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
                  fontStyle="italic"
                  fontSize={10}
                  fill="rgba(220,200,160,0.55)"
                >
                  {r.detail}
                </text>
              </g>
            )
          })}

          {/* legend */}
          <g transform={`translate(${PAD_LEFT}, ${VH - 12})`}>
            <rect x={0} y={-6} width={10} height={10} fill="url(#syn-ceiling-headline)" />
            <text
              x={16}
              y={3}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={10}
              fill="rgba(220,200,160,0.7)"
              letterSpacing={1}
            >
              HEADLINE
            </text>
            <rect x={88} y={-6} width={10} height={10} fill="url(#syn-ceiling-filtered)" />
            <text
              x={104}
              y={3}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={10}
              fill="rgba(220,200,160,0.7)"
              letterSpacing={1}
            >
              FILTERED
            </text>
          </g>
        </svg>

        {/* hover hint / source */}
        <div
          className="mt-3 px-1"
          style={{
            minHeight: "2.6em",
            color: "var(--ink-cool)",
            fontSize: "0.82rem",
            lineHeight: 1.4,
          }}
        >
          {active ? (
            <>
              <span
                className="syn-small-caps"
                style={{ color: "var(--ink-dim)", marginRight: "0.75rem" }}
              >
                {hover?.series === "headline" ? "Headline" : "Filtered"}
              </span>
              <span style={{ color: "var(--ink)" }}>{active.label}</span>
              <span style={{ color: "var(--ink-dim)" }}> · {active.source}</span>
            </>
          ) : (
            <span style={{ color: "var(--ink-dim)" }}>
              Hover any bar for the citation. Independent re-evaluations
              (ICSE 2025 Companion, ICLR 2026 SWE-Bench+) collapse SWE-bench
              headline scores by removing solution leakage and weak test cases.
            </span>
          )}
        </div>
      </div>
    </figure>
  )
}
