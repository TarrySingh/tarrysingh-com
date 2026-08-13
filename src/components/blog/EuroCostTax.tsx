"use client"

/**
 * V25 — THE TAX OF BEING EUROPEAN  (Chapter 7, "The Electrons We Priced Out:
 * Energy").
 *
 * One kWh failure wears two costumes — factories switched off, the AI build-out
 * un-buildable — but underneath it is a single arithmetic. This instrument is a
 * cost-stack waterfall: take an identical industrial producer and ask only one
 * question — what does it cost to run the same plant on the US Gulf Coast versus
 * in Europe? The US baseline is set to 100 (cyan). On top of it the reader
 * stacks RED penalty bars, each a real input premium Europe pays for nothing but
 * its location:
 *   - electricity premium   (EU industrial power ~2.65× US — €0.199 vs €0.075/kWh)
 *   - natural-gas premium    (TTF ~5× Henry Hub, Jun 2026)
 *   - EU ETS carbon price    (a cost rivals on the Gulf Coast simply do not pay)
 *   - regulatory / compliance load (the Draghi report's "implicit tax")
 *
 * A mono readout shows the running total and the multiple vs the US = 100
 * baseline. Toggle each penalty on/off and watch location itself become a tax.
 *
 * REVEAL: in heavy industry, being European is not a market position; it is a
 * surcharge — the same plant, the same output, billed at a premium for its
 * postcode.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native toggle buttons), reduced-motion safe (bars ease only on the
 * reader's own toggle; gated behind usePrefersReducedMotion). Renders meaningfully
 * at its default — every penalty pre-stacked, the full European index already
 * drawn — as the static fallback.
 *
 * Figures hard-coded. Sources: Eurostat / IEA (industrial electricity €0.199 vs
 * €0.075/kWh); TTF vs Henry Hub (~5×, Jun 2026); EU ETS; Draghi report.
 */

import { useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  linScale,
} from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

type PenaltyKey = "power" | "gas" | "carbon" | "reg"

type Penalty = {
  key: PenaltyKey
  label: string
  short: string
  /** index points added on top of the US=100 baseline when this is on */
  points: number
  /** the multiple / figure that drives this premium, for the readout */
  factor: string
  gloss: string
}

// The US Gulf Coast baseline — the same plant, costed at 100.
const BASE = 100

// Each penalty is the extra index points Europe pays for that input alone.
// Calibrated so the full stack lands near the Draghi-era "being European"
// surcharge for energy-intensive industry (~1.5–1.6× the US plant).
const PENALTIES: Penalty[] = [
  {
    key: "power",
    label: "Electricity premium",
    short: "POWER",
    points: 26,
    factor: "≈2.65×",
    gloss:
      "EU industrial electricity ~€0.199/kWh against ~€0.075 on the US grid, the same machines, billed ~2.65× (Eurostat / IEA).",
  },
  {
    key: "gas",
    label: "Natural-gas premium",
    short: "GAS",
    points: 18,
    factor: "≈5×",
    gloss:
      "TTF gas trades ~5× Henry Hub (Jun 2026), the feedstock and heat for every furnace, priced at a multiple US rivals never see.",
  },
  {
    key: "carbon",
    label: "EU ETS carbon price",
    short: "ETS",
    points: 9,
    factor: "ETS",
    gloss:
      "Every tonne emitted carries an EU ETS price, a line item a Gulf Coast plant simply does not have on its bill.",
  },
  {
    key: "reg",
    label: "Regulatory / compliance",
    short: "REG",
    points: 8,
    factor: "Draghi",
    gloss:
      "Permitting, reporting and compliance load, the Draghi report's implicit tax on operating inside the single market.",
  },
]

// Plot frame (viewBox units). A single column waterfall, US base → EU index.
const W = 880
const H = 520
const PADL = 150
const PADR = 150
const PADT = 60
const PADB = 96
const PLOT_TOP = PADT
const PLOT_BOT = H - PADB

// The y-axis spans 0 → the full possible index (base + every penalty), with a
// little headroom, so the bars don't re-scale as the reader toggles.
const MAX_INDEX = BASE + PENALTIES.reduce((s, q) => s + q.points, 0)
const Y_TOP = Math.ceil((MAX_INDEX + 8) / 10) * 10
const yFor = linScale(0, Y_TOP, PLOT_BOT, PLOT_TOP)
const COL_X = PADL + 40
const COL_W = 260

