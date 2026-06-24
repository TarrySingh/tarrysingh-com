"use client"

/**
 * V24 — THE TWO LEDGERS  (Chapter 7, "The Electrons We Priced Out: Energy").
 *
 * One kilowatt-hour failure, two costumes. European industrial power runs ~2.5x
 * the US price and gas ~3–5x; that single cost differential is charged to two
 * separate accounts. Both ledgers debit the same cause.
 *
 * LEDGER 1 — MOLECULES OFF (the old economy switched off): EU chemical capacity
 * down ~37 Mt (~9% of total) 2022–25; ~109,000 jobs gone or at risk; output
 * ~11–15% below pre-crisis; BASF inaugurating an €8.7bn Verbund site in
 * Zhanjiang, China (Mar 2026) while shutting plants in Ludwigshafen.
 *
 * LEDGER 2 — BITS ELSEWHERE (the new economy never built): the AI/data-centre
 * build-out needs cheap power, and Europe's costs 2–3x the US, so the compute is
 * sited elsewhere — recall the ~55–60x EU–US AI-capex gap. The build-out Europe
 * could have hosted is debited as foregone, not lost.
 *
 * Each ledger is a column of red debit rows with a running mono total; the
 * MOLECULES ⟷ BITS toggle flips between them; a serif-italic verdict ties them
 * together. REVEAL: the same kilowatt-hour failure closes the old economy and
 * forecloses the new.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native toggle + focusable rows, ←/→ to flip ledgers), reduced-motion
 * safe (the only motion is a slow mechanical total tally that snaps instantly
 * when reduced-motion is set). Meaningful at its MOLECULES default as the static
 * fallback.
 *
 * Figures hard-coded. Sources: Eurostat / IEA (industrial power ~2.5x US, gas
 * ~3–5x); Cefic (EU chemicals: ~37 Mt / ~9% capacity, ~109k jobs, output ~11–15%
 * below pre-crisis); BASF (€8.7bn Zhanjiang Verbund, inaugurated Mar 2026 amid
 * Ludwigshafen closures); Draghi report (EU–US AI-capex gap ~55–60x).
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  clamp,
  clamp01,
  easeOut,
} from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

type LedgerKey = "molecules" | "bits"

type DebitRow = {
  /** the entry, an industrial fact charged to the kWh */
  entry: string
  /** the mono amount as displayed (units vary: Mt, jobs, %, €bn, ×) */
  amount: string
  /** what the amount means, one short clause */
  gloss: string
  /** weight 0..1 — how much of the column's "bar" this row claims (visual heft) */
  weight: number
}

type Ledger = {
  key: LedgerKey
  costume: string
  title: string
  subtitle: string
  rows: DebitRow[]
  total: string
  totalGloss: string
}

// Both ledgers post to the same account: European power ~2.5x US, gas ~3–5x.
const CAUSE = "Power ~2.5× US · gas ~3–5×"

const LEDGERS: Record<LedgerKey, Ledger> = {
  molecules: {
    key: "molecules",
    costume: "THE OLD ECONOMY, SWITCHED OFF",
    title: "MOLECULES OFF",
    subtitle: "what the kWh closed",
    rows: [
      { entry: "Chemical capacity retired", amount: "−37 Mt", gloss: "~9% of EU total, 2022–25", weight: 1.0 },
      { entry: "Jobs gone or at risk", amount: "−109,000", gloss: "Cefic, across the sector", weight: 0.86 },
      { entry: "Output below pre-crisis", amount: "−11–15%", gloss: "and not recovering", weight: 0.62 },
      { entry: "BASF Verbund — built in China", amount: "€8.7bn", gloss: "Zhanjiang, inaugurated Mar 2026", weight: 0.78 },
      { entry: "Ludwigshafen — plants shut", amount: "−∅", gloss: "the home site wound down", weight: 0.5 },
    ],
    total: "−37 Mt / −109k",
    totalGloss: "the old economy debited at the meter",
  },
  bits: {
    key: "bits",
    costume: "THE NEW ECONOMY, NEVER BUILT",
    title: "BITS ELSEWHERE",
    subtitle: "what the kWh foreclosed",
    rows: [
      { entry: "Data-centre power cost", amount: "2–3× US", gloss: "the build-out's first line item", weight: 1.0 },
      { entry: "EU–US AI-capex gap", amount: "~55–60×", gloss: "the compute sited elsewhere", weight: 0.95 },
      { entry: "Hyperscale build-out hosted", amount: "≈0", gloss: "the campuses go where power is cheap", weight: 0.7 },
      { entry: "Cheap-electron advantage", amount: "−forfeit", gloss: "the input AI runs on", weight: 0.58 },
      { entry: "Compute sovereignty", amount: "−deferred", gloss: "rented, not owned", weight: 0.44 },
    ],
    total: "~55–60×",
    totalGloss: "the new economy foreclosed at the meter",
  },
}

