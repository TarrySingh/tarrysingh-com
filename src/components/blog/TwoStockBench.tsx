"use client"

/**
 * V19 — THE TWO-STOCK BENCH  (Chapter 5, "Tenant Farms: The Bright Spots,
 * Honestly").
 *
 * Europe's market leadership is dangerously thin. Its growth/tech heft sits in a
 * tiny handful of names — a SHALLOW BENCH (blueprint cyan) — against the US
 * "Mag-7," a DEEP BENCH worth more than $20 trillion combined (reserved red).
 * The instrument is a literal bench: a short European row of player-cards by
 * market cap, set against the seven-deep American one, the totals stated in mono.
 *
 * Then the fragility beat. A toggle "benches" Novo Nordisk — knocking ~67% off
 * its value, its 2024→2026 fall — and the visual shows how much of Europe's
 * top-tier market cap vanishes with a single injury. There is no depth behind
 * the star: a two-player bench against a seven-player one; when one champion
 * falls, the whole index feels it.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (a native switch + Space/Enter), reduced-motion safe (the injury
 * settles to its end-state; only the toggle moves the bars), role="img" with a
 * spoken aria-label, and meaningful at its default (bench healthy) as the static
 * fallback.
 *
 * Figures hard-coded — market caps mid-2026 (companiesmarketcap.com); Mag-7
 * combined > $20tn; Novo Nordisk ~67% peak-to-2026 fall.
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  linScale,
  lerp,
  clamp,
  clamp01,
  easeInOut,
} from "./read-chart-kit"
import { cpPalette } from "./chokepoint-kit"

type Player = {
  name: string
  /** market cap in $bn, mid-2026 */
  cap: number
  /** the injury knocks the cap to this $bn (Novo's 2024→2026 fall) */
  injured?: number
}

// EUROPE — the shallow bench. ASML the lone giant, then a steep drop. Novo is
// the player that takes the injury.
const EUROPE: Player[] = [
  { name: "ASML", cap: 743 },
  { name: "SAP", cap: 340 },
  { name: "Novo Nordisk", cap: 330, injured: 109 },
  { name: "LVMH", cap: 300 },
]

// THE US "MAG-7" — the deep bench, > $20tn combined.
const MAG7: Player[] = [
  { name: "Apple", cap: 3500 },
  { name: "Nvidia", cap: 3400 },
  { name: "Microsoft", cap: 3300 },
  { name: "Alphabet", cap: 2300 },
  { name: "Amazon", cap: 2200 },
  { name: "Meta", cap: 1500 },
  { name: "Tesla", cap: 1100 },
]

const MAG7_TOTAL = MAG7.reduce((s, p) => s + p.cap, 0) // ~21,300 $bn

const fmtTn = (bn: number) => `$${(bn / 1000).toFixed(1)}tn`
const fmtBn = (bn: number) => `$${Math.round(bn)}bn`

// Plot frame (viewBox units). Two rows of player-cards, EU on top, US below.
const W = 940
const H = 890
const PADL = 24
const PADR = 24
const ROW_GAP = 14
const CARD_H = 74

