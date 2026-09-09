import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { labScenario, effectiveSamples, savingsScenario, pipelineScenario, elapsedTimeScenario } from "../../src/lib/synaptic/intelligence-without-permission/scenarios"
import { reservoirHeight } from "../../src/lib/synaptic/intelligence-without-permission/geometry"
import { countNarrative, getManuscript } from "../../src/lib/synaptic/intelligence-without-permission/manuscript"
import { sources } from "../../src/lib/synaptic/intelligence-without-permission/sources"
import { analyse, crystalSites, distance, instruments, metrologySamples, sanitizeSettings, type SceneKind, type ScienceData } from "../../src/lib/synaptic/intelligence-without-permission/instruments"

const scientificData=(name:string):ScienceData=>JSON.parse(fs.readFileSync(path.join(process.cwd(),`public/synaptic/intelligence-without-permission/${name}.json`),'utf8'))

test('Metrology corrects known terms while preserving an unmodelled residual',()=>{
 const base={offset:1.5,rotation:.6,warp:0,correction:100,mode:1}
 for(const p of metrologySamples(base))assert.equal(Math.hypot(...p.after),0)
 const residual=metrologySamples({...base,warp:1})
 assert.ok(residual.some(p=>Math.hypot(...p.after)>.5))
 for(const p of metrologySamples({...base,correction:0}))assert.deepEqual(p.before,p.after)
})

test('Protein readouts reproduce the coordinate RMSD and keep residue selection aligned',()=>{
 const d=scientificData('protein'),rmsd=Math.sqrt(d.experimental!.reduce((sum,p,i)=>sum+distance(p,d.predicted![i])**2,0)/129)
 assert.ok(Math.abs(rmsd-d.rmsd_angstrom!)<1e-5)
 for(const residue of [1,64,129]){const result=analyse('protein',{...instruments.protein.defaults,residue},d);assert.equal(result.selected,residue-1);assert.equal(result.series[0].values[residue-1],distance(d.experimental![residue-1],d.predicted![residue-1]))}
})

test('Geological measurements do not change with display exaggeration or rock rendering',()=>{
 const base={...instruments.reservoir.defaults,alternative:.7,well:1.8,section:-1}
 const a=analyse('reservoir',base,{}),b=analyse('reservoir',{...base,exaggeration:1.8,material:0,cut:0},{})
 assert.deepEqual(a.readings,b.readings);assert.deepEqual(a.series,b.series)
 const top=reservoirHeight(base.well,base.section,0,base.alternative),baseline=reservoirHeight(base.well,base.section,0,0)
 assert.ok(Math.abs(top-baseline-.7*base.alternative*Math.exp(-(base.well**2+base.section**2)/7))<1e-12)
})

test('Periodic crystal expansion deduplicates boundaries and preserves neighbour distance',()=>{
 const d=scientificData('crystal')
 for(const n of [1,2,3]){const sites=crystalSites(d,n);assert.equal(new Set(sites.map(p=>p.join(','))).size,sites.length);const interior=sites.filter(p=>p.every(v=>v<n));assert.equal(interior.length,8*n**3)}
 const coords=d.fractional_points!;for(const [i,j] of d.bonds!)assert.ok(Math.abs(distance(coords[i],coords[j])-Math.sqrt(3)/4)<1e-12)
})

test('Zeta display controls leave the selected numerical function unchanged',()=>{
 const d=scientificData('zeta'),base=instruments.zeta.defaults
 const a=analyse('zeta',base,d),b=analyse('zeta',{...base,height:4,wire:1},d)
 assert.deepEqual(a.series,b.series);assert.equal(a.x.length,1201)
 const off=analyse('zeta',{...base,sigma:30},d);assert.equal(off.x.length,121);assert.equal(off.series[0].values[0],d.values![0][30])
})

test('Molecular proximity threshold is monotone and all stored contacts satisfy the 4 Å rule',()=>{
 const d=scientificData('binding'),count=(cutoff:number)=>d.contacts!.filter(a=>d.ligand!.some(b=>distance(a.xyz,b.xyz)<=cutoff)).length
 assert.ok(count(2)<=count(3)&&count(3)<=count(4));assert.equal(count(4),d.contacts!.length)
})

test('Shared settings reject nonfinite inputs and constrain externally supplied values',()=>{
 assert.deepEqual(sanitizeSettings('protein',{residue:Infinity,layout:'bad'}),instruments.protein.defaults)
 const s=sanitizeSettings('protein',{residue:100000,layout:-20,unknown:4});assert.equal(s.residue,129);assert.equal(s.layout,0);assert.ok(!('unknown' in s))
 for(const kind of Object.keys(instruments) as SceneKind[])for(const c of instruments[kind].controls){const s=sanitizeSettings(kind,{[c.key]:c.max+1000});assert.ok(s[c.key]<=c.max&&s[c.key]>=c.min)}
})

