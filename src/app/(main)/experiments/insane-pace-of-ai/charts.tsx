"use client"

import { useState } from "react"
import { Tag } from "./primitives"

type CostPoint = { m: string; v: number }
type UserGrowthPoint = { y: number; u: number }
type ParamPoint = { y: number; p: number; m: string; lab: string }
type Benchmark = { n: string; y24: number; y25: number; y26: number; ceil: number }

export function CostCurveChart({ data, height = 280 }: { data: readonly CostPoint[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 820, H = height
  const M = { t: 30, r: 60, b: 36, l: 60 }
  const iw = W - M.l - M.r, ih = H - M.t - M.b
  const xs = data.map((_, i) => M.l + (i / (data.length - 1)) * iw)
  const logv = (v: number) => Math.log10(v)
  const [vmin, vmax] = [Math.log10(0.005), Math.log10(25)]
  const y = (v: number) => M.t + (1 - (logv(v) - vmin) / (vmax - vmin)) * ih

  const path = data.map((d, i) => `${i ? "L" : "M"}${xs[i]},${y(d.v)}`).join(" ")
  const area = path + ` L${xs[xs.length - 1]},${M.t + ih} L${xs[0]},${M.t + ih} Z`
  const ticks = [20, 2, 0.2, 0.02, 0.002]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart">
      <defs>
        <linearGradient id="costGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#E8542B" stopOpacity="0.35" />
          <stop offset="1" stopColor="#E8542B" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="grid">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} />
            <text x={M.l - 8} y={y(t) + 3} textAnchor="end">${t < 1 ? t.toFixed(t < 0.01 ? 3 : 2) : t.toFixed(0)}</text>
          </g>
        ))}
      </g>
      {data.map((d, i) => (
        <text key={i} x={xs[i]} y={H - M.b + 16} textAnchor="middle">{d.m}</text>
      ))}
      <path d={area} fill="url(#costGrad)" />
      <path d={path} className="sig-stroke" strokeWidth="1.75" />
      {data.map((d, i) => (
        <g
          key={i}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          style={{ cursor: "crosshair" }}
        >
          <circle cx={xs[i]} cy={y(d.v)} r="18" fill="transparent" />
          <circle cx={xs[i]} cy={y(d.v)} r={hover === i ? 5 : 3.2} className="sig" />
          {hover === i && (
            <g>
              <line x1={xs[i]} x2={xs[i]} y1={M.t} y2={M.t + ih} stroke="var(--signal)" strokeDasharray="2 2" strokeWidth="0.75" />
              <rect x={xs[i] + 10} y={y(d.v) - 36} width="120" height="44" fill="var(--ink)" stroke="var(--signal)" />
              <text x={xs[i] + 18} y={y(d.v) - 20} fill="var(--fg-3)" fontSize="9">{d.m}</text>
              <text x={xs[i] + 18} y={y(d.v) - 4} fill="var(--signal)" fontSize="13" fontFamily="var(--serif)">${d.v < 1 ? d.v.toFixed(3) : d.v.toFixed(2)}/M tok</text>
            </g>
          )}
        </g>
      ))}
      <g>
        <text x={xs[0] + 6} y={y(20) - 10} fill="var(--fg-2)" fontSize="10">Nov &apos;22 · $20</text>
        <text x={xs[xs.length - 1] - 6} y={y(0.011) + 16} textAnchor="end" fill="var(--signal)" fontSize="11" fontFamily="var(--serif)" fontStyle="italic">1,818× cheaper →</text>
      </g>
    </svg>
  )
}

export function UserGrowthChart({ data, height = 260 }: { data: readonly UserGrowthPoint[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 620, H = height
  const M = { t: 24, r: 24, b: 36, l: 48 }
  const iw = W - M.l - M.r, ih = H - M.t - M.b
  const max = 650
  const x = (i: number) => M.l + (i / (data.length - 1)) * iw
  const y = (v: number) => M.t + ih - (v / max) * ih
  const bw = (iw / data.length) * 0.55

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart">
      <g className="grid">
        {[0, 150, 300, 450, 600].map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} />
            <text x={M.l - 8} y={y(t) + 3} textAnchor="end">{t}M</text>
          </g>
        ))}
      </g>
      {data.map((d, i) => (
        <g key={d.y} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
          <rect
            x={x(i) - bw / 2}
            y={y(d.u)}
            width={bw}
            height={y(0) - y(d.u)}
            fill={i >= data.length - 2 ? "var(--signal)" : "var(--rule-strong)"}
            className="bar"
          />
          <text x={x(i)} y={H - M.b + 16} textAnchor="middle">{d.y}</text>
          {hover === i && (
            <text x={x(i)} y={y(d.u) - 8} textAnchor="middle" fill="var(--signal)" fontSize="12" fontFamily="var(--serif)">
              {d.u}M
            </text>
          )}
        </g>
      ))}
      <text
        x={x(data.length - 1)}
        y={y(data[data.length - 1].u) - 22}
        textAnchor="middle"
        fill="var(--signal)"
        fontSize="10"
        fontFamily="var(--mono)"
        letterSpacing="0.1em"
      >
        Q1 &apos;26
      </text>
    </svg>
  )
}

