"use client"

/**
 * V9 — THE FOUR-STROKE ENGINE  (the essay's signature centerpiece + organizing
 * metaphor). The wealth-transfer loop drawn as a working machine: four labelled
 * stations evenly around a ring, arrows carrying the flow, a piston-indicator
 * travelling the cycle, and a spiral that visibly WIDENS each revolution —
 * because the transfer compounds.
 *
 *   1. SAVE      — ~€33tn of European savings; ~€300bn/yr wired OUT.
 *   2. FUND      — that capital underwrites the US labs / hyperscalers / VCs;
 *                  73% of the leads in big European rounds are American.
 *   3. POACH     — those firms take Europe's researchers at 3x–5x pay.
 *   4. SELL-BACK — they sell the cloud / models / chips back, ~€264bn/yr,
 *                  keeping ~80% of the value-added. Then the loop repeats, WIDER.
 *
 * "Cancel the standing order" REVERSES the engine — arrows flip, labels invert
 * to the off-ramp, and the spiral tightens back in. That reversal is the
 * thesis's earned hope: re-route the savings home, fund the missing €25–100M
 * middle, keep the founders, keep the equity.
 *
 * Theme-aware (re-renders on the Read-mode flip), reduced-motion safe (no
 * ambient run — the full labelled loop is shown statically and the user Steps),
 * keyboard-reachable (native buttons + checkbox). Cyan = outflow/leverage,
 * rose = the squeeze, gold = the reversed/wonder state.
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
import { cpPalette, mixHex, rgba } from "./chokepoint-kit"

const CX = 420
const CY = 300
const RING = 188

type Stroke = {
  /** angle around the ring, degrees, 0 = top, clockwise */
  deg: number
  fwd: { label: string; figure: string; note: string }
  rev: { label: string; figure: string; note: string }
}

const STROKES: Stroke[] = [
  {
    deg: 0,
    fwd: { label: "SAVE", figure: "€300bn/yr", note: "wired OUT of European markets" },
    rev: { label: "RE-ROUTE", figure: "€33tn", note: "savings kept working at home" },
  },
  {
    deg: 90,
    fwd: { label: "FUND", figure: "73%", note: "of big-round leads are American" },
    rev: { label: "FUND THE MIDDLE", figure: "€25–100M", note: "the missing growth tier, backed" },
  },
  {
    deg: 180,
    fwd: { label: "POACH", figure: "3x–5x", note: "pay takes Europe's researchers" },
    rev: { label: "KEEP TALENT", figure: "+30%", note: "more AI talent per capita — retained" },
  },
  {
    deg: 270,
    fwd: { label: "SELL-BACK", figure: "€264bn/yr", note: "cloud & models, ~80% value kept" },
    rev: { label: "KEEP EQUITY", figure: "~80%", note: "value-added stays with the founders" },
  },
]

/** point on a circle, 0deg = top, clockwise, optional radius scale. */
function onRing(deg: number, r: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180
  return [CX + Math.cos(a) * r, CY + Math.sin(a) * r]
}

