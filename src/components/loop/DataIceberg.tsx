"use client"

/**
 * V9 · THE DATA ICEBERG - the Ch7 centerpiece of THE ENGINE ROOM (Plate V).
 *
 * The seen and the unseen. A small ice TIP above the waterline is the frontier
 * training set (FineWeb: 15T tokens, 44 TB on disk, distilled from 96 Common
 * Crawl snapshots). The vast GOLD MASS below is the world's stored data, of
 * which the retained enterprise share dominates. Descend past the waterline and
 * a ratio counter climbs, order-of-magnitude by order-of-magnitude, to the
 * illustrative 1 : 1,000,000,000.
 *
 * Numbers are ledger figures (SOURCE-LEDGER.md, Ch7). Reconciliation with the
 * handover spec, carried in the method lane:
 *  - 44 TB / 15T tokens / 96 snapshots: FineWeb, CONFIRMED.
 *  - raw crawl reprocessed: the handover's flat "40 PB" is KILLED. Shown here
 *    as the ledger's derived upper-bound band, ~36 to 38 PiB, arithmetic
 *    exposed (96 crawls x ~386 to 410 TiB uncompressed).
 *  - 175 ZB global datasphere by 2025: IDC, CONFIRMED. The handover's 33-ZB
 *    2018 baseline is KILLED and dropped.
 *  - enterprise installed bytes over 80% of worldwide installed bytes in 2025
 *    (12.6 ZB): IDC, CONFIRMED verbatim; the handover's 10 to 20 ZB stored
 *    enterprise band is ledger-supported and shown as a band.
 *  - ratio + >99.9999% unseen: author arithmetic (44 TB / 175 ZB = 1 : 3.98
 *    billion). "Roughly one-billionth" is directionally sound; the exponent
 *    moves with the denominator, so the counter is labelled ILLUSTRATIVE and
 *    the arithmetic is shown.
 *
 * The closing reframe is the honest point: the gap is a distribution no public
 * model can reach, not a volume you can scrape (FineWeb's own ablations show
 * curation beats raw byte count).
 *
 * Motion: a seeded scene driven by an in-frame DESCEND slider (no page
 * scroll-jack). Reduced motion / no interaction renders the finished frame.
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useEffect, useRef, useState } from "react"
import { InstrumentFrame, mulberry32, rgba, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// Ledger figures (Ch7). Do not edit without the ledger.
// ---------------------------------------------------------------------------

// FineWeb, CONFIRMED.
const TIP = {
  tokens: "15T tokens",
  disk: "44 TB on disk",
  crawls: "96 Common Crawl snapshots",
}

// Derived upper-bound band, arithmetic exposed. Ledger: ~36 to 38 PiB.
const CRAWL = "~36 to 38 PiB raw reprocessed"
const CRAWL_ARITH = "96 crawls x ~386 to 410 TiB"

// IDC, CONFIRMED. Datasphere 175 ZB by 2025; enterprise installed bytes 12.6 ZB
// (over 80% of worldwide installed bytes); stored-enterprise band 10 to 20 ZB.
const MASS = {
  datasphere: "175 ZB global datasphere by 2025",
  enterprise: "12.6 ZB enterprise installed bytes",
  share: "over 80% of all installed bytes",
  band: "10 to 20 ZB stored enterprise data",
}

// Author arithmetic, ILLUSTRATIVE. 44 TB / 175 ZB = 1 : 3.98e9 (1 ZB = 1e9 TB).
// The counter steps through DECADES to its last checkpoint, 1,000,000,000.
const RATIO_ARITH = "44 TB / 175 ZB = 1 : 3.98 billion"
const UNSEEN = "> 99.9999% never seen by any public model"

// Order-of-magnitude checkpoints the counter steps through as you descend.
const DECADES = [1, 10, 100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000, 1_000_000_000] as const
const NUM_FMT = new Intl.NumberFormat("en-GB")

// ---------------------------------------------------------------------------
// A seeded scatter of "found signal" motes inside the tip: deterministic, so
// SSR render === CSR render. These are decorative-with-meaning (the sliver of
// public text a model actually saw), never a measurement.
// ---------------------------------------------------------------------------

interface Mote {
  x: number
  y: number
  r: number
}

function buildMotes(count: number, seed: number): Mote[] {
  const rnd = mulberry32(seed)
  const out: Mote[] = []
  for (let i = 0; i < count; i++) {
    out.push({
      x: rnd(),
      y: rnd(),
      r: 0.7 + rnd() * 1.1,
    })
  }
  return out
}

const MOTES = buildMotes(14, 0xda7a1ce)

// ---------------------------------------------------------------------------

function IcebergScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p, reduced } = ctx

  // descent: 0 = waterline at the tip's foot (only the tip is read), 1 = fully
  // descended (the mass dominates, ratio settled). The one live control.
  const [descent, setDescent] = useState(reduced ? 1 : 0)

  // rAF ease toward the target the control sets, so drags feel like a dive.
  const [eased, setEased] = useState(reduced ? 1 : 0)
  const targetRef = useRef(descent)
  targetRef.current = descent

  useEffect(() => {
    if (reduced) {
      setEased(1)
      return
    }
    let raf = 0
    const step = () => {
      setEased((v) => {
        const d = targetRef.current - v
        if (Math.abs(d) < 0.0015) return targetRef.current
        return v + d * 0.16
      })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  const d = reduced ? 1 : eased

  // Geometry ---------------------------------------------------------------
  const W = compact ? 460 : 980
  const H = compact ? 720 : 560

  // The scene column: a fixed viewport; the berg group translates UP as we
  // descend so the camera reads as diving. The waterline stays put.
  const col = compact
    ? { cx: 168, top: 44, bottom: 690, halfTip: 78, halfMass: 150 }
    : { cx: 300, top: 40, bottom: 520, halfTip: 96, halfMass: 200 }

  const waterY = compact ? 214 : 190
  // Total vertical travel of the berg group across the full descent.
  const travel = compact ? 300 : 250
  const shift = d * travel

  // Tip: apex above the waterline, foot at the waterline (before shift).
  const tipApexY = waterY - (compact ? 132 : 138)
  // Mass: a long tapering keel far below.
  const massTopY = waterY
  const massBottomY = waterY + (compact ? 430 : 420)

  const fs = compact ? 17 : 13.5
  const mono = "var(--font-mono), monospace"

  // Ratio counter: steps through decades as descent crosses evenly spaced gates
  // in the back half of the dive (0.30 .. 1.00), so the low digits are legible.
  const ratioStart = 0.3
  const ratioSpan = 1 - ratioStart
  const ratioProg = Math.max(0, Math.min(1, (d - ratioStart) / ratioSpan))
  const decadeIdx = Math.min(DECADES.length - 1, Math.floor(ratioProg * DECADES.length))
  const ratioVal = DECADES[decadeIdx]
  const ratioSettled = d > 0.985

  // Callout reveal gates.
  const tipRead = d < 0.34 ? 1 : Math.max(0.5, 1 - (d - 0.34) * 0.9)
  const massRead = Math.max(0, Math.min(1, (d - 0.28) * 2.4))

  // Verdict changes with descent.
  const verdict =
    d < 0.06
      ? "at the surface · you see the tip · 44 TB of curated public text"
      : d < 0.34
        ? "descending · the waterline was never the boundary of the data"
        : ratioSettled
          ? "1 : 1,000,000,000 · the tip is a rounding error against the mass"
          : `descending · ${NUM_FMT.format(ratioVal)}x more below the line and climbing`
  const verdictColor = ratioSettled ? p.signal : d < 0.06 ? p.ink : p.verdict

  // Tip and mass polygon geometry -----------------------------------------
  const tip = (() => {
    const apex = tipApexY - shift
    const foot = waterY - shift
    const l = col.cx - col.halfTip
    const r = col.cx + col.halfTip
    // a chunky, faceted berg tip
    return {
      poly: `${col.cx},${apex} ${r},${foot} ${col.cx + col.halfTip * 0.36},${foot - (compact ? 18 : 16)} ${col.cx - col.halfTip * 0.22},${foot} ${l},${foot}`,
      apex,
      foot,
      l,
      r,
    }
  })()

  const mass = (() => {
    const top = massTopY - shift
    const bottom = massBottomY - shift
    const l = col.cx - col.halfMass
    const r = col.cx + col.halfMass
    const midY = top + (bottom - top) * 0.52
    // wide shoulders at the line, tapering to a keel point
    return {
      poly: `${l},${top} ${r},${top} ${r - col.halfMass * 0.18},${midY} ${col.cx + col.halfMass * 0.32},${bottom} ${col.cx - col.halfMass * 0.28},${bottom} ${l + col.halfMass * 0.2},${midY}`,
      top,
      bottom,
      midY,
      l,
      r,
    }
  })()

  // clip the mass so nothing draws above the (fixed) waterline
  const clipId = compact ? "iceberg-clip-c" : "iceberg-clip-d"

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>The data iceberg: the training set is the tip</title>
        <desc>
          A small ice tip above a waterline is the frontier training set: 44 terabytes
          of curated text, 15 trillion tokens, distilled from 96 Common Crawl snapshots.
          The vast gold mass below the line is the world&rsquo;s stored data, of which the
          retained enterprise share dominates: a 175 zettabyte global datasphere, over 80% of installed bytes held by enterprises. By raw volume the training text
          to stored data ratio is roughly one to one billion, and more than 99.9999% of that data was never seen by any public model.
        </desc>

        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={waterY} width={W} height={H - waterY} />
          </clipPath>
        </defs>

        {/* deep field below the line: quiet, so the gold reads */}
        <rect
          x={0}
          y={waterY}
          width={col.cx * 2 + (compact ? 0 : 0)}
          height={H - waterY}
          fill={rgba(p.inkRGB, 0.03)}
        />

        {/* ===== the mass, below the line (gold = the unseen value) ===== */}
        <g clipPath={`url(#${clipId})`}>
          {/* soft depth bands so the keel reads as going DOWN a long way */}
          {[0.16, 0.4, 0.68].map((t, i) => {
            const y = mass.top + (mass.bottom - mass.top) * t
            return (
              <line
                key={i}
                x1={mass.l - 20}
                y1={y}
                x2={mass.r + 20}
                y2={y}
                stroke={rgba(p.inkRGB, 0.05)}
                strokeWidth={1}
              />
            )
          })}
          <polygon
            points={mass.poly}
            fill={rgba("230,180,90", 0.16)}
            stroke={p.verdict}
            strokeWidth={1.6}
            opacity={0.35 + 0.65 * massRead}
          />
          {/* inner facet, a warmer core of the mass */}
          <polygon
            points={`${col.cx - col.halfMass * 0.5},${mass.top + 6} ${col.cx + col.halfMass * 0.5},${mass.top + 6} ${col.cx + col.halfMass * 0.18},${mass.midY} ${col.cx - col.halfMass * 0.22},${mass.midY}`}
            fill={rgba("230,180,90", 0.12)}
            opacity={massRead}
          />
          {/* keel label, rides with the mass */}
          <text
            x={col.cx}
            y={mass.midY + (compact ? 30 : 26)}
            textAnchor="middle"
            fill={p.verdictHi}
            style={{ fontSize: fs + 1, fontWeight: 700, letterSpacing: "0.14em", fontFamily: mono, opacity: massRead }}
          >
            NEVER SEEN
          </text>
          <text
            x={col.cx}
            y={mass.midY + (compact ? 52 : 46)}
            textAnchor="middle"
            fill={p.verdict}
            style={{ fontSize: fs - 2, fontFamily: mono, opacity: massRead }}
          >
            your proprietary corpus
          </text>
          <text
            x={col.cx}
            y={mass.midY + (compact ? 70 : 63)}
            textAnchor="middle"
            fill={p.soft}
            style={{ fontSize: fs - 3, fontFamily: mono, opacity: massRead }}
          >
            structurally out of distribution
          </text>
        </g>

        {/* ===== the waterline: content, not decoration ===== */}
        <line x1={0} y1={waterY} x2={col.cx * 2} y2={waterY} stroke={p.signal} strokeWidth={1.6} />
        <text
          x={compact ? 8 : 10}
          y={waterY - 7}
          fill={p.signal}
          style={{ fontSize: fs - 3, letterSpacing: "0.22em", fontFamily: mono }}
        >
          WATERLINE
        </text>
        <text
          x={compact ? 8 : col.cx * 2 - 6}
          y={compact ? waterY - 26 : waterY - 7}
          textAnchor={compact ? "start" : "end"}
          fill={p.soft}
          style={{ fontSize: fs - 3.5, fontFamily: mono }}
        >
          everything public models saw ends here
        </text>

        {/* ===== the tip, above the line (cold ice = the seen) ===== */}
        <polygon
          points={tip.poly}
          fill={rgba(p.inkRGB, 0.09)}
          stroke={p.cool}
          strokeWidth={1.6}
        />
        {/* facet line */}
        <line
          x1={col.cx}
          y1={tip.apex}
          x2={col.cx - col.halfTip * 0.22}
          y2={tip.foot}
          stroke={rgba(p.inkRGB, 0.14)}
          strokeWidth={1}
        />
        {/* the found signal: the sliver of public text a model actually saw */}
        {MOTES.map((m, i) => {
          const mx = tip.l + (tip.r - tip.l) * m.x
          const span = tip.foot - tip.apex
          const my = tip.apex + span * (0.35 + m.y * 0.6)
          return <circle key={i} cx={mx} cy={my} r={m.r} fill={p.signalHi} opacity={0.7} />
        })}
        <text
          x={col.cx}
          y={tip.apex - 16}
          textAnchor="middle"
          fill={p.cool}
          style={{ fontSize: fs - 2, fontWeight: 700, letterSpacing: "0.14em", fontFamily: mono, opacity: tipRead }}
        >
          TRAINED ON
        </text>

        {/* ===== tip callout (real DOM text overlaid, gated by tipRead) ===== */}
        <g opacity={tipRead}>
          <text
            x={compact ? 8 : col.cx * 2 - 12}
            y={compact ? tip.apex + 4 : tipApexY - shift + 4}
            textAnchor={compact ? "start" : "end"}
            fill={p.ink}
            style={{ fontSize: fs - 1, fontWeight: 700, fontFamily: mono }}
          >
            {TIP.disk} · {TIP.tokens}
          </text>
          <text
            x={compact ? 8 : col.cx * 2 - 12}
            y={compact ? tip.apex + 22 : tipApexY - shift + 22}
            textAnchor={compact ? "start" : "end"}
            fill={p.soft}
            style={{ fontSize: fs - 3, fontFamily: mono }}
          >
            {TIP.crawls}
          </text>
          <text
            x={compact ? 8 : col.cx * 2 - 12}
            y={compact ? tip.apex + 39 : tipApexY - shift + 39}
            textAnchor={compact ? "start" : "end"}
            fill={p.soft}
            style={{ fontSize: fs - 3.5, fontFamily: mono }}
          >
            {CRAWL} · est · {CRAWL_ARITH}
          </text>
        </g>

        {/* ===== the RIGHT ledger panel (desktop) / lower panel (compact) ===== */}
        {(() => {
          const px = compact ? 14 : 640
          const py = compact ? waterY + 320 : 92
          const lh = compact ? 30 : 26
          const yAt = (i: number) => py + i * lh
          return (
            <g>
              <text x={px} y={yAt(0)} fill={p.soft} style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: mono }}>
                THE MASS BELOW THE LINE
              </text>

              {/* datasphere */}
              <text x={px} y={yAt(1.4)} fill={p.verdictHi} style={{ fontSize: fs + 1, fontWeight: 700, fontFamily: mono, opacity: massRead }}>
                {MASS.datasphere}
              </text>
              <text x={px} y={yAt(2.3)} fill={p.muted} style={{ fontSize: fs - 3, fontFamily: mono, opacity: massRead }}>
                {MASS.enterprise} · {MASS.share}
              </text>
              <text x={px} y={yAt(3.1)} fill={p.muted} style={{ fontSize: fs - 3, fontFamily: mono, opacity: massRead }}>
                {MASS.band}
              </text>

              {/* ratio block */}
              <text x={px} y={yAt(4.6)} fill={p.soft} style={{ fontSize: fs - 3, letterSpacing: "0.14em", fontFamily: mono }}>
                TRAINING TEXT : STORED DATA
              </text>
              <text
                x={px}
                y={yAt(6.3)}
                fill={ratioSettled ? p.signalHi : p.verdict}
                style={{ fontSize: compact ? 34 : 32, fontWeight: 800, fontFamily: mono }}
              >
                1 : {NUM_FMT.format(ratioVal)}
              </text>
              <text x={px} y={yAt(7.3)} fill={p.soft} style={{ fontSize: fs - 3.5, fontFamily: mono }}>
                illustrative · {RATIO_ARITH}
              </text>
              <text x={px} y={yAt(8.0)} fill={ratioSettled ? p.signal : p.soft} style={{ fontSize: fs - 3, fontFamily: mono, opacity: ratioSettled ? 1 : massRead }}>
                {UNSEEN}
              </text>
            </g>
          )
        })()}
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{ fontFamily: mono, color: verdictColor }}
      >
        {"VERDICT · "}
        {verdict}
      </div>

      {/* closing reframe: the honest distribution-not-volume point */}
      <div
        className="mt-2 px-1 text-[13px] italic leading-relaxed"
        style={{ fontFamily: "var(--font-serif), serif", color: ratioSettled ? p.ink : p.muted }}
      >
        The gap isn&rsquo;t volume you can scrape. It&rsquo;s a distribution no public model can reach.
      </div>

      {/* controls lane: the DESCEND slider + decade checkpoints */}
      <div className="mt-3 px-1">
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ fontFamily: mono, color: p.signal }}
          >
            DESCEND
          </span>
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(descent * 1000)}
            aria-label="Descend past the waterline"
            onChange={(e) => setDescent(Number(e.target.value) / 1000)}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full"
            style={{
              accentColor: p.signal,
              background: `linear-gradient(90deg, ${rgba(p.signalRGB, 0.5)} ${descent * 100}%, ${p.hair} ${descent * 100}%)`,
            }}
          />
          <span
            className="w-16 text-right text-[11px] tabular-nums"
            style={{ fontFamily: mono, color: p.muted }}
          >
            {Math.round(descent * 100)}% down
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {[
            { label: "SURFACE", to: 0 },
            { label: "WATERLINE", to: 0.32 },
            { label: "THE MASS", to: 0.62 },
            { label: "1 : 1B", to: 1 },
          ].map((c) => {
            const active =
              (c.to === 0 && descent < 0.06) ||
              (c.to === 1 && descent > 0.985) ||
              (c.to !== 0 && c.to !== 1 && Math.abs(descent - c.to) < 0.14)
            return (
              <button
                key={c.label}
                type="button"
                aria-pressed={active}
                onClick={() => setDescent(c.to)}
                className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
                style={{
                  fontFamily: mono,
                  color: active ? p.signalHi : p.muted,
                  border: `1px solid ${active ? p.signal : p.hair}`,
                  background: active ? rgba(p.signalRGB, 0.1) : "transparent",
                }}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function DataIceberg() {
  return (
    <InstrumentFrame
      kicker="V9 · THE DATA ICEBERG"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          Everything a frontier model saw is the tip: 44 TB of curated text above the
          line. The mass below is the world&rsquo;s stored data, where the retained
          enterprise share dominates, and by raw volume it dwarfs the training set
          roughly a billion to one. Descend, and the ratio climbs a decade at a time.
        </>
      }
      method={
        <>
          MEASURED tip · FineWeb: 15T tokens, 44 TB on disk, 96 Common Crawl snapshots
          (Penedo et al., arXiv 2406.17557, 2024); Llama 3 corroborates the 15T-token
          scale (Meta, 2024). ESTIMATE · raw reprocessed ~36 to 38 PiB is derived (96
          crawls x ~386 to 410 TiB uncompressed); the handover&rsquo;s flat 40 PB is not
          a quoted figure and is dropped. MEASURED mass · 175 ZB global datasphere by
          2025 and enterprise installed bytes over 80% (12.6 ZB) are IDC verbatim
          (Reinsel et al., 2018, refreshed 2020); the handover&rsquo;s 33-ZB 2018 baseline
          is dropped. ILLUSTRATIVE ratio · 44 TB / 175 ZB = 1 : 3.98 billion by raw
          volume (author arithmetic, 1 ZB = 1e9 TB); the exponent moves with the
          denominator, so the counter is shown as illustrative, rounded to one billion.
          The close is the ledger&rsquo;s honest point: coverage and distribution bind a
          model, not byte count (FineWeb ablations).
        </>
      }
    >
      {(ctx) => <IcebergScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
