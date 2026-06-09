import type { Slide, TocGroup } from "./types"

/**
 * Phase-A vertical slice: ten pages, one per template archetype, content
 * lifted verbatim from the source-deck ledger (content-map.md) and
 * actualized to June 2026 where the canvas already did so. The Phase-B
 * extraction fleet replaces this file with the full curated manifest.
 */
export const SLIDES: Slide[] = [
  {
    kind: "title",
    src: 1,
    kicker: "Global Market Analysis · 2026 Edition",
    title: "The State of\nHumanoid Robotics",
    sub: "A McKinsey-grade deep dive: market dynamics, technology breakthroughs, and strategic implications for industry leaders.",
    meta: "Prepared for executive boards, R&D leaders, and technical innovators · Tarry Singh · June 2026",
  },
  {
    kind: "divider",
    src: 11,
    chap: "var(--c-cyan)",
    numeral: "I",
    part: "Part I",
    title: "Market Landscape & Analysis",
    topics: [
      { n: "1.1", t: "Global Overview" },
      { n: "1.2", t: "Market Sizing & Forecasts" },
      { n: "1.3", t: "Regional Analysis" },
      { n: "1.4", t: "Growth Drivers" },
      { n: "1.5", t: "Investment Landscape" },
      { n: "1.6", t: "Business Models" },
    ],
  },
  {
    kind: "stats",
    src: 12,
    chap: "var(--c-cyan)",
    eyebrow: "Part I · Market Landscape · 1.1",
    title: "The 2025 baseline: a small market growing violently.",
    stats: [
      { big: "$2.9–4.4B", lab: "2025 market size, across the five major analyst houses" },
      { big: "39–49%", lab: "forecast CAGR band, 2025–2035" },
      { big: "$38–243B", lab: "2035 projections — a 6× spread on the same destination" },
      { big: "2028–30", lab: "projected mass-adoption inflection; mainstream ≈ 2032" },
    ],
    body: [
      "The market is bifurcating into two systems: a {{Western, VC-driven}} track racing on capability, and a {{China-centric, state-directed}} track racing on volume and the supply chain.",
    ],
    foot: "Sources: MarketsandMarkets · Goldman Sachs · Research Nester · Coherent Market · GlobeNewswire",
  },
  {
    kind: "instrument",
    src: 13,
    chap: "var(--c-cyan)",
    eyebrow: "Part I · Market Landscape · 1.2",
    title: "Five analyst forecasts. One live model.",
    sub: "The source deck's static forecast charts, rebuilt as the live scenario sandbox — drag the 2025 base and growth rate, or load an analyst preset, and watch the 2035 projection move.",
    instrument: "market-model",
    replaces: "Replaces source slides 12–13 (static forecast charts)",
  },
  {
    kind: "bullets",
    src: 120,
    chap: "var(--c-green)",
    eyebrow: "Manufacturing Excellence",
    title: "Quality control in robotics manufacturing.",
    bullets: [
      { lead: "Automated Optical Inspection (AOI)", text: "High-precision camera systems capture {{10,000+ images per minute}} to detect microscopic flaws in circuit boards and mechanical assemblies with {{99.8% accuracy}} — reducing escape rate by 76% compared to manual inspection." },
      { lead: "Finite Element Analysis (FEA)", text: "Advanced simulation for stress-testing actuators and structural components under varied loading conditions — critical for validating {{planetary-roller-screw and harmonic-drive reliability}} before physical assembly." },
      { lead: "Digital Twin Validation", text: "Real-time synchronized virtual models of each robot enable predictive QA through continual comparison of expected versus actual performance — with {{±0.03mm positional accuracy tracking}}." },
      { lead: "Environmental Stress Screening (ESS)", text: "Accelerated life-testing protocols: thermal cycling {{−30°C to +70°C}}, vibration chambers, and humidity exposure to identify potential failures before field deployment." },
      { lead: "Certifications & Standards", text: "Rigorous compliance with ISO 9001:2015 and ISO/TS 16949, plus the emerging {{ISO 10218 / 15066}} robotics-safety standards — documented via blockchain-secured digital traceability." },
    ],
    callout: {
      k: "Benchmark finding",
      text: "Every $1 invested in advanced QA systems returns {{$4.70}} in reduced warranty claims and field failures — while decreasing time-to-market by 26% through parallel validation processes.",
    },
  },
  {
    kind: "case",
    src: 8,
    chap: "var(--c-blue)",
    eyebrow: "Key Applications · 2025 Beachheads",
    co: "BMW",
    robot: "Figure 02 → 03",
    site: "Spartanburg, SC",
    task: "Sheet-metal part insertion into body-shop fixtures",
    results: [
      "11-month pilot, completed November 2025",
      "30,000+ vehicles · 90,000+ parts handled",
      "1,250 operating hours logged on the line",
    ],
    roi: "Automotive: 28–35% labor-cost reduction · 9–14 month payback on $150k+ robots · 22% defect reduction",
  },
  {
    kind: "twoPanel",
    src: 140,
    chap: "var(--c-green)",
    eyebrow: "Business Models · Acquisition Strategy",
    title: "RaaS versus CapEx in volatile markets.",
    sub: "Two ways to pay for the same robot — and the volatility of your demand decides which one wins.",
    L: {
      name: "Robots-as-a-Service",
      tag: "Subscription · OpEx",
      accent: "var(--c-green)",
      rows: [
        { t: "Cash profile", items: [["+", "Steady, predictable operating expense"], ["+", "No front-loaded capital commitment"], ["~", "Premium priced into the monthly rate"]] },
        { t: "Volatility response", items: [["+", "Scale-down flexibility when demand drops"], ["+", "15–20% lower TCO when production halts"], ["+", "Vendor carries the obsolescence risk"]] },
      ],
      ex: "In volatile demand environments, RaaS converts a stranded-asset risk into a flexible operating line.",
    },
    R: {
      name: "Direct Purchase",
      tag: "Ownership · CapEx",
      accent: "var(--c-amber)",
      rows: [
        { t: "Cash profile", items: [["−", "$150–250k per unit, front-loaded"], ["−", "Breakeven at 36–42 months"], ["+", "Cheapest at sustained high utilization"]] },
        { t: "Volatility response", items: [["−", "Only wins when utilization stays above ~65%"], ["−", "Idle robots keep depreciating"], ["~", "Full control over fleet and data"]] },
      ],
      ex: "The hybrid pattern — an owned core fleet plus RaaS for peaks — is emerging as the optimal resilience play.",
    },
  },
  {
    kind: "table",
    src: 340,
    chap: "var(--c-amber)",
    eyebrow: "Strategic Operations · Cost–Benefit",
    title: "Implementation cost versus benefit, four sectors.",
    sub: "Where the business case resolves fastest — verified pilot economics across the four beachhead sectors.",
    columns: ["Sector", "Annual savings", "Efficiency gain", "Payback"],
    rows: [
      ["Automotive", "28–35%", "22% defect reduction", "9–14 mo — best in class"],
      ["Warehouse logistics", "18–25%", "42% — highest, mixed fleets", "12–18 mo"],
      ["Healthcare", "12–20% staff retention", "600+ nursing hours returned", "18–24 mo"],
      ["Retail", "10–18%", "after-hours restock coverage", "24+ mo"],
    ],
    foot: "RaaS acquisition cuts total cost of ownership by ~31% versus outright ownership across all four sectors.",
  },
  {
    kind: "timeline",
    src: 240,
    chap: "var(--c-violet)",
    eyebrow: "Technology Horizon · Deep Dive",
    title: "Quantum computing reaches the humanoid stack.",
    sub: "From cloud-side planning to on-robot accelerators in a decade — the integration roadmap.",
    stops: [
      { when: "2025–27", what: "Cloud quantum, offline", detail: "Motion-planning acceleration of 30–50× for complex manipulation, computed off-robot between shifts." },
      { when: "2027–30", what: "Hybrid quantum-classical", detail: "Real-time sensor fusion in milliseconds; quantum-neural-network training time cut 60–85%." },
      { when: "2030–35", what: "Integrated accelerators", detail: "Quantum co-processors on the robot itself — plus post-quantum cryptography across the fleet." },
    ],
  },
  {
    kind: "bullets",
    src: 285,
    chap: "var(--c-magenta)",
    eyebrow: "Workshop · Module 4 — Financial Modeling",
    locked: true,
    title: "Financial modeling masterclass.",
    bullets: [
      { lead: "CapEx versus OpEx framework", text: "Build the full acquisition decision: depreciation schedules, maintenance reserves, and the RaaS-versus-purchase {{total-cost-of-ownership}} crossover." },
      { lead: "Revenue projection", text: "Model labor savings, throughput productivity, and the {{second-order gains}} — quality, uptime, retention — that most business cases leave on the table." },
      { lead: "Risk-adjusted returns", text: "NPV and IRR under {{Monte Carlo simulation}} — pricing in adoption risk, wage inflation, and component-cost decline curves." },
    ],
    callout: {
      k: "Scenario bands",
      text: "Optimistic: 25%/yr robot-cost decline → {{4.5-yr payback}} · Base: 15%/yr → 6.5-yr · Risk: 8%/yr → 9+ yr.",
    },
  },
]

export const TOC: TocGroup[] = [
  { label: "Front matter", slides: [0, 1] },
  { label: "Part I — Market Landscape", slides: [2, 3] },
  { label: "Excellence & Operations", slides: [4, 5, 6, 7] },
  { label: "Technology Horizon", slides: [8] },
  { label: "Workshop modules", slides: [9] },
]

export const DECK_TITLE = "The State of Humanoid Robotics"
export const DECK_EDITION = "2026 Edition"
