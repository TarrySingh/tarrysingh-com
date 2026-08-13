"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { BlogPostMeta } from "@/lib/blog/posts"

/**
 * Dispatches v2 — The Set Piece register.
 *
 * A scroll-driven feature: two pinned canvas scenes that scrub with
 * scroll. Ported from the design handoff's setpiece.js (drawGap / drawBars)
 * with the scrub coalesced through requestAnimationFrame so wheel events
 * never thrash the main thread.
 *
 * Degrades cleanly:
 * - prefers-reduced-motion → renders each scene's FINAL frame once, no scrub;
 * - no JS → the narrative + steps read top-to-bottom (canvases stay blank,
 *   the prose carries the argument);
 * - ≤ lg (≈ mobile/tablet) → the viz un-pins (static, sits above its steps).
 *
 * Opt-in via `theme: "setpiece"` frontmatter; the post page early-returns
 * this instead of The Read.
 */

const COOL = "120,140,200"
const GOLD = "201,169,110"
const WARM = "232,149,74"
const CREAM = "246,234,208"

type Fit = { ctx: CanvasRenderingContext2D; W: number; H: number }
function fit(canvas: HTMLCanvasElement): Fit | null {
  const rect = canvas.getBoundingClientRect()
  const W = rect.width || 800
  const H = rect.height || 520
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { ctx, W, H }
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

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
function roundRectFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (h <= 0) return
  r = Math.min(r, h)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x, y + h)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
  ctx.fill()
}

/* Scene 1 · the comprehension gap — log lines, scrubbed 1970→2030. */
const GAP_YEARS = [1970, 1980, 1990, 2000, 2010, 2020, 2025, 2030]
const GAP_CX = [1, 6, 32, 180, 1000, 5500, 16000, 42000]
const GAP_HU = [1, 1.04, 1.09, 1.14, 1.19, 1.26, 1.3, 1.4]

