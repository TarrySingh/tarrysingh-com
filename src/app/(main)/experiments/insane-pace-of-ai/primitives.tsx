"use client"

import { ReactNode, useEffect, useState } from "react"

export const fmt = {
  n: (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 }),
  pct: (v: number) => `${v.toFixed(0)}%`,
  money: (v: number) => (v >= 1 ? `$${v.toFixed(1)}B` : `$${(v * 1000).toFixed(0)}M`),
}

export function Plate({
  num,
  sup,
  title,
  page,
  meta,
}: {
  num: string
  sup: string
  title: string
  page: string
  meta?: string
}) {
  return (
    <div className="plate">
      <div className="num">{num}</div>
      <div>
        <div className="sup">{sup}</div>
        <h2 dangerouslySetInnerHTML={{ __html: title }} />
      </div>
      <div className="kicker">
        <div>PAGE <span className="strong">{page}</span></div>
        {meta && <div>{meta}</div>}
        <div>APR <span className="strong">2026</span></div>
      </div>
    </div>
  )
}

export function Metric({
  label,
  value,
  unit,
  sub,
  delta,
  signal,
  big,
  spark,
}: {
  label: ReactNode
  value: ReactNode
  unit?: ReactNode
  sub?: ReactNode
  delta?: ReactNode
  signal?: boolean
  big?: boolean
  spark?: ReactNode
}) {
  return (
    <div className={`metric${signal ? " signal" : ""}`}>
      <div className="metric-label">
        <span>{label}</span>
        {delta && <span className="chg">{delta}</span>}
      </div>
      <div className={`metric-value${big ? " big" : ""}`}>
        <span>{value}</span>
        {unit && <span className="unit">{unit}</span>}
      </div>
      <div className="metric-sub">{sub}</div>
      {spark && <div className="metric-spark">{spark}</div>}
    </div>
  )
}

export function Panel({
  title,
  aux,
  children,
  className = "",
  footer,
  style,
}: {
  title?: ReactNode
  aux?: ReactNode
  children: ReactNode
  className?: string
  footer?: ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div className={`panel ${className}`} style={style}>
      {(title || aux) && (
        <div className="panel-header">
          <div className="panel-title">{title}</div>
          {aux && <div className="panel-aux">{aux}</div>}
        </div>
      )}
      {children}
      {footer && <div className="footnote">{footer}</div>}
    </div>
  )
}

export function Seg<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button
          key={String(o.value)}
          className={value === o.value ? "on" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Tag({
  tone = "",
  children,
}: {
  tone?: string
  children: ReactNode
}) {
  return <span className={`tag ${tone}`}>{children}</span>
}

export function CountUp({
  to,
  duration = 900,
  decimals = 0,
}: {
  to: number
  duration?: number
  decimals?: number
}) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let s: number | null = null
    let raf = 0
    const step = (t: number) => {
      if (s === null) s = t
      const p = Math.min(1, (t - s) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setV(to * eased)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])
  return <span>{v.toFixed(decimals)}</span>
}

export function Bar({
  v,
  max = 100,
  tone = "signal",
  w = 200,
}: {
  v: number
  max?: number
  tone?: "signal" | "jade" | "amber" | "slate"
  label?: string
  w?: number
}) {
  const pct = Math.min(100, (v / max) * 100)
  const col: Record<string, string> = {
    signal: "var(--signal)",
    jade: "var(--jade)",
    amber: "var(--amber)",
    slate: "var(--slate)",
  }
  return (
    <div style={{ display: "inline-block", width: w, verticalAlign: "middle" }}>
      <div style={{ height: 4, background: "var(--rule)", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pct}%`,
            background: col[tone],
          }}
        />
      </div>
    </div>
  )
}
