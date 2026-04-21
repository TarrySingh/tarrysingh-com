// The Insane Pace of AI — Q1 2026 Executive Dashboard
// Data refreshed through April 14, 2026

export const DATA = {
  asOf: "APR 2026",
  reportId: "RAI-Q1-2026-IPOAI",
  coverage: "Q3 2025 – Q1 2026 · 248 days",

  hero: {
    modelSizeReduction: { v: 412, unit: "×", label: "Model Size Reduction", sub: "540B PaLM (2022) → 1.3B Helix-nano (Apr 2026) at equivalent MMLU" },
    inferenceCost:     { v: 1800, unit: "×", label: "Inference Cost Drop", sub: "$20.00 → $0.011 per M tokens for GPT-3.5-class perf (Nov '22 → Mar '26)" },
    corpAdoption:      { v: 91, unit: "%", label: "Corporate AI Adoption", sub: "Organizations running AI in ≥1 function, up from 78% Q2 2025" },
    globalUsers:       { v: 612, unit: "M+", label: "Global AI Users", sub: "+234M net new users during 2025 — steepest adoption curve of any tech" },
    agenticSpend:      { v: 47.3, unit: "B$", label: "Agentic AI Spend", sub: "Enterprise budget on autonomous agents in FY2025, 6.2× FY2024" },
    aiElectricity:     { v: 4.1, unit: "%", label: "of Global Electricity", sub: "AI data centers — up from 1.4% in 2024" },
    capexGlobal:       { v: 512, unit: "B$", label: "Hyperscaler CapEx '26", sub: "Announced AI infra capex by top 6 hyperscalers, FY2026" },
    patentShare:       { v: 36, unit: "%", label: "China AI Patent Share", sub: "Up from 32% (2024); US at 22%" },
  },

  costCurve: [
    { m: "Nov '22", v: 20.00 },
    { m: "May '23", v: 7.20 },
    { m: "Nov '23", v: 2.10 },
    { m: "May '24", v: 0.62 },
    { m: "Oct '24", v: 0.07 },
    { m: "Mar '25", v: 0.034 },
    { m: "Aug '25", v: 0.019 },
    { m: "Jan '26", v: 0.014 },
    { m: "Apr '26", v: 0.011 },
  ],

  userGrowth: [
    { y: 2019, u: 18 },   { y: 2020, u: 31 },
    { y: 2021, u: 58 },   { y: 2022, u: 112 },
    { y: 2023, u: 208 },  { y: 2024, u: 314 },
    { y: 2025, u: 548 },  { y: 2026, u: 612 },
  ],

  paramEfficiency: [
    { y: 2022, p: 540, m: "PaLM-540B", lab: "Google" },
    { y: 2023, p: 70,  m: "Llama-2-70B", lab: "Meta" },
    { y: 2024, p: 3.8, m: "Phi-3-mini",  lab: "Microsoft" },
    { y: 2025, p: 2.1, m: "Gemma-3-2B",  lab: "Google" },
    { y: 2026, p: 1.3, m: "Helix-nano",  lab: "Anthropic" },
  ],

  benchmarks: [
    { n: "SWE-Bench Verified", y24: 19.2, y25: 64.1, y26: 89.7, ceil: 100 },
    { n: "MMLU",               y24: 68.0, y25: 86.4, y26: 92.1, ceil: 95 },
    { n: "GPQA Diamond",       y24: 28.1, y25: 55.3, y26: 78.9, ceil: 95 },
    { n: "AIME 2025",          y24: 12.0, y25: 74.5, y26: 94.2, ceil: 100 },
    { n: "ARC-AGI-2",          y24: 2.1,  y25: 28.4, y26: 61.7, ceil: 85 },
    { n: "RE-Bench (7-day)",   y24: 11.0, y25: 42.0, y26: 73.5, ceil: 100 },
  ],

  adoptionMatrix: {
    funcs: ["Marketing", "Service", "Product/R&D", "IT/Eng", "Finance", "HR", "Ops/Supply", "Legal"],
    inds:  ["Tech", "Financial Svc", "Media", "Retail", "Manufacturing", "Healthcare", "Energy", "Gov't"],
    data: [
      [94, 92, 88, 84, 76, 71, 58, 44],
      [91, 88, 84, 89, 72, 68, 54, 49],
      [96, 72, 66, 58, 81, 74, 62, 38],
      [98, 94, 82, 79, 86, 79, 68, 52],
      [78, 96, 48, 62, 66, 58, 54, 47],
      [74, 72, 62, 66, 62, 58, 52, 54],
      [64, 48, 42, 82, 88, 56, 82, 41],
      [71, 88, 52, 48, 58, 68, 44, 68],
    ],
  },

  loops: [
    { k: "Algorithmic", v: 0.42, note: "FLOPs/token, 2yr halving" },
    { k: "Hardware",    v: 0.28, note: "GB200 → GB300 → Vera" },
    { k: "Data Scale",  v: 0.18, note: "Synthetic corpora ≥ 62% of pretrain" },
    { k: "Self-improvement", v: 0.12, note: "AI-designed architectures" },
  ],

  regions: {
    us:    { priv: 184.7, gov: 68, pats: 22, pubs: 21, posture: "Private-led · $184.7B '25 VC · sector regs" },
    china: { priv: 34.2,  gov: 162, pats: 36, pubs: 31, posture: "State-directed · $162B strategic fund" },
    eu:    { priv: 22.1,  gov: 94,  pats: 14, pubs: 18, posture: "AI Act in force · HOMINIS live · sovereign compute" },
    uk:    { priv: 11.4,  gov: 18,  pats: 5,  pubs: 7,  posture: "AISI leadership · pro-innovation" },
    me:    { priv: 19.8,  gov: 420, pats: 2,  pubs: 3,  posture: "Data embassies · HUMAIN · Falcon-3" },
    india: { priv: 8.6,   gov: 14.8, pats: 3, pubs: 5,  posture: "IndiaAI · Sarvam-2 · 22 langs" },
    row:   { priv: 14.9,  gov: 22,  pats: 18, pubs: 15, posture: "Canada · Japan · Korea · SEA" },
  },

  modalities: [
    { m: "Text → Video", lead: "OpenAI Sora-3", score: 92, yr: "180s coherent" },
    { m: "Realtime Voice", lead: "Google Astra 2", score: 96, yr: "<180ms latency" },
    { m: "Spatial / 3D",  lead: "Apple WorldScan", score: 74, yr: "AR-native meshes" },
    { m: "Long-video understanding", lead: "Gemini 3 Ultra", score: 88, yr: "8hr context" },
    { m: "Code → App",   lead: "Claude 4 Opus", score: 91, yr: "End-to-end ship" },
    { m: "Scientific",    lead: "AlphaProof 2", score: 83, yr: "IMO Gold '25" },
  ],

  agentic: {
    capabilities: [
      { c: "Tool use", h: 98, ai: 96 },
      { c: "Planning (short)", h: 92, ai: 94 },
      { c: "Planning (7+ day)", h: 90, ai: 62 },
      { c: "Memory coherence", h: 95, ai: 71 },
      { c: "Self-correction", h: 84, ai: 78 },
      { c: "Multi-agent coord.", h: 76, ai: 81 },
    ],
    deployments: 3.4,
    autonomyHours: 48,
  },

  maturity: [
    { stage: "Pilot Purgatory",  pct: 32, roi: "0.4×", desc: "Isolated experiments, no P&L tie-in" },
    { stage: "Strategic Scaling", pct: 38, roi: "1.2×", desc: "Prioritized use cases, early governance" },
    { stage: "Operational Integration", pct: 22, roi: "2.8×", desc: "Process transformation, MLOps at scale" },
    { stage: "Embedded Intelligence",   pct: 8,  roi: "4.6×", desc: "AI-native workflows, enterprise-wide" },
  ],
} as const;

