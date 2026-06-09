"use client"

/** Field Guide — ComparativeFramework + TechDeepDive (ported 1:1). */

import { useState, type CSSProperties } from "react"

type MarkKey = "+" | "−" | "~"
interface FwRow { t: string; items: [MarkKey, string][] }
interface FwSide { name: string; tag: string; rows: FwRow[]; ex: string }
interface Framework { id: string; tab: string; title: string; sub: string; L: FwSide; R: FwSide }

const FRAMEWORKS: Framework[] = [
  {
    id: "mfg", tab: "Manufacturing", title: "Western vs. Asia-based manufacturing", sub: "Side-by-side analysis of advanced-robotics production approaches",
    L: { name: "Western Manufacturing", tag: "US & European", rows: [
      { t: "Quality focus", items: [["+", "ISO 9001/13485 integrated throughout"], ["+", "Lower defect rates (0.8–1.2%)"], ["−", "Validation cycles add 30–45% to timeline"]] },
      { t: "Cost structure", items: [["−", "35–50% higher labor costs"], ["−", "Greater regulatory compliance expense"], ["+", "Automation cuts long-run variable cost"]] },
      { t: "Scalability", items: [["−", "8–12 month line lead times"], ["+", "Adaptive to low-volume, high-mix"]] },
    ], ex: "Boston Dynamics emphasizes tight QC and extensive validation — higher unit cost, exceptional reliability." },
    R: { name: "Asia-based Manufacturing", tag: "China · Japan · Korea", rows: [
      { t: "Quality focus", items: [["−", "Higher component variability (1.5–3.2%)"], ["+", "Japan leads precision actuator quality"], ["~", "Chinese facilities closing the gap fast"]] },
      { t: "Cost structure", items: [["+", "25–40% lower total production cost"], ["+", "State subsidies reduce capex"], ["+", "Vertical integration cuts logistics"]] },
      { t: "Scalability", items: [["+", "3–6 month line deployment"], ["+", "Rapid workforce scaling"], ["−", "Less flexible for design iterations"]] },
    ], ex: "UBTECH's Shenzhen ecosystem enables ~60% cost advantage and 2× faster scaling — but needs high minimum volumes." },
  },
  {
    id: "esg", tab: "ESG Rules", title: "US vs. EU & China ESG regimes", sub: "Regulatory requirements and implications for robotics manufacturers",
    L: { name: "United States", tag: "SEC climate disclosure", rows: [
      { t: "Disclosure", items: [["+", "Scope 1 & 2 with third-party verification"], ["+", "Climate risk in financial statements"], ["~", "Flexible, materiality-driven"]] },
      { t: "Robotics-specific", items: [["~", "Fleet energy-consumption reporting"], ["~", "Workforce-displacement disclosure"], ["−", "Rare-earth sourcing impact"]] },
      { t: "Timeline", items: [["+", "Large filers FY2025 → report 2026"], ["~", "Phased through FY2027"]] },
    ], ex: "US rules focus on financial materiality over prescriptive standards — flexibility, but comprehensive assessment required." },
    R: { name: "EU & China", tag: "Taxonomy + Green Cert", rows: [
      { t: "Disclosure", items: [["−", "CSRD + double-materiality assessment"], ["−", "Six-objective taxonomy alignment"], ["−", "Technical screening criteria"]] },
      { t: "Robotics-specific", items: [["−", "Energy-efficiency mandates (CN)"], ["−", "Mandatory recycling metrics"], ["~", "Green Factory integration"]] },
      { t: "Implications", items: [["−", "Prescriptive + supply-chain accountability"], ["~", "China ties to industrial policy"]] },
    ], ex: "Manufacturers must build regionally-optimized ESG programs and modular architecture to meet divergent rules." },
  },
  {
    id: "consortia", tab: "Consortia", title: "Western vs. Asian manufacturing consortia", sub: "Governance, funding, and tech-transfer models compared",
    L: { name: "Western Consortia", tag: "US & EU alliances", rows: [
      { t: "Governance", items: [["+", "Decentralized, distributed decisions"], ["+", "Strong university research integration"], ["~", "Open, investment-based membership"]] },
      { t: "Funding", items: [["~", "1:1 matching public-private grants"], ["+", "Strategic corporate VC"], ["~", "Project-based, not entity-level"]] },
      { t: "Tech transfer & IP", items: [["+", "Strong IP protection, controlled licensing"], ["+", "Defensive patent strategies"]] },
    ], ex: "The ARM Institute unites 300+ members with $80M federal + $173M private/state funding — workforce alongside tech." },
    R: { name: "Asian Consortia", tag: "CN · JP · KR alliances", rows: [
      { t: "Governance", items: [["~", "Centralized, strategic coordination"], ["~", "China: state-guided targets"], ["~", "Japan keiretsu / Korea chaebol-led"]] },
      { t: "Funding", items: [["+", "Direct state investment via funds"], ["+", "Subsidized facilities & equipment"], ["+", "Guaranteed public procurement"]] },
      { t: "Tech transfer & IP", items: [["+", "Fast internal IP sharing"], ["−", "Limited external protection"], ["+", "Process-innovation focus"]] },
    ], ex: "China's '1M AI Robots Plan' directs $15B across five hubs; LeaderDrive's actuator output rose 15× via guaranteed orders." },
  },
  {
    id: "transform", tab: "Success vs Failure", title: "Why robotics transformations succeed — or fail", sub: "Side-by-side analysis of high-ROI projects vs. abandoned ones",
    L: { name: "Successful Transformations", tag: "High-ROI projects", rows: [
      { t: "Leadership", items: [["+", "C-suite directly accountable for outcomes"], ["+", "Cross-functional executive steering committee"], ["+", "Clear vision with measurable milestones"]] },
      { t: "Governance", items: [["+", "Dedicated transformation office with authority"], ["+", "Clear decision rights & escalation paths"], ["+", "Balanced technical + business-value metrics"]] },
      { t: "Tech stack", items: [["+", "Component modularity, defined interfaces"], ["+", "Integration architecture in place first"], ["+", "Data platform before advanced AI"]] },
      { t: "Culture", items: [["+", "Early workforce involvement in design"], ["+", "Upskilling started before deployment"], ["+", "Celebrate wins, surface failures openly"]] },
    ], ex: "Successful organizations treat robotics not as a technology deployment but as a business transformation that happens to involve robots." },
    R: { name: "Failed Transformations", tag: "Common pitfalls", rows: [
      { t: "Leadership", items: [["−", "Robotics viewed as an IT/engineering project"], ["−", "Critical decisions delegated to middle mgmt"], ["−", "Unrealistic, implementation-detached timelines"]] },
      { t: "Governance", items: [["−", "Fragmented oversight across committees"], ["−", "Inconsistent annual-budget-cycle funding"], ["−", "Success measured on deployment, not value"]] },
      { t: "Tech stack", items: [["−", "Heavy customization of platforms"], ["−", "Underinvestment in data infrastructure"], ["−", "Neglect of operational-technology security"]] },
      { t: "Culture", items: [["−", "Workforce informed late in the process"], ["−", "Training delayed until after deployment"], ["−", "Fear-based narratives around automation"]] },
    ], ex: "The difference between success and failure is rarely the technology — it's the organizational scaffolding around it." },
  },
  {
    id: "partner", tab: "Partnerships", title: "Partnership archetypes — pros & cons", sub: "Four models for global robotics scale, and where each one wins",
    L: { name: "Strategic Integration", tag: "Deep alignment & resource sharing", rows: [
      { t: "Joint ventures (JVs)", items: [["+", "Deep tech integration & shared IP creation"], ["−", "Complex governance, cultural friction"], ["~", "Ideal: cross-border, capital-intensive"]] },
      { t: "Examples", items: [["+", "Hyundai–Boston Dynamics"], ["+", "Google–Honda Robotics"], ["+", "BMW–Figure AI"]] },
      { t: "Co-development", items: [["+", "Accelerated R&D, shared risk"], ["−", "IP-ownership disputes, mission creep"], ["~", "NVIDIA–Sanctuary · SoftBank–Agility"]] },
    ], ex: "For humanoids, JVs are emerging as the preferred model for automotive partnerships — true integration into manufacturing systems." },
    R: { name: "Flexible Relationship", tag: "Flexibility & market access", rows: [
      { t: "Licensing", items: [["+", "Rapid expansion, low capital, IP control"], ["−", "Limited integration; partners may rival"], ["~", "Ideal: mature tech, market penetration"]] },
      { t: "Open alliance", items: [["+", "Fast ecosystem growth, shared R&D cost"], ["−", "Reduced competitive advantage"], ["~", "Standards: Rust Robotics, EU Robotics Alliance"]] },
      { t: "Best practice", items: [["~", "Hybrid: deeper for hardware, open for software"]] },
    ], ex: "Successful global players use different models per market and tech layer — hardware needs JVs; software benefits from open models." },
  },
]
const MARK: Record<MarkKey, { c: string; s: string }> = { "+": { c: "var(--pos)", s: "Strength" }, "−": { c: "var(--neg)", s: "Challenge" }, "~": { c: "var(--c-amber)", s: "Trend" } }

