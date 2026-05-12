"use client"

import { useState } from "react"

type Beat = {
  year: number
  label: string
  detail: string
  weight?: "primary" | "secondary"
}

const BEATS: ReadonlyArray<Beat> = [
  {
    year: 2005,
    label: "Blue Brain begins",
    detail:
      "EPFL launches the Blue Brain Project — the first attempt to reconstruct a cortical column at biological fidelity.",
  },
  {
    year: 2008,
    label: "PhD in computational neuroscience",
    detail:
      "Joins EPFL as a doctoral researcher on the digital reconstruction of microcircuits.",
    weight: "secondary",
  },
  {
    year: 2015,
    label: "Cortical-column reconstruction",
    detail:
      "Co-author on the first complete cortical-microcircuit reconstruction at biological scale — Cell, 2015.",
    weight: "primary",
  },
  {
    year: 2018,
    label: "Independent group",
    detail:
      "Establishes own group on biologically-grounded artificial neural networks.",
    weight: "secondary",
  },
  {
    year: 2022,
    label: "Mei · Muller · Ramaswamy",
    detail:
      "Trends in Neurosciences (2022) — the four-scale neuromodulatory framework that SYMPHONY transposes from continuous perceptual signals to discrete symbolic activations.",
    weight: "primary",
  },
  {
    year: 2024,
    label: "Newcastle chair",
    detail:
      "Takes the chair in Computational Neuroscience at Newcastle University's School of Computing.",
    weight: "secondary",
  },
  {
    year: 2026,
    label: "SYMPHONY · O2 lead",
    detail:
      "Leads Objective O2 — the implementation of the four-scale neuromodulatory mechanism on the substrate produced by O1. M18 decision milestone.",
    weight: "primary",
  },
]

const VW = 900
const VH = 460
const PAD_X = 60
const TRACK_Y = 280

