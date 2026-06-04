"use client"

/**
 * The Convergence — the unified deflation observatory, and the gallery's finale.
 *
 * Five things that were expensive, each normalised to its own baseline (= 100%)
 * and plotted on one log canvas: the cost of intelligence, of computation, of
 * reading a genome, of a watt of solar, of a mile of mobility — a fan of lines
 * all plunging toward a shared near-zero-marginal-cost floor. Against them, the
 * one curve that rises: total spend (Jevons' revenge — cheaper per unit, far
 * more burned in total). The whole thesis in a single instrument.
 *
 * Pure log/linear scales (no trig) → SSR-safe. Hover a curve (or its legend) to
 * light it and read its rate. Theme-aware via read-chart-kit; reduced-motion
 * just disables the hover transitions.
 */

import { useRef, useState } from "react"
import {
  PlateFrame,
  paletteFor,
  useReadMode,
  logScale,
  linScale,
  smoothPath,
  type ReadPalette,
} from "./read-chart-kit"

const VW = 1000
const VH = 600
const PAD_L = 78
const PAD_R = 158
const PAD_T = 28
const PAD_B = 52

const X0 = 2010
const X1 = 2040
const Y_HI = 1e4 // 10,000% = 100× the baseline (top — for the rising Jevons line)
const Y_LO = 1e-4 // 0.0001% of baseline (bottom — the floor decade)
const FLOOR = 1e-3
const BASE = 1e2 // 100% origin

type Tone = keyof ReadPalette["series"]

interface Curve {
  key: string
  label: string
  end: string
  tone: Tone
  rising?: boolean
  note: string
  pts: Array<[number, number]> // [year, % of baseline]
}

const CURVES: Curve[] = [
  {
    key: "intelligence",
    label: "Cost of intelligence",
    end: "intelligence",
    tone: "copper",
    note: "$/token for a fixed quality — a thousandfold collapse in three years, the steepest curve here.",
    pts: [
      [2021, 100], [2022, 10], [2023, 1], [2024, 0.1], [2025, 0.02],
      [2027, 0.006], [2030, 0.003], [2035, 0.0018], [2040, 0.0012],
    ],
  },
  {
    key: "compute",
    label: "Price of computation",
    end: "compute",
    tone: "gold",
    note: "calculations per $ — Kurzweil's century-long ramp, halving roughly every other year across five paradigms.",
    pts: [
      [2010, 100], [2015, 10], [2020, 1], [2025, 0.1], [2030, 0.012],
      [2035, 0.0018], [2040, 0.0004],
    ],
  },
  {
    key: "genome",
    label: "Reading a genome",
    end: "genome",
    tone: "teal",
    note: "$/genome — a ten-million-fold fall in twenty years, faster than Moore's Law.",
    pts: [
      [2010, 100], [2014, 8], [2018, 1.2], [2021, 0.3], [2023, 0.07],
      [2025, 0.03], [2030, 0.006], [2035, 0.003], [2040, 0.002],
    ],
  },
  {
    key: "solar",
    label: "A watt of solar",
    end: "solar",
    tone: "violet",
    note: "$/watt — energy's own deflation: gentler than the bits, but relentless.",
    pts: [
      [2010, 100], [2015, 42], [2020, 18], [2025, 10], [2030, 6.2],
      [2035, 4.3], [2040, 3.2],
    ],
  },
  {
    key: "robotaxi",
    label: "A mile of mobility",
    end: "mobility",
    tone: "rose",
    note: "$/mile — flat for eighty years, then autonomy: atoms resist longer than bits, so it descends least.",
    pts: [
      [2010, 100], [2024, 100], [2026, 88], [2028, 52], [2030, 34],
      [2033, 26], [2037, 21], [2040, 18],
    ],
  },
  {
    key: "jevons",
    label: "Total spend",
    end: "Jevons ↑",
    tone: "cool",
    rising: true,
    note: "Jevons' revenge — cheaper per unit, so we point it at a million more things: total spend climbs even as every unit collapses.",
    pts: [
      [2021, 100], [2023, 210], [2025, 560], [2027, 1100], [2030, 2400],
      [2034, 4200], [2040, 7000],
    ],
  },
]

const DECADES = [1e4, 1e3, 1e2, 1e1, 1e0, 1e-1, 1e-2, 1e-3, 1e-4]
const fmtPct = (v: number) => {
  if (v >= 100) return `${v / 100}×`
  if (v === 1) return "1%"
  if (v >= 1) return `${v}%`
  if (v >= 0.001) return `${v}%`
  return `${v.toExponential(0)}%`
}

