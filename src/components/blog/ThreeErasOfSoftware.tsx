"use client"

/**
 * Three Eras of Software — Andrej Karpathy's lineage, as one program changing phase.
 *
 * The SAME forty particles are laid out three ways and MORPHED between them, so
 * you watch software itself change state:
 *
 *   • Software 1.0 — CODE.    The particles snap into a neat lattice of code-lines
 *     (a line-number gutter + rows of tokens). The program is hand-written
 *     instructions. Who writes it: a human engineer.  e.g. `if x > 0:`
 *
 *   • Software 2.0 — WEIGHTS. The very same particles flow into a four-layer neural
 *     mesh; edges ignite between layers, weight read as thickness + glow. The
 *     program is the learned weights of a network (Karpathy's 2017 coinage).
 *     Who writes it: optimisation, from data.  e.g. `[0.21, −0.04, …]`
 *
 *   • Software 3.0 — INTENT.  The particles collapse toward one bright intent spark
 *     at the centre; a few rise into autonomous agent-glyphs that fan out to tools
 *     at the rim. The program is a prompt / specified intent — LLMs the runtime,
 *     agents the workforce (Karpathy, 2025). Who writes it: you, in plain language.
 *     e.g. `"ship a landing page that …"`
 *
 * The transition is a single eased progress value driven by rAF; reduced-motion
 * snaps instantly. Theme-aware via the Read mode; era buttons are keyboard-operable.
 * Credit: Andrej Karpathy — "Software 2.0" (2017), "Software 3.0" (2025).
 */

import { useEffect, useRef, useState } from "react"
import {
  PlateFrame,
  paletteFor,
  useReadMode,
  usePrefersReducedMotion,
  lerp,
  clamp01,
  easeInOut,
  type ReadPalette,
} from "./read-chart-kit"

const VW = 1000
const VH = 600

// drawing field (inside the frame chrome)
const FX0 = 70
const FX1 = VW - 70
const FY0 = 96
const FY1 = VH - 88
const FCX = (FX0 + FX1) / 2
const FCY = (FY0 + FY1) / 2

const N = 40 // particles shared across all three eras

type Tone = "cool" | "teal" | "violet" | "gold" | "copper" | "rose"

interface Slot {
  x: number
  y: number
  r: number
  /** 0..1 — how present the particle is in this era */
  op: number
  tone: Tone
  /** semantic role, used to colour 3.0 (spark / agent / tool) */
  role?: "spark" | "agent" | "tool"
}

type Era = 0 | 1 | 2

const ERAS = [
  {
    key: "code",
    n: "1.0",
    title: "Code",
    who: "a human engineer writes it",
    example: "if x > 0:",
    tone: "cool" as Tone,
    program: "the program is hand-written instructions",
  },
  {
    key: "weights",
    n: "2.0",
    title: "Weights",
    who: "optimisation writes it, from data",
    example: "[0.21, −0.04, …]",
    tone: "teal" as Tone,
    program: "the program is the learned weights of a network",
  },
  {
    key: "intent",
    n: "3.0",
    title: "Intent",
    who: "you write it — in plain language",
    example: "“ship a landing page that…”",
    tone: "violet" as Tone,
    program: "the program is a prompt; agents are the workforce",
  },
] as const

// ----------------------------------------------------------------------------
// Layout 1.0 — CODE: a lattice/stack of code-lines.
//   left gutter = line numbers; rows of token-particles indent like real code.
// ----------------------------------------------------------------------------
const CODE_ROWS = 8
// indent depth (in token-steps) for each of the 8 lines — reads as a code block
const CODE_INDENT = [0, 0, 1, 1, 2, 1, 0, 0]
const CODE_TOKENS = [3, 4, 4, 5, 4, 3, 4, 3] // tokens per line (sum = 30)

