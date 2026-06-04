"use client"

/**
 * The genome-cost curve — $ to sequence one whole human genome, on a log-y.
 *
 * The once-in-a-generation collapse: ~$2.7B (2003) → sub-$100 (2024), a
 * ten-billion-fold (10¹⁰) fall in ~20 years — and visibly *faster than Moore's
 * Law*. To prove that, a faint Moore counterfactual starts at the 2003 point
 * and halves every two years; by 2024 it still sits orders of magnitude above
 * the real curve. The wedge between them is shaded "faster than Moore."
 *
 * Solid = historical (2003→2024); dashed = ARK's →$1–10 by 2030 extrapolation.
 * Hover or scrub the years for the readout: "$X · N× cheaper than 2003".
 * Theme-aware via the Read mode; honours reduced motion; keyboard-operable.
 */

import { useRef, useState } from "react"
import {
  PlateFrame,
  paletteFor,
  useReadMode,
  usePrefersReducedMotion,
  logScale,
  linScale,
  smoothPath,
  clamp,
} from "./read-chart-kit"

const VW = 1000
const VH = 560
const PAD_L = 92
const PAD_R = 40
const PAD_T = 34
const PAD_B = 62

const Y_HI = 1e10 // top decade ($10B)
const Y_LO = 1 // bottom decade ($1)
const X0 = 2003
const X1 = 2030

interface Pt {
  year: number
  cost: number
  /** short annotation pinned to the marker */
  note?: string
  proj?: boolean
}

// Cost per whole human genome (ARK Big Ideas 2025 + NHGRI shape).
const SERIES: Pt[] = [
  { year: 2003, cost: 2.7e9, note: "first genome ≈ $2.7B" },
  { year: 2008, cost: 1e6 },
  { year: 2012, cost: 1e4 },
  { year: 2015, cost: 1e3, note: "the $1,000 genome" },
  { year: 2020, cost: 6e2 },
  { year: 2023, cost: 2e2, note: "~$200" },
  { year: 2024, cost: 8e1, note: "sub-$100" },
  { year: 2030, cost: 5e0, note: "~$1–10", proj: true },
]

const BASE = SERIES[0].cost // 2003 reference for "× cheaper"

// Moore's-Law counterfactual: from the 2003 point, halve every ~2 years.
// By 2024 (21 yrs) this is 2.7e9 / 2^10.5 ≈ $1.9M — ~23,000× above the real curve.
const mooreCost = (year: number) => BASE / Math.pow(2, (year - X0) / 2)
const MOORE_END = 2024
const MOORE: Pt[] = []
for (let y = X0; y <= MOORE_END; y += 1) MOORE.push({ year: y, cost: mooreCost(y) })

// power-of-ten decades for the y axis, 10⁰ … 10¹⁰
const DECADES = [1e0, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10]
const SUP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"]
const supExp = (n: number) =>
  String(n)
    .split("")
    .map((d) => SUP[Number(d)])
    .join("")

// friendly $ for the live readout
function fmtCost(c: number): string {
  if (c >= 1e9) return `$${(c / 1e9).toFixed(c >= 1e10 ? 0 : 1)}B`
  if (c >= 1e6) return `$${(c / 1e6).toFixed(c >= 1e7 ? 0 : 1)}M`
  if (c >= 1e3) return `$${Math.round(c).toLocaleString("en-US")}`
  return `$${Math.round(c)}`
}

// human-readable "× cheaper than 2003"
function fmtTimes(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)} billion×`
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)} million×`
  if (n >= 1e3) return `${Math.round(n / 1e3).toLocaleString("en-US")},000×`
  return `${Math.round(n)}×`
}

