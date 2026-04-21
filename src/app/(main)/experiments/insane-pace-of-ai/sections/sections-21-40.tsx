"use client"

import { useState } from "react"
import { DATA2 as D2 } from "../data"
import { Plate, Metric, Panel, Seg, Tag } from "../primitives"
import { SectorDonut, RegionCompareBars, HBars, MarketShare, GroupedBars } from "../charts"

export function Section21_ChapterRegional() {
  return (
    <section className="section chapter" id="s-21">
      <div className="chapter-num">§ 18 · Chapter opens</div>
      <h1>Seven <em>regional systems</em>,<br />seven theories of victory.</h1>
      <div className="chapter-dek">
        No AI strategy is regionally neutral. Each bloc has picked its lane — frontier capital, state direction, regulation-as-export, sovereign compute, or DPI scale — and doubled down. The next seven sections look, in detail, at what each is actually building.
      </div>
      <div className="chapter-meta">
        <div><span className="label">Deep Dives</span><span className="v">7 regions</span></div>
        <div><span className="label">Committed Capital</span><span className="v">$811B</span></div>
        <div><span className="label">Regulatory Regimes</span><span className="v">14 active</span></div>
        <div><span className="label">Sovereign LLMs</span><span className="v">11 flagship</span></div>
      </div>
    </section>
  )
}

