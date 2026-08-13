"use client"

/**
 * V31 — STOP THE CLOCK  (Chapter 9, "The Moat With the Drawbridge Down:
 * Regulation").
 *
 * Europe wrote the world's most ambitious AI rulebook — then hit pause on
 * itself. The EU AI Act passed in 2024 with high-risk (Annex III) obligations
 * originally due 2 Aug 2026. Via the "Digital Omnibus / Stop-the-Clock"
 * (provisional agreement 7 May 2026), that enforcement date was DELAYED to
 * 2 Dec 2027 — a 16-month slip; the product-embedded Annex I tier was pushed
 * back further still, to 2 Aug 2028.
 *
 * This instrument is a clock. The reader advances the regime (range / ▶ /
 * ←→) and watches the EU drag its own high-risk enforcement hand BACKWARDS:
 * the hand snaps from Aug-2026 to Dec-2027 the moment the Omnibus lands, while
 * the damning context surfaces — ~78% of organisations had taken NO compliance
 * steps by April 2026, and penalties of up to €35m or 7% of global turnover
 * loom behind the dial. A delivered-vs-deferred readout keeps the tally.
 *
 * REVEAL: the confession — the rulebook outran the capacity to follow it, so
 * Europe stopped its own clock.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (the ▶ loop is gated; reduced → the deferred end-state stands
 * in, the hand jumps with no sweep), keyboard-reachable (native range + play +
 * ←/→), and meaningful at its default (the clock already stopped, the deadline
 * already dragged back).
 *
 * Figures hard-coded from the spec. Sources: EU AI Act; Digital Omnibus
 * provisional agreement (7 May 2026); Gibson Dunn / European Commission.
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  clamp,
  clamp01,
  lerp,
  easeInOut,
} from "./read-chart-kit"
import { cpPalette, mixHex, rgba } from "./chokepoint-kit"

// The dial maps a calendar window onto the clock face. We measure months from
// an epoch (Jan 2024 = month 0) so the hand angle is a true elapsed-time read.
const EPOCH = 2024 * 12 // Jan 2024
const monthsFrom = (year: number, month1: number) => year * 12 + (month1 - 1) - EPOCH
// Window: Jan 2024 (Act passes) → Aug 2028 (Annex I tier). Full sweep = 360°.
const DIAL_LO = monthsFrom(2024, 1) // 0
const DIAL_HI = monthsFrom(2028, 8) // 55
// The hand points to a date; angle 0 = top (12 o'clock), clockwise.
const angleFor = (m: number) =>
  ((clamp(m, DIAL_LO, DIAL_HI) - DIAL_LO) / (DIAL_HI - DIAL_LO)) * 360 - 90

type Step = {
  date: string
  title: string
  detail: string
  /** the live high-risk (Annex III) enforcement date the hand points to */
  deadlineM: number
  deadlineLabel: string
}

// The two deadlines the rulebook ever named for high-risk Annex III duties.
const DUE_ORIGINAL = monthsFrom(2026, 8) // 2 Aug 2026
const DUE_DEFERRED = monthsFrom(2027, 12) // 2 Dec 2027
const ANNEX_I = monthsFrom(2028, 8) // 2 Aug 2028 (product-embedded tier)

const STEPS: Step[] = [
  {
    date: "2024",
    title: "AI Act enters force",
    detail: "the world's most ambitious AI rulebook is law",
    deadlineM: DUE_ORIGINAL,
    deadlineLabel: "2 Aug 2026",
  },
  {
    date: "Apr 2026",
    title: "Nobody is ready",
    detail: "~78% of organisations have taken NO compliance steps",
    deadlineM: DUE_ORIGINAL,
    deadlineLabel: "2 Aug 2026",
  },
  {
    date: "7 May 2026",
    title: "Digital Omnibus · Stop the Clock",
    detail: "provisional agreement delays high-risk enforcement",
    deadlineM: DUE_DEFERRED,
    deadlineLabel: "2 Dec 2027",
  },
  {
    date: "2 Dec 2027",
    title: "High-risk duties now due",
    detail: "Annex III obligations, 16 months late",
    deadlineM: DUE_DEFERRED,
    deadlineLabel: "2 Dec 2027",
  },
]
const N = STEPS.length - 1

