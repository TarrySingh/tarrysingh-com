export function VortexDiagram() {
  const paths = Array.from({length:16},(_,i)=>{
    const points=Array.from({length:110},(_,j)=>{
      const t=j/109,angle=i*Math.PI/8+t*7,r=120*(1-.65*t)
      return `${500+Math.cos(angle)*r},${80+t*230+Math.sin(angle)*r*.25}`
    })
    return <polyline key={i} points={points.join(" ")} fill="none" stroke={i%3===0?"#e7b778":"#7ed1d2"} opacity={i%3===0?.9:.3} strokeWidth={i%3===0?2:1}/>
  })
  return <svg viewBox="0 0 1000 390" role="img" aria-label="Illustrative vortex geometry narrowing along an axial direction. This finite parametric drawing is not a Navier–Stokes solution or proof."><line x1="500" y1="50" x2="500" y2="350" stroke="#b6a1e4" strokeDasharray="4 5"/>{paths}<path d="M195 130h160m450 135H620" stroke="#e7b778"/><text x="60" y="104" className="iwp-svg-title">Rotation</text><text x="60" y="129">A geometric illustration</text><text x="825" y="246" className="iwp-svg-title">Concentration</text><text x="825" y="272">A smaller spatial region</text><text x="500" y="372" textAnchor="middle">Finite geometry · no singularity is simulated</text></svg>
}

export function VerificationTimeline() {
  const rows=[
    ["08 SEP 2026","Announcement","OpenAI states the result and describes its research process.","Released"],
    ["08 SEP 2026","Manuscript","The mathematical claim can be read with its assumptions.","Released"],
    ["AT CUT-OFF","Formal artefact","Lean material is public; this essay has not rebuilt it.","Available"],
    ["NOT ESTABLISHED HERE","Independent acceptance","Requires evidence beyond the announcing organisation.","Unresolved"],
    ["SEPARATE PROCESS","Millennium Prize","Qualifying publication, elapsed time and general acceptance.","Not awarded here"],
  ]
  return <svg viewBox="0 0 1000 455" role="img" aria-label="Evidence timeline separating the September 8 announcement, manuscript and formal artefact from independent acceptance and the Clay prize process."><line x1="240" x2="240" y1="45" y2="390" stroke="#314050"/>{rows.map(([date,title,detail,status],i)=><g key={title} transform={`translate(0,${40+i*78})`}><text x="210" y="8" textAnchor="end" style={{fontSize:10}}>{date}</text><circle cx="240" cy="4" r="7" fill={i<3?"#7ed1d2":"#101e30"} stroke={i<3?"#7ed1d2":"#b6a1e4"}/><text x="270" y="10" className="iwp-svg-title">{title}</text><text x="270" y="37">{detail}</text><text x="975" y="10" textAnchor="end" style={{fill:i<3?"#7ed1d2":"#b6a1e4",fontSize:11}}>{status}</text></g>)}</svg>
}

export function FermatTimeline() {
  return <svg viewBox="0 0 1000 350" role="img" aria-label="Fermat’s original proof was published in 1995. AI-assisted formalisation was announced in September 2026. Discovery and formalisation are separate achievements."><path d="M60 130H940M60 240H940" stroke="#314050"/><text x="60" y="70">MATHEMATICAL PROOF</text><text x="60" y="197">FORMAL INFRASTRUCTURE</text><circle cx="340" cy="130" r="8" fill="#e7b778"/><text x="340" y="110" textAnchor="middle" className="iwp-svg-title">1995</text><text x="340" y="158" textAnchor="middle">Wiles / Taylor–Wiles</text><text x="340" y="178" textAnchor="middle">Published human proof</text><path d="M340 138C340 215 650 175 815 232" fill="none" stroke="#e7b778" strokeDasharray="3 5"/><circle cx="550" cy="240" r="6" fill="#7ed1d2"/><text x="550" y="275" textAnchor="middle">Lean · Mathlib · human formalisation</text><circle cx="850" cy="240" r="9" fill="#b6a1e4"/><text x="850" y="220" textAnchor="middle" className="iwp-svg-title">2026</text><text x="850" y="275" textAnchor="middle">Anthropic formalisation</text><text x="500" y="325" textAnchor="middle">Schematic spacing. The later result does not replace the history of the first.</text></svg>
}

export function ProofDependencies() {
  const nodes=[
    {x:500,y:35,label:"fermat_last_theorem",note:"Positive natural numbers; exponent ≥ 3"},
    {x:500,y:125,label:"FLT.fermatLastTheorem",note:"Mathlib formulation"},
    {x:500,y:215,label:"Reduction to prime p ≥ 5",note:"Exponent 3 and 4 handled separately"},
    {x:245,y:325,label:"of_counterexample",note:"Construct a Frey package"},
    {x:755,y:325,label:"no_frey_package",note:"Derive a contradiction"},
  ]
  return <><svg viewBox="0 0 1000 425" role="img" aria-label="A bounded dependency slice from the released Fermat proof path, from the final statement through the prime-exponent reduction to constructing and excluding a Frey package."><path d="M500 70V100M500 160V190M500 250V270L245 300M500 270L755 300" fill="none" stroke="#7ed1d2"/>{nodes.map(n=><g key={n.label}><rect x={n.x-190} y={n.y-7} width="380" height="67" rx="3" fill="#14263a" stroke="#314050"/><text x={n.x} y={n.y+18} textAnchor="middle" className="iwp-svg-title" style={{fontSize:16}}>{n.label}</text><text x={n.x} y={n.y+42} textAnchor="middle">{n.note}</text></g>)}</svg><p className="iwp-notice">Source: the repository’s <a href="https://github.com/anthropics/fermats-last-theorem/blob/main/PROOF-PATH.md">PROOF-PATH.md</a>, steps 1–2. Names below the reduction omit the FreyPackage namespace for readability. Edges show the documented dependency direction. This is a source inspection, not an independent build verdict.</p></>
}
