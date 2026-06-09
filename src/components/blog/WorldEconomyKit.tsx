"use client"

/**
 * WorldEconomyKit — the five "world economy" instruments, ported verbatim
 * from the original Astro `EconomyChart` component so the UI/UX is unchanged.
 *
 * The original rendered each chart with vanilla DOM calls inside an Astro
 * <script>. None of that is framework-specific — it's SVG + CSS + a little
 * JS — so here the exact same render functions run inside a React `useEffect`
 * against a ref'd <figure>. Same dark glass panel, same nominal/PPP toggle,
 * same hover tooltip + guide line, same draw-in animations, same palette.
 *
 * Data is source-pinned (IMF WEO / World Bank ICP 2021 / Eurostat / ECB /
 * Draghi 2024) at anchor years; intermediate years on the productivity and
 * per-capita series are interpolated and indicative (see the essay notes).
 *
 * Charts: GdpShareChart (interactive nominal⇄PPP), ChinaPeakChart,
 * RankFlipChart, ProductivityChart, PerCapitaChart.
 */

import { useEffect, useId, useRef, type ReactNode } from "react"

/* ------------------------------------------------------------------ helpers */
const SVGNS = "http://www.w3.org/2000/svg"
type Attrs = Record<string, string | number>
function el(tag: string, attrs: Attrs): SVGElement {
  const e = document.createElementNS(SVGNS, tag) as SVGElement
  for (const k in attrs) e.setAttribute(k, String(attrs[k]))
  return e
}

const AXIS = "#5e6b85"
const GRID = "rgba(255,255,255,.07)"
const GRID_STRONG = "rgba(255,255,255,.22)"
const ANNO = "#e9edf7"
const MUTED = "#98a2bd"

const YEARS = [1990, 1995, 2000, 2005, 2010, 2014, 2018, 2021, 2024]
const DATA: Record<string, Record<string, number[]>> = {
  nominal: {
    china: [1.7, 2.4, 3.6, 4.8, 9.2, 13.4, 16.0, 18.5, 16.6],
    us: [26.0, 24.7, 30.3, 27.7, 22.7, 22.2, 23.9, 23.9, 26.1],
    eu: [27.5, 27.0, 21.9, 26.5, 23.0, 23.7, 21.8, 18.1, 17.5],
    row: [44.8, 45.9, 44.2, 41.0, 45.1, 40.7, 38.3, 39.5, 39.8],
  },
  ppp: {
    china: [4.1, 5.6, 7.1, 9.5, 13.3, 16.0, 17.5, 18.9, 19.3],
    us: [21.8, 20.6, 20.4, 19.4, 17.0, 16.0, 15.3, 15.5, 14.9],
    eu: [26.5, 25.0, 24.5, 22.5, 19.8, 17.5, 16.0, 15.2, 14.5],
    row: [47.6, 48.8, 48.0, 48.6, 49.9, 50.5, 51.2, 50.4, 51.3],
  },
}
interface Series {
  key: string
  name: string
  short: string
  color: string
}
const SERIES: Series[] = [
  { key: "china", name: "China", short: "China", color: "#ef4b54" },
  { key: "us", name: "United States", short: "US", color: "#4178f2" },
  { key: "eu", name: "European Union", short: "EU", color: "#ecb13f" },
  { key: "row", name: "Rest of the world", short: "Rest", color: "#8b95ad" },
]
const ANNO_PTS: Record<string, { year: number; key: string; text: string }[]> = {
  nominal: [
    { year: 2021, key: "china", text: "China's nominal share peaks (18.5%)" },
    { year: 2000, key: "us", text: "US share near its peak (~30%)" },
  ],
  ppp: [{ year: 2014, key: "china", text: "China overtakes the US (PPP), ~2014" }],
}
const CAPTION: Record<string, string> = {
  nominal:
    "At <b>market exchange rates</b>, the US is the clear #1 (~26%), China sits <b>below</b> the EU, and its slice peaked in 2021. This is the ledger of financial and consumer-market power.",
  ppp: "Adjust for <b>price levels</b> and the order flips: China is the world's <b>largest</b> economy (~19%), with the US and EU below it. This is the ledger of physical output and volume.",
}

