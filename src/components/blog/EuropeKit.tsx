"use client"

/**
 * EuropeKit — self-contained dark "economic instrument" panels for the
 * dispatch "The Two Europes."
 *
 * These deliberately do NOT use the theme-aware read-chart-kit: they are
 * dark glass panels (the REAL AI house style) that read as intentional on
 * both the light cream and the dark navy Read backgrounds, and keep visual
 * continuity with the world-economy charts.
 *
 * The metric throughout is GDP per capita in PPS, indexed to the EU average
 * (EU = 100). The *story* is the change from 2004 to 2024: the East converges
 * up, much of the West/South slips back relative to the mean.
 *
 * Data (source-pinned, see the essay's "Sources and notes"):
 *  - Eurostat tec00114, GDP per capita in PPS (EU = 100), 2004 and 2024
 *    (2024 = preliminary PPP estimate, publ. Mar 2025).
 *  - CEE convergence 43% → 69% of the EU average, 2004 → 2023 (EC / Bruegel).
 *  Anchor years are pinned; intermediate years on the scissor are interpolated
 *  along the documented trajectory and are indicative.
 *
 * No external deps. SSR-safe (useId for gradient/scope ids; no Math.random,
 * no window at module scope). Hover is pointer-driven; everything renders
 * statically without JS so it survives SSR and reduced-motion.
 */

import { useState, type ReactNode } from "react"

/* ---------------------------------------------------------------- palette */
const BG1 = "#0f1830"
const BG2 = "#13203c"
const INK = "#e9edf7"
const MUTED = "#98a2bd"
const FAINT = "#5e6b85"
const HAIR = "rgba(255,255,255,0.09)"
const HAIR_STRONG = "rgba(255,255,255,0.22)"

const RISE = "#2ee6a6" // East / converging up
const FALL = "#ef4b54" // West-South / slipping back
const CORE = "#6ea8fe" // core-West reference blue
const SOUTH = "#f0a24b" // southern bloc amber

/* diverging colour for a change-in-index (percentage-point) value */
function deltaColor(d: number): string {
  if (d >= 25) return "#12c98e"
  if (d >= 12) return "#2ee6a6"
  if (d >= 3) return "#74e3bf"
  if (d > -3) return "#5b6781" // ~flat, neutral slate
  if (d > -10) return "#f0a07a"
  if (d > -20) return "#ee6a5e"
  return "#e5484d"
}

/* ---------------------------------------------------------------- data */
type Bloc = "east" | "core" | "south" | "nordic" | "na"

interface Country {
  code: string
  name: string
  bloc: Bloc
  /** GDP/capita in PPS, EU=100, 2004 */
  a: number
  /** GDP/capita in PPS, EU=100, 2024 (prelim) */
  b: number
  /** tile-grid position (row, col), 1-indexed, north→south / west→east */
  r: number
  c: number
  note?: string
}