export function ParamChart({ data, height = 260 }: { data: readonly ParamPoint[]; height?: number }) {
  const W = 620, H = height
  const M = { t: 30, r: 30, b: 40, l: 60 }
  const iw = W - M.l - M.r, ih = H - M.t - M.b
  const logv = (v: number) => Math.log10(v)
  const [vmin, vmax] = [Math.log10(0.8), Math.log10(800)]
  const x = (i: number) => M.l + (i / (data.length - 1)) * iw
  const y = (v: number) => M.t + (1 - (logv(v) - vmin) / (vmax - vmin)) * ih
  const ticks = [500, 100, 10, 1]

  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.p)}`).join(" ")

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart">
      <g className="grid">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} />
            <text x={M.l - 8} y={y(t) + 3} textAnchor="end">{t}B</text>
          </g>
        ))}
      </g>
      <path d={path} className="sig-stroke" strokeWidth="1.5" strokeDasharray="3 3" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.p)} r="5" fill="var(--ink)" stroke="var(--signal)" strokeWidth="1.5" />
          <text x={x(i)} y={H - M.b + 14} textAnchor="middle">{d.y}</text>
          <text x={x(i)} y={y(d.p) - 12} textAnchor="middle" fill="var(--fg)" fontSize="10.5" fontFamily="var(--mono)">
            {d.m}
          </text>
          <text x={x(i)} y={y(d.p) + 18} textAnchor="middle" fill="var(--fg-3)" fontSize="9">
            {d.p}B
          </text>
        </g>
      ))}
    </svg>
  )
}

export function BenchmarkRace({ data, year = "y26" }: { data: readonly Benchmark[]; year?: "y24" | "y25" | "y26" }) {
  return (
    <div className="stack-sm">
      {data.map((b, i) => {
        const v = b[year]
        const humanMark = 85
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr 62px", gap: 12, alignItems: "center" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--fg-2)" }}>{b.n}</div>
            <div style={{ position: "relative", height: 22, background: "var(--ink-3)", border: "1px solid var(--rule)" }}>
              <div
                style={{
                  position: "absolute",
                  left: `${humanMark}%`,
                  top: -3,
                  bottom: -3,
                  width: 1,
                  background: "var(--fg-3)",
                  opacity: 0.5,
                }}
              />
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${b.y24}%`, background: "rgba(232,84,43,0.15)", borderRight: "1px solid rgba(232,84,43,0.4)" }} />
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${b.y25}%`, background: "rgba(232,84,43,0.3)", borderRight: "1px solid rgba(232,84,43,0.6)" }} />
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${b.y26}%`, background: "var(--signal)", transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)" }} />
              <div
                style={{
                  position: "absolute",
                  right: 8,
                  top: 2,
                  color: "#0B0D10",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {v.toFixed(1)}%
              </div>
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-3)", textAlign: "right" }}>
              +{(b.y26 - b.y24).toFixed(0)}pp
            </div>
          </div>
        )
      })}
      <div className="row" style={{ marginTop: 8, fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-4)", letterSpacing: "0.1em" }}>
        <span>
          <span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(232,84,43,0.15)", marginRight: 6, verticalAlign: "middle" }} />
          2024
        </span>
        <span>
          <span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(232,84,43,0.3)", marginRight: 6, verticalAlign: "middle" }} />
          2025
        </span>
        <span>
          <span style={{ display: "inline-block", width: 10, height: 10, background: "var(--signal)", marginRight: 6, verticalAlign: "middle" }} />
          APR 2026
        </span>
        <span style={{ marginLeft: "auto" }}>│ EXPERT HUMAN BASELINE</span>
      </div>
    </div>
  )
}

