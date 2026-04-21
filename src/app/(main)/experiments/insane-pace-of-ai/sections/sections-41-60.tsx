"use client"

import { DATA2 as DD2 } from "../data"
import { Plate, Metric, Panel, Tag } from "../primitives"
import { AreaChart, HBars, Timeline, RiskMatrix, RegulatoryQuad } from "../charts"

export function Section41_Energy() {
  const e = DD2.energy
  return (
    <section className="section" id="s-41">
      <Plate num="38" sup="§ 38 · Energy · Sustainability" page="041" title="AI's <em>electricity appetite</em>, unmodeled" />
      <p className="dek">AI data centers will consume <em>940 TWh in 2026</em> — roughly the electricity use of Germany. By 2028, projections put the sector at <em>~2,000 TWh</em>, or the entire electricity consumption of India today. No credible decarbonization path has been published.</p>
      <div className="grid g-12">
        <div className="col-8">
          <Panel title="AI electricity demand path · TWh/yr" aux="IEA · Berkeley Lab · April 2026 update">
            <AreaChart data={e.twhPath} yMax={2100} unit="TWh" />
            <div className="footnote">Solid line = observed through 2025. Points from 2026e forward = IEA mid-case. Upper bound adds frontier-training overhead currently unmodeled by most energy agencies.</div>
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Metric signal big label="% OF GLOBAL ELECTRICITY" value="4.1" unit="%" sub="AI data centers · up from 1.4% in 2024" />
          <Metric label="WATER / MW / YR" value="4.8" unit="M gal" sub="Cooling + humidification. Inland sites higher." />
          <Metric label="HOUSEHOLDS / FRONTIER TRAIN" value="184" unit="HH-yr" sub="One training run ≈ 184 US households' annual electricity" />
        </div>
      </div>
    </section>
  )
}

export function Section42_Renewables() {
  const e = DD2.energy.renewShare
  const names: Record<string, string> = { na: "North America", cn: "China", eu: "European Union", me: "Middle East", india: "India", row: "Rest of World" }
  return (
    <section className="section" id="s-42">
      <Plate num="39" sup="§ 39 · Decarbonization Gap" page="042" title="The <em>decarbonization gap</em>" />
      <p className="dek">Renewable share varies wildly by region. The EU leads at <em>84%</em>. The Middle East, despite massive solar resource, remains at 62% because sovereign clusters are running 24/7 on natural gas for reliability. China lags at <em>42%</em>.</p>
      <div className="grid g-12">
        <div className="col-8">
          <Panel title="AI data-center renewable share · by region · Q1 2026">
            <div className="stack-sm">
              {Object.entries(e).map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr 60px",
                    gap: 14,
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--rule-soft)",
                  }}
                >
                  <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--fg)" }}>{names[k]}</div>
                  <div style={{ position: "relative", height: 16, background: "var(--ink-3)" }}>
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0, width: `${v}%`,
                      background: v >= 70 ? "var(--jade)" : v >= 50 ? "var(--amber)" : "var(--rose)",
                    }} />
                    <div style={{ position: "absolute", left: "50%", top: -3, bottom: -3, width: 1, background: "var(--fg-4)", opacity: 0.5 }} />
                  </div>
                  <div style={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    textAlign: "right",
                    color: v >= 70 ? "var(--jade)" : v >= 50 ? "var(--amber)" : "var(--rose)",
                  }}>{v}%</div>
                </div>
              ))}
            </div>
            <div className="footnote">
              Dashed line at 50% marks the parity threshold.{" "}
              <span style={{ color: "var(--jade)" }}>Jade</span> = above 70%,{" "}
              <span style={{ color: "var(--amber)" }}>amber</span> = 50–70%,{" "}
              <span style={{ color: "var(--rose)" }}>rose</span> = below 50%.
            </div>
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Panel title="Grid interconnect queue" aux="global AI-related">
            <div className="stack-sm">
              <div className="spread" style={{ padding: "10px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                <span>Queued capacity (GW)</span>
                <span style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--signal)" }}>2,140</span>
              </div>
              <div className="spread" style={{ padding: "10px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                <span>Avg wait time</span>
                <span style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--signal)" }}>4.2 yr</span>
              </div>
              <div className="spread" style={{ padding: "10px 0", borderBottom: "1px solid var(--rule-soft)" }}>
                <span>Nuclear PPAs signed</span>
                <span style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--signal)" }}>38</span>
              </div>
              <div className="spread" style={{ padding: "10px 0" }}>
                <span>SMR contracts</span>
                <span style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--signal)" }}>14</span>
              </div>
            </div>
          </Panel>
          <div className="footnote" style={{ marginTop: 0 }}>
            Most of 2026&apos;s capex is <em style={{ color: "var(--signal)", fontStyle: "italic" }}>shovel-ready</em> — but interconnect queues are the binding constraint, not capital.
          </div>
        </div>
      </div>
    </section>
  )
}