/* ------------------------------------------------------------------ styles */
const EC_CSS = `
.ec{background:linear-gradient(180deg,#0f1830,#13203c);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px 18px 16px;margin:30px 0;color:#e9edf7;font-family:var(--font-sans),"Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-feature-settings:"tnum" 1;box-shadow:0 24px 60px -30px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.04);-webkit-font-smoothing:antialiased}
.ec-box{position:relative;margin-top:12px}
.ec svg{display:block;width:100%;height:auto;overflow:visible}
.ec-head{display:flex;justify-content:flex-end}
.ec-toggle{display:inline-flex;position:relative;gap:4px;padding:4px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:11px}
.ec-toggle button{appearance:none;border:0;background:transparent;color:#98a2bd;font:inherit;font-size:.82rem;font-weight:600;letter-spacing:.01em;padding:8px 14px;border-radius:8px;cursor:pointer;position:relative;z-index:1;transition:color .25s;white-space:nowrap}
.ec-toggle button.on{color:#fff}
.ec-pill{position:absolute;top:4px;bottom:4px;border-radius:8px;z-index:0;background:linear-gradient(150deg,#2040df,#1a32b0);box-shadow:0 0 16px rgba(79,104,255,.5);transition:left .32s cubic-bezier(.5,.05,.2,1),width .32s cubic-bezier(.5,.05,.2,1)}
.ec-tip{position:absolute;pointer-events:none;opacity:0;transition:opacity .12s;z-index:5;background:rgba(8,14,30,.94);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:9px 11px;min-width:140px;backdrop-filter:blur(6px);box-shadow:0 14px 34px -14px rgba(0,0,0,.8);transform:translate(-50%,0)}
.ec-tip .ty{font-size:12px;font-weight:700;color:#e9edf7;margin-bottom:6px;letter-spacing:.02em}
.ec-tip .tr{display:flex;align-items:center;gap:7px;font-size:12px;margin:3px 0;color:#98a2bd}
.ec-tip .tr .sw{width:9px;height:9px;border-radius:2px;flex-shrink:0}
.ec-tip .tr b{margin-left:auto;color:#e9edf7;font-weight:700;font-variant-numeric:tabular-nums}
.ec-legend{display:flex;flex-wrap:wrap;gap:8px 16px;margin-top:14px}
.ec-lg{display:inline-flex;align-items:center;gap:7px;font-size:.82rem;color:#98a2bd;font-weight:500}
.ec-lg .sw,.ec-sw{width:13px;height:3px;border-radius:2px}
.ec-legend-static .ec-sw{height:3px}
.ec-dyn{margin-top:16px;padding:12px 15px;border-radius:11px;background:rgba(32,64,223,.08);border:1px solid rgba(79,104,255,.22);font-size:.92rem;line-height:1.5;color:#e9edf7}
.ec-dyn b{color:#4f68ff}
@media (max-width:560px){.ec-tip{min-width:124px}}
.ec-meta{margin-bottom:2px}
.ec-kicker{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#7f9bff;font-weight:600;margin-bottom:8px}
.ec-title{margin:0;font-family:var(--font-display),"Gloock","Fraunces",serif;font-size:1.22rem;font-weight:600;letter-spacing:-.01em;line-height:1.15;color:#e9edf7}
.ec-sub{margin:5px 0 0;font-size:.84rem;color:#98a2bd;line-height:1.45}
.ec-cap{margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.09);font-size:.82rem;line-height:1.5;color:#98a2bd}
.ec-cap b{color:#e9edf7;font-weight:600}
`

function useEcStyles() {
  useEffect(() => {
    if (document.getElementById("ec-styles")) return
    const s = document.createElement("style")
    s.id = "ec-styles"
    s.textContent = EC_CSS
    document.head.appendChild(s)
  }, [])
}