export function Heatmap({
  rows,
  cols,
  data,
}: {
  rows: readonly string[]
  cols: readonly string[]
  data: readonly (readonly number[])[]
}) {
  const [hov, setHov] = useState<[number, number] | null>(null)
  const cw = 56, ch = 32
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${cols.length * cw + 140} ${rows.length * ch + 80}`} style={{ width: "100%", minWidth: 560 }} className="chart">
        {cols.map((c, i) => (
          <text
            key={c}
            x={140 + i * cw + cw / 2}
            y={70}
            transform={`rotate(-35 ${140 + i * cw + cw / 2} 70)`}
            textAnchor="end"
            fill="var(--fg-3)"
            fontSize="10"
          >
            {c}
          </text>
        ))}
        {rows.map((r, ri) => (
          <g key={r}>
            <text x={130} y={80 + ri * ch + ch / 2 + 3} textAnchor="end" fill="var(--fg-2)" fontSize="11">{r}</text>
            {cols.map((c, ci) => {
              const v = data[ri][ci]
              const op = 0.08 + (v / 100) * 0.92
              const isHov = hov && hov[0] === ri && hov[1] === ci
              return (
                <g key={c} onMouseEnter={() => setHov([ri, ci])} onMouseLeave={() => setHov(null)}>
                  <rect
                    x={140 + ci * cw + 2}
                    y={80 + ri * ch + 2}
                    width={cw - 4}
                    height={ch - 4}
                    fill="var(--signal)"
                    fillOpacity={op}
                    stroke={isHov ? "var(--signal)" : "transparent"}
                    strokeWidth="1.5"
                  />
                  <text
                    x={140 + ci * cw + cw / 2}
                    y={80 + ri * ch + ch / 2 + 3}
                    textAnchor="middle"
                    fill={v > 65 ? "#0B0D10" : "var(--fg)"}
                    fontSize="10"
                    fontFamily="var(--mono)"
                    fontWeight={isHov ? 600 : 400}
                  >
                    {v}
                  </text>
                </g>
              )
            })}
          </g>
        ))}
      </svg>
    </div>
  )
}

export function Radar({
  data,
  height = 300,
  k1 = "h",
  k2 = "ai",
  labels = ["Human expert", "AI frontier"],
}: {
  data: readonly { c: string; h: number; ai: number }[]
  height?: number
  k1?: "h" | "ai"
  k2?: "h" | "ai"
  labels?: [string, string]
}) {
  const W = 360, H = height
  const cx = W / 2
  const cy = H / 2 + 10
  const r = 110
  const n = data.length
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n
  const pt = (i: number, v: number): [number, number] => [
    cx + (Math.cos(angle(i)) * r * v) / 100,
    cy + (Math.sin(angle(i)) * r * v) / 100,
  ]
  const poly = (key: "h" | "ai") => data.map((d, i) => pt(i, d[key]).join(",")).join(" ")

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart">
      {[25, 50, 75, 100].map((v) => (
        <polygon
          key={v}
          points={data.map((_, i) => pt(i, v).join(",")).join(" ")}
          fill="none"
          stroke="var(--rule)"
          strokeWidth="0.75"
        />
      ))}
      {data.map((d, i) => {
        const [lx, ly] = pt(i, 120)
        return (
          <g key={d.c}>
            <line x1={cx} y1={cy} x2={pt(i, 100)[0]} y2={pt(i, 100)[1]} stroke="var(--rule)" strokeWidth="0.5" />
            <text x={lx} y={ly} textAnchor={lx < cx - 4 ? "end" : lx > cx + 4 ? "start" : "middle"} fill="var(--fg-2)" fontSize="10">
              {d.c}
            </text>
          </g>
        )
      })}
      <polygon points={poly(k1)} fill="rgba(111,137,166,0.12)" stroke="var(--slate)" strokeWidth="1.2" strokeDasharray="3 3" />
      <polygon points={poly(k2)} fill="rgba(232,84,43,0.18)" stroke="var(--signal)" strokeWidth="1.5" />
      {data.map((d, i) => (
        <circle key={i} cx={pt(i, d[k2])[0]} cy={pt(i, d[k2])[1]} r="3" fill="var(--signal)" />
      ))}
      <g transform={`translate(8,${H - 26})`} fontFamily="var(--mono)" fontSize="9">
        <line x1="0" y1="0" x2="18" y2="0" stroke="var(--slate)" strokeDasharray="3 3" />
        <text x="24" y="3" fill="var(--fg-2)">{labels[0]}</text>
        <line x1="0" y1="12" x2="18" y2="12" stroke="var(--signal)" strokeWidth="1.5" />
        <text x="24" y="15" fill="var(--fg-2)">{labels[1]}</text>
      </g>
    </svg>
  )
}

export function LoopDonut({
  data,
  size = 260,
}: {
  data: readonly { k: string; v: number; note: string }[]
  size?: number
}) {
  const r = size / 2 - 30, cx = size / 2, cy = size / 2, inner = r - 36
  let acc = 0
  const colors = ["var(--signal)", "var(--amber)", "var(--slate)", "var(--jade)"]
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="chart">
      {data.map((d, i) => {
        const start = acc * 2 * Math.PI - Math.PI / 2
        acc += d.v
        const end = acc * 2 * Math.PI - Math.PI / 2
        const large = d.v > 0.5 ? 1 : 0
        const x0 = cx + r * Math.cos(start), y0 = cy + r * Math.sin(start)
        const x1 = cx + r * Math.cos(end), y1 = cy + r * Math.sin(end)
        const xi0 = cx + inner * Math.cos(start), yi0 = cy + inner * Math.sin(start)
        const xi1 = cx + inner * Math.cos(end), yi1 = cy + inner * Math.sin(end)
        return (
          <path
            key={i}
            d={`M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} L${xi1},${yi1} A${inner},${inner} 0 ${large} 0 ${xi0},${yi0} Z`}
            fill={colors[i]}
            opacity={0.85}
          />
        )
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" fontFamily="var(--serif)" fontSize="28" fill="var(--fg)">
        4.3×
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--fg-3)" letterSpacing="0.16em">
        COMPOUND
      </text>
    </svg>
  )
}

type RegionEntry = { priv: number; gov: number; pats: number; pubs: number; posture: string }

export function RegionBars({ regions }: { regions: Record<string, RegionEntry> }) {
  const entries = Object.entries(regions) as [string, RegionEntry][]
  const maxPriv = Math.max(...entries.map(([, r]) => r.priv))
  const maxGov = Math.max(...entries.map(([, r]) => r.gov))
  const names: Record<string, string> = {
    us: "United States", china: "China", eu: "European Union", uk: "United Kingdom",
    me: "Middle East", india: "India", row: "Rest of World",
  }
  return (
    <div className="stack-sm">
      {entries.map(([k, r]) => (
        <div
          key={k}
          style={{
            display: "grid",
            gridTemplateColumns: "140px 1fr 1fr 70px",
            gap: 14,
            alignItems: "center",
            padding: "8px 0",
            borderBottom: "1px solid var(--rule-soft)",
          }}
        >
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--fg)" }}>{names[k]}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--fg-4)", letterSpacing: "0.1em" }}>{k.toUpperCase()}</div>
          </div>
          <div>
            <div style={{ position: "relative", height: 14, background: "var(--ink-3)" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(r.priv / maxPriv) * 100}%`, background: "var(--signal)" }} />
              <div style={{ position: "absolute", right: 6, top: -1, fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg)" }}>${r.priv}B priv</div>
            </div>
          </div>
          <div>
            <div style={{ position: "relative", height: 14, background: "var(--ink-3)" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(r.gov / maxGov) * 100}%`, background: "var(--slate)" }} />
              <div style={{ position: "absolute", right: 6, top: -1, fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg)" }}>${r.gov}B gov</div>
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "var(--mono)", fontSize: 10 }}>
            <span style={{ color: "var(--signal)" }}>{r.pats}%</span>
            <span style={{ color: "var(--fg-4)" }}> / </span>
            <span style={{ color: "var(--slate)" }}>{r.pubs}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function MaturityFunnel({
  data,
}: {
  data: readonly { stage: string; pct: number; roi: string; desc: string }[]
}) {
  return (
    <div className="stack-sm">
      {data.map((s, i) => {
        const w = 30 + (s.pct / 40) * 70
        return (
          <div
            key={s.stage}
            style={{
              position: "relative",
              padding: "14px 18px",
              background: "var(--ink-3)",
              border: "1px solid var(--rule)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${w}%`,
                background: `rgba(232,84,43,${0.08 + i * 0.06})`,
                borderRight: `2px solid var(--signal)`,
              }}
            />
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 70px 80px", gap: 14, alignItems: "center" }}>
              <div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    color: "var(--fg-3)",
                    textTransform: "uppercase",
                  }}
                >
                  Stage {i + 1}
                </div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--fg)" }}>{s.stage}</div>
                <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 2 }}>{s.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--fg)" }}>{s.pct}%</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--fg-4)", letterSpacing: "0.14em" }}>OF ORGS</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--signal)" }}>{s.roi}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--fg-4)", letterSpacing: "0.14em" }}>ROI</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function Spark({
  values,
  color = "var(--signal)",
  height = 40,
}: {
  values: readonly number[]
  color?: string
  height?: number
}) {
  const W = 200, H = height
  const min = Math.min(...values)
  const max = Math.max(...values)
  const x = (i: number) => (i / (values.length - 1)) * W
  const y = (v: number) => H - ((v - min) / (max - min || 1)) * H * 0.85 - 2
  const path = values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ")
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      <path d={`${path} L${W},${H} L0,${H} Z`} fill={color} opacity="0.14" />
    </svg>
  )
}

