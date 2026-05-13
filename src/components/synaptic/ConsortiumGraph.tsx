"use client"

import { useState } from "react"

type Partner = {
  id: string
  name: string
  affiliation: string
  country: string
  countryCode: string
  city: string
  role: string
  objective: string
  body: string
  pos: { x: number; y: number }
  color: string
  isCoordinator?: boolean
}

const PARTNERS: ReadonlyArray<Partner> = [
  {
    id: "realai",
    name: "Real AI",
    affiliation: "Coordinator · Hominis programme",
    country: "Netherlands",
    countryCode: "NL",
    city: "Amsterdam",
    role: "Coordinator",
    objective: "O1 · O4",
    body: "Founded by Tarry Singh. Coordinates SYMPHONY end-to-end, leads the four-layer extraction pipeline (O1, M12) and the pre-registered baseline benchmark (O4, M30). Builds Hominis on EuroHPC allocation at Leonardo / CINECA.",
    pos: { x: 700, y: 320 },
    color: "#f4c482",
    isCoordinator: true,
  },
  {
    id: "newcastle",
    name: "Newcastle · Ramaswamy",
    affiliation: "School of Computing",
    country: "United Kingdom",
    countryCode: "UK",
    city: "Newcastle upon Tyne",
    role: "O2 lead · ethics co-lead",
    objective: "O2",
    body: "Sri Ramaswamy, chair of computational neuroscience. Third author of Mei, Muller & Ramaswamy (2022) — the mathematical primary source for SYMPHONY's mechanism. Blue Brain alumnus. Leads O2 (M18) and co-leads ethics for O5 (M33).",
    pos: { x: 620, y: 180 },
    color: "#e5a896",
  },
  {
    id: "create",
    name: "CREATE · Siciliano",
    affiliation: "PRISMA Lab · UNINA",
    country: "Italy",
    countryCode: "IT",
    city: "Naples",
    role: "O3 lead",
    objective: "O3",
    body: "Bruno Siciliano directs PRISMA Lab. ERC Advanced Grant holder, Engelberger laureate. The architectural primary source for SYMPHONY's task-baton — haptic shared control transposed to software. Leads O3 (M24).",
    pos: { x: 800, y: 540 },
    color: "#6cb4c2",
  },
  {
    id: "uprobotics",
    name: "UP Robotics",
    affiliation: "Industrial demonstrator",
    country: "Croatia",
    countryCode: "HR",
    city: "Zagreb",
    role: "demonstrator codebase",
    objective: "supplier",
    body: "Contributes the industrial-automation demonstrator codebase. The O1 extraction pipeline and the O4 benchmark must both survive contact with this production system whose maintenance logs supply half the held-out task instances.",
    pos: { x: 880, y: 460 },
    color: "#a698d4",
  },
]

const EDGES: ReadonlyArray<{ from: string; to: string; label?: string }> = [
  { from: "realai", to: "newcastle", label: "O1 → O2" },
  { from: "realai", to: "create", label: "O1 → O3" },
  { from: "realai", to: "uprobotics", label: "O1 corpus" },
  { from: "newcastle", to: "create", label: "co-author" },
  { from: "newcastle", to: "uprobotics", label: "O5 ethics" },
  { from: "create", to: "uprobotics", label: "O3 trials" },
]

const VW = 1400
const VH = 800

// Simplified Europe outline as a series of waypoints — a stylised silhouette,
// not a real cartographic map. Coordinates roughly approximating Western /
// Northern Europe in the 1400×800 viewBox.
const EUROPE_PATH =
  "M 320 120 Q 380 90 460 110 Q 540 120 600 160 Q 660 180 700 210 Q 760 230 800 280 Q 840 320 870 380 Q 900 440 930 500 Q 960 560 920 600 Q 880 640 820 660 Q 760 670 700 660 Q 640 650 600 620 Q 550 590 500 580 Q 440 580 380 600 Q 320 610 280 580 Q 240 540 230 480 Q 220 420 240 360 Q 250 280 280 220 Q 300 160 320 120 Z"