export function Section43_Efficiency() {
  const gains = [
    { n: "Model-level efficiency", v: "412×", d: "Param reduction for MMLU-equivalent, 2022→2026" },
    { n: "Algorithmic efficiency", v: "6.2×/yr", d: "Compute-to-capability, Epoch AI rolling measure" },
    { n: "Hardware efficiency (perf/W)", v: "2.8×", d: "H200 → GB300, FP8 peak" },
    { n: "Inference cost", v: "1,818×", d: "$/M tok for GPT-3.5 class, Nov '22 → Apr '26" },
    { n: "Cooling PUE (best-in-class)", v: "1.08", d: "Google iowa · Meta prometheus spec" },
    { n: "DC heat reuse", v: "14%", d: "Of EU AI DCs now feeding district heating" },
  ]
  return (
    <section className="section" id="s-43">
      <Plate num="40" sup="§ 40 · Efficiency Levers" page="043" title="Where the <em>savings</em> are compounding" />
      <div className="grid g-2">
        {gains.map((g, i) => (
          <Panel key={i} title={g.n} aux="Δ '22 → '26">
            <div style={{ fontFamily: "var(--serif)", fontSize: 52, color: "var(--signal)", lineHeight: 1 }}>{g.v}</div>
            <div style={{ color: "var(--fg-2)", fontSize: 13, marginTop: 8 }}>{g.d}</div>
          </Panel>
        ))}
      </div>
    </section>
  )
}

export function Section44_Edge() {
  const e = DD2.edge
  return (
    <section className="section" id="s-44">
      <Plate num="41" sup="§ 41 · Edge AI" page="044" title="<em>8.7B devices</em> running AI on-device" />
      <p className="dek">Edge inference has quietly become the dominant form of AI compute by query count. Every new iPhone, Pixel, Galaxy, and Quest ships with frontier-lite models running locally — private by default, latency-free, offline-capable.</p>
      <div className="grid g-12">
        <div className="col-8">
          <Panel title="Edge deployment penetration · Q1 2026">
            <HBars data={e.apps} valueKey="adopt" labelKey="a" tone="signal" />
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Metric signal big label="AI-CAPABLE DEVICES" value="8.7" unit="B" sub="Globally active · up from 3.1B in '24" />
          <Metric label="CENTRAL LOAD CUT" value="−42" unit="%" sub="Fraction of AI queries never leaving the device" />
          <Metric label="LATENCY COLLAPSE" value="−78" unit="%" sub="Avg user-perceived response time" />
        </div>
      </div>
    </section>
  )
}

