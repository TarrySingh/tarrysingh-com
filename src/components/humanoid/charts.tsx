"use client"

/**
 * The Humanoid Ascendancy — interactive components (ported from the reference
 * canvas-components.jsx, 1:1). Slice subset: MarketModel + SectionMap.
 * (DecisionTree and the remaining ~14 tools land as their sections are built.)
 */

import { useState, useMemo, type ChangeEvent } from "react"

/* ---------- Market Forecast scenario model ---------- */
interface Scenario { base: number; cagr: number; label: string; note: string }
const SCENARIOS: Record<string, Scenario> = {
  goldman: { base: 3.2, cagr: 26, label: "Goldman", note: "Goldman Sachs — conservative, ~26% CAGR → ~$38B by 2035" },
  mm: { base: 3.0, cagr: 39, label: "M&M", note: "MarketsandMarkets — 39.2% CAGR to 2030 ($15.3B)" },
  nester: { base: 4.4, cagr: 44, label: "R. Nester", note: "Research Nester — 44.1% CAGR → $372B by 2037" },
  coherent: { base: 4.3, cagr: 49, label: "Coherent", note: "Coherent Market — 48.8% CAGR to 2032 ($70B)" },
  globe: { base: 3.0, cagr: 49, label: "GlobeNewswire", note: "GlobeNewswire — aggressive, 49.2% CAGR → ~$243B by 2035" },
}
const fmtB = (v: number) => (v >= 100 ? `$${Math.round(v)}B` : `$${v.toFixed(1)}B`)

export function MarketModel() {
  const [base, setBase] = useState(3.8)
  const [cagr, setCagr] = useState(42)
  const [active, setActive] = useState<string | null>(null)

  const series = useMemo(() => {
    const out: { year: number; v: number }[] = []
    for (let y = 2025; y <= 2035; y++) out.push({ year: y, v: base * Math.pow(1 + cagr / 100, y - 2025) })
    return out
  }, [base, cagr])
  const end = series[series.length - 1].v

  const applyScenario = (k: string) => { const s = SCENARIOS[k]; setBase(s.base); setCagr(s.cagr); setActive(k) }
  const onSlider = (setter: (n: number) => void) => (e: ChangeEvent<HTMLInputElement>) => { setter(parseFloat(e.target.value)); setActive(null) }

  // chart geometry
  const W = 1040, H = 470, padL = 96, padR = 40, padT = 34, padB = 56
  const x = (i: number) => padL + (W - padL - padR) * (i / (series.length - 1))
  const yMax = Math.max(end * 1.12, 12)
  const y = (v: number) => H - padB - (H - padT - padB) * (v / yMax)
  const line = series.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ")
  const area = `${line} L${x(series.length - 1).toFixed(1)},${H - padB} L${padL},${H - padB} Z`
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => +(yMax * f).toFixed(0))

  return (
    <div className="mm">
      <div className="mm-chart">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="mmfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2040df" stopOpacity="0.30" />
              <stop offset="1" stopColor="#2040df" stopOpacity="0" />
            </linearGradient>
          </defs>
          {gridVals.map((g, i) => (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y(g)} y2={y(g)} stroke="rgba(244,242,236,0.10)" />
              <text x={padL - 16} y={y(g) + 5} textAnchor="end" className="mm-axis">{g}</text>
            </g>
          ))}
          <text x={padL - 64} y={padT + 6} className="mm-axis" transform={`rotate(-90 ${padL - 64} ${H / 2})`} style={{ textAnchor: "middle" }}>USD BILLIONS</text>
          <path d={area} fill="url(#mmfill)" />
          <path d={line} fill="none" stroke="#2040df" strokeWidth="3" />
          {series.map((p, i) => (i === 0 || i === series.length - 1) ? (
            <g key={i}>
              <circle cx={x(i)} cy={y(p.v)} r="6" fill="#2040df" />
              <text x={x(i)} y={y(p.v) - 18} textAnchor={i === 0 ? "start" : "end"} className="mm-pt">{fmtB(p.v)}</text>
            </g>
          ) : null)}
          {series.map((p, i) => (
            <text key={"yr" + i} x={x(i)} y={H - padB + 26} textAnchor="middle" className="mm-axis">{p.year % 5 === 0 || i === series.length - 1 ? p.year : ""}</text>
          ))}
        </svg>
      </div>

      <div className="mm-panel">
        <div className="mm-readout">
          <div className="mm-k">2035 projection</div>
          <div className="mm-big">{fmtB(end)}</div>
          <div className="mm-sub">from {fmtB(base)} in 2025 · <span className="accent">{cagr}% CAGR</span> · {(end / base).toFixed(0)}× growth</div>
        </div>

        <div className="mm-ctrl">
          <label className="mm-lab">2025 base market <span>{fmtB(base)}</span></label>
          <input type="range" min="2.9" max="4.5" step="0.1" value={base} onChange={onSlider(setBase)} />
        </div>
        <div className="mm-ctrl">
          <label className="mm-lab">Annual growth (CAGR) <span>{cagr}%</span></label>
          <input type="range" min="20" max="55" step="1" value={cagr} onChange={onSlider(setCagr)} />
        </div>

        <div className="mm-k" style={{ marginTop: 22 }}>Analyst scenarios</div>
        <div className="mm-scn five">
          {Object.entries(SCENARIOS).map(([k, s]) => (
            <button key={k} className={"mm-btn" + (active === k ? " on" : "")} onClick={() => applyScenario(k)}>{s.label}</button>
          ))}
        </div>
        <div className="mm-note">{active ? SCENARIOS[active].note : "Custom scenario — drag the sliders."}</div>
      </div>
    </div>
  )
}

