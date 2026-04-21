"use client"

import { useState } from "react"
import { DATA as DD } from "../data"
import { Plate, Metric, Panel, Seg, Tag } from "../primitives"
import { LoopDonut, Radar } from "../charts"

export function Section11_Loops() {
  return (
    <section className="section" id="s-11">
      <Plate num="06" sup="§ 06 · Self-Reinforcing Loops" page="011" title="The flywheel has <em>teeth</em>" />
      <p className="dek">Four compounding forces drive the pace. Each one feeds the next. Together they produce an annual capability multiplier of <em>~4.3×</em> — and rising.</p>
      <div className="grid g-12">
        <div className="col-5">
          <Panel title="Contribution to annual capability gain" aux="APR 2026">
            <LoopDonut data={DD.loops} />
            <div className="stack-sm" style={{ marginTop: 14 }}>
              {DD.loops.map((l, i) => {
                const c = ["var(--signal)", "var(--amber)", "var(--slate)", "var(--jade)"][i]
                return (
                  <div key={l.k} className="spread" style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, background: c }} />
                      <span style={{ color: "var(--fg)" }}>{l.k}</span>
                    </span>
                    <span style={{ color: "var(--fg-3)" }}>
                      {(l.v * 100).toFixed(0)}% · {l.note}
                    </span>
                  </div>
                )
              })}
            </div>
          </Panel>
        </div>
        <div className="col-7">
          <Panel title="The flywheel">
            <svg viewBox="0 0 560 340" className="chart">
              <defs>
                <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M0,0 L10,5 L0,10 Z" fill="var(--signal)" />
                </marker>
              </defs>
              {[
                { x: 140, y: 80, t: "Better models", s: "GPT-4→Opus 4→Vera" },
                { x: 420, y: 80, t: "More compute", s: "GB300 → Vera · 2.8× GPU-yr" },
                { x: 420, y: 240, t: "AI designs AI", s: "Architectures, training data" },
                { x: 140, y: 240, t: "More revenue", s: "$612M DAUs · $47B agentic" },
              ].map((n, i) => (
                <g key={i}>
                  <circle cx={n.x} cy={n.y} r="60" fill="var(--ink-3)" stroke="var(--signal)" strokeWidth="1" />
                  <text x={n.x} y={n.y - 4} textAnchor="middle" fontFamily="var(--serif)" fontSize="15" fill="var(--fg)">{n.t}</text>
                  <text x={n.x} y={n.y + 14} textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--fg-3)">{n.s}</text>
                </g>
              ))}
              <path d="M200,80 L360,80" stroke="var(--signal)" strokeWidth="1.25" markerEnd="url(#arr)" />
              <path d="M420,140 L420,180" stroke="var(--signal)" strokeWidth="1.25" markerEnd="url(#arr)" />
              <path d="M360,240 L200,240" stroke="var(--signal)" strokeWidth="1.25" markerEnd="url(#arr)" />
              <path d="M140,180 L140,140" stroke="var(--signal)" strokeWidth="1.25" markerEnd="url(#arr)" />
              <text x={280} y={170} textAnchor="middle" fontFamily="var(--serif)" fontStyle="italic" fontSize="22" fill="var(--signal)">4.3× / yr</text>
            </svg>
          </Panel>
          <div className="footnote"><span className="src">Model:</span> Epoch AI compute/efficiency decomposition, Feb 2026 update.</div>
        </div>
      </div>
    </section>
  )
}

