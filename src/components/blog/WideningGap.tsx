"use client"

/**
 * V7 — THE WIDENING GAP  (Chapter 2, "The Map Out, Filed Under Noted").
 *
 * The Draghi report named the gap on every metric that compounds — and eighteen
 * months later each one had widened, not closed. This instrument is a selector
 * across those dimensions; each is a single diverging EU-vs-US bar pair — EUROPE
 * in blueprint cyan (the value Europe still holds), the UNITED STATES in the
 * reserved red (the lead pulling away) — with the multiple stated in a big mono
 * readout. Click or arrow through the dimensions; each shows the chasm plus a
 * one-line gloss. The reveal is structural: this is not one gap but a fan of
 * them, all opening at once.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native tablist buttons + ←/→ on the group), reduced-motion safe
 * (the bars carry no ambient animation — only the user's selection moves them),
 * and meaningful at its default (venture capital) as the static fallback.
 *
 * Figures hard-coded from the spec. Sources: Draghi 2024; Letta 2024; Atomico
 * State of European Tech 2025; ITIF; ECB (2026).
 */

import { useRef, useState } from "react"

import { PlateFrame, useReadMode, linScale, clamp } from "./read-chart-kit"
import { cpPalette } from "./chokepoint-kit"

type Dim = {
  key: string
  label: string
  unit: string
  eu: number // raw magnitude (same unit as us)
  us: number
  euLabel: string
  usLabel: string
  /** US ÷ EU, pre-computed for the readout (avoids unit drift). */
  factor: number
  factorLabel: string
  gloss: string
}

// Each dimension: a single number the report cited, and where it stands now.
const DIMS: Dim[] = [
  {
    key: "vc",
    label: "Venture capital",
    unit: "$bn / yr",
    eu: 66,
    us: 300,
    euLabel: "€66bn",
    usLabel: "$300bn",
    factor: 4.5,
    factorLabel: "~4.5×",
    gloss: "US venture deployment runs roughly 4–5× Europe's, year after year.",
  },
  {
    key: "capex",
    label: "AI & data-centre capex",
    unit: "$bn, 2026",
    eu: 10.6,
    us: 700,
    euLabel: "€10.6bn",
    usLabel: "$700bn",
    factor: 60,
    factorLabel: "~55–60×",
    gloss: "US private capex dwarfs Europe's sovereign compute pledge ~55–60×.",
  },
  {
    key: "latevc",
    label: "Late-stage VC share",
    unit: "% of global",
    eu: 9,
    us: 68,
    euLabel: "9%",
    usLabel: "68%",
    factor: 7.6,
    factorLabel: "~7.6×",
    gloss: "Europe wins 9% of global late-stage capital; the US takes 68%.",
  },
  {
    key: "unicorns",
    label: "Tech unicorns",
    unit: "count",
    eu: 48,
    us: 206,
    euLabel: "48",
    usLabel: "206",
    factor: 4.3,
    factorLabel: "~4.3×",
    gloss: "For every European unicorn minted, the US mints more than four.",
  },
  {
    key: "savings",
    label: "Savings idle in deposits",
    unit: "% of household savings",
    eu: 34.1,
    us: 12,
    euLabel: "34.1%",
    usLabel: "~12%",
    factor: 2.8,
    factorLabel: "~2.8×",
    gloss: "European savings sit in deposits, not equity — capital that never compounds.",
  },
]

// Plot frame (viewBox units). A pair of horizontal bars meeting at a centre gutter.
const W = 920
const H = 410
const PADL = 40
const PADR = 40
const PADT = 86
const ROW_H = 96
const GUTTER = 150 // half-width of the centre label channel
const CX = W / 2
const BAR_H = 50

const fmtFactor = (f: number) => (f >= 10 ? Math.round(f) : f.toFixed(1))

