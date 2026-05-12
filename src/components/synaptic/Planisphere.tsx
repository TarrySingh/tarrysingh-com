"use client"

import { useState } from "react"
import {
  CX,
  CY,
  NODES,
  OUTER_R,
  RINGS,
  SECTORS,
  VIEW,
  wedgePath,
} from "@/lib/synaptic/planisphere-data"

type PlanisphereProps = {
  initialSec?: number
  className?: string
  onSectorChange?: (sec: number) => void
}

export function Planisphere({
  initialSec = 0,
  className = "",
  onSectorChange,
}: PlanisphereProps) {
  const [activeSec, setActiveSec] = useState(initialSec)
  const [hoverSec, setHoverSec] = useState<number | null>(null)

  const handleSelect = (sec: number) => {
    setActiveSec(sec)
    onSectorChange?.(sec)
  }

  // active sectors form a fan of 3 around the chosen centre
  const activeSet = new Set<number>()
  for (const d of [-1, 0, 1]) {
    activeSet.add(((activeSec + d) % 12 + 12) % 12)
  }

  // ribbon target — 40 % of outer radius along the active sector midline
  const aMid = ((activeSec * 30 - 90) * Math.PI) / 180
  const batonTip = {
    x: CX + OUTER_R * 0.4 * Math.cos(aMid),
    y: CY + OUTER_R * 0.4 * Math.sin(aMid),
  }

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className={`block h-auto w-full ${className}`}
      role="img"
      aria-label="SYMPHONY planisphere — four concentric layers (rationale, historical, behavioural, structural) crossed with twelve engineering-task sectors. The violet task baton activates a three-sector fan; nodes in the fan brighten and a filament threads through the four layers."
    >
      <defs>
        <radialGradient id="syn-planisphere-centre" cx="50%" cy="50%" r="35%">
          <stop offset="0%" stopColor="#c8b8ff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#a698d4" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#5a4a8a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="syn-planisphere-fan" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#ffd596" stopOpacity="0.42" />
          <stop offset="55%" stopColor="#c98e4f" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#0e1133" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* atmospheric bloom over the active fan */}
      {[...activeSet].map((sec) => (
        <path
          key={`bloom-${sec}`}
          d={wedgePath(sec, 0, OUTER_R + 10)}
          fill="url(#syn-planisphere-fan)"
          opacity={0.85}
        />
      ))}

      {/* four concentric ring backgrounds */}
      {RINGS.map((ring, ri) => {
        const rIn = ring.rIn * OUTER_R
        const rOut = ring.rOut * OUTER_R
        return (
          <g key={`ring-${ri}`}>
            <circle
              cx={CX}
              cy={CY}
              r={rOut}
              fill="none"
              stroke={ring.color}
              strokeOpacity={0.45}
              strokeWidth={1}
            />
            <circle
              cx={CX}
              cy={CY}
              r={rIn}
              fill="none"
              stroke={ring.color}
              strokeOpacity={0.3}
              strokeWidth={1}
            />
          </g>
        )
      })}

      {/* twelve sector wedges as interactive click and hover targets */}
      {Array.from({ length: 12 }).map((_, sec) => (
        <g
          key={`sec-${sec}`}
          className="syn-sector-target"
          onClick={() => handleSelect(sec)}
          onMouseEnter={() => setHoverSec(sec)}
          onMouseLeave={() => setHoverSec(null)}
        >
          <path
            d={wedgePath(sec, RINGS[0].rIn * OUTER_R, OUTER_R)}
            fill={
              hoverSec === sec
                ? "rgba(200,184,255,0.06)"
                : "transparent"
            }
            stroke="rgba(220,200,160,0.10)"
            strokeWidth={0.5}
          />
        </g>
      ))}

      {/* twelve radial dividers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const ang = ((i * 30 - 90 - 15) * Math.PI) / 180
        const r1 = RINGS[0].rIn * OUTER_R * 0.85
        const r2 = OUTER_R
        return (
          <line
            key={`div-${i}`}
            x1={CX + r1 * Math.cos(ang)}
            y1={CY + r1 * Math.sin(ang)}
            x2={CX + r2 * Math.cos(ang)}
            y2={CY + r2 * Math.sin(ang)}
            stroke="rgba(220,200,160,0.18)"
            strokeWidth={0.6}
          />
        )
      })}

      {/* outer perimeter and tick marks */}
      <circle
        cx={CX}
        cy={CY}
        r={OUTER_R}
        fill="none"
        stroke="rgba(220,200,160,0.7)"
        strokeWidth={1}
      />
      <circle
        cx={CX}
        cy={CY}
        r={OUTER_R + 8}
        fill="none"
        stroke="rgba(220,200,160,0.35)"
        strokeWidth={0.7}
      />
      {Array.from({ length: 360 }).map((_, i) => {
        const ang = ((i - 90) * Math.PI) / 180
        const isLong = i % 30 === 0
        const isMed = i % 5 === 0 && !isLong
        const r1 = OUTER_R
        const r2 = OUTER_R - (isLong ? 16 : isMed ? 9 : 4)
        return (
          <line
            key={`tk-${i}`}
            x1={CX + r1 * Math.cos(ang)}
            y1={CY + r1 * Math.sin(ang)}
            x2={CX + r2 * Math.cos(ang)}
            y2={CY + r2 * Math.sin(ang)}
            stroke={
              isLong
                ? "rgba(245,232,204,0.85)"
                : isMed
                  ? "rgba(220,200,160,0.55)"
                  : "rgba(170,160,130,0.35)"
            }
            strokeWidth={isLong ? 1 : 0.6}
          />
        )
      })}

      {/* bearing numbers around the perimeter */}
      {Array.from({ length: 12 }).map((_, i) => {
        const ang = ((i * 30 - 90) * Math.PI) / 180
        const r = OUTER_R + 22
        return (
          <text
            key={`bn-${i}`}
            x={CX + r * Math.cos(ang)}
            y={CY + r * Math.sin(ang) + 5}
            textAnchor="middle"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            fill="rgba(220,200,160,0.85)"
          >
            {String(i * 30).padStart(3, "0")}
          </text>
        )
      })}

      {/* sector task labels just inside the outer ring */}
      {SECTORS.map((s, sec) => {
        const angMid = ((sec * 30 - 90) * Math.PI) / 180
        const r = OUTER_R - 26
        const isActive = activeSet.has(sec)
        const isPrimary = sec === activeSec
        return (
          <text
            key={`sl-${sec}`}
            x={CX + r * Math.cos(angMid)}
            y={CY + r * Math.sin(angMid) + 4}
            textAnchor="middle"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={9}
            letterSpacing={1}
            fill={isPrimary ? "#ffd596" : isActive ? "#f4c482" : "#f5e8cc"}
            opacity={isActive ? 1 : 0.78}
          >
            {s.task}
          </text>
        )
      })}

      {/* nodes — dim outside the fan, glowing inside */}
      {NODES.map((n, idx) => {
        const isActive = activeSet.has(n.sectorIdx)
        const ring = RINGS[n.ringIdx]
        const isPrimary = n.sectorIdx === activeSec
        if (!isActive) {
          return (
            <circle
              key={idx}
              cx={n.x}
              cy={n.y}
              r={1.8}
              fill={ring.color}
              fillOpacity={0.55}
            />
          )
        }
        const baseR = isPrimary ? 3.2 : 2.4
        return (
          <g key={idx}>
            {isPrimary ? (
              <circle
                cx={n.x}
                cy={n.y}
                r={baseR * 2.5}
                fill="#ffd596"
                fillOpacity={0.25}
              />
            ) : null}
            <circle
              cx={n.x}
              cy={n.y}
              r={baseR * 1.7}
              fill="#f4c482"
              fillOpacity={0.55}
            />
            <circle cx={n.x} cy={n.y} r={baseR} fill="#ffe0a4" />
          </g>
        )
      })}

      {/* cross-ring filaments within the active fan */}
      {[...activeSet].map((sec) => {
        const aMidSec = sec * 30 - 90
        const picks: { x: number; y: number }[] = []
        for (let ri = 0; ri < 4; ri += 1) {
          const candidates = NODES.filter(
            (n) => n.ringIdx === ri && n.sectorIdx === sec,
          )
          if (candidates.length === 0) continue
          let best = candidates[0]
          let bestScore = Math.abs(best.ang - aMidSec)
          for (const c of candidates) {
            const sc = Math.abs(c.ang - aMidSec)
            if (sc < bestScore) {
              best = c
              bestScore = sc
            }
          }
          picks.push({ x: best.x, y: best.y })
        }
        if (picks.length < 2) return null
        const d = picks
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ")
        return (
          <path
            key={`fil-${sec}`}
            d={d}
            fill="none"
            stroke="#ffd596"
            strokeOpacity={0.7}
            strokeWidth={1}
            strokeDasharray="3 2"
            className="syn-anim-fil"
          />
        )
      })}

      {/* baton ribbon from token side into the centre */}
      <path
        d={`M ${CX} ${CY - OUTER_R - 60} Q ${CX + 30} ${CY - OUTER_R / 2} ${batonTip.x} ${batonTip.y}`}
        fill="none"
        stroke="#c8b8ff"
        strokeOpacity={0.55}
        strokeWidth={3}
        strokeDasharray="6 5"
        className="syn-anim-ribbon"
      />

      {/* baton arrow into the centre */}
      <line
        x1={CX}
        y1={CY}
        x2={batonTip.x}
        y2={batonTip.y}
        stroke="#c8b8ff"
        strokeOpacity={0.85}
        strokeWidth={1.5}
      />
      <circle cx={batonTip.x} cy={batonTip.y} r={4} fill="#c8b8ff" />

      {/* centre conductor sphere — pulses via syn-anim-baton */}
      <g className="syn-anim-baton">
        <circle cx={CX} cy={CY} r={40} fill="url(#syn-planisphere-centre)" />
        <circle cx={CX} cy={CY} r={22} fill="#5a4a8a" />
        <circle cx={CX} cy={CY} r={17} fill="#a698d4" />
        <circle cx={CX} cy={CY} r={11} fill="#f5e8cc" />
        <line
          x1={CX - 20}
          y1={CY}
          x2={CX + 20}
          y2={CY}
          stroke="#5a4a8a"
          strokeWidth={1.5}
        />
        <line
          x1={CX}
          y1={CY - 20}
          x2={CX}
          y2={CY + 20}
          stroke="#5a4a8a"
          strokeWidth={1.5}
        />
        <circle cx={CX} cy={CY} r={3} fill="#5a4a8a" />
      </g>

      {/* sweep pulse at the primary sector's mid-ring position */}
      {(() => {
        const aMidPrimary = ((activeSec * 30 - 90) * Math.PI) / 180
        const rMid = ((RINGS[2].rIn + RINGS[2].rOut) / 2) * OUTER_R
        const x = CX + rMid * Math.cos(aMidPrimary)
        const y = CY + rMid * Math.sin(aMidPrimary)
        return (
          <circle
            cx={x}
            cy={y}
            r={6}
            fill="none"
            stroke="#ffd596"
            strokeWidth={1}
            className="syn-anim-sweep"
          />
        )
      })()}
    </svg>
  )
}
