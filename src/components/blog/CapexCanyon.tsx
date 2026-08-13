"use client"

/**
 * V38 — THE CAPEX CANYON  (Chapter 11, "Software 3.0: The Accelerant").
 *
 * Software 3.0 multiplies every gap in the essay because it rewards exactly what
 * Europe lacks: scale, capital, cheap energy, data and frontier compute. The
 * capital-intensity race is the purest expression of that — and Europe is barely
 * in it.
 *
 * On the near rim: the four US hyperscalers' combined 2026 AI / data-centre
 * capex — ~$725bn, up ~77% year-on-year (~$755bn including xAI + the Stargate
 * build-out) — a towering cyan/red cliff. On the far rim: Europe's combined
 * ~$60bn, a low ledge. Drawn literally to scale, that is a ~12–13× canyon. The
 * thin European response is stacked on its ledge so the reader can see how small
 * it is: the EU "AI Gigafactories" initiative (~$20bn) and Mistral's raises
 * (~€11.7bn Sep 2025 → ~€20bn in 2026 talks).
 *
 * The reader toggles "to scale": when on, the European ledge nearly vanishes
 * against the US cliff; when off, both rims are normalised so the European stack
 * stays legible. A caption stat carries the lab gap — OpenAI ~$852bn and
 * Anthropic ~$965bn valuations against Mistral ~$23bn (Europe's best, ~40×
 * smaller; ~$0.4bn ARR vs Anthropic ~$47bn).
 *
 * REVEAL: you cannot win a contest decided by capital intensity when you are
 * outspent twelve to one — the frontier is bought, and Europe is barely bidding.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (the scale morph is instant under reduced motion), keyboard-
 * reachable (native checkbox toggle + button), and meaningful at its default
 * (drawn to scale — the canyon already gaping) as the static fallback.
 *
 * Figures hard-coded. Sources: CNBC / company filings (2026 capex); Stanford AI
 * Index; TechCrunch (Mistral).
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  clamp01,
  lerp,
  easeInOut,
} from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

// The two rims, in $bn of 2026 AI / data-centre capex.
const US_CAPEX = 725 // four US hyperscalers, combined (~+77% YoY)
const US_PLUS = 755 // including xAI + the Stargate build-out
const EU_CAPEX = 60 // Europe, combined
const RATIO = US_CAPEX / EU_CAPEX // ~12.1× — the canyon width

// The thin European response, stacked on its ledge (in $bn).
type Slab = { key: string; label: string; amount: number }
const EU_STACK: Slab[] = [
  { key: "giga", label: "EU AI Gigafactories", amount: 20 },
  { key: "mistral26", label: "Mistral 2026 talks", amount: 20 },
  { key: "mistral25", label: "Mistral Sep 2025", amount: 13 },
]

// Plot frame (viewBox units).
const W = 920
const H = 540
const PADL = 60
const PADR = 60
const PADT = 132
const PADB = 92
const PLOT_TOP = PADT
const PLOT_BOT = H - PADB
const PLOT_H = PLOT_BOT - PLOT_TOP

// Rim geometry — the US cliff on the left, the EU ledge on the right.
const US_X = PADL + 96
const EU_X = W - PADR - 96
const CLIFF_W = 150
const LEDGE_W = 150

const fmtBn = (v: number) => `$${Math.round(v)}bn`

export function CapexCanyon() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // "to scale" — the literal 12× canyon. Default ON (the static reveal).
  const [toScale, setToScale] = useState(true)
  // s ∈ [0,1] tracks the morph between normalised (0) and to-scale (1).
  const [s, setS] = useState(reduced ? 1 : toScale ? 1 : 0)

  // Keep a live ref of s so the morph eases from wherever it currently sits.
  const sRef = useRef(s)
  sRef.current = s

  useEffect(() => {
    const target = toScale ? 1 : 0
    if (reduced) {
      setS(target)
      return
    }
    let raf = 0
    let t0 = 0
    const from = sRef.current
    const dur = 760
    const step = (ts: number) => {
      if (!t0) t0 = ts
      const prog = Math.min(1, (ts - t0) / dur)
      setS(lerp(from, target, easeInOut(prog)))
      if (prog < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toScale, reduced])

  // Bar heights. At scale (s=1) the EU ledge is RATIO× shorter than the US
  // cliff; off-scale (s=0) both rims are normalised so the stack stays legible.
  // The US cliff always tops out near the plot ceiling.
  const usH = PLOT_H * 0.92
  const euScaleH = usH / RATIO // EU at true scale (~7.6% of the cliff)
  const euNormH = PLOT_H * 0.64 // EU normalised, so the stack reads
  const euH = lerp(euNormH, euScaleH, clamp01(s))

  const usTop = PLOT_BOT - usH
  const euTop = PLOT_BOT - euH

  // unit-$ per pixel on each rim (for the European stack proportions).
  const euUnit = euH / EU_CAPEX

  const verdict = toScale
    ? {
        word: "OUTSPENT 12 TO 1",
        color: p.squeeze,
        line: "drawn to scale, the European ledge all but disappears against the cliff",
      }
    : {
        word: "BARELY BIDDING",
        color: p.leverage,
        line: "even magnified to legibility, Europe's whole response fits inside a rounding error of the US year",
      }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V38 · The Capex Canyon"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          US {fmtBn(US_CAPEX)} · EU {fmtBn(EU_CAPEX)} · {RATIO.toFixed(0)}×
        </span>
      }
      caption={
        <>
          The capital-intensity race Europe is not in. The four US hyperscalers&rsquo;{" "}
          <span style={{ color: p.squeeze }}>~${US_CAPEX}bn</span> of 2026 AI / data-centre capex (up ~77%
          year-on-year; ~${US_PLUS}bn including xAI + Stargate) towers over Europe&rsquo;s combined{" "}
          <span style={{ color: p.leverage }}>~${EU_CAPEX}bn</span>, a ~{RATIO.toFixed(0)}× canyon, drawn
          literally to scale. Toggle <strong>to scale</strong> and watch the European ledge, the EU AI
          Gigafactories (~$20bn) and Mistral&rsquo;s raises (~€11.7bn → ~€20bn), nearly vanish. The lab gap is
          the same shape: OpenAI ~$852bn and Anthropic ~$965bn against Mistral ~$23bn (Europe&rsquo;s best, ~40×
          smaller; ~$0.4bn ARR vs Anthropic ~$47bn). Sources: CNBC / company filings (2026 capex); Stanford AI
          Index; TechCrunch (Mistral).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`The 2026 AI capex canyon. On the near rim, the four US hyperscalers' combined ~$${US_CAPEX} billion of AI and data-centre capex (up ~77% year-on-year; ~$${US_PLUS} billion including xAI and Stargate). On the far rim, Europe's combined ~$${EU_CAPEX} billion, a roughly ${RATIO.toFixed(
          0,
        )}-times canyon. Europe's whole response, the EU AI Gigafactories at ~$20 billion and Mistral's raises, stacks onto that low ledge. ${
          toScale
            ? "Drawn to scale, the European ledge all but vanishes against the US cliff."
            : "Even magnified to legibility, Europe is barely bidding."
        } The frontier is bought, and Europe is outspent roughly twelve to one.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="cy-cliff" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={0.5} />
            <stop offset="55%" stopColor={p.squeeze} stopOpacity={0.32} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="cy-ledge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0.14} />
          </linearGradient>
          <radialGradient id="cy-void" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor={p.squeeze} stopOpacity={lerp(0.04, 0.18, clamp01(s))} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* THE READOUT — the spend on each rim + the ratio between them */}
        <text x={PADL} y={44} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          US hyperscaler AI capex · 2026
        </text>
        <text x={PADL - 3} y={100} fill={p.squeeze} style={{ fontSize: 50, fontWeight: 800, letterSpacing: "-0.01em" }}>
          ${US_CAPEX}bn
        </text>
        <text x={PADL} y={122} fill={p.muted} style={{ fontSize: 12 }}>
          up ~77% YoY · ~${US_PLUS}bn with xAI + Stargate
        </text>

        <text x={W - PADR} y={44} textAnchor="end" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Europe, combined · 2026
        </text>
        <text x={W - PADR + 3} y={100} textAnchor="end" fill={p.leverageHi} style={{ fontSize: 50, fontWeight: 800, letterSpacing: "-0.01em" }}>
          ${EU_CAPEX}bn
        </text>
        <text x={W - PADR} y={122} textAnchor="end" fill={p.muted} style={{ fontSize: 12 }}>
          a ~{RATIO.toFixed(0)}× canyon, to scale
        </text>

        {/* the canyon floor */}
        <line x1={PADL - 14} y1={PLOT_BOT} x2={W - PADR + 14} y2={PLOT_BOT} stroke={p.hair} strokeWidth={1.4} />
        {/* the void between the rims — deepens as it goes to scale */}
        <rect x={US_X + CLIFF_W / 2} y={PLOT_TOP} width={EU_X - LEDGE_W / 2 - (US_X + CLIFF_W / 2)} height={PLOT_H} fill="url(#cy-void)" />

        {/* ratio bracket spanning the chasm, anchored at the EU ledge top */}
        {(() => {
          const x1 = US_X + CLIFF_W / 2
          const x2 = EU_X - LEDGE_W / 2
          const midX = (x1 + x2) / 2
          const braceY = PLOT_TOP - 6
          return (
            <g opacity={0.9}>
              <path
                d={`M ${x1} ${braceY + 10} L ${x1} ${braceY} L ${x2} ${braceY} L ${x2} ${braceY + 10}`}
                fill="none"
                stroke={p.blueprint}
                strokeWidth={1}
              />
              <text x={midX} y={braceY - 7} textAnchor="middle" fill={p.soft} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>
                {RATIO.toFixed(0)}× THE CANYON
              </text>
            </g>
          )
        })()}

        {/* THE NEAR RIM — the US cliff (cyan-into-red, value bought at scale) */}
        <g>
          <rect
            x={US_X - CLIFF_W / 2}
            y={usTop}
            width={CLIFF_W}
            height={usH}
            rx={3}
            fill="url(#cy-cliff)"
            stroke={p.squeeze}
            strokeWidth={1.8}
          />
          {/* the leading bright edge — capability bought */}
          <line x1={US_X - CLIFF_W / 2} y1={usTop} x2={US_X + CLIFF_W / 2} y2={usTop} stroke={p.leverageHi} strokeWidth={2.4} />
          <text x={US_X} y={usTop - 14} textAnchor="middle" fill={p.squeezeHi} style={{ fontSize: 26, fontWeight: 800 }}>
            ${US_CAPEX}bn
          </text>
          <text x={US_X} y={PLOT_BOT + 24} textAnchor="middle" fill={p.muted} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
            US HYPERSCALERS
          </text>
          <text x={US_X} y={PLOT_BOT + 40} textAnchor="middle" fill={p.soft} style={{ fontSize: 11 }}>
            4 firms · the near rim
          </text>
        </g>

        {/* THE FAR RIM — the European ledge, with the response stacked on it */}
        <g>
          {/* the ledge outline */}
          <rect
            x={EU_X - LEDGE_W / 2}
            y={euTop}
            width={LEDGE_W}
            height={euH}
            rx={3}
            fill="url(#cy-ledge)"
            stroke={p.leverage}
            strokeWidth={1.8}
          />
          {/* the thin European response stacked inside the ledge */}
          {(() => {
            let cursor = PLOT_BOT
            return EU_STACK.map((slab, idx) => {
              const h = slab.amount * euUnit
              const top = cursor - h
              const bandTop = top
              cursor = top
              const labelVisible = h > 13
              return (
                <g key={slab.key}>
                  <rect
                    x={EU_X - LEDGE_W / 2 + 3}
                    y={bandTop}
                    width={LEDGE_W - 6}
                    height={Math.max(h - 2, 1)}
                    rx={2}
                    fill={rgba(p.glowRGB, 0)}
                    stroke="none"
                  />
                  <rect
                    x={EU_X - LEDGE_W / 2 + 3}
                    y={bandTop}
                    width={LEDGE_W - 6}
                    height={Math.max(h - 2, 1)}
                    rx={2}
                    fill={idx % 2 === 0 ? rgba("108,198,230", 0.22) : rgba("108,198,230", 0.12)}
                    stroke={p.leverage}
                    strokeWidth={0.8}
                  />
                  {labelVisible && (
                    <text
                      x={EU_X}
                      y={bandTop + h / 2 + 3.5}
                      textAnchor="middle"
                      fill={p.leverageHi}
                      style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.02em" }}
                    >
                      {fmtBn(slab.amount)}
                    </text>
                  )}
                </g>
              )
            })
          })()}
          <text x={EU_X} y={euTop - 12} textAnchor="middle" fill={p.leverageHi} style={{ fontSize: 22, fontWeight: 800 }}>
            ${EU_CAPEX}bn
          </text>
          <text x={EU_X} y={PLOT_BOT + 24} textAnchor="middle" fill={p.muted} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
            EUROPE, COMBINED
          </text>
          <text x={EU_X} y={PLOT_BOT + 40} textAnchor="middle" fill={p.soft} style={{ fontSize: 11 }}>
            Gigafactories + Mistral · the far rim
          </text>
        </g>

        {/* a leader line from the European stack out to its itemised legend */}
        {(() => {
          const lx = EU_X + LEDGE_W / 2 + 10
          const startY = euTop + 8
          return (
            <g opacity={s > 0.5 ? 1 : 0.55} style={{ transition: reduced ? "none" : "opacity 400ms ease" }}>
              <line x1={EU_X + LEDGE_W / 2} y1={euTop} x2={lx} y2={startY} stroke={p.blueprint} strokeWidth={1} />
              {EU_STACK.map((slab, idx) => (
                <text
                  key={slab.key}
                  x={lx}
                  y={startY + idx * 15}
                  fill={p.muted}
                  style={{ fontSize: 9.5, letterSpacing: "0.02em" }}
                >
                  <tspan fill={p.leverageHi} style={{ fontWeight: 700 }}>{fmtBn(slab.amount)}</tspan>
                  {"  "}
                  {slab.label}
                </text>
              ))}
            </g>
          )
        })()}

        {/* the verdict, anchored in the chasm */}
        <text
          x={(US_X + EU_X) / 2}
          y={PLOT_BOT - 16}
          textAnchor="middle"
          fill={toScale ? p.squeeze : p.leverage}
          style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em" }}
        >
          THE FRONTIER IS BOUGHT
        </text>
      </svg>

      {/* toggle + verdict */}
      <div className="mt-2 px-1">
        <p
          className="text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> —{" "}
          {verdict.line}.
        </p>

        {/* the lab gap — same shape, one register up */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]" style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}>
          <span>
            LAB GAP ·{" "}
            <span style={{ color: p.squeeze }}>OpenAI ~$852bn</span> ·{" "}
            <span style={{ color: p.squeeze }}>Anthropic ~$965bn</span> vs{" "}
            <span style={{ color: p.leverage }}>Mistral ~$23bn</span> (~40× smaller)
          </span>
          <span style={{ color: p.muted }}>
            ARR ~$0.4bn vs Anthropic ~$47bn
          </span>
        </div>

        <label className="mt-3 inline-flex cursor-pointer items-center gap-2.5 text-[12px]" style={{ color: p.muted }}>
          <input
            type="checkbox"
            checked={toScale}
            onChange={(e) => setToScale(e.target.checked)}
            aria-label="Draw the canyon to scale, so the European ledge shrinks to its true 12-times-smaller size"
            className="h-4 w-4 cursor-pointer"
            style={{ accentColor: p.squeeze }}
          />
          <span style={{ fontFamily: "var(--font-mono), monospace", letterSpacing: "0.06em" }}>
            DRAW TO SCALE{" "}
            <span style={{ color: toScale ? p.squeeze : p.soft }}>
              {toScale ? "· the canyon as it truly gapes" : "· ledge magnified to stay legible"}
            </span>
          </span>
        </label>
      </div>
    </PlateFrame>
  )
}