// ---- Part II charts ----

export function Timeline({
  data,
}: {
  data: readonly { d: string; r: string; n: string; sev: string }[]
}) {
  const [hov, setHov] = useState<number | null>(null)
  const tonemap: Record<string, string> = { high: "var(--signal)", med: "var(--amber)", low: "var(--slate)" }
  return (
    <div style={{ position: "relative", padding: "8px 0 0" }}>
      <div style={{ position: "absolute", left: 140, right: 0, top: 16, bottom: 16, borderLeft: "1px dashed var(--rule)" }} />
      <div className="stack-sm">
        {data.map((d, i) => {
          const col = tonemap[d.sev] || "var(--fg-3)"
          return (
            <div
              key={i}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 40px 1fr auto",
                gap: 14,
                alignItems: "center",
                padding: "10px 12px",
                borderBottom: "1px solid var(--rule-soft)",
                background: hov === i ? "var(--ink-3)" : "transparent",
                transition: "background 0.1s",
              }}
            >
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--fg)", letterSpacing: "0.06em" }}>{d.d}</div>
              <div style={{ position: "relative", height: 12 }}>
                <div
                  style={{
                    position: "absolute",
                    left: 8,
                    top: 4,
                    width: 8,
                    height: 8,
                    background: col,
                    borderRadius: "50%",
                    boxShadow: `0 0 0 3px ${col}22`,
                  }}
                />
              </div>
              <div style={{ fontSize: 13, color: "var(--fg)" }}>
                <span style={{ fontFamily: "var(--mono)", color: "var(--fg-3)", fontSize: 10, letterSpacing: "0.14em", marginRight: 10 }}>
                  {d.r}
                </span>
                {d.n}
              </div>
              <div>
                <Tag tone={d.sev === "high" ? "signal" : d.sev === "med" ? "amber" : "slate"}>{d.sev}</Tag>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AreaChart({
  data,
  yMax,
  unit = "TWh",
  height = 260,
}: {
  data: readonly { y: string; twh: number }[]
  yMax?: number
  unit?: string
  height?: number
}) {
  const [hov, setHov] = useState<number | null>(null)
  const W = 620, H = height
  const M = { t: 24, r: 30, b: 32, l: 52 }
  const iw = W - M.l - M.r, ih = H - M.t - M.b
  const max = yMax || Math.max(...data.map((d) => d.twh)) * 1.05
  const x = (i: number) => M.l + (i / (data.length - 1)) * iw
  const y = (v: number) => M.t + ih - (v / max) * ih
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.twh)}`).join(" ")
  const area = path + ` L${x(data.length - 1)},${M.t + ih} L${x(0)},${M.t + ih} Z`
  const ticks = [0, max * 0.25, max * 0.5, max * 0.75, max].map(Math.round)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart">
      <defs>
        <linearGradient id="energyGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--signal)" stopOpacity="0.32" />
          <stop offset="1" stopColor="var(--signal)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="grid">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} />
            <text x={M.l - 8} y={y(t) + 3} textAnchor="end">{t}</text>
          </g>
        ))}
      </g>
      <path d={area} fill="url(#energyGrad)" />
      <path d={path} className="sig-stroke" strokeWidth="1.5" />
      {data.map((d, i) => (
        <g
          key={i}
          onMouseEnter={() => setHov(i)}
          onMouseLeave={() => setHov(null)}
          style={{ cursor: "crosshair" }}
        >
          <rect x={x(i) - 20} y={M.t} width={40} height={ih} fill="transparent" />
          <circle cx={x(i)} cy={y(d.twh)} r={hov === i ? 4.5 : 3} className="sig" />
          <text x={x(i)} y={H - M.b + 14} textAnchor="middle">{d.y}</text>
          {hov === i && (
            <g>
              <line x1={x(i)} x2={x(i)} y1={M.t} y2={M.t + ih} stroke="var(--signal)" strokeDasharray="2 2" strokeWidth="0.75" />
              <rect x={x(i) + 8} y={y(d.twh) - 34} width="96" height="32" fill="var(--ink)" stroke="var(--signal)" />
              <text x={x(i) + 14} y={y(d.twh) - 20} fill="var(--fg-3)" fontSize="9">{d.y}</text>
              <text x={x(i) + 14} y={y(d.twh) - 6} fill="var(--signal)" fontSize="12" fontFamily="var(--serif)">
                {d.twh} {unit}
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  )
}

export function HBars<T extends Record<string, unknown>>({
  data,
  valueKey = "p",
  labelKey = "n",
  auxKey,
  tone = "signal",
  max,
}: {
  data: readonly T[]
  valueKey?: string
  labelKey?: string
  auxKey?: string
  tone?: string
  max?: number
}) {
  const m = max || Math.max(...data.map((d) => Number(d[valueKey] as unknown)))
  return (
    <div className="stack-sm">
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr 80px",
            gap: 14,
            alignItems: "center",
            padding: "6px 0",
          }}
        >
          <div style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--fg)" }}>
            {"icon" in d && d.icon ? (
              <span style={{ fontFamily: "var(--mono)", color: "var(--signal)", marginRight: 8 }}>{String(d.icon)}</span>
            ) : null}
            {String(d[labelKey] as unknown)}
          </div>
          <div style={{ position: "relative", height: 14, background: "var(--ink-3)" }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${(Number(d[valueKey] as unknown) / m) * 100}%`,
                background: `var(--${tone})`,
              }}
            />
            <div style={{ position: "absolute", right: 6, top: -1, fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg)" }}>
              {String(d[valueKey] as unknown)}
              {typeof d[valueKey] === "number" && Number(d[valueKey] as unknown) < 100 && valueKey === "p" ? "%" : ""}
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-3)" }}>
            {auxKey ? `+${String(d[auxKey] as unknown)}%` : ""}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SectorDonut({
  data,
  size = 260,
}: {
  data: readonly { n: string; p: number; yoy: number; icon: string }[]
  size?: number
}) {
  const [hov, setHov] = useState<number | null>(null)
  const r = size / 2 - 20, cx = size / 2, cy = size / 2, inner = r - 40
  const total = data.reduce((s, d) => s + d.p, 0)
  let acc = 0
  const palette = [
    "var(--signal)", "var(--amber)", "var(--jade)", "var(--slate)",
    "var(--signal-warm)", "var(--rose)", "#8B7BA8", "#5A6B7A",
  ]
  return (
    <div className="row" style={{ alignItems: "flex-start", gap: 20 }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, flexShrink: 0 }}>
        {data.map((d, i) => {
          const start = (acc / total) * 2 * Math.PI - Math.PI / 2
          acc += d.p
          const end = (acc / total) * 2 * Math.PI - Math.PI / 2
          const large = d.p / total > 0.5 ? 1 : 0
          const x0 = cx + r * Math.cos(start), y0 = cy + r * Math.sin(start)
          const x1 = cx + r * Math.cos(end), y1 = cy + r * Math.sin(end)
          const xi0 = cx + inner * Math.cos(start), yi0 = cy + inner * Math.sin(start)
          const xi1 = cx + inner * Math.cos(end), yi1 = cy + inner * Math.sin(end)
          return (
            <path
              key={i}
              d={`M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} L${xi1},${yi1} A${inner},${inner} 0 ${large} 0 ${xi0},${yi0} Z`}
              fill={palette[i]}
              opacity={hov === null || hov === i ? 0.95 : 0.35}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              style={{ cursor: "pointer", transition: "opacity 0.15s" }}
            />
          )
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" fontFamily="var(--serif)" fontSize="28" fill="var(--fg)">
          ${total}B
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--fg-3)" letterSpacing="0.16em">
          VC · 2025
        </text>
      </svg>
      <div className="stack-sm" style={{ flex: 1 }}>
        {data.map((d, i) => (
          <div
            key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{
              display: "grid",
              gridTemplateColumns: "14px 1fr 46px 60px",
              gap: 10,
              alignItems: "center",
              padding: "5px 8px",
              background: hov === i ? "var(--ink-3)" : "transparent",
              cursor: "pointer",
            }}
          >
            <span style={{ width: 12, height: 12, background: palette[i] }} />
            <span style={{ fontSize: 12, color: "var(--fg)" }}>{d.n}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--fg)", textAlign: "right" }}>{d.p}%</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--signal)", textAlign: "right" }}>+{d.yoy}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RegionCompareBars({
  metric,
  data,
}: {
  metric: { unit?: string }
  data: Record<string, number>
}) {
  const names: Record<string, string> = { us: "US", cn: "China", eu: "EU", uk: "UK", india: "India", me: "ME", row: "RoW" }
  const max = Math.max(...Object.values(data))
  return (
    <div className="row" style={{ gap: 4, alignItems: "flex-end", height: 120, padding: "10px 6px" }}>
      {Object.entries(data).map(([k, v]) => (
        <div
          key={k}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            height: "100%",
          }}
        >
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--signal)" }}>
            {v}
            {metric.unit || ""}
          </div>
          <div style={{ width: "70%", background: "var(--signal)", height: `${(v / max) * 78}%`, minHeight: 2 }} />
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--fg-3)", letterSpacing: "0.1em" }}>
            {names[k] || k}
          </div>
        </div>
      ))}
    </div>
  )
}

