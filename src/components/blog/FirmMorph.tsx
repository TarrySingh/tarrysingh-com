"use client"

/**
 * FirmMorph — the firm, reinvented.
 *
 * A LIVING org chart. Drag the "AI leverage" scrubber (2020 → 2030) and watch
 * a single industrial firm DIVIDE — like an organism — into a Cambrian
 * constellation of 10×/100× micro-companies.
 *
 *   • State A (low leverage / 2020): one big bounded org — a dense pyramid of
 *     ~72 small HUMAN nodes under a single boundary; a handful of agents.
 *     Readout: large headcount, ~$200k revenue/employee (typical SaaS).
 *   • State B (high leverage / 2030): the monolith fractures into ten tiny
 *     constellations — each a few HUMAN nodes orbited by many AGENT nodes
 *     (a distinct colour). Headcount per firm collapses; revenue/employee
 *     soars; one node is "the one-person, $1B company (~2028)".
 *
 * The morph interpolates every node's position + opacity with easeInOut on a
 * single leverage value `t`; live tabular readouts interpolate alongside it.
 * Reduced motion snaps to the nearer state. Layout is DETERMINISTIC (a seeded
 * PRNG, precomputed once) so it is stable across renders. Theme-aware via the
 * Read mode; keyboard-operable slider.
 */

import { useMemo, useRef, useState } from "react"
import {
  PlateFrame,
  paletteFor,
  useReadMode,
  usePrefersReducedMotion,
  lerp,
  clamp01,
  easeInOut,
} from "./read-chart-kit"

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------
const VW = 960
const VH = 600
const CX = VW / 2
const CY = 286

const YEAR_0 = 2020
const YEAR_1 = 2030

// State A — the industrial firm
const N_HUMANS = 72 // workforce inside the monolith
const PYRAMID_ROWS = [1, 2, 4, 6, 8, 10, 12, 14, 15] // sums to 72
const A_AGENTS = 6 // few agents in the old firm

// State B — the constellation
const N_FIRMS = 10 // micro-companies the monolith fractures into
// humans + agents per micro-firm (firm 0 is the one-person, $1B company)
const FIRM_HUMANS = [1, 2, 3, 2, 4, 2, 3, 1, 2, 3] // 23 humans survive
const FIRM_AGENTS = [9, 7, 8, 6, 10, 7, 8, 9, 6, 7] // many agents orbit each

const TOTAL_HUMANS = Math.max(
  N_HUMANS,
  FIRM_HUMANS.reduce((a, b) => a + b, 0),
)
const TOTAL_AGENTS = Math.max(
  A_AGENTS,
  FIRM_AGENTS.reduce((a, b) => a + b, 0),
)

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32) — precompute layout, never random in render
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Pt = { x: number; y: number }

interface HumanLayout {
  a: Pt // position in the industrial firm
  b: Pt // position in the constellation
  firm: number // which micro-firm it migrates to in state B
  special: boolean // the one-person, $1B company founder
}
interface AgentLayout {
  a: Pt
  b: Pt
  firm: number
  /** orbit phase for a faint drift in state B */
  phase: number
  radius: number
}
interface FirmCluster {
  center: Pt
  r: number // bounding radius of the micro-firm
}