export function Section12_TechBreakthroughs() {
  const [tab, setTab] = useState<"gen" | "multi" | "agent">("gen")
  type Item = { n: string; cat: string; d: string }
  const tabs: Record<"gen" | "multi" | "agent", { title: string; items: Item[] }> = {
    gen: {
      title: "Generative AI · beyond text",
      items: [
        { n: "OpenAI Sora-3", cat: "Video", d: "180s coherent scenes, full physics, character rigging, in-editor control." },
        { n: "Google Veo Cinema", cat: "Video", d: "Shot-to-shot narrative, director's notes prompting, 4K native." },
        { n: "Claude Builder 4", cat: "Code", d: "End-to-end app ship from spec · SWE-Bench Verified 89.7%." },
        { n: "AlphaProof 2", cat: "Science", d: "IMO Gold '25 · peer-reviewed math contributions in 11 journals." },
        { n: "Midjourney v8 Motion", cat: "Image", d: "Temporal coherence across up to 30s sequences." },
      ],
    },
    multi: {
      title: "Multimodal integration",
      items: DD.modalities.map((m) => ({ n: m.lead, cat: m.m, d: `${m.yr} · Score ${m.score}` })),
    },
    agent: {
      title: "Agentic systems",
      items: [
        { n: "Anthropic Computer Use 3", cat: "OS agents", d: "48hr unattended runtime, memory-of-memory, rollback." },
        { n: "Google A2A Protocol v2", cat: "Multi-agent", d: "Now an IETF draft. 400+ enterprise deploys." },
        { n: "Devin Pro", cat: "Coding agent", d: "Closes 73% of real GitHub issues end-to-end." },
        { n: "Salesforce Agentforce 3", cat: "CRM", d: "2.1M concurrent agents running on customer accts." },
        { n: "OpenAI Operator Enterprise", cat: "Ops", d: "Native SOX/SOC2 audit log, supervisor agents." },
      ],
    },
  }
  return (
    <section className="section" id="s-12">
      <Plate num="07" sup="§ 07 · Technology Breakthroughs" page="012" title="The capability surface is <em>still widening</em>" />
      <div className="spread" style={{ marginBottom: 18 }}>
        <div className="label">Select vector</div>
        <Seg
          value={tab}
          onChange={setTab}
          options={[{ value: "gen", label: "Generative" }, { value: "multi", label: "Multimodal" }, { value: "agent", label: "Agentic" }]}
        />
      </div>
      <div className="grid g-12">
        <div className="col-8">
          <Panel title={tabs[tab].title} aux="Q1 2026 frontier exemplars">
            <div className="stack-sm">
              {tabs[tab].items.map((it, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 100px 1fr",
                    gap: 16,
                    padding: "14px 0",
                    borderBottom: "1px solid var(--rule-soft)",
                    alignItems: "baseline",
                  }}
                >
                  <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--fg)" }}>{it.n}</div>
                  <div><Tag tone="signal">{it.cat}</Tag></div>
                  <div className="body small">{it.d}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Panel title="The shift · APR 2026" aux="headline">
            <div style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.15, color: "var(--fg)" }}>
              <em style={{ color: "var(--signal)" }}>Standalone</em> generative models are now a <em style={{ color: "var(--signal)" }}>commodity</em>. The frontier is <em style={{ color: "var(--signal)" }}>integrated systems</em> that perceive, plan, and act.
            </div>
          </Panel>
          <Panel title="Capability coverage">
            <table className="tbl">
              <tbody>
                <tr><td>Text</td><td className="num">98%</td></tr>
                <tr><td>Code</td><td className="num">91%</td></tr>
                <tr><td>Realtime voice</td><td className="num">96%</td></tr>
                <tr><td>Video</td><td className="num">92%</td></tr>
                <tr><td>Spatial/3D</td><td className="num" style={{ color: "var(--signal)" }}>74%</td></tr>
                <tr><td>Embodied</td><td className="num" style={{ color: "var(--signal)" }}>58%</td></tr>
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section13_Multimodal() {
  return (
    <section className="section" id="s-13">
      <Plate num="08" sup="§ 08 · Multimodal" page="013" title="Everything is <em>one modality now</em>" />
      <p className="dek">The 2024 stack had separate text, vision, audio, and video models. The 2026 stack has one multimodal token stream. Latency collapsed; context expanded; reasoning unified.</p>
      <div className="grid g-12">
        <div className="col-7">
          <Panel title="Modality leaders · Q1 2026" aux="score / latency / context">
            <div className="stack-sm">
              {DD.modalities.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr 140px 60px",
                    gap: 12,
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--rule-soft)",
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{m.m}</div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--fg)" }}>{m.lead}</div>
                  </div>
                  <div style={{ position: "relative", height: 6, background: "var(--ink-3)" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${m.score}%`, background: "var(--signal)" }} />
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--fg-2)" }}>{m.yr}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--signal)", textAlign: "right" }}>{m.score}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="col-5 stack-md">
          <Metric signal big label="VOICE LATENCY" value="<180" unit="ms" sub="End-to-end realtime, Google Astra 2. Human perception threshold ≈200ms." />
          <Metric label="CTX WINDOW" value="8" unit="hr" sub="Gemini 3 Ultra long-video, equivalent ≈10M tokens" />
          <Panel title="Cross-modal killer app">
            <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--fg)", lineHeight: 1.3 }}>
              &ldquo;Watch this 6-hour legal deposition. <em style={{ color: "var(--signal)" }}>Show me every contradiction, tagged by timestamp, with a confidence score.</em>&rdquo; — now an API call.
            </div>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section14_Agentic() {
  return (
    <section className="section" id="s-14">
      <Plate num="09" sup="§ 09 · Agentic AI" page="014" title="Autonomy at <em>scale</em>" />
      <div className="grid g-12">
        <div className="col-4">
          <Radar data={DD.agentic.capabilities} />
          <div className="footnote"><span className="src">RE-Bench · AgentBench · GAIA:</span> AI now matches or beats expert humans on 4/6 agentic capabilities.</div>
        </div>
        <div className="col-8 stack-md">
          <div className="grid g-3">
            <Metric signal big label="AGENTS IN PROD" value="3.4" unit="M" sub="Concurrent enterprise agents · 14× YoY" />
            <Metric label="P50 UNATTENDED" value="48" unit="hr" sub="Up from 2.1hr Q2 '25" />
            <Metric label="TASK SUCCESS" value="76" unit="%" sub="Multi-step open-domain, frontier agents" />
          </div>
          <Panel title="Where agents are winning" aux="by value unlock">
            <table className="tbl">
              <thead><tr><th>Function</th><th>Agent role</th><th className="num">Saving</th><th className="num">Avg cycle</th></tr></thead>
              <tbody>
                <tr><td>Customer service</td><td>Tier 1/2 resolution</td><td className="num" style={{ color: "var(--signal)" }}>−68%</td><td className="num">24s</td></tr>
                <tr><td>Software eng</td><td>PR review + fixes</td><td className="num" style={{ color: "var(--signal)" }}>−44%</td><td className="num">8m</td></tr>
                <tr><td>Finance ops</td><td>Reconciliation</td><td className="num" style={{ color: "var(--signal)" }}>−71%</td><td className="num">3m</td></tr>
                <tr><td>Legal review</td><td>Contract redlines</td><td className="num" style={{ color: "var(--signal)" }}>−52%</td><td className="num">6m</td></tr>
                <tr><td>Clinical ops</td><td>Prior-auth + notes</td><td className="num" style={{ color: "var(--signal)" }}>−58%</td><td className="num">2m</td></tr>
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section15_Convergence() {
  return (
    <section className="section" id="s-15">
      <Plate num="10" sup="§ 10 · Convergence" page="015" title="Generative <em>×</em> Agentic" />
      <p className="dek">The fusion of generative creation with agentic execution is the engine of 2026 enterprise value. Systems no longer just draft — they plan, act, monitor, and correct.</p>
      <div className="grid g-12">
        <div className="col-7">
          <Panel title="RealAI.EU · flagship case" aux="N=10+ enterprises">
            <div className="grid g-3">
              <div><div className="label">PROCESS AUTO ↑</div><div style={{ fontFamily: "var(--serif)", fontSize: 44, color: "var(--signal)" }}>+78%</div></div>
              <div><div className="label">INNOV CYCLE ↑</div><div style={{ fontFamily: "var(--serif)", fontSize: 44, color: "var(--signal)" }}>+86%</div></div>
              <div><div className="label">12-MO ROI</div><div style={{ fontFamily: "var(--serif)", fontSize: 44, color: "var(--signal)" }}>4.1×</div></div>
            </div>
            <div style={{ height: 1, background: "var(--rule-soft)", margin: "18px 0" }} />
            <div className="h4" style={{ marginBottom: 8 }}>Capability stack</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--fg-2)", fontSize: 13, lineHeight: 1.7 }}>
              <li>Autonomous execution of 72-hour workflows without human checkpoint</li>
              <li>Predictive insights driving proactive decisions — P99 latency &lt; 900ms</li>
              <li>Continuous RLHF from enterprise feedback closes the loop weekly</li>
            </ul>
          </Panel>
        </div>
        <div className="col-5">
          <Panel title="The convergence diagram">
            <svg viewBox="0 0 420 320" className="chart">
              <circle cx={150} cy={160} r="100" fill="rgba(232,84,43,0.12)" stroke="var(--signal)" strokeWidth="1.25" />
              <circle cx={270} cy={160} r="100" fill="rgba(232,184,74,0.12)" stroke="var(--amber)" strokeWidth="1.25" />
              <text x={100} y={100} fontFamily="var(--serif)" fontSize="16" fill="var(--signal)">Generative</text>
              <text x={100} y={118} fontFamily="var(--mono)" fontSize="10" fill="var(--fg-3)">creates</text>
              <text x={320} y={100} fontFamily="var(--serif)" fontSize="16" fill="var(--amber)">Agentic</text>
              <text x={320} y={118} fontFamily="var(--mono)" fontSize="10" fill="var(--fg-3)">acts</text>
              <text x={210} y={150} textAnchor="middle" fontFamily="var(--serif)" fontStyle="italic" fontSize="22" fill="var(--fg)">Autonomous</text>
              <text x={210} y={172} textAnchor="middle" fontFamily="var(--serif)" fontStyle="italic" fontSize="22" fill="var(--fg)">Enterprises</text>
              <text x={210} y={200} textAnchor="middle" fontFamily="var(--mono)" fontSize="10" fill="var(--fg-3)" letterSpacing="0.15em">END-TO-END VALUE</text>
            </svg>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section16_Maturity() {
  return (
    <section className="section" id="s-16">
      <Plate num="11" sup="§ 11 · Corporate Maturity" page="016" title="From pilots to <em>embedded intelligence</em>" />
      <p className="dek">Still only <em>8%</em> of organizations have embedded AI deeply enough to reach 4×+ ROI. The &ldquo;pilot purgatory&rdquo; cohort has shrunk — but the middle bulge, not the top, has grown most.</p>
      <div className="grid g-12">
        <div className="col-8">
          <div className="stack-sm">
            {DD.maturity.map((s, i) => {
              const w = 30 + (s.pct / 40) * 70
              return (
                <div key={s.stage} style={{ position: "relative", padding: "14px 18px", background: "var(--ink-3)", border: "1px solid var(--rule)" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${w}%`, background: `rgba(232,84,43,${0.08 + i * 0.06})`, borderRight: `2px solid var(--signal)` }} />
                  <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 70px 80px", gap: 14, alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.16em", color: "var(--fg-3)", textTransform: "uppercase" }}>Stage {i + 1}</div>
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
        </div>
        <div className="col-4 stack-md">
          <Metric signal big label="AT FULL MATURITY" value="8" unit="%" sub="Up from ~1% in Q2 '25, 4% in Q3 '25" />
          <Panel title="What the 8% do differently" aux="McKinsey '26">
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--fg-2)", lineHeight: 1.7 }}>
              <li>AI named as a top-3 board priority</li>
              <li>Unified data + MLOps platform</li>
              <li>&gt;80% workforce AI-literate</li>
              <li>Dedicated agent oversight org</li>
              <li>Value tracked per workflow, not per pilot</li>
            </ol>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section17_ChapterGeo() {
  return (
    <section className="section chapter" id="s-17">
      <div className="chapter-num">§ 12 · Chapter opens</div>
      <h1>Global <em>geopolitics</em> & sovereign AI.</h1>
      <div className="chapter-dek">The race is no longer about who has the best model — it&apos;s about who controls the compute, the data, the supply chain, and the rules. Six national programs now exceed $50B committed each.</div>
      <div className="chapter-meta">
        <div><span className="label">Sovereign Programs</span><span className="v">24 nations</span></div>
        <div><span className="label">Committed Capital</span><span className="v">$800B+</span></div>
        <div><span className="label">Export Controls</span><span className="v">7 regimes</span></div>
        <div><span className="label">AI Acts in Force</span><span className="v">14</span></div>
      </div>
    </section>
  )
}

