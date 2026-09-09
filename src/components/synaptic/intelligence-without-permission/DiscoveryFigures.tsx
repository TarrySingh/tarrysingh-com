import crystal from "../../../../public/synaptic/intelligence-without-permission/crystal.json"
import algorithm from "../../../../public/synaptic/intelligence-without-permission/alphaevolve.json"

export function CrystalProjection() {
  const project=(p:number[])=>[390+(p[0]-p[2]) * 180,280-(p[1]*210)+(p[0]+p[2])*55]
  const corners=Array.from({length:8},(_,i)=>[i&1,(i>>1)&1,(i>>2)&1])
  return <svg viewBox="0 0 1000 440" role="img" aria-label="Diamond unit cell from COD 9008564. Cell edge 3.56679 angstroms; eight unique sites per periodic cell, with boundary atoms repeated for visibility.">{corners.flatMap((a,i)=>corners.map((b,j)=>i<j&&a.filter((x,k)=>x!==b[k]).length===1?<line key={`c${i}-${j}`} x1={project(a)[0]} y1={project(a)[1]} x2={project(b)[0]} y2={project(b)[1]} stroke="#526476" strokeDasharray="4 4"/>:null))}{crystal.bonds.map(([i,j])=><line key={`${i}-${j}`} x1={project(crystal.fractional_points[i])[0]} y1={project(crystal.fractional_points[i])[1]} x2={project(crystal.fractional_points[j])[0]} y2={project(crystal.fractional_points[j])[1]} stroke="#7ed1d2" strokeWidth="3"/>)}{crystal.fractional_points.map((p,i)=><circle key={i} cx={project(p)[0]} cy={project(p)[1]} r="9" fill="#e7b778" stroke="#101e30" strokeWidth="2"/>)}<text x="685" y="110" className="iwp-svg-title">A repeating structure</text><text x="685" y="150">Diamond · carbon</text><text x="685" y="180">Cell edge: 3.56679 Å</text><text x="685" y="210">Space group: 227</text><text x="685" y="240">8 sites per periodic cell</text><text x="685" y="295">Established experimental example.</text><text x="685" y="318">Not a newly predicted material.</text><text x="390" y="420" textAnchor="middle">Boundary atoms are shared with neighbouring cells.</text></svg>
}

export function AlgorithmIdentity() {
  return <><svg viewBox="0 0 1000 330" role="img" aria-label="Four-by-four complex matrix multiplication uses 49 scalar multiplications under recursive Strassen versus 48 in the published AlphaEvolve construction. All 4096 entries of the identity were independently checked."><text x="45" y="35">SCALAR MULTIPLICATIONS · 4 × 4 COMPLEX MATRICES</text>{[49,48].map((count,row)=><g key={count} transform={`translate(45,${90+row*120})`}><text x="0" y="-20" className="iwp-svg-title">{row===0?"Recursive Strassen":"Published AlphaEvolve construction"}</text>{Array.from({length:49},(_,i)=><rect key={i} x={i*15.4} y="0" width="11.5" height="38" fill={i<count?row===0?"#7ed1d2":"#e7b778":"none"} stroke={i<count?"none":"#526476"} strokeDasharray={i<count?undefined:"3 3"}/>)}<text x="905" y="36" textAnchor="end" className="iwp-svg-number">{count}</text></g>)}</svg><p className="iwp-notice"><strong>{algorithm.checked_entries.toLocaleString("en-US")} exact tensor entries checked.</strong> This verifies the identity in the published coefficient data. Fewer scalar multiplications do not automatically imply lower elapsed time or better numerical stability.</p></>
}

export function FeedbackComparison() {
  const rows=[
    ["Formal mathematics","A precise theorem statement","Proof checker + semantic review","Wrong statement, hidden assumptions"],
    ["Computational optimisation","An executable candidate","Correctness tests + representative workload","Overfitting the test or wrong metric"],
    ["Materials research","A predicted structure or property","Synthesis + characterisation","Unmakeable or impractical material"],
    ["Protein design","A candidate molecule","Production + measured behaviour","Prediction fails in physical conditions"],
    ["Clinical development","A candidate intervention","Appropriate evidence in people","Benefit or harm differs from early models"],
  ]
  return <div className="iwp-table-scroll"><table className="iwp-table"><caption className="sr-only">Feedback processes across five kinds of research; no invented comparable durations</caption><thead><tr>{["Work","Proposal","What gives feedback","What can go wrong"].map(s=><th key={s}>{s}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row[0]}>{row.map((s,i)=><td key={i}>{s}</td>)}</tr>)}</tbody></table></div>
}
