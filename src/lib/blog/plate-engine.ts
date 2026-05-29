/* ============================================================
   SYNAPTIC PLATE ENGINE — slug-deterministic cover art.

   Ported from the design handoff's assets/plates.js (Canvas 2D) so a
   single code path renders BOTH in the browser (PlateCanvas — editor
   preview + runtime fallback) AND headless in Node (node-canvas) at
   publish time to commit a PNG. Same code → identical, deterministic
   output, no JS/Python parity problem.

   A sumi-e ink-wash base carrying an instrument-grade object in the
   Synaptic grammar: graded navy field, soft radial bloom, ONE warm
   gold-copper glow used as light. Registers: planisphere · lattice ·
   nodegraph · strata.
   ============================================================ */

// Structural context type — satisfied by both the browser's
// CanvasRenderingContext2D and node-canvas's context.
type Ctx = CanvasRenderingContext2D

export type PlateRegister = "planisphere" | "lattice" | "nodegraph" | "strata"

export interface PlateOpts {
  slug: string
  register?: PlateRegister
  /** 0..1.4 glow intensity. */
  accent?: number
  /** 'card' (grid) | 'full' (hero) — controls label/density. */
  detail?: "card" | "full"
}

/* ---------- deterministic RNG (must match plates.js byte-for-byte) ---------- */
export function hashStr(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  }
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

export const REGISTERS: PlateRegister[] = [
  "planisphere",
  "lattice",
  "nodegraph",
  "strata",
]

export function pickRegister(slug: string): PlateRegister {
  // planisphere weighted as the lead register
  const h = hashStr(slug + "::reg")
  const bag: PlateRegister[] = [
    "planisphere",
    "planisphere",
    "lattice",
    "nodegraph",
    "strata",
  ]
  return bag[h % bag.length]
}

/* ---------- palette · Synaptic Cartography canonical ---------- */
const C = {
  deepTop: "#0a1322",
  deepBot: "#0c1828",
  bloomCool: "70, 90, 160",
  gold: "184, 146, 86",
  copper: "201, 142, 79",
  warm: "244, 196, 130",
  amberHi: "255, 213, 150",
  violet: "166, 152, 212",
  violetHi: "200, 184, 255",
  ceramic: "224, 207, 172",
  rose: "229, 168, 150",
  teal: "108, 180, 194",
  cream: "246, 234, 208",
  cool: "132, 156, 200",
  ink: "6, 10, 18",
}

/**
 * Render a plate into a 2D context sized W×H. The caller sets up the
 * canvas + any DPR transform (browser) or backing store (node-canvas).
 */
export function renderPlate(
  ctx: Ctx,
  W: number,
  H: number,
  opts: PlateOpts,
): PlateRegister {
  const slug = opts.slug || "untitled"
  const register = opts.register || pickRegister(slug)
  const accent = opts.accent == null ? 1 : opts.accent
  const detail = opts.detail || "card"

  ctx.clearRect(0, 0, W, H)

  const seed = hashStr(slug)
  const rng = mulberry32(seed)

  const bx = W * (0.42 + rng() * 0.16)
  const by = H * (0.3 + rng() * 0.16)

  paintField(ctx, W, H, bx, by)
  paintSumie(ctx, W, H, rng)
  paintBloom(ctx, W, H, bx, by, accent)

  ctx.save()
  if (register === "planisphere") drawPlanisphere(ctx, W, H, rng, accent, detail)
  else if (register === "lattice") drawLattice(ctx, W, H, rng, accent, detail)
  else if (register === "nodegraph") drawNodegraph(ctx, W, H, rng, accent)
  else drawStrata(ctx, W, H, rng, accent)
  ctx.restore()

  paintVignette(ctx, W, H)
  paintGrain(ctx, W, H, seed)

  return register
}

function paintField(ctx: Ctx, W: number, H: number, bx: number, by: number) {
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, C.deepTop)
  g.addColorStop(1, C.deepBot)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  const r = Math.max(W, H) * 0.95
  const rg = ctx.createRadialGradient(bx, by, 0, bx, by, r)
  rg.addColorStop(0, "rgba(" + C.bloomCool + ",0.30)")
  rg.addColorStop(0.45, "rgba(" + C.bloomCool + ",0.10)")
  rg.addColorStop(1, "rgba(" + C.bloomCool + ",0)")
  ctx.fillStyle = rg
  ctx.fillRect(0, 0, W, H)
}

