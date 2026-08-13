"use client"

/**
 * The cost of intelligence — $/million tokens for GPT-3-grade quality.
 *
 * The defensible "wow": $60 → $0.06, 2021→2024 (~1,000×, a16z LLMflation).
 * The honesty the plate insists on: the curve must BEND to an energy/silicon
 * floor — so the projection slows while a faint "naïve 10×/yr" ghost plunges
 * off the bottom of the chart. Hover/scrub the years for the readout.
 */

import { useRef, useState } from "react"
import {
  PlateFrame,
  paletteFor,
  useReadMode,
  logScale,
  linScale,
  smoothPath,
} from "./read-chart-kit"

const VW = 1000
const VH = 540
const PAD_L = 84
const PAD_R = 36
const PAD_T = 30
const PAD_B = 56

const Y_HI = 100 // $100 / M (top)
const Y_LO = 0.0001 // floor decade (bottom)
const X0 = 2021
const X1 = 2030

interface Pt {
  year: number
  cost: number
  proj?: boolean
}

const SERIES: Pt[] = [
  { year: 2021, cost: 60 },
  { year: 2022, cost: 6 },
  { year: 2023, cost: 0.6 },
  { year: 2024, cost: 0.06 },
  { year: 2025, cost: 0.006 },
  { year: 2026, cost: 0.0018, proj: true },
  { year: 2028, cost: 0.0005, proj: true },
  { year: 2030, cost: 0.0002, proj: true },
]
const FLOOR = 0.0001

// the "if it never bent" ghost: keep dividing by 10 each year past 2025
const GHOST: Pt[] = [{ year: 2025, cost: 0.006 }]
for (let y = 2026; y <= 2030; y++) GHOST.push({ year: y, cost: 0.006 / Math.pow(10, y - 2025) })

const DECADES = [100, 10, 1, 0.1, 0.01, 0.001, 0.0001]
const fmtCost = (c: number) =>
  c >= 1 ? `$${c}` : c >= 0.001 ? `$${c.toFixed(c < 0.01 ? 3 : 2)}` : `$${c.toExponential(0)}`