export function Convergence() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = paletteFor(mode)
  const [active, setActive] = useState<string | null>(null)

  const xFor = linScale(X0, X1, PAD_L, VW - PAD_R)
  const yFor = logScale(Y_HI, Y_LO, PAD_T, VH - PAD_B)

  const activeCurve = CURVES.find((c) => c.key === active) ?? null

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker="Fig. — The convergence · everything expensive, normalised to its baseline, falling toward a floor"
      caption={
        activeCurve ? (
          <>
            <strong style={{ color: p.ink, fontStyle: "normal" }}>{activeCurve.label}</strong> —{" "}
            {activeCurve.note}
          </>
        ) : (
          <>
            Five costs, each indexed to <strong style={{ color: p.ink, fontStyle: "normal" }}>100%</strong>{" "}
            at its own baseline, collapsing together toward a near-zero floor — and the one line that
            rises against them, total spend. The deflation is in the price of a unit; the explosion is
            in the number of units. Hover a curve to read it.
          </>
        )
      }
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full"
        role="img"
        aria-label="A logarithmic chart from 2010 to 2040. Five cost curves — intelligence, computation, genome reading, solar, and mobility — each normalised to 100 percent at its baseline, all descend toward a shared near-zero-marginal-cost floor, intelligence the steepest and mobility the shallowest. A sixth line, total spend, rises far above the 100 percent baseline: Jevons' paradox, where cheaper units drive more total consumption."
        onMouseLeave={() => setActive(null)}
      >
        {/* decade gridlines + multiplier labels */}
        {DECADES.map((d) => {
          const y = yFor(d)
          const isBase = d === BASE
          return (
            <g key={d}>
              <line
                x1={PAD_L}
                x2={VW - PAD_R}
                y1={y}
                y2={y}
                stroke={isBase ? p.accent : p.hair}
                strokeOpacity={isBase ? 0.4 : 1}
                strokeWidth={1}
                strokeDasharray={isBase ? "4 4" : undefined}
              />
              <text
                x={PAD_L - 12}
                y={y + 4}
                textAnchor="end"
                fontFamily="var(--font-mono), monospace"
                fontSize={12}
                fill={isBase ? p.accent : p.soft}
              >
                {fmtPct(d)}
              </text>
            </g>
          )
        })}
        {/* baseline tag */}
        <text
          x={VW - PAD_R}
          y={yFor(BASE) - 8}
          textAnchor="end"
          fontFamily="var(--font-mono), monospace"
          fontSize={10}
          letterSpacing={1.5}
          fill={p.accent}
        >
          BASELINE · 100%
        </text>

        {/* near-zero floor */}
        <line
          x1={PAD_L}
          x2={VW - PAD_R}
          y1={yFor(FLOOR)}
          y2={yFor(FLOOR)}
          stroke={p.accent}
          strokeOpacity={0.5}
          strokeWidth={1}
          strokeDasharray="2 4"
        />
        <text
          x={PAD_L + 6}
          y={yFor(FLOOR) + 16}
          fontFamily="var(--font-mono), monospace"
          fontSize={10}
          letterSpacing={1.5}
          fill={p.accent}
        >
          NEAR-ZERO MARGINAL COST
        </text>

        {/* year ticks */}
        {[2010, 2020, 2030, 2040].map((yr) => (
          <text
            key={yr}
            x={xFor(yr)}
            y={VH - PAD_B + 24}
            textAnchor="middle"
            fontFamily="var(--font-mono), monospace"
            fontSize={12}
            fill={p.soft}
          >
            {yr}
          </text>
        ))}

        {/* curves */}
        {CURVES.map((c) => {
          const tone = p.series[c.tone]
          const path = smoothPath(c.pts.map(([yr, v]) => [xFor(yr), yFor(v)]))
          const dim = active != null && active !== c.key
          const on = active === c.key
          const [ey, ev] = c.pts[c.pts.length - 1]
          return (
            <g key={c.key} style={{ transition: "opacity 220ms ease" }} opacity={dim ? 0.18 : 1}>
              <path
                d={path}
                fill="none"
                stroke={tone}
                strokeWidth={on ? 3.4 : c.rising ? 2.6 : 2.2}
                strokeDasharray={c.rising ? "7 4" : undefined}
              />
              {/* wide invisible hit-path */}
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={18}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setActive(c.key)}
              />
              {/* end label */}
              <text
                x={xFor(ey) + 8}
                y={yFor(ev) + 4}
                fontFamily="var(--font-mono), monospace"
                fontSize={11}
                fontWeight={on ? 700 : 400}
                fill={tone}
              >
                {c.end}
              </text>
            </g>
          )
        })}
      </svg>

      {/* legend */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 px-1">
        {CURVES.map((c) => {
          const tone = p.series[c.tone]
          const on = active === c.key
          return (
            <button
              key={c.key}
              type="button"
              onMouseEnter={() => setActive(c.key)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(c.key)}
              onBlur={() => setActive(null)}
              className="flex items-center gap-2 text-[11px]"
              style={{
                fontFamily: "var(--font-mono), monospace",
                color: on ? p.ink : p.muted,
                opacity: active != null && !on ? 0.5 : 1,
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 0,
                  borderTop: `${c.rising ? 2.6 : 2.2}px ${c.rising ? "dashed" : "solid"} ${tone}`,
                }}
              />
              {c.label}
            </button>
          )
        })}
      </div>
    </PlateFrame>
  )
}
