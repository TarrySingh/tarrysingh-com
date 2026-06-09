"use client"

/** Field Guide — SpecComparator + ROICalculator (ported 1:1). */

import { useState, useMemo, type CSSProperties } from "react"

/* ---------- Spec Comparator ---------- */
type MetricKey = "payload" | "runtime" | "price"
interface Robot { id: string; name: string; maker: string; region: string; payload: number; runtime: number; price: number; priceLabel: string; vision: string; brain: string; status: string }
const ROBOTS: Robot[] = [
  { id: "optimus", name: "Tesla Optimus", maker: "Tesla", region: "US", payload: 20, runtime: 2, price: 25, priceLabel: "$20–30k", vision: "Cameras only", brain: "FSD / in-house", status: "Internal" },
  { id: "figure", name: "Figure 03", maker: "Figure AI", region: "US", payload: 20, runtime: 5, price: 130, priceLabel: "$130k+", vision: "RGB cameras", brain: "Helix (in-house)", status: "Scaling" },
  { id: "atlas", name: "Atlas", maker: "Boston Dynamics", region: "US · KR", payload: 50, runtime: 4, price: 150, priceLabel: "$150k+ est.", vision: "LiDAR + depth", brain: "Gemini Robotics", status: "Committed" },
  { id: "digit", name: "Agility Digit", maker: "Agility", region: "US", payload: 16, runtime: 4, price: 120, priceLabel: "RaaS", vision: "2D/3D + LiDAR", brain: "Agility Arc", status: "Commercial" },
  { id: "apollo", name: "Apollo", maker: "Apptronik", region: "US", payload: 25, runtime: 4, price: 50, priceLabel: "sub-$50k", vision: "Cameras", brain: "Gemini Robotics", status: "Pilots" },
  { id: "walker", name: "Walker S", maker: "UBTech", region: "China", payload: 20, runtime: 2, price: 40, priceLabel: "~$40k est.", vision: "Multi-camera", brain: "In-house", status: "Pilots" },
  { id: "g1", name: "Unitree G1", maker: "Unitree", region: "China", payload: 3, runtime: 2, price: 15, priceLabel: "$13.5–16k", vision: "LiDAR + cam", brain: "In-house", status: "On sale" },
]
const METRICS: { k: MetricKey; label: string; unit: string; hi: boolean }[] = [
  { k: "payload", label: "Payload", unit: "kg", hi: true },
  { k: "runtime", label: "Runtime", unit: "h", hi: true },
  { k: "price", label: "Price", unit: "k$", hi: false },
]
const REGION_COLOR: Record<string, string> = { "US": "var(--c-blue)", "US · KR": "var(--c-violet)", "China": "var(--c-red)" }