// a/b = 0 marks a non-EU tile (no EU=100 series) — drawn neutral on the map.
const C: Country[] = [
  // northern tier
  { code: "IS", name: "Iceland", bloc: "na", a: 0, b: 0, r: 1, c: 1 },
  { code: "NO", name: "Norway", bloc: "na", a: 0, b: 0, r: 1, c: 5 },
  { code: "SE", name: "Sweden", bloc: "nordic", a: 126, b: 119, r: 1, c: 6 },
  { code: "FI", name: "Finland", bloc: "nordic", a: 116, b: 109, r: 1, c: 7 },
  // row 2
  { code: "IE", name: "Ireland", bloc: "core", a: 143, b: 211, r: 2, c: 1, note: "Distorted by multinational profit-shifting · treat with care." },
  { code: "GB", name: "United Kingdom", bloc: "na", a: 0, b: 0, r: 2, c: 2 },
  { code: "NL", name: "Netherlands", bloc: "core", a: 133, b: 130, r: 2, c: 4 },
  { code: "DK", name: "Denmark", bloc: "nordic", a: 126, b: 137, r: 2, c: 5 },
  { code: "EE", name: "Estonia", bloc: "east", a: 57, b: 80, r: 2, c: 7 },
  // row 3
  { code: "BE", name: "Belgium", bloc: "core", a: 121, b: 118, r: 3, c: 3 },
  { code: "DE", name: "Germany", bloc: "core", a: 117, b: 114, r: 3, c: 5 },
  { code: "PL", name: "Poland", bloc: "east", a: 51, b: 80, r: 3, c: 6 },
  { code: "LV", name: "Latvia", bloc: "east", a: 50, b: 71, r: 3, c: 7 },
  // row 4
  { code: "LU", name: "Luxembourg", bloc: "core", a: 253, b: 240, r: 4, c: 4, note: "Inflated by cross-border commuters in the denominator." },
  { code: "CZ", name: "Czechia", bloc: "east", a: 79, b: 91, r: 4, c: 5 },
  { code: "SK", name: "Slovakia", bloc: "east", a: 57, b: 73, r: 4, c: 6 },
  { code: "LT", name: "Lithuania", bloc: "east", a: 53, b: 89, r: 4, c: 7 },
  // row 5
  { code: "FR", name: "France", bloc: "core", a: 111, b: 99, r: 5, c: 2 },
  { code: "CH", name: "Switzerland", bloc: "na", a: 0, b: 0, r: 5, c: 4 },
  { code: "AT", name: "Austria", bloc: "core", a: 127, b: 111, r: 5, c: 5 },
  { code: "HU", name: "Hungary", bloc: "east", a: 63, b: 76, r: 5, c: 6 },
  { code: "RO", name: "Romania", bloc: "east", a: 35, b: 78, r: 5, c: 7 },
  // row 6
  { code: "PT", name: "Portugal", bloc: "south", a: 80, b: 83, r: 6, c: 1 },
  { code: "ES", name: "Spain", bloc: "south", a: 101, b: 92, r: 6, c: 2 },
  { code: "IT", name: "Italy", bloc: "south", a: 108, b: 97, r: 6, c: 4 },
  { code: "SI", name: "Slovenia", bloc: "east", a: 87, b: 93, r: 6, c: 5 },
  { code: "HR", name: "Croatia", bloc: "east", a: 57, b: 76, r: 6, c: 6, note: "2004 figure is the earliest comparable estimate; joined the EU in 2013." },
  { code: "BG", name: "Bulgaria", bloc: "east", a: 35, b: 66, r: 6, c: 8 },
  // row 7 — south islands
  { code: "MT", name: "Malta", bloc: "south", a: 83, b: 102, r: 7, c: 4 },
  { code: "EL", name: "Greece", bloc: "south", a: 97, b: 70, r: 7, c: 7 },
  { code: "CY", name: "Cyprus", bloc: "south", a: 93, b: 98, r: 7, c: 9 },
]

const fmtSigned = (n: number) => (n > 0 ? `+${n}` : `${n}`)