export function Section45_ChapterIP() {
  return (
    <section className="section chapter" id="s-45">
      <div className="chapter-num">§ 42 · Chapter opens</div>
      <h1>The <em>IP reckoning</em>.</h1>
      <div className="chapter-dek">
        The courts, not the legislatures, are writing the rules for how AI training and AI output interact with copyright. By April 2026 we have actual precedent — NYT settled with OpenAI, Authors Guild reached a partial settlement with Anthropic and Meta, Getty&apos;s trial on Stability concluded. Here&apos;s what they tell us.
      </div>
      <div className="chapter-meta">
        <div><span className="label">Active Litigation</span><span className="v">38 cases</span></div>
        <div><span className="label">Settled &apos;25–&apos;26</span><span className="v">11</span></div>
        <div><span className="label">Licensing Deals</span><span className="v">$4.8B disclosed</span></div>
        <div><span className="label">Training-data Regs</span><span className="v">7 jurisdictions</span></div>
      </div>
    </section>
  )
}

export function Section46_IPCases() {
  const colors: Record<string, string> = { signal: "var(--signal)", amber: "var(--amber)", jade: "var(--jade)", slate: "var(--slate)" }
  return (
    <section className="section" id="s-46">
      <Plate num="43" sup="§ 43 · Landmark Cases" page="046" title="The <em>precedents</em> that stick" />
      <Panel title="Major AI-IP litigation · status · Q1 2026">
        <table className="tbl">
          <thead><tr><th>Case</th><th>Status</th><th>Outcome / ruling</th><th>Impact</th></tr></thead>
          <tbody>
            {DD2.ipCases.map((c, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{c.n}</td>
                <td style={{ color: "var(--fg-2)" }}>{c.status}</td>
                <td>{c.outcome}</td>
                <td>
                  <span style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    padding: "3px 8px",
                    background: colors[c.impact] + "22",
                    border: `1px solid ${colors[c.impact]}`,
                    color: colors[c.impact],
                    letterSpacing: "0.12em",
                  }}>
                    {c.impact.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="footnote">
          The NYT v. OpenAI/Microsoft settlement — <span style={{ color: "var(--signal)" }}>$480M plus a licensing framework</span> — is widely read as the template for the next decade of training-data economics.
        </div>
      </Panel>
    </section>
  )
}

export function Section47_IPRegional() {
  return (
    <section className="section" id="s-47">
      <Plate num="44" sup="§ 44 · Regional IP Landscape" page="047" title="Four regimes, <em>one shared fiction</em>" />
      <p className="dek">Every major IP regime has been forced to take a position on AI training data and AI authorship. The positions are now diverging enough that multinational enterprises need a regional IP playbook, not a single global policy.</p>
      <Panel title="Regional IP regimes · training + authorship + patents">
        <table className="tbl">
          <thead><tr><th>Region</th><th>Copyright</th><th>Patents</th><th>Trade Secrets</th><th>Best practice</th></tr></thead>
          <tbody>
            {DD2.ipRegional.map((r, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{r.r}</td>
                <td>{r.c}</td>
                <td>{r.p}</td>
                <td>{r.t}</td>
                <td style={{ color: "var(--signal)" }}>{r.best}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </section>
  )
}

export function Section48_IPStrategy() {
  const pillars = [
    { k: "Input control", d: "Curate and document training-data provenance. C2PA + SynthID on every derivative. Maintain opt-out registry intake.", metric: "87% of frontier labs now audited" },
    { k: "Output attribution", d: "Watermark generated media; publish model-card training sources; retain inference logs for defensive purposes.", metric: "64% of enterprise APIs watermark by default" },
    { k: "Licensing strategy", d: "Prefer compulsory licenses for large corpora; negotiate creator collective deals where possible; avoid fair-use gambles on copyrighted corpora.", metric: "$4.8B disclosed licensing deals in 2025" },
    { k: "Defensive IP", d: "File AI-process patents aggressively; protect training recipes as trade secrets; maintain chain-of-custody for all derivatives.", metric: "+41% YoY AI patent filings" },
  ]
  return (
    <section className="section" id="s-48">
      <Plate num="45" sup="§ 45 · IP Strategy Framework" page="048" title="How to <em>build defensibly</em>" />
      <div className="grid g-2">
        {pillars.map((p, i) => (
          <Panel key={i} title={`Pillar 0${i + 1} · ${p.k}`} aux="practice">
            <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.65 }}>{p.d}</div>
            <div style={{
              marginTop: 14,
              paddingTop: 10,
              borderTop: "1px dashed var(--rule-soft)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--signal)",
              letterSpacing: "0.08em",
            }}>
              ◉ {p.metric}
            </div>
          </Panel>
        ))}
      </div>
    </section>
  )
}

export function Section49_ChapterSafety() {
  return (
    <section className="section chapter" id="s-49">
      <div className="chapter-num">§ 46 · Chapter opens</div>
      <h1>Safety, ethics,<br />and the <em>alignment debt</em>.</h1>
      <div className="chapter-dek">
        2025 was the year AI incidents outpaced AI safety research. 48 frontier evaluations completed, seven high-severity agent failures disclosed, and the first deep-fake election interference conviction upheld in appeal. The guardrails have to ship faster than the capability.
      </div>
      <div className="chapter-meta">
        <div><span className="label">Incidents &apos;25</span><span className="v">+74% YoY</span></div>
        <div><span className="label">AISI Evaluations</span><span className="v">48 models</span></div>
        <div><span className="label">Frontier Labs w/ RSP</span><span className="v">7</span></div>
        <div><span className="label">Deepfake Fraud</span><span className="v">+318% &apos;24→&apos;25</span></div>
      </div>
    </section>
  )
}

export function Section50_Risks() {
  return (
    <section className="section" id="s-50">
      <Plate num="47" sup="§ 47 · Risk Landscape" page="050" title="What's actually <em>going wrong</em>" />
      <p className="dek">The dominant 2024 risks — hallucination, prompt injection — remain. But 2025 added agent autonomy misalignment and CBRN uplift as frontier-class concerns. Mitigation coverage varies wildly.</p>
      <Panel title="Safety risks · severity × mitigation coverage · Q1 2026" aux="Stanford HAI + MITRE ATLAS">
        <RiskMatrix risks={DD2.safetyRisks} />
      </Panel>
    </section>
  )
}

export function Section51_Mitigations() {
  return (
    <section className="section" id="s-51">
      <Plate num="48" sup="§ 48 · Mitigation Playbook" page="051" title="What <em>works</em>" />
      <div className="grid g-12">
        <div className="col-8">
          <Panel title="Mitigation effectiveness · frontier-lab self-reported">
            <div className="stack-sm">
              {DD2.safetyMitigations.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "220px 1fr 60px",
                    gap: 14,
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--rule-soft)",
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--fg)" }}>{m.s}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.06em" }}>{m.n}</div>
                  </div>
                  <div style={{ position: "relative", height: 14, background: "var(--ink-3)" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${m.eff}%`, background: "var(--signal)" }} />
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--signal)", textAlign: "right" }}>{m.eff}%</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="col-4 stack-md">
          <Panel title="The layered defense" aux="what the 7% do right">
            <div className="stack-sm" style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.7 }}>
              <div><span style={{ color: "var(--signal)" }}>01 ·</span> Input: filtering + policy guards</div>
              <div><span style={{ color: "var(--signal)" }}>02 ·</span> Model: fine-tuning + constitutional AI</div>
              <div><span style={{ color: "var(--signal)" }}>03 ·</span> Output: moderation + watermarking</div>
              <div><span style={{ color: "var(--signal)" }}>04 ·</span> System: HITL + incident response</div>
              <div><span style={{ color: "var(--signal)" }}>05 ·</span> Governance: audits + red-teams + RSPs</div>
            </div>
          </Panel>
          <Panel title="Honest gap">
            <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--fg)", lineHeight: 1.35 }}>
              No single mitigation is above <em style={{ color: "var(--signal)" }}>90% effective</em>. Defense-in-depth is not optional.
            </div>
          </Panel>
        </div>
      </div>
    </section>
  )
}

export function Section52_Principles() {
  return (
    <section className="section" id="s-52">
      <Plate num="49" sup="§ 49 · Ethical Principles" page="052" title="The <em>five pillars</em> that survived" />
      <p className="dek">Every AI ethics framework converges on roughly the same five principles. The test is whether they&apos;re operationalized — reported, audited, budgeted — or merely aspirational. Most orgs still fail this test.</p>
      <div className="grid g-12" style={{ gap: 12 }}>
        {DD2.principles.map((p, i) => (
          <div
            key={i}
            className="col-12"
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr 220px",
              gap: 18,
              padding: "20px 22px",
              background: "var(--ink-2)",
              border: "1px solid var(--rule)",
              alignItems: "center",
            }}
          >
            <div style={{ fontFamily: "var(--serif)", fontSize: 48, fontStyle: "italic", color: "var(--signal)", lineHeight: 0.9 }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div>
              <div className="label" style={{ color: "var(--signal)" }}>Pillar</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 26, color: "var(--fg)" }}>{p.p}</div>
              <div style={{ color: "var(--fg-2)", fontSize: 13, marginTop: 4 }}>{p.d}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 44, color: "var(--fg)" }}>{p.stat}</div>
              <div className="label">supporting data</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Section53_Responsible() {
  return (
    <section className="section" id="s-53">
      <Plate num="50" sup="§ 50 · Responsible AI Framework" page="053" title="From <em>principles</em> to operations" />
      <div className="grid g-4">
        {[
          { ph: "Governance", items: ["AI ethics committee w/ board charter", "Cross-functional steering", "Policy + procedure documented", "Quarterly risk review"] },
          { ph: "Process", items: ["Impact assessments pre-deploy", "Risk-tiered development gates", "Testing + validation sign-off", "Continuous monitoring telemetry"] },
          { ph: "Technical", items: ["Bias auditing pre + post deploy", "Explainability required for HRM", "Red-teaming on every major release", "Privacy-preserving training (DP)"] },
          { ph: "Culture", items: ["Role-based AI ethics training", "Clear escalation channels", "Customer disclosure defaults", "Incident-response playbook rehearsed"] },
        ].map((p, i) => (
          <Panel key={i} title={`Phase 0${i + 1} · ${p.ph}`}>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--fg-2)", fontSize: 12.5, lineHeight: 1.9 }}>
              {p.items.map((it, j) => <li key={j}>{it}</li>)}
            </ul>
          </Panel>
        ))}
      </div>
    </section>
  )
}

export function Section54_ChapterReg() {
  return (
    <section className="section chapter" id="s-54">
      <div className="chapter-num">§ 51 · Chapter opens</div>
      <h1>Regulation has <em>caught up</em>.<br />Enforcement is catching up next.</h1>
      <div className="chapter-dek">
        The EU AI Act is fully enforced. The US has no federal AI Act but 14 states are closing in. UK and China have distinct but increasingly assertive regimes. The patchwork is here to stay — which means regulatory strategy is now a competitive variable.
      </div>
      <div className="chapter-meta">
        <div><span className="label">AI Acts · binding</span><span className="v">14</span></div>
        <div><span className="label">GPAI Obligated</span><span className="v">238 models</span></div>
        <div><span className="label">EU Fines &apos;25</span><span className="v">€2.8B</span></div>
        <div><span className="label">US State Laws &apos;26</span><span className="v">14+ tracked</span></div>
      </div>
    </section>
  )
}

export function Section55_RegTimeline() {
  return (
    <section className="section" id="s-55">
      <Plate num="52" sup="§ 52 · Regulatory Timeline" page="055" title="18 months of <em>compliance debt</em>" />
      <Panel title="Key regulatory milestones · Q1 2025 → Q3 2026" aux="selected — binding events only">
        <Timeline data={DD2.regulatoryTL} />
      </Panel>
    </section>
  )
}

export function Section56_RegStance() {
  return (
    <section className="section" id="s-56">
      <Plate num="53" sup="§ 53 · Regulatory Postures" page="056" title="Four <em>dials</em>, seven regimes" />
      <p className="dek">Every AI regulator is tuning the same four dials — risk-aversion, innovation, sovereignty, and ethics. Where they land defines compliance, market access, and strategic freedom.</p>
      <Panel title="Regulatory posture matrix · Q1 2026">
        <RegulatoryQuad stances={DD2.regulatoryStance} />
      </Panel>
    </section>
  )
}

export function Section57_EUAct() {
  return (
    <section className="section" id="s-57">
      <Plate num="54" sup="§ 54 · EU AI Act · Deep Dive" page="057" title="The <em>world's first</em> binding AI law" />
      <div className="grid g-12">
        <div className="col-7">
          <Panel title="Risk tiers · Q1 2026 enforcement state">
            <div className="stack-sm">
              {[
                { t: "Unacceptable risk", pct: 100, d: "Prohibited: social scoring, manipulative AI, real-time biometric ID in public", f: "In force Feb '25" },
                { t: "High risk", pct: 82, d: "Strict obligations: risk mgmt, data quality, transparency, HITL, robustness", f: "Full enforcement Feb '26" },
                { t: "GPAI · systemic", pct: 100, d: "Frontier model obligations: code of practice, capability evals, serious-incident reporting", f: "238 models in scope" },
                { t: "Limited risk", pct: 64, d: "Transparency obligations: AI-generated media must be labeled", f: "Audits have begun" },
                { t: "Minimal risk", pct: 48, d: "Voluntary codes, industry self-assessment", f: "Guidance stage" },
              ].map((r, i) => (
                <div key={i} style={{ padding: "14px 16px", background: "var(--ink-3)", border: "1px solid var(--rule-soft)", position: "relative" }}>
                  <div className="spread" style={{ marginBottom: 6 }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--fg)" }}>{r.t}</div>
                    <Tag tone="signal">{r.f}</Tag>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fg-2)", marginBottom: 8 }}>{r.d}</div>
                  <div style={{ position: "relative", height: 4, background: "var(--ink)" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${r.pct}%`, background: "var(--signal)" }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="col-5 stack-md">
          <Metric signal big label="FINES ISSUED '25" value="€2.8" unit="B" sub="GPAI-disclosure failures · five lab investigations ongoing" />
          <Metric label="GPAI MODELS · LOGGED" value="238" unit="" sub="Binding obligations effective Feb 2026" />
          <Metric label="REGULATORY SANDBOXES" value="42" unit="" sub="Across 27 member states" />
        </div>
      </div>
    </section>
  )
}

export function Section58_GlobalPolicy() {
  return (
    <section className="section" id="s-58">
      <Plate num="55" sup="§ 55 · US · China · Global Policy" page="058" title="Three <em>other</em> regimes, compared" />
      <div className="grid g-3">
        <Panel title="United States · Innovation-led">
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--fg)", lineHeight: 1.2, marginBottom: 10 }}>
            No federal act. <em style={{ color: "var(--signal)" }}>EO 14179</em> + sector regulators. NIST AI RMF 2.0.
          </div>
          <table className="tbl">
            <tbody>
              <tr><td>State laws</td><td className="num">14 active</td></tr>
              <tr><td>Executive orders</td><td className="num">14110 · 14179</td></tr>
              <tr><td>Export rounds</td><td className="num">4</td></tr>
              <tr><td>Federal funding</td><td className="num">$5.8B/yr</td></tr>
            </tbody>
          </table>
          <div className="footnote">Pro-competition. Sector-specific. Increasingly leaning on procurement + export controls.</div>
        </Panel>
        <Panel title="China · State-directed">
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--fg)", lineHeight: 1.2, marginBottom: 10 }}>
            Comprehensive. Content-centric. <em style={{ color: "var(--signal)" }}>Security-first</em>.
          </div>
          <table className="tbl">
            <tbody>
              <tr><td>GenAI Measures</td><td className="num">Aug &apos;23 · updated</td></tr>
              <tr><td>Deep Synthesis v2</td><td className="num">Mar 2026</td></tr>
              <tr><td>Algorithm filings</td><td className="num">2,100+</td></tr>
              <tr><td>Big Fund III</td><td className="num">$162B</td></tr>
            </tbody>
          </table>
          <div className="footnote">State-approved training data, licensed providers, MSS-aligned oversight, aggressive export responses.</div>
        </Panel>
        <Panel title="Global · OECD · G7 · UN">
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--fg)", lineHeight: 1.2, marginBottom: 10 }}>
            Non-binding <em style={{ color: "var(--signal)" }}>harmonization</em> efforts.
          </div>
          <table className="tbl">
            <tbody>
              <tr><td>Bletchley / Seoul / Paris</td><td className="num">3 summits</td></tr>
              <tr><td>G7 Hiroshima Code</td><td className="num">15 signatories</td></tr>
              <tr><td>UN AI Advisory</td><td className="num">Interim report</td></tr>
              <tr><td>Global AI Partnership</td><td className="num">29 nations</td></tr>
            </tbody>
          </table>
          <div className="footnote">A soft-law layer on top of hard regional regimes. Gap between aspiration and enforcement is widening.</div>
        </Panel>
      </div>
    </section>
  )
}

