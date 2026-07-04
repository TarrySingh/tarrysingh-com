"use client"

/**
 * V12 · THE SELF-DRIVING LAB - the closing instrument of THE ENGINE ROOM.
 *
 * R&D is a loop and a harness too. A self-driving lab runs a closed
 * DESIGN -> MAKE -> TEST -> ANALYZE (DMTA) campaign, and verification (the
 * assay / characterization step) is the bottleneck at laboratory scale,
 * exactly as it is in software. The reader allocates a fixed campaign budget
 * across the four stages; starving the TEST/ANALYZE (verification) half
 * inflates APPARENT hits while true VALIDATED discoveries fall.
 *
 * SCHEMATIC vs MEASURED, stated in the method lane:
 *  - The allocation sim (apparent vs validated counts under each preset) is a
 *    SCHEMATIC, deterministic model of the verification-bottleneck argument.
 *    It is not a measurement of any one system.
 *  - The named anchors are MEASURED, published results and frame the argument:
 *      A-Lab (Berkeley, Nature 2023): 353 experiments over 17 days, 41 novel
 *      compounds from 58 targets (abstract 36 of 57), only ~30% first-attempt.
 *      Carries the published critique (Palgrave/Schoop via Chemistry World
 *      2024): PXRD-only verify stage, Rietveld 'very bad ... novice human
 *      level'; Nature issued an Author Correction 19 Jan 2026 (C&EN).
 *      GNoME (DeepMind, Nature 2023): 2.2M predicted crystals, 380,000 most
 *      stable; hit-rate ~50% -> ~80%; 736 externally synthesized.
 *      Coscientist (Boiko et al., Nature 2023): GPT-4 agent, robotic Suzuki /
 *      Sonogashira couplings.
 *
 * Autonomy ends where the human PI's judgment begins: the A-Lab lesson is that
 * a starved verify stage produced confident, wrong phase identifications.
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useState } from "react"
import { InstrumentFrame, mulberry32, rgba, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// The four DMTA stages, placed on a cycle (angles clockwise from top).
// ---------------------------------------------------------------------------

interface Stage {
  key: "design" | "make" | "test" | "analyze"
  label: string
  sub: string
  angle: number // degrees, 0 = right, clockwise positive (SVG y-down)
  /** true = a verification stage (the bottleneck half) */
  verify: boolean
}

const STAGES: Stage[] = [
  { key: "design", label: "DESIGN", sub: "hypothesis", angle: -90, verify: false },
  { key: "make", label: "MAKE", sub: "synthesis", angle: 0, verify: false },
  { key: "test", label: "TEST", sub: "assay", angle: 90, verify: true },
  { key: "analyze", label: "ANALYZE", sub: "characterize", angle: 180, verify: true },
]

// ---------------------------------------------------------------------------
// Budget allocation presets. Each splits 100 units of campaign budget across
// the four stages. The names match the brief.
// ---------------------------------------------------------------------------

interface Preset {
  key: string
  name: string
  alloc: Record<Stage["key"], number> // sums to 100
}

const PRESETS: Preset[] = [
  {
    key: "balanced",
    name: "BALANCED",
    alloc: { design: 25, make: 25, test: 25, analyze: 25 },
  },
  {
    key: "hypothesis",
    name: "HYPOTHESIS-HEAVY",
    alloc: { design: 46, make: 24, test: 16, analyze: 14 },
  },
  {
    key: "synthesis",
    name: "SYNTHESIS-HEAVY",
    alloc: { design: 16, make: 52, test: 18, analyze: 14 },
  },
  {
    key: "assay",
    name: "ASSAY-HEAVY",
    alloc: { design: 18, make: 20, test: 34, analyze: 28 },
  },
]

