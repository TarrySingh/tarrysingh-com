"use client"

import { useMemo, useState } from "react"

// Indices on a log-scale, normalised so 1970 = 1.
// Software complexity: doubling roughly every 4 years.
// Human comprehension capacity: roughly flat, with a small bump from
// tooling (~+30 % across 60 years).
type Year = {
  year: number
  complexity: number
  comprehension: number
  note?: string
}

const YEARS: ReadonlyArray<Year> = [
  { year: 1970, complexity: 1, comprehension: 1, note: "Structured programming · single authors hold the whole system" },
  { year: 1980, complexity: 5.6, comprehension: 1.1 },
  { year: 1990, complexity: 32, comprehension: 1.15, note: "Object orientation · teams of ten" },
  { year: 2000, complexity: 180, comprehension: 1.2 },
  { year: 2010, complexity: 1000, comprehension: 1.25, note: "Microservices · the readable subsystem disappears" },
  { year: 2020, complexity: 5700, comprehension: 1.28, note: "LLM coding agents arrive" },
  { year: 2025, complexity: 16000, comprehension: 1.3, note: "SWE-bench 80 %+ headline · independent re-eval collapse" },
  { year: 2030, complexity: 45000, comprehension: 1.32 },
]

const VW = 600
const VH = 380
const PAD_TOP = 24
const PAD_BOTTOM = 56
const PAD_LEFT = 60
const PAD_RIGHT = 24
const PLOT_W = VW - PAD_LEFT - PAD_RIGHT
const PLOT_H = VH - PAD_TOP - PAD_BOTTOM

// Log10 transform — both axes scaled to fit the 0..PLOT_H range.
const MIN_LOG = 0 // log10(1)
const MAX_LOG = Math.log10(45000) // top of complexity in 2030

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

  const complexityPath = useMemo(
    () =>
      YEARS.map((y, i) => `${i === 0 ? "M" : "L"} ${xForYear(y.year)} ${yForVal(y.complexity)}`).join(" "),
    [],
  )

  const comprehensionPath = useMemo(
    () =>
      YEARS.map((y, i) => `${i === 0 ? "M" : "L"} ${xForYear(y.year)} ${yForVal(y.comprehension)}`).join(" "),
    [],
  )

  const gapArea = useMemo(() => {
    const top = YEARS.map((y) => `${xForYear(y.year)},${yForVal(y.complexity)}`).join(" ")
    const bot = YEARS.slice()
      .reverse()
      .map((y) => `${xForYear(y.year)},${yForVal(y.comprehension)}`)
      .join(" ")
    return `${top} ${bot}`
  }, [])

  const active = hover !== null ? YEARS[hover] : null

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
          aria-label="Comprehension gap — software-system complexity grows roughly exponentially from 1970 to 2030 while individual human comprehension capacity stays nearly flat. The widening shaded region is the gap that SYMPHONY proposes to address."
        >
          <defs>
            <linearGradient id="syn-gap-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c98e4f" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#c98e4f" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* y-axis decadal gridlines (log scale ticks: 1, 10, 100, 1k, 10k, 100k) */}
          {[1, 10, 100, 1000, 10000, 100000].map((tick) => {
            if (Math.log10(tick) > MAX_LOG + 0.1) return null
            const y = yForVal(tick)
            return (
              <g key={`y-${tick}`}>
                <line
                  x1={PAD_LEFT}
                  x2={VW - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="rgba(220,200,160,0.12)"
                  strokeWidth={0.6}
                />
                <text
                  x={PAD_LEFT - 10}
                  y={y + 3}
                  textAnchor="end"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={9}
                  fill="rgba(220,200,160,0.6)"
                  letterSpacing={0.5}
                >
                  {tick === 1 ? "1×" : tick >= 1000 ? `${tick / 1000}k×` : `${tick}×`}
                </text>
              </g>
            )
          })}

          {/* the widening gap area */}
          <polygon points={gapArea} fill="url(#syn-gap-fill)" />

          {/* comprehension flat line */}
          <path
            d={comprehensionPath}
            fill="none"
            stroke="#6cb4c2"
            strokeWidth={1.6}
            strokeOpacity={0.9}
          />

          {/* complexity curve */}
          <path
            d={complexityPath}
            fill="none"
            stroke="#f4c482"
            strokeWidth={2}
            strokeOpacity={0.95}
          />

          {/* year hover targets and dots */}
          {YEARS.map((y, i) => {
            const x = xForYear(y.year)
            const cy = yForVal(y.complexity)
            const my = yForVal(y.comprehension)
            const isHover = hover === i
            return (
              <g
                key={y.year}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              >
                {/* hit-zone column */}
                <rect
                  x={x - PLOT_W / (YEARS.length * 2)}
                  y={PAD_TOP}
                  width={PLOT_W / YEARS.length}
                  height={PLOT_H}
                  fill="transparent"
                />
                {isHover ? (
                  <line
                    x1={x}
                    x2={x}
                    y1={PAD_TOP}
                    y2={PAD_TOP + PLOT_H}
                    stroke="rgba(255,210,150,0.45)"
                    strokeWidth={1}
                    strokeDasharray="3 2"
                  />
                ) : null}
                <circle cx={x} cy={cy} r={isHover ? 5 : 3} fill="#f4c482" />
                <circle cx={x} cy={my} r={isHover ? 5 : 3} fill="#6cb4c2" />
                {/* x-axis label */}
                <text
                  x={x}
                  y={VH - PAD_BOTTOM + 18}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={10}
                  fill={isHover ? "var(--ink)" : "rgba(220,200,160,0.7)"}
                  letterSpacing={1}
                >
                  {y.year}
                </text>
              </g>
            )
          })}

          {/* legend */}
          <g transform={`translate(${PAD_LEFT}, ${VH - 12})`}>
            <line x1={0} x2={18} y1={-3} y2={-3} stroke="#f4c482" strokeWidth={2} />
            <text
              x={24}
              y={1}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={10}
              fill="rgba(220,200,160,0.7)"
              letterSpacing={1}
            >
              COMPLEXITY
            </text>
            <line x1={120} x2={138} y1={-3} y2={-3} stroke="#6cb4c2" strokeWidth={1.6} />
            <text
              x={144}
              y={1}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={10}
              fill="rgba(220,200,160,0.7)"
              letterSpacing={1}
            >
              COMPREHENSION
            </text>
          </g>
        </svg>

        {/* hover hint / year detail */}
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
                {active.year}
              </span>
              <span style={{ color: "#f4c482" }}>
                complexity {active.complexity.toLocaleString()}×
              </span>
              <span style={{ color: "var(--ink-dim)" }}> · </span>
              <span style={{ color: "#6cb4c2" }}>
                comprehension {active.comprehension.toFixed(2)}×
              </span>
              {active.note ? (
                <>
                  <span style={{ color: "var(--ink-dim)" }}> · </span>
                  <span style={{ color: "var(--ink)" }}>{active.note}</span>
                </>
              ) : null}
            </>
          ) : (
            <span style={{ color: "var(--ink-dim)" }}>
              Hover any year to compare. Complexity scaled to 1970 = 1× on a
              log axis; comprehension capacity is roughly flat at human-mind
              limits. The widening shaded region is the gap SYMPHONY proposes
              to close — not by enlarging the engineer, but by reshaping the
              substrate they navigate.
            </span>
          )}
        </div>
      </div>
    </figure>
  )
}