/* ---------- Section map (the journey's table of contents) ---------- */
interface Chapter { n: string; t: string; s: string; href: string; tag: string }
const CHAPTERS: Chapter[] = [
  { n: "01", t: "Market Sizing", s: "Live 2025–2035 model, 5 analyst scenarios", href: "#market", tag: "Interactive" },
  { n: "02", t: "Growth Drivers", s: "Demand vs. supply forces, toggled", href: "#drivers", tag: "Interactive" },
  { n: "03", t: "Technology Value Chain", s: "Cost-flow Sankey + the live Explorer, embedded", href: "#chain", tag: "Live tool" },
  { n: "04", t: "Ecosystem Map", s: "Drag the network of makers, suppliers & capital", href: "#ecosystem", tag: "Interactive" },
  { n: "05", t: "Technical Deep-Dive", s: "Quantum sensing + sector-impact radar", href: "#tech", tag: "Interactive" },
  { n: "06", t: "Competitive Landscape", s: "Re-rank 7 robots on payload, runtime, price", href: "#compete", tag: "Interactive" },
  { n: "07", t: "Market Concentration", s: "HHI, CR3 56% — the early oligopoly, charted", href: "#concentration", tag: "Interactive" },
  { n: "08", t: "Comparative Frameworks", s: "East vs. West — 5 strategic frameworks", href: "#frameworks", tag: "Interactive" },
  { n: "09", t: "ROI / Payback Lab", s: "Size a fleet, model the business case", href: "#roi", tag: "Interactive" },
  { n: "10", t: "Geopolitics", s: "US · China · Korea supply-chain war map", href: "#geo", tag: "Interactive" },
  { n: "11", t: "Regional Analysis", s: "Five regions, real share, CAGR & players", href: "#regions", tag: "Interactive" },
  { n: "12", t: "Deployment Timeline", s: "2024 → 2027, scroll-driven", href: "#timeline", tag: "Interactive" },
  { n: "13", t: "Application Case Studies", s: "BMW · GXO/Amazon · hospitals — real ROI", href: "#cases", tag: "Interactive" },
  { n: "14", t: "The Workshop", s: "Actuator lab + incident-response sim", href: "#workshop", tag: "Premium" },
  { n: "15", t: "Certification Path", s: "Five-stage curriculum to credential", href: "#cert", tag: "Premium" },
  { n: "16", t: "The Full Deck", s: "All 60 slides, embedded — or open standalone", href: "#tools", tag: "Read" },
]

export function SectionMap() {
  return (
    <div className="smap">
      {CHAPTERS.map((c) => (
        <a key={c.n} className="smap-card" href={c.href}>
          <span className="smap-n">{c.n}</span>
          <span className="smap-t">
            {c.t}
            {c.tag && <em className={"smap-tag t-" + c.tag.split(" ")[0].toLowerCase()}>{c.tag}</em>}
          </span>
          <span className="smap-s">{c.s}</span>
          <span className="smap-arrow">→</span>
        </a>
      ))}
    </div>
  )
}