/* ------------------------------------------------------- gdp-share (interactive) */
function renderGdpShare(fig: HTMLElement, uid: string) {
  const svg = fig.querySelector("svg")
  if (!svg) return
  const VBW = 900,
    VBH = 470,
    mL = 46,
    mR = 96,
    mT = 26,
    mB = 42
  const plotW = VBW - mL - mR,
    plotH = VBH - mT - mB,
    yMax = 55
  const TY = [0, 10, 20, 30, 40, 50]
  const TX = [1990, 2000, 2010, 2018, 2024]
  const x = (yr: number) => mL + ((yr - 1990) / (2024 - 1990)) * plotW
  const y = (v: number) => mT + (1 - v / yMax) * plotH

  const defs = el("defs", {})
  SERIES.forEach((s) => {
    const f = el("filter", {
      id: "g-" + uid + "-" + s.key,
      x: "-20%",
      y: "-20%",
      width: "140%",
      height: "140%",
    })
    f.appendChild(el("feGaussianBlur", { stdDeviation: "3", in: "SourceGraphic" }))
    defs.appendChild(f)
  })
  svg.appendChild(defs)

  TY.forEach((v) => {
    svg.appendChild(el("line", { x1: mL, y1: y(v), x2: mL + plotW, y2: y(v), stroke: GRID, "stroke-width": 1 }))
    const t = el("text", { x: mL - 10, y: y(v) + 4, "text-anchor": "end", fill: AXIS, "font-size": 12, "font-weight": 500 })
    t.textContent = v + "%"
    svg.appendChild(t)
  })
  TX.forEach((yr) => {
    const t = el("text", { x: x(yr), y: mT + plotH + 26, "text-anchor": "middle", fill: AXIS, "font-size": 12, "font-weight": 500 })
    t.textContent = yr === 1990 || yr === 2024 ? String(yr) : "'" + String(yr).slice(2)
    svg.appendChild(t)
  })

  const current: Record<string, number[]> = {}
  const paths: Record<string, SVGElement> = {}
  const glows: Record<string, SVGElement> = {}
  const endName: Record<string, SVGElement> = {}
  const endVal: Record<string, SVGElement> = {}
  SERIES.forEach((s) => {
    current[s.key] = DATA.nominal[s.key].slice()
    const g = el("path", { fill: "none", stroke: s.color, "stroke-width": 5, "stroke-linejoin": "round", "stroke-linecap": "round", filter: "url(#g-" + uid + "-" + s.key + ")", opacity: 0.55 })
    svg.appendChild(g)
    glows[s.key] = g
    const p = el("path", { fill: "none", stroke: s.color, "stroke-width": 2.6, "stroke-linejoin": "round", "stroke-linecap": "round" })
    svg.appendChild(p)
    paths[s.key] = p
    const en = el("text", { x: mL + plotW + 10, "text-anchor": "start", fill: s.color, "font-size": 12.5, "font-weight": 700 })
    en.textContent = s.short
    svg.appendChild(en)
    endName[s.key] = en
    const ev = el("text", { x: mL + plotW + 10, "text-anchor": "start", fill: s.color, "font-size": 11, "font-weight": 600, opacity: 0.85 })
    svg.appendChild(ev)
    endVal[s.key] = ev
  })

  const pathD = (arr: number[]) => {
    let d = ""
    for (let i = 0; i < YEARS.length; i++) d += (i ? "L" : "M") + x(YEARS[i]).toFixed(1) + " " + y(arr[i]).toFixed(1) + " "
    return d
  }
  const placeEndLabels = () => {
    const items = SERIES.map((s) => ({ key: s.key, v: current[s.key][YEARS.length - 1] }))
    items.sort((a, b) => b.v - a.v)
    const minGap = 15
    let prevY = -1e9
    items.forEach((it) => {
      let yy = y(it.v)
      if (yy - prevY < minGap) yy = prevY + minGap
      prevY = yy
      endName[it.key].setAttribute("y", String(yy - 2))
      endVal[it.key].setAttribute("y", String(yy + 11))
      endVal[it.key].textContent = it.v.toFixed(1) + "%"
    })
  }
  const redraw = () => {
    SERIES.forEach((s) => {
      const d = pathD(current[s.key])
      paths[s.key].setAttribute("d", d)
      glows[s.key].setAttribute("d", d)
    })
    placeEndLabels()
  }

  const annoGroups: Record<string, SVGElement> = {}
  ;["nominal", "ppp"].forEach((view) => {
    const grp = el("g", { opacity: view === "nominal" ? "1" : "0" })
    ;(grp as SVGElement).style.transition = "opacity .3s"
    ANNO_PTS[view].forEach((a) => {
      const s = SERIES.filter((z) => z.key === a.key)[0]
      const vv = DATA[view][a.key][YEARS.indexOf(a.year)]
      const px = x(a.year),
        py = y(vv),
        up = py > 140
      grp.appendChild(el("circle", { cx: px, cy: py, r: 4.5, fill: s.color, stroke: "#0f1830", "stroke-width": 2 }))
      const tx = el("text", { x: px + (a.year > 2015 ? -6 : 8), y: up ? py - 12 : py + 20, "text-anchor": a.year > 2015 ? "end" : "start", fill: ANNO, "font-size": 11.5, "font-weight": 600 })
      tx.textContent = a.text
      grp.appendChild(tx)
    })
    svg.appendChild(grp)
    annoGroups[view] = grp
  })

  const hg = el("line", { x1: 0, y1: mT, x2: 0, y2: mT + plotH, stroke: "rgba(255,255,255,.22)", "stroke-width": 1, opacity: 0 })
  svg.appendChild(hg)
  const hdots = SERIES.map((s) => {
    const c = el("circle", { r: 4.5, fill: s.color, stroke: "#0f1830", "stroke-width": 2, opacity: 0 })
    svg.appendChild(c)
    return c
  })
  const hit = el("rect", { x: mL, y: mT, width: plotW, height: plotH, fill: "transparent" })
  ;(hit as SVGElement).style.cursor = "crosshair"
  svg.appendChild(hit)
  const tip = fig.querySelector(".ec-tip") as HTMLElement | null

  const showTip = (yr: number) => {
    if (!tip) return
    const idx = YEARS.indexOf(yr),
      px = x(yr)
    hg.setAttribute("x1", String(px))
    hg.setAttribute("x2", String(px))
    hg.setAttribute("opacity", "1")
    hdots.forEach((c, i) => {
      c.setAttribute("cx", String(px))
      c.setAttribute("cy", String(y(current[SERIES[i].key][idx])))
      c.setAttribute("opacity", "1")
    })
    const rows = SERIES.slice()
      .sort((a, b) => current[b.key][idx] - current[a.key][idx])
      .map((s) => '<div class="tr"><span class="sw" style="background:' + s.color + '"></span>' + s.name + "<b>" + current[s.key][idx].toFixed(1) + "%</b></div>")
      .join("")
    tip.innerHTML = '<div class="ty">' + yr + "</div>" + rows
    const leftPct = (px / VBW) * 100
    tip.style.left = leftPct + "%"
    tip.style.top = (mT / VBH) * 100 + "%"
    tip.style.transform = leftPct > 62 ? "translate(-104%,0)" : leftPct < 14 ? "translate(4%,0)" : "translate(-50%,0)"
    tip.style.opacity = "1"
  }
  const hideTip = () => {
    if (tip) tip.style.opacity = "0"
    hg.setAttribute("opacity", "0")
    hdots.forEach((c) => c.setAttribute("opacity", "0"))
  }
  const nearestYear = (clientX: number) => {
    const rect = svg.getBoundingClientRect()
    const svgX = (clientX - rect.left) * (VBW / rect.width)
    let best = YEARS[0],
      bd = 1e9
    YEARS.forEach((yr) => {
      const d = Math.abs(x(yr) - svgX)
      if (d < bd) {
        bd = d
        best = yr
      }
    })
    return best
  }
  hit.addEventListener("pointermove", (e) => showTip(nearestYear((e as PointerEvent).clientX)))
  hit.addEventListener("pointerdown", (e) => showTip(nearestYear((e as PointerEvent).clientX)))
  hit.addEventListener("pointerleave", hideTip)

  const legend = fig.querySelector(".ec-legend")
  SERIES.forEach((s) => {
    const d = document.createElement("span")
    d.className = "ec-lg"
    d.innerHTML = '<span class="sw" style="background:' + s.color + '"></span>' + s.name
    legend?.appendChild(d)
  })
  const dyn = fig.querySelector(".ec-dyn")
  if (dyn) dyn.innerHTML = CAPTION.nominal

  let view = "nominal"
  const tog = fig.querySelector(".ec-toggle")
  const pill = fig.querySelector(".ec-pill") as HTMLElement | null
  const btns = tog ? Array.from(tog.querySelectorAll("button")) : []
  const placePill = () => {
    if (!tog || !pill) return
    const b = tog.querySelector("button.on") as HTMLElement | null
    if (!b) return
    pill.style.left = b.offsetLeft + "px"
    pill.style.width = b.offsetWidth + "px"
  }
  let raf: number | null = null
  const setView = (v: string) => {
    if (v === view) return
    view = v
    btns.forEach((b) => b.classList.toggle("on", b.getAttribute("data-view") === v))
    placePill()
    if (dyn) dyn.innerHTML = CAPTION[v]
    annoGroups.nominal.setAttribute("opacity", v === "nominal" ? "1" : "0")
    annoGroups.ppp.setAttribute("opacity", v === "ppp" ? "1" : "0")
    hideTip()
    const start: Record<string, number[]> = {}
    let t0: number | null = null
    const DUR = 720
    SERIES.forEach((s) => {
      start[s.key] = current[s.key].slice()
    })
    if (raf) cancelAnimationFrame(raf)
    const frame = (ts: number) => {
      if (!t0) t0 = ts
      const k = Math.min(1, (ts - t0) / DUR)
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
      SERIES.forEach((s) => {
        const tg = DATA[v][s.key]
        for (let i = 0; i < YEARS.length; i++) current[s.key][i] = start[s.key][i] + (tg[i] - start[s.key][i]) * e
      })
      redraw()
      if (k < 1) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
  }
  btns.forEach((b) => b.addEventListener("click", () => setView(b.getAttribute("data-view") || "nominal")))

  redraw()
  placePill()
  window.addEventListener("resize", placePill)
  SERIES.forEach((s) => {
    const p = paths[s.key] as SVGPathElement
    try {
      const len = p.getTotalLength()
      p.style.transition = "none"
      p.style.strokeDasharray = String(len)
      p.style.strokeDashoffset = String(len)
      requestAnimationFrame(() => {
        p.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)"
        p.style.strokeDashoffset = "0"
      })
      setTimeout(() => {
        p.style.strokeDasharray = "none"
        p.style.transition = "none"
      }, 1300)
    } catch {
      /* getTotalLength may throw pre-layout */
    }
  })
}

