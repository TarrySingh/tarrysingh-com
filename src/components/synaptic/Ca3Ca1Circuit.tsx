"use client"

import { useState } from "react"

type Spot = {
  id: string
  label: string
  subtitle: string
  body: string
  x: number
  y: number
  color: string
}

const SPOTS: ReadonlyArray<Spot> = [
  {
    id: "ec",
    label: "Entorhinal cortex",
    subtitle: "the input gateway",
    body: "Cortical sensory streams enter the hippocampus through the entorhinal cortex. Layer II projects to the dentate gyrus and CA3; layer III bypasses to CA1. This is where the system first decides what is novel.",
    x: 140,
    y: 200,
    color: "#c98e4f",
  },
  {
    id: "dg",
    label: "Dentate gyrus",
    subtitle: "pattern separation",
    body: "A sparse, expansion-coding bottleneck that turns near-identical inputs into distinct representations. The substrate's mechanism for orthogonalising memories so they do not interfere.",
    x: 320,
    y: 280,
    color: "#f4c482",
  },
  {
    id: "ca3",
    label: "CA3 · recurrent collaterals",
    subtitle: "associative pattern completion",
    body: "Dense recurrent connectivity implementing an auto-associative attractor network. Partial cues retrieve full stored patterns. The 'sea horse' of the hippocampus — the place where Hebb's primitive lives in the loop.",
    x: 560,
    y: 360,
    color: "#e8b87a",
  },
  {
    id: "schaffer",
    label: "Schaffer collaterals",
    subtitle: "CA3 → CA1 read-out path",
    body: "The axon bundle that carries CA3's reconstructed pattern to CA1. STDP at these synapses is the most-studied learning rule in mammalian biology — the canonical primitive MEMPHIS demands from the memristive devices.",
    x: 760,
    y: 360,
    color: "#ffd596",
  },
  {
    id: "ca1",
    label: "CA1 · pyramidal layer",
    subtitle: "novelty detection · read-out",
    body: "Compares CA3's reconstructed prediction against current entorhinal input. Mismatch drives novelty and replay. The system's natural error signal — without an external loss function.",
    x: 920,
    y: 280,
    color: "#e5a896",
  },
  {
    id: "modulator",
    label: "Neuromodulatory bus",
    subtitle: "prioritisation · gain · gating",
    body: "Slow, broadcast signals — analogues of dopamine, acetylcholine, noradrenaline — modulate plasticity gain globally. Set what the system pays attention to and what it commits to long-term memory.",
    x: 600,
    y: 540,
    color: "#a698d4",
  },
]

const VW = 1200
const VH = 820
const HEADER_BOTTOM = 168

// connections — pre to post
const EDGES: ReadonlyArray<{ from: string; to: string; phase?: "input" | "recur" | "output" }> = [
  { from: "ec", to: "dg", phase: "input" },
  { from: "ec", to: "ca3", phase: "input" },
  { from: "ec", to: "ca1", phase: "input" },
  { from: "dg", to: "ca3", phase: "input" },
  { from: "ca3", to: "ca3", phase: "recur" },
  { from: "ca3", to: "schaffer", phase: "output" },
  { from: "schaffer", to: "ca1", phase: "output" },
  { from: "modulator", to: "ca3", phase: "recur" },
  { from: "modulator", to: "ca1", phase: "recur" },
  { from: "modulator", to: "dg", phase: "recur" },
]

