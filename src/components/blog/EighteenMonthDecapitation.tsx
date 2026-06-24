"use client"

/**
 * V20 — THE 18-MONTH DECAPITATION  (Chapter 5, "Tenant Farms: The Bright Spots,
 * Honestly").
 *
 * Europe's single most valuable company was beheaded by a US rival in eighteen
 * months. Two market-cap lines run from mid-2024 to mid-2026: Novo Nordisk
 * (blueprint cyan = the value Europe held) peaking near $604bn in June 2024 and
 * collapsing to ~$197bn by June 2026 — about a 67% fall, roughly half of it in
 * 2025 alone; Eli Lilly (reserved red = the foreign capture) climbing past it
 * to become the first $1-trillion healthcare company on 24 Nov 2025 and ~$1.01tn
 * by mid-2026, about 5× Novo. The reader scrubs a time handle: the lines cross
 * where leadership changed hands, then diverge. A mono readout shows both caps
 * and the multiple. The trigger — Novo's CagriSema trial miss (22.7% vs a ~25%
 * target weight loss) — is marked on the cyan line where the fall accelerates.
 *
 * REVEAL: Europe's biggest champion, more than halved and dethroned, in the time
 * it takes to run a clinical trial.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (range slider + ←/→/Home/End), reduced-motion safe (no ambient
 * animation; only the user's scrub moves the readout — at mount it rests at
 * mid-2026, the static end-state), role="img" with a spoken aria-label, and
 * meaningful at its default as the static fallback.
 *
 * Figures hard-coded from the spec. Sources: market-cap data (MacroTrends /
 * companiesmarketcap.com); Eli Lilly first $1tn healthcare company (CNBC,
 * 24 Nov 2025); CagriSema results (Feb 2026).
 */

import { useMemo, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  linScale,
  logScale,
  clamp,
  smoothPath,
} from "./read-chart-kit"
import { cpPalette } from "./chokepoint-kit"

// Monthly market caps in $bn, mid-2024 → mid-2026 (25 points, t = month index).
// Novo (cyan): peaks ~604 (Jun 2024), ~50% of the fall in 2025, ~197 by Jun 2026.
// Lilly (red): climbs past Novo, first $1tn healthcare co. (24 Nov 2025), ~1010.
type Pt = { m: number; label: string; novo: number; lilly: number }
const SERIES: Pt[] = [
  { m: 0, label: "Jun 2024", novo: 604, lilly: 845 },
  { m: 1, label: "Jul 2024", novo: 590, lilly: 880 },
  { m: 2, label: "Aug 2024", novo: 575, lilly: 860 },
  { m: 3, label: "Sep 2024", novo: 555, lilly: 840 },
  { m: 4, label: "Oct 2024", novo: 530, lilly: 800 },
  { m: 5, label: "Nov 2024", novo: 505, lilly: 760 },
  { m: 6, label: "Dec 2024", novo: 470, lilly: 740 },
  { m: 7, label: "Jan 2025", novo: 410, lilly: 770 },
  { m: 8, label: "Feb 2025", novo: 365, lilly: 800 },
  { m: 9, label: "Mar 2025", novo: 345, lilly: 790 },
  { m: 10, label: "Apr 2025", novo: 330, lilly: 760 },
  { m: 11, label: "May 2025", novo: 310, lilly: 780 },
  { m: 12, label: "Jun 2025", novo: 290, lilly: 800 },
  { m: 13, label: "Jul 2025", novo: 270, lilly: 815 },
  { m: 14, label: "Aug 2025", novo: 255, lilly: 850 },
  { m: 15, label: "Sep 2025", novo: 240, lilly: 890 },
  { m: 16, label: "Oct 2025", novo: 230, lilly: 950 },
  { m: 17, label: "Nov 2025", novo: 222, lilly: 1000 },
  { m: 18, label: "Dec 2025", novo: 218, lilly: 990 },
  { m: 19, label: "Jan 2026", novo: 212, lilly: 1005 },
  { m: 20, label: "Feb 2026", novo: 200, lilly: 1015 },
  { m: 21, label: "Mar 2026", novo: 198, lilly: 1000 },
  { m: 22, label: "Apr 2026", novo: 196, lilly: 1008 },
  { m: 23, label: "May 2026", novo: 197, lilly: 1012 },
  { m: 24, label: "Jun 2026", novo: 197, lilly: 1010 },
]
const LAST = SERIES.length - 1