export function WideningGap() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)

  const [i, setI] = useState(0)
  const d = DIMS[i]

  // Per-dimension scale: the larger side fills the available half-width.
  const maxV = Math.max(d.eu, d.us)
  const halfMax = CX - GUTTER - PADL
  const lenFor = linScale(0, maxV, 0, halfMax)
  const euLen = lenFor(d.eu)
  const usLen = lenFor(d.us)

  const rowY = PADT + 40
  const euY = rowY
  const usY = rowY + ROW_H

  // ←/→ steps the selection; Home/End jump to the ends.
  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      setI((v) => clamp(v + 1, 0, DIMS.length - 1))
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      setI((v) => clamp(v - 1, 0, DIMS.length - 1))
    } else if (e.key === "Home") {
      e.preventDefault()
      setI(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setI(DIMS.length - 1)
    }
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V7 · The Widening Gap"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.squeezeHi }}
        >
          {i + 1}/{DIMS.length} · US {d.factorLabel}
        </span>
      }
      caption={
        <>
          The Draghi report mapped the gap on every metric that compounds; eighteen months on, each had
          widened. Click — or use ←/→ — through the dimensions. <span style={{ color: p.leverage }}>Europe</span>{" "}
          in cyan, the <span style={{ color: p.squeeze }}>United States</span> in red: not one gap but a fan
          of them, all opening. Sources: Draghi 2024; Letta 2024; Atomico State of European Tech 2025; ITIF;
          ECB (2026).
        </>
      }
    >
      {/* selector — a native tablist, keyboard-reachable */}
      <div
        role="tablist"
        aria-label="Choose a dimension of the EU–US gap"
        onKeyDown={onKey}
        className="mb-3 flex flex-wrap gap-1.5 px-1"
      >
        {DIMS.map((dim, idx) => {
          const active = idx === i
          return (
            <button
              key={dim.key}
              role="tab"
              type="button"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setI(idx)}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                padding: "5px 10px",
                borderRadius: 7,
                cursor: "pointer",
                whiteSpace: "nowrap",
                color: active ? p.bg : p.muted,
                border: `1px solid ${active ? p.squeeze : p.hair}`,
                background: active ? p.squeeze : "transparent",
                fontWeight: active ? 700 : 400,
              }}
            >
              {dim.label}
            </button>
          )
        })}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${d.label}: Europe ${d.euLabel} versus the United States ${d.usLabel} — a gap of about ${fmtFactor(
          d.factor,
        )} times`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="wg-eu" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.95} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0.55} />
          </linearGradient>
          <linearGradient id="wg-us" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={0.95} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0.55} />
          </linearGradient>
        </defs>

        {/* centre spine — the gutter the two sides diverge from */}
        <line x1={CX} y1={PADT - 6} x2={CX} y2={usY + BAR_H + 18} stroke={p.blueprint} strokeWidth={1} />

        {/* dimension title + unit */}
        <text x={CX} y={36} textAnchor="middle" fill={p.ink} style={{ fontSize: 19, fontWeight: 800 }}>
          {d.label}
        </text>
        <text
          x={CX}
          y={56}
          textAnchor="middle"
          fill={p.soft}
          style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase" }}
        >
          {d.unit}
        </text>

        {/* EUROPE — cyan, growing left from the centre */}
        <g>
          <rect
            x={CX - euLen}
            y={euY}
            width={euLen}
            height={BAR_H}
            rx={3}
            fill="url(#wg-eu)"
            stroke={p.leverage}
            strokeWidth={1.2}
          />
          <text x={CX - 14} y={euY - 10} textAnchor="end" fill={p.leverage} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em" }}>
            EUROPE
          </text>
          <text x={CX - euLen - 12} y={euY + BAR_H / 2 + 9} textAnchor="end" fill={p.leverageHi} style={{ fontSize: 24, fontWeight: 800 }}>
            {d.euLabel}
          </text>
        </g>

        {/* UNITED STATES — red, growing right from the centre */}
        <g>
          <rect
            x={CX}
            y={usY}
            width={usLen}
            height={BAR_H}
            rx={3}
            fill="url(#wg-us)"
            stroke={p.squeeze}
            strokeWidth={1.2}
          />
          <text x={CX + 14} y={usY - 10} textAnchor="start" fill={p.squeeze} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em" }}>
            UNITED STATES
          </text>
          <text x={CX + usLen + 12} y={usY + BAR_H / 2 + 9} textAnchor="start" fill={p.squeezeHi} style={{ fontSize: 24, fontWeight: 800 }}>
            {d.usLabel}
          </text>
        </g>

        {/* the multiple — the chasm, stated in mono at the gutter */}
        <text x={CX} y={usY + BAR_H + 52} textAnchor="middle" fill={p.squeeze} style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {d.factorLabel}
        </text>
        <text x={CX} y={usY + BAR_H + 72} textAnchor="middle" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          the US lead
        </text>
      </svg>

      {/* gloss + the fan-of-gaps tick strip */}
      <div className="mt-2 px-1">
        {/* tick strip — every dimension as a widening notch; the live one lit */}
        <div className="flex items-end gap-2" aria-hidden>
          {DIMS.map((dim, idx) => {
            const active = idx === i
            // notch height encodes the factor on a gentle log-ish curve
            const t = clamp(Math.log10(dim.factor) / Math.log10(60), 0, 1)
            return (
              <div key={dim.key} className="flex-1">
                <div
                  style={{
                    height: 6 + t * 30,
                    borderRadius: 2,
                    background: active ? p.squeeze : p.hair,
                    border: `1px solid ${active ? p.squeeze : "transparent"}`,
                    transition: "background 200ms ease-out",
                  }}
                />
              </div>
            )
          })}
        </div>

        <p
          className="mt-3 text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: p.squeeze, fontStyle: "normal", fontWeight: 700 }}>{d.factorLabel}</span> —{" "}
          {d.gloss}
        </p>
      </div>
    </PlateFrame>
  )
}
