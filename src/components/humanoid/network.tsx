"use client"

/** Field Guide — EcosystemGraph + CaseStudyMap + CertStepper (ported 1:1).
 * Note: the original seeded node positions with Math.random() (which breaks
 * SSR hydration); here the jitter is deterministic so server + client match. */

import { useState, useRef, useEffect, type CSSProperties } from "react"

/* ---------- Ecosystem force-graph ---------- */
const EG_TYPES: Record<string, { label: string; color: string }> = {
  integrator: { label: "Integrators", color: "var(--c-blue)" },
  supplier: { label: "Component suppliers", color: "var(--pos)" },
  brain: { label: "AI / chips", color: "var(--c-violet)" },
  investor: { label: "Investors", color: "var(--c-amber)" },
  policy: { label: "Policy / govt", color: "var(--c-red)" },
}
interface EgNodeDef { id: string; t: string; r: number; label: string }
const EG_NODES: EgNodeDef[] = [
  { id: "figure", t: "integrator", r: 26, label: "Figure AI" }, { id: "tesla", t: "integrator", r: 24, label: "Tesla" },
  { id: "atlas", t: "integrator", r: 22, label: "Boston Dynamics" }, { id: "agility", t: "integrator", r: 19, label: "Agility" },
  { id: "apptronik", t: "integrator", r: 19, label: "Apptronik" }, { id: "ubtech", t: "integrator", r: 19, label: "UBTECH" },
  { id: "nvidia", t: "brain", r: 25, label: "NVIDIA" }, { id: "gdm", t: "brain", r: 22, label: "Google DeepMind" },
  { id: "tsmc", t: "supplier", r: 18, label: "TSMC" }, { id: "harmonic", t: "supplier", r: 17, label: "Harmonic Drive" },
  { id: "mobis", t: "supplier", r: 18, label: "Hyundai Mobis" }, { id: "leader", t: "supplier", r: 16, label: "LeaderDrive" },
  { id: "parkway", t: "investor", r: 16, label: "Parkway VC" }, { id: "brookfield", t: "investor", r: 16, label: "Brookfield" },
  { id: "softbank", t: "investor", r: 16, label: "SoftBank" }, { id: "chips", t: "policy", r: 17, label: "US CHIPS Act" },
  { id: "china", t: "policy", r: 18, label: "China 1M Plan" },
]
const EG_LINKS: [string, string][] = [
  ["figure", "nvidia"], ["figure", "parkway"], ["figure", "brookfield"], ["figure", "harmonic"],
  ["tesla", "tsmc"], ["tesla", "china"], ["atlas", "gdm"], ["atlas", "mobis"], ["apptronik", "gdm"],
  ["agility", "nvidia"], ["ubtech", "china"], ["ubtech", "leader"], ["ubtech", "softbank"],
  ["nvidia", "tsmc"], ["gdm", "nvidia"], ["mobis", "harmonic"], ["leader", "china"],
  ["chips", "tsmc"], ["chips", "nvidia"], ["brookfield", "atlas"], ["parkway", "apptronik"],
  ["figure", "tesla"], ["harmonic", "leader"],
]
interface EgNode extends EgNodeDef { x: number; y: number; vx: number; vy: number }