function paintSumie(ctx: Ctx, W: number, H: number, rng: () => number) {
  ctx.save()
  const pools = 4 + Math.floor(rng() * 3)
  for (let i = 0; i < pools; i++) {
    const x = rng() * W,
      y = rng() * H
    const rr = (0.18 + rng() * 0.3) * Math.max(W, H)
    const g = ctx.createRadialGradient(x, y, 0, x, y, rr)
    const a = 0.1 + rng() * 0.14
    g.addColorStop(0, "rgba(" + C.ink + "," + a + ")")
    g.addColorStop(1, "rgba(" + C.ink + ",0)")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }
  const strokes = 2 + Math.floor(rng() * 2)
  for (let s = 0; s < strokes; s++) {
    const y0 = rng() * H
    const x0 = -W * 0.1,
      x3 = W * 1.1
    const cy1 = y0 + (rng() - 0.5) * H * 0.5
    const cy2 = y0 + (rng() - 0.5) * H * 0.5
    const baseW = (0.04 + rng() * 0.09) * H
    const dark = rng() > 0.5
    const col = dark ? C.ink : C.bloomCool
    for (let p = 0; p < 5; p++) {
      ctx.beginPath()
      const jl = (rng() - 0.5) * baseW * 0.6
      ctx.moveTo(x0, y0 + jl)
      ctx.bezierCurveTo(W * 0.3, cy1 + jl, W * 0.7, cy2 + jl, x3, y0 + jl)
      ctx.lineWidth = baseW * (1 - p * 0.16)
      ctx.lineCap = "round"
      ctx.strokeStyle = "rgba(" + col + "," + (0.03 + p * 0.012) + ")"
      ctx.stroke()
    }
  }
  const mg = ctx.createLinearGradient(0, 0, 0, H)
  mg.addColorStop(0, "rgba(" + C.bloomCool + ",0.05)")
  mg.addColorStop(0.5, "rgba(" + C.bloomCool + ",0)")
  ctx.fillStyle = mg
  ctx.fillRect(0, 0, W, H)
  ctx.restore()
}

function paintBloom(
  ctx: Ctx,
  W: number,
  H: number,
  bx: number,
  by: number,
  accent: number,
) {
  ctx.save()
  ctx.globalCompositeOperation = "lighter"
  const r1 = Math.max(W, H) * 0.5
  const g1 = ctx.createRadialGradient(bx, by, 0, bx, by, r1)
  g1.addColorStop(0, "rgba(" + C.bloomCool + ",0.22)")
  g1.addColorStop(1, "rgba(" + C.bloomCool + ",0)")
  ctx.fillStyle = g1
  ctx.fillRect(0, 0, W, H)
  const r2 = Math.max(W, H) * 0.34
  const g2 = ctx.createRadialGradient(bx, by, 0, bx, by, r2)
  const wa = 0.16 * accent
  g2.addColorStop(0, "rgba(" + C.warm + "," + wa + ")")
  g2.addColorStop(0.4, "rgba(" + C.gold + "," + wa * 0.5 + ")")
  g2.addColorStop(1, "rgba(" + C.gold + ",0)")
  ctx.fillStyle = g2
  ctx.fillRect(0, 0, W, H)
  ctx.restore()
}

