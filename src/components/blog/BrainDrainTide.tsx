"use client"

/**
 * V21 — THE BRAIN-DRAIN TIDE  (Chapter 6, "The Brains We Rent Out: Talent").
 *
 * Europe trains the talent at its own expense and the tide carries it west.
 * Two basins — EUROPE (blueprint cyan, left) where the talent is trained, and
 * the US (reserved red, right) where it works — with a flow of talent particles
 * drifting between them. Europe still ran a NET inflow of AI talent, but the
 * tide is ebbing: scrub 2022 → 2024 and the net figure falls from +52,000 to
 * +26,000 — halved in two years — even as Europe remains, over the long run, a
 * NET EXPORTER of AI talent to the US. The tide-line between the basins recedes
 * toward the European shore as the net halves.
 *
 * The density gut-punch sits below the basins: the top US hub runs ~5–10× the
 * AI-talent density of the top European one — San Francisco ~23.9 vs Ireland
 * ~4.2 researchers per 1,000 workers. The reveal: the talent is trained here
 * and works there.
 *
 * Interaction: a year scrubber (2022→2024) drives the ebb — scrub it, or press
 * ▶ to watch the tide recede year by year (gated on reduced-motion: when the OS
 * asks for less motion the instrument renders the static 2024 end-state, +26k).
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native range input + a play button), and meaningful at its default
 * (the full 2022 tide) as the static fallback.
 *
 * Figures hard-coded from the spec. Sources: Atomico, State of European Tech
 * 2025 (net +52k → +26k, 2022→2024); Interface EU / Revelio Labs (Sept 2025,
 * US-bound migration slowing on both sides since ~2017); Stanford AI Index 2026
 * (hub density — San Francisco ~23.9 vs Ireland ~4.2 per 1,000).
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

// Year axis — the ebb runs 2022 → 2024 in whole-year steps.
const YEAR0 = 2022
const YEAR1 = 2024
const N = YEAR1 - YEAR0 // 2 annual steps

// Net inflow to Europe (people / year), per Atomico SoET 2025: halved 52k→26k.
const NET: number[] = [52000, 39000, 26000] // 2022, 2023 (interpolated), 2024

// Density gut-punch (researchers per 1,000 workers) — Stanford AI Index 2026.
const SF_DENSITY = 23.9
const IE_DENSITY = 4.2
const DENSITY_RATIO = SF_DENSITY / IE_DENSITY // ≈ 5.7×

// Plot frame (viewBox units).
const W = 920
const H = 540

// Two basins — Europe left, US right — with a strait of open water between.
const EU_X = 64
const EU_W = 300
const US_X = 556
const US_W = 300
const BASIN_TOP = 96
const BASIN_BOT = 320
const STRAIT_L = EU_X + EU_W // left shore of the strait (European coast)
const STRAIT_R = US_X // right shore of the strait (US coast)

const fmtK = (n: number) => "+" + Math.round(n / 1000) + "k"
const fmtFull = (n: number) => "+" + Math.round(n).toLocaleString("en-GB")

// Deterministic drift lanes for the talent particles crossing the strait.
const PARTICLES = Array.from({ length: 11 }, (_, i) => ({
  lane: BASIN_TOP + 24 + (i / 10) * (BASIN_BOT - BASIN_TOP - 48),
  phase: (i * 0.618) % 1, // golden-ratio stagger so they never clump
  bow: i % 2 === 0 ? -22 : 26, // alternate the arc bow above/below the lane
}))

export function BrainDrainTide() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // step ∈ [0, N] — which year the ebb has reached. Default: 2022 full tide.
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  // drift ∈ [0,1) — ambient westward flow of the talent particles.
  const [drift, setDrift] = useState(0)

  // ▶ — geared ebb, one mechanical tick per year. Off under reduced-motion.
  useEffect(() => {
    if (!playing || reduced) return
    if (step >= N) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setStep((s) => clamp(s + 1, 0, N)), 1100)
    return () => window.clearTimeout(id)
  }, [playing, reduced, step])

  // Ambient drift loop — slow, mechanical; halted entirely under reduced-motion.
  useEffect(() => {
    if (reduced) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setDrift((d) => (d + dt * 0.14) % 1) // ~7s to cross the strait
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  const year = YEAR0 + step
  const net = NET[step]
  // Fraction of the opening tide that remains (52k → 26k = 0.5 at the end).
  const tideFrac = clamp01(net / NET[0])
  const eased = easeInOut(tideFrac)

  // Tide-line: the water level in the strait. Recedes toward the European shore
  // as the net halves — the inflow Europe still wins, but it is draining away.
  const strait = STRAIT_R - STRAIT_L
  const tideX = lerp(STRAIT_L + strait * 0.18, STRAIT_R - strait * 0.06, eased)

  // Particle count scales with the net inflow — fewer cross as the tide ebbs.
  const liveParticles = Math.max(4, Math.round(4 + eased * 7))

  const x = (t: number) => lerp(STRAIT_L, STRAIT_R, t)

  const verdict =
    step === 0
      ? { word: "FULL TIDE · 2022", color: p.leverage, line: "Europe still pulls talent in — net +52,000 a year" }
      : step === N
        ? { word: "EBBING · 2024", color: p.squeeze, line: "the inflow has halved in two years — net +26,000" }
        : { word: "RECEDING · 2023", color: p.wonderHi, line: "the tide is turning; the net is falling" }

  function play() {
    if (reduced) {
      setStep(N)
      return
    }
    if (step >= N) setStep(0)
    setPlaying(true)
  }

  // Density bars — a small inset below the basins.
  const dBaseY = 470
  const dMaxW = 300
  const dScale = linScale(0, SF_DENSITY, 0, dMaxW)

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V21 · The Brain-Drain Tide"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {year}
        </span>
      }
      caption={
        <>
          Europe trains the talent and the tide carries it west. Europe still ran a{" "}
          <span style={{ color: p.leverage }}>net inflow</span> of AI talent — but scrub 2022&nbsp;→&nbsp;2024 and it{" "}
          <span style={{ color: p.squeeze }}>halves, +52k → +26k</span>, even as Europe stays a long-run net exporter to
          the US. Below: the top US hub runs ~5&ndash;10&times; the talent density of the top European one
          (San Francisco ~23.9 vs Ireland ~4.2 per 1,000). The talent is trained here and works there. Sources:
          Atomico, State of European Tech 2025; Interface&nbsp;EU / Revelio Labs (Sept 2025); Stanford AI Index 2026.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Two basins — Europe and the United States — with talent flowing west across the strait between them. In ${year}, Europe's net inflow of AI talent is ${fmtFull(
          net,
        )} people a year, down from +52,000 in 2022. The top US hub, San Francisco, holds ${SF_DENSITY} AI researchers per 1,000 workers versus ${IE_DENSITY} for Ireland, the top European hub — roughly ${DENSITY_RATIO.toFixed(
          1,
        )} times the density.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="bdt-eu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.42} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0.82} />
          </linearGradient>
          <linearGradient id="bdt-us" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={0.42} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0.82} />
          </linearGradient>
          <linearGradient id="bdt-strait" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.leverage} stopOpacity={0.34} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0.34} />
          </linearGradient>
          <marker id="bdt-head" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={p.squeeze} />
          </marker>
        </defs>

        {/* baseline hairline under the basins */}
        <line x1={40} y1={BASIN_BOT + 1} x2={W - 40} y2={BASIN_BOT + 1} stroke={p.blueprint} strokeWidth={1} />

        {/* ── THE STRAIT — open water the talent crosses, cyan→red ──────────── */}
        <rect
          x={STRAIT_L}
          y={BASIN_TOP}
          width={strait}
          height={BASIN_BOT - BASIN_TOP}
          fill="url(#bdt-strait)"
          opacity={0.5}
        />

        {/* ── EUROPE — the basin where the talent is trained (cyan) ─────────── */}
        <rect
          x={EU_X}
          y={BASIN_TOP}
          width={EU_W}
          height={BASIN_BOT - BASIN_TOP}
          fill="url(#bdt-eu)"
          stroke={p.leverage}
          strokeWidth={1.4}
        />
        <line x1={EU_X} y1={BASIN_TOP} x2={STRAIT_L} y2={BASIN_TOP} stroke={p.leverageHi} strokeWidth={2} />
        <text x={EU_X + 16} y={BASIN_TOP - 14} fill={p.leverage} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em" }}>
          EUROPE · TRAINS THE TALENT
        </text>
        <text x={EU_X + 16} y={BASIN_TOP + 46} fill={p.leverageHi} style={{ fontSize: 40, fontWeight: 800 }}>
          {fmtK(net)}
        </text>
        <text x={EU_X + 18} y={BASIN_TOP + 66} fill={p.muted} style={{ fontSize: 12 }}>
          net AI-talent inflow / year
        </text>
        <text x={EU_X + 18} y={BASIN_BOT - 16} fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.1em" }}>
          {fmtFull(net)} people, {year}
        </text>

        {/* ── US — the basin where the talent works (red) ──────────────────── */}
        <rect
          x={US_X}
          y={BASIN_TOP}
          width={US_W}
          height={BASIN_BOT - BASIN_TOP}
          fill="url(#bdt-us)"
          stroke={p.squeeze}
          strokeWidth={1.4}
        />
        <line x1={US_X} y1={BASIN_TOP} x2={US_X + US_W} y2={BASIN_TOP} stroke={p.squeezeHi} strokeWidth={2} />
        <text x={US_X + US_W - 16} y={BASIN_TOP - 14} textAnchor="end" fill={p.squeeze} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em" }}>
          UNITED STATES · USES THE TALENT
        </text>
        <text x={US_X + US_W - 16} y={BASIN_TOP + 46} textAnchor="end" fill={p.squeezeHi} style={{ fontSize: 19, fontWeight: 800, letterSpacing: "0.02em" }}>
          long-run net importer
        </text>
        <text x={US_X + US_W - 18} y={BASIN_TOP + 68} textAnchor="end" fill={p.muted} style={{ fontSize: 12 }}>
          US-bound migration has dominated since ~2017
        </text>

        {/* ── TIDE-LINE — the level Europe still holds; recedes as net halves ── */}
        <line
          x1={tideX}
          y1={BASIN_TOP - 6}
          x2={tideX}
          y2={BASIN_BOT + 6}
          stroke={p.leverageHi}
          strokeWidth={2}
          strokeDasharray="6 5"
        />
        <text x={tideX} y={BASIN_TOP - 22} textAnchor="middle" fill={p.leverage} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em" }}>
          ◂ TIDE-LINE
        </text>

        {/* ── TALENT PARTICLES — drifting west across the strait ───────────── */}
        {PARTICLES.slice(0, liveParticles).map((pt, i) => {
          const t = reduced ? 0.5 : (drift + pt.phase) % 1
          const px = x(t)
          const py = pt.lane + Math.sin(t * Math.PI) * pt.bow
          // fade in on the European shore, fade out on the US shore
          const a = Math.sin(t * Math.PI) * 0.85 + 0.15
          const col = t < 0.5 ? p.leverageHi : p.squeezeHi
          return (
            <g key={i} opacity={a}>
              <circle cx={px} cy={py} r={3.2} fill={col} />
              <circle cx={px - 9} cy={py} r={1.8} fill={col} opacity={0.5} />
            </g>
          )
        })}

        {/* ── THE FLOW ARROW — the net direction of the crossing (west) ─────── */}
        <path
          d={`M ${STRAIT_L + 14} ${BASIN_BOT - 30}
              C ${STRAIT_L + strait * 0.4} ${BASIN_BOT - 6}, ${STRAIT_R - strait * 0.3} ${BASIN_BOT - 6}, ${STRAIT_R - 14} ${BASIN_BOT - 30}`}
          fill="none"
          stroke={p.squeeze}
          strokeWidth={2.2}
          strokeDasharray="3 5"
          opacity={0.7}
          markerEnd="url(#bdt-head)"
        />
        <text x={(STRAIT_L + STRAIT_R) / 2} y={BASIN_BOT + 22} textAnchor="middle" fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.14em" }}>
          NET WESTWARD FLOW OF AI TALENT
        </text>

        {/* ── DENSITY GUT-PUNCH — researchers per 1,000 workers (AI Index 2026) ── */}
        <text x={EU_X} y={dBaseY - 56} fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.18em" }}>
          AI-TALENT DENSITY · TOP HUB · PER 1,000 WORKERS
        </text>

        {/* San Francisco — the dense US hub (red) */}
        <rect x={EU_X} y={dBaseY - 36} width={dScale(SF_DENSITY)} height={20} fill={p.squeeze} opacity={0.85} rx={2} />
        <text x={EU_X + 8} y={dBaseY - 21} fill={mode === "dark" ? "#11203a" : "#fdfaf2"} style={{ fontSize: 12, fontWeight: 800 }}>
          SAN FRANCISCO
        </text>
        <text x={EU_X + dScale(SF_DENSITY) + 10} y={dBaseY - 21} fill={p.squeezeHi} style={{ fontSize: 14, fontWeight: 800 }}>
          {SF_DENSITY}
        </text>

        {/* Ireland — the densest European hub (cyan) */}
        <rect x={EU_X} y={dBaseY - 8} width={dScale(IE_DENSITY)} height={20} fill={p.leverage} opacity={0.85} rx={2} />
        <text x={EU_X + dScale(IE_DENSITY) + 10} y={dBaseY + 7} fill={p.leverageHi} style={{ fontSize: 13, fontWeight: 800 }}>
          IRELAND · {IE_DENSITY}
        </text>

        {/* the ratio verdict — the gut-punch in mono */}
        <text x={EU_X + dMaxW + 90} y={dBaseY - 40} fill={p.squeeze} style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {DENSITY_RATIO.toFixed(1)}&times;
        </text>
        <text x={EU_X + dMaxW + 92} y={dBaseY - 18} fill={p.soft} style={{ fontSize: 11 }}>
          denser than Europe&#39;s best
        </text>
        <text x={EU_X + dMaxW + 92} y={dBaseY + 2} fill={p.muted} style={{ fontSize: 11 }}>
          (top US hubs run ~5&ndash;10&times;)
        </text>
      </svg>

      {/* ── Readout + tide scrubber ──────────────────────────────────────── */}
      <div className="mt-2 px-1">
        <p
          className="text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> —{" "}
          {verdict.line}.
        </p>

        {/* twin mono counters: this year's net + the fall from 2022 */}
        <div className="mt-3 flex flex-wrap items-baseline gap-x-8 gap-y-1" style={{ fontFamily: "var(--font-mono), monospace" }}>
          <span className="tabular-nums" style={{ color: p.leverage, fontSize: 13 }}>
            NET INFLOW&nbsp;
            <span style={{ fontWeight: 800, fontSize: 18 }}>{fmtFull(net)}</span>
            <span style={{ color: p.soft }}>&nbsp;/ year · {year}</span>
          </span>
          <span className="tabular-nums" style={{ color: p.squeeze, fontSize: 13 }}>
            FALL FROM 2022&nbsp;
            <span style={{ fontWeight: 800, fontSize: 16 }}>{fmtFull(net - NET[0])}</span>
          </span>
        </div>

        {/* tide meter — the share of 2022's inflow that remains (recedes to 50%) */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
          <div
            style={{
              width: `${eased * 100}%`,
              height: "100%",
              background: p.leverage,
              transition: reduced ? "none" : "width 600ms ease-out",
            }}
          />
        </div>

        {/* scrubber + play — the reader drives the ebb */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-label={playing ? "Pause the ebb" : "Play the ebb, 2022 to 2024"}
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
            aria-label="Scrub the year from 2022 to 2024"
            aria-valuetext={`${year}: net inflow ${fmtFull(net)} per year`}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: p.leverage, background: p.hair }}
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
