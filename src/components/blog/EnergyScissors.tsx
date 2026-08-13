"use client"

/**
 * Energy Scissors — the third curve.
 *
 * The Jevons paradox as a single instrument: the cost of a *unit* of
 * intelligence collapses (~1,000× index, 2021=100% → ~0.001%) while the
 * *total* electricity to run AI explodes (IEA: data-centre demand ~415 TWh
 * 2024 → ~945 TWh 2030, ≈ Japan; ~1.5% → ~3% of global supply). The two
 * curves cross — and the crossing is the whole point:
 *
 *   the deflation is in the unit; the explosion is in the volume.
 *
 *   • FALLING — cost per unit of intelligence, log left axis (copper line).
 *   • RISING  — total AI / data-centre electricity, linear right axis (teal
 *     bars + line in TWh).
 *   • a labelled crossing node carries the verdict: "JEVONS — cheaper per
 *     unit, more in total."
 *   • an inset tracks frontier training-run power (~100–150 MW 2024 → 4–16 GW
 *     2030) — the constraint that binds.
 *
 * Honesty: total energy is the binding constraint; HISTORICAL vs PROJECTION
 * splits at ~2024/25. Hover / scrub the years for a synchronised dual readout.
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
const VH = 580
const PAD_L = 78
const PAD_R = 78
const PAD_T = 48
const PAD_B = 64

const X0 = 2021
const X1 = 2030

// FALLING — cost-per-unit index, log axis (2021 = 100%)
const C_HI = 100 // 100% (top)
const C_LO = 0.0005 // floor decade (bottom), %

// RISING — total AI / data-centre electricity, linear axis (TWh)
const E_LO = 0
const E_HI = 1000

interface Pt {
  year: number
  /** cost per unit of intelligence, % of 2021 (log) */
  cost: number
  /** data-centre / AI electricity, TWh (linear) */
  twh: number
  proj?: boolean
}

// Cost index: a16z LLMflation cadence (~10×/yr) bending to a floor.
// Electricity: anchored on IEA *Energy and AI* (2025) — ~415 TWh (2024),
// ~945 TWh (2030); intervening/earlier years interpolated illustratively.
const SERIES: Pt[] = [
  { year: 2021, cost: 100, twh: 230 },
  { year: 2022, cost: 10, twh: 270 },
  { year: 2023, cost: 1, twh: 340 },
  { year: 2024, cost: 0.1, twh: 415 },
  { year: 2025, cost: 0.02, twh: 510, proj: true },
  { year: 2026, cost: 0.008, twh: 610, proj: true },
  { year: 2027, cost: 0.004, twh: 700, proj: true },
  { year: 2028, cost: 0.0022, twh: 790, proj: true },
  { year: 2029, cost: 0.0014, twh: 870, proj: true },
  { year: 2030, cost: 0.001, twh: 945, proj: true },
]

const SPLIT = 2024 // last fully-historical year (2024 anchors the IEA figure)

// share-of-global-electricity context for the readout (IEA: ~1.5%→~3%)
const sharePct = (twh: number) => (twh / 415) * 1.5

// frontier training-run power inset, MW (Epoch AI / IEA) — log range
const FRONTIER: { year: number; mw: number; proj?: boolean }[] = [
  { year: 2024, mw: 125 },
  { year: 2026, mw: 600, proj: true },
  { year: 2028, mw: 2200, proj: true },
  { year: 2030, mw: 9000, proj: true }, // 4–16 GW band, midpoint
]

const COST_DECADES = [100, 10, 1, 0.1, 0.01, 0.001] // % gridlines (left)
const TWH_TICKS = [0, 250, 500, 750, 1000] // TWh gridlines (right)

const fmtCost = (c: number) => {
  if (c >= 1) return `${c}%`
  if (c >= 0.001) return `${c}%`
  // very small — show with enough places, trimming trailing zeros
  return `${Number(c.toPrecision(1))}%`
}
const fmtTwh = (t: number) => `${Math.round(t)} TWh`
const fmtMw = (mw: number) => (mw >= 1000 ? `${(mw / 1000).toFixed(mw >= 10000 ? 0 : 1)} GW` : `${Math.round(mw)} MW`)