/* ------------------------------------------------------------- china-peak */
function renderChinaPeak(fig: HTMLElement, uid: string) {
  const svg = fig.querySelector("svg")
  if (!svg) return
  const W = 440,
    H = 280,
    l = 40,
    r = 20,
    t = 24,
    b = 38,
    pw = W - l - r,
    ph = H - t - b,
    ymax = 22
  const arr = DATA.nominal.china,
    yrs = YEARS
  const fx = (yr: number) => l + ((yr - 1990) / (2024 - 1990)) * pw
  const fy = (v: number) => t + (1 - v / ymax) * ph
  const defs = el("defs", {})
  const lg = el("linearGradient", { id: "cg-" + uid, x1: 0, y1: 0, x2: 0, y2: 1 })
  lg.appendChild(el("stop", { offset: "0%", "stop-color": "#ef4b54", "stop-opacity": ".38" }))
  lg.appendChild(el("stop", { offset: "100%", "stop-color": "#ef4b54", "stop-opacity": "0" }))
  defs.appendChild(lg)
  svg.appendChild(defs)
  ;[0, 5, 10, 15, 20].forEach((v) => {
    svg.appendChild(el("line", { x1: l, y1: fy(v), x2: l + pw, y2: fy(v), stroke: GRID, "stroke-width": 1 }))
    const tx = el("text", { x: l - 8, y: fy(v) + 4, "text-anchor": "end", fill: AXIS, "font-size": 12, "font-weight": 500 })
    tx.textContent = String(v)
    svg.appendChild(tx)
  })
  ;[1990, 2005, 2021, 2024].forEach((yr) => {
    const tx = el("text", { x: fx(yr), y: t + ph + 24, "text-anchor": "middle", fill: AXIS, "font-size": 12, "font-weight": 500 })
    tx.textContent = yr === 1990 || yr === 2024 ? String(yr) : "'" + String(yr).slice(2)
    svg.appendChild(tx)
  })
  let dl = ""
  yrs.forEach((yr, i) => {
    dl += (i ? "L" : "M") + fx(yr).toFixed(1) + " " + fy(arr[i]).toFixed(1) + " "
  })
  const da = dl + "L" + fx(2024).toFixed(1) + " " + fy(0) + " L" + fx(1990).toFixed(1) + " " + fy(0) + " Z"
  svg.appendChild(el("path", { d: da, fill: "url(#cg-" + uid + ")" }))
  const pk = el("path", { d: dl, fill: "none", stroke: "#ef4b54", "stroke-width": 2.6, "stroke-linejoin": "round", "stroke-linecap": "round" })
  svg.appendChild(pk)
  const i21 = yrs.indexOf(2021),
    i24 = yrs.indexOf(2024)
  svg.appendChild(el("circle", { cx: fx(2021), cy: fy(arr[i21]), r: 4.5, fill: "#ef4b54", stroke: "#0f1830", "stroke-width": 2 }))
  const a1 = el("text", { x: fx(2021) - 8, y: fy(arr[i21]) - 10, "text-anchor": "end", fill: ANNO, "font-size": 11.5, "font-weight": 600 })
  a1.textContent = "18.5% · 2021 peak"
  svg.appendChild(a1)
  svg.appendChild(el("circle", { cx: fx(2024), cy: fy(arr[i24]), r: 4.5, fill: "#ef4b54", stroke: "#0f1830", "stroke-width": 2 }))
  const a2 = el("text", { x: fx(2024), y: fy(arr[i24]) + 22, "text-anchor": "end", fill: MUTED, "font-size": 11.5, "font-weight": 600 })
  a2.textContent = "16.6%"
  svg.appendChild(a2)
  const pkPath = pk as SVGPathElement
  try {
    const L = pkPath.getTotalLength()
    pkPath.style.strokeDasharray = String(L)
    pkPath.style.strokeDashoffset = String(L)
    requestAnimationFrame(() => {
      pkPath.style.transition = "stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)"
      pkPath.style.strokeDashoffset = "0"
    })
  } catch {
    /* noop */
  }
}