export function Section18_Sovereign() {
  const [pick, setPick] = useState<keyof typeof DD.regions>("us")
  const r = DD.regions[pick]
  const regionNames: Record<string, string> = {
    us: "United States", china: "China", eu: "European Union", uk: "United Kingdom",
    me: "Middle East", india: "India", row: "Rest of World",
  }
  return (
    <section className="section" id="s-18">
      <Plate num="13" sup="§ 13 · Sovereign AI" page="017" title="A nation's <em>strategic independence</em>" />
      <p className="dek">Sovereign AI is the strategic endeavor to develop, deploy, govern, and control AI capabilities aligned with national interests. The dimensions: technology, culture, economics, security.</p>
      <div className="grid g-12">
        <div className="col-8">
          <Panel title="Regional AI investment · private vs government" aux="$B · FY2025">
            <RegionBarsInline regions={DD.regions} />
            <div className="footnote">
              <span className="src">Legend:</span> Orange bar = private investment (2025 $B). Slate bar = government/sovereign commitment. Right column ={" "}
              <span style={{ color: "var(--signal)" }}>patent share</span> / <span style={{ color: "var(--slate)" }}>publication share</span>.
            </div>
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Panel title="Select region">
            <div className="toggle-row">
              {(Object.keys(DD.regions) as Array<keyof typeof DD.regions>).map((k) => (
                <button key={k} className={`chip ${pick === k ? "on" : ""}`} onClick={() => setPick(k)}>
                  {String(k).toUpperCase()}
                </button>
              ))}
            </div>
          </Panel>
          <Panel title={regionNames[pick]} aux="Q1 2026 snapshot">
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--signal)", lineHeight: 1.2, marginBottom: 10 }}>{r.posture}</div>
            <table className="tbl">
              <tbody>
                <tr><td>Private investment</td><td className="num">${r.priv}B</td></tr>
                <tr><td>Gov / strategic</td><td className="num">${r.gov}B</td></tr>
                <tr><td>Global patent share</td><td className="num">{r.pats}%</td></tr>
                <tr><td>Global publication share</td><td className="num">{r.pubs}%</td></tr>
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </section>
  )
}