/* ---------------------------------------------------------------- chrome */
function Panel({
  kicker,
  title,
  sub,
  children,
  caption,
}: {
  kicker?: string
  title: string
  sub?: string
  children: ReactNode
  caption?: ReactNode
}) {
  return (
    <figure
      style={{
        margin: "34px 0",
        padding: "20px 18px 16px",
        borderRadius: 16,
        background: `linear-gradient(180deg, ${BG1}, ${BG2})`,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 24px 60px -30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
        color: INK,
        fontFamily:
          'var(--font-sans), "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        fontFeatureSettings: '"tnum" 1',
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {kicker ? (
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#7f9bff",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          {kicker}
        </div>
      ) : null}
      <h3
        style={{
          margin: 0,
          fontFamily: 'var(--font-display), "Gloock", "Fraunces", serif',
          fontSize: "1.22rem",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
          color: INK,
        }}
      >
        {title}
      </h3>
      {sub ? (
        <p style={{ margin: "5px 0 0", fontSize: "0.84rem", color: MUTED }}>
          {sub}
        </p>
      ) : null}
      <div style={{ marginTop: 14 }}>{children}</div>
      {caption ? (
        <figcaption
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: `1px solid ${HAIR}`,
            fontSize: "0.82rem",
            lineHeight: 1.5,
            color: MUTED,
          }}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

/* ============================================================== MAP TILES */
export function EuropeConvergenceMap() {
  const [hov, setHov] = useState<number | null>(null)

  const CELL = 94
  const TILE = 82
  const INSET = (CELL - TILE) / 2
  const cols = 9
  const rows = 7
  const ox = 8
  const oy = 8
  const W = ox * 2 + cols * CELL
  const gridH = rows * CELL
  const legendH = 56
  const H = oy + gridH + legendH

  const x = (c: number) => ox + (c - 1) * CELL
  const y = (r: number) => oy + (r - 1) * CELL

  const legendStops = [
    { d: -27, l: "−20" },
    { d: -14, l: "−10" },
    { d: 0, l: "0" },
    { d: 8, l: "+10" },
    { d: 18, l: "+20" },
    { d: 30, l: "+40" },
  ]

  const hc = hov != null ? C[hov] : null

  return (
    <Panel
      kicker="GDP per capita vs the EU average · 2004 → 2024"
      title="One continent, two directions"
      sub="Change in GDP per capita (PPS, EU = 100), in percentage points. Green converged up; red slipped back."
      caption={
        <>
          Each tile is a country, placed roughly geographically. Colour is the{" "}
          <b style={{ color: INK }}>change in position</b> relative to the EU
          average between 2004 and 2024, not the level. The East climbs toward
          the mean; France, Italy, Spain and especially Greece fall away from
          it. Ireland and Luxembourg are flagged: their headline figures are
          distorted by multinational accounting and cross-border labour.
        </>
      }
    >
      <div style={{ position: "relative" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Tile map of Europe: change in GDP per capita relative to the EU average, 2004 to 2024"
          style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}
        >
          {C.map((co, i) => {
            const isNA = co.a === 0 && co.b === 0
            const d = co.b - co.a
            const fill = isNA ? "#222d49" : deltaColor(d)
            const active = hov === i
            const tx = x(co.c) + INSET
            const ty = y(co.r) + INSET
            return (
              <g
                key={co.code}
                onPointerEnter={() => setHov(i)}
                onPointerLeave={() => setHov((h) => (h === i ? null : h))}
                style={{ cursor: isNA ? "default" : "pointer" }}
              >
                <rect
                  x={tx}
                  y={ty}
                  width={TILE}
                  height={TILE}
                  rx={12}
                  fill={fill}
                  fillOpacity={isNA ? 0.5 : 0.92}
                  stroke={active ? "#fff" : "rgba(8,12,24,0.55)"}
                  strokeWidth={active ? 2 : 1}
                />
                <text
                  x={tx + TILE / 2}
                  y={ty + 34}
                  textAnchor="middle"
                  fontSize={20}
                  fontWeight={700}
                  fill={isNA ? "#7d88a6" : "#0c1220"}
                  style={{ pointerEvents: "none" }}
                >
                  {co.code}
                </text>
                {!isNA && (
                  <text
                    x={tx + TILE / 2}
                    y={ty + 58}
                    textAnchor="middle"
                    fontSize={15}
                    fontWeight={700}
                    fill="#0c1220"
                    fillOpacity={0.82}
                    style={{ pointerEvents: "none" }}
                  >
                    {fmtSigned(d)}
                  </text>
                )}
                {co.note && !isNA && (
                  <text
                    x={tx + TILE - 8}
                    y={ty + 16}
                    textAnchor="end"
                    fontSize={13}
                    fontWeight={700}
                    fill="#0c1220"
                    fillOpacity={0.7}
                    style={{ pointerEvents: "none" }}
                  >
                    *
                  </text>
                )}
              </g>
            )
          })}

          {/* legend */}
          <g transform={`translate(${ox}, ${oy + gridH + 16})`}>
            <text x={0} y={-2} fontSize={12} fill={MUTED} fontWeight={600}>
              slipped back
            </text>
            <text
              x={cols * CELL - ox * 2}
              y={-2}
              fontSize={12}
              fill={MUTED}
              fontWeight={600}
              textAnchor="end"
            >
              converged up
            </text>
            {legendStops.map((s, i) => {
              const segW = (cols * CELL - ox * 2) / legendStops.length
              return (
                <g key={i} transform={`translate(${i * segW}, 6)`}>
                  <rect
                    x={0}
                    y={0}
                    width={segW - 4}
                    height={12}
                    rx={3}
                    fill={deltaColor(s.d)}
                    fillOpacity={0.92}
                  />
                  <text x={0} y={28} fontSize={11} fill={FAINT}>
                    {s.l}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>

        {/* hover readout */}
        <div
          aria-hidden
          style={{
            minHeight: 44,
            marginTop: 6,
            padding: hc ? "9px 12px" : 0,
            borderRadius: 10,
            border: hc ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
            background: hc ? "rgba(8,14,30,0.6)" : "transparent",
            transition: "background .15s, border-color .15s",
          }}
        >
          {hc ? (
            hc.a === 0 ? (
              <span style={{ fontSize: "0.86rem", color: MUTED }}>
                <b style={{ color: INK }}>{hc.name}</b>, outside the EU index
                (no EU = 100 series).
              </span>
            ) : (
              <span style={{ fontSize: "0.88rem", color: INK }}>
                <b>{hc.name}</b>{" "}
                <span style={{ color: MUTED }}>
                  · {hc.a} → {hc.b} vs EU 100 ·{" "}
                </span>
                <b style={{ color: deltaColor(hc.b - hc.a) }}>
                  {fmtSigned(hc.b - hc.a)} pp
                </b>
                {hc.note ? (
                  <span style={{ color: FAINT }}> · {hc.note}</span>
                ) : null}
              </span>
            )
          ) : (
            <span style={{ fontSize: "0.84rem", color: FAINT }}>
              Hover a country for its 2004 → 2024 path. Grey = non-EU.{" "}
              <span style={{ opacity: 0.8 }}>* accounting caveat.</span>
            </span>
          )}
        </div>
      </div>
    </Panel>
  )
}

/* ============================================================ MOVERS (dumbbell) */
export function EuropeMovers() {
  // EU-27 minus the two distorted outliers (LU, IE), sorted by Δ descending.
  const rows = C.filter(
    (co) => co.bloc !== "na" && co.code !== "LU" && co.code !== "IE",
  ).sort((p, q) => q.b - q.a - (p.b - p.a))

  const W = 900
  const rowH = 23
  const padL = 116
  const padR = 92
  const padT = 30
  const padB = 30
  const H = padT + padB + rows.length * rowH
  const plotW = W - padL - padR
  const xmin = 30
  const xmax = 145
  const xv = (v: number) => padL + ((v - xmin) / (xmax - xmin)) * plotW

  const blocLabel: Record<Bloc, string> = {
    east: "Central & Eastern",
    south: "Southern",
    core: "Core West",
    nordic: "Nordic",
    na: "",
  }

  return (
    <Panel
      kicker="Who moved · GDP per capita, EU = 100"
      title="The risers and the fallers, ranked"
      sub="Each line runs from 2004 (hollow) to 2024 (solid). Green rose toward or past the EU average; red fell away from it."
      caption={
        <>
          Sorted by the size of the move. Every one of the eleven biggest
          gainers is a 2004-or-later member from the East; every faller is in
          the West or South. The vertical line is the EU average (100).
          Luxembourg and Ireland are omitted, their numbers are accounting
          artefacts, not living standards.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Ranked change in GDP per capita relative to the EU average, by country, 2004 to 2024"
        style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}
      >
        {/* EU average reference */}
        <line
          x1={xv(100)}
          y1={padT - 10}
          x2={xv(100)}
          y2={H - padB + 4}
          stroke={HAIR_STRONG}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text x={xv(100)} y={padT - 16} textAnchor="middle" fontSize={11} fill={MUTED} fontWeight={600}>
          EU average = 100
        </text>
        {[40, 60, 80, 120, 140].map((v) => (
          <text key={v} x={xv(v)} y={H - padB + 18} textAnchor="middle" fontSize={10} fill={FAINT}>
            {v}
          </text>
        ))}

        {rows.map((co, i) => {
          const cy = padT + i * rowH + rowH / 2
          const d = co.b - co.a
          const col = d >= 0 ? RISE : FALL
          const x0 = xv(co.a)
          const x1 = xv(co.b)
          return (
            <g key={co.code}>
              <text x={padL - 12} y={cy + 4} textAnchor="end" fontSize={12.5} fill={INK} fontWeight={600}>
                {co.name}
              </text>
              <text x={8} y={cy + 4} fontSize={9.5} fill={FAINT} letterSpacing="0.04em">
                {blocLabel[co.bloc].toUpperCase()}
              </text>
              {/* connector */}
              <line x1={x0} y1={cy} x2={x1} y2={cy} stroke={col} strokeWidth={2.4} strokeOpacity={0.55} />
              {/* 2004 hollow */}
              <circle cx={x0} cy={cy} r={4} fill={BG1} stroke={col} strokeWidth={2} />
              {/* 2024 solid + direction */}
              <circle cx={x1} cy={cy} r={5} fill={col} />
              {/* value at the 2024 end */}
              <text
                x={x1 + (d >= 0 ? 10 : -10)}
                y={cy + 4}
                textAnchor={d >= 0 ? "start" : "end"}
                fontSize={11.5}
                fontWeight={700}
                fill={col}
              >
                {fmtSigned(d)}
              </text>
            </g>
          )
        })}
      </svg>
    </Panel>
  )
}

/* ============================================================ SCISSOR (lines) */
export function EuropeScissor() {
  // Bloc averages of GDP/capita in PPS (EU=100); anchors pinned, midpoints
  // interpolated along the documented trajectory (see notes).
  const YEARS = [2004, 2009, 2014, 2019, 2024]
  const SER = [
    { key: "core", name: "Core West", color: CORE, v: [122, 120, 117, 116, 115] },
    { key: "south", name: "South", color: SOUTH, v: [97, 93, 83, 85, 86] },
    { key: "east", name: "East", color: RISE, v: [48, 58, 65, 73, 80] },
  ]

  const W = 900
  const H = 380
  const padL = 44
  const padR = 96
  const padT = 28
  const padB = 40
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const ymin = 40
  const ymax = 130
  const xv = (yr: number) => padL + ((yr - 2004) / (2024 - 2004)) * plotW
  const yv = (v: number) => padT + (1 - (v - ymin) / (ymax - ymin)) * plotH

  const dOf = (arr: number[]) =>
    arr.map((v, i) => `${i ? "L" : "M"}${xv(YEARS[i]).toFixed(1)} ${yv(v).toFixed(1)}`).join(" ")

  return (
    <Panel
      kicker="Convergence · GDP per capita, EU = 100"
      title="The scissor: the East climbs as the South sinks"
      sub="Bloc averages, 2004–2024. The single biggest peaceful income convergence in modern Europe, and a Southern stall underneath it."
      caption={
        <>
          <b style={{ color: RISE }}>East</b> = the 2004/2007/2013 entrants
          (Poland, the Baltics, Romania, Bulgaria, Czechia, Slovakia, Hungary,
          Croatia, Slovenia). <b style={{ color: SOUTH }}>South</b> = Italy,
          Spain, Greece, Portugal. <b style={{ color: CORE }}>Core West</b> =
          Germany, France, the Netherlands, Belgium, Austria. The East nearly
          doubled its position; the South ended below where it started.
          Midpoints are interpolated between pinned anchors.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Convergence of bloc-average GDP per capita relative to the EU average, 2004 to 2024"
        style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}
      >
        {[40, 60, 80, 100, 120].map((v) => (
          <g key={v}>
            <line
              x1={padL}
              y1={yv(v)}
              x2={padL + plotW}
              y2={yv(v)}
              stroke={v === 100 ? HAIR_STRONG : HAIR}
              strokeWidth={1}
            />
            <text x={padL - 8} y={yv(v) + 4} textAnchor="end" fontSize={11} fill={FAINT}>
              {v}
            </text>
          </g>
        ))}
        <text x={padL + 4} y={yv(100) - 6} fontSize={11} fill={MUTED} fontWeight={500}>
          EU average
        </text>
        {YEARS.map((yr) => (
          <text key={yr} x={xv(yr)} y={H - padB + 24} textAnchor="middle" fontSize={11} fill={FAINT}>
            {yr}
          </text>
        ))}

        {SER.map((s) => (
          <g key={s.key}>
            <path
              d={dOf(s.v)}
              fill="none"
              stroke={s.color}
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {s.v.map((v, i) => (
              <circle key={i} cx={xv(YEARS[i])} cy={yv(v)} r={3.2} fill={s.color} />
            ))}
            <text
              x={padL + plotW + 10}
              y={yv(s.v[s.v.length - 1]) + 4}
              fontSize={13}
              fontWeight={700}
              fill={s.color}
            >
              {s.name}
            </text>
            <text
              x={padL + plotW + 10}
              y={yv(s.v[s.v.length - 1]) + 19}
              fontSize={11}
              fontWeight={600}
              fill={s.color}
              fillOpacity={0.85}
            >
              {s.v[s.v.length - 1]}
            </text>
          </g>
        ))}
      </svg>
    </Panel>
  )
}

/* ============================================================ STAT CHIPS */
export function EuropeChips() {
  const chips = [
    { big: "43 → 69", unit: "% of EU avg", lab: "Central & Eastern Europe's GDP per capita, 2004 → 2023", color: RISE },
    { big: "+43 pp", unit: "Romania", lab: "biggest single climb toward the EU average since 2004", color: RISE },
    { big: "−27 pp", unit: "Greece", lab: "steepest fall relative to the EU average over the same span", color: FALL },
    { big: "~0%", unit: "Italy, since 2000", lab: "real GDP per capita growth, the only large advanced economy to go backwards", color: SOUTH },
  ]
  return (
    <figure
      style={{
        margin: "30px 0",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
        fontFamily: 'var(--font-sans), "Inter", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {chips.map((c, i) => (
        <div
          key={i}
          style={{
            background: `linear-gradient(180deg, ${BG1}, ${BG2})`,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: "16px 16px 14px",
            boxShadow: "0 18px 44px -28px rgba(0,0,0,0.7)",
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display), "Gloock", "Fraunces", serif',
              fontSize: "1.6rem",
              fontWeight: 600,
              lineHeight: 1,
              color: c.color,
              fontFeatureSettings: '"tnum" 1',
            }}
          >
            {c.big}
          </div>
          <div style={{ fontSize: "0.74rem", color: INK, fontWeight: 600, marginTop: 6, letterSpacing: "0.02em" }}>
            {c.unit}
          </div>
          <div style={{ fontSize: "0.76rem", color: MUTED, lineHeight: 1.4, marginTop: 6 }}>
            {c.lab}
          </div>
        </div>
      ))}
    </figure>
  )
}