test("The published narrative meets the word floor without counting apparatus",()=>{
  assert.equal(countNarrative('# Heading\n\nThree real words. <Source id="S01" />\n<Figure id="V01" />\n```js\nnot narrative\n```'),3)
  const m=getManuscript()
  assert.equal(m.chapters.length,18)
  assert.ok(m.words>=40000,`${m.words} actual narrative words`)
  assert.equal(m.figureCount,38)
  const figureIds=m.chapters.flatMap(c=>[...c.source.matchAll(/<Figure id="(V\d+)"/g)].map(m=>m[1]))
  assert.equal(new Set(figureIds).size,38)
  for(const c of m.chapters) for(const [,id] of c.source.matchAll(/<Source id="(S\d+)"/g)) assert.ok(sources[id],`${c.id}: ${id}`)
})

test("The agent scenario preserves the checking bottleneck and the full budget",()=>{
  const config={agents:1000,uniqueFraction:.25,checkCapacity:250,passRate:.2,attemptCost:.1,checkCost:2,experimentCost:100}
  const a=labScenario(config), b=labScenario({...config,agents:1e6})
  assert.equal(a.accepted,50);assert.equal(b.accepted,50)
  assert.equal(a.checked+a.queued,a.unique)
  assert.equal(b.checked+b.queued,b.unique)
  assert.equal(a.total,5600);assert.equal(a.costPerAccepted,112)
  assert.ok(b.total>a.total)
  assert.equal(labScenario({...config,passRate:0}).costPerAccepted,null)
  assert.equal(labScenario({...config,agents:0}).total,0)
})

test("The correlation example has the independent and fully correlated limits",()=>{
  for(const n of [1,10,1000,1e6]){assert.equal(effectiveSamples(n,0),n);assert.equal(effectiveSamples(n,1),1)}
  assert.ok(effectiveSamples(1000,.1)<10)
})

test("Savings reconcile and cannot appear without a cost reduction",()=>{
  for(const share of [0,.25,.75,1]) for(const reduction of [0,.5,1]) for(const pass of [0,.5,1]){
    const r=savingsScenario(share,reduction,pass)
    assert.equal(r.newCost+r.newMargin+r.customerSaving,100)
    assert.equal(r.newPrice+r.customerSaving,100)
    assert.ok(r.newMargin>=20&&r.newCost>=0&&r.newPrice<=100)
    if(!share||!reduction)assert.equal(r.saving,0)
    if(pass===1)assert.equal(r.newMargin,20)
  }
  const example=savingsScenario(.25,.5,.5)
  assert.equal(example.newPrice,95);assert.equal(example.newCost,70);assert.equal(example.newMargin,25)
})

test("Pipeline capacity conserves candidates, including empty and blocked stages",()=>{
  for(const arrivals of [0,10,100,200]) for(const validation of [0,30,200]) for(const deployment of [0,10,200]){
    const r=pipelineScenario(arrivals,validation,deployment)
    assert.equal(r.deployed+r.awaitingDeployment+r.awaitingValidation,arrivals)
    assert.ok(r.deployed<=deployment&&r.validated<=validation)
    assert.ok(r.awaitingValidation>=0&&r.awaitingDeployment>=0)
  }
  assert.equal(pipelineScenario(100,30,10).deployed,pipelineScenario(200,30,10).deployed)
})

test("Elapsed-time illustration respects the unchanged-stage lower bound",()=>{
  for(const share of [.1,.5,.9]){
    assert.equal(elapsedTimeScenario(share,1).total,100)
    const fast=elapsedTimeScenario(share,100),slow=elapsedTimeScenario(share,2)
    assert.ok(fast.total<slow.total&&fast.total>=fast.unchanged)
    assert.equal(elapsedTimeScenario(share,Infinity).total,fast.unchanged)
  }
  assert.equal(elapsedTimeScenario(.5,10).total,55)
})

test("Synthetic geology has ordered nonintersecting layers in both views",()=>{
  for(const alt of [0,1])for(let x=-4;x<=4;x+=.2)for(let z=-3;z<=3;z+=.2)for(let layer=0;layer<3;layer++){
    const top=reservoirHeight(x,z,layer,alt),bottom=reservoirHeight(x,z,layer+1,alt)
    assert.ok(Number.isFinite(top)&&Number.isFinite(bottom));assert.ok(Math.abs(top-bottom-1.15)<1e-12)
  }
})

test("Scientific figure data have provenance and expected nonempty dimensions",()=>{
  const dir=path.join(process.cwd(),"public/synaptic/intelligence-without-permission")
  const read=(name:string)=>JSON.parse(fs.readFileSync(path.join(dir,name+".json"),"utf8"))
  const z=read("zeta"),p=read("protein"),c=read("crystal")
  assert.equal(z.real.length,41);assert.equal(z.imaginary.length,121);assert.equal(z.values.length,121)
  assert.ok(z.values.every((row:number[])=>row.length===41&&row.every(v=>Number.isFinite(v)&&v>=0)))
  assert.equal(p.experimental.length,129);assert.equal(p.predicted.length,129);assert.equal(p.confidence.length,129)
  assert.ok(p.experimental.flat().every(Number.isFinite)&&p.predicted.flat().every(Number.isFinite))
  assert.equal(c.fractional_points.length,18);assert.ok(c.bonds.length>0)
})
