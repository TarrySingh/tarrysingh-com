"use client"

/**
 * V47 — THE WEALTH-TRANSFER MINIMAP.
 *
 * A slim four-stroke loop indicator: SAVE → FUND → POACH → SELL-BACK → (back to
 * SAVE). It shows the reader where in the wealth-transfer cycle the prose
 * currently sits — Europe SAVES (its surplus), the savings FUND (US venture +
 * mega-caps), which POACH (the talent + IP), and the finished capability is
 * SELL-BACK to Europe at a markup. The active stage glows; the others dim. The
 * SELL-BACK stroke — where the surplus comes home as rent — is rendered in the
 * reserved squeeze rose; the live stages ride the leverage cyan and the active
 * node crowns in copper-gold.
 *
 * Built as a tiny horizontal pill-rail so it can later be pinned sticky beside
 * the prose and driven by scroll — but it owns no scroll logic yet. Each stage
 * is a native <button> (keyboard-reachable, focus-visible), the rail is purely
 * controlled via `active` + `onSelect`, and it renders meaningfully static at
 * any default state.
 *
 * Theme-aware (cpPalette, re-renders on Read-mode flip) and reduced-motion safe
 * (the active glow + connector pulse only animate when motion is allowed; the
 * highlight reads fully without them).
 */

import { useId, useRef } from "react"

import { PlateFrame, useReadMode, usePrefersReducedMotion } from "./read-chart-kit"
import { cpPalette, rgba, type CPPalette } from "./chokepoint-kit"

type Stage = {
  key: string
  label: string
  gloss: string
  /** the SELL-BACK return-leg rides the squeeze rose, not the leverage cyan */
  squeeze?: boolean
}

const STAGES: Stage[] = [
  { key: "save", label: "SAVE", gloss: "Europe's surplus" },
  { key: "fund", label: "FUND", gloss: "US venture + caps" },
  { key: "poach", label: "POACH", gloss: "talent + IP" },
  { key: "sell", label: "SELL-BACK", gloss: "rent, at a markup", squeeze: true },
]

// rail geometry (viewBox units)
const W = 760
const H = 132
const CY = 58
const PAD = 70
const STEP = (W - PAD * 2) / (STAGES.length - 1)
const NODE_R = 22

function nodeX(i: number): number {
  return PAD + i * STEP
}

/** colour a stage draws in, by its position relative to the active node. */
function strokeFor(p: CPPalette, st: Stage, isActive: boolean): string {
  if (st.squeeze) return isActive ? p.squeezeHi : p.squeeze
  if (st.label === "SAVE") return isActive ? p.wonderHi : p.wonder
  return isActive ? p.leverageHi : p.leverage
}

