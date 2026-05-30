"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Dispatches v2 — interactive plate: SYMPHONY's four-layer substrate.
 *
 * The thesis made tangible. Four strata — Structure, Behaviour, History,
 * Rationale — held in one graph, with a low-bandwidth neuromodulatory
 * "baton" descending through all four. Pick an engineering task and the
 * substrate does not rebuild: it foregrounds a different subnetwork across
 * the layers while the rest rests in cool half-light. Same substrate,
 * different harmonies.
 *
 * Hand-rolled canvas in the Synaptic register, theme-aware off the nearest
 * [data-read-mode] ancestor (The Read's light/dark toggle), with an eased
 * rAF transition between tasks. Degrades to a static first frame; the task
 * buttons are real <button>s, keyboard-reachable.
 */

const STRATA = [
  { key: "rationale", label: "Rationale", sub: "design intent · the why", col: "201,142,79" },
  { key: "history", label: "History", sub: "commits · decisions", col: "207,125,90" },
  { key: "behaviour", label: "Behaviour", sub: "tests · contracts · flows", col: "95,166,180" },
  { key: "structure", label: "Structure", sub: "modules · functions · calls", col: "132,156,200" },
] as const

// Per task: a focus column (0..1 across width) + a per-stratum emphasis
// weight (rationale, history, behaviour, structure). Different tasks light
// visibly different subnetworks.
const TASKS = [
  { label: "Localise a fault", focus: 0.30, w: [0.25, 0.45, 1.0, 0.95] },
  { label: "Impact analysis", focus: 0.62, w: [0.55, 0.7, 0.95, 1.0] },
  { label: "Refactor", focus: 0.5, w: [0.7, 0.55, 0.85, 0.95] },
  { label: "Onboard", focus: 0.74, w: [1.0, 0.95, 0.6, 0.55] },
] as const

const VIOLET = "166,152,212"
const CREAM = "246,234,208"

function hashStr(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}
function mulberry32(a: number): () => number {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

type Node = { x: number; y: number; r: number }
// Deterministic node layout per stratum: built once, stable across renders.
function buildLayout(): Node[][] {
  return STRATA.map((s, li) => {
    const rng = mulberry32(hashStr(s.key + "::sym"))
    const n = 13
    const nodes: Node[] = []
    for (let i = 0; i < n; i++) {
      // spread across the width with gentle jitter; band-relative y
      const x = (i + 0.5) / n + (rng() - 0.5) * 0.05
      const y = 0.28 + rng() * 0.44
      nodes.push({ x: Math.max(0.02, Math.min(0.98, x)), y, r: 2 + rng() * 1.6 })
    }
    void li
    return nodes
  })
}

type Mode = "light" | "dark"

export function SymphonySubstrate() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const layoutRef = useRef<Node[][]>(buildLayout())
  // current per-node activation (animated), and the target.
  const actRef = useRef<number[][]>(STRATA.map((_, li) => layoutRef.current[li].map(() => 0)))
  const focusRef = useRef<{ cur: number; target: number }>({
    cur: TASKS[0].focus,
    target: TASKS[0].focus,
  })
  const rafRef = useRef(0)
  const [task, setTask] = useState(0)
  const [mode, setMode] = useState<Mode>("light")

  // target activation for a task
  function targetFor(taskIdx: number): { act: number[][]; focus: number } {
    const t = TASKS[taskIdx]
    const act = STRATA.map((_, li) =>
      layoutRef.current[li].map((node) => {
        const d = Math.abs(node.x - t.focus)
        const prox = Math.exp(-(d * d) / (2 * 0.16 * 0.16)) // gaussian around focus
        const lit = t.w[li] * prox
        return 0.1 + 0.9 * lit // resting baseline 0.1
      }),
    )
    return { act, focus: t.focus }
  }

  // theme detection (flip with The Read toggle)
  useEffect(() => {
    const root = wrapRef.current?.closest("[data-read-mode]") as HTMLElement | null
    const apply = () =>
      setMode(root?.getAttribute("data-read-mode") === "dark" ? "dark" : "light")
    apply()
    if (!root) return
    const obs = new MutationObserver(apply)
    obs.observe(root, { attributes: true, attributeFilter: ["data-read-mode"] })
    return () => obs.disconnect()
  }, [])

  // animate to target on task / mode change
  useEffect(() => {
    const { act: target, focus } = targetFor(task)
    const start = actRef.current.map((row) => row.slice())
    const startFocus = focusRef.current.cur
    focusRef.current.target = focus
    let raf = 0
    const dur = 620
    let t0 = 0
    const step = (ts: number) => {
      if (!t0) t0 = ts
      const p = Math.min(1, (ts - t0) / dur)
      const e = easeInOut(p)
      actRef.current = start.map((row, li) =>
        row.map((v, ni) => lerp(v, target[li][ni], e)),
      )
      focusRef.current.cur = lerp(startFocus, focus, e)
      draw()
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    rafRef.current = raf
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, mode])

  // redraw on resize
  useEffect(() => {
    const onResize = () => draw()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const W = rect.width || 760
    const H = rect.height || 460
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    const dark = mode === "dark"
    const ink = dark ? "246,234,208" : "13,27,61"
    const padX = 96
    const padT = 18
    const padB = 16
    const bandH = (H - padT - padB) / STRATA.length
    const x0 = padX
    const x1 = W - 24
    const span = x1 - x0
    const xAt = (fx: number) => x0 + fx * span
    const focusX = xAt(focusRef.current.cur)

    // descending baton column (violet), behind the strata
    const bg = ctx.createLinearGradient(focusX, padT, focusX, H - padB)
    bg.addColorStop(0, "rgba(" + VIOLET + ",0.0)")
    bg.addColorStop(0.5, "rgba(" + VIOLET + ",0.10)")
    bg.addColorStop(1, "rgba(" + VIOLET + ",0.0)")
    ctx.fillStyle = bg
    ctx.fillRect(focusX - 26, padT, 52, H - padT - padB)
    ctx.strokeStyle = "rgba(" + VIOLET + ",0.55)"
    ctx.setLineDash([3, 5])
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(focusX, padT)
    ctx.lineTo(focusX, H - padB)
    ctx.stroke()
    ctx.setLineDash([])

    STRATA.forEach((s, li) => {
      const bandY = padT + li * bandH
      const cy = bandY + bandH / 2
      const nodes = layoutRef.current[li]
      const act = actRef.current[li]

      // band hairline + label
      ctx.strokeStyle = "rgba(" + ink + ",0.10)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x0, bandY + bandH - 0.5)
      ctx.lineTo(x1, bandY + bandH - 0.5)
      ctx.stroke()

      ctx.textAlign = "left"
      ctx.textBaseline = "alphabetic"
      ctx.font = "600 11px 'IBM Plex Mono', monospace"
      ctx.fillStyle = "rgba(" + s.col + ",0.95)"
      ctx.fillText(s.label.toUpperCase(), 16, cy - 2)
      ctx.font = "10px 'IBM Plex Serif', serif"
      ctx.fillStyle = "rgba(" + ink + ",0.4)"
      ctx.fillText(s.sub, 16, cy + 13)

      // intra-layer filaments (resting, faint) between consecutive nodes
      ctx.strokeStyle = "rgba(" + ink + ",0.08)"
      ctx.lineWidth = 1
      ctx.beginPath()
      nodes.forEach((nd, i) => {
        const nx = xAt(nd.x)
        const ny = bandY + nd.y * bandH
        if (i === 0) ctx.moveTo(nx, ny)
        else ctx.lineTo(nx, ny)
      })
      ctx.stroke()

      // cross-layer filaments to the band above (the "single substrate")
      if (li > 0) {
        const above = layoutRef.current[li - 1]
        const bandYAbove = padT + (li - 1) * bandH
        nodes.forEach((nd, i) => {
          if (i % 3 !== 0) return
          const a = above[(i * 2) % above.length]
          const x2 = xAt(nd.x)
          const y2 = bandY + nd.y * bandH
          const x3 = xAt(a.x)
          const y3 = bandYAbove + a.y * bandH
          const lit = Math.min(act[i], actRef.current[li - 1][(i * 2) % above.length])
          const alpha = 0.05 + 0.5 * Math.max(0, lit - 0.4)
          ctx.strokeStyle =
            lit > 0.45 ? "rgba(" + s.col + "," + alpha + ")" : "rgba(" + ink + ",0.05)"
          ctx.lineWidth = lit > 0.45 ? 1.2 : 1
          ctx.beginPath()
          ctx.moveTo(x2, y2)
          ctx.lineTo(x3, y3)
          ctx.stroke()
        })
      }

      // nodes — resting cool, active warm glow in the stratum's ink
      nodes.forEach((nd, i) => {
        const nx = xAt(nd.x)
        const ny = bandY + nd.y * bandH
        const a = act[i]
        if (a > 0.4) {
          const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 16)
          g.addColorStop(0, "rgba(" + s.col + "," + 0.55 * a + ")")
          g.addColorStop(1, "rgba(" + s.col + ",0)")
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(nx, ny, 16, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle =
          a > 0.4
            ? "rgba(" + CREAM + "," + Math.min(1, 0.5 + a * 0.5) + ")"
            : "rgba(" + ink + ",0.32)"
        ctx.beginPath()
        ctx.arc(nx, ny, nd.r + (a > 0.4 ? 0.6 : 0), 0, Math.PI * 2)
        ctx.fill()
      })
    })

    // baton head glow where it meets the top band
    const hg = ctx.createRadialGradient(focusX, padT + 2, 0, focusX, padT + 2, 22)
    hg.addColorStop(0, "rgba(" + VIOLET + ",0.85)")
    hg.addColorStop(1, "rgba(" + VIOLET + ",0)")
    ctx.fillStyle = hg
    ctx.beginPath()
    ctx.arc(focusX, padT + 2, 22, 0, Math.PI * 2)
    ctx.fill()
  }

  const dark = mode === "dark"
  const ink = dark ? "246,234,208" : "13,27,61"

  function chip(active: boolean) {
    return [
      "inline-flex h-8 items-center rounded-full border px-3 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a698d4]",
      active
        ? "border-[#a698d4] text-[#a698d4]"
        : dark
          ? "border-[rgba(246,234,208,0.2)] text-[rgba(246,234,208,0.6)] hover:text-[#f6ead0]"
          : "border-[rgba(13,27,61,0.2)] text-[rgba(13,27,61,0.55)] hover:text-[#0d1b3d]",
    ].join(" ")
  }

  return (
    <figure
      ref={wrapRef}
      data-read-surface
      className="my-10 rounded-xl border p-4 sm:p-5 lg:-mx-12 xl:-mx-24"
      style={{
        background: dark ? "#11203a" : "#fdfaf2",
        borderColor: dark ? "rgba(166,152,212,0.28)" : "rgba(166,152,212,0.3)",
      }}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className="mr-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{
            fontFamily: "var(--font-mono), monospace",
            color: "rgba(" + ink + ",0.45)",
          }}
        >
          Task baton
        </span>
        {TASKS.map((t, i) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setTask(i)}
            aria-pressed={task === i}
            className={chip(task === i)}
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        aria-label="SYMPHONY's four-layer code substrate — Structure, Behaviour, History, Rationale — with a neuromodulatory task baton lighting a different subnetwork per engineering task."
        style={{ width: "100%", height: "clamp(380px, 56vh, 520px)", display: "block" }}
      />
      <figcaption
        className="mt-4 text-center text-[0.9rem] italic"
        style={{
          fontFamily: "var(--font-serif), serif",
          lineHeight: 1.55,
          color: dark ? "rgba(246,234,208,0.6)" : "rgba(13,27,61,0.6)",
        }}
      >
        One substrate, four layers. The baton doesn&apos;t rebuild the graph —
        it changes what each layer foregrounds. Switch the task and watch a
        different subnetwork come into the light.
      </figcaption>
    </figure>
  )
}