function drawGap(
  canvas: HTMLCanvasElement,
  progress: number,
): { year: number; cx: number; hu: number } | null {
  const f = fit(canvas)
  if (!f) return null
  const { ctx, W, H } = f
  const padL = 64,
    padR = 28,
    padT = 30,
    padB = 46
  const x0 = padL,
    x1 = W - padR,
    y0 = padT,
    y1 = H - padB
  const logMin = 0,
    logMax = Math.log10(50000)
  const xAt = (i: number) => lerp(x0, x1, i / (GAP_YEARS.length - 1))
  const yAt = (v: number) =>
    lerp(y1, y0, (Math.log10(v) - logMin) / (logMax - logMin))

  ctx.clearRect(0, 0, W, H)

  ctx.font = "10px 'IBM Plex Mono', monospace"
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"
  ;[1, 10, 100, 1000, 10000].forEach((v) => {
    const y = yAt(v)
    ctx.strokeStyle = "rgba(" + COOL + ",0.07)"
    ctx.beginPath()
    ctx.moveTo(x0, y)
    ctx.lineTo(x1, y)
    ctx.stroke()
    ctx.fillStyle = "rgba(" + COOL + ",0.5)"
    ctx.fillText(v >= 1000 ? v / 1000 + "k×" : v + "×", x0 - 10, y)
  })

  ctx.textAlign = "center"
  ctx.textBaseline = "top"
  GAP_YEARS.forEach((yr, i) => {
    ctx.fillStyle = "rgba(" + COOL + ",0.45)"
    ctx.fillText(String(yr), xAt(i), y1 + 12)
  })

  const fi = progress * (GAP_YEARS.length - 1)
  let ci = Math.floor(fi)
  let frac = fi - ci
  if (ci >= GAP_YEARS.length - 1) {
    ci = GAP_YEARS.length - 2
    frac = 1
  }

  const curX = lerp(xAt(ci), xAt(ci + 1), frac)
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x0, yAt(GAP_HU[0]))
  for (let i = 0; i <= ci; i++) ctx.lineTo(xAt(i), yAt(GAP_HU[i]))
  const curHu = lerp(GAP_HU[ci], GAP_HU[ci + 1], frac)
  ctx.lineTo(curX, yAt(curHu))
  const curCx = Math.pow(
    10,
    lerp(Math.log10(GAP_CX[ci]), Math.log10(GAP_CX[ci + 1]), frac),
  )
  ctx.lineTo(curX, yAt(curCx))
  for (let j = ci; j >= 0; j--) ctx.lineTo(xAt(j), yAt(GAP_CX[j]))
  ctx.closePath()
  const gg = ctx.createLinearGradient(0, y0, 0, y1)
  gg.addColorStop(0, "rgba(" + WARM + ",0.18)")
  gg.addColorStop(1, "rgba(" + GOLD + ",0.02)")
  ctx.fillStyle = gg
  ctx.fill()
  ctx.restore()

  ctx.beginPath()
  GAP_YEARS.forEach((_, i) =>
    i
      ? ctx.lineTo(xAt(i), yAt(GAP_HU[i]))
      : ctx.moveTo(xAt(i), yAt(GAP_HU[i])),
  )
  ctx.strokeStyle = "rgba(90,180,200,0.85)"
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(xAt(0), yAt(GAP_CX[0]))
  for (let k = 1; k <= ci; k++) ctx.lineTo(xAt(k), yAt(GAP_CX[k]))
  ctx.lineTo(curX, yAt(curCx))
  const lg = ctx.createLinearGradient(x0, 0, x1, 0)
  lg.addColorStop(0, "rgba(" + GOLD + ",0.7)")
  lg.addColorStop(1, "rgba(" + WARM + ",1)")
  ctx.strokeStyle = lg
  ctx.lineWidth = 2.4
  ctx.stroke()

  for (let n = 0; n <= ci; n++) glow(ctx, xAt(n), yAt(GAP_CX[n]), 3, GOLD, 0.8)

  glow(ctx, curX, yAt(curCx), 6, WARM, 1)
  glow(ctx, curX, yAt(curHu), 5, "90,180,200", 1)
  ctx.setLineDash([3, 5])
  ctx.strokeStyle = "rgba(" + CREAM + ",0.2)"
  ctx.beginPath()
  ctx.moveTo(curX, y0)
  ctx.lineTo(curX, y1)
  ctx.stroke()
  ctx.setLineDash([])

  const year = Math.round(lerp(GAP_YEARS[ci], GAP_YEARS[ci + 1], frac))
  return { year, cx: Math.round(curCx), hu: curHu }
}