function RegionBarsInline({ regions }: { regions: typeof DD.regions }) {
  const entries = Object.entries(regions)
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

export function Section19_USChina() {
  const usa = DD.regions.us, chn = DD.regions.china
  const Row = ({ l, us, cn, hlUS, hlCN }: { l: string; us: string; cn: string; hlUS?: boolean; hlCN?: boolean }) => (
    <tr>
      <td style={{ color: hlUS ? "var(--signal)" : "var(--fg)", fontWeight: hlUS ? 500 : 400 }}>{us}</td>
      <td style={{ textAlign: "center", color: "var(--fg-4)", fontFamily: "var(--serif)", fontStyle: "italic" }}>{l}</td>
      <td style={{ textAlign: "right", color: hlCN ? "var(--signal)" : "var(--fg)", fontWeight: hlCN ? 500 : 400 }}>{cn}</td>
    </tr>
  )
  return (
    <section className="section" id="s-19">
      <Plate num="14" sup="§ 14 · US vs China" page="018" title="Two systems, <em>one race</em>" />
      <div className="grid g-12">
        <div className="col-12">
          <Panel title="Competitive axis · APR 2026" aux="parallel comparison">
            <table className="tbl" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ fontSize: 14, color: "var(--fg)", fontFamily: "var(--serif)", textTransform: "none", letterSpacing: 0 }}>United States 🇺🇸</th>
                  <th style={{ textAlign: "center" }}></th>
                  <th style={{ textAlign: "right", fontSize: 14, color: "var(--fg)", fontFamily: "var(--serif)", textTransform: "none", letterSpacing: 0 }}>China 🇨🇳</th>
                </tr>
              </thead>
              <tbody>
                <Row l="Private AI invest ('25)" us={`$${usa.priv}B`} cn={`$${chn.priv}B`} hlUS />
                <Row l="Government / strategic fund" us={`$${usa.gov}B`} cn={`$${chn.gov}B`} hlCN />
                <Row l="Global AI patents share" us={`${usa.pats}%`} cn={`${chn.pats}%`} hlCN />
                <Row l="Global AI publications" us={`${usa.pubs}%`} cn={`${chn.pubs}%`} hlCN />
                <Row l="Flagship frontier model" us="Claude 4 Opus · GPT-5.5 · Gemini 3 Ultra" cn="DeepSeek-R3 · Qwen-3 · Kimi-K3" />
                <Row l="Model benchmarks (avg, frontier)" us="92.1 MMLU · 89.7 SWE" cn="91.0 MMLU · 84.3 SWE" hlUS />
                <Row l="AI chip fabrication" us="TSMC N3/N2 access · custom silicon" cn="SMIC N5 · Huawei Ascend 920" />
                <Row l="Regulatory approach" us="Fragmented · sector · Exec Orders 14110/14179" cn="Comprehensive · state-centric · MSS oversight" />
                <Row l="Posture" us="Pro-competition · innovation-led" cn="Security & sovereignty · content restriction" />
                <Row l="Diplomatic leverage" us="Export controls (EAR, entity list)" cn="Rare-earth · African compute hubs" />
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
      <div className="grid g-4" style={{ marginTop: 18 }}>
        <Metric signal label="US CAPEX ADVANTAGE" value="3.1" unit="×" sub="Hyperscaler FY26 capex vs. China equivalents" />
        <Metric label="CN PATENT LEAD" value="+14" unit="pp" sub="Patent share gap widens, 2024→2026" />
        <Metric label="EXPORT CTRL TIGHTENING" value="4" unit="rounds" sub="Since Oct 2022; most recent Mar 2026" />
        <Metric label="COMPUTE DECOUPLING" value="82" unit="%" sub="Of CN inference now on domestic silicon" />
      </div>
    </section>
  )
}

