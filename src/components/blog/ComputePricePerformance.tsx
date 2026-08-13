"use client"

/**
 * Compute price-performance — Kurzweil's "Law of Accelerating Returns".
 *
 * The long backbone of the whole thesis: calculations/second per constant
 * $1,000 across ~125 years, plotted on a log y-axis (1e-6 … 1e27). What looks
 * like a wall is a straight-ish exponential ramp once you take the log of it.
 *
 * The instrument insists on three readings:
 *   • the HISTORICAL ramp (1900 → 2026, solid) — electromechanical to GPUs;
 *   • the ~2020 HUMAN-BRAIN crossover (≈10¹⁶ cps for $1,000), a labelled node
 *     sat on a horizontal guide — the moment a grand's worth of silicon meets
 *     one human cortex;
 *   • the PROJECTION (2026 → 2045, dashed) climbing to the "all human brains"
 *     guide at the singularity — aspirational, dates contested.
 * "You are here · 2026" pins the present. Hover / scrub the years for the era
 * and the order-of-magnitude value.
 *
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
const VH = 600
const PAD_L = 78
const PAD_R = 40
const PAD_T = 34
const PAD_B = 58

// log10 domain: 1e-6 (bottom) → 1e27 (top), 33 decades
const Y_LO = 1e-6
const Y_HI = 1e27
const X0 = 1900
const X1 = 2045

interface Pt {
  year: number
  cps: number // calculations / second per $1,000 (constant $, order-of-magnitude)
  era: string
  proj?: boolean
}

// Kurzweil, *The Singularity Is Nearer* (2024) — illustrative orders of magnitude.
const SERIES: Pt[] = [
  { year: 1900, cps: 1e-5, era: "Electromechanical" },
  { year: 1940, cps: 1e-1, era: "Relays" },
  { year: 1950, cps: 1e1, era: "Vacuum tube" },
  { year: 1965, cps: 1e3, era: "Transistor" },
  { year: 1985, cps: 1e5, era: "Integrated circuit" },
  { year: 2000, cps: 1e8, era: "Microprocessor" },
  { year: 2020, cps: 1e16, era: "One human brain · for $1,000" },
  { year: 2026, cps: 3e16, era: "You are here" },
  { year: 2045, cps: 1e26, era: "All human brains · the singularity", proj: true },
]

// guides
const BRAIN = 1e16 // one human brain ≈ 10^16 cps
const ALL_BRAINS = 1e26 // ~all human brains combined
const BRAIN_PT = SERIES.find((d) => d.year === 2020)!
const HERE_PT = SERIES.find((d) => d.year === 2026)!
const SING_PT = SERIES.find((d) => d.year === 2045)!

// decade hairlines every step; labelled every third
const DECADES: number[] = []
for (let e = -6; e <= 27; e += 1) DECADES.push(e)

const sup = (n: number) =>
  String(n)
    .replace("-", "⁻")
    .replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d])
const pow10 = (e: number) => `10${sup(e)}`

// order-of-magnitude readout for an arbitrary cps value
const fmtCps = (cps: number) => {
  const e = Math.round(Math.log10(cps))
  const mant = cps / Math.pow(10, e)
  const m = Math.abs(mant - 1) < 0.05 ? "" : `${mant.toFixed(0)}·`
  return `${m}${pow10(e)} cps`
}

export function ComputePricePerformance() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = paletteFor(mode)
  const [active, setActive] = useState(2026)

  const xFor = linScale(X0, X1, PAD_L, VW - PAD_R)
  const yFor = logScale(Y_LO, Y_HI, VH - PAD_B, PAD_T) // low→bottom, high→top

  // split historical (≤2026, solid) vs projection (2026→2045, dashed)
  const histPts = SERIES.filter((d) => !d.proj)
  const projPts = SERIES.filter((d) => d.proj || d.year === 2026)
  const histPath = smoothPath(histPts.map((d) => [xFor(d.year), yFor(d.cps)]))
  const projPath = smoothPath(projPts.map((d) => [xFor(d.year), yFor(d.cps)]))
  const areaPath =
    smoothPath(histPts.map((d) => [xFor(d.year), yFor(d.cps)])) +
    ` L ${xFor(HERE_PT.year)} ${VH - PAD_B} L ${xFor(X0)} ${VH - PAD_B} Z`

  // nearest data point to the scrubbed year → era + value readout
  const activePt = SERIES.reduce((a, b) =>
    Math.abs(b.year - active) < Math.abs(a.year - active) ? b : a,
  )

  // value along the ramp at the exact scrubbed year (log-linear interpolation)
  const interpCps = (year: number) => {
    const yr = clamp(year, X0, X1)
    let lo = SERIES[0]
    let hi = SERIES[SERIES.length - 1]
    for (let i = 0; i < SERIES.length - 1; i++) {
      if (yr >= SERIES[i].year && yr <= SERIES[i + 1].year) {
        lo = SERIES[i]
        hi = SERIES[i + 1]
        break
      }
    }
    const span = hi.year - lo.year || 1
    const t = (yr - lo.year) / span
    const logv = Math.log10(lo.cps) + t * (Math.log10(hi.cps) - Math.log10(lo.cps))
    return Math.pow(10, logv)
  }

  function onMove(e: React.PointerEvent) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const xv = ((e.clientX - rect.left) / rect.width) * VW
    const yr = ((xv - PAD_L) / (VW - PAD_L - PAD_R)) * (X1 - X0) + X0
    setActive(clamp(Math.round(yr), X0, X1))
  }

  const aYear = clamp(active, X0, X1)
  const aCps = interpCps(aYear)
  const ax = xFor(aYear)
  const ay = yFor(aCps)
  const aProj = aYear > HERE_PT.year

  const yBrain = yFor(BRAIN)
  const yAll = yFor(ALL_BRAINS)
  const motion = (t: string) => (reduced ? undefined : t)

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker="Fig., Compute price-performance · calculations/sec per $1,000 · the Law of Accelerating Returns"
      caption={
        <>
          <strong style={{ color: p.ink, fontStyle: "normal" }}>
            {Math.round(aYear)} · {activePt.era}
          </strong>{" "}
, ≈{fmtCps(aCps)} for $1,000{aProj ? " (projection)" : ""}. From electromechanical
          relays to a grand&rsquo;s worth of silicon meeting one human cortex around 2020 on Kurzweil&rsquo;s mark, climbing
          toward the singularity. Trajectory right, dates contested; order-of-magnitude only.
          Source: Kurzweil, <span style={{ fontStyle: "italic" }}>The Singularity Is Nearer</span>{" "}
          (2024), skeptics cite S-curve saturation.
        </>
      }
      controls={
        <span
          className="tabular-nums text-[13px] font-semibold"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.accent }}
        >
          {Math.round(aYear)}
        </span>
      }
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full touch-none select-none"
        role="img"
        aria-label="Computing power per constant $1,000 plotted on a logarithmic scale from 1900 to 2045, rising from about ten-to-the-minus-five calculations per second to ten-to-the-sixteenth around 2020, roughly one human brain for $1,000, and projected, dashed and contested, to ten-to-the-twenty-sixth by 2045, the scale of all human brains combined, marked as the singularity. The straight diagonal of the log plot is Kurzweil's Law of Accelerating Returns. Order-of-magnitude, illustrative."
        onPointerMove={onMove}
      >
        <defs>
          <linearGradient id="cpp-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.series.copper} stopOpacity={mode === "dark" ? 0.26 : 0.18} />
            <stop offset="100%" stopColor={p.series.copper} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="cpp-proj" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.series.copper} />
            <stop offset="100%" stopColor={p.series.gold} />
          </linearGradient>
          <radialGradient id="cpp-bloom" cx="78%" cy="14%" r="62%">
            <stop offset="0%" stopColor={`rgba(${p.glowRGB},${mode === "dark" ? 0.16 : 0.1})`} />
            <stop offset="70%" stopColor={`rgba(${p.glowRGB},0)`} />
          </radialGradient>
        </defs>

        {/* atmospheric bloom toward the singularity corner */}
        <rect x={0} y={0} width={VW} height={VH} fill="url(#cpp-bloom)" />

        {/* log-decade hairlines + powers-of-ten micro-labels (every 3rd labelled) */}
        {DECADES.map((e) => {
          const y = yFor(Math.pow(10, e))
          const labelled = ((e % 3) + 3) % 3 === 0
          return (
            <g key={e}>
              <line
                x1={PAD_L}
                x2={VW - PAD_R}
                y1={y}
                y2={y}
                stroke={p.hair}
                strokeWidth={1}
                strokeOpacity={labelled ? 1 : 0.5}
              />
              {labelled && (
                <text
                  x={PAD_L - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontFamily="var(--font-mono), monospace"
                  fontSize={12}
                  fill={p.soft}
                >
                  {pow10(e)}
                </text>
              )}
            </g>
          )
        })}

        {/* y-axis title */}
        <text
          x={PAD_L - 12}
          y={PAD_T - 14}
          textAnchor="end"
          fontFamily="var(--font-mono), monospace"
          fontSize={10}
          letterSpacing={1}
          fill={p.soft}
        >
          cps / $1,000
        </text>

        {/* "all human brains" guide — the singularity ceiling */}
        <line
          x1={PAD_L}
          x2={VW - PAD_R}
          y1={yAll}
          y2={yAll}
          stroke={p.series.gold}
          strokeOpacity={0.5}
          strokeWidth={1}
          strokeDasharray="2 5"
        />
        <text
          x={PAD_L + 6}
          y={yAll - 8}
          fontFamily="var(--font-mono), monospace"
          fontSize={11}
          letterSpacing={1}
          fill={p.series.gold}
        >
          ALL HUMAN BRAINS ≈ {pow10(26)}
        </text>

        {/* human-brain crossover guide — the hero line */}
        <line
          x1={PAD_L}
          x2={VW - PAD_R}
          y1={yBrain}
          y2={yBrain}
          stroke={p.accent}
          strokeOpacity={0.6}
          strokeWidth={1.4}
          strokeDasharray="6 4"
        />
        <text
          x={PAD_L + 6}
          y={yBrain - 9}
          fontFamily="var(--font-mono), monospace"
          fontSize={12}
          letterSpacing={0.6}
          fill={p.accent}
        >
          1 HUMAN BRAIN ≈ {pow10(16)} cps
        </text>

        {/* year ticks */}
        {[1900, 1925, 1950, 1975, 2000, 2025, 2045].map((y) => {
          const isActive = Math.round(aYear) === y
          return (
            <g key={y}>
              <line
                x1={xFor(y)}
                x2={xFor(y)}
                y1={VH - PAD_B}
                y2={VH - PAD_B + 6}
                stroke={isActive ? p.accent : p.soft}
                strokeWidth={1}
                strokeOpacity={0.6}
              />
              <text
                x={xFor(y)}
                y={VH - PAD_B + 24}
                textAnchor="middle"
                fontFamily="var(--font-mono), monospace"
                fontSize={13}
                fill={isActive ? p.accent : p.soft}
              >
                {y}
              </text>
            </g>
          )
        })}
        <text
          x={(PAD_L + VW - PAD_R) / 2}
          y={VH - 12}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={11}
          letterSpacing={2}
          fill={p.soft}
        >
          HISTORICAL ·········· PROJECTION
        </text>

        {/* area under the historical ramp */}
        <path d={areaPath} fill="url(#cpp-area)" />

        {/* projection (dashed) then historical (solid) over it */}
        <path
          d={projPath}
          fill="none"
          stroke="url(#cpp-proj)"
          strokeWidth={3}
          strokeDasharray="7 6"
          strokeOpacity={0.85}
          strokeLinecap="round"
        />
        <path d={histPath} fill="none" stroke={p.series.copper} strokeWidth={3} strokeLinecap="round" />

        {/* era nodes */}
        {SERIES.map((d) => {
          const cx = xFor(d.year)
          const cy = yFor(d.cps)
          const hero = d.year === 2020 || d.year === 2045 || d.year === 2026
          return (
            <circle
              key={d.year}
              cx={cx}
              cy={cy}
              r={hero ? 4 : 3.2}
              fill={p.bg}
              stroke={d.proj ? p.series.gold : p.series.copper}
              strokeWidth={2}
            />
          )
        })}

        {/* ~2020 human-brain crossover — the hero node */}
        {(() => {
          const cx = xFor(BRAIN_PT.year)
          const cy = yFor(BRAIN_PT.cps)
          return (
            <g>
              <circle cx={cx} cy={cy} r={13} fill={p.accent} fillOpacity={0.16} />
              <circle cx={cx} cy={cy} r={6} fill={p.accent} stroke={p.bg} strokeWidth={2} />
              <text
                x={cx - 12}
                y={cy + 30}
                textAnchor="end"
                fontFamily="var(--font-serif), serif"
                fontStyle="italic"
                fontSize={13}
                fill={p.ink}
              >
                ~2020 · human-brain crossover
              </text>
            </g>
          )
        })()}

        {/* 2045 singularity — aspirational terminus, top-right */}
        {(() => {
          const cx = xFor(SING_PT.year)
          const cy = yFor(SING_PT.cps)
          return (
            <g>
              <circle cx={cx} cy={cy} r={11} fill={p.series.gold} fillOpacity={0.18} />
              <circle
                cx={cx}
                cy={cy}
                r={5.5}
                fill={p.bg}
                stroke={p.series.gold}
                strokeWidth={2}
                strokeDasharray="2 2"
              />
              <text
                x={cx}
                y={cy + 26}
                textAnchor="end"
                fontFamily="var(--font-mono), monospace"
                fontSize={11}
                letterSpacing={1}
                fill={p.series.gold}
              >
                2045 · SINGULARITY
              </text>
            </g>
          )
        })()}

        {/* you are here · 2026 */}
        {(() => {
          const cx = xFor(HERE_PT.year)
          const cy = yFor(HERE_PT.cps)
          return (
            <g>
              <circle
                cx={cx}
                cy={cy}
                r={7.5}
                fill="none"
                stroke={p.accent}
                strokeWidth={1.5}
                style={{ transformOrigin: `${cx}px ${cy}px`, animation: motion("cpp-pulse 2.8s ease-in-out infinite") }}
              />
              <text
                x={cx + 12}
                y={cy - 12}
                textAnchor="start"
                fontFamily="var(--font-mono), monospace"
                fontSize={11}
                letterSpacing={1}
                fill={p.accent}
              >
                YOU ARE HERE · 2026
              </text>
            </g>
          )
        })()}

        {/* active scrub: vertical rule + node + floating readout */}
        <line
          x1={ax}
          x2={ax}
          y1={PAD_T}
          y2={VH - PAD_B}
          stroke={p.accent}
          strokeOpacity={0.32}
          strokeWidth={1}
        />
        <circle cx={ax} cy={ay} r={6.5} fill={p.accent} stroke={p.bg} strokeWidth={2} />
        {(() => {
          // keep the readout inside the frame
          const right = ax > VW - 220
          const tx = right ? ax - 14 : ax + 14
          const anchor = right ? "end" : "start"
          const ty = clamp(ay - 16, PAD_T + 26, VH - PAD_B - 8)
          return (
            <g style={{ pointerEvents: "none" }}>
              <text
                x={tx}
                y={ty - 14}
                textAnchor={anchor}
                fontFamily="var(--font-mono), monospace"
                fontSize={13}
                fontWeight={600}
                fill={p.ink}
              >
                {Math.round(aYear)}
              </text>
              <text
                x={tx}
                y={ty}
                textAnchor={anchor}
                fontFamily="var(--font-mono), monospace"
                fontSize={12}
                fill={p.muted}
              >
                ≈{fmtCps(aCps)}
              </text>
            </g>
          )
        })()}
      </svg>

      {/* accessible + precise control */}
      <div className="mt-1 flex items-center gap-3 px-1">
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          1900
        </span>
        <input
          type="range"
          min={X0}
          max={X1}
          step={1}
          value={Math.round(aYear)}
          onChange={(e) => setActive(Number(e.target.value))}
          aria-label="Scrub the year from 1900 to 2045 to read the compute price-performance and era"
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
          style={{ accentColor: p.accent, background: p.hair }}
        />
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          2045
        </span>
      </div>

      <style>{`@keyframes cpp-pulse{0%,100%{opacity:.9;transform:scale(1)}50%{opacity:.35;transform:scale(1.45)}}`}</style>
    </PlateFrame>
  )
}