/* Scene 2 · the energy gradient — log bars, revealed 0→1. */
const BARS = [
  { label: "GPU AI", note: "transformer inference", v: 1e-9, disp: "1 nJ", col: COOL },
  { label: "Loihi · TrueNorth", note: "state-of-the-art", v: 1e-11, disp: "10 pJ", col: "150,140,210" },
  { label: "Biology", note: "mammalian cortex", v: 1e-13, disp: "100 fJ", col: "90,180,200" },
  { label: "MEMPHIS", note: "target · memristive", v: 1e-14, disp: "< 10 fJ", col: GOLD },
]
function drawBars(canvas: HTMLCanvasElement, reveal: number) {
  const f = fit(canvas)
  if (!f) return
  const { ctx, W, H } = f
  const padL = 56,
    padR = 24,
    padT = 36,
    padB = 64
  const x0 = padL,
    x1 = W - padR,
    y0 = padT,
    y1 = H - padB
  const logMin = Math.log10(1e-15),
    logMax = Math.log10(2e-9)
  const yAt = (v: number) =>
    lerp(y1, y0, (Math.log10(v) - logMin) / (logMax - logMin))
  ctx.clearRect(0, 0, W, H)

  ctx.font = "10px 'IBM Plex Mono', monospace"
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"
  ;([["1 nJ", 1e-9], ["1 pJ", 1e-12], ["1 fJ", 1e-15]] as const).forEach((g) => {
    const y = yAt(g[1])
    ctx.strokeStyle = "rgba(" + COOL + ",0.07)"
    ctx.beginPath()
    ctx.moveTo(x0, y)
    ctx.lineTo(x1, y)
    ctx.stroke()
    ctx.fillStyle = "rgba(" + COOL + ",0.5)"
    ctx.fillText(g[0], x0 - 8, y)
  })
  const by = yAt(1e-13)
  ctx.setLineDash([5, 5])
  ctx.strokeStyle = "rgba(90,180,200,0.5)"
  ctx.beginPath()
  ctx.moveTo(x0, by)
  ctx.lineTo(x1, by)
  ctx.stroke()
  ctx.setLineDash([])

  const n = BARS.length,
    slot = (x1 - x0) / n,
    bw = slot * 0.46
  BARS.forEach((b, i) => {
    const cx = x0 + slot * (i + 0.5)
    let prog = Math.max(0, Math.min(1, reveal * n - i))
    prog = ease(prog)
    const topY = yAt(b.v),
      baseY = y1
    const curTop = lerp(baseY, topY, prog)
    const grad = ctx.createLinearGradient(0, baseY, 0, topY)
    grad.addColorStop(0, "rgba(" + b.col + ",0.25)")
    grad.addColorStop(1, "rgba(" + b.col + ",0.92)")
    ctx.fillStyle = grad
    roundRectFill(ctx, cx - bw / 2, curTop, bw, baseY - curTop, 3)
    if (prog > 0.6) {
      ctx.fillStyle =
        "rgba(" + (b.col === GOLD ? WARM : CREAM) + "," + (prog - 0.6) / 0.4 + ")"
      ctx.font = "600 17px 'Gloock', serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.fillText(b.disp, cx, topY - 8)
    }
    ctx.fillStyle = "rgba(" + CREAM + ",0.75)"
    ctx.font = "13px 'IBM Plex Serif', serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText(b.label, cx, y1 + 10)
    ctx.fillStyle = "rgba(" + COOL + ",0.5)"
    ctx.font = "italic 11px 'IBM Plex Serif', serif"
    ctx.fillText(b.note, cx, y1 + 28)
  })
}