function codeLayout(): Slot[] {
  const slots: Slot[] = []
  const gutterX = FX0 + 26
  const colW = 40
  const rowH = (FY1 - FY0) / (CODE_ROWS + 0.5)
  const x0 = gutterX + 46
  // one line-number particle per row (8) + the tokens (sum 30) + 2 trailing = 40
  for (let row = 0; row < CODE_ROWS; row++) {
    const y = FY0 + rowH * (row + 0.9)
    // line-number dot
    slots.push({ x: gutterX, y, r: 3.4, op: 0.5, tone: "copper" })
    const indent = CODE_INDENT[row]
    for (let t = 0; t < CODE_TOKENS[row]; t++) {
      slots.push({
        x: x0 + (indent + t) * colW,
        y,
        r: t === 0 ? 6.5 : 5,
        op: 1,
        tone: "cool",
      })
    }
  }
  // pad to N with two faint trailing tokens on the last line
  while (slots.length < N) {
    const y = FY0 + rowH * (CODE_ROWS - 0.1)
    slots.push({ x: x0 + (slots.length % 5) * colW, y, r: 4, op: 0.35, tone: "cool" })
  }
  return slots.slice(0, N)
}

// ----------------------------------------------------------------------------
// Layout 2.0 — WEIGHTS: a four-layer neural mesh.
//   columns = layers; particles = neurons; edges (built separately) = weights.
// ----------------------------------------------------------------------------
const LAYERS = [6, 12, 12, 10] // = 40 neurons exactly

function weightsLayout(): Slot[] {
  const slots: Slot[] = []
  const nLayers = LAYERS.length
  const gapX = (FX1 - FX0) / (nLayers + 0.6)
  for (let l = 0; l < nLayers; l++) {
    const count = LAYERS[l]
    const cx = FX0 + gapX * (l + 0.8)
    const colH = FY1 - FY0
    for (let i = 0; i < count; i++) {
      const cy = FY0 + (colH * (i + 0.5)) / count
      slots.push({
        x: cx,
        y: cy,
        r: l === 0 || l === nLayers - 1 ? 5.5 : 5,
        op: 1,
        tone: "teal",
      })
    }
  }
  return slots.slice(0, N)
}

// neuron index ranges per layer, for wiring the mesh
function layerRanges(): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  let start = 0
  for (const c of LAYERS) {
    ranges.push([start, start + c])
    start += c
  }
  return ranges
}

// ----------------------------------------------------------------------------
// Layout 3.0 — INTENT: one bright spark → a few agents → tools at the rim.
//   particle 0 = the intent spark; AGENTS particles = agent glyphs; rest = tools.
// ----------------------------------------------------------------------------
const AGENTS = 4
const AGENT_R = 132 // radius of the agent ring around the spark
const TOOL_R = 232 // radius of the tool ring

function intentLayout(): Slot[] {
  const slots: Slot[] = []
  const cx = FCX
  const cy = FCY
  // 0: the intent spark, dead centre
  slots.push({ x: cx, y: cy, r: 13, op: 1, tone: "gold", role: "spark" })

  // agents fan out on an arc above/around the spark
  const agentAngles: number[] = []
  for (let a = 0; a < AGENTS; a++) {
    // spread across ~200° so they fan, slightly top-weighted
    const ang = (-Math.PI * 0.86) + (a / (AGENTS - 1)) * (Math.PI * 1.18)
    agentAngles.push(ang)
    slots.push({
      x: Math.round((cx + Math.cos(ang) * AGENT_R) * 100) / 100,
      y: Math.round((cy + Math.sin(ang) * AGENT_R * 0.82) * 100) / 100,
      r: 8.5,
      op: 1,
      tone: "violet",
      role: "agent",
    })
  }

  // tools cluster beyond each agent (the remaining particles), fanned at the rim
  const toolCount = N - 1 - AGENTS // 35
  for (let i = 0; i < toolCount; i++) {
    const a = i % AGENTS
    const base = agentAngles[a]
    const k = Math.floor(i / AGENTS) // 0..~8 within this agent's spray
    const spread = ((k % 5) - 2) * 0.16
    const ang = base + spread
    const rr = TOOL_R + (k >= 5 ? 30 : 0)
    slots.push({
      x: Math.round((cx + Math.cos(ang) * rr) * 100) / 100,
      y: Math.round((cy + Math.sin(ang) * rr * 0.82) * 100) / 100,
      r: 3.6,
      op: 0.78,
      tone: "rose",
      role: "tool",
    })
  }
  return slots.slice(0, N)
}

