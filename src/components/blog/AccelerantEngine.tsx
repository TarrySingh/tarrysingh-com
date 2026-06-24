"use client"

/**
 * V39 — THE ACCELERANT ENGINE  (Chapter 11, "Software 3.0: The Accelerant").
 *
 * AI does not open a NEW gap. It multiplies every gap already in this essay,
 * because it rewards exactly what Europe lacks — scale, capital, cheap energy,
 * data, frontier compute. This instrument is the essay's thematic capstone: a
 * "multiplier" panel that lists the prior chapters' gaps as rows.
 *
 * Each row shows a "before" CYAN bar (the gap as you already read it) and, when
 * the reader pulls the single ACCELERANT lever — the AI era being switched on —
 * an amplified RED bar springs out to the row's multiplier, with a mono "×"
 * readout. The lever scrubs 0 → 1; every red bar grows in lockstep from its
 * cyan base to its multiplied length. The headline counter shows the aggregate
 * multiplier across all five gaps.
 *
 *   CAPITAL    Europe's savings funding US markets        ×2.3
 *   TALENT     the brain-drain to US labs                 ×3.0
 *   ENERGY     ~2.5× US industrial power vs the EU        ×2.5
 *   SCALE      Mag-7 market cap ≈ EU GDP                  ×4.0
 *   FRONTIER   US ~74% of AI compute vs Europe ~5–6%      ×13×
 *
 * REVEAL: every chapter you just read was the "before". This is the multiplier
 * — the machine just got a turbocharger, bolted to the side that was already
 * winning.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (the ▶ throttle-sweep is gated; reduced → the engine snaps to
 * full power), keyboard-reachable (native range + ▶ + ←/→ / Home / End), and
 * meaningful at its default (the accelerant fully engaged) as the static
 * fallback. role="img" + aria-label describe the live state.
 *
 * Figures hard-coded. Sources: Stanford AI Index 2026 (US 50 notable models in
 * 2025 vs Europe's ~3; US ~74% of AI compute vs Europe ~5–6%); the essay's own
 * prior-chapter figures (€300bn savings export; the brain-drain; ~2.5× US
 * power; Mag-7 ≈ EU GDP).
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  linScale,
  clamp,
  clamp01,
  lerp,
  easeOut,
} from "./read-chart-kit"
import { cpPalette } from "./chokepoint-kit"

type Gap = {
  key: string
  label: string
  /** the gap as the essay already framed it */
  detail: string
  /** "before" bar — the gap you already read, on a 0..1 scale */
  before: number
  /** the multiplier AI bolts on (the red bar reaches before × mult) */
  mult: number
  /** how the × reads as a mono badge */
  multLabel: string
}

// The essay's five gaps, in reading order. `before` is the relative size of the
// gap as already established; `mult` is how much the AI era amplifies it.
const GAPS: Gap[] = [
  { key: "capital", label: "CAPITAL", detail: "Europe's savings funding US markets", before: 0.30, mult: 2.3, multLabel: "×2.3" },
  { key: "talent", label: "TALENT", detail: "the brain-drain to US labs", before: 0.26, mult: 3.0, multLabel: "×3.0" },
  { key: "energy", label: "ENERGY", detail: "~2.5× US industrial power vs the EU", before: 0.34, mult: 2.5, multLabel: "×2.5" },
  { key: "scale", label: "SCALE", detail: "Mag-7 market cap ≈ EU GDP", before: 0.22, mult: 4.0, multLabel: "×4.0" },
  { key: "frontier", label: "FRONTIER", detail: "US ~74% of AI compute · 50 models vs ~3", before: 0.07, mult: 13.0, multLabel: "×13" },
]
const N = GAPS.length

// Aggregate multiplier the headline counter sweeps to (mean of the gap mults).
const AGG_MULT = GAPS.reduce((s, g) => s + g.mult, 0) / N

// Plot frame (viewBox units).
const W = 920
const H = 560
const PADL = 132
const PADR = 96
const PADT = 150
const PADB = 60
const PLOT_TOP = PADT
const PLOT_BOT = H - PADB
const TRACK_X0 = PADL
const TRACK_X1 = W - PADR
const TRACK_LEN = TRACK_X1 - TRACK_X0

// Row geometry.
const rowY = linScale(0, N - 1, PLOT_TOP + 22, PLOT_BOT - 22)
const ROW_H = (PLOT_BOT - PLOT_TOP) / N
const BAR_H = clamp(ROW_H * 0.34, 14, 26)

// Longest possible red bar (frontier at full power) sets the track scale so no
// bar overruns the frame: before × mult, max across gaps.
const MAX_REACH = Math.max(...GAPS.map((g) => g.before * g.mult))
const xLen = (v: number) => (clamp01(v / MAX_REACH)) * TRACK_LEN

