"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import type { MC102Graph, MC102Node } from "@/lib/panoraima/types"
import s from "../mc102.module.css"

export interface HoverInfo { index: number; node: MC102Node }

/**
 * 435 argumentative units in one instanced draw call, with their relations as a
 * single LineSegments buffer.
 *
 * The three axes each carry meaning and none is decoration. X is time across
 * 2009-2014, Y is the community band, Z is argumentative depth: a claim sits at
 * the base of its theme column and the premises offered for it stack above.
 *
 * The gap between the two Y bands is the thing an attack has to cross, so a theme
 * where the camps engage shows arcs spanning the gap and a theme where they talk
 * past each other shows a column with nothing opposite it. That absence is the
 * finding, which is why unanswered themes are not hidden when filtering.
 *
 * Filtering is done in the shader through a per-instance visibility attribute and
 * two uniforms. Nothing is rebuilt when a control moves.
 */
export default function ConflictMap3D({
  graph, themeFilter, showLocal, showCross, zExag, timeMax, onHover, onError,
}: {
  graph: MC102Graph
  themeFilter: number | null
  showLocal: boolean
  showCross: boolean
  zExag: number
  timeMax: number
  onHover: (h: HoverInfo | null) => void
  onError: (m: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const api = useRef<{
    dispose: () => void
    material: THREE.ShaderMaterial
    lineMat: THREE.LineBasicMaterial
    crossMat: THREE.LineBasicMaterial
    lines: THREE.LineSegments
    crossLines: THREE.LineSegments
  } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    } catch {
      onError("WebGL could not start in this browser.")
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const cv: HTMLCanvasElement = canvas
    const nodes = graph.nodes
    const N = nodes.length

    // ---- instance attributes, uploaded once
    const centre = new Float32Array(N * 3)
    const comm = new Float32Array(N)      // -1 gov, 0 transparency, 1 ngo
    const isClaim = new Float32Array(N)
    const theme = new Float32Array(N)
    const tval = new Float32Array(N)
    nodes.forEach((n, i) => {
      centre[i * 3] = n.x - 50
      centre[i * 3 + 1] = n.y
      centre[i * 3 + 2] = n.z
      comm[i] = n.community.includes("government") ? -1 : n.community.includes("NGO") ? 1 : 0
      isClaim[i] = n.label === "CLAIM" ? 1 : 0
      theme[i] = n.themeIdx
      tval[i] = n.t
    })

    const base = new THREE.SphereGeometry(0.62, 12, 8)
    const geo = new THREE.InstancedBufferGeometry()
    geo.index = base.index
    geo.attributes.position = base.attributes.position
    geo.attributes.normal = base.attributes.normal
    geo.setAttribute("iCentre", new THREE.InstancedBufferAttribute(centre, 3))
    geo.setAttribute("iComm", new THREE.InstancedBufferAttribute(comm, 1))
    geo.setAttribute("iClaim", new THREE.InstancedBufferAttribute(isClaim, 1))
    geo.setAttribute("iTheme", new THREE.InstancedBufferAttribute(theme, 1))
    geo.setAttribute("iT", new THREE.InstancedBufferAttribute(tval, 1))
    geo.instanceCount = N

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uZExag: { value: zExag },
        uTheme: { value: themeFilter === null ? -1 : themeFilter },
        uTimeMax: { value: timeMax },
        uGov: { value: new THREE.Color("#c98a4b") },
        uNgo: { value: new THREE.Color("#79b57e") },
        uTrans: { value: new THREE.Color("#8f9cc4") },
      },
      vertexShader: `
        attribute vec3 iCentre; attribute float iComm; attribute float iClaim;
        attribute float iTheme; attribute float iT;
        uniform float uZExag; uniform float uTheme; uniform float uTimeMax;
        uniform vec3 uGov; uniform vec3 uNgo; uniform vec3 uTrans;
        varying vec3 vCol; varying float vDim; varying float vClaim;
        void main() {
          float dim = 0.0;
          if (uTheme >= 0.0 && abs(iTheme - uTheme) > 0.5) dim = 1.0;
          if (iT > uTimeMax) dim = 2.0;
          vDim = dim; vClaim = iClaim;
          vCol = iComm < -0.5 ? uGov : (iComm > 0.5 ? uNgo : uTrans);
          // a claim is drawn larger than a premise: the thing being argued for
          // should read as the anchor of its column
          float r = iClaim > 0.5 ? 1.0 : 0.58;
          vec3 p = position * r + vec3(iCentre.x, iCentre.y, iCentre.z * uZExag);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `
        varying vec3 vCol; varying float vDim; varying float vClaim;
        void main() {
          if (vDim > 1.5) discard;                       // beyond the time brush
          vec3 c = vCol;
          float a = 1.0;
          if (vDim > 0.5) { c = mix(c, vec3(0.20, 0.22, 0.25), 0.80); a = 0.65; }
          if (vClaim < 0.5) c *= 0.82;                   // premises sit back
          gl_FragColor = vec4(c, a);
        }`,
      transparent: true,
    })

    const mesh = new THREE.Mesh(geo, material)
    mesh.frustumCulled = false

    // ---- edges: two buffers so each can be toggled without a rebuild
    function buildLines(scope: "local" | "cross", colour: string, opacity: number) {
      const es = graph.edges.filter(e => e.scope === scope)
      const pos = new Float32Array(es.length * 6)
      es.forEach((e, i) => {
        const a = nodes[e.a], b = nodes[e.b]
        pos[i * 6] = a.x - 50; pos[i * 6 + 1] = a.y; pos[i * 6 + 2] = a.z * zExag
        pos[i * 6 + 3] = b.x - 50; pos[i * 6 + 4] = b.y; pos[i * 6 + 5] = b.z * zExag
      })
      const g = new THREE.BufferGeometry()
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3))
      const m = new THREE.LineBasicMaterial({ color: colour, transparent: true, opacity })
      return { obj: new THREE.LineSegments(g, m), mat: m, es }
    }
    const local = buildLines("local", "#5e6a73", 0.4)
    const cross = buildLines("cross", "#d4574e", 0.92)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#23262b")
    scene.add(mesh, local.obj, cross.obj)

    const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 900)
    camera.position.set(0, -78, 62)
    camera.up.set(0, 0, 1)

    const controls = new OrbitControls(camera, cv)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.target.set(0, 0, 10)

    // ---- hover: nearest projected instance, because InstancedMesh raycast would
    // test the base geometry rather than our shader-displaced positions
    const ndc = new THREE.Vector2()
    let hovering = -1
    function onMove(ev: PointerEvent) {
      const r = cv.getBoundingClientRect()
      ndc.x = ((ev.clientX - r.left) / r.width) * 2 - 1
      ndc.y = -((ev.clientY - r.top) / r.height) * 2 + 1
      let best = -1, bestD = 0.0016
      const v = new THREE.Vector3()
      for (let i = 0; i < N; i++) {
        const n = nodes[i]
        if (themeFilter !== null && n.themeIdx !== themeFilter) continue
        if (n.t > timeMax) continue
        v.set(n.x - 50, n.y, n.z * zExag).project(camera)
        const d = (v.x - ndc.x) ** 2 + (v.y - ndc.y) ** 2
        if (d < bestD) { bestD = d; best = i }
      }
      if (best !== hovering) {
        hovering = best
        onHover(best >= 0 ? { index: best, node: nodes[best] } : null)
      }
    }
    cv.addEventListener("pointermove", onMove)
    cv.addEventListener("pointerleave", () => { hovering = -1; onHover(null) })

    let raf = 0
    function resize() {
      const w = cv.clientWidth, h = cv.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(cv)
    resize()

    function tick() {
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    api.current = {
      material, lineMat: local.mat, crossMat: cross.mat,
      lines: local.obj, crossLines: cross.obj,
      dispose: () => {
        cancelAnimationFrame(raf); ro.disconnect()
        cv.removeEventListener("pointermove", onMove)
        controls.dispose(); geo.dispose(); base.dispose(); material.dispose()
        local.obj.geometry.dispose(); local.mat.dispose()
        cross.obj.geometry.dispose(); cross.mat.dispose()
        renderer.dispose()
      },
    }
    return () => { api.current?.dispose(); api.current = null }
    // graph is static for the life of the page; controls are handled by the effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph])

  // control changes move uniforms only. Nothing is rebuilt.
  useEffect(() => {
    const a = api.current
    if (!a) return
    a.material.uniforms.uZExag.value = zExag
    a.material.uniforms.uTheme.value = themeFilter === null ? -1 : themeFilter
    a.material.uniforms.uTimeMax.value = timeMax
    a.lines.visible = showLocal
    a.crossLines.visible = showCross
  }, [zExag, themeFilter, timeMax, showLocal, showCross])

  return <canvas ref={canvasRef} aria-label="Three-dimensional conflict map of the Paks debate" />
}
