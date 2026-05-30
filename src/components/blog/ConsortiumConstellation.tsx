"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Dispatches v2 — interactive plate: the four-discipline consortium.
 *
 * Four traditionally distant disciplines arranged around the single
 * substrate. Click a partner (button or node) to light its edge and read
 * what it contributes — and what its absence would cost. Theme-aware off
 * the nearest [data-read-mode].
 */

const COOL = "120,140,200"
const TEAL = "95,166,180"
const COPPER = "201,142,79"
const ROSE = "207,125,90"
const VIOLET = "166,152,212"
const CREAM = "246,234,208"

const PARTNERS = [
  {
    name: "Newcastle · Ramaswamy",
    disc: "Computational neuroscience",
    col: COOL,
    angle: -Math.PI / 2,
    contrib:
      "The four-scale neuromodulation framework — the mathematical template for how a fixed substrate reconfigures on a task signal. Trained in the Blue Brain tradition; also runs the equitable-access user study.",
    cost: "Without it, no principled model for how activation should change — only hand-engineered routing heuristics.",
  },
  {
    name: "CREATE · Siciliano",
    disc: "Robotics · haptic shared control",
    col: TEAL,
    angle: 0,
    contrib:
      "The hardware-validated control formalism by which a low-bandwidth signal reshapes a high-DOF controller without rewriting it — transposed into SYMPHONY's narrow, auditable task surface.",
    cost: "Without it, the task interface defaults to a prompt window — the unbounded surface the project exists to reject.",
  },
  {
    name: "Real AI · Singh",
    disc: "Foundation-model engineering",
    col: COPPER,
    angle: Math.PI / 2,
    contrib:
      "HOMINIS on the Leonardo supercomputer (~14,000 GPUs) — foundation-model engineering at scale, plus the sovereign, human-centric governance posture that makes the substrate readable to European frameworks.",
    cost: "Without it, the science stays a demonstration, with no path to a deployable, governable European artefact.",
  },
  {
    name: "UP Robotics",
    disc: "Industrial automation",
    col: ROSE,
    angle: Math.PI,
    contrib:
      "The industrial coalface — a production codebase with real version drift and undocumented decisions, the engineering-task ontology, and the EU-anchored joint-venture entity.",
    cost: "Without it, SYMPHONY is judged only on open-source toys, and any win invites the objection it was never tested where impact lives.",
  },
]

type Mode = "light" | "dark"

function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  col: string,
  a: number,
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, "rgba(" + col + "," + a + ")")
  g.addColorStop(1, "rgba(" + col + ",0)")
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