export function AccelerantEngine() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // throttle ∈ [0, 1] — the ACCELERANT lever. Default: fully engaged (the
  // static fallback already shows the multiplied engine).
  const [throttle, setThrottle] = useState(1)
  const [running, setRunning] = useState(false)
  const rafRef = useRef<number | null>(null)

  // ▶ — mechanical throttle-sweep from 0 → 1. Off under reduced motion.
  useEffect(() => {
    if (!running) return
    if (reduced) {
      setThrottle(1)
      setRunning(false)
      return
    }
    const t0 = performance.now()
    const DUR = 2200
    const tick = (now: number) => {
      const t = clamp01((now - t0) / DUR)
      setThrottle(easeOut(t))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setRunning(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [running, reduced])

  function sweep() {
    if (reduced) {
      setThrottle(1)
      return
    }
    setThrottle(0)
    setRunning(true)
  }

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    const STEP = 0.1
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      setRunning(false)
      setThrottle((v) => clamp01(v + STEP))
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      setRunning(false)
      setThrottle((v) => clamp01(v - STEP))
    } else if (e.key === "Home") {
      e.preventDefault()
      setRunning(false)
      setThrottle(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setRunning(false)
      setThrottle(1)
    }
  }

  // Live aggregate multiplier the headline reads (1× at rest → AGG_MULT at full).
  const liveAgg = lerp(1, AGG_MULT, throttle)
  const engaged = throttle > 0.02

  const verdict =
    throttle < 0.04
      ? { word: "AT REST", color: p.leverage, line: "every chapter you just read — the gaps exactly as you left them" }
      : throttle < 0.97
        ? { word: "ENGAGING", color: p.squeezeHi, line: "the same gaps, springing out — the multiplier is winding up" }
        : { word: "FULL POWER", color: p.squeeze, line: "a turbocharger, bolted to the side that was already winning" }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V39 · The Accelerant Engine"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          THROTTLE {Math.round(throttle * 100)}% · ×{liveAgg.toFixed(1)}
        </span>
      }
      caption={
        <>
          AI opens no new gap — it multiplies every gap already in this essay, because it rewards exactly what
          Europe lacks: scale, capital, cheap energy, data, frontier compute. Pull the{" "}
          <span style={{ color: p.squeeze }}>ACCELERANT</span> lever — range, ▶ or ←/→ — and watch each{" "}
          <span style={{ color: p.leverage }}>cyan &ldquo;before&rdquo; gap</span> spring out into its{" "}
          <span style={{ color: p.squeeze }}>multiplied red</span>. The lever is the AI era being switched on.
          Sources: Stanford AI Index 2026 (US 50 notable models in 2025 vs Europe&rsquo;s ~3; US ~74% of AI
          compute vs ~5–6%); the essay&rsquo;s own prior-chapter figures.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`The accelerant engine. With the AI throttle at ${Math.round(
          throttle * 100,
        )} percent, the essay's five gaps — capital, talent, energy, scale and frontier compute — are amplified by an aggregate of ${liveAgg.toFixed(
          1,
        )} times. The frontier-compute gap multiplies the most, by thirteen times. Every chapter you read was the "before"; this is the multiplier, bolted to the side already winning.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="ae-before" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0.18} />
          </linearGradient>
          <linearGradient id="ae-mult" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.squeeze} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.squeezeHi} stopOpacity={0.16} />
          </linearGradient>
          <radialGradient id="ae-burn" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={lerp(0, 0.2, throttle)} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* THE HEADLINE READOUT — aggregate multiplier */}
        <text x={PADL} y={48} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          The accelerant · every gap, multiplied
        </text>
        <text x={PADL - 3} y={112} fill={engaged ? p.squeeze : p.leverage} style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.01em" }}>
          ×{liveAgg.toFixed(1)}
        </text>
        <text x={PADL} y={136} fill={p.muted} style={{ fontSize: 12.5 }}>
          aggregate amplification across the essay&rsquo;s five gaps
        </text>

        <text x={W - PADR} y={48} textAnchor="end" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Frontier compute · the sharpest
        </text>
        <text x={W - PADR + 3} y={112} textAnchor="end" fill={engaged ? p.squeezeHi : p.leverage} style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.01em" }}>
          ×{lerp(1, GAPS[N - 1].mult, throttle).toFixed(0)}
        </text>
        <text x={W - PADR} y={136} textAnchor="end" fill={p.muted} style={{ fontSize: 12.5 }}>
          US ~74% of AI compute · 50 models vs ~3
        </text>

        {/* the "before" baseline reference — where every cyan bar starts */}
        <line x1={TRACK_X0} y1={PLOT_TOP - 8} x2={TRACK_X0} y2={PLOT_BOT + 8} stroke={p.blueprint} strokeWidth={1} />
        <text x={TRACK_X0} y={PLOT_TOP - 16} textAnchor="middle" fill={p.soft} style={{ fontSize: 12, letterSpacing: "0.12em" }}>
          BEFORE
        </text>

        {/* THE GAP ROWS */}
        {GAPS.map((g, i) => {
          const y = rowY(i)
          const beforeLen = xLen(g.before)
          const reach = lerp(g.before, g.before * g.mult, throttle)
          const reachLen = xLen(reach)
          const liveMult = lerp(1, g.mult, throttle)
          const active = throttle > 0.02
          return (
            <g key={g.key}>
              {/* row label */}
              <text x={PADL - 16} y={y + 5} textAnchor="end" fill={p.ink} style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em" }}>
                {g.label}
              </text>
              {/* the gap as the essay framed it — full-width line beneath the bar */}
              <text x={TRACK_X0} y={y + BAR_H / 2 + 15} fill={p.soft} style={{ fontSize: 12 }}>
                {g.detail}
              </text>

              {/* faint full-track hairline */}
              <line x1={TRACK_X0} y1={y} x2={TRACK_X1} y2={y} stroke={p.hair} strokeWidth={1} strokeDasharray="2 6" />

              {/* the amplified RED bar — springs out from the cyan base */}
              <rect
                x={TRACK_X0}
                y={y - BAR_H / 2}
                width={Math.max(reachLen, 2)}
                height={BAR_H}
                rx={3}
                fill="url(#ae-mult)"
                stroke={active ? p.squeeze : "none"}
                strokeWidth={1.2}
                opacity={active ? 1 : 0}
              />
              {/* the "before" CYAN bar — the gap you already read, sat on top */}
              <rect
                x={TRACK_X0}
                y={y - BAR_H / 2}
                width={Math.max(beforeLen, 2)}
                height={BAR_H}
                rx={3}
                fill="url(#ae-before)"
                stroke={p.leverage}
                strokeWidth={1.6}
              />
              {/* the seam where multiplied overtakes before */}
              {active && reachLen > beforeLen + 1 && (
                <line
                  x1={TRACK_X0 + beforeLen}
                  y1={y - BAR_H / 2 - 3}
                  x2={TRACK_X0 + beforeLen}
                  y2={y + BAR_H / 2 + 3}
                  stroke={p.squeezeHi}
                  strokeWidth={1.4}
                />
              )}

              {/* the live × multiplier readout at the bar's tip */}
              <text
                x={clamp(TRACK_X0 + reachLen + 12, TRACK_X0 + 12, TRACK_X1 + 6)}
                y={y + 5}
                fill={active ? p.squeezeHi : p.leverage}
                style={{ fontSize: 16, fontWeight: 800 }}
              >
                ×{liveMult.toFixed(1)}
              </text>
            </g>
          )
        })}

        {/* full-power "engaged" wash behind the rows */}
        {throttle > 0.5 && (
          <rect
            x={TRACK_X0}
            y={PLOT_TOP - 4}
            width={TRACK_LEN}
            height={PLOT_BOT - PLOT_TOP + 8}
            fill="url(#ae-burn)"
            pointerEvents="none"
          />
        )}
      </svg>

      {/* THE LEVER + verdict + scrubber */}
      <div className="mt-2 px-1" onKeyDown={onKey}>
        {/* rest-cyan ⟷ engaged-red power meter */}
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
          <div
            style={{
              width: `${(1 - throttle) * 100}%`,
              height: "100%",
              background: p.leverage,
              float: "left",
              transition: running || reduced ? "none" : "width 320ms ease-out",
            }}
          />
          <div
            style={{
              width: `${throttle * 100}%`,
              height: "100%",
              background: p.squeeze,
              float: "left",
              transition: running || reduced ? "none" : "width 320ms ease-out",
            }}
          />
        </div>

        <p
          className="mt-3 text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> —{" "}
          {verdict.line}.
        </p>

        {/* the ACCELERANT lever + ▶ throttle-sweep */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (running ? setRunning(false) : sweep())}
            aria-label={running ? "Pause the accelerant sweep" : "Engage the accelerant — sweep the throttle from rest to full power"}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 11px",
              borderRadius: 7,
              cursor: "pointer",
              whiteSpace: "nowrap",
              color: p.squeezeHi,
              border: `1px solid ${p.squeeze}`,
              background: "transparent",
            }}
          >
            {running ? "❙❙ pause" : "▶ engage"}
          </button>
          <span style={{ fontFamily: "var(--font-mono), monospace", color: p.leverage, fontSize: 11, whiteSpace: "nowrap" }}>
            ◂ REST
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={throttle}
            onChange={(e) => {
              setRunning(false)
              setThrottle(clamp01(Number(e.target.value)))
            }}
            aria-label="Pull the accelerant lever from rest to full power, amplifying every gap in the essay"
            aria-valuetext={
              throttle < 0.04
                ? "At rest: every gap as the essay left it"
                : `Throttle ${Math.round(throttle * 100)} percent: aggregate amplification ${liveAgg.toFixed(1)} times`
            }
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: engaged ? p.squeeze : p.leverage, background: p.hair }}
          />
          <span style={{ fontFamily: "var(--font-mono), monospace", color: p.squeeze, fontSize: 11, whiteSpace: "nowrap" }}>
            FULL ▸
          </span>
        </div>
      </div>
    </PlateFrame>
  )
}