export function WealthTransferMinimap({
  active = 0,
  onSelect,
}: {
  active?: number
  onSelect?: (index: number) => void
}) {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")

  const idx = Math.max(0, Math.min(STAGES.length - 1, Math.round(active)))
  const live = STAGES[idx]
  const liveColour = strokeFor(p, live, true)

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      breakout={false}
      kicker="V47 · Wealth-Transfer Minimap"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: liveColour }}
        >
          {idx + 1}/{STAGES.length} · {live.label}
        </span>
      }
      caption={
        <>
          Where the surplus is on its loop. Europe <span style={{ color: p.wonder }}>SAVES</span>,
          the savings <span style={{ color: p.leverage }}>FUND</span> and{" "}
          <span style={{ color: p.leverage }}>POACH</span> abroad, and the capability is{" "}
          <span style={{ color: p.squeeze }}>SOLD BACK</span> as rent. A navigation aid, later it
          rides sticky beside the prose. Source: essay sections, “The Chokepoint Paradox”.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Four-stage wealth-transfer loop: save, fund, poach, sell-back"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          fontFamily: "var(--font-mono), monospace",
        }}
      >
        <defs>
          <radialGradient id={`wt-glow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={liveColour} stopOpacity={0.42} />
            <stop offset="60%" stopColor={liveColour} stopOpacity={0.14} />
            <stop offset="100%" stopColor={liveColour} stopOpacity={0} />
          </radialGradient>
          <marker
            id={`wt-head-${uid}`}
            markerWidth="8"
            markerHeight="8"
            refX="5.6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill={p.soft} />
          </marker>
          <marker
            id={`wt-head-on-${uid}`}
            markerWidth="8"
            markerHeight="8"
            refX="5.6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill={liveColour} />
          </marker>
        </defs>

        {/* forward connectors: SAVE→FUND→POACH→SELL-BACK */}
        {STAGES.slice(0, -1).map((_, i) => {
          const onPath = i === idx // connector leaving the active node
          const x1 = nodeX(i) + NODE_R + 7
          const x2 = nodeX(i + 1) - NODE_R - 9
          return (
            <line
              key={`fwd-${i}`}
              x1={x1}
              y1={CY}
              x2={x2}
              y2={CY}
              stroke={onPath ? liveColour : p.hair}
              strokeWidth={onPath ? 2.4 : 1.4}
              strokeDasharray={onPath && !reduced ? "5 5" : undefined}
              markerEnd={onPath ? `url(#wt-head-on-${uid})` : `url(#wt-head-${uid})`}
              style={{ opacity: onPath ? 1 : 0.7 }}
            >
              {onPath && !reduced && (
                <animate
                  attributeName="stroke-dashoffset"
                  from="20"
                  to="0"
                  dur="1.1s"
                  repeatCount="indefinite"
                />
              )}
            </line>
          )
        })}

        {/* return-leg: SELL-BACK loops home to SAVE (the squeeze) */}
        {(() => {
          const closing = idx === STAGES.length - 1
          const x0 = nodeX(STAGES.length - 1)
          const x1 = nodeX(0)
          const dip = H - 18
          const d = `M ${x0} ${CY + NODE_R + 4} C ${x0} ${dip} ${x1} ${dip} ${x1} ${CY + NODE_R + 4}`
          return (
            <path
              d={d}
              fill="none"
              stroke={closing ? p.squeezeHi : p.squeeze}
              strokeWidth={closing ? 2.2 : 1.4}
              strokeDasharray="4 6"
              markerEnd={closing ? `url(#wt-head-on-${uid})` : `url(#wt-head-${uid})`}
              style={{ opacity: closing ? 1 : 0.5 }}
            />
          )
        })()}
        <text
          x={W / 2}
          y={H - 8}
          textAnchor="middle"
          fill={idx === STAGES.length - 1 ? p.squeezeHi : p.soft}
          style={{ fontSize: 9.5, letterSpacing: "0.22em" }}
        >
          THE SURPLUS COMES HOME AS RENT
        </text>

        {/* stage nodes */}
        {STAGES.map((st, i) => {
          const x = nodeX(i)
          const isActive = i === idx
          const col = strokeFor(p, st, isActive)
          return (
            <g key={st.key} style={{ opacity: isActive ? 1 : 0.4 }}>
              {isActive && (
                <circle cx={x} cy={CY} r={NODE_R + 22} fill={`url(#wt-glow-${uid})`} />
              )}
              <circle
                cx={x}
                cy={CY}
                r={NODE_R}
                fill={isActive ? rgba(p.inkRGB, mode === "dark" ? 0.18 : 0.06) : "none"}
                stroke={col}
                strokeWidth={isActive ? 2.6 : 1.4}
              />
              {isActive && !reduced && (
                <circle cx={x} cy={CY} r={NODE_R} fill="none" stroke={col} strokeWidth={1}>
                  <animate
                    attributeName="r"
                    from={NODE_R}
                    to={NODE_R + 9}
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <text
                x={x}
                y={CY + 4}
                textAnchor="middle"
                fill={isActive ? col : p.muted}
                style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em" }}
              >
                {i + 1}
              </text>
              <text
                x={x}
                y={CY - NODE_R - 12}
                textAnchor="middle"
                fill={isActive ? col : p.soft}
                style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em" }}
              >
                {st.label}
              </text>
              <text
                x={x}
                y={CY + NODE_R + 17}
                textAnchor="middle"
                fill={isActive ? p.muted : p.soft}
                style={{ fontSize: 9.5, letterSpacing: "0.02em" }}
              >
                {st.gloss}
              </text>
            </g>
          )
        })}
      </svg>

      {/* native, keyboard-reachable stage buttons (the control surface) */}
      <div
        className="mt-2 grid gap-1.5 px-1"
        style={{ gridTemplateColumns: `repeat(${STAGES.length}, minmax(0, 1fr))` }}
        role="group"
        aria-label="Jump to a stage of the wealth-transfer loop"
      >
        {STAGES.map((st, i) => {
          const isActive = i === idx
          const col = strokeFor(p, st, true)
          return (
            <button
              key={st.key}
              type="button"
              onClick={() => onSelect?.(i)}
              aria-pressed={isActive}
              aria-label={`Stage ${i + 1}: ${st.label}, ${st.gloss}`}
              className="rounded-md border px-2 py-1.5 text-left transition-colors"
              style={{
                borderColor: isActive ? col : p.hair,
                background: isActive ? rgba(p.inkRGB, mode === "dark" ? 0.16 : 0.05) : "transparent",
                cursor: onSelect ? "pointer" : "default",
              }}
            >
              <span
                className="block text-[10px] font-semibold uppercase tracking-[0.1em]"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  color: isActive ? col : p.soft,
                }}
              >
                {i + 1} · {st.label}
              </span>
            </button>
          )
        })}
      </div>
    </PlateFrame>
  )
}
