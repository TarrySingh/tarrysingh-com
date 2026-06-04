"use client"

/**
 * The 2040 Planisphere — the flagship instrument for "Software 3.0".
 *
 * A scrubbable cartographic time-dial in the SYMPHONY astrolabe lineage:
 *   • the rim is the YEARS 2025 → 2040 (a 280° gauge, gap at the bottom);
 *   • six concentric rings are the expanding shells of abundance, inner→outer:
 *     Code(1.0) · Models(2.0) · Agents(3.0) · Embodiment · Biology · Off-world;
 *   • the conductor core is human INTENT — the still centre it all turns around;
 *   • nodes are attributed forecasts, pinned at (forecast-year × ring), that
 *     ignite as the year-hand passes them; filaments thread between frontiers
 *     as cheap intelligence cascades outward.
 * Drag the year-hand (or the slider); hover a node for the prediction + source.
 * Theme-aware via the Read mode; honours reduced motion; keyboard-operable.
 */

import { useRef, useState } from "react"
import {
  PlateFrame,
  paletteFor,
  useReadMode,
  usePrefersReducedMotion,
  clamp,
} from "./read-chart-kit"

const VIEW = 920
const CX = VIEW / 2
const CY = VIEW / 2
const R_CORE = 116
const RING_W = 44
const R_OUTER = R_CORE + 6 * RING_W // 380
const Y0 = 2025
const Y1 = 2040
const A_START = 131 // deg (0=east, +=clockwise); lower-left
const A_SWEEP = 278 // clockwise → ends lower-right, ~82° gap at bottom

const RINGS = [
  { key: "code", label: "CODE", sub: "software 1.0", tone: "cool" as const },
  { key: "models", label: "MODELS", sub: "software 2.0", tone: "teal" as const },
  { key: "agents", label: "AGENTS", sub: "software 3.0", tone: "violet" as const },
  { key: "embodiment", label: "EMBODIMENT", sub: "robots", tone: "copper" as const },
  { key: "biology", label: "BIOLOGY", sub: "multi-omics", tone: "rose" as const },
  { key: "offworld", label: "OFF-WORLD", sub: "orbit · moon · mars", tone: "gold" as const },
]

type Tone = (typeof RINGS)[number]["tone"]

interface PNode {
  id: string
  year: number
  ring: number
  title: string
  source: string
  /** bull-case / aspirational markers shown in the panel */
  flag?: string
}

const NODES: PNode[] = [
  { id: "code-2026", year: 2026, ring: 0, title: "AI writes the majority of new code", source: "industry telemetry" },
  { id: "cost-2025", year: 2025, ring: 1, title: "GPT-3-grade intelligence at ~$0.006 / million tokens", source: "a16z · LLMflation 2024" },
  { id: "models-2030", year: 2030, ring: 1, title: "AI-software market $7–14T; 4–16 GW training runs", source: "ARK · Epoch AI", flag: "ARK bull case" },
  { id: "agents-2028", year: 2028, ring: 2, title: "First one-person, billion-dollar company", source: "Altman · founder bet (median 2028)" },
  { id: "agents-2029", year: 2029, ring: 2, title: "Human-level AI — passes the Turing test", source: "Kurzweil · The Singularity Is Nearer 2024", flag: "trajectory right, date optimistic" },
  { id: "equity-2030", year: 2030, ring: 2, title: "Disruptive innovation = two-thirds of global equity ($140T)", source: "ARK · Big Ideas 2025", flag: "ARK bull case" },
  { id: "robotaxi-2030", year: 2030, ring: 3, title: "Robotaxis: ~$34T enterprise value; 50M fleet; $0.25 / mile", source: "ARK · Big Ideas 2025", flag: "ARK bull case" },
  { id: "humanoid-2032", year: 2032, ring: 3, title: "Humanoid robotics — a $26T annual opportunity", source: "ARK · Big Ideas 2025", flag: "ARK bull case · vs ~$38bn consensus" },
  { id: "genome-2030", year: 2030, ring: 4, title: "Whole human genome for ~$1–10", source: "ARK · faster-than-Moore" },
  { id: "drugs-2031", year: 2031, ring: 4, title: "AI-designed drugs: $2.4B → $0.6B, ~40% faster", source: "ARK · Big Ideas 2025" },
  { id: "suncatcher-2027", year: 2027, ring: 5, title: "First TPU/GPU data-centre satellites fly", source: "Google Suncatcher · Starcloud" },
  { id: "artemis-2028", year: 2028, ring: 5, title: "Artemis IV — first crewed lunar landing since 1972", source: "NASA", flag: "schedule will likely slip" },
  { id: "ilrs-2035", year: 2035, ring: 5, title: "Lunar station + ISRU; launch < $200 / kg", source: "CNSA · Google" },
  { id: "mars-2040", year: 2040, ring: 5, title: "First human bootprints on Mars", source: "NASA — an “audacious,” unfunded goal", flag: "aspirational" },
]