const LAYOUTS: Record<Era, Slot[]> = {
  0: codeLayout(),
  1: weightsLayout(),
  2: intentLayout(),
}

// ----------------------------------------------------------------------------
// Edges — endpoints are particle indices; each edge has a per-era visibility so
// the connective tissue cross-fades with the morph.
//   1.0: none (code is just lines).
//   2.0: the full feed-forward mesh between adjacent layers.
//   3.0: spark→agent and agent→tool filaments only.
// ----------------------------------------------------------------------------
interface Edge {
  a: number
  b: number
  w: number // weight 0..1 → stroke width + glow in 2.0
  on: [number, number, number] // [code, weights, intent] opacity multipliers
}

function buildEdges(): Edge[] {
  const edges: Edge[] = []
  const ranges = layerRanges()

  // --- 2.0 mesh: connect a sampled subset between adjacent layers (keep it
  // elegant, not a hairball). Deterministic pseudo-random for stable SSR. ---
  let seed = 7
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  for (let l = 0; l < ranges.length - 1; l++) {
    const [s0, e0] = ranges[l]
    const [s1, e1] = ranges[l + 1]
    for (let i = s0; i < e0; i++) {
      // each source neuron wires to ~3 targets in the next layer
      const targets = new Set<number>()
      const want = 3
      let guard = 0
      while (targets.size < want && guard++ < 40) {
        targets.add(s1 + Math.floor(rnd() * (e1 - s1)))
      }
      targets.forEach((j) => {
        edges.push({ a: i, b: j, w: 0.3 + rnd() * 0.7, on: [0, 1, 0] })
      })
    }
  }

  // --- 3.0 filaments: spark(0) → each agent, then each agent → its tools. ---
  // Agents are slots 1..AGENTS; tools are AGENTS+1..N-1, assigned round-robin.
  for (let a = 0; a < AGENTS; a++) {
    const agentIdx = 1 + a
    edges.push({ a: 0, b: agentIdx, w: 0.9, on: [0, 0, 1] })
  }
  const toolStart = 1 + AGENTS
  for (let i = toolStart; i < N; i++) {
    const a = (i - toolStart) % AGENTS
    const agentIdx = 1 + a
    edges.push({ a: agentIdx, b: i, w: 0.55, on: [0, 0, 1] })
  }
  return edges
}

const EDGES = buildEdges()

// interpolate a slot field between two eras at progress t
function lerpSlot(s: Slot, d: Slot, t: number): Slot {
  return {
    x: lerp(s.x, d.x, t),
    y: lerp(s.y, d.y, t),
    r: lerp(s.r, d.r, t),
    op: lerp(s.op, d.op, t),
    // tone/role come from whichever era we're closer to
    tone: t < 0.5 ? s.tone : d.tone,
    role: t < 0.5 ? s.role : d.role,
  }
}

function toneColor(p: ReadPalette, tone: Tone): string {
  return p.series[tone]
}

