"use client"

/**
 * AbundanceProjection — the convergence toward zero marginal cost.
 *
 * The engine of the abundance thesis: several foundational costs collapsing in
 * parallel toward a near-zero floor. Each curve is normalised to "its own
 * 2010 = 100%", so all three begin at the top and plunge together — the shape,
 * not the absolute unit, is the argument. Plotted on a log-y so multiple orders
 * of magnitude read at a glance, into a shaded ABUNDANCE band near the floor.
 *
 *   • Intelligence — $/token, GPT-3-grade: ~10⁶× cheaper 2021→2025 (steepest).
 *     Flat through the pre-LLM years, then a near-vertical collapse.   (a16z 2024)
 *   • Solar — $/W (module/system): ~$2 (2010) → ~$0.20–0.30 (2024), ~10×. (BNEF/IRENA)
 *   • Sequencing — $/genome: ~$50,000 (2010) → ~$200 (2023), ~250×.       (NHGRI/ARK)
 *
 * HIST is solid; the light dashed PROJECTION continues each descent toward the
 * floor to 2030. The honest part lives on the figure: the floor is real
 * (energy/physics), these are demonetisation *trajectories*, not guarantees —
 * and the intellectual close: marginal cost → ~0, but who captures the value is
 * the open question. "The pie becomes nearly free to copy — the question is who
 * holds the deed." (Rifkin 2014 · Diamandis 2012.)
 *
 * Hover a curve → it highlights and its figure surfaces in the caption.
 * Theme-aware via the Read mode; responsive viewBox; keyboard/SR accessible.
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
const VH = 560
const PAD_L = 92
const PAD_R = 168 // room for the end labels
const PAD_T = 30
const PAD_B = 58

// y is "cost relative to 2010", as a percentage — 2010 = 100% at the top,
// collapsing down through the decades toward the floor.
const Y_HI = 100 // 100% (2010 baseline) — top
const Y_LO = 0.00005 // floor decade — bottom (1/2,000,000 of 2010)
const X0 = 2010
const X1 = 2030
const X_PROJ = 2025 // hist → projection seam (latest hard anchors land here)

const DECADES = [100, 10, 1, 0.1, 0.01, 0.001, 0.0001] // % of 2010

// the convergence floor: where the curves pile up near zero marginal cost
const BAND_HI = 0.01 // 0.01% of 2010 = 10,000× cheaper
const BAND_LO = Y_LO

interface Pt {
  year: number
  /** cost as % of its own 2010 value (2010 → 100) */
  v: number
  proj?: boolean
}

interface Curve {
  key: "intelligence" | "solar" | "genome"
  tone: "violet" | "gold" | "teal"
  label: string
  /** end-of-curve multiple annotation */
  multiple: string
  /** the headline figure surfaced in the caption on hover */
  figure: string
  pts: Pt[]
}

/**
 * INTELLIGENCE — $/token for GPT-3-grade quality. Essentially flat through the
 * pre-LLM decade (priced like premium API compute, no commodity pressure), then
 * the LLMflation collapse: ~$60 → ~$0.06 /M tokens 2021→2024, on to ~$0.00006
 * by 2025 → ~10⁶× off the 2021 level. Normalised so 2010 ≈ 100%.
 */
const INTELLIGENCE: Pt[] = [
  { year: 2010, v: 100 },
  { year: 2015, v: 100 },
  { year: 2019, v: 100 },
  { year: 2021, v: 100 }, // the LLMflation clock starts here
  { year: 2022, v: 10 },
  { year: 2023, v: 1 },
  { year: 2024, v: 0.1 },
  { year: 2025, v: 0.0001 }, // ~10⁶× below 2021
  { year: 2026, v: 0.00004, proj: true },
  { year: 2028, v: 0.00002, proj: true },
  { year: 2030, v: 0.000012, proj: true }, // bends to a floor, doesn't hit zero
]

/**
 * SOLAR — $/W. ~$2/W (2010) → ~$0.22/W (2024) ≈ 9–10×; modules keep falling.
 * The shallowest, most physics-bounded descent of the three.
 */
