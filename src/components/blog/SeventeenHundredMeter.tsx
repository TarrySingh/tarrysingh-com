"use client"

/**
 * V3 — THE €1,700 METER  (Chapter 1, The Netherlands).
 *
 * An abstract productivity gap, turned into money leaving each citizen's pocket
 * as you read. Two diverging paths climb out of 2010: the ACTUAL Dutch path
 * (~0.4%/yr productivity growth, muted ink) and the PATH NOT TAKEN — the ghost
 * line that grows at the frontier/peer rate (~1.6%/yr, copper-gold wonder). The
 * shaded wedge between them IS the cumulative loss; a big mono counter reads the
 * euros-per-citizen-per-year forgone, climbing toward ~€1,700/citizen/yr.
 *
 * Interaction: a year scrubber (2010→2026) drives the accumulation — scrub it,
 * or hit ▶ to watch the gap open year by year (gated on reduced-motion: when the
 * OS asks for less motion the meter renders the static end-state, €1,700). Each
 * year's slice shows that year's compounding wedge + the running total.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native range input + a play button), and meaningful at its default
 * (the full 2026 wedge) as the static fallback.
 *
 * Figures are an ILLUSTRATIVE accumulation of an annual productivity gap — not
 * real-time telemetry. NL labour-productivity growth ~0.4%/yr (2014–24 decade average) vs a ~1.6%/yr
 * frontier/peer rate; the gap compounded per capita ≈ €1,700/citizen/yr.
 * Source: Dutch competitiveness deck (B01).
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  linScale,
  clamp,
  clamp01,
  smoothPath,
} from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

const YEAR0 = 2010
const YEAR1 = 2026
const N = YEAR1 - YEAR0 // 16 annual steps

// Illustrative rates (deck B01): actual Dutch productivity vs the frontier peer.
const ACTUAL_RATE = 0.004 // ~0.4 %/yr
const FRONTIER_RATE = 0.016 // ~1.6 %/yr
// Per-citizen value base, scaled so the 2026 wedge lands on ≈ €1,700/citizen/yr.
const BASE_VALUE = 24600 // € of productivity-linked output per citizen, 2010

// Both paths as an index (× BASE_VALUE). Actual crawls; the ghost compounds.
type Pt = { year: number; actual: number; ghost: number; gap: number }
const SERIES: Pt[] = Array.from({ length: N + 1 }, (_, i) => {
  const actual = BASE_VALUE * Math.pow(1 + ACTUAL_RATE, i)
  const ghost = BASE_VALUE * Math.pow(1 + FRONTIER_RATE, i)
  return { year: YEAR0 + i, actual, ghost, gap: ghost - actual }
})
const FINAL_GAP = SERIES[N].gap // ≈ €1,700

// Plot frame (viewBox units)
const W = 920
const H = 520
const PADL = 96
const PADR = 40
const PADT = 56
const PADB = 64
const x = linScale(YEAR0, YEAR1, PADL, W - PADR)
const yMin = BASE_VALUE * 0.985
const yMax = SERIES[N].ghost * 1.01
const y = linScale(yMin, yMax, H - PADB, PADT)

const eur = (v: number) => "€" + Math.round(v).toLocaleString("en-GB")

export function SeventeenHundredMeter() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // step ∈ [0, N] — which year the accumulation has reached. Default: full wedge.
  const [step, setStep] = useState(N)
  const [playing, setPlaying] = useState(false)

  // ▶ — geared accumulation, one mechanical tick per year. Never bouncy; off when
  //    the OS asks for reduced motion (then the static end-state stands in).
  useEffect(() => {
    if (!playing || reduced) return
    if (step >= N) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setStep((s) => clamp(s + 1, 0, N)), 460)
    return () => window.clearTimeout(id)
  }, [playing, reduced, step])

  const cur = SERIES[step]
  const visible = SERIES.slice(0, step + 1)

  // Path geometry for the visible span.
  const actualPath = smoothPath(visible.map((d) => [x(d.year), y(d.actual)]))
  const ghostPath = smoothPath(visible.map((d) => [x(d.year), y(d.ghost)]))
  // The wedge: ghost across, then back along actual — the area IS the loss.
  const wedge =
    visible.length > 1
      ? `${ghostPath} L ${x(cur.year)} ${y(cur.actual)} ` +
        visible
          .slice(0, -1)
          .reverse()
          .map((d) => `L ${x(d.year)} ${y(d.actual)}`)
          .join(" ") +
        " Z"
      : ""

  const meterT = clamp01(cur.gap / FINAL_GAP)

  function play() {
    if (reduced) {
      setStep(N)
      return
    }
    if (step >= N) setStep(0)
    setPlaying(true)
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V3 · The €1,700 Meter"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.squeezeHi }}
        >
          {cur.year}
        </span>
      }
      caption={
        <>
          A productivity gap, turned into money leaving each pocket. The{" "}
          <span style={{ color: p.wonder }}>path not taken</span> grows at the ~1.6%/yr frontier rate; the{" "}
          <span style={{ color: p.muted, fontStyle: "normal" }}>actual Dutch path</span> averaged ~0.4% over 2014&ndash;24.
          Scrub the year, or press ▶, and the <span style={{ color: p.squeeze }}>wedge</span> between them
          is what each citizen forgoes, compounding toward €1,700/yr. Illustrative accumulation of an annual
          gap, not telemetry. Source: Dutch competitiveness deck (B01).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Two diverging Dutch productivity paths from 2010 to ${cur.year}; the shaded wedge between the actual path and the frontier path equals ${eur(
          cur.gap,
        )} forgone per citizen per year`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="m17-wedge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.squeeze} stopOpacity={0.34} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0.08} />
          </linearGradient>
        </defs>

        {/* blueprint baseline + year hairlines */}
        {SERIES.map((d) => (
          <line
            key={`g-${d.year}`}
            x1={x(d.year)}
            y1={PADT - 8}
            x2={x(d.year)}
            y2={H - PADB}
            stroke={p.blueprint}
            strokeWidth={1}
          />
        ))}
        <line x1={PADL} y1={H - PADB} x2={W - PADR} y2={H - PADB} stroke={p.hair} strokeWidth={1} />

        {/* year ticks — endpoints + the live year */}
        {[YEAR0, 2014, 2018, 2022, YEAR1].map((yr) => (
          <text
            key={`t-${yr}`}
            x={x(yr)}
            y={H - PADB + 22}
            textAnchor="middle"
            fill={yr === cur.year ? p.squeezeHi : p.soft}
            style={{ fontSize: 13, fontWeight: yr === cur.year ? 700 : 400 }}
          >
            {yr}
          </text>
        ))}

        {/* THE WEDGE — the cumulative loss made visible (red) */}
        {wedge && <path d={wedge} fill="url(#m17-wedge)" stroke="none" />}

        {/* PATH NOT TAKEN — the ghost line at the frontier rate (gold) */}
        <path
          d={ghostPath}
          fill="none"
          stroke={p.wonder}
          strokeWidth={2.4}
          strokeDasharray="7 5"
          strokeLinecap="round"
        />
        {/* ACTUAL DUTCH PATH — the crawl (muted ink) */}
        <path d={actualPath} fill="none" stroke={p.muted} strokeWidth={2.4} strokeLinecap="round" />

        {/* live readout markers on each line */}
        <circle cx={x(cur.year)} cy={y(cur.ghost)} r={4.5} fill={p.wonderHi} />
        <circle cx={x(cur.year)} cy={y(cur.actual)} r={4.5} fill={p.ink} stroke={p.bg} strokeWidth={1.5} />

        {/* the gap bracket at the live year */}
        <line
          x1={x(cur.year)}
          y1={y(cur.actual)}
          x2={x(cur.year)}
          y2={y(cur.ghost)}
          stroke={p.squeeze}
          strokeWidth={1.5}
          strokeDasharray="2 3"
        />

        {/* path labels — anchored at the live frontier, clamped so the end-anchored
            text never runs off the left edge at early scrub years */}
        <text
          x={Math.max(x(cur.year) - 8, PADL + 168)}
          y={y(cur.ghost) - 8}
          textAnchor="end"
          fill={p.wonderHi}
          style={{ fontSize: 13, fontWeight: 700 }}
        >
          path not taken · 1.6%/yr
        </text>
        <text
          x={Math.max(x(cur.year) - 8, PADL + 110)}
          y={y(cur.actual) + 18}
          textAnchor="end"
          fill={p.muted}
          style={{ fontSize: 13, fontWeight: 700 }}
        >
          actual · 0.4%/yr
        </text>

        {/* the counter — money out of the pocket, this year */}
        <text
          x={PADL}
          y={PADT + 2}
          fill={p.soft}
          style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          forgone per citizen · {cur.year}
        </text>
        <text
          x={PADL - 4}
          y={PADT + 52}
          fill={p.squeeze}
          style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.01em" }}
        >
          {eur(cur.gap)}
        </text>
        <text x={PADL + 2} y={PADT + 74} fill={p.soft} style={{ fontSize: 12 }}>
          / citizen / year
        </text>
      </svg>

      {/* meter bar — fills as the gap compounds toward €1,700 */}
      <div className="mt-2 px-1">
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: p.hair }}
          aria-hidden
        >
          <div
            style={{
              width: `${meterT * 100}%`,
              height: "100%",
              background: p.squeeze,
              transition: reduced ? "none" : "width 360ms ease-out",
            }}
          />
        </div>

        <p
          className="mt-3 text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: p.squeeze, fontStyle: "normal", fontWeight: 700 }}>{eur(cur.gap)}</span>{" "}
          a year, every year, the abstraction was a salary all along.
        </p>

        {/* scrubber + play — the reader drives the accumulation */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-label={playing ? "Pause the accumulation" : "Play the accumulation, 2010 to 2026"}
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
            {playing ? "❙❙ pause" : "▶ play"}
          </button>
          <input
            type="range"
            min={0}
            max={N}
            value={step}
            onChange={(e) => {
              setPlaying(false)
              setStep(clamp(Number(e.target.value), 0, N))
            }}
            aria-label="Scrub the year from 2010 to 2026"
            aria-valuetext={`${cur.year}: ${eur(cur.gap)} forgone per citizen`}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: p.squeeze, background: p.hair }}
          />
          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: p.soft, fontSize: 11, whiteSpace: "nowrap" }}
          >
            {YEAR0}–{YEAR1}
          </span>
        </div>
      </div>
    </PlateFrame>
  )
}
