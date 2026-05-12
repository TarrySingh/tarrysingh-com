"use client"

import { useState } from "react"

type Sector = {
  id: string
  label: string
  body: string
}

const SECTORS: ReadonlyArray<Sector> = [
  {
    id: "industrial",
    label: "Industrial manipulation",
    body: "Multi-degree-of-freedom manipulators for assembly, machining and inspection lines — the substrate of every modern factory.",
  },
  {
    id: "service",
    label: "Service robotics",
    body: "Robots that share space with humans outside the factory: domestic, retail, hospitality, and assistive systems.",
  },
  {
    id: "aerial",
    label: "Aerial robotics",
    body: "UAVs and aerial manipulators — load-bearing flight under shared control. PRISMA pioneered tethered cooperative aerial manipulation.",
  },
  {
    id: "surgical",
    label: "Surgical robotics",
    body: "Tele-operated and shared-autonomy systems for needle insertion, suturing and tissue handling — the original test-bed for haptic active constraints.",
  },
  {
    id: "haptic",
    label: "Haptic shared control",
    body: "Low-bandwidth supervisory signals reshape a high-DOF autonomous controller into qualitatively different behaviours — the architectural primitive SYMPHONY transposes.",
  },
  {
    id: "hri",
    label: "Human–robot interaction",
    body: "The cognitive and communicative layer of shared autonomy: when to defer, when to ask, when to refuse — the auditability question SYMPHONY inherits.",
  },
  {
    id: "planning",
    label: "Motion planning",
    body: "Real-time path planning under contact constraints — the substrate that downstream control sits on top of.",
  },
]

const VW = 600
const VH = 660
const CX = VW / 2
const CY = 300
const R_OUTER = 220
const R_INNER = 80

function sectorPath(i: number, n: number, rIn: number, rOut: number) {
  const sliceAng = (Math.PI * 2) / n
  const a0 = -Math.PI / 2 + i * sliceAng
  const a1 = -Math.PI / 2 + (i + 1) * sliceAng
  const x0o = CX + rOut * Math.cos(a0)
  const y0o = CY + rOut * Math.sin(a0)
  const x1o = CX + rOut * Math.cos(a1)
  const y1o = CY + rOut * Math.sin(a1)
  const x0i = CX + rIn * Math.cos(a0)
  const y0i = CY + rIn * Math.sin(a0)
  const x1i = CX + rIn * Math.cos(a1)
  const y1i = CY + rIn * Math.sin(a1)
  return `M ${x0i} ${y0i} L ${x0o} ${y0o} A ${rOut} ${rOut} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rIn} ${rIn} 0 0 0 ${x0i} ${y0i} Z`
}

export function SicilianoRose() {
  const [hover, setHover] = useState<number | null>(null)
  const n = SECTORS.length
  const active = hover !== null ? SECTORS[hover] : null

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
          aria-label="Siciliano / PRISMA seven-sector rose — industrial manipulation, service, aerial, surgical, haptic shared control, human-robot interaction, motion planning. ERC Advanced Grant holder and Engelberger laureate; lab motto 'Keep the gradient'."
        >
          {/* concentric guide circles */}
          {[0.4, 0.6, 0.8, 1.0].map((f) => (
            <circle
              key={`g-${f}`}
              cx={CX}
              cy={CY}
              r={R_OUTER * f}
              fill="none"
              stroke="rgba(220,200,160,0.08)"
              strokeWidth={0.6}
            />
          ))}

          {/* sector slices */}
          {SECTORS.map((s, i) => {
            const isHover = hover === i
            return (
              <g
                key={s.id}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              >
                <path
                  d={sectorPath(i, n, R_INNER, R_OUTER)}
                  fill="#6cb4c2"
                  fillOpacity={isHover ? 0.35 : 0.14}
                  stroke="#6cb4c2"
                  strokeOpacity={isHover ? 0.9 : 0.45}
                  strokeWidth={isHover ? 1.4 : 1}
                />
                {/* sector spike */}
                {(() => {
                  const angMid =
                    -Math.PI / 2 + (i + 0.5) * ((Math.PI * 2) / n)
                  const r = isHover ? R_OUTER + 30 : R_OUTER + 10
                  const x = CX + r * Math.cos(angMid)
                  const y = CY + r * Math.sin(angMid)
                  return (
                    <>
                      <line
                        x1={CX + R_OUTER * Math.cos(angMid)}
                        y1={CY + R_OUTER * Math.sin(angMid)}
                        x2={x}
                        y2={y}
                        stroke="#f4c482"
                        strokeOpacity={isHover ? 0.9 : 0.4}
                        strokeWidth={isHover ? 1.4 : 1}
                      />
                      <text
                        x={x + 6 * Math.cos(angMid)}
                        y={y + 6 * Math.sin(angMid) + 4}
                        textAnchor={
                          Math.cos(angMid) > 0.15
                            ? "start"
                            : Math.cos(angMid) < -0.15
                              ? "end"
                              : "middle"
                        }
                        fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                        fontSize={10}
                        fill={isHover ? "#ffd596" : "rgba(220,200,160,0.78)"}
                        letterSpacing={1.2}
                      >
                        {s.label.toUpperCase()}
                      </text>
                    </>
                  )
                })()}
              </g>
            )
          })}

          {/* centre disc with motto */}
          <circle cx={CX} cy={CY} r={R_INNER - 4} fill="#0d1027" stroke="rgba(244,196,130,0.55)" strokeWidth={1} />
          <text
            x={CX}
            y={CY - 6}
            textAnchor="middle"
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={22}
            fill="#f4c482"
            style={{ letterSpacing: "0.06em" }}
          >
            PRISMA
          </text>
          <text
            x={CX}
            y={CY + 14}
            textAnchor="middle"
            fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
            fontStyle="italic"
            fontSize={11}
            fill="rgba(220,200,160,0.8)"
          >
            Keep the gradient.
          </text>

          {/* awards strip below the rose */}
          <g transform={`translate(${CX}, ${CY + R_OUTER + 90})`}>
            <text
              x={0}
              y={0}
              textAnchor="middle"
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              fill="rgba(220,200,160,0.78)"
              letterSpacing={2}
            >
              ERC ADVANCED GRANT  ·  ENGELBERGER AWARD  ·  CREATE / UNINA
            </text>
            <text
              x={0}
              y={22}
              textAnchor="middle"
              fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
              fontStyle="italic"
              fontSize={12}
              fill="rgba(220,200,160,0.55)"
            >
              Bruno Siciliano · director, PRISMA Lab · O3 lead, SYMPHONY
            </text>
          </g>
        </svg>

        <div
          className="border-t px-5 py-4"
          style={{
            borderColor: "rgba(200,180,255,0.14)",
            color: "var(--ink-cool)",
            fontSize: "0.88rem",
            lineHeight: 1.5,
            minHeight: "4em",
          }}
        >
          {active ? (
            <>
              <span
                className="syn-small-caps"
                style={{ color: "#6cb4c2", marginRight: "0.75rem" }}
              >
                {active.label}
              </span>
              <span style={{ color: "var(--ink)" }}>{active.body}</span>
            </>
          ) : (
            <span style={{ color: "var(--ink-dim)" }}>
              PRISMA Lab spans seven domains of robotics. Hover any sector
              for the slice and what it brings to SYMPHONY. The haptic
              shared-control sector is the architectural primitive being
              transposed — the rest of the rose is the pedigree the lab
              brings to bear on it.
            </span>
          )}
        </div>
      </div>
    </figure>
  )
}
