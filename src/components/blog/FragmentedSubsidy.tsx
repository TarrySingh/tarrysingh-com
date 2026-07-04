"use client"

/**
 * V15 — TWENTY-SEVEN CHIP STRATEGIES  (Chapter 4, "The Chokepoint We Spent").
 *
 * Europe owns the one irreplaceable asset — ASML / EUV — and has spent the
 * chokepoint carelessly. The clearest tell is the money. The EU Chips Act's
 * ~€86bn arrives SHATTERED: a galaxy of small national-subsidy shards (Germany,
 * France, Italy, Spain, the long tail of twenty-seven member states) with only a
 * thin sliver centrally managed by the Commission — the European Court of
 * Auditors (SR 12/2025) puts the directly-EU-managed share at roughly 5%.
 *
 * The rivals' money arrives COORDINATED: single solid blocks. ~$580bn of rival
 * semiconductor capex 2020–2023 (SEMI 2025), behind it the US CHIPS Act's
 * ~$52.7bn federal programme and China's ~$40–47bn coordinated public push,
 * plus Japan/Korea.
 *
 * Toggle EU ⟷ RIVALS, or hover/focus a shard to read it. The EU side is a
 * scatter of fragments that visibly do not lock together; the rival side is a
 * stacked monolith. REVEAL: twenty-seven national chip strategies do not add up
 * to one.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (no ambient animation; the only motion is the user's own toggle/
 * hover), keyboard-reachable (native button toggle + focusable shards). Renders
 * meaningfully at its EU default as the static fallback.
 *
 * Figures hard-coded. Sources: EU Chips Act; European Court of Auditors SR
 * 12/2025 (~5% directly EU-managed); US CHIPS Act ($52.7bn federal); SEMI 2025
 * (rival capex ~$580bn).
 */

import { useRef, useState } from "react"

import { PlateFrame, useReadMode, clamp01 } from "./read-chart-kit"
import { cpPalette } from "./chokepoint-kit"

type Side = "eu" | "rivals"

// ── EU side: the €86bn Chips Act, shattered. The Commission-managed sliver is
// the only coordinated fragment (cyan/gold); the rest are national shards (red).
// Shards are placed by hand so the scatter reads as fragmentation, not a grid.
type Shard = {
  cx: number
  cy: number
  r: number
  label: string
  eur: number // €bn (illustrative split of the headline ~€86bn)
  central: boolean
}

// The directly-EU-managed sliver ≈ 5% of ~€86bn (ECA SR 12/2025) ≈ €4.3bn.
const EU_TOTAL = 86 // €bn, headline
const CENTRAL_PCT = 5 // % directly EU-managed (ECA estimate)

