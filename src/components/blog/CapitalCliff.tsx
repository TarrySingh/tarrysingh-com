"use client"

/**
 * V11 — THE CAPITAL CLIFF  (Chapter 3, "The Standing Order: How Europe Funds Its
 * Own Defeat").
 *
 * European capital shows up for the birth and disappears for the scale-up. It
 * leads ~78% of early-stage (seed) rounds — but only ~18% of late-stage ones.
 * That means ~82% of European scale-up rounds are led by FOREIGN (largely US)
 * capital, which demands the company move to where its portfolio lives.
 *
 * This instrument is a coverage curve across the funding stages (Seed → A → B →
 * C → Growth). EUROPEAN coverage (cyan, p.leverage) starts high and falls off a
 * cliff; the gap below fills with US red (p.squeeze). A marker — "where the
 * company ends up" — tracks the money: it sits in Europe while European capital
 * leads, and relocates to the US the moment foreign capital takes the round.
 * Scrub the stages (range / buttons / ←→) and watch the cliff and the company
 * cross the ocean. The €5bn Scaleup Europe Fund (EQT-managed, first close autumn
 * 2026) is the belated patch, marked at the late-stage end.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native range + buttons + ←/→), reduced-motion safe (no ambient
 * animation — only the reader's scrub moves anything), and meaningful at its
 * default (the cliff already drawn, the company already in the US) as the
 * static fallback.
 *
 * Figures hard-coded from the spec. Sources: Invest Europe / Dealroom 2025;
 * Letta report; EU Startup & Scaleup Strategy 2025.
 */

import { useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  linScale,
  clamp,
  clamp01,
  lerp,
  smoothPath,
} from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

type Stage = {
  key: string
  label: string
  short: string
  /** share of rounds at this stage LED by European capital (0..1) */
  eu: number
  euLabel: string
  gloss: string
}

// The coverage curve: European leadership share by funding stage. Birth is
// European; the scale-up is sold. (Invest Europe / Dealroom 2025; Letta.)
const STAGES: Stage[] = [
  { key: "seed", label: "Seed", short: "SEED", eu: 0.78, euLabel: "78%", gloss: "Europe leads ~78% of seed rounds — the birth is funded at home." },
  { key: "a", label: "Series A", short: "SER. A", eu: 0.62, euLabel: "62%", gloss: "By Series A the home share is already slipping past the half-way mark." },
  { key: "b", label: "Series B", short: "SER. B", eu: 0.41, euLabel: "41%", gloss: "At Series B foreign capital starts leading the round — the cliff begins." },
  { key: "c", label: "Series C", short: "SER. C", eu: 0.27, euLabel: "27%", gloss: "By Series C most of the cheque, and the board, answer to a US fund." },
  { key: "growth", label: "Growth / late", short: "GROWTH", eu: 0.18, euLabel: "18%", gloss: "At scale-up Europe leads just ~18%; ~82% is foreign-led, and the firm follows the money." },
]

// Plot frame (viewBox units).
const W = 920
const H = 520
const PADL = 64
const PADR = 64
const PADT = 64
const PADB = 138
const PLOT_W = W - PADL - PADR
const PLOT_TOP = PADT
const PLOT_BOT = H - PADB

const xFor = linScale(0, STAGES.length - 1, PADL, W - PADR)
const yFor = linScale(0, 1, PLOT_BOT, PLOT_TOP) // share 0 at bottom, 1 at top

// The company crosses the ocean once European leadership drops below half.
const CROSS = 0.5

