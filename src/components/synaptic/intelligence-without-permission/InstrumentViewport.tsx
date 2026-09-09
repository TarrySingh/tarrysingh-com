"use client"
import { useEffect, useRef, useState } from 'react'
import type { SceneKind, Settings, ScienceData } from '@/lib/synaptic/intelligence-without-permission/instruments'

export type ViewportCommand='front'|'top'|'isometric'|'left'|'right'|'closer'|'further'|'export'|'labels'|'quality'|'zoom'
type Engine={update:(s:Settings)=>void;command:(c:ViewportCommand,value?:number)=>void}

export function InstrumentViewport({kind,settings,data,onPick,onReady,onError,onZoom,commandRef}:{kind:SceneKind;settings:Settings;data:ScienceData;onPick:(id:number)=>void;onReady:()=>void;onError:()=>void;onZoom:(percent:number)=>void;commandRef:React.MutableRefObject<((command:ViewportCommand,value?:number)=>void)|null>}){
 const mount=useRef<HTMLDivElement>(null),overlay=useRef<HTMLDivElement>(null),engine=useRef<Engine|null>(null),latest=useRef(settings),callbacks=useRef({onPick,onReady,onError,onZoom})
 const [loading,setLoading]=useState(true)
 latest.current=settings;callbacks.current={onPick,onReady,onError,onZoom}
 useEffect(()=>{engine.current?.update(settings)},[settings])
 useEffect(()=>{
  const element=mount.current,labels=overlay.current;if(!element||!labels)return
  let cancelled=false,cleanup=()=>{}
  async function start(){
   try{
    const [T,{OrbitControls},{createScene,disposeScene},{EffectComposer},{RenderPass},{UnrealBloomPass},{OutputPass}]=await Promise.all([import('three'),import('three/examples/jsm/controls/OrbitControls.js'),import('./scenes'),import('three/examples/jsm/postprocessing/EffectComposer.js'),import('three/examples/jsm/postprocessing/RenderPass.js'),import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),import('three/examples/jsm/postprocessing/OutputPass.js')])
    if(cancelled)return
    const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'})
    cleanup=()=>renderer.dispose()
    renderer.setClearColor(0x000103,1);renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.92
    const camera=new T.PerspectiveCamera(40,1,.1,150);const home=kind==='protein'||kind==='motor'||kind==='binding'?[7.8,5.4,11]:[9,6.3,12.6];camera.position.set(...home as [number,number,number])
    const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=true;controls.enableZoom=true;controls.target.set(0,-.1,0);const homeDistance=camera.position.distanceTo(controls.target);controls.minDistance=homeDistance/2;controls.maxDistance=homeDistance*2;controls.update()
    let bundle=createScene(T,kind,latest.current,data),frame=0,showLabels=true,highQuality=true
    const composer=new EffectComposer(renderer),renderPass=new RenderPass(bundle.scene,camera),bloom=new UnrealBloomPass(new T.Vector2(1,1),.22,.45,.8),output=new OutputPass()
    composer.addPass(renderPass);composer.addPass(bloom);composer.addPass(output)
    const labelElements:HTMLSpanElement[]=[]
    const rebuildLabels=()=>{labels!.replaceChildren();labelElements.length=0;for(const item of bundle.labels){const span=document.createElement('span');span.className=`iwp-world-label ${item.tone||''}`;span.textContent=item.text;labels!.appendChild(span);labelElements.push(span)}}
    rebuildLabels()
    const render=()=>{if(cancelled)return;if(highQuality)composer.render();else renderer.render(bundle.scene,camera);callbacks.current.onZoom(Math.round(homeDistance/camera.position.distanceTo(controls.target)*100));const width=element!.clientWidth,height=element!.clientHeight;bundle.labels.forEach((l,i)=>{const v=new T.Vector3(...l.position).project(camera),el=labelElements[i];el.hidden=!showLabels||v.z>1||v.z< -1||Math.abs(v.x)>.97||Math.abs(v.y)>.94;el.style.left=`${(v.x+1)*width/2}px`;el.style.top=`${(1-v.y)*height/2}px`})}
    const resize=()=>{const width=Math.max(1,element!.clientWidth),height=Math.max(1,element!.clientHeight);renderer.setSize(width,height);composer.setSize(width,height);camera.aspect=width/height;const minimumAspect=['zeta','atlas','agents'].includes(kind)?1.25:1;camera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(20))*Math.max(1,minimumAspect/camera.aspect)));camera.updateProjectionMatrix();render()}
    const update=(s:Settings)=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const next=createScene(T,kind,s,data);disposeScene(T,bundle.scene);bundle=next;renderPass.scene=next.scene;rebuildLabels();render()})}
    const command=(action:ViewportCommand,value?:number)=>{
     if(action==='labels')showLabels=!showLabels
     else if(action==='quality')highQuality=!highQuality
     else if(action==='export'){render();const outputCanvas=document.createElement('canvas'),canvas=renderer.domElement;outputCanvas.width=canvas.width;outputCanvas.height=canvas.height+120;const context=outputCanvas.getContext('2d')!;context.fillStyle='#07111d';context.fillRect(0,0,outputCanvas.width,outputCanvas.height);context.drawImage(canvas,0,80);context.fillStyle='#f2bd7e';context.font='24px Georgia';context.fillText(`Intelligence Without Permission / ${kind}`,28,42);context.fillStyle='#aab7c5';context.font='12px monospace';context.fillText('Tarry Singh · Synaptic · use the companion settings file for method and provenance',28,outputCanvas.height-16);outputCanvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`synaptic-${kind}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});return}
     else if(action==='front'){camera.position.set(0,1,19);controls.target.set(0,0,0)}
     else if(action==='top'){camera.position.set(.01,19,.01);controls.target.set(0,0,0)}
     else if(action==='isometric'){camera.position.set(...home as [number,number,number]);controls.target.set(0,-.1,0)}
     else{const spherical=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));if(action==='left')spherical.theta-=.3;if(action==='right')spherical.theta+=.3;if(action==='closer')spherical.radius=Math.max(controls.minDistance,spherical.radius*.85);if(action==='further')spherical.radius=Math.min(controls.maxDistance,spherical.radius/ .85);if(action==='zoom'&&value)spherical.radius=homeDistance/(Math.max(50,Math.min(200,value))/100);camera.position.setFromSpherical(spherical).add(controls.target)}
     controls.update();render()
    }
    engine.current={update,command};commandRef.current=command
    renderer.domElement.setAttribute('aria-label',`Interactive ${kind} scene. Drag to rotate, scroll to zoom, or use the named view and zoom buttons for keyboard access.`);renderer.domElement.setAttribute('role','img');element!.appendChild(renderer.domElement)
    const observer=new ResizeObserver(resize);observer.observe(element!);controls.addEventListener('change',render)
    const raycaster=new T.Raycaster();let down=[0,0]
    const pointerDown=(e:PointerEvent)=>{down=[e.clientX,e.clientY]}
    const pointerUp=(e:PointerEvent)=>{if(Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const bounds=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1),camera);for(const hit of raycaster.intersectObjects(bundle.scene.children,true)){if(hit.instanceId===undefined)continue;const pick=hit.object.userData.picks?.[hit.instanceId];if(typeof pick==='number'){callbacks.current.onPick(pick);break}}}
    const lost=(event:Event)=>{event.preventDefault();callbacks.current.onError()}
    renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('webglcontextlost',lost)
    resize();setLoading(false);callbacks.current.onReady()
    cleanup=()=>{cancelAnimationFrame(frame);engine.current=null;commandRef.current=null;observer.disconnect();controls.dispose();disposeScene(T,bundle.scene);bloom.dispose();output.dispose();composer.dispose();renderer.dispose();renderer.domElement.remove();labels!.replaceChildren()}
   }catch(error){cleanup();cleanup=()=>{};if(!cancelled){console.error('Synaptic instrument failed',kind,error);callbacks.current.onError()}}
  }
  void start();return()=>{cancelled=true;cleanup()}
 },[kind,data,commandRef])
 return <div className="iwp-viewport" ref={mount}><div className="iwp-world-labels" ref={overlay}/>{loading&&<div className="iwp-instrument-loading" role="status"><span/>Preparing the instrument…</div>}</div>
}