export function EuroCostTax() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = cpPalette(mode)

  // Default: every penalty on — the full European index already drawn.
  const [on, setOn] = useState<Record<PenaltyKey, boolean>>({
    power: true,
    gas: true,
    carbon: true,
    reg: true,
  })

  const toggle = (k: PenaltyKey) => setOn((s) => ({ ...s, [k]: !s[k] }))

  const activePoints = PENALTIES.reduce((s, q) => s + (on[q.key] ? q.points : 0), 0)
  const total = BASE + activePoints
  const multiple = total / BASE
  const anyOn = activePoints > 0

  const trans = reduced ? "none" : "y 420ms cubic-bezier(.4,0,.2,1), height 420ms cubic-bezier(.4,0,.2,1)"

  // Stack the active penalties from the top of the US base upward, in order.
  let cursor = BASE
  const segs = PENALTIES.map((q) => {
    const live = on[q.key]
    const from = cursor
    const to = live ? cursor + q.points : cursor
    if (live) cursor = to
    return { q, from, to, live }
  })

  const verdict = anyOn
    ? {
        word: "A SURCHARGE",
        color: p.squeeze,
        line: "the same plant, the same output, billed at a premium for its postcode",
      }
    : {
        word: "PARITY",
        color: p.leverage,
        line: "strip the location penalties and the European plant costs exactly what the US one does",
      }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V25 · The Tax of Being European"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          INDEX {total} · {multiple.toFixed(2)}× US
        </span>
      }
      caption={
        <>
          Take one industrial producer and move it from the US Gulf Coast to Europe. The US plant is{" "}
          <span style={{ color: p.leverage }}>the 100 baseline</span>; each{" "}
          <span style={{ color: p.squeeze }}>red bar</span> is a real input premium Europe pays for nothing but
          its location, toggle them on and off. Electricity{" "}
          <span style={{ color: p.squeeze }}>~2.65×</span> (€0.199 vs €0.075/kWh), gas{" "}
          <span style={{ color: p.squeeze }}>~5×</span> TTF over Henry Hub, the EU ETS carbon price, and the
          regulatory load build a European cost index far above 100. Sources: Eurostat / IEA; TTF vs Henry Hub
          (~5×, Jun 2026); EU ETS; Draghi report.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Cost-stack waterfall. A US Gulf Coast industrial plant indexed at 100. With ${
          anyOn
            ? PENALTIES.filter((q) => on[q.key])
                .map((q) => q.label.toLowerCase())
                .join(", ")
            : "no location penalties"
        } applied, the same plant in Europe reaches a cost index of ${total}, or ${multiple.toFixed(
          2,
        )} times the US baseline.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="ect-base" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.4} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0.16} />
          </linearGradient>
          <linearGradient id="ect-pen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0.24} />
          </linearGradient>
        </defs>

        {/* gridlines + axis ticks every 25 index points */}
        {Array.from({ length: Y_TOP / 25 + 1 }, (_, k) => k * 25).map((v) => (
          <g key={`g-${v}`}>
            <line
              x1={PADL}
              y1={yFor(v)}
              x2={W - PADR}
              y2={yFor(v)}
              stroke={p.hair}
              strokeWidth={1}
              strokeDasharray={v === BASE ? "none" : "2 5"}
            />
            <text x={PADL - 12} y={yFor(v) + 4} textAnchor="end" fill={p.soft} style={{ fontSize: 11 }}>
              {v}
            </text>
          </g>
        ))}

        {/* the US baseline reference — 100, where the plant starts */}
        <text x={W - PADR + 12} y={yFor(BASE) - 6} fill={p.leverage} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em" }}>
          US GULF COAST = 100
        </text>
        <line x1={PADL} y1={yFor(BASE)} x2={W - PADR} y2={yFor(BASE)} stroke={p.leverage} strokeWidth={1.4} strokeOpacity={0.5} />

        {/* the US base block — the value the same plant holds anywhere (cyan) */}
        <rect
          x={COL_X}
          y={yFor(BASE)}
          width={COL_W}
          height={PLOT_BOT - yFor(BASE)}
          rx={3}
          fill="url(#ect-base)"
          stroke={p.leverage}
          strokeWidth={1.6}
        />
        <text x={COL_X + COL_W / 2} y={(yFor(BASE) + PLOT_BOT) / 2 + 2} textAnchor="middle" fill={p.leverage} style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em" }}>
          THE SAME PLANT
        </text>
        <text x={COL_X + COL_W / 2} y={(yFor(BASE) + PLOT_BOT) / 2 + 19} textAnchor="middle" fill={p.muted} style={{ fontSize: 11 }}>
          baseline cost · 100
        </text>

        {/* the red penalty segments, stacked on the US base */}
        {segs.map(({ q, from, to, live }) => {
          const yTo = yFor(to)
          const h = Math.max(0, yFor(from) - yTo)
          const midY = (yFor(from) + yTo) / 2
          return (
            <g key={q.key} style={{ transition: reduced ? "none" : "opacity 300ms" }} opacity={live ? 1 : 0}>
              <rect
                x={COL_X}
                y={yTo}
                width={COL_W}
                height={h}
                rx={3}
                fill="url(#ect-pen)"
                stroke={p.squeeze}
                strokeWidth={1.4}
                style={{ transition: trans }}
              />
              {/* connector + label to the right of the column */}
              <line x1={COL_X + COL_W} y1={midY} x2={COL_X + COL_W + 26} y2={midY} stroke={p.squeeze} strokeWidth={1} strokeOpacity={0.6} />
              <text x={COL_X + COL_W + 32} y={midY - 3} fill={p.squeezeHi} style={{ fontSize: 12, fontWeight: 700 }}>
                {q.label}
              </text>
              <text x={COL_X + COL_W + 32} y={midY + 13} fill={p.muted} style={{ fontSize: 10.5 }}>
                +{q.points} · {q.factor}
              </text>
            </g>
          )
        })}

        {/* the running-total cap — the European cost index, in mono, atop the stack */}
        {(() => {
          const capY = yFor(total)
          return (
            <g style={{ transition: trans }}>
              <line x1={COL_X - 14} y1={capY} x2={COL_X + COL_W + 14} y2={capY} stroke={anyOn ? p.squeezeHi : p.leverageHi} strokeWidth={2} />
              <text x={COL_X + COL_W / 2} y={capY - 30} textAnchor="middle" fill={anyOn ? p.squeezeHi : p.leverageHi} style={{ fontSize: 38, fontWeight: 800 }}>
                {total}
              </text>
              <text x={COL_X + COL_W / 2} y={capY - 13} textAnchor="middle" fill={p.muted} style={{ fontSize: 11, letterSpacing: "0.12em" }}>
                EUROPEAN COST INDEX · {multiple.toFixed(2)}× US
              </text>
            </g>
          )
        })()}

        {/* bracket on the left spanning the penalty stack — "the location tax" */}
        {anyOn && (
          <g>
            <path
              d={`M ${COL_X - 24} ${yFor(BASE)} q -12 0 -12 -12 v ${
                yFor(total) - yFor(BASE) + 24
              } q 0 -12 12 -12`}
              fill="none"
              stroke={rgba(p.glowRGB, 0.5)}
              strokeWidth={1.4}
            />
            <text
              x={COL_X - 44}
              y={(yFor(BASE) + yFor(total)) / 2}
              textAnchor="middle"
              fill={p.squeeze}
              transform={`rotate(-90 ${COL_X - 44} ${(yFor(BASE) + yFor(total)) / 2})`}
              style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em" }}
            >
              THE LOCATION TAX
            </text>
          </g>
        )}

        {/* x-axis label */}
        <text x={COL_X + COL_W / 2} y={PLOT_BOT + 28} textAnchor="middle" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.16em" }}>
          IDENTICAL OUTPUT · COST INDEXED TO THE US PLANT
        </text>
      </svg>

      {/* verdict + the penalty toggles */}
      <div className="mt-2 px-1">
        <p className="text-[15px]" style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}>
          Being European is not a market position; it is{" "}
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> ·{" "}
          {verdict.line}.
        </p>

        {/* stacked cost meter — cyan base vs the red location tax */}
        <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
          <div style={{ width: `${(BASE / MAX_INDEX) * 100}%`, height: "100%", background: p.leverage }} />
          <div style={{ width: `${(activePoints / MAX_INDEX) * 100}%`, height: "100%", background: p.squeeze, transition: reduced ? "none" : "width 420ms cubic-bezier(.4,0,.2,1)" }} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Toggle each European location penalty on or off">
          {PENALTIES.map((q) => {
            const active = on[q.key]
            return (
              <button
                key={q.key}
                type="button"
                onClick={() => toggle(q.key)}
                aria-pressed={active}
                title={q.gloss}
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12,
                  padding: "6px 13px",
                  borderRadius: 999,
                  cursor: "pointer",
                  color: active ? p.bg : p.squeeze,
                  background: active ? p.squeeze : "transparent",
                  border: `1px solid ${active ? p.squeeze : p.hair}`,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {active ? "−" : "+"} {q.short} · +{q.points}
              </button>
            )
          })}
        </div>
      </div>
    </PlateFrame>
  )
}