export function CapitalCliff() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = cpPalette(mode)

  // Default to the late-stage end: the cliff already fallen, the company in the
  // US — the verdict is visible before any interaction (static fallback).
  const [i, setI] = useState(STAGES.length - 1)
  const d = STAGES[i]

  const inUS = d.eu < CROSS
  const usShare = 1 - d.eu

  // ←/→ scrub; Home/End jump to the ends.
  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      setI((v) => clamp(v + 1, 0, STAGES.length - 1))
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      setI((v) => clamp(v - 1, 0, STAGES.length - 1))
    } else if (e.key === "Home") {
      e.preventDefault()
      setI(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setI(STAGES.length - 1)
    }
  }

  // Curve points — the European coverage line across all stages.
  const pts: Array<[number, number]> = STAGES.map((s, idx) => [xFor(idx), yFor(s.eu)])
  const linePath = smoothPath(pts)
  // Filled cyan region under the European curve (value Europe still holds).
  const euArea = `${linePath} L ${xFor(STAGES.length - 1)} ${PLOT_BOT} L ${xFor(0)} ${PLOT_BOT} Z`
  // Red region above the curve (the foreign-led share, the capture): across the
  // top, down the right edge to the curve, then back along the curve in reverse.
  const reverseCurve = smoothPath([...pts].reverse()).replace(/^M\s*[-\d.]+\s+[-\d.]+\s*/, "")
  const redArea = `M ${xFor(0)} ${PLOT_TOP} L ${xFor(STAGES.length - 1)} ${PLOT_TOP} L ${xFor(
    STAGES.length - 1,
  )} ${yFor(STAGES[STAGES.length - 1].eu)} ${reverseCurve} Z`

  // Live point on the curve.
  const cx = xFor(i)
  const cy = yFor(d.eu)

  // The crossover x — where the curve passes 50% (between Series A and B).
  let crossX = xFor(STAGES.length - 1)
  for (let k = 0; k < STAGES.length - 1; k++) {
    const a = STAGES[k].eu
    const b = STAGES[k + 1].eu
    if ((a - CROSS) * (b - CROSS) <= 0 && a !== b) {
      const t = (a - CROSS) / (a - b)
      crossX = lerp(xFor(k), xFor(k + 1), clamp01(t))
      break
    }
  }

  // The relocation marker: a small "company" that slides along the bottom axis
  // and lands on the US side once foreign capital leads. Position eases between
  // a Europe anchor and a US anchor by how far past the crossover we are.
  const euAnchorX = PADL + PLOT_W * 0.16
  const usAnchorX = W - PADR - PLOT_W * 0.16
  const markerY = PLOT_BOT + 64
  const relo = inUS ? clamp01((CROSS - d.eu) / CROSS) : 0
  const markerX = inUS ? lerp(euAnchorX, usAnchorX, reduced ? 1 : Math.max(0.55, relo)) : euAnchorX

  const verdict = inUS
    ? { word: "CAPTURED", color: p.squeeze, line: "foreign capital leads the round — the company follows the money to the US" }
    : { word: "AT HOME", color: p.leverage, line: "European capital still leads — the company is funded where it was born" }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V11 · The Capital Cliff"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {d.short} · EU {d.euLabel}
        </span>
      }
      caption={
        <>
          European capital funds the birth and sells the adulthood. Scrub the stages — range, buttons or
          ←/→: <span style={{ color: p.leverage }}>European-led</span> coverage starts at ~78% and falls off
          a cliff to ~18%, the gap filling with <span style={{ color: p.squeeze }}>US-led</span> red. Once
          foreign capital leads, the company relocates to where its backers&rsquo; portfolio lives. The €5bn
          Scaleup Europe Fund (EQT-managed, first close autumn 2026) is the belated patch. Sources: Invest
          Europe / Dealroom 2025; Letta report; EU Startup &amp; Scaleup Strategy 2025.
        </>
      }
    >
      {/* stage selector — native tablist, keyboard-reachable */}
      <div
        role="tablist"
        aria-label="Choose a funding stage"
        onKeyDown={onKey}
        className="mb-3 flex flex-wrap gap-1.5 px-1"
      >
        {STAGES.map((s, idx) => {
          const active = idx === i
          const led = s.eu < CROSS // this stage is foreign-led
          const tint = led ? p.squeeze : p.leverage
          return (
            <button
              key={s.key}
              role="tab"
              type="button"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setI(idx)}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                padding: "5px 10px",
                borderRadius: 7,
                cursor: "pointer",
                whiteSpace: "nowrap",
                color: active ? p.bg : p.muted,
                border: `1px solid ${active ? tint : p.hair}`,
                background: active ? tint : "transparent",
                fontWeight: active ? 700 : 400,
              }}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`European-led share of funding rounds by stage. At ${d.label}, Europe leads ${d.euLabel} of rounds; the remaining ${Math.round(
          usShare * 100,
        )} percent is foreign-led. ${inUS ? "The company has relocated to the United States." : "The company is still funded in Europe."}`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="cc-eu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0.12} />
          </linearGradient>
          <linearGradient id="cc-us" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.squeeze} stopOpacity={0.42} />
            <stop offset="100%" stopColor={p.squeezeHi} stopOpacity={0.1} />
          </linearGradient>
        </defs>

        {/* 50% reference line — the foreign-veto threshold */}
        <line
          x1={PADL}
          y1={yFor(CROSS)}
          x2={W - PADR}
          y2={yFor(CROSS)}
          stroke={p.blueprint}
          strokeWidth={1}
          strokeDasharray="2 5"
        />
        <text x={W - PADR} y={yFor(CROSS) - 7} textAnchor="end" fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.14em" }}>
          50% — WHERE THE LEAD CHANGES HANDS
        </text>

        {/* red region (US-led capture) above the curve */}
        <path d={redArea} fill="url(#cc-us)" />
        {/* cyan region (value Europe holds) under the curve */}
        <path d={euArea} fill="url(#cc-eu)" />

        {/* the crossover gutter — vertical hairline where Europe loses the lead */}
        <line x1={crossX} y1={PLOT_TOP} x2={crossX} y2={PLOT_BOT} stroke={rgba(p.glowRGB, 0.22)} strokeWidth={1} />

        {/* European coverage curve */}
        <path d={linePath} fill="none" stroke={p.leverage} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />

        {/* region labels */}
        <text x={PADL + 10} y={PLOT_TOP + 26} fill={p.squeezeHi} style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.12em" }}>
          FOREIGN-LED (US)
        </text>
        <text x={PADL + 10} y={PLOT_BOT - 14} fill={p.leverage} style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.12em" }}>
          EUROPEAN-LED
        </text>

        {/* stage dots + axis ticks */}
        {STAGES.map((s, idx) => {
          const x = xFor(idx)
          const y = yFor(s.eu)
          const active = idx === i
          const led = s.eu < CROSS
          return (
            <g key={s.key}>
              <line x1={x} y1={PLOT_BOT} x2={x} y2={PLOT_BOT + 8} stroke={p.hair} strokeWidth={1} />
              <circle
                cx={x}
                cy={y}
                r={active ? 6.5 : 4}
                fill={active ? (led ? p.squeeze : p.leverage) : p.bg}
                stroke={led ? p.squeeze : p.leverage}
                strokeWidth={2}
              />
              <text
                x={x}
                y={PLOT_BOT + 26}
                textAnchor="middle"
                fill={active ? p.ink : p.soft}
                style={{ fontSize: 11, fontWeight: active ? 700 : 400, letterSpacing: "0.08em" }}
              >
                {s.short}
              </text>
            </g>
          )
        })}

        {/* live readout at the active point */}
        <g>
          <line x1={cx} y1={cy} x2={cx} y2={PLOT_TOP} stroke={p.hair} strokeWidth={1} />
          <text
            x={clamp(cx, PADL + 40, W - PADR - 40)}
            y={cy - 16}
            textAnchor="middle"
            fill={inUS ? p.squeezeHi : p.leverageHi}
            style={{ fontSize: 30, fontWeight: 800 }}
          >
            {d.euLabel}
          </text>
          <text
            x={clamp(cx, PADL + 40, W - PADR - 40)}
            y={cy - 2}
            textAnchor="middle"
            fill={p.muted}
            style={{ fontSize: 10.5, letterSpacing: "0.1em" }}
          >
            EU-LED · {Math.round(usShare * 100)}% FOREIGN
          </text>
        </g>

        {/* WHERE THE COMPANY ENDS UP — relocation marker on its own row */}
        <text x={PADL} y={markerY - 30} fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.16em" }}>
          WHERE THE COMPANY ENDS UP
        </text>
        {/* the ocean track */}
        <line x1={euAnchorX} y1={markerY} x2={usAnchorX} y2={markerY} stroke={p.blueprint} strokeWidth={1} />
        <text x={euAnchorX} y={markerY + 22} textAnchor="middle" fill={inUS ? p.soft : p.leverage} style={{ fontSize: 11, fontWeight: inUS ? 400 : 700, letterSpacing: "0.14em" }}>
          EUROPE
        </text>
        <text x={usAnchorX} y={markerY + 22} textAnchor="middle" fill={inUS ? p.squeeze : p.soft} style={{ fontSize: 11, fontWeight: inUS ? 700 : 400, letterSpacing: "0.14em" }}>
          UNITED STATES
        </text>
        <g style={{ transition: reduced ? "none" : "transform 360ms cubic-bezier(.4,0,.2,1)", transform: `translateX(${markerX - euAnchorX}px)` }}>
          <circle cx={euAnchorX} cy={markerY} r={9} fill={inUS ? p.squeeze : p.leverage} stroke={p.bg} strokeWidth={2} />
          <circle cx={euAnchorX} cy={markerY} r={15} fill="none" stroke={inUS ? rgba("240,112,138", 0.4) : rgba("108,198,230", 0.4)} strokeWidth={1} />
        </g>

        {/* the patch — Scaleup Europe Fund, marked at the late-stage end */}
        <g opacity={0.9}>
          <line x1={xFor(STAGES.length - 1)} y1={yFor(STAGES[STAGES.length - 1].eu)} x2={xFor(STAGES.length - 1)} y2={PLOT_TOP + 44} stroke={p.wonder} strokeWidth={1} strokeDasharray="3 3" />
          <circle cx={xFor(STAGES.length - 1)} cy={PLOT_TOP + 44} r={3.5} fill={p.wonder} />
          <text x={xFor(STAGES.length - 1) - 8} y={PLOT_TOP + 41} textAnchor="end" fill={p.wonderHi} style={{ fontSize: 11, fontWeight: 700 }}>
            €5bn Scaleup Europe Fund
          </text>
          <text x={xFor(STAGES.length - 1) - 8} y={PLOT_TOP + 55} textAnchor="end" fill={p.muted} style={{ fontSize: 10 }}>
            EQT-managed · first close autumn 2026
          </text>
        </g>
      </svg>

      {/* verdict + scrub control */}
      <div className="mt-2 px-1">
        <p
          className="text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> —{" "}
          {verdict.line}.
        </p>

        {/* coverage meter — cyan European share vs red foreign share */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
          <div style={{ width: `${d.eu * 100}%`, height: "100%", background: p.leverage, float: "left" }} />
          <div style={{ width: `${usShare * 100}%`, height: "100%", background: p.squeeze, float: "left" }} />
        </div>

        <label className="mt-3 flex items-center gap-3 text-[11px]" style={{ color: p.soft }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", color: p.leverage, whiteSpace: "nowrap" }}>
            ◂ SEED
          </span>
          <input
            type="range"
            min={0}
            max={STAGES.length - 1}
            step={1}
            value={i}
            onChange={(e) => setI(clamp(Number(e.target.value), 0, STAGES.length - 1))}
            aria-label="Scrub the funding stages from seed to late-stage growth"
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: inUS ? p.squeeze : p.leverage, background: p.hair }}
          />
          <span style={{ fontFamily: "var(--font-mono), monospace", color: p.squeeze, whiteSpace: "nowrap" }}>
            GROWTH ▸
          </span>
        </label>
      </div>
    </PlateFrame>
  )
}
