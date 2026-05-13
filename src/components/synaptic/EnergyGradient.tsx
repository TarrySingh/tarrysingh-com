"use client"

import { useState } from "react"

type Tier = {
  id: string
  label: string
  detail: string
  energy: number // femtojoules per synaptic event
  era: string
  color: string
  source: string
}

const TIERS: ReadonlyArray<Tier> = [
  {
    id: "gpu",
    label: "GPU AI",
    detail: "transformer inference",
    energy: 1_000_000, // ~1 nJ
    era: "2023–2026",
    color: "#849cc8",
    source:
      "Foundation-model inference on H100-class accelerators — roughly 1 nJ per equivalent synaptic operation, six orders of magnitude above the biological benchmark.",
  },
  {
    id: "loihi",
    label: "Loihi · TrueNorth",
    detail: "state-of-the-art neuromorphic",
    energy: 10_000, // ~10 pJ
    era: "2014–2024",
    color: "#a698d4",
    source:
      "Intel Loihi 2 and IBM TrueNorth — current best-in-class digital neuromorphic hardware. Per-event energies hover at ~10 pJ.",
  },
  {
    id: "biology",
    label: "Biology",
    detail: "mammalian cortex",
    energy: 100,
    era: "millions of years",
    color: "#6cb4c2",
    source:
      "Mammalian synaptic event — the benchmark every neuromorphic effort is measured against. ~100 fJ per event in cortex.",
  },
  {
    id: "memphis",
    label: "MEMPHIS",
    detail: "target · self-organising memristive",
    energy: 10,
    era: "2026 → 2029 (target)",
    color: "#ffd596",
    source:
      "MEMPHIS target: < 10 fJ per synaptic event for 100×100 nm² memristive devices — three orders below Loihi/TrueNorth and approaching biology.",
  },
]

// Log scale: position each tier based on log10 of its energy
const MIN_LOG = Math.log10(1) // 1 fJ
const MAX_LOG = Math.log10(2_000_000) // beyond GPU

const VW = 1200
const VH = 820
const PAD_TOP = 168
const PAD_BOTTOM = 156
const PAD_LEFT = 100
const PAD_RIGHT = 380
const PLOT_W = VW - PAD_LEFT - PAD_RIGHT
const PLOT_H = VH - PAD_TOP - PAD_BOTTOM

const PANEL_X = VW - PAD_RIGHT + 32
const PANEL_W = PAD_RIGHT - 64
const PANEL_PAD = 24
const PANEL_INNER_W = PANEL_W - PANEL_PAD * 2

const yForEnergy = (e: number) => {
  const l = Math.log10(e)
  const t = (l - MIN_LOG) / (MAX_LOG - MIN_LOG)
  // top of plot = highest energy
  return PAD_TOP + (1 - t) * PLOT_H
}

const formatEnergy = (fJ: number): { value: string; unit: string } => {
  if (fJ >= 1_000_000) return { value: (fJ / 1_000_000).toFixed(fJ % 1_000_000 === 0 ? 0 : 1), unit: "nJ" }
  if (fJ >= 1_000) return { value: (fJ / 1_000).toFixed(fJ % 1_000 === 0 ? 0 : 1), unit: "pJ" }
  return { value: fJ.toFixed(fJ % 1 === 0 ? 0 : 1), unit: "fJ" }
}

