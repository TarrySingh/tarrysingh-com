"use client"

import { useState } from "react"
import {
  VISION_HORIZON_ARIA_LABEL,
  VISION_HORIZON_BANNER,
  VISION_HORIZON_FOOTER,
  VISION_HORIZON_KICKER,
  VISION_HORIZON_PANEL_KICKER_PREFIX,
  VISION_HORIZON_TITLE,
  VISION_WAYPOINTS,
} from "@/lib/synaptic/vision-horizon-content"

const VW = 1400
const VH = 900
const HORIZON_Y = VH * 0.78

export function VisionHorizon() {
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string>("reconfiguration")
  const activeId = hover ?? pinned
  const active =
    VISION_WAYPOINTS.find((w) => w.id === activeId) ?? VISION_WAYPOINTS[1]

  // Build ridge curve through endpoints + waypoints
  const ridgePts = [
    { x: 0, y: HORIZON_Y - VH * 0.05 },
    ...VISION_WAYPOINTS.map((w) => ({
      x: w.x * VW,
      y: HORIZON_Y - w.height * (VH - HORIZON_Y) - 80,
    })),
    { x: VW, y: HORIZON_Y - VH * 0.04 },
  ]
  const ridgePath = ridgePts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const ridgeFill = ridgePath + ` L ${VW} ${HORIZON_Y} L 0 ${HORIZON_Y} Z`

  // Mid-range mountain layer
  const midPts = [
    { x: 0, y: HORIZON_Y - 20 },
    { x: VW * 0.12, y: HORIZON_Y - 60 },
    { x: VW * 0.25, y: HORIZON_Y - 30 },
    { x: VW * 0.38, y: HORIZON_Y - 100 },
    { x: VW * 0.52, y: HORIZON_Y - 50 },
    { x: VW * 0.66, y: HORIZON_Y - 110 },
    { x: VW * 0.8, y: HORIZON_Y - 40 },
    { x: VW * 0.92, y: HORIZON_Y - 70 },
    { x: VW, y: HORIZON_Y - 20 },
  ]
  const midPath = midPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const midFill = midPath + ` L ${VW} ${HORIZON_Y} L 0 ${HORIZON_Y} Z`

  // Far mountain layer
  const farPts = Array.from({ length: 24 }).map((_, i) => ({
    x: (i / 23) * VW,
    y: HORIZON_Y - 80 - Math.sin(i * 0.7) * 30 - Math.cos(i * 0.31) * 20,
  }))
  const farPath = farPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const farFill = farPath + ` L ${VW} ${HORIZON_Y} L 0 ${HORIZON_Y} Z`

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
          aria-label={VISION_HORIZON_ARIA_LABEL}
        >
          <defs>
            <linearGradient id="syn-vh-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16183a" />
              <stop offset="40%" stopColor="#1a205a" />
              <stop offset="80%" stopColor="#3a2a6a" />
              <stop offset="100%" stopColor="#0e1133" />
            </linearGradient>
            <linearGradient id="syn-vh-far" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a2a6a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0e1133" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="syn-vh-mid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a4a8a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="syn-vh-near" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7a6aaa" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id="syn-vh-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd596" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#ffd596" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="syn-vh-moon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f5e8cc" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f5e8cc" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* sky */}
          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-vh-sky)" />

          {/* studio header */}
          <text
            x={60}
            y={42}
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={14}
            letterSpacing={4}
            fill="rgba(220,200,160,0.85)"
          >
            {VISION_HORIZON_KICKER}
          </text>
          <text
            x={60}
            y={76}
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={36}
            fill="var(--ink)"
            letterSpacing={2}
          >
            {VISION_HORIZON_TITLE}
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
            {VISION_HORIZON_BANNER}
          </text>

          {/* distant moon / glow above the central peak */}
          <circle
            cx={VISION_WAYPOINTS[1].x * VW}
            cy={HORIZON_Y - VISION_WAYPOINTS[1].height * (VH - HORIZON_Y) - 200}
            r={260}
            fill="url(#syn-vh-moon)"
            opacity={0.35}
          />

          {/* dense starfield */}
          {Array.from({ length: 90 }).map((_, i) => {
            const x = (i * 137 + 41) % VW
            const y = ((i * 71 + 9) % (HORIZON_Y - 100)) * 0.85 + 100
            const r = (i % 7) === 0 ? 2 : (i % 3) === 0 ? 1.4 : 1
            return (
              <circle
                key={`star-${i}`}
                cx={x}
                cy={y}
                r={r}
                fill="#f5e8cc"
                fillOpacity={0.08 + ((i * 31) % 100) / 600}
              />
            )
          })}

          {/* far mountain layer */}
          <path d={farFill} fill="url(#syn-vh-far)" opacity={0.7} />
          <path d={farPath} fill="none" stroke="rgba(200,184,255,0.35)" strokeWidth={0.8} />

          {/* mid mountain layer */}
          <path d={midFill} fill="url(#syn-vh-mid)" opacity={0.85} />
          <path d={midPath} fill="none" stroke="rgba(200,184,255,0.45)" strokeWidth={1} />

          {/* near ridge (waypoint peaks) */}
          <path d={ridgeFill} fill="url(#syn-vh-near)" opacity={0.95} />
          <path d={ridgePath} fill="none" stroke="#c8b8ff" strokeOpacity={0.7} strokeWidth={2} />

          {/* horizon hairline */}
          <line
            x1={0}
            x2={VW}
            y1={HORIZON_Y}
            y2={HORIZON_Y}
            stroke="#c8b8ff"
            strokeOpacity={0.5}
            strokeWidth={1.2}
          />

          {/* waypoint peaks */}
          {VISION_WAYPOINTS.map((w) => {
            const peakX = w.x * VW
            const peakY = HORIZON_Y - w.height * (VH - HORIZON_Y) - 80
            const isActive = activeId === w.id
            return (
              <g
                key={w.id}
                onMouseEnter={() => setHover(w.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setPinned(w.id)}
                style={{ cursor: "pointer" }}
              >
                {/* generous hit zone */}
                <rect
                  x={peakX - 240}
                  y={peakY - 60}
                  width={480}
                  height={HORIZON_Y - peakY + 80}
                  fill="transparent"
                />
                {/* glow */}
                <circle
                  cx={peakX}
                  cy={peakY}
                  r={180}
                  fill="url(#syn-vh-glow)"
                  opacity={isActive ? 1 : 0.32}
                />
                {/* plumb line to horizon */}
                <line
                  x1={peakX}
                  x2={peakX}
                  y1={peakY + 12}
                  y2={HORIZON_Y - 6}
                  stroke={w.color}
                  strokeOpacity={isActive ? 0.95 : 0.45}
                  strokeWidth={isActive ? 1.6 : 1}
                  strokeDasharray={isActive ? "0" : "5 4"}
                />
                {/* peak crown — small triangle marker on the ridge */}
                <polygon
                  points={`${peakX},${peakY - 14} ${peakX - 10},${peakY + 2} ${peakX + 10},${peakY + 2}`}
                  fill={w.color}
                  opacity={isActive ? 1 : 0.85}
                />
                {/* peak disc */}
                <circle
                  cx={peakX}
                  cy={peakY}
                  r={isActive ? 18 : 12}
                  fill={w.color}
                  stroke="#0d1027"
                  strokeWidth={2.5}
                />
                <text
                  x={peakX}
                  y={peakY + 5}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={isActive ? 16 : 12}
                  fill="#0d1027"
                  letterSpacing={1}
                >
                  {w.numeral}
                </text>
                {/* label above */}
                <text
                  x={peakX}
                  y={peakY - 44}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={36}
                  fill={isActive ? "#ffd596" : "var(--ink)"}
                  letterSpacing={1}
                >
                  {w.label}
                </text>
                {/* horizon marker */}
                <text
                  x={peakX}
                  y={HORIZON_Y + 36}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={14}
                  letterSpacing={3}
                  fill={isActive ? "var(--ink)" : "rgba(220,200,160,0.7)"}
                >
                  {String(VISION_WAYPOINTS.indexOf(w) + 1).padStart(2, "0")} ·{" "}
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
            opacity={0.6}
          />
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={`ground-${i}`}
              x1={0}
              x2={VW}
              y1={HORIZON_Y + 60 + i * 12}
              y2={HORIZON_Y + 60 + i * 12}
              stroke="rgba(200,184,255,0.05)"
              strokeWidth={1}
            />
          ))}

          {/* active waypoint detail panel at bottom */}
          {(() => {
            const PANEL_X = 60
            const PANEL_W = VW - 2 * PANEL_X
            const PANEL_H = 170
            const INNER_PAD = 32
            const INNER_W = PANEL_W - 2 * INNER_PAD
            const PANEL_Y = VH - PANEL_H - 24
            return (
              <g transform={`translate(${PANEL_X}, ${PANEL_Y})`}>
                <rect
                  x={0}
                  y={0}
                  width={PANEL_W}
                  height={PANEL_H}
                  rx={10}
                  fill="rgba(13,16,39,0.85)"
                  stroke={active.color}
                  strokeOpacity={0.55}
                  strokeWidth={1.2}
                />
                <text
                  x={INNER_PAD}
                  y={30}
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={12}
                  letterSpacing={3}
                  fill="rgba(220,200,160,0.65)"
                >
                  {VISION_HORIZON_PANEL_KICKER_PREFIX} · {active.numeral}
                </text>
                <text
                  x={INNER_PAD}
                  y={68}
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={28}
                  fill={active.color}
                  letterSpacing={1}
                >
                  {active.label}
                </text>
                <foreignObject
                  x={INNER_PAD}
                  y={86}
                  width={INNER_W}
                  height={PANEL_H - 100}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                      fontSize: "15px",
                      lineHeight: 1.55,
                      color: "var(--ink-cool)",
                      wordWrap: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {active.body}
                  </div>
                </foreignObject>
              </g>
            )
          })()}
        </svg>

        <div
          className="border-t px-6 py-4"
          style={{
            borderColor: "rgba(200,180,255,0.16)",
            color: "var(--ink-cool)",
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            fontStyle: "italic",
            fontSize: "0.98rem",
            lineHeight: 1.5,
          }}
        >
          {VISION_HORIZON_FOOTER}
        </div>
      </div>
    </figure>
  )
}
