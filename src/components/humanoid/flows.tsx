"use client"

/** Field Guide — DeploymentTimeline + ValueSankey (ported 1:1). */

import { useState, useRef, useEffect, type CSSProperties } from "react"

/* ---------- Deployment Timeline (2024 → 2027) ---------- */
interface TlStop { y: string; c: string; title: string; items: [string, string][]; future?: boolean }
const TL: TlStop[] = [
  { y: "2024", c: "var(--c-blue)", title: "First commercial deployment", items: [["Jun", "Agility Digit goes commercial at GXO · first paid humanoid"], ["—", "Figure 02 begins the BMW Spartanburg pilot"], ["—", "Tesla shows Optimus Gen 2 working inside its factories"]] },
  { y: "2025", c: "var(--c-cyan)", title: "Capital + capability inflection", items: [["Feb", "Figure exits OpenAI; bets on in-house Helix"], ["Sep", "Figure Series C: $1B+ at $39B · 15× in 19 months"], ["Oct", "Figure 03 launches; BotQ targets mass production"], ["Nov", "BMW pilot completes · 30,000 cars, 1,250 hours"]] },
  { y: "2026", c: "var(--c-violet)", title: "From pilot to production", items: [["Jan", "Production Atlas unveiled at CES; Hyundai commits 25,000 units"], ["Feb", "Apptronik raises $520M (Google-led) at ~$5B"], ["H1", "Apollo pilots scale at Mercedes-Benz, GXO, Jabil"], ["H2", "Tesla converts Fremont lines toward Optimus; external pilots begin"]] },
  { y: "2027", c: "var(--c-magenta)", title: "Scaled rollout begins", items: [["—", "Atlas opens to external customers beyond Hyundai"], ["—", "Multi-thousand-unit fleets across automotive & logistics"], ["—", "Home-robot betas widen (1X Neo, Figure Project Go-Big)"]], future: true },
]

export function DeploymentTimeline() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  useEffect(() => {
    if (!ref.current) return
    const nodes = ref.current.querySelectorAll<HTMLElement>(".tl-stop")
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setActive(+((e.target as HTMLElement).dataset.i ?? 0)) })
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 })
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
  return (
    <div className="tl" ref={ref}>
      <div className="tl-rail">
        <div className="tl-railfill" style={{ height: ((active + 0.5) / TL.length * 100) + "%", background: TL[active].c }} />
        {TL.map((t, i) => (
          <button key={i} className={"tl-tick" + (i <= active ? " done" : "")} style={{ top: ((i + 0.5) / TL.length * 100) + "%", "--tc": t.c } as CSSProperties}
            onClick={() => ref.current?.querySelectorAll<HTMLElement>(".tl-stop")[i].scrollIntoView({ behavior: "smooth", block: "center" })}>
            <span>{t.y}</span>
          </button>
        ))}
      </div>
      <div className="tl-stops">
        {TL.map((t, i) => (
          <div className={"tl-stop" + (i === active ? " on" : "") + (t.future ? " future" : "")} data-i={i} key={i} style={{ "--tc": t.c } as CSSProperties}>
            <div className="tl-year">{t.y}{t.future && <em>projected</em>}</div>
            <h4 className="tl-title">{t.title}</h4>
            <div className="tl-items">
              {t.items.map(([m, txt], j) => (
                <div className="tl-item" key={j}><span className="tl-m">{m}</span><span className="tl-t">{txt}</span></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Value-Chain Sankey (animated) ---------- */
interface SankNode { label: string; x: number; v: number; c: string; hot?: boolean }
const SANK_NODES: Record<string, SankNode> = {
  brain: { label: "Brain · 9%", x: 470, v: 9, c: "var(--c-violet)" },
  sensors: { label: "Sensors · 9%", x: 470, v: 9, c: "var(--c-cyan)" },
  power: { label: "Power core · 11%", x: 470, v: 11, c: "var(--c-blue)" },
  structure: { label: "Structure · 18%", x: 470, v: 18, c: "var(--ink-faint)" },
  actuators: { label: "Actuators · 53%", x: 470, v: 53, c: "var(--accent)", hot: true },
}
const SANK_ORDER = ["actuators", "structure", "power", "brain", "sensors"]

export function ValueSankey() {
  const [hover, setHover] = useState<string | null>(null)
  const W = 820, H = 460, x0 = 150, x1 = 470, pad = 8
  const total = SANK_ORDER.reduce((a, k) => a + SANK_NODES[k].v, 0)
  let y = pad
  const rights: Record<string, { y: number; h: number }> = {}
  SANK_ORDER.forEach((k) => { const h = (SANK_NODES[k].v / total) * (H - pad * 2); rights[k] = { y, h }; y += h })
  const leftH = H - pad * 2
  let ly = pad
  const lefts: Record<string, { y: number; h: number }> = {}
  SANK_ORDER.forEach((k) => { const h = (SANK_NODES[k].v / total) * leftH; lefts[k] = { y: ly, h }; ly += h })

  return (
    <div className="sank">
      <svg viewBox={`0 0 ${W} ${H}`} className="sank-svg">
        <defs>
          {SANK_ORDER.map((k) => (
            <linearGradient key={k} id={"sg" + k} x1="0" x2="1">
              <stop offset="0" stopColor={SANK_NODES[k].c} stopOpacity="0.10" />
              <stop offset="1" stopColor={SANK_NODES[k].c} stopOpacity="0.42" />
            </linearGradient>
          ))}
        </defs>
        <rect x={x0 - 14} y={pad} width="14" height={leftH} fill="var(--ink-faint)" />
        <text x={x0 - 22} y={H / 2} className="sank-srclab" textAnchor="middle" transform={`rotate(-90 ${x0 - 22} ${H / 2})`}>BILL OF MATERIALS · 100%</text>
        {SANK_ORDER.map((k) => {
          const l = lefts[k], rr = rights[k]; const dim = hover && hover !== k
          const path = `M${x0},${l.y} C${(x0 + x1) / 2},${l.y} ${(x0 + x1) / 2},${rr.y} ${x1},${rr.y} L${x1},${rr.y + rr.h} C${(x0 + x1) / 2},${rr.y + rr.h} ${(x0 + x1) / 2},${l.y + l.h} ${x0},${l.y + l.h} Z`
          return (
            <path key={k} d={path} fill={`url(#sg${k})`} stroke={SANK_NODES[k].c} strokeOpacity={dim ? 0.1 : 0.4} strokeWidth="1" style={{ opacity: dim ? 0.28 : 1, transition: "opacity .3s" }} onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(null)} />
          )
        })}
        {SANK_ORDER.map((k) => {
          const rr = rights[k]; const n = SANK_NODES[k]; const dim = hover && hover !== k
          return (
            <g key={k} style={{ opacity: dim ? 0.35 : 1, transition: "opacity .3s" }} onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(null)}>
              <rect x={x1} y={rr.y} width="16" height={Math.max(2, rr.h)} fill={n.c} />
              <text x={x1 + 26} y={rr.y + rr.h / 2 + 6} className={"sank-lab" + (n.hot ? " hot" : "")}>{n.label}</text>
            </g>
          )
        })}
      </svg>
      <div className="sank-note">{hover ? <span><b style={{ color: SANK_NODES[hover].c }}>{SANK_NODES[hover].label.split(" · ")[0]}</b>, {SANK_NODES[hover].v}% of the bill of materials.</span> : <span>Hover a flow. Over half of every humanoid&apos;s hardware cost pours into the <b className="accent">actuators</b>.</span>}</div>
    </div>
  )
}