/* -------------------------------------------------------------- rank-flip */
function renderRankFlip(fig: HTMLElement) {
  const svg = fig.querySelector("svg")
  if (!svg) return
  const W = 440,
    H = 280,
    l = 40,
    r = 16,
    t = 28,
    b = 46,
    pw = W - l - r,
    ph = H - t - b,
    ymax = 30
  const groups = [
    { n: "China", nom: 16.6, ppp: 19.3 },
    { n: "US", nom: 26.1, ppp: 14.9 },
    { n: "EU", nom: 17.5, ppp: 14.5 },
  ]
  const fy = (v: number) => t + (1 - v / ymax) * ph
  ;[0, 10, 20, 30].forEach((v) => {
    svg.appendChild(el("line", { x1: l, y1: fy(v), x2: l + pw, y2: fy(v), stroke: GRID, "stroke-width": 1 }))
    const tx = el("text", { x: l - 8, y: fy(v) + 4, "text-anchor": "end", fill: AXIS, "font-size": 12, "font-weight": 500 })
    tx.textContent = String(v)
    svg.appendChild(tx)
  })
  const gw = pw / groups.length,
    bw = 26,
    gap = 8
  groups.forEach((g, gi) => {
    const cx = l + gi * gw + gw / 2,
      x1 = cx - bw - gap / 2,
      x2 = cx + gap / 2
    ;([
      ["nom", "#4178f2", x1, g.nom],
      ["ppp", "#ecb13f", x2, g.ppp],
    ] as [string, string, number, number][]).forEach((d) => {
      const bh = ph * (d[3] / ymax),
        by = fy(d[3])
      const rct = el("rect", { x: d[2], y: t + ph, width: bw, height: 0, rx: 4, fill: d[1] })
      ;(rct as SVGElement).style.transition = "height .9s cubic-bezier(.3,0,.2,1), y .9s cubic-bezier(.3,0,.2,1)"
      svg.appendChild(rct)
      setTimeout(() => {
        rct.setAttribute("height", bh.toFixed(1))
        rct.setAttribute("y", by.toFixed(1))
      }, 90 + gi * 70)
      const vt = el("text", { x: d[2] + bw / 2, y: by - 6, "text-anchor": "middle", fill: d[1], "font-size": 11, "font-weight": 600, opacity: 0 })
      vt.textContent = d[3].toFixed(1)
      ;(vt as SVGElement).style.transition = "opacity .5s"
      svg.appendChild(vt)
      setTimeout(() => vt.setAttribute("opacity", "0.95"), 720 + gi * 70)
    })
    const gl = el("text", { x: cx, y: t + ph + 22, "text-anchor": "middle", fill: AXIS, "font-size": 12, "font-weight": 600 })
    gl.textContent = g.n
    svg.appendChild(gl)
  })
  const ly = H - 10
  ;([
    ["Nominal", "#4178f2", l],
    ["PPP", "#ecb13f", l + 96],
  ] as [string, string, number][]).forEach((d) => {
    svg.appendChild(el("rect", { x: d[2], y: ly - 9, width: 13, height: 6, rx: 2, fill: d[1] }))
    const tx = el("text", { x: d[2] + 18, y: ly - 3, fill: AXIS, "font-size": 12, "font-weight": 600 })
    tx.textContent = d[0]
    svg.appendChild(tx)
  })
}