const SOLAR: Pt[] = [
  { year: 2010, v: 100 },
  { year: 2013, v: 55 },
  { year: 2016, v: 33 },
  { year: 2019, v: 20 },
  { year: 2022, v: 13 },
  { year: 2024, v: 11 }, // ~9× below 2010
  { year: 2026, v: 9, proj: true },
  { year: 2028, v: 7.5, proj: true },
  { year: 2030, v: 6.5, proj: true }, // ~15×, flattening hard
]

/**
 * SEQUENCING — $/genome. ~$50,000 (2010) → ~$200 (2023) ≈ 250×, faster than
 * Moore through the 2010s; ARK puts a genome at single dollars by ~2030.
 */
const GENOME: Pt[] = [
  { year: 2010, v: 100 },
  { year: 2012, v: 20 },
  { year: 2015, v: 4 },
  { year: 2018, v: 1.2 },
  { year: 2021, v: 0.6 },
  { year: 2023, v: 0.4 }, // ~250× below 2010
  { year: 2025, v: 0.2 },
  { year: 2027, v: 0.05, proj: true },
  { year: 2030, v: 0.01, proj: true }, // approaching the band, ~10,000×
]

const CURVES: Curve[] = [
  {
    key: "intelligence",
    tone: "violet",
    label: "intelligence",
    multiple: "intelligence ~10⁶× ↓",
    figure: "$/token for GPT-3-grade intelligence fell ~1,000,000× in four years (2021→2025), the steepest collapse on record (a16z, LLMflation 2024).",
    pts: INTELLIGENCE,
  },
  {
    key: "solar",
    tone: "gold",
    label: "solar",
    multiple: "solar ~10× ↓",
    figure: "Solar fell from ~$2/W (2010) to ~$0.22/W (2024), roughly 10×, and module costs keep falling toward a hard physics floor (BNEF / IRENA).",
    pts: SOLAR,
  },
  {
    key: "genome",
    tone: "teal",
    label: "genome",
    multiple: "genome ~250× ↓",
    figure: "A human genome fell from ~$50,000 (2010) to ~$200 (2023), about 250×, faster than Moore's law for over a decade (NHGRI / ARK).",
    pts: GENOME,
  },
]

const fmtYear = (y: number) => `${y}`

