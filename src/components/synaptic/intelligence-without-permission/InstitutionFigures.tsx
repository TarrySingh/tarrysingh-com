"use client"

import { useState } from "react"
import land from "../../../../public/synaptic/intelligence-without-permission/world-land.json"

const countries=[{name:"Brazil",lat:-14,lon:-52},{name:"Nigeria",lat:9,lon:8},{name:"Netherlands",lat:52,lon:5},{name:"Kenya",lat:0,lon:38},{name:"India",lat:22,lon:79},{name:"Bangladesh",lat:24,lon:90}]
export function AccessMap() {
  const [selected,setSelected]=useState("Kenya")
  return <><div className="iwp-controls">{countries.map(country=><button type="button" key={country.name} aria-pressed={country.name===selected} onClick={()=>setSelected(country.name)}>{country.name}</button>)}</div><svg viewBox="0 0 900 410" role="img" aria-label={`Six sampled countries listed by OpenAI and Anthropic for API access: Brazil, Nigeria, Netherlands, Kenya, India and Bangladesh. ${selected} is selected. Other countries have not been assessed in this figure.`}>{[-60,-30,0,30,60].map(lat=><line key={lat} x1="0" x2="900" y1={(90-lat)*2.5} y2={(90-lat)*2.5} stroke="#1a2b3e"/>)}{land.paths.map((d,i)=><path key={i} d={d} fill="#25364a" stroke="#445366" strokeWidth=".4"/>)}{countries.map(country=><g key={country.name}><circle cx={(country.lon+180)*2.5} cy={(90-country.lat)*2.5} r={country.name===selected?13:6} fill={country.name===selected?"#e7b778":"#7ed1d2"} stroke="#101e30" strokeWidth="2"/>{country.name===selected&&<text x={(country.lon+180)*2.5+20} y={(90-country.lat)*2.5+5} style={{fill:"#f2e9d6",fontSize:16}}>{country.name}</text>}</g>)}</svg><div className="iwp-notice" aria-live="polite"><strong>{selected}: listed for commercial API access by both providers on 9 September 2026.</strong> This establishes a country-list condition only. Account eligibility, payment, price, connectivity, tools and access to internal research models are separate questions.</div><p className="iwp-figure-kicker" style={{marginTop:18}}>Six-country sample · grey land is unassessed, not unsupported</p><div className="iwp-table-scroll"><table className="iwp-table"><caption className="sr-only">Accessible access-map data</caption><thead><tr><th>Country</th><th>OpenAI API list</th><th>Anthropic API list</th><th>Effective research access</th></tr></thead><tbody>{countries.map(c=><tr key={c.name}><td>{c.name}</td><td>Listed</td><td>Listed</td><td>Not established by listing alone</td></tr>)}</tbody></table></div></>
}

export function OutsideResearch() {
  const steps=[['Local question','Repeated pump failures','Knowledge of operating conditions'],['Usable record','Maintenance + measurements','Check dates, units and missing data'],['Candidate explanation','Compare plausible mechanisms','Models assist; local experts challenge'],['Informative test','Choose an affordable observation','A facility or partner may be required'],['Useful response','Assess a change under real conditions','Customer or community judges benefit']]
  return <svg viewBox="0 0 1000 470" role="img" aria-label="Explicit hypothetical research workflow for a local engineering group: question, record, explanation, test and response. No real person or case is represented."><text x="45" y="30">ILLUSTRATIVE WORKFLOW · NOT A REPORTED CASE</text><path d="M95 85V405" stroke="#7ed1d2"/>{steps.map(([title,detail,need],i)=><g key={title} transform={`translate(0,${70+i*77})`}><circle cx="95" cy="10" r="19" fill="#14263a" stroke="#e7b778"/><text x="95" y="15" textAnchor="middle" style={{fill:"#e7b778"}}>{i+1}</text><text x="140" y="8" className="iwp-svg-title">{title}</text><text x="140" y="33">{detail}</text><text x="540" y="20">{need}</text><line x1="140" x2="950" y1="54" y2="54" stroke="#314050"/></g>)}</svg>
}

export function UniversityFunctions() {
  const rows=[
    ['Teaching','Explanations become easier to obtain','Develop judgement through practice and feedback'],
    ['Assessment','Polished output proves less about the learner','Test understanding, transfer and error detection'],
    ['Research','More outsiders can attempt difficult work','Offer strong questions, methods and criticism'],
    ['Facilities','Digital proposals create demand for experiments','Provide reliable, fairly accessible measurements'],
    ['Verification','More plausible claims compete for attention','Make checking explicit, independent and durable'],
    ['Public goods','Models depend on shared knowledge and tools','Maintain data, libraries and long-term stewardship'],
  ]
  const [active,setActive]=useState(0)
  return <><div className="iwp-controls">{rows.map((row,i)=><button key={row[0]} type="button" aria-pressed={active===i} onClick={()=>setActive(i)}>{row[0]}</button>)}</div><svg viewBox="0 0 1000 260" role="img" aria-label={`${rows[active][0]}: ${rows[active][1]}. Institutional contribution: ${rows[active][2]}.`}><circle cx="170" cy="125" r="83" fill="none" stroke="#314050"/>{rows.map((row,i)=>{const a=i*Math.PI/3-Math.PI/2;return <circle key={row[0]} cx={170+83*Math.cos(a)} cy={125+83*Math.sin(a)} r={i===active?12:7} fill={i===active?"#e7b778":"#7ed1d2"}/>})}<text x="170" y="133" textAnchor="middle" className="iwp-svg-title">{rows[active][0]}</text><text x="340" y="64">WHAT CHANGES</text><text x="340" y="100" className="iwp-svg-title" style={{fontSize:19}}>{rows[active][1]}</text><text x="340" y="155">WHAT THE INSTITUTION CAN ADD</text><text x="340" y="191" className="iwp-svg-title" style={{fontSize:19}}>{rows[active][2]}</text></svg><details><summary>All six functions</summary><table className="iwp-table"><tbody>{rows.map(row=><tr key={row[0]}>{row.map((cell,i)=><td key={i}>{cell}</td>)}</tr>)}</tbody></table></details></>
}

export function PublicLineage() {
  return <svg viewBox="0 0 1000 395" role="img" aria-label="Two contribution chains: human mathematics, Lean and Mathlib and human formalisation support the AI Fermat artefact. Experimental structural biology and public structure data support modern protein prediction and design. The network does not claim exclusive causation.">{[80,255].map(y=><path key={y} d={`M70 ${y+45}H925`} stroke="#526476"/>)}{[
    [70,80,'Human mathematics','Frey · Serre · Ribet · Wiles'],[350,80,'Open formal tools','Lean · Mathlib · FLT projects'],[690,80,'AI formalisation','A released proof artefact'],
    [70,255,'Experimental science','Structures and measurements'],[350,255,'Public data + methods','PDB · shared research'],[690,255,'Prediction + design','AlphaFold · RFdiffusion · others'],
  ].map(([x,y,title,subtitle])=><g key={title}><circle cx={Number(x)} cy={Number(y)+45} r="7" fill={Number(x)>600?"#e7b778":"#7ed1d2"}/><text x={Number(x)} y={Number(y)} className="iwp-svg-title">{title}</text><text x={Number(x)} y={Number(y)+22}>{subtitle}</text></g>)}<text x="70" y="170">Credit follows the work across institutions, datasets and software.</text><text x="70" y="360">Selected contribution chains; not a complete history or an ownership diagram.</text></svg>
}