export const DATA2 = {
  regionDeep: {
    us: {
      flag: "🇺🇸",
      name: "United States",
      posture: "Private-led frontier · $184.7B '25 VC",
      pill: "11.7× China's private AI capital",
      priv: 184.7, pub: 5.2, moment: "EO 14179 + AI Bill of Rights 2.0",
      pillars: [
        { k: "Frontier model leadership", d: "Claude 4 Opus, GPT-5.5, Gemini 3 Ultra — all US-domiciled. 82% of foundation-model training compute." },
        { k: "Private capital engine", d: "$184.7B in 2025 (+42% YoY). 74% of global AI venture deal volume." },
        { k: "Pro-competition regulation", d: "Executive Order 14179 refined; sector-specific (FTC/SEC/FDA). No federal AI Act." },
        { k: "Compute & talent depth", d: "68% of frontier researchers, 71% of trained GPUs by flops-year capacity." },
      ],
      weaknesses: ["Patent share slipping (22% vs China 36%)", "Grid constraints in VA/TX data-center corridors", "Export control retaliation from CN on rare earths"],
      stat: [
        { l: "Federal AI R&D", v: "$5.8B/yr" },
        { l: "AI workforce", v: "1.84M" },
        { l: "Unicorns (2025)", v: "87" },
        { l: "Frontier labs", v: "12" },
      ],
    },
    china: {
      flag: "🇨🇳",
      name: "China",
      posture: "State-directed · technological sovereignty",
      pill: "$162B strategic fund · patent leadership",
      priv: 34.2, pub: 162, moment: "14th Five-Year AI Plan · Phase 3",
      pillars: [
        { k: "Semiconductor independence", d: "SMIC N5 volume production · Huawei Ascend 920 closes perf gap to H200 at ~74%." },
        { k: "Open-weight dominance", d: "DeepSeek-R3, Qwen-3, Kimi-K3 — top 3 open-weight models globally by download volume." },
        { k: "Research output", d: "43% of AI papers (2025) · 36% of patents · 104K+ patent applications since 2022." },
        { k: "Application depth", d: "AI-native surveillance, smart-manufacturing, and municipal-services deployments at national scale." },
      ],
      weaknesses: ["Frontier benchmark gap (≈3pp MMLU)", "Export controls cap EUV lithography", "Content-control rules limit global commercial reach"],
      stat: [
        { l: "Semi fund", v: "$162B" },
        { l: "AI hubs (Tier-1)", v: "11" },
        { l: "Research papers", v: "43%" },
        { l: "Open models (top-10)", v: "5" },
      ],
    },
    eu: {
      flag: "🇪🇺",
      name: "European Union",
      posture: "Regulatory superpower · human-centric",
      pill: "AI Act in force · €94B AI Factories 2.0",
      priv: 22.1, pub: 94, moment: "AI Act fully enforced (Aug 2026)",
      pillars: [
        { k: "AI Act enforcement", d: "Risk-tiered regime fully in force. €2.8B in fines Q4 2025 (GPAI disclosure failures)." },
        { k: "Sovereign compute", d: "AI Factories 2.0 (€94B) — 17 exascale-class nodes including Leonardo-3, Jupiter, MareNostrum-5." },
        { k: "Human-centric models", d: "HOMINIS-2 covers all 24 official languages, open-weights, 58% lower carbon than GPT-5 eq." },
        { k: "Trustworthy AI brand", d: "EU-certified AI becomes a market differentiator in healthcare, finance, public sector globally." },
      ],
      weaknesses: ["Private capital lags (3× smaller than US)", "Talent drain to US hyperscalers", "Compliance cost on SMEs"],
      stat: [
        { l: "Member states adopting", v: "27 / 27" },
        { l: "Regulatory sandboxes", v: "42" },
        { l: "GPAI registered", v: "238" },
        { l: "HOMINIS users", v: "41M" },
      ],
    },
    uk: {
      flag: "🇬🇧",
      name: "United Kingdom",
      posture: "Pro-innovation · safety institute leadership",
      pill: "AISI lead · evals as global standard",
      priv: 11.4, pub: 18, moment: "AI Safety Bill (Royal Assent Jan '26)",
      pillars: [
        { k: "AISI global role", d: "Pre-deployment evaluations for frontier models, including GPT-5.5 and Claude 4 Opus." },
        { k: "Contextual regulation", d: "Five existing regulators (CMA, ICO, FCA, Ofcom, MHRA) with binding AI guidance from Jan 2026." },
        { k: "Compute policy", d: "£2.4B AI Research Resource · Isambard-AI operational; Dawn-2 planned for Q3 2026." },
        { k: "DeepMind hub", d: "Google DeepMind remains London-HQ'd; 40% of Alphabet AI research output originates in UK." },
      ],
      weaknesses: ["Post-Brexit talent friction", "Less sovereign capital vs US/FR/DE", "Limited semiconductor capacity"],
      stat: [
        { l: "AISI evaluations", v: "48" },
        { l: "AI Research Resource", v: "£2.4B" },
        { l: "AI startups", v: "3,170" },
        { l: "Safety researchers", v: "1,480" },
      ],
    },
    me: {
      flag: "🌐",
      name: "Middle East (UAE + KSA)",
      posture: "Capital-led · sovereign compute hubs",
      pill: "$420B committed · 12% of global training",
      priv: 19.8, pub: 420, moment: "HUMAIN-2 live · Stargate-UAE breaks ground",
      pillars: [
        { k: "Massive sovereign capital", d: "UAE: $50B (2024-26). KSA: $370B (Vision 2030 AI track). Collective 12% of global training compute." },
        { k: "Data embassy concept", d: "UAE pioneering extraterritorial data hosting agreements with 14 nations." },
        { k: "Regional LLMs", d: "Falcon-3 (180B) and HUMAIN-2 cover 30+ Arabic dialects with cultural context alignment." },
        { k: "Strategic partnerships", d: "G42-Microsoft, NVIDIA ADIA, OpenAI Stargate-UAE ($80B single-site compute cluster)." },
      ],
      weaknesses: ["Talent imported vs grown", "Limited domestic research output", "Geopolitical dual-use scrutiny (US chip controls)"],
      stat: [
        { l: "Committed capital", v: "$420B" },
        { l: "AI data centers", v: "14" },
        { l: "Arabic dialects (HUMAIN-2)", v: "30+" },
        { l: "Training compute share", v: "12%" },
      ],
    },
    india: {
      flag: "🇮🇳",
      name: "India",
      posture: "Multilingual sovereignty · DPI-native",
      pill: "IndiaAI Mission 2.0 · ₹22,400 Cr · 22 langs",
      priv: 8.6, pub: 2.7, moment: "Sarvam-2 launched · UPI-AI rollout",
      pillars: [
        { k: "Digital public infrastructure", d: "1.4B Aadhaar identities, UPI (13B monthly transactions), DigiLocker — native AI substrate." },
        { k: "Indigenous LLMs", d: "Sarvam-2, AI4Bharat, Bhashini cover all 22 official languages + 38 dialects." },
        { k: "Talent scale", d: "6.8M tech graduates/yr · 1.24M AI-specialized workforce · partnership with 340+ universities." },
        { k: "DPI export", d: "UPI+AI stack licensed by 11 nations (Singapore, UAE, France, Brazil, Nigeria, Indonesia, etc.)." },
      ],
      weaknesses: ["Frontier compute capacity limited", "Foundation-model parity gap", "Regulatory uncertainty on copyrighted training data"],
      stat: [
        { l: "IndiaAI Mission 2.0", v: "$2.7B" },
        { l: "AI-specialized workforce", v: "1.24M" },
        { l: "Languages (Sarvam-2)", v: "22" },
        { l: "Nations licensing DPI", v: "11" },
      ],
    },
    row: {
      flag: "🌎",
      name: "Rest of World",
      posture: "Specialized strengths · hedged alignment",
      pill: "Canada, Japan, Korea, LATAM, Africa",
      priv: 14.9, pub: 22, moment: "AU: Safe-AI Act · JP: Society 5.1 · BR: AI Strategy 2.0",
      pillars: [
        { k: "Canada — ethical AI research", d: "CIFAR, Mila, Vector Institute. $2.4B Pan-Canadian Strategy. Bengio → leading AI Safety Institute." },
        { k: "Japan — robotics + AI fusion", d: "Society 5.1 plan. Honda ASIMO-3, Toyota T-HR4, SoftBank Pepper-AI. 14% of global AI-robotics patents." },
        { k: "South Korea — semiconductor AI", d: "Samsung HBM4 ramping, SK Hynix leading HBM3e. K-LLM (ExaOne-3) + AI chip R&D intensity highest in OECD." },
        { k: "LATAM + Africa — application AI", d: "Brazil fintech AI (Nubank), Kenya agri-AI, Nigeria health-AI; focus on DPI-adjacent deployments." },
      ],
      weaknesses: ["Fragmented", "Dependent on foreign frontier models", "Limited sovereign compute"],
      stat: [
        { l: "Nations with AI strategy", v: "64" },
        { l: "Robotics-AI patents (JP/KR)", v: "28%" },
        { l: "LATAM AI startups", v: "4,100+" },
        { l: "African AI Unions", v: "Smart Africa" },
      ],
    },
  },

  regionalCompare: {
    adoption: { us: 91, cn: 88, eu: 84, india: 72, me: 79, row: 61 },
    genai:    { us: 82, cn: 76, eu: 68, india: 64, me: 71, row: 48 },
    invest:   { us: 184.7, cn: 34.2, eu: 22.1, india: 8.6, me: 19.8, row: 14.9 },
    growth:   { us: 42, cn: 28, eu: 18, india: 92, me: 118, row: 47 },
  },

  casestudies: {
    hominis: {
      name: "Project HOMINIS-2",
      tag: "European Sovereign LLM",
      metrics: [
        { l: "Languages", v: "24 EU officials" },
        { l: "Parameters (sparse)", v: "340B / 28B active" },
        { l: "Carbon vs GPT-5", v: "−58%" },
        { l: "Users", v: "41M MAU" },
        { l: "Public sector deploys", v: "187" },
      ],
      principles: ["Open weights + transparent pretrain", "Bias-audited every release", "100% renewable training", "EU AI Act fully aligned"],
    },
    realbusiness: {
      name: "realbusiness.ai (Real AI Inc.)",
      tag: "Agentic AI platform",
      metrics: [
        { l: "Enterprise deploys", v: "312" },
        { l: "Avg 12-mo ROI", v: "4.1×" },
        { l: "Process cycle ↓", v: "78%" },
        { l: "Innovation cycle ↑", v: "86%" },
        { l: "Autonomous workflows", v: "72hr+" },
      ],
      principles: ["Perceive → Plan → Execute → Learn loop", "480+ enterprise API integrations", "Continuous enterprise-RLHF", "Supervisor-agent governance built-in"],
    },
  },

  sectors: [
    { n: "Enterprise Software", p: 34, yoy: 48, icon: "■" },
    { n: "Healthcare", p: 18, yoy: 62, icon: "✚" },
    { n: "Financial Services", p: 14, yoy: 31, icon: "$" },
    { n: "Manufacturing", p: 11, yoy: 27, icon: "⚙" },
    { n: "Energy / Grid", p: 9,  yoy: 71, icon: "◈" },
    { n: "Defense / Intel", p: 7,  yoy: 84, icon: "▲" },
    { n: "Autonomous Mobility", p: 4,  yoy: 38, icon: "◆" },
    { n: "Media / Entertainment", p: 3, yoy: 22, icon: "◉" },
  ],

  businessFunc: [
    { f: "Customer Service", p: 89, v: "Tier-1/2 resolution, sentiment" },
    { f: "Marketing & Sales", p: 81, v: "Hyper-personalization, content, scoring" },
    { f: "Software Engineering", p: 78, v: "PR review, code-gen, autonomous fixes" },
    { f: "R&D / Innovation", p: 74, v: "Drug discovery, materials, simulation" },
    { f: "Supply Chain", p: 72, v: "Forecasting, logistics, risk" },
    { f: "Finance Ops", p: 68, v: "Reconciliation, close, fraud" },
    { f: "Manufacturing", p: 64, v: "Predictive maint, QC, robotics" },
    { f: "Human Resources", p: 58, v: "Talent, L&D, engagement" },
    { f: "Legal", p: 54, v: "Contract review, compliance" },
  ],

  hardware: [
    { n: "NVIDIA Vera / GB300", y: "Q4 '25", p: "Frontier training dominant", share: 62 },
    { n: "Google Ironwood-2 TPU", y: "Q1 '26", p: "Large-scale inference", share: 14 },
    { n: "AMD MI500X", y: "Q4 '25", p: "Challenger training", share: 9 },
    { n: "Huawei Ascend 920", y: "Q1 '26", p: "China sovereign training", share: 6 },
    { n: "AWS Trainium 3", y: "Q2 '25", p: "Cloud-native training", share: 4 },
    { n: "Cerebras WSE-4", y: "Q1 '26", p: "Specialized scientific", share: 2 },
    { n: "Groq LPU", y: "ramp", p: "Low-latency inference", share: 2 },
    { n: "Other", y: "—", p: "Long tail", share: 1 },
  ],

  datacenters: [
    { region: "North America", invest: 218, growth: 48, renew: 56, new: 18 },
    { region: "China", invest: 94, growth: 38, renew: 42, new: 11 },
    { region: "European Union", invest: 72, growth: 34, renew: 84, new: 9 },
    { region: "Middle East", invest: 118, growth: 214, renew: 62, new: 14 },
    { region: "India", invest: 14, growth: 96, renew: 48, new: 6 },
    { region: "Rest of World", invest: 22, growth: 52, renew: 51, new: 5 },
  ],

  energy: {
    twhPath: [
      { y: "2022", twh: 170 },
      { y: "2023", twh: 240 },
      { y: "2024", twh: 380 },
      { y: "2025", twh: 610 },
      { y: "2026e", twh: 940 },
      { y: "2027e", twh: 1420 },
      { y: "2028e", twh: 2010 },
    ],
    pctGlobal: 4.1,
    waterGal: 4.8,
    frontierTrainHouseholds: 184,
    renewShare: { na: 56, cn: 42, eu: 84, me: 62, india: 48, row: 51 },
  },

  edge: {
    devices: 8.7,
    centralLoadCut: 42,
    bandwidthCut: 61,
    latencyCut: 78,
    apps: [
      { a: "Smartphones", d: "On-device assistants, photo, translation", adopt: 96 },
      { a: "Autonomous vehicles", d: "Real-time fusion, planning", adopt: 74 },
      { a: "Healthcare wearables", d: "Cardiac, glucose, stress monitoring", adopt: 58 },
      { a: "Smart homes", d: "Privacy-preserving automation", adopt: 48 },
      { a: "Industrial IoT", d: "Edge inference, predictive maint", adopt: 71 },
      { a: "AR / spatial", d: "Apple Vision, Meta Orion, WorldScan", adopt: 38 },
    ],
  },

  ipCases: [
    { n: "NYT v. OpenAI / Microsoft", status: "Settled (Feb 2026)", outcome: "Licensing framework + $480M", impact: "signal" },
    { n: "Authors Guild v. Anthropic / Meta", status: "Partial settlement", outcome: "Opt-out registry for books", impact: "amber" },
    { n: "Getty v. Stability AI", status: "Trial concluded", outcome: "Training infringement ruling pending", impact: "amber" },
    { n: "GitHub Copilot (class action)", status: "Dismissed in part", outcome: "Fair use favorable, attribution required", impact: "jade" },
    { n: "Thaler v. USPTO", status: "Precedent", outcome: "AI cannot be inventor (binding)", impact: "slate" },
    { n: "Studio Ghibli style cases (JP)", status: "Active", outcome: "Style-mimicry test pending", impact: "amber" },
  ],

  ipRegional: [
    { r: "United States", c: "Human authorship required", p: "AI cannot be inventor", t: "Robust trade-secret protection", best: "Document human involvement; maintain training data provenance" },
    { r: "European Union", c: "AI works lack 'originality'", p: "Human conception required", t: "Strong but GDPR-constrained", best: "TDM exceptions; disclose copyrighted training material" },
    { r: "China", c: "Some protection for AI-assisted", p: "More permissive on AI invention", t: "State security reviews", best: "Strategic patent filing; cross-border data compliance" },
    { r: "Japan / Korea", c: "ML-training exception", p: "Human inventorship", t: "Neighboring rights (KR draft)", best: "Leverage JP Article 30-4; prepare for KR reforms" },
  ],

  safetyRisks: [
    { r: "Jailbreaking", sev: "High", ev: "Rapidly evolving multi-step attacks", mit: 74 },
    { r: "Prompt injection", sev: "High", ev: "Critical in agent environments", mit: 61 },
    { r: "RAG poisoning", sev: "Medium", ev: "Knowledge-base integrity attacks", mit: 58 },
    { r: "Model extraction", sev: "High", ev: "API-based weight recovery attempts", mit: 52 },
    { r: "Dual-use / CBRN uplift", sev: "Critical", ev: "Frontier eval flag on 7% of models", mit: 81 },
    { r: "Synthetic media / deepfakes", sev: "High", ev: "Political + fraud deployments up 318%", mit: 44 },
    { r: "Autonomy misalignment", sev: "Emerging", ev: "Observed in 72hr+ agent runs", mit: 38 },
  ],

  safetyMitigations: [
    { s: "Secure curated datasets", eff: 88, n: "Consent-based, red-teamed, synthetic alternatives" },
    { s: "RLHF + Constitutional AI", eff: 82, n: "Industry standard · DPO, PPO, CAI" },
    { s: "LLM firewalls", eff: 74, n: "Llama Guard 3, Granite Guardian, PromptGuard" },
    { s: "Human-in-the-loop", eff: 69, n: "Escalation, review, real-time monitoring" },
    { s: "Continuous red-teaming", eff: 71, n: "AISI evals, internal + external" },
    { s: "Model watermarking", eff: 54, n: "SynthID, C2PA, provenance chain" },
  ],

  regulatoryTL: [
    { d: "Feb 2025", r: "EU", n: "AI Act core provisions effective", sev: "high" },
    { d: "Aug 2025", r: "EU", n: "GPAI Code of Practice finalized", sev: "high" },
    { d: "Jan 2026", r: "UK", n: "AI Safety Bill Royal Assent", sev: "med" },
    { d: "Feb 2026", r: "EU", n: "Full AI Act enforcement begins", sev: "high" },
    { d: "Feb 2026", r: "US", n: "NIST AI RMF 2.0 released", sev: "med" },
    { d: "Mar 2026", r: "US", n: "Export controls Round 4 (compute + HBM)", sev: "high" },
    { d: "Mar 2026", r: "CN", n: "Deep Synthesis Regulations v2", sev: "high" },
    { d: "Apr 2026", r: "India", n: "Digital India AI Mission 2.0 framework", sev: "med" },
    { d: "Q3 2026", r: "US", n: "State AI laws in 14+ jurisdictions", sev: "med" },
  ],

  regulatoryStance: [
    { r: "US", focus: "Innovation · Competition", risk: 28, inno: 92, sov: 45, eth: 50 },
    { r: "EU", focus: "Rights · Risk · Transparency", risk: 88, inno: 56, sov: 68, eth: 94 },
    { r: "China", focus: "Security · Content control", risk: 74, inno: 78, sov: 96, eth: 38 },
    { r: "UK", focus: "Pro-innovation · context-specific", risk: 58, inno: 82, sov: 52, eth: 72 },
    { r: "Japan", focus: "Voluntary · ethics codes", risk: 42, inno: 78, sov: 48, eth: 68 },
    { r: "India", focus: "DPI sovereignty", risk: 38, inno: 68, sov: 81, eth: 58 },
    { r: "UAE", focus: "Growth · strategic investment", risk: 22, inno: 84, sov: 74, eth: 48 },
  ],

  principles: [
    { p: "Human-Centricity", stat: "92%", d: "of successful deploys prioritize human needs at design" },
    { p: "Transparency", stat: "78%", d: "of consumers demand clear AI disclosure" },
    { p: "Privacy Preservation", stat: "86%", d: "cite GDPR / PIPL as primary compliance focus" },
    { p: "Security", stat: "74%", d: "YoY rise in AI-specific incidents" },
    { p: "Explainability", stat: "82%", d: "of regulated industries require interpretable decisions" },
  ],

  cxoActions: [
    "Appoint Chief AI Officer with P&L ownership",
    "Build proprietary data moats — small data wins",
    "Redesign workflows, don't just automate existing ones",
    "Enterprise-wide AI literacy, tiered by role",
    "Risk-tiered governance framework (NIST AI RMF 2.0 aligned)",
    "Modular AI architecture — portable across providers",
    "Value metrics beyond cost savings",
    "Strategic AI partnerships (labs + startups + academia)",
    "Responsible AI KPIs reported to the board",
    "Scenario-plan for agent incidents and model deprecations",
  ],

  policyActions: [
    "National AI governance coordination bodies",
    "Scale public R&D (compute, open models, safety)",
    "Modernize privacy law for synthetic / training data",
    "AI education at all levels; worker transition funds",
    "Algorithmic accountability: impact assessments, audits",
    "Sustainable AI: efficiency standards, green compute incentives",
    "International harmonization (OECD, G7, UN AI Advisory Body)",
    "SME + startup support — sandboxes, procurement preferences",
    "Critical infrastructure resilience against AI-enhanced attacks",
    "AI for public good — health, climate, education, equity",
  ],

  societalGood: [
    { d: "Healthcare", stat: "94%", t: "AlphaFold-4 · protein structure", imp: "Drug discovery accelerated 68%" },
    { d: "Climate", stat: "−32%", t: "Grid-optimization AI (DeepMind)", imp: "Energy savings across 142 countries" },
    { d: "Education", stat: "+31%", t: "Adaptive tutors (Khan Academy AI)", imp: "Achievement-gap closure +47%" },
    { d: "Inclusion", stat: "9mo", t: "Early disaster warning systems", imp: "UN OCHA deployed in 28 regions" },
  ],

  accelTable: [
    { cat: "Model Efficiency", m: "Smallest >60% MMLU", v22: "PaLM 540B", v26: "Helix-nano 1.3B", delta: "412× reduction" },
    { cat: "Inference Cost", m: "Per 1M tokens, GPT-3.5 class", v22: "$20.00", v26: "$0.011", delta: "1,818× cheaper" },
    { cat: "User Adoption", m: "Global AI users", v22: "200M", v26: "612M", delta: "+234M in 2025" },
    { cat: "Corporate AI", m: "% orgs using AI", v22: "55%", v26: "91%", delta: "+42pp" },
    { cat: "GenAI adoption", m: "% orgs using GenAI", v22: "33%", v26: "82%", delta: "+49pp" },
    { cat: "Training Time", m: "Frontier vision", v22: "Days", v26: "Minutes", delta: "Orders of magnitude" },
    { cat: "SWE-Bench", m: "Software tasks", v22: "5.0%", v26: "89.7%", delta: "+84.7pp" },
    { cat: "Agent Autonomy", m: "P50 unattended", v22: "minutes", v26: "48hr", delta: "~3 orders" },
    { cat: "Investment", m: "Global AI private", v22: "$28.6B", v26: "$244B", delta: "+753% in 3yr" },
  ],

  milestones: [
    { d: "Nov 2022", t: "ChatGPT", c: "LLM" },
    { d: "Mar 2023", t: "GPT-4", c: "LLM" },
    { d: "Jul 2023", t: "Llama 2 open", c: "Open" },
    { d: "Dec 2023", t: "Gemini", c: "LLM" },
    { d: "Feb 2024", t: "Sora", c: "Video" },
    { d: "May 2024", t: "GPT-4o · realtime voice", c: "Multi" },
    { d: "Jan 2025", t: "DeepSeek-R1", c: "Open" },
    { d: "Mar 2025", t: "Claude 3.7 Sonnet (computer use)", c: "Agent" },
    { d: "May 2025", t: "Google A2A protocol", c: "Agent" },
    { d: "Aug 2025", t: "GPT-5 · reasoning native", c: "LLM" },
    { d: "Nov 2025", t: "Claude 4 Opus · 72hr autonomy", c: "Agent" },
    { d: "Jan 2026", t: "Gemini 3 Ultra · 8hr video ctx", c: "Multi" },
    { d: "Feb 2026", t: "DeepSeek-R3 · matches frontier open", c: "Open" },
    { d: "Mar 2026", t: "AlphaProof-2 · IMO Gold", c: "Science" },
    { d: "Apr 2026", t: "Helix-nano · frontier at 1.3B", c: "Efficient" },
  ],
} as const;

export type Data1 = typeof DATA;
export type Data2 = typeof DATA2;
