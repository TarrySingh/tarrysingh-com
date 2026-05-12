"use client"

import { useState } from "react"

type Waypoint = {
  id: string
  label: string
  body: string
  x: number
  height: number
  color: string
}

const WAYPOINTS: ReadonlyArray<Waypoint> = [
  {
    id: "representation",
    label: "Representation",
    body: "A single substrate capable of holding an industrial-scale codebase coherently — structural, behavioural, historical and rationale layers unified on one graph.",
    x: 0.18,
    height: 0.55,
    color: "#f4c482",
  },
  {
    id: "reconfiguration",
    label: "Reconfiguration",
    body: "A mechanism for reconfiguring that representation on demand without rebuilding it — multi-scale neuromodulation transposed from cortex to code.",
    x: 0.5,
    height: 0.78,
    color: "#a698d4",
  },
  {
    id: "audit",
    label: "Narrow control surface",
    body: "A scalar task-baton interface, deliberately bounded, so the substrate is composable, auditable and traceable — Siciliano-school shared control, in software.",
    x: 0.82,
    height: 0.62,
    color: "#6cb4c2",
  },
]

const VW = 2400
const VH = 720
const HORIZON_Y = VH * 0.78

export function VisionHorizon() {
  const [hover, setHover] = useState<string | null>(null)
  const active = hover ? WAYPOINTS.find((w) => w.id === hover) ?? null : null

  // Build a curve through the three waypoint peaks and the two endpoints.
  const pts = [
    { x: 0, y: HORIZON_Y - VH * 0.05 },
    ...WAYPOINTS.map((w) => ({
      x: w.x * VW,
      y: HORIZON_Y - w.height * (VH - HORIZON_Y) - 60,
    })),
    { x: VW, y: HORIZON_Y - VH * 0.04 },
  ]
  const ridge = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ")
  const ridgeFill =
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    ` L ${VW} ${HORIZON_Y} L 0 ${HORIZON_Y} Z`

  return (
    <figure className="syn-symphony">
      <div
        className="rounded-[var(--radius-card)] border"
        style={{
          borderColor: "rgba(200,180,255,0.18)",
          background:
            "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="block h-auto w-full"
          role="img"
          aria-label="SYMPHONY vision horizon — a panoramic landscape of the three minimal requirements: a coherent representation, a reconfiguration mechanism, and a narrow auditable control surface. Hover any peak to read its requirement."
        >
          <defs>
            <linearGradient id="syn-vis-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c2058" />
              <stop offset="60%" stopColor="#0e1133" />
              <stop offset="100%" stopColor="#0a0b22" />
            </linearGradient>
            <linearGradient id="syn-vis-ridge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a4a8a" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id="syn-vis-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd596" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffd596" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* sky background */}
          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-vis-sky)" />

          {/* starfield — small dots */}
          {Array.from({ length: 36 }).map((_, i) => {
            const x = ((i * 137 + 41) % VW)
            const y = ((i * 71 + 9) % (HORIZON_Y - 60)) * 0.8
            const r = (i % 5) === 0 ? 2 : 1
            return (
              <circle
                key={`star-${i}`}
                cx={x}
                cy={y}
                r={r}
                fill="#f5e8cc"
                fillOpacity={0.12 + ((i * 31) % 100) / 1000}
              />
            )
          })}

          {/* ridge fill */}
          <path d={ridgeFill} fill="url(#syn-vis-ridge)" opacity={0.85} />

          {/* ridge line */}
          <path
            d={ridge}
            fill="none"
            stroke="#c8b8ff"
            strokeOpacity={0.55}
            strokeWidth={1.5}
          />

          {/* horizon hairline */}
          <line
            x1={0}
            x2={VW}
            y1={HORIZON_Y}
            y2={HORIZON_Y}
            stroke="#c8b8ff"
            strokeOpacity={0.35}
            strokeWidth={1}
          />

          {/* waypoint peaks */}
          {WAYPOINTS.map((w) => {
            const peakX = w.x * VW
            const peakY = HORIZON_Y - w.height * (VH - HORIZON_Y) - 60
            const isHover = hover === w.id
            return (
              <g
                key={w.id}
                onMouseEnter={() => setHover(w.id)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              >
                {/* generous hit zone */}
                <rect
                  x={peakX - 220}
                  y={peakY - 40}
                  width={440}
                  height={HORIZON_Y - peakY + 80}
                  fill="transparent"
                />
                {/* peak glow */}
                <circle
                  cx={peakX}
                  cy={peakY}
                  r={120}
                  fill="url(#syn-vis-glow)"
                  opacity={isHover ? 1 : 0.35}
                />
                {/* vertical plumb-line down to the horizon */}
                <line
                  x1={peakX}
                  x2={peakX}
                  y1={peakY + 6}
                  y2={HORIZON_Y - 6}
                  stroke={w.color}
                  strokeOpacity={isHover ? 0.85 : 0.35}
                  strokeWidth={1}
                  strokeDasharray={isHover ? "0" : "4 4"}
                />
                {/* peak dot */}
                <circle
                  cx={peakX}
                  cy={peakY}
                  r={isHover ? 14 : 9}
                  fill={w.color}
                  stroke="#0d1027"
                  strokeWidth={2}
                />
                {/* label */}
                <text
                  x={peakX}
                  y={peakY - 30}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={32}
                  fill={isHover ? "#ffd596" : "var(--ink)"}
                  style={{ letterSpacing: "0.05em" }}
                >
                  {w.label}
                </text>
                {/* horizon-side small-caps marker */}
                <text
                  x={peakX}
                  y={HORIZON_Y + 30}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={16}
                  letterSpacing={3}
                  fill={isHover ? "var(--ink)" : "rgba(220,200,160,0.7)"}
                >
                  {String(WAYPOINTS.indexOf(w) + 1).padStart(2, "0")} ·{" "}
                  {w.label.toUpperCase()}
                </text>
              </g>
            )
          })}

          {/* ground texture */}
          <rect
            x={0}
            y={HORIZON_Y}
            width={VW}
            height={VH - HORIZON_Y}
            fill="#0a0b22"
            opacity={0.55}
          />
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`ground-${i}`}
              x1={0}
              x2={VW}
              y1={HORIZON_Y + 30 + i * 16}
              y2={HORIZON_Y + 30 + i * 16}
              stroke="rgba(200,184,255,0.06)"
              strokeWidth={1}
            />
          ))}
        </svg>

        {/* detail strip */}
        <div
          className="border-t px-5 py-4"
          style={{
            borderColor: "rgba(200,180,255,0.14)",
            color: "var(--ink-cool)",
            fontSize: "0.88rem",
            lineHeight: 1.5,
            minHeight: "3.6em",
          }}
        >
          {active ? (
            <>
              <span
                className="syn-small-caps"
                style={{ color: active.color, marginRight: "0.75rem" }}
              >
                {active.label}
              </span>
              <span style={{ color: "var(--ink)" }}>{active.body}</span>
            </>
          ) : (
            <span style={{ color: "var(--ink-dim)" }}>
              The vision requires, minimally, three things: a representation
              that holds the codebase coherently; a reconfiguration
              mechanism that reshapes it on demand; and a narrow,
              auditable control surface. Hover any peak to read the
              requirement it stands for.
            </span>
          )}
        </div>
      </div>
    </figure>
  )
}
