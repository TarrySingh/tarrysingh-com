"use client"

/**
 * The Off-World Stack — the industrial base leaves Earth.
 *
 * Not a bar chart: an ascending CROSS-SECTION read bottom→top, from the Earth
 * limb up through low Earth orbit, on to the Moon, and finally to the faint
 * red horizon of Mars. Milestones sit at their "altitude" band, each tagged by
 * year and — the part that keeps the section honest — a CONFIDENCE level that
 * drives how solid it looks:
 *
 *   • done        → bright, solid, filled (it has already happened)
 *   • scheduled   → solid ring, medium ink (funded / manifested, dates slip)
 *   • target      → dashed ring, lighter (a stated national / corporate goal)
 *   • aspirational→ faint, dashed, ghosted (audacious, unfunded, decades out)
 *
 * The deliberate fade toward Mars and terraforming IS the argument: the stack
 * is real and dense near Earth and becomes a hope the higher you climb.
 *
 * Drag the altitude-hand (or the slider) to scrub the YEAR — milestones up to
 * that year are "reached" and ignite; later ones stay ghosted ahead of you.
 * Hover/click any node for the detail panel. Theme-aware via Read mode;
 * honours reduced motion; nodes are keyboard-operable.
 */

import { useRef, useState } from "react"
import {
  PlateFrame,
  paletteFor,
  useReadMode,
  usePrefersReducedMotion,
  clamp01,
  lerp,
} from "./read-chart-kit"

// ----------------------------------------------------------------------------
// Geometry — a tall portrait instrument
// ----------------------------------------------------------------------------
const VW = 760
const VH = 1040
const PAD_L = 150 // left gutter: altitude axis + band labels
const PAD_R = 40
const COL_X = PAD_L + 18 // x of the central ascent column
const TOP_Y = 70 // Mars horizon (top of the climb)
const BASE_Y = 938 // Earth surface line (datum, alt = 0)

// Earth limb is a very large circle centred far below the frame, so only a
// shallow curved horizon shows at the bottom.
const EARTH_R = 2100
const EARTH_CX = VW / 2
const EARTH_CY = BASE_Y + EARTH_R // centre well below the frame

const Y_MIN = 2025
const Y_MAX = 2042 // a little headroom past the 2040 Mars goal

// ----------------------------------------------------------------------------
// Confidence taxonomy — the honesty axis
// ----------------------------------------------------------------------------
type Confidence = "done" | "scheduled" | "target" | "aspirational"

const CONF: Record<
  Confidence,
  { label: string; rank: number; tone: "teal" | "gold" | "violet" | "rose" }
> = {
  done: { label: "done", rank: 1, tone: "teal" },
  scheduled: { label: "scheduled · will slip", rank: 2, tone: "gold" },
  target: { label: "stated target", rank: 3, tone: "violet" },
  aspirational: { label: "aspirational · unfunded", rank: 4, tone: "rose" },
}

// solidity 1 (bright/solid) → 0 (ghosted) drives opacity + dashing
const SOLIDITY: Record<Confidence, number> = {
  done: 1,
  scheduled: 0.74,
  target: 0.5,
  aspirational: 0.26,
}

// ----------------------------------------------------------------------------
// Bands (bottom → top) and the milestone nodes within them
// ----------------------------------------------------------------------------
type BandKey = "leo" | "moon" | "mars"

interface Band {
  key: BandKey
  label: string
  sub: string
  /** fractional altitude window [lo, hi] within the climb, 0 = surface, 1 = top */
  lo: number
  hi: number
}

const BANDS: Band[] = [
  { key: "leo", label: "LOW EARTH ORBIT", sub: "orbital AI compute", lo: 0.06, hi: 0.42 },
  { key: "moon", label: "THE MOON", sub: "return + permanence", lo: 0.46, hi: 0.78 },
  { key: "mars", label: "MARS", sub: "the long horizon", lo: 0.82, hi: 0.99 },
]