export function ConsortiumConstellation() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const posRef = useRef<{ x: number; y: number }[]>([])
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<Mode>("light")

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

  useEffect(() => {
    let raf = requestAnimationFrame(draw)
    const onResize = () => draw()
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      void raf
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, mode])

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const W = rect.width || 700
    const H = rect.height || 360
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    const dark = mode === "dark"
    const ink = dark ? "246,234,208" : "13,27,61"
    const cx = W / 2
    const cy = H / 2
    const R = Math.min(W, H) * 0.34

    const pos = PARTNERS.map((p) => ({
      x: cx + Math.cos(p.angle) * R * (W > H ? 1.5 : 1),
      y: cy + Math.sin(p.angle) * R,
    }))
    posRef.current = pos

    // edges center → partners
    pos.forEach((pt, i) => {
      const on = i === active
      ctx.strokeStyle = on
        ? "rgba(" + PARTNERS[i].col + ",0.8)"
        : "rgba(" + ink + ",0.14)"
      ctx.lineWidth = on ? 2 : 1
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(pt.x, pt.y)
      ctx.stroke()
    })

    // central substrate node
    glow(ctx, cx, cy, 46, VIOLET, dark ? 0.28 : 0.2)
    ctx.fillStyle = dark ? "rgba(20,34,59,0.95)" : "rgba(253,250,242,0.95)"
    ctx.beginPath()
    ctx.arc(cx, cy, 30, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = "rgba(" + VIOLET + ",0.7)"
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillStyle = "rgba(" + ink + ",0.85)"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = "600 10px 'IBM Plex Mono', monospace"
    ctx.fillText("SUBSTRATE", cx, cy - 4)
    ctx.font = "9px 'IBM Plex Mono', monospace"
    ctx.fillStyle = "rgba(" + ink + ",0.45)"
    ctx.fillText("4 layers", cx, cy + 9)

    // partner nodes
    pos.forEach((pt, i) => {
      const p = PARTNERS[i]
      const on = i === active
      if (on) glow(ctx, pt.x, pt.y, 38, p.col, 0.5)
      ctx.fillStyle = dark ? "rgba(20,34,59,0.95)" : "rgba(253,250,242,0.95)"
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, on ? 16 : 11, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = on
        ? "rgba(" + p.col + ",1)"
        : "rgba(" + p.col + ",0.5)"
      ctx.lineWidth = on ? 2 : 1.2
      ctx.stroke()
      if (on) {
        ctx.fillStyle = "rgba(" + CREAM + ",0.95)"
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      // label
      ctx.textAlign = "center"
      ctx.textBaseline = pt.y < cy ? "bottom" : "top"
      const ly = pt.y < cy ? pt.y - 22 : pt.y + 22
      ctx.font = (on ? "600 " : "") + "11px 'IBM Plex Mono', monospace"
      ctx.fillStyle = on ? "rgba(" + p.col + ",1)" : "rgba(" + ink + ",0.5)"
      ctx.fillText(p.name.toUpperCase(), pt.x, ly)
    })
  }

  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    let best = -1
    let bestD = 40
    posRef.current.forEach((pt, i) => {
      const d = Math.hypot(pt.x - mx, pt.y - my)
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    if (best >= 0) setActive(best)
  }

  const dark = mode === "dark"
  const ink = dark ? "246,234,208" : "13,27,61"
  const p = PARTNERS[active]

  function chip(i: number) {
    const on = i === active
    return [
      "inline-flex h-8 items-center rounded-full border px-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2",
      on ? "" : dark ? "text-[rgba(246,234,208,0.55)]" : "text-[rgba(13,27,61,0.5)]",
    ].join(" ")
  }

  return (
    <figure
      ref={wrapRef}
      data-read-surface
      className="my-10 rounded-xl border p-4 sm:p-5 lg:-mx-12 xl:-mx-24"
      style={{
        background: dark ? "#11203a" : "#fdfaf2",
        borderColor: dark ? "rgba(166,152,212,0.26)" : "rgba(166,152,212,0.3)",
      }}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className="mr-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: "rgba(" + ink + ",0.45)" }}
        >
          The consortium
        </span>
        {PARTNERS.map((pt, i) => (
          <button
            key={pt.name}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={chip(i)}
            style={{
              fontFamily: "var(--font-mono), monospace",
              border: "1px solid " + (i === active ? "rgba(" + pt.col + ",1)" : "rgba(" + ink + ",0.18)"),
              color: i === active ? "rgb(" + pt.col + ")" : undefined,
            }}
          >
            {pt.name.split(" · ")[0]}
          </button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        onClick={onCanvasClick}
        aria-label="The four-discipline SYMPHONY consortium around a single substrate: Newcastle (neuroscience), CREATE/Siciliano (robotics), Real AI (foundation models), UP Robotics (industrial automation)."
        style={{ width: "100%", height: "clamp(300px, 42vh, 380px)", display: "block", cursor: "pointer" }}
      />
      <div
        className="mt-3 border-t pt-3"
        style={{ borderColor: "rgba(" + ink + ",0.12)" }}
      >
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: "rgb(" + p.col + ")" }}
        >
          {p.name} <span style={{ color: "rgba(" + ink + ",0.4)" }}>· {p.disc}</span>
        </div>
        <p
          className="mt-2 text-[0.95rem] leading-[1.65]"
          style={{ fontFamily: "var(--font-serif), serif", color: "rgba(" + ink + ",0.8)" }}
        >
          {p.contrib}
        </p>
        <p
          className="mt-1.5 text-[0.85rem] italic leading-[1.55]"
          style={{ fontFamily: "var(--font-serif), serif", color: "rgba(" + ink + ",0.5)" }}
        >
          What absence would cost: {p.cost}
        </p>
      </div>
    </figure>
  )
}
