"use client"

import { useState } from "react"

type Modulator = {
  id: "ach" | "da" | "ne" | "ht"
  name: string
  full: string
  body: string
  color: string
  y: number
}

const MODULATORS: ReadonlyArray<Modulator> = [
  {
    id: "ach",
    name: "Ach",
    full: "Acetylcholine",
    body: "Attention and uncertainty. Modulates the gain of cortical processing under attentional demand — the model's primary substrate for surfacing salient sub-networks.",
    color: "#f4c482",
    y: 200,
  },
  {
    id: "da",
    name: "DA",
    full: "Dopamine",
    body: "Reward and plasticity. Reshapes synaptic weights based on prediction-error signals — the substrate's mechanism for learning-without-retraining.",
    color: "#e5a896",
    y: 320,
  },
  {
    id: "ne",
    name: "NE",
    full: "Noradrenaline",
    body: "Arousal and neural gain. Sets the network's overall responsiveness — Symphony's hyperparameter-scale modulator.",
    color: "#6cb4c2",
    y: 440,
  },
  {
    id: "ht",
    name: "5-HT",
    full: "Serotonin",
    body: "Temporal discounting and tonic state. Tunes how strongly far-temporal signals weigh into the present activation — for code: how much history matters under this task.",
    color: "#a698d4",
    y: 560,
  },
]

const VW = 1400
const VH = 760