interface Node {
  id: string
  band: BandKey
  /** vertical position inside the climb, 0 = surface → 1 = Mars horizon */
  alt: number
  /** horizontal offset from the central column, in px (± for left/right stagger) */
  dx: number
  year: number
  /** label shown beside the node */
  short: string
  /** full milestone sentence for the panel */
  milestone: string
  who: string
  conf: Confidence
  /** optional extra honesty note in the panel */
  note?: string
}

const NODES: Node[] = [
  // ---- LEO — orbital AI compute -------------------------------------------
  {
    id: "starcloud-1",
    band: "leo",
    alt: 0.1,
    dx: 96,
    year: 2025,
    short: "Starcloud-1, first H100 in orbit",
    milestone: "Starcloud-1 carries the first NVIDIA H100 GPU into orbit, datacentre-class AI silicon running off-planet.",
    who: "Starcloud (Nov 2025)",
    conf: "done",
  },
  {
    id: "suncatcher",
    band: "leo",
    alt: 0.24,
    dx: -104,
    year: 2027,
    short: "Project Suncatcher, TPU prototype sats",
    milestone: "Google's Project Suncatcher flies prototype TPU satellites, alongside Starcloud-2, testing solar-powered orbital compute constellations.",
    who: "Google · Starcloud (early 2027, announced)",
    conf: "scheduled",
  },
  {
    id: "gw-orbital",
    band: "leo",
    alt: 0.38,
    dx: 110,
    year: 2041,
    short: "Gigawatt orbital data-centres",
    milestone: "Gigawatt-scale orbital data-centres, continuous sunlight, radiative cooling, no land or water. The end-state the prototypes are reaching toward.",
    who: "industry vision (beyond 2040)",
    conf: "aspirational",
    note: "Speculative: depends on launch cost, in-space assembly and thermal management none of which exist at scale yet.",
  },
  // ---- The Moon ------------------------------------------------------------
  {
    id: "artemis-2",
    band: "moon",
    alt: 0.5,
    dx: -98,
    year: 2026,
    short: "Artemis II, crewed lunar flyby",
    milestone: "Artemis II, the first crewed flight around the Moon since Apollo 17, carrying four astronauts on a free-return flyby.",
    who: "NASA (Apr 2026)",
    conf: "done",
  },
  {
    id: "artemis-4",
    band: "moon",
    alt: 0.6,
    dx: 104,
    year: 2028,
    short: "Artemis IV, first crewed landing since 1972",
    milestone: "Artemis IV, boots on the lunar surface for the first time since 1972, with a stay at the Gateway station.",
    who: "NASA (~2028, scheduled)",
    conf: "scheduled",
    note: "Schedule will almost certainly slip, every Artemis milestone so far has.",
  },
  {
    id: "china-moon",
    band: "moon",
    alt: 0.68,
    dx: -96,
    year: 2030,
    short: "China crewed lunar landing",
    milestone: "China lands taikonauts on the Moon, a stated programme with hardware (Long March 10, Mengzhou, Lanyue) in test.",
    who: "CNSA (2029–30, target)",
    conf: "target",
  },
  {
    id: "ilrs",
    band: "moon",
    alt: 0.76,
    dx: 100,
    year: 2035,
    short: "ILRS station + ISRU; launch < $200/kg",
    milestone: "An International Lunar Research Station with in-situ resource use (water ice → propellant), as launch costs fall below $200/kg.",
    who: "CNSA-led ILRS (~2035, target)",
    conf: "target",
  },
  // ---- Mars (faint, top) ---------------------------------------------------
  {
    id: "mars-boot",
    band: "mars",
    alt: 0.88,
    dx: -88,
    year: 2040,
    short: "First human bootprints on Mars",
    milestone: "The first human bootprints on Mars, NASA's long-stated, “audacious” horizon goal.",
    who: "NASA (~2040, aspirational)",
    conf: "aspirational",
    note: "Unfunded as a programme. The date is a banner, not a manifest.",
  },
  {
    id: "terraform",
    band: "mars",
    alt: 0.96,
    dx: 84,
    year: 2042,
    short: "Terraforming, a horizon of centuries",
    milestone: "Terraforming Mars into a habitable world: a project of centuries, and “not possible using present-day technology.”",
    who: "Jakosky & Edwards · Nature Astronomy 2018",
    conf: "aspirational",
    note: "There is not enough accessible CO₂ on Mars to warm it to habitability with known methods. This is the faintest node for a reason.",
  },
]

