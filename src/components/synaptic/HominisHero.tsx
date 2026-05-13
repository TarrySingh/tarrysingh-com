"use client"

import { useState } from "react"

type Pillar = {
  id: string
  capital: string
  shaft: string
  body: string
  color: string
}

const PILLARS: ReadonlyArray<Pillar> = [
  {
    id: "situated",
    capital: "I",
    shaft: "Situated",
    body: "Foundation models that read the world they are deployed into — industrial-automation logs, EU regulatory text, multi-lingual scientific corpora — not just the open web. Trained on the context that matches the substrate they will be embedded in. The model knows where it is.",
    color: "#f4c482",
  },
  {
    id: "auditable",
    capital: "II",
    shaft: "Auditable",
    body: "Every output is traceable to a substrate region; every adaptation to a task token. Compositional control surfaces, bounded behaviour, and external evaluation built into the development loop, not bolted on after release. The model shows its work.",
    color: "#e5a896",
  },
  {
    id: "compute",
    capital: "III",
    shaft: "Compute-aware",
    body: "Built on EuroHPC allocation time at Leonardo (CINECA, Bologna). Designed to run within the energy and the time budget of European public infrastructure — not against it. Per-paper tCO₂e reporting; absolute compute-budget caps declared in the DMP.",
    color: "#6cb4c2",
  },
]

const VW = 1400
const VH = 820

