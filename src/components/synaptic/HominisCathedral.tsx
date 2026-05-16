"use client"

import { useState } from "react"
import {
  HOMINIS_CATHEDRAL_ARIA_LABEL,
  HOMINIS_CATHEDRAL_DEFAULT_HINT,
  HOMINIS_FOUNDATION_LABEL,
  HOMINIS_PEDIMENT_TAGLINE,
  HOMINIS_PEDIMENT_TITLE,
  HOMINIS_PILLARS,
} from "@/lib/synaptic/hominis-cathedral-content"

const VW = 720
const VH = 720

export function HominisCathedral() {
  const [hover, setHover] = useState<string | null>(null)

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
          aria-label={HOMINIS_CATHEDRAL_ARIA_LABEL}
        >
          <defs>
            <linearGradient id="syn-hom-marble" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5e8cc" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#c8b48a" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="syn-hom-base" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a4a8a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0d1027" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* sky / starfield */}
          {Array.from({ length: 28 }).map((_, i) => {
            const x = ((i * 131 + 19) % VW)
            const y = ((i * 71 + 13) % 220) + 30
            return (
              <circle
                key={`star-${i}`}
                cx={x}
                cy={y}
                r={(i % 5) === 0 ? 1.6 : 1}
                fill="#f5e8cc"
                fillOpacity={0.1 + ((i * 31) % 80) / 800}
              />
            )
          })}

          {/* pediment */}
          <polygon
            points={`${VW / 2},80 ${VW - 60},220 60,220`}
            fill="url(#syn-hom-marble)"
            stroke="rgba(90,70,48,0.6)"
            strokeWidth={1.2}
          />
          <text
            x={VW / 2}
            y={180}
            textAnchor="middle"
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={48}
            fill="#5a4a8a"
            style={{ letterSpacing: "0.08em" }}
          >
            {HOMINIS_PEDIMENT_TITLE}
          </text>
          <text
            x={VW / 2}
            y={208}
            textAnchor="middle"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={10}
            letterSpacing={2.5}
            fill="rgba(90,70,48,0.85)"
          >
            {HOMINIS_PEDIMENT_TAGLINE}
          </text>

          {/* architrave */}
          <rect
            x={50}
            y={220}
            width={VW - 100}
            height={32}
            fill="url(#syn-hom-marble)"
            stroke="rgba(90,70,48,0.55)"
            strokeWidth={1}
          />

          {/* three pillars */}
          {HOMINIS_PILLARS.map((p, i) => {
            const cellW = (VW - 100) / 3
            const x = 50 + i * cellW + cellW / 2
            const top = 252
            const baseY = 560
            const shaftHalf = 38
            const isHover = hover === p.id

            return (
              <g
                key={p.id}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              >
                {/* glow when hovered */}
                {isHover ? (
                  <rect
                    x={x - shaftHalf - 14}
                    y={top - 6}
                    width={(shaftHalf + 14) * 2}
                    height={baseY - top + 12}
                    rx={6}
                    fill={p.color}
                    fillOpacity={0.18}
                  />
                ) : null}

                {/* capital */}
                <rect
                  x={x - shaftHalf - 8}
                  y={top}
                  width={(shaftHalf + 8) * 2}
                  height={24}
                  fill="url(#syn-hom-marble)"
                  stroke="rgba(90,70,48,0.55)"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={top + 18}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={20}
                  fill={isHover ? p.color : "#5a4a8a"}
                  style={{ letterSpacing: "0.06em" }}
                >
                  {p.capital}
                </text>

                {/* shaft with fluting */}
                <rect
                  x={x - shaftHalf}
                  y={top + 24}
                  width={shaftHalf * 2}
                  height={baseY - top - 24}
                  fill="url(#syn-hom-marble)"
                  stroke="rgba(90,70,48,0.55)"
                  strokeWidth={1}
                />
                {Array.from({ length: 5 }).map((_, fi) => {
                  const fx = x - shaftHalf + 8 + fi * 15
                  return (
                    <line
                      key={`flute-${i}-${fi}`}
                      x1={fx}
                      x2={fx}
                      y1={top + 28}
                      y2={baseY - 4}
                      stroke="rgba(90,70,48,0.25)"
                      strokeWidth={1}
                    />
                  )
                })}

                {/* base */}
                <rect
                  x={x - shaftHalf - 6}
                  y={baseY}
                  width={(shaftHalf + 6) * 2}
                  height={20}
                  fill="url(#syn-hom-marble)"
                  stroke="rgba(90,70,48,0.55)"
                  strokeWidth={1}
                />

                {/* pillar label below */}
                <text
                  x={x}
                  y={baseY + 50}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={22}
                  fill={isHover ? p.color : "var(--ink)"}
                  style={{ letterSpacing: "0.04em" }}
                >
                  {p.shaft}
                </text>
              </g>
            )
          })}

          {/* foundation block */}
          <rect
            x={20}
            y={584}
            width={VW - 40}
            height={50}
            fill="url(#syn-hom-base)"
            stroke="rgba(200,184,255,0.45)"
            strokeWidth={1}
            rx={4}
          />
          <text
            x={VW / 2}
            y={616}
            textAnchor="middle"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            letterSpacing={4}
            fill="#f5e8cc"
          >
            {HOMINIS_FOUNDATION_LABEL}
          </text>

          {/* ground */}
          <rect x={0} y={634} width={VW} height={86} fill="#0a0b22" />
          {Array.from({ length: 4 }).map((_, i) => (
            <line
              key={`g-${i}`}
              x1={0}
              x2={VW}
              y1={650 + i * 14}
              y2={650 + i * 14}
              stroke="rgba(200,184,255,0.07)"
              strokeWidth={1}
            />
          ))}
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
          {hover ? (
            (() => {
              const p = HOMINIS_PILLARS.find((x) => x.id === hover)
              if (!p) return null
              return (
                <>
                  <span
                    className="syn-small-caps"
                    style={{ color: p.color, marginRight: "0.75rem" }}
                  >
                    {p.shaft}
                  </span>
                  <span style={{ color: "var(--ink)" }}>{p.body}</span>
                </>
              )
            })()
          ) : (
            <span style={{ color: "var(--ink-dim)" }}>
              {HOMINIS_CATHEDRAL_DEFAULT_HINT}
            </span>
          )}
        </div>
      </div>
    </figure>
  )
}
