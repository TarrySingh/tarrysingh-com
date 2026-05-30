"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Dispatches v2 — interactive plate: the comprehension gap.
 *
 * Complexity vs human comprehension on a log scale, 1970 → 2030. Drag the
 * scrubber (or arrow-key it) to open the wedge and watch the readout: the
 * complexity curve climbs four orders of magnitude while comprehension
 * stays nearly flat. Theme-aware off the nearest [data-read-mode].
 */

const YEARS = [1970, 1980, 1990, 2000, 2010, 2020, 2025, 2030]
const CX = [1, 6, 32, 180, 1000, 5500, 16000, 42000]
const HU = [1, 1.04, 1.09, 1.14, 1.19, 1.26, 1.3, 1.4]
const WARM = "232,149,74"
const GOLD = "201,169,110"
const COOL = "120,140,200"
const TEAL = "95,166,180"
const CREAM = "246,234,208"

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
type Mode = "light" | "dark"

function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  col: string,
  a: number,
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5)
  g.addColorStop(0, "rgba(" + col + "," + 0.9 * a + ")")
  g.addColorStop(1, "rgba(" + col + ",0)")
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r * 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "rgba(" + CREAM + "," + a + ")"
  ctx.beginPath()
  ctx.arc(x, y, Math.max(1, r * 0.5), 0, Math.PI * 2)
  ctx.fill()
}

