"use client"
import { useEffect, useId, useRef, useState } from 'react'
import { fmt, type Analysis } from '@/lib/synaptic/intelligence-without-permission/instruments'

export function InstrumentPlot({analysis,onSelect}:{analysis:Analysis;onSelect?:(index:number)=>void}){
 const id=useId().replace(/:/g,''),{series,x,xLabel,yLabel,selected}=analysis
 const svg=useRef<SVGSVGElement>(null),[width,setWidth]=useState(780)
 useEffect(()=>{if(!svg.current)return;const observer=new ResizeObserver(entries=>setWidth(Math.max(280,Math.round(entries[0].contentRect.width))));observer.observe(svg.current);return()=>observer.disconnect()},[])
 if(!series.length||!x.length)return null
 const all=series.flatMap(s=>s.values),minimum=Math.min(0,...all),maximum=Math.max(.01,...all),range=maximum-minimum||1
 const right=width-30,span=right-48
 const px=(i:number)=>Number((48+i/(Math.max(1,x.length-1))*span).toFixed(3)),py=(v:number)=>Number((154-(v-minimum)/range*118).toFixed(3))
 const index=selected===undefined?undefined:Math.max(0,Math.min(x.length-1,selected))
 return <div className="iwp-linked-plot"><div className="iwp-plot-heading"><span>Linked measurement</span><span>{yLabel}</span></div><svg ref={svg} viewBox={`0 0 ${width} 204`} role="img" aria-label={`${yLabel} against ${xLabel}. ${series.map(s=>s.name).join('; ')}.`} onClick={onSelect?e=>{const r=e.currentTarget.getBoundingClientRect();const i=Math.round(((e.clientX-r.left)/r.width*width-48)/span*(x.length-1));onSelect(Math.max(0,Math.min(x.length-1,i)))}:undefined}>
  <defs><linearGradient id={`plot-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={series[0].color} stopOpacity=".2"/><stop offset="1" stopColor={series[0].color} stopOpacity="0"/></linearGradient></defs>
  {[0,.5,1].map(t=><g key={t}><line x1="48" x2={right} y1={36+t*118} y2={36+t*118} stroke="#284154" strokeDasharray={t===1?'':'3 5'}/><text x="38" y={40+t*118} textAnchor="end">{fmt(maximum-t*range,2)}</text></g>)}
  <path d={`M48,154 ${series[0].values.map((v,i)=>`L${px(i)},${py(v)}`).join(' ')} L${right},154 Z`} fill={`url(#plot-${id})`}/>
  {series.map((s,k)=><path key={s.name} d={s.values.map((v,i)=>`${i?'L':'M'}${px(i)},${py(v)}`).join(' ')} fill="none" stroke={s.color} strokeWidth={k?1.7:2.1} strokeDasharray={k&&series.length===2?'4 3':undefined}/>)}
  {[0,Math.floor((x.length-1)/2),x.length-1].map((i,k)=><text key={k} x={px(i)} y="177" textAnchor="middle">{fmt(x[i],2)}</text>)}
  <text x={(48+right)/2} y="198" textAnchor="middle">{xLabel}</text>
  {index!==undefined&&<g><line x1={px(index)} x2={px(index)} y1="25" y2="158" stroke="#f1e8d5" strokeOpacity=".4" strokeDasharray="3 4"/>{series.map(s=><circle key={s.name} cx={px(index)} cy={py(s.values[index])} r="4" stroke="#07111d" strokeWidth="2" fill={s.color}/>)}</g>}
 </svg><div className="iwp-plot-legend">{series.map(s=><span key={s.name}><i style={{background:s.color}}/>{s.name}</span>)}</div></div>
}
