"use client"

import type { CSSProperties } from "react"
import { Nav, ChapterRail, Reveal } from "@/components/humanoid/shell"
import { SectionMap, MarketModel, DecisionTree } from "@/components/humanoid/charts"
import { GrowthDrivers, AppCaseStudies, MarketConcentration } from "@/components/humanoid/content"
import { DeploymentTimeline, ValueSankey } from "@/components/humanoid/flows"
import { SpecComparator, ROICalculator } from "@/components/humanoid/tools"
import { WarMap, ActuatorLab } from "@/components/humanoid/tools2"
import { ComparativeFramework, TechDeepDive } from "@/components/humanoid/frameworks"
import { EcosystemGraph, CaseStudyMap, CertStepper } from "@/components/humanoid/network"
import { Gate, PremiumDownloads } from "@/components/humanoid/entitlement"

const BOOKING = "https://www.earthscan.io/book-a-meeting"
const MAILTO = "mailto:tarry.singh@deepkapha.com"
const EXPLORER = "/humanoid/Value-Chain%20Explorer.html"
const DECK60 = "/humanoid/The%20Humanoid%20Ascendancy.html"
const chap = (c: string): CSSProperties => ({ "--chap": c } as CSSProperties)

export default function HumanoidPage() {
  return (
    <>
      <Nav />
      <ChapterRail />

      <section className="hero" id="top">
        <div className="grid-bg" />
        <div className="hero-inner">
          <div className="kick"><span className="tk" />Interactive Field Guide · Embodied AI · June 2026</div>
          <h1>The Humanoid<br />Ascendancy</h1>
          <p className="lede">The whole story — the narrative, the data, and the workshop — in one canvas. <span className="accent">Built to be explored, not just read.</span></p>
          <div className="scrollcue"><span className="dot" />Scroll to begin · 16 chapters · 15 interactive tools</div>
        </div>
      </section>

      <section className="band" id="map">
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">The contents</div>
            <h2 className="sec-h">Sixteen chapters, fifteen live tools, one argument: own the muscles, own the decade.</h2>
            <p className="sec-sub">A McKinsey-grade analysis of the humanoid robotics industry, paired with a hands-on technical workshop. Every chapter below jumps to a live, interactive section on this page — not a static slide.</p>
          </Reveal>
          <Reveal><SectionMap /></Reveal>
        </div>
      </section>

      <section className="band" id="market" style={chap("var(--c-cyan)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">02 · Market Sizing · Interactive</div>
            <h2 className="sec-h">The forecasts disagree by 6×. Model it yourself.</h2>
            <p className="sec-sub">Drag the 2025 base and growth rate, or load an analyst scenario, and watch the 2035 projection move. The spread isn&apos;t disagreement about the destination — it&apos;s uncertainty about timing.</p>
          </Reveal>
          <Reveal><MarketModel /></Reveal>
        </div>
      </section>

      <section className="band" id="drivers" style={chap("var(--c-green)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">01 · Growth Drivers · Interactive</div>
            <h2 className="sec-h">Two forces pulling the market: empty jobs and falling costs.</h2>
            <p className="sec-sub">Toggle demand-side catalysts against supply-side enablers. The demand is acute and the technology is ready — what&apos;s left is execution.</p>
          </Reveal>
          <Reveal><GrowthDrivers /></Reveal>
        </div>
      </section>

      <section className="band" id="chain" style={chap("var(--c-amber)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">03 · Technology Value Chain</div>
            <h2 className="sec-h">A humanoid is a brain, a body, and an integrator.</h2>
            <p className="sec-sub">Value concentrates unevenly — and half of it sits in the body. Open the full explorer to click through every subsystem&apos;s cost, suppliers, and bottleneck.</p>
          </Reveal>
          <Reveal>
            <div className="chain">
              <div className="chain-node"><span className="cshare">~20%</span><div className="cl">The Brain</div><div className="cv">Software &amp; chips</div><div className="cs">Foundation models, AI accelerators. High margin, few winners.</div></div>
              <div className="chain-node hot"><span className="cshare">~50%</span><div className="cl">The Body — the muscles</div><div className="cv">Actuators &amp; sensors</div><div className="cs">The mechanical bottleneck. Half the cost, the contested ground.</div></div>
              <div className="chain-node"><span className="cshare">assembly</span><div className="cl">The Integrator</div><div className="cv">The robot maker</div><div className="cs">Brand and data — but thin without the chain it depends on.</div></div>
            </div>
          </Reveal>
          <Reveal>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", margin: "56px 0 0" }}>Where every dollar of hardware goes</h3>
            <p className="sec-sub" style={{ marginTop: 8 }}>Hover any flow to trace its share of the bill of materials. Over half pours into the actuators.</p>
            <ValueSankey />
          </Reveal>
          <Reveal>
            <div className="embed explorer" style={chap("var(--c-amber)")}>
              <div className="embed-bar"><span className="el"><span className="d" />Value-Chain Explorer · live</span><a href={EXPLORER} target="_blank" rel="noopener">Open full screen ↗</a></div>
              <div className="embed-frame"><iframe src={EXPLORER} title="Value-Chain Explorer" loading="lazy" /></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band" id="ecosystem" style={chap("var(--c-blue)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">Strategic Ecosystem · Interactive</div>
            <h2 className="sec-h">The whole field is one connected network.</h2>
            <p className="sec-sub">Integrators, brains, suppliers, investors, and states — drag any node, hover to trace its partnerships. The web reveals who depends on whom.</p>
          </Reveal>
          <Reveal><EcosystemGraph /></Reveal>
        </div>
      </section>

      <section className="band" id="tech" style={chap("var(--c-cyan)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">Technical Deep-Dive · Interactive</div>
            <h2 className="sec-h">Inside the sensing stack: quantum leaps in precision.</h2>
            <p className="sec-sub">Next-gen sensors are redrawing what a humanoid can feel and where it can work. Compare positioning accuracy, and toggle the sector-impact radar.</p>
          </Reveal>
          <Reveal><TechDeepDive /></Reveal>
        </div>
      </section>

      <section className="band" id="compete" style={chap("var(--c-violet)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">04 · Competitive Landscape · Interactive</div>
            <h2 className="sec-h">Head-to-head, the leading robots are converging.</h2>
            <p className="sec-sub">Toggle the contenders, switch the metric, and watch the field re-rank. Six platforms, three regions, one race for the same spec.</p>
          </Reveal>
          <Reveal><SpecComparator /></Reveal>
        </div>
      </section>

      <section className="band" id="concentration" style={chap("var(--c-magenta)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">04 · Market Concentration · Interactive</div>
            <h2 className="sec-h">An early oligopoly: three players hold 56% of the market.</h2>
            <p className="sec-sub">Hover the ring or the table to trace each player&apos;s revenue share and growth rate. The fastest risers are vertically integrated — and the component suppliers capture value without building a robot.</p>
          </Reveal>
          <Reveal><MarketConcentration /></Reveal>
        </div>
      </section>

      <section className="band" id="frameworks" style={chap("var(--c-blue)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">Comparative Frameworks · Interactive</div>
            <h2 className="sec-h">East vs. West: frameworks that define the contest.</h2>
            <p className="sec-sub">Switch between manufacturing, ESG regulation, consortium and partnership models to see how the two blocs trade strengths and challenges across the value chain.</p>
          </Reveal>
          <Reveal><ComparativeFramework /></Reveal>
        </div>
      </section>

      <section className="band" id="roi" style={chap("var(--c-green)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">08 · Strategic Recommendations · Interactive</div>
            <h2 className="sec-h">Start small, prove ROI, then scale — so what&apos;s the payback?</h2>
            <p className="sec-sub">Size a pilot fleet and watch the business case resolve. The hard part is rarely the robot; it&apos;s the numbers. Model yours.</p>
          </Reveal>
          <Reveal><ROICalculator /></Reveal>
        </div>
      </section>

      <section className="band" id="geo" style={chap("var(--c-red)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">07 · Geopolitical Implications · Interactive</div>
            <h2 className="sec-h">The supply chain, not the showroom, is the battlefield.</h2>
            <p className="sec-sub">Select any layer of the value chain and watch how control splits across the three powers. The actuator and rare-earth layers are where the West is most exposed.</p>
          </Reveal>
          <Reveal><WarMap /></Reveal>
        </div>
      </section>

      <section className="band" id="regions" style={chap("var(--c-violet)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">International Case Studies · Interactive</div>
            <h2 className="sec-h">Five regions, five playbooks.</h2>
            <p className="sec-sub">Click a region to read its regulatory regime, market-entry strategy, and key players. The same robot demands a different strategy in every market.</p>
          </Reveal>
          <Reveal><CaseStudyMap /></Reveal>
        </div>
      </section>

      <section className="band" id="timeline" style={chap("var(--c-violet)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">06 · Key Applications · Timeline</div>
            <h2 className="sec-h">From first paycheck to scaled fleets, in four years.</h2>
            <p className="sec-sub">Scroll the timeline: 2024&apos;s first commercial deployment, 2025&apos;s capital inflection, 2026&apos;s move to production, and 2027&apos;s projected rollout.</p>
          </Reveal>
          <Reveal><DeploymentTimeline /></Reveal>
        </div>
      </section>

      <section className="band" id="cases" style={chap("var(--c-blue)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">06 · Key Applications · Case Studies</div>
            <h2 className="sec-h">Three deployments that proved the business case.</h2>
            <p className="sec-sub">Real pilots, real numbers. Switch between the BMW body shop, the GXO/Amazon warehouse, and the hospital floor to see task, results, and ROI.</p>
          </Reveal>
          <Reveal><AppCaseStudies /></Reveal>
        </div>
      </section>

      <section className="band" id="workshop" style={chap("var(--c-magenta)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">09 · The Workshop · Hands-on<span className="premium-badge">Premium</span></div>
            <h2 className="sec-h">From boardroom to shop floor: a working session for technical teams.</h2>
            <p className="sec-sub">The workshop track turns the analysis into practice — three technical modules and live simulations. Preview the tools, or request access for your team.</p>
          </Reveal>
          <Reveal>
            <div className="mods">
              <div className="mod"><div className="mn">Module 1</div><h4>Actuator Selection &amp; Integration</h4><p>Hands-on comparison of roller screws vs. ball screws, harmonic vs. cycloidal drives — with benchmarking.</p></div>
              <div className="mod"><div className="mn">Module 2</div><h4>AI Integration Architecture</h4><p>Implementing foundation models (GR00T vs. Gemini vs. custom) with real-time control systems.</p></div>
              <div className="mod"><div className="mn">Module 3</div><h4>Deployment Workflows</h4><p>End-to-end framework from pilot design to scaled rollout, with ROI measurement tools.</p></div>
            </div>
          </Reveal>
          <Reveal>
            <Gate sku="workshop" cta="Unlock workshop" title="The hands-on workshop is premium" desc="Unlock the live Actuator Selection Lab and the incident-response simulator — plus the full certification track below. Preview them now, or license a cohort for your team." note="Workshop + certification · licensed per cohort · tarrysingh.com">
              <div style={{ marginTop: 8 }}>
                <div className="eyebrow" style={{ marginBottom: 20 }}>Module 1 · Live bench</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 10px" }}>Actuator Selection Lab</h3>
                <p className="sec-sub">Set your requirement priorities — or load a joint preset — and the bench ranks every actuator type for the job. This is the actuator bottleneck made tangible.</p>
                <ActuatorLab />
                <div style={{ marginTop: 56 }}><DecisionTree /></div>
              </div>
            </Gate>
          </Reveal>
        </div>
      </section>

      <section className="band" id="cert" style={chap("var(--c-cyan)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">10 · Certification Path · Hands-on<span className="premium-badge">Premium</span></div>
            <h2 className="sec-h">From literacy to certified practitioner in five stages.</h2>
            <p className="sec-sub">Step through the workshop curriculum — foundations, technical core, deployment, safety, and the capstone certification. Preview it, or license a cohort.</p>
          </Reveal>
          <Reveal>
            <Gate sku="certification" cta="Unlock certification" kind="Premium certification" title="The certification track is premium" desc="Unlock the full five-stage curriculum, the capstone deliverables, and the dual-track credential. Preview it now, or license certification for your team." note="Certification · valid 3 years · dual-track (Technical / Executive) · tarrysingh.com">
              <CertStepper />
            </Gate>
          </Reveal>
        </div>
      </section>

      <section className="band" id="about" style={chap("var(--c-cyan)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">About the author</div>
            <h2 className="sec-h">Strategy, research, and workshops for the embodied-AI era.</h2>
          </Reveal>
          <Reveal>
            <div className="about">
              <div className="about-bio">
                <div className="about-name">Tarry Singh</div>
                <div className="about-role">AI Researcher · Advisor · Founder</div>
                <p>I build and teach at the frontier of applied AI — translating fast-moving technology into strategy executives can act on. This Field Guide is one of a series of deep, interactive reports pairing original analysis with hands-on tooling.</p>
                <p>My work centers on helping large enterprises — including across the Gulf and Saudi Arabia — understand where value concentrates in emerging technology, and how to deploy it without betting the company.</p>
                <p>More work and writing at <a href="https://tarrysingh.com" target="_blank" rel="noopener">tarrysingh.com</a>.</p>
              </div>
              <div className="about-offer">
                <div className="ao-k">Premium · In-company workshop</div>
                <h3>Bring this to your leadership team.</h3>
                <p>A hands-on, executive-grade workshop built on this analysis — run on-site for technical and strategy teams at enterprises (1,000+ employees).</p>
                <ul>
                  <li>Five-stage curriculum to a dual-track certification</li>
                  <li>Live tooling: value-chain, ROI, actuator &amp; supply-chain labs</li>
                  <li>Tailored to your sector, deployment goals, and supply exposure</li>
                </ul>
                <div className="ao-cta">
                  <a className="ao-btn" href={BOOKING} target="_blank" rel="noopener">Book a meeting ↗</a>
                  <a className="ao-btn ghost" href={MAILTO}>Email Tarry</a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band" id="package" style={chap("var(--c-amber)")}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">The package · Get it &amp; take it with you</div>
            <h2 className="sec-h">The executive deck is free. The full curriculum is the package.</h2>
            <p className="sec-sub">Start with the 60-slide narrative at no cost. The hands-on labs and the certification track unlock with the full package — and the complete 375-slide workshop deck arrives, as native pages, in the next release.</p>
          </Reveal>
          <Reveal>
            <div className="pkg">
              <div className="pkg-tier">
                <div className="pkg-k free">Free</div>
                <h3 className="pkg-name">Executive Deck</h3>
                <div className="pkg-price">$0<span>forever</span></div>
                <ul className="pkg-list">
                  <li>60-slide board-ready narrative</li>
                  <li>Current to June 2026, fully sourced</li>
                  <li>Editable PowerPoint export</li>
                  <li>Every interactive tool on this page</li>
                </ul>
                <div className="pkg-cta">
                  <a className="pkg-btn" href={DECK60} target="_blank" rel="noopener">Open the 60-slide deck ↗</a>
                  <div className="pkg-note">No sign-up. Free to read, present, and share.</div>
                </div>
              </div>
              <div className="pkg-tier featured">
                <div className="pkg-ribbon">Complete package</div>
                <div className="pkg-k">Premium</div>
                <h3 className="pkg-name">The Full Curriculum</h3>
                <div className="pkg-price">$20k<span>/ seat · in-company</span></div>
                <ul className="pkg-list">
                  <li><b>Everything in Free, plus —</b></li>
                  <li>The complete <b>375-slide</b> workshop deck</li>
                  <li>Hands-on Actuator Lab &amp; incident-response sim</li>
                  <li>Five-stage certification, dual-track credential</li>
                  <li>Full download access — deck + workbook</li>
                </ul>
                <PremiumDownloads />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band" id="tools">
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">The toolkit</div>
            <h2 className="sec-h">The whole deck, in one surface.</h2>
            <p className="sec-sub">The full 60-slide narrative is embedded below — or open any interactive tool on its own. Everything links back here.</p>
          </Reveal>
          <Reveal>
            <div className="embed deck" style={chap("var(--accent)")}>
              <div className="embed-bar"><span className="el"><span className="d" />The Humanoid Ascendancy · 60 slides</span><a href={DECK60} target="_blank" rel="noopener">Open full screen ↗</a></div>
              <div className="embed-frame"><iframe src={DECK60} title="The Humanoid Ascendancy deck" loading="lazy" /></div>
            </div>
          </Reveal>
          <Reveal>
            <div className="tools">
              <a className="tool" href={DECK60} target="_blank" rel="noopener"><span className="tk">Presentation</span><div><h3>The 60-slide deck</h3><p>The full board-ready narrative, current to June 2026 — also exportable to PowerPoint and PDF.</p></div><span className="go">Open the deck →</span></a>
              <a className="tool" href={EXPLORER} target="_blank" rel="noopener"><span className="tk">Interactive</span><div><h3>Value-Chain Explorer</h3><p>Click the humanoid anatomy to inspect cost, suppliers, and supply-chain risk by subsystem.</p></div><span className="go">Explore the machine →</span></a>
              <a className="tool" href="#market"><span className="tk">Interactive</span><div><h3>Market Forecast Model</h3><p>A live scenario sandbox for the 2025–2035 market — sliders, analyst presets, instant projection.</p></div><span className="go">Model the market →</span></a>
              <a className="tool" href="#compete"><span className="tk">Interactive</span><div><h3>Spec Comparator</h3><p>Toggle robots and metrics to re-rank the field on payload, runtime, and price.</p></div><span className="go">Compare the robots →</span></a>
              <a className="tool" href="#roi"><span className="tk">Interactive</span><div><h3>ROI / Payback Lab</h3><p>Size a fleet, pick RaaS or purchase, and see the payback period and 5-year net.</p></div><span className="go">Run the numbers →</span></a>
              <a className="tool" href="#geo"><span className="tk">Interactive</span><div><h3>Supply-Chain War Map</h3><p>Select a value-chain layer and watch control split across the US, China, and Korea.</p></div><span className="go">Map the battlefield →</span></a>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="foot">
        <div className="wrap foot-in">
          <h2>Own the muscles,<br />own the decade.</h2>
          <div className="meta">
            Tarry Singh — Embodied AI<br />
            <a href="https://tarrysingh.com">tarrysingh.com</a><br />
            Sources: Morgan Stanley · Counterpoint · Goldman Sachs · company filings · June 2026
          </div>
        </div>
      </div>
    </>
  )
}