export function EcosystemGraph() {
  const W = 860, H = 560
  const ref = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<string | null>(null)
  const stateRef = useRef<Record<string, EgNode> | null>(null)
  const dragRef = useRef<string | null>(null)
  const [, force] = useState(0)

  if (!stateRef.current) {
    const nodes: Record<string, EgNode> = {}
    EG_NODES.forEach((n, i) => {
      const a = (i / EG_NODES.length) * Math.PI * 2
      const jx = ((i * 37) % 40) - 20, jy = ((i * 53) % 40) - 20 // deterministic jitter (SSR-safe)
      nodes[n.id] = { ...n, x: W / 2 + Math.cos(a) * 180 + jx, y: H / 2 + Math.sin(a) * 150 + jy, vx: 0, vy: 0 }
    })
    stateRef.current = nodes
  }

  useEffect(() => {
    let raf = 0, ticks = 0
    const step = () => {
      const nodes = stateRef.current
      if (!nodes) return
      const ids = Object.keys(nodes)
      for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
        const a = nodes[ids[i]], b = nodes[ids[j]]
        const dx = a.x - b.x, dy = a.y - b.y; const d2 = dx * dx + dy * dy || 1; const d = Math.sqrt(d2)
        const f = 2600 / d2; const ux = dx / d, uy = dy / d
        a.vx += ux * f; a.vy += uy * f; b.vx -= ux * f; b.vy -= uy * f
      }
      EG_LINKS.forEach(([s, t]) => {
        const a = nodes[s], b = nodes[t]; const dx = b.x - a.x, dy = b.y - a.y; const d = Math.sqrt(dx * dx + dy * dy) || 1
        const f = (d - 150) * 0.012; const ux = dx / d, uy = dy / d
        a.vx += ux * f; a.vy += uy * f; b.vx -= ux * f; b.vy -= uy * f
      })
      ids.forEach((id) => {
        const n = nodes[id]
        n.vx += (W / 2 - n.x) * 0.004; n.vy += (H / 2 - n.y) * 0.004
        if (dragRef.current === id) { n.vx = 0; n.vy = 0; return }
        n.vx *= 0.86; n.vy *= 0.86; n.x += n.vx; n.y += n.vy
        n.x = Math.max(n.r + 8, Math.min(W - n.r - 8, n.x)); n.y = Math.max(n.r + 8, Math.min(H - n.r - 8, n.y))
      })
      force((v) => v + 1)
      ticks++
      if (ticks < 600 || dragRef.current) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const toLocal = (e: MouseEvent | TouchEvent) => {
      const svg = ref.current; if (!svg) return { x: 0, y: 0 }
      const r = svg.getBoundingClientRect()
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX, cy = "touches" in e ? e.touches[0].clientY : e.clientY
      return { x: (cx - r.left) / r.width * W, y: (cy - r.top) / r.height * H }
    }
    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current || !stateRef.current) return
      const p = toLocal(e); const n = stateRef.current[dragRef.current]; n.x = p.x; n.y = p.y; force((v) => v + 1)
    }
    const up = () => { dragRef.current = null }
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up)
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up)
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up) }
  }, [])

  const nodes = stateRef.current
  const onDown = (id: string) => () => { dragRef.current = id; force((v) => v + 1) }
  const connected = (id: string) => !hover ? true : id === hover || EG_LINKS.some(([s, t]) => (s === hover && t === id) || (t === hover && s === id))

  return (
    <div className="eg">
      <svg viewBox={`0 0 ${W} ${H}`} ref={ref} className="eg-svg">
        {EG_LINKS.map(([s, t], i) => {
          const a = nodes![s], b = nodes![t]; const on = hover && (s === hover || t === hover)
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={on ? "var(--accent-3)" : "var(--rule-2)"} strokeWidth={on ? 1.6 : 1} strokeOpacity={hover && !on ? 0.12 : 0.5} />
        })}
        {EG_NODES.map((nd) => {
          const n = nodes![nd.id]; const c = EG_TYPES[nd.t].color; const lit = connected(nd.id)
          return (
            <g key={nd.id} style={{ opacity: lit ? 1 : 0.28, transition: "opacity .2s", cursor: "grab" }}
              onMouseEnter={() => setHover(nd.id)} onMouseLeave={() => setHover(null)}
              onMouseDown={onDown(nd.id)} onTouchStart={onDown(nd.id)}>
              <circle cx={n.x} cy={n.y} r={nd.r} fill={c} fillOpacity={nd.id === hover ? 0.95 : 0.8} stroke={c} strokeWidth={nd.id === hover ? 3 : 1.5} />
              <text x={n.x} y={n.y + nd.r + 15} textAnchor="middle" className="eg-lab">{nd.label}</text>
            </g>
          )
        })}
      </svg>
      <div className="eg-legend">
        {Object.entries(EG_TYPES).map(([k, v]) => <span key={k}><i style={{ background: v.color }} />{v.label}</span>)}
        <span className="eg-hint">drag nodes · hover to trace links</span>
      </div>
    </div>
  )
}

