"use client"

import { useState } from "react"

export function ResearchAssets() {
  const rows = [
    ["Frame + investigate", "Literature, models, code", "Relevant questions and usable records", "Can the claim survive an independent test?"],
    ["Measure + revise", "Experiment design and analysis", "Samples, calibrated instruments, operators", "Does the result reproduce?"],
    ["Make + integrate", "Design alternatives and diagnostics", "Suppliers, process knowledge, production", "Does it work repeatedly in the product?"],
    ["Deliver + support", "Documentation and technical assistance", "Customers, service, responsibility", "Does the customer obtain a useful benefit?"],
  ]
  return <><svg viewBox="0 0 1000 145" role="img" aria-label="Research has four connected stages: investigate, measure, integrate and deliver. Digital assistance connects to physical and organisational assets at every stage."><path d="M80 70H910" stroke="#526476"/>{rows.map((row,i)=><g key={row[0]}><circle cx={100+i*265} cy="70" r="23" fill="#14263a" stroke={i<2?"#7ed1d2":"#e7b778"}/><text x={100+i*265} y="76" textAnchor="middle">{i+1}</text><text x={100+i*265} y="125" textAnchor="middle">{row[0]}</text></g>)}</svg><div className="iwp-table-scroll"><table className="iwp-table"><thead><tr>{["Work", "Digital assistance", "Complementary assets", "Evidence of value"].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row[0]}>{row.map((cell,i)=><td key={i}>{cell}</td>)}</tr>)}</tbody></table></div></>
}

