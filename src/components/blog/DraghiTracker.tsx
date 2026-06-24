"use client"

/**
 * V6 — THE DRAGHI TRACKER  (Chapter 2, "The Map Out, Filed Under Noted").
 *
 * In September 2024 the Draghi competitiveness report drew the whole map: a
 * €750–800bn/yr investment surge (4.4–4.7% of EU GDP) across 383 recommendations.
 * Eighteen months later the map is filed under "Noted" — only ~15% of the
 * recommendations are fully binding (up from 11.2% in Sept 2025), and whole
 * sectors — energy, defence, pharma, auto — show ZERO progress.
 *
 * The instrument is a 383-cell ledger of the recommendations. The reader scrubs a
 * timeline from Sept 2024 → Jun 2026 and watches the implementation crawl: cells
 * light in blueprint cyan (the few walked), the vast remainder stays in reserved
 * red (the map left on the page). A big mono readout tracks the % implemented and
 * the €/yr investment gap still unaddressed.
 *
 * REVEAL: the map was drawn in full; almost none of it was walked.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native range input + a play button), reduced-motion safe (the play
 * loop is gated; reduced → the meaningful Jun-2026 end-state stands in), and
 * meaningful at its default (the full 18-month crawl already run).
 *
 * Figures are hard-coded from the report + the tracking. Sources: Draghi report
 * (Sept 2024); EU implementation tracking (CER / European Commission, Jan 2026).
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
} from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

const TOTAL = 383 // recommendations in the Draghi report

// The crawl, milestone by milestone (% of recommendations fully binding).
type Stop = { label: string; pct: number }
const STOPS: Stop[] = [
  { label: "Sept 2024", pct: 0 }, // the map is drawn — nothing walked yet
  { label: "Mar 2025", pct: 5.5 },
  { label: "Sept 2025", pct: 11.2 }, // the first hard tracking number
  { label: "Jan 2026", pct: 13.4 },
  { label: "Jun 2026", pct: 15.0 }, // ~15% fully binding
]
const N = STOPS.length - 1

// The headline investment surge the report called for — the gap left unaddressed.
const GAP_LO = 750 // €bn / yr
const GAP_HI = 800 // €bn / yr
const GDP_LO = 4.4 // % of EU GDP
const GDP_HI = 4.7 // % of EU GDP

// Grid geometry — 383 cells laid out as 17 cols × 23 rows = 391 slots (383 used).
const COLS = 17
const ROWS = 23
const CELL = 22
const GAPPX = 5
const GRID_W = COLS * CELL + (COLS - 1) * GAPPX
const GRID_H = ROWS * CELL + (ROWS - 1) * GAPPX

// Plot frame (viewBox units). The header zone (label · big readout · sub ·
// timeline) is laid out in ABSOLUTE y so it can never collide with the grid top.
const PADL = 40
const PADT = 176 // grid top — clear below the timeline
const W = PADL * 2 + GRID_W
const H = PADT + GRID_H + 48
const Y_LABEL = 30
const Y_BIG = 78
const Y_SUB = 100

const pctFmt = (v: number) => v.toFixed(1)
const lit = (pct: number) => Math.round((pct / 100) * TOTAL)

export function DraghiTracker() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // step ∈ [0, N] — which milestone the crawl has reached. Default: full crawl.
  const [step, setStep] = useState(N)
  const [playing, setPlaying] = useState(false)

  // ▶ — mechanical advance, one milestone per tick. Off under reduced-motion.
  useEffect(() => {
    if (!playing || reduced) return
    if (step >= N) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setStep((s) => clamp(s + 1, 0, N)), 900)
    return () => window.clearTimeout(id)
  }, [playing, reduced, step])

  const cur = STOPS[step]
  const litCount = lit(cur.pct)
  const litT = clamp01(cur.pct / 100)

  function play() {
    if (reduced) {
      setStep(N)
      return
    }
    if (step >= N) setStep(0)
    setPlaying(true)
  }

  // Timeline track geometry (for the scrubber ticks drawn in-SVG).
  const trackX0 = PADL + 4
  const trackX1 = W - PADL - 4
  const trackY = 134
  const tx = linScale(0, N, trackX0, trackX1)

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V6 · The Draghi Tracker"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.leverageHi }}
        >
          {cur.label}
        </span>
      }
      caption={
        <>
          383 recommendations, one cell each. Scrub the timeline — or press ▶ — from{" "}
          <span style={{ color: p.muted, fontStyle: "normal" }}>Sept 2024</span> to{" "}
          <span style={{ color: p.muted, fontStyle: "normal" }}>Jun 2026</span> and watch the few{" "}
          <span style={{ color: p.leverage }}>walked</span> light up against the map{" "}
          <span style={{ color: p.squeeze }}>left on the page</span>. The €750–800bn/yr surge it asked
          for is the gap still unaddressed. Sources: Draghi report (Sept 2024); EU implementation
          tracking (CER / European Commission, Jan 2026).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Draghi report tracker: by ${cur.label}, ${litCount} of ${TOTAL} recommendations (${pctFmt(
          cur.pct,
        )}%) are fully binding; the €750–800bn per year investment surge remains the unaddressed gap`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="dt-lit-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* THE BIG READOUT — % implemented + the count */}
        <text
          x={PADL}
          y={Y_LABEL}
          fill={p.soft}
          style={{ fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          fully binding
        </text>
        <text
          x={PADL - 2}
          y={Y_BIG}
          fill={p.leverage}
          style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em" }}
        >
          {pctFmt(cur.pct)}%
        </text>
        <text x={PADL} y={Y_SUB} fill={p.muted} style={{ fontSize: 12 }}>
          {litCount} of {TOTAL} recommendations walked
        </text>

        {/* THE GAP — the surge the map asked for, still unaddressed (red) */}
        <text
          x={W - PADL}
          y={Y_LABEL}
          textAnchor="end"
          fill={p.soft}
          style={{ fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          annual investment gap
        </text>
        <text
          x={W - PADL + 2}
          y={Y_BIG}
          textAnchor="end"
          fill={p.squeeze}
          style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.01em" }}
        >
          €{GAP_LO}–{GAP_HI}bn
        </text>
        <text
          x={W - PADL}
          y={Y_SUB}
          textAnchor="end"
          fill={p.muted}
          style={{ fontSize: 12 }}
        >
          /yr · {GDP_LO}–{GDP_HI}% of EU GDP
        </text>

        {/* TIMELINE — the scrub track + milestone ticks (drawn, driven by the range) */}
        <line x1={trackX0} y1={trackY} x2={trackX1} y2={trackY} stroke={p.hair} strokeWidth={2} />
        <line
          x1={trackX0}
          y1={trackY}
          x2={tx(step)}
          y2={trackY}
          stroke={p.leverage}
          strokeWidth={2}
        />
        {STOPS.map((s, i) => {
          const on = i <= step
          return (
            <g key={`tick-${i}`}>
              <circle
                cx={tx(i)}
                cy={trackY}
                r={i === step ? 5.5 : 3.5}
                fill={on ? p.leverage : p.bg}
                stroke={on ? p.leverageHi : p.soft}
                strokeWidth={1.5}
              />
              <text
                x={tx(i)}
                y={trackY - 12}
                textAnchor="middle"
                fill={i === step ? p.leverageHi : p.soft}
                style={{ fontSize: 10.5, fontWeight: i === step ? 700 : 400 }}
              >
                {s.label}
              </text>
            </g>
          )
        })}

        {/* THE LEDGER — 383 recommendation cells */}
        {Array.from({ length: TOTAL }, (_, i) => {
          const col = i % COLS
          const row = Math.floor(i / COLS)
          const cx = PADL + col * (CELL + GAPPX)
          const cy = PADT + row * (CELL + GAPPX)
          const on = i < litCount
          // staggered so the freshest-lit cells read as the live frontier
          const frontier = on && i >= lit(STOPS[Math.max(0, step - 1)].pct)
          const fill = on
            ? rgba(mode === "dark" ? "108,198,230" : "14,122,165", frontier ? 0.95 : 0.7)
            : rgba(mode === "dark" ? "240,112,138" : "192,69,90", 0.13)
          const stroke = on ? p.leverageHi : rgba(mode === "dark" ? "240,112,138" : "192,69,90", 0.34)
          return (
            <rect
              key={`c-${i}`}
              x={cx}
              y={cy}
              width={CELL}
              height={CELL}
              rx={3}
              fill={fill}
              stroke={stroke}
              strokeWidth={on ? 1.2 : 1}
            />
          )
        })}
      </svg>

      {/* meter + verdict + scrubber */}
      <div className="mt-2 px-1">
        {/* implemented ⟷ unaddressed meter */}
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: rgba(mode === "dark" ? "240,112,138" : "192,69,90", 0.18) }}
          aria-hidden
        >
          <div
            style={{
              width: `${litT * 100}%`,
              height: "100%",
              background: p.leverage,
              transition: reduced ? "none" : "width 520ms ease-out",
            }}
          />
        </div>

        <p
          className="mt-3 text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: p.leverage, fontStyle: "normal", fontWeight: 700 }}>
            {pctFmt(cur.pct)}%
          </span>{" "}
          walked in {Math.round(lerp(0, 21, step / N))} months — the map was drawn in full; almost none of it was.
        </p>

        {/* scrubber + play — the reader drives the crawl */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-label={playing ? "Pause the crawl" : "Play the implementation crawl, Sept 2024 to Jun 2026"}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 11px",
              borderRadius: 7,
              cursor: "pointer",
              whiteSpace: "nowrap",
              color: p.leverageHi,
              border: `1px solid ${p.leverage}`,
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
            aria-label="Scrub the timeline from Sept 2024 to Jun 2026"
            aria-valuetext={`${cur.label}: ${pctFmt(cur.pct)}% fully binding, ${litCount} of ${TOTAL}`}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: p.leverage, background: p.hair }}
          />
          <span
            className="tabular-nums"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: p.soft,
              fontSize: 11,
              whiteSpace: "nowrap",
            }}
          >
            383 recs
          </span>
        </div>
      </div>
    </PlateFrame>
  )
}
