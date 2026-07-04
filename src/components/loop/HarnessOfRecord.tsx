"use client"

/**
 * V5 · THE HARNESS OF RECORD - the saturation timeline of THE ENGINE ROOM.
 *
 * Every date and figure plotted here is a verified claim from the Source
 * Ledger (Ch4):
 *  - lm-evaluation-harness v0.0.1 to Zenodo 2 Sep 2021 (Gao et al., record
 *    5371629); backend of the HF Open LLM Leaderboard; leaderboard v1
 *    archived June 2024 and later closed to new submissions.
 *  - MMLU: GPT-4 86.4% in March 2023, frontier clusters 86-87%, no
 *    significant progress since (Wang et al., arXiv:2406.01574).
 *  - MMLU-Pro: 12,032 questions, 14 disciplines, 10 options, frontier
 *    accuracy drops 16-33% vs MMLU (same paper, 2024).
 *  - SWE-bench: 2,294 tasks, 12 Python repos, Claude 2 4.8% / GPT-4 1.7%
 *    with oracle retriever (Jimenez et al., arXiv:2310.06770, 2023).
 *  - SWE-bench Verified: human-filtered 500, three experts each over 1,699
 *    problems, with OpenAI, Aug 2024; OpenAI stopped reporting it on
 *    23 Feb 2026 (~59.4% of audited fails had flawed tests; models
 *    reproduce the exact ground-truth patches; SWE-bench Pro recommended).
 *  - GPQA: 448 questions, experts 65%, non-experts 34%, GPT-4 39% (Rein
 *    et al., arXiv:2311.12022); Diamond: expert baseline 69.7%, Grok 4
 *    87% (+/-2%) as of July 2025 (Epoch AI).
 *  - HLE: launched 23 Jan 2025, 2,500 public questions, 100+ disciplines,
 *    all frontier models under 10% at launch; private held-out set by
 *    design (Phan et al., arXiv:2501.14249).
 *  - ARC-AGI-2 / ARC Prize 2025: every eval task solved by 2+ humans in
 *    2 attempts or fewer, human panel avg 60%, pure LLMs ~0%; $700K Grand
 *    Prize at 85%, 26 Mar to 3 Nov 2025 on Kaggle, still unclaimed
 *    (arcprize.org).
 *
 * The instrument argues: public benchmarks saturate on a clock; when they
 * do, the eval harness moves inside the company. Private, held-out evals
 * on your own tasks become the moat.
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useState } from "react"
import { InstrumentFrame, mulberry32, rgba, type LHPalette, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// Ledger data (Ch4 / V5). Do not edit without the ledger.
// ---------------------------------------------------------------------------

type BenchState = "SATURATED" | "CONTESTED" | "ALIVE"

interface Bench {
  key: string
  pill: string
  label: string
  cLabel: string
  /** decimal year; null = introduced before the 2020 window edge */
  start: number | null
  /** decimal year; null = still open */
  end: number | null
  state: BenchState
  retired?: boolean
  stateLine: string
  tag: string
  tagMode: "afterEnd" | "endIn" | "afterStart"
  /** amber event marker, decimal year */
  mark?: number
  facts: [string, string, string]
  verdict: string
}

