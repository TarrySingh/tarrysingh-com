"use client"

/**
 * The cost of a mile — a century flat, then a collapse.
 *
 * The cleanest worked example of embodiment economics. Cost per mile of
 * personal mobility, constant ~2020 US dollars, ~1930 → 2030, on a log-y:
 *   • PRIVATELY OWNED CAR — ~$0.70 / mile, essentially FLAT from 1934 → 2016.
 *     The long flat century is the hero of the chart (ARK: "100 years flat").
 *   • HUMAN-DRIVEN RIDE-HAIL — ~$2.00 / mile all-in today; the high-water mark.
 *   • AUTONOMOUS ROBOTAXI AT SCALE — collapsing to ~$0.25 / mile by ~2030, with
 *     an ARK "Cybercab at scale" floor near ~$0.20 that dips BELOW the owned car:
 *     cheaper than the car already in your drive.
 * Solid = historical; dashed = projection to 2030. Scrub the years for the
 * cost-per-mile readout and which mode owns it.
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
const PAD_L = 78
const PAD_R = 40
const PAD_T = 36
const PAD_B = 62

const Y_HI = 4 // $4 / mile (top)
const Y_LO = 0.1 // $0.10 / mile (bottom decade)
const X0 = 1930
const X1 = 2030

type ModeKey = "car" | "hail" | "robo"

interface Pt {
  year: number
  cost: number
  note?: string
  proj?: boolean
}

// Privately owned car — flat century. The hero line. (ARK Big Ideas.)
const CAR: Pt[] = [
  { year: 1934, cost: 0.71, note: "owned car ≈ $0.70" },
  { year: 1960, cost: 0.69 },
  { year: 1985, cost: 0.72 },
  { year: 2016, cost: 0.7, note: "still ≈ $0.70 — 80 yrs flat" },
]
const CAR_LEVEL = 0.7 // the reference the robotaxi dips below

// Human-driven ride-hail — the all-in high point, today.
const HAIL: Pt[] = [
  { year: 2012, cost: 2.1 },
  { year: 2024, cost: 2.0, note: "human ride-hail ≈ $2.00" },
]

// Autonomous robotaxi — flat-ish pilots, then the collapse. 2025 is the seam.
const ROBO_HIST: Pt[] = [
  { year: 2021, cost: 1.9 },
  { year: 2024, cost: 1.0 },
  { year: 2025, cost: 0.75 },
]
const ROBO_PROJ: Pt[] = [
  { year: 2025, cost: 0.75 },
  { year: 2027, cost: 0.4 },
  { year: 2030, cost: 0.25, note: "robotaxi at scale ≈ $0.25" },
]
const ROBO_FLOOR = 0.2 // ARK "Cybercab at scale" — dips below the owned car

// power-of-ten-ish $ gridlines for the mono y axis
const Y_TICKS = [4, 3, 2, 1, 0.7, 0.5, 0.25, 0.2, 0.1]
const fmtCost = (c: number) =>
  c >= 1 ? `$${c.toFixed(2)}` : `$${c.toFixed(2)}`

// build a continuous robotaxi curve (hist + proj) for sampling the scrub
const ROBO_ALL: Pt[] = [...ROBO_HIST, ...ROBO_PROJ.slice(1)]

/** linear-interpolate a series' cost at an arbitrary year (clamped to its span). */
function costAt(series: Pt[], year: number): number {
  const first = series[0]
  const last = series[series.length - 1]
  if (year <= first.year) return first.cost
  if (year >= last.year) return last.cost
  for (let i = 0; i < series.length - 1; i++) {
    const a = series[i]
    const b = series[i + 1]
    if (year >= a.year && year <= b.year) {
      const t = (year - a.year) / (b.year - a.year)
      return a.cost + (b.cost - a.cost) * t
    }
  }
  return last.cost
}