export function RiskMatrix({
  risks,
}: {
  risks: readonly { r: string; sev: string; ev: string; mit: number }[]
}) {
  const sevColor: Record<string, string> = {
    Critical: "var(--rose)",
    High: "var(--signal)",
    Medium: "var(--amber)",
    Emerging: "var(--slate)",
  }
  return (
    <div className="stack-sm">
      {risks.map((r, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "180px 80px 1fr 140px",
            gap: 14,
            alignItems: "center",
            padding: "12px 14px",
            background: "var(--ink-3)",
            border: "1px solid var(--rule-soft)",
          }}
        >
          <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--fg)" }}>{r.r}</div>
          <div>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 9,
                letterSpacing: "0.14em",
                padding: "3px 8px",
                background: sevColor[r.sev] + "22",
                color: sevColor[r.sev],
                border: `1px solid ${sevColor[r.sev]}`,
              }}
            >
              {r.sev.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-2)" }}>{r.ev}</div>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--fg-4)", letterSpacing: "0.12em", marginBottom: 4 }}>
              MITIGATED
            </div>
            <div style={{ position: "relative", height: 6, background: "var(--ink)" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${r.mit}%`, background: sevColor[r.sev] }} />
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: sevColor[r.sev], marginTop: 3 }}>{r.mit}%</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function RegulatoryQuad({
  stances,
}: {
  stances: readonly { r: string; focus: string; risk: number; inno: number; sov: number; eth: number }[]
}) {
  const Dot = ({ v, tone }: { v: number; tone: string }) => (
    <div
      style={{
        display: "inline-block",
        position: "relative",
        width: 50,
        height: 6,
        background: "var(--ink)",
        verticalAlign: "middle",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v}%`, background: `var(--${tone})` }} />
    </div>
  )
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="tbl" style={{ minWidth: 640 }}>
        <thead>
          <tr>
            <th>Region</th>
            <th>Primary focus</th>
            <th style={{ textAlign: "center" }}>Risk-Averse</th>
            <th style={{ textAlign: "center" }}>Pro-Innovation</th>
            <th style={{ textAlign: "center" }}>Sovereignty</th>
            <th style={{ textAlign: "center" }}>Ethics</th>
          </tr>
        </thead>
        <tbody>
          {stances.map((s, i) => (
            <tr key={i}>
              <td style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{s.r}</td>
              <td style={{ fontSize: 11, color: "var(--fg-2)" }}>{s.focus}</td>
              <td style={{ textAlign: "center" }}>
                <Dot v={s.risk} tone="rose" />{" "}
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, marginLeft: 6, color: "var(--fg-2)" }}>{s.risk}</span>
              </td>
              <td style={{ textAlign: "center" }}>
                <Dot v={s.inno} tone="signal" />{" "}
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, marginLeft: 6, color: "var(--fg-2)" }}>{s.inno}</span>
              </td>
              <td style={{ textAlign: "center" }}>
                <Dot v={s.sov} tone="slate" />{" "}
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, marginLeft: 6, color: "var(--fg-2)" }}>{s.sov}</span>
              </td>
              <td style={{ textAlign: "center" }}>
                <Dot v={s.eth} tone="jade" />{" "}
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, marginLeft: 6, color: "var(--fg-2)" }}>{s.eth}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function MarketShare({
  data,
}: {
  data: readonly { n: string; y: string; p: string; share: number }[]
}) {
  let acc = 0
  const palette = [
    "var(--signal)", "var(--amber)", "var(--jade)", "var(--rose)",
    "var(--slate)", "#8B7BA8", "var(--signal-warm)", "#5A6B7A",
  ]
  return (
    <div>
      <div style={{ position: "relative", height: 36, display: "flex", border: "1px solid var(--rule)" }}>
        {data.map((d, i) => {
          acc += d.share
          return (
            <div
              key={i}
              title={`${d.n} ${d.share}%`}
              style={{
                width: `${d.share}%`,
                background: palette[i],
                borderRight: i < data.length - 1 ? "1px solid rgba(0,0,0,0.2)" : "none",
                position: "relative",
                cursor: "pointer",
              }}
            >
              {d.share >= 5 && (
                <div
                  style={{
                    position: "absolute",
                    left: 6,
                    top: 4,
                    fontFamily: "var(--mono)",
                    fontSize: 9,
                    color: "#0B0D10",
                    fontWeight: 600,
                  }}
                >
                  {d.share}%
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="stack-sm" style={{ marginTop: 14 }}>
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "14px 200px 80px 1fr 50px",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span style={{ width: 12, height: 12, background: palette[i] }} />
            <span style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--fg)" }}>{d.n}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-3)" }}>{d.y}</span>
            <span style={{ fontSize: 12, color: "var(--fg-2)" }}>{d.p}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--signal)", textAlign: "right" }}>{d.share}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GroupedBars<T extends Record<string, unknown>>({
  data,
  keys,
  labels,
  colors,
  height = 200,
}: {
  data: readonly T[]
  keys: readonly string[]
  labels: readonly string[]
  colors: readonly string[]
  height?: number
}) {
  const [hov, setHov] = useState<number | null>(null)
  const W = 680, H = height
  const M = { t: 20, r: 16, b: 36, l: 56 }
  const iw = W - M.l - M.r, ih = H - M.t - M.b
  const all = data.flatMap((d) => keys.map((k) => Number(d[k] as unknown)))
  const max = Math.max(...all) * 1.1
  const y = (v: number) => M.t + ih - (v / max) * ih
  const gw = iw / data.length
  const bw = (gw * 0.8) / keys.length

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart">
      <g className="grid">
        {[0, max * 0.25, max * 0.5, max * 0.75, max].map((t, i) => (
          <g key={i}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} />
            <text x={M.l - 8} y={y(t) + 3} textAnchor="end">{Math.round(t)}</text>
          </g>
        ))}
      </g>
      {data.map((d, i) => (
        <g key={i}>
          {keys.map((k, j) => (
            <rect
              key={k}
              x={M.l + i * gw + gw * 0.1 + j * bw}
              y={y(Number(d[k] as unknown))}
              width={bw - 2}
              height={y(0) - y(Number(d[k] as unknown))}
              fill={colors[j]}
              className="bar"
              opacity={hov !== null && hov !== i ? 0.35 : 1}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
            />
          ))}
          <text x={M.l + i * gw + gw / 2} y={H - M.b + 14} textAnchor="middle">{String((d as Record<string, unknown>).region)}</text>
          {hov === i && keys.map((k, j) => (
            <text
              key={k}
              x={M.l + i * gw + gw * 0.1 + j * bw + bw / 2}
              y={y(Number(d[k] as unknown)) - 4}
              textAnchor="middle"
              fill={colors[j]}
              fontSize="9"
              fontFamily="var(--mono)"
            >
              {String(d[k] as unknown)}
            </text>
          ))}
        </g>
      ))}
      <g transform={`translate(${M.l + 4}, ${M.t - 10})`}>
        {keys.map((k, j) => (
          <g key={k} transform={`translate(${j * 120}, 0)`}>
            <rect x="0" y="0" width="10" height="10" fill={colors[j]} />
            <text x="14" y="9" fill="var(--fg-3)" fontSize="10">{labels[j]}</text>
          </g>
        ))}
      </g>
    </svg>
  )
}
