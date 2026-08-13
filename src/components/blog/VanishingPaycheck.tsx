"use client"

/**
 * V22 — THE VANISHING PAYCHECK  (Chapter 6, "The Brains We Rent Out: Talent").
 *
 * Europe trains the researcher at its own expense, then rents her out to the
 * firms that will use her to buy the rest. The same person, the same skills —
 * two continents, two paychecks. Drive the slider and "relocate" a senior AI
 * researcher from a European hub to a US frontier lab: her total comp doesn't
 * just rise, it MULTIPLIES on screen.
 *
 * European senior AI total comp ~€120k–180k (base ~€90–130k); US frontier-lab
 * total comp ~$600k to $1,000,000+ (enterprise ML ~$170–245k) — a gap of
 * roughly 3–5×, and far more at the very frontier.
 *
 * The European paycheck is CYAN (value Europe creates and holds); the US
 * multiple — the part that reappears the instant she crosses the Atlantic — is
 * RED (the drain). Two stacked bars grow side by side, a mono readout shows
 * €→$ and the live multiple, and the default state already tells the story:
 * the bar on the right towers over the bar on the left.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native range input + a play button), reduced-motion safe (▶ snaps
 * to the frontier end-state instead of animating), and meaningful at its
 * default. Figures hard-coded from the spec. Sources: Stanford AI Index 2026;
 * Levels.fyi (2026); Atomico 2025.
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
import { cpPalette, rgba } from "./chokepoint-kit"

// FX — illustrative; the story is the multiple, not the cross-rate.
const FX = 1.08 // $ per €

// European senior AI researcher — total comp, in euros.
const EU_BASE = 110_000 // base ~€90–130k → midpoint
const EU_TOTAL = 150_000 // total comp ~€120–180k → midpoint
// US frontier lab — total comp, in dollars.
const US_BASE = 205_000 // enterprise-ML base ~$170–245k → midpoint
const US_TOTAL = 800_000 // frontier total ~$600k–1,000,000+ → working midpoint

// Everything plotted in a common currency ($) so the bars are comparable.
const EU_TOTAL_USD = EU_TOTAL * FX // ≈ $162k
const EU_BASE_USD = EU_BASE * FX

const W = 920
const H = 520
const PADB = 92
const PADT = 96
const BASELINE = H - PADB
const yScale = linScale(0, US_TOTAL, BASELINE, PADT)

// Two bar columns.
const EU_X = 196
const US_X = 560
const BAR_W = 168

const usd = (v: number) => "$" + Math.round(v).toLocaleString("en-US")
const eur = (v: number) => "€" + Math.round(v).toLocaleString("en-GB")

export function VanishingPaycheck() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // t ∈ [0,1] — how far she has crossed the Atlantic. Default 1: already there,
  // the frontier paycheck at full height (the reveal lives in the default).
  const [raw, setRaw] = useState(1)
  const [playing, setPlaying] = useState(false)

  // ▶ — slow mechanical crossing, west to east. Snaps to the end on reduced motion.
  useEffect(() => {
    if (!playing || reduced) return
    if (raw >= 1) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setRaw((v) => clamp(v + 0.02, 0, 1)), 24)
    return () => window.clearTimeout(id)
  }, [playing, reduced, raw])

  const t = clamp01(raw)
  const eased = easeInOut(t)

  // The US bar grows from the European total (parity) up to the frontier total:
  // the paycheck that vanished in Europe reappearing, multiplied.
  const usTotal = lerp(EU_TOTAL_USD, US_TOTAL, eased)
  const usBase = lerp(EU_BASE_USD, US_BASE, eased)
  const multiple = usTotal / EU_TOTAL_USD // 1× → ~4.9×

  const verdict =
    t < 0.04
      ? { word: "PARITY", color: p.leverage }
      : t < 0.85
        ? { word: "CROSSING", color: p.wonderHi }
        : { word: "FRONTIER", color: p.squeeze }

  // Bar geometry.
  const euTotH = BASELINE - yScale(EU_TOTAL_USD)
  const euBaseH = BASELINE - yScale(EU_BASE_USD)
  const usTotH = BASELINE - yScale(usTotal)
  const usBaseH = BASELINE - yScale(usBase)

  function play() {
    if (reduced) {
      setRaw(1)
      return
    }
    if (raw >= 1) setRaw(0)
    setPlaying(true)
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V22 · The Vanishing Paycheck"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {multiple.toFixed(1)}× · {verdict.word}
        </span>
      }
      caption={
        <>
          The same researcher, two continents. A senior AI researcher earns{" "}
          <span style={{ color: p.leverage }}>~€120–180k</span> in a European hub; cross to a{" "}
          <span style={{ color: p.squeeze }}>US frontier lab</span> and total comp reappears at{" "}
          <span style={{ color: p.squeeze }}>$600k–$1,000,000+</span>, same person, same skills, ~3–5× the
          pay. Drag the researcher across the Atlantic, or press ▶, and watch the paycheck multiply.
          Sources: Stanford AI Index 2026; Levels.fyi (2026); Atomico 2025.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Two paycheck bars. A European senior AI researcher's total comp of about €150,000 stands beside a US frontier-lab paycheck currently ${usd(
          usTotal,
        )}, ${multiple.toFixed(1)} times higher.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="vp-eu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.9} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0.55} />
          </linearGradient>
          <linearGradient id="vp-us" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={0.92} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0.5} />
          </linearGradient>
        </defs>

        {/* blueprint reference rules at the European total + the frontier ceiling */}
        {[EU_TOTAL_USD, US_TOTAL].map((v, i) => (
          <g key={`rule-${i}`}>
            <line
              x1={120}
              y1={yScale(v)}
              x2={W - 40}
              y2={yScale(v)}
              stroke={p.blueprint}
              strokeWidth={1}
              strokeDasharray={i === 0 ? "none" : "4 6"}
            />
            <text x={116} y={yScale(v) + 4} textAnchor="end" fill={p.soft} style={{ fontSize: 11 }}>
              {usd(v)}
            </text>
          </g>
        ))}

        {/* baseline */}
        <line x1={120} y1={BASELINE} x2={W - 40} y2={BASELINE} stroke={p.hair} strokeWidth={1.4} />

        {/* ── EUROPE BAR — the paycheck Europe creates and holds (cyan) ───────── */}
        <rect x={EU_X} y={BASELINE - euTotH} width={BAR_W} height={euTotH} fill="url(#vp-eu)" stroke={p.leverage} strokeWidth={1.4} />
        {/* base sub-band */}
        <rect x={EU_X} y={BASELINE - euBaseH} width={BAR_W} height={euBaseH} fill={p.leverage} opacity={0.28} />
        <line x1={EU_X} y1={BASELINE - euBaseH} x2={EU_X + BAR_W} y2={BASELINE - euBaseH} stroke={p.leverageHi} strokeWidth={1} strokeDasharray="4 4" />

        <text x={EU_X + BAR_W / 2} y={BASELINE + 26} textAnchor="middle" fill={p.leverage} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em" }}>
          EUROPEAN HUB
        </text>
        <text x={EU_X + BAR_W / 2} y={BASELINE + 44} textAnchor="middle" fill={p.muted} style={{ fontSize: 10.5 }}>
          base {eur(EU_BASE)} · total
        </text>
        <text x={EU_X + BAR_W / 2} y={BASELINE - euTotH - 12} textAnchor="middle" fill={p.leverageHi} style={{ fontSize: 22, fontWeight: 800 }}>
          {eur(EU_TOTAL)}
        </text>

        {/* ── US BAR — the multiple that reappears at the frontier (red) ──────── */}
        <rect x={US_X} y={BASELINE - usTotH} width={BAR_W} height={usTotH} fill="url(#vp-us)" stroke={p.squeeze} strokeWidth={1.4} />
        <rect x={US_X} y={BASELINE - usBaseH} width={BAR_W} height={usBaseH} fill={p.squeeze} opacity={0.26} />
        <line x1={US_X} y1={BASELINE - usBaseH} x2={US_X + BAR_W} y2={BASELINE - usBaseH} stroke={p.squeezeHi} strokeWidth={1} strokeDasharray="4 4" />

        <text x={US_X + BAR_W / 2} y={BASELINE + 26} textAnchor="middle" fill={p.squeeze} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em" }}>
          US FRONTIER LAB
        </text>
        <text x={US_X + BAR_W / 2} y={BASELINE + 44} textAnchor="middle" fill={p.muted} style={{ fontSize: 10.5 }}>
          base {usd(usBase)} · total
        </text>
        <text x={US_X + BAR_W / 2} y={BASELINE - usTotH - 12} textAnchor="middle" fill={p.squeezeHi} style={{ fontSize: 30, fontWeight: 800 }}>
          {usd(usTotal)}
        </text>

        {/* ── THE CROSSING — researcher glyph sliding west→east as t climbs ───── */}
        {(() => {
          const cx = lerp(EU_X + BAR_W / 2, US_X + BAR_W / 2, eased)
          const cy = PADT - 36
          return (
            <g>
              <line x1={EU_X + BAR_W / 2} y1={cy} x2={US_X + BAR_W / 2} y2={cy} stroke={p.blueprint} strokeWidth={1} strokeDasharray="3 5" />
              <text x={(EU_X + US_X) / 2 + BAR_W / 2} y={cy - 14} textAnchor="middle" fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.22em" }}>
                CROSSING THE ATLANTIC
              </text>
              <circle cx={cx} cy={cy} r={7} fill={rgba(mode === "dark" ? "246,234,208" : "13,27,61", 0.9)} stroke={p.bg} strokeWidth={1.5} />
              <text x={cx} y={cy + 26} textAnchor="middle" fill={p.muted} style={{ fontSize: 10 }}>
                same person
              </text>
            </g>
          )
        })()}

        {/* the multiple — the headline, in mono, between the two bars */}
        <text x={(EU_X + BAR_W + US_X) / 2} y={PADT + 64} textAnchor="middle" fill={verdict.color} style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.02em" }}>
          {multiple.toFixed(1)}×
        </text>
        <text x={(EU_X + BAR_W + US_X) / 2} y={PADT + 86} textAnchor="middle" fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.18em" }}>
          THE MULTIPLE
        </text>
      </svg>

      {/* ── Readout + the crossing control ──────────────────────────────────── */}
      <div className="mt-2 px-1">
        {/* mono €→$ readout */}
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-1" style={{ fontFamily: "var(--font-mono), monospace" }}>
          <span className="tabular-nums" style={{ color: p.leverage, fontSize: 13 }}>
            EUROPE&nbsp;<span style={{ fontWeight: 800, fontSize: 16 }}>{eur(EU_TOTAL)}</span>
          </span>
          <span className="tabular-nums" style={{ color: p.soft, fontSize: 13 }}>
            →
          </span>
          <span className="tabular-nums" style={{ color: p.squeeze, fontSize: 13 }}>
            CALIFORNIA&nbsp;<span style={{ fontWeight: 800, fontSize: 16 }}>{usd(usTotal)}</span>
            <span style={{ color: p.soft }}>&nbsp;· {multiple.toFixed(1)}×</span>
          </span>
        </div>

        {/* multiple meter — fills cyan→red as the paycheck multiplies */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
          <div
            style={{
              width: `${eased * 100}%`,
              height: "100%",
              background: p.squeeze,
              transition: reduced ? "none" : "width 200ms linear",
            }}
          />
        </div>

        <p className="mt-3 text-[15px]" style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}>
          The paycheck that <span style={{ color: p.leverage, fontStyle: "normal", fontWeight: 700 }}>vanishes</span> in
          Europe reappears, <span style={{ color: p.squeeze, fontStyle: "normal", fontWeight: 700 }}>multiplied</span>, in
          California, same person, same skills.
        </p>

        {/* play + slider — the reader drives the crossing */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-label={playing ? "Pause the crossing" : "Play the crossing from Europe to the US frontier lab"}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 11px",
              borderRadius: 7,
              cursor: "pointer",
              whiteSpace: "nowrap",
              color: p.squeezeHi,
              border: `1px solid ${p.squeeze}`,
              background: "transparent",
            }}
          >
            {playing ? "❙❙ pause" : "▶ cross"}
          </button>
          <label className="flex flex-1 items-center gap-3 text-[11px]" style={{ color: p.soft }}>
            <span style={{ fontFamily: "var(--font-mono), monospace", color: p.leverage, whiteSpace: "nowrap" }}>
              ◂ EUROPE
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(t * 100)}
              onChange={(e) => {
                setPlaying(false)
                setRaw(clamp01(Number(e.target.value) / 100))
              }}
              aria-label="Relocate the researcher from a European hub to a US frontier lab"
              aria-valuetext={`${multiple.toFixed(1)}×, ${usd(usTotal)}`}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
              style={{ accentColor: p.squeeze, background: p.hair }}
            />
            <span style={{ fontFamily: "var(--font-mono), monospace", color: p.squeeze, whiteSpace: "nowrap" }}>
              FRONTIER ▸
            </span>
          </label>
        </div>
      </div>
    </PlateFrame>
  )
}
