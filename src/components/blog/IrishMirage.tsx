"use client"

/**
 * V35 — THE IRISH MIRAGE  (Chapter 10, "The Quarter-Trillion Tribute").
 *
 * Europe's one apparent tech surplus is an accounting hallucination. Ireland's
 * headline GDP (~€563bn) towers over the EU as a tech-export surplus star — but
 * strip out the US-multinational profit-shifting and Ireland's REAL national
 * income (GNI*) is only ~€321bn. GDP runs ~75% above real income — a ~43-point
 * gap. And once Ireland's artificial surplus is removed, the genuine EU–US
 * digital trade balance is not a surplus at all but a DEFICIT on the order of
 * −$350bn (2022–24, CASSIS / University of Bonn).
 *
 * The mirage is also fragile: the top 3 firms pay ~46% of Ireland's corporation
 * tax (Irish Fiscal Council), and multinational-dominated output swung violently
 * (−27% in Q1 2026).
 *
 * Toggle THE MIRAGE ⟷ THE REAL LEDGER. Flipping collapses the gold "surplus"
 * tower down onto its real GNI* base, exposes the red phantom gap, and turns the
 * EU–US digital balance from an apparent win into a red deficit.
 *
 * REVEAL: Europe loses on both the bet and the fold — even the one number that
 * looked like winning was a mirage.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (the collapse is a CSS transition gated behind prefers-reduced-
 * motion — reduced users get the end-state directly), keyboard-reachable (native
 * button toggle + ←/→), and meaningful at its REAL-LEDGER default as the static
 * fallback.
 *
 * Figures hard-coded. Sources: Ireland CSO (GDP vs GNI*, 2024); CASSIS /
 * University of Bonn (−$350bn EU–US digital deficit, 2022–24); Irish Fiscal
 * Council (corporation-tax concentration).
 */

import { useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  linScale,
  lerp,
} from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

type View = "mirage" | "real"

// ── The two numbers at the heart of the hallucination (Ireland CSO, 2024).
const GDP = 563 // €bn, headline GDP — the mirage
const GNI = 321 // €bn, GNI* — Ireland's real modified national income
const PHANTOM = GDP - GNI // €242bn of profit-shifting that isn't real income
const GAP_PCT = Math.round(((GDP - GNI) / GNI) * 100) // ~75% above real income
const GAP_POINTS = 43 // GDP runs ~43 points above GNI* (CSO framing)

// ── The genuine EU–US digital trade balance, once the artificial surplus is
// stripped out: a deficit on the order of −$350bn (CASSIS / Univ. of Bonn).
const DIGITAL_DEFICIT = 350 // $bn, the real EU–US digital deficit (2022–24)

// ── Fragility tells.
const TOP3_TAX = 46 // % of Ireland's corporation tax paid by top 3 firms
const MNC_SWING = 27 // % collapse in multinational-dominated output, Q1 2026

// Plot frame (viewBox units).
const W = 920
const H = 560
const BASE_Y = 430 // the ledger baseline (zero)
const TOP_Y = 96 // top of the plot
const TOWER_X = 196 // centre of the GDP/GNI* tower
const TOWER_W = 150
const DEF_X = 612 // centre of the digital-balance bar
const DEF_W = 150

// Heights scale off GDP so the mirage tower fills the frame.
const yFor = linScale(0, GDP, BASE_Y, TOP_Y)
const eurFmt = (v: number) => `€${Math.round(v)}bn`

