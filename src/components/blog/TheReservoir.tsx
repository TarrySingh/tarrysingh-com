"use client"

/**
 * V10 — THE RESERVOIR  (Chapter 3, "The Standing Order: How Europe Funds Its
 * Own Defeat").
 *
 * Europe holds ~€33tn in private financial wealth, and roughly €10tn of it sits
 * idle in bank deposits earning almost nothing (~70% of household savings in
 * cash/deposits, vs ~30% in the US). Meanwhile ~€300bn a year spills over the
 * dam to foreign — largely US — capital markets: the savings that could fund
 * Europe, leaking to fund its rivals.
 *
 * The instrument is a dammed reservoir, the full pool sized to €33tn with the
 * idle ~€10tn shaded. The single control is a slider — the share of those idle
 * deposits redirected into European equity/venture. As the reader raises it the
 * over-the-dam outflow toward the small "US markets" basin narrows, and a
 * home-bound channel opens back into Europe, with a mono readout of the capital
 * redirected. The reveal sits in the default: the reservoir is full, and the
 * valve points the wrong way.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native range input), reduced-motion safe (the only motion is the
 * reader's own slider), and meaningful at its default as the static fallback.
 *
 * Figures hard-coded from the spec. Sources: Letta report 2024 (€33tn; ~€300bn/yr
 * out); EU Savings & Investments Union 2025 (~€10tn deposits, ~70% of savings).
 */

import { useRef, useState } from "react"

import { PlateFrame, useReadMode, lerp, clamp01, easeInOut } from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

const W = 920
const H = 520

// Reservoir basin geometry (the big dammed pool on the left).
const POOL_X = 70
const POOL_W = 470
const POOL_TOP = 150
const POOL_BOT = 430
const DAM_X = POOL_X + POOL_W // the dam wall

// Idle-deposit band: ~€10tn of the €33tn pool, shaded as the lower stratum.
const IDLE_FRAC = 10 / 33

// US-markets basin (the small foreign pool, lower-right).
const US_X = 720
const US_W = 150
const US_TOP = 330
const US_BOT = 446

const TOTAL_WEALTH = 33 // €tn
const IDLE_DEPOSITS = 10 // €tn
const OUTFLOW = 300 // €bn / yr (baseline over-the-dam spill)

const fmtBn = (n: number) => `€${Math.round(n)}bn`