export function TwoStockBench() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = cpPalette(mode)

  const [injured, setInjured] = useState(false)

  // Animate the injury 0→1 (eased), unless reduced motion settles instantly.
  const animRef = useRef(0)
  const [anim, setAnim] = useState(0)
  useEffect(() => {
    const to = injured ? 1 : 0
    if (reduced) {
      animRef.current = to
      setAnim(to)
      return
    }
    let raf = 0
    const start = performance.now()
    const from = animRef.current
    const dur = 720
    const step = (now: number) => {
      const t = clamp01((now - start) / dur)
      const v = lerp(from, to, easeInOut(t))
      animRef.current = v
      setAnim(v)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [injured, reduced])

  const hurt = reduced ? (injured ? 1 : 0) : anim

  // Live European caps (Novo bleeds toward its injured value).
  const euLive = EUROPE.map((pl) =>
    pl.injured != null ? lerp(pl.cap, pl.injured, hurt) : pl.cap,
  )
  const euTotalFull = EUROPE.reduce((s, pl) => s + pl.cap, 0)
  const euTotalLive = euLive.reduce((s, v) => s + v, 0)
  const vanished = euTotalFull - euTotalLive
  const vanishedPct = (vanished / euTotalFull) * 100

  // One shared cap-scale across both benches so the rows are honestly comparable:
  // the widest card (Apple) anchors the right edge of the plotting band.
  const bandL = PADL + 132
  const bandR = W - PADR
  const widthFor = linScale(0, MAG7[0].cap, 0, bandR - bandL)

  // Row layouts.
  const euTop = 70
  const usTop = euTop + EUROPE.length * (CARD_H + ROW_GAP) + 56

  function toggle() {
    setInjured((v) => !v)
  }
  function onKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      toggle()
    }
  }

  const card = (
    pl: Player,
    liveCap: number,
    y: number,
    accent: string,
    accentHi: string,
    isHurt: boolean,
  ) => {
    const w = Math.max(widthFor(liveCap), 6)
    return (
      <g key={pl.name}>
        {/* full-cap ghost outline so the lost value reads as an empty seat */}
        {isHurt && (
          <rect
            x={bandL}
            y={y}
            width={widthFor(pl.cap)}
            height={CARD_H}
            rx={5}
            fill="none"
            stroke={p.squeeze}
            strokeWidth={1}
            strokeDasharray="3 5"
            opacity={0.7}
          />
        )}
        <rect
          x={bandL}
          y={y}
          width={w}
          height={CARD_H}
          rx={5}
          fill={isHurt ? p.squeeze : accent}
          opacity={isHurt ? 0.32 + 0.2 * (1 - hurt) : 0.9}
          stroke={isHurt ? p.squeeze : accent}
          strokeWidth={1.2}
        />
        {/* player name, in the label gutter at left */}
        <text
          x={bandL - 14}
          y={y + CARD_H / 2 - 2}
          textAnchor="end"
          fill={p.ink}
          style={{ fontSize: 14, fontWeight: 700 }}
        >
          {pl.name}
        </text>
        <text
          x={bandL - 14}
          y={y + CARD_H / 2 + 16}
          textAnchor="end"
          fill={isHurt ? p.squeezeHi : accentHi}
          style={{ fontSize: 13, fontWeight: 800 }}
        >
          {fmtBn(liveCap)}
        </text>
        {/* injury tag on the bled card */}
        {isHurt && hurt > 0.04 && (
          <text
            x={bandL + w + 10}
            y={y + CARD_H / 2 + 5}
            textAnchor="start"
            fill={p.squeeze}
            style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em" }}
          >
            −67% · 2024→2026
          </text>
        )}
      </g>
    )
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V19 · The Two-Stock Bench"
      controls={
        <button
          type="button"
          role="switch"
          aria-checked={injured}
          aria-label="Bench Novo Nordisk — knock 67% off its value (its 2024→2026 fall)"
          onClick={toggle}
          onKeyDown={onKey}
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            fontWeight: 700,
            padding: "5px 12px",
            borderRadius: 7,
            cursor: "pointer",
            whiteSpace: "nowrap",
            color: injured ? p.bg : p.squeezeHi,
            border: `1px solid ${p.squeeze}`,
            background: injured ? p.squeeze : "transparent",
            letterSpacing: "0.04em",
          }}
        >
          {injured ? "● NOVO BENCHED" : "○ BENCH NOVO NORDISK"}
        </button>
      }
      caption={
        <>
          Two benches, side by side. <span style={{ color: p.leverage }}>Europe&rsquo;s top tier</span> — a
          handful of names, ASML the lone giant — set against the{" "}
          <span style={{ color: p.squeeze }}>US &ldquo;Mag-7&rdquo;</span>, seven deep and worth more than
          $20 trillion combined. Click <em>Bench Novo Nordisk</em> to knock ~67% off one champion (its
          2024→2026 fall) and watch how much of Europe&rsquo;s top-tier cap vanishes — there is no depth
          behind the star. Sources: market caps mid-2026 (companiesmarketcap.com); Mag-7 &gt; $20tn.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Two benches by market cap. Europe's top tier — ASML $743bn, SAP, Novo Nordisk, LVMH — totals about ${fmtTn(
          euTotalFull,
        )}, against the US Mag-7 at about ${fmtTn(
          MAG7_TOTAL,
        )} across seven names. Benching Novo Nordisk knocks 67% off and erases about ${fmtBn(
          euTotalFull - EUROPE.reduce((s, pl) => s + (pl.injured ?? pl.cap), 0),
        )} of Europe's top-tier cap — a shallow bench with no depth behind the star.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        {/* ---------- EUROPE — the shallow bench (cyan) ---------- */}
        <text x={bandL - 14} y={euTop - 22} textAnchor="end" fill={p.leverage} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em" }}>
          EUROPE&rsquo;S TOP TIER
        </text>
        <text x={bandL + 4} y={euTop - 22} textAnchor="start" fill={p.soft} style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          a four-name bench
        </text>
        {EUROPE.map((pl, i) =>
          card(
            pl,
            euLive[i],
            euTop + i * (CARD_H + ROW_GAP),
            p.leverage,
            p.leverageHi,
            pl.injured != null && hurt > 0,
          ),
        )}
        {/* EU live total */}
        <text x={bandL - 14} y={euTop + EUROPE.length * (CARD_H + ROW_GAP) + 8} textAnchor="end" fill={p.soft} style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          top-tier total
        </text>
        <text x={bandL + 4} y={euTop + EUROPE.length * (CARD_H + ROW_GAP) + 10} textAnchor="start" fill={hurt > 0.02 ? p.squeezeHi : p.leverageHi} style={{ fontSize: 22, fontWeight: 800 }}>
          {fmtTn(euTotalLive)}
        </text>

        {/* divider rail between the benches */}
        <line x1={PADL} y1={usTop - 30} x2={W - PADR} y2={usTop - 30} stroke={p.blueprint} strokeWidth={1} />

        {/* ---------- THE US "MAG-7" — the deep bench (red) ---------- */}
        <text x={bandL - 14} y={usTop - 8} textAnchor="end" fill={p.squeeze} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em" }}>
          THE US &ldquo;MAG-7&rdquo;
        </text>
        <text x={bandL + 4} y={usTop - 8} textAnchor="start" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          a seven-name bench
        </text>
        {MAG7.map((pl, i) =>
          card(pl, pl.cap, usTop + 8 + i * (CARD_H * 0.62 + 6), p.squeeze, p.squeezeHi, false),
        )}

        {/* Mag-7 total, anchored at the right */}
        <text x={W - PADR} y={usTop - 8} textAnchor="end" fill={p.squeezeHi} style={{ fontSize: 26, fontWeight: 800 }}>
          {fmtTn(MAG7_TOTAL)}
        </text>
        <text x={W - PADR} y={usTop + 10} textAnchor="end" fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          combined · seven deep
        </text>
      </svg>

      {/* the fragility readout + verdict */}
      <div className="mt-2 px-1">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: p.soft, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            one injury erases
          </span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 30, fontWeight: 800, color: hurt > 0.02 ? p.squeezeHi : p.muted }}>
            {fmtBn(vanished)}
          </span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 14, fontWeight: 700, color: hurt > 0.02 ? p.squeeze : p.soft }}>
            {vanishedPct.toFixed(0)}% of Europe&rsquo;s top tier
          </span>
        </div>

        <p
          className="mt-2 text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: p.squeeze, fontStyle: "normal", fontWeight: 700 }}>
            A two-player bench against a seven.
          </span>{" "}
          {hurt > 0.5
            ? "Novo falls, and there is no one behind it — the whole top tier feels the loss."
            : "Bench one champion and watch the index buckle; depth is the thing Europe does not have."}
        </p>
      </div>
    </PlateFrame>
  )
}
