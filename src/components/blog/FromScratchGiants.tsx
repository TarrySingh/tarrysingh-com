"use client"

/**
 * V34 — THE GIANT FACTORY (the "from-scratch giants" bubble map).
 *
 * A reconstruction of the widely-shared chart: public, from-scratch companies
 * under 50 years old with a $10bn+ valuation, area ∝ value, grouped by region.
 * The US mints hundreds; "<50 years old" quietly disqualifies most of Europe's
 * champions (SAP 1972, the luxury and industrial houses), leaving a handful.
 *
 * Toggle to "The next wave" and the same machine runs again: the new AI / space
 * / defence cohort is, once more, almost entirely American — with China the
 * other pole — while Europe's next generation is a rounding error.
 *
 * Honesty: public = solid (market cap, ~2024); private = ringed (last funding
 * round). Figures are approximate and labelled as such. SpaceX is shown at its
 * documented ~$350bn private valuation. After the 2024 "from-scratch" chart.
 */

import { useMemo, useRef, useState } from "react"

import { PlateFrame, useReadMode } from "./read-chart-kit"
import { cpPalette } from "./chokepoint-kit"

type Co = { name: string; v: number; priv?: boolean }

// Approximate values in $bn. Founded from scratch, < 50 years old, $10bn+.
const US_2024: Co[] = [
  { name: "Apple", v: 3400 }, { name: "Nvidia", v: 3300 }, { name: "Microsoft", v: 3100 },
  { name: "Alphabet", v: 2100 }, { name: "Amazon", v: 1900 }, { name: "Meta", v: 1300 },
  { name: "Broadcom", v: 820 }, { name: "Tesla", v: 780 }, { name: "UnitedHealth", v: 520 },
  { name: "Home Depot", v: 400 }, { name: "Costco", v: 400 }, { name: "Oracle", v: 380 },
  { name: "Netflix", v: 360 }, { name: "Salesforce", v: 320 }, { name: "T-Mobile", v: 250 },
  { name: "Adobe", v: 230 }, { name: "ServiceNow", v: 200 }, { name: "Qualcomm", v: 190 },
  { name: "Blackstone", v: 190 }, { name: "Intuitive", v: 180 }, { name: "Booking", v: 170 },
  { name: "Uber", v: 160 }, { name: "BlackRock", v: 150 }, { name: "Micron", v: 110 },
  { name: "Palantir", v: 95 }, { name: "Airbnb", v: 90 },
]
const EU_2024: Co[] = [
  { name: "ASML", v: 320 }, { name: "Spotify", v: 75 }, { name: "Adyen", v: 50 },
  { name: "argenx", v: 45 }, { name: "Wise", v: 14 }, { name: "Nexi", v: 12 },
  { name: "Just Eat", v: 12 }, { name: "Delivery H.", v: 11 },
]
const US_NEXT: Co[] = [
  { name: "SpaceX", v: 350, priv: true }, { name: "OpenAI", v: 300, priv: true },
  { name: "Anthropic", v: 183, priv: true }, { name: "Stripe", v: 95, priv: true },
  { name: "Databricks", v: 62, priv: true }, { name: "xAI", v: 50, priv: true },
  { name: "Figure", v: 40, priv: true }, { name: "SSI", v: 32, priv: true },
  { name: "Anduril", v: 28, priv: true }, { name: "Scale", v: 14, priv: true },
]
const CN_NEXT: Co[] = [
  { name: "Tencent", v: 400 }, { name: "ByteDance", v: 300, priv: true },
  { name: "Alibaba", v: 200 }, { name: "PDD", v: 150 }, { name: "Meituan", v: 95 },
  { name: "BYD", v: 95 }, { name: "Xiaomi", v: 90 }, { name: "NIO", v: 12 },
]
const EU_NEXT: Co[] = [
  { name: "Mistral", v: 30, priv: true }, { name: "Helsing", v: 16, priv: true },
  { name: "Wayve", v: 10, priv: true }, { name: "Aleph α", v: 5, priv: true },
]

const K = 1.7 // radius = sqrt(value) * K

type Placed = Co & { x: number; y: number; r: number }

function packCluster(cos: Co[], cx: number, cy: number): Placed[] {
  const items = cos
    .map((c) => ({ ...c, r: Math.sqrt(c.v) * K, x: cx, y: cy }))
    .sort((a, b) => b.r - a.r)
  const placed: Placed[] = []
  for (const it of items) {
    if (placed.length === 0) {
      placed.push(it)
      continue
    }
    let best: { x: number; y: number } | null = null
    let bestD = Infinity
    for (const p of placed) {
      const gap = p.r + it.r + 1.4
      for (let a = 0; a < 360; a += 5) {
        const rad = (a * Math.PI) / 180
        const x = p.x + gap * Math.cos(rad)
        const y = p.y + gap * Math.sin(rad)
        let ok = true
        for (const q of placed) {
          const dx = x - q.x
          const dy = y - q.y
          if (dx * dx + dy * dy < (q.r + it.r - 0.6) ** 2) {
            ok = false
            break
          }
        }
        if (!ok) continue
        const d = (x - cx) ** 2 + (y - cy) ** 2
        if (d < bestD) {
          bestD = d
          best = { x, y }
        }
      }
    }
    placed.push({ ...it, x: best ? best.x : cx, y: best ? best.y : cy })
  }
  return placed
}

