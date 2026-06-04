"use client"

/**
 * The Long Arc — Rosenblatt → Hinton → now, drawn as an *accelerating* instrument.
 *
 * Not a timeline. A **logarithmic spiral** unwinds from 1958 at the still core to
 * 2026 at the rim: year → angle is (near-)linear, but the radius grows
 * exponentially, so equal calendar steps sweep ever-longer arcs as you spiral
 * out. The first three decades are cramped onto tight inner coils — the field's
 * slow burn — and the post-2012 deep-learning era fans across the wide outer rim
 * where each year is suddenly an enormous stride. The two AI WINTERS read as
 * dim, desaturated stretches of the coil; the modern surge is bright, dense, and
 * accelerating, ending at a faint "you are here · 2026" mark on the leading edge.
 *
 * Hover / focus / click a milestone → the panel gives year · event · who · why
 * it mattered. AlexNet (2012, the ignition) is active by default. Theme-aware via
 * the Read mode, keyboard-operable, reduced-motion safe.
 */

import { useEffect, useRef, useState } from "react"
import {
  PlateFrame,
  paletteFor,
  useReadMode,
  usePrefersReducedMotion,
  clamp,
  clamp01,
  lerp,
  easeOut,
  type ReadPalette,
} from "./read-chart-kit"

const VW = 1040
const VH = 760
const CX = 452
const CY = 392

// Spiral geometry. Year maps to a turn-angle θ (radians, growing clockwise from
// a lower-left start); radius grows exponentially with θ → a true log spiral.
const Y0 = 1958
const Y1 = 2026
const THETA0 = Math.PI * 0.92 // start angle (points up-left toward the core lead-in)
const TURNS = 2.62 // total revolutions from core to rim
const THETA1 = THETA0 + TURNS * 2 * Math.PI
const R_CORE = 30 // radius at 1958 (the seed)
const R_RIM = 332 // radius at 2026 (leading edge)
// r(θ) = R_CORE * e^(k·(θ-THETA0)) with k solved so r(THETA1)=R_RIM
const SPIRAL_K = Math.log(R_RIM / R_CORE) / (THETA1 - THETA0)

type Tone = keyof ReadPalette["series"]

interface Milestone {
  id: string
  year: number
  /** sub-year fraction for ordering co-located events (0..1 within the year) */
  frac?: number
  label: string
  who: string
  sig: string
  tone: Tone
  /** the headline ignition node gets a permanent halo */
  ignition?: boolean
}

// dated to the brief; spiral order is strictly chronological
const MILES: Milestone[] = [
  { id: "perceptron", year: 1958, label: "Perceptron", who: "Frank Rosenblatt · Cornell", sig: "The first trainable neural net — a machine that learns its own weights. (Mark I built 1960.)", tone: "cool" },
  { id: "perceptrons-book", year: 1969, label: "Perceptrons", who: "Minsky & Papert · MIT", sig: "A book proves the single layer can’t learn XOR. Funding evaporates — the 1st AI winter.", tone: "rose" },
  { id: "backprop", year: 1986, label: "Backprop popularised", who: "Rumelhart, Hinton & Williams", sig: "Errors flow backward through many layers. Derived in 1974; this is the paper that lit the fuse.", tone: "violet" },
  { id: "alexnet", year: 2012, label: "AlexNet", who: "Krizhevsky, Sutskever & Hinton", sig: "A deep CNN on two GPUs halves the ImageNet error rate. The ignition of the modern era.", tone: "gold", ignition: true },
  { id: "transformer", year: 2017, label: "Transformer", who: "Vaswani et al. · Google", sig: "“Attention Is All You Need.” Drops recurrence — the architecture every LLM is built on.", tone: "teal" },
  { id: "gpt1", year: 2018, label: "GPT-1", who: "Alec Radford et al. · OpenAI", sig: "Generative pre-training, then fine-tune. The recipe that scaled into everything after.", tone: "copper" },
  { id: "gpt3", year: 2020, label: "GPT-3 + scaling laws", who: "Brown, Kaplan et al. · OpenAI", sig: "175B parameters; few-shot from a prompt. Scaling laws say bigger keeps paying off.", tone: "violet" },
  { id: "chatgpt", year: 2022, frac: 0.91, label: "ChatGPT", who: "OpenAI · 30 Nov 2022", sig: "A chat box puts the model in everyone’s hands. ~100M users in two months — fastest ever.", tone: "gold" },
  { id: "gpt4", year: 2023, frac: 0.2, label: "GPT-4", who: "OpenAI", sig: "Multimodal, near-expert on hard exams. The frontier becomes broadly, reliably useful.", tone: "teal" },
  { id: "nobel", year: 2024, frac: 0.78, label: "Hinton’s Nobel", who: "Hinton, w/ John Hopfield", sig: "The Nobel Prize in Physics for the foundations of learning machines. The field, vindicated.", tone: "gold" },
  { id: "agentic", year: 2025.4, label: "The agentic turn", who: "the frontier labs", sig: "Models stop answering and start doing — planning, tool-use, multi-step work. 2023→26.", tone: "copper" },
]

