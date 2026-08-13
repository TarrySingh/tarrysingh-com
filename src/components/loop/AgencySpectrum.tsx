"use client"

/**
 * V13 · THE AGENCY SPECTRUM - the misalignment instrument of THE ENGINE ROOM.
 *
 * The Human Agency Scale (HAS) runs H1 (AI handles the task on its own) to H5
 * (AI cannot function without continuous human involvement). WORKBank asked
 * 1,500 U.S. workers where they want each task to sit, and asked 52 AI experts
 * where capability can take it. The instrument places both on the same H1..H5
 * spine so the gap between them is visible.
 *
 * NUMBERS DISCIPLINE. Every figure rendered is a Source-Ledger claim (Ch10,
 * Shao et al. 2025, WORKBank, arXiv:2506.06576):
 *   - H1..H5 definitions: verbatim from arXiv HTML v3.
 *   - H3 (equal partnership) is the dominant worker-desired level in 45.2% of
 *     occupations analysed.
 *   - 47.5% of tasks fall in the lower triangle: workers want MORE human agency
 *     than experts deem technologically necessary (the agency gap).
 *   - 46.1% of tasks: workers currently doing them hold a positive attitude
 *     toward automation (Aw(t) > 3 on a 5-point Likert). This is a
 *     positive-attitude share, NOT a zone split; it is labelled as such.
 *   - 41.0% of Y Combinator company-task mappings land in Low Priority +
 *     Automation Red Light, tasks workers do NOT want automated.
 *   - Anthropic Economic Index (Jan 2026): augmentation 52% vs automation 45%.
 * The four zones (Green Light, R&D Opportunity, Red Light, Low Priority) are
 * NAMED verbatim; the paper publishes NO four-way percentage split, so none is
 * rendered. The banned 46.1 / 12.9 / 24.3 / 16.7 zone split is NOT used.
 *
 * The per-lens marker POSITIONS on the H-spine (desire band vs capability band)
 * are SCHEMATIC: a fixed illustration of the paper's direction of pull (workers
 * toward partnership, capability and investment toward autonomy), not a measured
 * per-task coordinate. The method lane declares this.
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useState } from "react"
import { InstrumentFrame, rgba, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// The Human Agency Scale (verbatim definitions, Source Ledger Ch10).
// ---------------------------------------------------------------------------

interface HLevel {
  key: string
  short: string
  def: string
}

const SCALE: HLevel[] = [
  { key: "H1", short: "on its own", def: "AI agent handles the task entirely on its own" },
  { key: "H2", short: "minimal input", def: "AI agent needs minimal human input for optimal performance" },
  { key: "H3", short: "equal partners", def: "AI agent and human form an equal partnership, outperforming either alone" },
  { key: "H4", short: "needs a human", def: "AI agent requires human input to successfully complete the task" },
  { key: "H5", short: "human-essential", def: "AI agent cannot function without continuous human involvement" },
]

// ---------------------------------------------------------------------------
// Lenses. Each carries ONLY ledger-verified figures. desireH / capH are the
// H-spine index (0..4 -> H1..H5) for the SCHEMATIC band centres; the numbers in
// stat/statLabel/verdict are measured claims.
// ---------------------------------------------------------------------------

interface Lens {
  key: string
  name: string
  // schematic band centres on the H1..H5 spine (0 = H1 ... 4 = H5)
  desireH: number
  capH: number
  stat: string
  statLabel: string
  statLabelCompact: string
  verdict: string
  tone: "gap" | "invest" | "trend"
}

const LENSES: Lens[] = [
  {
    key: "PARTNER",
    name: "WHERE WORKERS VOTE",
    desireH: 2, // H3
    capH: 0.6, // pulled toward H1
    stat: "45.2%",
    statLabel: "of occupations · H3 is the top worker-desired level",
    statLabelCompact: "of occupations · H3 is the top vote",
    verdict: "workers vote H3 equal partnership · it is the single most-desired level",
    tone: "gap",
  },
  {
    key: "GAP",
    name: "THE AGENCY GAP",
    desireH: 2.4,
    capH: 0.7,
    stat: "47.5%",
    statLabel: "of tasks · workers want MORE agency than experts deem necessary",
    statLabelCompact: "of tasks · workers want more agency",
    verdict: "in the lower triangle workers want to stay more in the loop than capability requires",
    tone: "gap",
  },
  {
    key: "CAPITAL",
    name: "WHERE CAPITAL AIMS",
    desireH: 2,
    capH: 0.5,
    stat: "41.0%",
    statLabel: "of Y Combinator task mappings · Low Priority + Red Light zones",
    statLabelCompact: "of YC mappings · Low Priority + Red Light",
    verdict: "a large share of startup investment targets tasks workers do NOT want automated",
    tone: "invest",
  },
  {
    key: "ATTITUDE",
    name: "OPENNESS, NOT REFUSAL",
    desireH: 1.7,
    capH: 0.6,
    stat: "46.1%",
    statLabel: "of tasks · workers hold a positive attitude toward automation",
    statLabelCompact: "of tasks · positive attitude to automation",
    verdict: "positive-attitude share, not a zone split · workers are not refusing AI, they want a seat",
    tone: "trend",
  },
  {
    key: "MACRO",
    name: "THE MARKET TREND",
    desireH: 2,
    capH: 0.5,
    stat: "52 / 45",
    statLabel: "augmentation 52% vs automation 45% of Claude conversations",
    statLabelCompact: "augmentation 52% vs automation 45%",
    verdict: "in real usage augmentation still leads automation · Anthropic Economic Index, Jan 2026",
    tone: "trend",
  },
]

// ---------------------------------------------------------------------------

function SpectrumScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p } = ctx
  const [sel, setSel] = useState(0)
  const L = LENSES[sel]

  const W = compact ? 460 : 980
  const H = compact ? 760 : 540

  // spine geometry
  const spine = compact
    ? { x0: 60, x1: 404, y: 300 }
    : { x0: 96, x1: 884, y: 300 }
  const span = spine.x1 - spine.x0
  const nodeX = (h: number) => spine.x0 + (span * h) / (SCALE.length - 1)

  const fs = compact ? 17 : 13.5

  const dX = nodeX(L.desireH)
  const cX = nodeX(L.capH)

  // hero number width guard: widest value "47.5%" at 44px mono
  const heroSize = compact ? 40 : 44
  const heroX = spine.x0

  const toneColor =
    L.tone === "invest" ? p.danger : L.tone === "trend" ? p.verdict : p.signal

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>The Human Agency Scale: where workers want AI versus where capability aims</title>
        <desc>
          A five-level scale from H1, AI handling a task on its own, to H5, a human
          essential. Workers vote for H3 equal partnership as the most-desired level in
          45.2% of occupations, while 47.5% of tasks sit in a lower
          triangle where workers want more human agency than experts deem necessary, and
          41.0% of Y Combinator task mappings target tasks workers do not want
          automated.
        </desc>

        {/* ===== header lane ===== */}
        <text
          x={heroX}
          y={compact ? 54 : 58}
          fill={p.soft}
          style={{ fontSize: fs - (compact ? 4 : 2), letterSpacing: compact ? "0.1em" : "0.18em", fontFamily: "var(--font-mono), monospace" }}
        >
          {compact ? "HUMAN AGENCY SCALE · H1 TO H5" : "HUMAN AGENCY SCALE · H1 AUTONOMOUS ·· H5 HUMAN-ESSENTIAL"}
        </text>

        <text
          x={heroX}
          y={compact ? 104 : 112}
          fill={toneColor}
          style={{ fontSize: heroSize, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
        >
          {L.stat}
        </text>
        {/* stat label: on desktop right of the hero; in compact stacked below */}
        {compact ? (
          <text
            x={heroX}
            y={140}
            fill={p.muted}
            style={{ fontSize: fs - 4, fontFamily: "var(--font-mono), monospace" }}
          >
            {L.statLabelCompact}
          </text>
        ) : (
          <>
            <text
              x={heroX + 216}
              y={92}
              fill={p.ink}
              style={{ fontSize: fs - 1, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "var(--font-mono), monospace" }}
            >
              {L.name}
            </text>
            <text
              x={heroX + 216}
              y={112}
              fill={p.muted}
              style={{ fontSize: fs - 2, fontFamily: "var(--font-mono), monospace" }}
            >
              {L.statLabel}
            </text>
          </>
        )}

        {/* ===== the gap band (desire vs capability) drawn under the spine ===== */}
        {(() => {
          const lo = Math.min(dX, cX)
          const hi = Math.max(dX, cX)
          const bandTop = spine.y - 46
          const bandBot = spine.y + 46
          return (
            <>
              <rect
                x={lo}
                y={bandTop}
                width={hi - lo}
                height={bandBot - bandTop}
                fill={rgba(L.tone === "invest" ? p.dangerRGB : p.signalRGB, 0.08)}
              />
              {/* the gap measure arrow */}
              <line
                x1={lo}
                y1={bandTop - 10}
                x2={hi}
                y2={bandTop - 10}
                stroke={p.soft}
                strokeWidth={1}
              />
              <text
                x={(lo + hi) / 2}
                y={bandTop - 16}
                textAnchor="middle"
                fill={p.soft}
                style={{ fontSize: fs - 3.5, letterSpacing: "0.12em", fontFamily: "var(--font-mono), monospace" }}
              >
                THE GAP
              </text>
            </>
          )
        })()}

        {/* ===== the spine ===== */}
        <line
          x1={spine.x0}
          y1={spine.y}
          x2={spine.x1}
          y2={spine.y}
          stroke={p.hair}
          strokeWidth={2}
        />

        {/* H nodes */}
        {SCALE.map((lv, i) => {
          const x = nodeX(i)
          const isPartner = lv.key === "H3"
          return (
            <g key={lv.key}>
              <line x1={x} y1={spine.y - 7} x2={x} y2={spine.y + 7} stroke={p.soft} strokeWidth={1.4} />
              <circle
                cx={x}
                cy={spine.y}
                r={isPartner ? 5 : 3.5}
                fill={isPartner ? p.signal : p.soft}
              />
              <text
                x={x}
                y={spine.y - 16}
                textAnchor="middle"
                fill={isPartner ? p.signalHi : p.ink}
                style={{ fontSize: fs, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "var(--font-mono), monospace" }}
              >
                {lv.key}
              </text>
              {/* per-level descriptor. Desktop: one row under the tick. Compact:
                  neighbours would collide at 86px node spacing, so stagger them
                  onto two rows (even index low, odd index lower) - no two share a
                  row, so boxes never overlap horizontally. */}
              <text
                x={x}
                y={spine.y + (compact ? (i % 2 === 0 ? 30 : 50) : 30)}
                textAnchor="middle"
                fill={p.soft}
                style={{ fontSize: fs - (compact ? 6 : 4), fontFamily: "var(--font-mono), monospace" }}
              >
                {lv.short}
              </text>
            </g>
          )
        })}

        {/* end labels for the poles */}
        {/* Pole labels: desktop only. In compact the H1 tick + "on its own"
            descriptor (and H5 + "human-essential") already name the poles, and
            there is no vertical room here without colliding the CAPABILITY axis. */}
        {!compact && (
          <text
            x={spine.x0}
            y={spine.y + 52}
            textAnchor="start"
            fill={p.soft}
            style={{ fontSize: fs - 3.5, letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}
          >
            FULL AUTOMATION
          </text>
        )}
        {!compact && (
          <text
            x={spine.x1}
            y={spine.y + 52}
            textAnchor="end"
            fill={p.soft}
            style={{ fontSize: fs - 3.5, letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}
          >
            HUMAN AT THE CENTRE
          </text>
        )}

        {/* ===== capability / investment marker (below spine, pulls toward H1) ===== */}
        {(() => {
          const y = spine.y + 74
          const col = L.tone === "invest" ? p.danger : p.verdict
          return (
            <g>
              <line x1={cX} y1={spine.y + 8} x2={cX} y2={y - 12} stroke={col} strokeWidth={1.2} strokeDasharray="3 4" />
              <path
                d={`M ${cX} ${y - 12} l -5 -9 l 10 0 z`}
                fill={col}
              />
              <text
                x={cX}
                y={y + 4}
                textAnchor={cX < spine.x0 + 80 ? "start" : "middle"}
                fill={col}
                style={{ fontSize: fs - 2, fontWeight: 700, fontFamily: "var(--font-mono), monospace" }}
              >
                {L.tone === "invest" ? "CAPITAL AIMS" : "CAPABILITY"}
              </text>
            </g>
          )
        })()}

        {/* ===== worker desire marker (above spine, sits near H3) ===== */}
        {(() => {
          // In compact the marker is raised so its label stack clears THE GAP
          // label (which sits at spine.y - 62). The "where the vote lands" sub
          // line is stacked ABOVE the WORKERS word, not below it, so it never
          // lands on the WORKERS marker or on THE GAP band label.
          const y = spine.y - (compact ? 88 : 74)
          const col = p.signal
          return (
            <g>
              <line x1={dX} y1={spine.y - 8} x2={dX} y2={y + 12} stroke={col} strokeWidth={1.6} />
              <path
                d={`M ${dX} ${y + 12} l -5 9 l 10 0 z`}
                fill={col}
              />
              {compact ? (
                <>
                  <text
                    x={dX}
                    y={y - 28}
                    textAnchor="middle"
                    fill={col}
                    style={{ fontSize: fs - 6, letterSpacing: "0.08em", fontFamily: "var(--font-mono), monospace" }}
                  >
                    where the vote lands
                  </text>
                  <text
                    x={dX}
                    y={y - 6}
                    textAnchor="middle"
                    fill={p.signalHi}
                    style={{ fontSize: fs - 1, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
                  >
                    WORKERS
                  </text>
                </>
              ) : (
                <>
                  <text
                    x={dX}
                    y={y - 6}
                    textAnchor="middle"
                    fill={p.signalHi}
                    style={{ fontSize: fs - 1, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
                  >
                    WORKERS
                  </text>
                  <text
                    x={dX}
                    y={y + 8}
                    textAnchor="middle"
                    fill={col}
                    style={{ fontSize: fs - 3.5, letterSpacing: "0.08em", fontFamily: "var(--font-mono), monospace" }}
                  >
                    where the vote lands
                  </text>
                </>
              )}
            </g>
          )
        })()}

        {/* ===== zone strip (NAMED zones, no fabricated split) ===== */}
        {(() => {
          const y0 = compact ? 636 : 470
          const zones = [
            { k: "GREEN LIGHT", c: p.signal, note: compact ? "want · can" : "high desire · high capability" },
            { k: "R&D OPPORTUNITY", c: p.verdict, note: compact ? "want · cannot yet" : "high desire · low capability" },
            { k: "RED LIGHT", c: p.danger, note: compact ? "do not want · can" : "low desire · high capability" },
            { k: "LOW PRIORITY", c: p.soft, note: compact ? "do not want · cannot" : "low desire · low capability" },
          ]
          // desktop: 4 across; compact: 2 columns x 2 rows so wide labels fit
          const cols = compact ? 2 : 4
          const cellH = compact ? 44 : 34
          const rowGap = 8
          const zw = (span - (cols - 1) * 8) / cols
          return (
            <g>
              <text
                x={spine.x0}
                y={y0 - 14}
                fill={p.soft}
                style={{ fontSize: fs - (compact ? 4.5 : 3.5), letterSpacing: compact ? "0.08em" : "0.16em", fontFamily: "var(--font-mono), monospace" }}
              >
                {compact ? "FOUR NAMED ZONES · NO PUBLISHED SPLIT" : "FOUR NAMED ZONES · DESIRE x CAPABILITY · NO PUBLISHED SPLIT"}
              </text>
              {zones.map((z, i) => {
                const col = i % cols
                const row = Math.floor(i / cols)
                const x = spine.x0 + col * (zw + 8)
                const y = y0 + row * (cellH + rowGap)
                const highlight =
                  L.key === "CAPITAL" && (z.k === "RED LIGHT" || z.k === "LOW PRIORITY")
                return (
                  <g key={z.k}>
                    <rect
                      x={x}
                      y={y}
                      width={zw}
                      height={cellH}
                      rx={4}
                      fill={highlight ? rgba(p.dangerRGB, 0.12) : rgba(p.inkRGB, 0.04)}
                      stroke={highlight ? p.danger : p.hair}
                      strokeWidth={highlight ? 1.6 : 1}
                    />
                    <rect x={x} y={y} width={4} height={cellH} fill={z.c} />
                    <text
                      x={x + 12}
                      y={y + (compact ? 19 : 15)}
                      fill={highlight ? p.dangerHi : p.ink}
                      style={{ fontSize: fs - 3, fontWeight: 700, letterSpacing: "0.04em", fontFamily: "var(--font-mono), monospace" }}
                    >
                      {z.k}
                    </text>
                    <text
                      x={x + 12}
                      y={y + (compact ? 35 : 28)}
                      fill={p.soft}
                      style={{ fontSize: fs - 5, fontFamily: "var(--font-mono), monospace" }}
                    >
                      {z.note}
                    </text>
                  </g>
                )
              })}
            </g>
          )
        })()}
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{
          fontFamily: "var(--font-mono), monospace",
          color: toneColor,
        }}
      >
        {"VERDICT · "}
        {L.verdict}
      </div>

      {/* controls lane */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {LENSES.map((lens, i) => (
          <button
            key={lens.key}
            type="button"
            aria-pressed={i === sel}
            onClick={() => setSel(i)}
            className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: i === sel ? p.signalHi : p.muted,
              border: `1px solid ${i === sel ? p.signal : p.hair}`,
              background: i === sel ? rgba(p.signalRGB, 0.1) : "transparent",
            }}
          >
            {lens.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function AgencySpectrum() {
  return (
    <InstrumentFrame
      kicker="V13 · THE AGENCY SPECTRUM"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          Workers are not resisting AI. Asked where each task should sit on a five-level
          agency scale, they vote for H3, an equal partnership, as the single
          most-desired level in 45.2% of occupations, and in 47.5% of tasks they want to
          stay more in the loop than capability alone would require. Capital is building
          the other way: 41.0% of Y Combinator task mappings target the zones workers do
          not want automated. The distance between the two markers is the story.
        </>
      }
      method={
        <>
          MEASURED · figures from Shao et al., WORKBank, arXiv:2506.06576 (2025): H1..H5
          scale definitions verbatim; H3 top worker-desired level in 45.2% of
          occupations; 47.5% of tasks in the lower triangle (workers want more agency
          than experts deem necessary); 46.1% positive-attitude task share (Aw(t) &gt; 3,
          not a zone split); 41.0% of YC task mappings in Low Priority + Red Light. Market
          trend: Anthropic Economic Index, Jan 2026 (augmentation 52% vs automation 45%).
          SCHEMATIC · the WORKERS and CAPABILITY marker positions on the spine illustrate
          the paper&rsquo;s direction of pull, not a measured per-task coordinate. The
          four zones are named in the paper; it publishes no four-way percentage split, so
          none is shown.
        </>
      }
    >
      {(ctx) => <SpectrumScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
