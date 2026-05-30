"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Dispatches v2 — interactive plate: the statistical ceiling.
 *
 * SWE-bench headline scores vs what survives independent re-evaluation.
 * Toggle "Re-evaluated" and watch the bars collapse once solution leakage
 * and weak test cases are stripped out. Theme-aware off [data-read-mode].
 */

const BARS = [
  { label: "SWE-agent · leading config", head: 12.47, real: 3.97 },
  { label: "SWE-agent 1.0 · Claude 3.5", head: 57.6, real: 31.8 },
]
const WARM = "232,149,74"
const ROSE = "207,125,90"
const COOL = "120,140,200"

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
type Mode = "light" | "dark"

function roundTop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (h <= 0) return
  r = Math.min(r, h, w / 2)
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
  ctx.fill()
}

export function StatisticalCeiling() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const tRef = useRef(0) // 0 = headline, 1 = re-evaluated (animated)
  const [reEval, setReEval] = useState(false)
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
    const target = reEval ? 1 : 0
    const start = tRef.current
    let raf = 0
    let t0 = 0
    const dur = 700
    const step = (ts: number) => {
      if (!t0) t0 = ts
      const p = Math.min(1, (ts - t0) / dur)
      tRef.current = lerp(start, target, easeInOut(p))
      draw()
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    const onResize = () => draw()
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reEval, mode])

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
    const padL = 44,
      padR = 24,
      padT = 26,
      padB = 52
    const x0 = padL,
      x1 = W - padR,
      yB = H - padB,
      yT = padT
    const yAt = (pct: number) => lerp(yB, yT, pct / 100)
    const t = tRef.current

    // gridlines 0/25/50/75/100
    ctx.font = "10px 'IBM Plex Mono', monospace"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ;[0, 25, 50, 75, 100].forEach((p) => {
      const y = yAt(p)
      ctx.strokeStyle = "rgba(" + ink + ",0.07)"
      ctx.beginPath()
      ctx.moveTo(x0, y)
      ctx.lineTo(x1, y)
      ctx.stroke()
      ctx.fillStyle = "rgba(" + ink + ",0.4)"
      ctx.fillText(p + "%", x0 - 8, y)
    })

    // 80% headline reference (Opus 4.5 — first past 80)
    const y80 = yAt(80.9)
    ctx.setLineDash([6, 5])
    ctx.strokeStyle = "rgba(" + COOL + ",0.55)"
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(x0, y80)
    ctx.lineTo(x1, y80)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.textAlign = "right"
    ctx.textBaseline = "bottom"
    ctx.font = "italic 11px 'IBM Plex Serif', serif"
    ctx.fillStyle = "rgba(" + COOL + ",0.9)"
    ctx.fillText("Opus 4.5 — first past 80% (80.9%)", x1 - 2, y80 - 4)

    const n = BARS.length
    const slot = (x1 - x0) / n
    const bw = Math.min(120, slot * 0.5)
    BARS.forEach((b, i) => {
      const cx = x0 + slot * (i + 0.5)
      const val = lerp(b.head, b.real, t)
      const yv = yAt(val)
      const yh = yAt(b.head)

      // faded "lost" portion (headline → real), only while re-evaluating
      if (t > 0.01) {
        ctx.fillStyle = "rgba(" + ROSE + "," + 0.12 * t + ")"
        roundTop(ctx, cx - bw / 2, yh, bw, yv - yh, 3)
      }
      // live bar
      const grad = ctx.createLinearGradient(0, yB, 0, yv)
      const col = lerp(0, 1, t) > 0.5 ? ROSE : WARM
      grad.addColorStop(0, "rgba(" + col + ",0.25)")
      grad.addColorStop(1, "rgba(" + col + ",0.92)")
      ctx.fillStyle = grad
      roundTop(ctx, cx - bw / 2, yv, bw, yB - yv, 3)

      // value label
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.font = "600 18px 'Gloock', serif"
      ctx.fillStyle = "rgba(" + (t > 0.5 ? ROSE : WARM) + ",1)"
      ctx.fillText(val.toFixed(val < 10 ? 2 : 1) + "%", cx, yv - 8)

      // bar label (two short lines)
      ctx.fillStyle = "rgba(" + ink + ",0.6)"
      ctx.font = "11px 'IBM Plex Serif', serif"
      ctx.textBaseline = "top"
      const parts = b.label.split(" · ")
      ctx.fillText(parts[0], cx, yB + 10)
      if (parts[1]) {
        ctx.fillStyle = "rgba(" + ink + ",0.4)"
        ctx.font = "italic 10.5px 'IBM Plex Serif', serif"
        ctx.fillText(parts[1], cx, yB + 26)
      }
    })
  }

  const dark = mode === "dark"
  const ink = dark ? "246,234,208" : "13,27,61"

  return (
    <figure
      ref={wrapRef}
      data-read-surface
      className="my-10 rounded-xl border p-4 sm:p-5 lg:-mx-12 xl:-mx-24"
      style={{
        background: dark ? "#11203a" : "#fdfaf2",
        borderColor: dark ? "rgba(207,125,90,0.28)" : "rgba(207,125,90,0.28)",
      }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: "rgba(" + ink + ",0.5)" }}
        >
          Fig. — What SWE-bench actually measures
        </span>
        <div className="inline-flex overflow-hidden rounded-full border" style={{ borderColor: "rgba(" + ink + ",0.18)" }}>
          <button
            type="button"
            onClick={() => setReEval(false)}
            aria-pressed={!reEval}
            className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors"
            style={{
              fontFamily: "var(--font-mono), monospace",
              background: !reEval ? "rgba(232,149,74,0.16)" : "transparent",
              color: !reEval ? "#e8954a" : "rgba(" + ink + ",0.55)",
            }}
          >
            Leaderboard
          </button>
          <button
            type="button"
            onClick={() => setReEval(true)}
            aria-pressed={reEval}
            className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors"
            style={{
              fontFamily: "var(--font-mono), monospace",
              background: reEval ? "rgba(207,125,90,0.18)" : "transparent",
              color: reEval ? "#cf7d5a" : "rgba(" + ink + ",0.55)",
            }}
          >
            Re-evaluated
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        aria-label="SWE-bench scores before and after independent re-evaluation: a leading SWE-agent config falls from 12.47% to 3.97%, and SWE-agent 1.0 with Claude 3.5 falls from 57.6% to 31.8%."
        style={{ width: "100%", height: "clamp(300px, 44vh, 400px)", display: "block" }}
      />
      <figcaption
        className="mt-3 text-center text-[0.9rem] italic"
        style={{
          fontFamily: "var(--font-serif), serif",
          lineHeight: 1.55,
          color: dark ? "rgba(246,234,208,0.6)" : "rgba(13,27,61,0.6)",
        }}
      >
        Strip the contaminated instances and the headline collapses. The
        number you trust depends entirely on how hard you look.
      </figcaption>
    </figure>
  )
}
