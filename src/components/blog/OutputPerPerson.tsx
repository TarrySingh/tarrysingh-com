"use client"

/**
 * Output per person — "the fork in the forecast".
 *
 * The honest, striking framing of AI's effect on output is not a single
 * triumphant curve — it is the SPREAD of credible forecasts. Global real GDP
 * growth has been roughly flat for a century (~1.5% → ~3.1%/yr). From 2026 it
 * FORKS into three expert projections to 2030 that disagree by 2–4×:
 *
 *   • ARK (bull)        → >7% (7–10%) — disruptive-innovation inflection
 *   • IMF / consensus   → ~3.1% — flat baseline
 *   • Acemoglu (bear)   → ~3.2% — only +1.1% GDP over 10yr → a small bump
 *
 * The wedge between the bull and the baseline is shaded as "the disagreement".
 * Hover (or focus) a fork line to light it and pull its source + figure into
 * the caption; the ARK line is emphasised by default with the others visible.
 * A mono annotation strip carries the supporting productivity figures.
 *
 * Theme-aware via the Read mode, responsive viewBox, keyboard-operable.
 */

import { useRef, useState } from "react"
import {
  PlateFrame,
  paletteFor,
  useReadMode,
  usePrefersReducedMotion,
  linScale,
  smoothPath,
  type ReadPalette,
} from "./read-chart-kit"

const VW = 1000
const VH = 560
const PAD_L = 60
const PAD_R = 150 // room for endpoint labels on the right
const PAD_T = 34
const PAD_B = 86 // room for year axis + annotation strip

// X is piecewise: the flat century is compressed into the left third, the
// 2024→2030 fork is expanded across the right so three close-ish lines read.
const HIST0 = 1900
const FORK = 2024
const X1 = 2030
const X_SPLIT = 0.4 // fraction of the plot width given to 1900→2024

const Y_LO = 0
const Y_HI = 8

const PLOT_L = PAD_L
const PLOT_R = VW - PAD_R
const PLOT_W = PLOT_R - PLOT_L
const SPLIT_X = PLOT_L + PLOT_W * X_SPLIT

/** piecewise X: 1900→2024 in [PLOT_L, SPLIT_X], 2024→2030 in [SPLIT_X, PLOT_R]. */
function xFor(year: number): number {
  if (year <= FORK) {
    return linScale(HIST0, FORK, PLOT_L, SPLIT_X)(year)
  }
  return linScale(FORK, X1, SPLIT_X, PLOT_R)(year)
}
const yFor = linScale(Y_LO, Y_HI, VH - PAD_B, PAD_T)

interface Pt {
  year: number
  v: number
}

// Historical backbone — annualised global real GDP growth, ~flat then rising.
const HISTORICAL: Pt[] = [
  { year: 1900, v: 1.5 },
  { year: 1950, v: 2.5 },
  { year: 2000, v: 3.0 },
  { year: 2024, v: 3.1 },
]

type ForkKey = "ark" | "imf" | "acemoglu"

interface Fork {
  key: ForkKey
  label: string
  source: string
  /** one-line figure shown in the caption on hover */
  figure: string
  tone: keyof ReadPalette["series"]
  /** the path from the 2024 hand-off to its 2030 endpoint */
  pts: Pt[]
  /** endpoint value text */
  endLabel: string
}

const FORKS: Fork[] = [
  {
    key: "ark",
    label: "ARK · bull",
    source: "ARK Big Ideas 2025",
    figure:
      "ARK (bull): a disruptive-innovation inflection drives global real GDP growth past 7% — ARK floats a 7–10% range — by 2030, against a ~3% long-run average.",
    tone: "gold",
    endLabel: "7–10%",
    pts: [
      { year: 2024, v: 3.1 },
      { year: 2026, v: 3.6 },
      { year: 2027, v: 4.5 },
      { year: 2028, v: 5.6 },
      { year: 2029, v: 6.6 },
      { year: 2030, v: 7.3 },
    ],
  },
  {
    key: "acemoglu",
    label: "Acemoglu · skeptic",
    source: "Acemoglu, MIT / NBER 2024",
    figure:
      "Acemoglu (bear): only +0.7% TFP and ~+1.1% GDP over ten years — a small bump to ~3.2%.",
    tone: "rose",
    endLabel: "3.2%",
    pts: [
      { year: 2024, v: 3.1 },
      { year: 2026, v: 3.12 },
      { year: 2028, v: 3.16 },
      { year: 2030, v: 3.2 },
    ],
  },
  {
    key: "imf",
    label: "IMF · consensus",
    source: "IMF · WEO baseline",
    figure:
      "IMF / consensus: the baseline stays roughly flat at ~3.1% — AI shows up in pockets, not the aggregate.",
    tone: "cool",
    endLabel: "3.1%",
    pts: [
      { year: 2024, v: 3.1 },
      { year: 2026, v: 3.08 },
      { year: 2028, v: 3.1 },
      { year: 2030, v: 3.1 },
    ],
  },
]

