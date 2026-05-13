"use client"

import { useState } from "react"

type Row = {
  id: string
  label: string
  detail: string
  headline: number
  filtered: number
  date: string
  source: string
}

const ROWS: ReadonlyArray<Row> = [
  {
    id: "opus45",
    label: "Claude Opus 4.5",
    detail: "first across the 80 % line",
    headline: 80.9,
    filtered: 80.9,
    date: "Dec 2025",
    source:
      "Anthropic announcement (December 2025). No independent re-evaluation has been published yet; the filtered bar is provisional.",
  },
  {
    id: "sweagent10",
    label: "SWE-agent 1.0 · Claude 3.5",
    detail: "headline vs. filtered",
    headline: 57.6,
    filtered: 31.8,
    date: "Mar 2026",
    source:
      "SWE-Bench+ at ICLR 2026 — filters solution leakage and weak test cases.",
  },
  {
    id: "sweagentlead",
    label: "SWE-agent · leading config",
    detail: "headline vs. re-evaluated",
    headline: 12.47,
    filtered: 3.97,
    date: "May 2025",
    source:
      "ICSE 2025 Companion · stripping solution leakage from a leading SWE-agent configuration.",
  },
]

const VW = 1200
const VH = 820
const PAD_TOP = 168
const PAD_BOTTOM = 156
const PAD_LEFT = 110
const PAD_RIGHT = 380
const PLOT_H = VH - PAD_TOP - PAD_BOTTOM
const PLOT_W = VW - PAD_LEFT - PAD_RIGHT
const GROUP_GAP = 56
const BAR_GAP = 18

const PANEL_X = VW - PAD_RIGHT + 32
const PANEL_W = PAD_RIGHT - 64
const PANEL_PAD = 24
const PANEL_INNER_W = PANEL_W - PANEL_PAD * 2

