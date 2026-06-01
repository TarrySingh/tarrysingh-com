"use client"

import { useState } from "react"
import {
  STDP_ARIA_LABEL,
  STDP_KICKER,
  STDP_HEADER_RIGHT,
  STDP_TITLE,
  STDP_X_AXIS_LABEL,
  STDP_Y_AXIS_LABEL,
  STDP_LTP_REGION_LABEL,
  STDP_LTD_REGION_LABEL,
  STDP_SPIKE_PAIR_LABEL,
  STDP_PRE_LABEL,
  STDP_POST_LABEL,
  STDP_MS_SUFFIX,
  STDP_PANEL_REGIME_LABEL,
  STDP_REGIME_LTP_NAME,
  STDP_REGIME_LTD_NAME,
  STDP_REGIME_LTP_SUBTITLE,
  STDP_REGIME_LTD_SUBTITLE,
  STDP_DT_READOUT_LABEL,
  STDP_MS_UNIT,
  STDP_DW_READOUT_LABEL,
  STDP_FOOTER_CAPTION,
} from "@/lib/synaptic/stdp-window-content"

/**
 * Classic spike-timing-dependent plasticity window:
 *   Δw = A+ · exp(−Δt/τ+)   if Δt > 0  (pre → post : potentiation)
 *   Δw = −A− · exp( Δt/τ−)  if Δt < 0  (post → pre : depression)
 *
 * Δt = t_post − t_pre.  Positive Δt strengthens the synapse,
 * negative Δt weakens it.
 */

const A_PLUS = 1.0
const A_MINUS = 0.95
const TAU_PLUS = 18 // ms
const TAU_MINUS = 22 // ms

const stdpDeltaW = (dt: number) => {
  if (dt >= 0) return A_PLUS * Math.exp(-dt / TAU_PLUS)
  return -A_MINUS * Math.exp(dt / TAU_MINUS)
}

const VW = 1200
const VH = 820
const PAD_TOP = 168
const PAD_BOTTOM = 156
const PAD_LEFT = 100
const PAD_RIGHT = 380
const PLOT_W = VW - PAD_LEFT - PAD_RIGHT
const PLOT_H = VH - PAD_TOP - PAD_BOTTOM

const PANEL_X = VW - PAD_RIGHT + 32
const PANEL_W = PAD_RIGHT - 64
const PANEL_PAD = 24
const PANEL_INNER_W = PANEL_W - PANEL_PAD * 2

const DT_MIN = -80
const DT_MAX = 80
const ZERO_X = PAD_LEFT + (PLOT_W * (0 - DT_MIN)) / (DT_MAX - DT_MIN)
const ZERO_Y = PAD_TOP + PLOT_H / 2

const xForDt = (dt: number) =>
  PAD_LEFT + (PLOT_W * (dt - DT_MIN)) / (DT_MAX - DT_MIN)
const yForDw = (dw: number) => ZERO_Y - dw * (PLOT_H / 2.4) // dw in [-1, 1]