export function HominisHero() {
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string>("situated")
  const activeId = hover ?? pinned
  const active = PILLARS.find((p) => p.id === activeId) ?? PILLARS[0]

  const cx = VW / 2
  const pedimentApexY = 130
  const pedimentBaseY = 260
  const architraveY = 268
  const architraveH = 36
  const columnTopY = architraveY + architraveH + 8
  const columnBaseY = 640
  const baseY = 644
  const foundationY = 680
  const foundationH = 60

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
          aria-label="Hominis cathedral — three pillars (situated · auditable · compute-aware) standing on the Leonardo / CINECA EuroHPC foundation, beneath a pediment carrying the HOMINIS wordmark."
        >
          <defs>
            <radialGradient id="syn-hh-bg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1a2154" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="syn-hh-marble" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5e8cc" stopOpacity="1" />
              <stop offset="50%" stopColor="#e0d0a8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#a89676" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="syn-hh-base" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a4a8a" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0d1027" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="syn-hh-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={active.color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={active.color} stopOpacity="0" />
            </linearGradient>
            <radialGradient id="syn-hh-sky" cx="50%" cy="0%" r="70%">
              <stop offset="0%" stopColor="#3a2a6a" stopOpacity="0.45" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-hh-bg)" />
          <rect x={0} y={0} width={VW} height={pedimentApexY + 220} fill="url(#syn-hh-sky)" />

          {/* studio header */}
          <text
            x={60}
            y={42}
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={14}
            letterSpacing={4}
            fill="rgba(220,200,160,0.85)"
          >
            PLATE VI · MMXXVI · REAL AI / TARRY · COORDINATOR
          </text>
          <text
            x={60}
            y={76}
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={36}
            fill="var(--ink)"
            letterSpacing={2}
          >
            Hominis cathedral
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
            FOUNDATION MODELS FOR THE REAL WORLD
          </text>

          {/* starfield */}
          {Array.from({ length: 44 }).map((_, i) => {
            const x = (i * 137 + 47) % VW
            const y = ((i * 71 + 11) % 240) + 100
            return (
              <circle
                key={`star-${i}`}
                cx={x}
                cy={y}
                r={(i % 5) === 0 ? 1.8 : 1.1}
                fill="#f5e8cc"
                fillOpacity={0.1 + ((i * 31) % 80) / 800}
              />
            )
          })}

          {/* pediment triangle */}
          <polygon
            points={`${cx},${pedimentApexY} ${cx + 480},${pedimentBaseY} ${cx - 480},${pedimentBaseY}`}
            fill="url(#syn-hh-marble)"
            stroke="rgba(120,98,68,0.7)"
            strokeWidth={1.4}
          />
          {/* pediment wordmark */}
          <text
            x={cx}
            y={222}
            textAnchor="middle"
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={72}
            fill="#5a4a8a"
            letterSpacing={6}
          >
            HOMINIS
          </text>
          <text
            x={cx}
            y={252}
            textAnchor="middle"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={13}
            letterSpacing={5}
            fill="rgba(90,70,48,0.85)"
          >
            FOUNDATION MODELS FOR THE REAL WORLD
          </text>
          {/* triglyph dots on pediment */}
          {Array.from({ length: 9 }).map((_, k) => (
            <circle
              key={`tri-${k}`}
              cx={cx - 240 + k * 60}
              cy={pedimentBaseY - 14}
              r={3}
              fill="rgba(120,98,68,0.6)"
            />
          ))}

          {/* architrave */}
          <rect
            x={cx - 520}
            y={architraveY}
            width={1040}
            height={architraveH}
            fill="url(#syn-hh-marble)"
            stroke="rgba(120,98,68,0.65)"
            strokeWidth={1.2}
          />
          {Array.from({ length: 13 }).map((_, k) => (
            <rect
              key={`metope-${k}`}
              x={cx - 510 + k * 80}
              y={architraveY + 8}
              width={60}
              height={20}
              fill="none"
              stroke="rgba(120,98,68,0.45)"
              strokeWidth={0.8}
            />
          ))}

          {/* three pillars */}
          {PILLARS.map((p, i) => {
            const cellW = 320
            const xCenter = cx - cellW + i * cellW
            const shaftHalf = 60
            const capH = 30
            const baseH = 26
            const isActive = activeId === p.id

            return (
              <g
                key={p.id}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setPinned(p.id)}
                style={{ cursor: "pointer" }}
              >
                {/* aura glow */}
                {isActive ? (
                  <rect
                    x={xCenter - shaftHalf - 36}
                    y={columnTopY - 10}
                    width={(shaftHalf + 36) * 2}
                    height={columnBaseY - columnTopY + 20}
                    rx={8}
                    fill="url(#syn-hh-glow)"
                    opacity={0.7}
                  />
                ) : null}

                {/* capital */}
                <rect
                  x={xCenter - shaftHalf - 10}
                  y={columnTopY}
                  width={(shaftHalf + 10) * 2}
                  height={capH}
                  fill="url(#syn-hh-marble)"
                  stroke="rgba(120,98,68,0.65)"
                  strokeWidth={1.1}
                />
                <line
                  x1={xCenter - shaftHalf - 10}
                  x2={xCenter + shaftHalf + 10}
                  y1={columnTopY + capH - 6}
                  y2={columnTopY + capH - 6}
                  stroke="rgba(120,98,68,0.55)"
                  strokeWidth={0.8}
                />
                {/* capital numeral */}
                <text
                  x={xCenter}
                  y={columnTopY + capH - 10}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={28}
                  fill={isActive ? p.color : "#5a4a8a"}
                  letterSpacing={2}
                >
                  {p.capital}
                </text>

                {/* shaft */}
                <rect
                  x={xCenter - shaftHalf}
                  y={columnTopY + capH}
                  width={shaftHalf * 2}
                  height={columnBaseY - (columnTopY + capH)}
                  fill="url(#syn-hh-marble)"
                  stroke="rgba(120,98,68,0.6)"
                  strokeWidth={1}
                />
                {/* fluting */}
                {Array.from({ length: 7 }).map((_, fi) => {
                  const fx = xCenter - shaftHalf + 10 + fi * 18
                  return (
                    <line
                      key={`flute-${i}-${fi}`}
                      x1={fx}
                      x2={fx}
                      y1={columnTopY + capH + 6}
                      y2={columnBaseY - 4}
                      stroke={isActive ? p.color : "rgba(120,98,68,0.35)"}
                      strokeOpacity={isActive ? 0.75 : 1}
                      strokeWidth={1}
                    />
                  )
                })}
                {/* mid-shaft band engraving */}
                <text
                  x={xCenter}
                  y={460}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={11}
                  letterSpacing={4}
                  fill="rgba(120,98,68,0.7)"
                  transform={`rotate(-90 ${xCenter} 460)`}
                >
                  {p.shaft.toUpperCase()}
                </text>

                {/* base */}
                <rect
                  x={xCenter - shaftHalf - 8}
                  y={columnBaseY}
                  width={(shaftHalf + 8) * 2}
                  height={baseH}
                  fill="url(#syn-hh-marble)"
                  stroke="rgba(120,98,68,0.65)"
                  strokeWidth={1.1}
                />

                {/* label below */}
                <text
                  x={xCenter}
                  y={baseY + baseH + 36}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={28}
                  fill={isActive ? p.color : "var(--ink)"}
                  letterSpacing={1}
                >
                  {p.shaft}
                </text>
              </g>
            )
          })}

          {/* foundation block */}
          <rect
            x={40}
            y={foundationY}
            width={VW - 80}
            height={foundationH}
            rx={6}
            fill="url(#syn-hh-base)"
            stroke="rgba(200,184,255,0.5)"
            strokeWidth={1.2}
          />
          <text
            x={cx}
            y={foundationY + 24}
            textAnchor="middle"
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={22}
            fill="#f5e8cc"
            letterSpacing={4}
          >
            LEONARDO · CINECA · EUROHPC
          </text>
          <text
            x={cx}
            y={foundationY + 46}
            textAnchor="middle"
            fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
            fontStyle="italic"
            fontSize={13}
            fill="rgba(200,184,255,0.7)"
          >
            European public compute · Bologna
          </text>

          {/* active pillar detail panel at bottom */}
          <g transform={`translate(60, ${VH - 100})`}>
            <rect
              x={0}
              y={0}
              width={VW - 120}
              height={84}
              rx={10}
              fill="rgba(13,16,39,0.7)"
              stroke={active.color}
              strokeOpacity={0.55}
              strokeWidth={1.2}
            />
            <text
              x={28}
              y={34}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={3}
              fill="rgba(220,200,160,0.65)"
            >
              PILLAR · {active.capital} · {active.shaft.toUpperCase()}
            </text>
            <foreignObject x={28} y={42} width={VW - 200} height={50}>
              <div
                style={{
                  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                  fontSize: "14px",
                  lineHeight: 1.5,
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