// Plot frame (viewBox units).
const W = 840
const H = 500
const PADL = 56
const PADR = 56
const COL_TOP = 116
const ROW_H = 58
const BAR_W = 150 // the red debit bar that grows left from the amount column

export function TwoLedgers() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = cpPalette(mode)

  // Default to MOLECULES — the old economy already switched off (static fallback).
  const [key, setKey] = useState<LedgerKey>("molecules")
  const L = LEDGERS[key]
  const isMolecules = key === "molecules"

  // Slow mechanical tally — rows post one after another when the ledger flips.
  // Snaps to fully-posted instantly under reduced-motion.
  const [posted, setPosted] = useState(reduced ? L.rows.length : 0)
  useEffect(() => {
    if (reduced) {
      setPosted(L.rows.length)
      return
    }
    setPosted(0)
    let raf = 0
    const start = performance.now()
    const DUR = 1100
    const tick = (now: number) => {
      const t = clamp01((now - start) / DUR)
      setPosted(Math.round(easeOut(t) * L.rows.length))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [key, reduced, L.rows.length])

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      setKey("bits")
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      setKey("molecules")
    }
  }

  const colX = PADL
  const colW = W - PADL - PADR
  const amountX = W - PADR - 12 // right-aligned amount column

  const verdict = isMolecules
    ? { word: "SWITCHED OFF", color: p.squeeze, line: "the same kilowatt-hour that priced out the chemistry closed the plant" }
    : { word: "NEVER BUILT", color: p.squeeze, line: "the same kilowatt-hour that priced out the chemistry forecloses the compute" }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V24 · The Two Ledgers"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.squeeze }}
        >
          {L.title} · {L.total}
        </span>
      }
      caption={
        <>
          One energy failure, two costumes. European industrial{" "}
          <span style={{ color: p.wonderHi }}>power runs ~2.5× the US</span> and gas ~3–5× — and that
          single bill is charged to two accounts. Toggle{" "}
          <span style={{ color: p.squeeze }}>MOLECULES OFF</span> (the old economy switched off) ⟷{" "}
          <span style={{ color: p.squeeze }}>BITS ELSEWHERE</span> (the new economy never built), or
          focus a row to read it. Sources: Eurostat / IEA (power ~2.5× US, gas ~3–5×); Cefic (EU
          chemicals: ~37 Mt / ~9% capacity, ~109k jobs, output ~11–15% below pre-crisis); BASF (€8.7bn
          Zhanjiang Verbund, Mar 2026, amid Ludwigshafen closures); Draghi report (EU–US AI-capex gap
          ~55–60×).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={
          isMolecules
            ? `Ledger one, Molecules Off: the old economy switched off. EU chemical capacity down ~37 megatonnes (~9%), ~109,000 jobs gone or at risk, output ~11–15% below pre-crisis, BASF's €8.7bn Verbund built in Zhanjiang, China while Ludwigshafen plants shut — all charged to European power at ~2.5x the US price.`
            : `Ledger two, Bits Elsewhere: the new economy never built. Data-centre power 2–3x the US, an EU–US AI-capex gap of ~55–60x, the hyperscale build-out sited elsewhere — all charged to the same European power cost.`
        }
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="tl-debit" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor={p.squeeze} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        {/* the shared account this ledger debits — one cause, two columns */}
        <text x={colX} y={36} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em" }}>
          CHARGED TO ONE ACCOUNT
        </text>
        <text x={colX} y={58} fill={p.wonderHi} style={{ fontSize: 15, fontWeight: 700 }}>
          {CAUSE}
        </text>
        <line x1={colX} y1={72} x2={W - PADR} y2={72} stroke={p.blueprint} strokeWidth={1} />

        {/* the ledger heading — costume + which side of the failure */}
        <text x={colX} y={94} fill={p.squeeze} style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.14em" }}>
          {L.title}
        </text>
        <text x={W - PADR} y={94} textAnchor="end" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.1em" }}>
          {L.costume}
        </text>

        {/* the debit rows — each posts as a red bar growing toward the amount */}
        {L.rows.map((r, idx) => {
          const y = COL_TOP + idx * ROW_H
          const cy = y + ROW_H / 2
          const isPosted = idx < posted
          const barLen = isPosted ? BAR_W * r.weight : 0
          return (
            <g
              key={`${key}-${idx}`}
              tabIndex={0}
              role="listitem"
              aria-label={`${r.entry}: ${r.amount}, ${r.gloss}`}
              style={{ outline: "none" }}
            >
              {/* row baseline hairline */}
              <line
                x1={colX}
                y1={y + ROW_H - 6}
                x2={W - PADR}
                y2={y + ROW_H - 6}
                stroke={p.hair}
                strokeWidth={1}
              />
              {/* the debit entry (what was charged) */}
              <text
                x={colX}
                y={cy - 4}
                fill={isPosted ? p.ink : p.soft}
                style={{ fontSize: 14, fontWeight: 600, opacity: isPosted ? 1 : 0.35 }}
              >
                {r.entry}
              </text>
              <text x={colX} y={cy + 14} fill={p.muted} style={{ fontSize: 10.5, letterSpacing: "0.02em", opacity: isPosted ? 1 : 0.3 }}>
                {r.gloss}
              </text>

              {/* the red debit bar — grows left from the amount, weighted by heft */}
              <rect
                x={amountX - 96 - barLen}
                y={cy - 11}
                width={barLen}
                height={22}
                rx={2}
                fill="url(#tl-debit)"
                style={{
                  transition: reduced ? "none" : "width 420ms cubic-bezier(.4,0,.2,1)",
                }}
              />
              {/* the running amount — Plex Mono, the counter */}
              <text
                x={amountX}
                y={cy + 6}
                textAnchor="end"
                fill={isPosted ? p.squeezeHi : p.soft}
                style={{ fontSize: 19, fontWeight: 800, opacity: isPosted ? 1 : 0.3 }}
              >
                {r.amount}
              </text>
              {/* the minus rail — every line is a debit */}
              <text
                x={colX - 14}
                y={cy + 5}
                textAnchor="middle"
                fill={p.squeeze}
                style={{ fontSize: 16, fontWeight: 800, opacity: isPosted ? 0.8 : 0.2 }}
              >
                −
              </text>
            </g>
          )
        })}

        {/* the running total — double rule + the column's sum */}
        {(() => {
          const ty = COL_TOP + L.rows.length * ROW_H + 18
          const allPosted = posted >= L.rows.length
          return (
            <g>
              <line x1={colX} y1={ty - 14} x2={W - PADR} y2={ty - 14} stroke={p.squeeze} strokeWidth={1.4} strokeOpacity={0.5} />
              <line x1={colX} y1={ty - 10} x2={W - PADR} y2={ty - 10} stroke={p.squeeze} strokeWidth={1.4} strokeOpacity={0.5} />
              <text x={colX} y={ty + 12} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.16em" }}>
                LEDGER TOTAL
              </text>
              <text x={colX} y={ty + 30} fill={p.muted} style={{ fontSize: 11, fontStyle: "italic", fontFamily: "var(--font-serif), serif" }}>
                {L.totalGloss}
              </text>
              <text
                x={amountX}
                y={ty + 26}
                textAnchor="end"
                fill={p.squeezeHi}
                style={{ fontSize: 28, fontWeight: 800, opacity: allPosted ? 1 : 0.4 }}
              >
                {L.total}
              </text>
            </g>
          )
        })()}
      </svg>

      {/* verdict + the MOLECULES ⟷ BITS toggle */}
      <div className="mt-2 px-1" role="group" aria-label="Flip between the two ledgers" onKeyDown={onKey}>
        <p
          className="text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> —{" "}
          {verdict.line}.
        </p>

        {/* one-meter reminder: both costumes, the same single bill */}
        <div className="mt-3 flex items-center gap-2 text-[10px]" style={{ color: p.soft }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", letterSpacing: "0.12em" }}>ONE kWh FAILURE</span>
          <span
            className="h-2 flex-1 overflow-hidden rounded-full"
            style={{ background: rgba(p.glowRGB, 0.1) }}
            aria-hidden
          >
            <span style={{ display: "block", width: "100%", height: "100%", background: p.squeeze, opacity: 0.55 }} />
          </span>
          <span style={{ fontFamily: "var(--font-mono), monospace", letterSpacing: "0.12em" }}>TWO LEDGERS</span>
        </div>

        <div
          className="mt-4 inline-flex items-center gap-1 rounded-full p-1"
          style={{ border: `1px solid ${p.hair}` }}
        >
          <button
            type="button"
            onClick={() => setKey("molecules")}
            aria-pressed={isMolecules}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 14px",
              borderRadius: 999,
              cursor: "pointer",
              color: isMolecules ? p.bg : p.squeeze,
              background: isMolecules ? p.squeeze : "transparent",
              border: "none",
              fontWeight: 700,
            }}
          >
            MOLECULES OFF
          </button>
          <span style={{ color: p.soft, fontSize: 13, padding: "0 2px" }} aria-hidden>
            ⟷
          </span>
          <button
            type="button"
            onClick={() => setKey("bits")}
            aria-pressed={!isMolecules}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 14px",
              borderRadius: 999,
              cursor: "pointer",
              color: !isMolecules ? p.bg : p.squeeze,
              background: !isMolecules ? p.squeeze : "transparent",
              border: "none",
              fontWeight: 700,
            }}
          >
            BITS ELSEWHERE
          </button>
        </div>
      </div>
    </PlateFrame>
  )
}