export function ComprehensionGap() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [progress, setProgress] = useState(0.8)
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
    let raf = 0
    const run = () => {
      raf = 0
      draw()
    }
    raf = requestAnimationFrame(run)
    const onResize = () => {
      if (!raf) raf = requestAnimationFrame(run)
    }
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      if (raf) cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, mode])

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const W = rect.width || 700
    const H = rect.height || 380
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    const dark = mode === "dark"
    const ink = dark ? "246,234,208" : "13,27,61"
    const padL = 60,
      padR = 24,
      padT = 22,
      padB = 40
    const x0 = padL,
      x1 = W - padR,
      y0 = padT,
      y1 = H - padB
    const logMax = Math.log10(50000)
    const xAt = (i: number) => lerp(x0, x1, i / (YEARS.length - 1))
    const yAt = (v: number) => lerp(y1, y0, Math.log10(v) / logMax)

    ctx.font = "10px 'IBM Plex Mono', monospace"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ;[1, 10, 100, 1000, 10000].forEach((v) => {
      const y = yAt(v)
      ctx.strokeStyle = "rgba(" + ink + ",0.07)"
      ctx.beginPath()
      ctx.moveTo(x0, y)
      ctx.lineTo(x1, y)
      ctx.stroke()
      ctx.fillStyle = "rgba(" + ink + ",0.4)"
      ctx.fillText(v >= 1000 ? v / 1000 + "k×" : v + "×", x0 - 10, y)
    })
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    YEARS.forEach((yr, i) => {
      ctx.fillStyle = "rgba(" + ink + ",0.4)"
      ctx.fillText(String(yr), xAt(i), y1 + 10)
    })

    const fi = progress * (YEARS.length - 1)
    let ci = Math.floor(fi)
    let frac = fi - ci
    if (ci >= YEARS.length - 1) {
      ci = YEARS.length - 2
      frac = 1
    }
    const curX = lerp(xAt(ci), xAt(ci + 1), frac)
    const curHu = lerp(HU[ci], HU[ci + 1], frac)
    const curCx = Math.pow(
      10,
      lerp(Math.log10(CX[ci]), Math.log10(CX[ci + 1]), frac),
    )

    // wedge fill between the curves up to current
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x0, yAt(HU[0]))
    for (let i = 0; i <= ci; i++) ctx.lineTo(xAt(i), yAt(HU[i]))
    ctx.lineTo(curX, yAt(curHu))
    ctx.lineTo(curX, yAt(curCx))
    for (let j = ci; j >= 0; j--) ctx.lineTo(xAt(j), yAt(CX[j]))
    ctx.closePath()
    const gg = ctx.createLinearGradient(0, y0, 0, y1)
    gg.addColorStop(0, "rgba(" + WARM + ",0.18)")
    gg.addColorStop(1, "rgba(" + GOLD + ",0.02)")
    ctx.fillStyle = gg
    ctx.fill()
    ctx.restore()

    // comprehension line (cool/teal, flat) — full
    ctx.beginPath()
    YEARS.forEach((_, i) =>
      i ? ctx.lineTo(xAt(i), yAt(HU[i])) : ctx.moveTo(xAt(i), yAt(HU[i])),
    )
    ctx.strokeStyle = "rgba(" + TEAL + ",0.85)"
    ctx.lineWidth = 2
    ctx.stroke()

    // complexity line (warm) — drawn up to current
    ctx.beginPath()
    ctx.moveTo(xAt(0), yAt(CX[0]))
    for (let k = 1; k <= ci; k++) ctx.lineTo(xAt(k), yAt(CX[k]))
    ctx.lineTo(curX, yAt(curCx))
    const lg = ctx.createLinearGradient(x0, 0, x1, 0)
    lg.addColorStop(0, "rgba(" + GOLD + ",0.7)")
    lg.addColorStop(1, "rgba(" + WARM + ",1)")
    ctx.strokeStyle = lg
    ctx.lineWidth = 2.4
    ctx.stroke()

    for (let n = 0; n <= ci; n++) glow(ctx, xAt(n), yAt(CX[n]), 2.6, GOLD, 0.8)

    glow(ctx, curX, yAt(curCx), 6, WARM, 1)
    glow(ctx, curX, yAt(curHu), 5, TEAL, 1)
    ctx.setLineDash([3, 5])
    ctx.strokeStyle = "rgba(" + ink + ",0.18)"
    ctx.beginPath()
    ctx.moveTo(curX, y0)
    ctx.lineTo(curX, y1)
    ctx.stroke()
    ctx.setLineDash([])

    // curve labels
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.font = "italic 11px 'IBM Plex Serif', serif"
    ctx.fillStyle = "rgba(" + WARM + ",0.9)"
    ctx.fillText("complexity", x0 + 6, yAt(CX[1]))
    ctx.fillStyle = "rgba(" + TEAL + ",0.9)"
    ctx.fillText("comprehension", x0 + 6, yAt(HU[2]) + 14)
  }

  const fi = progress * (YEARS.length - 1)
  let ci = Math.floor(fi)
  let frac = fi - ci
  if (ci >= YEARS.length - 1) {
    ci = YEARS.length - 2
    frac = 1
  }
  const year = Math.round(lerp(YEARS[ci], YEARS[ci + 1], frac))
  const cx = Math.round(
    Math.pow(10, lerp(Math.log10(CX[ci]), Math.log10(CX[ci + 1]), frac)),
  )
  const hu = lerp(HU[ci], HU[ci + 1], frac)

  const dark = mode === "dark"
  const ink = dark ? "246,234,208" : "13,27,61"

  return (
    <figure
      ref={wrapRef}
      data-read-surface
      className="my-10 rounded-xl border p-4 sm:p-5 lg:-mx-12 xl:-mx-24"
      style={{
        background: dark ? "#11203a" : "#fdfaf2",
        borderColor: dark ? "rgba(232,149,74,0.25)" : "rgba(201,142,79,0.22)",
      }}
    >
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: "rgba(" + ink + ",0.5)" }}
        >
          Fig. — Complexity × Comprehension
        </span>
        <span
          className="text-[10px] uppercase tracking-[0.22em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: "rgba(" + ink + ",0.35)" }}
        >
          Log scale · drag →
        </span>
      </div>
      <canvas
        ref={canvasRef}
        aria-label="Complexity versus human comprehension on a log scale, 1970 to 2030. Complexity climbs roughly four orders of magnitude while comprehension stays nearly flat."
        style={{ width: "100%", height: "clamp(300px, 44vh, 400px)", display: "block" }}
      />
      <input
        type="range"
        min={0}
        max={1000}
        value={Math.round(progress * 1000)}
        onChange={(e) => setProgress(Number(e.target.value) / 1000)}
        aria-label="Scrub the year from 1970 to 2030"
        className="mt-3 w-full accent-[#e8954a]"
      />
      <div
        className="mt-2 flex gap-7 border-t pt-3"
        style={{ borderColor: "rgba(" + ink + ",0.12)" }}
      >
        <Readout label="Year" value={String(year)} ink={ink} />
        <Readout label="Complexity" value={cx.toLocaleString() + "×"} color="#e8954a" ink={ink} />
        <Readout label="Comprehension" value={hu.toFixed(2) + "×"} color="#5fa6b4" ink={ink} />
      </div>
    </figure>
  )
}

function Readout({
  label,
  value,
  color,
  ink,
}: {
  label: string
  value: string
  color?: string
  ink: string
}) {
  return (
    <div>
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ fontFamily: "var(--font-mono), monospace", color: "rgba(" + ink + ",0.45)" }}
      >
        {label}
      </div>
      <div
        className="text-2xl"
        style={{
          fontFamily: "var(--font-display), 'Gloock', serif",
          color: color ?? "rgba(" + ink + ",0.95)",
        }}
      >
        {value}
      </div>
    </div>
  )
}