export function TheReservoir() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)

  // r = share of the idle €10tn deposits redirected into European equity/venture.
  // Default 0 → today's state: the valve points out, the full €300bn/yr spills.
  const [r, setR] = useState(0)

  const t = clamp01(r)
  const eased = easeInOut(t)

  // Capital redirected home, and what still leaks over the dam.
  const redirectedTn = IDLE_DEPOSITS * t // €tn moved into European markets
  const homeBn = OUTFLOW * t // the share of the annual flow now turned home
  const leakBn = OUTFLOW * (1 - t) // what still spills to the US basin

  // Over-the-dam spill narrows as the valve turns home.
  const spillW = lerp(20, 4, eased)
  const spillOpacity = lerp(0.95, 0.12, eased)
  // Home-bound channel opens as the valve turns home.
  const homeW = lerp(2, 46, eased)
  const homeOpacity = lerp(0.06, 0.95, eased)

  // Idle band drains as deposits are redirected: the shaded stratum recedes.
  const idleBandH = (POOL_BOT - POOL_TOP) * IDLE_FRAC * (1 - eased)
  const idleTop = POOL_BOT - idleBandH

  // US basin level falls as the leak narrows.
  const usFill = lerp(US_BOT, US_TOP + (US_BOT - US_TOP) * 0.45, eased)

  const verdict =
    t < 0.04
      ? { word: "STANDING ORDER", color: p.squeeze, line: "the reservoir is full and the valve points the wrong way" }
      : t < 0.55
        ? { word: "TURNING", color: p.wonderHi, line: "the channel home is opening; the spill is narrowing" }
        : { word: "REDIRECTED", color: p.leverage, line: "Europe's idle savings turned back toward Europe" }

  // Dam-crest geometry: spill pours from the crest toward the US basin.
  const crestY = POOL_TOP + 14
  const spillStartY = crestY

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V10 · The Reservoir"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {verdict.word}
        </span>
      }
      caption={
        <>
          Europe holds <span style={{ color: p.leverage }}>€33tn</span> in private wealth, ~€10tn idle in
          deposits, yet <span style={{ color: p.squeeze }}>~€300bn a year</span> spills over the dam to US
          markets. Drag the valve to redirect the idle deposits into European equity and watch the spill
          turn home. Sources: Letta report 2024 (€33tn; ~€300bn/yr out); EU Savings &amp; Investments Union
          2025 (~€10tn deposits, ~70% of savings).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`A dammed reservoir of €33 trillion in European wealth. With ${Math.round(
          t * 100,
        )}% of idle deposits redirected, ${fmtBn(leakBn)} a year still spills to US markets and ${fmtBn(
          homeBn,
        )} turns home.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="rv-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0.85} />
          </linearGradient>
          <linearGradient id="rv-us" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={0.45} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0.9} />
          </linearGradient>
          <marker id="rv-spill-head" markerUnits="userSpaceOnUse" markerWidth="18" markerHeight="18" refX="13" refY="9" orient="auto">
            <path d="M0,0 L16,9 L0,18 Z" fill={p.squeeze} />
          </marker>
          <marker id="rv-home-head" markerUnits="userSpaceOnUse" markerWidth="18" markerHeight="18" refX="13" refY="9" orient="auto">
            <path d="M0,0 L16,9 L0,18 Z" fill={p.leverage} />
          </marker>
        </defs>

        {/* ground / baseline hairline */}
        <line x1={40} y1={POOL_BOT + 1} x2={W - 40} y2={POOL_BOT + 1} stroke={p.blueprint} strokeWidth={1} />

        {/* ── THE RESERVOIR — €33tn of European wealth, blueprint cyan ─────── */}
        <rect
          x={POOL_X}
          y={POOL_TOP}
          width={POOL_W}
          height={POOL_BOT - POOL_TOP}
          fill="url(#rv-water)"
          stroke={p.leverage}
          strokeWidth={1.4}
        />
        {/* surface line */}
        <line x1={POOL_X} y1={POOL_TOP} x2={DAM_X} y2={POOL_TOP} stroke={p.leverageHi} strokeWidth={2} />

        {/* idle ~€10tn band — the shaded lower stratum that drains as redirected */}
        {idleBandH > 1 && (
          <g>
            <rect
              x={POOL_X}
              y={idleTop}
              width={POOL_W}
              height={idleBandH}
              fill={rgba(mode === "dark" ? "240,112,138" : "192,69,90", 0.22)}
            />
            <line x1={POOL_X} y1={idleTop} x2={DAM_X} y2={idleTop} stroke={p.squeeze} strokeWidth={1} strokeDasharray="5 4" />
            <text
              x={POOL_X + POOL_W / 2}
              y={Math.min(POOL_BOT - 14, idleTop + idleBandH / 2 + 4)}
              textAnchor="middle"
              fill={p.squeezeHi}
              style={{ fontSize: 13, fontWeight: 700 }}
            >
              €{(IDLE_DEPOSITS * (1 - eased)).toFixed(1)}tn idle in deposits
            </text>
          </g>
        )}

        {/* reservoir labels */}
        <text x={POOL_X + 14} y={POOL_TOP - 14} textAnchor="start" fill={p.leverage} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em" }}>
          EUROPE&#39;S RESERVOIR
        </text>
        <text x={POOL_X + 16} y={POOL_TOP + 40} textAnchor="start" fill={p.leverageHi} style={{ fontSize: 38, fontWeight: 800 }}>
          €33tn
        </text>
        <text x={POOL_X + 18} y={POOL_TOP + 60} textAnchor="start" fill={p.muted} style={{ fontSize: 11.5 }}>
          private financial wealth
        </text>

        {/* ── THE DAM WALL ─────────────────────────────────────────────────── */}
        <rect x={DAM_X} y={crestY} width={20} height={POOL_BOT - crestY} fill={p.soft} opacity={0.55} />
        <rect x={DAM_X} y={crestY} width={20} height={POOL_BOT - crestY} fill="none" stroke={p.hair} strokeWidth={1} />

        {/* ── OVER-THE-DAM SPILL — the €300bn/yr leak toward US markets (red) ── */}
        <g style={{ opacity: spillOpacity }}>
          <path
            d={`M ${DAM_X + 20} ${spillStartY}
                C ${DAM_X + 90} ${spillStartY + 30}, ${US_X - 110} ${US_TOP - 70}, ${US_X + US_W / 2} ${US_TOP - 8}`}
            fill="none"
            stroke={p.squeeze}
            strokeWidth={spillW}
            strokeLinecap="round"
            markerEnd="url(#rv-spill-head)"
          />
        </g>

        {/* ── HOME-BOUND CHANNEL — redirected capital turning back in (cyan) ── */}
        <g style={{ opacity: homeOpacity }}>
          <path
            d={`M ${DAM_X + 4} ${POOL_BOT - 40}
                C ${DAM_X + 70} ${POOL_BOT + 30}, ${DAM_X - 60} ${POOL_BOT + 30}, ${POOL_X + POOL_W - 70} ${POOL_BOT - 36}`}
            fill="none"
            stroke={p.leverage}
            strokeWidth={homeW}
            strokeLinecap="round"
            markerEnd="url(#rv-home-head)"
          />
          <text
            x={DAM_X + 4}
            y={POOL_BOT + 52}
            textAnchor="middle"
            fill={p.leverage}
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}
          >
            → EUROPEAN EQUITY / VENTURE
          </text>
        </g>

        {/* ── US-MARKETS BASIN — the small foreign pool that fills on the leak ── */}
        <rect x={US_X} y={US_TOP} width={US_W} height={US_BOT - US_TOP} fill="none" stroke={p.squeeze} strokeWidth={1.2} opacity={0.7} />
        <rect x={US_X} y={usFill} width={US_W} height={US_BOT - usFill} fill="url(#rv-us)" />
        <text x={US_X + US_W / 2} y={US_TOP - 14} textAnchor="middle" fill={p.squeeze} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em" }}>
          US MARKETS
        </text>
        <text x={US_X + US_W / 2} y={US_BOT + 20} textAnchor="middle" fill={p.muted} style={{ fontSize: 11 }}>
          foreign capital basin
        </text>

        {/* spill readout — what still leaks, in mono at the crest */}
        <text x={(DAM_X + US_X) / 2 + 30} y={US_TOP - 100} textAnchor="middle" fill={p.squeezeHi} style={{ fontSize: 28, fontWeight: 800, opacity: spillOpacity < 0.2 ? 0.4 : 1 }}>
          {fmtBn(leakBn)}/yr
        </text>
        <text x={(DAM_X + US_X) / 2 + 30} y={US_TOP - 80} textAnchor="middle" fill={p.soft} style={{ fontSize: 12, letterSpacing: "0.16em" }}>
          STILL SPILLING OUT
        </text>
      </svg>

      {/* ── Readout + valve control ──────────────────────────────────────── */}
      <div className="mt-2 px-1">
        <p
          className="text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> —{" "}
          {verdict.line}.
        </p>

        {/* twin mono counters: redirected home vs still leaking */}
        <div className="mt-3 flex flex-wrap items-baseline gap-x-8 gap-y-1" style={{ fontFamily: "var(--font-mono), monospace" }}>
          <span className="tabular-nums" style={{ color: p.leverage, fontSize: 13 }}>
            REDIRECTED&nbsp;
            <span style={{ fontWeight: 800, fontSize: 16 }}>€{redirectedTn.toFixed(1)}tn</span>
            <span style={{ color: p.soft }}>&nbsp;→ {fmtBn(homeBn)}/yr home</span>
          </span>
          <span className="tabular-nums" style={{ color: p.squeeze, fontSize: 13 }}>
            LEAKING&nbsp;
            <span style={{ fontWeight: 800, fontSize: 16 }}>{fmtBn(leakBn)}/yr</span>
          </span>
        </div>

        {/* split meter — home (cyan) vs leak (red) */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
          <div style={{ width: `${t * 100}%`, height: "100%", background: p.leverage, float: "left" }} />
          <div style={{ width: `${(1 - t) * 100}%`, height: "100%", background: p.squeeze, float: "left" }} />
        </div>

        <label className="mt-3 flex items-center gap-3 text-[11px]" style={{ color: p.soft }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", color: p.squeeze, whiteSpace: "nowrap" }}>
            ◂ VALVE OUT
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(t * 100)}
            onChange={(e) => setR(clamp01(Number(e.target.value) / 100))}
            aria-label="Share of the idle €10tn deposits redirected into European equity and venture"
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: p.leverage, background: p.hair }}
          />
          <span style={{ fontFamily: "var(--font-mono), monospace", color: p.leverage, whiteSpace: "nowrap" }}>
            REDIRECT HOME ▸
          </span>
        </label>
        <p className="mt-1 text-[10.5px]" style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}>
          {Math.round(t * 100)}% of the idle €10tn deposits redirected into European markets
        </p>
      </div>
    </PlateFrame>
  )
}
