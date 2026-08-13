"use client"

/**
 * V4 — THE VALLEY OF DEATH  (Chapter 1).
 *
 * A dark, descending Sankey of Dutch research reaching revenue: 100% (research)
 * → ~40% (prototype) → ~15% (pilot) → ~8% (scale) → ~5% (revenue). At every
 * gap the lost flow BLEEDS downward into the dark background — the haemorrhage
 * motif, in the single reserved red. The surviving ~5% thread glows faintly gold.
 *
 * The biggest leak is prototype→pilot (~62.5% lost) — the missing-middle, where
 * the cheque that wasn't there should have been. Hover (or keyboard-focus) any
 * stage or gap to read the MISSING CHEQUE at that point — the financing that
 * never arrived, ~€200k at the earliest gap up to €1–2M at the scale gap — plus
 * the share lost.
 *
 * REVEAL: the kill-rate is a visible haemorrhage, not a tidy bar chart. The
 * Valley of Death sits precisely at the missing-middle financing gap.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit),
 * reduced-motion safe (the only motion is the user's own hover/focus; the
 * default focus is the missing middle, so the static fallback is meaningful),
 * keyboard-reachable (focusable stage/gap groups). Data: Dutch competitiveness
 * deck (B12, p177).
 */

import { useRef, useState } from "react"

import { PlateFrame, useReadMode, clamp } from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

type Stage = {
  key: string
  label: string
  pct: number // share of original research that survives to here
}

// The descending survival curve — share of research reaching each stage.
const STAGES: Stage[] = [
  { key: "research", label: "RESEARCH", pct: 100 },
  { key: "prototype", label: "PROTOTYPE", pct: 40 },
  { key: "pilot", label: "PILOT", pct: 15 },
  { key: "scale", label: "SCALE", pct: 8 },
  { key: "revenue", label: "REVENUE", pct: 5 },
]

type Gap = {
  key: string
  from: string // stage label this gap follows
  to: string
  fromPct: number
  toPct: number
  cheque: string // the financing that wasn't there
  note: string
}

// The four leaks between the five stages — each a missing cheque.
const GAPS: Gap[] = [
  {
    key: "g0",
    from: "RESEARCH",
    to: "PROTOTYPE",
    fromPct: 100,
    toPct: 40,
    cheque: "€200k",
    note: "proof-of-concept grant, the lab-to-prototype gap",
  },
  {
    key: "g1",
    from: "PROTOTYPE",
    to: "PILOT",
    fromPct: 40,
    toPct: 15,
    cheque: "€500k–€1M",
    note: "the missing middle, no seed cheque to reach a pilot",
  },
  {
    key: "g2",
    from: "PILOT",
    to: "SCALE",
    fromPct: 15,
    toPct: 8,
    cheque: "€1–2M",
    note: "growth capital to industrialise, the scale gap",
  },
  {
    key: "g3",
    from: "SCALE",
    to: "REVENUE",
    fromPct: 8,
    toPct: 5,
    cheque: "€1–2M",
    note: "the last mile to revenue, most never clear it",
  },
]

// Geometry --------------------------------------------------------------------
const VW = 920
const VH = 600
const X0 = 150 // left edge of the flow
const X1 = 770 // right edge of the flow
const TOP = 96 // y of the full-width research band
const BAND = 150 // full thickness at 100%
const COLW = (X1 - X0) / STAGES.length

// x at the centre of stage i's column
const stageCx = (i: number) => X0 + COLW * (i + 0.5)
// half-thickness of the surviving thread at a given pct
const halfFor = (pct: number) => (BAND / 2) * (pct / 100)