export function RobotaxiCostPerMile() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = paletteFor(mode)
  const [active, setActive] = useState(2025)

  const xFor = linScale(X0, X1, PAD_L, VW - PAD_R)
  const yFor = logScale(Y_HI, Y_LO, PAD_T, VH - PAD_B)

  const carPath = smoothPath(CAR.map((d) => [xFor(d.year), yFor(d.cost)]))
  const hailPath = smoothPath(HAIL.map((d) => [xFor(d.year), yFor(d.cost)]))
  const roboHistPath = smoothPath(ROBO_HIST.map((d) => [xFor(d.year), yFor(d.cost)]))
  const roboProjPath = smoothPath(ROBO_PROJ.map((d) => [xFor(d.year), yFor(d.cost)]))

  // the collapse wedge: from the human-ride-hail high point down to the robotaxi floor
  const collapsePath =
    `M ${xFor(2024)} ${yFor(2.0)}` +
    ` L ${xFor(2030)} ${yFor(2.0)}` +
    ` L ${xFor(2030)} ${yFor(ROBO_FLOOR)}` +
    ` L ${xFor(2025)} ${yFor(0.75)}` +
    ` L ${xFor(2024)} ${yFor(1.0)} Z`

  // which mode "owns" the active year + its live cost
  const roboLive = active >= ROBO_HIST[0].year ? costAt(ROBO_ALL, active) : null
  const hailLive = active >= HAIL[0].year ? costAt(HAIL, active) : null
  const carLive = costAt(CAR, active)

  let liveMode: ModeKey = "car"
  let liveCost = carLive
  let liveLabel = "privately owned car"
  let liveColor = p.series.cool
  if (roboLive != null && active >= 2024) {
    // once the robotaxi is the live story, it leads the readout
    liveMode = "robo"
    liveCost = roboLive
    liveLabel = active > 2025 ? "autonomous robotaxi (projected)" : "autonomous robotaxi"
    liveColor = p.series.copper
  } else if (hailLive != null && active >= 2012) {
    liveMode = "hail"
    liveCost = hailLive
    liveLabel = "human-driven ride-hail"
    liveColor = p.series.rose
  }

  const ax = xFor(active)
  const ayLive = yFor(liveCost)

  // vs. the owned car, for the readout
  const vsCar = liveCost / CAR_LEVEL
  const vsCarLabel =
    liveMode === "robo" && liveCost < CAR_LEVEL
      ? `${Math.round((1 - liveCost / CAR_LEVEL) * 100)}% under the owned car`
      : `${vsCar.toFixed(1)}× the owned car`

  function onMove(e: React.PointerEvent) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const xv = ((e.clientX - rect.left) / rect.width) * VW
    const yr = ((xv - PAD_L) / (VW - PAD_L - PAD_R)) * (X1 - X0) + X0
    setActive(Math.round(clamp(yr, X0, X1)))
  }

  const yearTicks = [1930, 1950, 1970, 1990, 2010, 2030]

  // ARK $34T enterprise-value annotation, pinned near the 2030 collapse
  const arkX = xFor(2029.4)
  const arkY = yFor(0.135)

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker="Fig. — The cost of a mile · $ / mile · constant ~2020 USD · log scale"
      caption={
        <>
          <strong style={{ color: p.ink, fontStyle: "normal" }}>
            {active}: {fmtCost(liveCost)}/mi — {liveLabel}
          </strong>{" "}
          ({vsCarLabel}). The owned car held ~$0.70/mile for{" "}
          <em style={{ fontStyle: "italic" }}>eighty years</em>; autonomy is the first
          thing to break the line — to ~$0.25 (ARK &ldquo;Cybercab at scale&rdquo; ~$0.20),
          cheaper than the car already in your drive. The $0.25 and the $34T platform are
          ARK projections, contingent on regulators clearing driverless at scale — timelines
          have slipped. Source: ARK Big Ideas 2024 / 2025.
        </>
      }
      controls={
        <span
          className="tabular-nums text-[13px] font-semibold"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.accent }}
        >
          {fmtCost(liveCost)}/mi
        </span>
      }
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full touch-none"
        role="img"
        aria-label="The cost per mile of personal mobility in constant 2020 dollars, on a log scale, from 1930 to 2030. A privately owned car held essentially flat at about $0.70 per mile for eighty years, from 1934 to 2016. Human-driven ride-hail sits at the high-water mark, about $2.00 per mile all-in today. Autonomous robotaxis at scale collapse toward $0.25 per mile by 2030, with an ARK Cybercab-at-scale floor near $0.20 that dips below the owned-car line — cheaper than the car already in your drive. The $0.25 and a $34 trillion robotaxi platform are ARK projections contingent on regulators clearing driverless at scale; historical data is solid, the projection dashed."
        onPointerMove={onMove}
      >
        <defs>
          <linearGradient id="rcm-collapse" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.series.copper} stopOpacity={mode === "dark" ? 0.2 : 0.14} />
            <stop offset="100%" stopColor={p.series.copper} stopOpacity={mode === "dark" ? 0.04 : 0.03} />
          </linearGradient>
        </defs>

        {/* $ gridlines + mono labels */}
        {Y_TICKS.map((d) => {
          const y = yFor(d)
          return (
            <g key={d}>
              <line x1={PAD_L} x2={VW - PAD_R} y1={y} y2={y} stroke={p.hair} strokeWidth={1} />
              <text
                x={PAD_L - 12}
                y={y + 4}
                textAnchor="end"
                fontFamily="var(--font-mono), monospace"
                fontSize={13}
                fill={p.soft}
              >
                {fmtCost(d)}
              </text>
            </g>
          )
        })}

        {/* the collapse wedge — high ride-hail down to the robotaxi floor */}
        <path d={collapsePath} fill="url(#rcm-collapse)" />

        {/* owned-car reference level extended as a faint full-width datum */}
        <line
          x1={PAD_L}
          x2={VW - PAD_R}
          y1={yFor(CAR_LEVEL)}
          y2={yFor(CAR_LEVEL)}
          stroke={p.series.cool}
          strokeOpacity={0.28}
          strokeWidth={1}
          strokeDasharray="1 5"
        />

        {/* ARK Cybercab floor — the line the robotaxi dips below the car to reach */}
        <line
          x1={xFor(2027)}
          x2={xFor(2030)}
          y1={yFor(ROBO_FLOOR)}
          y2={yFor(ROBO_FLOOR)}
          stroke={p.accent}
          strokeOpacity={0.55}
          strokeWidth={1}
          strokeDasharray="2 4"
        />
        <text
          x={xFor(2030)}
          y={yFor(ROBO_FLOOR) + 18}
          textAnchor="end"
          fontFamily="var(--font-mono), monospace"
          fontSize={11}
          letterSpacing={1}
          fill={p.accent}
        >
          ARK CYBERCAB ~$0.20
        </text>

        {/* year ticks + the HISTORICAL · PROJECTION baseline */}
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
          HISTORICAL ·········· PROJECTION (ARK →$0.25)
        </text>

        {/* ── PRIVATELY OWNED CAR — the flat hero line ───────────────── */}
        <path d={carPath} fill="none" stroke={p.series.cool} strokeWidth={3} />
        <text
          x={xFor(1962)}
          y={yFor(CAR_LEVEL) - 14}
          textAnchor="middle"
          fontFamily="var(--font-serif), serif"
          fontStyle="italic"
          fontSize={15}
          fill={p.series.cool}
        >
          a privately owned car — flat for eighty years
        </text>

        {/* ── HUMAN-DRIVEN RIDE-HAIL — the high point ────────────────── */}
        <path d={hailPath} fill="none" stroke={p.series.rose} strokeWidth={2.6} />
        <text
          x={xFor(2024) - 8}
          y={yFor(2.0) - 14}
          textAnchor="end"
          fontFamily="var(--font-mono), monospace"
          fontSize={12}
          fill={p.series.rose}
        >
          HUMAN RIDE-HAIL ~$2.00
        </text>

        {/* ── AUTONOMOUS ROBOTAXI — the collapse: solid history → dashed proj ── */}
        <path d={roboHistPath} fill="none" stroke={p.series.copper} strokeWidth={3} />
        <path
          d={roboProjPath}
          fill="none"
          stroke={p.series.copper}
          strokeWidth={3}
          strokeDasharray="6 5"
          strokeOpacity={0.85}
        />
        <text
          x={xFor(2030)}
          y={yFor(0.25) - 12}
          textAnchor="end"
          fontFamily="var(--font-mono), monospace"
          fontSize={12}
          fill={p.series.copper}
        >
          ROBOTAXI ~$0.25
        </text>

        {/* datapoint markers + a couple of pinned notes */}
        {CAR.map((d) => (
          <circle
            key={`car-${d.year}`}
            cx={xFor(d.year)}
            cy={yFor(d.cost)}
            r={3.4}
            fill={p.bg}
            stroke={p.series.cool}
            strokeWidth={2}
          />
        ))}
        {HAIL.map((d) => (
          <circle
            key={`hail-${d.year}`}
            cx={xFor(d.year)}
            cy={yFor(d.cost)}
            r={3.4}
            fill={p.bg}
            stroke={p.series.rose}
            strokeWidth={2}
          />
        ))}
        {ROBO_ALL.map((d) => (
          <circle
            key={`robo-${d.year}`}
            cx={xFor(d.year)}
            cy={yFor(d.cost)}
            r={3.4}
            fill={p.bg}
            stroke={p.series.copper}
            strokeWidth={2}
          />
        ))}

        {/* ARK $34T platform annotation (bull case) */}
        <g>
          <line
            x1={arkX}
            x2={xFor(2030)}
            y1={arkY}
            y2={yFor(ROBO_FLOOR) - 2}
            stroke={p.accent}
            strokeOpacity={0.4}
            strokeWidth={1}
            strokeDasharray="2 3"
          />
          <text
            x={arkX}
            y={arkY}
            textAnchor="end"
            fontFamily="var(--font-mono), monospace"
            fontSize={11.5}
            fill={p.accent}
          >
            ARK: ~$34T platform by 2030
          </text>
          <text
            x={arkX}
            y={arkY + 15}
            textAnchor="end"
            fontFamily="var(--font-serif), serif"
            fontStyle="italic"
            fontSize={11}
            fill={p.muted}
          >
            ceiling, not forecast — assumes regulators clear driverless at scale
          </text>
        </g>

        {/* the active scrub: guide line + live marker on the leading mode */}
        <line
          x1={ax}
          x2={ax}
          y1={PAD_T}
          y2={VH - PAD_B}
          stroke={p.accent}
          strokeOpacity={0.35}
          strokeWidth={1}
        />
        <circle
          cx={ax}
          cy={ayLive}
          r={7}
          fill={liveColor}
          stroke={p.bg}
          strokeWidth={2}
          style={{ transition: reduced ? undefined : "cy 120ms ease, fill 200ms ease" }}
        />
      </svg>

      {/* accessible + precise control */}
      <div className="mt-1 flex items-center gap-3 px-1">
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          1930
        </span>
        <input
          type="range"
          min={X0}
          max={X1}
          step={1}
          value={active}
          onChange={(e) => setActive(Number(e.target.value))}
          aria-label="Scrub the year from 1930 to 2030 to read the cost per mile and which mode of mobility owns it"
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