export function EnergyGradient() {
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string>("memphis")
  const activeId = hover ?? pinned
  const active = TIERS.find((t) => t.id === activeId) ?? TIERS[3]

  // Bars span equal widths across the plot
  const barCount = TIERS.length
  const barGap = 56
  const barW = (PLOT_W - barGap * (barCount - 1)) / barCount

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
          aria-label="Energy gradient — femtojoules per synaptic event. GPU AI at ~1 nJ, Loihi/TrueNorth at ~10 pJ, mammalian biology at ~100 fJ, MEMPHIS target below 10 fJ. Six orders of magnitude separate today's foundation-model inference from the biological benchmark."
        >
          <defs>
            <radialGradient id="syn-eg-bg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#2a3760" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#06101f" stopOpacity="0" />
            </radialGradient>
            {TIERS.map((t) => (
              <linearGradient
                key={`grad-${t.id}`}
                id={`syn-eg-bar-${t.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={t.color} stopOpacity="1" />
                <stop offset="100%" stopColor={t.color} stopOpacity="0.35" />
              </linearGradient>
            ))}
            <filter id="syn-eg-shadow" x="-20%" y="-20%" width="140%" height="160%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-eg-bg)" />

          {/* header row 1 — plate marker */}
          <text
            x={PAD_LEFT}
            y={42}
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={13}
            letterSpacing={4}
            fill="rgba(220,200,160,0.85)"
          >
            PLATE M-V · MMXXVI · FIG. 2.1.a
          </text>
          <text
            x={VW - PAD_LEFT}
            y={42}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            letterSpacing={3}
            fill="rgba(220,200,160,0.65)"
          >
            ENERGY PER SYNAPTIC EVENT · LOG SCALE
          </text>
          <line
            x1={PAD_LEFT}
            x2={VW - PAD_LEFT}
            y1={58}
            y2={58}
            stroke="rgba(220,200,160,0.35)"
            strokeWidth={0.8}
          />
          {/* header row 2 — title */}
          <text
            x={PAD_LEFT}
            y={108}
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={42}
            fill="var(--ink)"
            letterSpacing={1.5}
          >
            The energy gradient
          </text>

          {/* y-axis decadal gridlines */}
          {[1, 10, 100, 1_000, 10_000, 100_000, 1_000_000].map((tick) => {
            if (Math.log10(tick) > MAX_LOG + 0.1) return null
            const y = yForEnergy(tick)
            const { value, unit } = formatEnergy(tick)
            return (
              <g key={`y-${tick}`}>
                <line
                  x1={PAD_LEFT}
                  x2={VW - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="rgba(220,200,160,0.10)"
                  strokeWidth={0.6}
                />
                <text
                  x={PAD_LEFT - 14}
                  y={y + 4}
                  textAnchor="end"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={12}
                  fill="rgba(220,200,160,0.7)"
                  letterSpacing={1.5}
                >
                  {value} {unit}
                </text>
              </g>
            )
          })}
          <text
            x={PAD_LEFT - 14}
            y={PAD_TOP - 18}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            letterSpacing={2}
            fill="rgba(220,200,160,0.55)"
          >
            PER EVENT
          </text>

          {/* biology benchmark guide line */}
          {(() => {
            const y = yForEnergy(100)
            return (
              <>
                <line
                  x1={PAD_LEFT}
                  x2={VW - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="#6cb4c2"
                  strokeOpacity={0.55}
                  strokeWidth={1.2}
                  strokeDasharray="6 4"
                />
                <text
                  x={VW - PAD_RIGHT - 8}
                  y={y - 10}
                  textAnchor="end"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={11}
                  fill="#6cb4c2"
                  letterSpacing={2}
                >
                  BIOLOGICAL BENCHMARK ≈ 100 fJ
                </text>
              </>
            )
          })()}

          {/* bars */}
          {TIERS.map((t, i) => {
            const x = PAD_LEFT + i * (barW + barGap)
            const y = yForEnergy(t.energy)
            const h = PAD_TOP + PLOT_H - y
            const isActive = activeId === t.id
            const { value, unit } = formatEnergy(t.energy)
            const isTarget = t.id === "memphis"
            const isLessThan = isTarget

            return (
              <g key={t.id}>
                {/* hover zone */}
                <rect
                  x={x - barGap / 2}
                  y={PAD_TOP - 12}
                  width={barW + barGap}
                  height={PLOT_H + 24}
                  fill={isActive ? "rgba(255,210,150,0.04)" : "transparent"}
                  onMouseEnter={() => setHover(t.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setPinned(t.id)}
                  style={{ cursor: "pointer" }}
                />
                {/* shadow */}
                <rect
                  x={x + 2}
                  y={y + 4}
                  width={barW}
                  height={h}
                  fill="#000"
                  opacity={0.4}
                  filter="url(#syn-eg-shadow)"
                />
                {/* bar */}
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx={2}
                  fill={`url(#syn-eg-bar-${t.id})`}
                  opacity={isActive ? 1 : 0.92}
                  style={{ pointerEvents: "none" }}
                />
                {/* big number on top of bar */}
                <text
                  x={x + barW / 2}
                  y={y - 16}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={32}
                  fill={t.color}
                  letterSpacing={1}
                >
                  {isLessThan ? "< " : ""}
                  {value}
                </text>
                <text
                  x={x + barW / 2}
                  y={y + 12}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={14}
                  fill="rgba(220,200,160,0.85)"
                  letterSpacing={2}
                  style={{ pointerEvents: "none" }}
                >
                  {unit.toUpperCase()}
                </text>
                {/* label below */}
                <text
                  x={x + barW / 2}
                  y={VH - PAD_BOTTOM + 30}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={17}
                  fill={isActive ? "var(--ink)" : "rgba(245,232,204,0.88)"}
                  letterSpacing={0.5}
                >
                  {t.label}
                </text>
                <text
                  x={x + barW / 2}
                  y={VH - PAD_BOTTOM + 52}
                  textAnchor="middle"
                  fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
                  fontStyle="italic"
                  fontSize={12}
                  fill="rgba(220,200,160,0.6)"
                >
                  {t.detail}
                </text>
                <text
                  x={x + barW / 2}
                  y={VH - PAD_BOTTOM + 72}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={11}
                  fill="rgba(220,200,160,0.45)"
                  letterSpacing={2}
                >
                  {t.era.toUpperCase()}
                </text>
              </g>
            )
          })}

          {/* gradient-orders sweep — copper arrow from GPU down to MEMPHIS */}
          {(() => {
            const gpuY = yForEnergy(TIERS[0].energy) + 60
            const memY = yForEnergy(TIERS[3].energy) - 40
            const gpuX = PAD_LEFT + 0 * (barW + barGap) + barW / 2
            const memX = PAD_LEFT + 3 * (barW + barGap) + barW / 2
            return (
              <g opacity={0.6}>
                <path
                  d={`M ${gpuX + 60} ${gpuY} Q ${(gpuX + memX) / 2} ${gpuY - 40} ${memX - 60} ${memY}`}
                  fill="none"
                  stroke="#c98e4f"
                  strokeWidth={1.2}
                  strokeDasharray="6 4"
                />
                <text
                  x={(gpuX + memX) / 2}
                  y={gpuY - 60}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={12}
                  fill="#c98e4f"
                  letterSpacing={3}
                >
                  − 5 ORDERS OF MAGNITUDE
                </text>
              </g>
            )
          })()}

          {/* side panel */}
          <g transform={`translate(${PANEL_X}, ${PAD_TOP - 56})`}>
            <rect
              x={0}
              y={0}
              width={PANEL_W}
              height={PLOT_H + 110}
              rx={10}
              fill="rgba(13,16,39,0.7)"
              stroke={active.color}
              strokeOpacity={0.5}
              strokeWidth={1.2}
            />
            <text
              x={PANEL_PAD}
              y={36}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={3}
              fill="rgba(220,200,160,0.65)"
            >
              TIER · {active.label.toUpperCase()}
            </text>
            <foreignObject x={PANEL_PAD} y={50} width={PANEL_INNER_W} height={68}>
              <div
                style={{
                  fontFamily: "var(--font-display), Gloock, serif",
                  fontSize: "20px",
                  lineHeight: 1.15,
                  letterSpacing: "0.01em",
                  color: "var(--ink)",
                }}
              >
                {active.detail}
              </div>
            </foreignObject>
            <text
              x={PANEL_PAD}
              y={210}
              fontFamily="var(--font-display), Gloock, serif"
              fontSize={58}
              fill={active.color}
              letterSpacing={2}
            >
              {active.id === "memphis" ? "< " : ""}
              {formatEnergy(active.energy).value}
              <tspan fontSize={28} fill="rgba(220,200,160,0.7)">
                {" "}{formatEnergy(active.energy).unit}
              </tspan>
            </text>
            <line
              x1={PANEL_PAD}
              x2={PANEL_W - PANEL_PAD}
              y1={236}
              y2={236}
              stroke="rgba(220,200,160,0.25)"
              strokeWidth={0.6}
            />
            <foreignObject
              x={PANEL_PAD}
              y={252}
              width={PANEL_INNER_W}
              height={PLOT_H - 100}
            >
              <div
                style={{
                  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                  fontSize: "13.5px",
                  lineHeight: 1.55,
                  color: "var(--ink-cool)",
                }}
              >
                {active.source}
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
          MEMPHIS targets the biological benchmark — not the next neuromorphic
          increment. Five orders of magnitude separate it from today&rsquo;s
          GPU-borne foundation-model inference.
        </div>
      </div>
    </figure>
  )
}