export function FourStrokeEngine() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  const [reverse, setReverse] = useState(false)
  const [playing, setPlaying] = useState(false)
  /** continuous phase in strokes; 4 strokes = one revolution. */
  const [phase, setPhase] = useState(0)
  const phaseRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number | null>(null)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // ambient run — never auto-runs under reduced motion (gated by `playing`).
  useEffect(() => {
    if (!playing) return
    const tick = (t: number) => {
      if (lastRef.current == null) lastRef.current = t
      const dt = (t - lastRef.current) / 1000
      lastRef.current = t
      // one stroke ≈ 1.4s
      const next = phaseRef.current + dt / 1.4
      phaseRef.current = next
      setPhase(next)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      lastRef.current = null
    }
  }, [playing])

  const step = () => {
    setPlaying(false)
    setPhase((q) => Math.floor(q + 1 + 1e-6))
  }

  const accent = reverse ? p.wonder : p.leverage
  const accentHi = reverse ? p.wonderHi : p.leverageHi

  // travelling indicator angle: forward = clockwise, reverse = anticlockwise.
  const dir = reverse ? -1 : 1
  const segT = easeInOut(clamp01(phase - Math.floor(phase)))
  const idx = ((Math.floor(phase) % 4) + 4) % 4
  const fromDeg = idx * 90
  const indDeg = fromDeg + dir * 90 * segT

  // spiral radius — widens with each forward revolution, tightens in reverse.
  const revs = phase / 4
  const spiralGrow = reverse
    ? lerp(0.34, -0.02, clamp01(revs / 3))
    : lerp(0, 0.34, clamp01(revs / 3))

  // running euro counter — €264bn/yr extracted per full revolution (forward).
  const extracted = Math.max(0, revs) * 264
  const euros = reverse
    ? Math.round(Math.max(0, 264 - extracted))
    : Math.round(extracted)

  // which stroke is "lit" right now
  const liveIdx = ((Math.round(indDeg / 90) % 4) + 4) % 4

  const [ix, iy] = onRing(indDeg, RING)

  // a widening / tightening spiral path (1.6 turns) rendered statically.
  const spiralPts: Array<[number, number]> = []
  const turns = 1.6
  const segs = 120
  for (let i = 0; i <= segs; i++) {
    const tt = i / segs
    const ang = ((indDeg - 90) * Math.PI) / 180 - dir * tt * turns * 2 * Math.PI
    const r = RING * (1 + spiralGrow * tt * (reverse ? 1 : 1)) * lerp(1, reverse ? 0.62 : 1.46, tt)
    spiralPts.push([CX + Math.cos(ang) * r, CY + Math.sin(ang) * r])
  }
  const spiralD = spiralPts
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`)
    .join(" ")

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V9 · The Four-Stroke Engine"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: reverse ? p.wonderHi : p.squeeze }}
        >
          {reverse ? "OFF-RAMP" : "EXTRACTING"}
        </span>
      }
      caption={
        <>
          The wealth-transfer loop as a working machine. Forward, the engine wires{" "}
          <span style={{ color: p.leverage }}>€300bn/yr</span> of savings out, funds the labs that
          poach Europe&apos;s researchers, then sells the cloud back at{" "}
          <span style={{ color: p.squeeze }}>€264bn/yr</span> — and the ring widens, the transfer
          compounding each turn. Cancel the standing order and the engine{" "}
          <span style={{ color: p.wonder }}>reverses</span>: the savings come home, the middle gets
          funded, the founders keep the equity. Sources: ~€300bn/yr net capital export; ~€264bn/yr
          European cloud spend; 73% US-led growth rounds; 3x–5x researcher pay gap.
        </>
      }
    >
      <svg
        viewBox="0 0 840 600"
        role="img"
        aria-label="A four-stroke engine of the European wealth-transfer loop: SAVE, FUND, POACH, SELL-BACK around a widening ring"
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="fs-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentHi} stopOpacity={0.5} />
            <stop offset="60%" stopColor={accent} stopOpacity={0.16} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </radialGradient>
          <marker id="fs-head-fwd" markerWidth="8" markerHeight="8" refX="5.5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={p.leverage} />
          </marker>
          <marker id="fs-head-rev" markerWidth="8" markerHeight="8" refX="5.5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={p.wonder} />
          </marker>
        </defs>

        {/* compounding spiral — wider each forward turn, tighter in reverse */}
        <path
          d={spiralD}
          fill="none"
          stroke={accent}
          strokeWidth={1.1}
          strokeOpacity={0.34}
          strokeLinecap="round"
        />

        {/* blueprint base ring */}
        <circle cx={CX} cy={CY} r={RING} fill="none" stroke={p.blueprint} strokeWidth={1} />
        <circle
          cx={CX}
          cy={CY}
          r={RING}
          fill="none"
          stroke={accent}
          strokeWidth={1.6}
          strokeOpacity={0.5}
          strokeDasharray="2 9"
        />

        {/* flow arrows along each quadrant of the ring */}
        {STROKES.map((_, i) => {
          const a0 = i * 90 + (reverse ? 12 : -12)
          const a1 = (i + 1) * 90 - (reverse ? 12 : -12)
          const sweep = reverse ? a0 : a1
          const start = reverse ? a1 : a0
          const arcPts: string[] = []
          const N = 14
          for (let k = 0; k <= N; k++) {
            const d = lerp(start, sweep, k / N)
            const [x, y] = onRing(d, RING)
            arcPts.push(`${k === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
          }
          const lit = i === liveIdx
          return (
            <path
              key={`arc-${i}`}
              d={arcPts.join(" ")}
              fill="none"
              stroke={lit ? accentHi : accent}
              strokeWidth={lit ? 3 : 1.8}
              strokeOpacity={lit ? 1 : 0.7}
              markerEnd={reverse ? "url(#fs-head-rev)" : "url(#fs-head-fwd)"}
            />
          )
        })}

        {/* core glow + euro counter */}
        <circle cx={CX} cy={CY} r={RING - 14} fill="url(#fs-core)" />
        <text
          x={CX}
          y={CY - 22}
          textAnchor="middle"
          fill={p.soft}
          style={{ fontSize: 11, letterSpacing: "0.22em" }}
        >
          {reverse ? "RETAINED / YR" : "EXTRACTED / YR"}
        </text>
        <text
          x={CX}
          y={CY + 18}
          textAnchor="middle"
          fill={reverse ? p.wonderHi : p.squeezeHi}
          style={{ fontSize: 44, fontWeight: 800, letterSpacing: "0.01em" }}
        >
          €{euros}
        </text>
        <text
          x={CX}
          y={CY + 44}
          textAnchor="middle"
          fill={p.muted}
          style={{ fontSize: 12.5 }}
        >
          bn · {reverse ? "tightening" : "compounding"} · {(reverse ? Math.max(0, 3 - revs) : revs).toFixed(1)} turns
        </text>

        {/* four stations */}
        {STROKES.map((st, i) => {
          const [sx, sy] = onRing(st.deg, RING)
          const copy = reverse ? st.rev : st.fwd
          const lit = i === liveIdx
          const outward = onRing(st.deg, RING + 56)
          const right = st.deg === 90
          const left = st.deg === 270
          const top = st.deg === 0
          const anchor: "start" | "middle" | "end" = right ? "start" : left ? "end" : "middle"
          const lx = outward[0]
          const ly = outward[1] + (top ? -6 : st.deg === 180 ? 22 : 4)
          return (
            <g key={`st-${i}`}>
              <circle
                cx={sx}
                cy={sy}
                r={lit ? 17 : 13}
                fill={lit ? mixHex(p.bg, accent, 0.55) : p.bg}
                stroke={lit ? accentHi : accent}
                strokeWidth={lit ? 2.6 : 1.8}
              />
              <text
                x={sx}
                y={sy + 4}
                textAnchor="middle"
                fill={lit ? accentHi : accent}
                style={{ fontSize: 12, fontWeight: 800 }}
              >
                {i + 1}
              </text>
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                fill={lit ? accentHi : p.ink}
                style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: "0.04em" }}
              >
                {copy.label}
              </text>
              <text
                x={lx}
                y={ly + 19}
                textAnchor={anchor}
                fill={reverse ? p.wonder : i === 0 || i === 3 ? p.squeeze : p.leverage}
                style={{ fontSize: 16, fontWeight: 700 }}
              >
                {copy.figure}
              </text>
              <text
                x={lx}
                y={ly + 35}
                textAnchor={anchor}
                fill={p.muted}
                style={{ fontSize: 11 }}
              >
                {copy.note}
              </text>
            </g>
          )
        })}

        {/* travelling piston indicator */}
        <circle cx={ix} cy={iy} r={9} fill={accentHi} />
        <circle cx={ix} cy={iy} r={9} fill="none" stroke={p.bg} strokeWidth={2} />
        <circle cx={ix} cy={iy} r={15} fill="none" stroke={accentHi} strokeWidth={1} strokeOpacity={0.5} />
      </svg>

      {/* controls */}
      <div className="mt-3 flex flex-wrap items-center gap-3 px-1">
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          disabled={reduced}
          aria-pressed={playing}
          className="rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-wide disabled:opacity-40"
          style={{
            fontFamily: "var(--font-mono), monospace",
            color: accentHi,
            borderColor: rgba(p.inkRGB, 0.2),
            background: playing ? rgba(p.inkRGB, 0.06) : "transparent",
          }}
        >
          {playing ? "❚❚ PAUSE" : "▶ PLAY"}
        </button>
        <button
          type="button"
          onClick={step}
          className="rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-wide"
          style={{
            fontFamily: "var(--font-mono), monospace",
            color: p.ink,
            borderColor: rgba(p.inkRGB, 0.2),
            background: "transparent",
          }}
        >
          STEP ▸
        </button>

        <label
          className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-wide"
          style={{
            fontFamily: "var(--font-mono), monospace",
            color: reverse ? p.wonderHi : p.soft,
            borderColor: reverse ? rgba(p.glowRGB, 0.5) : rgba(p.inkRGB, 0.2),
            background: reverse ? rgba(p.glowRGB, 0.08) : "transparent",
          }}
        >
          <input
            type="checkbox"
            checked={reverse}
            onChange={(e) => {
              setReverse(e.target.checked)
              setPlaying(false)
              setPhase(0)
            }}
            className="h-3.5 w-3.5 cursor-pointer"
            style={{ accentColor: p.wonder }}
          />
          CANCEL THE STANDING ORDER
        </label>
      </div>

      {/* live readout strip */}
      <div className="mt-2 px-1">
        <p
          className="text-[14px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontStyle: "normal",
              fontWeight: 700,
              color: reverse ? p.wonderHi : accentHi,
            }}
          >
            {reverse
              ? (STROKES[liveIdx].rev.label)
              : (STROKES[liveIdx].fwd.label)}
          </span>{" "}
          —{" "}
          {reverse
            ? "the loop runs backwards: the savings come home and stay invested."
            : "each revolution the ring widens — the transfer compounds, wider than the last."}
        </p>
      </div>
    </PlateFrame>
  )
}