/* ------------------------------------------------------------ productivity */
function renderProductivity(fig: HTMLElement, uid: string) {
  const svg = fig.querySelector("svg")
  if (!svg) return
  const W = 900,
    H = 340,
    l = 50,
    r = 96,
    t = 28,
    b = 42,
    pw = W - l - r,
    ph = H - t - b,
    ymax = 100
  const PY = [1960, 1970, 1980, 1990, 1995, 2005, 2015, 2024]
  const PV = [48, 65, 80, 92, 95, 91, 83, 78]
  const fx = (yr: number) => l + ((yr - 1960) / (2024 - 1960)) * pw
  const fy = (v: number) => t + (1 - v / ymax) * ph
  const defs = el("defs", {})
  const lg = el("linearGradient", { id: "pg-" + uid, x1: 0, y1: 0, x2: 0, y2: 1 })
  lg.appendChild(el("stop", { offset: "0%", "stop-color": "#ecb13f", "stop-opacity": ".30" }))
  lg.appendChild(el("stop", { offset: "100%", "stop-color": "#ecb13f", "stop-opacity": "0" }))
  defs.appendChild(lg)
  svg.appendChild(defs)
  ;[0, 20, 40, 60, 80, 100].forEach((v) => {
    svg.appendChild(el("line", { x1: l, y1: fy(v), x2: l + pw, y2: fy(v), stroke: GRID, "stroke-width": 1 }))
    const tx = el("text", { x: l - 10, y: fy(v) + 4, "text-anchor": "end", fill: AXIS, "font-size": 12, "font-weight": 500 })
    tx.textContent = String(v)
    svg.appendChild(tx)
  })
  svg.appendChild(el("line", { x1: l, y1: fy(100), x2: l + pw, y2: fy(100), stroke: "#4178f2", "stroke-width": 1.4, "stroke-dasharray": "5 4", opacity: 0.85 }))
  const usl = el("text", { x: l + pw + 10, y: fy(100) + 4, "text-anchor": "start", fill: "#4178f2", "font-size": 12.5, "font-weight": 700 })
  usl.textContent = "US = 100"
  svg.appendChild(usl)
  ;[1960, 1980, 1995, 2010, 2024].forEach((yr) => {
    const tx = el("text", { x: fx(yr), y: t + ph + 26, "text-anchor": "middle", fill: AXIS, "font-size": 12, "font-weight": 500 })
    tx.textContent = String(yr)
    svg.appendChild(tx)
  })
  let dl = ""
  PY.forEach((yr, i) => {
    dl += (i ? "L" : "M") + fx(yr).toFixed(1) + " " + fy(PV[i]).toFixed(1) + " "
  })
  const da = dl + "L" + fx(2024).toFixed(1) + " " + fy(0) + " L" + fx(1960).toFixed(1) + " " + fy(0) + " Z"
  svg.appendChild(el("path", { d: da, fill: "url(#pg-" + uid + ")" }))
  const pl = el("path", { d: dl, fill: "none", stroke: "#ecb13f", "stroke-width": 2.8, "stroke-linejoin": "round", "stroke-linecap": "round" })
  svg.appendChild(pl)
  svg.appendChild(el("circle", { cx: fx(1995), cy: fy(95), r: 5, fill: "#ecb13f", stroke: "#0f1830", "stroke-width": 2 }))
  const a1 = el("text", { x: fx(1995), y: fy(95) - 12, "text-anchor": "middle", fill: ANNO, "font-size": 11.5, "font-weight": 600 })
  a1.textContent = "1995 · near parity (95%)"
  svg.appendChild(a1)
  svg.appendChild(el("circle", { cx: fx(2024), cy: fy(78), r: 5, fill: "#ecb13f", stroke: "#0f1830", "stroke-width": 2 }))
  const a2 = el("text", { x: fx(2024) - 8, y: fy(78) + 20, "text-anchor": "end", fill: ANNO, "font-size": 11.5, "font-weight": 600 })
  a2.textContent = "2024 · back below 80%"
  svg.appendChild(a2)
  const eul = el("text", { x: fx(2024) + 10, y: fy(78) + 4, "text-anchor": "start", fill: "#ecb13f", "font-size": 12.5, "font-weight": 700 })
  eul.textContent = "EU"
  svg.appendChild(eul)
  const plPath = pl as SVGPathElement
  try {
    const L = plPath.getTotalLength()
    plPath.style.strokeDasharray = String(L)
    plPath.style.strokeDashoffset = String(L)
    requestAnimationFrame(() => {
      plPath.style.transition = "stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)"
      plPath.style.strokeDashoffset = "0"
    })
  } catch {
    /* noop */
  }
}

