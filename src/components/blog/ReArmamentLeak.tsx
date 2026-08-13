"use client"

/**
 * V27 — THE RE-ARMAMENT LEAK  (Chapter 8, "Paying for Dependence, Calling It
 * Autonomy: Defence").
 *
 * Europe's historic defence surge — the ~€800bn ReArm Europe / Readiness 2030
 * plan (2025) plus the NATO 5%-of-GDP-by-2035 pledge — is a single cyan SOURCE.
 * Downstream it splits, mostly OUT: a Sankey of red leaks to non-EU suppliers
 * (the US foremost) against a thin cyan thread that stays in the EU.
 *
 * The anchors (SIPRI Mar 2025/2026 + Draghi):
 *   - The US supplies ~64% of European NATO members' arms imports (2020–24),
 *     up from 52% in 2015–19.
 *   - In the 2022–23 Ukraine surge ~78% of EU defence procurement went to
 *     non-EU suppliers; ~63% of that to the US. Draghi: of €75bn spent,
 *     ~€58bn went non-EU and ~€49bn to the US. Only ~22–36% stayed in the EU.
 *
 * The reader hovers each leak for its figure, and toggles a "buy European"
 * target — the EU goal of ≤45% extra-EU procurement by 2030 (40% joint
 * procurement by 2027) — to watch the red leak narrow toward the cyan.
 *
 * REVEAL: the biggest re-armament since the Cold War is the biggest
 * transatlantic wealth transfer of the decade.
 *
 * Theme-aware (re-renders on the Read-mode flip), reduced-motion safe (the
 * morph collapses to an instant flip when motion is reduced; both end-states
 * are meaningful), keyboard-reachable (focusable leak groups + native toggle),
 * meaningful at default (the surge state, shown leaking). Figures hard-coded.
 * Sources: SIPRI (Mar 2025/2026); Draghi report; EU defence procurement targets.
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  clamp01,
  lerp,
  easeInOut,
} from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

// The headline source figure — the surge envelope the essay names.
const SOURCE_BN = 800

type Branch = {
  key: string
  label: string
  detail: string
  // share of the source as it flows TODAY (the 2022–23 surge mix), summing ~100
  surge: number
  // share under the EU "buy European" 2030 target (≤45% extra-EU)
  target: number
  kind: "leak" | "retained"
}

// Three downstream streams. The two leaks reproduce the surge mix
// (~78% non-EU, ~63% of that to the US → ~49% US) against the ~22% retained.
// Under the target, extra-EU is pulled to ≤45% and EU-retained rises to ~55%.
const BRANCHES: Branch[] = [
  {
    key: "us",
    label: "TO THE UNITED STATES",
    detail:
      "~49% in the surge, Draghi: ~€49bn of €75bn. SIPRI: the US is ~64% of European NATO arms imports (2020–24), up from 52%.",
    surge: 49,
    target: 28,
    kind: "leak",
  },
  {
    key: "other",
    label: "TO OTHER NON-EU",
    detail:
      "~29% in the surge, the rest of ~78% extra-EU procurement (Draghi: ~€58bn of €75bn went non-EU). UK, South Korea, Israel and the like.",
    surge: 29,
    target: 17,
    kind: "leak",
  },
  {
    key: "eu",
    label: "STAYS IN THE EU",
    detail:
      "~22% in the surge, only this thin thread is sovereign spend. The EU target: ≥55% by 2030 (≤45% extra-EU; 40% joint procurement by 2027).",
    surge: 22,
    target: 55,
    kind: "retained",
  },
]

// Geometry --------------------------------------------------------------------
const VW = 920
const VH = 560
const SRC_X = 96 // x of the source trunk's right face
const SRC_W = 46 // visible thickness of the source trunk
const SPLIT_X = 300 // where the trunk fans out
const DST_X = 760 // x where the branch bands terminate
const TOP = 132 // y of the top of the full flow band
const BAND = 300 // full pixel thickness of the source at 100%
const GAP = 8 // vertical gap between stacked branch bands at the destination

const pxFor = (pct: number) => (BAND * pct) / 100

export function ReArmamentLeak() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // Buy-European toggle: false = the surge mix (default, leaking), true = 2030 target.
  const [buyEuro, setBuyEuro] = useState(false)
  // m ∈ [0,1] — morph progress from surge (0) to target (1).
  const [m, setM] = useState(0)
  const [active, setActive] = useState<string>("us")

  useEffect(() => {
    const goal = buyEuro ? 1 : 0
    if (reduced) {
      setM(goal)
      return
    }
    let raf = 0
    const dur = 900
    const start = performance.now()
    const from = m
    const tick = (now: number) => {
      const t = clamp01((now - start) / dur)
      setM(lerp(from, goal, easeInOut(t)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyEuro, reduced])

  // Current share of each branch, interpolated between surge and target.
  const shares = BRANCHES.map((b) => lerp(b.surge, b.target, m))
  const totalLeak = shares[0] + shares[1]
  const retained = shares[2]
  const branch = BRANCHES.find((b) => b.key === active) ?? BRANCHES[0]
  const branchShare = shares[BRANCHES.findIndex((b) => b.key === active)]
  const branchBn = Math.round((branchShare / 100) * SOURCE_BN)

  // Source trunk vertical extent.
  const srcTop = TOP
  const srcBot = TOP + BAND
  const srcMid = TOP + BAND / 2

  // Stack the destination bands top→bottom; leaks (red) above, retained (cyan) below.
  let cursor = TOP
  const layout = BRANCHES.map((b, i) => {
    const h = pxFor(shares[i])
    const y = cursor
    cursor += h + GAP
    return { ...b, h, y, mid: y + h / 2, share: shares[i] }
  })
  // Re-centre the stacked bands so the whole destination column is vertically centred.
  const stackedH = cursor - GAP - TOP
  const shift = (BAND - stackedH) / 2
  const placed = layout.map((l) => ({ ...l, y: l.y + shift, mid: l.mid + shift }))

  const leakColor = (hi: boolean) => (hi ? p.squeezeHi : p.squeeze)

  // Build a smooth Sankey ribbon from the source face to a destination band.
  function ribbon(srcY0: number, srcY1: number, dstY0: number, dstY1: number): string {
    const cx = (SPLIT_X + DST_X) / 2
    return [
      `M ${SPLIT_X} ${srcY0}`,
      `C ${cx} ${srcY0}, ${cx} ${dstY0}, ${DST_X} ${dstY0}`,
      `L ${DST_X} ${dstY1}`,
      `C ${cx} ${dstY1}, ${cx} ${srcY1}, ${SPLIT_X} ${srcY1}`,
      "Z",
    ].join(" ")
  }

  // Apportion the source face among the three branches (same stacking order).
  let srcCursor = TOP
  const srcSlices = shares.map((s) => {
    const h = pxFor(s)
    const y0 = srcCursor
    srcCursor += h
    return { y0, y1: srcCursor }
  })

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V27 · The Re-Armament Leak"
      controls={
        <span
          className="tabular-nums text-[11px] font-semibold"
          style={{
            fontFamily: "var(--font-mono), monospace",
            color: buyEuro ? p.leverageHi : p.squeeze,
          }}
        >
          {Math.round(totalLeak)}% LEAKS OUT · {Math.round((totalLeak / 100) * SOURCE_BN)}bn
        </span>
      }
      caption={
        <>
          Europe&rsquo;s ~&euro;800bn surge, <span style={{ color: p.leverage }}>ReArm Europe / Readiness 2030</span>{" "}
          plus the NATO 5%-of-GDP pledge, splits mostly <span style={{ color: p.squeeze }}>out</span>. In the
          2022&ndash;23 Ukraine surge ~78% of procurement went non-EU, ~63% of that to the{" "}
          <span style={{ color: p.squeezeHi }}>United States</span>; only ~22% <span style={{ color: p.leverageHi }}>stayed in the EU</span>.
          Hover a stream for its figure, then flip <em>buy European</em> to pull the red leak toward the EU&rsquo;s
          2030 target (&le;45% extra-EU). Sources: SIPRI (Mar 2025/2026); Draghi report; EU defence procurement targets.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        role="img"
        aria-label={`Sankey of Europe's ~€800bn defence surge. Today ~${Math.round(
          totalLeak,
        )}% leaks to non-EU suppliers, ~${Math.round(
          shares[0],
        )}% to the United States, and only ~${Math.round(
          retained,
        )}% stays in the EU. The biggest re-armament since the Cold War is the biggest transatlantic wealth transfer of the decade.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="ral-leak" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.leverage} stopOpacity={0.55} />
            <stop offset="38%" stopColor={p.squeeze} stopOpacity={0.7} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0.92} />
          </linearGradient>
          <linearGradient id="ral-leak-hot" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.6} />
            <stop offset="34%" stopColor={p.squeezeHi} stopOpacity={0.88} />
            <stop offset="100%" stopColor={p.squeezeHi} stopOpacity={1} />
          </linearGradient>
          <linearGradient id="ral-keep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.leverage} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.leverageHi} stopOpacity={0.95} />
          </linearGradient>
          <linearGradient id="ral-src" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.95} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0.7} />
          </linearGradient>
        </defs>

        {/* schematic hairlines */}
        <line x1={SRC_X} y1={TOP - 30} x2={DST_X} y2={TOP - 30} stroke={p.blueprint} strokeWidth={1} />
        <line x1={SPLIT_X} y1={TOP - 18} x2={SPLIT_X} y2={srcBot + 18} stroke={p.blueprint} strokeWidth={1} />
        <line x1={DST_X} y1={TOP - 18} x2={DST_X} y2={srcBot + 18} stroke={p.blueprint} strokeWidth={1} />

        {/* THE SOURCE — the cyan surge trunk feeding the split */}
        <rect
          x={SRC_X - SRC_W}
          y={srcTop}
          width={SRC_W}
          height={BAND}
          rx={4}
          fill="url(#ral-src)"
          stroke={p.leverageHi}
          strokeWidth={1.2}
          strokeOpacity={0.7}
        />
        <path
          d={`M ${SRC_X} ${srcTop} L ${SPLIT_X} ${srcTop} L ${SPLIT_X} ${srcBot} L ${SRC_X} ${srcBot} Z`}
          fill={rgba(mode === "dark" ? "108,198,230" : "14,122,165", 0.16)}
        />
        <text
          x={SRC_X - SRC_W / 2}
          y={srcMid}
          textAnchor="middle"
          fill={p.leverageHi}
          transform={`rotate(-90 ${SRC_X - SRC_W / 2} ${srcMid})`}
          style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.14em" }}
        >
          THE SURGE
        </text>
        <text
          x={SRC_X - SRC_W - 14}
          y={srcTop - 12}
          textAnchor="start"
          fill={p.muted}
          style={{ fontSize: 11, letterSpacing: "0.14em" }}
        >
          REARM EUROPE · READINESS 2030 · NATO 5%
        </text>
        <text x={SRC_X - SRC_W - 14} y={srcBot + 26} textAnchor="start" fill={p.leverageHi} style={{ fontSize: 30, fontWeight: 800 }}>
          ~€{SOURCE_BN}bn
        </text>

        {/* THE RIBBONS — source face apportioned to each destination band */}
        {placed.map((l, i) => {
          const s = srcSlices[i]
          const isActive = active === l.key
          const isLeak = l.kind === "leak"
          const fill = isLeak
            ? isActive
              ? "url(#ral-leak-hot)"
              : "url(#ral-leak)"
            : "url(#ral-keep)"
          return (
            <g
              key={`ribbon-${l.key}`}
              role="button"
              tabIndex={0}
              aria-label={`${l.label}: about ${Math.round(l.share)} percent of the surge, roughly €${Math.round(
                (l.share / 100) * SOURCE_BN,
              )} billion`}
              onMouseEnter={() => setActive(l.key)}
              onFocus={() => setActive(l.key)}
              style={{ cursor: "pointer", outline: "none" }}
            >
              <path
                d={ribbon(s.y0, s.y1, l.y, l.y + l.h)}
                fill={fill}
                fillOpacity={isActive ? 1 : isLeak ? 0.8 : 0.9}
                stroke={isActive ? (isLeak ? p.squeezeHi : p.leverageHi) : "none"}
                strokeWidth={isActive ? 1.2 : 0}
              />
              {/* destination cap + label */}
              <rect
                x={DST_X}
                y={l.y}
                width={7}
                height={l.h}
                fill={isLeak ? leakColor(isActive) : p.leverageHi}
              />
              <text
                x={DST_X + 18}
                y={l.mid - 7}
                fill={isLeak ? leakColor(isActive) : p.leverageHi}
                style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em" }}
              >
                {l.label}
              </text>
              <text
                x={DST_X + 18}
                y={l.mid + 16}
                className="tabular-nums"
                fill={isLeak ? leakColor(isActive) : p.leverageHi}
                style={{ fontSize: 22, fontWeight: 800 }}
              >
                {Math.round(l.share)}%
              </text>
              <text
                x={DST_X + 18}
                y={l.mid + 33}
                className="tabular-nums"
                fill={p.muted}
                style={{ fontSize: 11 }}
              >
                ~€{Math.round((l.share / 100) * SOURCE_BN)}bn
              </text>
            </g>
          )
        })}

        {/* the dividing verdict at the split — leak vs keep */}
        <text
          x={SPLIT_X + 10}
          y={TOP - 16}
          fill={p.squeeze}
          style={{ fontSize: 10.5, letterSpacing: "0.18em", fontWeight: 700 }}
        >
          THE LEAK ↓
        </text>
      </svg>

      {/* READOUT — the focused stream's figure */}
      <div
        className="mt-2 rounded-lg p-3.5"
        style={{
          border: `1px solid ${branch.kind === "leak" ? p.squeeze : p.leverage}`,
          background: p.hair,
        }}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: branch.kind === "leak" ? p.squeezeHi : p.leverageHi,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            {branch.label}
          </span>
          <span
            className="tabular-nums"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: branch.kind === "leak" ? p.squeeze : p.leverageHi,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {Math.round(branchShare)}% · ~€{branchBn}bn of €{SOURCE_BN}bn
          </span>
        </div>
        <p className="mt-1.5 text-[13.5px] leading-snug" style={{ color: p.muted, fontFamily: "var(--font-serif), serif" }}>
          {branch.detail}
        </p>
      </div>

      {/* CONTROLS — the buy-European toggle */}
      <div className="mt-3 flex items-center justify-between gap-3 px-1">
        <button
          type="button"
          role="switch"
          aria-checked={buyEuro}
          onClick={() => setBuyEuro((v) => !v)}
          aria-label="Toggle the EU buy-European 2030 target (45 percent extra-EU cap, 40 percent joint procurement by 2027)"
          className="flex items-center gap-2.5"
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 12,
            padding: "6px 12px",
            borderRadius: 8,
            cursor: "pointer",
            color: buyEuro ? p.leverageHi : p.squeezeHi,
            border: `1px solid ${buyEuro ? p.leverage : p.squeeze}`,
            background: "transparent",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 30,
              height: 16,
              borderRadius: 999,
              background: buyEuro ? rgba(mode === "dark" ? "108,198,230" : "14,122,165", 0.4) : p.hair,
              border: `1px solid ${buyEuro ? p.leverage : p.soft}`,
              position: "relative",
              display: "inline-block",
              transition: reduced ? "none" : "background 320ms ease",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 1,
                left: buyEuro ? 15 : 1,
                width: 12,
                height: 12,
                borderRadius: 999,
                background: buyEuro ? p.leverageHi : p.squeeze,
                transition: reduced ? "none" : "left 320ms ease",
              }}
            />
          </span>
          {buyEuro ? "BUY EUROPEAN · 2030 TARGET" : "BUY EUROPEAN · off (surge mix)"}
        </button>
        <span
          className="tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft, fontSize: 11 }}
        >
          EU-retained {Math.round(retained)}% · target ≥55%
        </span>
      </div>

      {/* verdict line */}
      <p
        className="mt-3 px-1 text-[15px]"
        style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
      >
        <span style={{ color: p.squeezeHi, fontStyle: "normal", fontWeight: 700 }}>
          The biggest re-armament since the Cold War
        </span>{" "}
        is the biggest transatlantic wealth transfer of the decade, autonomy paid for in dependence.
      </p>
    </PlateFrame>
  )
}