const Y_TICKS = [0, 2, 4, 6, 8]
const X_TICKS = [1900, 1950, 2000, 2024, 2026, 2028, 2030]

// Supporting productivity figures — small mono micro-labels. `at` is the
// fraction of the plot width where each label is left-anchored; widths are
// uneven so the longest (Goldman) leads and nothing clips the right edge.
const ANNOTATIONS: { text: string; at: number }[] = [
  { text: "Goldman: +7% global GDP (~$7T), +1.5pp productivity / 10yr", at: 0 },
  { text: "McKinsey: $2.6–4.4T / yr", at: 0.62 },
  { text: "WEF 2025: +78M net jobs by 2030", at: 0.83 },
]

export function OutputPerPerson() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = paletteFor(mode)
  // ARK is the hero by default.
  const [active, setActive] = useState<ForkKey>("ark")

  const histPath = smoothPath(HISTORICAL.map((d) => [xFor(d.year), yFor(d.v)]))

  const forkPath = (f: Fork) => smoothPath(f.pts.map((d) => [xFor(d.year), yFor(d.v)]))

  // Disagreement wedge: between the ARK (bull) line and the IMF baseline.
  const bull = FORKS.find((f) => f.key === "ark")!
  const base = FORKS.find((f) => f.key === "imf")!
  const wedgeTop = bull.pts.map((d) => [xFor(d.year), yFor(d.v)] as [number, number])
  const wedgeBot = [...base.pts]
    .reverse()
    .map((d) => [xFor(d.year), yFor(d.v)] as [number, number])
  const wedgePath =
    `M ${wedgeTop[0][0]} ${wedgeTop[0][1]} ` +
    wedgeTop
      .slice(1)
      .map((pt) => `L ${pt[0]} ${pt[1]}`)
      .join(" ") +
    " " +
    wedgeBot.map((pt) => `L ${pt[0]} ${pt[1]}`).join(" ") +
    " Z"

  const activeFork = FORKS.find((f) => f.key === active)!
  const [forkX] = [xFor(FORK)]
  const forkY = yFor(3.1)

  const fmtX = (y: number) => String(y)

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker="Fig. — Output per person · global real GDP growth (% / yr) · the fork in the forecast"
      caption={
        <>
          <strong style={{ color: p.ink, fontStyle: "normal" }}>{activeFork.label}.</strong>{" "}
          {activeFork.figure}{" "}
          <span style={{ color: p.soft }}>
            A century of flat ~3% growth forks by 2–4× after 2024 — even the experts disagree.
            Sources: ARK 2025 · IMF · Acemoglu (MIT/NBER 2024) · Goldman 2023 · McKinsey 2023 · WEF 2025.
          </span>
        </>
      }
      controls={
        <div className="flex items-center gap-2">
          {FORKS.map((f) => {
            const on = active === f.key
            return (
              <button
                key={f.key}
                type="button"
                onMouseEnter={() => setActive(f.key)}
                onFocus={() => setActive(f.key)}
                onClick={() => setActive(f.key)}
                aria-pressed={on}
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  color: on ? p.bg : p.series[f.tone],
                  background: on ? p.series[f.tone] : "transparent",
                  border: `1px solid ${p.series[f.tone]}`,
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      }
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full"
        role="img"
        aria-label="The fork in the forecast. Global real GDP growth was roughly flat for a century — about 1.5 percent per year in 1900 rising to 3.1 percent in 2024. From 2026 three expert projections diverge sharply to 2030: ARK's bull case reaches past 7 percent — a 7-to-10 percent range — the IMF and consensus baseline stays near 3.1 percent, and Acemoglu's skeptic case rises only slightly to 3.2 percent. The wedge between the bull case and the baseline is shaded as the disagreement. Even credible experts differ by two to fourfold."
      >
        <defs>
          <linearGradient id="opp-wedge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.series.gold} stopOpacity={mode === "dark" ? 0.2 : 0.16} />
            <stop offset="100%" stopColor={p.series.gold} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal gridlines + % labels */}
        {Y_TICKS.map((t) => {
          const y = yFor(t)
          return (
            <g key={`y-${t}`}>
              <line x1={PLOT_L} x2={PLOT_R} y1={y} y2={y} stroke={p.hair} strokeWidth={1} />
              <text
                x={PLOT_L - 12}
                y={y + 4}
                textAnchor="end"
                fontFamily="var(--font-mono), monospace"
                fontSize={13}
                fill={p.soft}
              >
                {t}%
              </text>
            </g>
          )
        })}

        {/* the fork seam: a faint vertical at 2024 dividing history from forecast */}
        <line
          x1={SPLIT_X}
          x2={SPLIT_X}
          y1={PAD_T}
          y2={VH - PAD_B}
          stroke={p.accent}
          strokeOpacity={0.35}
          strokeWidth={1}
          strokeDasharray="2 5"
        />
        <text
          x={SPLIT_X}
          y={PAD_T - 12}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={11}
          letterSpacing={2}
          fill={p.accent}
        >
          THE FORK · 2024
        </text>
        <text
          x={(PLOT_L + SPLIT_X) / 2}
          y={VH - PAD_B + 44}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={11}
          letterSpacing={2}
          fill={p.soft}
        >
          A CENTURY, ~FLAT
        </text>
        <text
          x={(SPLIT_X + PLOT_R) / 2}
          y={VH - PAD_B + 44}
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={11}
          letterSpacing={2}
          fill={p.soft}
        >
          THREE FORECASTS, 2026 → 2030
        </text>

        {/* the disagreement wedge */}
        <path d={wedgePath} fill="url(#opp-wedge)" />
        <text
          {...(() => {
            const gx = xFor(2028.4)
            const gy = (yFor(5.6) + yFor(3.1)) / 2
            return { x: gx, y: gy }
          })()}
          textAnchor="middle"
          fontFamily="var(--font-serif), serif"
          fontStyle="italic"
          fontSize={13}
          fill={p.muted}
        >
          the disagreement
        </text>

        {/* x ticks */}
        {X_TICKS.map((yr) => (
          <text
            key={`x-${yr}`}
            x={xFor(yr)}
            y={VH - PAD_B + 22}
            textAnchor="middle"
            fontFamily="var(--font-mono), monospace"
            fontSize={13}
            fill={yr === FORK ? p.accent : p.soft}
          >
            {fmtX(yr)}
          </text>
        ))}

        {/* historical backbone */}
        <path d={histPath} fill="none" stroke={p.ink} strokeOpacity={0.78} strokeWidth={2.4} />
        {HISTORICAL.map((d) => (
          <circle
            key={`h-${d.year}`}
            cx={xFor(d.year)}
            cy={yFor(d.v)}
            r={3}
            fill={p.bg}
            stroke={p.ink}
            strokeOpacity={0.7}
            strokeWidth={1.6}
          />
        ))}

        {/* fork lines — dimmed except the active one */}
        {FORKS.map((f) => {
          const c = p.series[f.tone]
          const on = active === f.key
          const end = f.pts[f.pts.length - 1]
          const ex = xFor(end.year)
          const ey = yFor(end.v)
          return (
            <g
              key={f.key}
              tabIndex={0}
              role="button"
              aria-label={`${f.label}: ${f.endLabel} by 2030. ${f.figure}`}
              onMouseEnter={() => setActive(f.key)}
              onFocus={() => setActive(f.key)}
              style={{ cursor: "pointer", outline: "none" }}
            >
              {/* fat invisible hit-area along the line */}
              <path
                d={forkPath(f)}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                strokeLinecap="round"
              />
              <path
                d={forkPath(f)}
                fill="none"
                stroke={c}
                strokeWidth={on ? 3.4 : 2}
                strokeOpacity={on ? 1 : 0.42}
                strokeLinecap="round"
                style={{ transition: reduced ? undefined : "stroke-width 180ms ease, stroke-opacity 180ms ease" }}
              />
              {/* endpoint marker */}
              <circle
                cx={ex}
                cy={ey}
                r={on ? 6 : 4}
                fill={c}
                fillOpacity={on ? 1 : 0.5}
                stroke={p.bg}
                strokeWidth={2}
                style={{ transition: reduced ? undefined : "r 180ms ease" }}
              />
              {/* endpoint label: value + source */}
              <text
                x={ex + 12}
                y={ey - 2}
                fontFamily="var(--font-mono), monospace"
                fontSize={15}
                fontWeight={700}
                fill={c}
                fillOpacity={on ? 1 : 0.62}
                style={{ transition: reduced ? undefined : "fill-opacity 180ms ease" }}
              >
                {f.endLabel}
              </text>
              <text
                x={ex + 12}
                y={ey + 13}
                fontFamily="var(--font-mono), monospace"
                fontSize={10}
                letterSpacing={0.5}
                fill={p.muted}
                fillOpacity={on ? 1 : 0.55}
                style={{ transition: reduced ? undefined : "fill-opacity 180ms ease" }}
              >
                {f.source}
              </text>
            </g>
          )
        })}

        {/* the fork hinge — where they part */}
        <circle cx={forkX} cy={forkY} r={4.5} fill={p.accent} stroke={p.bg} strokeWidth={2} />

        {/* annotation strip — supporting productivity figures, small mono */}
        <g>
          <line
            x1={PLOT_L}
            x2={PLOT_R}
            y1={VH - 30}
            y2={VH - 30}
            stroke={p.hair}
            strokeWidth={1}
          />
          {ANNOTATIONS.map((a, i) => {
            const x = PLOT_L + a.at * (PLOT_R - PLOT_L)
            return (
              <g key={i}>
                {i > 0 && (
                  <text
                    x={x - 12}
                    y={VH - 13}
                    textAnchor="middle"
                    fontFamily="var(--font-mono), monospace"
                    fontSize={11}
                    fill={p.soft}
                    fillOpacity={0.6}
                  >
                    ·
                  </text>
                )}
                <text
                  x={x}
                  y={VH - 13}
                  fontFamily="var(--font-mono), monospace"
                  fontSize={11}
                  fill={p.soft}
                >
                  {a.text}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </PlateFrame>
  )
}