const BENCHES: Bench[] = [
  {
    key: "mmlu",
    pill: "MMLU",
    label: "MMLU",
    cLabel: "MMLU · 86.4% MAR 2023 · SATURATED",
    start: null,
    end: 2023.17,
    state: "SATURATED",
    stateLine: "SATURATED · MAR 2023",
    tag: "86.4% · MAR 2023",
    tagMode: "afterEnd",
    facts: [
      "GPT-4 hit 86.4% in Mar 2023",
      "frontier models cluster at 86-87%",
      "no significant progress since",
    ],
    verdict: "saturated Mar 2023 · a flat line cannot rank models",
  },
  {
    key: "harness",
    pill: "HARNESS",
    label: "LM-EVAL HARNESS",
    cLabel: "LM-EVAL HARNESS · LB V1 ARCHIVED JUN 2024",
    start: 2021.67,
    end: 2024.42,
    state: "SATURATED",
    stateLine: "LEADERBOARD V1 ARCHIVED JUN 2024",
    tag: "LB V1 ARCHIVED JUN 2024",
    tagMode: "afterEnd",
    facts: [
      "v0.0.1 on Zenodo · 2 Sep 2021 · Gao et al.",
      "backend of the HF Open LLM Leaderboard",
      "v1 archived Jun 2024 · later closed",
    ],
    verdict: "leaderboard archived Jun 2024 · the public verifier was retired once its suite saturated",
  },
  {
    key: "sweb",
    pill: "SWE-BENCH",
    label: "SWE-BENCH",
    cLabel: "SWE-BENCH · REBUILT AS VERIFIED AUG 2024",
    start: 2023.75,
    end: 2024.58,
    state: "CONTESTED",
    stateLine: "CONTESTED · REBUILT AUG 2024",
    tag: "REBUILT AS VERIFIED · AUG 2024",
    tagMode: "endIn",
    facts: [
      "2,294 tasks from 12 Python repos · 2023",
      "Claude 2 4.8% · GPT-4 1.7% · oracle",
      "sourced from repos providers train on",
    ],
    verdict: "contested · the 12 trained-on repos became the contamination vector · rebuilt as Verified",
  },
  {
    key: "gpqa",
    pill: "GPQA",
    label: "GPQA",
    cLabel: "GPQA · PAST EXPERT BASELINE JUL 2025",
    start: 2023.87,
    end: null,
    state: "CONTESTED",
    stateLine: "CONTESTED · SINCE JUL 2025",
    tag: "PAST EXPERT BASELINE · JUL 2025",
    tagMode: "endIn",
    mark: 2025.5,
    facts: [
      "448 Google-proof questions · 2023",
      "experts 65% · non-experts 34% · GPT-4 39%",
      "Diamond: Grok 4 87% vs experts 69.7%",
    ],
    verdict: "contested · models passed the PhD-expert baseline in Jul 2025",
  },
  {
    key: "mmlupro",
    pill: "MMLU-PRO",
    label: "MMLU-PRO",
    cLabel: "MMLU-PRO · DROPS 16-33% VS MMLU · ALIVE",
    start: 2024.42,
    end: null,
    state: "ALIVE",
    stateLine: "ALIVE · SINCE JUN 2024",
    tag: "DROPS 16-33% VS MMLU",
    tagMode: "afterStart",
    facts: [
      "12,032 questions · 14 disciplines · 2024",
      "10 answer options instead of 4",
      "frontier accuracy drops 16-33% vs MMLU",
    ],
    verdict: "alive · ten options and 12,032 questions bought back separability",
  },
  {
    key: "verified",
    pill: "VERIFIED",
    label: "SWE-BENCH VERIFIED",
    cLabel: "SWE-BENCH VERIFIED · RETIRED 23 FEB 2026",
    start: 2024.58,
    end: 2026.14,
    state: "SATURATED",
    retired: true,
    stateLine: "RETIRED · 23 FEB 2026",
    tag: "RETIRED · 23 FEB 2026",
    tagMode: "endIn",
    facts: [
      "human-filtered 500 · with OpenAI · 2024",
      "1,699 reviewed · three experts each",
      "59.4% of audited fails had flawed tests",
    ],
    verdict: "retired 23 Feb 2026 · flawed tests · models reproduce the exact human patches · OpenAI moved to SWE-bench Pro",
  },
  {
    key: "hle",
    pill: "HLE",
    label: "HLE",
    cLabel: "HLE · UNDER 10% AT LAUNCH · ALIVE",
    start: 2025.06,
    end: null,
    state: "ALIVE",
    stateLine: "ALIVE · SINCE 23 JAN 2025",
    tag: "UNDER 10% AT LAUNCH",
    tagMode: "afterStart",
    facts: [
      "2,500 questions · 100+ disciplines",
      "all frontier models under 10% at launch",
      "private held-out set · by design",
    ],
    verdict: "alive · under 10% at launch · a private holdout guards against overfitting",
  },
  {
    key: "arc",
    pill: "ARC-AGI-2",
    label: "ARC-AGI-2",
    cLabel: "ARC-AGI-2 · $700K AT 85% · UNCLAIMED",
    start: 2025.23,
    end: null,
    state: "ALIVE",
    stateLine: "ALIVE · SINCE 26 MAR 2025",
    tag: "$700K AT 85% · UNCLAIMED",
    tagMode: "endIn",
    facts: [
      "every task solved by 2+ humans · 2025",
      "human panel avg 60% · pure LLMs ~0%",
      "$700K at 85% on Kaggle · still unclaimed",
    ],
    verdict: "alive · the 85% line is still unclaimed at $700K",
  },
]

const T0 = 2020
const T1 = 2026.4
const PRIVATE_ERA = 2026.14 // OpenAI stops reporting SWE-bench Verified

