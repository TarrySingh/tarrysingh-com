"use client"

/** Field Guide — GrowthDrivers, AppCaseStudies, MarketConcentration (ported 1:1). */

import { useState, type CSSProperties } from "react"

/* ---------- Growth Drivers (demand vs supply) ---------- */
interface DriverGroup { h: string; items: string[]; tags: string[] }
interface DriverSide { label: string; color: string; groups: DriverGroup[] }
const DRIVERS: Record<string, DriverSide> = {
  demand: {
    label: "Demand-side catalysts", color: "var(--c-green)",
    groups: [
      { h: "Global labor shortages", items: ["US: 2.1M unfilled factory jobs by 2030 (Deloitte)", "Japan: −35% working-age population by 2040", "Wage inflation: +15–30% in factory labor since 2021"], tags: ["Japan", "Germany", "US", "South Korea"] },
      { h: "Cost-curve acceleration", items: ["ROI timeline shortening: 5+ yrs → 2–3 yrs by 2027", "−22% actuator cost per doubling of volume", "Unit price target: $20–50k (human-labor threshold)"], tags: ["Tesla", "Figure AI", "BYD"] },
      { h: "Government incentives", items: ["China '1M AI Robots Plan', $15B in subsidies", "US CHIPS Act extension to components (debated)", "EU €2.7B Advanced Manufacturing Initiative"], tags: ["Guangdong", "Baden-Württemberg", "Michigan"] },
    ],
  },
  supply: {
    label: "Supply-side enablers", color: "var(--c-blue)",
    groups: [
      { h: "Technology readiness", items: ["AI: 100× cheaper training-cost-per-task since 2022", "Battery: 400 Wh/kg in 2024 (vs 260 in 2021)", "Reliability: MTBF <500 hrs → >2,000 hrs in field"], tags: ["NVIDIA", "Boston Dynamics", "SolidEnergy"] },
      { h: "Supply-chain maturation", items: ["+300% planetary-roller-screw capacity (China)", "Common interfaces & modular components emerging", "Tier-1 autos entering (Bosch, Denso)"], tags: ["Shanghai Beite", "LeaderDrive", "Bosch", "Foxconn"] },
      { h: "Integration ecosystem", items: ["NVIDIA Isaac + MS Azure Robotics dev stacks", "IT/OT integrators building robotics practices", "Robotics curricula expanding at technical colleges"], tags: ["NVIDIA", "Microsoft", "Accenture", "Siemens"] },
    ],
  },
}

