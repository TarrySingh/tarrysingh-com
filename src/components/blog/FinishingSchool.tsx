"use client"

/**
 * V23 — THE FINISHING SCHOOL  (Chapter 6, "The Brains We Rent Out: Talent").
 *
 * Europe is the world's finishing school. It produces ~17–20% of the world's
 * most highly-cited research (the cyan inputs — papers, talent, IP). But the
 * value is realised abroad: Europe captures only ~5% of global AI patents (the
 * red leak), and its people do their highest-paid work elsewhere — ~57% of
 * European founders who relocated their company moved it to the United States.
 *
 * The instrument is a left-to-right funnel. A cohort of 100 enters on the left
 * as cyan (the elite that Europe educates). It passes through three drains —
 * PATENTS realised abroad, COMPANIES relocated (57% to the US), PAYCHECKS earned
 * elsewhere — each bleeding the cohort red. Only a thin cyan thread is retained
 * at the far right. A single gold valve — the EU "Choose Europe for Science"
 * programme (~€900m across ~101 schemes, 2026; +130% senior-researcher
 * applications) — claws a fraction of the drain back home as you raise it.
 *
 * The reveal sits in the default: the valve is shut, and the school ships almost
 * all of what it trains.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native range input + play button), reduced-motion safe (the static
 * full-drain end-state stands in), and meaningful at its default.
 *
 * Figures hard-coded from the spec. Sources: WIPO / EPO / Clarivate (papers vs
 * patents — ~17–20% of top-cited research, ~5% of AI patents); Atomico 2025
 * (57% of relocating founders moved to the US); European Commission, "Choose
 * Europe for Science" (Jan 2026 — ~€900m, ~101 schemes, +130% applications).
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  linScale,
  lerp,
  clamp,
  clamp01,
  easeInOut,
} from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

const W = 920
const H = 520

// Funnel band — the cohort travels left → right through it.
const BAND_X0 = 96
const BAND_X1 = W - 150
const BAND_TOP = 168
const BAND_BOT = 360
const BAND_H = BAND_BOT - BAND_TOP

// The three drains, positioned along the band. share = fraction of the ORIGINAL
// cohort lost at this drain when the valve is fully shut.
type Drain = { x: number; share: number; label: string; sub: string }
const DRAINS: Drain[] = [
  { x: linScale(0, 1, BAND_X0, BAND_X1)(0.3), share: 0.4, label: "PATENTS", sub: "~5% of AI patents kept" },
  { x: linScale(0, 1, BAND_X0, BAND_X1)(0.56), share: 0.3, label: "COMPANIES", sub: "57% relocate to the US" },
  { x: linScale(0, 1, BAND_X0, BAND_X1)(0.82), share: 0.17, label: "PAYCHECKS", sub: "best-paid work abroad" },
]
// Retained at the far right when valve shut: 1 − Σshare ≈ 13% (the thin thread).
const BASE_RETAINED = 1 - DRAINS.reduce((s, d) => s + d.share, 0)

// The gold valve claws back at most this share of the TOTAL drain.
const MAX_CLAWBACK = 0.45

const COHORT = 100 // the elite that enters
const pct = (f: number) => `${Math.round(f * 100)}%`

export function FinishingSchool() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // v = how far the "Choose Europe for Science" valve is open. Default 0 → the
  // school ships almost everything it trains.
  const [v, setV] = useState(0)
  const [playing, setPlaying] = useState(false)

  // ▶ — slow mechanical sweep of the valve, open then settle. Off under reduced
  //    motion (the static full-drain state stands in).
  useEffect(() => {
    if (!playing || reduced) return
    if (v >= 1) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setV((x) => clamp(x + 0.04, 0, 1)), 40)
    return () => window.clearTimeout(id)
  }, [playing, reduced, v])

  const t = clamp01(v)
  const eased = easeInOut(t)
  const clawback = MAX_CLAWBACK * eased // fraction of the drain turned home

  // Per-drain effective loss, after the valve claws some back into the thread.
  const losses = DRAINS.map((d) => d.share * (1 - clawback))
  const totalDrain = losses.reduce((s, l) => s + l, 0)
  const retained = 1 - totalDrain // the cyan thread at the far right

  // Band thickness encodes the surviving cyan cohort along its length.
  function flowFrac(x: number): number {
    let f = 1
    for (let i = 0; i < DRAINS.length; i++) {
      if (x >= DRAINS[i].x) f -= losses[i]
    }
    return clamp01(f)
  }
  function bandPath(): string {
    const xs = [BAND_X0]
    for (const d of DRAINS) xs.push(d.x - 0.5, d.x + 0.5)
    xs.push(BAND_X1)
    const mid = (BAND_TOP + BAND_BOT) / 2
    const top: [number, number][] = xs.map((x) => [x, mid - (BAND_H / 2) * flowFrac(x)])
    const bot: [number, number][] = xs.map((x) => [x, mid + (BAND_H / 2) * flowFrac(x)])
    const d = [`M ${top[0][0]} ${top[0][1]}`]
    for (let i = 1; i < top.length; i++) d.push(`L ${top[i][0]} ${top[i][1]}`)
    for (let i = bot.length - 1; i >= 0; i--) d.push(`L ${bot[i][0]} ${bot[i][1]}`)
    d.push("Z")
    return d.join(" ")
  }

  const mid = (BAND_TOP + BAND_BOT) / 2

  const verdict =
    t < 0.04
      ? { word: "SHIPPED ABROAD", color: p.squeeze, line: "the school educates the elite and ships them to be monetised elsewhere" }
      : t < 0.6
        ? { word: "CLAWING BACK", color: p.wonderHi, line: "Choose Europe for Science is opening; a fraction stays home" }
        : { word: "RETAINED", color: p.leverage, line: "more of what Europe trains is realised in Europe" }

  function play() {
    if (reduced) {
      setV(1)
      return
    }
    if (v >= 1) setV(0)
    setPlaying(true)
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V23 · The Finishing School"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {verdict.word}
        </span>
      }
      caption={
        <>
          Europe trains the elite — ~17&ndash;20% of the world&rsquo;s{" "}
          <span style={{ color: p.leverage }}>most-cited research</span> enters on the left. But it captures
          only <span style={{ color: p.squeeze }}>~5% of AI patents</span>, and ~57% of relocating founders
          move to the US: the cohort drains <span style={{ color: p.squeeze }}>red</span>, leaving a thin{" "}
          <span style={{ color: p.leverage }}>cyan thread</span>. Raise the{" "}
          <span style={{ color: p.wonder }}>Choose Europe for Science</span> valve (~&euro;900m, ~101 schemes,
          2026) — or press &#9654; — to claw some home. Sources: WIPO / EPO / Clarivate; Atomico 2025;
          European Commission (Jan 2026).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`A left-to-right funnel: a cohort of 100 of Europe's most-cited researchers enters as cyan and drains red through patents, companies and paychecks realised abroad. With the Choose Europe for Science valve ${Math.round(
          t * 100,
        )}% open, ${Math.round(retained * COHORT)} of every 100 are retained in Europe and ${Math.round(
          totalDrain * COHORT,
        )} leave.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="fs-band" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.85} />
            <stop offset={`${(1 - retained) * 100}%`} stopColor={p.leverage} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0.4} />
          </linearGradient>
          <marker id="fs-drainhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={p.squeeze} />
          </marker>
        </defs>

        {/* blueprint baseline */}
        <line x1={48} y1={BAND_BOT + 78} x2={W - 48} y2={BAND_BOT + 78} stroke={p.blueprint} strokeWidth={1} />

        {/* ── INTAKE — the cohort Europe educates, cyan ────────────────────── */}
        <text x={BAND_X0 - 6} y={BAND_TOP - 40} textAnchor="start" fill={p.leverage} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em" }}>
          THE COHORT EUROPE EDUCATES
        </text>
        <text x={BAND_X0 - 6} y={mid - 4} textAnchor="start" fill={p.leverageHi} style={{ fontSize: 40, fontWeight: 800 }}>
          100
        </text>
        <text x={BAND_X0 - 6} y={mid + 16} textAnchor="start" fill={p.muted} style={{ fontSize: 11 }}>
          ~17&ndash;20% of top-cited research
        </text>

        {/* ── THE FUNNEL BAND — cyan flow, thinning at each drain ───────────── */}
        <path d={bandPath()} fill="url(#fs-band)" stroke={p.leverage} strokeWidth={1.3} />

        {/* ── THE DRAINS — red leaks down out of the band ──────────────────── */}
        {DRAINS.map((d, i) => {
          const fAbove = flowFrac(d.x + 0.5)
          const fBelow = flowFrac(d.x - 0.5)
          const lossH = (BAND_H / 2) * (fBelow - fAbove) // half-thickness lost here
          const topY = mid - (BAND_H / 2) * fBelow
          const leakW = lerp(2, 30, losses[i] / 0.4)
          const dim = losses[i] < 0.02
          return (
            <g key={d.label} style={{ opacity: dim ? 0.25 : 1 }}>
              {/* the red plume diving below the band toward "abroad" */}
              <path
                d={`M ${d.x} ${mid + (BAND_H / 2) * fAbove}
                    C ${d.x + 14} ${BAND_BOT + 28}, ${d.x + 24} ${BAND_BOT + 30}, ${d.x + 30} ${BAND_BOT + 58}`}
                fill="none"
                stroke={p.squeeze}
                strokeWidth={leakW}
                strokeLinecap="round"
                markerEnd="url(#fs-drainhead)"
                opacity={0.92}
              />
              {/* drain shoulder marker on the band */}
              <line x1={d.x} y1={topY} x2={d.x} y2={mid + (BAND_H / 2) * fAbove} stroke={p.squeeze} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
              {/* drain label */}
              <text x={d.x} y={BAND_TOP - 14} textAnchor="middle" fill={p.squeeze} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>
                {d.label}
              </text>
              <text x={d.x} y={BAND_BOT + 92} textAnchor="middle" fill={p.squeezeHi} style={{ fontSize: 17, fontWeight: 800 }}>
                {pct(losses[i])}
              </text>
              <text x={d.x} y={BAND_BOT + 110} textAnchor="middle" fill={p.soft} style={{ fontSize: 12 }}>
                {d.sub}
              </text>
              {/* loss-height visual nub (keeps lossH referenced + reads the slice) */}
              <rect x={d.x - 2} y={topY} width={4} height={Math.max(0, lossH)} fill={rgba(mode === "dark" ? "240,112,138" : "192,69,90", 0.0)} />
            </g>
          )
        })}

        {/* ── THE GOLD VALVE — Choose Europe for Science ───────────────────── */}
        <g transform={`translate(${(DRAINS[0].x + DRAINS[2].x) / 2}, ${BAND_TOP - 70})`}>
          <text textAnchor="middle" fill={p.wonder} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em" }}>
            CHOOSE EUROPE FOR SCIENCE
          </text>
          <text y={18} textAnchor="middle" fill={p.wonderHi} style={{ fontSize: 12, fontWeight: 700 }}>
            ~&euro;900m · ~101 schemes · +130% senior applications
          </text>
        </g>
        {/* clawback arrow — gold, lifting drain back into the thread */}
        <g style={{ opacity: clamp01(eased * 1.2) }}>
          <path
            d={`M ${(DRAINS[0].x + DRAINS[2].x) / 2} ${BAND_TOP - 44}
                L ${BAND_X1 - 6} ${mid - (BAND_H / 2) * retained - 8}`}
            fill="none"
            stroke={p.wonder}
            strokeWidth={lerp(0, 3.4, eased)}
            strokeDasharray="6 5"
            strokeLinecap="round"
            opacity={0.8}
          />
        </g>

        {/* ── RETAINED — the thin cyan thread at the far right ──────────────── */}
        <g transform={`translate(${BAND_X1 + 12}, 0)`}>
          <line x1={0} y1={mid - (BAND_H / 2) * retained} x2={0} y2={mid + (BAND_H / 2) * retained} stroke={p.leverageHi} strokeWidth={Math.max(2, retained * 26)} strokeLinecap="round" />
          <text x={18} y={mid - 6} textAnchor="start" fill={p.leverageHi} style={{ fontSize: 30, fontWeight: 800 }}>
            {Math.round(retained * COHORT)}
          </text>
          <text x={18} y={mid + 12} textAnchor="start" fill={p.leverage} style={{ fontSize: 12, letterSpacing: "0.12em" }}>
            REALISED AT HOME
          </text>
        </g>

        {/* leaving counter — the red total, top-right in mono */}
        <text x={BAND_X1} y={BAND_TOP - 88} textAnchor="end" fill={p.squeeze} style={{ fontSize: 12, letterSpacing: "0.16em" }}>
          REALISED ABROAD
        </text>
        <text x={BAND_X1} y={BAND_TOP - 56} textAnchor="end" fill={p.squeezeHi} style={{ fontSize: 34, fontWeight: 800 }}>
          {Math.round(totalDrain * COHORT)}
        </text>
        <text x={BAND_X1} y={BAND_TOP - 40} textAnchor="end" fill={p.soft} style={{ fontSize: 10 }}>
          of every 100
        </text>
      </svg>

      {/* ── Readout + valve control ──────────────────────────────────────── */}
      <div className="mt-2 px-1">
        <p
          className="text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> —{" "}
          {verdict.line}.
        </p>

        {/* twin mono counters */}
        <div className="mt-3 flex flex-wrap items-baseline gap-x-8 gap-y-1" style={{ fontFamily: "var(--font-mono), monospace" }}>
          <span className="tabular-nums" style={{ color: p.leverage, fontSize: 13 }}>
            RETAINED&nbsp;
            <span style={{ fontWeight: 800, fontSize: 16 }}>{Math.round(retained * COHORT)}/100</span>
          </span>
          <span className="tabular-nums" style={{ color: p.squeeze, fontSize: 13 }}>
            SHIPPED&nbsp;
            <span style={{ fontWeight: 800, fontSize: 16 }}>{Math.round(totalDrain * COHORT)}/100</span>
          </span>
          <span className="tabular-nums" style={{ color: p.wonder, fontSize: 13 }}>
            CLAWED BACK&nbsp;
            <span style={{ fontWeight: 800, fontSize: 16 }}>{pct(clawback)}</span>
          </span>
        </div>

        {/* split meter — retained (cyan) vs shipped (red) */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
          <div style={{ width: `${retained * 100}%`, height: "100%", background: p.leverage, float: "left", transition: reduced ? "none" : "width 200ms ease-out" }} />
          <div style={{ width: `${totalDrain * 100}%`, height: "100%", background: p.squeeze, float: "left", transition: reduced ? "none" : "width 200ms ease-out" }} />
        </div>

        {/* play + valve */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-label={playing ? "Pause the valve sweep" : "Open the Choose Europe for Science valve"}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 11px",
              borderRadius: 7,
              cursor: "pointer",
              whiteSpace: "nowrap",
              color: p.wonderHi,
              border: `1px solid ${p.wonder}`,
              background: "transparent",
            }}
          >
            {playing ? "❙❙ pause" : "▶ play"}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(t * 100)}
            onChange={(e) => {
              setPlaying(false)
              setV(clamp01(Number(e.target.value) / 100))
            }}
            aria-label="How far the Choose Europe for Science retention valve is open"
            aria-valuetext={`${Math.round(t * 100)}% open: ${Math.round(retained * COHORT)} of 100 retained in Europe`}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: p.wonder, background: p.hair }}
          />
          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: p.wonder, fontSize: 11, whiteSpace: "nowrap" }}
          >
            VALVE {Math.round(t * 100)}%
          </span>
        </div>
        <p className="mt-1 text-[10.5px]" style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}>
          Base case: ~{Math.round((1 - BASE_RETAINED) * 100)} of every 100 the elite Europe trains are realised abroad.
        </p>
      </div>
    </PlateFrame>
  )
}