// Two winters as year-ranges → dim, desaturated stretches of the coil.
const WINTERS: { from: number; to: number; label: string }[] = [
  { from: 1969, to: 1980, label: "1st winter" },
  { from: 1987, to: 1993, label: "2nd winter" },
]

const NOW = 2026

function yearToTheta(year: number): number {
  const t = clamp01((year - Y0) / (Y1 - Y0))
  return THETA0 + t * (THETA1 - THETA0)
}
function rAtTheta(theta: number): number {
  return R_CORE * Math.exp(SPIRAL_K * (theta - THETA0))
}
function spiralPoint(year: number): [number, number] {
  const th = yearToTheta(year)
  const r = rAtTheta(th)
  // Quantise the trig output so the SSR string matches the client byte-for-byte
  // (Node and Chrome V8 can differ by 1 ULP in Math.cos/sin → hydration mismatch).
  return [Math.round((CX + r * Math.cos(th)) * 100) / 100, Math.round((CY + r * Math.sin(th)) * 100) / 100]
}
/** unit outward normal at a year (points away from the core) — for label offsets. */
function outwardNormal(year: number): [number, number] {
  const th = yearToTheta(year)
  return [Math.round(Math.cos(th) * 1e4) / 1e4, Math.round(Math.sin(th) * 1e4) / 1e4]
}