export function Section20_RestAndBridge() {
  return (
    <section className="section" id="s-20">
      <Plate num="15–17" sup="§ 15–17 · EU · Middle East · India" page="019" title="<em>Three strategies</em>, three outcomes" />
      <div className="grid g-3">
        <Panel title="European Union · Regulatory Superpower" aux="in force">
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--fg)", lineHeight: 1.2, marginBottom: 10 }}>AI Act <em style={{ color: "var(--signal)" }}>enforced</em>. HOMINIS live. AI Factories 2.0.</div>
          <table className="tbl">
            <tbody>
              <tr><td>Private invest</td><td className="num">$22.1B</td></tr>
              <tr><td>Sovereign compute</td><td className="num">94B€ / AI Factories</td></tr>
              <tr><td>Patents / Pubs</td><td className="num">14% / 18%</td></tr>
              <tr><td>Flagship LLM</td><td className="num">HOMINIS-2</td></tr>
            </tbody>
          </table>
          <div className="footnote">First region with binding AI obligations. <span style={{ color: "var(--signal)" }}>€2.8B</span> in fines issued Q4 2025.</div>
        </Panel>
        <Panel title="Middle East · New Powerhouses" aux="capital-led">
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--fg)", lineHeight: 1.2, marginBottom: 10 }}>Data <em style={{ color: "var(--signal)" }}>embassies</em>. HUMAIN 2 live. Falcon-3 open.</div>
          <table className="tbl">
            <tbody>
              <tr><td>Committed capital</td><td className="num">$420B</td></tr>
              <tr><td>UAE partnerships</td><td className="num">G42 · Microsoft · NVIDIA</td></tr>
              <tr><td>KSA flagship</td><td className="num">HUMAIN-2 · NEOM</td></tr>
              <tr><td>Policy inno</td><td className="num">Data embassies</td></tr>
            </tbody>
          </table>
          <div className="footnote">The GCC now accounts for <span style={{ color: "var(--signal)" }}>12%</span> of global AI training compute, up from 3% in 2024.</div>
        </Panel>
        <Panel title="India · Multilingual Sovereignty" aux="22 langs">
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--fg)", lineHeight: 1.2, marginBottom: 10 }}>Sarvam-2 live. IndiaAI <em style={{ color: "var(--signal)" }}>Mission 2.0</em> · ₹22,400 Cr.</div>
          <table className="tbl">
            <tbody>
              <tr><td>IndiaAI Mission 2.0</td><td className="num">₹22,400 Cr · $2.7B</td></tr>
              <tr><td>Digital public infra</td><td className="num">1.4B Aadhaar</td></tr>
              <tr><td>Languages</td><td className="num">22 + 38 dialects</td></tr>
              <tr><td>Talent pipeline</td><td className="num">6.8M grads / yr</td></tr>
            </tbody>
          </table>
          <div className="footnote">India&apos;s UPI+AI stack is now being licensed by <span style={{ color: "var(--signal)" }}>11 nations</span> — a fourth pole emerges.</div>
        </Panel>
      </div>

      <div
        className="panel"
        style={{
          marginTop: 28,
          padding: "32px 36px",
          background: "linear-gradient(135deg, rgba(232,84,43,0.08), transparent 70%), var(--ink-2)",
          borderColor: "var(--signal)",
        }}
      >
        <div className="label accent">END OF PART I · BRIDGE</div>
        <h2 className="h3" style={{ fontSize: 38, marginTop: 12 }}>What&apos;s <em>next</em> in Part II · <span style={{ color: "var(--fg-3)" }}>sections 21–75</span></h2>
        <div className="grid g-4" style={{ marginTop: 20 }}>
          <div>
            <div className="label">Investment Landscape</div>
            <div className="body" style={{ marginTop: 6 }}>$512B hyperscaler capex, $74B VC Q1 &apos;26, 38 new unicorns since July.</div>
          </div>
          <div>
            <div className="label">Infrastructure & Power</div>
            <div className="body" style={{ marginTop: 6 }}>4.1% of global electricity. Grid constraints, SMR deals, water reality.</div>
          </div>
          <div>
            <div className="label">IP, Safety & Regulation</div>
            <div className="body" style={{ marginTop: 6 }}>NYT v OpenAI concludes. EU AI Act enforcement. US AI Bill of Rights.</div>
          </div>
          <div>
            <div className="label">Strategic Implications</div>
            <div className="body" style={{ marginTop: 6 }}>For the enterprise, for talent, for capital allocation, for national policy.</div>
          </div>
        </div>
      </div>
    </section>
  )
}