const SHARDS: Shard[] = [
  { cx: 420, cy: 250, r: 30, label: "EU-MANAGED", eur: 4.3, central: true },
  { cx: 150, cy: 150, r: 26, label: "Germany", eur: 20, central: false },
  { cx: 250, cy: 360, r: 22, label: "France", eur: 11, central: false },
  { cx: 560, cy: 150, r: 18, label: "Italy", eur: 7, central: false },
  { cx: 330, cy: 130, r: 16, label: "Spain", eur: 6, central: false },
  { cx: 640, cy: 320, r: 15, label: "Netherlands", eur: 5, central: false },
  { cx: 150, cy: 300, r: 13, label: "Poland", eur: 3.5, central: false },
  { cx: 520, cy: 380, r: 12, label: "Ireland", eur: 3, central: false },
  { cx: 700, cy: 200, r: 11, label: "Belgium", eur: 2.6, central: false },
  { cx: 350, cy: 410, r: 11, label: "Austria", eur: 2.4, central: false },
  { cx: 250, cy: 220, r: 10, label: "Sweden", eur: 2, central: false },
  { cx: 620, cy: 110, r: 9, label: "Finland", eur: 1.7, central: false },
  { cx: 460, cy: 110, r: 9, label: "Czechia", eur: 1.6, central: false },
  { cx: 730, cy: 380, r: 8, label: "Denmark", eur: 1.3, central: false },
  { cx: 110, cy: 410, r: 8, label: "Portugal", eur: 1.2, central: false },
  { cx: 540, cy: 270, r: 8, label: "Hungary", eur: 1.1, central: false },
  { cx: 690, cy: 130, r: 7, label: "Romania", eur: 0.9, central: false },
  { cx: 430, cy: 350, r: 7, label: "Greece", eur: 0.8, central: false },
  { cx: 300, cy: 300, r: 6, label: "Slovakia", eur: 0.7, central: false },
  { cx: 620, cy: 250, r: 6, label: "Bulgaria", eur: 0.6, central: false },
  { cx: 200, cy: 430, r: 6, label: "Croatia", eur: 0.5, central: false },
  { cx: 760, cy: 280, r: 5, label: "Lithuania", eur: 0.4, central: false },
  { cx: 90, cy: 240, r: 5, label: "Slovenia", eur: 0.4, central: false },
  { cx: 410, cy: 430, r: 5, label: "Latvia", eur: 0.3, central: false },
  { cx: 540, cy: 430, r: 5, label: "Estonia", eur: 0.3, central: false },
  { cx: 760, cy: 170, r: 4, label: "Luxembourg", eur: 0.3, central: false },
  { cx: 130, cy: 350, r: 4, label: "Cyprus", eur: 0.2, central: false },
]

// ── Rivals: coordinated public programmes, single solid blocks (stacked).
type Block = { label: string; usd: number; sub: string }
const RIVAL_BLOCKS: Block[] = [
  { label: "US CHIPS Act", usd: 52.7, sub: "federal, coordinated" },
  { label: "China public push", usd: 47, sub: "~$40–47bn, coordinated" },
  { label: "Japan / Korea", usd: 30, sub: "national programmes" },
]
const RIVAL_CAPEX = 580 // $bn, rival semiconductor capex 2020–2023 (SEMI 2025)

const SHARD_COUNT = SHARDS.length // 27

const eurFmt = (v: number) => (v >= 10 ? v.toFixed(0) : v.toFixed(1))