function paintVignette(ctx: Ctx, W: number, H: number) {
  const g = ctx.createRadialGradient(
    W / 2,
    H / 2,
    Math.min(W, H) * 0.4,
    W / 2,
    H / 2,
    Math.max(W, H) * 0.75,
  )
  g.addColorStop(0, "rgba(4,6,14,0)")
  g.addColorStop(1, "rgba(4,6,14,0.55)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

function paintGrain(ctx: Ctx, W: number, H: number, seed: number) {
  const rng = mulberry32(seed ^ 0x9e3779b9)
  const n = Math.min(2200, Math.floor((W * H) / 900))
  ctx.save()
  for (let i = 0; i < n; i++) {
    const x = rng() * W,
      y = rng() * H
    const a = rng() * 0.05
    ctx.fillStyle =
      rng() > 0.5
        ? "rgba(246,234,208," + a + ")"
        : "rgba(4,6,14," + a * 1.6 + ")"
    ctx.fillRect(x, y, 1, 1)
  }
  ctx.restore()
}

/* ---------- registers ---------- */
function drawPlanisphere(
  ctx: Ctx,
  W: number,
  H: number,
  rng: () => number,
  accent: number,
  detail: string,
) {
  const cx = W * 0.5
  const cy = H * (detail === "full" ? 0.54 : 0.52)
  const R = Math.min(W, H) * (detail === "full" ? 0.42 : 0.4)
  const rings = 6
  for (let i = 1; i <= rings; i++) {
    ctx.beginPath()
    ctx.arc(cx, cy, (R * i) / rings, 0, Math.PI * 2)
    ctx.strokeStyle =
      "rgba(" + C.cool + "," + (0.04 + (i === rings ? 0.06 : 0)) + ")"
    ctx.lineWidth = 1
    ctx.stroke()
  }
  for (let a = 0; a < 360; a += 30) {
    const rad = ((a - 90) * Math.PI) / 180
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(rad) * R, cy + Math.sin(rad) * R)
    ctx.strokeStyle = "rgba(" + C.cool + ",0.05)"
    ctx.lineWidth = 1
    ctx.stroke()
  }
  const sweepC = ((-90 + (rng() - 0.5) * 50) * Math.PI) / 180
  const halfW = ((24 + rng() * 14) * Math.PI) / 180
  ctx.save()
  const wg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
  wg.addColorStop(0, "rgba(" + C.violetHi + "," + 0.3 * accent + ")")
  wg.addColorStop(0.5, "rgba(" + C.violet + "," + 0.12 * accent + ")")
  wg.addColorStop(1, "rgba(" + C.violet + ",0)")
  ctx.fillStyle = wg
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.arc(cx, cy, R, sweepC - halfW, sweepC + halfW)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
  const stars = detail === "full" ? 150 : 80
  for (let i = 0; i < stars; i++) {
    const ang = rng() * Math.PI * 2
    const dist = Math.pow(rng(), 0.7) * R
    const x = cx + Math.cos(ang) * dist
    const y = cy + Math.sin(ang) * dist
    let diff = ang - sweepC
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    const inSweep = Math.abs(diff) < halfW * 1.05
    if (inSweep && rng() > 0.25) {
      const s = 1.2 + rng() * 2.4
      glowDot(ctx, x, y, s, rng() > 0.78 ? C.amberHi : C.warm, 0.9 * accent)
    } else {
      const pal = [C.cool, C.cool, C.teal, C.rose]
      const pc = pal[Math.floor(rng() * pal.length)]
      ctx.fillStyle = "rgba(" + pc + "," + (0.16 + rng() * 0.28) + ")"
      ctx.beginPath()
      ctx.arc(x, y, 0.7 + rng() * 1.1, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.save()
  ctx.setLineDash([4, 6])
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + Math.cos(sweepC) * R * 0.98, cy + Math.sin(sweepC) * R * 0.98)
  ctx.strokeStyle = "rgba(" + C.violetHi + "," + 0.6 * accent + ")"
  ctx.lineWidth = 1.6
  ctx.stroke()
  ctx.restore()
  haloRing(ctx, cx, cy, detail === "full" ? 22 : 15, C.violet, 0.4 * accent)
  glowDot(ctx, cx, cy, detail === "full" ? 7 : 5, C.violetHi, 1.0 * accent)
  haloRing(ctx, cx, cy, detail === "full" ? 14 : 10, C.violetHi, 0.6 * accent)
}

function drawLattice(
  ctx: Ctx,
  W: number,
  H: number,
  rng: () => number,
  accent: number,
  detail: string,
) {
  const cx = W * 0.5,
    cy = H * 0.52
  const cols = detail === "full" ? 13 : 11
  const rows = cols
  const span = Math.min(W, H) * 0.74
  const step = span / (cols - 1)
  const x0 = cx - span / 2,
    y0 = cy - span / 2
  const fpad = step * 1.5
  ctx.save()
  ctx.strokeStyle = "rgba(" + C.ceramic + ",0.5)"
  ctx.lineWidth = 2
  roundRect(ctx, x0 - fpad, y0 - fpad, span + fpad * 2, span + fpad * 2, 9)
  ctx.stroke()
  ctx.strokeStyle = "rgba(" + C.ceramic + ",0.22)"
  ctx.lineWidth = 1
  roundRect(ctx, x0 - fpad * 0.5, y0 - fpad * 0.5, span + fpad, span + fpad, 6)
  ctx.stroke()
  ctx.fillStyle = "rgba(8,16,30,0.45)"
  roundRect(ctx, x0 - fpad * 0.5, y0 - fpad * 0.5, span + fpad, span + fpad, 6)
  ctx.fill()
  ctx.restore()
  ctx.strokeStyle = "rgba(" + C.gold + ",0.07)"
  ctx.lineWidth = 1
  for (let i = 0; i < cols; i++) {
    ctx.beginPath()
    ctx.moveTo(x0 + i * step, y0)
    ctx.lineTo(x0 + i * step, y0 + span)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x0, y0 + i * step)
    ctx.lineTo(x0 + span, y0 + i * step)
    ctx.stroke()
  }
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, span * 0.36)
  g.addColorStop(0, "rgba(" + C.warm + "," + 0.3 * accent + ")")
  g.addColorStop(1, "rgba(" + C.warm + ",0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  const cc = (cols - 1) / 2
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * step,
        y = y0 + r * step
      const dn = Math.hypot(c - cc, r - cc) / cc
      if (dn < 0.5) {
        const s = 2.6 - dn * 2
        glowDot(
          ctx,
          x,
          y,
          s,
          dn < 0.22 ? C.amberHi : rng() > 0.5 ? C.warm : C.rose,
          (0.9 - dn) * accent,
        )
      } else if (rng() > dn * 0.7) {
        ctx.fillStyle = "rgba(" + C.cool + "," + 0.3 * (1 - dn) + ")"
        ctx.beginPath()
        ctx.arc(x, y, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  const m = step * 3.2
  ctx.strokeStyle = "rgba(" + C.copper + "," + 0.5 * accent + ")"
  ctx.lineWidth = 1
  roundRect(ctx, cx - m, cy - m, m * 2, m * 2, 4)
  ctx.stroke()
  cornerTicks(ctx, x0 - 8, y0 - 8, span + 16, span + 16, C.copper, 0.5 * accent)
}

function drawNodegraph(
  ctx: Ctx,
  W: number,
  H: number,
  rng: () => number,
  accent: number,
) {
  const cx = W * 0.5,
    cy = H * 0.52
  const R = Math.min(W, H) * 0.34
  const n = 5 + Math.floor(rng() * 2)
  const nodes: Array<{ x: number; y: number; r: number }> = []
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + rng() * 0.4 - 0.2
    const rad = R * (0.55 + rng() * 0.55)
    nodes.push({
      x: cx + Math.cos(ang) * rad,
      y: cy + Math.sin(ang) * rad,
      r: 10 + rng() * 14,
    })
  }
  nodes.push({
    x: cx + (rng() - 0.5) * R * 0.3,
    y: cy + (rng() - 0.5) * R * 0.3,
    r: 16 + rng() * 8,
  })
  const active = nodes.length - 1
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (rng() > 0.5 && !(i === active || j === active)) continue
      const a = nodes[i],
        b = nodes[j]
      const lit = (i === active || j === active) && rng() > 0.35
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      const mx = (a.x + b.x) / 2 + (rng() - 0.5) * 40
      const my = (a.y + b.y) / 2 + (rng() - 0.5) * 40
      ctx.quadraticCurveTo(mx, my, b.x, b.y)
      ctx.strokeStyle = lit
        ? "rgba(" + C.warm + "," + 0.5 * accent + ")"
        : "rgba(" + C.cool + ",0.12)"
      ctx.lineWidth = lit ? 1.6 : 1
      ctx.stroke()
    }
  }
  nodes.forEach(function (nd, i) {
    const isA = i === active
    ctx.beginPath()
    ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(8,12,26,0.92)"
    ctx.fill()
    if (isA) {
      haloRing(ctx, nd.x, nd.y, nd.r + 6, C.warm, 0.7 * accent)
      ctx.strokeStyle = "rgba(" + C.warm + "," + 0.9 * accent + ")"
      ctx.lineWidth = 1.6
    } else {
      ctx.strokeStyle = "rgba(" + C.cool + ",0.4)"
      ctx.lineWidth = 1
    }
    ctx.beginPath()
    ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2)
    ctx.stroke()
    if (isA) glowDot(ctx, nd.x, nd.y, 3, C.warm, accent)
  })
}

