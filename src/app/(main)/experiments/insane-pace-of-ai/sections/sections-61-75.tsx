"use client"

import { useState } from "react"
import { DATA2 as D2 } from "../data"
import { Plate, Metric, Panel, Seg, Tag } from "../primitives"

export function Section61_ChapterStrategy() {
  return (
    <section className="section chapter" id="s-61">
      <div className="chapter-num">§ 28 · Chapter opens</div>
      <h1>Strategic <em>implications</em> & the path forward.</h1>
      <div className="chapter-dek">The pace is the product. What you do in the next four quarters decides whether your organization rides the wave or is ground under it. This section is the playbook.</div>
      <div className="chapter-meta">
        <div><span className="label">Enterprise winners</span><span className="v">8% at 4×+ ROI</span></div>
        <div><span className="label">Board focus</span><span className="v">Top-3 priority</span></div>
        <div><span className="label">Talent</span><span className="v">AI-literate ≥ 80%</span></div>
        <div><span className="label">Horizon</span><span className="v">4-quarter sprint</span></div>
      </div>
    </section>
  )
}

export function Section62_Principles() {
  return (
    <section className="section" id="s-62">
      <Plate num="28" sup="§ 28 · Responsible Deployment" page="062" title="Five principles, <em>non-negotiable</em>" />
      <p className="dek">The gap between 8% (high maturity) and the rest is not a tooling gap, it is a discipline gap. Every high-ROI deployment we studied hews to these five principles.</p>
      <div className="grid g-5">
        {D2.principles.map((p, i) => (
          <div
            key={i}
            style={{
              padding: "24px 20px",
              background: "var(--ink-2)",
              border: "1px solid var(--rule)",
              borderTop: "2px solid var(--signal)",
            }}
          >
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.18em", color: "var(--fg-3)" }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--fg)", margin: "10px 0 8px", lineHeight: 1.1 }}>{p.p}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 38, color: "var(--signal)", letterSpacing: "-0.03em", lineHeight: 1 }}>{p.stat}</div>
            <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 10, lineHeight: 1.45 }}>{p.d}</div>
          </div>
        ))}
      </div>
      <div className="footnote">
        <span className="src">Synthesis:</span> McKinsey, BCG, Stanford HAI, RAI internal meta-study · N=2,840 deployments (2025).
      </div>
    </section>
  )
}

export function Section63_CXOPlaybook() {
  return (
    <section className="section" id="s-63">
      <Plate num="29" sup="§ 29 · CXO Playbook" page="063" title="Ten moves for the <em>next four quarters</em>" />
      <div className="grid g-12">
        <div className="col-8">
          <Panel title="The playbook" aux="FY2026 · ordered by urgency">
            <div className="stack-sm">
              {D2.cxoActions.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr 100px",
                    gap: 16,
                    padding: "14px 4px",
                    borderBottom: "1px solid var(--rule-soft)",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontFamily: "var(--serif)", fontSize: 32, color: "var(--signal)", fontStyle: "italic", lineHeight: 1 }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--fg)" }}>{a}</div>
                  <Tag tone={i < 3 ? "signal" : i < 7 ? "amber" : "slate"}>{i < 3 ? "Q2 '26" : i < 7 ? "Q3 '26" : "Q4 '26"}</Tag>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Panel title="If you do nothing" aux="modeled" className="paper">
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--paper-ink)", lineHeight: 1.25 }}>
              Competitive loss of <em style={{ color: "var(--signal-dim)" }}>18–34%</em> of addressable margin within 24 months, scaling from table-stakes automation to structural disadvantage.
            </div>
          </Panel>
          <Metric signal big label="TIME TO EMBED" value="9" unit="mo" sub="Median for high-maturity orgs to reach production-scale AI across 3+ functions" />
        </div>
      </div>
    </section>
  )
}