// Clock geometry.
const W = 920
const H = 560
const CX = 300
const CY = 286
const R = 196

// The reader sweeps the regime as the hand reads "now"; the bright pip on the
// rim is the high-risk DEADLINE, and it is what the EU drags backwards.
const SLIP_MONTHS = DUE_ORIGINAL - DUE_DEFERRED // negative: deadline moves back

export function StopTheClock() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // step ∈ [0, N]. Default: fully run — the clock already stopped.
  const [step, setStep] = useState(N)
  const [playing, setPlaying] = useState(false)

  // ▶ — mechanical advance, one stop per tick. Off under reduced motion.
  useEffect(() => {
    if (!playing || reduced) return
    if (step >= N) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setStep((s) => clamp(s + 1, 0, N)), 1200)
    return () => window.clearTimeout(id)
  }, [playing, reduced, step])

  const cur = STEPS[step]
  const dragged = cur.deadlineM === DUE_DEFERRED
  // Has the Omnibus landed? (step index of the slip)
  const slipped = step >= 2

  function play() {
    if (reduced) {
      setStep(N)
      return
    }
    if (step >= N) setStep(0)
    setPlaying(true)
  }

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      setPlaying(false)
      setStep((v) => clamp(v + 1, 0, N))
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      setPlaying(false)
      setStep((v) => clamp(v - 1, 0, N))
    }
  }

  // The "now" hand reads the current calendar position of the regime.
  const nowM = monthsFrom(
    Number(cur.date.slice(-4)) || 2024,
    cur.date.includes("Apr") ? 4 : cur.date.includes("May") ? 5 : cur.date.includes("Dec") ? 12 : 1,
  )
  const nowAng = angleFor(nowM)
  const nowRad = (nowAng * Math.PI) / 180
  const handLen = R - 30
  const handX = CX + Math.cos(nowRad) * handLen
  const handY = CY + Math.sin(nowRad) * handLen

  // The DEADLINE pip — the bright mark on the rim the EU drags backwards.
  const dlAng = angleFor(cur.deadlineM)
  const dlRad = (dlAng * Math.PI) / 180
  const dlX = CX + Math.cos(dlRad) * R
  const dlY = CY + Math.sin(dlRad) * R
  const dlColor = dragged ? p.squeeze : p.leverage

  // Ghost of the ORIGINAL deadline once dragged — the date Europe abandoned.
  const origAng = angleFor(DUE_ORIGINAL)
  const origRad = (origAng * Math.PI) / 180
  const origX = CX + Math.cos(origRad) * R
  const origY = CY + Math.sin(origRad) * R

  // The Annex I product tier — the further-still mark on the rim (faint).
  const aiAng = angleFor(ANNEX_I)
  const aiRad = (aiAng * Math.PI) / 180
  const aiX = CX + Math.cos(aiRad) * R
  const aiY = CY + Math.sin(aiRad) * R

  // Delivered-vs-deferred meter: fraction of the originally-promised timeline
  // that has actually been delivered on time. The slip pushes it to deferred.
  const deferredFrac = slipped ? 1 : 0

  const verdict = !slipped
    ? {
        word: "DUE 2 AUG 2026",
        color: p.leverage,
        line: "the rulebook is written; the high-risk deadline still stands at 2 Aug 2026",
      }
    : {
        word: "CLOCK STOPPED",
        color: p.squeeze,
        line: "Europe dragged its own enforcement hand back to 2 Dec 2027, the rulebook outran the capacity to follow it",
      }

  // Arc sweep from original → deferred, drawn red, the visible "dragging back".
  const slipArc = (() => {
    const a0 = (origAng * Math.PI) / 180
    const a1 = (dlAng * Math.PI) / 180
    const rr = R + 16
    const x0 = CX + Math.cos(a0) * rr
    const y0 = CY + Math.sin(a0) * rr
    const x1 = CX + Math.cos(a1) * rr
    const y1 = CY + Math.sin(a1) * rr
    // sweep-flag 0 → counter-clockwise (backwards), the EU dragging the date back
    return `M ${x0} ${y0} A ${rr} ${rr} 0 0 0 ${x1} ${y1}`
  })()

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V31 · Stop the Clock"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {cur.date} · {verdict.word}
        </span>
      }
      caption={
        <>
          Europe wrote the rulebook, then hit pause on itself. Advance the regime, range, ▶ or
          ←/→, from the AI Act entering force to the{" "}
          <span style={{ color: p.squeeze }}>Digital Omnibus</span> (provisional agreement 7 May
          2026), and watch the EU drag its own high-risk (Annex&nbsp;III) enforcement hand{" "}
          <span style={{ color: p.squeeze }}>backwards</span> from{" "}
          <span style={{ color: p.leverage }}>2 Aug 2026</span> to{" "}
          <span style={{ color: p.squeeze }}>2 Dec 2027</span>, a 16-month slip (product-embedded
          Annex&nbsp;I pushed to 2 Aug 2028). By April 2026 ~78% of organisations had taken no
          compliance steps; penalties of up to €35m or 7% of global turnover loom behind the dial.
          Sources: EU AI Act; Digital Omnibus agreement (7 May 2026); Gibson Dunn / European
          Commission.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`A clock of the EU AI Act high-risk enforcement deadline. At ${cur.date} (${cur.title}), the high-risk Annex III deadline points to ${cur.deadlineLabel}. ${dragged ? "The Digital Omnibus has dragged the deadline backwards from 2 August 2026 to 2 December 2027, a 16-month slip; the product-embedded Annex I tier is pushed to 2 August 2028." : "The deadline still stands at its original 2 August 2026."} By April 2026 about 78 percent of organisations had taken no compliance steps; penalties reach 35 million euros or 7 percent of global turnover.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="stc-face" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.bg} stopOpacity={1} />
            <stop offset="100%" stopColor={mixHex(p.bg, dlColor, 0.06)} stopOpacity={1} />
          </radialGradient>
          <radialGradient id="stc-veto" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={slipped ? 0.18 : 0} />
            <stop offset="70%" stopColor={p.squeeze} stopOpacity={slipped ? 0.06 : 0} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0} />
          </radialGradient>
          <marker id="stc-back" markerWidth="9" markerHeight="9" refX="6" refY="4" orient="auto">
            <path d="M0,0 L7,4 L0,8 Z" fill={p.squeeze} />
          </marker>
        </defs>

        {/* veto bloom behind the dial — reddens once the clock is stopped */}
        <circle cx={CX} cy={CY} r={R + 60} fill="url(#stc-veto)" />

        {/* clock face */}
        <circle cx={CX} cy={CY} r={R} fill="url(#stc-face)" stroke={p.border} strokeWidth={2} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={p.blueprint} strokeWidth={1} />

        {/* month ticks — every 3 months a longer mark, mechanical dial feel */}
        {Array.from({ length: DIAL_HI - DIAL_LO + 1 }, (_, m) => {
          const ang = (angleFor(m + DIAL_LO) * Math.PI) / 180
          const major = m % 6 === 0
          const r0 = R - (major ? 14 : 7)
          const x0 = CX + Math.cos(ang) * r0
          const y0 = CY + Math.sin(ang) * r0
          const x1 = CX + Math.cos(ang) * R
          const y1 = CY + Math.sin(ang) * R
          return (
            <line
              key={`t-${m}`}
              x1={x0}
              y1={y0}
              x2={x1}
              y2={y1}
              stroke={major ? p.soft : p.hair}
              strokeWidth={major ? 1.4 : 1}
            />
          )
        })}

        {/* year labels at the cardinal-ish marks */}
        {[
          { m: monthsFrom(2024, 1), label: "2024" },
          { m: monthsFrom(2025, 1), label: "2025" },
          { m: monthsFrom(2026, 1), label: "2026" },
          { m: monthsFrom(2027, 1), label: "2027" },
          { m: monthsFrom(2028, 1), label: "2028" },
        ].map((y) => {
          const ang = (angleFor(y.m) * Math.PI) / 180
          const rr = R - 30
          return (
            <text
              key={`y-${y.label}`}
              x={CX + Math.cos(ang) * rr}
              y={CY + Math.sin(ang) * rr + 4}
              textAnchor="middle"
              fill={p.soft}
              style={{ fontSize: 11, letterSpacing: "0.04em" }}
            >
              {y.label}
            </text>
          )
        })}

        {/* the SLIP arc — original → deferred, dragged BACKWARDS (only once stopped) */}
        {slipped && (
          <path
            d={slipArc}
            fill="none"
            stroke={p.squeeze}
            strokeWidth={3}
            strokeLinecap="round"
            markerEnd="url(#stc-back)"
            opacity={0.92}
          />
        )}

        {/* ghost of the ORIGINAL deadline (the date Europe abandoned) */}
        {slipped && (
          <g opacity={0.7}>
            <line
              x1={CX}
              y1={CY}
              x2={origX}
              y2={origY}
              stroke={p.leverage}
              strokeWidth={1.4}
              strokeDasharray="3 5"
            />
            <circle cx={origX} cy={origY} r={5} fill="none" stroke={p.leverage} strokeWidth={1.6} />
            <text
              x={origX + 10}
              y={origY - 6}
              fill={p.leverage}
              style={{ fontSize: 10.5, letterSpacing: "0.04em" }}
            >
              2 Aug 2026, promised
            </text>
          </g>
        )}

        {/* Annex I product tier — the further mark, always faint on the rim */}
        <g opacity={0.55}>
          <circle cx={aiX} cy={aiY} r={3.5} fill={p.wonder} />
          <text
            x={aiX}
            y={aiY + 22}
            textAnchor="middle"
            fill={p.wonderHi}
            style={{ fontSize: 9.5, letterSpacing: "0.04em" }}
          >
            Annex I · 2 Aug 2028
          </text>
        </g>

        {/* the DEADLINE pip — the live high-risk enforcement mark */}
        <g
          style={{
            transition: reduced ? "none" : "transform 700ms cubic-bezier(.45,0,.15,1)",
          }}
        >
          <line x1={CX} y1={CY} x2={dlX} y2={dlY} stroke={dlColor} strokeWidth={2.4} />
          <circle cx={dlX} cy={dlY} r={8} fill={dlColor} stroke={p.bg} strokeWidth={2} />
          <circle cx={dlX} cy={dlY} r={14} fill="none" stroke={rgba(dragged ? "240,112,138" : "108,198,230", 0.4)} strokeWidth={1.4} />
          <text
            x={dlX + (dlX > CX ? 16 : -16)}
            y={dlY + (dlY > CY ? 18 : -10)}
            textAnchor={dlX > CX ? "start" : "end"}
            fill={dlColor}
            style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.03em" }}
          >
            HIGH-RISK · {cur.deadlineLabel}
          </text>
        </g>

        {/* the "now" hand — where the regime currently reads */}
        <line
          x1={CX}
          y1={CY}
          x2={handX}
          y2={handY}
          stroke={p.ink}
          strokeWidth={3.2}
          strokeLinecap="round"
          style={{ transition: reduced ? "none" : "all 700ms cubic-bezier(.45,0,.15,1)" }}
        />
        <circle cx={CX} cy={CY} r={7} fill={p.ink} />
        <circle cx={CX} cy={CY} r={3} fill={p.bg} />
        <text x={CX} y={CY + R + 34} textAnchor="middle" fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.16em" }}>
          REGIME READS · {cur.date.toUpperCase()}
        </text>

        {/* ============ RIGHT-HAND READOUT ============ */}
        {/* delivered vs deferred */}
        <text x={W - 60} y={92} textAnchor="end" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em" }}>
          HIGH-RISK ENFORCEMENT
        </text>
        <text x={W - 57} y={150} textAnchor="end" fill={dlColor} style={{ fontSize: 50, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {cur.deadlineLabel}
        </text>
        <text x={W - 60} y={176} textAnchor="end" fill={p.muted} style={{ fontSize: 12.5 }}>
          {dragged ? "deferred · was 2 Aug 2026" : "as written · Annex III duties"}
        </text>

        {/* the slip counter */}
        <text x={W - 60} y={224} textAnchor="end" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em" }}>
          THE SLIP
        </text>
        <text x={W - 57} y={272} textAnchor="end" fill={p.squeeze} style={{ fontSize: 42, fontWeight: 800 }}>
          {slipped ? `−${Math.abs(SLIP_MONTHS)} months` : "0 months"}
        </text>
        <text x={W - 60} y={296} textAnchor="end" fill={p.muted} style={{ fontSize: 12 }}>
          {slipped ? "dragged backwards by the Omnibus" : "deadline still as promised"}
        </text>

        {/* the readiness confession */}
        <text x={W - 60} y={344} textAnchor="end" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em" }}>
          BY APRIL 2026
        </text>
        <text x={W - 57} y={392} textAnchor="end" fill={p.wonderHi} style={{ fontSize: 42, fontWeight: 800 }}>
          78%
        </text>
        <text x={W - 60} y={416} textAnchor="end" fill={p.muted} style={{ fontSize: 12 }}>
          of organisations had taken NO compliance steps
        </text>

        {/* the penalty that looms */}
        <text x={W - 60} y={464} textAnchor="end" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em" }}>
          PENALTY BEHIND THE DIAL
        </text>
        <text x={W - 57} y={500} textAnchor="end" fill={p.squeeze} style={{ fontSize: 24, fontWeight: 800 }}>
          up to €35m / 7% turnover
        </text>

        {/* current-step caption beneath the clock */}
        <text x={CX} y={H - 18} textAnchor="middle" fill={p.muted} style={{ fontSize: 12.5, fontWeight: 600 }}>
          {cur.title}, {cur.detail}
        </text>
      </svg>

      {/* ============ meter + verdict + scrubber ============ */}
      <div className="mt-2 px-1">
        {/* delivered-on-time ⟷ deferred meter */}
        <div className="flex items-center justify-between text-[10px]" style={{ color: p.soft, fontFamily: "var(--font-mono), monospace", letterSpacing: "0.12em" }}>
          <span style={{ color: deferredFrac < 1 ? p.leverage : p.soft }}>DELIVERED ON TIME</span>
          <span style={{ color: deferredFrac >= 1 ? p.squeeze : p.soft }}>DEFERRED</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full" style={{ background: rgba(p.glowRGB, 0.16) }} aria-hidden>
          <div
            style={{
              width: `${lerp(0, 100, easeInOut(clamp01(deferredFrac)))}%`,
              height: "100%",
              background: p.squeeze,
              float: "right",
              transition: reduced ? "none" : "width 620ms ease-out",
            }}
          />
          <div
            style={{
              width: `${lerp(100, 0, clamp01(deferredFrac))}%`,
              height: "100%",
              background: p.leverage,
              float: "left",
              transition: reduced ? "none" : "width 620ms ease-out",
            }}
          />
        </div>

        <p className="mt-3 text-[15px]" style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}>
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span>, {verdict.line}.
        </p>

        {/* scrubber + play + step tabs — the reader advances the regime */}
        <div className="mt-3 flex items-center gap-3" onKeyDown={onKey}>
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-label={playing ? "Pause the regime" : "Play the regime, from the AI Act entering force to the Digital Omnibus stopping the clock"}
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
            aria-label="Advance the AI Act regime from the Act entering force to the Digital Omnibus stopping the clock"
            aria-valuetext={`${cur.date}: ${cur.title}, high-risk enforcement ${cur.deadlineLabel}${dragged ? ", dragged back 16 months from 2 Aug 2026" : ""}`}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: dragged ? p.squeeze : p.leverage, background: p.hair }}
          />
          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: p.soft, fontSize: 11, whiteSpace: "nowrap" }}
          >
            {step + 1}/{N + 1}
          </span>
        </div>
      </div>
    </PlateFrame>
  )
}