export function Ca3Ca1Circuit() {
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string>("ca3")
  const activeId = hover ?? pinned
  const active = SPOTS.find((s) => s.id === activeId) ?? SPOTS[2]
  const isEdgeLit = (a: string, b: string) =>
    activeId === a || activeId === b

  return (
    <figure className="syn-memphis">
      <div
        className="rounded-[var(--radius-card)] border"
        style={{
          borderColor: "rgba(232,184,122,0.32)",
          background:
            "linear-gradient(180deg, rgba(20,34,59,0.92), rgba(12,24,40,0.96))",
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
          aria-label="CA3 ↔ CA1 hippocampal circuit — entorhinal cortex input, dentate gyrus pattern separation, CA3 recurrent collaterals, Schaffer collaterals, CA1 pyramidal layer, and neuromodulatory bus."
        >
          <defs>
            <radialGradient id="syn-ca-bg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#2a3760" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#06101f" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="syn-ca-active" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd596" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffd596" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-ca-bg)" />

          {/* studio header */}
          <text
            x={60}
            y={42}
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={13}
            letterSpacing={4}
            fill="rgba(220,200,160,0.85)"
          >
            PLATE M-III · MMXXVI · FIG. 1.2.c
          </text>
          <text
            x={VW - 60}
            y={42}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            letterSpacing={3}
            fill="rgba(220,200,160,0.65)"
          >
            CA3 ↔ CA1 HIPPOCAMPAL CIRCUIT
          </text>
          <line
            x1={60}
            x2={VW - 60}
            y1={58}
            y2={58}
            stroke="rgba(220,200,160,0.35)"
            strokeWidth={0.8}
          />
          <text
            x={60}
            y={108}
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={42}
            fill="var(--ink)"
            letterSpacing={1.5}
          >
            The circuit MEMPHIS reproduces
          </text>

          {/* horizontal flow lane (decorative) */}
          <line
            x1={80}
            x2={VW - 380}
            y1={HEADER_BOTTOM + 120}
            y2={HEADER_BOTTOM + 120}
            stroke="rgba(108,180,194,0.18)"
            strokeWidth={1}
            strokeDasharray="3 6"
          />

          {/* edges */}
          {EDGES.map((e, i) => {
            if (e.from === e.to) {
              // recurrent loop on CA3
              const node = SPOTS.find((s) => s.id === e.from)
              if (!node) return null
              const lit = isEdgeLit(e.from, e.to)
              return (
                <path
                  key={`edge-${i}`}
                  d={`M ${node.x - 30} ${node.y + 60} Q ${node.x} ${node.y + 120} ${node.x + 30} ${node.y + 60}`}
                  fill="none"
                  stroke={lit ? "#ffd596" : "#f4c482"}
                  strokeOpacity={lit ? 0.9 : 0.45}
                  strokeWidth={lit ? 2.2 : 1.4}
                  strokeDasharray={lit ? "0" : "5 4"}
                  className={lit ? "syn-anim-ribbon" : undefined}
                />
              )
            }
            const a = SPOTS.find((s) => s.id === e.from)
            const b = SPOTS.find((s) => s.id === e.to)
            if (!a || !b) return null
            const lit = isEdgeLit(e.from, e.to)
            const stroke =
              e.phase === "input"
                ? "#c98e4f"
                : e.phase === "output"
                  ? "#e5a896"
                  : "#a698d4"
            return (
              <line
                key={`edge-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={lit ? "#ffd596" : stroke}
                strokeOpacity={lit ? 0.95 : 0.5}
                strokeWidth={lit ? 2.4 : 1.4}
                strokeDasharray={lit ? "0" : "6 4"}
                className={lit ? "syn-anim-ribbon" : undefined}
              />
            )
          })}

          {/* nodes */}
          {SPOTS.map((s) => {
            const isFocus = activeId === s.id
            const r = s.id === "ca3" ? 64 : 50
            return (
              <g
                key={s.id}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setPinned(s.id)}
                style={{ cursor: "pointer" }}
              >
                {isFocus ? (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={r + 18}
                    fill="url(#syn-ca-active)"
                  />
                ) : null}
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={r + 8}
                  fill={s.color}
                  fillOpacity={isFocus ? 0.32 : 0.14}
                />
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={r}
                  fill="#0c1828"
                  stroke={s.color}
                  strokeOpacity={isFocus ? 1 : 0.75}
                  strokeWidth={isFocus ? 2.4 : 1.6}
                />
                {/* abbreviation in big Gloock */}
                <text
                  x={s.x}
                  y={s.y + 6}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={s.id === "ca3" ? 24 : 19}
                  fill={isFocus ? "#ffd596" : "var(--ink)"}
                  letterSpacing={0.5}
                >
                  {s.id === "ec"
                    ? "EC"
                    : s.id === "dg"
                      ? "DG"
                      : s.id === "ca3"
                        ? "CA3"
                        : s.id === "schaffer"
                          ? "Sch."
                          : s.id === "ca1"
                            ? "CA1"
                            : "NM"}
                </text>
                {/* full label below the node */}
                <text
                  x={s.x}
                  y={s.y + r + 24}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={11}
                  fill={isFocus ? "var(--ink)" : "rgba(220,200,160,0.78)"}
                  letterSpacing={2}
                >
                  {s.label.split(" · ")[0].toUpperCase()}
                </text>
                <text
                  x={s.x}
                  y={s.y + r + 40}
                  textAnchor="middle"
                  fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
                  fontStyle="italic"
                  fontSize={11}
                  fill="rgba(220,200,160,0.55)"
                >
                  {s.subtitle}
                </text>
              </g>
            )
          })}

          {/* legend on bottom-left */}
          <g transform={`translate(80, ${VH - 100})`}>
            <p />
            <text
              x={0}
              y={0}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={3}
              fill="rgba(220,200,160,0.65)"
            >
              EDGE LEGEND
            </text>
            <g transform="translate(0, 22)">
              <line x1={0} x2={40} y1={0} y2={0} stroke="#c98e4f" strokeWidth={2} />
              <text
                x={50}
                y={4}
                fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                fontSize={11}
                letterSpacing={2}
                fill="rgba(220,200,160,0.7)"
              >
                INPUT · EC → ·
              </text>
              <line x1={170} x2={210} y1={0} y2={0} stroke="#e5a896" strokeWidth={2} />
              <text
                x={220}
                y={4}
                fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                fontSize={11}
                letterSpacing={2}
                fill="rgba(220,200,160,0.7)"
              >
                CA3 → CA1 OUTPUT
              </text>
              <line x1={400} x2={440} y1={0} y2={0} stroke="#a698d4" strokeWidth={2} />
              <text
                x={450}
                y={4}
                fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                fontSize={11}
                letterSpacing={2}
                fill="rgba(220,200,160,0.7)"
              >
                NEUROMODULATORY
              </text>
            </g>
          </g>

          {/* side panel */}
          <g transform={`translate(${VW - 380}, 168)`}>
            <rect
              x={0}
              y={0}
              width={320}
              height={580}
              rx={10}
              fill="rgba(13,16,39,0.7)"
              stroke={active.color}
              strokeOpacity={0.55}
              strokeWidth={1.2}
            />
            <text
              x={24}
              y={32}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={3}
              fill="rgba(220,200,160,0.65)"
            >
              CIRCUIT NODE
            </text>
            <foreignObject x={24} y={48} width={272} height={88}>
              <div
                style={{
                  fontFamily: "var(--font-display), Gloock, serif",
                  fontSize: "22px",
                  lineHeight: 1.15,
                  letterSpacing: "0.01em",
                  color: "var(--ink)",
                }}
              >
                {active.label}
              </div>
            </foreignObject>
            <text
              x={24}
              y={156}
              fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
              fontStyle="italic"
              fontSize={13}
              fill={active.color}
            >
              {active.subtitle}
            </text>
            <line
              x1={24}
              x2={296}
              y1={176}
              y2={176}
              stroke="rgba(220,200,160,0.25)"
              strokeWidth={0.6}
            />
            <foreignObject x={24} y={194} width={272} height={360}>
              <div
                style={{
                  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                  fontSize: "13.5px",
                  lineHeight: 1.6,
                  color: "var(--ink-cool)",
                }}
              >
                {active.body}
              </div>
            </foreignObject>
          </g>
        </svg>

        <div
          className="border-t px-6 py-4"
          style={{
            borderColor: "rgba(232,184,122,0.18)",
            color: "var(--ink-cool)",
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            fontStyle: "italic",
            fontSize: "0.98rem",
            lineHeight: 1.5,
          }}
        >
          Six circuit motifs — six device-co-design constraints. The substrate
          succeeds when it reproduces all six in silicon.
        </div>
      </div>
    </figure>
  )
}
