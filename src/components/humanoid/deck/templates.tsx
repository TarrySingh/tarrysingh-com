"use client"

/**
 * The Living Report — slide templates.
 *
 * Nine archetype renderers over the manifest schema, all inside the
 * .ha-root design system. Shared moves:
 *  - `hl()` renders {{...}} as chapter-accent stat highlights.
 *  - every major block carries .hd-in with a stagger index, so each
 *    slide turn plays one orchestrated cascade (reduced-motion safe).
 *  - SlideChrome provides the eyebrow / footer frame + source trace.
 */

import { Fragment, useState, type CSSProperties, type ReactNode } from "react"
import type {
  Slide, TitleSlide, DividerSlide, BulletsSlide, StatsSlide,
  TwoPanelSlide, CaseSlide, TableSlide, TimelineSlide, InstrumentSlide,
  ChartSlide, TabsSlide, FlowSlide, PanelSide, PanelMark,
} from "./types"
import { MarketModel } from "@/components/humanoid/charts"
import { GrowthDrivers, AppCaseStudies, MarketConcentration } from "@/components/humanoid/content"
import { DeploymentTimeline, ValueSankey } from "@/components/humanoid/flows"
import { SpecComparator, ROICalculator } from "@/components/humanoid/tools"
import { WarMap } from "@/components/humanoid/tools2"
import { ComparativeFramework, TechDeepDive } from "@/components/humanoid/frameworks"
import { EcosystemGraph, CaseStudyMap } from "@/components/humanoid/network"

/* ---------- inline stat highlights: {{...}} → accent ---------- */
export function hl(text: string): ReactNode {
  const parts = text.split(/\{\{(.+?)\}\}/g)
  return parts.map((p, i) =>
    i % 2 === 1 ? <b key={i} className="hd-hl">{p}</b> : <Fragment key={i}>{p}</Fragment>,
  )
}

/* ---------- stagger helper ---------- */
const stag = (i: number): CSSProperties => ({ animationDelay: `${0.06 + i * 0.07}s` })

/* ---------- shared chrome ---------- */
function SlideChrome({ slide, center, children }: { slide: Slide; center?: boolean; children: ReactNode }) {
  return (
    <div className={"hd-slide" + (center ? " hd-center" : "")} style={{ "--chap": slide.chap ?? "var(--accent-3)" } as CSSProperties}>
      {slide.eyebrow && (
        <div className="eyebrow hd-in" style={stag(0)}>
          {slide.eyebrow}
          {slide.locked && <span className="premium-badge">Premium</span>}
        </div>
      )}
      <div className="hd-body">{children}</div>
      <div className="hd-foot">
        <span>Tarry Singh — Embodied AI · {DECK_YEAR}</span>
        <span className="hd-trace">
          {slide.replaces && <em>{slide.replaces} · </em>}s{String(slide.src).padStart(3, "0")}
        </span>
      </div>
    </div>
  )
}
const DECK_YEAR = "2026"

/* ---------- 1 · title ---------- */
function Title({ s }: { s: TitleSlide }) {
  return (
    <SlideChrome slide={s} center>
      <div className="hd-gridbg" />
      <div className="hd-kicker hd-in" style={stag(0)}><span className="tk" />{s.kicker}</div>
      <h1 className="hd-title hd-in" style={stag(1)}>
        {s.title.split("\n").map((line, i) => <span key={i}>{line}<br /></span>)}
      </h1>
      <p className="hd-standfirst hd-in" style={stag(2)}>{s.sub}</p>
      <div className="hd-metaline hd-in" style={stag(3)}>{s.meta}</div>
    </SlideChrome>
  )
}