export function ConsortiumGraph() {
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string>("realai")
  const activeId = hover ?? pinned
  const active = PARTNERS.find((p) => p.id === activeId) ?? PARTNERS[0]
  const activeIsCoordEdges = (a: string, b: string) =>
    activeId === a || activeId === b

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
          aria-label="SYMPHONY consortium across Europe — Real AI in the Netherlands (coordinator), Newcastle / Ramaswamy in the UK, CREATE / PRISMA in Naples Italy, UP Robotics in Croatia. Six edges between every pair of partners showing the work-package couplings."
        >
          <defs>
            <radialGradient id="syn-cn-bg" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#1a2154" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="syn-cn-land" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c2058" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0.9" />
            </linearGradient>
            <radialGradient id="syn-cn-pin-coord" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#ffd596" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffd596" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-cn-bg)" />

          {/* studio header */}
          <text
            x={60}
            y={42}
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={14}
            letterSpacing={4}
            fill="rgba(220,200,160,0.85)"
          >
            PLATE III · MMXXVI · CONSORTIUM
          </text>
          <text
            x={60}
            y={76}
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={36}
            fill="var(--ink)"
            letterSpacing={2}
          >
            Four partners, three EU member states
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
            NL · UK · IT · HR
          </text>

          {/* simplified Europe silhouette */}
          <path
            d={EUROPE_PATH}
            fill="url(#syn-cn-land)"
            stroke="rgba(200,184,255,0.35)"
            strokeWidth={1.4}
          />
          {/* parallels / meridians as faint hairlines */}
          {[200, 320, 440, 560, 680].map((y) => (
            <line
              key={`par-${y}`}
              x1={150}
              x2={1050}
              y1={y}
              y2={y}
              stroke="rgba(200,184,255,0.08)"
              strokeWidth={0.6}
              strokeDasharray="2 4"
            />
          ))}
          {[300, 460, 620, 780, 940].map((x) => (
            <line
              key={`mer-${x}`}
              x1={x}
              x2={x}
              y1={130}
              y2={680}
              stroke="rgba(200,184,255,0.08)"
              strokeWidth={0.6}
              strokeDasharray="2 4"
            />
          ))}

          {/* edges between partners */}
          {EDGES.map((e, i) => {
            const a = PARTNERS.find((p) => p.id === e.from)
            const b = PARTNERS.find((p) => p.id === e.to)
            if (!a || !b) return null
            const lit = activeIsCoordEdges(e.from, e.to)
            const mx = (a.pos.x + b.pos.x) / 2
            const my = (a.pos.y + b.pos.y) / 2 - 12
            return (
              <g key={`edge-${i}`}>
                <line
                  x1={a.pos.x}
                  y1={a.pos.y}
                  x2={b.pos.x}
                  y2={b.pos.y}
                  stroke={lit ? "#ffd596" : "rgba(220,200,160,0.3)"}
                  strokeOpacity={lit ? 0.9 : 0.45}
                  strokeWidth={lit ? 1.8 : 1.2}
                  strokeDasharray={lit ? "0" : "4 4"}
                  className={lit ? "syn-anim-ribbon" : undefined}
                />
                {lit && e.label ? (
                  <text
                    x={mx}
                    y={my}
                    textAnchor="middle"
                    fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                    fontSize={11}
                    letterSpacing={2}
                    fill="#ffd596"
                  >
                    {e.label.toUpperCase()}
                  </text>
                ) : null}
              </g>
            )
          })}

          {/* partner nodes */}
          {PARTNERS.map((p) => {
            const isActive = activeId === p.id
            const r = p.isCoordinator ? 70 : 56
            return (
              <g
                key={p.id}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setPinned(p.id)}
                style={{ cursor: "pointer" }}
              >
                {/* pulse aura when active or coordinator */}
                {(isActive || p.isCoordinator) ? (
                  <circle
                    cx={p.pos.x}
                    cy={p.pos.y}
                    r={r + (isActive ? 28 : 18)}
                    fill={p.isCoordinator ? "url(#syn-cn-pin-coord)" : "none"}
                    stroke={p.color}
                    strokeOpacity={isActive ? 0.95 : 0.45}
                    strokeWidth={1.4}
                    className={isActive ? "syn-anim-sweep" : undefined}
                  />
                ) : null}
                {/* outer glow */}
                <circle
                  cx={p.pos.x}
                  cy={p.pos.y}
                  r={r + 8}
                  fill={p.color}
                  fillOpacity={isActive ? 0.3 : 0.12}
                />
                {/* node */}
                <circle
                  cx={p.pos.x}
                  cy={p.pos.y}
                  r={r}
                  fill="#0d1027"
                  stroke={p.color}
                  strokeOpacity={isActive ? 1 : 0.75}
                  strokeWidth={isActive ? 2.4 : 1.6}
                />
                {/* country code */}
                <text
                  x={p.pos.x}
                  y={p.pos.y - 18}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={11}
                  letterSpacing={3}
                  fill={p.color}
                >
                  {p.countryCode}
                </text>
                {/* name */}
                <text
                  x={p.pos.x}
                  y={p.pos.y + 4}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={p.isCoordinator ? 22 : 18}
                  fill={isActive ? "#ffd596" : "var(--ink)"}
                  style={{ letterSpacing: "0.04em" }}
                >
                  {p.name.split(" · ")[0]}
                </text>
                {/* objective */}
                <text
                  x={p.pos.x}
                  y={p.pos.y + 26}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={11}
                  letterSpacing={2.5}
                  fill="rgba(220,200,160,0.7)"
                >
                  {p.objective}
                </text>
                {/* coordinator label */}
                {p.isCoordinator ? (
                  <text
                    x={p.pos.x}
                    y={p.pos.y - r - 16}
                    textAnchor="middle"
                    fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                    fontSize={11}
                    fill="rgba(255,210,150,0.85)"
                    letterSpacing={3}
                  >
                    ◆ COORDINATOR
                  </text>
                ) : null}
                {/* city subtitle */}
                <text
                  x={p.pos.x}
                  y={p.pos.y + r + 24}
                  textAnchor="middle"
                  fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
                  fontStyle="italic"
                  fontSize={13}
                  fill="rgba(220,200,160,0.6)"
                >
                  {p.city}
                </text>
              </g>
            )
          })}

          {/* active partner panel — right side */}
          <g transform={`translate(${VW - 380}, 120)`}>
            <rect
              x={0}
              y={0}
              width={320}
              height={560}
              rx={10}
              fill="rgba(13,16,39,0.7)"
              stroke={active.color}
              strokeOpacity={0.55}
              strokeWidth={1.2}
            />
            <text
              x={20}
              y={32}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={3}
              fill="rgba(220,200,160,0.65)"
            >
              PARTNER · {active.countryCode}
            </text>
            <text
              x={20}
              y={68}
              fontFamily="var(--font-display), Gloock, serif"
              fontSize={24}
              fill={active.color}
              letterSpacing={1}
            >
              {active.name}
            </text>
            <text
              x={20}
              y={94}
              fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
              fontStyle="italic"
              fontSize={13}
              fill="rgba(220,200,160,0.7)"
            >
              {active.affiliation}
            </text>
            <text
              x={20}
              y={118}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={2}
              fill="rgba(220,200,160,0.55)"
            >
              {active.city.toUpperCase()} · {active.country.toUpperCase()}
            </text>
            <line
              x1={20}
              x2={300}
              y1={138}
              y2={138}
              stroke="rgba(220,200,160,0.25)"
              strokeWidth={0.6}
            />
            <text
              x={20}
              y={170}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={10}
              letterSpacing={2}
              fill="rgba(220,200,160,0.55)"
            >
              ROLE
            </text>
            <text
              x={20}
              y={194}
              fontFamily="var(--font-display), Gloock, serif"
              fontSize={20}
              fill="var(--ink)"
              letterSpacing={1}
            >
              {active.role}
            </text>
            <line
              x1={20}
              x2={300}
              y1={216}
              y2={216}
              stroke="rgba(220,200,160,0.25)"
              strokeWidth={0.6}
            />
            <foreignObject x={20} y={232} width={280} height={320}>
              <div
                style={{
                  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "var(--ink-cool)",
                }}
              >
                {active.body}
              </div>
            </foreignObject>
          </g>

          {/* footer hint */}
          <text
            x={60}
            y={VH - 28}
            fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
            fontStyle="italic"
            fontSize={14}
            fill="rgba(220,200,160,0.6)"
          >
            Hover or click any partner to inspect the role; lit edges show that partner&rsquo;s couplings.
          </text>
        </svg>
      </div>
    </figure>
  )
}