export function StdpWindow() {
  const [dt, setDt] = useState(8) // ms; default in LTP window
  const dw = stdpDeltaW(dt)
  const isLTP = dt >= 0
  const ltp = isLTP

  // Sample the curve
  const samples: Array<{ x: number; y: number }> = []
  for (let d = DT_MIN; d <= DT_MAX; d += 0.5) {
    samples.push({ x: xForDt(d), y: yForDw(stdpDeltaW(d)) })
  }
  const curvePath = samples
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ")

  // Cursor position
  const curX = xForDt(dt)
  const curY = yForDw(dw)

  return (
    <figure className="syn-memphis">
      <div
        className="rounded-[var(--radius-card)] border"
        style={{
          borderColor: "rgba(232,184,122,0.32)",
          background:
            "linear-gradient(180deg, rgba(20,34,59,0.92), rgba(12,24,40,0.96))",
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
          aria-label={STDP_ARIA_LABEL}
        >
          <defs>
            <radialGradient id="syn-stdp-bg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#2a3760" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#06101f" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="syn-stdp-ltp" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffd596" stopOpacity="0" />
              <stop offset="20%" stopColor="#ffd596" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffd596" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id="syn-stdp-ltd" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#e5a896" stopOpacity="0" />
              <stop offset="20%" stopColor="#e5a896" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#e5a896" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id="syn-stdp-ltp-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd596" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ffd596" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="syn-stdp-ltd-fill" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#e5a896" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#e5a896" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-stdp-bg)" />

          {/* header row 1 */}
          <text
            x={PAD_LEFT}
            y={42}
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={13}
            letterSpacing={4}
            fill="rgba(220,200,160,0.85)"
          >
            {STDP_KICKER}
          </text>
          <text
            x={VW - PAD_LEFT}
            y={42}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            letterSpacing={3}
            fill="rgba(220,200,160,0.65)"
          >
            {STDP_HEADER_RIGHT}
          </text>
          <line
            x1={PAD_LEFT}
            x2={VW - PAD_LEFT}
            y1={58}
            y2={58}
            stroke="rgba(220,200,160,0.35)"
            strokeWidth={0.8}
          />
          {/* header row 2 */}
          <text
            x={PAD_LEFT}
            y={108}
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={42}
            fill="var(--ink)"
            letterSpacing={1.5}
          >
            {STDP_TITLE}
          </text>

          {/* shaded LTP / LTD half-planes */}
          <rect
            x={ZERO_X}
            y={PAD_TOP}
            width={VW - PAD_RIGHT - ZERO_X}
            height={PLOT_H / 2}
            fill="url(#syn-stdp-ltp-fill)"
          />
          <rect
            x={PAD_LEFT}
            y={ZERO_Y}
            width={ZERO_X - PAD_LEFT}
            height={PLOT_H / 2}
            fill="url(#syn-stdp-ltd-fill)"
          />

          {/* axes */}
          <line
            x1={PAD_LEFT}
            x2={VW - PAD_RIGHT}
            y1={ZERO_Y}
            y2={ZERO_Y}
            stroke="rgba(220,200,160,0.5)"
            strokeWidth={1}
          />
          <line
            x1={ZERO_X}
            x2={ZERO_X}
            y1={PAD_TOP}
            y2={PAD_TOP + PLOT_H}
            stroke="rgba(220,200,160,0.5)"
            strokeWidth={1}
          />

          {/* x-axis tick labels (Δt in ms) */}
          {[-80, -60, -40, -20, 0, 20, 40, 60, 80].map((tick) => {
            const x = xForDt(tick)
            return (
              <g key={`xt-${tick}`}>
                <line
                  x1={x}
                  x2={x}
                  y1={ZERO_Y - 4}
                  y2={ZERO_Y + 4}
                  stroke="rgba(220,200,160,0.5)"
                  strokeWidth={0.8}
                />
                <text
                  x={x}
                  y={ZERO_Y + 22}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={11}
                  fill="rgba(220,200,160,0.7)"
                  letterSpacing={1.2}
                >
                  {tick > 0 ? `+${tick}` : tick}
                </text>
              </g>
            )
          })}
          <text
            x={VW - PAD_RIGHT}
            y={ZERO_Y + 50}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            fill="rgba(220,200,160,0.55)"
            letterSpacing={2}
          >
            {STDP_X_AXIS_LABEL}
          </text>

          {/* y-axis labels */}
          {[1, 0.5, -0.5, -1].map((tick) => {
            const y = yForDw(tick)
            return (
              <g key={`yt-${tick}`}>
                <line
                  x1={ZERO_X - 4}
                  x2={ZERO_X + 4}
                  y1={y}
                  y2={y}
                  stroke="rgba(220,200,160,0.5)"
                  strokeWidth={0.8}
                />
                <text
                  x={ZERO_X - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={11}
                  fill="rgba(220,200,160,0.7)"
                  letterSpacing={1.2}
                >
                  {tick > 0 ? `+${tick}` : tick}
                </text>
              </g>
            )
          })}
          <text
            x={ZERO_X - 12}
            y={PAD_TOP - 8}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            fill="rgba(220,200,160,0.55)"
            letterSpacing={2}
          >
            {STDP_Y_AXIS_LABEL}
          </text>

          {/* LTP / LTD region labels */}
          <text
            x={ZERO_X + (VW - PAD_RIGHT - ZERO_X) / 2}
            y={PAD_TOP + 32}
            textAnchor="middle"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            fill="#ffd596"
            letterSpacing={4}
          >
            {STDP_LTP_REGION_LABEL}
          </text>
          <text
            x={PAD_LEFT + (ZERO_X - PAD_LEFT) / 2}
            y={PAD_TOP + PLOT_H - 12}
            textAnchor="middle"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={11}
            fill="#e5a896"
            letterSpacing={4}
          >
            {STDP_LTD_REGION_LABEL}
          </text>

          {/* curve */}
          <path
            d={curvePath}
            fill="none"
            stroke={ltp ? "url(#syn-stdp-ltp)" : "url(#syn-stdp-ltd)"}
            strokeWidth={3}
            strokeOpacity={0.95}
          />
          {/* re-draw with the off-side gradient for the off-side */}
          <path
            d={curvePath}
            fill="none"
            stroke={ltp ? "url(#syn-stdp-ltd)" : "url(#syn-stdp-ltp)"}
            strokeWidth={3}
            strokeOpacity={0.5}
          />

          {/* interactive scrub region */}
          <rect
            x={PAD_LEFT}
            y={PAD_TOP}
            width={PLOT_W}
            height={PLOT_H}
            fill="transparent"
            onMouseMove={(e) => {
              const rect = (e.target as SVGRectElement).getBoundingClientRect()
              const ratio = (e.clientX - rect.left) / rect.width
              const newDt =
                DT_MIN + ratio * (DT_MAX - DT_MIN)
              setDt(Math.max(DT_MIN, Math.min(DT_MAX, newDt)))
            }}
            style={{ cursor: "crosshair" }}
          />

          {/* cursor crosshair */}
          <line
            x1={curX}
            x2={curX}
            y1={PAD_TOP}
            y2={PAD_TOP + PLOT_H}
            stroke="rgba(255,210,150,0.55)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <circle
            cx={curX}
            cy={curY}
            r={10}
            fill={ltp ? "#ffd596" : "#e5a896"}
            stroke="#0c1828"
            strokeWidth={2.5}
          />

          {/* spike trace beneath the chart */}
          <g transform={`translate(0, ${VH - PAD_BOTTOM + 36})`}>
            <text
              x={PAD_LEFT}
              y={0}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={2.5}
              fill="rgba(220,200,160,0.65)"
            >
              {STDP_SPIKE_PAIR_LABEL}
            </text>
            {/* synapse visual */}
            {(() => {
              const traceY = 36
              const preX = ZERO_X - 100
              const postX = ZERO_X + 100
              const spikeLen = 28
              // Δt = t_post − t_pre  →  shift post relative to pre
              // Use dt to position the spike pair visually
              const dtPx = (dt / DT_MAX) * 90
              const tpreX = preX
              const tpostX = postX + dtPx
              return (
                <g>
                  {/* baseline */}
                  <line
                    x1={PAD_LEFT}
                    x2={VW - PAD_RIGHT}
                    y1={traceY}
                    y2={traceY}
                    stroke="rgba(108,180,194,0.4)"
                    strokeWidth={1}
                  />
                  {/* pre spike */}
                  <line
                    x1={tpreX}
                    x2={tpreX}
                    y1={traceY}
                    y2={traceY - spikeLen}
                    stroke="#6cb4c2"
                    strokeWidth={2.4}
                  />
                  <text
                    x={tpreX}
                    y={traceY - spikeLen - 8}
                    textAnchor="middle"
                    fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                    fontSize={11}
                    fill="#6cb4c2"
                    letterSpacing={2}
                  >
                    {STDP_PRE_LABEL}
                  </text>
                  {/* post spike */}
                  <line
                    x1={tpostX}
                    x2={tpostX}
                    y1={traceY}
                    y2={traceY - spikeLen}
                    stroke={ltp ? "#ffd596" : "#e5a896"}
                    strokeWidth={2.4}
                  />
                  <text
                    x={tpostX}
                    y={traceY - spikeLen - 8}
                    textAnchor="middle"
                    fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                    fontSize={11}
                    fill={ltp ? "#ffd596" : "#e5a896"}
                    letterSpacing={2}
                  >
                    {STDP_POST_LABEL}
                  </text>
                  {/* timing arrow */}
                  <line
                    x1={tpreX}
                    x2={tpostX}
                    y1={traceY + 14}
                    y2={traceY + 14}
                    stroke="rgba(220,200,160,0.6)"
                    strokeWidth={1}
                  />
                  <text
                    x={(tpreX + tpostX) / 2}
                    y={traceY + 30}
                    textAnchor="middle"
                    fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                    fontSize={11}
                    fill="rgba(220,200,160,0.8)"
                    letterSpacing={2}
                  >
                    Δt = {dt > 0 ? "+" : ""}
                    {dt.toFixed(1)} {STDP_MS_SUFFIX}
                  </text>
                </g>
              )
            })()}
          </g>

          {/* side panel — live readout */}
          <g transform={`translate(${PANEL_X}, ${PAD_TOP - 56})`}>
            <rect
              x={0}
              y={0}
              width={PANEL_W}
              height={PLOT_H + 110}
              rx={10}
              fill="rgba(13,16,39,0.7)"
              stroke={ltp ? "rgba(255,210,150,0.5)" : "rgba(229,168,150,0.5)"}
              strokeWidth={1.2}
            />
            <text
              x={PANEL_PAD}
              y={36}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={3}
              fill="rgba(220,200,160,0.65)"
            >
              {STDP_PANEL_REGIME_LABEL}
            </text>
            <text
              x={PANEL_PAD}
              y={70}
              fontFamily="var(--font-display), Gloock, serif"
              fontSize={26}
              fill={ltp ? "#ffd596" : "#e5a896"}
              letterSpacing={1}
            >
              {ltp ? STDP_REGIME_LTP_NAME : STDP_REGIME_LTD_NAME}
            </text>
            <text
              x={PANEL_PAD}
              y={94}
              fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
              fontStyle="italic"
              fontSize={13}
              fill="rgba(220,200,160,0.75)"
            >
              {ltp ? STDP_REGIME_LTP_SUBTITLE : STDP_REGIME_LTD_SUBTITLE}
            </text>
            <line
              x1={PANEL_PAD}
              x2={PANEL_W - PANEL_PAD}
              y1={116}
              y2={116}
              stroke="rgba(220,200,160,0.25)"
              strokeWidth={0.6}
            />
            <text
              x={PANEL_PAD}
              y={148}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={10}
              letterSpacing={2}
              fill="rgba(220,200,160,0.55)"
            >
              {STDP_DT_READOUT_LABEL}
            </text>
            <text
              x={PANEL_PAD}
              y={184}
              fontFamily="var(--font-display), Gloock, serif"
              fontSize={36}
              fill="var(--ink)"
              letterSpacing={1}
            >
              {dt > 0 ? "+" : ""}
              {dt.toFixed(1)}
              <tspan fontSize={18} fill="rgba(220,200,160,0.7)">
                {" "}{STDP_MS_UNIT}
              </tspan>
            </text>
            <text
              x={PANEL_PAD}
              y={220}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={10}
              letterSpacing={2}
              fill="rgba(220,200,160,0.55)"
            >
              {STDP_DW_READOUT_LABEL}
            </text>
            <text
              x={PANEL_PAD}
              y={256}
              fontFamily="var(--font-display), Gloock, serif"
              fontSize={36}
              fill={ltp ? "#ffd596" : "#e5a896"}
              letterSpacing={1}
            >
              {dw > 0 ? "+" : ""}
              {dw.toFixed(3)}
            </text>
            <line
              x1={PANEL_PAD}
              x2={PANEL_W - PANEL_PAD}
              y1={280}
              y2={280}
              stroke="rgba(220,200,160,0.25)"
              strokeWidth={0.6}
            />
            <foreignObject
              x={PANEL_PAD}
              y={296}
              width={PANEL_INNER_W}
              height={PLOT_H - 100}
            >
              <div
                style={{
                  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                  fontSize: "13.5px",
                  lineHeight: 1.6,
                  color: "var(--ink-cool)",
                }}
              >
                A pre-synaptic spike that <em>precedes</em> a post-synaptic
                spike by a few milliseconds strengthens the connection
                between them — Hebb&rsquo;s 'cells that fire together'
                stated precisely. Reverse the order and the connection
                weakens. The exponential window is biology&rsquo;s
                primitive for credit assignment in time. MEMPHIS demands
                that the memristive substrate produce this curve
                <em>intrinsically</em> from device physics — not from a
                software training rule applied over the top.
              </div>
            </foreignObject>
          </g>
        </svg>

        <div
          className="border-t px-6 py-4"
          style={{
            borderColor: "rgba(232,184,122,0.18)",
            color: "var(--ink-cool)",
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            fontStyle: "italic",
            fontSize: "0.98rem",
            lineHeight: 1.5,
          }}
        >
          {STDP_FOOTER_CAPTION}
        </div>
      </div>
    </figure>
  )
}
