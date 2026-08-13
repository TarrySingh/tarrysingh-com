"use client"

/** Field Guide — WarMap + ActuatorLab (ported 1:1). */

import { useState, useMemo, type ChangeEvent, type CSSProperties } from "react"

/* ---------- Supply-Chain War Map ---------- */
type NationKey = "US" | "China" | "Korea"
const NATIONS: Record<NationKey, { name: string; color: string; hex: string; strat: string }> = {
  US: { name: "United States", color: "var(--c-blue)", hex: "#3a59e8", strat: "Market-led · CHIPS Act · decentralized" },
  China: { name: "China", color: "var(--c-red)", hex: "#ff5a5f", strat: "State-directed · 5-Year Plans · subsidies" },
  Korea: { name: "South Korea", color: "var(--c-violet)", hex: "#7b61ff", strat: "Vertical integration · Hyundai + Mobis" },
}
interface Layer { id: string; label: string; US: number; China: number; Korea: number; note: string; hot?: boolean }
const LAYERS: Layer[] = [
  { id: "brain", label: "The Brain, AI & chips", US: 70, China: 22, Korea: 8, note: "NVIDIA & Google set the pace; China closing on models, gated on advanced chips." },
  { id: "sensors", label: "Sensors & vision", US: 38, China: 50, Korea: 12, note: "Western force/torque leadership; LiDAR increasingly China-made." },
  { id: "actuators", label: "Actuators, the muscles", US: 14, China: 56, Korea: 30, note: "China dominates roller-screw capacity; Korea's Mobis is the vertical wildcard.", hot: true },
  { id: "magnets", label: "Rare-earth magnets", US: 6, China: 86, Korea: 8, note: "China refines ~85%+ of rare earths, the deepest single dependency." },
  { id: "assembly", label: "Integration & assembly", US: 40, China: 45, Korea: 15, note: "77% of integrators are Chinese by count; US leads on brand & data." },
]
const NATION_ORDER: NationKey[] = ["US", "China", "Korea"]

export function WarMap() {
  const [layer, setLayer] = useState("actuators")
  const L = LAYERS.find((x) => x.id === layer) ?? LAYERS[0]
  return (
    <div className="war">
      <div className="war-layers">
        {LAYERS.map((l) => (
          <button key={l.id} className={"war-lbtn" + (layer === l.id ? " on" : "") + (l.hot ? " hot" : "")} onClick={() => setLayer(l.id)}>
            <span className="war-ldot">{l.hot && <em>★</em>}</span>
            <span className="war-ltxt">{l.label}</span>
            <span className="war-lmini">
              {NATION_ORDER.map((n) => (<span key={n} style={{ flexBasis: l[n] + "%", background: NATIONS[n].hex }} />))}
            </span>
          </button>
        ))}
      </div>
      <div className="war-stage">
        <div className="war-flow">
          {NATION_ORDER.map((n) => {
            const v = L[n]
            return (
              <div className="war-nation" key={n} style={{ "--nc": NATIONS[n].hex } as CSSProperties}>
                <div className="war-share"><span className="war-num">{v}<em>%</em></span><span className="war-cap">control</span></div>
                <div className="war-ring">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--paper-dark-3)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke={NATIONS[n].hex} strokeWidth="10" strokeDasharray={`${(v / 100) * 314} 314`} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: "stroke-dasharray .6s var(--ease)" }} />
                  </svg>
                  <span className="war-flag" style={{ color: NATIONS[n].hex }}>{n === "US" ? "US" : n === "China" ? "CN" : "KR"}</span>
                </div>
                <div className="war-nname">{NATIONS[n].name}</div>
                <div className="war-strat">{NATIONS[n].strat}</div>
              </div>
            )
          })}
        </div>
        <div className="war-note"><span className="war-note-k">Reading the layer</span><p>{L.note}</p></div>
      </div>
    </div>
  )
}