const entries = [
  {name:"A component",buyer:"Product manufacturer",offer:"A better optimisation routine",test:"Independent correctness and integration tests",dependency:"Interfaces, qualification and distribution",outcome:"Licence, supply contract or acquisition"},
  {name:"A research service",buyer:"Operator with a narrow problem",offer:"An informative, reproducible experiment",test:"A specified question answered with usable evidence",dependency:"Customer records and test facilities",outcome:"Paid investigation or continuing collaboration"},
  {name:"A specialised tool",buyer:"Engineering or maintenance team",offer:"A useful decision from existing observations",test:"Held-out records followed by monitored operation",dependency:"Reliable data access and accountable deployment",outcome:"Service contract or pressure on an incumbent offer"},
]
export function ValuablePiece() {
  const [index,setIndex]=useState(0), selected=entries[index]
  return <><div className="iwp-controls">{entries.map((e,i)=><button key={e.name} type="button" aria-pressed={i===index} onClick={()=>setIndex(i)}>{e.name}</button>)}</div><svg viewBox="0 0 1000 220" role="img" aria-label={`Commercial scenario: a small lab supplies ${selected.offer.toLowerCase()} to a ${selected.buyer.toLowerCase()}. This is a possible entry point, not a reported transaction.`}><path d="M170 100H815" stroke="#7ed1d2" strokeWidth="2"/><circle cx="170" cy="100" r="62" fill="#14263a" stroke="#7ed1d2"/><text x="170" y="96" textAnchor="middle" className="iwp-svg-title">Small lab</text><text x="170" y="120" textAnchor="middle">A bounded promise</text><rect x="355" y="55" width="260" height="90" rx="8" fill="#1d2b3b" stroke="#e7b778"/><text x="485" y="108" textAnchor="middle" className="iwp-svg-title">{selected.name}</text><circle cx="815" cy="100" r="62" fill="#14263a" stroke="#b6a1e4"/><text x="815" y="97" textAnchor="middle" className="iwp-svg-title">Customer</text><text x="815" y="122" textAnchor="middle">A useful result</text><text x="500" y="200" textAnchor="middle">Win a valuable decision inside an existing industry.</text></svg><dl className="iwp-fact-grid" aria-live="polite">{Object.entries({Buyer:selected.buyer,Offer:selected.offer,Test:selected.test,Dependency:selected.dependency,"Possible outcome":selected.outcome}).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></>
}

export function MetrologyProjection() {
  return <svg viewBox="0 0 1000 430" role="img" aria-label="Educational metrology diagram. An illumination path meets a patterned wafer; a measurement returns to a detector. A correction loop links observations with the process. This is not an ASML machine model."><defs><linearGradient id="iwp-wafer"><stop stopColor="#7ed1d2" stopOpacity=".3"/><stop offset="1" stopColor="#b6a1e4" stopOpacity=".08"/></linearGradient></defs><ellipse cx="495" cy="290" rx="250" ry="70" fill="url(#iwp-wafer)" stroke="#7ed1d2"/>{Array.from({length:11},(_,i)=><path key={i} d={`M${340+i*27} 270l45 35`} stroke="#7ed1d2" opacity=".5"/>)}<path d="M250 85L495 280L745 85" fill="none" stroke="#e7b778" strokeWidth="3"/><rect x="185" y="45" width="130" height="57" rx="8" fill="#14263a" stroke="#e7b778"/><rect x="680" y="45" width="130" height="57" rx="8" fill="#14263a" stroke="#b6a1e4"/><text x="250" y="79" textAnchor="middle">Illumination</text><text x="745" y="79" textAnchor="middle">Measurement</text><path d="M820 75H925V370H180V295H230" fill="none" stroke="#526476" strokeDasharray="5 7"/><text x="495" y="380" textAnchor="middle">Observe → estimate error → adjust → measure again</text><text x="495" y="185" textAnchor="middle">Geometry + calibration + physical evidence</text><text x="495" y="322" textAnchor="middle">Patterned wafer · schematic, arbitrary units</text></svg>
}

export function MotorProjection() {
  return <svg viewBox="0 0 1000 420" role="img" aria-label="Generic conceptual motor cross-section with six stator regions, a rotor and a shaft. It identifies electromagnetic, thermal, vibration and production questions. No Dyson design or simulated performance is represented."><circle cx="280" cy="200" r="138" fill="none" stroke="#526476" strokeWidth="20"/>{Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return <g key={i} transform={`translate(${(280+105*Math.cos(a)).toFixed(3)},${(200+105*Math.sin(a)).toFixed(3)}) rotate(${i*60})`}><rect x="-32" y="-22" width="64" height="44" rx="7" fill="#e7b778" fillOpacity=".35" stroke="#e7b778"/></g>})}<circle cx="280" cy="200" r="64" fill="#7ed1d2" fillOpacity=".18" stroke="#7ed1d2"/><circle cx="280" cy="200" r="15" fill="#b6a1e4"/><path d="M300 200H520" stroke="#b6a1e4"/><text x="540" y="206">Shaft + rotor</text>{[[75,"Magnetic field and control"],[130,"Heat removal and losses"],[280,"Vibration and acoustic response"],[335,"Materials and repeatable assembly"]].map(([y,t])=><g key={String(t)}><circle cx="550" cy={Number(y)-5} r="4" fill="#e7b778"/><text x="570" y={Number(y)}>{t}</text></g>)}<text x="280" y="385" textAnchor="middle">Six conceptual stator regions · arbitrary dimensions</text></svg>
}

const companies = [
  ["ASML","Computation calibrated against machines and wafers","Measurement, precision, integration and customer production","A specialised correction, modelling or diagnostic contribution","Use more research attempts with strong physical evaluation"],
  ["IBM","Released models for molecular representations","Experimental collaboration and enterprise integration","Adapt public methods to a narrow materials question","Make shared methods useful through measured outcomes"],
  ["Google","AI-supported algorithms and operating improvements","Compute, evaluators, infrastructure and deployment","A narrow algorithm or application with an independent test","Apply research to systems it can evaluate and operate"],
  ["Dyson","Multidisciplinary modelling and motor engineering","Prototypes, product tests, manufacturing and customer experience","A component, control method or specialised product","Expand design search while preserving whole-product tests"],
]
export function CompanyComparison() {
  return <div className="iwp-table-scroll"><table className="iwp-table"><caption>Observed activity and analytical possibilities · no numerical moat score</caption><thead><tr>{["Company","Documented starting point","Complementary strengths","Possible challenger entry","Constructive incumbent response"].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{companies.map(row=><tr key={row[0]}>{row.map((cell,i)=><td key={i}>{cell}</td>)}</tr>)}</tbody></table></div>
}
