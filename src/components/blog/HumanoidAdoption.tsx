"use client"

/**
 * Humanoid adoption — the robots leave the screen.
 *
 * Two linked elements in one instrument:
 *   1. An ILLUSTRATIVE logistic S-curve of the global humanoid installed base,
 *      2025 → 2040, drawn on a log axis (the only honest axis for a base that
 *      runs 10k → 500M). It inflects at the NPV crossover — the moment a robot
 *      costs less than the ~$550k 10-yr NPV of the US worker it replaces
 *      (≈ 2028–30). Scrub the year for the installed-base readout.
 *   2. A log "gulf" bar for scale honesty: ARK's $26T+ annual labour-replacement
 *      ceiling (Big Ideas 2025) vs the ~$38bn consensus humanoid market by 2035
 *      (Goldman Sachs) — a ~1,000× (three-order-of-magnitude) gap. ARK counts
 *      unpaid household labour; consensus counts a product market.
 *
 * ARK publishes NO official unit curve — the S-curve is illustrative and labelled
 * as such. The $26T is a theoretical ceiling, not a 2030 product market.
 * Theme-aware via Read mode; honours reduced motion; hover/scrub interactive.
 */

import { useRef, useState } from "react"
import {
  PlateFrame,
  paletteFor,
  useReadMode,
  linScale,
  logScale,
  smoothPath,
  clamp,
  lerp,
} from "./read-chart-kit"

const VW = 1000
const VH = 560
const PAD_L = 86
const PAD_T = 30
const PAD_B = 64

// the S-curve panel occupies the left ~64%; the TAM "gulf" rides the right edge
const PLOT_R = 656 // right edge of the S-curve plot area

const X0 = 2025
const X1 = 2040
const Y_HI = 1_000_000_000 // 1B installed base (top decade)
const Y_LO = 1_000 // 1k (bottom decade)

interface Anchor {
  year: number
  base: number // cumulative installed humanoid units
}

// Illustrative anchors from the brief (NOT an ARK forecast).
const ANCHORS: Anchor[] = [
  { year: 2025, base: 10_000 },
  { year: 2027, base: 80_000 },
  { year: 2029, base: 600_000 },
  { year: 2031, base: 5_000_000 },
  { year: 2033, base: 25_000_000 },
  { year: 2036, base: 120_000_000 },
  { year: 2040, base: 500_000_000 },
]

const DECADES = [1_000_000_000, 100_000_000, 10_000_000, 1_000_000, 100_000, 10_000, 1_000]

// NPV-crossover band — adoption inflects as robot price falls below the
// ~$550k 10-yr NPV of a US worker.
const NPV_LO = 2028
const NPV_HI = 2030

// the TAM gulf (annual $, log) — ARK bull ceiling vs Goldman consensus
const GOLDMAN = 38e9 // ~$38bn humanoid market by 2035 (consensus)
const ARK = 26e12 // $26T+ annual opportunity (household ~$13T + mfg ~$13T)
const TAM_HI = 1e14 // $100T (top of gulf bar)
const TAM_LO = 1e10 // $10bn (foot of gulf bar)

/** Compact unit label: 10k · 600k · 5M · 120M · 500M · 1B. */
function fmtUnits(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`
  return `${Math.round(n)}`
}

/** Compact dollar label: $38bn · $26T · $100T. */
function fmtUSD(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(n % 1e12 === 0 ? 0 : 1)}T`
  if (n >= 1e9) return `$${Math.round(n / 1e9)}bn`
  if (n >= 1e6) return `$${Math.round(n / 1e6)}M`
  return `$${n}`
}

/** Installed base for a fractional year by interpolating anchors in log space. */
function baseForYear(year: number): number {
  const y = clamp(year, X0, X1)
  if (y <= ANCHORS[0].year) return ANCHORS[0].base
  const last = ANCHORS[ANCHORS.length - 1]
  if (y >= last.year) return last.base
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const a = ANCHORS[i]
    const b = ANCHORS[i + 1]
    if (y >= a.year && y <= b.year) {
      const t = (y - a.year) / (b.year - a.year)
      const logV = lerp(Math.log10(a.base), Math.log10(b.base), t)
      return Math.pow(10, logV)
    }
  }
  return last.base
}