export function ThreeErasOfSoftware() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = paletteFor(mode)

  const [era, setEra] = useState<Era>(0)
  // animated progress: `prog` morphs from the previous era index toward `era`.
  const fromRef = useRef<Era>(0)
  const [prog, setProg] = useState(0) // absolute position along 0→1→2
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const fromValRef = useRef(0)

  useEffect(() => {
    const target = era as number
    if (reduced) {
      setProg(target)
      fromRef.current = era
      return
    }
    const start = fromValRef.current
    if (start === target) {
      setProg(target)
      return
    }
    startRef.current = 0
    const dist = Math.abs(target - start)
    const dur = 760 * Math.max(0.6, dist) // longer hop = longer morph
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now
      const t = clamp01((now - startRef.current) / dur)
      const eased = easeInOut(t)
      setProg(start + (target - start) * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setProg(target)
        fromRef.current = era
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [era, reduced])

  // keep a live ref of the current progress so a new transition starts where we are
  useEffect(() => {
    fromValRef.current = prog
  }, [prog])

  // resolve the interpolated slot field from `prog`
  const lo = Math.floor(prog) as Era
  const hi = Math.min(2, lo + 1) as Era
  const f = prog - lo
  const slots: Slot[] = LAYOUTS[lo].map((s, i) =>
    f === 0 ? s : lerpSlot(s, LAYOUTS[hi][i], f),
  )

  // per-era edge opacity (cross-fade with the morph)
  const edgeAlpha = (e: Edge): number => {
    const a = lerp(e.on[lo], e.on[hi], f)
    return a
  }

  const cur = ERAS[era]
  // the era nearest the current progress (drives the live caption while morphing)
  const nearEra = ERAS[Math.round(prog) as Era]

  // strap text under the field reflects the *settled or settling* era
  const settling = Math.abs(prog - era) > 0.001

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker={`Fig. — Three eras of software · the same program, three ways`}
      controls={
        <div role="tablist" aria-label="Choose a software era" className="flex gap-1">
          {ERAS.map((e, i) => {
            const selected = era === i
            const c = toneColor(p, e.tone)
            return (
              <button
                key={e.key}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => setEra(i as Era)}
                className="rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  color: selected ? (mode === "dark" ? "#0c1828" : "#fbf7ec") : c,
                  background: selected ? c : "transparent",
                  border: `1px solid ${selected ? c : p.hair}`,
                }}
              >
                {e.n}
                <span className="ml-1 hidden sm:inline">{e.title}</span>
              </button>
            )
          })}
        </div>
      }
      caption={
        <>
          <strong style={{ color: p.ink, fontStyle: "normal" }}>
            Software {nearEra.n} — {nearEra.title}:
          </strong>{" "}
          {nearEra.program}; {nearEra.who}{" "}
          <span
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontStyle: "normal",
              color: p.accent,
            }}
          >
            {nearEra.example}
          </span>
          . The forty marks are one program; switch eras to watch it change phase — code
          lattice → neural mesh → a single intent radiating into agents and their tools.
          After Andrej Karpathy — <em>Software 2.0</em> (2017), <em>Software 3.0</em> (2025).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full select-none"
        role="img"
        aria-label={
          "Three eras of software, after Andrej Karpathy, shown as one program of forty marks that morphs between three forms. " +
          "Software 1.0 is code: the marks form a neat lattice of code-lines with a line-number gutter — hand-written instructions a human engineer writes, for example 'if x greater than 0'. " +
          "Software 2.0 is weights: the same marks flow into a four-layer neural mesh whose edges, lit by weight, are written by optimisation from data, for example a vector of numbers like 0.21, minus 0.04. " +
          "Software 3.0 is intent: the marks collapse to a single bright intent spark that radiates into four autonomous agent glyphs fanning out to their tools — a prompt you write in plain language, for example 'ship a landing page that …', with large language models as the runtime and agents as the workforce. " +
          `Currently showing Software ${cur.n} — ${cur.title}.`
        }
      >
        <defs>
          <radialGradient id="teos-spark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.series.gold} stopOpacity={mode === "dark" ? 1 : 0.92} />
            <stop offset="45%" stopColor={p.series.copper} stopOpacity="0.55" />
            <stop offset="100%" stopColor={p.series.copper} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="teos-bloom" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={`rgba(${p.glowRGB},${mode === "dark" ? 0.13 : 0.08})`} />
            <stop offset="72%" stopColor={`rgba(${p.glowRGB},0)`} />
          </radialGradient>
          <filter id="teos-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        {/* atmospheric bloom centred on the field */}
        <rect x={FX0 - 40} y={FY0 - 40} width={FX1 - FX0 + 80} height={FY1 - FY0 + 80} fill="url(#teos-bloom)" />

        {/* ---- per-era scaffolding (cross-fades with the morph) ---- */}

        {/* 1.0 — code gutter rule + faint row hairlines */}
        <g style={{ opacity: 1 - clamp01(prog) }}>
          <line
            x1={FX0 + 44}
            x2={FX0 + 44}
            y1={FY0 + 8}
            y2={FY1 - 6}
            stroke={p.hair}
            strokeWidth={1}
          />
          {Array.from({ length: CODE_ROWS }).map((_, row) => {
            const rowH = (FY1 - FY0) / (CODE_ROWS + 0.5)
            const y = FY0 + rowH * (row + 0.9)
            return (
              <text
                key={`ln-${row}`}
                x={FX0 + 36}
                y={y + 4}
                textAnchor="end"
                fontFamily="var(--font-mono), monospace"
                fontSize={11}
                fill={p.soft}
              >
                {row + 1}
              </text>
            )
          })}
        </g>

        {/* 2.0 — layer captions under the mesh */}
        <g style={{ opacity: clamp01(1 - Math.abs(prog - 1)) }}>
          {(() => {
            const nLayers = LAYERS.length
            const gapX = (FX1 - FX0) / (nLayers + 0.6)
            const labels = ["INPUT", "HIDDEN", "HIDDEN", "OUTPUT"]
            return labels.map((lab, l) => {
              const cx = FX0 + gapX * (l + 0.8)
              return (
                <text
                  key={`ly-${l}`}
                  x={cx}
                  y={FY1 + 26}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), monospace"
                  fontSize={10}
                  letterSpacing={1.5}
                  fill={p.soft}
                >
                  {lab}
                </text>
              )
            })
          })()}
        </g>

        {/* 3.0 — tool rim arc + the radiating intent halo */}
        <g style={{ opacity: clamp01(prog - 1) }}>
          <circle
            cx={FCX}
            cy={FCY}
            r={TOOL_R}
            fill="none"
            stroke={p.series.violet}
            strokeOpacity={0.16}
            strokeWidth={1}
            strokeDasharray="2 6"
            transform={`translate(0,0) scale(1,0.82)`}
            style={{ transformOrigin: `${FCX}px ${FCY}px` }}
          />
          <circle cx={FCX} cy={FCY} r={64} fill="url(#teos-spark)" />
        </g>

        {/* ---- edges (mesh in 2.0, filaments in 3.0) ---- */}
        {EDGES.map((e, i) => {
          const alpha = edgeAlpha(e)
          if (alpha < 0.01) return null
          const a = slots[e.a]
          const b = slots[e.b]
          // mesh edges run straight; 3.0 filaments bow gently for an organic fan
          const filament = e.on[2] === 1
          const meshA = alpha * (mode === "dark" ? 0.5 : 0.42)
          if (filament) {
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            // bow tool-links outward, spark-links straight-ish
            const isSpark = e.a === 0
            const cxp = isSpark ? mx : mx + (mx - FCX) * 0.18
            const cyp = isSpark ? my : my + (my - FCY) * 0.18
            return (
              <path
                key={`e-${i}`}
                d={`M ${a.x} ${a.y} Q ${cxp} ${cyp} ${b.x} ${b.y}`}
                fill="none"
                stroke={isSpark ? p.series.gold : p.series.violet}
                strokeWidth={isSpark ? 1.6 : 1}
                strokeOpacity={alpha * (isSpark ? 0.85 : 0.5)}
                strokeLinecap="round"
              />
            )
          }
          return (
            <line
              key={`e-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={p.series.teal}
              strokeWidth={0.6 + e.w * 2.2}
              strokeOpacity={meshA * (0.35 + e.w * 0.65)}
            />
          )
        })}

        {/* ---- particles (the shared forty) ---- */}
        {slots.map((s, i) => {
          const c = toneColor(p, s.tone)
          const isSpark = s.role === "spark"
          const isAgent = s.role === "agent"
          return (
            <g key={`p-${i}`}>
              {/* soft halo for the brighter marks (spark, agents, layer caps) */}
              {(isSpark || isAgent) && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={s.r * (isSpark ? 1.9 : 1.7)}
                  fill={c}
                  fillOpacity={0.18 * s.op}
                  filter="url(#teos-soft)"
                />
              )}
              <circle
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill={c}
                fillOpacity={s.op}
                stroke={isSpark || isAgent ? (mode === "dark" ? "#0c1828" : "#fbf7ec") : "none"}
                strokeWidth={isSpark ? 2 : isAgent ? 1.4 : 0}
              />
              {/* the spark gets a tiny pulse ring; agents get an orbit tick */}
              {isSpark && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={s.r + 7}
                  fill="none"
                  stroke={p.series.gold}
                  strokeOpacity={0.5 * s.op}
                  strokeWidth={1}
                />
              )}
            </g>
          )
        })}

        {/* ---- era markers anchored to the field, fading with the morph ---- */}

        {/* 3.0: label the intent spark */}
        <g style={{ opacity: clamp01(prog - 1.2) }}>
          <text
            x={FCX}
            y={FCY + 34}
            textAnchor="middle"
            fontFamily="var(--font-mono), monospace"
            fontSize={11}
            letterSpacing={2}
            fill={p.accent}
          >
            INTENT
          </text>
          <text
            x={FCX}
            y={FCY + 49}
            textAnchor="middle"
            fontFamily="var(--font-serif), serif"
            fontSize={10}
            fontStyle="italic"
            fill={p.muted}
          >
            you state it
          </text>
        </g>

        {/* ---- the live readout card (top-right of the field) ---- */}
        {(() => {
          const cardW = 250
          const cardX = FX1 - cardW
          const cardY = FY0 - 70
          const cardH = 56
          return (
            <g>
              <rect
                x={cardX}
                y={cardY}
                width={cardW}
                height={cardH}
                rx={8}
                fill={mode === "dark" ? "rgba(12,24,40,0.6)" : "rgba(253,250,242,0.7)"}
                stroke={p.hair}
                strokeWidth={1}
              />
              <text
                x={cardX + 16}
                y={cardY + 23}
                fontFamily="var(--font-mono), monospace"
                fontSize={13}
                fontWeight={700}
                letterSpacing={0.5}
                fill={toneColor(p, nearEra.tone)}
              >
                SOFTWARE {nearEra.n} · {nearEra.title.toUpperCase()}
              </text>
              <text
                x={cardX + 16}
                y={cardY + 42}
                fontFamily="var(--font-serif), serif"
                fontStyle="italic"
                fontSize={12}
                fill={p.muted}
              >
                {settling ? "… changing phase" : nearEra.who}
              </text>
            </g>
          )
        })()}

        {/* ---- the example token-string, bottom-left, swaps per era ---- */}
        <text
          x={FX0}
          y={FY1 + 46}
          fontFamily="var(--font-mono), monospace"
          fontSize={14}
          fontWeight={600}
          fill={p.ink}
          fillOpacity={0.9}
        >
          <tspan fill={p.soft} fontWeight={400}>
            {"› "}
          </tspan>
          {nearEra.example}
        </text>
        <text
          x={FX0}
          y={FY1 + 64}
          fontFamily="var(--font-serif), serif"
          fontStyle="italic"
          fontSize={11.5}
          fill={p.muted}
        >
          who writes it: {nearEra.who}
        </text>
      </svg>

      {/* mobile-friendly era strip (mirrors the tablist; full labels) */}
      <div className="mt-2 grid grid-cols-3 gap-1.5 px-1 sm:hidden">
        {ERAS.map((e, i) => {
          const selected = era === i
          const c = toneColor(p, e.tone)
          return (
            <button
              key={e.key}
              type="button"
              aria-hidden
              tabIndex={-1}
              onClick={() => setEra(i as Era)}
              className="rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
              style={{
                fontFamily: "var(--font-mono), monospace",
                color: selected ? (mode === "dark" ? "#0c1828" : "#fbf7ec") : c,
                background: selected ? c : "transparent",
                border: `1px solid ${selected ? c : p.hair}`,
              }}
            >
              {e.n} {e.title}
            </button>
          )
        })}
      </div>
    </PlateFrame>
  )
}
