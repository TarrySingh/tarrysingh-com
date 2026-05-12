"use client"

import { useMemo, useState } from "react"

type Era = {
  year: number
  complexity: number
  comprehension: number
  era: string
  detail: string
  source?: string
}

const ERAS: ReadonlyArray<Era> = [
  {
    year: 1970,
    complexity: 1,
    comprehension: 1,
    era: "Structured programming",
    detail:
      "A single author can hold the whole system in their head. ALGOL, early Pascal, IBM mainframe departments of ~10 engineers.",
    source: "Brooks · The Mythical Man-Month · 1975",
  },
  {
    year: 1980,
    complexity: 5.6,
    comprehension: 1.1,
    era: "Modularity",
    detail:
      "C, early C++, Unix tools, module systems. Teams of dozens. The first time the codebase outruns any one person.",
  },
  {
    year: 1990,
    complexity: 32,
    comprehension: 1.15,
    era: "Object orientation",
    detail:
      "Smalltalk, C++, Java. Class hierarchies grow faster than the people maintaining them. Architecture-recovery research begins.",
    source: "Avgeriou et al. · 2007",
  },
  {
    year: 2000,
    complexity: 180,
    comprehension: 1.2,
    era: "Open source · web stacks",
    detail:
      "Hundreds of dependencies per project. The composability problem and the readability problem split.",
  },
  {
    year: 2010,
    complexity: 1000,
    comprehension: 1.25,
    era: "Microservices · cloud",
    detail:
      "The readable subsystem disappears. A request crosses a dozen services none of which any single engineer fully owns.",
  },
  {
    year: 2020,
    complexity: 5700,
    comprehension: 1.28,
    era: "LLM coding agents",
    detail:
      "GitHub Copilot, then everything else. Code-completion ubiquitous; comprehension of unfamiliar code still hard.",
  },
  {
    year: 2025,
    complexity: 16000,
    comprehension: 1.3,
    era: "The ceiling becomes visible",
    detail:
      "Claude Opus 4.5 crosses 80 % SWE-bench Verified · ICSE 2025 / ICLR 2026 re-evaluations collapse the same numbers to single digits and 30 %.",
    source: "ICSE 2025 Companion · ICLR 2026 SWE-Bench+",
  },
  {
    year: 2026,
    complexity: 22600,
    comprehension: 1.31,
    era: "SYMPHONY enters",
    detail:
      "EIC Pathfinder 2026. Neuromimetic knowledge substrate begins — not a scaling bet but an architectural one.",
  },
  {
    year: 2030,
    complexity: 45000,
    comprehension: 1.32,
    era: "Projection",
    detail:
      "If the trend holds, software complexity reaches 45 000× the 1970 baseline. Human comprehension is essentially unchanged. The substrate is either the bridge by then or the gap is permanent.",
  },
]