const mono = { fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" } as const
const display = { fontFamily: "var(--font-display), 'Gloock', serif" } as const
const serif = { fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" } as const

const GAP_STEPS = [
  { k: "1970 · Baseline", h: "A system you could hold in one head", p: "The first decade. System complexity and human comprehension start at the same point. The lines are together." },
  { k: "1990 · Divergence", h: "An order of magnitude, already", p: "Twenty years in, complexity is 32× the baseline. Comprehension has barely moved off 1×. The wedge begins." },
  { k: "2010 · Structural", h: "A thousand to one", p: "The gap is no longer a matter of effort. No amount of reading closes three orders of magnitude." },
  { k: "2025 · The ceiling", h: "Sixteen-thousand to one", p: "The ceiling becomes visible. Independent re-evaluations collapse the headline capability numbers, but the complexity curve does not bend." },
  { k: "2030 · The fork", h: "The bridge, or the gap is permanent", p: "The substrate is either the bridge by 2030, or the divergence is a permanent feature of how we build." },
]
const BAR_STEPS = [
  { k: "GPU AI · today", h: "One nanojoule per event", p: "Transformer inference on GPUs. The reference point, and the most expensive way we have to think." },
  { k: "Neuromorphic", h: "Two orders better", p: "Loihi and TrueNorth-class silicon. State of the art, and still far from the only existence proof that matters." },
  { k: "Biology", h: "The real benchmark", p: "Mammalian cortex, at roughly 100 femtojoules. Not the next increment, the target." },
  { k: "MEMPHIS · target", h: "Below biology", p: "A self-organising memristive substrate, under 10 fJ. Five orders of magnitude from where we started." },
]

function Kicker({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="text-[11px] font-semibold uppercase tracking-[0.28em]"
      style={{ ...mono, color }}
    >
      {children}
    </span>
  )
}

export function SetPiece({ post }: { post: BlogPostMeta }) {
  const gapCanvas = useRef<HTMLCanvasElement | null>(null)
  const barCanvas = useRef<HTMLCanvasElement | null>(null)
  const gapSection = useRef<HTMLElement | null>(null)
  const barSection = useRef<HTMLElement | null>(null)
  const yearOut = useRef<HTMLDivElement | null>(null)
  const cxOut = useRef<HTMLDivElement | null>(null)
  const huOut = useRef<HTMLDivElement | null>(null)
  const [gapStep, setGapStep] = useState(0)
  const [barStep, setBarStep] = useState(0)

  useEffect(() => {
    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false

    const sectionProgress = (sec: HTMLElement | null) => {
      if (!sec) return 0
      const r = sec.getBoundingClientRect()
      const total = r.height - window.innerHeight
      if (total <= 0) return 1
      return Math.max(0, Math.min(1, -r.top / total))
    }

    let raf = 0
    let gapProgress = 0
    let barReveal = 0
    const gapIdx = { v: -1 }
    const barIdx = { v: -1 }

    const frame = () => {
      raf = 0
      if (gapCanvas.current) {
        const out = drawGap(gapCanvas.current, gapProgress)
        if (out) {
          if (yearOut.current) yearOut.current.textContent = String(out.year)
          if (cxOut.current) cxOut.current.textContent = out.cx.toLocaleString() + "×"
          if (huOut.current) huOut.current.textContent = out.hu.toFixed(2) + "×"
        }
      }
      if (barCanvas.current) drawBars(barCanvas.current, barReveal)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const onScroll = () => {
      gapProgress = sectionProgress(gapSection.current)
      barReveal = sectionProgress(barSection.current)
      const gi = Math.min(GAP_STEPS.length - 1, Math.floor(gapProgress * GAP_STEPS.length))
      const bi = Math.min(BAR_STEPS.length - 1, Math.floor(barReveal * BAR_STEPS.length))
      if (gi !== gapIdx.v) {
        gapIdx.v = gi
        setGapStep(gi)
      }
      if (bi !== barIdx.v) {
        barIdx.v = bi
        setBarStep(bi)
      }
      schedule()
    }

    if (reduce) {
      // Final frame, no scrubbing — the prose carries the argument.
      gapProgress = 1
      barReveal = 1
      setGapStep(GAP_STEPS.length - 1)
      setBarStep(BAR_STEPS.length - 1)
      schedule()
      const onResize = () => schedule()
      window.addEventListener("resize", onResize)
      return () => {
        window.removeEventListener("resize", onResize)
        if (raf) cancelAnimationFrame(raf)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    onScroll()
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const ink = "#0c1828"
  const cream = "#f6ead0"
  const glowC = "#c98e4f"
  const hair = "rgba(246,234,208,0.12)"

  return (
    <div style={{ background: ink, color: cream }}>
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 55% at 50% 38%, rgba(201,142,79,0.16), transparent 70%)",
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 lg:px-8">
          <div className="mb-6">
            <Kicker color={glowC}>The Set Piece · The Build · A feature in four movements</Kicker>
          </div>
          <h1
            className="max-w-[16ch] text-5xl md:text-7xl lg:text-8xl"
            style={{ ...display, lineHeight: 0.92, letterSpacing: "-0.02em" }}
          >
            The comprehension gap
          </h1>
          <p
            className="mt-7 max-w-[42ch] text-lg md:text-2xl italic"
            style={{ ...serif, color: "rgba(246,234,208,0.66)" }}
          >
            System complexity has outrun the human mind by four orders of
            magnitude. Scroll to watch the wedge open.
          </p>
        </div>
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2.5">
          <Kicker color="rgba(246,234,208,0.4)">Scroll</Kicker>
          <span
            className="h-10 w-px"
            style={{ background: "linear-gradient(rgba(201,142,79,0.5), transparent)" }}
          />
        </div>
      </section>

      {/* I · The premise */}
      <section className="mx-auto max-w-[60ch] px-6 py-24 md:py-36 lg:px-8">
        <Kicker color="rgba(246,234,208,0.5)">I · The premise</Kicker>
        <p className="mt-6 text-2xl md:text-[2rem]" style={{ ...display, lineHeight: 1.18, color: cream }}>
          For fifty years, the systems we build have grown faster than our
          capacity to hold them in mind.
        </p>
        <p className="mt-6 text-xl leading-relaxed" style={{ ...serif, color: "rgba(246,234,208,0.7)" }}>
          We have answered that divergence the only way we knew how, by
          enlarging the engineer. More abstraction. More tooling. More
          documentation laid over an artefact that keeps getting larger
          underneath it.
        </p>
        <p className="mt-5 text-xl leading-relaxed" style={{ ...serif, color: "rgba(246,234,208,0.7)" }}>
          This feature makes one chart argue one claim:{" "}
          <strong style={{ color: cream, fontWeight: 500 }}>
            the gap is now structural, and it will not be closed by making
            engineers bigger.
          </strong>
        </p>
      </section>

      {/* Scrolly 1 · the gap chart */}
      <section ref={gapSection} className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div className="top-0 flex flex-col justify-center lg:sticky lg:h-screen">
            <div className="mb-3.5 flex items-baseline justify-between gap-4">
              <Kicker color="rgba(246,234,208,0.5)">Fig. 1.2.a · Complexity × Comprehension</Kicker>
              <Kicker color="rgba(246,234,208,0.35)">Log scale · 1970 → 2030</Kicker>
            </div>
            <div
              className="relative rounded-2xl p-4"
              style={{
                border: "1px solid " + hair,
                background: "linear-gradient(160deg, rgba(17,26,58,0.5), rgba(11,16,32,0.2))",
              }}
            >
              <canvas
                ref={gapCanvas}
                aria-label="Complexity vs human comprehension on a log scale, 1970 to 2030"
                style={{ width: "100%", height: "clamp(360px, 60vh, 540px)", display: "block" }}
              />
              <div className="mt-2 flex gap-7 border-t px-1.5 pt-3.5" style={{ borderColor: hair }}>
                <div>
                  <Kicker color="rgba(246,234,208,0.45)">Year</Kicker>
                  <div ref={yearOut} className="text-2xl" style={{ ...display, color: cream }}>1970</div>
                </div>
                <div>
                  <Kicker color="rgba(246,234,208,0.45)">Complexity</Kicker>
                  <div ref={cxOut} className="text-2xl" style={{ ...display, color: glowC }}>1×</div>
                </div>
                <div>
                  <Kicker color="rgba(246,234,208,0.45)">Comprehension</Kicker>
                  <div ref={huOut} className="text-2xl" style={{ ...display, color: "#6fbecd" }}>1.00×</div>
                </div>
              </div>
            </div>
          </div>
          <div className="pb-[20vh] lg:pt-[30vh]">
            {GAP_STEPS.map((s, i) => (
              <div
                key={s.k}
                className="flex min-h-[60vh] flex-col justify-center transition-opacity duration-500"
                style={{ opacity: i === gapStep ? 1 : 0.28 }}
              >
                <Kicker color={glowC}>{s.k}</Kicker>
                <h3 className="mt-3.5 text-2xl md:text-4xl" style={{ ...display, lineHeight: 1.08 }}>{s.h}</h3>
                <p className="mt-3.5 max-w-[38ch] text-lg leading-relaxed" style={{ ...serif, color: "rgba(246,234,208,0.7)" }}>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* II · The instrument */}
      <section className="mx-auto max-w-[60ch] px-6 py-24 md:py-36 lg:px-8 text-center">
        <Kicker color="rgba(246,234,208,0.5)">II · The instrument</Kicker>
        <p className="mt-6 text-3xl md:text-5xl" style={{ ...display, lineHeight: 1.1, color: cream }}>
          We don&apos;t enlarge the engineer. We reshape the substrate.
        </p>
      </section>

      {/* III · The cost */}
      <section className="mx-auto max-w-[60ch] px-6 pb-8 lg:px-8">
        <Kicker color="rgba(246,234,208,0.5)">III · The cost</Kicker>
        <p className="mt-6 text-2xl md:text-[2rem]" style={{ ...display, lineHeight: 1.18, color: cream }}>
          There is a second curve that makes the first one urgent: energy.
        </p>
        <p className="mt-6 text-xl leading-relaxed" style={{ ...serif, color: "rgba(246,234,208,0.7)" }}>
          Every closed gap has a price measured in joules. The substrate that
          finally attends must also be the substrate that can afford to, and
          on that axis, today&apos;s machine intelligence sits{" "}
          <strong style={{ color: cream, fontWeight: 500 }}>
            six orders of magnitude above the brain it imitates.
          </strong>
        </p>
      </section>

      {/* Scrolly 2 · the energy gradient */}
      <section ref={barSection} className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div className="top-0 flex flex-col justify-center lg:sticky lg:h-screen">
            <div className="mb-3.5 flex items-baseline justify-between gap-4">
              <Kicker color="rgba(246,234,208,0.5)">Fig. 2.1.a · Energy per synaptic event</Kicker>
              <Kicker color="rgba(246,234,208,0.35)">Log scale</Kicker>
            </div>
            <div
              className="relative rounded-2xl p-4"
              style={{
                border: "1px solid " + hair,
                background: "linear-gradient(160deg, rgba(17,26,58,0.5), rgba(11,16,32,0.2))",
              }}
            >
              <canvas
                ref={barCanvas}
                aria-label="Energy per synaptic event on a log scale: GPU AI, neuromorphic, biology, MEMPHIS"
                style={{ width: "100%", height: "clamp(360px, 60vh, 540px)", display: "block" }}
              />
            </div>
          </div>
          <div className="pb-[20vh] lg:pt-[30vh]">
            {BAR_STEPS.map((s, i) => (
              <div
                key={s.k}
                className="flex min-h-[60vh] flex-col justify-center transition-opacity duration-500"
                style={{ opacity: i === barStep ? 1 : 0.28 }}
              >
                <Kicker color={glowC}>{s.k}</Kicker>
                <h3 className="mt-3.5 text-2xl md:text-4xl" style={{ ...display, lineHeight: 1.08 }}>{s.h}</h3>
                <p className="mt-3.5 max-w-[38ch] text-lg leading-relaxed" style={{ ...serif, color: "rgba(246,234,208,0.7)" }}>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-3xl px-6 py-24 md:py-40 lg:px-8 text-center">
        <p className="mx-auto max-w-[24ch] text-2xl md:text-4xl italic" style={{ ...serif, lineHeight: 1.3, color: cream }}>
          Close the gap not by enlarging the engineer, but by reshaping the
          substrate they navigate.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-5">
          <Link
            href="/blog/a-nervous-system-for-software"
            className="rounded-full border px-6 py-3 text-sm transition-colors hover:bg-[#c98e4f] hover:text-[#0c1828]"
            style={{ ...mono, borderColor: "rgba(201,142,79,0.5)", color: cream }}
          >
            Read the full essay →
          </Link>
          <Link
            href="/synaptic/symphony"
            className="rounded-full border px-6 py-3 text-sm transition-colors hover:bg-[#c98e4f] hover:text-[#0c1828]"
            style={{ ...mono, borderColor: "rgba(201,142,79,0.5)", color: cream }}
          >
            The proposal →
          </Link>
          <Link
            href="/blog"
            className="rounded-full border px-6 py-3 text-sm transition-colors hover:bg-[#c98e4f] hover:text-[#0c1828]"
            style={{ ...mono, borderColor: "rgba(201,142,79,0.5)", color: cream }}
          >
            Back to The Front
          </Link>
        </div>
        <div className="mt-16 border-t pt-7" style={{ borderColor: hair }}>
          <Kicker color="rgba(246,234,208,0.35)">
            Dispatches · tarrysingh.com · {new Date(post.date).getFullYear()}
          </Kicker>
        </div>
      </section>
    </div>
  )
}