function drawStrata(
  ctx: Ctx,
  W: number,
  H: number,
  rng: () => number,
  accent: number,
) {
  const padX = W * 0.12
  const colW = W * 0.34
  const x0 = padX
  const top = H * 0.16,
    bot = H * 0.84
  const layers = 6
  const lh = (bot - top) / layers
  const goldLayer = 1 + Math.floor(rng() * (layers - 1))
  for (let i = 0; i < layers; i++) {
    const y = top + i * lh
    const isGold = i === goldLayer
    ctx.strokeStyle = "rgba(" + C.cool + ",0.10)"
    ctx.lineWidth = 1
    roundRect(ctx, x0, y + 4, colW, lh - 8, 3)
    ctx.stroke()
    const marks = 5 + Math.floor(rng() * 4)
    for (let m = 0; m < marks; m++) {
      const mx = x0 + 14 + (colW - 28) * (m / (marks - 1 || 1))
      const my = y + lh / 2
      ctx.strokeStyle =
        "rgba(" +
        (isGold ? C.warm : C.cool) +
        "," +
        (isGold ? 0.5 * accent : 0.18) +
        ")"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(mx, my + lh * 0.22)
      ctx.lineTo(mx, my - lh * 0.05)
      ctx.moveTo(mx, my - lh * 0.05)
      ctx.lineTo(mx - 5, my - lh * 0.22)
      ctx.moveTo(mx, my - lh * 0.05)
      ctx.lineTo(mx + 5, my - lh * 0.22)
      ctx.stroke()
    }
    const ry = y + lh / 2
    const rx0 = x0 + colW + 14
    const rx1 = W * 0.96
    const rg = ctx.createLinearGradient(rx0, 0, rx1, 0)
    if (isGold) {
      rg.addColorStop(0, "rgba(" + C.warm + "," + 0.7 * accent + ")")
      rg.addColorStop(1, "rgba(" + C.warm + ",0)")
    } else {
      const modPal = [C.rose, C.teal, C.violet, C.cool, C.copper, C.cool]
      const mc = modPal[i % modPal.length]
      rg.addColorStop(0, "rgba(" + mc + ",0.30)")
      rg.addColorStop(1, "rgba(" + mc + ",0)")
    }
    ctx.strokeStyle = rg
    ctx.lineWidth = isGold ? 2.2 : 1.2
    if (isGold) ctx.setLineDash([8, 6])
    else ctx.setLineDash([])
    ctx.beginPath()
    ctx.moveTo(rx0, ry)
    ctx.lineTo(rx1, ry)
    ctx.stroke()
    ctx.setLineDash([])
    glowDot(ctx, rx0, ry, isGold ? 4 : 2.4, isGold ? C.warm : C.cool, isGold ? accent : 0.4)
  }
}