function CfPanel({ side, accent }: { side: FwSide; accent: string }) {
  return (
    <div className="cf-panel" style={{ "--pc": accent } as CSSProperties}>
      <div className="cf-phead"><span className="cf-pname">{side.name}</span><span className="cf-ptag">{side.tag}</span></div>
      {side.rows.map((r, i) => (
        <div className="cf-row" key={i}>
          <div className="cf-rt">{r.t}</div>
          {r.items.map(([mk, txt], j) => (
            <div className="cf-item" key={j}>
              <span className="cf-mark" style={{ color: MARK[mk].c, borderColor: MARK[mk].c }}>{mk}</span>
              <span className="cf-txt">{txt}</span>
            </div>
          ))}
        </div>
      ))}
      <div className="cf-ex">{side.ex}</div>
    </div>
  )
}

export function ComparativeFramework() {
  const [active, setActive] = useState("mfg")
  const fw = FRAMEWORKS.find((f) => f.id === active) ?? FRAMEWORKS[0]
  return (
    <div className="cf">
      <div className="cf-tabs">
        {FRAMEWORKS.map((f) => (
          <button key={f.id} className={"cf-tab" + (active === f.id ? " on" : "")} onClick={() => setActive(f.id)}>{f.tab}</button>
        ))}
        <div className="cf-legend">
          <span><i style={{ background: "var(--pos)" }} />Strength</span>
          <span><i style={{ background: "var(--neg)" }} />Challenge</span>
          <span><i style={{ background: "var(--c-amber)" }} />Trend</span>
        </div>
      </div>
      <div className="cf-head"><h3 className="cf-title">{fw.title}</h3><p className="cf-sub">{fw.sub}</p></div>
      <div className="cf-grid">
        <CfPanel side={fw.L} accent="var(--c-blue)" />
        <CfPanel side={fw.R} accent="var(--c-amber)" />
      </div>
    </div>
  )
}