export function GrowthDrivers() {
  const [side, setSide] = useState("demand")
  const d = DRIVERS[side]
  return (
    <div className="gd">
      <div className="gd-toggle">
        {Object.entries(DRIVERS).map(([k, v]) => (
          <button key={k} className={"gd-tbtn" + (side === k ? " on" : "")} style={side === k ? ({ "--gc": v.color, borderColor: v.color, color: "var(--ink)" } as CSSProperties) : undefined} onClick={() => setSide(k)}>
            <i style={{ background: v.color }} />{v.label}
          </button>
        ))}
      </div>
      <div className="gd-grid">
        {d.groups.map((g, i) => (
          <div className="gd-card" key={i} style={{ "--gc": d.color } as CSSProperties}>
            <h4 className="gd-h">{g.h}</h4>
            <ul className="gd-items">{g.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
            <div className="gd-tags">{g.tags.map((t, j) => <span key={j}>{t}</span>)}</div>
          </div>
        ))}
      </div>
      <div className="gd-note">{side === "demand" ? "65% of surveyed manufacturers cite workforce challenges as the primary motivation for exploring humanoids." : "Technological readiness is now outpacing market adoption, the gating factor is organizational, not technical."}</div>
    </div>
  )
}

/* ---------- Applications case studies ---------- */
interface CaseStudy { id: string; robot: string; co: string; color: string; site: string; task: string; results: string[]; roi: string }
const CASES: CaseStudy[] = [
  { id: "bmw", robot: "Figure 02 → 03", co: "BMW", color: "var(--c-blue)", site: "Spartanburg, SC", task: "Sheet-metal part insertion into body-shop fixtures", results: ["11-month pilot, completed Nov 2025", "30,000+ vehicles · 90,000+ parts", "1,250 operating hours logged"], roi: "Automotive: 28–35% labor-cost reduction · 9–14 mo payback · 22% defect reduction" },
  { id: "amazon", robot: "Agility Digit", co: "GXO / Amazon", color: "var(--pos)", site: "Fulfillment center", task: "Empty-tote handling & AMR collaboration", results: ["100,000+ totes moved at GXO", "4-hour battery, autonomous charging", "First commercial humanoid (Jun 2024)"], roi: "Logistics: 18–25% cost savings vs. specialized automation · projected $7.1B annual savings by 2032" },
  { id: "diligent", robot: "Diligent Moxi", co: "Hospitals", color: "var(--c-violet)", site: "Multiple US hospitals", task: "Lab-sample delivery, supply fetching, linen transport", results: ["Returned 600+ nursing hours to direct care", "Non-clinical logistics only", "Months-to-impact deployment"], roi: "Healthcare: 12–20% staff-retention gain · 15–30% higher patient-satisfaction scores" },
]

export function AppCaseStudies() {
  const [open, setOpen] = useState("bmw")
  const c = CASES.find((x) => x.id === open) ?? CASES[0]
  return (
    <div className="acs">
      <div className="acs-tabs">
        {CASES.map((x) => (
          <button key={x.id} className={"acs-tab" + (open === x.id ? " on" : "")} style={open === x.id ? ({ "--cc": x.color, borderColor: x.color } as CSSProperties) : undefined} onClick={() => setOpen(x.id)}>
            <span className="acs-co">{x.co}</span><span className="acs-rb">{x.robot}</span>
          </button>
        ))}
      </div>
      <div className="acs-detail" style={{ "--cc": c.color } as CSSProperties}>
        <div className="acs-top">
          <div><div className="acs-k">Case study</div><div className="acs-title">{c.robot} <span>at {c.co}</span></div><div className="acs-site">{c.site}</div></div>
        </div>
        <div className="acs-body">
          <div className="acs-task"><div className="acs-lab">The task</div><p>{c.task}</p></div>
          <div className="acs-res"><div className="acs-lab">Results</div><ul>{c.results.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
        </div>
        <div className="acs-roi"><span className="acs-roilab">ROI</span>{c.roi}</div>
      </div>
    </div>
  )
}

/* ---------- Market Concentration (donut + shares) ---------- */
interface ConcRow { name: string; share: number; growth: number; kind: string; color: string }
const CONC: ConcRow[] = [
  { name: "Tesla (Optimus)", share: 22.5, growth: 142, kind: "integrator", color: "var(--c-blue)" },
  { name: "Figure AI", share: 18.3, growth: 215, kind: "integrator", color: "var(--pos)" },
  { name: "Boston Dynamics / Hyundai", share: 15.2, growth: 86, kind: "integrator", color: "var(--c-amber)" },
  { name: "NVIDIA", share: 11.7, growth: 93, kind: "supplier", color: "var(--c-violet)" },
  { name: "Agility Robotics", share: 8.5, growth: 78, kind: "integrator", color: "var(--c-red)" },
  { name: "UBTech", share: 6.4, growth: 119, kind: "integrator", color: "var(--c-cyan)" },
  { name: "Sanctuary AI", share: 4.8, growth: 67, kind: "integrator", color: "var(--c-magenta)" },
  { name: "Harmonic Drive", share: 4.2, growth: 52, kind: "supplier", color: "#9aa0ae" },
  { name: "Apptronik", share: 3.5, growth: 167, kind: "integrator", color: "#6f86f0" },
  { name: "Other players", share: 4.9, growth: 65, kind: "other", color: "#3a3d47" },
]

export function MarketConcentration() {
  const [hover, setHover] = useState<string | null>(null)
  const R = 150, r = 92, cx = 170, cy = 170
  let acc = 0
  const arcs = CONC.map((d) => {
    const a0 = acc / 100 * 2 * Math.PI - Math.PI / 2
    acc += d.share
    const a1 = acc / 100 * 2 * Math.PI - Math.PI / 2
    const large = (a1 - a0) > Math.PI ? 1 : 0
    const p = (ang: number, rad: number): [number, number] => [cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)]
    const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R), [x2, y2] = p(a1, r), [x3, y3] = p(a0, r)
    return { ...d, path: `M${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r},${r} 0 ${large} 0 ${x3},${y3} Z` }
  })
  return (
    <div className="conc">
      <div className="conc-left">
        <svg viewBox="0 0 340 340" className="conc-svg">
          {arcs.map((a) => (
            <path key={a.name} d={a.path} fill={a.color} stroke="var(--paper-dark)" strokeWidth="1.5" fillOpacity={hover && hover !== a.name ? 0.25 : 1} style={{ cursor: "pointer" }} onMouseEnter={() => setHover(a.name)} onMouseLeave={() => setHover(null)} />
          ))}
          <text x={cx} y={cy - 8} textAnchor="middle" className="conc-cn">56%</text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="conc-cl">TOP-3 SHARE</text>
        </svg>
        <div className="conc-stats">
          <div><span className="conc-sn">1,382</span><span className="conc-sl">HHI index</span></div>
          <div><span className="conc-sn">40.8%</span><span className="conc-sl">Vertical players (Tesla + Figure)</span></div>
          <div><span className="conc-sn">10.6%</span><span className="conc-sl">Chinese share · growing 2.1×</span></div>
        </div>
      </div>
      <div className="conc-right">
        {CONC.map((d) => (
          <div className={"conc-row" + (hover === d.name ? " on" : "")} key={d.name} onMouseEnter={() => setHover(d.name)} onMouseLeave={() => setHover(null)}>
            <span className="conc-dot" style={{ background: d.color }} />
            <span className="conc-name">{d.name}<em>{d.kind}</em></span>
            <span className="conc-bar"><span style={{ width: (d.share / 22.5 * 100) + "%", background: d.color }} /></span>
            <span className="conc-share">{d.share}%</span>
            <span className="conc-growth">+{d.growth}%</span>
          </div>
        ))}
        <div className="conc-foot">Moderately concentrated, early-oligopoly. Critical-component suppliers (NVIDIA, Harmonic Drive) capture <b>15.9%</b> of value without building a complete robot.</div>
      </div>
    </div>
  )
}
