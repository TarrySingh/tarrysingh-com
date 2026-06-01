"use client"

import { useState } from "react"
import {
  SUBSTRATE_ARIA_LABEL,
  SUBSTRATE_PLATE_KICKER,
  SUBSTRATE_TITLE,
  SUBSTRATE_SUBTITLE,
  SUBSTRATE_CITATION,
  SUBSTRATE_FOOTER,
  SUBSTRATE_LAYERS as LAYERS,
  SUBSTRATE_SCALES as SCALES,
  SUBSTRATE_CELLS as CELLS,
} from "@/lib/synaptic/substrate-scales-content"

type LayerKey = "rationale" | "historical" | "behavioural" | "structural"
type ScaleKey = "hyperparameter" | "plasticity" | "neuronal" | "dendritic"

const VW = 1200
const VH = 820
const PAD_TOP = 200
const PAD_BOTTOM = 60
const PAD_LEFT = 200
const PAD_RIGHT = 360
const GRID_W = VW - PAD_LEFT - PAD_RIGHT
const GRID_H = VH - PAD_TOP - PAD_BOTTOM
const CELL_W = GRID_W / SCALES.length
const CELL_H = GRID_H / LAYERS.length

export function SubstrateScales() {
  const [hover, setHover] = useState<{ layer: LayerKey; scale: ScaleKey } | null>(null)
  const [pinned, setPinned] = useState<{ layer: LayerKey; scale: ScaleKey }>({
    layer: "behavioural",
    scale: "neuronal",
  })
  const sel = hover ?? pinned
  const layerObj = LAYERS.find((l) => l.key === sel.layer)
  const scaleObj = SCALES.find((s) => s.key === sel.scale)
  const cell = CELLS[sel.layer][sel.scale]

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
          aria-label={SUBSTRATE_ARIA_LABEL}
        >
          <defs>
            <radialGradient id="syn-ss-bg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1a2154" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0" />
            </radialGradient>
            {LAYERS.map((l) => (
              <linearGradient key={`grad-${l.key}`} id={`syn-ss-${l.key}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={l.color} stopOpacity="0.85" />
                <stop offset="100%" stopColor={l.color} stopOpacity="0.35" />
              </linearGradient>
            ))}
          </defs>

          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-ss-bg)" />

          {/* studio header */}
          <text
            x={PAD_LEFT}
            y={42}
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={14}
            letterSpacing={4}
            fill="rgba(220,200,160,0.85)"
          >
            {SUBSTRATE_PLATE_KICKER}
          </text>
          <text
            x={PAD_LEFT}
            y={76}
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={32}
            fill="var(--ink)"
            letterSpacing={2}
          >
            {SUBSTRATE_TITLE}
          </text>
          <text
            x={PAD_LEFT}
            y={102}
            fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
            fontStyle="italic"
            fontSize={16}
            fill="var(--symphony-violet-hi)"
          >
            {SUBSTRATE_SUBTITLE}
          </text>
          <line
            x1={PAD_LEFT}
            x2={VW - PAD_RIGHT}
            y1={120}
            y2={120}
            stroke="rgba(220,200,160,0.35)"
            strokeWidth={0.8}
          />
          <text
            x={VW - PAD_RIGHT - 4}
            y={42}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={12}
            letterSpacing={3}
            fill="rgba(220,200,160,0.7)"
          >
            {SUBSTRATE_CITATION}
          </text>

          {/* column headers */}
          {SCALES.map((s, i) => {
            const x = PAD_LEFT + i * CELL_W + CELL_W / 2
            const isActive = sel.scale === s.key
            return (
              <g key={`col-${s.key}`}>
                <text
                  x={x}
                  y={PAD_TOP - 64}
                  textAnchor="middle"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={32}
                  fill={isActive ? "var(--symphony-violet-hi)" : "rgba(220,200,160,0.55)"}
                  letterSpacing={1}
                >
                  {s.symbol}
                </text>
                <text
                  x={x}
                  y={PAD_TOP - 36}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={13}
                  letterSpacing={2.5}
                  fill={isActive ? "var(--ink)" : "rgba(220,200,160,0.8)"}
                >
                  {s.label.toUpperCase()}
                </text>
                <text
                  x={x}
                  y={PAD_TOP - 18}
                  textAnchor="middle"
                  fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
                  fontStyle="italic"
                  fontSize={12}
                  fill="rgba(220,200,160,0.6)"
                >
                  {s.sub}
                </text>
              </g>
            )
          })}

          {/* row headers */}
          {LAYERS.map((l, j) => {
            const y = PAD_TOP + j * CELL_H + CELL_H / 2
            const isActive = sel.layer === l.key
            return (
              <g key={`row-${l.key}`}>
                <rect
                  x={PAD_LEFT - 140}
                  y={y - 36}
                  width={130}
                  height={72}
                  rx={6}
                  fill={isActive ? l.color : "transparent"}
                  fillOpacity={isActive ? 0.15 : 0}
                  stroke={l.color}
                  strokeOpacity={isActive ? 0.6 : 0.2}
                  strokeWidth={1}
                />
                <text
                  x={PAD_LEFT - 130}
                  y={y - 10}
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={32}
                  fill={l.color}
                  letterSpacing={1}
                >
                  {l.numeral}
                </text>
                <text
                  x={PAD_LEFT - 130}
                  y={y + 12}
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={13}
                  letterSpacing={2}
                  fill={isActive ? "var(--ink)" : "rgba(220,200,160,0.85)"}
                >
                  {l.label.toUpperCase()}
                </text>
                <text
                  x={PAD_LEFT - 130}
                  y={y + 28}
                  fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
                  fontStyle="italic"
                  fontSize={11}
                  fill="rgba(220,200,160,0.6)"
                >
                  {l.sub}
                </text>
              </g>
            )
          })}

          {/* matrix cells */}
          {LAYERS.map((l, j) =>
            SCALES.map((s, i) => {
              const x = PAD_LEFT + i * CELL_W
              const y = PAD_TOP + j * CELL_H
              const isHover = sel.layer === l.key && sel.scale === s.key
              const isCross = !isHover && (sel.layer === l.key || sel.scale === s.key)

              // Iconic miniature inside each cell — varies by scale
              const cellCx = x + CELL_W / 2
              const cellCy = y + CELL_H / 2

              return (
                <g
                  key={`cell-${l.key}-${s.key}`}
                  onMouseEnter={() => setHover({ layer: l.key, scale: s.key })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setPinned({ layer: l.key, scale: s.key })}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={x + 4}
                    y={y + 4}
                    width={CELL_W - 8}
                    height={CELL_H - 8}
                    rx={8}
                    fill={`url(#syn-ss-${l.key})`}
                    fillOpacity={isHover ? 0.5 : isCross ? 0.25 : 0.12}
                    stroke={l.color}
                    strokeOpacity={isHover ? 0.95 : isCross ? 0.55 : 0.3}
                    strokeWidth={isHover ? 1.8 : 1}
                  />

                  {/* per-scale iconic glyph */}
                  {s.key === "hyperparameter" ? (
                    <g opacity={isHover ? 1 : 0.6}>
                      {Array.from({ length: 6 }).map((_, k) => (
                        <line
                          key={k}
                          x1={cellCx - 28}
                          y1={cellCy - 24 + k * 10}
                          x2={cellCx + 28}
                          y2={cellCy - 24 + k * 10}
                          stroke={l.color}
                          strokeWidth={k === 3 ? 2.4 : 1}
                          strokeOpacity={k === 3 ? 1 : 0.45}
                        />
                      ))}
                    </g>
                  ) : s.key === "plasticity" ? (
                    <g opacity={isHover ? 1 : 0.65} stroke={l.color} fill="none">
                      {[
                        [-26, -14, 26, 18],
                        [-22, 10, 28, -16],
                        [-30, 4, 30, 4],
                      ].map(([x1, y1, x2, y2], k) => (
                        <path
                          key={k}
                          d={`M ${cellCx + x1} ${cellCy + y1} Q ${cellCx} ${cellCy + (y1 + y2) / 2 + 10} ${cellCx + x2} ${cellCy + y2}`}
                          strokeWidth={k === 1 ? 2.2 : 1.2}
                          strokeOpacity={k === 1 ? 1 : 0.55}
                        />
                      ))}
                    </g>
                  ) : s.key === "neuronal" ? (
                    <g opacity={isHover ? 1 : 0.7}>
                      {Array.from({ length: 9 }).map((_, k) => {
                        const px = cellCx - 28 + (k % 3) * 28
                        const py = cellCy - 22 + Math.floor(k / 3) * 22
                        const lit = k === 4 || (isHover && k % 2 === 0)
                        return (
                          <circle
                            key={k}
                            cx={px}
                            cy={py}
                            r={lit ? 6 : 3.4}
                            fill={l.color}
                            fillOpacity={lit ? 1 : 0.45}
                            stroke="#0d1027"
                            strokeWidth={1}
                          />
                        )
                      })}
                    </g>
                  ) : (
                    <g opacity={isHover ? 1 : 0.7} stroke={l.color} fill="none">
                      <path
                        d={`M ${cellCx} ${cellCy + 22} L ${cellCx} ${cellCy - 6} L ${cellCx - 18} ${cellCy - 18} M ${cellCx} ${cellCy - 6} L ${cellCx + 18} ${cellCy - 22} M ${cellCx - 18} ${cellCy - 18} L ${cellCx - 28} ${cellCy - 28} M ${cellCx - 18} ${cellCy - 18} L ${cellCx - 12} ${cellCy - 30} M ${cellCx + 18} ${cellCy - 22} L ${cellCx + 28} ${cellCy - 30}`}
                        strokeWidth={1.6}
                      />
                      <circle cx={cellCx} cy={cellCy + 24} r={4} fill={l.color} />
                    </g>
                  )}

                  {/* hover sweep ring */}
                  {isHover ? (
                    <circle
                      cx={cellCx}
                      cy={cellCy}
                      r={Math.min(CELL_W, CELL_H) / 2 - 12}
                      fill="none"
                      stroke="#ffd596"
                      strokeOpacity={0.75}
                      strokeWidth={1.2}
                      className="syn-anim-sweep"
                    />
                  ) : null}
                </g>
              )
            }),
          )}

          {/* side panel */}
          <g transform={`translate(${VW - PAD_RIGHT + 32}, ${PAD_TOP - 64})`}>
            <rect
              x={0}
              y={0}
              width={PAD_RIGHT - 64}
              height={GRID_H + 100}
              rx={10}
              fill="rgba(13,16,39,0.7)"
              stroke="rgba(255,210,150,0.35)"
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
              CELL · {layerObj?.numeral} × {scaleObj?.symbol}
            </text>
            <text
              x={20}
              y={64}
              fontFamily="var(--font-display), Gloock, serif"
              fontSize={26}
              fill={layerObj?.color}
              letterSpacing={1}
            >
              {layerObj?.label}
            </text>
            <text
              x={20}
              y={88}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={12}
              letterSpacing={2.5}
              fill="rgba(220,200,160,0.7)"
            >
              × {scaleObj?.label.toUpperCase()}
            </text>
            <line
              x1={20}
              x2={PAD_RIGHT - 84}
              y1={108}
              y2={108}
              stroke="rgba(220,200,160,0.25)"
              strokeWidth={0.6}
            />
            <text
              x={20}
              y={140}
              fontFamily="var(--font-display), Gloock, serif"
              fontSize={22}
              fill="var(--ink)"
              letterSpacing={1}
            >
              {cell.title}
            </text>
            <foreignObject x={20} y={158} width={PAD_RIGHT - 104} height={320}>
              <div
                style={{
                  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "var(--ink-cool)",
                }}
              >
                {cell.body}
              </div>
            </foreignObject>
          </g>
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
          {SUBSTRATE_FOOTER}
        </div>
      </div>
    </figure>
  )
}