export function Section64_PolicyPlaybook() {
  return (
    <section className="section" id="s-64">
      <Plate num="30" sup="§ 30 · Policy Playbook" page="064" title="For governments · <em>ten priorities</em>" />
      <div className="grid g-2">
        {D2.policyActions.map((a, i) => (
          <div key={i} className="panel" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--signal)", letterSpacing: "0.14em" }}>
                P{String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--fg)", lineHeight: 1.5 }}>{a}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="footnote">
        <span className="src">Basis:</span> OECD AI Principles (2024 update), G7 Hiroshima Process, UN AI Advisory Body interim recommendations (Feb 2026).
      </div>
    </section>
  )
}

export function Section65_SocietalGood() {
  return (
    <section className="section" id="s-65">
      <Plate num="31" sup="§ 31 · AI for Good" page="065" title="The <em>dividend</em>" />
      <p className="dek">For all the disruption, 2025–26 produced the largest annual leap in AI-for-good deployment ever measured. The dividend, if captured, could compound faster than the risk.</p>
      <div className="grid g-4">
        {D2.societalGood.map((g, i) => (
          <Panel key={i} title={g.d} aux="Q1 '26">
            <div style={{ fontFamily: "var(--serif)", fontSize: 56, color: "var(--signal)", letterSpacing: "-0.035em", lineHeight: 1 }}>{g.stat}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--fg)", marginTop: 12, lineHeight: 1.3 }}>{g.t}</div>
            <div className="body small" style={{ marginTop: 8 }}>{g.imp}</div>
          </Panel>
        ))}
      </div>
    </section>
  )
}

export function Section66_Workforce() {
  const roles = [
    { r: "Augmented", share: 68, d: "Tools amplify existing job, 10–40% productivity gain" },
    { r: "Transformed", share: 22, d: "Core tasks change, new skills required (6–18mo reskill)" },
    { r: "Displaced", share: 7, d: "Task bundle automated; transition required" },
    { r: "New-created", share: 3, d: "AI-specific: prompt engineering, alignment, MLOps, agent ops" },
  ]
  const colors = ["var(--signal)", "var(--amber)", "var(--rose)", "var(--jade)"]
  return (
    <section className="section" id="s-66">
      <Plate num="32" sup="§ 32 · Workforce" page="066" title="Jobs are <em>reshaping</em>, not vanishing" />
      <div className="grid g-12">
        <div className="col-7">
          <Panel title="The 2028 labor split · modeled" aux="Goldman Sachs · OECD · RAI">
            <div style={{ position: "relative", height: 48, display: "flex", marginBottom: 20 }}>
              {roles.map((r, i) => (
                <div
                  key={i}
                  style={{
                    width: `${r.share}%`,
                    background: colors[i],
                    position: "relative",
                    borderRight: i < roles.length - 1 ? "1px solid var(--ink)" : "none",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 10,
                      top: 8,
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      color: "#0B0D10",
                      fontWeight: 600,
                    }}
                  >
                    {r.share}%
                  </div>
                </div>
              ))}
            </div>
            <div className="stack-sm">
              {roles.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "14px 140px 1fr",
                    gap: 12,
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--rule-soft)",
                  }}
                >
                  <span style={{ width: 12, height: 12, background: colors[i] }} />
                  <span style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--fg)" }}>{r.r}</span>
                  <span className="body small">{r.d}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="col-5 stack-md">
          <Metric signal big label="NEW-ROLE VELOCITY" value="34" unit="mo" sub="Median time for a new AI-specific role to reach >50K postings globally" />
          <Metric label="AI-LITERACY GAP" value="61" unit="%" sub="Knowledge workers who report they lack basic AI fluency (Q1 '26)" />
          <Panel title="Highest-growth AI roles · 2026">
            <ol style={{ margin: 0, paddingLeft: 18, color: "var(--fg-2)", fontSize: 13, lineHeight: 1.75 }}>
              <li>Agent Ops engineer</li>
              <li>AI risk & assurance lead</li>
              <li>Applied ML scientist</li>
              <li>AI product manager</li>
              <li>Data curation / annotation lead</li>
              <li>Human-AI interaction designer</li>
            </ol>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section67_Scenarios() {
  const [pick, setPick] = useState<number>(1)
  const scenarios = [
    {
      t: "Continuation", pct: "52%", c: "slate",
      h: "Pace holds, enterprise wins compound, regulation partial.",
      b: ["612M → 1.8B users", "$2T AI economy", "EU AI Act global template", "Plateau on frontier @ GPT-7/Claude-6"],
    },
    {
      t: "Acceleration", pct: "31%", c: "signal",
      h: "Recursive self-improvement kicks in; agentic economy explodes.",
      b: ["Automated R&D ↓ 72%", "Agentic GDP share 14%", "Compute squeeze triggers grid emergencies", "Frontier re-centralizes to 3 players"],
    },
    {
      t: "Fragmentation", pct: "12%", c: "amber",
      h: "Blocs harden; interoperability collapses along US/CN/EU lines.",
      b: ["Parallel internets", "Talent / data visa wars", "Cost of globalization spikes", "Sovereign LLMs mandatory"],
    },
    {
      t: "Disruption", pct: "5%", c: "rose",
      h: "Major incident (safety, grid, geopolitical) forces pause.",
      b: ["Global 12-month moratorium", "National compute audits", "Insurance mandates", "Reset on open-weight policy"],
    },
  ]
  const s = scenarios[pick]
  return (
    <section className="section" id="s-67">
      <Plate num="33" sup="§ 33 · 2028 Scenarios" page="067" title="Four futures · <em>weighted</em>" />
      <div className="spread" style={{ marginBottom: 18 }}>
        <div className="label">Select scenario</div>
        <Seg
          value={pick}
          onChange={setPick}
          options={scenarios.map((x, i) => ({ value: i, label: x.t }))}
        />
      </div>
      <div className="grid g-12">
        <div className="col-4">
          <div className="stack-sm">
            {scenarios.map((sc, i) => (
              <button
                key={i}
                onClick={() => setPick(i)}
                style={{
                  textAlign: "left",
                  padding: "16px 18px",
                  background: pick === i ? "var(--ink-3)" : "var(--ink-2)",
                  border: `1px solid ${pick === i ? "var(--signal)" : "var(--rule)"}`,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "inherit",
                }}
              >
                <div className="spread" style={{ alignItems: "baseline", marginBottom: 4 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--fg)" }}>{sc.t}</div>
                  <Tag tone={sc.c}>{sc.pct} prob</Tag>
                </div>
                <div className="body small" style={{ color: pick === i ? "var(--fg-2)" : "var(--fg-3)" }}>{sc.h}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="col-8">
          <Panel title={`Scenario: ${s.t}`} aux={`${s.pct} probability · by YE 2028`}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 32, color: "var(--fg)", lineHeight: 1.15, marginBottom: 20 }}>{s.h}</div>
            <div className="grid g-2">
              {s.b.map((p, i) => (
                <div key={i} style={{ padding: "14px 16px", background: "var(--ink-3)", borderLeft: `2px solid var(--${s.c})` }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.14em", marginBottom: 4 }}>
                    SIGNAL {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--fg)" }}>{p}</div>
                </div>
              ))}
            </div>
          </Panel>
          <div className="footnote">
            <span className="src">Method:</span> Delphi elicitation, N=48 experts, Monte-Carlo on 23 weighted indicators · RAI Scenarios 2026 Q1.
          </div>
        </div>
      </div>
    </section>
  )
}

export function Section68_Conclusion() {
  return (
    <section className="section" id="s-68">
      <div style={{ padding: "60px 0" }}>
        <div className="label accent" style={{ marginBottom: 20 }}>§ 34 · Conclusion</div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(48px, 6vw, 92px)",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            margin: "0 0 40px",
            maxWidth: "22ch",
            color: "var(--fg)",
          }}
        >
          The pace is <em style={{ color: "var(--signal)", fontStyle: "italic" }}>the product</em>.
        </h2>
        <p className="dek" style={{ fontSize: "clamp(20px, 1.8vw, 28px)", maxWidth: "48ch" }}>
          For nine consecutive quarters the curves have bent one way: cheaper, smaller, faster, more capable, more present. Capability compounded <em>4.3×</em> in the last twelve months. Capital compounded <em>1.7×</em>. Users compounded <em>1.9×</em>. None of the three shows exhaustion.
        </p>
        <div className="grid g-3" style={{ marginTop: 40 }}>
          <div className="panel inset">
            <div className="label accent">FOR THE ENTERPRISE</div>
            <p className="body" style={{ marginTop: 10, fontSize: 14.5 }}>
              The winning playbook is no longer about adopting AI, it is about <b style={{ color: "var(--fg)" }}>rebuilding the business around it</b>. Small data, proprietary workflows, compounding feedback loops.
            </p>
          </div>
          <div className="panel inset">
            <div className="label accent">FOR THE POLICY-MAKER</div>
            <p className="body" style={{ marginTop: 10, fontSize: 14.5 }}>
              Sovereignty is not firewalls, it is capability. <b style={{ color: "var(--fg)" }}>Compute, talent, data, governance</b>. The four legs of the stool. None is optional.
            </p>
          </div>
          <div className="panel inset">
            <div className="label accent">FOR EVERY HUMAN</div>
            <p className="body" style={{ marginTop: 10, fontSize: 14.5 }}>
              The dividend is not automatic. The <b style={{ color: "var(--fg)" }}>next four quarters</b> decide whether AI&apos;s gains are broad or narrow, durable or extractive, aligned or misaligned.
            </p>
          </div>
        </div>
        <div style={{ marginTop: 60, padding: "36px 0", borderTop: "1px solid var(--rule-strong)", borderBottom: "1px solid var(--rule-strong)" }}>
          <div className="spread" style={{ alignItems: "baseline" }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 38, color: "var(--fg)", fontStyle: "italic", lineHeight: 1 }}>
              Continue reading.
            </div>
            <div className="row" style={{ gap: 20 }}>
              <Tag tone="signal">Appendix →</Tag>
              <div className="label">§ 35–40 · data · methodology · glossary</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Section69_ChapterAppendix() {
  return (
    <section className="section chapter" id="s-69">
      <div className="chapter-num">§ 35 · Appendix</div>
      <h1><em>Data</em>, method, sources.</h1>
      <div className="chapter-dek">Every number in this report is footnoted and dated. Below: the acceleration table, the milestone timeline, the glossary, and an index of external sources refreshed through April 14, 2026.</div>
    </section>
  )
}

export function Section70_AccelTable() {
  return (
    <section className="section" id="s-70">
      <Plate num="35" sup="§ 35 · The Acceleration Table" page="070" title="Everything, <em>in one table</em>" />
      <Panel title="Q4 '22 → Q1 '26 · 41 months of compounding" aux="9 dimensions">
        <table className="tbl">
          <thead>
            <tr><th>Dimension</th><th>Measure</th><th className="num">Q4 2022</th><th className="num">Q1 2026</th><th className="num">Delta</th></tr>
          </thead>
          <tbody>
            {D2.accelTable.map((r, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--fg)" }}>{r.cat}</td>
                <td style={{ color: "var(--fg-2)" }}>{r.m}</td>
                <td className="num" style={{ color: "var(--fg-3)" }}>{r.v22}</td>
                <td className="num" style={{ color: "var(--fg)" }}>{r.v26}</td>
                <td className="num" style={{ color: "var(--signal)" }}>{r.delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </section>
  )
}

export function Section71_Milestones() {
  const catColor: Record<string, string> = {
    LLM: "signal", Open: "jade", Video: "amber", Multi: "slate",
    Agent: "signal", Science: "rose", Efficient: "jade",
  }
  return (
    <section className="section" id="s-71">
      <Plate num="36" sup="§ 36 · Milestones" page="071" title="41 months of <em>firsts</em>" />
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 110, top: 0, bottom: 0, borderLeft: "1px solid var(--rule-strong)" }} />
        <div className="stack-sm">
          {D2.milestones.map((m, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr auto",
                gap: 20,
                alignItems: "center",
                padding: "14px 0",
                borderBottom: "1px solid var(--rule-soft)",
                position: "relative",
              }}
            >
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--fg)", letterSpacing: "0.06em" }}>{m.d}</div>
              <div style={{ paddingLeft: 28, position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: -6,
                    top: 4,
                    width: 10,
                    height: 10,
                    background: "var(--signal)",
                    borderRadius: "50%",
                    boxShadow: "0 0 0 4px var(--ink)",
                  }}
                />
                <div style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--fg)", lineHeight: 1.2 }}>{m.t}</div>
              </div>
              <Tag tone={catColor[m.c]}>{m.c}</Tag>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Section72_Methodology() {
  return (
    <section className="section" id="s-72">
      <Plate num="37" sup="§ 37 · Methodology" page="072" title="How we <em>built</em> this" />
      <div className="grid g-12">
        <div className="col-7">
          <Panel title="Data sources · refreshed through April 14, 2026">
            <div className="stack-sm">
              {[
                { t: "Benchmark data", s: "Epoch AI, LMSYS, AISI public evals, Artificial Analysis, Papers With Code" },
                { t: "Model & compute", s: "Epoch AI Compute Index, SemiAnalysis, Hardware vendor disclosures" },
                { t: "Investment data", s: "PitchBook, Crunchbase, Dealroom, Stanford HAI AI Index 2026" },
                { t: "Corporate adoption", s: "McKinsey Global Survey, BCG AI 2026, Census AI-use microdata" },
                { t: "Energy & infra", s: "IEA Electricity 2026, Uptime Institute, corporate ESG disclosures" },
                { t: "Regulatory", s: "EU AI Office, UK AISI, US NIST, OECD AI Observatory, national gazettes" },
                { t: "Patents & papers", s: "WIPO, USPTO, EPO, OpenAlex, Semantic Scholar" },
                { t: "Internal", s: "RAI real-time telemetry · 312 enterprise deployments, 2.1M agent runs" },
              ].map((x, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14, padding: "10px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--fg)" }}>{x.t}</div>
                  <div className="body small">{x.s}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="col-5 stack-md">
          <Panel title="Refresh cadence" aux="live">
            <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--fg)", lineHeight: 1.3 }}>
              All datasets are versioned and <em style={{ color: "var(--signal)" }}>auto-checked monthly</em> against primary sources.
            </div>
            <table className="tbl" style={{ marginTop: 16 }}>
              <tbody>
                <tr><td>Report cutoff</td><td className="num">APR 14, 2026</td></tr>
                <tr><td>Next scheduled refresh</td><td className="num">MAY 12, 2026</td></tr>
                <tr><td>Drift tolerance</td><td className="num">±3% on leading metrics</td></tr>
                <tr><td>Indicators tracked</td><td className="num">184</td></tr>
                <tr><td>Confidence intervals</td><td className="num">95% CI shown where est.</td></tr>
              </tbody>
            </table>
          </Panel>
          <Panel title="Limitations · stated plainly">
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--fg-2)", fontSize: 13, lineHeight: 1.7 }}>
              <li>Frontier models&apos; exact training compute is self-reported</li>
              <li>China revenue figures are estimates (no equivalent to FY filings)</li>
              <li>Patent share lags filings by 18–24 months</li>
              <li>Agent &ldquo;task success&rdquo; is domain- and benchmark-sensitive</li>
              <li>Projections to 2028 are scenario-weighted, not point forecasts</li>
            </ul>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section73_Glossary() {
  const terms = [
    { t: "Agentic AI", d: "AI systems that perceive, plan, and execute multi-step workflows with limited human oversight." },
    { t: "Compute", d: "Training + inference hardware capacity, measured in GPU-years or FLOPs." },
    { t: "Constitutional AI", d: "Alignment technique using a written set of principles to train model behavior." },
    { t: "DPO", d: "Direct Preference Optimization, efficient alternative to PPO-based RLHF." },
    { t: "GPAI", d: "General-Purpose AI, EU AI Act designation for models above a FLOP threshold." },
    { t: "HBM", d: "High-Bandwidth Memory, critical bottleneck for frontier training." },
    { t: "MoE", d: "Mixture-of-Experts, sparse activation yielding large parameter / small compute ratios." },
    { t: "MCP", d: "Model Context Protocol, open standard for LLM ↔ tool/data connections (Anthropic, 2024)." },
    { t: "RAG", d: "Retrieval-Augmented Generation, grounding outputs in external knowledge." },
    { t: "RE-Bench", d: "Autonomous research evaluation, 7-day expert-bench for agents." },
    { t: "RLHF / RLAIF", d: "Reinforcement Learning from Human / AI Feedback, alignment stage." },
    { t: "Red-teaming", d: "Adversarial probing for safety / security failures, pre-deployment." },
    { t: "SLM", d: "Small Language Model, typically <10B params, on-device capable." },
    { t: "Sovereign AI", d: "National capability stack, compute, data, models, governance." },
    { t: "SWE-Bench", d: "Software engineering benchmark using real GitHub issues." },
    { t: "Watermarking", d: "Embedding statistical signatures in AI outputs (e.g. SynthID, C2PA)." },
  ]
  return (
    <section className="section" id="s-73">
      <Plate num="38" sup="§ 38 · Glossary" page="073" title="Terms, <em>defined</em>" />
      <div className="grid g-2">
        {terms.map((x, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr",
              gap: 16,
              padding: "12px 16px",
              borderBottom: "1px solid var(--rule-soft)",
              background: i % 2 ? "var(--ink-2)" : "transparent",
            }}
          >
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--signal)", letterSpacing: "0.04em" }}>{x.t}</div>
            <div className="body small">{x.d}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Section74_References() {
  const refs: [string, string][] = [
    ["Stanford HAI", "AI Index Report 2026 (full release: Mar 2026)"],
    ["Epoch AI", "Compute Trends Database · monthly update"],
    ["McKinsey", "The State of AI 2026 (Feb '26)"],
    ["BCG", "AI in Enterprise 2026 (Mar '26)"],
    ["Goldman Sachs Research", "Generative AI Productivity Impact · FY2026"],
    ["IEA", "Electricity 2026 · AI data-center chapter"],
    ["EU AI Office", "GPAI Code of Practice, Annexes I–IV (Aug 2025)"],
    ["UK AISI", "Frontier Model Evaluations · public summaries 2025–26"],
    ["US NIST", "AI Risk Management Framework 2.0 (Feb 2026)"],
    ["WIPO", "Global AI Patent Landscape 2026"],
    ["OECD", "AI Principles · 2024 update; AI Observatory live metrics"],
    ["Anthropic", "Responsible Scaling Policy · v4 (Jan 2026)"],
    ["OpenAI", "Preparedness Framework · v3 (Mar 2026)"],
    ["Google DeepMind", "Frontier Safety Framework · 2026 update"],
    ["Artificial Analysis", "Live model benchmark comparisons (April '26 data)"],
    ["LMSYS", "Chatbot Arena leaderboard (April '26)"],
  ]
  return (
    <section className="section" id="s-74">
      <Plate num="39" sup="§ 39 · References & sources" page="074" title="Read <em>the primaries</em>" />
      <div className="grid g-2">
        {refs.map(([o, t], i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "40px 180px 1fr",
              gap: 12,
              padding: "12px 4px",
              borderBottom: "1px solid var(--rule-soft)",
              alignItems: "baseline",
            }}
          >
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-4)" }}>[{String(i + 1).padStart(2, "0")}]</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--fg)" }}>{o}</div>
            <div className="body small">{t}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Section75_Colophon() {
  return (
    <section className="section" id="s-75" style={{ borderBottom: "none" }}>
      <div style={{ padding: "40px 0 80px" }}>
        <div className="label accent" style={{ marginBottom: 14 }}>§ 40 · Colophon</div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 64, lineHeight: 0.95, letterSpacing: "-0.03em", margin: "0 0 36px", color: "var(--fg)" }}>
          <em style={{ color: "var(--signal)", fontStyle: "italic" }}>— end of report —</em>
        </h2>
        <div className="grid g-12">
          <div className="col-6">
            <div className="label">Report ID</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--fg)", marginTop: 6 }}>RAI-Q1-2026-IPOAI · v26.04.14</div>
            <div className="label" style={{ marginTop: 24 }}>Published</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--fg)", marginTop: 6 }}>April 14, 2026 · 09:30 UTC</div>
            <div className="label" style={{ marginTop: 24 }}>Classification</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--signal)", marginTop: 6 }}>CONFIDENTIAL · EXEC DISTRIBUTION</div>
          </div>
          <div className="col-6">
            <div className="label">Typography</div>
            <div className="body small" style={{ marginTop: 6 }}>
              Instrument Serif · Geist · Geist Mono. Set on a 14px grid with an 8px baseline. Tabular numerals throughout.
            </div>
            <div className="label" style={{ marginTop: 24 }}>Color</div>
            <div className="row" style={{ gap: 6, marginTop: 8 }}>
              {["#E8542B", "#E8B84A", "#7BAA7E", "#6F89A6", "#C77069", "#0B0D10", "#EDE7DB"].map((c) => (
                <div key={c} style={{ width: 32, height: 32, background: c, border: "1px solid var(--rule)" }} title={c} />
              ))}
            </div>
            <div className="label" style={{ marginTop: 24 }}>Credit</div>
            <div className="body small" style={{ marginTop: 6 }}>
              Produced by Tarry Singh. All charts rendered in SVG. No AI-generated imagery; all visualizations are data-driven.
            </div>
          </div>
        </div>
        <div style={{ marginTop: 60, padding: "28px 0 0", borderTop: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-4)", letterSpacing: "0.16em" }}>© 2026 TARRY SINGH · ALL RIGHTS RESERVED</div>
          <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 20, color: "var(--signal)" }}>Until next quarter.</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-4)", letterSpacing: "0.16em" }}>075 / 075</div>
        </div>
      </div>
    </section>
  )
}