/* ---------- International Case-Study Map ---------- */
interface RegionMap { id: string; name: string; x: number; y: number; color: string; strat: string; facts: string[] }
const REGIONS_MAP: RegionMap[] = [
  { id: "us", name: "United States", x: 20, y: 42, color: "var(--c-blue)", strat: "Market-led innovation · Americas 33.2% share", facts: ["Market: $1.47B (2025) · 42.5% CAGR", "VC-driven: $4.8B in 2024–25, AI/software focus", "SEC climate disclosure; reactive, flexible regulation", "Players: Tesla, Figure, Boston Dynamics, Agility, 1X, Apptronik"] },
  { id: "eu", name: "Europe", x: 47, y: 36, color: "var(--pos)", strat: "Prescriptive standards · EMEA 22.3% share", facts: ["Market: $0.99B (2025) · 39.3% CAGR", "Public-private consortia: €2.1B, precision mechanical", "EU AI Act + structured safety framework", "Players: Schunk, PAL, ABB, Franka Emika, KUKA, NEURA"] },
  { id: "china", name: "China", x: 76, y: 44, color: "var(--c-red)", strat: "State-directed scale · APAC 48.6% share", facts: ["State-directed: $6.9B, components & manufacturing", "'1 Million AI Robots Plan' + $15B directed", "56% of value chain, 77% of integrators", "Players: UBTECH, BYD, Unitree, AgiBot, Fourier"] },
  { id: "japan", name: "Japan", x: 84, y: 40, color: "var(--c-violet)", strat: "Precision components", facts: ["METI certification; keiretsu networks", "World lead in harmonic drives & precision actuators", "Players: Harmonic Drive, Fanuc, Kawasaki, SoftBank", "Aging-workforce demand pull (−35% by 2040)"] },
  { id: "korea", name: "South Korea", x: 83, y: 47, color: "var(--c-amber)", strat: "Vertical integration", facts: ["KATS approval; chaebol-led initiatives", "Hyundai + Mobis own platform & actuators end-to-end", "25,000 Atlas units committed across Hyundai/Kia", "Highest robot density globally"] },
]

export function CaseStudyMap() {
  const [sel, setSel] = useState("china")
  const r = REGIONS_MAP.find((x) => x.id === sel) ?? REGIONS_MAP[0]
  return (
    <div className="csm">
      <div className="csm-map">
        <svg viewBox="0 0 100 64" className="csm-svg" preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width="100" height="64" fill="transparent" />
          {[16, 32, 48].map((y) => <line key={y} x1="2" x2="98" y1={y} y2={y} stroke="var(--rule)" strokeWidth="0.2" />)}
          {REGIONS_MAP.map((rg) => {
            const on = rg.id === sel
            return (
              <g key={rg.id} style={{ cursor: "pointer" }} onClick={() => setSel(rg.id)}>
                <circle cx={rg.x} cy={rg.y} r={on ? 4.4 : 3} fill={rg.color} fillOpacity={on ? 0.95 : 0.55} stroke={rg.color} strokeWidth={on ? 1 : 0.4}>
                  {on && <animate attributeName="r" values="4.4;5.2;4.4" dur="2.4s" repeatCount="indefinite" />}
                </circle>
                <text x={rg.x} y={rg.y - 5.5} textAnchor="middle" className={"csm-lab" + (on ? " on" : "")}>{rg.name}</text>
              </g>
            )
          })}
        </svg>
        <div className="csm-tabs">
          {REGIONS_MAP.map((rg) => (
            <button key={rg.id} className={"csm-tab" + (rg.id === sel ? " on" : "")} style={rg.id === sel ? { borderColor: rg.color, color: "var(--ink)" } : undefined} onClick={() => setSel(rg.id)}>
              <i style={{ background: rg.color }} />{rg.name}
            </button>
          ))}
        </div>
      </div>
      <div className="csm-detail" style={{ "--rc": r.color } as CSSProperties}>
        <div className="csm-dk">Regional playbook</div>
        <h3 className="csm-dn">{r.name}</h3>
        <div className="csm-strat">{r.strat}</div>
        <ul className="csm-facts">{r.facts.map((f, i) => <li key={i}>{f}</li>)}</ul>
      </div>
    </div>
  )
}