const VW = 1200
const VH = 760
const PAD_TOP = 96
const PAD_BOTTOM = 152
const PAD_LEFT = 96
const PAD_RIGHT = 360
const PLOT_W = VW - PAD_LEFT - PAD_RIGHT
const PLOT_H = VH - PAD_TOP - PAD_BOTTOM
const MIN_LOG = 0
const MAX_LOG = Math.log10(50000)

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
          aria-label="The comprehension gap — software-system complexity grows roughly exponentially from 1970 to 2030 while individual human comprehension capacity stays nearly flat. The widening copper-shaded region is the gap SYMPHONY proposes to close."
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

          {/* studio header */}
          <text
            x={PAD_LEFT}
            y={42}
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={14}
            letterSpacing={4}
            fill="rgba(220,200,160,0.85)"
          >
            PLATE IV · MMXXVI · FIG. 1.2.a
          </text>
          <text
            x={PAD_LEFT}
            y={72}
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={32}
            fill="var(--ink)"
            letterSpacing={2}
          >
            The comprehension gap
          </text>
          <line
            x1={PAD_LEFT}
            x2={VW - PAD_RIGHT}
            y1={84}
            y2={84}
            stroke="rgba(220,200,160,0.35)"
            strokeWidth={0.8}
          />
          <text
            x={VW - PAD_RIGHT - 4}
            y={42}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={12}
            letterSpacing={3}
            fill="rgba(220,200,160,0.7)"
          >
            COMPLEXITY × COMPREHENSION · 1970 → 2030
          </text>

          {/* y-axis log gridlines */}
          {[1, 10, 100, 1000, 10000, 100000].map((tick) => {
            if (Math.log10(tick) > MAX_LOG + 0.1) return null
            const y = yForVal(tick)
            const label = tick === 1 ? "1×" : tick >= 1000 ? `${tick / 1000}k×` : `${tick}×`
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
            y={PAD_TOP - 16}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            letterSpacing={2}
            fill="rgba(220,200,160,0.55)"
          >
            LOG SCALE
          </text>

          {/* x-axis: decade ticks */}
          {[1970, 1980, 1990, 2000, 2010, 2020, 2025, 2026, 2030].map((y) => {
            const x = xForYear(y)
            return (
              <g key={`xt-${y}`}>
                <line
                  x1={x}
                  x2={x}
                  y1={PAD_TOP + PLOT_H}
                  y2={PAD_TOP + PLOT_H + 6}
                  stroke="rgba(220,200,160,0.4)"
                  strokeWidth={0.8}
                />
              </g>
            )
          })}

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

          {/* era markers — alternate above/below */}
          {ERAS.map((e, i) => {
            const x = xForYear(e.year)
            const cy = yForVal(e.complexity)
            const my = yForVal(e.comprehension)
            const isActive = idx === i
            const labelAbove = i % 2 === 0
            const labelAnchor = labelAbove ? cy - 28 : my + 28
            const isMilestone = e.year === 2025 || e.year === 2026
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
                {/* dots */}
                <circle
                  cx={x}
                  cy={cy}
                  r={isActive ? 8 : isMilestone ? 6 : 4}
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
                {/* connector for milestone */}
                {isMilestone ? (
                  <line
                    x1={x}
                    x2={x}
                    y1={my}
                    y2={cy}
                    stroke="rgba(255,210,150,0.55)"
                    strokeWidth={1}
                  />
                ) : null}
                {/* year label */}
                <text
                  x={x}
                  y={VH - PAD_BOTTOM + 26}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={isMilestone ? 14 : 12}
                  fill={isActive ? "var(--ink)" : "rgba(220,200,160,0.7)"}
                  letterSpacing={1.5}
                >
                  {e.year}
                </text>
                {/* era short label */}
                {isMilestone || isActive ? (
                  <text
                    x={x}
                    y={labelAnchor}
                    textAnchor="middle"
                    fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
                    fontStyle="italic"
                    fontSize={13}
                    fill={isActive ? "#ffd596" : "rgba(220,200,160,0.8)"}
                  >
                    {e.era}
                  </text>
                ) : null}
              </g>
            )
          })}

          {/* legend */}
          <g transform={`translate(${PAD_LEFT}, ${VH - 36})`}>
            <line x1={0} x2={28} y1={0} y2={0} stroke="url(#syn-gap-complex)" strokeWidth={2.6} />
            <text
              x={36}
              y={4}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={12}
              letterSpacing={2}
              fill="rgba(220,200,160,0.78)"
            >
              SYSTEM COMPLEXITY
            </text>
            <line x1={210} x2={238} y1={0} y2={0} stroke="url(#syn-gap-comp)" strokeWidth={2.2} />
            <text
              x={246}
              y={4}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={12}
              letterSpacing={2}
              fill="rgba(220,200,160,0.78)"
            >
              HUMAN COMPREHENSION
            </text>
            <rect x={460} y={-8} width={18} height={14} fill="url(#syn-gap-fill)" />
            <text
              x={486}
              y={4}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={12}
              letterSpacing={2}
              fill="rgba(220,200,160,0.78)"
            >
              THE GAP
            </text>
          </g>

          {/* side panel — active era */}
          <g transform={`translate(${VW - PAD_RIGHT + 32}, ${PAD_TOP})`}>
            <rect
              x={0}
              y={0}
              width={PAD_RIGHT - 64}
              height={PLOT_H + 60}
              rx={10}
              fill="rgba(13,16,39,0.7)"
              stroke="rgba(255,210,150,0.35)"
              strokeWidth={1.2}
            />
            <text
              x={20}
              y={32}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={3}
              fill="rgba(220,200,160,0.65)"
            >
              YEAR · {active.year}
            </text>
            <text
              x={20}
              y={70}
              fontFamily="var(--font-display), Gloock, serif"
              fontSize={26}
              fill="var(--ink)"
              letterSpacing={1}
            >
              {active.era}
            </text>
            <g transform="translate(20, 100)">
              <text
                fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                fontSize={10}
                letterSpacing={2}
                fill="rgba(220,200,160,0.55)"
              >
                COMPLEXITY
              </text>
              <text
                y={32}
                fontFamily="var(--font-display), Gloock, serif"
                fontSize={36}
                fill="#ffd596"
                letterSpacing={1}
              >
                {active.complexity.toLocaleString()}×
              </text>
            </g>
            <g transform="translate(20, 162)">
              <text
                fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                fontSize={10}
                letterSpacing={2}
                fill="rgba(220,200,160,0.55)"
              >
                COMPREHENSION
              </text>
              <text
                y={32}
                fontFamily="var(--font-display), Gloock, serif"
                fontSize={36}
                fill="#9bd0d8"
                letterSpacing={1}
              >
                {active.comprehension.toFixed(2)}×
              </text>
            </g>
            <line
              x1={20}
              x2={PAD_RIGHT - 84}
              y1={224}
              y2={224}
              stroke="rgba(220,200,160,0.25)"
              strokeWidth={0.6}
            />
            <foreignObject x={20} y={240} width={PAD_RIGHT - 104} height={300}>
              <div
                style={{
                  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "var(--ink-cool)",
                }}
              >
                {active.detail}
                {active.source ? (
                  <div
                    style={{
                      marginTop: "10px",
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
          SYMPHONY closes the gap not by enlarging the engineer, but by reshaping the substrate they navigate.
        </div>
      </div>
    </figure>
  )
}
