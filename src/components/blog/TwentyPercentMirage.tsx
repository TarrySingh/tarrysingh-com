"use client"

/**
 * V14 — THE 20% MIRAGE  (Chapter 4, "The Chokepoint We Spent: Semiconductors").
 *
 * The EU Chips Act (€43bn) set a target: 20% of global semiconductor
 * manufacturing by 2030. The instrument is a half-circle gauge. A cyan needle
 * / arc tracks the ACTUAL trajectory — ~10% today, projected ~11.7% by 2030 —
 * sitting far short of a GOLD 20% TARGET marker. The European Court of Auditors'
 * verdict (Special Report 12/2025, Dec 2025) is stamped on it: "VERY UNLIKELY".
 *
 * A toggle flips the whole plate between two truths:
 *   • THE PRESS RELEASE — the 20% ambition, the gold crown-jewel number.
 *   • THE FIELD IN SAXONY-ANHALT — the reality: Intel's Magdeburg fab
 *     (~€30bn + ~€10bn German state aid), CANCELLED July 2025, the site now
 *     reverting to a generic business park. A RED tombstone marks the casualty.
 *
 * REVEAL: the target was a communiqué; the fab is a field.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native checkbox toggle + button), reduced-motion safe (the toggle's
 * only motion is gated; reduced renders each state meaningfully), and meaningful
 * at its default — the press-release face stands as the static fallback.
 *
 * Figures hard-coded. Sources: EU Chips Act (€43bn); European Court of Auditors,
 * Special Report 12/2025; Intel Magdeburg cancellation (Jul 2025).
 */

import { useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  linScale,
  lerp,
  clamp01,
} from "./read-chart-kit"
import { cpPalette, mixHex, rgba } from "./chokepoint-kit"

// The figures, hard-coded from the spec.
const NOW = 10.0 // % of global semi manufacturing today
const PROJ_2030 = 11.7 // % projected for 2030 on the actual trajectory
const TARGET = 20.0 // % — the EU Chips Act 2030 communiqué target
const GAUGE_MAX = 25.0 // gauge full-scale (gives the 20% marker headroom)

// Gauge geometry — a 180° half-circle dial.
const CX = 430
const CY = 348
const R = 252 // needle/arc radius
const A0 = Math.PI // left end of the dial (0%)
const A1 = 0 // right end of the dial (GAUGE_MAX)