export function RamaswamyCortexHero() {
  const [hover, setHover] = useState<Modulator["id"] | null>(null)
  const [pinned, setPinned] = useState<Modulator["id"]>("ach")
  const activeId = hover ?? pinned
  const active = MODULATORS.find((m) => m.id === activeId) ?? MODULATORS[0]

  // Layers L1–L6, top to bottom
  const LAYERS = [
    { id: "L1", y: 130, h: 60, label: "Layer I", sub: "molecular" },
    { id: "L2/3", y: 198, h: 110, label: "Layer II / III", sub: "pyramidal" },
    { id: "L4", y: 312, h: 80, label: "Layer IV", sub: "granular" },
    { id: "L5", y: 396, h: 110, label: "Layer V", sub: "pyramidal" },
    { id: "L6", y: 510, h: 90, label: "Layer VI", sub: "multiform" },
    { id: "WM", y: 604, h: 40, label: "White matter", sub: "axonal" },
  ] as const

  const colCx = 380
  const colW = 240

  return (
    <figure className="syn-symphony">
      <div
        className="rounded-[var(--radius-card)] border"
        style={{
          borderColor: "rgba(200,180,255,0.22)",
          background:
            "linear-gradient(180deg, rgba(28,38,80,0.92), rgba(14,20,45,0.96))",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Ramaswamy cortex hero — a cortical column reconstructed in cross-section across six layers, with four neuromodulator beams (acetylcholine, dopamine, noradrenaline, serotonin) sweeping horizontally through it. The mathematical primary source for SYMPHONY's mechanism."
        >
          <defs>
            <radialGradient id="syn-rh-bg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1a2154" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="syn-rh-col" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16183a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0.9" />
            </linearGradient>
            {MODULATORS.map((m) => (
              <linearGradient key={`beam-${m.id}`} id={`syn-rh-beam-${m.id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={m.color} stopOpacity="0" />
                <stop offset="20%" stopColor={m.color} stopOpacity="0.6" />
                <stop offset="50%" stopColor={m.color} stopOpacity="0.95" />
                <stop offset="80%" stopColor={m.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={m.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-rh-bg)" />

          {/* studio header */}
          <text
            x={60}
            y={42}
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={14}
            letterSpacing={4}
            fill="rgba(220,200,160,0.85)"
          >
            PLATE VII · MMXXVI · NEWCASTLE / RAMASWAMY
          </text>
          <text
            x={60}
            y={76}
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={36}
            fill="var(--ink)"
            letterSpacing={2}
          >
            A column, four modulators, twenty years
          </text>
          <line x1={60} x2={VW - 60} y1={92} y2={92} stroke="rgba(220,200,160,0.35)" strokeWidth={0.8} />
          <text
            x={VW - 60}
            y={42}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={12}
            letterSpacing={3}
            fill="rgba(220,200,160,0.7)"
          >
            MATHEMATICAL PRIMARY · MEI · MULLER · RAMASWAMY 2022
          </text>

          {/* cortical column — left side */}
          <g>
            {LAYERS.map((l) => (
              <g key={l.id}>
                <rect
                  x={colCx - colW / 2}
                  y={l.y}
                  width={colW}
                  height={l.h - 4}
                  rx={4}
                  fill="url(#syn-rh-col)"
                  stroke="rgba(108,180,194,0.5)"
                  strokeWidth={1}
                />
                {/* layer label outside the column */}
                <text
                  x={colCx - colW / 2 - 14}
                  y={l.y + l.h / 2 - 4}
                  textAnchor="end"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={13}
                  letterSpacing={2}
                  fill="rgba(220,200,160,0.85)"
                >
                  {l.label.toUpperCase()}
                </text>
                <text
                  x={colCx - colW / 2 - 14}
                  y={l.y + l.h / 2 + 10}
                  textAnchor="end"
                  fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
                  fontStyle="italic"
                  fontSize={11}
                  fill="rgba(220,200,160,0.55)"
                >
                  {l.sub}
                </text>
                {/* pyramidal-cell decoration in layer 2/3 and 5 */}
                {(l.id === "L2/3" || l.id === "L5") ? (
                  <g opacity={0.7}>
                    {Array.from({ length: 5 }).map((_, k) => {
                      const px = colCx - colW / 2 + 30 + k * 45
                      const py = l.y + l.h / 2 + 12
                      return (
                        <g key={k} stroke="rgba(108,180,194,0.85)" fill="none">
                          <path d={`M ${px} ${py} L ${px} ${py - 36} M ${px - 12} ${py - 30} L ${px} ${py - 36} L ${px + 12} ${py - 30} M ${px} ${py - 36} L ${px - 8} ${py - 48} M ${px} ${py - 36} L ${px + 8} ${py - 48}`} strokeWidth={1.2} />
                          <circle cx={px} cy={py} r={4} fill="#6cb4c2" stroke="#0d1027" strokeWidth={0.8} />
                        </g>
                      )
                    })}
                  </g>
                ) : null}
                {/* granular dots in L4 */}
                {l.id === "L4" ? (
                  <g>
                    {Array.from({ length: 30 }).map((_, k) => {
                      const px = colCx - colW / 2 + 10 + (k % 10) * 22
                      const py = l.y + 16 + Math.floor(k / 10) * 18
                      return <circle key={k} cx={px} cy={py} r={2.4} fill="rgba(108,180,194,0.7)" />
                    })}
                  </g>
                ) : null}
                {/* axonal lines in WM */}
                {l.id === "WM" ? (
                  <g stroke="rgba(184,146,86,0.85)" strokeWidth={1}>
                    {Array.from({ length: 12 }).map((_, k) => {
                      const px = colCx - colW / 2 + 12 + k * 19
                      return <line key={k} x1={px} y1={l.y + 4} x2={px} y2={l.y + l.h - 8} />
                    })}
                  </g>
                ) : null}
              </g>
            ))}
            {/* column outer-edge gold ornament */}
            <line
              x1={colCx + colW / 2 + 6}
              y1={120}
              x2={colCx + colW / 2 + 6}
              y2={650}
              stroke="rgba(184,146,86,0.55)"
              strokeWidth={1.2}
            />
            <line
              x1={colCx - colW / 2 - 6}
              y1={120}
              x2={colCx - colW / 2 - 6}
              y2={650}
              stroke="rgba(184,146,86,0.55)"
              strokeWidth={1.2}
            />
          </g>

          {/* neuromodulator beams sweeping across */}
          {MODULATORS.map((m) => {
            const isActive = activeId === m.id
            const x1 = colCx + colW / 2 + 30
            const x2 = VW - 120
            return (
              <g
                key={m.id}
                onMouseEnter={() => setHover(m.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setPinned(m.id)}
                style={{ cursor: "pointer" }}
              >
                {/* hit zone */}
                <rect x={colCx} y={m.y - 30} width={VW - colCx - 60} height={60} fill="transparent" />
                {/* beam */}
                <rect
                  x={colCx + colW / 2}
                  y={m.y - 8}
                  width={x2 - colCx - colW / 2}
                  height={16}
                  fill={`url(#syn-rh-beam-${m.id})`}
                  opacity={isActive ? 1 : 0.45}
                />
                {/* synapse dot at column edge */}
                <circle
                  cx={colCx + colW / 2 + 8}
                  cy={m.y}
                  r={isActive ? 11 : 7}
                  fill={m.color}
                  stroke="#0d1027"
                  strokeWidth={2}
                />
                {/* beam label at right end */}
                <text
                  x={x2 + 12}
                  y={m.y - 4}
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={28}
                  fill={isActive ? m.color : "rgba(245,232,204,0.85)"}
                  letterSpacing={1}
                >
                  {m.name}
                </text>
                <text
                  x={x2 + 12}
                  y={m.y + 18}
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={11}
                  fill={isActive ? "var(--ink)" : "rgba(220,200,160,0.6)"}
                  letterSpacing={2}
                >
                  {m.full.toUpperCase()}
                </text>
                {/* small dashes along the beam suggesting flow */}
                {isActive ? (
                  <g
                    stroke={m.color}
                    strokeOpacity={0.85}
                    strokeWidth={1.4}
                    strokeDasharray="8 6"
                    className="syn-anim-ribbon"
                  >
                    <line x1={x1} y1={m.y} x2={x2} y2={m.y} />
                  </g>
                ) : null}
              </g>
            )
          })}

          {/* active modulator side detail card */}
          <g transform={`translate(60, ${VH - 130})`}>
            <rect
              x={0}
              y={0}
              width={VW - 120}
              height={110}
              rx={10}
              fill="rgba(13,16,39,0.7)"
              stroke={active.color}
              strokeOpacity={0.5}
              strokeWidth={1.2}
            />
            <text
              x={28}
              y={32}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={3}
              fill="rgba(220,200,160,0.65)"
            >
              MODULATOR · {active.name.toUpperCase()}
            </text>
            <text
              x={28}
              y={64}
              fontFamily="var(--font-display), Gloock, serif"
              fontSize={26}
              fill={active.color}
              letterSpacing={1}
            >
              {active.full}
            </text>
            <foreignObject x={28} y={74} width={VW - 200} height={32}>
              <div
                style={{
                  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                  fontSize: "14px",
                  lineHeight: 1.45,
                  color: "var(--ink-cool)",
                }}
              >
                {active.body}
              </div>
            </foreignObject>
          </g>
        </svg>
      </div>
    </figure>
  )
}
