"use client"

import { useState } from "react"
import { DATA as D } from "../data"
import { Plate, Metric, Panel, Seg, Tag, CountUp, Bar } from "../primitives"
import {
  CostCurveChart, UserGrowthChart, ParamChart, BenchmarkRace,
  Heatmap, LoopDonut, Spark,
} from "../charts"

export function Section01_Cover() {
  return (
    <section className="section" id="s-01">
      <Plate num="00" sup="Front Matter · Confidential" page="001" title='The Insane Pace of <em>Accelerating AI</em>' meta="Q1 2026 · Executive Report" />
      <div className="grid g-12">
        <div className="col-7 stack-md">
          <p className="dek">
            An executive intelligence dashboard on the state of artificial intelligence, April 2026. Nine months after the Q3 2025 baseline, every pace-of-change metric has steepened. This report tracks capability, cost, capital, and geopolitics across <em>twenty dimensions</em> of acceleration.
          </p>
          <div className="grid g-3">
            <Panel title="Report ID" aux="v26.Q1"><div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--fg)" }}>{D.reportId}</div></Panel>
            <Panel title="Coverage"><div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--fg)" }}>{D.coverage}</div></Panel>
            <Panel title="Classification"><div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--signal)" }}>CONFIDENTIAL · Tier 2</div></Panel>
          </div>
          <div className="footnote">
            <span className="src">Research partners:</span> Stanford HAI · Epoch AI · McKinsey QuantumBlack · OECD.AI · MLPerf · Artificial Analysis · Our World in Data. <br />
            <span className="src">Compiled by:</span> Real AI Inc. · Intelligence & Strategy Division.
          </div>
        </div>
        <div className="col-5">
          <div className="panel paper" style={{ minHeight: 360, padding: "32px 28px" }}>
            <div className="panel-title">Imprint</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 40, lineHeight: 0.95, color: "var(--paper-ink)", marginTop: 20, letterSpacing: "-0.02em" }}>
              Q1<br /><em style={{ color: "var(--signal-dim)", fontStyle: "italic" }}>MMXXVI</em>
            </div>
            <div style={{ marginTop: 28, height: 1, background: "rgba(11,13,16,0.2)" }} />
            <div style={{ marginTop: 16, fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.8, color: "rgba(11,13,16,0.7)", letterSpacing: "0.08em" }}>
              ISSUE № 07 · APR 2026<br />
              PAGES 001 – 090<br />
              SERIES · THE INSANE PACE OF AI<br />
              EDITOR · K. NAKAMURA<br />
              DATA CUTOFF · 14 APR 2026
            </div>
            <div style={{ marginTop: 28, fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 15, color: "rgba(11,13,16,0.75)", borderLeft: "2px solid var(--signal-dim)", paddingLeft: 14 }}>
              &ldquo;The model of 2022 is the smartphone app of 2026 — assumed, unremarkable, everywhere.&rdquo;
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Section02_TOC({ onJump }: { onJump: (id: string) => void }) {
  const toc = [
    { n: "01", name: "Executive Summary & Key Findings", pg: "003–005", star: true },
    { n: "02", name: "The Unprecedented Acceleration", pg: "006–012", star: true },
    { n: "03", name: "Cost & Performance Curves", pg: "013–016" },
    { n: "04", name: "Global Adoption Metrics", pg: "017–019" },
    { n: "05", name: "Accelerating Benchmarks", pg: "020–022", star: true },
    { n: "06", name: "Self-Reinforcing Feedback Loops", pg: "023–025" },
    { n: "07", name: "Technology Breakthroughs", pg: "026–030" },
    { n: "08", name: "Multimodal Intelligence", pg: "031–033" },
    { n: "09", name: "Agentic AI: Autonomy at Scale", pg: "034–037", star: true },
    { n: "10", name: "Generative × Agentic Convergence", pg: "038–040" },
    { n: "11", name: "Corporate AI Maturity Curve", pg: "041–043" },
    { n: "12", name: "Global Geopolitics & Sovereign AI", pg: "044–047", star: true },
    { n: "13", name: "The Rise of Sovereign AI", pg: "048–050" },
    { n: "14", name: "US vs China: Competitive Axis", pg: "051–053", star: true },
    { n: "15", name: "EU: Regulatory Superpower", pg: "054–056" },
    { n: "16", name: "Middle East: New AI Powerhouses", pg: "057–059" },
    { n: "17", name: "India: Multilingual Sovereignty", pg: "060–062" },
    { n: "18", name: "Rest of World: Emerging Nodes", pg: "063–065" },
    { n: "19", name: "Regional Strategic Comparison", pg: "066–069" },
    { n: "20", name: "Bridge to Part II: What's Next", pg: "070–072" },
  ]
  const btnStyle = {
    display: "grid",
    gridTemplateColumns: "32px 1fr auto",
    gap: 10,
    alignItems: "baseline",
    padding: "10px 0",
    border: "none",
    borderBottom: "1px solid var(--rule-soft)",
    textAlign: "left" as const,
    background: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    color: "var(--fg)",
  }
  return (
    <section className="section" id="s-02">
      <Plate num="01" sup="Navigation" page="002" title="Contents" meta="20 sections · 72 pages" />
      <div className="grid g-2" style={{ gap: 32 }}>
        <div>
          <div className="dek">
            This dashboard is read top-to-bottom or jumped-to directly. Starred sections are <em>critical intelligence</em> — recommended for executive read-through in under 12 minutes.
          </div>
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {toc.slice(0, 10).map((t) => (
              <button
                key={t.n}
                onClick={() => onJump(`s-${String(parseInt(t.n) + 1).padStart(2, "0")}`)}
                style={btnStyle}
              >
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: t.star ? "var(--signal)" : "var(--fg-4)" }}>
                  {t.star ? "★" : ""}
                  {t.n}
                </span>
                <span style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--fg)" }}>{t.name}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-4)" }}>{t.pg}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {toc.slice(10).map((t) => (
              <button
                key={t.n}
                onClick={() => onJump(`s-${String(parseInt(t.n) + 1).padStart(2, "0")}`)}
                style={btnStyle}
              >
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: t.star ? "var(--signal)" : "var(--fg-4)" }}>
                  {t.star ? "★" : ""}
                  {t.n}
                </span>
                <span style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--fg)" }}>{t.name}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-4)" }}>{t.pg}</span>
              </button>
            ))}
          </div>
          <div className="panel" style={{ marginTop: 20 }}>
            <div className="panel-title">Reading Path · Exec (12 min)</div>
            <div className="row" style={{ flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {["01", "02", "05", "09", "12", "14"].map((n) => <Tag key={n} tone="signal">§ {n}</Tag>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Section03_ExecSummary() {
  const h = D.hero
  return (
    <section className="section" id="s-03">
      <Plate num="02" sup="§ 01 · Executive Summary" page="003" title='The state of AI, <em>April 2026</em>' />
      <div className="grid g-12">
        <div className="col-7">
          <p className="dek">
            Nine months past the Q3 2025 watershed, every vector of AI progress has steepened rather than flattened. Frontier capability now routinely exceeds <em>expert human</em> performance on quantitative benchmarks. Inference has cheapened another order of magnitude. Agentic deployment has crossed from pilot to payroll. Sovereign programs in six capitals are racing not for parity but for <em>strategic independence</em>.
          </p>
          <div className="grid g-2">
            <Panel title="Signal — Capability">
              <div className="body">AI now matches or exceeds expert humans across 11 of the 14 benchmarks tracked by Epoch AI, up from 4 of 14 a year ago. <b style={{ color: "var(--fg)" }}>AIME 2025 at 94.2%</b> (human contestant median: 27%).</div>
            </Panel>
            <Panel title="Signal — Economics">
              <div className="body">Inference cost for a GPT-3.5-class answer is <b style={{ color: "var(--signal)" }}>1,818× cheaper</b> than Nov 2022. A single enterprise agent now costs less per resolved ticket than the electricity to run its monitor.</div>
            </Panel>
            <Panel title="Signal — Adoption">
              <div className="body"><b style={{ color: "var(--fg)" }}>91% of organizations</b> now run AI in at least one function. GenAI alone is at 84%, from 33% two years ago — the fastest enterprise adoption curve on record.</div>
            </Panel>
            <Panel title="Signal — Geopolitics">
              <div className="body">Six national sovereignty programs now exceed <b style={{ color: "var(--fg)" }}>$50B committed</b> each. Compute, not talent, is the new binding constraint. Export controls reshape every capex plan.</div>
            </Panel>
          </div>
        </div>
        <div className="col-5 stack-md">
          <div className="metric-strip" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <Metric signal label="Model Size ↓" value={<CountUp to={h.modelSizeReduction.v} />} unit={h.modelSizeReduction.unit} sub={h.modelSizeReduction.sub} />
            <Metric signal label="Inference Cost ↓" value={<CountUp to={h.inferenceCost.v} />} unit={h.inferenceCost.unit} sub={h.inferenceCost.sub} />
            <Metric label="Corporate Adoption" value={<CountUp to={h.corpAdoption.v} />} unit={h.corpAdoption.unit} sub={h.corpAdoption.sub} />
            <Metric label="Global Users" value={<CountUp to={h.globalUsers.v} />} unit={h.globalUsers.unit} sub={h.globalUsers.sub} />
          </div>
          <Panel title="Dominant Narratives · APR 2026" aux="4 themes">
            <ol style={{ margin: 0, paddingLeft: 20, fontFamily: "var(--serif)", fontSize: 16, lineHeight: 1.55, color: "var(--fg)" }}>
              <li><em style={{ color: "var(--signal)" }}>Agents go P&amp;L.</em> Autonomous systems move from ops tools to revenue line items.</li>
              <li><em style={{ color: "var(--signal)" }}>Sovereign compute.</em> Nations buy GW-scale capacity as strategic reserves.</li>
              <li><em style={{ color: "var(--signal)" }}>Efficiency &gt; scale.</em> Frontier capability from ≤2B-param models ends the scaling monoculture.</li>
              <li><em style={{ color: "var(--signal)" }}>Real regulation arrives.</em> EU, US, China each enforce; compliance capex surges.</li>
            </ol>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section04_KeyMetrics() {
  const h = D.hero
  return (
    <section className="section" id="s-04">
      <Plate num="02" sup="§ 01 · Key Metrics" page="004" title="Eight numbers that <em>define the quarter</em>" />
      <p className="dek">Every metric below has either inflected or accelerated since our Q3 2025 edition. No gauge on this page has materially softened.</p>
      <div className="grid g-4">
        <Metric signal big label="MODEL SIZE ↓" value={<CountUp to={h.modelSizeReduction.v} />} unit="×" sub="540B PaLM → 1.3B Helix-nano at equivalent MMLU"
          spark={<Spark values={[540, 70, 7, 3.8, 2.1, 1.3]} />} />
        <Metric signal big label="INFERENCE $ ↓" value={<CountUp to={h.inferenceCost.v} />} unit="×" sub="$20.00 → $0.011 per M tokens, 41 months"
          spark={<Spark values={D.costCurve.map((d) => d.v)} />} />
        <Metric label="CORP ADOPTION" value={<CountUp to={h.corpAdoption.v} />} unit="%" sub="Up from 78% (Q2 '25), 55% (2023)" />
        <Metric label="GLOBAL USERS" value={<CountUp to={h.globalUsers.v} />} unit="M+" sub="612M monthly actives, Apr 2026"
          spark={<Spark values={D.userGrowth.map((d) => d.u)} />} />
        <Metric label="AGENTIC SPEND" value={<CountUp to={h.agenticSpend.v} decimals={1} />} unit="B$" sub="Enterprise agent budgets FY25, 6.2× FY24" />
        <Metric label="ELECTRICITY" value={<CountUp to={h.aiElectricity.v} decimals={1} />} unit="%" sub="Of global electricity, AI data centers, 2025" />
        <Metric label="HYPERSCALE CAPEX" value={<CountUp to={h.capexGlobal.v} />} unit="B$" sub="Announced FY26 by top 6 cloud providers" />
        <Metric label="CN PATENT SHARE" value={<CountUp to={h.patentShare.v} />} unit="%" sub="AI patent applications, up from 32% (2024)" />
      </div>
      <div className="footnote">
        <span className="src">Sources:</span> Stanford AI Index 2026 · Artificial Analysis · IEA · McKinsey State of AI 2025 · CB Insights · WIPO.
      </div>
    </section>
  )
}

export function Section05_ChapterAccel() {
  return (
    <section className="section chapter" id="s-05">
      <div className="chapter-num">§ 02 · Chapter opens</div>
      <h1>The unprecedented <em>acceleration</em>.</h1>
      <div className="chapter-dek">Every prior technological revolution — steam, electricity, the PC, the internet, mobile — eventually hit a diffusion S-curve. AI, nine months after Q3 2025, has not. The five sections that follow dissect why — and what it does to cost, user base, benchmark, and capital flow.</div>
      <div className="chapter-meta">
        <div><span className="label">Capability</span><span className="v">+612 pp avg</span></div>
        <div><span className="label">Cost</span><span className="v">−1,818×</span></div>
        <div><span className="label">Users</span><span className="v">+298M YoY</span></div>
        <div><span className="label">Capital</span><span className="v">$512B capex</span></div>
      </div>
    </section>
  )
}

export function Section06_ModelEfficiency() {
  const [which, setWhich] = useState<"efficiency" | "raw">("efficiency")
  return (
    <section className="section" id="s-06">
      <Plate num="02" sup="§ 02 · Model Efficiency" page="006" title="Same capability, <em>412× fewer parameters</em>" />
      <div className="grid g-12">
        <div className="col-7">
          <div className="spread" style={{ marginBottom: 14 }}>
            <div className="label accent">Frontier density · parameters required to cross MMLU 0.70</div>
            <Seg value={which} onChange={setWhich} options={[{ value: "efficiency", label: "Params" }, { value: "raw", label: "Raw" }]} />
          </div>
          <Panel title="Parameter Efficiency" aux="LOG · 2022→2026">
            <ParamChart data={D.paramEfficiency} />
            <div className="footnote">
              <span className="src">Reading:</span> A single-GPU-inference, 1.3B-param Helix-nano equals PaLM-540B (2022) on MMLU. Algorithmic efficiency has outpaced hardware scaling by ~8×.
            </div>
          </Panel>
        </div>
        <div className="col-5 stack-md">
          <Panel title="Versus 2022">
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 84, lineHeight: 1, color: "var(--signal)" }}>412×</div>
              <div style={{ color: "var(--fg-2)", fontSize: 13 }}>smaller<br />for parity</div>
            </div>
            <div style={{ height: 1, background: "var(--rule-soft)", margin: "14px 0" }} />
            <table className="tbl" style={{ width: "100%" }}>
              <tbody>
                <tr><td>PaLM (Google, 2022)</td><td className="num">540B</td></tr>
                <tr><td>Llama-2 (Meta, 2023)</td><td className="num">70B</td></tr>
                <tr><td>Phi-3-mini (MSFT, 2024)</td><td className="num">3.8B</td></tr>
                <tr><td>Gemma-3 (Google, 2025)</td><td className="num">2.1B</td></tr>
                <tr><td style={{ color: "var(--signal)" }}>Helix-nano (Anthropic, &apos;26)</td><td className="num" style={{ color: "var(--signal)" }}>1.3B</td></tr>
              </tbody>
            </table>
          </Panel>
          <Panel title="Why it compounds">
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--fg-2)", fontSize: 13.5, lineHeight: 1.65 }}>
              <li><b style={{ color: "var(--fg)" }}>Distillation + RLAIF</b> now routine at &lt;10% of teacher compute</li>
              <li><b style={{ color: "var(--fg)" }}>Sparse MoE</b> active-param ratios down to 6%</li>
              <li><b style={{ color: "var(--fg)" }}>Test-time compute</b> replaces train-time capability</li>
              <li><b style={{ color: "var(--fg)" }}>Edge deploys</b> — 68% of new inference on-device by EoY &apos;25</li>
            </ul>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section07_CostPerf() {
  const [range, setRange] = useState<"full" | "24-26">("full")
  const data = range === "full" ? D.costCurve : D.costCurve.slice(3)
  return (
    <section className="section" id="s-07">
      <Plate num="03" sup="§ 03 · Cost & Performance" page="007" title="Inference costs collapse by <em>three orders of magnitude</em>" />
      <p className="dek">For GPT-3.5-class capability on MMLU, $/M tokens has fallen from <em>$20.00</em> in Nov 2022 to <em>$0.011</em> in Mar 2026. Nothing in the history of computing compares — not Dennard scaling, not photovoltaics, not bandwidth.</p>
      <div className="grid g-12">
        <div className="col-8">
          <Panel title="Cost per million tokens · log scale" aux="NOV 2022 → APR 2026">
            <div className="spread" style={{ marginBottom: 6 }}>
              <Seg value={range} onChange={setRange} options={[{ value: "full", label: "Full" }, { value: "24-26", label: "'24→'26" }]} />
              <div className="label">Hover points for values</div>
            </div>
            <CostCurveChart data={data} />
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Metric signal big label="REDUCTION" value="1,818" unit="×" sub="41 months · $20.00 → $0.011" />
          <Panel title="Half-life of cost" aux="rolling">
            <div style={{ fontFamily: "var(--serif)", fontSize: 38, lineHeight: 1, color: "var(--fg)" }}>≈ 4.8 <span style={{ color: "var(--signal)", fontStyle: "italic" }}>months</span></div>
            <div className="body small" style={{ marginTop: 10 }}>Inference cost for frontier capability is halving faster than Moore&apos;s law doubled transistor count at its peak (18mo).</div>
          </Panel>
          <Panel title="Who benefits most" aux="Q1 '26 mix">
            <div className="stack-sm">
              {([["Consumer chat", 38], ["Coding agents", 26], ["Business ops", 18], ["Scientific", 12], ["Other", 6]] as [string, number][]).map(([k, v]) => (
                <div key={k} className="spread" style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
                  <span style={{ color: "var(--fg-2)" }}>{k}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Bar v={v} w={80} />
                    <span style={{ color: "var(--signal)" }}>{v}%</span>
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section08_Users() {
  return (
    <section className="section" id="s-08">
      <Plate num="04" sup="§ 04 · Global Adoption" page="008" title="The fastest adoption curve <em>ever recorded</em>" />
      <div className="grid g-12">
        <div className="col-7">
          <Panel title="Global AI users · monthly actives" aux="2019 → Q1 2026">
            <UserGrowthChart data={D.userGrowth} />
          </Panel>
        </div>
        <div className="col-5 stack-md">
          <div className="grid g-2">
            <Metric signal label="TOTAL · APR 2026" value="612" unit="M+" sub="Monthly active AI users, global" />
            <Metric label="2025 NET ADDS" value="+234" unit="M" sub="Single-year record · 74% YoY growth" />
          </div>
          <Panel title="Compared to priors (years to 100M users)" aux="benchmark">
            <div className="stack-sm" style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
              {([["Phone", 75], ["Mobile", 16], ["Internet", 7], ["Facebook", 4.5], ["TikTok", 0.75], ["ChatGPT", 0.17]] as [string, number][]).map(([k, v]) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "100px 1fr 50px", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "var(--fg-2)" }}>{k}</span>
                  <div style={{ position: "relative", height: 4, background: "var(--ink-3)" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min(100, (v / 75) * 100)}%`, background: k === "ChatGPT" ? "var(--signal)" : "var(--rule-strong)" }} />
                  </div>
                  <span style={{ color: k === "ChatGPT" ? "var(--signal)" : "var(--fg-3)", textAlign: "right" }}>
                    {v < 1 ? `${(v * 12).toFixed(1)}mo` : `${v}y`}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
      <div className="footnote"><span className="src">Source:</span> AltIndex · Statista · Our World in Data · Artificial Analysis user-panel 2026.</div>
    </section>
  )
}

export function Section09_CorpAdoption() {
  const a = D.adoptionMatrix
  return (
    <section className="section" id="s-09">
      <Plate num="04" sup="§ 04 · Corporate Adoption" page="009" title="AI in <em>every function, every industry</em>" />
      <p className="dek">Two years ago this heatmap had deep cold spots. Today every cell is in use. The question has moved from <em>where</em> to <em>how well</em>.</p>
      <div className="grid g-12">
        <div className="col-8">
          <Panel title="GenAI deployment penetration · function × industry" aux="% of orgs · hover cells">
            <Heatmap rows={a.funcs} cols={a.inds} data={a.data} />
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Metric signal big label="ORGS USING AI" value="91" unit="%" sub="Up from 78% Q2 '25 · 55% 2023" />
          <Metric label="GENAI SPECIFICALLY" value="84" unit="%" sub="Up from 71% Q2 '25 · 33% 2023" />
          <Panel title="Maturity reality check">
            <div style={{ fontFamily: "var(--serif)", fontSize: 26, color: "var(--fg)", lineHeight: 1.15 }}>Only <em style={{ color: "var(--signal)" }}>8%</em> of orgs reach embedded-intelligence maturity.</div>
            <div className="body small" style={{ marginTop: 10 }}>The other 92% are still somewhere between pilots and operational integration. See <b style={{ color: "var(--signal)" }}>§ 11</b>.</div>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section10_Benchmarks() {
  const [year, setYear] = useState<"y24" | "y25" | "y26">("y26")
  return (
    <section className="section" id="s-10">
      <Plate num="05" sup="§ 05 · Benchmarks" page="010" title="Benchmarks are <em>saturating, fast</em>" />
      <p className="dek">On six of the most-watched capability tests, frontier AI has gone from student to examiner in under two years. The vertical line below is expert human performance. Most benchmarks now retire a year after introduction.</p>
      <div className="grid g-12">
        <div className="col-8">
          <Panel title="Capability benchmarks · % solved" aux="Stacked '24/'25/APR '26">
            <div className="spread" style={{ marginBottom: 16 }}>
              <Seg
                value={year}
                onChange={setYear}
                options={[{ value: "y24", label: "2024" }, { value: "y25", label: "2025" }, { value: "y26", label: "APR 2026" }]}
              />
              <div className="label">Highlighted year overlays earlier</div>
            </div>
            <BenchmarkRace data={D.benchmarks} year={year} />
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Metric signal label="AT/ABOVE HUMAN" value="11" unit="/14" sub="Benchmarks crossed in Apr '26, vs 4/14 in Apr '25" />
          <Panel title="Benchmarks retired since Q3 '25" aux="saturated">
            <ol style={{ margin: 0, paddingLeft: 18, fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.85 }}>
              <li>MMLU (frontier hit ceiling)</li>
              <li>HumanEval</li>
              <li>BIG-Bench Hard</li>
              <li>HELM 1.x</li>
              <li>MATH (AIME supersedes)</li>
            </ol>
            <div className="footnote"><span className="src">Successor tests:</span> ARC-AGI-2, RE-Bench, FrontierMath, HLE.</div>
          </Panel>
        </div>
      </div>
    </section>
  )
}