// ----------------------------------------------------------------------------
// Scales
// ----------------------------------------------------------------------------
/** altitude fraction 0..1 (surface→Mars) → y in px (BASE at bottom, TOP at top) */
function altToY(alt: number): number {
  return lerp(BASE_Y, TOP_Y, clamp01(alt))
}
/** y on the Earth limb for a given x (shallow horizon curve) */
function earthLimbY(x: number): number {
  const dx = x - EARTH_CX
  return EARTH_CY - Math.sqrt(Math.max(0, EARTH_R * EARTH_R - dx * dx))
}

export function OffWorldStack() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = paletteFor(mode)

  const [year, setYear] = useState(2030)
  const [active, setActive] = useState<string | null>("starcloud-1")
  const [dragging, setDragging] = useState(false)

  const confColor = (c: Confidence) => p.series[CONF[c].tone]
  const reached = (n: Node) => n.year <= year

  const activeNode = active ? NODES.find((n) => n.id === active) ?? null : null
  const reachedCount = NODES.filter(reached).length

  // ---- pointer → year on the vertical altitude-hand ------------------------
  function pointerToYear(clientY: number): number {
    const svg = svgRef.current
    if (!svg) return year
    const rect = svg.getBoundingClientRect()
    const frac = (clientY - rect.top) / rect.height // 0 top → 1 bottom (svg space)
    const yPx = frac * VH
    // invert altToY: yPx = lerp(BASE_Y, TOP_Y, alt)  →  alt
    const alt = clamp01((BASE_Y - yPx) / (BASE_Y - TOP_Y))
    return Math.round(lerp(Y_MIN, Y_MAX, alt))
  }
  function onPointerDown(e: React.PointerEvent) {
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setDragging(true)
    setYear(pointerToYear(e.clientY))
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return
    setYear(pointerToYear(e.clientY))
  }
  function endDrag() {
    setDragging(false)
  }

  // year → altitude fraction → y for the hand
  const handAlt = clamp01((year - Y_MIN) / (Y_MAX - Y_MIN))
  const handY = altToY(handAlt)

  // legend rows
  const legend: Confidence[] = ["done", "scheduled", "target", "aspirational"]

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker={`Fig., The off-world stack · ${reachedCount}/${NODES.length} milestones reached by ${year}`}
      caption={
        activeNode ? (
          <>
            <strong style={{ color: p.ink, fontStyle: "normal" }}>
              {activeNode.year}, {activeNode.milestone}
            </strong>{" "}
            {activeNode.who}
            <span style={{ color: confColor(activeNode.conf) }}>
              {" "}
              · {CONF[activeNode.conf].label}
            </span>
            {activeNode.note ? (
              <span style={{ color: p.soft }}>, {activeNode.note}</span>
            ) : null}
          </>
        ) : (
          <>
            The industrial base climbs off Earth, orbital compute, then the
            Moon, then the long horizon of Mars. Drag the altitude-hand to scrub
            the year; hover a node for the milestone and who is behind it. The
            higher you climb, the fainter the marks: that fade toward Mars and
            terraforming is the honesty, not the decoration.
          </>
        )
      }
      controls={
        <span
          className="tabular-nums text-[13px] font-semibold"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.accent }}
        >
          {year}
        </span>
      }
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full touch-none select-none"
        role="img"
        aria-label={`The off-world stack, an ascending cross-section of humanity's industrial base leaving Earth. From the Earth limb at the bottom, up through low Earth orbit (orbital AI compute), to the Moon (return and permanence), to the faint red horizon of Mars (the long, aspirational goal). ${NODES.length} milestones are placed at their altitude and tagged by year and an honest confidence level, solid and bright where things have happened near Earth, faint and dashed toward Mars where they remain hopes. Currently showing the year ${year}, with ${reachedCount} of ${NODES.length} milestones reached.`}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <defs>
          {/* deep-space vertical wash: faint Mars-red at top → band bg below */}
          <linearGradient id="ows-space" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.series.rose} stopOpacity={mode === "dark" ? 0.14 : 0.08} />
            <stop offset="34%" stopColor={p.series.violet} stopOpacity={mode === "dark" ? 0.08 : 0.05} />
            <stop offset="62%" stopColor={p.series.cool} stopOpacity={mode === "dark" ? 0.06 : 0.04} />
            <stop offset="100%" stopColor={p.series.cool} stopOpacity="0" />
          </linearGradient>
          {/* Earth atmosphere glow rising off the limb */}
          <linearGradient id="ows-atmo" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={p.series.teal} stopOpacity={mode === "dark" ? 0.5 : 0.34} />
            <stop offset="45%" stopColor={p.series.cool} stopOpacity={mode === "dark" ? 0.22 : 0.16} />
            <stop offset="100%" stopColor={p.series.cool} stopOpacity="0" />
          </linearGradient>
          {/* Earth body fill */}
          <linearGradient id="ows-earth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.series.cool} stopOpacity={mode === "dark" ? 0.55 : 0.34} />
            <stop offset="100%" stopColor={p.series.cool} stopOpacity={mode === "dark" ? 0.8 : 0.52} />
          </linearGradient>
          {/* node ignition glow */}
          <radialGradient id="ows-node" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`rgba(${p.glowRGB},${mode === "dark" ? 0.4 : 0.28})`} />
            <stop offset="100%" stopColor={`rgba(${p.glowRGB},0)`} />
          </radialGradient>
        </defs>

        {/* deep-space wash across the whole climb */}
        <rect x={0} y={0} width={VW} height={VH} fill="url(#ows-space)" />

        {/* faint starfield (static, deterministic) toward the top */}
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x * VW}
            cy={TOP_Y + s.y * (BASE_Y - TOP_Y) * 0.92}
            r={s.r}
            fill={p.ink}
            opacity={s.o * (mode === "dark" ? 0.55 : 0.3) * (1 - s.y * 0.55)}
          />
        ))}

        {/* ---- altitude axis (left) ---- */}
        <line x1={COL_X} y1={TOP_Y} x2={COL_X} y2={BASE_Y} stroke={p.hair} strokeWidth={1} />
        {/* altitude ticks: surface, LEO, GEO-ish, cislunar, Moon, Mars (illustrative) */}
        {ALT_TICKS.map((t) => {
          const ty = altToY(t.alt)
          const lit = handAlt >= t.alt - 0.001
          return (
            <g key={t.label}>
              <line
                x1={COL_X - 7}
                x2={COL_X + 7}
                y1={ty}
                y2={ty}
                stroke={lit ? p.accent : p.soft}
                strokeOpacity={lit ? 0.8 : 0.45}
                strokeWidth={lit ? 1.3 : 0.8}
              />
              <text
                x={COL_X - 14}
                y={ty + 3.5}
                textAnchor="end"
                fontFamily="var(--font-mono), monospace"
                fontSize={9.5}
                letterSpacing={0.5}
                fill={lit ? p.muted : p.soft}
              >
                {t.label}
              </text>
            </g>
          )
        })}
        <text
          x={COL_X - 14}
          y={altToY(0.5)}
          textAnchor="middle"
          transform={`rotate(-90 ${COL_X - 84} ${altToY(0.5)})`}
          fontFamily="var(--font-mono), monospace"
          fontSize={9.5}
          letterSpacing={2.5}
          fill={p.soft}
          opacity={0}
        >
          ALTITUDE
        </text>

        {/* ---- band guides + labels ---- */}
        {BANDS.map((b) => {
          const yHi = altToY(b.hi)
          const yLo = altToY(b.lo)
          const yMid = (yHi + yLo) / 2
          const c =
            b.key === "leo" ? p.series.teal : b.key === "moon" ? p.series.gold : p.series.rose
          return (
            <g key={b.key}>
              {/* band field — a soft column behind the ascent line */}
              <rect
                x={COL_X - 2}
                y={yHi}
                width={VW - PAD_R - (COL_X - 2)}
                height={yLo - yHi}
                fill={c}
                opacity={0.04}
              />
              {/* band boundary hairlines */}
              <line x1={COL_X} x2={VW - PAD_R} y1={yHi} y2={yHi} stroke={c} strokeOpacity={0.22} strokeWidth={1} strokeDasharray="2 5" />
              {/* band label, riding the right edge */}
              <text
                x={VW - PAD_R}
                y={yHi + 16}
                textAnchor="end"
                fontFamily="var(--font-mono), monospace"
                fontSize={12.5}
                fontWeight={600}
                letterSpacing={2}
                fill={c}
                fillOpacity={0.95}
              >
                {b.label}
              </text>
              <text
                x={VW - PAD_R}
                y={yHi + 32}
                textAnchor="end"
                fontFamily="var(--font-serif), serif"
                fontStyle="italic"
                fontSize={11.5}
                fill={p.muted}
              >
                {b.sub}
              </text>
              {/* faint altitude band tag on the column */}
              <text
                x={COL_X + 10}
                y={yMid}
                fontFamily="var(--font-mono), monospace"
                fontSize={9}
                letterSpacing={1}
                fill={c}
                fillOpacity={0.3}
                transform={`rotate(-90 ${COL_X + 10} ${yMid})`}
                textAnchor="middle"
              >
                {b.key.toUpperCase()}
              </text>
            </g>
          )
        })}

        {/* ---- the ascent column: a glowing line that brightens up to `year` ---- */}
        {/* reached segment (bright) */}
        <line
          x1={COL_X}
          y1={BASE_Y}
          x2={COL_X}
          y2={handY}
          stroke={p.accent}
          strokeWidth={2.4}
          strokeLinecap="round"
          style={{ transition: dragging || reduced ? undefined : "all 240ms ease" }}
        />
        {/* ahead segment (ghost, dashed) */}
        <line
          x1={COL_X}
          y1={handY}
          x2={COL_X}
          y2={TOP_Y}
          stroke={p.soft}
          strokeWidth={1.2}
          strokeDasharray="3 7"
          style={{ transition: dragging || reduced ? undefined : "all 240ms ease" }}
        />

        {/* ---- connector stems + milestone nodes ---- */}
        {NODES.map((n) => {
          const ny = altToY(n.alt)
          const nx = COL_X + n.dx
          const c = confColor(n.conf)
          const sol = SOLIDITY[n.conf]
          const isReached = reached(n)
          const isActive = active === n.id
          // a reached node is at full strength; an unreached one is further ghosted
          const eff = sol * (isReached ? 1 : 0.42)
          const labelRight = n.dx >= 0
          const ringDash = n.conf === "done" ? undefined : n.conf === "scheduled" ? undefined : "3 3"
          const filled = n.conf === "done"
          return (
            <g
              key={n.id}
              tabIndex={0}
              role="button"
              aria-label={`${n.year}: ${n.milestone}, ${n.who}, ${CONF[n.conf].label}`}
              onMouseEnter={() => setActive(n.id)}
              onMouseLeave={() => setActive((cur) => (cur === n.id ? null : cur))}
              onFocus={() => setActive(n.id)}
              onClick={() => setActive(n.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setActive(n.id)
                  setYear(n.year)
                }
              }}
              style={{ cursor: "pointer", outline: "none" }}
            >
              {/* stem from column to node */}
              <line
                x1={COL_X}
                y1={ny}
                x2={nx}
                y2={ny}
                stroke={c}
                strokeOpacity={0.3 + 0.4 * eff}
                strokeWidth={1}
                strokeDasharray={n.conf === "aspirational" ? "2 4" : undefined}
              />

              {/* ignition bloom when reached + active */}
              {isReached && isActive && (
                <circle cx={nx} cy={ny} r={26} fill="url(#ows-node)" />
              )}

              {/* node marker — solidity encodes confidence */}
              {filled ? (
                <circle
                  cx={nx}
                  cy={ny}
                  r={isActive ? 8 : 6.4}
                  fill={c}
                  fillOpacity={eff}
                  stroke={mode === "dark" ? "#0c1828" : "#fbf7ec"}
                  strokeWidth={1.6}
                  style={{ transition: reduced ? undefined : "r 200ms ease" }}
                />
              ) : (
                <>
                  {/* hollow ring; dash + opacity carry the confidence */}
                  <circle
                    cx={nx}
                    cy={ny}
                    r={isActive ? 8 : 6.4}
                    fill={p.bg}
                    fillOpacity={isReached ? 0.9 : 0.55}
                    stroke={c}
                    strokeOpacity={0.35 + 0.55 * eff}
                    strokeWidth={1.8}
                    strokeDasharray={ringDash}
                    style={{ transition: reduced ? undefined : "r 200ms ease" }}
                  />
                  {/* tiny centre dot for legibility */}
                  <circle cx={nx} cy={ny} r={1.7} fill={c} fillOpacity={0.4 + 0.5 * eff} />
                </>
              )}

              {/* year tag */}
              <text
                x={labelRight ? nx + 12 : nx - 12}
                y={ny - 7}
                textAnchor={labelRight ? "start" : "end"}
                fontFamily="var(--font-mono), monospace"
                fontSize={11}
                fontWeight={600}
                fill={isActive ? p.accent : c}
                fillOpacity={0.55 + 0.45 * eff}
              >
                {n.year}
              </text>
              {/* short milestone label */}
              <text
                x={labelRight ? nx + 12 : nx - 12}
                y={ny + 8}
                textAnchor={labelRight ? "start" : "end"}
                fontFamily="var(--font-mono), monospace"
                fontSize={10}
                fill={p.ink}
                fillOpacity={(isActive ? 0.92 : 0.62) * (isReached ? 1 : 0.72)}
              >
                {n.short}
              </text>
            </g>
          )
        })}

        {/* ---- the altitude-hand (year scrubber) ---- */}
        <g style={{ transition: dragging || reduced ? undefined : "all 240ms ease" }}>
          <line
            x1={COL_X - 18}
            y1={handY}
            x2={VW - PAD_R}
            y2={handY}
            stroke={p.accent}
            strokeOpacity={0.28}
            strokeWidth={1}
            strokeDasharray="1 4"
          />
          <circle
            cx={COL_X}
            cy={handY}
            r={dragging ? 11 : 8.5}
            fill={p.accent}
            stroke={mode === "dark" ? "#0c1828" : "#fbf7ec"}
            strokeWidth={2.5}
            onPointerDown={onPointerDown}
            style={{ cursor: "grab" }}
          >
            <title>Drag to scrub the year</title>
          </circle>
          <text
            x={COL_X + 16}
            y={handY - 9}
            fontFamily="var(--font-mono), monospace"
            fontSize={12}
            fontWeight={700}
            fill={p.accent}
          >
            {year}
          </text>
        </g>

        {/* ---- Earth limb at the bottom ---- */}
        {/* atmosphere glow band hugging the horizon */}
        <path
          d={`${earthArcPath(0)} L ${VW} ${BASE_Y - 64} L 0 ${BASE_Y - 64} Z`}
          fill="url(#ows-atmo)"
        />
        {/* Earth body */}
        <path d={`${earthArcPath(0)} L ${VW} ${VH} L 0 ${VH} Z`} fill="url(#ows-earth)" />
        {/* crisp horizon line */}
        <path d={earthArcPath(0)} fill="none" stroke={p.series.teal} strokeOpacity={0.7} strokeWidth={1.5} />
        <text
          x={VW - PAD_R}
          y={BASE_Y + 28}
          textAnchor="end"
          fontFamily="var(--font-mono), monospace"
          fontSize={11}
          letterSpacing={2}
          fill={mode === "dark" ? p.bg : "#fbf7ec"}
          fillOpacity={0.9}
        >
          EARTH · SURFACE · ALT 0
        </text>

        {/* ---- confidence legend (top-left, inside the Mars sky) ---- */}
        <g transform={`translate(${COL_X - 4}, ${TOP_Y - 36})`}>
          <text
            x={0}
            y={0}
            fontFamily="var(--font-mono), monospace"
            fontSize={9.5}
            letterSpacing={2}
            fill={p.soft}
          >
            CONFIDENCE
          </text>
          {legend.map((c, i) => {
            const lx = i * 132
            const col = confColor(c)
            const sol = SOLIDITY[c]
            return (
              <g key={c} transform={`translate(${lx}, 14)`}>
                {c === "done" ? (
                  <circle cx={5} cy={0} r={4.5} fill={col} fillOpacity={sol} />
                ) : (
                  <circle
                    cx={5}
                    cy={0}
                    r={4.5}
                    fill="none"
                    stroke={col}
                    strokeOpacity={0.4 + 0.55 * sol}
                    strokeWidth={1.6}
                    strokeDasharray={c === "scheduled" ? undefined : "2.5 2.5"}
                  />
                )}
                <text
                  x={15}
                  y={3}
                  fontFamily="var(--font-mono), monospace"
                  fontSize={9}
                  fill={p.muted}
                >
                  {CONF[c].label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {/* ---- accessible year slider (mirrors the altitude-hand) ---- */}
      <div className="mt-1 flex items-center gap-3 px-1">
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
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
          aria-label="Scrub the year to reveal off-world milestones as they are reached"
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
          style={{ accentColor: p.accent, background: p.hair }}
        />
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          {Y_MAX}
        </span>
      </div>
    </PlateFrame>
  )
}

// ----------------------------------------------------------------------------
// Static helpers / data outside the component
// ----------------------------------------------------------------------------

/** Path tracing the Earth limb across the frame at a given vertical offset. */
function earthArcPath(yOffset: number): string {
  const steps = 24
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * VW
    const y = earthLimbY(x) + yOffset
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(" ")
}

/** Illustrative altitude tick labels along the ascent (not to scale — a ladder). */
const ALT_TICKS: { alt: number; label: string }[] = [
  { alt: 0.0, label: "surface" },
  { alt: 0.14, label: "LEO ~550 km" },
  { alt: 0.32, label: "GEO ~36,000 km" },
  { alt: 0.5, label: "cislunar" },
  { alt: 0.66, label: "lunar surface" },
  { alt: 0.86, label: "interplanetary" },
  { alt: 0.99, label: "Mars ~225M km" },
]

/** Deterministic faint starfield (no RNG → SSR-stable). */
const STARS: { x: number; y: number; r: number; o: number }[] = (() => {
  const out: { x: number; y: number; r: number; o: number }[] = []
  let seed = 1337
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  for (let i = 0; i < 70; i++) {
    out.push({ x: rnd(), y: rnd(), r: 0.5 + rnd() * 1.1, o: 0.3 + rnd() * 0.7 })
  }
  return out
})()