/* ---------- Actuator Selection Lab (Module 1) ---------- */
type CritKey = "precision" | "torque" | "speed" | "shock" | "cost" | "backlash"
interface Actuator { id: string; name: string; type: string; precision: number; torque: number; speed: number; shock: number; cost: number; backlash: number }
const ACTUATORS: Actuator[] = [
  { id: "roller", name: "Planetary roller screw", type: "Linear", precision: 9, torque: 10, speed: 7, shock: 6, cost: 3, backlash: 9 },
  { id: "ball", name: "Ball screw", type: "Linear", precision: 7, torque: 7, speed: 9, shock: 5, cost: 7, backlash: 6 },
  { id: "harmonic", name: "Harmonic drive", type: "Rotary", precision: 10, torque: 8, speed: 6, shock: 4, cost: 4, backlash: 10 },
  { id: "cycloidal", name: "Cycloidal drive", type: "Rotary", precision: 7, torque: 10, speed: 5, shock: 10, cost: 5, backlash: 6 },
  { id: "qdd", name: "Quasi-direct drive", type: "Rotary", precision: 6, torque: 6, speed: 10, shock: 9, cost: 8, backlash: 7 },
]
const CRITERIA: { k: CritKey; label: string }[] = [
  { k: "precision", label: "Precision" }, { k: "torque", label: "Torque density" }, { k: "speed", label: "Speed / backdrive" },
  { k: "shock", label: "Shock tolerance" }, { k: "cost", label: "Cost efficiency" }, { k: "backlash", label: "Low backlash" },
]
const PRESETS: Record<string, Record<CritKey, number>> = {
  legs: { precision: 7, torque: 10, speed: 6, shock: 10, cost: 5, backlash: 6 },
  arms: { precision: 10, torque: 7, speed: 7, shock: 5, cost: 4, backlash: 10 },
  hands: { precision: 9, torque: 4, speed: 9, shock: 4, cost: 7, backlash: 8 },
}

export function ActuatorLab() {
  const [w, setW] = useState<Record<CritKey, number>>({ precision: 7, torque: 10, speed: 6, shock: 10, cost: 5, backlash: 6 })
  const [preset, setPreset] = useState<string | null>("legs")
  const setOne = (k: CritKey) => (e: ChangeEvent<HTMLInputElement>) => { const val = +e.target.value; setW((p) => ({ ...p, [k]: val })); setPreset(null) }
  const applyPreset = (p: string) => { setW(PRESETS[p]); setPreset(p) }

  const scored = useMemo(() => {
    const totalW = Object.values(w).reduce((a, b) => a + b, 0) || 1
    return ACTUATORS.map((a) => {
      const raw = CRITERIA.reduce((s, c) => s + a[c.k] * w[c.k], 0)
      return { ...a, score: (raw / (totalW * 10)) * 100 }
    }).sort((x, y) => y.score - x.score)
  }, [w])
  const top = scored[0]

  return (
    <div className="lab">
      <div className="lab-controls">
        <div className="lab-presets">
          <span className="lab-pl">Application</span>
          {Object.keys(PRESETS).map((p) => (
            <button key={p} className={"lab-pbtn" + (preset === p ? " on" : "")} onClick={() => applyPreset(p)}>{p}</button>
          ))}
        </div>
        {CRITERIA.map((c) => (
          <div className="lab-w" key={c.k}>
            <label className="lab-wlab">{c.label} <span>{w[c.k]}</span></label>
            <input type="range" min="0" max="10" value={w[c.k]} onChange={setOne(c.k)} />
          </div>
        ))}
      </div>
      <div className="lab-results">
        <div className="lab-winner">
          <span className="lab-wk">Best match</span>
          <span className="lab-wn">{top.name}</span>
          <span className="lab-wt">{top.type} · score {Math.round(top.score)}/100</span>
        </div>
        <div className="lab-rank">
          {scored.map((a, i) => (
            <div className={"lab-row" + (i === 0 ? " win" : "")} key={a.id}>
              <span className="lab-rnk">{i + 1}</span>
              <span className="lab-rn">{a.name}<em>{a.type}</em></span>
              <span className="lab-rtrack"><span className="lab-rfill" style={{ width: a.score + "%" }} /></span>
              <span className="lab-rs">{Math.round(a.score)}</span>
            </div>
          ))}
        </div>
        <p className="lab-foot">Module 1 · Actuator selection bench. Scores weight each actuator&apos;s characteristics by your requirement priorities, a teaching model, not a procurement spec.</p>
      </div>
    </div>
  )
}