export function RamaswamyPedigree() {
  const [hover, setHover] = useState<number | null>(null)
  const active = hover !== null ? BEATS[hover] : null

  const xForYear = (y: number) =>
    PAD_X + ((y - 2005) / (2026 - 2005)) * (VW - 2 * PAD_X)

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
          aria-label="Ramaswamy / Blue Brain pedigree — a timeline from 2005 to 2026 marking the Blue Brain Project, the 2015 cortical-microcircuit reconstruction, the 2022 Mei, Muller and Ramaswamy four-scale neuromodulation paper, and the 2026 SYMPHONY O2 lead."
        >
          {/* cortical-column glyph (top) */}
          <g transform="translate(60, 30)">
            {Array.from({ length: 6 }).map((_, i) => (
              <rect
                key={`layer-${i}`}
                x={0}
                y={i * 26}
                width={120}
                height={20}
                rx={3}
                fill="rgba(108, 180, 194, 0.12)"
                stroke="rgba(108, 180, 194, 0.42)"
                strokeWidth={0.8}
              />
            ))}
            <text
              x={130}
              y={16}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={10}
              fill="rgba(220,200,160,0.7)"
              letterSpacing={1.5}
            >
              L1
            </text>
            <text
              x={130}
              y={120}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={10}
              fill="rgba(220,200,160,0.7)"
              letterSpacing={1.5}
            >
              L6
            </text>
            <text
              x={0}
              y={170}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={10}
              fill="rgba(220,200,160,0.55)"
              letterSpacing={2}
            >
              CORTICAL COLUMN · L1–L6
            </text>
          </g>

          {/* neuromodulator beams down the right side */}
          <g transform={`translate(${VW - 220}, 30)`}>
            {[
              { y: 0, c: "#f4c482", label: "Ach" },
              { y: 30, c: "#e5a896", label: "DA" },
              { y: 60, c: "#6cb4c2", label: "NE" },
              { y: 90, c: "#a698d4", label: "5-HT" },
            ].map((b) => (
              <g key={b.label}>
                <line
                  x1={0}
                  y1={b.y + 10}
                  x2={180}
                  y2={b.y + 10}
                  stroke={b.c}
                  strokeOpacity={0.45}
                  strokeWidth={1}
                />
                <circle cx={0} cy={b.y + 10} r={3} fill={b.c} />
                <text
                  x={186}
                  y={b.y + 14}
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={10}
                  fill="rgba(220,200,160,0.8)"
                  letterSpacing={1.5}
                >
                  {b.label}
                </text>
              </g>
            ))}
            <text
              x={0}
              y={140}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={10}
              fill="rgba(220,200,160,0.55)"
              letterSpacing={2}
            >
              NEUROMODULATOR BEAMS
            </text>
          </g>

          {/* timeline track */}
          <line
            x1={PAD_X}
            x2={VW - PAD_X}
            y1={TRACK_Y}
            y2={TRACK_Y}
            stroke="rgba(220,200,160,0.4)"
            strokeWidth={1}
          />

          {/* end caps */}
          <text
            x={PAD_X}
            y={TRACK_Y + 26}
            textAnchor="start"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            fill="rgba(220,200,160,0.7)"
            letterSpacing={1.5}
          >
            2005
          </text>
          <text
            x={VW - PAD_X}
            y={TRACK_Y + 26}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            fill="rgba(220,200,160,0.7)"
            letterSpacing={1.5}
          >
            2026
          </text>

          {/* beats */}
          {BEATS.map((b, i) => {
            const x = xForYear(b.year)
            const isHover = hover === i
            const isPrimary = b.weight === "primary"
            const r = isPrimary ? (isHover ? 10 : 7) : isHover ? 7 : 5
            const labelY = i % 2 === 0 ? TRACK_Y - 20 : TRACK_Y + 50
            return (
              <g
                key={`beat-${b.year}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              >
                {/* hit zone */}
                <rect
                  x={x - 40}
                  y={TRACK_Y - 80}
                  width={80}
                  height={160}
                  fill="transparent"
                />
                {/* connector line to label */}
                <line
                  x1={x}
                  y1={TRACK_Y}
                  x2={x}
                  y2={labelY + 6}
                  stroke={isPrimary ? "#ffd596" : "rgba(220,200,160,0.4)"}
                  strokeOpacity={isHover ? 1 : 0.6}
                  strokeWidth={isHover ? 1.4 : 0.8}
                />
                {/* dot */}
                <circle
                  cx={x}
                  cy={TRACK_Y}
                  r={r}
                  fill={isPrimary ? "#ffd596" : "#c8b8ff"}
                  stroke="#0d1027"
                  strokeWidth={2}
                />
                {/* year */}
                <text
                  x={x}
                  y={labelY - 4}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={10}
                  letterSpacing={1}
                  fill={isHover ? "var(--ink)" : "rgba(220,200,160,0.6)"}
                >
                  {b.year}
                </text>
                {/* label */}
                <text
                  x={x}
                  y={labelY + 10}
                  textAnchor="middle"
                  fontFamily={isPrimary ? "var(--font-display), Gloock, serif" : "var(--font-serif), 'IBM Plex Serif', serif"}
                  fontSize={isPrimary ? 13 : 11}
                  fontStyle={isPrimary ? "normal" : "italic"}
                  fill={isHover ? "#ffd596" : isPrimary ? "var(--ink)" : "rgba(220,200,160,0.75)"}
                >
                  {b.label}
                </text>
              </g>
            )
          })}
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
                style={{ color: "var(--symphony-amber-hi)", marginRight: "0.75rem" }}
              >
                {active.year} · {active.label}
              </span>
              <span style={{ color: "var(--ink)" }}>{active.detail}</span>
            </>
          ) : (
            <span style={{ color: "var(--ink-dim)" }}>
              Two decades of biologically-grounded neuroscience, ending in
              SYMPHONY's O2. Hover any beat for the source and the role it
              plays in the proposal. Primary beats — Cell 2015, TINS 2022 —
              are the load-bearing citations.
            </span>
          )}
        </div>
      </div>
    </figure>
  )
}