/** Sample the spiral between two years into an SVG polyline `d`. */
function spiralPath(yA: number, yB: number, steps = 120): string {
  const out: string[] = []
  for (let i = 0; i <= steps; i++) {
    const y = lerp(yA, yB, i / steps)
    const [x, yy] = spiralPoint(y)
    out.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${yy.toFixed(2)}`)
  }
  return out.join(" ")
}

const mi0 = MILES[0]
function milestoneYear(m: Milestone): number {
  return m.year + (m.frac ?? 0)
}

export function AILongArc() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = paletteFor(mode)

  const [activeId, setActiveId] = useState<string>("alexnet")
  const active = MILES.find((m) => m.id === activeId) ?? MILES[3]

  // one-shot draw-on: the coil sweeps out from the core, 0 → 1.
  const [draw, setDraw] = useState(reduced ? 1 : 0)
  useEffect(() => {
    if (reduced) {
      setDraw(1)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const DUR = 1700
    const tick = (t: number) => {
      const e = easeOut(clamp01((t - t0) / DUR))
      setDraw(e)
      if (e < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  // how far along the spiral the draw has reached, expressed as a year cutoff.
  const drawYear = lerp(Y0, NOW, draw)

  const toneOf = (t: Tone) => p.series[t]
  const surfaceInk = mode === "dark" ? "#0c1828" : "#fbf7ec"

  const [nowX, nowY] = spiralPoint(NOW)
  const [coreX, coreY] = spiralPoint(Y0)

  // decade ticks (faint) along the spiral, for scale
  const decades: number[] = []
  for (let y = 1960; y <= 2020; y += 10) decades.push(y)

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker="Fig. — The Long Arc · Rosenblatt 1958 → now · a spiral that accelerates"
      caption={
        <>
          <strong style={{ color: p.ink, fontStyle: "normal" }}>
            {Math.floor(active.year)} · {active.label}.
          </strong>{" "}
          {active.who} — {active.sig} The spiral winds out from a 1958 seed: the
          early decades crowd the core through two cold{" "}
          <span style={{ color: p.accent }}>winters</span>, then the post-2012 era
          fans across the rim, each year a longer stride than the last.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full touch-none select-none"
        role="img"
        aria-label={
          "The long arc of AI as a logarithmic spiral that accelerates outward. From a 1958 seed at the core — Rosenblatt's perceptron — the coil winds through the two AI winters (1969–80 and 1987–93), shown as dim stretches, then surges after AlexNet in 2012: Transformer 2017, GPT-1 2018, GPT-3 2020, ChatGPT 2022, GPT-4 2023, Hinton's 2024 Nobel in Physics, and the agentic turn to 2026. Each later year sweeps a longer arc than the one before. Select a milestone for details."
        }
      >
        <defs>
          <radialGradient id="ala-bloom" cx="44%" cy="52%" r="62%">
            <stop offset="0%" stopColor={`rgba(${p.glowRGB},${mode === "dark" ? 0.16 : 0.09})`} />
            <stop offset="62%" stopColor={`rgba(${p.glowRGB},0)`} />
          </radialGradient>
          <radialGradient id="ala-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.series.gold} stopOpacity={mode === "dark" ? 0.95 : 0.85} />
            <stop offset="55%" stopColor={p.series.copper} stopOpacity="0.35" />
            <stop offset="100%" stopColor={p.series.copper} stopOpacity="0" />
          </radialGradient>
          {/* the surge glow rides the outer coil */}
          <linearGradient id="ala-surge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={p.series.copper} stopOpacity="0" />
            <stop offset="55%" stopColor={p.series.copper} stopOpacity={mode === "dark" ? 0.5 : 0.34} />
            <stop offset="100%" stopColor={p.series.gold} stopOpacity={mode === "dark" ? 0.95 : 0.7} />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={VW} height={VH} fill="url(#ala-bloom)" />

        {/* ───────────────────────── the spiral rail ─────────────────────────
            Drawn in three weights, all clipped to the draw-on progress:
            (1) a faint full ghost coil, (2) the winters dimmed, (3) the bright
            surge from 2012 out, fattening toward the rim. */}

        {/* (1) base coil — the whole 70-year filament, cool and quiet */}
        <path
          d={spiralPath(Y0, drawYear)}
          fill="none"
          stroke={p.ink}
          strokeOpacity={mode === "dark" ? 0.34 : 0.28}
          strokeWidth={1.4}
          strokeLinecap="round"
        />

        {/* (2) winters — desaturated, dimmed over-strokes that read as cold valleys */}
        {WINTERS.map((w) => {
          const visTo = Math.min(w.to, drawYear)
          if (visTo <= w.from) return null
          const [mx, my] = spiralPoint((w.from + w.to) / 2)
          const [nx, ny] = outwardNormal((w.from + w.to) / 2)
          return (
            <g key={w.label}>
              {/* a soft cold wash hugging the coil */}
              <path
                d={spiralPath(w.from, visTo, 70)}
                fill="none"
                stroke={p.series.cool}
                strokeOpacity={mode === "dark" ? 0.22 : 0.18}
                strokeWidth={11}
                strokeLinecap="round"
              />
              {/* the coil itself goes dim & dashed through the freeze */}
              <path
                d={spiralPath(w.from, visTo, 70)}
                fill="none"
                stroke={p.muted}
                strokeOpacity={0.6}
                strokeWidth={1.2}
                strokeDasharray="2 5"
              />
              {visTo >= w.to - 0.01 && (
                <text
                  x={mx + nx * 22}
                  y={my + ny * 22}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-mono), monospace"
                  fontSize={10}
                  letterSpacing={1.6}
                  fill={p.soft}
                  style={{ textTransform: "uppercase" }}
                >
                  {w.label}
                </text>
              )}
            </g>
          )
        })}

        {/* (3) the surge — bright, fattening band from AlexNet to the rim */}
        {drawYear > 2012 && (
          <>
            <path
              d={spiralPath(2012, Math.min(drawYear, NOW), 90)}
              fill="none"
              stroke="url(#ala-surge)"
              strokeOpacity={0.9}
              strokeWidth={9}
              strokeLinecap="round"
            />
            <path
              d={spiralPath(2012, Math.min(drawYear, NOW), 90)}
              fill="none"
              stroke={p.accent}
              strokeOpacity={0.95}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          </>
        )}

        {/* decade ticks — tiny outward gnomons, a faint ruler on the coil */}
        {decades.map((y) => {
          if (y > drawYear) return null
          const [x, yy] = spiralPoint(y)
          const [nx, ny] = outwardNormal(y)
          const len = 5 + 5 * clamp01((y - Y0) / (Y1 - Y0)) // grow with the coil
          return (
            <g key={`dec-${y}`}>
              <line
                x1={x}
                y1={yy}
                x2={x + nx * len}
                y2={yy + ny * len}
                stroke={p.soft}
                strokeOpacity={0.5}
                strokeWidth={0.8}
              />
              {y % 20 === 0 && (
                <text
                  x={x + nx * (len + 9)}
                  y={yy + ny * (len + 9)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-mono), monospace"
                  fontSize={9}
                  fill={p.soft}
                  fillOpacity={0.7}
                >
                  {y}
                </text>
              )}
            </g>
          )
        })}

        {/* ───────────────────────── milestone nodes ───────────────────────── */}
        {MILES.map((m, i) => {
          const my = milestoneYear(m)
          const lit = my <= drawYear + 0.001
          if (!lit) return null
          const [x, y] = spiralPoint(my)
          const [nx, ny] = outwardNormal(my)
          const c = toneOf(m.tone)
          const isActive = activeId === m.id
          // leader pushes the label outward; later (outer) nodes get more room
          const reach = lerp(26, 64, clamp01((my - Y0) / (Y1 - Y0)))
          const lx = x + nx * reach
          const ly = y + ny * reach
          // keep labels from drifting off-canvas on the right edge
          const anchor: "start" | "end" | "middle" =
            nx > 0.35 ? "start" : nx < -0.35 ? "end" : "middle"
          const detail = `${i + 1}. ${m.label}, ${Math.floor(m.year)} — ${m.who}. ${m.sig}`
          return (
            <g
              key={m.id}
              role="button"
              tabIndex={0}
              aria-label={detail}
              aria-pressed={isActive}
              onMouseEnter={() => setActiveId(m.id)}
              onFocus={() => setActiveId(m.id)}
              onClick={() => setActiveId(m.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setActiveId(m.id)
                }
              }}
              style={{ cursor: "pointer", outline: "none" }}
            >
              {/* leader line */}
              <line
                x1={x + nx * 7}
                y1={y + ny * 7}
                x2={lx - nx * 5}
                y2={ly - ny * 5}
                stroke={isActive ? c : p.hair}
                strokeOpacity={isActive ? 0.8 : 1}
                strokeWidth={isActive ? 1.2 : 0.8}
              />

              {/* ignition halo (AlexNet) — a permanent corona */}
              {m.ignition && (
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 22 : 17}
                  fill={c}
                  fillOpacity={mode === "dark" ? 0.16 : 0.13}
                  style={{ transition: reduced ? undefined : "r 220ms ease" }}
                />
              )}
              {/* focus / active ring */}
              {isActive && (
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="none"
                  stroke={c}
                  strokeOpacity={0.85}
                  strokeWidth={1.4}
                />
              )}
              {/* hit target */}
              <circle cx={x} cy={y} r={16} fill="transparent" />
              {/* the node */}
              <circle
                cx={x}
                cy={y}
                r={isActive ? 6.5 : m.ignition ? 5.5 : 4.5}
                fill={c}
                stroke={surfaceInk}
                strokeWidth={1.6}
                style={{ transition: reduced ? undefined : "r 200ms ease" }}
              />

              {/* label block: YEAR (mono) + name (serif italic) */}
              <text
                x={lx}
                y={ly - 4}
                textAnchor={anchor}
                fontFamily="var(--font-mono), monospace"
                fontSize={11}
                fontWeight={600}
                letterSpacing={0.6}
                fill={isActive ? c : p.muted}
              >
                {Math.floor(m.year)}
              </text>
              <text
                x={lx}
                y={ly + 10}
                textAnchor={anchor}
                fontFamily="var(--font-serif), serif"
                fontStyle="italic"
                fontSize={13}
                fill={isActive ? p.ink : p.muted}
              >
                {m.label}
              </text>
            </g>
          )
        })}

        {/* ───────────────────────── the seed core ───────────────────────── */}
        <circle cx={CX} cy={CY} r={26} fill="url(#ala-core)" />
        <circle
          cx={CX}
          cy={CY}
          r={9}
          fill={surfaceInk}
          stroke={p.series.copper}
          strokeOpacity={0.8}
          strokeWidth={1.3}
        />
        <circle cx={CX} cy={CY} r={2.6} fill={p.accent} />
        <text
          x={CX}
          y={CY + 40}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={9}
          letterSpacing={1.4}
          fill={p.soft}
        >
          1958 · THE SEED
        </text>

        {/* ───────────────────── you are here · 2026 ───────────────────── */}
        {draw >= 0.999 && (
          <g style={{ transition: reduced ? undefined : "opacity 500ms ease" }}>
            {(() => {
              const [nx, ny] = outwardNormal(NOW)
              const tx = nowX + nx * 30
              const ty = nowY + ny * 30
              const anchor: "start" | "end" | "middle" =
                nx > 0.35 ? "start" : nx < -0.35 ? "end" : "middle"
              return (
                <>
                  <line
                    x1={nowX}
                    y1={nowY}
                    x2={nowX + nx * 24}
                    y2={nowY + ny * 24}
                    stroke={p.accent}
                    strokeOpacity={0.5}
                    strokeWidth={1}
                    strokeDasharray="2 3"
                  />
                  <circle
                    cx={nowX}
                    cy={nowY}
                    r={5}
                    fill="none"
                    stroke={p.accent}
                    strokeWidth={1.6}
                  />
                  <circle cx={nowX} cy={nowY} r={2} fill={p.accent} />
                  <text
                    x={tx}
                    y={ty - 4}
                    textAnchor={anchor}
                    fontFamily="var(--font-mono), monospace"
                    fontSize={9}
                    letterSpacing={1.4}
                    fill={p.accent}
                    fillOpacity={0.85}
                  >
                    YOU ARE HERE
                  </text>
                  <text
                    x={tx}
                    y={ty + 9}
                    textAnchor={anchor}
                    fontFamily="var(--font-serif), serif"
                    fontStyle="italic"
                    fontSize={12}
                    fill={p.accent}
                  >
                    2026
                  </text>
                </>
              )
            })()}
          </g>
        )}

        {/* legend strip — bottom-left, mono micro-type */}
        <g transform={`translate(${28}, ${VH - 30})`}>
          <line x1={0} y1={-4} x2={26} y2={-4} stroke={p.series.cool} strokeOpacity={0.6} strokeWidth={6} strokeLinecap="round" />
          <text x={32} y={0} fontFamily="var(--font-mono), monospace" fontSize={10} letterSpacing={1} fill={p.soft}>
            WINTER
          </text>
          <line x1={120} y1={-4} x2={146} y2={-4} stroke={p.accent} strokeWidth={2.4} strokeLinecap="round" />
          <line x1={120} y1={-4} x2={146} y2={-4} stroke="url(#ala-surge)" strokeWidth={7} strokeLinecap="round" opacity={0.7} />
          <text x={152} y={0} fontFamily="var(--font-mono), monospace" fontSize={10} letterSpacing={1} fill={p.soft}>
            THE SURGE · 2012→
          </text>
        </g>
      </svg>

      {/* milestone rail — accessible, scrollable selector mirroring the spiral */}
      <div
        className="mt-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
        role="tablist"
        aria-label="AI milestones, 1958 to 2026"
      >
        {MILES.map((m) => {
          const isActive = activeId === m.id
          return (
            <button
              key={m.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(m.id)}
              onMouseEnter={() => setActiveId(m.id)}
              className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] tabular-nums transition-colors"
              style={{
                fontFamily: "var(--font-mono), monospace",
                borderColor: isActive ? toneOf(m.tone) : p.hair,
                color: isActive ? p.ink : p.soft,
                background: isActive ? `rgba(${p.glowRGB},${mode === "dark" ? 0.16 : 0.1})` : "transparent",
              }}
            >
              {Math.floor(m.year)}
            </button>
          )
        })}
      </div>
    </PlateFrame>
  )
}
