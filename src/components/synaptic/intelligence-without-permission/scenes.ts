import type * as Three from 'three'
import { crystalSites, distance, metrologySamples, zetaInterval, type SceneKind, type Settings, type ScienceData } from '@/lib/synaptic/intelligence-without-permission/instruments'
import { reservoirHeight } from '@/lib/synaptic/intelligence-without-permission/geometry'
type TModule=typeof Three
export type SceneLabel={text:string;position:number[];tone?:string}
export type SceneBundle={scene:Three.Scene;labels:SceneLabel[]}
const GOLD=0xffb64f,CYAN=0x35c9ec,VIOLET=0xb97bf1,WHITE=0xeaf5ff

export function createScene(T:TModule,kind:SceneKind,s:Settings,d:ScienceData):SceneBundle{
 const scene=new T.Scene(),labels:SceneLabel[]=[]
 scene.add(new T.AmbientLight(0xa9c9ef,.55))
 for(const [color,power,x,y,z] of [[0xffe5c6,2.8,4,8,6],[0x70d6ff,1.9,-6,2,1],[0xbfa7ff,1.8,1,3,-7]]){const light=new T.DirectionalLight(color,power);light.position.set(x,y,z);scene.add(light)}
 const material=(color:number,opacity=1,emission=.04)=>new T.MeshPhysicalMaterial({color,metalness:.28,roughness:.28,clearcoat:.65,clearcoatRoughness:.18,transparent:opacity<1,opacity,depthWrite:opacity>=1,emissive:color,emissiveIntensity:emission,side:T.DoubleSide})
 const ramp=(value:number)=>{const palette=[0x643dc9,0x277be8,0x21c6ce,0x9bdda3,0xf5c64e,0xf56d49],t=Math.max(0,Math.min(1,value))*(palette.length-1),index=Math.min(palette.length-2,Math.floor(t));return new T.Color(palette[index]).lerp(new T.Color(palette[index+1]),t-index).getHex()}
 const pointGroups=new Map<number,{p:number[];r:number;pick?:number}[]>(),bondGroups=new Map<number,{a:number[];b:number[];r:number}[]>()
 const point=(p:number[],color:number,r=.09,pick?:number)=>{const group=pointGroups.get(color)||[];group.push({p,r,pick});pointGroups.set(color,group)}
 const bond=(a:number[],b:number[],color:number,r=.045)=>{const group=bondGroups.get(color)||[];group.push({a,b,r});bondGroups.set(color,group)}
 const line=(points:number[][],color:number,opacity=.7,dashed=false)=>{const geometry=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const mat=dashed?new T.LineDashedMaterial({color,transparent:true,opacity,dashSize:.12,gapSize:.09}):new T.LineBasicMaterial({color,transparent:true,opacity});const object=new T.Line(geometry,mat);if(dashed)object.computeLineDistances();scene.add(object);return object}
 const tube=(points:number[][],color:number,r=.027,opacity=1,colorAt?:((t:number)=>number))=>{const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments=Math.max(40,points.length*2),geometry=new T.TubeGeometry(curve,segments,r,6,false),mat=material(color,opacity,.12);if(colorAt){const colors:number[]=[];for(let i=0;i<=segments;i++){const c=new T.Color(colorAt(curve.getUtoTmapping(i/segments,0)));for(let j=0;j<=6;j++)colors.push(c.r,c.g,c.b)}geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));mat.vertexColors=true;mat.color.set(WHITE);mat.emissive.set(0x122633)}const mesh=new T.Mesh(geometry,mat);scene.add(mesh);return mesh}
 const circle=(center:number[],r:number,color:number,axis='y',opacity=.5)=>line(Array.from({length:97},(_,i)=>{const a=i*Math.PI/48;return axis==='x'?[center[0],center[1]+r*Math.cos(a),center[2]+r*Math.sin(a)]:[center[0]+r*Math.cos(a),center[1],center[2]+r*Math.sin(a)]}),color,opacity)
 const label=(text:string,position:number[],tone='')=>labels.push({text,position,tone})
 const box=(size:number[],position:number[],color:number,opacity=1)=>{const mesh=new T.Mesh(new T.BoxGeometry(...size as [number,number,number]),material(color,opacity));mesh.position.set(...position as [number,number,number]);scene.add(mesh);return mesh}
 const cylinder=(radius:number,height:number,position:number[],color:number,opacity=1,open=false,start=0,length=Math.PI*2)=>{const mesh=new T.Mesh(new T.CylinderGeometry(radius,radius,height,64,1,open,start,length),material(color,opacity));mesh.position.set(...position as [number,number,number]);scene.add(mesh);return mesh}
 const grid=new T.GridHelper(12,24,0x29445a,0x173044);grid.position.y=-4.4;(grid.material as Three.Material).transparent=true;(grid.material as Three.Material).opacity=.22;scene.add(grid)
 circle([0,-4.38,0],5.8,0x39647a,'y',.23);circle([0,-4.37,0],6.1,0x29445a,'y',.12)
 if(kind==='atlas'){
  const colors=[0xff946b,CYAN,VIOLET,0xa2e4a9],counts=[16,64,12,7],names=['01 / ACCESS','02 / PROPOSALS','03 / VERIFICATION','04 / DEPLOYMENT']
  for(let layer=0;layer<4;layer++){
   const x=(layer*3-4.5)*s.spread,selected=s.stage===0||s.stage===layer+1,opacity=selected?1:.14
   circle([x,0,0],2.45,colors[layer],'x',opacity*.8);circle([x,0,0],2.6,colors[layer],'x',opacity*.2);label(names[layer],[x,-3.2,0],selected?'':'dim')
   for(let i=0;i<counts[layer];i++){const a=i*2.39996323,r=.7+1.55*Math.sqrt(i/counts[layer]),p=[x,Math.sin(a)*r,Math.cos(a)*r];point(p,selected?colors[layer]:0x33414c,selected?.09:.05);if(s.links&&layer<3&&i%2===0)line([p,[x+1.5*s.spread,p[1]*.65,p[2]*.75],[x+3*s.spread,p[1]*.4,p[2]*.4]],colors[layer],opacity*.16)}
   point([x,0,0],colors[layer],.19)
  }
  tube([[-4.5*s.spread,0,0],[-1.5*s.spread,0,0],[1.5*s.spread,0,0],[4.5*s.spread,0,0]],GOLD,.038);label('A claim must cross every boundary',[0,3.2,0],'gold')
 }
 if(kind==='vortex'){
  for(let i=0;i<s.filaments;i++){const pts=Array.from({length:100},(_,j)=>{const t=j/99,a=i*2*Math.PI/s.filaments+s.twist*t,r=2.5*(1-s.contraction*t);return [r*Math.cos(a),5*t-2.5,r*Math.sin(a)]});tube(pts,CYAN,i%8===0?.035:.02,i%8===0?1:.82,t=>ramp(s.color?i/Math.max(1,s.filaments-1):t))}
  const radius=2.5*(1-s.contraction*s.slice),y=5*s.slice-2.5,disc=new T.Mesh(new T.CircleGeometry(radius,96),material(GOLD,.1));disc.rotation.x=-Math.PI/2;disc.position.y=y;scene.add(disc);circle([0,y,0],radius,GOLD,'y',1)
  line([[0,-3.6,0],[0,3.5,0]],VIOLET,.7,true);line([[0,y,0],[radius,y,0]],GOLD,1);point([radius,y,0],WHITE,.09)
  label(`r = ${radius.toFixed(3)}`,[radius+.25,y,0],'gold');label('s = 0',[2.8,-2.5,0]);label('s = 1',[1.2,2.6,0]);label('Finite parametric geometry',[-1.9,3.6,0])
 }
 if(kind==='zeta'&&d.values&&d.imaginary&&d.real){
  const [lo,hi]=zetaInterval(s),rows=d.imaginary.map((t,j)=>({t,j})).filter(p=>p.t>=lo&&p.t<=hi),height=(v:number)=>Math.min(1.8,Math.log1p(v))*s.height-1.8
  const geometry=new T.PlaneGeometry(8,10,40,rows.length-1),positions=geometry.attributes.position,colors:number[]=[]
  rows.forEach(({t,j},row)=>d.real!.forEach((sigma,i)=>{const v=d.values![j][i],h=height(v),c=new T.Color(ramp(Math.log1p(v)/1.8));positions.setXYZ(row*41+i,(sigma-.5)*8,h,(t-(lo+hi)/2)*10/(hi-lo));colors.push(c.r,c.g,c.b)}))
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();const mat=material(CYAN,.9);mat.vertexColors=true;mat.wireframe=!!s.wire;mat.color.set(WHITE);scene.add(new T.Mesh(geometry,mat))
  for(const [index,color] of (s.sigma===20?[[20,GOLD]]:[[20,GOLD],[s.sigma,CYAN]]))tube(rows.map(({t,j})=>[(index/40-.5)*8,height(d.values![j][index])+.06,(t-(lo+hi)/2)*10/(hi-lo)]),color,.045)
  if(!s.wire){for(let i=0;i<=40;i+=4)line(rows.map(({t,j})=>[(i/40-.5)*8,height(d.values![j][i])+.016,(t-(lo+hi)/2)*10/(hi-lo)]),0x357c93,.26);rows.forEach(({t,j},k)=>{if(k%4===0)line(d.real!.map((sigma,i)=>[(sigma-.5)*8,height(d.values![j][i])+.016,(t-(lo+hi)/2)*10/(hi-lo)]),0x357c93,.26)})}
  for(const t of d.zeros!.filter(t=>t>=lo&&t<=hi)){const z=(t-(lo+hi)/2)*10/(hi-lo);point([0,-1.77,z],GOLD,.075);line([[0,-1.8,z],[0,-3,z]],GOLD,.35,true);label(t.toFixed(6),[0,-3.15,z],'gold')}
  const sx=(s.sigma/40-.5)*8,slice=new T.Mesh(new T.PlaneGeometry(10,6),material(CYAN,.045));slice.rotation.y=Math.PI/2;slice.position.set(sx,.7,0);scene.add(slice)
  line([[-4,-1.85,-5],[-4,-1.85,5],[4,-1.85,5]],0x6f95a6);label('σ = 0',[-4,-2.3,5.2]);label('σ = 1',[4,-2.3,5.2]);label(`t = ${lo}`,[-4.8,-1.8,-5]);label(`t = ${hi}`,[-4.8,-1.8,5]);label(`σ = ${(s.sigma/40).toFixed(3)}`,[sx,4,0],'cyan')
 }
 if(kind==='protein'&&d.experimental&&d.predicted){
  const delta=d.experimental.map((p,i)=>distance(p,d.predicted![i])),color=(i:number)=>s.color===2?ramp(i/128):s.color===1?ramp(delta[i]/1.85):d.confidence![i]>=90?CYAN:d.confidence![i]>=70?GOLD:VIOLET
  const coords=[d.experimental,d.predicted].map((set,k)=>set.map(p=>[p[0]*.19+(s.layout?(k===0?-3.3:3.3):0),p[1]*.19,p[2]*.19]))
  coords.forEach((set,k)=>{
   if(!s.trace){const curve=new T.CatmullRomCurve3(set.map(p=>new T.Vector3(...p))),geometry=new T.TubeGeometry(curve,768,.08,10,false),colors:number[]=[];for(let j=0;j<=768;j++){const index=Math.min(128,Math.round(curve.getUtoTmapping(j/768,0)*128)),c=new T.Color(k===0?CYAN:color(index));for(let q=0;q<=10;q++)colors.push(c.r,c.g,c.b)}geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));const mat=material(WHITE);mat.vertexColors=true;scene.add(new T.Mesh(geometry,mat))}
   for(let i=0;i<set.length;i++){if(i>0&&s.trace)bond(set[i-1],set[i],k===0?CYAN:color(i),.027);if(s.trace||i===s.residue-1)point(set[i],i===s.residue-1?WHITE:k===0?CYAN:color(i),i===s.residue-1?.17:.105,i+1)}
  })
  if(s.vectors)for(let i=0;i<coords[0].length;i++)line([coords[0][i],coords[1][i]],VIOLET,s.layout?.18:.65)
  const a=coords[0][s.residue-1],b=coords[1][s.residue-1];tube([a,b],WHITE,.028);label(`${d.residues![s.residue-1]} ${s.residue}`,[b[0]+.2,b[1]+.5,b[2]],'gold');label('EXPERIMENT · 1LYZ',[s.layout?-3.4:-3,-3.5,0],'cyan');label('PREDICTION · P00698',[s.layout?3.4:2.8,-3.5,0],'gold')
 }
 if(kind==='binding'&&d.ligand&&d.contacts&&d.backbone){
  const scale=.48,p=(xyz:number[])=>xyz.map(v=>v*scale),col=(e:string)=>e==='O'?0xf08879:e==='N'?0x83adff:e==='S'?0xf6d179:GOLD
  if(s.context)line(d.backbone.map(a=>p(a.xyz)),CYAN,.28)
  const neighbours=d.contacts.filter(a=>d.ligand!.some(b=>distance(a.xyz,b.xyz)<=s.cutoff))
  if(s.contacts)for(const a of neighbours){point(p(a.xyz),VIOLET,.09);let nearest=d.ligand[0];for(const b of d.ligand)if(distance(a.xyz,b.xyz)<distance(a.xyz,nearest.xyz))nearest=b;line([p(a.xyz),p(nearest.xyz)],VIOLET,.32,true)}
  d.ligand.forEach((a,i)=>{point(p(a.xyz),i===s.atom-1?WHITE:col(a.element),s.style?.37:.18,i+1);for(let j=0;j<i;j++)if(distance(a.xyz,d.ligand![j].xyz)<1.9)bond(p(a.xyz),p(d.ligand![j].xyz),GOLD,.07)})
  const selected=d.ligand[s.atom-1],nearest=[...d.contacts].sort((a,b)=>distance(a.xyz,selected.xyz)-distance(b.xyz,selected.xyz))[0]
  if(s.contacts&&distance(nearest.xyz,selected.xyz)<=s.cutoff){line([p(selected.xyz),p(nearest.xyz)],WHITE,1,true);point(p(nearest.xyz),WHITE,.15);const m=p(nearest.xyz);label(`${nearest.residue} ${nearest.number} / ${nearest.name}`,[m[0],m[1]+.5,m[2]])}
  const q=p(selected.xyz);label(`BTN / ${selected.name}`,[q[0]+.3,q[1]+.6,q[2]],'gold');label('Experimental ligand neighbourhood',[-2,3.5,0])
 }
 if(kind==='crystal'&&d.fractional_points){
  const n=s.repeat,scale=6.3/n,points=crystalSites(d,n).filter(p=>p[0]<=n*s.cut),transform=(p:number[])=>p.map(v=>(v-n/2)*scale)
  points.forEach(p=>point(transform(p),s.color?(Math.round(p[0]*4)%2?0xff9366:CYAN):GOLD,.18/Math.sqrt(n)))
  if(s.bonds)for(let i=0;i<points.length;i++)for(let j=0;j<i;j++)if(Math.abs(distance(points[i],points[j])-Math.sqrt(3)/4)<1e-6)bond(transform(points[i]),transform(points[j]),CYAN,.055/Math.sqrt(n))
  if(s.cells)for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++){const cellGeometry=new T.BoxGeometry(scale,scale,scale),edges=new T.EdgesGeometry(cellGeometry);cellGeometry.dispose();const edge=new T.LineSegments(edges,new T.LineBasicMaterial({color:0x4e7b91,transparent:true,opacity:.38}));edge.position.set((i+.5-n/2)*scale,(j+.5-n/2)*scale,(k+.5-n/2)*scale);scene.add(edge)}
  if(s.cut<1){const plane=new T.Mesh(new T.PlaneGeometry(6.3,6.3),material(VIOLET,.08));plane.rotation.y=Math.PI/2;plane.position.x=(n*s.cut-n/2)*scale;scene.add(plane);label('REVEAL PLANE',[plane.position.x,3.7,0],'gold')}
  label(`${n} × ${n} × ${n} conventional cells`,[0,-3.8,0]);label('DIAMOND / COD 9008564',[-1.7,3.8,0],'gold')
 }
 if(kind==='agents'){
  const population=Math.round(10**s.population),unique=population*s.unique/100,checked=Math.min(unique,s.capacity),accepted=checked*s.pass/100,groups=Math.round(180*s.population),sat=unique>s.capacity
  for(let i=0;i<groups;i++){const a=i*2.39996323,r=Math.sqrt(i/groups)*3.1,p=[-4.8+Math.sin(i)*.8,Math.cos(a)*r,Math.sin(a)*r];point(p,i%7===0?0x397fea:CYAN,.035);if(i%14===0)tube([p,[-3,p[1]*.7,p[2]*.7],[-1,p[1]*.35,p[2]*.35],[.2,p[1]*.18,p[2]*.18]],sat?VIOLET:CYAN,.013,.58)}
  for(const x of [-.2,.2]){circle([x,0,0],1.35,VIOLET,'x',1);circle([x,0,0],1.5,VIOLET,'x',.35)}
  const outputs=Math.max(1,Math.round(Math.log10(accepted+1)*18))
  for(let i=0;i<outputs;i++){const a=i*2.39996323,r=Math.sqrt(i/outputs)*1.7,p=[4.5,Math.cos(a)*r,Math.sin(a)*r];point(p,GOLD,.07);if(i%5===0)tube([[.2,p[1]*.4,p[2]*.4],[2.4,p[1]*.7,p[2]*.7],p],GOLD,.015,.6)}
  if(sat)for(let i=0;i<60;i++){const a=i*.37;point([-1.4+Math.sin(i)*.2,Math.cos(a)*1.8,Math.sin(a)*1.8],VIOLET,.055)}
  label('ATTEMPTS',[-4.8,-3.7,0],'cyan');label('INDEPENDENT CHECKS',[0,-2.4,0]);label('ACCEPTED CANDIDATES',[4.5,-2.4,0],'gold');label(sat?'CAPACITY SATURATED':'CAPACITY AVAILABLE',[0,2.3,0],sat?'gold':'cyan')
 }
 if(kind==='metrology'){
  cylinder(3.75,.18,[0,-1.1,0],0x163b53);circle([0,-.99,0],3.7,CYAN,'y',.9)
  for(const p of metrologySamples(s)){const e=s.mode?p.after:p.before,a=[p.x*3.55,-.98,p.y*3.55],b=[a[0]+e[0]*.42,-.78,a[2]+e[1]*.42],color=ramp(Math.hypot(...e)/5);point(a,CYAN,.026);bond(a,b,color,.021);point(b,color,.076)}
  for(let i=-6;i<=6;i++){const v=i*.52,span=Math.sqrt(3.6**2-v*v);line([[v,-.99,-span],[v,-.99,span]],0x346276,.5);line([[-span,-.99,v],[span,-.99,v]],0x346276,.5)}
  box([1.4,.8,1.2],[-3.8,3,0],0x40586d);box([1.4,.8,1.2],[3.8,3,0],0x40586d);tube([[-3.8,2.6,0],[0,-.95,0],[3.8,2.6,0]],GOLD,.018)
  for(const x of [-3.8,3.8]){const lens=cylinder(.33,.18,[x,2.5,0],CYAN,.5);lens.rotation.z=x<0?-.6:.6}
  label('SYNTHETIC WAFER FIELD',[0,-2,3.5]);label(s.mode?'RESIDUAL ERROR':'UNCORRECTED ERROR',[0,2.8,0],s.mode?'cyan':'gold')
 }
 if(kind==='motor'){
  const e=s.explode,rotor=new T.Group();scene.add(rotor)
  const drum=cylinder(1.17,3.2,[0,0,0],0x257a89);scene.remove(drum);rotor.add(drum)
  for(let i=0;i<8;i++){const a=i*Math.PI/4,magnet=new T.Mesh(new T.BoxGeometry(.52,2.85,.18),material(i%2?0x297887:CYAN));magnet.position.set(1.17*Math.sin(a),0,1.17*Math.cos(a));magnet.rotation.y=a;rotor.add(magnet)}rotor.rotation.y=s.angle*Math.PI/180
  cylinder(.25,6+e*2,[0,0,0],VIOLET)
  for(let i=0;i<6;i++){const a=i*Math.PI/3,r=2.05+e*1.6,core=box([.62,3.15,.8],[r*Math.cos(a),0,r*Math.sin(a)],0x566a7c);core.rotation.y=-a
   if(s.coils)for(let j=0;j<15;j++){const winding=new T.Mesh(new T.TorusGeometry(.48,.045,6,24),material(0xe39b61));winding.scale.set(1,1.35,1);winding.rotation.y=a+Math.PI/2;winding.position.set(r*Math.cos(a),-1.35+j*.19,r*Math.sin(a));scene.add(winding)}
  }
  for(const sign of [-1,1]){const y=sign*(2.05+e*1.5),ring=new T.Mesh(new T.TorusGeometry(2.7,.12,10,64),material(0x778e9d));ring.rotation.x=Math.PI/2;ring.position.y=y;scene.add(ring);const bearing=new T.Mesh(new T.TorusGeometry(.48,.16,12,32),material(VIOLET));bearing.rotation.x=Math.PI/2;bearing.position.y=y;scene.add(bearing);for(let i=0;i<6;i++){const a=i*Math.PI/3;bond([.58*Math.cos(a),y,.58*Math.sin(a)],[2.6*Math.cos(a),y,2.6*Math.sin(a)],0x526b7c,.07)}}
  if(s.housing)cylinder(2.95,3.85,[0,0,0],0x6a93a4,.17,true,s.cutaway?Math.PI*.1:0,s.cutaway?Math.PI*1.15:Math.PI*2)
  label('ROTOR',[0,2.5,0],'cyan');label('COPPER WINDINGS',[3+e*1.2,.6,0],'gold');label('SHAFT / BEARINGS',[-1.1,-3.4-e,0]);label('Generic assembly · no performance model',[-2,4.4,0])
 }
 if(kind==='reservoir'){
  const cols=[GOLD,CYAN,VIOLET,0x7e99af],zmax=s.cut?s.section:3
  const rocks=[0x907447,0xc0a374,0x45474b,0xb6aa8d]
  const rockMaterial=(layer:number,top=false)=>{
   const mat=new T.MeshStandardMaterial({color:top?0x6c7253:rocks[layer],roughness:.98,metalness:0,side:T.DoubleSide})
   mat.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 vRockPosition;\n'+shader.vertexShader
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRockPosition = position;')
    shader.fragmentShader='varying vec3 vRockPosition;\nfloat rockHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}\n'+shader.fragmentShader
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
     vec3 rp=vRockPosition;
     float grain=rockHash(floor(rp*210.0));
     float coarse=rockHash(floor(rp*36.0));
     float wave=0.28*sin(0.65*rp.x)*cos(0.7*rp.z)+${s.alternative.toFixed(4)}*0.7*exp(-(rp.x*rp.x+rp.z*rp.z)/7.0);
     float strata=sin((rp.y/${s.exaggeration.toFixed(4)}-wave)*${layer===2?'95.0':'43.0'}+0.14*sin(rp.x*12.0));
     float thin=pow(abs(strata),18.0);
     diffuseColor.rgb *= ${top?'0.76 + 0.2*coarse + 0.14*grain':'0.76 + 0.16*grain + 0.12*coarse - 0.16*thin'};
    `)
   }
   mat.customProgramCacheKey=()=>`rock-${layer}-${top}-${s.alternative}-${s.exaggeration}`
   return mat
  }
  const wall=(layer:number,side:'front'|'back'|'left'|'right')=>{
   const geometry=new T.PlaneGeometry(8,1,80,12),pos=geometry.attributes.position
   for(let j=0;j<=12;j++)for(let i=0;i<=80;i++){
    const x=side==='left'?-4:side==='right'?4:-4+i/10,z=side==='front'?zmax:side==='back'?-3:-3+(zmax+3)*i/80
    const upper=reservoirHeight(x,z,layer,s.alternative),lower=layer<3?reservoirHeight(x,z,layer+1,s.alternative):upper-.85
    pos.setXYZ(j*81+i,x,(upper+(lower-upper)*j/12)*s.exaggeration,z)
   }
   geometry.computeVertexNormals();scene.add(new T.Mesh(geometry,rockMaterial(layer)))
  }
  for(let l=0;l<4;l++){
   if(zmax>-3){const g=new T.PlaneGeometry(8,zmax+3,64,32),pos=g.attributes.position;for(let j=0;j<=32;j++)for(let i=0;i<=64;i++){const x=-4+i/8,z=-3+(zmax+3)*j/32;pos.setXYZ(j*65+i,x,reservoirHeight(x,z,l,s.alternative)*s.exaggeration,z)}g.computeVertexNormals();scene.add(new T.Mesh(g,s.material?rockMaterial(l,l===0):material(cols[l],.63)))}
   if(s.material&&zmax>-3)for(const side of ['front','back','left','right'] as const)wall(l,side)
   tube(Array.from({length:81},(_,i)=>{const x=-4+i/10;return [x,reservoirHeight(x,s.section,l,s.alternative)*s.exaggeration,s.section]}),cols[l],.034)
   for(const z of [-3,zmax])line(Array.from({length:81},(_,i)=>{const x=-4+i/10;return [x,reservoirHeight(x,z,l,s.alternative)*s.exaggeration,z]}),cols[l],.7)
   point([s.well,reservoirHeight(s.well,s.section,l,s.alternative)*s.exaggeration,s.section],WHITE,.105)
  }
  tube([[s.well,3,s.section],[s.well,-4.2,s.section]],WHITE,.035);circle([s.well,3,s.section],.22,WHITE,'y',1)
  if(s.material){const ground=reservoirHeight(s.well,s.section,0,s.alternative)*s.exaggeration;cylinder(.13,.42,[s.well,ground+.25,s.section],0xbdced5);for(const y of [ground+.15,ground+.38])circle([s.well,y,s.section],.21,GOLD,'y',1);for(let i=0;i<4;i++){const y=reservoirHeight(4,zmax,i,s.alternative)*s.exaggeration;label(['Surface / sediment','Sandstone texture','Shale texture','Limestone texture'][i],[4.5,y-.3,zmax])}}
  const pane=new T.Mesh(new T.PlaneGeometry(8,7),material(GOLD,.035));pane.position.set(0,-.4,s.section);scene.add(pane)
  label(`WELL x=${s.well.toFixed(2)}`,[s.well,3.35,s.section],'gold');label(`SECTION z=${s.section.toFixed(1)}`,[-4.1,1.8,s.section]);label('Synthetic horizons · arbitrary units',[0,-4.2,3.4])
 }
 // Instance repeated primitives so dense lattices and molecular views stay inexpensive.
 for(const [color,items] of pointGroups){const mesh=new T.InstancedMesh(new T.SphereGeometry(1,14,10),material(color,1,.12),items.length),matrix=new T.Matrix4();items.forEach((item,i)=>{matrix.compose(new T.Vector3(...item.p),new T.Quaternion(),new T.Vector3(item.r,item.r,item.r));mesh.setMatrixAt(i,matrix)});mesh.userData.picks=items.map(i=>i.pick);scene.add(mesh)}
 for(const [color,items] of bondGroups){const mesh=new T.InstancedMesh(new T.CylinderGeometry(1,1,1,8),material(color),items.length),matrix=new T.Matrix4(),up=new T.Vector3(0,1,0);items.forEach((item,i)=>{const a=new T.Vector3(...item.a),b=new T.Vector3(...item.b),dir=b.clone().sub(a),length=dir.length();matrix.compose(a.clone().add(b).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(up,dir.normalize()),new T.Vector3(item.r,length,item.r));mesh.setMatrixAt(i,matrix)});scene.add(mesh)}
 return {scene,labels}
}
export function disposeScene(T:TModule,scene:Three.Scene){
 const geometries=new Set<Three.BufferGeometry>(),materials=new Set<Three.Material>()
 scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Points){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));if(o instanceof T.InstancedMesh)o.dispose()}})
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.clear()
}
