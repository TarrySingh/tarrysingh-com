"use client"

import { useState } from "react"

type Partner = {
  id: string
  name: string
  affiliation: string
  role: string
  body: string
  position: { x: number; y: number }
  color: string
  isCoordinator?: boolean
}

const PARTNERS: ReadonlyArray<Partner> = [
  {
    id: "realai",
    name: "Real AI",
    affiliation: "Coordinator · Hominis",
    role: "O1 · O4",
    body: "Foundation models for the real world. Coordinates SYMPHONY end-to-end; leads the multi-layer extraction pipeline (O1) and the pre-registered baseline benchmark (O4).",
    position: { x: 500, y: 280 },
    color: "#f4c482",
    isCoordinator: true,
  },
  {
    id: "newcastle",
    name: "Newcastle · Ramaswamy",
    affiliation: "School of Computing",
    role: "O2 · ethics co-lead",
    body: "Sri Ramaswamy holds the chair in computational neuroscience. Third author of Mei, Muller & Ramaswamy (2022) — the four-scale neuromodulatory framework SYMPHONY transposes to source code. Leads O2.",
    position: { x: 220, y: 480 },
    color: "#e5a896",
  },
  {
    id: "create",
    name: "CREATE · Siciliano",
    affiliation: "PRISMA Lab · UNINA",
    role: "O3",
    body: "Bruno Siciliano directs PRISMA Lab. ERC Advanced Grant holder, Engelberger laureate. The Siciliano-school haptic shared-control programme proved in hardware that low-bandwidth signals reshape high-DOF controllers. Leads O3.",
    position: { x: 780, y: 480 },
    color: "#6cb4c2",
  },
  {
    id: "uprobotics",
    name: "UP Robotics",
    affiliation: "Industrial demonstrator",
    role: "demonstrator codebase",
    body: "Contributes the industrial-automation demonstrator codebase. The O1 extraction pipeline and the O4 benchmark must both survive contact with this production system whose maintenance logs supply half the held-out task instances.",
    position: { x: 500, y: 640 },
    color: "#a698d4",
  },
]

const EDGES: ReadonlyArray<[string, string]> = [
  ["realai", "newcastle"],
  ["realai", "create"],
  ["realai", "uprobotics"],
  ["newcastle", "create"],
  ["newcastle", "uprobotics"],
  ["create", "uprobotics"],
]

const VW = 1000
const VH = 760

export function ConsortiumGraph() {
  const [hover, setHover] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const focusedId = hover ?? selected
  const focused = PARTNERS.find((p) => p.id === focusedId) ?? null

  return (
    <figure className="syn-symphony">
      <div
        className="rounded-[var(--radius-card)] border p-5"
        style={{
          borderColor: "rgba(200,180,255,0.18)",
          background:
            "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="block h-auto w-full"
          role="img"
          aria-label="SYMPHONY consortium graph — Real AI as coordinator at the centre, Newcastle / Ramaswamy lower-left, CREATE / Siciliano lower-right, UP Robotics at the bottom, with edges between every pair of partners."
        >
          <defs>
            <radialGradient id="syn-consort-bg" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#1c2058" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-consort-bg)" />

          {/* edges */}
          {EDGES.map(([a, b]) => {
            const pa = PARTNERS.find((p) => p.id === a)
            const pb = PARTNERS.find((p) => p.id === b)
            if (!pa || !pb) return null
            const isLit =
              focusedId !== null && (focusedId === a || focusedId === b)
            return (
              <line
                key={`${a}-${b}`}
                x1={pa.position.x}
                y1={pa.position.y}
                x2={pb.position.x}
                y2={pb.position.y}
                stroke={isLit ? "#ffd596" : "rgba(220,200,160,0.28)"}
                strokeWidth={isLit ? 1.6 : 1}
                strokeDasharray={isLit ? "0" : "4 4"}
              />
            )
          })}

          {/* nodes */}
          {PARTNERS.map((p) => {
            const isFocus = focusedId === p.id
            const isCross =
              focusedId !== null &&
              !isFocus &&
              EDGES.some(
                ([a, b]) =>
                  (a === p.id && b === focusedId) ||
                  (b === p.id && a === focusedId),
              )
            const r = p.isCoordinator ? 60 : 48
            return (
              <g
                key={p.id}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() =>
                  setSelected((cur) => (cur === p.id ? null : p.id))
                }
                style={{ cursor: "pointer" }}
              >
                {isFocus ? (
                  <circle
                    cx={p.position.x}
                    cy={p.position.y}
                    r={r + 18}
                    fill="none"
                    stroke={p.color}
                    strokeOpacity={0.7}
                    strokeWidth={1.4}
                    className="syn-anim-sweep"
                  />
                ) : null}
                <circle
                  cx={p.position.x}
                  cy={p.position.y}
                  r={r + 6}
                  fill={p.color}
                  fillOpacity={isFocus ? 0.28 : isCross ? 0.16 : 0.08}
                />
                <circle
                  cx={p.position.x}
                  cy={p.position.y}
                  r={r}
                  fill="#0d1027"
                  stroke={p.color}
                  strokeOpacity={isFocus ? 1 : 0.7}
                  strokeWidth={isFocus ? 2 : 1.2}
                />
                <text
                  x={p.position.x}
                  y={p.position.y - 4}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={p.isCoordinator ? 22 : 18}
                  fill={isFocus ? "#ffd596" : "var(--ink)"}
                  style={{ letterSpacing: "0.04em" }}
                >
                  {p.name.split(" · ")[0]}
                </text>
                <text
                  x={p.position.x}
                  y={p.position.y + 16}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={10}
                  fill="rgba(220,200,160,0.7)"
                  letterSpacing={1.2}
                >
                  {p.role}
                </text>
                {p.isCoordinator ? (
                  <text
                    x={p.position.x}
                    y={p.position.y - r - 14}
                    textAnchor="middle"
                    fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                    fontSize={9}
                    fill="rgba(255,210,150,0.85)"
                    letterSpacing={1.6}
                  >
                    ◆ COORDINATOR
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>

        {/* detail panel */}
        <div
          className="mt-3 px-1"
          style={{
            minHeight: "5em",
            color: "var(--ink-cool)",
            fontSize: "0.88rem",
            lineHeight: 1.5,
          }}
        >
          {focused ? (
            <>
              <div className="flex items-baseline gap-3">
                <span
                  className="syn-small-caps"
                  style={{ color: focused.color }}
                >
                  {focused.name}
                </span>
                <span
                  className="syn-small-caps"
                  style={{ color: "var(--ink-dim)" }}
                >
                  {focused.affiliation}
                </span>
              </div>
              <p className="mt-2" style={{ color: "var(--ink)" }}>
                {focused.body}
              </p>
            </>
          ) : (
            <span style={{ color: "var(--ink-dim)" }}>
              Four partners across three EU member states. Hover any node
              for the partner's role and pedigree; the edges show the
              cross-partner couplings that the work-package structure
              relies on.
            </span>
          )}
        </div>
      </div>
    </figure>
  )
}