// value (%) → angle on the dial
const angleFor = (v: number) => lerp(A0, A1, clamp01(v / GAUGE_MAX))
// polar → cartesian on the dial
const ptAt = (v: number, r: number): [number, number] => {
  const a = angleFor(v)
  return [CX + Math.cos(a) * r, CY - Math.sin(a) * r]
}
// SVG arc path between two values along the dial radius `r`
function arcPath(v0: number, v1: number, r: number): string {
  const [x0, y0] = ptAt(v0, r)
  const [x1, y1] = ptAt(v1, r)
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`
}

export function TwentyPercentMirage() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // false → the press release (ambition); true → the field (reality).
  const [field, setField] = useState(false)
  const t = field ? 1 : 0 // morph parameter (kept binary; transitions ease in CSS)

  const trans = reduced ? "none" : "all 620ms cubic-bezier(0.65,0,0.35,1)"

  // Needle reads the projected trajectory in both faces, but the field face
  // foregrounds the gap; the press-release face foregrounds the gold target.
  const needleVal = PROJ_2030
  const [nx, ny] = ptAt(needleVal, R - 14)
  const [tgx, tgy] = ptAt(TARGET, R + 4)
  const [tgInX, tgInY] = ptAt(TARGET, R - 64)

  const verdict = field
    ? { word: "A FIELD", color: p.squeezeHi, line: "the fab is cancelled; the site reverts to a business park" }
    : { word: "A COMMUNIQUÉ", color: p.wonderHi, line: "the 20% target the auditors call “very unlikely”" }

  // Ticks across the dial.
  const ticks = [0, 5, 10, 15, 20, 25]

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V14 · The 20% Mirage"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {field ? "THE FIELD" : "THE PRESS RELEASE"}
        </span>
      }
      caption={
        <>
          The EU Chips Act set a target: <span style={{ color: p.wonder }}>20% of global chip
          manufacturing by 2030</span>. The actual trajectory — ~10% today, ~11.7% projected —{" "}
          falls far short; the European Court of Auditors calls it{" "}
          <span style={{ color: p.squeeze }}>&ldquo;very unlikely&rdquo;</span>. Flip from the press
          release to the <span style={{ color: p.squeeze }}>field in Saxony-Anhalt</span>, where
          Intel&rsquo;s Magdeburg fab was cancelled. Sources: EU Chips Act (€43bn); European Court of
          Auditors, Special Report 12/2025; Intel Magdeburg cancellation (Jul 2025).
        </>
      }
    >
      <svg
        viewBox="0 0 1000 470"
        role="img"
        aria-label={
          field
            ? "The field in Saxony-Anhalt: a gauge showing Europe's chip-manufacturing trajectory reaching only ~11.7% by 2030 against the 20% target, with a red tombstone marking Intel's cancelled Magdeburg fab"
            : "The press release: a gauge showing the EU Chips Act's 20% by 2030 target in gold, with the actual trajectory reaching only ~11.7%, stamped 'very unlikely' by the European Court of Auditors"
        }
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="tm-gold-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.wonderHi} stopOpacity={0.55} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0} />
          </radialGradient>
          <marker id="tm-gap" markerWidth="8" markerHeight="8" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={p.squeeze} />
          </marker>
        </defs>

        {/* dial backplate — faint blueprint track */}
        <path d={arcPath(0, GAUGE_MAX, R)} fill="none" stroke={p.hair} strokeWidth={26} strokeLinecap="round" />

        {/* the SHORTFALL band — target back to actual, in red (the gap not reached) */}
        <path
          d={arcPath(needleVal, TARGET, R)}
          fill="none"
          stroke={rgba(p.glowRGB, 0)}
          strokeWidth={26}
          strokeLinecap="butt"
          style={{ stroke: p.squeeze, strokeOpacity: lerp(0.22, 0.5, t), transition: trans }}
        />

        {/* the ACTUAL trajectory arc — cyan, 0 → ~11.7% */}
        <path
          d={arcPath(0, needleVal, R)}
          fill="none"
          stroke={p.leverage}
          strokeWidth={26}
          strokeLinecap="round"
        />

        {/* ticks + scale labels */}
        {ticks.map((v) => {
          const [ox, oy] = ptAt(v, R + 15)
          const [ix, iy] = ptAt(v, R + 2)
          const [lx, ly] = ptAt(v, R + 34)
          const isTarget = v === 20
          return (
            <g key={`tk-${v}`}>
              <line x1={ix} y1={iy} x2={ox} y2={oy} stroke={isTarget ? p.wonder : p.soft} strokeWidth={isTarget ? 2.4 : 1.4} />
              {/* the 20% target's numeric label is carried by the gold TARGET marker — skip it here to avoid a double-label */}
              {!isTarget && (
                <text x={lx} y={ly + 4} textAnchor="middle" fill={p.soft} style={{ fontSize: 11 }}>
                  {v}%
                </text>
              )}
            </g>
          )
        })}

        {/* THE GOLD 20% TARGET MARKER — crown-jewel ambition */}
        <g style={{ opacity: lerp(1, 0.42, t), transition: trans }}>
          <circle cx={tgx} cy={tgy} r={64} fill="url(#tm-gold-glow)" />
          <line x1={tgx} y1={tgy} x2={tgInX} y2={tgInY} stroke={p.wonder} strokeWidth={3} strokeLinecap="round" />
          <circle cx={tgx} cy={tgy} r={7.5} fill={p.wonderHi} stroke={p.bg} strokeWidth={1.5} />
          <text x={tgx + 14} y={tgy - 8} textAnchor="start" fill={p.wonderHi} style={{ fontSize: 14, fontWeight: 800 }}>
            TARGET · 20%
          </text>
          <text x={tgx + 14} y={tgy + 8} textAnchor="start" fill={p.muted} style={{ fontSize: 10.5 }}>
            EU Chips Act · by 2030
          </text>
        </g>

        {/* THE NEEDLE — actual projected trajectory (cyan) */}
        <line
          x1={CX}
          y1={CY}
          x2={nx}
          y2={ny}
          stroke={p.leverageHi}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <circle cx={CX} cy={CY} r={11} fill={mixHex(p.leverage, p.bg, 0.15)} stroke={p.leverageHi} strokeWidth={2} />

        {/* SHORTFALL connector — needle tip arrow reaching toward (never touching) target */}
        <line
          x1={ptAt(needleVal, R - 28)[0]}
          y1={ptAt(needleVal, R - 28)[1]}
          x2={ptAt(TARGET - 1.4, R - 28)[0]}
          y2={ptAt(TARGET - 1.4, R - 28)[1]}
          stroke={p.squeeze}
          strokeWidth={1.6}
          strokeDasharray="3 5"
          markerEnd="url(#tm-gap)"
          style={{ opacity: lerp(0.4, 0.92, t), transition: trans }}
        />

        {/* BIG READOUT — the projected number, cyan */}
        <text x={CX} y={CY - 96} textAnchor="middle" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em" }}>
          PROJECTED · 2030
        </text>
        <text x={CX} y={CY - 40} textAnchor="middle" fill={p.leverage} style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {PROJ_2030.toFixed(1)}%
        </text>
        <text x={CX} y={CY - 14} textAnchor="middle" fill={p.muted} style={{ fontSize: 12 }}>
          ~{NOW.toFixed(0)}% today · target {TARGET.toFixed(0)}%
        </text>

        {/* THE AUDITORS' STAMP — "VERY UNLIKELY", rotated like a rubber stamp */}
        <g transform={`translate(${CX}, ${CY + 44}) rotate(-7)`}>
          <rect
            x={-118}
            y={-22}
            width={236}
            height={44}
            rx={6}
            fill="none"
            stroke={p.squeeze}
            strokeWidth={2.4}
            strokeOpacity={0.85}
          />
          <text x={0} y={-2} textAnchor="middle" fill={p.squeezeHi} style={{ fontSize: 19, fontWeight: 800, letterSpacing: "0.06em" }}>
            VERY UNLIKELY
          </text>
          <text x={0} y={14} textAnchor="middle" fill={p.squeeze} style={{ fontSize: 10.5, letterSpacing: "0.12em" }}>
            EUROPEAN COURT OF AUDITORS · SR 12/2025
          </text>
        </g>

        {/* ── THE FIELD: Intel Magdeburg tombstone, fades in on the reality face ── */}
        <g style={{ opacity: t, transition: trans }} aria-hidden={!field}>
          {/* tombstone slab, lower-right */}
          <g transform="translate(840, 300)">
            <path
              d="M -64 96 L -64 -40 A 64 64 0 0 1 64 -40 L 64 96 Z"
              fill={rgba(p.glowRGB, 0.1)}
              stroke={p.squeeze}
              strokeWidth={2}
            />
            <text x={0} y={-8} textAnchor="middle" fill={p.squeezeHi} style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.04em" }}>
              MAGDEBURG
            </text>
            <text x={0} y={12} textAnchor="middle" fill={p.muted} style={{ fontSize: 10 }}>
              Intel mega-fab
            </text>
            <line x1={-44} y1={26} x2={44} y2={26} stroke={p.squeeze} strokeWidth={1} strokeOpacity={0.5} />
            <text x={0} y={46} textAnchor="middle" fill={p.squeezeHi} style={{ fontSize: 11, fontWeight: 700 }}>
              ~€30bn + €10bn aid
            </text>
            <text x={0} y={64} textAnchor="middle" fill={p.squeeze} style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em" }}>
              CANCELLED
            </text>
            <text x={0} y={80} textAnchor="middle" fill={p.muted} style={{ fontSize: 9.5 }}>
              Jul 2025 · now a business park
            </text>
          </g>
        </g>
      </svg>

      {/* readout + the press-release ⟷ field toggle */}
      <div className="mt-2 px-1">
        {/* gap meter: actual fill vs the gold target line */}
        <div className="relative mt-1 h-2.5 w-full overflow-visible rounded-full" style={{ background: p.hair }} aria-hidden>
          <div
            style={{
              width: `${linScale(0, GAUGE_MAX, 0, 100)(needleVal)}%`,
              height: "100%",
              borderRadius: 999,
              background: p.leverage,
            }}
          />
          <div
            className="absolute top-[-3px] h-[16px] w-[2px]"
            style={{ left: `${linScale(0, GAUGE_MAX, 0, 100)(TARGET)}%`, background: p.wonderHi }}
          />
          <span
            className="absolute top-[-18px] text-[9px] font-semibold uppercase tracking-wider"
            style={{
              left: `${linScale(0, GAUGE_MAX, 0, 100)(TARGET)}%`,
              transform: "translateX(-50%)",
              color: p.wonderHi,
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            20% target
          </span>
        </div>

        <p
          className="mt-4 text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span>{" "}
          — {verdict.line}.
        </p>

        {/* the toggle — press release ⟷ field in Saxony-Anhalt */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={field}
            onClick={() => setField((v) => !v)}
            aria-label={
              field
                ? "Showing the field in Saxony-Anhalt — switch back to the press release"
                : "Showing the press release — switch to the field in Saxony-Anhalt"
            }
            className="inline-flex items-center gap-2"
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "6px 12px",
              borderRadius: 8,
              cursor: "pointer",
              whiteSpace: "nowrap",
              color: field ? p.squeezeHi : p.wonderHi,
              border: `1px solid ${field ? p.squeeze : p.wonder}`,
              background: "transparent",
              transition: trans,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 26,
                height: 14,
                borderRadius: 999,
                background: field ? rgba(p.glowRGB, 0.45) : p.hair,
                position: "relative",
                display: "inline-block",
                flex: "0 0 auto",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: field ? 14 : 2,
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: field ? p.squeezeHi : p.wonderHi,
                  transition: trans,
                }}
              />
            </span>
            {field ? "THE FIELD ▸" : "◂ THE PRESS RELEASE"}
          </button>
          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: p.soft, fontSize: 11, whiteSpace: "nowrap" }}
          >
            gap to 20%: {(TARGET - PROJ_2030).toFixed(1)} pts
          </span>
        </div>
      </div>
    </PlateFrame>
  )
}