/* -------------------------------------------------------------- per-capita */
function renderPerCapita(fig: HTMLElement) {
  const svg = fig.querySelector("svg")
  if (!svg) return
  const W = 900,
    H = 360,
    l = 46,
    r = 96,
    t = 30,
    b = 44,
    pw = W - l - r,
    ph = H - t - b,
    ymin = 88,
    ymax = 144
  const YY = [2000, 2003, 2006, 2008, 2010, 2013, 2016, 2019, 2021, 2024]
  const US = [100, 104, 110, 112, 108, 115, 122, 128, 129, 138]
  const EU = [100, 103, 109, 112, 106, 106, 112, 119, 117, 124]
  const fx = (yr: number) => l + ((yr - 2000) / (2024 - 2000)) * pw
  const fy = (v: number) => t + (1 - (v - ymin) / (ymax - ymin)) * ph
  ;[90, 100, 110, 120, 130, 140].forEach((v) => {
    svg.appendChild(el("line", { x1: l, y1: fy(v), x2: l + pw, y2: fy(v), stroke: v === 100 ? GRID_STRONG : GRID, "stroke-width": 1 }))
    const tx = el("text", { x: l - 9, y: fy(v) + 4, "text-anchor": "end", fill: AXIS, "font-size": 12, "font-weight": 500 })
    tx.textContent = String(v)
    svg.appendChild(tx)
  })
  const b100 = el("text", { x: l + 4, y: fy(100) - 6, "text-anchor": "start", fill: MUTED, "font-size": 12, "font-weight": 500 })
  b100.textContent = "2000 = 100"
  svg.appendChild(b100)
  ;[2000, 2008, 2013, 2019, 2024].forEach((yr) => {
    const tx = el("text", { x: fx(yr), y: t + ph + 26, "text-anchor": "middle", fill: AXIS, "font-size": 12, "font-weight": 500 })
    tx.textContent = String(yr)
    svg.appendChild(tx)
  })
  const dOf = (arr: number[]) => {
    let d = ""
    arr.forEach((v, i) => {
      d += (i ? "L" : "M") + fx(YY[i]).toFixed(1) + " " + fy(v).toFixed(1) + " "
    })
    return d
  }
  let gap = "M" + fx(YY[0]).toFixed(1) + " " + fy(US[0]).toFixed(1)
  for (let i = 1; i < YY.length; i++) gap += "L" + fx(YY[i]).toFixed(1) + " " + fy(US[i]).toFixed(1)
  for (let j = YY.length - 1; j >= 0; j--) gap += "L" + fx(YY[j]).toFixed(1) + " " + fy(EU[j]).toFixed(1)
  gap += "Z"
  svg.appendChild(el("path", { d: gap, fill: "rgba(65,120,242,.10)" }))
  const pEU = el("path", { d: dOf(EU), fill: "none", stroke: "#ecb13f", "stroke-width": 2.8, "stroke-linejoin": "round", "stroke-linecap": "round" })
  svg.appendChild(pEU)
  const pUS = el("path", { d: dOf(US), fill: "none", stroke: "#4178f2", "stroke-width": 2.8, "stroke-linejoin": "round", "stroke-linecap": "round" })
  svg.appendChild(pUS)
  const eUS = el("text", { x: fx(2024) + 10, y: fy(138) + 1, "text-anchor": "start", fill: "#4178f2", "font-size": 12.5, "font-weight": 700 })
  eUS.textContent = "US 138"
  svg.appendChild(eUS)
  const eUSv = el("text", { x: fx(2024) + 10, y: fy(138) + 15, "text-anchor": "start", fill: "#4178f2", "font-size": 11, "font-weight": 600 })
  eUSv.textContent = "+38%"
  svg.appendChild(eUSv)
  const eEU = el("text", { x: fx(2024) + 10, y: fy(124) + 1, "text-anchor": "start", fill: "#ecb13f", "font-size": 12.5, "font-weight": 700 })
  eEU.textContent = "EU 124"
  svg.appendChild(eEU)
  const eEUv = el("text", { x: fx(2024) + 10, y: fy(124) + 15, "text-anchor": "start", fill: "#ecb13f", "font-size": 11, "font-weight": 600 })
  eEUv.textContent = "+24%"
  svg.appendChild(eEUv)
  const at = el("text", { x: fx(2013), y: fy(137), "text-anchor": "middle", fill: ANNO, "font-size": 11.5, "font-weight": 600 })
  at.textContent = "The gap widens after 2008"
  svg.appendChild(at)
  ;[pEU, pUS].forEach((p) => {
    const pp = p as SVGPathElement
    try {
      const L = pp.getTotalLength()
      pp.style.strokeDasharray = String(L)
      pp.style.strokeDashoffset = String(L)
      requestAnimationFrame(() => {
        pp.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)"
        pp.style.strokeDashoffset = "0"
      })
    } catch {
      /* noop */
    }
  })
}

/* ----------------------------------------------------------- React wrappers */
function useChart(render: (fig: HTMLElement, uid: string) => void, uid: string) {
  const ref = useRef<HTMLElement>(null)
  const done = useRef(false)
  useEcStyles()
  useEffect(() => {
    if (done.current || !ref.current) return
    done.current = true
    try {
      render(ref.current, uid)
    } catch {
      /* a render failure shouldn't take down the page */
    }
  }, [render, uid])
  return ref
}

function EcMeta({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div className="ec-meta">
      <div className="ec-kicker">{kicker}</div>
      <h3 className="ec-title">{title}</h3>
      <p className="ec-sub">{sub}</p>
    </div>
  )
}
function EcCap({ children }: { children: ReactNode }) {
  return <figcaption className="ec-cap">{children}</figcaption>
}