// a few couplings: cheap intelligence cascading into the outer frontiers
const FILAMENTS: { from: string; to: string }[] = [
  { from: "cost-2025", to: "robotaxi-2030" },
  { from: "cost-2025", to: "genome-2030" },
  { from: "agents-2029", to: "suncatcher-2027" },
  { from: "models-2030", to: "humanoid-2032" },
]

function deg2rad(d: number) {
  return (d * Math.PI) / 180
}
// Quantise to 2 decimals (0.01 of a 920px viewBox — visually exact) so the
// SSR-serialised coordinate strings match the client's byte-for-byte and we
// never trip a float-precision hydration mismatch on this SSR'd SVG.
const q = (n: number) => Math.round(n * 100) / 100
function polar(r: number, deg: number): [number, number] {
  const a = deg2rad(deg)
  return [q(CX + r * Math.cos(a)), q(CY + r * Math.sin(a))]
}
function yearToAngle(year: number): number {
  return A_START + ((year - Y0) / (Y1 - Y0)) * A_SWEEP
}
function ringMid(ring: number): number {
  return R_CORE + (ring + 0.5) * RING_W
}
function nodePos(n: PNode): [number, number] {
  return polar(ringMid(n.ring), yearToAngle(n.year))
}
/** SVG arc path along a circle of radius r from year a to year b (clockwise). */
function yearArc(r: number, ya: number, yb: number): string {
  const [x0, y0] = polar(r, yearToAngle(ya))
  const [x1, y1] = polar(r, yearToAngle(yb))
  const large = (yearToAngle(yb) - yearToAngle(ya)) > 180 ? 1 : 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`
}

export function TwentyFortyPlanisphere() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = paletteFor(mode)
  const [year, setYear] = useState(2033)
  const [active, setActive] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const toneColor = (t: Tone) => p.series[t]

  function pointerToYear(clientX: number, clientY: number): number {
    const svg = svgRef.current
    if (!svg) return year
    const rect = svg.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let deg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI
    // normalise into [A_START, A_START+360)
    while (deg < A_START) deg += 360
    while (deg >= A_START + 360) deg -= 360
    const f = clamp((deg - A_START) / A_SWEEP, 0, 1)
    return Math.round((Y0 + f * (Y1 - Y0)) * 10) / 10
  }

  function onPointerDown(e: React.PointerEvent) {
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setDragging(true)
    setYear(pointerToYear(e.clientX, e.clientY))
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return
    setYear(pointerToYear(e.clientX, e.clientY))
  }
  function endDrag() {
    setDragging(false)
  }

  const handAngle = yearToAngle(year)
  const [hx, hy] = polar(R_OUTER + 4, handAngle)
  const [hInnerX, hInnerY] = polar(R_CORE - 4, handAngle)
  const activeNode = active ? NODES.find((n) => n.id === active) ?? null : null
  const litCount = NODES.filter((n) => n.year <= year).length
  const nodeById = (id: string) => NODES.find((n) => n.id === id)!

  const yearTicks: number[] = []
  for (let y = Y0; y <= Y1; y++) yearTicks.push(y)

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker={`Fig. — The 2040 Planisphere · ${litCount}/${NODES.length} forecasts in view`}
      caption={
        activeNode ? (
          <>
            <strong style={{ color: p.ink, fontStyle: "normal" }}>{activeNode.title}.</strong>{" "}
            {activeNode.source}
            {activeNode.flag ? <span style={{ color: p.accent }}> · {activeNode.flag}</span> : null}
          </>
        ) : (
          <>Drag the year-hand from 2025 to 2040 — each frontier lights as the forecasts behind it come due. Hover any node for the claim and who made it. Inner rings are software; the outer rings are where automation leaves the screen.</>
        )
      }
      controls={
        <span
          className="tabular-nums text-[13px] font-semibold"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.accent }}
        >
          {Math.floor(year)}
        </span>
      }
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="block h-auto w-full touch-none select-none"
        role="img"
        aria-label={`The 2040 Planisphere — a cartographic time-dial of the path to 2040. Six concentric rings (code, models, agents, embodiment, biology, off-world) cross a rim of years 2025 to 2040. ${NODES.length} attributed forecasts ignite as the year advances. Currently showing the year ${Math.floor(year)}.`}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <defs>
          <radialGradient id="tfp-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.series.gold} stopOpacity={mode === "dark" ? 0.95 : 0.8} />
            <stop offset="55%" stopColor={p.series.copper} stopOpacity="0.4" />
            <stop offset="100%" stopColor={p.series.copper} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="tfp-bloom" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`rgba(${p.glowRGB},${mode === "dark" ? 0.16 : 0.1})`} />
            <stop offset="70%" stopColor={`rgba(${p.glowRGB},0)`} />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={VIEW} height={VIEW} fill="url(#tfp-bloom)" />

        {/* ring bands + labels */}
        {RINGS.map((ring, i) => {
          const rIn = R_CORE + i * RING_W
          const rOut = R_CORE + (i + 1) * RING_W
          const rMid = (rIn + rOut) / 2
          const c = toneColor(ring.tone)
          // label rides the lower-left lead-in, just inside the ring
          const [lx, ly] = polar(rMid, A_START - 6)
          return (
            <g key={ring.key}>
              <path d={yearArc(rOut, Y0, Y1)} fill="none" stroke={c} strokeOpacity={0.32} strokeWidth={1} />
              <path
                d={yearArc(rMid, Y0, Y1)}
                fill="none"
                stroke={c}
                strokeOpacity={0.07}
                strokeWidth={RING_W - 5}
                strokeLinecap="round"
              />
              <text
                x={lx}
                y={ly}
                textAnchor="end"
                dominantBaseline="middle"
                fontFamily="var(--font-mono), monospace"
                fontSize={11}
                letterSpacing={1.5}
                fill={c}
                fillOpacity={0.95}
              >
                {ring.label}
              </text>
            </g>
          )
        })}

        {/* outer rim + year ticks */}
        <path d={yearArc(R_OUTER + 4, Y0, Y1)} fill="none" stroke={p.muted} strokeWidth={1} />
        {yearTicks.map((y) => {
          const major = y % 5 === 0
          const a = yearToAngle(y)
          const [x1, y1] = polar(R_OUTER + 4, a)
          const [x2, y2] = polar(R_OUTER + 4 - (major ? 16 : 7), a)
          const passed = y <= year
          return (
            <g key={`tick-${y}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={passed ? p.accent : p.soft}
                strokeWidth={major ? 1.4 : 0.7}
                strokeOpacity={passed ? 0.9 : 0.5}
              />
              {major && (
                <text
                  {...(() => {
                    const [tx, ty] = polar(R_OUTER + 30, a)
                    return { x: tx, y: ty }
                  })()}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-mono), monospace"
                  fontSize={15}
                  fontWeight={600}
                  letterSpacing={1}
                  fill={passed ? p.accent : p.muted}
                >
                  {y}
                </text>
              )}
            </g>
          )
        })}

        {/* coupling filaments — appear once the later node is reached */}
        {FILAMENTS.map((f) => {
          const a = nodeById(f.from)
          const b = nodeById(f.to)
          const shown = year >= Math.max(a.year, b.year)
          const [ax, ay] = nodePos(a)
          const [bx, by] = nodePos(b)
          // bow the curve toward the core so couplings read as "through intent"
          const mx = (ax + bx) / 2
          const my = (ay + by) / 2
          const cxp = mx + (CX - mx) * 0.55
          const cyp = my + (CY - my) * 0.55
          return (
            <path
              key={`${f.from}-${f.to}`}
              d={`M ${ax} ${ay} Q ${cxp} ${cyp} ${bx} ${by}`}
              fill="none"
              stroke={p.series.gold}
              strokeWidth={1.2}
              strokeDasharray="3 4"
              style={{
                opacity: shown ? 0.6 : 0,
                transition: reduced ? undefined : "opacity 400ms ease",
              }}
            />
          )
        })}

        {/* nodes */}
        {NODES.map((n) => {
          const [x, y] = nodePos(n)
          const lit = n.year <= year
          const isActive = active === n.id
          const c = toneColor(RINGS[n.ring].tone)
          return (
            <g
              key={n.id}
              onMouseEnter={() => setActive(n.id)}
              onMouseLeave={() => setActive((cur) => (cur === n.id ? null : cur))}
              style={{ cursor: "pointer" }}
            >
              <circle cx={x} cy={y} r={16} fill="transparent" />
              {lit && (
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 13 : 9}
                  fill={c}
                  fillOpacity={0.22}
                  style={{ transition: reduced ? undefined : "r 200ms ease" }}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={lit ? (isActive ? 5.5 : 4) : 2.4}
                fill={lit ? c : p.soft}
                stroke={mode === "dark" ? "#0c1828" : "#fbf7ec"}
                strokeWidth={lit ? 1.5 : 0}
                style={{ transition: reduced ? undefined : "r 200ms ease, fill 300ms ease" }}
              />
            </g>
          )
        })}

        {/* the year-hand */}
        <line
          x1={hInnerX}
          y1={hInnerY}
          x2={hx}
          y2={hy}
          stroke={p.accent}
          strokeWidth={2}
          strokeLinecap="round"
          style={{ transition: dragging || reduced ? undefined : "all 220ms ease" }}
        />
        <circle
          cx={hx}
          cy={hy}
          r={dragging ? 12 : 9}
          fill={p.accent}
          stroke={mode === "dark" ? "#0c1828" : "#fbf7ec"}
          strokeWidth={2.5}
          onPointerDown={onPointerDown}
          style={{ cursor: "grab", transition: dragging || reduced ? undefined : "all 220ms ease" }}
        >
          <title>Drag to scrub the year</title>
        </circle>

        {/* conductor core — human intent */}
        <circle cx={CX} cy={CY} r={R_CORE - 8} fill="url(#tfp-core)" />
        <circle cx={CX} cy={CY} r={42} fill="none" stroke={p.series.copper} strokeOpacity={0.5} strokeWidth={1} />
        <circle cx={CX} cy={CY} r={26} fill={mode === "dark" ? "#0c1828" : "#fbf7ec"} stroke={p.series.copper} strokeOpacity={0.7} strokeWidth={1.2} />
        <text x={CX} y={CY - 2} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-mono), monospace" fontSize={11} letterSpacing={2} fill={p.accent}>
          INTENT
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-serif), serif" fontSize={10} fontStyle="italic" fill={p.muted}>
          you state it
        </text>
      </svg>

      {/* accessible + precise control */}
      <div className="mt-1 flex items-center gap-3 px-1">
        <span className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}>
          2025
        </span>
        <input
          type="range"
          min={Y0}
          max={Y1}
          step={1}
          value={Math.floor(year)}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-label="Scrub the year from 2025 to 2040"
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
          style={{ accentColor: p.accent, background: p.hair }}
        />
        <span className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}>
          2040
        </span>
      </div>
    </PlateFrame>
  )
}