export function CostOfIntelligence() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = paletteFor(mode)
  const [active, setActive] = useState(2024)

  const xFor = linScale(X0, X1, PAD_L, VW - PAD_R)
  const yFor = logScale(Y_HI, Y_LO, PAD_T, VH - PAD_B)

  const histPts = SERIES.filter((d) => !d.proj || d.year === 2025)
  const projPts = SERIES.filter((d) => d.proj || d.year === 2025)
  const histPath = smoothPath(histPts.map((d) => [xFor(d.year), yFor(d.cost)]))
  const projPath = smoothPath(projPts.map((d) => [xFor(d.year), yFor(d.cost)]))
  const areaPath =
    smoothPath(SERIES.map((d) => [xFor(d.year), yFor(d.cost)])) +
    ` L ${xFor(X1)} ${VH - PAD_B} L ${xFor(X0)} ${VH - PAD_B} Z`
  const ghostPath = smoothPath(
    GHOST.map((d) => [xFor(d.year), yFor(Math.max(d.cost, Y_LO * 0.4))]),
  )

  const activePt = SERIES.reduce((a, b) =>
    Math.abs(b.year - active) < Math.abs(a.year - active) ? b : a,
  )
  const cheaper = Math.round(60 / activePt.cost)
  const cheaperLabel =
    cheaper >= 1000 ? `${(cheaper / 1000).toFixed(cheaper >= 10000 ? 0 : 1)},000×` : `${cheaper}×`

  function onMove(e: React.PointerEvent) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const xv = ((e.clientX - rect.left) / rect.width) * VW
    const yr = (xv - PAD_L) / (VW - PAD_L - PAD_R) * (X1 - X0) + X0
    setActive(Math.max(X0, Math.min(X1, Math.round(yr))))
  }

  const ax = xFor(activePt.year)
  const ay = yFor(activePt.cost)

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker="Fig., The cost of intelligence · $/million tokens · GPT-3-grade quality"
      caption={
        <>
          <strong style={{ color: p.ink, fontStyle: "normal" }}>
            {activePt.year}: {fmtCost(activePt.cost)}/M
          </strong>{" "}
, {cheaperLabel} cheaper than 2021{activePt.proj ? " (projected, bending to a floor)" : ""}.{" "}
          The naïve 10×/yr line (faint) plunges off the chart; the real curve must bend. Source: a16z LLMflation 2024 · Epoch AI 2025.
        </>
      }
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full touch-none"
        role="img"
        aria-label="The cost of GPT-3-grade intelligence per million tokens fell from $60 in 2021 to $0.06 in 2024, about a thousandfold, and continues to fall while bending toward an energy and silicon floor near $0.0001. A faint ghost line shows where a naïve tenfold-per-year extrapolation would go, physically absurd."
        onPointerMove={onMove}
      >
        <defs>
          <linearGradient id="coi-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.series.copper} stopOpacity={mode === "dark" ? 0.28 : 0.2} />
            <stop offset="100%" stopColor={p.series.copper} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* log-decade gridlines + $ labels */}
        {DECADES.map((d) => {
          const y = yFor(d)
          return (
            <g key={d}>
              <line x1={PAD_L} x2={VW - PAD_R} y1={y} y2={y} stroke={p.hair} strokeWidth={1} />
              <text x={PAD_L - 12} y={y + 4} textAnchor="end" fontFamily="var(--font-mono), monospace" fontSize={13} fill={p.soft}>
                {fmtCost(d)}
              </text>
            </g>
          )
        })}

        {/* energy/silicon floor */}
        <line x1={PAD_L} x2={VW - PAD_R} y1={yFor(FLOOR)} y2={yFor(FLOOR)} stroke={p.accent} strokeOpacity={0.55} strokeWidth={1} strokeDasharray="2 4" />
        <text x={VW - PAD_R} y={yFor(FLOOR) - 8} textAnchor="end" fontFamily="var(--font-mono), monospace" fontSize={11} letterSpacing={1} fill={p.accent}>
          ENERGY / SILICON FLOOR
        </text>

        {/* year ticks */}
        {[2021, 2023, 2025, 2027, 2030].map((y) => (
          <text key={y} x={xFor(y)} y={VH - PAD_B + 26} textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize={13} fill={active === y ? p.accent : p.soft}>
            {y}
          </text>
        ))}
        <text x={(PAD_L + VW - PAD_R) / 2} y={VH - 10} textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize={11} letterSpacing={2} fill={p.soft}>
          HISTORICAL ·········· PROJECTION (BENDS)
        </text>

        {/* area + curves */}
        <path d={areaPath} fill="url(#coi-area)" />
        <path d={ghostPath} fill="none" stroke={p.muted} strokeOpacity={0.35} strokeWidth={1.2} strokeDasharray="1 5" />
        <text {...(() => { const [gx, gy] = [xFor(2029.2), yFor(GHOST[GHOST.length - 2].cost)]; return { x: gx, y: gy } })()} fontFamily="var(--font-serif), serif" fontStyle="italic" fontSize={12} fill={p.muted} textAnchor="end">
          naïve 10×/yr →
        </text>
        <path d={histPath} fill="none" stroke={p.series.copper} strokeWidth={3} />
        <path d={projPath} fill="none" stroke={p.series.copper} strokeWidth={3} strokeDasharray="6 5" strokeOpacity={0.8} />

        {/* markers */}
        {SERIES.map((d) => (
          <circle key={d.year} cx={xFor(d.year)} cy={yFor(d.cost)} r={3.4} fill={p.bg} stroke={p.series.copper} strokeWidth={2} />
        ))}

        {/* active scrub */}
        <line x1={ax} x2={ax} y1={PAD_T} y2={VH - PAD_B} stroke={p.accent} strokeOpacity={0.35} strokeWidth={1} />
        <circle cx={ax} cy={ay} r={7} fill={p.accent} stroke={p.bg} strokeWidth={2} />
      </svg>
    </PlateFrame>
  )
}