export function FragmentedSubsidy() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)

  const [side, setSide] = useState<Side>("eu")
  const [hover, setHover] = useState<number | null>(null)

  const isEU = side === "eu"

  // Rival stack geometry — one coordinated monolith, summed.
  const STACK_X = 300
  const STACK_W = 280
  const STACK_TOP = 120
  const STACK_BOT = 430
  const rivalSum = RIVAL_BLOCKS.reduce((s, b) => s + b.usd, 0)
  const stackH = STACK_BOT - STACK_TOP

  const verdict = isEU
    ? { word: "FRAGMENTED", color: p.squeeze, line: "twenty-seven national strategies that do not add up to one" }
    : { word: "COORDINATED", color: p.leverage, line: "one programme, spent as a single block" }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V15 · Twenty-Seven Chip Strategies"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {isEU ? `€${EU_TOTAL}bn · ${SHARD_COUNT} shards` : `$${RIVAL_CAPEX}bn · 1 block`}
        </span>
      }
      caption={
        <>
          The EU Chips Act&rsquo;s <span style={{ color: p.squeeze }}>~€{EU_TOTAL}bn</span> arrives
          shattered into national-subsidy shards — only{" "}
          <span style={{ color: p.wonderHi }}>~{CENTRAL_PCT}%</span> is directly EU-managed (the ECA
          estimate). Toggle to the rivals&rsquo;{" "}
          <span style={{ color: p.leverage }}>coordinated</span> blocks, or hover a shard to read it.
          Sources: EU Chips Act; European Court of Auditors SR 12/2025 (~{CENTRAL_PCT}% directly
          EU-managed); US CHIPS Act ($52.7bn federal); SEMI 2025 (rival capex ~${RIVAL_CAPEX}bn).
        </>
      }
    >
      <svg
        viewBox="0 0 840 500"
        role="img"
        aria-label={
          isEU
            ? `The EU Chips Act's ~€${EU_TOTAL} billion shattered into ${SHARD_COUNT} national-subsidy shards, with only ~${CENTRAL_PCT}% directly managed by the Commission`
            : `Rivals' coordinated semiconductor spending as a single solid block: ~$${RIVAL_CAPEX} billion of capex, behind a $52.7 billion US CHIPS Act, ~$40–47 billion China, and Japan/Korea programmes`
        }
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="fs-central-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.wonderHi} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0} />
          </radialGradient>
        </defs>

        {isEU ? (
          <g>
            {/* faint blueprint frame — the outline of one programme the shards fail to fill */}
            <rect
              x={70}
              y={90}
              width={700}
              height={370}
              rx={10}
              fill="none"
              stroke={p.blueprint}
              strokeWidth={1.2}
              strokeDasharray="6 6"
            />
            <text x={80} y={114} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em" }}>
              ONE PROGRAMME · €{EU_TOTAL}BN · FILLED BY {SHARD_COUNT} SHARDS
            </text>

            {/* the shards — a scatter that visibly does not lock together */}
            {SHARDS.map((sh, i) => {
              const on = hover === i
              const base = sh.central ? p.wonder : p.squeeze
              const hi = sh.central ? p.wonderHi : p.squeezeHi
              const fillA = sh.central ? 0.26 : on ? 0.32 : 0.16
              return (
                <g
                  key={`sh-${i}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${sh.label}: €${eurFmt(sh.eur)} billion${sh.central ? `, directly EU-managed (~${CENTRAL_PCT}% of the total)` : ", national subsidy"}`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover((h) => (h === i ? null : h))}
                  style={{ cursor: "pointer", outline: "none" }}
                >
                  {sh.central && (
                    <circle cx={sh.cx} cy={sh.cy} r={sh.r + 22} fill="url(#fs-central-glow)" />
                  )}
                  <circle
                    cx={sh.cx}
                    cy={sh.cy}
                    r={sh.r}
                    fill={base}
                    fillOpacity={fillA}
                    stroke={on || sh.central ? hi : base}
                    strokeWidth={on ? 2 : sh.central ? 1.8 : 1.2}
                    strokeOpacity={sh.central ? 0.9 : on ? 0.95 : 0.55}
                  />
                  {sh.central && (
                    <circle
                      cx={sh.cx}
                      cy={sh.cy}
                      r={sh.r - 6}
                      fill="none"
                      stroke={p.wonderHi}
                      strokeWidth={0.8}
                      strokeOpacity={0.5}
                    />
                  )}
                  {/* label the larger shards inline; the long tail reads on hover */}
                  {(sh.r >= 13 || on) && (
                    <text
                      x={sh.cx}
                      y={sh.cy + 3}
                      textAnchor="middle"
                      fill={on || sh.central ? hi : p.muted}
                      style={{ fontSize: sh.r >= 18 ? 12 : 11, fontWeight: on || sh.central ? 700 : 400 }}
                    >
                      {sh.central ? "EU" : sh.label}
                    </text>
                  )}
                </g>
              )
            })}

            {/* hover readout — €bn for the focused shard */}
            <text x={80} y={444} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.04em" }}>
              {hover !== null
                ? `${SHARDS[hover].label} · €${eurFmt(SHARDS[hover].eur)}bn${SHARDS[hover].central ? ` · directly EU-managed (~${CENTRAL_PCT}%)` : " · national subsidy"}`
                : `hover a shard — only the lit core (~${CENTRAL_PCT}%) is steered from Brussels`}
            </text>
          </g>
        ) : (
          <g>
            {/* the rival capex backdrop — the scale Europe is spending against */}
            <text x={80} y={114} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em" }}>
              ONE BLOCK · ${RIVAL_CAPEX}BN RIVAL CAPEX 2020–2023 · COORDINATED
            </text>

            {/* the coordinated monolith — single stacked block */}
            {(() => {
              let yCursor = STACK_TOP
              return RIVAL_BLOCKS.map((b, i) => {
                const h = (b.usd / rivalSum) * stackH
                const y = yCursor
                yCursor += h
                return (
                  <g key={`rb-${i}`}>
                    <rect
                      x={STACK_X}
                      y={y}
                      width={STACK_W}
                      height={h - 3}
                      rx={4}
                      fill={p.leverage}
                      fillOpacity={0.22 + i * 0.06}
                      stroke={p.leverageHi}
                      strokeWidth={1.6}
                    />
                    <text
                      x={STACK_X + 16}
                      y={y + h / 2 - 2}
                      fill={p.leverageHi}
                      style={{ fontSize: 14, fontWeight: 700 }}
                    >
                      {b.label}
                    </text>
                    <text
                      x={STACK_X + 16}
                      y={y + h / 2 + 15}
                      fill={p.muted}
                      style={{ fontSize: 11 }}
                    >
                      {b.sub}
                    </text>
                    <text
                      x={STACK_X + STACK_W - 16}
                      y={y + h / 2 + 5}
                      textAnchor="end"
                      fill={p.leverageHi}
                      style={{ fontSize: 18, fontWeight: 800 }}
                    >
                      ${b.usd}bn
                    </text>
                  </g>
                )
              })
            })()}

            {/* the block is bound by a single bracket — one decision, one signatory */}
            <path
              d={`M ${STACK_X - 16} ${STACK_TOP} q -12 0 -12 12 v ${stackH - 24} q 0 12 12 12`}
              fill="none"
              stroke={p.leverage}
              strokeWidth={1.6}
            />
            <text
              x={STACK_X - 34}
              y={(STACK_TOP + STACK_BOT) / 2}
              textAnchor="middle"
              fill={p.leverage}
              transform={`rotate(-90 ${STACK_X - 34} ${(STACK_TOP + STACK_BOT) / 2})`}
              style={{ fontSize: 11, letterSpacing: "0.14em" }}
            >
              ONE SIGNATORY
            </text>

            <text x={80} y={444} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.04em" }}>
              ${rivalSum.toFixed(1)}bn of coordinated public programmes — decided once, spent as one.
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
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>
            {verdict.word}
          </span>{" "}
          — {verdict.line}.
        </p>

        {/* fragmentation meter: EU's coordinated sliver vs the scattered remainder */}
        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full"
          style={{ background: p.hair }}
          aria-hidden
        >
          {isEU ? (
            <>
              <div
                style={{
                  width: `${clamp01(CENTRAL_PCT / 100) * 100}%`,
                  height: "100%",
                  background: p.wonder,
                  float: "left",
                }}
              />
              <div
                style={{
                  width: `${clamp01(1 - CENTRAL_PCT / 100) * 100}%`,
                  height: "100%",
                  background: p.squeeze,
                  float: "left",
                }}
              />
            </>
          ) : (
            <div style={{ width: "100%", height: "100%", background: p.leverage }} />
          )}
        </div>

        {/* the EU ⟷ RIVALS toggle */}
        <div
          className="mt-4 inline-flex items-center gap-1 rounded-full p-1"
          style={{ border: `1px solid ${p.hair}` }}
          role="group"
          aria-label="Compare EU fragmented subsidy versus rivals' coordinated programmes"
        >
          <button
            type="button"
            onClick={() => setSide("eu")}
            aria-pressed={isEU}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 14px",
              borderRadius: 999,
              cursor: "pointer",
              color: isEU ? p.bg : p.squeeze,
              background: isEU ? p.squeeze : "transparent",
              border: "none",
              fontWeight: 700,
            }}
          >
            EU · {SHARD_COUNT} shards
          </button>
          <button
            type="button"
            onClick={() => setSide("rivals")}
            aria-pressed={!isEU}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 14px",
              borderRadius: 999,
              cursor: "pointer",
              color: !isEU ? p.bg : p.leverage,
              background: !isEU ? p.leverage : "transparent",
              border: "none",
              fontWeight: 700,
            }}
          >
            RIVALS · 1 block
          </button>
        </div>
      </div>
    </PlateFrame>
  )
}
