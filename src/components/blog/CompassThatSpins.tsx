"use client"

/**
 * V8 — THE COMPASS THAT SPINS  (Chapter 2, "The Map Out, Filed Under Noted").
 *
 * Inertia as rule of law. Europe is good at setting directions and deadlines —
 * the Capital Markets Union (relaunched 2015), the 2024 Draghi recommendations,
 * the Savings & Investments Union now aimed at "summer 2026" — and good at
 * letting them slip, indefinitely. This is a compass that never finds north: as
 * the reader advances time, the needle SPINS toward each fresh deadline on the
 * rim, then slips past it; the deadlines themselves slide forward; a SLIPPAGE
 * meter (years lost to the meeting-about-the-meeting) climbs in reserved red
 * while the DELIVERED count stays pinned at zero in cyan that never lights.
 *
 * Motion is the argument: lots of spinning, no bearing. The ▶ auto-spins the
 * dial through the milestone chain; gated on reduced-motion — when the OS asks
 * for less, the dial renders its static end-state (needle caught mid-spin,
 * slippage high, delivered still 0). User can also scrub the year directly.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native range + buttons), meaningful at its default (full slippage).
 *
 * Sources: Capital Markets Union (relaunched 2015–); Draghi competitiveness
 * report (Sep 2024); EU Savings & Investments Union / MISP package (2025–26).
 * Figures are an illustrative ledger of stated-then-slipped deadlines.
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  clamp,
  clamp01,
  easeInOut,
} from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

// The chain of stated bearings — each "the answer is now coming by…", each slipped.
type Milestone = { year: number; label: string; sub: string; deadline: string }
const CHAIN: Milestone[] = [
  { year: 2015, label: "Capital Markets Union", sub: "relaunched", deadline: "by 2019" },
  { year: 2020, label: "CMU action plan #2", sub: "17 measures", deadline: "by 2024" },
  { year: 2024, label: "Draghi report", sub: "~170 proposals", deadline: "“urgent”" },
  { year: 2025, label: "Savings & Investments Union", sub: "MISP package", deadline: "by 2026" },
  { year: 2026, label: "“summer 2026”", sub: "the next target", deadline: "→ slips" },
]
const FIRST = CHAIN[0].year
const LAST = CHAIN[CHAIN.length - 1].year
const SPAN = LAST - FIRST // 11 years of stated-then-slipped

// One full needle revolution per milestone reached, plus a slip past each rim mark.
const TURNS_PER_STEP = 1.18

// Compass geometry (viewBox units)
const W = 920
const H = 560
const CX = 460
const CY = 286
const R = 196 // outer rim
const RIM_TICKS = 60

const deg = (year: number) => ((year - FIRST) / SPAN) * 360 - 90 // year → rim angle
const onRim = (angle: number, r: number): [number, number] => {
  const a = (angle * Math.PI) / 180
  return [CX + Math.cos(a) * r, CY + Math.sin(a) * r]
}

export function CompassThatSpins() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // step ∈ [0, CHAIN.length-1]; t ∈ [0,1] is the spin within the current step.
  const [step, setStep] = useState(CHAIN.length - 1)
  const [t, setT] = useState(1)
  const [playing, setPlaying] = useState(false)

  // ▶ — geared spin: ease through one step's worth of revolution, then advance.
  useEffect(() => {
    if (!playing || reduced) return
    if (step >= CHAIN.length - 1 && t >= 1) {
      setPlaying(false)
      return
    }
    const id = window.setInterval(() => {
      setT((prev) => {
        const next = prev + 0.045
        if (next >= 1) {
          setStep((s) => {
            if (s >= CHAIN.length - 1) return s
            return s + 1
          })
          return 0
        }
        return next
      })
    }, 40)
    return () => window.clearInterval(id)
  }, [playing, reduced, step, t])

  const cur = CHAIN[step]
  const reachedYear = cur.year

  // The needle: spins TURNS_PER_STEP per step, then rests pointing PAST the
  // current deadline (never on it). It never settles on "done".
  const baseRevolutions = step * TURNS_PER_STEP * 360
  const spinThisStep = easeInOut(clamp01(t)) * TURNS_PER_STEP * 360
  // …and a permanent overshoot so it always points *past* the mark it aimed at.
  const overshoot = 14
  const needleAngle = deg(reachedYear) + baseRevolutions + spinThisStep + overshoot

  // Slippage climbs (years lost); delivered stays pinned at zero. Within a step
  // it eases toward the next milestone's year so the meter visibly creeps up.
  const nextYear = CHAIN[Math.min(step + 1, CHAIN.length - 1)].year
  const yearsSlipped = (reachedYear - FIRST) + clamp01(t) * (nextYear - reachedYear)
  const slipMax = SPAN
  const slipT = clamp01(yearsSlipped / slipMax)
  const delivered = 0

  // Needle tip + tail
  const [tipX, tipY] = onRim(needleAngle, R - 30)
  const [tailX, tailY] = onRim(needleAngle + 180, 64)

  function play() {
    if (reduced) {
      setStep(CHAIN.length - 1)
      setT(1)
      return
    }
    if (step >= CHAIN.length - 1 && t >= 1) {
      setStep(0)
      setT(0)
    }
    setPlaying(true)
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V8 · The Compass That Spins"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.squeezeHi }}
        >
          {reachedYear} · {cur.deadline}
        </span>
      }
      caption={
        <>
          Inertia as rule of law: Europe keeps setting north and never sailing.
          Press ▶ — the needle spins toward each new{" "}
          <span style={{ color: p.squeeze }}>deadline</span> on the rim, then slips
          past it; the <span style={{ color: p.squeeze }}>slippage</span> meter
          climbs while the <span style={{ color: p.leverage }}>delivered</span>{" "}
          count never lights. Sources: Capital Markets Union (relaunched 2015–);
          Draghi competitiveness report (Sep 2024); EU Savings &amp; Investments
          Union / MISP package (2025–26). Illustrative deadline ledger.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`A compass that never finds north: the needle has spun through ${step + 1} stated European deadlines from ${FIRST} to ${reachedYear}, slipping past each; ${Math.round(
          yearsSlipped,
        )} years lost, ${delivered} delivered`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="cs-dial" cx="50%" cy="46%" r="56%">
            <stop offset="0%" stopColor={rgba(p.glowRGB, mode === "dark" ? 0.1 : 0.06)} />
            <stop offset="100%" stopColor={rgba(p.glowRGB, 0)} />
          </radialGradient>
        </defs>

        {/* dial face glow */}
        <circle cx={CX} cy={CY} r={R + 24} fill="url(#cs-dial)" />

        {/* outer rim + inner ring (blueprint hairlines) */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={p.blueprint} strokeWidth={1.4} />
        <circle cx={CX} cy={CY} r={R - 34} fill="none" stroke={p.blueprint} strokeWidth={1} />

        {/* fine rim graduations */}
        {Array.from({ length: RIM_TICKS }, (_, i) => {
          const a = (i / RIM_TICKS) * 360 - 90
          const major = i % 5 === 0
          const [x1, y1] = onRim(a, R)
          const [x2, y2] = onRim(a, R - (major ? 14 : 7))
          return (
            <line
              key={`tk-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={p.hair}
              strokeWidth={major ? 1.4 : 0.8}
            />
          )
        })}

        {/* the deadlines on the rim — slide forward (red) as time advances */}
        {CHAIN.map((m, i) => {
          const reached = i <= step
          // each unreached deadline drifts forward a touch — "now coming by…" keeps moving
          const drift = reached ? 0 : 6 + (i - step) * 4
          const a = deg(m.year) + drift
          const [mx, my] = onRim(a, R)
          const [lx, ly] = onRim(a, R + 24)
          const live = i === step
          return (
            <g key={`dl-${i}`}>
              <circle
                cx={mx}
                cy={my}
                r={live ? 6.5 : 4.5}
                fill={reached ? p.squeeze : "none"}
                stroke={p.squeeze}
                strokeWidth={1.6}
                opacity={reached ? (live ? 1 : 0.6) : 0.42}
              />
              <text
                x={lx}
                y={ly}
                textAnchor={mx < CX ? "end" : "start"}
                fill={live ? p.squeezeHi : p.soft}
                style={{ fontSize: 11.5, fontWeight: live ? 700 : 400 }}
              >
                {m.deadline}
              </text>
            </g>
          )
        })}

        {/* the needle — spins, overshoots, never rests on a mark (red point) */}
        <g>
          <line
            x1={tailX}
            y1={tailY}
            x2={tipX}
            y2={tipY}
            stroke={p.squeeze}
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* counterweight tail in muted ink */}
          <circle cx={tailX} cy={tailY} r={6} fill={p.muted} />
          {/* arrow tip */}
          <circle cx={tipX} cy={tipY} r={7} fill={p.squeeze} />
          {/* hub */}
          <circle cx={CX} cy={CY} r={13} fill={p.bg} stroke={p.squeeze} strokeWidth={2.5} />
          <circle cx={CX} cy={CY} r={3.5} fill={p.squeeze} />
        </g>

        {/* the stated bearing at centre — the milestone we are "now" aiming at */}
        <text
          x={CX}
          y={CY - R + 12}
          textAnchor="middle"
          fill={p.squeezeHi}
          style={{ fontSize: 14, fontWeight: 700 }}
        >
          {cur.label}
        </text>
        <text
          x={CX}
          y={CY - R + 38}
          textAnchor="middle"
          fill={p.muted}
          style={{ fontSize: 11.5 }}
        >
          {cur.sub} · {reachedYear}
        </text>

        {/* DELIVERED — the cyan that never lights */}
        <text x={56} y={H - 96} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          delivered
        </text>
        <text x={56} y={H - 50} fill={rgba(mode === "dark" ? "120,170,230" : "14,122,165", 0.5)} style={{ fontSize: 46, fontWeight: 800 }}>
          {delivered}
        </text>

        {/* SLIPPAGE — the red that only climbs */}
        <text x={W - 56} y={H - 96} textAnchor="end" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          years slipped
        </text>
        <text x={W - 56} y={H - 50} textAnchor="end" fill={p.squeeze} style={{ fontSize: 46, fontWeight: 800 }}>
          {Math.round(yearsSlipped)}
        </text>
        <text x={W - 54} y={H - 30} textAnchor="end" fill={p.soft} style={{ fontSize: 11 }}>
          {FIRST}–{reachedYear}, no bearing
        </text>
      </svg>

      {/* slippage meter — only ever fills (red) */}
      <div className="mt-2 px-1">
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
          <div
            style={{
              width: `${slipT * 100}%`,
              height: "100%",
              background: p.squeeze,
              transition: reduced ? "none" : "width 220ms linear",
            }}
          />
        </div>

        <p
          className="mt-3 text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: p.squeeze, fontStyle: "normal", fontWeight: 700 }}>
            Motion without movement
          </span>{" "}
          — the needle spins, the meeting reconvenes, north keeps moving to next summer.
        </p>

        {/* play + scrub the milestone chain */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-label={playing ? "Pause the spin" : "Spin the compass through the chain of slipped deadlines"}
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
            {playing ? "❙❙ pause" : "▶ spin"}
          </button>
          <input
            type="range"
            min={0}
            max={CHAIN.length - 1}
            value={step}
            onChange={(e) => {
              setPlaying(false)
              const s = clamp(Number(e.target.value), 0, CHAIN.length - 1)
              setStep(s)
              setT(1)
            }}
            aria-label="Scrub through the chain of stated European deadlines"
            aria-valuetext={`${cur.label}, ${reachedYear}: ${cur.deadline}, ${Math.round(yearsSlipped)} years slipped, ${delivered} delivered`}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: p.squeeze, background: p.hair }}
          />
          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: p.soft, fontSize: 11, whiteSpace: "nowrap" }}
          >
            {FIRST}–{LAST}
          </span>
        </div>
      </div>
    </PlateFrame>
  )
}
