"use client"

/**
 * V42 — THE GREEN SHOOTS  (Chapter 12, "The Key Europe Holds" — the
 * constructive turn).
 *
 * The counter-melody to a decade of managed decline. A field of GOLD green
 * shoots sprouts from a dark soil-line, each a real, dated 2026 sign of life
 * the reader can hover or click for detail. Mature, load-bearing shoots stand
 * in full GOLD (wonderHi); early, fragile ones in amber (wonder). A mono
 * counter tallies the "signs of life".
 *
 * The reader toggles the field between two epochs:
 *   2015–2024 (DORMANT)  — a decade of reports filed and shelved; the soil is
 *                          bare, the shoots are RED stubs that never broke ground.
 *   2025–2026 (SPROUTING) — fear finally did what foresight could not; the
 *                          shoots break the soil-line and rise in GOLD.
 *
 * The shoots (all real, all dated 2025–2026):
 *   Germany REJECTED Palantir (Apr 2026) · German MoD
 *   Euro-Office sovereign suite LAUNCHED (Jun 2026)
 *   Denmark · Austria · France MIGRATING off Microsoft
 *   Mistral raising €3bn at ~€20bn, ARR past $400M (Jun 2026) · TechCrunch
 *   ~€800bn ReArm Europe / Readiness 2030 defence surge · European Commission
 *   Letta "One Europe One Market" roadmap SIGNED (Apr 2026)
 *   Savings & Investments Union measures (2025–26) · European Commission
 *   EUROPA open-source model — 24 EU languages
 *
 * REVEAL: the continent that spent a decade managing its decline has, in the
 * last eighteen months, haltingly and unevenly but unmistakably, begun to fight
 * back — and every shoot was watered by fear, not foresight.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (the grow sweep is gated; reduced → shoots snap to full height),
 * keyboard-reachable (focusable shoot groups + a native toggle), meaningful at
 * its default (SPROUTING, the strongest shoot pre-selected). role="img" +
 * aria-label.
 *
 * Figures hard-coded. Sources: German MoD; Euro-Office; TechCrunch (Mistral,
 * Jun 2026); European Commission; Letta report.
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  clamp01,
  easeOut,
  lerp,
} from "./read-chart-kit"
import { cpPalette, mixHex, rgba } from "./chokepoint-kit"

type Shoot = {
  key: string
  label: string // short field tag, on the stem
  date: string // the dated beat
  strong: boolean // mature/load-bearing (full GOLD) vs early/fragile (amber)
  vigour: number // 0..1 — mature height of the shoot
  metric: string // headline figure for the readout
  detail: string // the sign-of-life story
  fear: string // the fear that watered it (never foresight)
  source: string
}

// Left → right across the field; ordered roughly by how tall each stands.
const SHOOTS: Shoot[] = [
  {
    key: "rearm",
    label: "REARM EUROPE",
    date: "Mar 2025",
    strong: true,
    vigour: 1,
    metric: "~€800bn",
    detail:
      "ReArm Europe / Readiness 2030, up to ~€800bn mobilised for the largest defence build-up since the Cold War, after a decade of flat budgets.",
    fear: "Watered by fear: a US security guarantee that no longer looks unconditional.",
    source: "European Commission",
  },
  {
    key: "mistral",
    label: "MISTRAL €3bn",
    date: "Jun 2026",
    strong: true,
    vigour: 0.94,
    metric: "$400M ARR",
    detail:
      "Mistral raising ~€3bn at a ~€20bn valuation, annualised revenue past $400M, Europe's flagship lab finally scaling on European terms.",
    fear: "Watered by fear: the realisation that the entire stack was being rented from abroad.",
    source: "TechCrunch, Jun 2026",
  },
  {
    key: "palantir",
    label: "NEIN, PALANTIR",
    date: "Apr 2026",
    strong: true,
    vigour: 0.88,
    metric: "Apr 2026",
    detail:
      "Germany REJECTED Palantir for federal police analytics, the first big public 'no' to baking a foreign veto into the security core.",
    fear: "Watered by fear: a foreign company holding the keys to the state's own data.",
    source: "German MoD",
  },
  {
    key: "euroffice",
    label: "EURO-OFFICE",
    date: "Jun 2026",
    strong: true,
    vigour: 0.82,
    metric: "Launched",
    detail:
      "Euro-Office, a sovereign productivity suite, LAUNCHED, a credible European answer to the office monoculture the public sector runs on.",
    fear: "Watered by fear: licence terms and data residency dictated from another jurisdiction.",
    source: "Euro-Office",
  },
  {
    key: "migrate",
    label: "OFF MICROSOFT",
    date: "2025–26",
    strong: false,
    vigour: 0.66,
    metric: "3 states",
    detail:
      "Denmark, Austria and France are MIGRATING public administrations off Microsoft toward open, sovereign stacks, slow, real, and spreading.",
    fear: "Watered by fear: the CLOUD Act and a single vendor's hand on the off-switch.",
    source: "national digital ministries",
  },
  {
    key: "letta",
    label: "ONE MARKET",
    date: "Apr 2026",
    strong: false,
    vigour: 0.58,
    metric: "Signed",
    detail:
      "Letta's 'One Europe, One Market' roadmap SIGNED, a written, costed plan to finish the single market the continent has half-built for thirty years.",
    fear: "Watered by fear: a productivity gap with the US that stopped being deniable.",
    source: "Letta report",
  },
  {
    key: "siu",
    label: "SAVINGS UNION",
    date: "2025–26",
    strong: false,
    vigour: 0.52,
    metric: "SIU",
    detail:
      "The Savings & Investments Union measures, the first concrete moves to keep ~€300bn of European savings working in Europe rather than wired abroad.",
    fear: "Watered by fear: a generation's pensions financing someone else's frontier.",
    source: "European Commission",
  },
  {
    key: "europa",
    label: "EUROPA · 24 LANGS",
    date: "2025–26",
    strong: false,
    vigour: 0.46,
    metric: "24 langs",
    detail:
      "EUROPA, an open-source model covering all 24 EU languages, the smallest shoot, but the one that says sovereignty can be open, not walled.",
    fear: "Watered by fear: a frontier of intelligence that spoke everyone's language but Europe's.",
    source: "EU open-source initiative",
  },
]

const STRONG = SHOOTS.filter((s) => s.strong).length

// Plot frame (viewBox units).
const W = 920
const H = 560
const SOIL_Y = 430 // the dark soil-line the shoots break through
const FIELD_X0 = 60
const FIELD_X1 = W - 40
const MAX_RISE = 300 // tallest shoot rises this far above the soil-line
const colX = (i: number) =>
  lerp(FIELD_X0 + 32, FIELD_X1 - 32, SHOOTS.length === 1 ? 0.5 : i / (SHOOTS.length - 1))

// A leaf, drawn around the tip of a stem and mirrored left/right.
function leafPath(len: number, dir: number): string {
  const w = len * 0.42
  return `M 0 0 Q ${dir * w} ${-len * 0.34} ${dir * len * 0.18} ${-len} Q ${dir * w * 0.3} ${-len * 0.46} 0 0 Z`
}

export function GreenShoots() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // The epoch toggle. Default: the hopeful, current state.
  const [sprouting, setSprouting] = useState(true)
  // Default selection = the tallest shoot (the strongest beat).
  const [active, setActive] = useState<string>("rearm")
  const cur = SHOOTS.find((s) => s.key === active) ?? SHOOTS[0]

  // Grow sweep 0 → 1 whenever we enter the sprouting epoch. Reduced → snaps.
  const [grow, setGrow] = useState(reduced ? 1 : 0)
  useEffect(() => {
    if (!sprouting) {
      setGrow(0)
      return
    }
    if (reduced) {
      setGrow(1)
      return
    }
    let raf = 0
    const start = performance.now()
    const dur = 1400
    const tick = (now: number) => {
      const k = clamp01((now - start) / dur)
      setGrow(easeOut(k))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    setGrow(0)
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [sprouting, reduced])

  // Signs of life counted: shoots that have broken the soil-line this epoch.
  const live = sprouting ? Math.round(SHOOTS.length * clamp01(grow)) : 0
  const soil = mode === "dark" ? "#1c1408" : "#2a1d0c"

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V42 · The Green Shoots"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: sprouting ? p.wonderHi : p.squeeze }}
        >
          {live}/{SHOOTS.length} SIGNS OF LIFE
        </span>
      }
      caption={
        <>
          A field of <span style={{ color: p.wonderHi }}>green shoots</span>, every one a real, dated sign of
          life. The <span style={{ color: p.wonderHi }}>tallest</span>, in full gold, are load-bearing; the{" "}
          <span style={{ color: p.wonder }}>amber</span> ones are early and fragile. Hover or click any shoot for
          the story, and the <span style={{ color: p.squeeze }}>fear</span> that watered it. Flip the field to{" "}
          <span style={{ color: p.squeeze }}>2015–2024</span> and watch it go dormant: a decade of reports that
          never broke ground. Sources: German MoD; Euro-Office; TechCrunch (Mistral, Jun 2026); European
          Commission; Letta report.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`A field of eight real European signs of life, dated 2025–2026, sprouting from a dark soil-line: ReArm Europe (~€800bn), Mistral ($400M ARR), Germany's rejection of Palantir, the Euro-Office launch, Denmark/Austria/France migrating off Microsoft, Letta's One Market roadmap, the Savings & Investments Union, and the EUROPA open-source model. Flipped to the 2015–2024 epoch the field is dormant, none broke ground. ${
          sprouting
            ? `${live} of ${SHOOTS.length} shoots have broken the soil.`
            : "The field is dormant; a decade of reports that never broke ground."
        }`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="gs-dawn" cx="50%" cy="100%" r="90%">
            <stop offset="0%" stopColor={p.wonderHi} stopOpacity={sprouting ? (mode === "dark" ? 0.16 : 0.1) : 0} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="gs-stem" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={p.wonder} stopOpacity={0.55} />
            <stop offset="100%" stopColor={p.wonderHi} stopOpacity={1} />
          </linearGradient>
        </defs>

        {/* a low dawn glow rising from the soil-line in the sprouting epoch */}
        <rect x={0} y={SOIL_Y - MAX_RISE} width={W} height={MAX_RISE + 60} fill="url(#gs-dawn)" />

        {/* schematic field gridlines — faint blueprint hairlines */}
        {[0.33, 0.66, 1].map((f) => (
          <line
            key={`grid-${f}`}
            x1={FIELD_X0}
            y1={SOIL_Y - MAX_RISE * f}
            x2={FIELD_X1}
            y2={SOIL_Y - MAX_RISE * f}
            stroke={p.blueprint}
            strokeWidth={1}
            strokeDasharray="2 8"
          />
        ))}

        {/* THE SOIL-LINE — the dark earth the shoots must break through */}
        <rect x={FIELD_X0 - 8} y={SOIL_Y} width={FIELD_X1 - FIELD_X0 + 16} height={48} rx={6} fill={soil} />
        <line x1={FIELD_X0 - 8} y1={SOIL_Y} x2={FIELD_X1 + 8} y2={SOIL_Y} stroke={p.wonder} strokeWidth={1.4} strokeOpacity={0.5} />
        <text x={FIELD_X0} y={SOIL_Y + 30} fill={rgba(p.glowRGB, 0.7)} style={{ fontSize: 11.5, letterSpacing: "0.22em" }}>
          {sprouting ? "2025–2026 · THE GROUND BREAKS" : "2015–2024 · BARREN, REPORTS FILED, SHELVED"}
        </text>

        {/* THE SHOOTS */}
        {SHOOTS.map((s, i) => {
          const x = colX(i)
          const isActive = active === s.key
          // height this shoot reaches this epoch.
          const rise = sprouting ? MAX_RISE * s.vigour * clamp01(grow) : 0
          const tipY = SOIL_Y - rise
          const stemColor = s.strong ? p.wonderHi : p.wonder
          const leafLen = lerp(8, 26, s.vigour) * (sprouting ? clamp01(grow) : 0)

          // Dormant epoch: a stunted RED stub that never broke ground.
          if (!sprouting) {
            return (
              <g
                key={s.key}
                role="button"
                tabIndex={0}
                aria-label={`${s.label} (${s.date}), dormant in 2015–2024: this sign of life had not yet broken ground.`}
                onMouseEnter={() => setActive(s.key)}
                onFocus={() => setActive(s.key)}
                onClick={() => setActive(s.key)}
                style={{ cursor: "pointer", outline: "none" }}
              >
                {/* a buried seed below the soil — fear, not yet acted on */}
                <line x1={x} y1={SOIL_Y} x2={x} y2={SOIL_Y - (isActive ? 16 : 9)} stroke={p.squeeze} strokeWidth={isActive ? 2.4 : 1.6} strokeLinecap="round" strokeOpacity={isActive ? 0.95 : 0.6} />
                <circle cx={x} cy={SOIL_Y + 24} r={isActive ? 4 : 3} fill={p.squeeze} fillOpacity={isActive ? 0.9 : 0.5} />
                <text x={x} y={SOIL_Y - (isActive ? 24 : 17)} textAnchor="middle" fill={isActive ? p.squeezeHi : p.soft} style={{ fontSize: 9.5, letterSpacing: "0.06em" }}>
                  {s.date}
                </text>
              </g>
            )
          }

          return (
            <g
              key={s.key}
              role="button"
              tabIndex={0}
              aria-label={`${s.label} (${s.date}): ${s.detail} ${s.fear}`}
              onMouseEnter={() => setActive(s.key)}
              onFocus={() => setActive(s.key)}
              onClick={() => setActive(s.key)}
              style={{ cursor: "pointer", outline: "none" }}
            >
              {/* glow halo behind the focused shoot */}
              {isActive && rise > 6 && (
                <circle cx={x} cy={tipY} r={26} fill={p.wonderHi} fillOpacity={mode === "dark" ? 0.16 : 0.1} />
              )}

              {/* the stem rising out of the soil */}
              <path
                d={`M ${x} ${SOIL_Y} C ${x - 6} ${SOIL_Y - rise * 0.45} ${x + 6} ${SOIL_Y - rise * 0.7} ${x} ${tipY}`}
                fill="none"
                stroke="url(#gs-stem)"
                strokeWidth={isActive ? 3.4 : s.strong ? 2.6 : 1.9}
                strokeLinecap="round"
                opacity={isActive ? 1 : 0.9}
              />

              {/* a pair of leaves near the tip */}
              {rise > 18 && (
                <g transform={`translate(${x} ${tipY + leafLen * 0.5})`}>
                  <path d={leafPath(leafLen, -1)} fill={stemColor} fillOpacity={isActive ? 0.95 : 0.72} />
                  <path d={leafPath(leafLen, 1)} fill={stemColor} fillOpacity={isActive ? 0.95 : 0.72} />
                </g>
              )}

              {/* the bud/bloom at the very tip — GOLD for strong, amber for early */}
              <circle cx={x} cy={tipY} r={s.strong ? (isActive ? 7 : 5.4) : isActive ? 5.4 : 4} fill={stemColor} stroke={p.bg} strokeWidth={1} />
              {s.strong && (
                <circle cx={x} cy={tipY} r={isActive ? 12 : 9} fill="none" stroke={p.wonderHi} strokeOpacity={0.45} strokeWidth={1} />
              )}

              {/* the field tag + date, on the stem */}
              {rise > 24 && (
                <>
                  <text
                    x={x}
                    y={tipY - 16}
                    textAnchor="middle"
                    fill={isActive ? p.wonderHi : p.muted}
                    style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em" }}
                  >
                    {s.label}
                  </text>
                  <text x={x} y={tipY - 28} textAnchor="middle" fill={p.soft} style={{ fontSize: 9.5, letterSpacing: "0.08em" }}>
                    {s.date}
                  </text>
                </>
              )}
            </g>
          )
        })}

        {/* ===== READOUT — the focused shoot's story + the fear behind it ===== */}
        {(() => {
          const px = FIELD_X1 - 330
          const pw = 330
          const py = 24
          const ph = 188
          const live2 = sprouting
          return (
            <g>
              <rect
                x={px}
                y={py}
                width={pw}
                height={ph}
                rx={12}
                fill={p.hair}
                stroke={live2 ? p.wonder : p.squeeze}
                strokeWidth={1.3}
              />
              <text x={px + 18} y={py + 26} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.2em" }}>
                {live2 ? (cur.strong ? "LOAD-BEARING SHOOT" : "EARLY SHOOT") : "DORMANT · NOT YET BROKEN GROUND"}
              </text>
              <text x={px + 18} y={py + 50} fill={live2 ? (cur.strong ? p.wonderHi : p.wonder) : p.squeeze} style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.02em" }}>
                {cur.label}
              </text>
              <text x={px + pw - 18} y={py + 50} textAnchor="end" fill={p.soft} style={{ fontSize: 11 }}>
                {cur.date}
              </text>

              <text x={px + 18} y={py + 92} fill={live2 ? (cur.strong ? p.wonderHi : p.wonder) : p.squeeze} style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em" }}>
                {cur.metric}
              </text>

              {wrapText(cur.detail, 42).slice(0, 3).map((line, k) => (
                <text key={`det-${k}`} x={px + 18} y={py + 116 + k * 16} fill={p.muted} style={{ fontSize: 11.5, fontFamily: "var(--font-serif), serif" }}>
                  {line}
                </text>
              ))}
            </g>
          )
        })()}

        {/* the fear-not-foresight line under the soil, tied to the focused shoot */}
        <text x={FIELD_X0} y={H - 14} fill={sprouting ? p.squeezeHi : p.soft} style={{ fontSize: 11, fontFamily: "var(--font-serif), serif", fontStyle: "italic" }}>
          {sprouting ? cur.fear : "A decade of foresight on paper. Not one shoot broke the soil."}
        </text>
        <text x={FIELD_X1} y={H - 14} textAnchor="end" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.06em" }}>
          {cur.source}
        </text>
      </svg>

      {/* epoch toggle + signs-of-life meter + verdict */}
      <div className="mt-2 px-1">
        {/* signs-of-life meter — fills GOLD as the field sprouts */}
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: rgba(p.glowRGB, 0.16) }} aria-hidden>
          <div
            style={{
              width: `${(sprouting ? clamp01(grow) : 0) * 100}%`,
              height: "100%",
              background: sprouting ? mixHex(p.wonder, p.wonderHi, 0.5) : p.squeeze,
              transition: reduced ? "none" : "width 700ms ease-out",
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Toggle the field between the 2015–2024 dormant epoch and the 2025–2026 sprouting epoch"
            className="inline-flex overflow-hidden rounded-lg"
            style={{ border: `1px solid ${p.border}` }}
          >
            <button
              type="button"
              onClick={() => setSprouting(false)}
              aria-pressed={!sprouting}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11.5,
                padding: "5px 12px",
                cursor: "pointer",
                color: sprouting ? p.soft : p.squeezeHi,
                background: sprouting ? "transparent" : rgba(p.glowRGB, 0.1),
                border: "none",
              }}
            >
              2015–2024 · dormant
            </button>
            <button
              type="button"
              onClick={() => setSprouting(true)}
              aria-pressed={sprouting}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11.5,
                padding: "5px 12px",
                cursor: "pointer",
                color: sprouting ? p.wonderHi : p.soft,
                background: sprouting ? rgba(p.glowRGB, 0.12) : "transparent",
                border: "none",
                borderLeft: `1px solid ${p.border}`,
              }}
            >
              2025–2026 · sprouting
            </button>
          </div>

          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: sprouting ? p.wonderHi : p.soft, fontSize: 11, whiteSpace: "nowrap" }}
          >
            {live}/{SHOOTS.length} signs of life · {STRONG} load-bearing
          </span>
        </div>

        <p
          className="mt-3 text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: sprouting ? p.wonderHi : p.squeeze, fontStyle: "normal", fontWeight: 700 }}>
            {sprouting ? "The ground is breaking" : "A decade dormant"}
          </span>{" "}
, the continent that spent ten years managing its decline has, in eighteen months, haltingly and
          unevenly but unmistakably, begun to fight back. Every shoot watered by fear, not foresight.
        </p>
      </div>
    </PlateFrame>
  )
}

// Naive width-budget word-wrap for the in-SVG readout copy. ~`max` chars/line.
function wrapText(s: string, max: number): string[] {
  const words = s.split(" ")
  const lines: string[] = []
  let line = ""
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      if (line) lines.push(line)
      line = w
    } else {
      line = (line + " " + w).trim()
    }
  }
  if (line) lines.push(line)
  return lines
}
