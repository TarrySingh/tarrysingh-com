"use client"

import { useId, useState } from "react"
import { effectiveSamples, labScenario } from "@/lib/synaptic/intelligence-without-permission/scenarios"
import { SpatialFigure } from "./SpatialFigure"

const number=(n:number)=>n.toLocaleString("en-US",{maximumFractionDigits:1})
function Slider({ label, value, min, max, step=1, onChange, display }: { label:string;value:number;min:number;max:number;step?:number;onChange:(value:number)=>void;display:string }) {
  const id=useId()
  return <div className="iwp-slider"><label htmlFor={id}>{label}<output>{display}</output></label><input id={id} type="range" min={min} max={max} step={step} value={value} onChange={event=>onChange(Number(event.target.value))}/></div>
}

function QueueDiagram({ attempted, unique, checked, accepted }: { attempted:number;unique:number;checked:number;accepted:number }) {
  return <svg viewBox="0 0 1000 330" role="img" aria-label={`Illustrative daily queue: ${number(attempted)} attempts, ${number(unique)} unique candidates, ${number(checked)} checked, ${number(accepted)} expected accepted results.`}>{[["Attempts",attempted],["Unique candidates",unique],["Checked",checked],["Accepted",accepted]].map(([label,n],i)=><g key={label} transform={`translate(${65+i*240},75)`}><text x="0" y="0" className="iwp-svg-title">{label}</text><text x="0" y="85" className="iwp-svg-number" style={{fontSize:39}}>{number(Number(n))}</text><line x1="0" x2="170" y1="108" y2="108" stroke={i===2?"#e7b778":"#314050"}/><text x="0" y="140">{["One attempt / agent / day","Assumed 25% distinct","Capacity-limited review","Assumed 20% pass"][i]}</text>{i<3&&<path d="M177 61h38m-7-5 7 5-7 5" fill="none" stroke="#7ed1d2"/>}</g>)}<text x="500" y="290" textAnchor="middle">Expected values under visible assumptions. No measured agent capability is implied.</text></svg>
}

export function AgentLab() {
  return <SpatialFigure kind="agents" fallback={<QueueDiagram attempted={1000} unique={250} checked={250} accepted={50}/>} description="Agent research queue with adjustable population, diversity, independent checking capacity and acceptance assumptions."/>
}

export function Coordination() {
  const [rho,setRho]=useState(.05)
  const n=1000
  return <><div className="iwp-metrics"><div><strong>+80.8%</strong><span>best reported relative change in one study setting</span></div><div><strong>−70.0%</strong><span>reported change in a sequential-planning setting</span></div><div><strong>260</strong><span>configurations in the cited study</span></div></div><p className="iwp-notice">Kim et al., version 3 (April 2026): outcomes depend on task and architecture. These figures are not observations of million-agent research.</p><Slider label="Separate mathematical illustration: assumed correlation" value={rho} min={0} max={1} step={.01} onChange={setRho} display={rho.toFixed(2)}/><svg viewBox="0 0 1000 230" role="img" aria-label={`For an equicorrelated mean of 1000 estimates, correlation ${rho} gives effective sample size ${number(effectiveSamples(n,rho))}. This is not a forecast of scientific output.`}><text x="55" y="55" className="iwp-svg-title">1,000 estimates</text><rect x="55" y="80" width="890" height="32" fill="#26394e"/><rect x="55" y="80" width={890*effectiveSamples(n,rho)/n} height="32" fill="#e7b778"/><text x="55" y="160" className="iwp-svg-number">{number(effectiveSamples(n,rho))}</text><text x="250" y="157">effective independent samples for the variance of a mean</text><text x="55" y="206">Formula: n / [1 + (n − 1)ρ]. A diagnostic analogy; agents need not satisfy these assumptions.</text></svg></>
}

export function CheckedCost() {
  const [attemptCost,setAttemptCost]=useState(.1)
  const [experimentCost,setExperimentCost]=useState(50)
  const data=labScenario({agents:1000,uniqueFraction:.25,checkCapacity:500,passRate:.2,attemptCost,checkCost:2,experimentCost})
  const costs=[['Model + tool attempts',data.inference,'#7ed1d2'],['Independent checking',data.checking,'#b6a1e4'],['Physical tests per accepted candidate',data.experiments,'#e7b778']] as const
  return <><div className="iwp-control-grid"><Slider label="Cost per attempt (illustrative USD)" min={0} max={5} step={.05} value={attemptCost} onChange={setAttemptCost} display={`$${attemptCost.toFixed(2)}`}/><Slider label="Physical test cost (illustrative USD)" min={0} max={500} step={5} value={experimentCost} onChange={setExperimentCost} display={`$${experimentCost}`}/></div><svg viewBox="0 0 1000 300" role="img" aria-label={`Scenario cost total ${number(data.total)} dollars, or ${number(data.costPerAccepted||0)} dollars per accepted candidate including an assumed physical test.`}>{costs.map(([label,value,color],i)=><g key={label} transform={`translate(0,${45+i*70})`}><text x="360" y="20" textAnchor="end">{label}</text><rect x="385" y="0" width={data.total?value/data.total*440:0} height="30" fill={color}/><text x="950" y="21" textAnchor="end">${number(value)}</text></g>)}<text x="55" y="280">1,000 attempts · 25% unique · 250 checked at $2 each · 20% pass · 50 physical tests</text></svg><div className="iwp-metrics"><div><strong>${number(data.total)}</strong><span>total scenario cost</span></div><div><strong>${number(data.costPerAccepted||0)}</strong><span>per accepted candidate, including a test</span></div><div><strong>50</strong><span>accepted candidates; test outcomes unknown</span></div></div><p className="iwp-notice">All prices are assumptions, not provider quotes. Accepted means passing the scenario’s initial check; a physical test may still fail. Salaries, facilities, capital, integration, taxes and liability are excluded.</p></>
}