export function IrishMirage() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = cpPalette(mode)

  // Default to THE REAL LEDGER — the verdict (deficit + phantom gap) is visible
  // before any interaction, so reduced-motion / no-JS readers see the truth.
  const [view, setView] = useState<View>("real")
  const isMirage = view === "mirage"

  // t = 1 → mirage (gold tower at full GDP), t = 0 → real ledger (collapsed to
  // GNI*, phantom gap shown in red). Reduced motion snaps straight to the state.
  const t = isMirage ? 1 : 0

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      setView("mirage")
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      setView("real")
    }
  }

  // Tower geometry.
  const gdpY = yFor(GDP)
  const gniY = yFor(GNI)
  const realH = BASE_Y - gniY // the genuine GNI* base
  const phantomH = gniY - gdpY // the profit-shifting cap above it

  // The digital-balance bar: in the mirage it reads as a positive surplus
  // (drawn upward, gold); in the real ledger it inverts into a red deficit
  // (drawn downward below the baseline). We morph between the two by `t`.
  const surplusTopY = yFor(180) // apparent surplus height in the mirage
  const deficitDepth = lerp(BASE_Y, BASE_Y + 96, 1) // fixed real deficit depth
  const defTopY = lerp(BASE_Y, surplusTopY, t) // top edge eases down as we flip
  const defBotY = lerp(deficitDepth, BASE_Y, t) // bottom edge eases up to base

  // Transition style — gated behind reduced motion.
  const ease = reduced ? "none" : "y 620ms cubic-bezier(.4,0,.2,1), height 620ms cubic-bezier(.4,0,.2,1), opacity 500ms ease"

  const verdict = isMirage
    ? {
        word: "THE MIRAGE",
        color: p.wonderHi,
        line: "the headline reads like a surplus — the one number that looked like winning",
      }
    : {
        word: "THE REAL LEDGER",
        color: p.squeeze,
        line: "strip the profit-shifting and the surplus is a phantom; the genuine balance is a deficit",
      }

  const headlineFig = isMirage ? eurFmt(GDP) : `−$${DIGITAL_DEFICIT}bn`

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V35 · The Irish Mirage"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {isMirage ? `GDP ${eurFmt(GDP)}` : `GNI* ${eurFmt(GNI)} · −$${DIGITAL_DEFICIT}bn`}
        </span>
      }
      caption={
        <>
          Europe&rsquo;s one apparent tech surplus is an accounting hallucination. Toggle{" "}
          <span style={{ color: p.wonderHi }}>the mirage</span> &mdash; Ireland&rsquo;s headline GDP of{" "}
          <span style={{ color: p.wonderHi }}>{eurFmt(GDP)}</span> &mdash; to{" "}
          <span style={{ color: p.squeeze }}>the real ledger</span>: GNI* is only{" "}
          <span style={{ color: p.leverage }}>{eurFmt(GNI)}</span>, GDP runs ~{GAP_PCT}% above real income (a
          ~{GAP_POINTS}-point gap), and the genuine EU&ndash;US digital balance is a deficit of{" "}
          <span style={{ color: p.squeeze }}>&minus;${DIGITAL_DEFICIT}bn</span>. The mirage is fragile: the top
          3 firms pay ~{TOP3_TAX}% of corporation tax and output swung &minus;{MNC_SWING}% in Q1 2026. Sources:
          Ireland CSO (GDP vs GNI*, 2024); CASSIS / University of Bonn (&minus;${DIGITAL_DEFICIT}bn digital
          deficit, 2022&ndash;24); Irish Fiscal Council (tax concentration).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={
          isMirage
            ? `Ireland's headline GDP of ${eurFmt(GDP)} drawn as a towering apparent tech-export surplus.`
            : `The real ledger: Ireland's GNI* is only ${eurFmt(GNI)}, leaving a ${eurFmt(
                PHANTOM,
              )} phantom gap of US-multinational profit-shifting; and the genuine EU–US digital trade balance is a deficit of about minus ${DIGITAL_DEFICIT} billion dollars.`
        }
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="im-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.wonderHi} stopOpacity={0.55} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0.14} />
          </linearGradient>
          <linearGradient id="im-real" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0.14} />
          </linearGradient>
          <linearGradient id="im-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.squeeze} stopOpacity={0.42} />
            <stop offset="100%" stopColor={p.squeezeHi} stopOpacity={0.1} />
          </linearGradient>
          <radialGradient id="im-star" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={p.wonderHi} stopOpacity={isMirage ? 0.32 : 0} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* the ledger baseline — zero */}
        <line x1={64} y1={BASE_Y} x2={W - 64} y2={BASE_Y} stroke={p.hair} strokeWidth={1.4} />
        <text x={64} y={BASE_Y + 20} fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.16em" }}>
          LEDGER BASELINE · ZERO
        </text>

        {/* ───────────────── the GDP / GNI* tower ───────────────── */}
        {/* the mirage halo — a surplus "star" glow behind the gold tower */}
        {isMirage && (
          <ellipse cx={TOWER_X} cy={gdpY + 40} rx={150} ry={150} fill="url(#im-star)" />
        )}

        {/* the genuine GNI* base — Ireland's real national income (cyan = value
            Europe actually keeps). Always present. */}
        <rect
          x={TOWER_X - TOWER_W / 2}
          y={gniY}
          width={TOWER_W}
          height={realH}
          fill={isMirage ? "url(#im-gold)" : "url(#im-real)"}
          stroke={isMirage ? p.wonder : p.leverage}
          strokeWidth={1.6}
          style={{ transition: reduced ? "none" : "fill 500ms ease, stroke 500ms ease" }}
        />

        {/* the phantom cap — the €242bn of profit-shifting GDP claims as income.
            In the mirage it's continuous gold (the tower reads whole); in the
            real ledger it is exposed as a hollow red phantom above GNI*. */}
        <rect
          x={TOWER_X - TOWER_W / 2}
          y={gdpY}
          width={TOWER_W}
          height={phantomH}
          fill={isMirage ? "url(#im-gold)" : rgba(p.glowRGB, 0)}
          fillOpacity={isMirage ? 1 : 0}
          stroke={isMirage ? p.wonder : p.squeeze}
          strokeWidth={1.6}
          strokeDasharray={isMirage ? "0" : "5 4"}
          style={{ transition: reduced ? "none" : "stroke 500ms ease, fill-opacity 500ms ease" }}
        />
        {!isMirage && (
          <>
            {/* hatch the phantom so it reads as "removed, not real" */}
            {Array.from({ length: 7 }).map((_, k) => {
              const yy = gdpY + ((k + 1) / 8) * phantomH
              return (
                <line
                  key={`ph-${k}`}
                  x1={TOWER_X - TOWER_W / 2 + 6}
                  y1={yy}
                  x2={TOWER_X + TOWER_W / 2 - 6}
                  y2={yy}
                  stroke={p.squeeze}
                  strokeWidth={0.8}
                  strokeOpacity={0.32}
                />
              )
            })}
            <text
              x={TOWER_X}
              y={gdpY + phantomH / 2 - 6}
              textAnchor="middle"
              fill={p.squeezeHi}
              style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em" }}
            >
              PHANTOM
            </text>
            <text
              x={TOWER_X}
              y={gdpY + phantomH / 2 + 12}
              textAnchor="middle"
              fill={p.muted}
              style={{ fontSize: 11 }}
            >
              {eurFmt(PHANTOM)} profit-shift
            </text>
          </>
        )}

        {/* GNI* reference line — the real income ceiling the mirage floats above */}
        <line
          x1={TOWER_X - TOWER_W / 2 - 12}
          y1={gniY}
          x2={DEF_X + DEF_W / 2 + 12}
          y2={gniY}
          stroke={p.leverage}
          strokeWidth={1}
          strokeDasharray="2 5"
          opacity={isMirage ? 0.4 : 0.9}
        />

        {/* tower labels */}
        <text x={TOWER_X} y={gdpY - 38} textAnchor="middle" fill={isMirage ? p.wonderHi : p.muted} style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em" }}>
          {isMirage ? "HEADLINE GDP" : "GDP (CLAIMED)"}
        </text>
        <text x={TOWER_X} y={gdpY - 14} textAnchor="middle" fill={isMirage ? p.wonderHi : p.soft} style={{ fontSize: 26, fontWeight: 800 }}>
          {eurFmt(GDP)}
        </text>
        <text x={TOWER_X} y={gniY + realH / 2 + 4} textAnchor="middle" fill={isMirage ? p.bg : p.leverageHi} style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em" }}>
          GNI* {eurFmt(GNI)}
        </text>
        <text x={TOWER_X} y={gniY + realH / 2 + 22} textAnchor="middle" fill={isMirage ? rgba(p.inkRGB, 0.5) : p.muted} style={{ fontSize: 10.5 }}>
          real national income
        </text>

        {/* the gap readout, only in the real ledger */}
        {!isMirage && (
          <text x={TOWER_X - TOWER_W / 2 - 22} y={(gdpY + gniY) / 2} textAnchor="end" fill={p.squeeze} style={{ fontSize: 12, fontWeight: 700 }}>
            +{GAP_PCT}% ▲
          </text>
        )}

        {/* ───────────────── the EU–US digital balance bar ───────────────── */}
        <line x1={DEF_X} y1={TOP_Y} x2={DEF_X} y2={BASE_Y + 120} stroke={p.hair} strokeWidth={0.8} strokeDasharray="2 6" />

        <rect
          x={DEF_X - DEF_W / 2}
          y={defTopY}
          width={DEF_W}
          height={Math.max(2, defBotY - defTopY)}
          fill={isMirage ? "url(#im-gold)" : "url(#im-red)"}
          stroke={isMirage ? p.wonder : p.squeeze}
          strokeWidth={1.6}
          style={{ transition: ease }}
        />

        <text x={DEF_X} y={TOP_Y - 6} textAnchor="middle" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.14em" }}>
          EU–US DIGITAL BALANCE
        </text>
        {isMirage ? (
          <>
            <text x={DEF_X} y={surplusTopY - 16} textAnchor="middle" fill={p.wonderHi} style={{ fontSize: 24, fontWeight: 800 }}>
              apparent surplus
            </text>
            <text x={DEF_X} y={surplusTopY + 30} textAnchor="middle" fill={p.wonderHi} style={{ fontSize: 13, fontWeight: 700 }}>
              ▲ looks like winning
            </text>
          </>
        ) : (
          <>
            <text x={DEF_X} y={BASE_Y + 132} textAnchor="middle" fill={p.squeezeHi} style={{ fontSize: 32, fontWeight: 800 }}>
              −${DIGITAL_DEFICIT}bn
            </text>
            <text x={DEF_X} y={BASE_Y + 150} textAnchor="middle" fill={p.muted} style={{ fontSize: 11, letterSpacing: "0.08em" }}>
              genuine EU–US digital deficit · 2022–24
            </text>
            <text x={DEF_X} y={(BASE_Y + defBotY) / 2 + 4} textAnchor="middle" fill={p.squeezeHi} style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}>
              DEFICIT ▼
            </text>
          </>
        )}

        {/* ───────────────── fragility tells (real ledger) ───────────────── */}
        {!isMirage && (
          <g opacity={0.95}>
            <line x1={W - 200} y1={TOP_Y + 6} x2={W - 64} y2={TOP_Y + 6} stroke={p.squeeze} strokeWidth={1} strokeOpacity={0.4} />
            <text x={W - 64} y={TOP_Y - 2} textAnchor="end" fill={p.soft} style={{ fontSize: 10, letterSpacing: "0.16em" }}>
              FRAGILITY
            </text>
            <text x={W - 64} y={TOP_Y + 26} textAnchor="end" fill={p.squeezeHi} style={{ fontSize: 18, fontWeight: 800 }}>
              ~{TOP3_TAX}%
            </text>
            <text x={W - 64} y={TOP_Y + 42} textAnchor="end" fill={p.muted} style={{ fontSize: 10.5 }}>
              of corp tax from top 3 firms
            </text>
            <text x={W - 64} y={TOP_Y + 68} textAnchor="end" fill={p.squeezeHi} style={{ fontSize: 18, fontWeight: 800 }}>
              −{MNC_SWING}%
            </text>
            <text x={W - 64} y={TOP_Y + 84} textAnchor="end" fill={p.muted} style={{ fontSize: 10.5 }}>
              MNC output swing · Q1 2026
            </text>
          </g>
        )}
      </svg>

      {/* verdict + toggle */}
      <div className="mt-2 px-1">
        <p
          className="text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> —{" "}
          {verdict.line}.
        </p>

        {/* the GDP→GNI* meter: how much of the headline is real income vs phantom */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
          <div style={{ width: `${(GNI / GDP) * 100}%`, height: "100%", background: isMirage ? p.wonder : p.leverage, float: "left", transition: reduced ? "none" : "background 400ms ease" }} />
          <div style={{ width: `${(PHANTOM / GDP) * 100}%`, height: "100%", background: p.squeeze, float: "left", opacity: isMirage ? 0.25 : 1, transition: reduced ? "none" : "opacity 400ms ease" }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px]" style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}>
          <span>GNI* {eurFmt(GNI)} (real)</span>
          <span style={{ color: isMirage ? p.soft : p.squeeze }}>{eurFmt(PHANTOM)} phantom</span>
        </div>

        {/* THE MIRAGE ⟷ THE REAL LEDGER toggle */}
        <div
          className="mt-4 inline-flex items-center gap-1 rounded-full p-1"
          style={{ border: `1px solid ${p.hair}` }}
          role="group"
          aria-label="Compare the headline mirage versus the real ledger"
          tabIndex={0}
          onKeyDown={onKey}
        >
          <button
            type="button"
            onClick={() => setView("mirage")}
            aria-pressed={isMirage}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 14px",
              borderRadius: 999,
              cursor: "pointer",
              color: isMirage ? p.bg : p.wonderHi,
              background: isMirage ? p.wonder : "transparent",
              border: "none",
              fontWeight: 700,
            }}
          >
            THE MIRAGE
          </button>
          <button
            type="button"
            onClick={() => setView("real")}
            aria-pressed={!isMirage}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 14px",
              borderRadius: 999,
              cursor: "pointer",
              color: !isMirage ? p.bg : p.squeeze,
              background: !isMirage ? p.squeeze : "transparent",
              border: "none",
              fontWeight: 700,
            }}
          >
            THE REAL LEDGER
          </button>
        </div>

        {/* headline counter — Plex Serif italic verdict, mono figure */}
        <p className="mt-3 text-[13px]" style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}>
          Europe loses on both the bet and the fold — even the one number that looked like winning reads{" "}
          <span style={{ fontFamily: "var(--font-mono), monospace", fontStyle: "normal", fontWeight: 700, color: isMirage ? p.wonderHi : p.squeeze }}>
            {headlineFig}
          </span>
          .
        </p>
      </div>
    </PlateFrame>
  )
}