export function EnergyScissors() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = paletteFor(mode)
  const [active, setActive] = useState(2027)

  const xFor = linScale(X0, X1, PAD_L, VW - PAD_R)
  const yCost = logScale(C_HI, C_LO, PAD_T, VH - PAD_B) // high→top
  const yTwh = linScale(E_LO, E_HI, VH - PAD_B, PAD_T) // 0→bottom, max→top

  // FALLING — split historical / projection (2025+ is projection; share 2024)
  const costHist = SERIES.filter((d) => !d.proj)
  const costProj = SERIES.filter((d) => d.proj || d.year === SPLIT)
  const costHistPath = smoothPath(costHist.map((d) => [xFor(d.year), yCost(d.cost)]))
  const costProjPath = smoothPath(costProj.map((d) => [xFor(d.year), yCost(d.cost)]))

  // RISING — TWh line (whole span) + faint per-year bars
  const twhPath = smoothPath(SERIES.map((d) => [xFor(d.year), yTwh(d.twh)]))
  const twhAreaPath =
    twhPath + ` L ${xFor(X1)} ${VH - PAD_B} L ${xFor(X0)} ${VH - PAD_B} Z`

  // ---- crossing point of the two *screen-space* curves -------------------
  // Sample both in y-pixels across the year span; find sign change of (cost−twh).
  const crossing = (() => {
    const logC = (yr: number) => {
      // log-linear interp of the cost index in log space
      const s = SERIES
      let lo = s[0]
      let hi = s[s.length - 1]
      for (let i = 0; i < s.length - 1; i++) {
        if (yr >= s[i].year && yr <= s[i + 1].year) {
          lo = s[i]
          hi = s[i + 1]
          break
        }
      }
      const span = hi.year - lo.year || 1
      const t = (yr - lo.year) / span
      return Math.pow(10, Math.log10(lo.cost) + t * (Math.log10(hi.cost) - Math.log10(lo.cost)))
    }
    const linE = (yr: number) => {
      const s = SERIES
      let lo = s[0]
      let hi = s[s.length - 1]
      for (let i = 0; i < s.length - 1; i++) {
        if (yr >= s[i].year && yr <= s[i + 1].year) {
          lo = s[i]
          hi = s[i + 1]
          break
        }
      }
      const span = hi.year - lo.year || 1
      const t = (yr - lo.year) / span
      return lo.twh + t * (hi.twh - lo.twh)
    }
    let prev = yCost(logC(X0)) - yTwh(linE(X0))
    for (let yr = X0 + 0.05; yr <= X1; yr += 0.05) {
      const d = yCost(logC(yr)) - yTwh(linE(yr))
      if (prev === 0 || (prev < 0) !== (d < 0)) {
        return { year: yr, x: xFor(yr), y: yTwh(linE(yr)), twh: linE(yr), cost: logC(yr) }
      }
      prev = d
    }
    return null
  })()

  // frontier inset geometry (bottom-left, inside the plot)
  const insW = 232
  const insH = 116
  const insX = PAD_L + 20
  const insY = VH - PAD_B - insH - 14
  const fX = linScale(2024, 2030, insX + 40, insX + insW - 12)
  const fY = logScale(20000, 80, insY + 16, insY + insH - 22) // MW, high→top
  const frontierPath = smoothPath(FRONTIER.map((d) => [fX(d.year), fY(d.mw)]))

  // ---- interpolated readout for the scrubbed year ------------------------
  const interp = (year: number) => {
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
    const cost = Math.pow(
      10,
      Math.log10(lo.cost) + t * (Math.log10(hi.cost) - Math.log10(lo.cost)),
    )
    const twh = lo.twh + t * (hi.twh - lo.twh)
    return { cost, twh }
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
  const { cost: aCost, twh: aTwh } = interp(aYear)
  const ax = xFor(aYear)
  const ayCost = yCost(aCost)
  const ayTwh = yTwh(aTwh)
  const aProj = aYear > SPLIT
  const aShare = sharePct(aTwh)
  const cheaper = Math.round(100 / aCost) // ×-cheaper vs 2021
  const cheaperLabel =
    cheaper >= 1000
      ? `${(cheaper / 1000).toFixed(cheaper >= 10000 ? 0 : 1)},000×`
      : `${cheaper}×`

  const motion = (t: string) => (reduced ? undefined : t)
  const splitX = xFor(SPLIT)

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker="Fig., The energy scissors · cost per unit of intelligence ↓ vs total AI electricity ↑ · 2021–2030"
      caption={
        <>
          <strong style={{ color: p.ink, fontStyle: "normal" }}>
            {Math.round(aYear)}: unit cost ~{fmtCost(aCost)} of 2021 ({cheaperLabel} cheaper) ·{" "}
            {fmtTwh(aTwh)}, ~{aShare.toFixed(1)}% of global
          </strong>
          {aProj ? " (projection)" : ""}. The deflation is in the unit; the explosion is in
          the volume, Jevons, drawn once. Total energy is the binding constraint. Source: IEA{" "}
          <span style={{ fontStyle: "italic" }}>Energy and AI</span> (2025) · Epoch AI.
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
        aria-label="The energy scissors, 2021 to 2030. A falling copper line on a logarithmic left axis shows the cost of a unit of intelligence collapsing from one hundred percent of its 2021 value to about one-thousandth of a percent, roughly a thousandfold cheaper. A rising teal line and bars on a linear right axis show total AI and data-centre electricity climbing from about 230 terawatt-hours to 945 terawatt-hours by 2030, around three percent of global electricity and comparable to Japan's entire consumption. The two curves cross around the mid-2020s: the Jevons paradox, where each unit gets cheaper yet the total burned explodes. An inset tracks frontier training-run power rising from roughly 125 megawatts in 2024 toward 4 to 16 gigawatts by 2030. Historical through 2024, projection thereafter. Sources: the IEA Energy and AI report 2025 and Epoch AI."
        onPointerMove={onMove}
      >
        <defs>
          <linearGradient id="es-twh-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.series.teal} stopOpacity={mode === "dark" ? 0.24 : 0.16} />
            <stop offset="100%" stopColor={p.series.teal} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="es-cost-proj" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.series.copper} />
            <stop offset="100%" stopColor={p.series.gold} />
          </linearGradient>
          <radialGradient id="es-bloom" cx="84%" cy="86%" r="64%">
            <stop offset="0%" stopColor={`rgba(${p.glowRGB},${mode === "dark" ? 0.16 : 0.1})`} />
            <stop offset="70%" stopColor={`rgba(${p.glowRGB},0)`} />
          </radialGradient>
        </defs>

        {/* atmospheric bloom toward the rising-energy corner */}
        <rect x={0} y={0} width={VW} height={VH} fill="url(#es-bloom)" />

        {/* left (cost, log) decade hairlines + % labels */}
        {COST_DECADES.map((d) => {
          const y = yCost(d)
          return (
            <g key={`c-${d}`}>
              <line x1={PAD_L} x2={VW - PAD_R} y1={y} y2={y} stroke={p.hair} strokeWidth={1} />
              <text
                x={PAD_L - 12}
                y={y + 4}
                textAnchor="end"
                fontFamily="var(--font-mono), monospace"
                fontSize={12}
                fill={p.series.copper}
                fillOpacity={0.85}
              >
                {fmtCost(d)}
              </text>
            </g>
          )
        })}

        {/* right (TWh, linear) ticks + labels */}
        {TWH_TICKS.map((t) => {
          const y = yTwh(t)
          return (
            <g key={`t-${t}`}>
              {t > 0 && (
                <line
                  x1={PAD_L}
                  x2={VW - PAD_R}
                  y1={y}
                  y2={y}
                  stroke={p.series.teal}
                  strokeOpacity={0.1}
                  strokeWidth={1}
                  strokeDasharray="1 6"
                />
              )}
              <text
                x={VW - PAD_R + 12}
                y={y + 4}
                textAnchor="start"
                fontFamily="var(--font-mono), monospace"
                fontSize={12}
                fill={p.series.teal}
                fillOpacity={0.85}
              >
                {t === 0 ? "0" : t}
              </text>
            </g>
          )
        })}

        {/* axis titles */}
        <text
          x={PAD_L - 12}
          y={PAD_T - 22}
          textAnchor="end"
          fontFamily="var(--font-mono), monospace"
          fontSize={10}
          letterSpacing={1}
          fill={p.series.copper}
        >
          UNIT COST · % of 2021 ↓
        </text>
        <text
          x={VW - PAD_R + 12}
          y={PAD_T - 22}
          textAnchor="end"
          fontFamily="var(--font-mono), monospace"
          fontSize={10}
          letterSpacing={1}
          fill={p.series.teal}
        >
          TOTAL TWh ↑
        </text>

        {/* historical / projection split */}
        <line
          x1={splitX}
          x2={splitX}
          y1={PAD_T}
          y2={VH - PAD_B}
          stroke={p.soft}
          strokeOpacity={0.5}
          strokeWidth={1}
          strokeDasharray="2 5"
        />
        {/* year ticks */}
        {[2021, 2023, 2024, 2026, 2028, 2030].map((y) => {
          const isActive = Math.round(aYear) === y
          return (
            <g key={`yt-${y}`}>
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
          x={(PAD_L + splitX) / 2}
          y={VH - 14}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={11}
          letterSpacing={2}
          fill={p.soft}
        >
          HISTORICAL
        </text>
        <text
          x={(splitX + VW - PAD_R) / 2}
          y={VH - 14}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={11}
          letterSpacing={2}
          fill={p.soft}
        >
          PROJECTION
        </text>

        {/* RISING — per-year TWh bars (faint) under the line */}
        {SERIES.map((d) => {
          const bw = 12
          const x = xFor(d.year) - bw / 2
          const y = yTwh(d.twh)
          return (
            <rect
              key={`bar-${d.year}`}
              x={x}
              y={y}
              width={bw}
              height={VH - PAD_B - y}
              fill={p.series.teal}
              fillOpacity={d.proj ? 0.14 : 0.22}
              rx={2}
            />
          )
        })}

        {/* RISING — area + line (whole span) */}
        <path d={twhAreaPath} fill="url(#es-twh-area)" />
        <path
          d={twhPath}
          fill="none"
          stroke={p.series.teal}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {SERIES.map((d) => (
          <circle
            key={`tn-${d.year}`}
            cx={xFor(d.year)}
            cy={yTwh(d.twh)}
            r={3.2}
            fill={p.bg}
            stroke={p.series.teal}
            strokeWidth={2}
          />
        ))}

        {/* FALLING — projection (dashed, gradient) then historical (solid) */}
        <path
          d={costProjPath}
          fill="none"
          stroke="url(#es-cost-proj)"
          strokeWidth={3}
          strokeDasharray="7 6"
          strokeOpacity={0.85}
          strokeLinecap="round"
        />
        <path
          d={costHistPath}
          fill="none"
          stroke={p.series.copper}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {SERIES.map((d) => (
          <circle
            key={`cn-${d.year}`}
            cx={xFor(d.year)}
            cy={yCost(d.cost)}
            r={3.2}
            fill={p.bg}
            stroke={d.proj ? p.series.gold : p.series.copper}
            strokeWidth={2}
          />
        ))}

        {/* end-of-line labels */}
        <text
          x={xFor(2021) + 8}
          y={yCost(100) - 12}
          fontFamily="var(--font-mono), monospace"
          fontSize={11}
          letterSpacing={0.4}
          fill={p.series.copper}
        >
          cost per unit ↓ ~1,000×
        </text>
        <text
          x={VW - PAD_R - 6}
          y={yTwh(945) - 14}
          textAnchor="end"
          fontFamily="var(--font-mono), monospace"
          fontSize={11}
          letterSpacing={0.4}
          fill={p.series.teal}
        >
          total electricity ↑ ~945 TWh ≈ Japan
        </text>

        {/* CROSSING — the verdict */}
        {crossing && (
          <g style={{ pointerEvents: "none" }}>
            <circle
              cx={crossing.x}
              cy={crossing.y}
              r={15}
              fill={p.accent}
              fillOpacity={0.14}
              style={{
                transformOrigin: `${crossing.x}px ${crossing.y}px`,
                animation: motion("es-pulse 3s ease-in-out infinite"),
              }}
            />
            <circle cx={crossing.x} cy={crossing.y} r={5.5} fill={p.accent} stroke={p.bg} strokeWidth={2} />
            {(() => {
              // park the label above-left of the crossing, clamped inside
              const lx = clamp(crossing.x - 8, PAD_L + 150, VW - PAD_R - 8)
              const ly = clamp(crossing.y - 30, PAD_T + 34, VH - PAD_B - 40)
              return (
                <>
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="end"
                    fontFamily="var(--font-serif), serif"
                    fontStyle="italic"
                    fontSize={15}
                    fontWeight={600}
                    fill={p.ink}
                  >
                    JEVONS
                  </text>
                  <text
                    x={lx}
                    y={ly + 17}
                    textAnchor="end"
                    fontFamily="var(--font-serif), serif"
                    fontStyle="italic"
                    fontSize={12.5}
                    fill={p.muted}
                  >
                    cheaper per unit, more in total
                  </text>
                </>
              )
            })()}
          </g>
        )}

        {/* ---- frontier-training-power inset (log) ---- */}
        <g>
          <rect
            x={insX}
            y={insY}
            width={insW}
            height={insH}
            rx={8}
            fill={mode === "dark" ? "rgba(8,18,34,0.62)" : "rgba(255,255,255,0.58)"}
            stroke={p.hair}
            strokeWidth={1}
          />
          <text
            x={insX + 12}
            y={insY + 18}
            fontFamily="var(--font-mono), monospace"
            fontSize={10}
            letterSpacing={1}
            fill={p.soft}
          >
            FRONTIER TRAINING-RUN POWER
          </text>
          {/* log guides at 100 MW / 1 GW / 10 GW */}
          {[100, 1000, 10000].map((mw) => {
            const y = fY(mw)
            return (
              <g key={`fg-${mw}`}>
                <line
                  x1={insX + 40}
                  x2={insX + insW - 12}
                  y1={y}
                  y2={y}
                  stroke={p.hair}
                  strokeWidth={1}
                />
                <text
                  x={insX + 36}
                  y={y + 3}
                  textAnchor="end"
                  fontFamily="var(--font-mono), monospace"
                  fontSize={9}
                  fill={p.soft}
                >
                  {fmtMw(mw)}
                </text>
              </g>
            )
          })}
          <path
            d={frontierPath}
            fill="none"
            stroke={p.series.gold}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="5 4"
          />
          {FRONTIER.map((d) => (
            <circle
              key={`fn-${d.year}`}
              cx={fX(d.year)}
              cy={fY(d.mw)}
              r={2.8}
              fill={p.bg}
              stroke={p.series.gold}
              strokeWidth={1.6}
            />
          ))}
          <text
            x={fX(2024)}
            y={fY(125) + 16}
            textAnchor="start"
            fontFamily="var(--font-mono), monospace"
            fontSize={9.5}
            fill={p.series.gold}
          >
            ~125 MW &apos;24
          </text>
          <text
            x={fX(2030)}
            y={fY(9000) - 8}
            textAnchor="end"
            fontFamily="var(--font-mono), monospace"
            fontSize={9.5}
            fill={p.series.gold}
          >
            4–16 GW &apos;30
          </text>
        </g>

        {/* active scrub: vertical rule + a node on each curve + dual readout */}
        <line x1={ax} x2={ax} y1={PAD_T} y2={VH - PAD_B} stroke={p.accent} strokeOpacity={0.32} strokeWidth={1} />
        <circle cx={ax} cy={ayCost} r={6} fill={p.series.copper} stroke={p.bg} strokeWidth={2} />
        <circle cx={ax} cy={ayTwh} r={6} fill={p.series.teal} stroke={p.bg} strokeWidth={2} />
        {(() => {
          const right = ax > VW - 230
          const tx = right ? ax - 14 : ax + 14
          const anchor = right ? "end" : "start"
          // anchor the readout block near the midpoint between the two nodes
          const mid = clamp((ayCost + ayTwh) / 2 - 8, PAD_T + 40, VH - PAD_B - 30)
          return (
            <g style={{ pointerEvents: "none" }}>
              <text
                x={tx}
                y={mid - 26}
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
                y={mid - 9}
                textAnchor={anchor}
                fontFamily="var(--font-mono), monospace"
                fontSize={12}
                fill={p.series.copper}
              >
                unit ~{fmtCost(aCost)} of 2021
              </text>
              <text
                x={tx}
                y={mid + 8}
                textAnchor={anchor}
                fontFamily="var(--font-mono), monospace"
                fontSize={12}
                fill={p.series.teal}
              >
                {fmtTwh(aTwh)} · ~{aShare.toFixed(1)}%
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
          2021
        </span>
        <input
          type="range"
          min={X0}
          max={X1}
          step={1}
          value={Math.round(aYear)}
          onChange={(e) => setActive(Number(e.target.value))}
          aria-label="Scrub the year from 2021 to 2030 to read the unit cost of intelligence and the total AI electricity"
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

      <style>{`@keyframes es-pulse{0%,100%{opacity:.85;transform:scale(1)}50%{opacity:.3;transform:scale(1.5)}}`}</style>
    </PlateFrame>
  )
}