/** Build both states once, deterministically. */
function buildLayout() {
  const rnd = mulberry32(0x50f7b3)

  // ---- micro-firm cluster centres (state B): a loose, elegant scatter -----
  // Placed on two gentle rings + the founder firm near the heart, jittered.
  const firms: FirmCluster[] = []
  const ringDefs = [
    { count: 4, rad: 132, base: -Math.PI / 2 + 0.18, r: 46 },
    { count: 5, rad: 236, base: -Math.PI / 2 + 0.62, r: 52 },
  ]
  // firm 0 — the founder / one-person $1B company — sits upper-centre, alone
  firms.push({ center: { x: CX, y: CY - 196 }, r: 40 })
  let placed = 1
  for (const ring of ringDefs) {
    for (let i = 0; i < ring.count && placed < N_FIRMS; i++, placed++) {
      const ang = ring.base + (i / ring.count) * Math.PI * 2
      const jr = ring.rad + (rnd() - 0.5) * 30
      const ja = ang + (rnd() - 0.5) * 0.16
      firms.push({
        center: {
          x: CX + Math.cos(ja) * jr * 1.42, // widen horizontally for the 16:10 stage
          y: CY + Math.sin(ja) * jr,
        },
        r: ring.r,
      })
    }
  }

  // ---- humans -------------------------------------------------------------
  // State A: a dense pyramid/hierarchy centred under the boundary apex.
  const humans: HumanLayout[] = []
  const apexY = CY - 150
  const rowGap = 30
  const colGap = 27
  const pyramid: Pt[] = []
  PYRAMID_ROWS.forEach((count, row) => {
    const y = apexY + row * rowGap
    const w = (count - 1) * colGap
    for (let i = 0; i < count; i++) {
      pyramid.push({ x: CX - w / 2 + i * colGap, y })
    }
  })

  // assign each human to a micro-firm for state B (founder firm gets exactly 1)
  const firmSlots: number[] = []
  FIRM_HUMANS.forEach((h, f) => {
    for (let i = 0; i < h; i++) firmSlots.push(f)
  })

  for (let i = 0; i < TOTAL_HUMANS; i++) {
    const aPos = pyramid[i] ?? {
      x: CX + (rnd() - 0.5) * 360,
      y: apexY + PYRAMID_ROWS.length * rowGap + (rnd() - 0.5) * 20,
    }
    const firm = firmSlots[i] ?? Math.floor(rnd() * N_FIRMS)
    const special = firm === 0 // founder firm carries the single human
    // State B: humans cluster TIGHT at the heart of their micro-firm
    const cl = firms[firm]
    const ang = rnd() * Math.PI * 2
    const rr = special ? 0 : rnd() * cl.r * 0.34
    humans.push({
      a: aPos,
      b: { x: cl.center.x + Math.cos(ang) * rr, y: cl.center.y + Math.sin(ang) * rr },
      firm,
      special,
    })
  }

  // ---- agents -------------------------------------------------------------
  // State A: a few agents drift at the firm's edge (bottom band).
  // State B: many agents ORBIT the humans of each micro-firm.
  const agents: AgentLayout[] = []
  const agentFirmSlots: number[] = []
  FIRM_AGENTS.forEach((g, f) => {
    for (let i = 0; i < g; i++) agentFirmSlots.push(f)
  })
  // per-firm running index so agents fan out evenly on their orbit
  const firmAgentIdx = new Array(N_FIRMS).fill(0)

  for (let i = 0; i < TOTAL_AGENTS; i++) {
    const firm = agentFirmSlots[i] ?? Math.floor(rnd() * N_FIRMS)
    const cl = firms[firm]
    const idxInFirm = firmAgentIdx[firm]++
    const countInFirm = FIRM_AGENTS[firm] ?? 1
    const phase = (idxInFirm / countInFirm) * Math.PI * 2 + rnd() * 0.4
    const radius = cl.r * (0.62 + (idxInFirm % 2) * 0.26) + rnd() * 4
    // State A: parked along a faint sub-stratum beneath the pyramid
    const aPos: Pt = {
      x: CX - 150 + (i / Math.max(1, TOTAL_AGENTS - 1)) * 300,
      y: apexY + PYRAMID_ROWS.length * rowGap + 34,
    }
    agents.push({
      a: aPos,
      b: { x: cl.center.x + Math.cos(phase) * radius, y: cl.center.y + Math.sin(phase) * radius },
      firm,
      phase,
      radius,
    })
  }

  return { firms, humans, agents }
}

