"use client"

/**
 * The Silver Thread — the essay's spine as a living instrument.
 *
 * A single point of INTENT at the apex sends its signal *down and outward*,
 * branching as it falls through six frontiers — Code → Models → Agents →
 * Embodiment → Biology → Off-world — multiplying one stated intent into a
 * cascade of agents, tools, robots, cells and orbital machines. Drag the
 * year-hand 2025 → 2040 and the cascade reaches one shell further each year;
 * a copper wavefront marks how deep cheap intelligence has travelled.
 *
 * Geometry is pure-linear (no trig) so SSR and client agree byte-for-byte.
 * The flowing particles use SVG <animateMotion> (compositor, no rAF); they are
 * omitted entirely under prefers-reduced-motion. Theme-aware via read-chart-kit.
 */

import { useRef, useState } from "react"
import {
  PlateFrame,
  paletteFor,
  useReadMode,
  usePrefersReducedMotion,
  type ReadPalette,
} from "./read-chart-kit"

const VW = 1000
const VH = 700
const CX = 500
const Y_INTENT = 62
const Y0 = 176
const GAP = 92

type Tone = keyof ReadPalette["series"]

interface Tier {
  key: string
  label: string
  sub: string
  /** the year the cascade reaches this shell */
  year: number
  count: number
  tone: Tone
}

const TIERS: Tier[] = [
  { key: "code", label: "CODE", sub: "the program, written", year: 2025, count: 2, tone: "gold" },
  { key: "models", label: "MODELS", sub: "the program, trained", year: 2025, count: 3, tone: "copper" },
  { key: "agents", label: "AGENTS", sub: "the work, delegated", year: 2026, count: 5, tone: "violet" },
  { key: "embodiment", label: "EMBODIMENT", sub: "the work, embodied", year: 2029, count: 7, tone: "teal" },
  { key: "biology", label: "BIOLOGY", sub: "the cell, edited", year: 2031, count: 9, tone: "rose" },
  { key: "offworld", label: "OFF-WORLD", sub: "the base, off-planet", year: 2035, count: 11, tone: "cool" },
]

const Y_MIN = 2025
const Y_MAX = 2040

// ── deterministic geometry (module-level; pure linear arithmetic) ──────────
const tierY = (i: number) => Y0 + i * GAP
const halfWidth = (i: number) => 80 + i * 62
function nodeX(i: number, j: number, n: number): number {
  const hw = halfWidth(i)
  return n === 1 ? CX : CX - hw + (j / (n - 1)) * 2 * hw
}

interface Node {
  x: number
  y: number
}
const NODES: Node[][] = TIERS.map((t, i) =>
  Array.from({ length: t.count }, (_, j) => ({ x: nodeX(i, j, t.count), y: tierY(i) })),
)

interface Thread {
  tier: number
  d: string
}
const THREADS: Thread[] = []
TIERS.forEach((t, i) => {
  const above = i === 0 ? [{ x: CX, y: Y_INTENT }] : NODES[i - 1]
  NODES[i].forEach((node, j) => {
    const pIdx =
      i === 0 ? 0 : Math.round((j * (above.length - 1)) / Math.max(1, t.count - 1))
    const parent = above[Math.min(pIdx, above.length - 1)]
    const cy = (parent.y + node.y) / 2
    const cx = (parent.x + node.x) / 2
    THREADS.push({ tier: i, d: `M ${parent.x} ${parent.y} Q ${cx} ${cy} ${node.x} ${node.y}` })
  })
})