// Dissolve dots for ended lanes: seeded, computed once at module scope.
const DOTS = (() => {
  const rnd = mulberry32(0x5eed)
  return Array.from({ length: 12 }, () => ({
    fx: rnd(),
    fy: rnd() * 2 - 1,
    r: 0.8 + rnd() * 1.2,
  }))
})()

const stateColor = (b: Bench, p: LHPalette) =>
  b.state === "ALIVE" ? p.signal : b.state === "CONTESTED" ? p.verdict : p.cool

// ---------------------------------------------------------------------------

function RecordScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p, expanded } = ctx
  const [sel, setSel] = useState(5) // SWE-bench Verified: born as the fix, retired anyway
  const b = BENCHES[sel]
  const selColor = b.retired ? p.danger : stateColor(b, p)

  const W = compact ? 460 : 980
  const H = compact ? 716 : 516

  // time axis
  const ax = compact ? { x0: 16, x1: 380 } : { x0: 162, x1: 830 }
  const xFor = (t: number) => ax.x0 + ((t - T0) / (T1 - T0)) * (ax.x1 - ax.x0)
  const zoneX = xFor(PRIVATE_ERA)
  const zoneR = compact ? 444 : 955
  const arrowX = compact ? 420 : 838

  // lane geometry
  const lane = compact
    ? { y0: 208, pitch: 58, barTop: 24, barH: 16, labelY: 14 }
    : { y0: 136, pitch: 40, barTop: 14, barH: 12, labelY: 24 }
  const axisY = compact ? 682 : 460
  const gridTop = compact ? 200 : 126

  // Compact renders ~460 viewBox units into a ~320px stage (scale ~0.7), so
  // raw sizes run larger there to keep every label >= ~9.5px on screen.
  const fs = compact ? 17 : 13.5
  const years = compact ? [2020, 2022, 2024, 2026] : [2020, 2021, 2022, 2023, 2024, 2025, 2026]
  const grad = `hor-fade-${expanded ? "x" : "m"}-${compact ? "c" : "d"}`

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>Public benchmark lifespans, 2020 to 2026</title>
        <desc>
          A timeline with one lane per benchmark. MMLU saturates in March 2023, the
          Open LLM Leaderboard is archived in June 2024, SWE-bench Verified is retired
          in February 2026, while HLE and ARC-AGI-2 stay alive into a shaded zone on
          the right labelled the private era.
        </desc>

        <defs>
          <linearGradient id={grad} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={p.cool} stopOpacity={0} />
            <stop offset="0.55" stopColor={p.cool} stopOpacity={0.28} />
            <stop offset="1" stopColor={p.cool} stopOpacity={0.28} />
          </linearGradient>
        </defs>

        {/* ===== header lane: panel title + detail readout ===== */}
        <text
          x={compact ? 16 : ax.x0}
          y={compact ? 28 : 30}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
        >
          {compact ? "THE SATURATION CLOCK · 2020-2026" : "THE SATURATION CLOCK · PUBLIC BENCHMARK LIFESPANS · 2020-2026"}
        </text>

        <text
          x={compact ? 16 : ax.x0}
          y={compact ? 66 : 64}
          fill={selColor}
          style={{ fontSize: compact ? 26 : 24, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
        >
          {b.label}
        </text>
        {compact ? (
          <>
            <text x={16} y={92} fill={selColor} style={{ fontSize: fs - 2, letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}>
              {b.stateLine}
            </text>
            {b.facts.map((f, i) => (
              <text key={f} x={16} y={116 + i * 22} fill={p.muted} style={{ fontSize: fs - 2, fontFamily: "var(--font-mono), monospace" }}>
                {f}
              </text>
            ))}
          </>
        ) : (
          <>
            <text
              x={ax.x0 + b.label.length * 24 * 0.62 + 16}
              y={64}
              fill={selColor}
              style={{ fontSize: fs - 1, letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}
            >
              {b.stateLine}
            </text>
            <text x={ax.x0} y={88} fill={p.muted} style={{ fontSize: fs - 1, fontFamily: "var(--font-mono), monospace" }}>
              {b.facts[0]} · {b.facts[1]}
            </text>
            <text x={ax.x0} y={106} fill={p.muted} style={{ fontSize: fs - 1, fontFamily: "var(--font-mono), monospace" }}>
              {b.facts[2]}
            </text>
          </>
        )}

        {/* ===== the private era: ghost meaning-zone on the right ===== */}
        <rect
          x={zoneX}
          y={gridTop}
          width={zoneR - zoneX}
          height={axisY - gridTop}
          fill={rgba(p.signalRGB, 0.055)}
        />
        <line x1={zoneX} y1={gridTop} x2={zoneX} y2={axisY} stroke={p.signal} strokeWidth={1} strokeDasharray="3 5" opacity={0.7} />
        {compact ? (
          <text x={444} y={192} textAnchor="end" fill={p.signal} style={{ fontSize: fs - 3, letterSpacing: "0.12em", fontFamily: "var(--font-mono), monospace" }}>
            THE PRIVATE ERA · IN-HOUSE EVALS
          </text>
        ) : (
          <>
            <text x={zoneX + 8} y={142} fill={p.signal} style={{ fontSize: fs - 2, letterSpacing: "0.14em", fontFamily: "var(--font-mono), monospace" }}>
              THE PRIVATE ERA
            </text>
            <text x={zoneX + 8} y={158} fill={p.muted} style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}>
              held-out evals
            </text>
            <text x={zoneX + 8} y={172} fill={p.muted} style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}>
              on your own tasks
            </text>
          </>
        )}

        {/* ===== year grid ===== */}
        {years.map((y) => (
          <g key={y}>
            <line x1={xFor(y)} y1={gridTop} x2={xFor(y)} y2={axisY} stroke={p.grid} strokeWidth={1} />
            <text
              x={xFor(y)}
              y={axisY + (compact ? 20 : 18)}
              textAnchor="middle"
              fill={p.soft}
              style={{ fontSize: fs - 2.5, fontFamily: "var(--font-mono), monospace" }}
            >
              {y}
            </text>
          </g>
        ))}
        <line x1={ax.x0} y1={axisY} x2={zoneR} y2={axisY} stroke={p.hair} strokeWidth={1} />

        {/* ===== lanes ===== */}
        {BENCHES.map((bench, i) => {
          const laneY = lane.y0 + i * lane.pitch
          const isSel = i === sel
          const col = stateColor(bench, p)
          const xStart = bench.start === null ? ax.x0 : xFor(bench.start)
          const open = bench.end === null
          const xEnd = bench.end === null ? arrowX : xFor(bench.end)
          const barY = laneY + lane.barTop
          const cy = barY + lane.barH / 2
          const tagFs = fs - 3
          const tagW = bench.tag.length * tagFs * 0.62
          const tagX =
            bench.tagMode === "afterEnd" ? xEnd + 6 : bench.tagMode === "afterStart" ? xStart + 4 : xEnd - 8
          const tagAnchor = bench.tagMode === "endIn" ? "end" : "start"

          return (
            <g
              key={bench.key}
              opacity={isSel ? 1 : 0.5}
              style={{ cursor: "pointer" }}
              onClick={() => setSel(i)}
            >
              {/* hit area + selection wash */}
              <rect
                x={compact ? 8 : 8}
                y={laneY}
                width={(compact ? 444 : 955) - 8}
                height={lane.pitch}
                fill={isSel ? rgba(p.inkRGB, 0.045) : "transparent"}
              />

              {/* lane label */}
              {compact ? (
                <text
                  x={16}
                  y={laneY + lane.labelY}
                  fill={isSel ? p.ink : p.muted}
                  style={{ fontSize: fs - 2, fontWeight: 700, letterSpacing: "0.04em", fontFamily: "var(--font-mono), monospace" }}
                >
                  {bench.cLabel}
                </text>
              ) : (
                <text
                  x={150}
                  y={laneY + lane.labelY}
                  textAnchor="end"
                  fill={isSel ? p.ink : p.muted}
                  style={{ fontSize: fs - 2, fontWeight: 700, letterSpacing: "0.04em", fontFamily: "var(--font-mono), monospace" }}
                >
                  {bench.label}
                </text>
              )}

              {/* the bar */}
              <rect
                x={xStart}
                y={barY}
                width={Math.max(4, xEnd - xStart)}
                height={lane.barH}
                rx={3}
                fill={bench.start === null ? `url(#${grad})` : col}
                fillOpacity={bench.start === null ? 1 : isSel ? 0.42 : 0.26}
                stroke={isSel ? col : p.hair}
                strokeWidth={isSel ? 1.6 : 1}
              />

              {/* alive / open lanes run into the private era */}
              {open && (
                <path
                  d={`M ${arrowX} ${cy - 6} L ${arrowX + 10} ${cy} L ${arrowX} ${cy + 6} Z`}
                  fill={col}
                  fillOpacity={isSel ? 0.9 : 0.6}
                />
              )}

              {/* dissolve dots: an ended bar stops carrying signal */}
              {!open &&
                DOTS.map((d, j) => (
                  <circle
                    key={j}
                    cx={xEnd + 5 + d.fx * (compact ? 26 : 42)}
                    cy={cy + d.fy * (lane.barH / 2 + 1)}
                    r={d.r}
                    fill={col}
                    opacity={(1 - d.fx) * 0.5}
                  />
                ))}

              {/* retirement cross */}
              {bench.retired && (
                <g stroke={p.danger} strokeWidth={2} strokeLinecap="round">
                  <line x1={xEnd - 5} y1={cy - 5} x2={xEnd + 5} y2={cy + 5} />
                  <line x1={xEnd - 5} y1={cy + 5} x2={xEnd + 5} y2={cy - 5} />
                </g>
              )}

              {/* amber event marker (GPQA: models pass the expert baseline) */}
              {bench.mark !== undefined && (
                <circle cx={xFor(bench.mark)} cy={cy} r={4.5} fill={p.verdict} />
              )}

              {/* value tag (desktop only; compact labels carry the state) */}
              {!compact && (
                <text
                  x={bench.tagMode === "endIn" && tagX - tagW < xStart - 160 ? xStart : tagX}
                  y={laneY + 8}
                  textAnchor={tagAnchor}
                  fill={bench.retired ? p.danger : col}
                  style={{ fontSize: tagFs, letterSpacing: "0.06em", fontFamily: "var(--font-mono), monospace" }}
                >
                  {bench.tag}
                </text>
              )}
            </g>
          )
        })}

        {/* ===== legend (desktop) ===== */}
        {!compact && (
          <g style={{ fontFamily: "var(--font-mono), monospace" }}>
            {(
              [
                { t: "SATURATED", c: p.cool },
                { t: "CONTESTED", c: p.verdict },
                { t: "ALIVE", c: p.signal },
                { t: "RETIRED", c: p.danger },
              ] as const
            ).map((it, i) => (
              <g key={it.t}>
                <rect x={162 + i * 150} y={496} width={16} height={8} rx={2} fill={it.c} fillOpacity={0.5} stroke={it.c} strokeWidth={1} />
                <text x={162 + i * 150 + 24} y={504} fill={p.muted} style={{ fontSize: fs - 3 }}>
                  {it.t}
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{ fontFamily: "var(--font-mono), monospace", color: selColor }}
      >
        {"VERDICT · "}
        {b.verdict}
      </div>

      {/* controls lane */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {BENCHES.map((bench, i) => {
          const on = i === sel
          const col = bench.retired ? p.danger : stateColor(bench, p)
          return (
            <button
              key={bench.key}
              type="button"
              aria-pressed={on}
              onClick={() => setSel(i)}
              className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
              style={{
                fontFamily: "var(--font-mono), monospace",
                color: on ? col : p.muted,
                border: `1px solid ${on ? col : p.hair}`,
                background: on ? rgba(p.inkRGB, 0.07) : "transparent",
              }}
            >
              {bench.pill}
            </button>
          )
        })}
        <span
          className="text-[11px]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          click a lane · read its record
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function HarnessOfRecord() {
  return (
    <InstrumentFrame
      kicker="V5 · THE HARNESS OF RECORD"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          Every public benchmark here was built to separate models, and each stops
          separating on a clock: MMLU went flat in March 2023, the leaderboard behind
          the common harness closed in June 2024, and SWE-bench Verified was retired
          in February 2026 by the company that helped build it. The lanes still
          measuring anything share one design choice, questions nobody can train on,
          which is why the harness of record moved in-house and private held-out
          evals on your own tasks became the moat.
        </>
      }
      method={
        <>
          MEASURED · every date and figure is a ledger claim: lm-evaluation-harness
          v0.0.1, Gao et al., Zenodo 5371629 (2021); Open LLM Leaderboard v1 archive,
          Hugging Face (2024); MMLU saturation + MMLU-Pro, Wang et al.,
          arXiv:2406.01574 (2024); SWE-bench, Jimenez et al., arXiv:2310.06770 (2023);
          SWE-bench Verified, swebench.com with OpenAI (2024); its retirement, OpenAI,
          Why SWE-bench Verified no longer measures frontier coding (2026); GPQA, Rein
          et al., arXiv:2311.12022 (2023) + Epoch AI, GPQA Diamond (2025); HLE, Phan
          et al., arXiv:2501.14249 (2025); ARC-AGI-2 + ARC Prize 2025, arcprize.org
          (2025). Lane spans connect the dated events; MMLU enters from the window
          edge because its launch predates the window (no date asserted). Dissolve
          dots are decorative.
        </>
      }
    >
      {(ctx) => <RecordScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
