"use client"

import { useState } from "react"
import {
  CHIP_ANNOTATIONS,
  CHIP_CB0,
  CHIP_CB1,
  CHIP_INTENSITIES,
  CHIP_N,
  CHIP_STEP,
  type ChipPhase,
} from "@/lib/synaptic/chipplate-data"

type ChipPlateProps = {
  initialId?: string
  initialPhase?: ChipPhase
  className?: string
}

export function ChipPlate({
  initialId = "03",
  initialPhase = "awake",
  className = "",
}: ChipPlateProps) {
  const [activeId, setActiveId] = useState<string | null>(initialId)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [phase, setPhase] = useState<ChipPhase>(initialPhase)

  const active =
    CHIP_ANNOTATIONS.find((a) => a.id === (hoverId ?? activeId)) ?? null

  return (
    <div className={`mx-auto w-full max-w-[820px] ${className}`}>
      {/* phase toggle bar */}
      <div
        className="mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3"
        style={{
          borderColor: "rgba(232,184,122,0.18)",
          background:
            "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <span className="syn-small-caps" style={{ color: "var(--ink-dim)" }}>
          Phase
        </span>
        <div className="flex flex-1 items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPhase("awake")}
            className="syn-mono rounded-full border px-4 py-1 transition-colors"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "var(--track-mono)",
              borderColor: phase === "awake"
                ? "var(--memphis-amber-hi)"
                : "rgba(255,255,255,0.15)",
              background:
                phase === "awake" ? "var(--memphis-amber)" : "transparent",
              color: phase === "awake" ? "#0c1828" : "var(--ink)",
            }}
          >
            Awake · event-driven
          </button>
          <button
            type="button"
            onClick={() => setPhase("sleep")}
            className="syn-mono rounded-full border px-4 py-1 transition-colors"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "var(--track-mono)",
              borderColor: phase === "sleep"
                ? "var(--memphis-rose)"
                : "rgba(255,255,255,0.15)",
              background:
                phase === "sleep" ? "var(--memphis-rose)" : "transparent",
              color: phase === "sleep" ? "#0c1828" : "var(--ink)",
            }}
          >
            Sleep · replay
          </button>
        </div>
      </div>

      <svg
        viewBox="0 0 1000 1000"
        className="block h-auto w-full"
        role="img"
        aria-label="MEMPHIS chip plate — a ceramic-substrate hippocampal-memristive die. A 22×22 memristor crossbar with a CA3↔CA1 module at its centre; amber on the warm flank, rose on the cool flank; six annotation anchors naming the architectural elements."
      >
        <defs>
          <radialGradient id="syn-chip-halo-teal" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#6cb6c4" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#3e7b8c" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0c1828" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="syn-chip-halo-amber" cx="50%" cy="50%" r="30%">
            <stop offset="0%" stopColor="#ffd296" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#c98e4f" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0c1828" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="syn-chip-ceramic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8d6ae" />
            <stop offset="100%" stopColor="#c8b48a" />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={1000} height={1000} fill="url(#syn-chip-halo-teal)" />

        <rect
          x={110}
          y={110}
          width={780}
          height={780}
          rx={24}
          fill="url(#syn-chip-ceramic)"
          stroke="#a89676"
          strokeWidth={2}
        />

        <rect
          x={126}
          y={126}
          width={748}
          height={748}
          rx={18}
          fill="none"
          stroke="rgba(140,118,82,0.6)"
          strokeWidth={1}
        />

        <text
          x={160}
          y={158}
          fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
          fontSize={11}
          fill="rgba(90,70,48,0.9)"
        >
          MEMPHIS  Rev.A  ·  NMR-01
        </text>
        <text
          x={840}
          y={158}
          fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
          fontSize={11}
          fill="rgba(90,70,48,0.9)"
          textAnchor="end"
        >
          v · ii
        </text>
        <text
          x={160}
          y={852}
          fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
          fontSize={11}
          fill="rgba(90,70,48,0.9)"
        >
          LOT  2026 / IV
        </text>
        <text
          x={840}
          y={852}
          fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
          fontSize={11}
          fill="rgba(90,70,48,0.9)"
          textAnchor="end"
        >
          CA3·CA1  HIPPOCAMPAL CORE
        </text>

        {Array.from({ length: CHIP_N }).map((_, i) => {
          const tt = (i + 0.5) / CHIP_N
          const x = 110 + tt * 780
          const y = 110 + tt * 780
          return (
            <g key={`pads-${i}`}>
              <rect x={x - 8} y={116} width={16} height={8} fill="#97805c" stroke="#5a4a32" strokeWidth={0.6} />
              <rect x={x - 8} y={876} width={16} height={8} fill="#97805c" stroke="#5a4a32" strokeWidth={0.6} />
              <rect x={116} y={y - 5} width={8} height={10} fill="#97805c" stroke="#5a4a32" strokeWidth={0.6} />
              <rect x={876} y={y - 5} width={8} height={10} fill="#97805c" stroke="#5a4a32" strokeWidth={0.6} />
            </g>
          )
        })}

        <rect x={200} y={200} width={600} height={600} rx={10} fill="#102030" stroke="#2c4458" strokeWidth={2} />
        <rect x={210} y={210} width={580} height={580} rx={8} fill="none" stroke="rgba(60,90,118,0.8)" strokeWidth={1} />

        <rect
          x={CHIP_CB0 - 18}
          y={CHIP_CB0 - 18}
          width={CHIP_CB1 - CHIP_CB0 + 36}
          height={CHIP_CB1 - CHIP_CB0 + 36}
          rx={6}
          fill="#101c2c"
          stroke="rgba(60,94,120,0.9)"
          strokeWidth={1}
        />

        {Array.from({ length: CHIP_N }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={CHIP_CB0 + i * CHIP_STEP}
            y1={CHIP_CB0}
            x2={CHIP_CB0 + i * CHIP_STEP}
            y2={CHIP_CB1}
            stroke="#468ca0"
            strokeOpacity={0.75}
            strokeWidth={1}
          />
        ))}

        {Array.from({ length: CHIP_N }).map((_, j) => (
          <line
            key={`h-${j}`}
            x1={CHIP_CB0}
            y1={CHIP_CB0 + j * CHIP_STEP}
            x2={CHIP_CB1}
            y2={CHIP_CB0 + j * CHIP_STEP}
            stroke="#b89256"
            strokeOpacity={0.88}
            strokeWidth={1}
          />
        ))}

        <circle
          cx={500}
          cy={500}
          r={120}
          fill="url(#syn-chip-halo-amber)"
          className={phase === "sleep" ? "syn-anim-baton" : ""}
        />

        {CHIP_INTENSITIES.map((row, j) =>
          row.map((v, i) => {
            const x = CHIP_CB0 + i * CHIP_STEP
            const y = CHIP_CB0 + j * CHIP_STEP
            const r = Math.round(232 * (1 - v.warmT) + 229 * v.warmT)
            const g = Math.round(184 * (1 - v.warmT) + 168 * v.warmT)
            const b = Math.round(122 * (1 - v.warmT) + 150 * v.warmT)
            if (v.inModule) {
              const rad = 2 + v.base * 2.8
              return (
                <g key={`n-${i}-${j}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={rad * 2}
                    fill={`rgb(${r},${g},${b})`}
                    opacity={0.14 + v.base * 0.18}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={rad}
                    fill={`rgb(${r},${g},${b})`}
                    opacity={0.75 + v.base * 0.25}
                    className={phase === "sleep" ? "syn-anim-cell-sleep" : "syn-anim-cell-awake"}
                    style={{ animationDelay: `${((i + j * 7) % 22) * 0.08}s` }}
                  />
                </g>
              )
            }
            const rad = 1.5 + v.base * 1.4
            const rr = Math.round(70 + 140 * v.base)
            const gg = Math.round(100 + 80 * v.base)
            const bb = Math.round(120 + 40 * v.base)
            return (
              <circle
                key={`n-${i}-${j}`}
                cx={x}
                cy={y}
                r={rad}
                fill={`rgb(${rr},${gg},${bb})`}
                opacity={0.55 + v.base * 0.35}
              />
            )
          }),
        )}

        <rect
          x={500 - 100}
          y={500 - 100}
          width={200}
          height={200}
          fill="none"
          stroke="#e8b87a"
          strokeOpacity={0.65}
          strokeWidth={1}
        />

        <g>
          <rect
            x={500 - 82}
            y={370}
            width={164}
            height={26}
            rx={2}
            fill="#0d1a2a"
            stroke="#e8b87a"
            strokeOpacity={0.7}
            strokeWidth={1}
          />
          <text
            x={500}
            y={388}
            textAnchor="middle"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            letterSpacing={2}
            fill="#e8b87a"
          >
            CA3 ↔ CA1  MODULE
          </text>
        </g>

        {[
          [230, 230],
          [770, 230],
          [230, 770],
          [770, 770],
        ].map(([px, py], i) => (
          <g
            key={`sig-${i}`}
            stroke="#c98e4f"
            strokeOpacity={0.8}
            strokeWidth={1}
            fill="none"
          >
            <line x1={px - 10} y1={py} x2={px + 10} y2={py} />
            <line x1={px} y1={py - 10} x2={px} y2={py + 10} />
            <circle cx={px} cy={py} r={3} />
          </g>
        ))}

        {/* interactive hotspots */}
        {CHIP_ANNOTATIONS.map((a) => {
          const isActive = activeId === a.id || hoverId === a.id
          return (
            <g
              key={a.id}
              className="syn-sector-target"
              onMouseEnter={() => setHoverId(a.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() =>
                setActiveId((cur) => (cur === a.id ? null : a.id))
              }
            >
              {isActive ? (
                <circle
                  cx={a.anchor.x}
                  cy={a.anchor.y}
                  r={10}
                  fill="none"
                  stroke={a.color}
                  strokeOpacity={0.9}
                  strokeWidth={1.5}
                  className="syn-anim-sweep"
                />
              ) : null}
              <circle
                cx={a.anchor.x}
                cy={a.anchor.y}
                r={isActive ? 8 : 6}
                fill={isActive ? "#ffd296" : "#e8b87a"}
                stroke="#c98e4f"
                strokeWidth={1.5}
              />
              <text
                x={a.anchor.x + 12}
                y={a.anchor.y - 6}
                fontFamily="var(--font-display), Gloock, serif"
                fontSize={14}
                fill={isActive ? "#ffe0a4" : "#f6ead0"}
              >
                {a.id}
              </text>
            </g>
          )
        })}
      </svg>

      <p
        className="syn-small-caps mt-3 text-center"
        style={{ color: "var(--ink-dim)" }}
      >
        Click any numbered anchor to inspect its role
      </p>

      {/* active annotation panel */}
      {active ? (
        <div
          className="mt-6 rounded-2xl border p-6"
          style={{
            borderColor: "rgba(255,210,150,0.35)",
            background:
              "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: "0 0 0 1px rgba(255,210,150,0.18), 0 12px 40px rgba(0,0,0,0.45)",
          }}
        >
          <div className="flex items-baseline gap-4">
            <span
              className="syn-display"
              style={{
                fontSize: "2.5rem",
                color: active.color,
                lineHeight: 1,
              }}
            >
              {active.id}
            </span>
            <div>
              <h4
                className="syn-display"
                style={{
                  fontSize: "1.2rem",
                  color: "var(--ink)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {active.title}
              </h4>
              <p
                className="syn-italic-caption"
                style={{ fontSize: "0.9rem", marginTop: "0.15rem" }}
              >
                {active.subtitle}
              </p>
            </div>
          </div>
          <p
            className="mt-3"
            style={{
              color: "var(--ink-cool)",
              fontSize: "0.95rem",
              lineHeight: 1.55,
            }}
          >
            {active.body}
          </p>
        </div>
      ) : null}
    </div>
  )
}