// ---------------------------------------------------------------------------
// SCHEMATIC campaign model. Deterministic, seeded, no wall-clock.
//
// candidatesMade: MAKE throughput sets how many candidates get flagged as
//   apparent hits (more synthesis budget -> more raw flags).
// verifyDepth: the TEST+ANALYZE share is the verification budget; it sets the
//   fraction of apparent hits that survive characterization as VALIDATED.
//   A starved verify half lets more false positives through (apparent stays
//   high) while true validated yield collapses.
//
// The shape is the argument, not a measurement. The A-Lab anchor is the real
// evidence that a thin verify stage produces confident, wrong calls.
// ---------------------------------------------------------------------------

interface Outcome {
  apparent: number // apparent hits (flagged), schematic count
  validated: number // survive verification, schematic count
  falsePos: number // apparent - validated
  precision: number // validated / apparent, 0..1
}

function computeOutcome(alloc: Record<Stage["key"], number>): Outcome {
  // A fixed seed keeps SSR === CSR. The jitter only textures the schematic
  // counts; the monotone relationships are deterministic in the allocation.
  const rnd = mulberry32(0x5e1f1ab0)
  const make = alloc.make
  const verify = alloc.test + alloc.analyze

  // Apparent hits: grow with MAKE throughput. A campaign that synthesizes more
  // simply flags more candidates as apparent successes.
  const apparent = Math.round(14 + make * 1.05 + (rnd() - 0.5) * 1.2)

  // Verification survival: a saturating function of the verify share. Below a
  // floor the assay cannot separate real from artefact, so precision craters.
  // v = 20 (heavily starved) -> ~0.30; v = 50 (balanced) -> ~0.70;
  // v = 62 (assay-heavy) -> ~0.80. Saturates, never reaches 1 (no assay is
  // perfect; the human PI is the final gate).
  const precision = 0.12 + 0.78 * (1 - Math.exp(-verify / 34))
  const validated = Math.max(2, Math.round(apparent * precision))
  const falsePos = Math.max(0, apparent - validated)

  return { apparent, validated, falsePos, precision: validated / apparent }
}

// ---------------------------------------------------------------------------
// Anchors: the real, published systems that frame the schematic.
// ---------------------------------------------------------------------------

interface Anchor {
  key: string
  name: string
  line: string
  detail: string
}

const ANCHORS: Anchor[] = [
  {
    key: "alab",
    name: "A-LAB",
    line: "353 runs · 17 days · 41 of 58",
    detail: "Berkeley, Nature 2023 · verify stage was PXRD-only · Rietveld 'very bad ... novice human level' · Author Correction 19 Jan 2026",
  },
  {
    key: "gnome",
    name: "GNoME",
    line: "2.2M predicted · 380,000 stable",
    detail: "DeepMind, Nature 2023 · hit-rate ~50% to ~80% · 736 externally synthesized",
  },
  {
    key: "coscientist",
    name: "COSCIENTIST",
    line: "GPT-4 agent · robotic couplings",
    detail: "Boiko et al., Nature 2023 · Suzuki and Sonogashira on liquid handlers",
  },
]

// ---------------------------------------------------------------------------

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