export function SpecComparator() {
  const [sel, setSel] = useState<string[]>(["optimus", "figure", "atlas", "g1"])
  const [metric, setMetric] = useState<MetricKey>("payload")
  const toggle = (id: string) => setSel((s) => s.includes(id) ? (s.length > 1 ? s.filter((x) => x !== id) : s) : [...s, id])
  const m = METRICS.find((x) => x.k === metric) ?? METRICS[0]
  const rows = useMemo(() => {
    const chosen = ROBOTS.filter((r) => sel.includes(r.id))
    const max = Math.max(...chosen.map((r) => r[metric]))
    return [...chosen].sort((a, b) => m.hi ? b[metric] - a[metric] : a[metric] - b[metric]).map((r) => ({ ...r, pct: (r[metric] / max) * 100 }))
  }, [sel, metric, m.hi])

  return (
    <div className="spec">
      <div className="spec-chips">
        {ROBOTS.map((r) => (
          <button key={r.id} className={"spec-chip" + (sel.includes(r.id) ? " on" : "")} style={sel.includes(r.id) ? { borderColor: REGION_COLOR[r.region], color: "var(--ink)" } : undefined} onClick={() => toggle(r.id)}>
            <span className="dot" style={{ background: REGION_COLOR[r.region] }} />{r.name}
          </button>
        ))}
      </div>
      <div className="spec-metrics">
        {METRICS.map((mm) => (
          <button key={mm.k} className={"spec-mbtn" + (metric === mm.k ? " on" : "")} onClick={() => setMetric(mm.k)}>
            {mm.label}<em>{mm.hi ? "higher = better" : "lower = better"}</em>
          </button>
        ))}
      </div>
      <div className="spec-bars">
        {rows.map((r) => (
          <div className="spec-row" key={r.id}>
            <div className="spec-name">{r.name}<span>{r.maker} · {r.region}</span></div>
            <div className="spec-track"><div className="spec-fill" style={{ width: r.pct + "%", background: REGION_COLOR[r.region] }} /></div>
            <div className="spec-val">{r[metric]}<em>{m.unit}</em></div>
          </div>
        ))}
      </div>
      <div className="spec-grid">
        <div className="spec-gh"><span /><span>Vision</span><span>AI brain</span><span>Price</span><span>Status</span></div>
        {rows.map((r) => (
          <div className="spec-gr" key={r.id}>
            <span className="gn"><span className="dot" style={{ background: REGION_COLOR[r.region] }} />{r.name}</span>
            <span>{r.vision}</span><span>{r.brain}</span><span className="mono">{r.priceLabel}</span><span>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- ROI / Payback calculator ---------- */
export function ROICalculator() {
  const [robots, setRobots] = useState(6)
  const [shifts, setShifts] = useState(2)
  const [wage, setWage] = useState(28)
  const [model, setModel] = useState<"raas" | "buy">("raas")

  const calc = useMemo(() => {
    const hoursPerDay = shifts * 8, days = 300
    const laborSaved = robots * hoursPerDay * days * wage
    let robotCostYr: number, capex = 0, paybackMo: number
    if (model === "raas") { robotCostYr = robots * 1100 * 12 } else { capex = robots * 120000; robotCostYr = robots * 8000 }
    const netYr = laborSaved - robotCostYr
    if (model === "raas") paybackMo = netYr > 0 ? 1 : Infinity
    else paybackMo = netYr > 0 ? (capex / (netYr / 12)) : Infinity
    const fiveYr = netYr * 5 - capex
    return { laborSaved, robotCostYr, netYr, paybackMo, fiveYr, capex }
  }, [robots, shifts, wage, model])

  const usd = (v: number) => {
    const a = Math.abs(v); const sign = v < 0 ? "−" : ""
    if (a >= 1e6) return sign + "$" + (a / 1e6).toFixed(1) + "M"
    if (a >= 1e3) return sign + "$" + Math.round(a / 1e3) + "k"
    return sign + "$" + Math.round(a)
  }

  return (
    <div className="roi">
      <div className="roi-ctrls">
        <div className="roi-ctrl">
          <label className="roi-lab">Fleet size <span>{robots} robots</span></label>
          <input type="range" min="1" max="40" value={robots} onChange={(e) => setRobots(+e.target.value)} />
        </div>
        <div className="roi-ctrl">
          <label className="roi-lab">Shifts / day <span>{shifts} ({shifts * 8}h)</span></label>
          <input type="range" min="1" max="3" value={shifts} onChange={(e) => setShifts(+e.target.value)} />
        </div>
        <div className="roi-ctrl">
          <label className="roi-lab">Loaded labor cost <span>${wage}/h</span></label>
          <input type="range" min="15" max="60" value={wage} onChange={(e) => setWage(+e.target.value)} />
        </div>
        <div className="roi-ctrl">
          <label className="roi-lab">Acquisition model</label>
          <div className="roi-seg">
            <button className={model === "raas" ? "on" : ""} onClick={() => setModel("raas")}>Robots-as-a-Service</button>
            <button className={model === "buy" ? "on" : ""} onClick={() => setModel("buy")}>Direct purchase</button>
          </div>
        </div>
      </div>
      <div className="roi-out">
        <div className="roi-hero">
          <div className="roi-k">{model === "buy" ? "Payback period" : "Net positive"}</div>
          <div className="roi-big">{model === "buy" ? (isFinite(calc.paybackMo) ? Math.round(calc.paybackMo) + " mo" : "—") : "Month 1"}</div>
          <div className="roi-sub">{model === "buy" ? `on ${usd(calc.capex)} capex` : "no upfront capex"}</div>
        </div>
        <div className="roi-lines">
          <div className="roi-line"><span>Labor cost displaced / yr</span><b className="pos">{usd(calc.laborSaved)}</b></div>
          <div className="roi-line"><span>Robot cost / yr</span><b className="neg">−{usd(calc.robotCostYr)}</b></div>
          <div className="roi-line big"><span>Net benefit / yr</span><b className={calc.netYr >= 0 ? "pos" : "neg"}>{usd(calc.netYr)}</b></div>
          <div className="roi-bar5">
            <div className="roi-bar5-h">5-year cumulative</div>
            <div className="roi-bar5-track"><div className="roi-bar5-fill" style={{ width: Math.max(2, Math.min(100, (calc.fiveYr / (calc.laborSaved * 5)) * 100)) + "%" }} /></div>
            <div className="roi-bar5-v">{usd(calc.fiveYr)} net over 5 years</div>
          </div>
        </div>
      </div>
      <p className="roi-foot">Illustrative model. Assumes ~300 working days/yr, 1:1 task substitution, RaaS ≈ $1,100/robot/mo, purchase ≈ $120k + $8k/yr maintenance.</p>
    </div>
  )
}