export function StatisticalCeiling() {
  const [hover, setHover] = useState<{ row: number; series: "h" | "f" } | null>(null)
  const [pinned, setPinned] = useState<{ row: number; series: "h" | "f" } | null>(
    { row: 1, series: "h" },
  )
  const sel = hover ?? pinned
  const active = sel ? ROWS[sel.row] : null

  const groupW = (PLOT_W - GROUP_GAP * (ROWS.length - 1)) / ROWS.length
  const barW = (groupW - BAR_GAP) / 2
  const yForPct = (p: number) => PAD_TOP + PLOT_H - (p / 100) * PLOT_H

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
          aria-label="The statistical ceiling — SWE-bench Verified headline scores against independent re-evaluation."
        >
          <defs>
            <linearGradient id="syn-sc-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a2154" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="syn-sc-head" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffe0a4" stopOpacity="1" />
              <stop offset="55%" stopColor="#f4c482" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#9e6a2c" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="syn-sc-filt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d8caff" stopOpacity="1" />
              <stop offset="55%" stopColor="#a698d4" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#3e3268" stopOpacity="0.95" />
            </linearGradient>
            <filter id="syn-sc-shadow" x="-20%" y="-20%" width="140%" height="160%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <pattern id="syn-sc-hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,210,150,0.45)" strokeWidth="1.2" />
            </pattern>
          </defs>

          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-sc-bg)" />

          {/* studio header — row 1: plate marker */}
          <text
            x={PAD_LEFT}
            y={42}
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={13}
            letterSpacing={4}
            fill="rgba(220,200,160,0.85)"
          >
            PLATE V · MMXXVI · FIG. 1.2.b
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
            SWE-BENCH VERIFIED · HEADLINE vs FILTERED
          </text>
          {/* hairline beneath the marker row */}
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
            The statistical ceiling
          </text>

          {/* y-axis gridlines */}
          {[0, 20, 40, 60, 80, 100].map((tick) => {
            const y = yForPct(tick)
            return (
              <g key={`y-${tick}`}>
                <line
                  x1={PAD_LEFT}
                  x2={VW - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="rgba(220,200,160,0.10)"
                  strokeWidth={tick === 0 ? 1.2 : 0.6}
                />
                <text
                  x={PAD_LEFT - 18}
                  y={y + 5}
                  textAnchor="end"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={13}
                  fill="rgba(220,200,160,0.7)"
                  letterSpacing={1.5}
                >
                  {tick}
                </text>
              </g>
            )
          })}
          <text
            x={PAD_LEFT - 18}
            y={PAD_TOP - 18}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            fill="rgba(220,200,160,0.55)"
            letterSpacing={2}
          >
            % RESOLVED
          </text>

          {/* 80 % ceiling band */}
          <rect
            x={PAD_LEFT}
            y={yForPct(80)}
            width={PLOT_W}
            height={Math.max(0, yForPct(0) - yForPct(80))}
            fill="url(#syn-sc-hatch)"
            opacity={0.08}
          />
          <line
            x1={PAD_LEFT}
            x2={VW - PAD_RIGHT}
            y1={yForPct(80)}
            y2={yForPct(80)}
            stroke="#ffd596"
            strokeOpacity={0.6}
            strokeWidth={1.4}
            strokeDasharray="6 4"
          />
          <text
            x={VW - PAD_RIGHT - 8}
            y={yForPct(80) - 10}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            fill="#ffd596"
            letterSpacing={2}
          >
            HEADLINE CEILING ≈ 80 %
          </text>

          {/* bar groups */}
          {ROWS.map((r, i) => {
            const gx = PAD_LEFT + i * (groupW + GROUP_GAP)
            const hx = gx
            const fx = gx + barW + BAR_GAP
            const hy = yForPct(r.headline)
            const fy = yForPct(r.filtered)
            const hH = PAD_TOP + PLOT_H - hy
            const fH = PAD_TOP + PLOT_H - fy
            const delta = r.headline - r.filtered
            const hActive = sel?.row === i && sel.series === "h"
            const fActive = sel?.row === i && sel.series === "f"
            const groupActive = sel?.row === i

            // Collapse-arrow vertical position: just above the lower bar's top
            const arrowY = Math.min(hy, fy) - 22

            return (
              <g key={`g-${r.id}`}>
                {/* group hover-zone */}
                <rect
                  x={gx - GROUP_GAP / 2}
                  y={PAD_TOP - 12}
                  width={groupW + GROUP_GAP}
                  height={PLOT_H + 24}
                  fill={groupActive ? "rgba(255,210,150,0.04)" : "transparent"}
                />

                {/* headline shadow */}
                <rect
                  x={hx + 2}
                  y={hy + 4}
                  width={barW}
                  height={hH}
                  fill="#000"
                  opacity={0.35}
                  filter="url(#syn-sc-shadow)"
                />
                {/* headline bar */}
                <rect
                  x={hx}
                  y={hy}
                  width={barW}
                  height={hH}
                  rx={2}
                  fill="url(#syn-sc-head)"
                  opacity={hActive ? 1 : 0.92}
                  onMouseEnter={() => setHover({ row: i, series: "h" })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setPinned({ row: i, series: "h" })}
                  style={{ cursor: "pointer" }}
                />
                <text
                  x={hx + barW / 2}
                  y={hy - 14}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={28}
                  fill="#ffd596"
                  letterSpacing={2}
                >
                  {r.headline.toFixed(r.headline % 1 === 0 ? 0 : 1)}
                </text>

                {/* filtered shadow */}
                <rect
                  x={fx + 2}
                  y={fy + 4}
                  width={barW}
                  height={fH}
                  fill="#000"
                  opacity={0.35}
                  filter="url(#syn-sc-shadow)"
                />
                {/* filtered bar */}
                <rect
                  x={fx}
                  y={fy}
                  width={barW}
                  height={fH}
                  rx={2}
                  fill="url(#syn-sc-filt)"
                  opacity={fActive ? 1 : 0.92}
                  onMouseEnter={() => setHover({ row: i, series: "f" })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setPinned({ row: i, series: "f" })}
                  style={{ cursor: "pointer" }}
                />
                <text
                  x={fx + barW / 2}
                  y={fy - 14}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={28}
                  fill="#d8caff"
                  letterSpacing={2}
                >
                  {r.filtered.toFixed(r.filtered % 1 === 0 ? 0 : 1)}
                </text>

                {/* collapse delta label — only when there's a real drop */}
                {delta > 1 ? (
                  <g opacity={groupActive ? 1 : 0.8}>
                    <text
                      x={(hx + fx + barW) / 2}
                      y={arrowY}
                      textAnchor="middle"
                      fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                      fontSize={13}
                      fill="#ffd596"
                      letterSpacing={2}
                    >
                      − {delta.toFixed(1)} PT
                    </text>
                  </g>
                ) : null}

                {/* x-axis: partner label */}
                <text
                  x={gx + groupW / 2}
                  y={VH - PAD_BOTTOM + 30}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={17}
                  fill={groupActive ? "var(--ink)" : "rgba(245,232,204,0.88)"}
                  letterSpacing={0.5}
                >
                  {r.label}
                </text>
                <text
                  x={gx + groupW / 2}
                  y={VH - PAD_BOTTOM + 52}
                  textAnchor="middle"
                  fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
                  fontStyle="italic"
                  fontSize={12}
                  fill="rgba(220,200,160,0.6)"
                >
                  {r.detail}
                </text>
                <text
                  x={gx + groupW / 2}
                  y={VH - PAD_BOTTOM + 72}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={11}
                  fill="rgba(220,200,160,0.45)"
                  letterSpacing={2}
                >
                  {r.date.toUpperCase()}
                </text>
              </g>
            )
          })}

          {/* legend at the very bottom */}
          <g transform={`translate(${PAD_LEFT}, ${VH - 26})`}>
            <rect x={0} y={-10} width={14} height={14} fill="url(#syn-sc-head)" />
            <text
              x={22}
              y={2}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={12}
              fill="rgba(220,200,160,0.78)"
              letterSpacing={2}
            >
              HEADLINE
            </text>
            <rect x={130} y={-10} width={14} height={14} fill="url(#syn-sc-filt)" />
            <text
              x={152}
              y={2}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={12}
              fill="rgba(220,200,160,0.78)"
              letterSpacing={2}
            >
              INDEPENDENTLY RE-EVALUATED
            </text>
          </g>

          {/* side annotation panel — title and source both use foreignObject so HTML can wrap */}
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
              MOVEMENT · {sel ? String(sel.row + 1).padStart(2, "0") : "00"}
            </text>
            {active ? (
              <>
                <foreignObject
                  x={PANEL_PAD}
                  y={50}
                  width={PANEL_INNER_W}
                  height={88}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display), Gloock, serif",
                      fontSize: "20px",
                      lineHeight: 1.15,
                      letterSpacing: "0.01em",
                      color: "var(--ink)",
                    }}
                  >
                    {active.label}
                  </div>
                </foreignObject>
                <text
                  x={PANEL_PAD}
                  y={156}
                  fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
                  fontStyle="italic"
                  fontSize={13}
                  fill="var(--symphony-amber)"
                >
                  {sel?.series === "h" ? "Headline score" : "After filtering"}
                </text>
                <text
                  x={PANEL_PAD}
                  y={216}
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={58}
                  fill={sel?.series === "h" ? "#ffd596" : "#d8caff"}
                  letterSpacing={2}
                >
                  {(sel?.series === "h" ? active.headline : active.filtered).toFixed(
                    1,
                  )}
                  <tspan fontSize={28} fill="rgba(220,200,160,0.7)">
                    {" "}%
                  </tspan>
                </text>
                <line
                  x1={PANEL_PAD}
                  x2={PANEL_W - PANEL_PAD}
                  y1={244}
                  y2={244}
                  stroke="rgba(220,200,160,0.25)"
                  strokeWidth={0.6}
                />
                <foreignObject
                  x={PANEL_PAD}
                  y={260}
                  width={PANEL_INNER_W}
                  height={PLOT_H - 100}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                      fontSize: "13.5px",
                      lineHeight: 1.55,
                      color: "var(--ink-cool)",
                    }}
                  >
                    {active.source}
                  </div>
                </foreignObject>
              </>
            ) : (
              <foreignObject
                x={PANEL_PAD}
                y={60}
                width={PANEL_INNER_W}
                height={PLOT_H}
              >
                <div
                  style={{
                    fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "var(--ink-cool)",
                  }}
                >
                  Three SWE-bench Verified configurations, three headlines, three
                  independent re-evaluations. Hover or click any bar to inspect
                  the measurement and its citation.
                </div>
              </foreignObject>
            )}
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
          The headline number is a ceiling, not a result. SYMPHONY is not a scaling bet — it is an
          architectural bet built on the failure mode this chart names.
        </div>
      </div>
    </figure>
  )
}