export function GenomeCostCurve() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = paletteFor(mode)
  const [active, setActive] = useState(2024)

  const xFor = linScale(X0, X1, PAD_L, VW - PAD_R)
  const yFor = logScale(Y_HI, Y_LO, PAD_T, VH - PAD_B)

  // 2024 is the seam: it belongs to both the solid history and the dashed projection.
  const histPts = SERIES.filter((d) => !d.proj)
  const projPts = SERIES.filter((d) => d.proj || d.year === 2024)
  const histPath = smoothPath(histPts.map((d) => [xFor(d.year), yFor(d.cost)]))
  const projPath = smoothPath(projPts.map((d) => [xFor(d.year), yFor(d.cost)]))
  const moorePath = smoothPath(MOORE.map((d) => [xFor(d.year), yFor(d.cost)]))

  // the "faster than Moore" wedge: real curve out, Moore line back (to 2024)
  const wedgePath =
    smoothPath(histPts.map((d) => [xFor(d.year), yFor(d.cost)])) +
    " " +
    MOORE.slice()
      .reverse()
      .map((d, i) => `${i === 0 ? "L" : "L"} ${xFor(d.year)} ${yFor(d.cost)}`)
      .join(" ") +
    " Z"

  // nearest datapoint to the active year drives the readout
  const activePt = SERIES.reduce((a, b) =>
    Math.abs(b.year - active) < Math.abs(a.year - active) ? b : a,
  )
  const cheaper = BASE / activePt.cost
  const ax = xFor(activePt.year)
  const ay = yFor(activePt.cost)

  // the Moore value at the active year (capped to the 2024 endpoint) for the gap callout
  const mYear = Math.min(activePt.year, MOORE_END)
  const mGap = mooreCost(mYear) / activePt.cost

  const yearTicks = [2003, 2008, 2012, 2015, 2020, 2024, 2030]

  function onMove(e: React.PointerEvent) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const xv = ((e.clientX - rect.left) / rect.width) * VW
    const yr = ((xv - PAD_L) / (VW - PAD_L - PAD_R)) * (X1 - X0) + X0
    setActive(Math.round(clamp(yr, X0, X1)))
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker="Fig. — The cost to sequence one human genome · log scale · $"
      caption={
        <>
          <strong style={{ color: p.ink, fontStyle: "normal" }}>
            {activePt.year}: {fmtCost(activePt.cost)}
            {activePt.note ? ` (${activePt.note})` : ""}
          </strong>{" "}
          — {fmtTimes(cheaper)} cheaper than 2003
          {activePt.proj ? " (ARK extrapolation)" : ""}. This is the least-controversial
          curve in the deck — the industry agrees on its shape; only the →$1–10 by 2030
          endpoint is ARK&rsquo;s call. Source: ARK Big Ideas 2025 · NHGRI.
        </>
      }
      controls={
        <span
          className="tabular-nums text-[13px] font-semibold"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.accent }}
        >
          {fmtCost(activePt.cost)}
        </span>
      }
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full touch-none"
        role="img"
        aria-label="The cost to sequence one whole human genome fell from about $2.7 billion in 2003 to under $100 in 2024 — a ten-billion-fold collapse in roughly twenty years, faster than Moore's Law. A faint Moore's-Law counterfactual line, halving every two years from the 2003 point, stays thousands of times above the real curve by 2024; the wedge between them is the genome's faster-than-Moore lead. ARK projects roughly $1 to $10 per genome by 2030."
        onPointerMove={onMove}
      >
        <defs>
          <linearGradient id="gcc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.series.teal} stopOpacity={mode === "dark" ? 0.26 : 0.18} />
            <stop offset="100%" stopColor={p.series.teal} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gcc-wedge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.accent} stopOpacity={mode === "dark" ? 0.16 : 0.12} />
            <stop offset="100%" stopColor={p.accent} stopOpacity={mode === "dark" ? 0.04 : 0.03} />
          </linearGradient>
        </defs>

        {/* log-decade gridlines + power-of-ten labels */}
        {DECADES.map((d, i) => {
          const y = yFor(d)
          return (
            <g key={d}>
              <line x1={PAD_L} x2={VW - PAD_R} y1={y} y2={y} stroke={p.hair} strokeWidth={1} />
              <text
                x={PAD_L - 14}
                y={y + 4}
                textAnchor="end"
                fontFamily="var(--font-mono), monospace"
                fontSize={13}
                fill={p.soft}
              >
                {`$10${supExp(i)}`}
              </text>
            </g>
          )
        })}

        {/* the faster-than-Moore wedge + Moore counterfactual */}
        <path d={wedgePath} fill="url(#gcc-wedge)" />
        <path
          d={moorePath}
          fill="none"
          stroke={p.muted}
          strokeOpacity={0.55}
          strokeWidth={1.4}
          strokeDasharray="2 5"
        />
        {/* Moore label, riding just above its line mid-span */}
        <text
          {...(() => {
            const [mx, my] = [xFor(2013.5), yFor(mooreCost(2013.5))]
            return { x: mx, y: my - 12 }
          })()}
          fontFamily="var(--font-mono), monospace"
          fontSize={12}
          letterSpacing={1}
          fill={p.muted}
          textAnchor="middle"
        >
          MOORE&rsquo;S LAW (halves / 2 yr)
        </text>
        {/* "faster than Moore" callout in the heart of the wedge */}
        <text
          {...(() => {
            const yMid = (yFor(SERIES[3].cost) + yFor(mooreCost(2015))) / 2
            return { x: xFor(2018.4), y: yMid }
          })()}
          fontFamily="var(--font-serif), serif"
          fontStyle="italic"
          fontSize={15}
          fill={p.accent}
          textAnchor="middle"
        >
          faster than Moore
        </text>

        {/* year ticks */}
        {yearTicks.map((y) => (
          <text
            key={y}
            x={xFor(y)}
            y={VH - PAD_B + 26}
            textAnchor="middle"
            fontFamily="var(--font-mono), monospace"
            fontSize={13}
            fill={active === y ? p.accent : p.soft}
          >
            {y}
          </text>
        ))}
        <text
          x={(PAD_L + VW - PAD_R) / 2}
          y={VH - 12}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={11}
          letterSpacing={2}
          fill={p.soft}
        >
          HISTORICAL ·········· PROJECTION (ARK →$1–10)
        </text>

        {/* real cost curve: area + solid history + dashed projection */}
        <path
          d={
            histPath +
            ` L ${xFor(SERIES[histPts.length - 1].year)} ${VH - PAD_B} L ${xFor(X0)} ${VH - PAD_B} Z`
          }
          fill="url(#gcc-area)"
        />
        <path d={histPath} fill="none" stroke={p.series.teal} strokeWidth={3} />
        <path
          d={projPath}
          fill="none"
          stroke={p.series.teal}
          strokeWidth={3}
          strokeDasharray="6 5"
          strokeOpacity={0.8}
        />

        {/* datapoint markers + pinned notes */}
        {SERIES.map((d) => {
          const x = xFor(d.year)
          const y = yFor(d.cost)
          const isActive = activePt.year === d.year
          return (
            <g key={d.year}>
              {d.note && (
                <text
                  x={x}
                  y={y - 16}
                  textAnchor={d.year >= 2024 ? "end" : "middle"}
                  fontFamily="var(--font-mono), monospace"
                  fontSize={11}
                  fill={isActive ? p.accent : p.muted}
                  style={{ transition: reduced ? undefined : "fill 200ms ease" }}
                >
                  {d.note}
                </text>
              )}
              <circle
                cx={x}
                cy={y}
                r={3.6}
                fill={p.bg}
                stroke={p.series.teal}
                strokeWidth={2}
              />
            </g>
          )
        })}

        {/* the active scrub: guide, gap bracket, marker */}
        <line
          x1={ax}
          x2={ax}
          y1={PAD_T}
          y2={VH - PAD_B}
          stroke={p.accent}
          strokeOpacity={0.35}
          strokeWidth={1}
        />
        {/* gap bracket from the real curve up to the Moore line at the active year */}
        {activePt.year <= MOORE_END && mGap >= 2 && (
          <g>
            <line
              x1={ax}
              x2={ax}
              y1={ay}
              y2={yFor(mooreCost(mYear))}
              stroke={p.accent}
              strokeOpacity={0.5}
              strokeWidth={1.4}
              strokeDasharray="3 3"
            />
            <text
              x={ax + 8}
              y={(ay + yFor(mooreCost(mYear))) / 2}
              dominantBaseline="middle"
              fontFamily="var(--font-mono), monospace"
              fontSize={11}
              fill={p.accent}
            >
              {fmtTimes(mGap)} under Moore
            </text>
          </g>
        )}
        <circle cx={ax} cy={ay} r={7} fill={p.accent} stroke={p.bg} strokeWidth={2} />
      </svg>

      {/* accessible + precise control */}
      <div className="mt-1 flex items-center gap-3 px-1">
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          2003
        </span>
        <input
          type="range"
          min={X0}
          max={X1}
          step={1}
          value={active}
          onChange={(e) => setActive(Number(e.target.value))}
          aria-label="Scrub the year from 2003 to 2030 to read the cost per genome"
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
          style={{ accentColor: p.accent, background: p.hair }}
        />
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          2030
        </span>
      </div>
    </PlateFrame>
  )
}