// An arc segment on the ring between two angles (SVG y-down, clockwise).
function ringArc(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(cx, cy, r, a0)
  const [x1, y1] = polar(cx, cy, r, a1)
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

function LabScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p } = ctx
  const [presetIdx, setPresetIdx] = useState(0) // start BALANCED
  const preset = PRESETS[presetIdx]
  const alloc = preset.alloc
  const out = computeOutcome(alloc)

  const verifyShare = alloc.test + alloc.analyze
  const starved = verifyShare < 40
  const precPct = Math.round(out.precision * 100)

  // Verdict string changes with allocation.
  const verdict = starved
    ? `assay-starved · apparent ${out.apparent} · validated ${out.validated} · precision ${precPct}% · the A-Lab lesson`
    : verifyShare >= 55
      ? `verify-funded · apparent ${out.apparent} · validated ${out.validated} · precision ${precPct}% · the loop earns its yes`
      : `balanced · apparent ${out.apparent} · validated ${out.validated} · precision ${precPct}%`

  // ------- geometry -------
  const W = compact ? 460 : 980
  const H = compact ? 940 : 594

  const ring = compact
    ? { cx: 230, cy: 214, r: 132 }
    : { cx: 268, cy: 288, r: 168 }

  // The readout panel (apparent vs validated bars).
  // In compact the panel sits below the ring, so yTop is pushed down and the
  // heading/subline offsets shrink (below) so they clear the ring's bottom
  // TEST/assay labels instead of rising into them.
  const panel = compact
    ? { x0: 60, x1: 404, yTop: 490, yBottom: 700 }
    : { x0: 560, x1: 936, yTop: 150, yBottom: 470 }

  // Heading/subline offsets above the hero readout. Desktop values are tuned to
  // sit above a fs44 hero; compact values keep the subline clear of the fs40
  // hero box AND keep the heading clear of the ring's bottom labels.
  const headOff = compact ? 62 : 70
  const subOff = compact ? 44 : 54

  // Anchor strip.
  const anchorY = compact ? 792 : 538

  const fs = compact ? 17 : 13.5

  // Text-width guard for the hero readouts (mono ~0.62 em).
  const monoW = (s: string, size: number) => s.length * size * 0.62

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>The self-driving lab: a DMTA campaign loop with a verification bottleneck</title>
        <desc>
          A closed design, make, test, analyze research loop. A fixed campaign budget is
          allocated across the four stages. Starving the test and analyze (verification)
          stages inflates apparent hits while true validated discoveries fall. The named
          systems A-Lab, GNoME and Coscientist frame the argument as published results.
        </desc>

        {/* ===================== the DMTA ring ===================== */}
        <text
          x={ring.cx}
          y={compact ? 16 : 34}
          textAnchor="middle"
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.2em", fontFamily: "var(--font-mono), monospace" }}
        >
          DMTA CAMPAIGN LOOP · {preset.name}
        </text>

        {/* ring base */}
        <circle cx={ring.cx} cy={ring.cy} r={ring.r} fill="none" stroke={p.hair} strokeWidth={1.4} />

        {/* Each quadrant arc is weighted by its budget: stroke width scales with
            allocation. The verify half (TEST + ANALYZE) is amber when funded,
            rose-dashed when starved. */}
        {STAGES.map((st) => {
          const a0 = st.angle - 45
          const a1 = st.angle + 45
          const share = alloc[st.key]
          // stroke width maps 10..52 budget -> 3..14 px
          const sw = 3 + (share / 52) * 11
          const isVerify = st.verify
          const thin = isVerify && starved
          const stroke = isVerify ? (thin ? p.danger : p.verdict) : p.signal
          return (
            <path
              key={`arc-${st.key}`}
              d={ringArc(ring.cx, ring.cy, ring.r, a0, a1)}
              fill="none"
              stroke={stroke}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeDasharray={thin ? "5 6" : undefined}
              opacity={isVerify ? (thin ? 0.9 : 0.95) : 0.85}
            />
          )
        })}

        {/* direction hints between stations */}
        {[45, 135, 225, 315].map((a) => {
          const [x, y] = polar(ring.cx, ring.cy, ring.r, a)
          const [x2, y2] = polar(ring.cx, ring.cy, ring.r, a + 6)
          return (
            <line key={`dir-${a}`} x1={x} y1={y} x2={x2} y2={y2} stroke={p.soft} strokeWidth={2.4} strokeLinecap="round" />
          )
        })}

        {/* stations */}
        {STAGES.map((st) => {
          const [x, y] = polar(ring.cx, ring.cy, ring.r, st.angle)
          const share = alloc[st.key]
          const isVerify = st.verify
          const thin = isVerify && starved
          const nodeStroke = isVerify ? (thin ? p.danger : p.verdict) : p.signal
          const nodeFill = isVerify
            ? thin
              ? "none"
              : rgba(`${255},180,90`, 0.14)
            : rgba(p.signalRGB, 0.16)
          // label placement per compass position. The top (-90) station stacks
          // its label + sub above the ring; in compact it needs extra clearance
          // from the DMTA title above and generous label/sub spacing below.
          const topDy = compact ? -24 : -30
          const labelDy = st.angle === -90 ? topDy : st.angle === 90 ? 40 : 5
          const labelDx = st.angle === 0 ? 26 : st.angle === 180 ? -26 : 0
          const anchor = st.angle === 0 ? "start" : st.angle === 180 ? "end" : "middle"
          return (
            <g key={`st-${st.key}`}>
              {/* opaque backing so the ring stroke reads as passing BEHIND the
                  node badge instead of cutting through the allocation number */}
              <circle cx={x} cy={y} r={16} fill={p.bg} />
              <circle
                cx={x}
                cy={y}
                r={15}
                fill={nodeFill}
                stroke={nodeStroke}
                strokeWidth={2}
                strokeDasharray={thin ? "4 4" : undefined}
              />
              {/* budget share inside the node */}
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill={isVerify ? (thin ? p.danger : p.verdictHi) : p.signalHi}
                style={{ fontSize: fs - 2, fontWeight: 700, fontFamily: "var(--font-mono), monospace" }}
              >
                {share}
              </text>
              <text
                x={x + labelDx}
                y={y + labelDy}
                textAnchor={anchor}
                fill={p.ink}
                style={{ fontSize: fs, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "var(--font-mono), monospace" }}
              >
                {st.label}
              </text>
              <text
                x={x + labelDx}
                y={y + labelDy + (st.angle === -90 ? (compact ? -24 : -16) : 16)}
                textAnchor={anchor}
                fill={p.soft}
                style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}
              >
                {st.sub}
              </text>
            </g>
          )
        })}

        {/* verify-half bracket label */}
        <text
          x={ring.cx}
          y={ring.cy - 16}
          textAnchor="middle"
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.14em", fontFamily: "var(--font-mono), monospace" }}
        >
          VERIFY SHARE
        </text>
        <text
          x={ring.cx}
          y={ring.cy + 34}
          textAnchor="middle"
          fill={starved ? p.danger : p.verdictHi}
          style={{ fontSize: compact ? 40 : 44, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
        >
          {verifyShare}
        </text>
        <text
          x={ring.cx}
          y={ring.cy + 58}
          textAnchor="middle"
          fill={p.soft}
          style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}
        >
          TEST + ANALYZE · of 100
        </text>

        {/* ===================== readout panel ===================== */}
        {(() => {
          const heading = "SCHEMATIC · APPARENT vs VALIDATED"
          return (
            <text
              x={panel.x0}
              y={panel.yTop - headOff}
              fill={p.soft}
              style={{ fontSize: fs - 2, letterSpacing: "0.16em", fontFamily: "var(--font-mono), monospace" }}
            >
              {heading}
            </text>
          )
        })()}
        <text
          x={panel.x0}
          y={panel.yTop - subOff}
          fill={p.soft}
          style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}
        >
          model of one campaign · not a measurement
        </text>

        {/* precision hero readout */}
        {(() => {
          const heroStr = `${precPct}%`
          const size = compact ? 40 : 44
          // guard: keep hero inside the panel
          const x = panel.x0
          const w = monoW(heroStr, size)
          const safeX = Math.min(x, panel.x1 - w - 4)
          return (
            <>
              <text
                x={safeX}
                y={panel.yTop - 2}
                fill={starved ? p.danger : p.signalHi}
                style={{ fontSize: size, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
              >
                {heroStr}
              </text>
              <text
                x={safeX + w + 10}
                y={panel.yTop - 6}
                fill={p.muted}
                style={{ fontSize: fs - 2, fontFamily: "var(--font-mono), monospace" }}
              >
                validated / apparent
              </text>
            </>
          )
        })()}

        {/* two bars: apparent (amber ghost) and validated (green) */}
        {(() => {
          const maxVal = 90 // fixed scale so bars are comparable across presets
          const barTop = panel.yTop + 26
          const barBottom = panel.yBottom - 30
          const rowH = (barBottom - barTop) / 2
          const barH = compact ? 34 : 30
          const scale = (v: number) => (v / maxVal) * (panel.x1 - panel.x0 - 8)

          const rows = [
            {
              label: "APPARENT HITS",
              val: out.apparent,
              color: p.verdict,
              fill: rgba(`${255},180,90`, 0.18),
              hi: p.verdictHi,
              note: "flagged by the loop",
            },
            {
              label: "VALIDATED",
              val: out.validated,
              color: p.signal,
              fill: rgba(p.signalRGB, 0.24),
              hi: p.signalHi,
              note: "survive characterization",
            },
          ]
          return (
            <>
              {rows.map((r, i) => {
                const y = barTop + i * rowH
                const w = scale(r.val)
                return (
                  <g key={r.label}>
                    <text
                      x={panel.x0}
                      y={y - 6}
                      fill={p.muted}
                      style={{ fontSize: fs - 3, letterSpacing: "0.08em", fontFamily: "var(--font-mono), monospace" }}
                    >
                      {r.label}
                    </text>
                    {!compact && (
                      <text
                        x={panel.x1}
                        y={y - 6}
                        textAnchor="end"
                        fill={p.soft}
                        style={{ fontSize: fs - 3.5, fontFamily: "var(--font-mono), monospace" }}
                      >
                        {r.note}
                      </text>
                    )}
                    <rect
                      x={panel.x0}
                      y={y}
                      width={panel.x1 - panel.x0}
                      height={barH}
                      rx={4}
                      fill={rgba(p.inkRGB, 0.05)}
                      stroke={p.hair}
                      strokeWidth={1}
                    />
                    <rect
                      x={panel.x0}
                      y={y}
                      width={Math.max(6, w)}
                      height={barH}
                      rx={4}
                      fill={r.fill}
                      stroke={r.color}
                      strokeWidth={1.6}
                    />
                    <text
                      x={panel.x0 + Math.max(6, w) + 8}
                      y={y + barH / 2 + 5}
                      fill={r.hi}
                      style={{ fontSize: fs + 2, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
                    >
                      {r.val}
                    </text>
                  </g>
                )
              })}

              {/* the false-positive gap: from validated bar end to apparent bar end */}
              {(() => {
                const yA = barTop // apparent row
                const yV = barTop + rowH // validated row
                const wA = scale(out.apparent)
                const wV = scale(out.validated)
                const gapX0 = panel.x0 + wV
                const gapX1 = panel.x0 + wA
                if (out.falsePos <= 0 || gapX1 - gapX0 < 8) return null
                const midY = (yA + barH + yV) / 2
                return (
                  <g>
                    <line x1={gapX1} y1={yA} x2={gapX1} y2={yV + barH} stroke={rgba(p.dangerRGB, 0.5)} strokeWidth={1} strokeDasharray="3 4" />
                    <line x1={gapX0} y1={yV} x2={gapX0} y2={yV + barH} stroke={rgba(p.dangerRGB, 0.5)} strokeWidth={1} strokeDasharray="3 4" />
                    <rect
                      x={gapX0}
                      y={midY - 11}
                      width={gapX1 - gapX0}
                      height={22}
                      fill={rgba(p.dangerRGB, 0.1)}
                    />
                    <text
                      x={(gapX0 + gapX1) / 2}
                      y={midY + 5}
                      textAnchor="middle"
                      fill={p.danger}
                      style={{ fontSize: fs - 3, fontWeight: 700, fontFamily: "var(--font-mono), monospace" }}
                    >
                      {out.falsePos} false
                    </text>
                  </g>
                )
              })()}
            </>
          )
        })()}

        {/* ===================== anchor strip ===================== */}
        <line
          x1={compact ? 40 : 40}
          y1={anchorY - 22}
          x2={compact ? 420 : 940}
          y2={anchorY - 22}
          stroke={p.hair}
          strokeWidth={1}
        />
        <text
          x={40}
          y={anchorY - 6}
          fill={p.soft}
          style={{ fontSize: fs - 3, letterSpacing: "0.16em", fontFamily: "var(--font-mono), monospace" }}
        >
          MEASURED ANCHORS · SHIPPED WITH PUBLICATIONS
        </text>
        {ANCHORS.map((a, i) => {
          const colW = compact ? 380 : 300
          const x = compact ? 40 : 40 + i * (colW + 10)
          const y = compact ? anchorY + 18 + i * 44 : anchorY + 22
          return (
            <g key={a.key}>
              <text
                x={x}
                y={y}
                fill={p.verdict}
                style={{ fontSize: fs - 1, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "var(--font-mono), monospace" }}
              >
                {a.name}
              </text>
              <text
                x={x + (compact ? 130 : 0)}
                y={compact ? y : y + 18}
                fill={p.muted}
                style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}
              >
                {a.line}
              </text>
            </g>
          )
        })}
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{ fontFamily: "var(--font-mono), monospace", color: starved ? p.danger : verifyShare >= 55 ? p.signal : p.ink }}
      >
        {"VERDICT · "}
        {verdict}
      </div>

      {/* controls lane */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {PRESETS.map((ps, i) => (
          <button
            key={ps.key}
            type="button"
            aria-pressed={i === presetIdx}
            onClick={() => setPresetIdx(i)}
            className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: i === presetIdx ? p.signalHi : p.muted,
              border: `1px solid ${i === presetIdx ? p.signal : p.hair}`,
              background: i === presetIdx ? rgba(p.signalRGB, 0.1) : "transparent",
            }}
          >
            {ps.name}
          </button>
        ))}
        <span
          className="text-[11px]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          re-allocate the budget · watch the gap
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function SelfDrivingLab() {
  return (
    <InstrumentFrame
      kicker="V12 · THE SELF-DRIVING LAB"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          A self-driving lab runs the same loop your agent does: design, make, test,
          analyze, repeat. Move the budget onto synthesis and the loop flags more
          apparent hits, but the assay that would tell real from artefact goes thin, so
          validated discoveries fall and the false-positive gap opens. Verification is
          the bottleneck at the bench too, and the honest edge of autonomy is where the
          human PI reads the result.
        </>
      }
      method={
        <>
          SCHEMATIC · the apparent-vs-validated counts are a deterministic, seeded model
          of the verification-bottleneck argument (apparent hits track MAKE throughput;
          validated yield tracks the TEST + ANALYZE share), not a measurement of any one
          system. MEASURED anchors, all shipped with publications: A-Lab, Szymanski et
          al., Nature 2023 (353 runs over 17 days, 41 novel compounds from 58 targets,
          abstract 36 of 57, ~30% first-attempt); its verify stage was PXRD-only and the
          Rietveld refinement was called &lsquo;very bad ... novice human level&rsquo; (Palgrave and
          Schoop via Chemistry World 2024), and Nature issued an Author Correction on 19
          Jan 2026 (C&EN). GNoME, DeepMind / Merchant et al., Nature 2023 (2.2M predicted
          crystals, 380,000 most stable, hit-rate ~50% to ~80%, 736 externally
          synthesized). Coscientist, Boiko et al., Nature 2023 (GPT-4 agent, robotic
          Suzuki and Sonogashira couplings). Carrying the A-Lab critique is authority:
          the starved verify stage is exactly the failure this instrument models.
        </>
      }
    >
      {(ctx) => <LabScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