export function Section59_Compliance() {
  return (
    <section className="section" id="s-59">
      <Plate num="56" sup="§ 56 · Corporate Compliance" page="059" title="The <em>enterprise playbook</em>" />
      <div className="grid g-4">
        {[
          { step: "Map", items: ["Inventory every AI system & purpose", "Risk-classify per EU AI Act tiers", "Identify high-risk use cases", "Map to NIST AI RMF 2.0 functions"] },
          { step: "Build", items: ["Governance charter + AI ethics comm.", "Policies: data, privacy, bias, security", "Documentation templates", "Audit trail infrastructure"] },
          { step: "Deploy", items: ["Impact assessments pre-launch", "Bias + robustness testing", "User transparency + consent flows", "Incident response runbook rehearsed"] },
          { step: "Monitor", items: ["Continuous model monitoring", "Compliance metrics dashboard", "Regulator liaison cadence", "Post-deployment audits (twice-yearly)"] },
        ].map((p, i) => (
          <Panel key={i} title={`0${i + 1} · ${p.step}`}>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--fg-2)", fontSize: 12.5, lineHeight: 1.9 }}>
              {p.items.map((it, j) => <li key={j}>{it}</li>)}
            </ul>
          </Panel>
        ))}
      </div>
    </section>
  )
}

export function Section60_SocietalGood() {
  return (
    <section className="section" id="s-60">
      <Plate num="57" sup="§ 57 · Societal Good" page="060" title="AI, <em>used for</em> something" />
      <p className="dek">The counter-narrative to 2025&apos;s scandals: this year&apos;s most important AI applications were not chatbots. AlphaFold-4 mapped ~97% of the known proteome. Grid-optimization AI cut measured emissions by 32% across 142 nations. Early-warning systems for floods, cyclones, and wildfires deployed across 28 regions via UN OCHA.</p>
      <div className="grid g-4">
        {DD2.societalGood.map((s, i) => (
          <Panel key={i} title={s.d} aux="2025-2026">
            <div style={{ fontFamily: "var(--serif)", fontSize: 42, color: "var(--signal)", lineHeight: 1 }}>{s.stat}</div>
            <div style={{ fontSize: 13, color: "var(--fg)", marginTop: 12, fontFamily: "var(--serif)" }}>{s.t}</div>
            <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 4 }}>{s.imp}</div>
          </Panel>
        ))}
      </div>
    </section>
  )
}