// Anchored event marks.
const CROSS_M = 6 // Dec 2024 — Lilly's lead becomes decisive; leadership changes hands
const CAGRI_M = 7 // late-2024 / Jan 2025 readout — CagriSema disappoints; the fall accelerates
const TRILLION_M = 17 // 24 Nov 2025 — first $1tn healthcare company

// ---- plot frame (viewBox units) -------------------------------------------
const W = 920
const H = 440
const PADL = 64
const PADR = 150
const PADT = 64
const PADB = 56
const PLOT_W = W - PADL - PADR
const PLOT_H = H - PADT - PADB

const x = linScale(0, LAST, PADL, PADL + PLOT_W)
// log Y so a 197bn → 1010bn spread reads on one axis without flattening Novo.
const y = logScale(150, 1100, PADT + PLOT_H, PADT)

const fmtCap = (bn: number) =>
  bn >= 1000 ? `$${(bn / 1000).toFixed(2)}tn` : `$${Math.round(bn)}bn`

export function EighteenMonthDecapitation() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)

  // The scrub handle. Rests at the end (mid-2026) — the static reveal state.
  const [m, setM] = useState(LAST)

  const novoPath = useMemo(
    () => smoothPath(SERIES.map((d) => [x(d.m), y(d.novo)] as [number, number])),
    [],
  )
  const lillyPath = useMemo(
    () => smoothPath(SERIES.map((d) => [x(d.m), y(d.lilly)] as [number, number])),
    [],
  )

  const cur = SERIES[m]
  // interpolate nothing — month points are discrete; the slider snaps per month.
  const novoNow = cur.novo
  const lillyNow = cur.lilly
  const mult = lillyNow / novoNow
  const cursorX = x(cur.m)

  const peak = SERIES[0].novo // 604
  const novoFall = (1 - novoNow / peak) * 100

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Home") {
      e.preventDefault()
      setM(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setM(LAST)
    }
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V20 · The 18-Month Decapitation"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.squeezeHi }}
        >
          {cur.label} · LLY {mult.toFixed(1)}× NOVO
        </span>
      }
      caption={
        <>
          Drag the handle — or use ←/→ — across eighteen months.{" "}
          <span style={{ color: p.leverage }}>Novo Nordisk</span>, Europe&rsquo;s most valuable
          company, peaks near $604bn and collapses two-thirds;{" "}
          <span style={{ color: p.squeeze }}>Eli Lilly</span> climbs past it to become the first
          $1-trillion healthcare company (24 Nov 2025) and roughly 5× Novo. The{" "}
          <span style={{ color: p.wonder }}>CagriSema miss</span> — 22.7% weight loss against a
          ~25% target — is where the cyan line breaks. Sources: market-cap data (MacroTrends /
          companiesmarketcap.com); Eli Lilly $1tn (CNBC, 24 Nov 2025); CagriSema results (Feb 2026).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Twin market-cap lines, mid-2024 to mid-2026. Novo Nordisk falls from about $604bn to about $197bn — a ${Math.round(
          novoFall,
        )} percent fall — while Eli Lilly climbs to about $1.01 trillion, roughly five times Novo, after becoming the first $1-trillion healthcare company on 24 November 2025. At ${cur.label}: Novo ${fmtCap(
          novoNow,
        )}, Lilly ${fmtCap(lillyNow)}, a multiple of ${mult.toFixed(1)} times.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="emd-novo-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.leverage} stopOpacity={0.22} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="emd-lilly-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.squeeze} stopOpacity={0.18} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* gridlines — log decades / half-decades, faint blueprint hairlines */}
        {[200, 300, 400, 600, 800, 1000].map((v) => (
          <g key={v}>
            <line
              x1={PADL}
              y1={y(v)}
              x2={PADL + PLOT_W}
              y2={y(v)}
              stroke={p.blueprint}
              strokeWidth={1}
            />
            <text
              x={PADL - 10}
              y={y(v) + 4}
              textAnchor="end"
              fill={p.soft}
              style={{ fontSize: 10.5 }}
            >
              {fmtCap(v)}
            </text>
          </g>
        ))}

        {/* baseline + axis date ticks (quarterly) */}
        <line x1={PADL} y1={PADT + PLOT_H} x2={PADL + PLOT_W} y2={PADT + PLOT_H} stroke={p.hair} strokeWidth={1} />
        {SERIES.filter((d) => d.m % 6 === 0).map((d) => (
          <text
            key={d.m}
            x={x(d.m)}
            y={PADT + PLOT_H + 20}
            textAnchor="middle"
            fill={p.soft}
            style={{ fontSize: 10.5 }}
          >
            {d.label}
          </text>
        ))}

        {/* area fills under each line */}
        <path
          d={`${lillyPath} L ${x(LAST)} ${PADT + PLOT_H} L ${x(0)} ${PADT + PLOT_H} Z`}
          fill="url(#emd-lilly-fill)"
        />
        <path
          d={`${novoPath} L ${x(LAST)} ${PADT + PLOT_H} L ${x(0)} ${PADT + PLOT_H} Z`}
          fill="url(#emd-novo-fill)"
        />

        {/* crossover marker — where leadership changed hands */}
        <line
          x1={x(CROSS_M)}
          y1={PADT}
          x2={x(CROSS_M)}
          y2={PADT + PLOT_H}
          stroke={p.squeeze}
          strokeWidth={1}
          strokeDasharray="3 5"
          opacity={0.55}
        />
        <text
          x={x(CROSS_M) + 6}
          y={PADT + 14}
          textAnchor="start"
          fill={p.squeeze}
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em" }}
        >
          LEAD CHANGES HANDS
        </text>

        {/* the two market-cap lines */}
        <path d={lillyPath} fill="none" stroke={p.squeeze} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <path d={novoPath} fill="none" stroke={p.leverage} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

        {/* line end-labels (always visible, the static reveal) */}
        <g>
          <circle cx={x(LAST)} cy={y(SERIES[LAST].lilly)} r={4.5} fill={p.squeezeHi} stroke={p.bg} strokeWidth={1.5} />
          <text x={x(LAST) + 12} y={y(SERIES[LAST].lilly) - 8} fill={p.squeeze} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>
            ELI LILLY
          </text>
          <text x={x(LAST) + 12} y={y(SERIES[LAST].lilly) + 10} fill={p.squeezeHi} style={{ fontSize: 18, fontWeight: 800 }}>
            ~$1.01tn
          </text>
        </g>
        <g>
          <circle cx={x(LAST)} cy={y(SERIES[LAST].novo)} r={4.5} fill={p.leverageHi} stroke={p.bg} strokeWidth={1.5} />
          <text x={x(LAST) + 12} y={y(SERIES[LAST].novo) - 6} fill={p.leverage} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>
            NOVO NORDISK
          </text>
          <text x={x(LAST) + 12} y={y(SERIES[LAST].novo) + 12} fill={p.leverageHi} style={{ fontSize: 18, fontWeight: 800 }}>
            ~$197bn
          </text>
        </g>

        {/* CagriSema trigger — the wonder/gold beat, marked on the cyan line */}
        <circle cx={x(CAGRI_M)} cy={y(SERIES[CAGRI_M].novo)} r={7} fill="none" stroke={p.wonder} strokeWidth={2} />
        <circle cx={x(CAGRI_M)} cy={y(SERIES[CAGRI_M].novo)} r={2.5} fill={p.wonder} />
        <line
          x1={x(CAGRI_M)}
          y1={y(SERIES[CAGRI_M].novo) - 7}
          x2={x(CAGRI_M) - 4}
          y2={y(SERIES[CAGRI_M].novo) - 40}
          stroke={p.wonder}
          strokeWidth={1}
        />
        <text x={x(CAGRI_M) - 4} y={y(SERIES[CAGRI_M].novo) - 46} textAnchor="middle" fill={p.wonder} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
          CAGRISEMA MISS
        </text>
        <text x={x(CAGRI_M) - 4} y={y(SERIES[CAGRI_M].novo) - 34} textAnchor="middle" fill={p.wonderHi} style={{ fontSize: 10 }}>
          22.7% vs ~25%
        </text>

        {/* $1tn beat on the red line */}
        <circle cx={x(TRILLION_M)} cy={y(SERIES[TRILLION_M].lilly)} r={6} fill="none" stroke={p.squeezeHi} strokeWidth={2} />
        <text x={x(TRILLION_M)} y={y(SERIES[TRILLION_M].lilly) - 14} textAnchor="middle" fill={p.squeezeHi} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
          FIRST $1TN · 24 NOV 2025
        </text>

        {/* ---- the scrub cursor + live readout ---- */}
        <line x1={cursorX} y1={PADT} x2={cursorX} y2={PADT + PLOT_H} stroke={p.ink} strokeWidth={1} opacity={0.28} />
        <circle cx={cursorX} cy={y(lillyNow)} r={5.5} fill={p.squeeze} stroke={p.bg} strokeWidth={2} />
        <circle cx={cursorX} cy={y(novoNow)} r={5.5} fill={p.leverage} stroke={p.bg} strokeWidth={2} />

        {/* the multiple, named in mono at the cursor head */}
        <text
          x={clamp(cursorX, PADL + 40, PADL + PLOT_W - 40)}
          y={PADT - 30}
          textAnchor="middle"
          fill={p.squeeze}
          style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em" }}
        >
          {mult.toFixed(1)}×
        </text>
        <text
          x={clamp(cursorX, PADL + 40, PADL + PLOT_W - 40)}
          y={PADT - 14}
          textAnchor="middle"
          fill={p.soft}
          style={{ fontSize: 9.5, letterSpacing: "0.16em" }}
        >
          LILLY ÷ NOVO · {cur.label}
        </text>
      </svg>

      {/* the scrub control — keyboard-reachable native range input */}
      <div className="mt-1 px-1">
        <input
          type="range"
          min={0}
          max={LAST}
          step={1}
          value={m}
          onChange={(e) => setM(clamp(Number(e.target.value), 0, LAST))}
          onKeyDown={onKey}
          aria-label="Scrub the timeline from mid-2024 to mid-2026"
          aria-valuetext={`${cur.label}: Novo ${fmtCap(novoNow)}, Lilly ${fmtCap(lillyNow)}, ${mult.toFixed(1)} times`}
          style={{ width: "100%", accentColor: p.squeeze, cursor: "pointer" }}
        />
        <div className="flex items-baseline justify-between gap-4" style={{ fontFamily: "var(--font-mono), monospace" }}>
          <span style={{ fontSize: 11, color: p.leverage }}>
            NOVO <span style={{ fontWeight: 800, color: p.leverageHi }}>{fmtCap(novoNow)}</span>
            <span style={{ color: p.soft }}> · {Math.round(novoFall)}% off peak</span>
          </span>
          <span style={{ fontSize: 11, color: p.squeeze }}>
            <span style={{ fontWeight: 800, color: p.squeezeHi }}>{fmtCap(lillyNow)}</span> LILLY
          </span>
        </div>
      </div>

      <p
        className="mt-3 px-1 text-[15px]"
        style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
      >
        <span style={{ color: p.squeeze, fontStyle: "normal", fontWeight: 700 }}>
          {Math.round(novoFall)}% gone
        </span>{" "}
        — Europe&rsquo;s biggest champion, more than halved and dethroned, in the time it takes to
        run a clinical trial.
      </p>
    </PlateFrame>
  )
}