/* ---------- 2 · divider ---------- */
function Divider({ s }: { s: DividerSlide }) {
  return (
    <SlideChrome slide={s} center>
      <div className="hd-gridbg" />
      <div className="hd-numeral" aria-hidden>{s.numeral}</div>
      <div className="hd-part hd-in" style={stag(0)}><span className="tk" />{s.part}</div>
      <h2 className="hd-divtitle hd-in" style={stag(1)}>{s.title}</h2>
      <div className="hd-topics">
        {s.topics.map((t, i) => (
          <div className="hd-topic hd-in" key={t.n} style={stag(2 + i * 0.6)}>
            <span className="hd-topic-n">{t.n}</span>
            <span className="hd-topic-t">{t.t}</span>
          </div>
        ))}
      </div>
    </SlideChrome>
  )
}

/* ---------- 3 · bullets ---------- */
function Bullets({ s }: { s: BulletsSlide }) {
  return (
    <SlideChrome slide={s}>
      <h2 className="hd-h hd-in" style={stag(1)}>{s.title}</h2>
      <div className="hd-lis">
        {s.bullets.map((b, i) => (
          <div className="hd-li hd-in" key={i} style={stag(2 + i)}>
            <span className="hd-tick" />
            <p>{b.lead && <b>{b.lead.replace(/:$/, "")}: </b>}{hl(b.text)}</p>
          </div>
        ))}
      </div>
      {s.callout && (
        <div className="hd-callout hd-in" style={stag(2 + s.bullets.length)}>
          <span className="hd-callout-k">{s.callout.k}</span>
          <p>{hl(s.callout.text)}</p>
        </div>
      )}
    </SlideChrome>
  )
}

/* ---------- 4 · stat band ---------- */
function Stats({ s }: { s: StatsSlide }) {
  return (
    <SlideChrome slide={s}>
      <h2 className="hd-h hd-in" style={stag(1)}>{s.title}</h2>
      <div className="hd-stats">
        {s.stats.map((st, i) => (
          <div className="hd-stat hd-in" key={i} style={stag(2 + i)}>
            <span className="hd-stat-big">{st.big}</span>
            <span className="hd-stat-lab">{st.lab}</span>
          </div>
        ))}
      </div>
      {s.body?.map((b, i) => (
        <p className="hd-prose hd-in" key={i} style={stag(2 + s.stats.length + i)}>{hl(b)}</p>
      ))}
      {s.foot && <div className="hd-srcline hd-in" style={stag(3 + s.stats.length)}>{s.foot}</div>}
    </SlideChrome>
  )
}

/* ---------- 5 · two-panel comparative (reuses .cf-* system) ---------- */
const MARK_COLOR: Record<PanelMark, string> = { "+": "var(--pos)", "−": "var(--neg)", "~": "var(--c-amber)" }

function Panel({ side, i }: { side: PanelSide; i: number }) {
  return (
    <div className="cf-panel hd-in" style={{ ...stag(2 + i), "--pc": side.accent } as CSSProperties}>
      <div className="cf-phead"><span className="cf-pname">{side.name}</span><span className="cf-ptag">{side.tag}</span></div>
      {side.rows.map((r, j) => (
        <div className="cf-row" key={j}>
          <div className="cf-rt">{r.t}</div>
          {r.items.map(([m, txt], k) => (
            <div className="cf-item" key={k}>
              <span className="cf-mark" style={{ color: MARK_COLOR[m], borderColor: MARK_COLOR[m] }}>{m}</span>
              <span className="cf-txt">{txt}</span>
            </div>
          ))}
        </div>
      ))}
      {side.ex && <div className="cf-ex">{side.ex}</div>}
    </div>
  )
}

function TwoPanel({ s }: { s: TwoPanelSlide }) {
  return (
    <SlideChrome slide={s}>
      <h2 className="hd-h hd-in" style={stag(1)}>{s.title}</h2>
      {s.sub && <p className="hd-sub hd-in" style={stag(1.5)}>{s.sub}</p>}
      <div className="cf-grid hd-cfgrid">
        <Panel side={s.L} i={0} />
        <Panel side={s.R} i={1} />
      </div>
    </SlideChrome>
  )
}