const fmtT = (bn: number) => "$" + (bn / 1000).toFixed(1) + "t"

export function FromScratchGiants() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const [view, setView] = useState<"now" | "next">("now")
  const next = view === "next"

  const usData = useMemo(() => (next ? [...US_2024, ...US_NEXT] : US_2024), [next])
  const euData = useMemo(() => (next ? [...EU_2024, ...EU_NEXT] : EU_2024), [next])

  const us = useMemo(() => packCluster(usData, 340, 320), [usData])
  const eu = useMemo(() => packCluster(euData, next ? 880 : 870, next ? 165 : 300), [euData, next])
  const cn = useMemo(() => (next ? packCluster(CN_NEXT, 835, 455) : []), [next])

  const usTot = usData.reduce((s, c) => s + c.v, 0)
  const euTot = euData.reduce((s, c) => s + c.v, 0)
  const cnTot = CN_NEXT.reduce((s, c) => s + c.v, 0)
  const ratio = Math.round(usTot / euTot)

  const region = {
    us: { fill: p.leverage, hi: p.leverageHi },
    eu: { fill: p.wonder, hi: p.wonderHi },
    cn: { fill: p.squeeze, hi: p.squeezeHi },
  }

  function Bubbles({ data, tone }: { data: Placed[]; tone: { fill: string; hi: string } }) {
    return (
      <>
        {data.map((c, i) => (
          <g key={c.name + i}>
            <circle
              cx={c.x}
              cy={c.y}
              r={c.r}
              fill={tone.fill}
              fillOpacity={c.priv ? 0.1 : 0.26}
              stroke={c.priv ? tone.hi : tone.fill}
              strokeWidth={c.priv ? 1.4 : 1}
              strokeDasharray={c.priv ? "3 3" : undefined}
            />
            {c.r > 24 && (
              <text
                x={c.x}
                y={c.y + 3}
                textAnchor="middle"
                fill={tone.hi}
                style={{ fontSize: Math.min(13, c.r / 3.4), fontWeight: 700 }}
              >
                {c.name}
              </text>
            )}
          </g>
        ))}
      </>
    )
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V34 · The Giant Factory"
      controls={
        <div className="flex gap-1.5" role="group" aria-label="view">
          {([["now", "Today · 2024"], ["next", "The next wave"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setView(k)}
              aria-pressed={view === k}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                padding: "5px 10px",
                borderRadius: 7,
                cursor: "pointer",
                color: view === k ? p.wonderHi : p.soft,
                border: `1px solid ${view === k ? p.wonder : p.hair}`,
                background: "transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      }
      caption={
        <>
          Public, from-scratch companies under 50 years old with a $10bn+ valuation; area ∝ value.
          &ldquo;Under 50&rdquo; quietly disqualifies most of Europe&rsquo;s champions, leaving a handful.{" "}
          <span style={{ color: region.us.hi }}>US</span> ·{" "}
          <span style={{ color: region.eu.hi }}>Europe</span>
          {next && (
            <>
              {" "}·{" "}
              <span style={{ color: region.cn.hi }}>China</span>
            </>
          )}
          . Solid = public market cap (~2024); ringed = private last-round valuation (approximate; SpaceX
          at its documented ~$350bn). After the 2024 &ldquo;from-scratch&rdquo; chart.
        </>
      }
    >
      <svg
        viewBox="0 0 1000 620"
        role="img"
        aria-label="Bubble map of from-scratch US, European and (in the next-wave view) Chinese companies, area proportional to value"
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <text x={340} y={64} textAnchor="middle" fill={region.us.hi} style={{ fontSize: 34, fontWeight: 800, letterSpacing: "0.08em" }}>
          US
        </text>
        <text x={next ? 880 : 870} y={next ? 86 : 196} textAnchor="middle" fill={region.eu.hi} style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.08em" }}>
          EU
        </text>
        {next && (
          <text x={835} y={328} textAnchor="middle" fill={region.cn.hi} style={{ fontSize: 24, fontWeight: 800, letterSpacing: "0.08em" }}>
            CHINA
          </text>
        )}

        <Bubbles data={us} tone={region.us} />
        <Bubbles data={eu} tone={region.eu} />
        {next && <Bubbles data={cn} tone={region.cn} />}
      </svg>

      {/* totals readout */}
      <div
        className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1 px-1"
        style={{ fontFamily: "var(--font-mono), monospace" }}
      >
        <span style={{ color: region.us.hi, fontSize: 15, fontWeight: 700 }}>
          US {fmtT(usTot)}
        </span>
        <span style={{ color: region.eu.hi, fontSize: 15, fontWeight: 700 }}>
          EU {fmtT(euTot)}
        </span>
        {next && (
          <span style={{ color: region.cn.hi, fontSize: 15, fontWeight: 700 }}>
            China {fmtT(cnTot)}
          </span>
        )}
        <span style={{ color: p.muted, fontSize: 13 }}>
          {ratio}× the gap{next ? " — and widening with the next cohort" : ""}
        </span>
      </div>
    </PlateFrame>
  )
}