/* ---------- Technical Deep-Dive: radar + bars ---------- */
const SENSORS = [
  { name: "Traditional", v: 32, kind: "legacy" }, { name: "MEMS", v: 58, kind: "legacy" },
  { name: "Quantum inertial", v: 87, kind: "quantum" }, { name: "Quantum gravimetric", v: 92, kind: "quantum" },
]
const RADAR_AXES = ["Cost reduction", "Reliability", "Miniaturization", "Redundancy", "Precision"]
const RADAR_SERIES: Record<string, { color: string; vals: number[] }> = {
  Logistics: { color: "var(--c-blue)", vals: [70, 62, 55, 60, 75] },
  Defense: { color: "var(--c-amber)", vals: [55, 80, 50, 88, 70] },
  Healthcare: { color: "var(--pos)", vals: [60, 78, 92, 58, 95] },
}

function Radar({ shown }: { shown: Record<string, boolean> }) {
  const cx = 170, cy = 165, R = 120, N = RADAR_AXES.length
  const pt = (i: number, r: number): [number, number] => [cx + r * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / N), cy + r * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / N)]
  return (
    <svg viewBox="0 0 340 340" className="radar">
      {[0.25, 0.5, 0.75, 1].map((f, k) => (
        <polygon key={k} points={RADAR_AXES.map((_, i) => pt(i, R * f).join(",")).join(" ")} fill="none" stroke="rgba(244,242,236,0.12)" />
      ))}
      {RADAR_AXES.map((a, i) => {
        const [x, y] = pt(i, R); const [lx, ly] = pt(i, R + 26)
        return (<g key={i}><line x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(244,242,236,0.10)" /><text x={lx} y={ly} className="radar-lab" textAnchor="middle">{a}</text></g>)
      })}
      {Object.entries(RADAR_SERIES).map(([name, s]) => shown[name] ? (
        <polygon key={name} points={s.vals.map((v, i) => pt(i, R * v / 100).join(",")).join(" ")} fill={s.color} fillOpacity="0.16" stroke={s.color} strokeWidth="2" style={{ transition: "all .4s var(--ease)" }} />
      ) : null)}
    </svg>
  )
}

export function TechDeepDive() {
  const [shown, setShown] = useState<Record<string, boolean>>({ Logistics: true, Defense: true, Healthcare: true })
  const maxV = 100
  return (
    <div className="tdd">
      <div className="tdd-card">
        <div className="tdd-ct">Positioning-accuracy improvement</div>
        <div className="tdd-bars">
          {SENSORS.map((s) => (
            <div className="tdd-bar" key={s.name}>
              <div className="tdd-col"><div className="tdd-fill" style={{ height: (s.v / maxV * 100) + "%", background: s.kind === "quantum" ? "var(--c-cyan)" : "var(--ink-faint)" }}><span className="tdd-v">{s.v}%</span></div></div>
              <div className="tdd-bl">{s.name}</div>
            </div>
          ))}
        </div>
        <div className="tdd-cap"><span style={{ color: "var(--c-cyan)" }}>■</span> Quantum sensing &nbsp;·&nbsp; <span style={{ color: "var(--ink-faint)" }}>■</span> Legacy</div>
      </div>
      <div className="tdd-card">
        <div className="tdd-ct">Sector-specific impact <span className="tdd-hint">— toggle series</span></div>
        <Radar shown={shown} />
        <div className="tdd-toggles">
          {Object.entries(RADAR_SERIES).map(([name, s]) => (
            <button key={name} className={"tdd-tg" + (shown[name] ? " on" : "")} style={shown[name] ? { borderColor: s.color, color: "var(--ink)" } : undefined} onClick={() => setShown((p) => ({ ...p, [name]: !p[name] }))}>
              <i style={{ background: s.color }} />{name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