/* ---------- 6 · case study (reuses .acs-* system) ---------- */
function Case({ s }: { s: CaseSlide }) {
  return (
    <SlideChrome slide={s}>
      <div className="acs-detail hd-case hd-in" style={{ ...stag(1), "--cc": s.chap ?? "var(--c-blue)" } as CSSProperties}>
        <div className="acs-k">Case study</div>
        <div className="acs-title">{s.robot} <span>at {s.co}</span></div>
        <div className="acs-site">{s.site}</div>
        <div className="acs-body">
          <div className="acs-task hd-in" style={stag(2)}><div className="acs-lab">The task</div><p>{s.task}</p></div>
          <div className="acs-res hd-in" style={stag(3)}><div className="acs-lab">Results</div><ul>{s.results.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
        </div>
        {s.roi && <div className="acs-roi hd-in" style={stag(4)}><span className="acs-roilab">ROI</span>{s.roi}</div>}
      </div>
    </SlideChrome>
  )
}

/* ---------- 7 · table ---------- */
function Table({ s }: { s: TableSlide }) {
  const cols = `1.2fr ${Array(s.columns.length - 1).fill("1fr").join(" ")}`
  return (
    <SlideChrome slide={s}>
      <h2 className="hd-h hd-in" style={stag(1)}>{s.title}</h2>
      {s.sub && <p className="hd-sub hd-in" style={stag(1.5)}>{s.sub}</p>}
      <div className="hd-table hd-in" style={stag(2)}>
        <div className="hd-tr hd-th" style={{ gridTemplateColumns: cols }}>
          {s.columns.map((c, i) => <span key={i}>{c}</span>)}
        </div>
        {s.rows.map((r, i) => (
          <div className="hd-tr hd-in" key={i} style={{ ...stag(2.5 + i * 0.7), gridTemplateColumns: cols }}>
            {r.map((cell, j) => <span key={j} className={j === 0 ? "hd-td-lead" : "hd-td"}>{cell}</span>)}
          </div>
        ))}
      </div>
      {s.foot && <div className="hd-srcline hd-in" style={stag(4 + s.rows.length * 0.7)}>{s.foot}</div>}
    </SlideChrome>
  )
}

/* ---------- 8 · timeline (horizontal roadmap) ---------- */
function Timeline({ s }: { s: TimelineSlide }) {
  return (
    <SlideChrome slide={s}>
      <h2 className="hd-h hd-in" style={stag(1)}>{s.title}</h2>
      {s.sub && <p className="hd-sub hd-in" style={stag(1.5)}>{s.sub}</p>}
      <div className="hd-road">
        {s.stops.map((st, i) => (
          <div className="hd-stop hd-in" key={i} style={stag(2 + i)}>
            <span className="hd-stop-dot" />
            <span className="hd-stop-when">{st.when}</span>
            <span className="hd-stop-what">{st.what}</span>
            <p className="hd-stop-detail">{st.detail}</p>
          </div>
        ))}
      </div>
    </SlideChrome>
  )
}

/* ---------- 9 · live instrument ---------- */
const INSTRUMENTS: Record<InstrumentSlide["instrument"], () => ReactNode> = {
  "market-model": () => <MarketModel />,
  "concentration": () => <MarketConcentration />,
  "war-map": () => <WarMap />,
  "spec-comparator": () => <SpecComparator />,
  "roi": () => <ROICalculator />,
  "sankey": () => <ValueSankey />,
  "ecosystem": () => <EcosystemGraph />,
  "deploy-timeline": () => <DeploymentTimeline />,
  "frameworks": () => <ComparativeFramework />,
  "tech-deep-dive": () => <TechDeepDive />,
  "app-cases": () => <AppCaseStudies />,
  "growth-drivers": () => <GrowthDrivers />,
  "case-study-map": () => <CaseStudyMap />,
}

function Instrument({ s }: { s: InstrumentSlide }) {
  const render = INSTRUMENTS[s.instrument]
  return (
    <SlideChrome slide={s}>
      <div className="hd-liverow hd-in" style={stag(1)}>
        <h2 className="hd-h">{s.title}</h2>
        <span className="hd-live"><span className="hd-live-dot" />Live instrument</span>
      </div>
      {s.sub && <p className="hd-sub hd-in" style={stag(1.5)}>{s.sub}</p>}
      <div className="hd-instrument hd-in" style={stag(2)}>
        {render ? render() : <div className="hd-srcline">Instrument “{s.instrument}” lands in Phase C.</div>}
      </div>
    </SlideChrome>
  )
}

/* ---------- 10 · generic native chart ---------- */
const CHART_FALLBACK = ["var(--c-blue)", "var(--c-cyan)", "var(--c-violet)", "var(--c-green)", "var(--c-amber)", "var(--c-red)", "var(--c-magenta)", "#9aa0ae"]
const chartColor = (d: { color?: string }, i: number) => d.color ?? CHART_FALLBACK[i % CHART_FALLBACK.length]

function ChartBody({ s }: { s: ChartSlide }) {
  const max = Math.max(...s.data.map((d) => d.value), 1)
  if (s.ctype === "donut") {
    const total = s.data.reduce((a, d) => a + d.value, 0) || 1
    const R = 130, r = 82, cx = 150, cy = 150
    let acc = 0
    const arcs = s.data.map((d, i) => {
      const a0 = (acc / total) * 2 * Math.PI - Math.PI / 2
      acc += d.value
      const a1 = (acc / total) * 2 * Math.PI - Math.PI / 2
      const large = a1 - a0 > Math.PI ? 1 : 0
      const p = (ang: number, rad: number): [number, number] => [cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)]
      const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R), [x2, y2] = p(a1, r), [x3, y3] = p(a0, r)
      return { d, i, path: `M${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r},${r} 0 ${large} 0 ${x3},${y3} Z` }
    })
    return (
      <div className="hd-chart hd-donutwrap">
        <svg viewBox="0 0 300 300" className="hd-donut">
          {arcs.map((a) => (
            <path key={a.i} d={a.path} fill={chartColor(a.d, a.i)} stroke="var(--paper-dark-2)" strokeWidth="1.5" />
          ))}
        </svg>
        <div className="hd-chart-legend">
          {s.data.map((d, i) => (
            <div className="hd-cl" key={i}>
              <i style={{ background: chartColor(d, i) }} />
              <span className="hd-cl-lab">{d.label}{d.note && <em> · {d.note}</em>}</span>
              <span className="hd-cl-val">{d.value}{s.unit ?? "%"}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (s.ctype === "hbar") {
    return (
      <div className="hd-chart hd-hbars">
        {s.data.map((d, i) => (
          <div className="hd-hbar hd-in" key={i} style={stag(2 + i * 0.6)}>
            <span className="hd-hbar-lab">{d.label}{d.note && <em>{d.note}</em>}</span>
            <span className="hd-hbar-track"><span className="hd-hbar-fill" style={{ width: `${(d.value / max) * 100}%`, background: chartColor(d, i) }} /></span>
            <span className="hd-hbar-val">{d.value}{s.unit ?? ""}</span>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="hd-chart hd-vbars">
      {s.data.map((d, i) => (
        <div className="hd-vbar hd-in" key={i} style={stag(2 + i * 0.6)}>
          <span className="hd-vbar-val">{d.value}{s.unit ?? ""}</span>
          <span className="hd-vbar-col"><span className="hd-vbar-fill" style={{ height: `${(d.value / max) * 100}%`, background: chartColor(d, i) }} /></span>
          <span className="hd-vbar-lab">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function Chart({ s }: { s: ChartSlide }) {
  return (
    <SlideChrome slide={s}>
      <h2 className="hd-h hd-in" style={stag(1)}>{s.title}</h2>
      {s.sub && <p className="hd-sub hd-in" style={stag(1.5)}>{s.sub}</p>}
      <div className="hd-in" style={stag(2)}><ChartBody s={s} /></div>
      {s.foot && <div className="hd-srcline hd-in" style={stag(3)}>{s.foot}</div>}
    </SlideChrome>
  )
}

/* ---------- 11 · interactive tabs ---------- */
function Tabs({ s }: { s: TabsSlide }) {
  const [active, setActive] = useState(0)
  const t = s.tabs[active]
  return (
    <SlideChrome slide={s}>
      <h2 className="hd-h hd-in" style={stag(1)}>{s.title}</h2>
      {s.sub && <p className="hd-sub hd-in" style={stag(1.5)}>{s.sub}</p>}
      <div className="hd-tabbar hd-in" style={stag(2)}>
        {s.tabs.map((tab, i) => (
          <button key={i} className={"hd-tab" + (i === active ? " on" : "")} onClick={() => setActive(i)}>{tab.label}</button>
        ))}
      </div>
      <div className="hd-tabpanel" key={active}>
        {t.stats && (
          <div className="hd-stats hd-tabstats">
            {t.stats.map((st, i) => (
              <div className="hd-stat hd-in" key={i} style={stag(0.5 + i * 0.6)}>
                <span className="hd-stat-big">{st.big}</span>
                <span className="hd-stat-lab">{st.lab}</span>
              </div>
            ))}
          </div>
        )}
        {t.bullets && (
          <div className="hd-lis">
            {t.bullets.map((b, i) => (
              <div className="hd-li hd-in" key={i} style={stag(0.5 + i * 0.6)}>
                <span className="hd-tick" />
                <p>{b.lead && <b>{b.lead.replace(/:$/, "")}: </b>}{hl(b.text)}</p>
              </div>
            ))}
          </div>
        )}
        {t.note && <div className="hd-srcline hd-in" style={stag(2.5)}>{t.note}</div>}
      </div>
    </SlideChrome>
  )
}

/* ---------- 12 · step flow ---------- */
function Flow({ s }: { s: FlowSlide }) {
  return (
    <SlideChrome slide={s}>
      <h2 className="hd-h hd-in" style={stag(1)}>{s.title}</h2>
      {s.sub && <p className="hd-sub hd-in" style={stag(1.5)}>{s.sub}</p>}
      <div className="hd-flow">
        {s.steps.map((st, i) => (
          <div className="hd-step hd-in" key={i} style={stag(2 + i * 0.8)}>
            <span className="hd-step-n">{String(i + 1).padStart(2, "0")}</span>
            <span className="hd-step-k">{st.k}</span>
            <p className="hd-step-d">{hl(st.d)}</p>
            {st.stat && <span className="hd-step-stat">{st.stat}</span>}
            {i < s.steps.length - 1 && <span className="hd-step-arrow" aria-hidden>→</span>}
          </div>
        ))}
      </div>
      {s.foot && <div className="hd-srcline hd-in" style={stag(3 + s.steps.length)}>{s.foot}</div>}
    </SlideChrome>
  )
}

/* ---------- dispatcher ---------- */
export function renderSlide(s: Slide): ReactNode {
  switch (s.kind) {
    case "title": return <Title s={s} />
    case "divider": return <Divider s={s} />
    case "bullets": return <Bullets s={s} />
    case "stats": return <Stats s={s} />
    case "twoPanel": return <TwoPanel s={s} />
    case "case": return <Case s={s} />
    case "table": return <Table s={s} />
    case "timeline": return <Timeline s={s} />
    case "instrument": return <Instrument s={s} />
    case "chart": return <Chart s={s} />
    case "tabs": return <Tabs s={s} />
    case "flow": return <Flow s={s} />
  }
}
