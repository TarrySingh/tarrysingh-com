"use client"

/**
 * V10 · THE VAULT BORE - the honest version of the iceberg (THE ENGINE ROOM).
 *
 * A vertical drill core through one enterprise's data vault. From surface to
 * depth the strata carry very different VALUE, ENTROPY and MODEL-READINESS,
 * and almost none of it ever entered a public model's training distribution.
 * Click a stratum to focus its readout; flip "WHAT PUBLIC MODELS SAW" to drop
 * every stratum to near zero, which is the out-of-distribution point.
 *
 * NUMBERS DISCIPLINE. Two registers, kept apart in the UI and the method lane:
 *  - MEASURED framing (Source Ledger, Ch7): enterprises hold over 80% of the
 *    worldwide installed bytes in 2025 (IDC: 12.6 ZB); the global datasphere is
 *    forecast at 175 ZB by 2025; a frontier run trains on ~44 TB / ~15T tokens
 *    (FineWeb); the training-text : stored-enterprise ratio is ~1:4 billion by
 *    raw volume against 175 ZB, ~1:341-455 million against 10-20 ZB stored, so
 *    >99.9999% of the corpus is unseen; the binding constraint is distribution,
 *    not raw byte volume. The handover freezes the ratio headline as 1:10^9;
 *    where it diverges from the ledger the LEDGER wins and the method lane says
 *    the recomputed band (1:4 billion by volume). These are the only measured
 *    figures on screen and they sit in the framing rail, not in the bars.
 *  - SCHEMATIC model: the per-stratum VOLUME / VALUE / READINESS bars are an
 *    illustrative model of a GENERIC enterprise vault, not a measured company.
 *    The method lane opens with SCHEMATIC and names what is modelled.
 *
 * Deterministic: mulberry32 fixed seed for the fine hatching only; no wall
 * clock. Reduced motion renders the complete final state.
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useEffect, useRef, useState } from "react"
import { InstrumentFrame, mulberry32, rgba, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// SCHEMATIC strata (a model of a generic enterprise vault, NOT measured).
// volume/value/readiness are on a 0..100 illustrative scale. publicSaw is the
// share a public web crawl plausibly ingested: near zero for private strata.
// ---------------------------------------------------------------------------

interface Stratum {
  key: string
  name: string
  sub: string
  volume: number // relative bulk of the vault (schematic)
  value: number // marginal training value if it were in distribution (schematic)
  readiness: number // model-readiness: labelled, deduped, permissioned (schematic)
  publicSaw: number // % a public crawl plausibly ingested (schematic)
  verdict: string
}

const STRATA: Stratum[] = [
  {
    key: "logs",
    name: "LOGS & TELEMETRY",
    sub: "app logs · IoT · clickstream",
    volume: 94,
    value: 9,
    readiness: 22,
    publicSaw: 0,
    verdict: "biggest band, thinnest seam · high volume, low entropy, near zero training value",
  },
  {
    key: "docs",
    name: "DOCUMENTS & EMAIL",
    sub: "wikis · mail · shared drives",
    volume: 62,
    value: 34,
    readiness: 31,
    publicSaw: 2,
    verdict: "some overlaps public text in shape · the content is private and unlabelled",
  },
  {
    key: "tickets",
    name: "TICKETS & CRM",
    sub: "support · sales · accounts",
    volume: 41,
    value: 58,
    readiness: 46,
    publicSaw: 0,
    verdict: "structured, teachable, out of distribution · a real fine-tuning seam",
  },
  {
    key: "erp",
    name: "ERP TRANSACTIONS",
    sub: "ledgers · supply · pricing",
    volume: 30,
    value: 71,
    readiness: 54,
    publicSaw: 0,
    verdict: "the operating record of the firm · nothing public resembles it",
  },
  {
    key: "memos",
    name: "DEAL MEMOS & LAB NOTEBOOKS",
    sub: "decisions · trials · IP",
    volume: 12,
    value: 96,
    readiness: 28,
    publicSaw: 0,
    verdict: "deepest, smallest, richest · the moat is here, and it is hard to prepare",
  },
]

// ---------------------------------------------------------------------------
// MEASURED framing anchors (Source Ledger, Ch7). Rendered only in the rail.
// ---------------------------------------------------------------------------

const MEASURED = {
  entShare: "over 80%", // enterprise share of worldwide installed bytes, 2025 (IDC 12.6 ZB)
  datasphere: "175 ZB", // global datasphere forecast, 2025 (IDC)
  trainText: "44 TB", // FineWeb curated text
  trainTokens: "15T", // FineWeb tokens
  unseen: ">99.9999%", // derived: 1 - 44TB / 175ZB
  ratioVolume: "1 : 4 billion", // 44 TB / 175 ZB, ledger-recomputed
  ratioStored: "1 : 341-455 M", // 44 TB against 10-20 ZB stored, ledger-recomputed
}

// Deterministic hatch offsets for the core wall (module scope: SSR === CSR).
const HATCH = (() => {
  const rnd = mulberry32(0x5a17b04e)
  return Array.from({ length: 40 }, () => rnd())
})()

// ---------------------------------------------------------------------------

function BoreScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p, reduced } = ctx
  const [sel, setSel] = useState(4) // start on the deepest stratum: the moat
  const [publicView, setPublicView] = useState(false)
  const s = STRATA[sel]

  // Animated fill 0..1 for the bars (rAF). Reduced motion renders final state.
  const [t, setT] = useState(reduced ? 1 : 0)
  const tRef = useRef(t)
  tRef.current = t
  useEffect(() => {
    setT(reduced ? 1 : 0)
  }, [publicView, reduced])
  useEffect(() => {
    if (reduced) {
      setT(1)
      return
    }
    let raf = 0
    let last: number | null = null
    const step = (ts: number) => {
      if (last !== null) {
        const dt = Math.min(64, ts - last)
        setT((v) => Math.min(1, v + dt / 520))
      }
      last = ts
      if (tRef.current < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [reduced, publicView])

  const W = compact ? 460 : 980
  const H = compact ? 1170 : 856

  // Core column geometry. The core is a vertical stack of strata bands whose
  // HEIGHT is uniform but whose VOLUME bar (to the right) encodes bulk.
  const core = compact
    ? { x: 44, w: 150, yTop: 96, yBottom: 828 }
    : { x: 70, w: 210, yTop: 96, yBottom: 500 }
  const bandH = (core.yBottom - core.yTop) / STRATA.length

  // Side lanes to the right of the core: VOLUME bar, VALUE glyph, READY gauge.
  // Compact packs them tighter so the widest row still clears the viewBox.
  const volX = core.x + core.w + 10 // volume bar left edge
  const volMaxW = compact ? 120 : 300 // volume bar full-scale width
  const glyphX = volX + volMaxW + (compact ? 24 : 44) // value glyph centre
  const glyphR = compact ? 13 : 16
  const meterX = glyphX + glyphR + (compact ? 14 : 32) // readiness meter left
  const meterW = compact ? 58 : 240

  // Readout panel sits BELOW the drill core (both layouts). On desktop the side
  // lanes (VOLUME / VALUE / READY) already occupy the space to the right of the
  // core, so the panel cannot also live there without overlapping them.
  const panel = compact
    ? { x: 40, y: 856, w: 380 }
    : { x: 70, y: 548, w: 860 }

  const fs = compact ? 17 : 13.5

  // A stratum's on-screen magnitude collapses to publicSaw when publicView on.
  const mag = (st: Stratum, field: "volume" | "value" | "readiness") => {
    const base = st[field]
    return publicView ? (base * st.publicSaw) / 100 : base
  }

  const depthLabel = (i: number) => (i === 0 ? "surface" : i === STRATA.length - 1 ? "bedrock" : "")

  // colour for the value glyph: deep out-of-distribution value is the amber
  // verdict accent; the one green signal is reserved for the focused stratum.
  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>A drill core through one enterprise data vault</title>
        <desc>
          A vertical borehole through an enterprise vault. Shallow strata such as logs
          and telemetry are high volume and low value; deep strata such as deal memos
          and lab notebooks are low volume and high value. A toggle drops every stratum
          to near zero to show how little a public model saw. Measured framing: the
          enterprise holds over 80% of installed bytes, a frontier run trains on
          about 44 terabytes, and over 99.9999% of the corpus is unseen.
        </desc>

        {/* ===== derrick head ===== */}
        <text
          x={core.x}
          y={core.yTop - 58}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
        >
          DRILL CORE · ONE ENTERPRISE VAULT · SCHEMATIC
        </text>
        <text
          x={core.x}
          y={core.yTop - 36}
          fill={p.soft}
          style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}
        >
          band height uniform · side bar = VOLUME · glyph = VALUE · gauge = MODEL-READY
        </text>
        {/* depth axis ticks */}
        <line
          x1={core.x - 14}
          y1={core.yTop}
          x2={core.x - 14}
          y2={core.yBottom}
          stroke={p.hair}
          strokeWidth={1}
        />

        {/* ===== the core: stacked strata ===== */}
        {STRATA.map((st, i) => {
          const y = core.yTop + i * bandH
          const isSel = i === sel
          const vol = mag(st, "volume")
          const val = mag(st, "value")
          const rdy = mag(st, "readiness")
          const volW = (volMaxW * vol) / 100

          return (
            <g key={st.key} style={{ cursor: "pointer" }} onClick={() => setSel(i)}>
              {/* the core wall band */}
              <rect
                x={core.x}
                y={y + 1}
                width={core.w}
                height={bandH - 2}
                fill={isSel ? rgba(p.signalRGB, 0.14) : rgba(p.inkRGB, 0.05)}
                stroke={isSel ? p.signal : p.hair}
                strokeWidth={isSel ? 1.8 : 1}
              />
              {/* fine hatch: strata texture, denser where entropy (100 - value) is high */}
              {(() => {
                const lines = Math.round(3 + (st.volume / 100) * 5)
                return Array.from({ length: lines }).map((_, h) => {
                  const hy = y + 4 + ((bandH - 8) * (h + 0.5)) / lines
                  const jitter = (HATCH[(i * 8 + h) % HATCH.length] - 0.5) * 6
                  return (
                    <line
                      key={h}
                      x1={core.x + 6}
                      y1={hy + jitter}
                      x2={core.x + core.w - 6}
                      y2={hy + jitter}
                      stroke={p.grid}
                      strokeWidth={1}
                    />
                  )
                })
              })()}
              {/* stratum name. Desktop: centred in the band. Compact: the band is
                  only ~150 wide but tall, and the long names ("DEAL MEMOS & LAB
                  NOTEBOOKS") overrun the side lanes if centred, so lift the name and
                  sub to the top of the band where the row to their right is empty. */}
              <text
                x={core.x + 10}
                y={y + (compact ? 26 : bandH / 2 - 3)}
                fill={isSel ? p.signalHi : p.ink}
                style={{ fontSize: fs - (compact ? 3 : 2), fontWeight: 700, letterSpacing: "0.04em", fontFamily: "var(--font-mono), monospace" }}
              >
                {st.name}
              </text>
              <text
                x={core.x + 10}
                y={y + (compact ? 44 : bandH / 2 + 14)}
                fill={p.soft}
                style={{ fontSize: fs - 4, fontFamily: "var(--font-mono), monospace" }}
              >
                {st.sub}
              </text>

              {/* VOLUME side bar, animated */}
              <rect
                x={volX}
                y={y + bandH / 2 - 7}
                width={volW * t}
                height={14}
                rx={2}
                fill={isSel ? rgba(p.signalRGB, 0.3) : rgba(p.inkRGB, 0.12)}
                stroke={isSel ? p.signal : p.hair}
                strokeWidth={1}
              />
              {/* VALUE glyph: a filled disc whose radius tracks value; amber = the moat */}
              {(() => {
                const r = 4 + (val / 100) * (glyphR - 4) * t
                return (
                  <>
                    <circle
                      cx={glyphX}
                      cy={y + bandH / 2}
                      r={glyphR}
                      fill="none"
                      stroke={p.hair}
                      strokeWidth={1}
                    />
                    <circle
                      cx={glyphX}
                      cy={y + bandH / 2}
                      r={r}
                      fill={rgba(p.mode === "dark" ? "230,180,90" : "150,102,12", 0.85)}
                    />
                  </>
                )
              })()}
              {/* MODEL-READINESS gauge: a small horizontal meter */}
              <rect x={meterX} y={y + bandH / 2 - 5} width={meterW} height={10} rx={2} fill={rgba(p.inkRGB, 0.06)} stroke={p.hair} strokeWidth={1} />
              <rect x={meterX} y={y + bandH / 2 - 5} width={(meterW * rdy * t) / 100} height={10} rx={2} fill={rgba(p.signalRGB, isSel ? 0.5 : 0.22)} />

              {/* depth marker: sits just inside the depth axis, above/below the band */}
              {depthLabel(i) && (
                <text
                  x={core.x + 2}
                  y={i === 0 ? y - 4 : y + bandH + 12}
                  fill={p.soft}
                  style={{ fontSize: fs - 4, letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}
                >
                  {depthLabel(i)}
                </text>
              )}
            </g>
          )
        })}

        {/* column headers over the side lanes (desktop only: compact is too tight) */}
        {!compact && (
          <g style={{ fontFamily: "var(--font-mono), monospace" }}>
            <text x={volX} y={core.yTop - 12} fill={p.soft} style={{ fontSize: fs - 4, letterSpacing: "0.12em" }}>
              VOLUME
            </text>
            <text x={glyphX} y={core.yTop - 12} textAnchor="middle" fill={p.soft} style={{ fontSize: fs - 4, letterSpacing: "0.12em" }}>
              VALUE
            </text>
            <text x={meterX} y={core.yTop - 12} fill={p.soft} style={{ fontSize: fs - 4, letterSpacing: "0.12em" }}>
              READY
            </text>
          </g>
        )}

        {/* ===== focus readout ===== */}
        <g>
          <text
            x={panel.x}
            y={panel.y}
            fill={p.soft}
            style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
          >
            {publicView ? "WHAT A PUBLIC MODEL SAW" : "STRATUM READOUT"}
          </text>
          <text
            x={panel.x}
            y={panel.y + 40}
            fill={publicView ? p.danger : p.signalHi}
            style={{ fontSize: compact ? 30 : 34, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
          >
            {publicView ? `~${s.publicSaw}%` : s.name}
          </text>
          {!publicView && (
            <text
              x={panel.x}
              y={panel.y + 62}
              fill={p.soft}
              style={{ fontSize: fs - 2, fontFamily: "var(--font-mono), monospace" }}
            >
              {s.sub}
            </text>
          )}

          {/* three measured-per-stratum readouts (schematic scale) */}
          {[
            { k: "VOLUME", v: s.volume, hint: "relative bulk" },
            { k: "VALUE", v: s.value, hint: "in-distribution training value" },
            { k: "MODEL-READY", v: s.readiness, hint: "labelled · deduped · permissioned" },
          ].map((row, i) => {
            const ry = panel.y + 92 + i * 30
            return (
              <g key={row.k}>
                <text x={panel.x} y={ry} fill={p.muted} style={{ fontSize: fs - 2, letterSpacing: "0.08em", fontFamily: "var(--font-mono), monospace" }}>
                  {row.k}
                </text>
                <rect x={panel.x + (compact ? 150 : 168)} y={ry - 10} width={compact ? 150 : 220} height={12} rx={2} fill={rgba(p.inkRGB, 0.06)} stroke={p.hair} strokeWidth={1} />
                <rect
                  x={panel.x + (compact ? 150 : 168)}
                  y={ry - 10}
                  width={((compact ? 150 : 220) * (publicView ? (row.v * s.publicSaw) / 100 : row.v)) / 100}
                  height={12}
                  rx={2}
                  fill={row.k === "VALUE" ? rgba(p.mode === "dark" ? "230,180,90" : "150,102,12", 0.8) : rgba(p.signalRGB, 0.4)}
                />
                <text
                  x={panel.x + (compact ? 150 : 168) + (compact ? 158 : 228)}
                  y={ry}
                  fill={p.soft}
                  style={{ fontSize: fs - 3.5, fontFamily: "var(--font-mono), monospace" }}
                >
                  {row.hint}
                </text>
              </g>
            )
          })}
        </g>

        {/* ===== measured framing rail ===== */}
        {(() => {
          const rx = panel.x
          const ry = panel.y + 92 + 3 * 30 + 26
          return (
            <g style={{ fontFamily: "var(--font-mono), monospace" }}>
              <line x1={rx} y1={ry - 14} x2={rx + panel.w} y2={ry - 14} stroke={p.hair} strokeWidth={1} />
              <text x={rx} y={ry + 2} fill={p.verdict} style={{ fontSize: fs - 3, letterSpacing: "0.12em" }}>
                MEASURED FRAMING · SOURCE LEDGER Ch7
              </text>
              {[
                `enterprise holds ${MEASURED.entShare} of installed bytes · IDC 2025`,
                `frontier run trains on ${MEASURED.trainText} · ${MEASURED.trainTokens} tokens · FineWeb`,
                `${MEASURED.trainText} against ${MEASURED.datasphere} datasphere = ${MEASURED.ratioVolume} by volume`,
                `${MEASURED.unseen} of the corpus unseen · out of distribution`,
              ].map((line, i) => (
                <text key={i} x={rx} y={ry + 22 + i * 18} fill={p.muted} style={{ fontSize: fs - 4 }}>
                  {line}
                </text>
              ))}
            </g>
          )
        })()}
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{
          fontFamily: "var(--font-mono), monospace",
          color: publicView ? p.danger : p.signal,
        }}
      >
        {"VERDICT · "}
        {publicView
          ? `every private stratum drops to ~0 · ${MEASURED.unseen} unseen · the moat is what no public model was trained on`
          : s.verdict}
      </div>

      {/* controls lane: stratum pills + the public-view toggle */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {STRATA.map((st, i) => (
          <button
            key={st.key}
            type="button"
            aria-pressed={i === sel}
            onClick={() => setSel(i)}
            className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: i === sel ? p.signalHi : p.muted,
              border: `1px solid ${i === sel ? p.signal : p.hair}`,
              background: i === sel ? rgba(p.signalRGB, 0.1) : "transparent",
            }}
          >
            {st.name}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={publicView}
          onClick={() => setPublicView((v) => !v)}
          className="rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
          style={{
            fontFamily: "var(--font-mono), monospace",
            color: publicView ? p.dangerHi : p.muted,
            border: `1px ${publicView ? "solid" : "dashed"} ${publicView ? p.danger : p.hair}`,
            background: publicView ? rgba(p.dangerRGB, 0.1) : "transparent",
          }}
        >
          {publicView ? "PUBLIC MODEL VIEW · ON" : "WHAT PUBLIC MODELS SAW"}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function VaultBore() {
  return (
    <InstrumentFrame
      kicker="V10 · THE VAULT BORE"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          The honest version of the iceberg. One enterprise vault is not uniformly gold.
          Drill through it and the strata separate: logs and telemetry are the thick
          shallow band with almost no training value, while deal memos and lab notebooks
          are the deep, thin, out-of-distribution seam that no public model was trained
          on. Flip the toggle and every private stratum drops to near zero. The wedge is
          distribution, not volume.
        </>
      }
      method={
        <>
          SCHEMATIC · the per-stratum VOLUME, VALUE and MODEL-READY bars are an
          illustrative model of a generic enterprise vault, not a measured company.
          MEASURED framing (rail, Source Ledger Ch7): enterprises hold over 80% of
          worldwide installed bytes in 2025 (IDC, 12.6 ZB); global datasphere ~175 ZB by
          2025 (IDC); a frontier run trains on ~44 TB / ~15T tokens (FineWeb, arXiv
          2406.17557). The handover freezes the ratio as 1:10^9; the ledger recomputes it
          to ~1:4 billion by raw volume against 175 ZB, ~1:341-455 million against 10-20
          ZB stored, so {">"}99.9999% is unseen. The binding constraint is distribution and
          coverage, not raw byte volume.
        </>
      }
    >
      {(ctx) => <BoreScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