export function AbundanceProjection() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = paletteFor(mode)
  const [active, setActive] = useState<Curve["key"] | null>(null)

  const xFor = linScale(X0, X1, PAD_L, VW - PAD_R)
  const yFor = logScale(Y_HI, Y_LO, PAD_T, VH - PAD_B)
  const toneColor = (t: Curve["tone"]) => p.series[t]

  const activeCurve = active ? CURVES.find((c) => c.key === active) ?? null : null

  function splitPaths(c: Curve) {
    const hist = c.pts.filter((d) => !d.proj || d.year === X_PROJ)
    const proj = c.pts.filter((d) => d.proj || d.year === X_PROJ)
    return {
      hist: smoothPath(hist.map((d) => [xFor(d.year), yFor(d.v)])),
      proj: smoothPath(proj.map((d) => [xFor(d.year), yFor(d.v)])),
      end: c.pts[c.pts.length - 1],
    }
  }

  // abundance band geometry (a soft horizontal slab near the floor)
  const bandTop = yFor(BAND_HI)
  const bandBot = yFor(BAND_LO)

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker="Fig., Abundance projection · cost relative to 2010 = 100% · log scale"
      caption={
        activeCurve ? (
          <>
            <strong style={{ color: p.ink, fontStyle: "normal" }}>
              {activeCurve.label.charAt(0).toUpperCase() + activeCurve.label.slice(1)}.
            </strong>{" "}
            {activeCurve.figure}
          </>
        ) : (
          <>
            Three foundational costs, intelligence, energy and biology, collapsing
            in parallel toward a near-zero floor. The marginal cost trends to{" "}
            <strong style={{ color: p.ink, fontStyle: "normal" }}>~0</strong>; the
            open question is who captures the value. These are demonetisation{" "}
            <em>trajectories</em>, not guarantees, the floor is real (energy,
            physics). Sources: a16z 2024 · BNEF/IRENA · NHGRI · Rifkin 2014 · Diamandis 2012.
          </>
        )
      }
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full touch-none select-none"
        role="img"
        aria-label="Abundance projection: three foundational costs, each normalised so that 2010 equals 100%, plotted on a logarithmic scale from 2010 to 2030. Intelligence (dollars per token, GPT-3-grade) collapses about a millionfold between 2021 and 2025, the steepest curve. Solar dollars-per-watt falls about tenfold. Genome sequencing cost falls about 250-fold. All three descend into a shaded abundance band near a near-zero floor. The marginal cost trends toward zero, but who captures the value remains the open question. These are demonetisation trajectories, not guarantees; the floor is set by energy and physics."
        onPointerLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id="ap-band" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.accent} stopOpacity="0" />
            <stop offset="55%" stopColor={p.accent} stopOpacity={mode === "dark" ? 0.16 : 0.12} />
            <stop offset="100%" stopColor={p.accent} stopOpacity={mode === "dark" ? 0.22 : 0.16} />
          </linearGradient>
          <radialGradient id="ap-bloom" cx="78%" cy="92%" r="62%">
            <stop offset="0%" stopColor={`rgba(${p.glowRGB},${mode === "dark" ? 0.14 : 0.09})`} />
            <stop offset="100%" stopColor={`rgba(${p.glowRGB},0)`} />
          </radialGradient>
        </defs>

        {/* atmospheric bloom toward the convergence corner */}
        <rect x={0} y={0} width={VW} height={VH} fill="url(#ap-bloom)" />

        {/* the ABUNDANCE band near the floor */}
        <rect
          x={PAD_L}
          y={bandTop}
          width={VW - PAD_R - PAD_L}
          height={bandBot - bandTop}
          fill="url(#ap-band)"
        />
        <line x1={PAD_L} x2={VW - PAD_R} y1={bandTop} y2={bandTop} stroke={p.accent} strokeOpacity={0.4} strokeWidth={1} strokeDasharray="2 5" />
        <text
          x={PAD_L + 14}
          y={bandTop + 22}
          fontFamily="var(--font-mono), monospace"
          fontSize={12}
          letterSpacing={3}
          fill={p.accent}
          fillOpacity={0.9}
        >
          ABUNDANCE
        </text>
        <text
          x={PAD_L + 14}
          y={bandTop + 40}
          fontFamily="var(--font-serif), serif"
          fontStyle="italic"
          fontSize={12}
          fill={p.muted}
        >
          marginal cost → ~0
        </text>

        {/* log-decade gridlines + % labels */}
        {DECADES.map((d) => {
          const y = yFor(d)
          const lab =
            d >= 1 ? `${d}%` : d >= 0.001 ? `${d}%` : `${d.toExponential(0)}%`
          return (
            <g key={d}>
              <line x1={PAD_L} x2={VW - PAD_R} y1={y} y2={y} stroke={p.hair} strokeWidth={1} />
              <text x={PAD_L - 12} y={y + 4} textAnchor="end" fontFamily="var(--font-mono), monospace" fontSize={12} fill={p.soft}>
                {lab}
              </text>
            </g>
          )
        })}

        {/* y-axis title */}
        <text
          x={22}
          y={(PAD_T + VH - PAD_B) / 2}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={11}
          letterSpacing={1.5}
          fill={p.soft}
          transform={`rotate(-90 22 ${(PAD_T + VH - PAD_B) / 2})`}
        >
          COST · % OF 2010
        </text>

        {/* the LLMflation seam — when the cheapest era begins */}
        <line x1={xFor(2021)} x2={xFor(2021)} y1={PAD_T} y2={VH - PAD_B} stroke={p.hair} strokeWidth={1} />
        <text x={xFor(2021)} y={PAD_T - 8} textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize={10} letterSpacing={1} fill={p.soft}>
          2021 · LLMflation begins
        </text>

        {/* hist/projection seam marker */}
        <line x1={xFor(X_PROJ)} x2={xFor(X_PROJ)} y1={PAD_T} y2={VH - PAD_B} stroke={p.hair} strokeWidth={1} strokeDasharray="2 6" />

        {/* year ticks */}
        {[2010, 2015, 2020, 2025, 2030].map((y) => (
          <text key={y} x={xFor(y)} y={VH - PAD_B + 26} textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize={13} fill={p.soft}>
            {fmtYear(y)}
          </text>
        ))}
        <text x={(PAD_L + VW - PAD_R) / 2} y={VH - 12} textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize={11} letterSpacing={2} fill={p.soft}>
          HISTORICAL ·········· PROJECTION (DASHED)
        </text>

        {/* curves */}
        {CURVES.map((c) => {
          const { hist, proj, end } = splitPaths(c)
          const col = toneColor(c.tone)
          const isActive = active === c.key
          const dimmed = active !== null && !isActive
          const [ex, ey] = [xFor(end.year), yFor(end.v)]
          // stagger end-labels vertically so they don't collide at the floor
          const labelDY = c.key === "solar" ? -6 : c.key === "genome" ? 4 : -6
          return (
            <g
              key={c.key}
              onMouseEnter={() => setActive(c.key)}
              onFocus={() => setActive(c.key)}
              tabIndex={0}
              role="button"
              aria-label={`${c.label}: ${c.figure}`}
              style={{
                cursor: "pointer",
                opacity: dimmed ? 0.28 : 1,
                transition: "opacity 200ms ease",
                outline: "none",
              }}
            >
              {/* fat invisible hit-area along the curve */}
              <path d={hist} fill="none" stroke="transparent" strokeWidth={22} />
              <path d={proj} fill="none" stroke="transparent" strokeWidth={22} />

              {/* glow under an active curve */}
              {isActive && (
                <>
                  <path d={hist} fill="none" stroke={col} strokeOpacity={0.28} strokeWidth={9} strokeLinecap="round" />
                  <path d={proj} fill="none" stroke={col} strokeOpacity={0.28} strokeWidth={9} strokeLinecap="round" strokeDasharray="9 7" />
                </>
              )}

              <path d={hist} fill="none" stroke={col} strokeWidth={isActive ? 3.4 : 2.6} strokeLinecap="round" />
              <path d={proj} fill="none" stroke={col} strokeWidth={isActive ? 3.4 : 2.6} strokeDasharray="6 6" strokeOpacity={0.85} strokeLinecap="round" />

              {/* data markers */}
              {c.pts.map((d) => (
                <circle
                  key={`${c.key}-${d.year}`}
                  cx={xFor(d.year)}
                  cy={yFor(d.v)}
                  r={2.8}
                  fill={p.bg}
                  stroke={col}
                  strokeWidth={1.6}
                />
              ))}

              {/* end marker + multiple label */}
              <circle cx={ex} cy={ey} r={isActive ? 5.5 : 4} fill={col} stroke={p.bg} strokeWidth={1.5} />
              <text
                x={ex + 12}
                y={ey + labelDY}
                fontFamily="var(--font-mono), monospace"
                fontSize={isActive ? 13 : 12}
                fontWeight={isActive ? 700 : 600}
                fill={col}
                dominantBaseline="middle"
              >
                {c.multiple}
              </text>
            </g>
          )
        })}

        {/* the intellectual close — "who holds the deed" */}
        <text
          x={VW - PAD_R}
          y={bandBot - 30}
          textAnchor="end"
          fontFamily="var(--font-serif), serif"
          fontStyle="italic"
          fontSize={13}
          fill={p.ink}
        >
          the pie becomes nearly free to copy,
        </text>
        <text
          x={VW - PAD_R}
          y={bandBot - 12}
          textAnchor="end"
          fontFamily="var(--font-serif), serif"
          fontStyle="italic"
          fontSize={13}
          fill={p.accent}
        >
          the question is who holds the deed.
        </text>
      </svg>
    </PlateFrame>
  )
}