export function HumanoidAdoption() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = paletteFor(mode)
  const [year, setYear] = useState(2031)

  const xFor = linScale(X0, X1, PAD_L, PLOT_R)
  const yFor = logScale(Y_HI, Y_LO, PAD_T, VH - PAD_B)
  const tamY = logScale(TAM_HI, TAM_LO, PAD_T + 6, VH - PAD_B)

  const curvePts = ANCHORS.map((d) => [xFor(d.year), yFor(d.base)] as [number, number])
  const curvePath = smoothPath(curvePts)
  const areaPath =
    curvePath +
    ` L ${xFor(X1)} ${VH - PAD_B} L ${xFor(X0)} ${VH - PAD_B} Z`

  const activeBase = baseForYear(year)
  const ax = xFor(year)
  const ay = yFor(activeBase)

  // gulf-bar geometry (right rail)
  const GULF_X = 824
  const GULF_W = 30
  const yGoldman = tamY(GOLDMAN)
  const yArk = tamY(ARK)

  function onMove(e: React.PointerEvent) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const xv = ((e.clientX - rect.left) / rect.width) * VW
    const yr = ((xv - PAD_L) / (PLOT_R - PAD_L)) * (X1 - X0) + X0
    setYear(clamp(Math.round(yr), X0, X1))
  }

  const inCrossover = year >= NPV_LO && year <= NPV_HI

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker="Fig., Humanoid adoption · global installed base to 2040 (illustrative) · the TAM gulf"
      controls={
        <span
          className="tabular-nums text-[13px] font-semibold"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.accent }}
        >
          {year}
        </span>
      }
      caption={
        <>
          <strong style={{ color: p.ink, fontStyle: "normal" }}>
            {year}: ~{fmtUnits(activeBase)} humanoids installed
          </strong>{" "}
          (illustrative S-curve){inCrossover ? ", inside the NPV crossover" : ""}. The curve
          inflects ~2028–30, when a robot costs less than the ~$550k 10-yr NPV of the worker it
          replaces. The TAM gulf is real: ARK&apos;s {fmtUSD(ARK)}+ is a theoretical
          labour-replacement <em>ceiling</em> (it counts unpaid household labour), not a 2030
          product market, ~1,000× the {fmtUSD(GOLDMAN)} consensus humanoid market by 2035.
          Source: ARK Big Ideas 2025 (bull case) · Goldman Sachs (consensus). Unit curve
          illustrative, ARK publishes none.
        </>
      }
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full touch-none"
        role="img"
        aria-label={`An illustrative logistic S-curve of the global humanoid-robot installed base from 2025 to 2040, drawn on a logarithmic axis: about ten thousand units in 2025 rising past five million around 2031 to roughly five hundred million by 2040. Adoption inflects in the 2028 to 2030 NPV-crossover band, when a robot becomes cheaper than the ${"~$550k"} ten-year net present value of the US worker it replaces. Beside it, a logarithmic gulf bar contrasts ARK's twenty-six-trillion-dollar annual labour-replacement ceiling against the roughly thirty-eight-billion-dollar consensus humanoid market by 2035, a thousandfold gap. Currently showing the year ${year} at about ${fmtUnits(activeBase)} installed units.`}
        onPointerMove={onMove}
      >
        <defs>
          <linearGradient id="ha-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.series.copper} stopOpacity={mode === "dark" ? 0.3 : 0.22} />
            <stop offset="100%" stopColor={p.series.copper} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ha-gulf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.series.gold} stopOpacity={mode === "dark" ? 0.22 : 0.16} />
            <stop offset="100%" stopColor={p.series.teal} stopOpacity={mode === "dark" ? 0.18 : 0.12} />
          </linearGradient>
        </defs>

        {/* ---- S-curve panel ---- */}

        {/* log-decade gridlines + unit labels */}
        {DECADES.map((d) => {
          const y = yFor(d)
          return (
            <g key={d}>
              <line x1={PAD_L} x2={PLOT_R} y1={y} y2={y} stroke={p.hair} strokeWidth={1} />
              <text
                x={PAD_L - 12}
                y={y + 4}
                textAnchor="end"
                fontFamily="var(--font-mono), monospace"
                fontSize={13}
                fill={p.soft}
              >
                {fmtUnits(d)}
              </text>
            </g>
          )
        })}

        {/* y-axis caption */}
        <text
          x={PAD_L - 12}
          y={PAD_T - 12}
          textAnchor="end"
          fontFamily="var(--font-mono), monospace"
          fontSize={10}
          letterSpacing={1}
          fill={p.soft}
        >
          UNITS
        </text>

        {/* NPV crossover band */}
        <rect
          x={xFor(NPV_LO)}
          y={PAD_T}
          width={xFor(NPV_HI) - xFor(NPV_LO)}
          height={VH - PAD_B - PAD_T}
          fill={p.accent}
          fillOpacity={mode === "dark" ? 0.1 : 0.08}
        />
        <line x1={xFor(NPV_LO)} x2={xFor(NPV_LO)} y1={PAD_T} y2={VH - PAD_B} stroke={p.accent} strokeOpacity={0.5} strokeWidth={1} strokeDasharray="2 4" />
        <line x1={xFor(NPV_HI)} x2={xFor(NPV_HI)} y1={PAD_T} y2={VH - PAD_B} stroke={p.accent} strokeOpacity={0.5} strokeWidth={1} strokeDasharray="2 4" />
        <text
          x={(xFor(NPV_LO) + xFor(NPV_HI)) / 2}
          y={PAD_T + 14}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={10}
          letterSpacing={1}
          fill={p.accent}
        >
          NPV CROSSOVER
        </text>
        <text
          x={(xFor(NPV_LO) + xFor(NPV_HI)) / 2}
          y={PAD_T + 30}
          textAnchor="middle"
          fontFamily="var(--font-serif), serif"
          fontStyle="italic"
          fontSize={11}
          fill={p.muted}
        >
          ≈ 2028–30
        </text>
        <text
          x={(xFor(NPV_LO) + xFor(NPV_HI)) / 2}
          y={VH - PAD_B - 10}
          textAnchor="middle"
          fontFamily="var(--font-serif), serif"
          fontStyle="italic"
          fontSize={11}
          fill={p.muted}
        >
          robot &lt; worker&apos;s ~$550k NPV
        </text>

        {/* year ticks */}
        {[2025, 2028, 2031, 2034, 2037, 2040].map((y) => (
          <text
            key={y}
            x={xFor(y)}
            y={VH - PAD_B + 26}
            textAnchor="middle"
            fontFamily="var(--font-mono), monospace"
            fontSize={13}
            fill={year === y ? p.accent : p.soft}
          >
            {y}
          </text>
        ))}
        <text
          x={(PAD_L + PLOT_R) / 2}
          y={VH - 14}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={10}
          letterSpacing={2}
          fill={p.soft}
        >
          ILLUSTRATIVE LOGISTIC, NOT AN ARK FORECAST
        </text>

        {/* area + S-curve */}
        <path d={areaPath} fill="url(#ha-area)" />
        <path d={curvePath} fill="none" stroke={p.series.copper} strokeWidth={3} />

        {/* anchor markers */}
        {ANCHORS.map((d) => (
          <circle
            key={d.year}
            cx={xFor(d.year)}
            cy={yFor(d.base)}
            r={3.4}
            fill={p.bg}
            stroke={p.series.copper}
            strokeWidth={2}
          />
        ))}

        {/* active scrub */}
        <line x1={ax} x2={ax} y1={PAD_T} y2={VH - PAD_B} stroke={p.accent} strokeOpacity={0.35} strokeWidth={1} />
        <circle cx={ax} cy={ay} r={7} fill={p.accent} stroke={p.bg} strokeWidth={2} />
        <text
          x={clamp(ax, PAD_L + 4, PLOT_R - 60)}
          y={clamp(ay - 16, PAD_T + 12, VH - PAD_B)}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={13}
          fontWeight={600}
          fill={p.accent}
        >
          {fmtUnits(activeBase)}
        </text>

        {/* divider between the two elements */}
        <line
          x1={PLOT_R + 44}
          x2={PLOT_R + 44}
          y1={PAD_T}
          y2={VH - PAD_B}
          stroke={p.hair}
          strokeWidth={1}
        />

        {/* ---- TAM gulf panel (right rail) ---- */}
        <text
          x={GULF_X + GULF_W / 2}
          y={PAD_T - 12}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={10}
          letterSpacing={1.5}
          fill={p.soft}
        >
          THE TAM GULF
        </text>
        <text
          x={GULF_X + GULF_W / 2}
          y={PAD_T + 2}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={9}
          letterSpacing={1}
          fill={p.soft}
        >
          annual $ · log
        </text>

        {/* gulf bar — gold (ARK ceiling) fading to teal (consensus floor) */}
        <rect
          x={GULF_X}
          y={yArk}
          width={GULF_W}
          height={yGoldman - yArk}
          rx={3}
          fill="url(#ha-gulf)"
          stroke={p.accent}
          strokeOpacity={0.3}
          strokeWidth={1}
        />

        {/* ARK ceiling cap */}
        <line x1={GULF_X - 8} x2={GULF_X + GULF_W + 8} y1={yArk} y2={yArk} stroke={p.series.gold} strokeWidth={2.4} />
        <circle cx={GULF_X + GULF_W / 2} cy={yArk} r={4.5} fill={p.series.gold} stroke={p.bg} strokeWidth={1.5} />
        <text x={GULF_X + GULF_W + 14} y={yArk - 4} fontFamily="var(--font-mono), monospace" fontSize={15} fontWeight={700} fill={p.series.gold}>
          {fmtUSD(ARK)}+
        </text>
        <text x={GULF_X + GULF_W + 14} y={yArk + 12} fontFamily="var(--font-serif), serif" fontStyle="italic" fontSize={11} fill={p.muted}>
          ARK bull case
        </text>
        <text x={GULF_X + GULF_W + 14} y={yArk + 27} fontFamily="var(--font-mono), monospace" fontSize={9.5} fill={p.soft}>
          household ~$13T
        </text>
        <text x={GULF_X + GULF_W + 14} y={yArk + 40} fontFamily="var(--font-mono), monospace" fontSize={9.5} fill={p.soft}>
          + mfg ~$13T
        </text>

        {/* Goldman consensus floor */}
        <line x1={GULF_X - 8} x2={GULF_X + GULF_W + 8} y1={yGoldman} y2={yGoldman} stroke={p.series.teal} strokeWidth={2.4} />
        <circle cx={GULF_X + GULF_W / 2} cy={yGoldman} r={4.5} fill={p.series.teal} stroke={p.bg} strokeWidth={1.5} />
        <text x={GULF_X + GULF_W + 14} y={yGoldman + 4} fontFamily="var(--font-mono), monospace" fontSize={14} fontWeight={700} fill={p.series.teal}>
          {fmtUSD(GOLDMAN)}
        </text>
        <text x={GULF_X + GULF_W + 14} y={yGoldman + 19} fontFamily="var(--font-serif), serif" fontStyle="italic" fontSize={11} fill={p.muted}>
          Goldman, by 2035
        </text>
        <text x={GULF_X + GULF_W + 14} y={yGoldman + 33} fontFamily="var(--font-mono), monospace" fontSize={9.5} fill={p.soft}>
          consensus market
        </text>

        {/* the ~1000x gap brace */}
        <text
          x={GULF_X - 12}
          y={(yArk + yGoldman) / 2 - 6}
          textAnchor="end"
          fontFamily="var(--font-mono), monospace"
          fontSize={15}
          fontWeight={700}
          fill={p.accent}
        >
          ~1,000×
        </text>
        <text
          x={GULF_X - 12}
          y={(yArk + yGoldman) / 2 + 10}
          textAnchor="end"
          fontFamily="var(--font-serif), serif"
          fontStyle="italic"
          fontSize={10.5}
          fill={p.muted}
        >
          3 orders of
        </text>
        <text
          x={GULF_X - 12}
          y={(yArk + yGoldman) / 2 + 24}
          textAnchor="end"
          fontFamily="var(--font-serif), serif"
          fontStyle="italic"
          fontSize={10.5}
          fill={p.muted}
        >
          magnitude
        </text>
      </svg>

      {/* accessible + precise control */}
      <div className="mt-1 flex items-center gap-3 px-1">
        <span className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}>
          2025
        </span>
        <input
          type="range"
          min={X0}
          max={X1}
          step={1}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-label="Scrub the year from 2025 to 2040 to read the illustrative installed base"
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
          style={{ accentColor: p.accent, background: p.hair }}
        />
        <span className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}>
          2040
        </span>
      </div>
    </PlateFrame>
  )
}