/* ---------- helpers ---------- */
function glowDot(
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  col: string,
  a: number,
) {
  a = Math.max(0, Math.min(1.4, a))
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4)
  g.addColorStop(0, "rgba(" + col + "," + 0.9 * a + ")")
  g.addColorStop(0.4, "rgba(" + col + "," + 0.35 * a + ")")
  g.addColorStop(1, "rgba(" + col + ",0)")
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r * 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "rgba(" + C.cream + "," + Math.min(1, 0.8 * a + 0.2) + ")"
  ctx.beginPath()
  ctx.arc(x, y, Math.max(0.8, r * 0.5), 0, Math.PI * 2)
  ctx.fill()
}

function haloRing(
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  col: string,
  a: number,
) {
  ctx.strokeStyle = "rgba(" + col + "," + Math.max(0, Math.min(1, a)) + ")"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()
}

function roundRect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function cornerTicks(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  col: string,
  a: number,
) {
  const t = 9
  ctx.strokeStyle = "rgba(" + col + "," + a + ")"
  ctx.lineWidth = 1
  const C4 = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ]
  C4.forEach(function (p) {
    ctx.beginPath()
    ctx.moveTo(p[0], p[1] + p[3] * t)
    ctx.lineTo(p[0], p[1])
    ctx.lineTo(p[0] + p[2] * t, p[1])
    ctx.stroke()
  })
}