export function SilverThread() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = paletteFor(mode)
  const [year, setYear] = useState(2030)
  const [hover, setHover] = useState<number | null>(null)

  // deepest reached tier given the year
  let reach = -1
  TIERS.forEach((t, i) => {
    if (year >= t.year) reach = i
  })

  const active = hover != null ? TIERS[hover] : null
  const liveCount = reach + 1

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker="Fig., The silver thread · one intent, six frontiers, reaching outward"
      controls={
        <span
          className="tabular-nums text-[13px] font-semibold"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.accent }}
        >
          {year}
        </span>
      }
      caption={
        active ? (
          <>
            <strong style={{ color: p.ink, fontStyle: "normal" }}>
              {active.label}
            </strong>{" "}
, {active.sub}. The cascade reaches this shell around {active.year};{" "}
            {year >= active.year ? "by " + year + " it is live." : "still latent at " + year + "."}
          </>
        ) : (
          <>
            One stated <strong style={{ color: p.ink, fontStyle: "normal" }}>intent</strong> at the
            apex, cascading down through six frontiers and multiplying as it falls, agents, tools,
            robots, cells, orbital machines. Drag the year-hand: cheap intelligence reaches one shell
            further each year. {liveCount} of 6 frontiers live at {year}.
          </>
        )
      }
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full touch-none"
        role="img"
        aria-label={`The silver thread: a single point of intent at the top branches downward through six frontiers, code, models, agents, embodiment, biology and off-world, multiplying as it descends. A year control from 2025 to 2040 sets how deep the cascade reaches; at ${year}, ${liveCount} of the six frontiers are live.`}
      >
        <defs>
          <radialGradient id="st-intent" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.accent} stopOpacity="0.9" />
            <stop offset="45%" stopColor={p.accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* threads */}
        {THREADS.map((th, k) => {
          const live = th.tier <= reach
          const tone = p.series[TIERS[th.tier].tone]
          const dim = hover != null && hover !== th.tier
          return (
            <path
              key={k}
              d={th.d}
              fill="none"
              stroke={live ? tone : p.muted}
              strokeWidth={live ? 1.5 : 1}
              strokeOpacity={dim ? 0.12 : live ? 0.7 : 0.22}
              strokeDasharray={live ? undefined : "2 5"}
              style={{ transition: reduced ? undefined : "stroke-opacity 280ms ease, stroke 280ms ease" }}
            />
          )
        })}

        {/* flowing particles along live threads (compositor; omitted if reduced) */}
        {!reduced &&
          THREADS.filter((th) => th.tier <= reach).flatMap((th, k) => {
            const tone = p.series[TIERS[th.tier].tone]
            const dim = hover != null && hover !== th.tier
            if (dim) return []
            const dur = 2.3 + (th.tier % 3) * 0.45
            return [0, -dur / 2].map((begin, b) => (
              <circle key={`${k}-${b}`} r={2.2} fill={tone} opacity={0.9}>
                <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={th.d} />
              </circle>
            ))
          })}

        {/* the wavefront — how deep cheap intelligence has travelled */}
        {reach >= 0 && (
          <g style={{ transition: reduced ? undefined : "transform 360ms ease" }}>
            <line
              x1={70}
              x2={VW - 40}
              y1={tierY(reach) + GAP / 2}
              y2={tierY(reach) + GAP / 2}
              stroke={p.accent}
              strokeOpacity={0.4}
              strokeWidth={1}
              strokeDasharray="1 6"
            />
            <text
              x={VW - 40}
              y={tierY(reach) + GAP / 2 - 8}
              textAnchor="end"
              fontFamily="var(--font-mono), monospace"
              fontSize={10}
              letterSpacing={1.5}
              fill={p.accent}
            >
              WAVEFRONT · {year}
            </text>
          </g>
        )}

        {/* INTENT core */}
        <circle cx={CX} cy={Y_INTENT} r={44} fill="url(#st-intent)" />
        <circle cx={CX} cy={Y_INTENT} r={9} fill={p.accent} stroke={p.bg} strokeWidth={2} />
        <text
          x={CX}
          y={Y_INTENT - 30}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={12}
          fontWeight={600}
          letterSpacing={2}
          fill={p.ink}
        >
          INTENT
        </text>
        <text
          x={CX}
          y={Y_INTENT - 16}
          textAnchor="middle"
          fontFamily="var(--font-serif), serif"
          fontStyle="italic"
          fontSize={11}
          fill={p.muted}
        >
          you state it
        </text>

        {/* tier nodes + labels + hover hit-areas */}
        {TIERS.map((t, i) => {
          const live = i <= reach
          const tone = p.series[t.tone]
          const y = tierY(i)
          const dim = hover != null && hover !== i
          return (
            <g key={t.key} style={{ transition: reduced ? undefined : "opacity 280ms ease" }} opacity={dim ? 0.4 : 1}>
              {/* hit area across the tier band */}
              <rect
                x={40}
                y={y - GAP / 2}
                width={VW - 80}
                height={GAP}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              />
              {/* nodes */}
              {NODES[i].map((n, j) => (
                <g key={j}>
                  {live && (
                    <circle cx={n.x} cy={n.y} r={9} fill={tone} fillOpacity={0.18} />
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={live ? 4 : 3}
                    fill={live ? tone : p.bg}
                    stroke={live ? p.bg : p.muted}
                    strokeWidth={live ? 1.5 : 1}
                  />
                </g>
              ))}
              {/* left label */}
              <text
                x={48}
                y={y - 6}
                fontFamily="var(--font-mono), monospace"
                fontSize={12}
                fontWeight={600}
                letterSpacing={1.5}
                fill={live ? tone : p.soft}
              >
                {t.label}
              </text>
              <text
                x={48}
                y={y + 10}
                fontFamily="var(--font-serif), serif"
                fontStyle="italic"
                fontSize={11}
                fill={p.muted}
              >
                {t.sub}
              </text>
              {/* right year tag */}
              <text
                x={VW - 44}
                y={y + 4}
                textAnchor="end"
                fontFamily="var(--font-mono), monospace"
                fontSize={11}
                fill={live ? p.accent : p.soft}
              >
                {live ? "● " : "○ "}
                {t.year}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="mt-3 flex items-center gap-3 px-1">
        <span
          className="text-[11px]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          {Y_MIN}
        </span>
        <input
          type="range"
          min={Y_MIN}
          max={Y_MAX}
          step={1}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-label="Scrub the year from 2025 to 2040 to advance the cascade"
          className="h-1 w-full cursor-pointer appearance-none rounded-full"
          style={{ accentColor: p.accent, background: p.hair }}
        />
        <span
          className="text-[11px]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          {Y_MAX}
        </span>
      </div>
    </PlateFrame>
  )
}