export function ValleyOfDeath() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)

  // default focus = the missing middle (the meaningful static end-state)
  const [active, setActive] = useState<string>("g1")
  const gap = GAPS.find((g) => g.key === active) ?? null
  const stage = STAGES.find((s) => s.key === active) ?? null

  const lostPct = gap ? gap.fromPct - gap.toPct : 0
  const lostShare = gap ? Math.round(((gap.fromPct - gap.toPct) / gap.fromPct) * 100) : 0

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V4 · The Valley of Death"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.squeeze }}
        >
          ~95% NEVER REACH REVENUE
        </span>
      }
      caption={
        <>
          Of Dutch research, only ~5% ever reaches revenue. Hover or focus each{" "}
          <span style={{ color: p.squeeze }}>gap</span> to read the missing cheque, the financing that
          wasn&rsquo;t there. The deepest leak is{" "}
          <span style={{ color: p.squeezeHi }}>prototype→pilot</span> (~62.5% lost): the missing middle.
          The surviving <span style={{ color: p.wonderHi }}>~5%</span> reaches revenue. Illustrative funnel; source: Dutch
          competitiveness deck (B12, p177).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        role="img"
        aria-label="A descending flow of Dutch research to revenue: ~95% bleeds out across four financing gaps, only ~5% survives"
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="vod-bleed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.squeeze} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="vod-bleed-hot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={0.78} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="vod-thread" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.muted} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0.95} />
          </linearGradient>
        </defs>

        {/* schematic baseline + axis hairlines */}
        <line x1={X0} y1={TOP - 26} x2={X1} y2={TOP - 26} stroke={p.blueprint} strokeWidth={1} />
        {STAGES.map((s, i) => (
          <line
            key={`grid-${s.key}`}
            x1={stageCx(i)}
            y1={TOP - 26}
            x2={stageCx(i)}
            y2={VH - 70}
            stroke={p.blueprint}
            strokeWidth={1}
          />
        ))}

        {/* THE BLEEDS — each lost flow haemorrhaging downward into the dark */}
        {GAPS.map((g, i) => {
          const xL = stageCx(i) // centre of the upstream stage
          const xR = stageCx(i + 1) // centre of the downstream stage
          const hUp = halfFor(g.fromPct)
          const hDn = halfFor(g.toPct)
          // the surviving thread's lower edge, up- and downstream
          const yUp = TOP + BAND / 2 + hUp
          const yDn = TOP + BAND / 2 + hDn
          const lostH = hUp - hDn // thickness of the lost flow at the downstream edge
          const isActive = active === g.key
          // bleed plume drips below the lost wedge
          const dripTop = yDn
          const dripBot = clamp(dripTop + lostH * 2.4 + 60, dripTop, VH - 54)
          return (
            <g key={`bleed-${g.key}`}>
              {/* the lost wedge: surviving lower edge peels away and falls */}
              <path
                d={`M ${xL} ${yUp} L ${xR} ${yDn} L ${xR} ${dripBot} Q ${(xL + xR) / 2} ${dripBot + 26} ${xL} ${yUp} Z`}
                fill={isActive ? "url(#vod-bleed-hot)" : "url(#vod-bleed)"}
                opacity={isActive ? 1 : 0.7}
              />
              {/* a few drip strokes for the haemorrhage texture */}
              {[0.32, 0.55, 0.78].map((t, k) => {
                const dx = xL + (xR - xL) * t
                return (
                  <line
                    key={k}
                    x1={dx}
                    y1={yDn + (yUp - yDn) * (1 - t) * 0.4}
                    x2={dx}
                    y2={dripBot - 6}
                    stroke={isActive ? p.squeezeHi : p.squeeze}
                    strokeWidth={isActive ? 1.4 : 1}
                    strokeOpacity={isActive ? 0.5 : 0.26}
                  />
                )
              })}
            </g>
          )
        })}

        {/* THE SURVIVING THREAD — the narrowing band of research that lives */}
        <path
          d={(() => {
            const top: string[] = []
            const bot: string[] = []
            STAGES.forEach((s, i) => {
              const cx = stageCx(i)
              const h = halfFor(s.pct)
              top.push(`${i === 0 ? "M" : "L"} ${cx} ${TOP + BAND / 2 - h}`)
              bot.unshift(`L ${cx} ${TOP + BAND / 2 + h}`)
            })
            return `${top.join(" ")} ${bot.join(" ")} Z`
          })()}
          fill="url(#vod-thread)"
          stroke={p.wonder}
          strokeWidth={1}
          strokeOpacity={0.6}
        />

        {/* faint gold glow on the surviving 2% endpoint */}
        <circle
          cx={stageCx(STAGES.length - 1)}
          cy={TOP + BAND / 2}
          r={halfFor(5) + 16}
          fill="none"
          stroke={p.wonderHi}
          strokeOpacity={0.45}
          strokeWidth={1}
        />

        {/* STAGE markers — focusable; node, label, surviving % */}
        {STAGES.map((s, i) => {
          const cx = stageCx(i)
          const cy = TOP + BAND / 2
          const isActive = active === s.key
          const last = i === STAGES.length - 1
          return (
            <g
              key={`stage-${s.key}`}
              role="button"
              tabIndex={0}
              aria-label={`${s.label}: ${s.pct}% of research survives to here`}
              onMouseEnter={() => setActive(s.key)}
              onFocus={() => setActive(s.key)}
              style={{ cursor: "pointer", outline: "none" }}
            >
              <line
                x1={cx}
                y1={TOP - 40}
                x2={cx}
                y2={cy - halfFor(s.pct) - 6}
                stroke={isActive ? p.wonderHi : p.hair}
                strokeWidth={1}
              />
              <text
                x={cx}
                y={TOP - 46}
                textAnchor="middle"
                fill={isActive ? p.wonderHi : p.muted}
                style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em" }}
              >
                {s.label}
              </text>
              <circle
                cx={cx}
                cy={cy}
                r={isActive ? 5.5 : 4}
                fill={last ? p.wonderHi : isActive ? p.wonderHi : p.wonder}
                stroke={p.bg}
                strokeWidth={1.4}
              />
              <text
                x={cx}
                y={VH - 44}
                textAnchor="middle"
                fill={last ? p.wonderHi : isActive ? p.wonderHi : p.soft}
                style={{ fontSize: 20, fontWeight: 800 }}
              >
                {s.pct}%
              </text>
            </g>
          )
        })}

        {/* GAP hotspots — focusable wedges between stages */}
        {GAPS.map((g, i) => {
          const cx = (stageCx(i) + stageCx(i + 1)) / 2
          const isActive = active === g.key
          return (
            <g
              key={`gap-${g.key}`}
              role="button"
              tabIndex={0}
              aria-label={`Gap ${g.from} to ${g.to}: ${g.fromPct - g.toPct}% lost, missing cheque ${g.cheque}`}
              onMouseEnter={() => setActive(g.key)}
              onFocus={() => setActive(g.key)}
              style={{ cursor: "pointer", outline: "none" }}
            >
              {/* invisible hit target spanning the bleed column */}
              <rect
                x={stageCx(i)}
                y={TOP}
                width={stageCx(i + 1) - stageCx(i)}
                height={VH - TOP - 70}
                fill="transparent"
              />
              <text
                x={cx}
                y={TOP + BAND + 34}
                textAnchor="middle"
                fill={isActive ? p.squeezeHi : p.squeeze}
                fillOpacity={isActive ? 1 : 0.62}
                style={{ fontSize: isActive ? 13 : 11, fontWeight: 700 }}
              >
                −{g.fromPct - g.toPct}%
              </text>
            </g>
          )
        })}
      </svg>

      {/* READOUT — the missing cheque at the focused gap (or stage detail) */}
      <div
        className="mt-2 rounded-lg p-3.5"
        style={{
          border: `1px solid ${gap ? rgba(p.glowRGB, 0) : p.hair}`,
          borderColor: gap ? p.squeeze : p.wonder,
          background: p.hair,
        }}
      >
        {gap ? (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  color: p.squeezeHi,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                {gap.from} → {gap.to}
              </span>
              <span
                className="tabular-nums"
                style={{ fontFamily: "var(--font-mono), monospace", color: p.squeeze, fontSize: 13, fontWeight: 700 }}
              >
                {lostPct}% lost · {lostShare}% of the inflow
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2.5">
              <span style={{ fontFamily: "var(--font-mono), monospace", color: p.soft, fontSize: 12 }}>
                MISSING CHEQUE
              </span>
              <span
                className="tabular-nums"
                style={{ fontFamily: "var(--font-mono), monospace", color: p.squeezeHi, fontSize: 22, fontWeight: 800 }}
              >
                {gap.cheque}
              </span>
            </div>
            <p className="mt-1 text-[13.5px] leading-snug" style={{ color: p.muted, fontFamily: "var(--font-serif), serif" }}>
              {gap.note}.
            </p>
          </>
        ) : stage ? (
          <div className="flex items-baseline gap-3">
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                color: stage.key === "revenue" ? p.wonderHi : p.muted,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              {stage.label}
            </span>
            <span
              className="tabular-nums"
              style={{
                fontFamily: "var(--font-mono), monospace",
                color: stage.key === "revenue" ? p.wonderHi : p.soft,
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              {stage.pct}%
            </span>
            <span style={{ color: p.muted, fontSize: 13, fontFamily: "var(--font-serif), serif" }}>
              of the original research still alive at this stage.
            </span>
          </div>
        ) : null}
      </div>

      {/* verdict line */}
      <p
        className="mt-2 px-1 text-[15px]"
        style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
      >
        <span style={{ color: p.squeezeHi, fontStyle: "normal", fontWeight: 700 }}>The Valley of Death</span> isn&rsquo;t
        a metaphor, it is a haemorrhage at the exact point where the cheque should have been.
      </p>
    </PlateFrame>
  )
}