export function GdpShareChart() {
  const uid = useId().replace(/:/g, "")
  const ref = useChart(renderGdpShare, uid)
  return (
    <figure className="ec" data-ec-id={uid} ref={ref}>
      <EcMeta
        kicker="Share of world GDP · 1990 → 2024"
        title="One world, two answers"
        sub="Percent of world output. Drag the toggle — market exchange rates versus purchasing power."
      />
      <div className="ec-head">
        <div className="ec-toggle" role="tablist" aria-label="GDP measure">
          <span className="ec-pill" />
          <button className="on" data-view="nominal" role="tab" type="button">
            Nominal · market FX
          </button>
          <button data-view="ppp" role="tab" type="button">
            PPP · price-adjusted
          </button>
        </div>
      </div>
      <div className="ec-box">
        <svg viewBox="0 0 900 470" role="img" aria-label="Share of world GDP, 1990 to 2024, nominal vs PPP" />
        <div className="ec-tip" />
      </div>
      <div className="ec-legend" />
      <div className="ec-dyn" />
      <EcCap>
        Two legitimate questions, two rulers. <b>Nominal</b> (market FX) asks who
        holds financial weight; <b>PPP</b> (price-adjusted) asks who produces real
        volume. Most arguments about “the biggest economy” are really two people
        using different rulers and mistaking it for disagreement.
      </EcCap>
    </figure>
  )
}

export function ChinaPeakChart() {
  const uid = useId().replace(/:/g, "")
  const ref = useChart(renderChinaPeak, uid)
  return (
    <figure className="ec" data-ec-id={uid} ref={ref}>
      <EcMeta
        kicker="China's share of world GDP · market exchange rates"
        title="China already peaked"
        sub="Percent of world output, nominal — the rise everyone assumes is still climbing."
      />
      <div className="ec-box">
        <svg viewBox="0 0 440 280" role="img" aria-label="China's nominal GDP share over time" />
      </div>
      <EcCap>
        At market rates China's slice topped out near <b>18.5% in 2021</b> and has
        slipped to about 16.6% since — on a weaker yuan, a property hangover and
        stretches of deflation. The relentless-rise story is a purchasing-power
        story; in the currency the world trades in, the peak is already behind us.
      </EcCap>
    </figure>
  )
}

export function RankFlipChart() {
  const uid = useId().replace(/:/g, "")
  const ref = useChart(renderRankFlip, uid)
  return (
    <figure className="ec" data-ec-id={uid} ref={ref}>
      <EcMeta
        kicker="Share of world GDP, 2024 · nominal vs PPP"
        title="Who's biggest depends on the ruler"
        sub="The same three economies, ranked by market value and by real output."
      />
      <div className="ec-box">
        <svg viewBox="0 0 440 280" role="img" aria-label="Nominal versus PPP shares in 2024" />
      </div>
      <EcCap>
        Flip from nominal to PPP and the order inverts: the <b>US leads on market
        value</b>, <b>China on real volume</b>, the EU trails on both. Same year,
        same countries, opposite headline — biggest at <i>what</i>?
      </EcCap>
    </figure>
  )
}

export function ProductivityChart() {
  const uid = useId().replace(/:/g, "")
  const ref = useChart(renderProductivity, uid)
  return (
    <figure className="ec" data-ec-id={uid} ref={ref}>
      <EcMeta
        kicker="EU labour productivity vs the US · 1960 → 2024"
        title="Caught up, then slipped back"
        sub="Output per hour, US = 100 — the engine under every GDP number here."
      />
      <div className="ec-box">
        <svg viewBox="0 0 900 340" role="img" aria-label="EU labour productivity relative to the US, 1960 to 2024" />
      </div>
      <EcCap>
        European productivity climbed from under half the US level after the war to
        about <b>95% by the mid-1990s</b> — near parity — then stalled and fell back
        below <b>80%</b>, largely an information-technology story. The level isn't
        the alarm. The slope is. (Draghi, 2024.)
      </EcCap>
    </figure>
  )
}

export function PerCapitaChart() {
  const uid = useId().replace(/:/g, "")
  const ref = useChart(renderPerCapita, uid)
  return (
    <figure className="ec" data-ec-id={uid} ref={ref}>
      <EcMeta
        kicker="Real GDP per capita · index, 2000 = 100"
        title="The honest gap: real, but modest"
        sub="Output per person, each economy in its own constant prices. EU vs US."
      />
      <div className="ec-legend ec-legend-static">
        <span className="ec-lg">
          <span className="ec-sw" style={{ background: "#4178f2" }} />
          United States
        </span>
        <span className="ec-lg">
          <span className="ec-sw" style={{ background: "#ecb13f" }} />
          European Union
        </span>
      </div>
      <div className="ec-box">
        <svg viewBox="0 0 900 360" role="img" aria-label="Real GDP per capita index, EU vs US, 2000 to 2024" />
      </div>
      <EcCap>
        The two tracked together until 2008, then the US pulled ahead while the euro
        area double-dipped through 2011–2013. By 2024 American output per head is up
        about <b>+38%</b> since 2000, the EU's about <b>+24%</b> — a real gap, but
        nowhere near the “Europe is half of America” headlines, which are nominal
        market-FX comparisons flattered by a strong dollar.
      </EcCap>
    </figure>
  )
}