function RegionDeepSpread({ k, num, page }: { k: keyof typeof D2.regionDeep; num: string; page: string }) {
  const r = D2.regionDeep[k]
  return (
    <>
      <Plate num={num} sup={`§ ${num} · ${r.name}`} page={page} title={`<em>${r.flag}</em> ${r.name}`} />
      <div className="grid g-12">
        <div className="col-8">
          <Panel title="Strategic posture" aux={r.pill}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--fg)", lineHeight: 1.2, marginBottom: 14 }}>{r.posture}</div>
            <div className="row" style={{ gap: 18 }}>
              <div style={{ borderLeft: "2px solid var(--signal)", paddingLeft: 14 }}>
                <div className="label">Moment</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--fg)" }}>{r.moment}</div>
              </div>
              <div style={{ borderLeft: "2px solid var(--signal)", paddingLeft: 14, marginLeft: "auto" }}>
                <div className="label">Private · Govt</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--fg)" }}>${r.priv}B · ${r.pub}B</div>
              </div>
            </div>
          </Panel>
          <Panel title="Strategic pillars" aux="APR 2026" className="" style={{ marginTop: 18 }}>
            <div className="stack-sm">
              {r.pillars.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "24px 220px 1fr",
                    gap: 14,
                    padding: "12px 0",
                    borderBottom: "1px solid var(--rule-soft)",
                    alignItems: "baseline",
                  }}
                >
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--signal)" }}>0{i + 1}</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--fg)" }}>{p.k}</div>
                  <div className="body small">{p.d}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Panel title="By the numbers">
            <div className="stack-sm">
              {r.stat.map((s, i) => (
                <div key={i} className="spread" style={{ padding: "10px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.l}</span>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--signal)" }}>{s.v}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Strategic weaknesses" aux="honest self-assessment">
            <div className="stack-sm">
              {r.weaknesses.map((w, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "14px 1fr", gap: 10, alignItems: "baseline" }}>
                  <span style={{ color: "var(--rose)", fontFamily: "var(--mono)", fontSize: 12 }}>▲</span>
                  <span style={{ fontSize: 12, color: "var(--fg-2)" }}>{w}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}

export function Section22_US() { return <section className="section" id="s-22"><RegionDeepSpread k="us" num="19" page="022" /></section> }
export function Section23_China() { return <section className="section" id="s-23"><RegionDeepSpread k="china" num="20" page="023" /></section> }
export function Section24_EU() { return <section className="section" id="s-24"><RegionDeepSpread k="eu" num="21" page="024" /></section> }
export function Section25_UK() { return <section className="section" id="s-25"><RegionDeepSpread k="uk" num="22" page="025" /></section> }
export function Section26_ME() { return <section className="section" id="s-26"><RegionDeepSpread k="me" num="23" page="026" /></section> }
export function Section27_India() { return <section className="section" id="s-27"><RegionDeepSpread k="india" num="24" page="027" /></section> }
export function Section28_ROW() { return <section className="section" id="s-28"><RegionDeepSpread k="row" num="25" page="028" /></section> }

export function Section29_RegionalCompare() {
  const [metric, setMetric] = useState<"adoption" | "genai" | "invest" | "growth">("adoption")
  const metrics = {
    adoption: { label: "Corporate AI adoption", data: D2.regionalCompare.adoption, unit: "%", n: "% of orgs running AI in ≥1 function" },
    genai:    { label: "GenAI adoption", data: D2.regionalCompare.genai, unit: "%", n: "% of orgs running GenAI in production" },
    invest:   { label: "Private investment '25", data: D2.regionalCompare.invest, unit: "B$", n: "Private AI capital deployed FY2025" },
    growth:   { label: "Startup growth YoY", data: D2.regionalCompare.growth, unit: "%", n: "AI startup formation growth rate YoY" },
  } as const
  const m = metrics[metric]
  return (
    <section className="section" id="s-29">
      <Plate num="26" sup="§ 26 · Regional Comparison" page="029" title="The global AI <em>leaderboard</em>" />
      <p className="dek">No single region leads on all dimensions. The US dominates frontier capital; China dominates patents and public investment; the ME has the fastest-growing new entrants; India leads on growth pace from a smaller base.</p>
      <div className="grid g-12">
        <div className="col-8">
          <Panel title={m.label} aux={m.n}>
            <Seg
              value={metric}
              onChange={setMetric}
              options={[
                { value: "adoption", label: "Adoption" },
                { value: "genai", label: "GenAI" },
                { value: "invest", label: "Invest" },
                { value: "growth", label: "Growth" },
              ]}
            />
            <div style={{ marginTop: 20 }}>
              <RegionCompareBars metric={{ unit: m.unit }} data={m.data as Record<string, number>} />
            </div>
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Metric signal big label="US — PRIVATE CAPITAL" value="$184.7" unit="B" sub="11.7× larger than China's private AI VC in 2025" />
          <Metric label="CHINA — PATENTS" value="36" unit="%" sub="Of global AI patent filings; now leads by 14pp" />
          <Metric label="GROWTH — ME & INDIA" value="118" unit="%" sub="Startup formation in UAE+KSA; India +92% YoY" />
        </div>
      </div>
    </section>
  )
}

export function Section30_HOMINIS() {
  const h = D2.casestudies.hominis
  return (
    <section className="section" id="s-30">
      <Plate num="27" sup="§ 27 · Case Study · EU" page="030" title={`<em>${h.name}</em>`} />
      <p className="dek">Europe&apos;s sovereign LLM, live since Nov 2025. A concrete proof-point that a values-first, regulator-compatible frontier model is technically and economically viable — if politically funded.</p>
      <div className="grid g-12">
        <div className="col-7">
          <Panel title="Design principles" aux={h.tag}>
            <div className="stack-sm">
              {h.principles.map((p, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--signal)" }}>0{i + 1}</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--fg)" }}>{p}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="col-5 stack-md">
          {h.metrics.map((m, i) => (
            <div key={i} className="spread" style={{ padding: "14px 18px", background: "var(--ink-2)", border: "1px solid var(--rule)" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{m.l}</span>
              <span style={{ fontFamily: "var(--serif)", fontSize: 26, color: "var(--signal)" }}>{m.v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Section31_RealBusiness() {
  const r = D2.casestudies.realbusiness
  return (
    <section className="section" id="s-31">
      <Plate num="28" sup="§ 28 · Case Study · Enterprise" page="031" title={`<em>${r.name}</em>`} />
      <p className="dek">An agentic AI platform operating at scale across 312 enterprises. The playbook behind the 4.1× 12-month ROI — and how the perceive-plan-execute-learn loop actually closes in practice.</p>
      <div className="grid g-12">
        <div className="col-5">
          <Panel title="The operating loop" aux="continuous, bidirectional">
            <svg viewBox="0 0 300 320" className="chart">
              {[
                { x: 150, y: 50, t: "Perceive", s: "signals · data" },
                { x: 250, y: 160, t: "Plan", s: "goals · decompose" },
                { x: 150, y: 270, t: "Execute", s: "act · write · API" },
                { x: 50, y: 160, t: "Learn", s: "RLHF · reflect" },
              ].map((n, i) => (
                <g key={i}>
                  <circle cx={n.x} cy={n.y} r="48" fill="var(--ink-3)" stroke="var(--signal)" />
                  <text x={n.x} y={n.y - 2} textAnchor="middle" fontFamily="var(--serif)" fontSize="16" fill="var(--fg)">{n.t}</text>
                  <text x={n.x} y={n.y + 14} textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--fg-3)">{n.s}</text>
                </g>
              ))}
              <defs>
                <marker id="arr31" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M0,0 L10,5 L0,10 Z" fill="var(--signal)" />
                </marker>
              </defs>
              <path d="M190,80 Q240,110 230,140" fill="none" stroke="var(--signal)" strokeWidth="1" markerEnd="url(#arr31)" />
              <path d="M220,200 Q220,250 190,260" fill="none" stroke="var(--signal)" strokeWidth="1" markerEnd="url(#arr31)" />
              <path d="M110,260 Q70,230 80,200" fill="none" stroke="var(--signal)" strokeWidth="1" markerEnd="url(#arr31)" />
              <path d="M80,140 Q85,95 120,85" fill="none" stroke="var(--signal)" strokeWidth="1" markerEnd="url(#arr31)" />
            </svg>
          </Panel>
        </div>
        <div className="col-7 stack-md">
          <div className="grid g-2">
            {r.metrics.map((m, i) => (
              <div key={i} style={{ padding: "18px 20px", background: "var(--ink-2)", border: "1px solid var(--rule)" }}>
                <div className="label">{m.l}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 38, color: "var(--signal)", marginTop: 4 }}>{m.v}</div>
              </div>
            ))}
          </div>
          <Panel title="Operating principles">
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--fg-2)", fontSize: 13, lineHeight: 1.9 }}>
              {r.principles.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section32_ChapterInvest() {
  return (
    <section className="section chapter" id="s-32">
      <div className="chapter-num">§ 29 · Chapter opens</div>
      <h1>Capital formation at the <em>pace of an industrial revolution</em>.</h1>
      <div className="chapter-dek">
        AI private investment has more than 8×&apos;d in three years. Hyperscaler capex has surpassed the entire US Interstate Highway System in 2026 dollars. M&amp;A is at a decade high. This section maps the money.
      </div>
      <div className="chapter-meta">
        <div><span className="label">Priv. Invest &apos;25</span><span className="v">$244B</span></div>
        <div><span className="label">Hyperscaler Capex &apos;26</span><span className="v">$512B</span></div>
        <div><span className="label">AI Unicorns</span><span className="v">214 global</span></div>
        <div><span className="label">AI M&amp;A (2025)</span><span className="v">$186B</span></div>
      </div>
    </section>
  )
}

export function Section33_InvestFlows() {
  const yearly = [
    { y: "2020", v: 26.8 },
    { y: "2021", v: 44.2 },
    { y: "2022", v: 28.6 },
    { y: "2023", v: 62.1 },
    { y: "2024", v: 141.7 },
    { y: "2025", v: 244.0 },
    { y: "2026 YTD", v: 74.0 },
  ]
  const max = Math.max(...yearly.map((d) => d.v))
  return (
    <section className="section" id="s-33">
      <Plate num="30" sup="§ 30 · Investment Flows" page="033" title="Private AI capital · <em>8.5×</em> in three years" />
      <div className="grid g-12">
        <div className="col-8">
          <Panel title="Global private AI investment · $B" aux="CB Insights · Pitchbook · April 2026">
            <div style={{ position: "relative", height: 280, padding: "20px 10px 40px 40px" }}>
              {[0, max * 0.25, max * 0.5, max * 0.75, max].map((v, i) => (
                <div key={i} style={{ position: "absolute", left: 40, right: 10, top: 20 + (1 - v / max) * 220, borderTop: "1px dashed var(--rule-soft)" }}>
                  <div style={{ position: "absolute", left: -44, top: -7, fontFamily: "var(--mono)", fontSize: 9, color: "var(--fg-4)" }}>${v.toFixed(0)}B</div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 220, position: "relative", zIndex: 1 }}>
                {yearly.map((d, i) => (
                  <div key={d.y} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 12, color: "var(--signal)" }}>${d.v}</div>
                    <div
                      style={{
                        width: "65%",
                        background: i === yearly.length - 1 ? "var(--signal-warm)" : i >= 4 ? "var(--signal)" : "var(--rule-strong)",
                        height: `${(d.v / max) * 88}%`,
                        minHeight: 4,
                        transition: "height 0.6s cubic-bezier(0.22,1,0.36,1)",
                      }}
                    />
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.08em" }}>{d.y}</div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Metric signal big label="2025 TOTAL" value="$244" unit="B" sub="+72% YoY, a new all-time high" />
          <Metric label="2026 Q1 PACE" value="$74" unit="B" sub="On track for $290B+ annualized" />
          <Metric label="MEGA-ROUNDS (>$1B)" value="31" unit="" sub="In 2025 alone. Top: OpenAI $40B, xAI $18B" />
        </div>
      </div>
    </section>
  )
}

export function Section34_TopRecipients() {
  const cos = [
    { n: "OpenAI",        rnd: "$40B", vcat: "Frontier labs", val: "$500B", tag: "USA" },
    { n: "Anthropic",     rnd: "$18B", vcat: "Frontier labs", val: "$350B", tag: "USA" },
    { n: "xAI",           rnd: "$18B", vcat: "Frontier labs", val: "$200B", tag: "USA" },
    { n: "DeepSeek",      rnd: "$5.0B", vcat: "Frontier labs", val: "$110B", tag: "CHN" },
    { n: "Perplexity",    rnd: "$1.2B", vcat: "AI search",     val: "$38B",  tag: "USA" },
    { n: "Sakana AI",     rnd: "$3.2B", vcat: "Frontier labs", val: "$48B",  tag: "JPN" },
    { n: "Mistral",       rnd: "$1.8B", vcat: "Frontier labs", val: "$14B",  tag: "EU" },
    { n: "Real AI Inc.",  rnd: "$2.8B", vcat: "Agentic ent.",  val: "$22B",  tag: "USA" },
    { n: "Figure AI",     rnd: "$4.2B", vcat: "Humanoid",      val: "$39B",  tag: "USA" },
    { n: "Physical Intelligence", rnd: "$2.4B", vcat: "Robotics", val: "$17B", tag: "USA" },
  ]
  return (
    <section className="section" id="s-34">
      <Plate num="31" sup="§ 31 · Top Recipients · 2025" page="034" title="Where the <em>largest checks</em> went" />
      <Panel title="Largest funding rounds · 2025" aux="rank by round size · selected">
        <table className="tbl">
          <thead>
            <tr><th>#</th><th>Company</th><th>Round</th><th>Category</th><th className="num">Valuation</th><th className="num">HQ</th></tr>
          </thead>
          <tbody>
            {cos.map((c, i) => (
              <tr key={i}>
                <td style={{ color: "var(--fg-4)", width: 40 }}>{String(i + 1).padStart(2, "0")}</td>
                <td style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{c.n}</td>
                <td style={{ color: "var(--signal)" }}>{c.rnd}</td>
                <td>{c.vcat}</td>
                <td className="num">{c.val}</td>
                <td className="num" style={{ color: "var(--fg-3)" }}>{c.tag}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </section>
  )
}

export function Section35_SectorBreak() {
  return (
    <section className="section" id="s-35">
      <Plate num="32" sup="§ 32 · Sector Breakdown" page="035" title="Capital by <em>application vertical</em>" />
      <div className="grid g-12">
        <div className="col-7">
          <Panel title="Private AI investment · 2025 share · $244B" aux="YoY growth in the right column">
            <SectorDonut data={D2.sectors} />
          </Panel>
        </div>
        <div className="col-5 stack-md">
          <Panel title="Fastest-growing verticals" aux="YoY '24 → '25">
            <div className="stack-sm">
              {[...D2.sectors].sort((a, b) => b.yoy - a.yoy).slice(0, 4).map((s, i) => (
                <div key={i} className="spread" style={{ padding: "10px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--fg)" }}>{s.n}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--signal)" }}>+{s.yoy}%</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="The shift">
            <div style={{ fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.3, color: "var(--fg)" }}>
              Defense and energy-grid AI surged fastest in 2025 — a signal that <em style={{ color: "var(--signal)" }}>critical infrastructure</em> is now the frontier.
            </div>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section36_BusinessFunc() {
  return (
    <section className="section" id="s-36">
      <Plate num="33" sup="§ 33 · Business Function Adoption" page="036" title="Where enterprises <em>actually deploy</em>" />
      <p className="dek">The gap between experiment and deployment has closed. <em>89%</em> of surveyed enterprises now run AI in customer service — up from 62% a year ago. Legal remains the final frontier, but is moving.</p>
      <Panel title="% of surveyed enterprises deploying GenAI" aux="N=2,100 · McK & BCG joint · Apr 2026">
        <HBars data={D2.businessFunc} valueKey="p" labelKey="f" />
        <div className="footnote">
          Each bar shows deployment penetration, not maturity. See § 11 for the full maturity funnel; only{" "}
          <span style={{ color: "var(--signal)" }}>8%</span> of deployers are at stage-5 embedded value.
        </div>
      </Panel>
    </section>
  )
}

export function Section37_ChapterCompute() {
  return (
    <section className="section chapter" id="s-37">
      <div className="chapter-num">§ 34 · Chapter opens</div>
      <h1>The <em>substrate</em>: silicon, concrete, electrons.</h1>
      <div className="chapter-dek">
        AI is a physical industry now. Chips, fab capacity, grid interconnects, water permits, power-purchase agreements. The frontier is bottlenecked by the slowest of these. This chapter measures each.
      </div>
      <div className="chapter-meta">
        <div><span className="label">GPU TAM &apos;26</span><span className="v">$186B</span></div>
        <div><span className="label">DC Capex &apos;26</span><span className="v">$538B</span></div>
        <div><span className="label">AI Power Load</span><span className="v">940 TWh</span></div>
        <div><span className="label">Grid Queue</span><span className="v">2,140 GW</span></div>
      </div>
    </section>
  )
}

export function Section38_Hardware() {
  return (
    <section className="section" id="s-38">
      <Plate num="35" sup="§ 35 · AI Hardware Landscape" page="038" title="Accelerators · the <em>market share</em>" />
      <p className="dek">NVIDIA still owns ~62% of the frontier training market, but concentration is slowly easing. Google&apos;s in-house Ironwood-2 TPU and Huawei&apos;s Ascend 920 are the two credible challengers — for different customers.</p>
      <Panel title="Training accelerator market · share of installed flops-year · Q1 2026" aux="est. · private + public clouds">
        <MarketShare data={D2.hardware} />
      </Panel>
      <div className="grid g-4" style={{ marginTop: 18 }}>
        <Metric signal big label="NVIDIA SHARE" value="62" unit="%" sub="Still the default for frontier training" />
        <Metric label="GOOGLE IRONWOOD-2" value="14" unit="%" sub="Now serving ≈40% of Google-hosted inference" />
        <Metric label="HUAWEI ASCEND 920" value="6" unit="%" sub="~74% perf of H200; dominant inside CN" />
        <Metric label="GLOBAL GPU TAM '26" value="$186" unit="B" sub="Up from $118B '25" />
      </div>
    </section>
  )
}

export function Section39_DataCenters() {
  return (
    <section className="section" id="s-39">
      <Plate num="36" sup="§ 36 · Data Centers" page="039" title="<em>$538B</em> of AI data-center capex in 2026" />
      <div className="grid g-12">
        <div className="col-8">
          <Panel title="Regional AI data-center investment · $B · 2024–2026" aux="growth YoY right; renewable share right-most">
            <GroupedBars
              data={D2.datacenters}
              keys={["invest", "growth", "renew"]}
              labels={["Invest $B", "Growth %", "Renewable %"]}
              colors={["var(--signal)", "var(--amber)", "var(--jade)"]}
              height={220}
            />
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Panel title="New frontier clusters · 2026">
            <div className="stack-sm">
              {[
                { n: "Stargate-UAE", loc: "Abu Dhabi", gw: "5.0 GW", op: "OpenAI × G42" },
                { n: "Stargate-TX", loc: "Abilene", gw: "3.5 GW", op: "OpenAI × Oracle" },
                { n: "Prometheus", loc: "Louisiana", gw: "4.2 GW", op: "Meta" },
                { n: "Hyperion", loc: "Louisiana", gw: "2.8 GW", op: "Meta" },
                { n: "Colossus 2", loc: "Memphis", gw: "1.2 GW", op: "xAI" },
                { n: "DGX Cloud EU", loc: "Paris · Berlin", gw: "1.8 GW", op: "NVIDIA × FR/DE" },
              ].map((d, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                  <div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--fg)" }}>{d.n}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-3)" }}>{d.loc} · {d.op}</div>
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--signal)", alignSelf: "center" }}>{d.gw}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section40_Quantum() {
  const tech = [
    { n: "Superconducting qubits", lead: "IBM Heron r2 · Google Willow-2", qubit: "1,121 · 105", note: "Error correction at scale" },
    { n: "Neutral atom", lead: "QuEra · Atom Computing", qubit: "1,180", note: "Highest logical qubit density" },
    { n: "Trapped ion", lead: "IonQ Tempo · Quantinuum", qubit: "~256", note: "Longest coherence · best fidelity" },
    { n: "Photonic", lead: "PsiQuantum · Xanadu", qubit: "Utility scale target '27", note: "Room-temp, networkable" },
    { n: "Neuromorphic", lead: "Intel Loihi 3 · IBM NorthPole", qubit: "—", note: "100× energy efficiency for inference" },
  ]
  return (
    <section className="section" id="s-40">
      <Plate num="37" sup="§ 37 · Quantum & Next-Gen Compute" page="040" title="<em>Beyond</em> the GPU" />
      <p className="dek">Quantum advantage for ML remains 3–5 years out. But neuromorphic silicon is already delivering 100× energy efficiency for specific inference workloads — in production at Intel, IBM, and several defense primes.</p>
      <Panel title="The non-GPU accelerator stack · Q1 2026">
        <table className="tbl">
          <thead><tr><th>Approach</th><th>Leading programs</th><th>Scale</th><th>Note</th></tr></thead>
          <tbody>
            {tech.map((t, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{t.n}</td>
                <td>{t.lead}</td>
                <td style={{ color: "var(--signal)" }}>{t.qubit}</td>
                <td style={{ color: "var(--fg-2)" }}>{t.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <div className="grid g-3" style={{ marginTop: 18 }}>
        <Metric signal label="QUANTUM VOL LEADER" value="1,180" unit="qb" sub="QuEra neutral atom, Feb 2026" />
        <Metric label="NEUROMORPHIC EFF." value="100" unit="×" sub="Energy efficiency vs GPU, target workloads" />
        <Metric label="QUANTUM-FOR-ML" value="2028" unit="est" sub="First commercial advantage — optimization, chemistry" />
      </div>
    </section>
  )
}