// ---------------------------------------------------------------------------
// Readout interpolation (directional figures — hedged in the caption)
// ---------------------------------------------------------------------------
function fmtMoney(v: number): string {
  // v is revenue/employee in USD
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  return `$${Math.round(v / 1000)}k`
}
function fmtInt(v: number): string {
  return Math.round(v).toLocaleString("en-US")
}

export function FirmMorph() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = paletteFor(mode)

  // raw slider value 0..1000 for smooth keyboard control → leverage t in [0,1]
  const [raw, setRaw] = useState(0)
  const tRaw = clamp01(raw / 1000)
  // reduced motion: snap to nearer pole so there is no in-between animation
  const t = reduced ? (tRaw < 0.5 ? 0 : 1) : tRaw
  const e = easeInOut(t) // morph progress for positions/opacity

  const layout = useMemo(buildLayout, [])
  const { firms, humans, agents } = layout

  // ---- node colours -------------------------------------------------------
  const humanCol = p.series.gold
  const agentCol = p.series.teal // the distinct AGENT colour
  const founderCol = p.series.copper

  // ---- live readouts (interpolated) --------------------------------------
  const firmsCount = lerp(1, N_FIRMS, e)
  const headcountMedian = lerp(N_HUMANS, 2, e) // median firm headcount
  const revPerEmp = lerp(200_000, 3_000_000, e) // $/employee, directional
  const agentsPerHuman = lerp(
    A_AGENTS / N_HUMANS,
    TOTAL_AGENTS / FIRM_HUMANS.reduce((a, b) => a + b, 0),
    e,
  )

  const yearLabel = Math.round(lerp(YEAR_0, YEAR_1, t))
  const leveragePct = Math.round(t * 100)

  // founder node lights past the midpoint (its prediction is ~2028)
  const founderReveal = clamp01((t - 0.55) / 0.3)

  // ---- helpers ------------------------------------------------------------
  const pos = (a: Pt, b: Pt): Pt => ({ x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) })
  const trans = reduced ? undefined : "opacity 360ms ease"

  // boundary (state A) rounded-rect path — fades out as the firm dissolves
  const boundOpacity = (1 - clamp01(e / 0.7)) * (mode === "dark" ? 0.5 : 0.42)

  // halo gradient ids
  const founder = humans.find((h) => h.special)
  const founderPos = founder ? pos(founder.a, founder.b) : { x: CX, y: CY - 196 }

  const readouts: { label: string; value: string; tone: string }[] = [
    { label: "firms", value: fmtInt(firmsCount), tone: humanCol },
    { label: "median headcount", value: fmtInt(headcountMedian), tone: founderCol },
    { label: "revenue / employee", value: fmtMoney(revPerEmp), tone: agentCol },
    { label: "agents per human", value: `${agentsPerHuman.toFixed(agentsPerHuman < 10 ? 1 : 0)}×`, tone: p.series.violet },
  ]

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker={`Fig. — The firm, reinvented · AI leverage ${leveragePct}% · ~${yearLabel}`}
      controls={
        <span
          className="tabular-nums text-[13px] font-semibold"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.accent }}
        >
          {t < 0.5 ? "INDUSTRIAL FIRM" : "CAMBRIAN CONSTELLATION"}
        </span>
      }
      caption={
        <>
          Slide AI leverage and the bounded industrial firm{" "}
          <strong style={{ color: p.ink, fontStyle: "normal" }}>divides</strong> into a swarm of
          tiny, agent-amplified micro-companies. The revenue/employee figures are{" "}
          <em>directional</em>, not audited — Midjourney was{" "}
          <em>reportedly</em> near $3–5M/employee against ~$200k at a typical SaaS firm (private
          companies; journalist estimates). The “one-person, $1B company (~2028)” is Sam
          Altman’s <em>prediction</em> — a founder’s bet, median guess, not a confirmed fact.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full touch-none select-none"
        role="img"
        aria-label={`The firm reinvented — an interactive morph. At low AI leverage, one industrial firm holds about ${N_HUMANS} people in a single hierarchy at roughly two hundred thousand dollars of revenue per employee. As leverage rises toward the year 2030, the firm fractures into ${N_FIRMS} micro-companies, each a few people orbited by many AI agents, with revenue per employee rising into the millions, including a one-person billion-dollar company. Currently at ${leveragePct}% leverage, around the year ${yearLabel}.`}
      >
        <defs>
          <radialGradient id="fm-bloom" cx="50%" cy="46%" r="62%">
            <stop offset="0%" stopColor={`rgba(${p.glowRGB},${mode === "dark" ? 0.14 : 0.08})`} />
            <stop offset="70%" stopColor={`rgba(${p.glowRGB},0)`} />
          </radialGradient>
          <radialGradient id="fm-founder" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={founderCol} stopOpacity={mode === "dark" ? 0.9 : 0.7} />
            <stop offset="60%" stopColor={founderCol} stopOpacity="0.25" />
            <stop offset="100%" stopColor={founderCol} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fm-firm-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`rgba(${p.glowRGB},${mode === "dark" ? 0.12 : 0.07})`} />
            <stop offset="100%" stopColor={`rgba(${p.glowRGB},0)`} />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={VW} height={VH} fill="url(#fm-bloom)" />

        {/* ---- State A : the single bounded firm ---------------------------- */}
        <g style={{ opacity: boundOpacity, transition: reduced ? undefined : "opacity 300ms ease" }}>
          <rect
            x={CX - 250}
            y={CY - 178}
            width={500}
            height={332}
            rx={26}
            fill="none"
            stroke={p.muted}
            strokeWidth={1.4}
            strokeDasharray="2 6"
          />
          <text
            x={CX - 250 + 14}
            y={CY - 178 - 12}
            fontFamily="var(--font-mono), monospace"
            fontSize={12}
            letterSpacing={2}
            fill={p.muted}
          >
            ONE FIRM · ~{N_HUMANS} PEOPLE · ~$200k / EMPLOYEE
          </text>
        </g>

        {/* ---- micro-firm halos + labels (State B) -------------------------- */}
        {firms.map((f, i) => {
          const reveal = clamp01((e - 0.34) / 0.4)
          if (reveal <= 0) return null
          const isFounder = i === 0
          const fadeIn = isFounder ? reveal * founderReveal : reveal
          return (
            <g key={`firm-${i}`} style={{ opacity: fadeIn, transition: trans }}>
              <circle cx={f.center.x} cy={f.center.y} r={f.r + 16} fill="url(#fm-firm-halo)" />
              <circle
                cx={f.center.x}
                cy={f.center.y}
                r={f.r}
                fill="none"
                stroke={isFounder ? founderCol : p.hair}
                strokeOpacity={isFounder ? 0.55 : 1}
                strokeWidth={1}
                strokeDasharray="1 5"
              />
            </g>
          )
        })}

        {/* ---- coupling threads: humans → their agents (State B) ----------- */}
        {agents.map((g, i) => {
          const reveal = clamp01((e - 0.4) / 0.4)
          if (reveal <= 0) return null
          const fc = firms[g.firm].center
          const ap = pos(g.a, g.b)
          return (
            <line
              key={`thread-${i}`}
              x1={fc.x}
              y1={fc.y}
              x2={ap.x}
              y2={ap.y}
              stroke={agentCol}
              strokeOpacity={0.18 * reveal}
              strokeWidth={0.8}
            />
          )
        })}

        {/* ---- agent nodes -------------------------------------------------- */}
        {agents.map((g, i) => {
          const pt = pos(g.a, g.b)
          // agents are dim/parked in state A, bright + present in state B
          const op = lerp(0.22, 0.92, e)
          const r = lerp(2, 3.4, e)
          return (
            <circle
              key={`agent-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={r}
              fill={agentCol}
              fillOpacity={op}
              stroke={mode === "dark" ? "#0c1828" : "#fbf7ec"}
              strokeWidth={0.6}
            />
          )
        })}

        {/* ---- human nodes -------------------------------------------------- */}
        {humans.map((h, i) => {
          if (h.special) return null // founder drawn last, on top
          const pt = pos(h.a, h.b)
          return (
            <circle
              key={`human-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={lerp(4.4, 5.4, e)}
              fill={humanCol}
              fillOpacity={lerp(0.78, 0.96, e)}
              stroke={mode === "dark" ? "#0c1828" : "#fbf7ec"}
              strokeWidth={1}
            />
          )
        })}

        {/* ---- the founder : the one-person, $1B company ------------------- */}
        {founder && (
          <g style={{ opacity: lerp(0.78, 1, e), transition: trans }}>
            {founderReveal > 0 && (
              <circle
                cx={founderPos.x}
                cy={founderPos.y}
                r={34}
                fill="url(#fm-founder)"
                style={{ opacity: founderReveal }}
              />
            )}
            <circle
              cx={founderPos.x}
              cy={founderPos.y}
              r={lerp(4.4, 7, e)}
              fill={founderCol}
              stroke={mode === "dark" ? "#0c1828" : "#fbf7ec"}
              strokeWidth={1.5}
            />
            {founderReveal > 0 && (
              <g style={{ opacity: founderReveal }}>
                <text
                  x={founderPos.x}
                  y={founderPos.y - 26}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), monospace"
                  fontSize={12}
                  fontWeight={600}
                  letterSpacing={1}
                  fill={founderCol}
                >
                  THE ONE-PERSON, $1B COMPANY
                </text>
                <text
                  x={founderPos.x}
                  y={founderPos.y - 11}
                  textAnchor="middle"
                  fontFamily="var(--font-serif), serif"
                  fontSize={11}
                  fontStyle="italic"
                  fill={p.muted}
                >
                  ~2028 · Altman’s prediction, not a fact
                </text>
              </g>
            )}
          </g>
        )}

        {/* ---- legend ------------------------------------------------------- */}
        <g
          transform={`translate(${CX - 130}, ${VH - 92})`}
          fontFamily="var(--font-mono), monospace"
          fontSize={12}
        >
          <circle cx={0} cy={0} r={5} fill={humanCol} />
          <text x={12} y={4} fill={p.muted}>
            human
          </text>
          <circle cx={86} cy={0} r={4} fill={agentCol} />
          <text x={98} y={4} fill={p.muted}>
            AI agent
          </text>
        </g>

        {/* ---- live readouts (tabular mono) -------------------------------- */}
        <g transform={`translate(0, ${VH - 56})`}>
          {readouts.map((r, i) => {
            const colW = VW / readouts.length
            const x = colW * i + colW / 2
            return (
              <g key={r.label} transform={`translate(${x}, 0)`}>
                <text
                  textAnchor="middle"
                  y={0}
                  fontFamily="var(--font-mono), monospace"
                  fontSize={10}
                  letterSpacing={1.5}
                  fill={p.soft}
                >
                  {r.label.toUpperCase()}
                </text>
                <text
                  textAnchor="middle"
                  y={26}
                  className="tabular-nums"
                  fontFamily="var(--font-mono), monospace"
                  fontSize={22}
                  fontWeight={600}
                  fill={r.tone}
                >
                  {r.value}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {/* ---- the AI-leverage scrubber (keyboard-operable) ------------------ */}
      <div className="mt-1 flex items-center gap-3 px-1">
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          2020 · low
        </span>
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={raw}
          onChange={(ev) => setRaw(Number(ev.target.value))}
          aria-label="AI leverage — slide from the 2020 industrial firm to the 2030 Cambrian constellation of micro-companies"
          aria-valuetext={`${leveragePct}% AI leverage, around the year ${yearLabel}`}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
          style={{ accentColor: p.accent, background: p.hair }}
        />
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          2030 · high
        </span>
      </div>
    </PlateFrame>
  )
}