/* ---------- Certification Path Stepper ---------- */
interface CertStep { k: string; t: string; d: string; out: string }
const CERT_STEPS: CertStep[] = [
  { k: "Foundations", t: "2 days", d: "Embodied-AI fundamentals, the value chain, and the market thesis. Assessment: a market-sizing exercise.", out: "Industry literacy" },
  { k: "Technical Core", t: "3 days", d: "Actuator selection, AI integration (GR00T / Gemini / custom), and the sensing stack. Lab: build an actuator spec.", out: "Systems competency" },
  { k: "Deployment", t: "2 days", d: "Pilot design, WMS/MES integration, and ROI modelling. Workshop: design a factory pilot end-to-end.", out: "Deployment readiness" },
  { k: "Safety & Ops", t: "2 days", d: "Incident-response protocols, ISO 25785 readiness, and change management. Simulation: run a safety breach.", out: "Operational safety" },
  { k: "Capstone", t: "1 day", d: "Present three deliverables to a review panel: Strategic Implementation Plan, Technical Integration Blueprint, Transformation Risk Assessment.", out: "Certified Practitioner" },
]
const CERT_TRACKS = ["Technical Innovators — implementation expertise", "Executive Leaders — transformation governance"]

export function CertStepper() {
  const [step, setStep] = useState(0)
  const done = step >= CERT_STEPS.length - 1
  const pct = ((step + 1) / CERT_STEPS.length) * 100
  return (
    <div className="cert">
      <div className="cert-track">
        <div className="cert-fill" style={{ width: pct + "%" }} />
        {CERT_STEPS.map((s, i) => (
          <button key={i} className={"cert-dot" + (i <= step ? " done" : "") + (i === step ? " cur" : "")} style={{ left: ((i + 0.5) / CERT_STEPS.length * 100) + "%" }} onClick={() => setStep(i)}>
            <span className="cert-dn">{i + 1}</span><span className="cert-dl">{s.k}</span>
          </button>
        ))}
      </div>
      <div className="cert-body">
        <div className="cert-meta"><span className="cert-stage">Stage {step + 1} / {CERT_STEPS.length}</span><span className="cert-dur">{CERT_STEPS[step].t}</span></div>
        <h3 className="cert-t">{CERT_STEPS[step].k}</h3>
        <p className="cert-d">{CERT_STEPS[step].d}</p>
        <div className="cert-out">Outcome <b>{CERT_STEPS[step].out}</b></div>
        <div className="cert-ctrl">
          <button className="cert-btn" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>← Back</button>
          <button className="cert-btn primary" disabled={done} onClick={() => setStep((s) => Math.min(CERT_STEPS.length - 1, s + 1))}>{done ? "Path complete ✓" : "Next stage →"}</button>
        </div>
        {done && <div className="cert-tracks">
          <div className="cert-tk">Dual-track credential</div>
          {CERT_TRACKS.map((t, i) => <div className="cert-trow" key={i}><span />{t}</div>)}
          <div className="cert-stat">Organizations with 3+ certified members report <b>42% higher</b> implementation success and <b>67% faster</b> time-to-value.</div>
        </div>}
      </div>
    </div>
  )
}
