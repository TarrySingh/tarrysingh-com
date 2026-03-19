"use client"

import { useState, useMemo, useCallback, useEffect, type ReactNode } from "react"

/* ═══════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════ */

const CONFIG = {
  BASKET_SIZE: 5,
  BASKET_PRICE: "$5",
  PRICE_PER_SIM: "$1",
  ROLE_SLUG: "consumer-lending-analyst",
}

/* ═══════════════════════════════════════════════════════════
   TOKEN MANAGEMENT (server-backed with localStorage fallback)
   ═══════════════════════════════════════════════════════════ */

function getTokenBalance(): number {
  try { return parseInt(localStorage.getItem("sim_tokens") || "0", 10) } catch { return 0 }
}
function setTokenBalance(n: number) {
  try { localStorage.setItem("sim_tokens", String(n)) } catch { /* noop */ }
}
function hasUsedFreeRun(roleSlug: string): boolean {
  try { return localStorage.getItem(`free_run_${roleSlug}`) === "1" } catch { return false }
}
function markFreeRunUsed(roleSlug: string) {
  try { localStorage.setItem(`free_run_${roleSlug}`, "1") } catch { /* noop */ }
}

/** Fetch token balance from server, fallback to localStorage */
async function fetchTokenBalance(): Promise<number> {
  try {
    const res = await fetch("/api/tokens")
    if (res.ok) {
      const data = await res.json()
      const balance = data.balance ?? 0
      setTokenBalance(balance) // sync localStorage
      return balance
    }
  } catch { /* server unavailable, fall through */ }
  return getTokenBalance()
}

/* ═══════════════════════════════════════════════════════════
   DATA & TYPES
   ═══════════════════════════════════════════════════════════ */

interface ScenarioConfig {
  label: string; icon: string; tagline: string;
  modifier: number; color: string; urgency: string; timeline: string; riskToRole: string;
}

interface RegionConfig {
  label: string; icon: string; searchHint: string; desc: string;
}

interface TaskDef {
  id: string; name: string; desc: string; aiScore: number;
  complexity: number; frequency: string; tools: string[]; subtasks: string[];
}

interface CategoryDef {
  id: string; name: string; icon: string; color: string; tasks: TaskDef[];
}

interface ComputedTask extends TaskDef {
  baseAiScore: number; category: string; categoryName: string; categoryColor: string;
}

interface ThemeColors {
  bg: string; bgCard: string; bgSurface: string; border: string; text: string;
  textSecondary: string; textMuted: string; textFaint: string; headerBg: string;
  gridLine: string; barBg: string; tagBg: string; tagText: string;
  inputBg: string; inputBorder: string; footerBg: string; methodBg: string; stroke: string;
}

interface DomainResult {
  realWorldScore: number; evidence: string; confidence: string; delta: number;
}

interface SimScoring {
  domains: Record<string, DomainResult>;
  overallInsight: string; topSignal: string; riskLevel: string;
}

interface SimResults {
  evidence?: string; scoring: SimScoring; fromCache?: boolean; cachedAt?: string;
}

const SCENARIO_CONFIGS: Record<string, ScenarioConfig> = {
  conservative: {
    label: "Conservative", icon: "\u{1F422}",
    tagline: "Slow adoption \u2014 employees have more runway to adapt",
    modifier: -18, color: "#00B4FF", urgency: "Low", timeline: "3\u20135 years", riskToRole: "Minimal near-term"
  },
  moderate: {
    label: "Moderate", icon: "\u26A1",
    tagline: "Peer-paced adoption \u2014 upskilling is essential now",
    modifier: 0, color: "#FFB800", urgency: "Medium", timeline: "1\u20132 years", riskToRole: "Moderate \u2014 roles evolving"
  },
  aggressive: {
    label: "Aggressive", icon: "\u{1F680}",
    tagline: "Fast-mover \u2014 upskill urgently or risk displacement",
    modifier: 15, color: "#FF6B6B", urgency: "Critical", timeline: "6\u201312 months", riskToRole: "High \u2014 displacement imminent"
  }
}

const REGION_CONFIGS: Record<string, RegionConfig> = {
  local: { label: "Lenders in My Region", icon: "\u{1F4CD}", searchHint: "Netherlands consumer lending ING ABN AMRO Rabobank personal loans", desc: "AI adoption trends among Dutch & Benelux consumer lenders" },
  europe: { label: "Lenders in Europe", icon: "\u{1F1EA}\u{1F1FA}", searchHint: "European consumer lending AI automation personal loans credit cards fintech", desc: "AI adoption across major European consumer lenders" },
  global: { label: "Lenders Worldwide", icon: "\u{1F30D}", searchHint: "global consumer lending AI automation Capital One JPMorgan fintech BNPL", desc: "Global consumer lending AI \u2014 US, UK, Asia leaders" }
}

const CATEGORIES: CategoryDef[] = [
  {
    id: "application_origination", name: "Application & Origination", icon: "\u25C6", color: "#00E5A0",
    tasks: [
      { id: "app_intake", name: "Application Intake & Triage", desc: "Receive consumer loan applications across channels (branch, web, mobile, partner). Categorize by product type (personal loan, auto, credit card, BNPL), assess completeness, and route to appropriate decisioning queue.", aiScore: 88, complexity: 3, frequency: "Daily", tools: ["LOS", "Salesforce", "Blend", "nCino"], subtasks: ["Channel intake", "Product classification", "Completeness check", "Queue routing", "Status notification"] },
      { id: "kyc_identity", name: "KYC & Identity Verification", desc: "Verify applicant identity through government ID validation, SSN/BSN checks, OFAC/sanctions screening, PEP checks, and biometric verification. Run fraud consortium checks via LexisNexis, Emailage, and device fingerprinting.", aiScore: 90, complexity: 4, frequency: "Daily", tools: ["LexisNexis", "Jumio", "Onfido", "OFAC", "Emailage"], subtasks: ["ID document verification", "SSN/BSN validation", "OFAC screening", "PEP check", "Device fingerprinting", "Fraud consortium query"] },
      { id: "income_employment", name: "Income & Employment Verification", desc: "Verify stated income and employment through payroll APIs (Plaid, Finicity), employer VOE, tax transcripts, and bank statement analysis. Handle gig economy, self-employed, and multiple income sources.", aiScore: 80, complexity: 6, frequency: "Daily", tools: ["Plaid", "Finicity", "The Work Number", "Argyle"], subtasks: ["Payroll API verification", "VOE processing", "Tax transcript analysis", "Bank statement income calc", "Gig income assessment", "Multi-source aggregation"] },
      { id: "doc_processing", name: "Document Processing & OCR", desc: "Extract and validate data from supporting documents: pay stubs, bank statements, tax returns, utility bills, vehicle titles. Apply intelligent OCR with confidence scoring and flag inconsistencies for manual review.", aiScore: 92, complexity: 3, frequency: "Daily", tools: ["Ocrolus", "Hyperscience", "Amazon Textract", "ABBYY"], subtasks: ["OCR extraction", "Data normalization", "Cross-document validation", "Confidence scoring", "Exception flagging"] },
      { id: "prequal_offers", name: "Pre-Qualification & Offer Generation", desc: "Run soft-pull credit checks to generate pre-qualified offers. Calculate maximum loan amounts, estimated rates, and term options based on preliminary credit profile, stated income, and product eligibility rules.", aiScore: 92, complexity: 3, frequency: "Daily", tools: ["Experian", "TransUnion", "LOS", "Pricing Engine"], subtasks: ["Soft pull execution", "Eligibility screening", "Rate/term estimation", "Offer letter generation", "Expiration tracking"] },
      { id: "dealer_partner", name: "Dealer & Partner Channel Management", desc: "Manage indirect lending channels: dealer/retailer onboarding, rate sheet distribution, application flow integration, dealer reserve negotiation, and partner performance monitoring for auto and point-of-sale lending.", aiScore: 55, complexity: 7, frequency: "Weekly", tools: ["RouteOne", "DealerTrack", "nCino", "Partner portals"], subtasks: ["Dealer onboarding", "Rate sheet management", "Application integration", "Reserve negotiation", "Partner scorecards", "Volume monitoring"] },
    ]
  },
  {
    id: "credit_scoring", name: "Credit Assessment & Scoring", icon: "\u25B2", color: "#00B4FF",
    tasks: [
      { id: "scorecard_dev", name: "Scorecard Development & Calibration", desc: "Develop, validate, and recalibrate credit scorecards for consumer products. Build logistic regression and ML-based models using bureau data, behavioral scores, and alternative data. Perform characteristic analysis, binning, and weight-of-evidence transformations.", aiScore: 58, complexity: 9, frequency: "Quarterly", tools: ["SAS", "Python", "R", "FICO Blaze", "Moody's RiskCalc"], subtasks: ["Data profiling", "WoE/IV analysis", "Model development", "Validation/backtesting", "Calibration", "Champion-challenger setup"] },
      { id: "credit_decisioning", name: "Automated Credit Decisioning", desc: "Configure and maintain rules-based and ML-driven credit decision engines. Define cut-off scores, policy rules, exception criteria, and auto-approval/decline thresholds across product lines.", aiScore: 82, complexity: 6, frequency: "Daily", tools: ["FICO DMS", "Experian PowerCurve", "Zest AI", "LOS"], subtasks: ["Decision engine configuration", "Cut-off optimization", "Policy rule maintenance", "Auto-approval tuning", "Override monitoring"] },
      { id: "affordability", name: "Affordability & DTI Assessment", desc: "Calculate debt-to-income ratios, net disposable income, and affordability buffers per product. Apply regulatory affordability rules (CFPB ATR, EBA affordability guidelines, UK Consumer Duty). Handle variable income and shared financial commitments.", aiScore: 78, complexity: 6, frequency: "Per Application", tools: ["LOS", "Income calculators", "Bureau data", "Open Banking"], subtasks: ["DTI computation", "NDI calculation", "Stress test buffers", "Joint applicant analysis", "Regulatory compliance check"] },
      { id: "bureau_analysis", name: "Bureau Report & Score Analysis", desc: "Analyze tri-bureau credit reports: evaluate payment history, utilization, derogatory marks, inquiries, and tradeline depth. Assess thin-file and no-hit applicants using alternative data sources and bureau-specific scores (VantageScore, FICO variants).", aiScore: 75, complexity: 6, frequency: "Per Application", tools: ["Experian", "Equifax", "TransUnion", "CreditXpert"], subtasks: ["Tri-bureau pull", "Derogatory analysis", "Utilization assessment", "Thin-file evaluation", "Score reconciliation", "Rapid rescore simulation"] },
      { id: "alt_data", name: "Alternative Data & Open Banking Scoring", desc: "Incorporate non-traditional data sources for credit assessment: bank transaction analysis (categorization, cash flow), utility/telecom payment history, rental data, and social/digital footprint signals for thin-file populations.", aiScore: 68, complexity: 7, frequency: "Per Application", tools: ["Plaid", "Tink", "Nova Credit", "CreditLadder", "Experian Boost"], subtasks: ["Transaction categorization", "Cash flow scoring", "Utility data integration", "Rental history check", "Alternative score blending"] },
      { id: "fraud_detection", name: "Application Fraud Detection", desc: "Screen applications for first-party fraud (synthetic identity, income inflation, bust-out) and third-party fraud (identity theft, account takeover). Apply ML fraud models, device intelligence, and behavioral biometrics.", aiScore: 72, complexity: 8, frequency: "Per Application", tools: ["Featurespace", "LexisNexis", "BioCatch", "Socure", "Emailage"], subtasks: ["Synthetic ID detection", "Income verification cross-check", "Device risk scoring", "Behavioral biometrics", "Fraud network analysis", "SAR determination"] },
    ]
  },
  {
    id: "product_portfolio", name: "Product & Portfolio Management", icon: "\u25CF", color: "#FF6B6B",
    tasks: [
      { id: "personal_loan", name: "Personal Loan Product Management", desc: "Manage unsecured personal loan products: term structures (12-84 months), rate tiers, origination fees, credit limit assignment, and competitive positioning. Monitor portfolio performance by vintage, channel, and risk tier.", aiScore: 52, complexity: 7, frequency: "Monthly", tools: ["nCino", "Salesforce", "Tableau", "Excel"], subtasks: ["Product design", "Rate tier structuring", "Limit assignment rules", "Performance monitoring", "Competitive benchmarking"] },
      { id: "auto_lending", name: "Auto Lending & Vehicle Valuation", desc: "Manage auto loan products: new/used/refinance programs, LTV limits by vehicle age, dealer reserve structures, GAP insurance, and vehicle valuation using NADA/KBB/Black Book. Handle fleet, RV, and specialty vehicle lending.", aiScore: 65, complexity: 7, frequency: "Daily", tools: ["DealerTrack", "RouteOne", "NADA", "Black Book", "KBB"], subtasks: ["Vehicle valuation", "LTV calculation", "Dealer program management", "GAP product integration", "Title lien processing", "Specialty vehicle assessment"] },
      { id: "credit_card", name: "Credit Card Portfolio & Line Management", desc: "Manage revolving credit products: initial credit line assignment, periodic line reviews (CLI/CLD), balance transfer programs, rewards optimization, and interchange analysis. Implement proactive line management using behavioral scores.", aiScore: 72, complexity: 8, frequency: "Monthly", tools: ["TSYS/Fiserv", "FICO Triad", "SAS", "Marqeta"], subtasks: ["Initial line assignment", "Proactive CLI/CLD", "Behavioral score monitoring", "Balance transfer targeting", "Rewards program analysis", "Interchange optimization"] },
      { id: "bnpl_pos", name: "BNPL & Point-of-Sale Lending", desc: "Manage buy-now-pay-later and embedded lending products: merchant integration, instant decisioning, split-pay structures, late fee policies, and regulatory compliance with emerging BNPL regulations (CFPB, EU CCD2).", aiScore: 78, complexity: 6, frequency: "Daily", tools: ["Custom APIs", "Stripe", "Adyen", "Partner portals"], subtasks: ["Merchant onboarding", "Instant decisioning", "Split-pay configuration", "Late fee management", "BNPL regulatory compliance", "Merchant performance tracking"] },
      { id: "pricing_strategy", name: "Risk-Based Pricing & Optimization", desc: "Develop and maintain risk-based pricing models: rate-for-risk grids, competitive rate positioning, price elasticity analysis, margin optimization, and LLPA/adjustment factor calibration across consumer products.", aiScore: 60, complexity: 8, frequency: "Monthly", tools: ["SAS", "Python", "Nomis", "Pricing engines", "Tableau"], subtasks: ["Price elasticity modeling", "Rate grid construction", "Margin analysis", "Competitive intelligence", "A/B price testing", "Regulatory review"] },
      { id: "limit_mgmt", name: "Credit Limit Strategy & Reviews", desc: "Design and execute credit limit management strategies: initial limit assignment algorithms, periodic account reviews, proactive limit increases, limit decreases for deteriorating accounts, and high-balance alert monitoring.", aiScore: 75, complexity: 6, frequency: "Monthly", tools: ["FICO Triad", "SAS", "Decision engines", "Bureau triggers"], subtasks: ["Limit assignment models", "Periodic review execution", "Proactive increase targeting", "Decrease triggers", "Utilization monitoring"] },
    ]
  },
  {
    id: "risk_collections", name: "Risk & Collections", icon: "\u25C7", color: "#FFB800",
    tasks: [
      { id: "early_warning", name: "Early Warning & Delinquency Prediction", desc: "Build and monitor early warning systems for consumer loan deterioration: behavioral score triggers, payment pattern analysis, external event monitoring (job loss, economic downturn), and proactive intervention targeting.", aiScore: 78, complexity: 7, frequency: "Daily", tools: ["FICO Falcon", "SAS", "Bureau triggers", "Internal scoring"], subtasks: ["Behavioral score monitoring", "Payment pattern analysis", "Bureau trigger processing", "Economic indicator monitoring", "Intervention prioritization"] },
      { id: "collections_strategy", name: "Collections Strategy & Segmentation", desc: "Design collections treatment strategies by delinquency bucket, balance tier, probability of cure, and contact channel preference. Optimize dialer campaigns, letter sequences, digital collection nudges, and agent allocation.", aiScore: 70, complexity: 7, frequency: "Weekly", tools: ["FICO Debt Manager", "Experian Collect", "LiveVox", "Genesys"], subtasks: ["Bucket segmentation", "Treatment assignment", "Champion-challenger testing", "Contact optimization", "Agent queue management", "Digital nudge design"] },
      { id: "hardship_programs", name: "Hardship & Forbearance Programs", desc: "Administer financial hardship programs: evaluate eligibility, offer payment deferrals, rate reductions, or term extensions. Coordinate with disaster relief programs (FEMA, COVID-era programs) and ensure CFPB/SCRA compliance.", aiScore: 48, complexity: 8, frequency: "Daily", tools: ["LOS", "Servicing platforms", "SCRA tools", "FEMA"], subtasks: ["Hardship assessment", "Program eligibility", "Payment modification", "SCRA compliance", "Disaster relief coordination", "Documentation management"] },
      { id: "recovery_workout", name: "Recovery & Charge-Off Workout", desc: "Manage post-charge-off recovery: evaluate settlement offers, coordinate with external collection agencies, manage debt sale portfolios, handle bankruptcy claims, and ensure fair debt collection practices (FDCPA, Reg F).", aiScore: 55, complexity: 8, frequency: "Monthly", tools: ["Debt Manager", "Recovery platforms", "Debt sale portals"], subtasks: ["Settlement evaluation", "Agency placement", "Debt sale analysis", "Bankruptcy claims", "FDCPA compliance", "Recovery performance tracking"] },
      { id: "provision_ecl", name: "Provisioning & ECL Modeling", desc: "Calculate expected credit losses under IFRS 9/CECL frameworks for consumer portfolios. Develop PD/LGD/EAD models at segment level, perform staging classification (Stage 1/2/3), and produce forward-looking macroeconomic scenarios.", aiScore: 58, complexity: 9, frequency: "Quarterly", tools: ["SAS", "Moody's", "Python", "IFRS 9 engines"], subtasks: ["PD model estimation", "LGD calibration", "EAD computation", "Stage classification", "Macro scenario overlay", "Reserve calculation"] },
    ]
  },
  {
    id: "compliance_regulatory", name: "Compliance & Regulatory", icon: "\u2B21", color: "#A855F7",
    tasks: [
      { id: "fair_lending", name: "Fair Lending & Disparate Impact Testing", desc: "Conduct fair lending analyses: monitor approval/pricing rates across protected classes (race, gender, age), perform regression-based disparate impact testing, review HMDA/CRA data, and ensure compliance with ECOA and Fair Housing Act.", aiScore: 62, complexity: 9, frequency: "Quarterly", tools: ["ComplianceEase", "SAS", "Palantir", "HMDA tools"], subtasks: ["Disparate impact regression", "Rate disparity analysis", "HMDA reporting", "CRA monitoring", "Remediation planning", "Examiner response preparation"] },
      { id: "tila_tca", name: "TILA / Consumer Credit Disclosure", desc: "Ensure compliance with Truth in Lending Act (Reg Z), Consumer Credit Directive (EU CCD/CCD2), and local consumer credit laws. Validate APR calculations, fee disclosures, right-of-withdrawal, and advertising compliance.", aiScore: 82, complexity: 5, frequency: "Per Application", tools: ["ComplianceEase", "Wolters Kluwer", "LOS"], subtasks: ["APR calculation validation", "Fee disclosure review", "Advertising compliance", "Right-of-withdrawal tracking", "State/local law compliance"] },
      { id: "aml_consumer", name: "AML & Suspicious Activity Monitoring", desc: "Monitor consumer lending activities for money laundering indicators: unusual payment patterns, rapid paydown schemes, structuring below reporting thresholds, and synthetic identity patterns. File SARs and maintain BSA/AML compliance.", aiScore: 75, complexity: 6, frequency: "Daily", tools: ["NICE Actimize", "SAS AML", "LexisNexis", "FinCEN"], subtasks: ["Transaction monitoring", "Pattern detection", "SAR filing", "CTR processing", "Enhanced due diligence", "Sanctions re-screening"] },
      { id: "complaint_mgmt", name: "Complaint Management & Resolution", desc: "Handle consumer complaints across channels: CFPB portal, BBB, state AG offices, direct complaints. Categorize, investigate, resolve, and track regulatory response timelines. Identify systemic complaint trends for process improvement.", aiScore: 55, complexity: 7, frequency: "Daily", tools: ["Salesforce", "CFPB portal", "Medallia", "Case management"], subtasks: ["Complaint categorization", "Investigation workflow", "Root cause analysis", "Regulatory response", "Trend identification", "Remediation tracking"] },
      { id: "model_governance", name: "Model Risk Management & Governance", desc: "Ensure consumer credit models comply with SR 11-7 / SS1/23 model risk management standards. Maintain model inventory, coordinate independent validation, track findings, and manage model change governance for scorecards and decision engines.", aiScore: 38, complexity: 9, frequency: "Quarterly", tools: ["Model inventories", "SAS", "Internal governance tools"], subtasks: ["Model inventory maintenance", "Validation coordination", "Finding remediation", "Annual review scheduling", "Regulatory submission support", "Documentation standards"] },
    ]
  },
  {
    id: "analytics_strategy", name: "Analytics & Strategy", icon: "\u2605", color: "#FF69B4",
    tasks: [
      { id: "portfolio_analytics", name: "Portfolio Performance Analytics", desc: "Monitor and report on consumer loan portfolio KPIs: origination volumes, approval rates, vintage delinquency curves, loss rates, yield analysis, and risk-adjusted returns by product, channel, segment, and geography.", aiScore: 78, complexity: 6, frequency: "Monthly", tools: ["Tableau", "Power BI", "SAS", "Python", "Snowflake"], subtasks: ["KPI dashboard maintenance", "Vintage curve analysis", "Loss rate trending", "Yield computation", "Segment reporting", "Executive summary production"] },
      { id: "customer_segmentation", name: "Customer Segmentation & Targeting", desc: "Develop and maintain customer segmentation models for marketing, cross-sell, and risk management. Use clustering, propensity models, and lifetime value estimation to identify acquisition targets, retention risks, and upsell opportunities.", aiScore: 72, complexity: 7, frequency: "Monthly", tools: ["SAS", "Python", "Salesforce Marketing", "Adobe Analytics"], subtasks: ["Cluster analysis", "Propensity modeling", "LTV estimation", "Cross-sell targeting", "Retention risk flagging", "Campaign response modeling"] },
      { id: "market_competitive", name: "Market & Competitive Intelligence", desc: "Track consumer lending market trends: competitor rate movements, new product launches, fintech disruption, regulatory changes, and macroeconomic indicators affecting consumer credit demand and performance.", aiScore: 65, complexity: 6, frequency: "Weekly", tools: ["S&P Global", "Bankrate", "Mintel", "CB Insights", "FRED"], subtasks: ["Rate benchmarking", "Competitor product analysis", "Fintech monitoring", "Macro indicator tracking", "Regulatory horizon scanning"] },
      { id: "ab_testing", name: "A/B Testing & Experimentation", desc: "Design and execute controlled experiments for credit policy, pricing, marketing, and collections strategies. Apply statistical rigor to champion-challenger tests, interpret results, and recommend production deployment decisions.", aiScore: 62, complexity: 7, frequency: "Monthly", tools: ["Python", "R", "Optimizely", "Internal tools"], subtasks: ["Experiment design", "Sample sizing", "Statistical analysis", "Business impact estimation", "Rollout recommendation", "Documentation"] },
      { id: "campaign_analytics", name: "Marketing Campaign & Conversion Analytics", desc: "Analyze pre-approved offer campaigns, digital acquisition funnels, and partner channel performance. Measure conversion rates, cost per acquisition, channel attribution, and optimize campaign targeting and messaging.", aiScore: 75, complexity: 5, frequency: "Weekly", tools: ["Google Analytics", "Salesforce Marketing", "Adobe", "Tableau"], subtasks: ["Campaign performance tracking", "Conversion funnel analysis", "CPA optimization", "Channel attribution", "A/B creative testing", "ROI reporting"] },
    ]
  }
]

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

function getLevel(s: number) {
  if (s >= 85) return { label: "Full Automation", short: "FULL AUTO", desc: "End-to-end AI execution with minimal human oversight", color: "#00E5A0" }
  if (s >= 70) return { label: "High Automation", short: "HIGH AUTO", desc: "AI performs most work; human reviews outputs", color: "#00B4FF" }
  if (s >= 55) return { label: "Augmented", short: "AUGMENTED", desc: "AI assists significantly; human drives key decisions", color: "#FFB800" }
  if (s >= 40) return { label: "AI-Assisted", short: "ASSISTED", desc: "AI handles repetitive elements; human leads", color: "#FF8C42" }
  return { label: "Human-Led", short: "HUMAN-LED", desc: "Requires human judgment, creativity, relationships", color: "#FF6B6B" }
}

function useTheme(isDark: boolean): ThemeColors {
  return isDark ? {
    bg: "#0A0E17", bgCard: "rgba(255,255,255,0.02)", bgSurface: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.06)", text: "#E8E8E8", textSecondary: "rgba(255,255,255,0.5)",
    textMuted: "rgba(255,255,255,0.35)", textFaint: "rgba(255,255,255,0.15)",
    headerBg: "linear-gradient(180deg, rgba(0,229,160,0.03) 0%, transparent 100%)",
    gridLine: "rgba(255,255,255,0.06)", barBg: "rgba(255,255,255,0.06)", tagBg: "rgba(255,255,255,0.05)",
    tagText: "rgba(255,255,255,0.5)", inputBg: "rgba(255,255,255,0.03)", inputBorder: "rgba(255,255,255,0.08)",
    footerBg: "rgba(255,255,255,0.02)", methodBg: "rgba(255,255,255,0.015)", stroke: "#0A0E17"
  } : {
    bg: "#F0F1F3", bgCard: "#FFFFFF", bgSurface: "#F7F8FA",
    border: "rgba(0,0,0,0.12)", text: "#1A1D26", textSecondary: "#4A5068",
    textMuted: "#6B7280", textFaint: "#9CA3AF",
    headerBg: "linear-gradient(180deg, rgba(26,31,44,0.04) 0%, transparent 100%)",
    gridLine: "rgba(0,0,0,0.10)", barBg: "rgba(0,0,0,0.08)", tagBg: "rgba(0,0,0,0.06)",
    tagText: "#4A5068", inputBg: "#FFFFFF", inputBorder: "rgba(0,0,0,0.15)",
    footerBg: "#E8E9EC", methodBg: "#F7F8FA", stroke: "#FFFFFF"
  }
}

/* ─── SIMULATION ENGINE (Demo Mode) ─── */

const SIM_PHASES = [
  { key: "search", label: "Searching real-world signals", icon: "\u{1F50D}" },
  { key: "collect", label: "Collecting consumer lending AI evidence", icon: "\u{1F4E1}" },
  { key: "score", label: "LLM-as-judge scoring domains", icon: "\u{1F9E0}" },
  { key: "done", label: "Simulation complete", icon: "\u2705" },
]

function getDemoResults(): SimResults {
  return {
    evidence: "Demo mode: In production, this performs live web search via Anthropic API to find real-world AI adoption evidence at peer consumer lenders.",
    scoring: {
      domains: {
        application_origination: { realWorldScore: 85, evidence: "Digital-first lenders (Capital One, Marcus, SoFi) have near-full automation of application intake and document processing.", confidence: "high", delta: 7 },
        credit_scoring: { realWorldScore: 72, evidence: "ML scorecards and alternative data scoring gaining traction; traditional lenders still rely on bureau-centric models.", confidence: "medium", delta: 4 },
        product_portfolio: { realWorldScore: 58, evidence: "Product management remains strategic; AI assists with pricing optimization and limit strategies.", confidence: "medium", delta: 2 },
        risk_collections: { realWorldScore: 65, evidence: "AI-driven collections segmentation and early warning systems becoming standard at tier-1 banks.", confidence: "high", delta: 5 },
        compliance_regulatory: { realWorldScore: 48, evidence: "Fair lending analysis increasingly AI-assisted but human oversight remains mandatory per CFPB/OCC guidance.", confidence: "high", delta: -3 },
        analytics_strategy: { realWorldScore: 75, evidence: "Advanced analytics and A/B testing widely adopted for campaign optimization and portfolio management.", confidence: "medium", delta: 6 },
      },
      overallInsight: "Consumer lending is among the most AI-ready banking verticals. Application processing and scoring are highly automated at digital-first lenders, while compliance and strategic product decisions remain firmly human-led. The gap between fintech leaders and traditional banks is widening.",
      topSignal: "Capital One, SoFi, and Klarna investing heavily in real-time ML decisioning and alternative data scoring for consumer products.",
      riskLevel: "moderate"
    },
    fromCache: true,
    cachedAt: new Date().toISOString(),
  }
}

/* ─── SIMULATION PANEL ─── */

function SimulationPanel({ t, scenario, onSimResults }: { t: ThemeColors; scenario: string; onSimResults: (r: SimScoring | null) => void }) {
  const [region, setRegion] = useState("europe")
  const [phase, setPhase] = useState<string | null>(null)
  const [results, setResults] = useState<SimResults | null>(null)
  const [error] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [tokens, setTokens] = useState(0)
  const [freeUsed, setFreeUsed] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)

  useEffect(() => {
    fetchTokenBalance().then(b => setTokens(b))
    setFreeUsed(hasUsedFreeRun(CONFIG.ROLE_SLUG))
    const params = new URLSearchParams(window.location.search)
    if (params.get("purchase") === "success") {
      setTimeout(() => fetchTokenBalance().then(b => setTokens(b)), 1000)
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const runFree = useCallback(() => {
    const demo = getDemoResults()
    setResults(demo)
    setPhase("done")
    onSimResults(demo.scoring)
    markFreeRunUsed(CONFIG.ROLE_SLUG)
    setFreeUsed(true)
  }, [onSimResults])

  const runLive = useCallback(async () => {
    if (tokens <= 0) { setShowBuyModal(true); return }

    setResults(null)
    setPhase("search")

    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleSlug: CONFIG.ROLE_SLUG,
          scenario,
          region,
          categories: CATEGORIES.map(c => ({
            id: c.id,
            name: c.name,
            tasks: c.tasks.map(t => ({ id: t.id, name: t.name, aiScore: t.aiScore })),
          })),
        }),
      })

      if (res.status === 402) {
        setShowBuyModal(true)
        setPhase(null)
        return
      }

      setPhase("collect")

      if (!res.ok) throw new Error(`API error: ${res.status}`)

      const data = await res.json()
      setPhase("score")
      await new Promise(r => setTimeout(r, 500))

      setResults(data)
      setPhase("done")
      onSimResults(data.scoring)

      fetchTokenBalance().then(b => setTokens(b))
    } catch (err) {
      console.error("[simulation] Error:", err)
      const demo = getDemoResults()
      demo.fromCache = false
      demo.evidence = "Live API unavailable \u2014 showing demo results. " + (demo.evidence || "")
      setResults(demo)
      setPhase("done")
      onSimResults(demo.scoring)
      const newBal = Math.max(0, tokens - 1)
      setTokens(newBal)
      setTokenBalance(newBal)
    }
  }, [scenario, region, onSimResults, tokens])

  const resetSim = () => {
    setPhase(null)
    setResults(null)
    onSimResults(null)
  }

  const handleBuyBasket = async () => {
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
    } catch {
      // Stripe unavailable — fall through to demo mode
    }
    const newBal = tokens + CONFIG.BASKET_SIZE
    setTokens(newBal)
    setTokenBalance(newBal)
    setShowBuyModal(false)
  }

  const sc = SCENARIO_CONFIGS[scenario]
  const isRunning = phase !== null && phase !== "done"
  const riskColors: Record<string, string> = { low: "#00E5A0", moderate: "#FFB800", high: "#FF8C42", critical: "#FF6B6B" }
  const canRunFree = !freeUsed
  const canRunLive = tokens > 0

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: 16, marginBottom: 28, overflow: "hidden", background: t.bgCard }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", background: "none", border: "none", cursor: "pointer", color: t.text
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{"\u{1F310}"}</span>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}>REAL WORLD SIMULATION</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#A855F720", color: "#A855F7", fontWeight: 700 }}>LIVE AI</span>
          {results && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#00E5A020", color: "#00E5A0", fontWeight: 600 }}>RESULTS READY</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 10, padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontFamily: "'DM Mono', monospace",
            background: tokens > 0 ? "#00E5A015" : "#FF6B6B10",
            color: tokens > 0 ? "#00E5A0" : "#FF6B6B",
            border: `1px solid ${tokens > 0 ? "#00E5A025" : "#FF6B6B20"}`
          }}>
            {"\u26A1"} {tokens} run{tokens !== 1 ? "s" : ""} left
          </span>
          <span style={{ fontSize: 16, transition: "transform 0.3s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", color: t.textMuted }}>{"\u25BE"}</span>
        </div>
      </button>

      {isOpen && (
        <div style={{ padding: "0 20px 24px" }}>
          <div style={{ fontSize: 12.5, color: t.textSecondary, lineHeight: 1.6, marginBottom: 18, padding: "12px 16px", background: t.bgSurface, borderRadius: 10 }}>
            <strong style={{ color: t.text }}>Realtime LLM Scoring:</strong> This simulation searches the live web for real-world evidence of AI adoption in consumer lending at peer banks and fintechs, then uses Claude as an LLM-as-judge to re-score each domain based on actual market signals.
          </div>

          <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>SELECT PEER GROUP</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            {Object.entries(REGION_CONFIGS).map(([key, cfg]) => {
              const active = region === key
              return (
                <button key={key} onClick={() => { if (!isRunning) setRegion(key) }} style={{
                  flex: "1 1 0", minWidth: 160, padding: "12px 16px", borderRadius: 10, cursor: isRunning ? "not-allowed" : "pointer",
                  background: active ? "#A855F712" : t.bgSurface,
                  border: `1.5px solid ${active ? "#A855F780" : t.border}`,
                  textAlign: "left" as const, color: t.text, opacity: isRunning && !active ? 0.5 : 1, transition: "all 0.2s"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 15 }}>{cfg.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? "#A855F7" : t.text }}>{cfg.label}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: t.textMuted }}>{cfg.desc}</div>
                </button>
              )
            })}
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
            {phase !== "done" ? (
              <>
                {canRunFree && (
                  <button onClick={runFree} style={{
                    padding: "12px 24px", borderRadius: 10, cursor: "pointer",
                    background: "linear-gradient(135deg, #00E5A0, #00B87A)",
                    border: "none", color: "#FFF", fontSize: 13, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 8
                  }}>
                    <span style={{ fontSize: 14 }}>{"\u{1F381}"}</span> Run Free (Demo Results)
                  </button>
                )}

                {!isRunning ? (
                  <button onClick={canRunLive ? runLive : () => setShowBuyModal(true)} style={{
                    padding: "12px 24px", borderRadius: 10, cursor: "pointer",
                    background: canRunLive ? "linear-gradient(135deg, #A855F7, #7C3AED)" : "linear-gradient(135deg, #FFB800, #FF8C42)",
                    border: "none", color: "#FFF", fontSize: 13, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 8
                  }}>
                    {canRunLive ? (
                      <><span style={{ fontSize: 14 }}>{"\u25B6"}</span> Live Run <span style={{ fontSize: 10, opacity: 0.8 }}>(-1 token)</span></>
                    ) : (
                      <><span style={{ fontSize: 14 }}>{"\u{1F512}"}</span> Buy Tokens to Run Live</>
                    )}
                  </button>
                ) : (
                  <button disabled style={{
                    padding: "12px 24px", borderRadius: 10, cursor: "wait",
                    background: "#A855F730", border: "none", color: "#FFF", fontSize: 13, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 8, opacity: 0.8
                  }}>
                    <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 14 }}>{"\u27F3"}</span> Running...
                  </button>
                )}
              </>
            ) : (
              <button onClick={resetSim} style={{
                padding: "12px 24px", borderRadius: 10, cursor: "pointer",
                background: t.bgSurface, border: `1px solid ${t.border}`,
                color: t.textSecondary, fontSize: 13, fontWeight: 600
              }}>
                {"\u21BB"} Reset & Re-run
              </button>
            )}

            <span style={{ fontSize: 11, color: t.textMuted }}>
              {sc.icon} {sc.label} {"\u00B7"} {REGION_CONFIGS[region].icon} {REGION_CONFIGS[region].label}
            </span>
          </div>

          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

          {/* Token Balance */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
            borderRadius: 12, marginBottom: 20,
            background: t.bgSurface, border: `1px solid ${t.border}`
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em", marginBottom: 4 }}>YOUR SIMULATION BALANCE</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: tokens > 0 ? "#00E5A0" : "#FF6B6B", fontFamily: "'DM Mono', monospace" }}>{tokens}</span>
                <span style={{ fontSize: 12, color: t.textMuted }}>live run{tokens !== 1 ? "s" : ""} remaining</span>
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                {Array.from({ length: Math.max(CONFIG.BASKET_SIZE, tokens) }, (_, i) => (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: i < tokens ? "#00E5A0" : t.barBg,
                    border: `1px solid ${i < tokens ? "#00E5A040" : t.border}`,
                    boxShadow: i < tokens ? "0 0 6px #00E5A040" : "none",
                    transition: "all 0.3s"
                  }} />
                ))}
              </div>
            </div>
            <button onClick={() => setShowBuyModal(true)} style={{
              padding: "10px 20px", borderRadius: 10, cursor: "pointer",
              background: "linear-gradient(135deg, #FFB800, #FF8C42)",
              border: "none", color: "#FFF", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap"
            }}>
              <span>{"\u26A1"}</span> Buy {CONFIG.BASKET_SIZE} Runs {"\u00B7"} {CONFIG.BASKET_PRICE}
            </button>
          </div>

          {/* Buy Modal */}
          {showBuyModal && (
            <div style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 9999, backdropFilter: "blur(8px)"
            }} onClick={() => setShowBuyModal(false)}>
              <div onClick={e => e.stopPropagation()} style={{
                background: t.bg, borderRadius: 20, padding: 36, maxWidth: 420, width: "90%",
                border: `1px solid ${t.border}`, position: "relative"
              }}>
                <button onClick={() => setShowBuyModal(false)} style={{
                  position: "absolute", top: 14, right: 14, background: t.barBg, border: "none",
                  color: t.textMuted, fontSize: 16, cursor: "pointer", borderRadius: 8, width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>{"\u00D7"}</button>
                <div style={{ textAlign: "center" as const, marginBottom: 24 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{"\u26A1"}</div>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: t.text }}>Simulation Token Basket</h3>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: t.textSecondary }}>
                    Power your live AI simulations with real-time web search & LLM scoring
                  </p>
                </div>
                <div style={{
                  background: t.bgSurface, borderRadius: 14, padding: 20, marginBottom: 20,
                  border: "1px solid #FFB80030"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{CONFIG.BASKET_SIZE} Live Simulations</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "#FFB800", fontFamily: "'DM Mono', monospace" }}>{CONFIG.BASKET_PRICE}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: t.textSecondary, lineHeight: 1.6 }}>
                    Each simulation performs 2 live AI API calls with real-time web search to score your role against peer consumer lenders. That{"'"}s just {CONFIG.PRICE_PER_SIM} per simulation.
                  </div>
                </div>
                <button onClick={handleBuyBasket} style={{
                  width: "100%", padding: "14px 24px", borderRadius: 12, cursor: "pointer",
                  background: "linear-gradient(135deg, #FFB800, #FF8C42)",
                  border: "none", color: "#FFF", fontSize: 15, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}>
                  <span>{"\u{1F4B3}"}</span> Buy Now {"\u00B7"} {CONFIG.BASKET_PRICE}
                </button>
                <div style={{ textAlign: "center" as const, marginTop: 10, fontSize: 10, color: t.textMuted }}>
                  One-time payment {"\u00B7"} No subscription {"\u00B7"} Secured by Stripe
                </div>
                <div style={{ textAlign: "center" as const, marginTop: 6, fontSize: 9, color: t.textFaint }}>
                  Tokens are tied to this browser session
                </div>
              </div>
            </div>
          )}

          {/* Phase Tracker */}
          {phase && (
            <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
              {SIM_PHASES.map((p, i) => {
                const phaseIdx = SIM_PHASES.findIndex(x => x.key === phase)
                const isComplete = i < phaseIdx || phase === "done"
                const isCurrent = i === phaseIdx && phase !== "done"
                return (
                  <div key={p.key} style={{
                    flex: 1, padding: "10px 12px", borderRadius: 8,
                    background: isComplete ? "#00E5A010" : isCurrent ? "#A855F710" : t.bgSurface,
                    border: `1px solid ${isComplete ? "#00E5A030" : isCurrent ? "#A855F740" : t.border}`,
                    transition: "all 0.4s"
                  }}>
                    <div style={{ fontSize: 13, marginBottom: 3 }}>{p.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: isComplete ? "#00E5A0" : isCurrent ? "#A855F7" : t.textMuted }}>{p.label}</div>
                  </div>
                )
              })}
            </div>
          )}

          {error && <div style={{ padding: 16, borderRadius: 10, background: "#FF6B6B12", border: "1px solid #FF6B6B30", color: "#FF6B6B", fontSize: 12, marginBottom: 16 }}>{error}</div>}

          {/* Results */}
          {results && phase === "done" && (
            <div>
              <div style={{ padding: 18, borderRadius: 12, background: `${riskColors[results.scoring?.riskLevel] || "#FFB800"}08`, border: `1px solid ${riskColors[results.scoring?.riskLevel] || "#FFB800"}25`, marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: riskColors[results.scoring?.riskLevel] || "#FFB800" }}>
                    REAL-WORLD RISK LEVEL: {(results.scoring?.riskLevel || "moderate").toUpperCase()}
                  </span>
                  {results.fromCache && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: "#FFB80015", color: "#FFB800" }}>DEMO</span>}
                </div>
                <div style={{ fontSize: 13, color: t.text, lineHeight: 1.6, marginBottom: 10 }}>{results.scoring?.overallInsight}</div>
                <div style={{ fontSize: 11.5, color: t.textSecondary }}>
                  <strong style={{ color: "#A855F7" }}>Top Signal:</strong> {results.scoring?.topSignal}
                </div>
              </div>

              <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>DOMAIN-LEVEL REAL-WORLD SCORING</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {CATEGORIES.map(cat => {
                  const dr = results.scoring?.domains?.[cat.id]
                  if (!dr) return null
                  const delta = dr.delta || 0
                  const confColor: Record<string, string> = { low: "#FF6B6B", medium: "#FFB800", high: "#00E5A0" }
                  const baseAvg = Math.round(cat.tasks.reduce((a, tk) => a + tk.aiScore, 0) / cat.tasks.length)
                  return (
                    <div key={cat.id} style={{ padding: 16, borderRadius: 12, background: t.bgSurface, border: `1px solid ${cat.color}20`, position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: cat.color }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 14, color: cat.color }}>{cat.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{cat.name}</span>
                        <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: (confColor[dr.confidence] || "#FFB800") + "15", color: confColor[dr.confidence] || "#FFB800", fontWeight: 700 }}>{(dr.confidence || "medium").toUpperCase()}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 9, color: t.textMuted, marginBottom: 3 }}>BASELINE</div>
                          <div style={{ height: 6, borderRadius: 3, background: t.barBg, overflow: "hidden" }}>
                            <div style={{ width: `${baseAvg}%`, height: "100%", borderRadius: 3, background: cat.color, opacity: 0.4 }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>{baseAvg}%</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 9, color: cat.color, marginBottom: 3 }}>REAL-WORLD</div>
                          <div style={{ height: 6, borderRadius: 3, background: t.barBg, overflow: "hidden" }}>
                            <div style={{ width: `${dr.realWorldScore}%`, height: "100%", borderRadius: 3, background: cat.color }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: cat.color, fontFamily: "'DM Mono', monospace" }}>{dr.realWorldScore}%</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: delta > 0 ? "#00E5A0" : delta < 0 ? "#FF6B6B" : t.textMuted }}>
                          {delta > 0 ? "\u25B2" : delta < 0 ? "\u25BC" : "\u2501"} {delta > 0 ? "+" : ""}{delta}% adjustment
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: t.textSecondary, lineHeight: 1.5 }}>{dr.evidence}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── REUSABLE UI COMPONENTS ─── */

function RadarPolygon({ data, color, opacity, radius, cx, cy, sides }: { data: number[]; color: string; opacity: number; radius: number; cx: number; cy: number; sides: number }) {
  const points = data.map((val, i) => {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
    const r = (val / 100) * radius
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(" ")
  return <polygon points={points} fill={color} fillOpacity={opacity} stroke={color} strokeWidth="2" strokeOpacity={0.9} />
}

function CategoryRadar({ category, tasks, isSelected, onClick, t, simDelta }: {
  category: CategoryDef; tasks: ComputedTask[]; isSelected: boolean; onClick: () => void; t: ThemeColors; simDelta: number | null
}) {
  const cx = 90, cy = 90, r = 70
  const sides = tasks.length
  const aiScores = tasks.map(tk => tk.aiScore)
  const complexities = tasks.map(tk => tk.complexity * 10)
  const avgAi = Math.round(aiScores.reduce((a, b) => a + b, 0) / aiScores.length)
  const displayAvg = simDelta != null ? clamp(avgAi + simDelta, 5, 98) : avgAi

  return (
    <div onClick={onClick} style={{
      cursor: "pointer", background: isSelected ? `linear-gradient(135deg, ${category.color}18, ${category.color}08)` : t.bgCard,
      border: `1px solid ${isSelected ? category.color + "80" : t.border}`, borderRadius: 16, padding: "20px 16px 16px",
      transition: "all 0.3s", transform: isSelected ? "scale(1.02)" : "scale(1)", position: "relative", overflow: "hidden"
    }}>
      {isSelected && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${category.color}, transparent)` }} />}
      {simDelta != null && <div style={{ position: "absolute", top: 8, right: 10, fontSize: 9, fontWeight: 700, color: simDelta > 0 ? "#00E5A0" : simDelta < 0 ? "#FF6B6B" : t.textMuted, fontFamily: "'DM Mono', monospace" }}>SIM {simDelta > 0 ? "+" : ""}{simDelta}%</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18, color: category.color }}>{category.icon}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{category.name}</span>
      </div>
      <svg viewBox="0 0 180 180" style={{ width: "100%", maxWidth: 180, margin: "0 auto", display: "block" }}>
        {[1, 0.75, 0.5, 0.25].map(s => {
          const pts = Array.from({ length: sides }, (_, i) => { const a = (Math.PI * 2 * i) / sides - Math.PI / 2; return `${cx + r * s * Math.cos(a)},${cy + r * s * Math.sin(a)}` }).join(" ")
          return <polygon key={s} points={pts} fill="none" stroke={t.gridLine} strokeWidth="0.5" />
        })}
        {Array.from({ length: sides }, (_, i) => { const a = (Math.PI * 2 * i) / sides - Math.PI / 2; return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke={t.gridLine} strokeWidth="0.5" /> })}
        <RadarPolygon data={complexities} color={t.text} opacity={0.05} radius={r} cx={cx} cy={cy} sides={sides} />
        <RadarPolygon data={aiScores} color={category.color} opacity={0.2} radius={r} cx={cx} cy={cy} sides={sides} />
        {aiScores.map((val, i) => { const a = (Math.PI * 2 * i) / sides - Math.PI / 2; return <circle key={i} cx={cx + (val / 100) * r * Math.cos(a)} cy={cy + (val / 100) * r * Math.sin(a)} r={3} fill={category.color} stroke={t.stroke} strokeWidth="1.5" /> })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={category.color} fontSize="22" fontWeight="700">{displayAvg}%</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill={t.textMuted} fontSize="8">{simDelta != null ? "SIM SCORE" : "AI READY"}</text>
      </svg>
      <div style={{ fontSize: 12, color: t.textMuted, textAlign: "center" as const, marginTop: 4 }}>{tasks.length} skills</div>
    </div>
  )
}

function AutomationBadge({ score }: { score: number }) {
  const { short, color } = getLevel(score)
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, color, background: color + "12", border: `1px solid ${color}25`, letterSpacing: "0.08em" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}60` }} />{short}</span>
}

function HeatmapGrid({ tasks, onSelect, selectedId, t }: { tasks: ComputedTask[]; onSelect: (t: ComputedTask) => void; selectedId: string | undefined; t: ThemeColors }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 8 }}>
      {[...tasks].sort((a, b) => b.aiScore - a.aiScore).map(task => {
        const hue = task.aiScore >= 75 ? 160 : task.aiScore >= 55 ? 40 : 0
        const isActive = selectedId === task.id
        return (
          <div key={task.id} onClick={() => onSelect(task)} style={{
            cursor: "pointer", background: isActive ? `linear-gradient(135deg, ${task.categoryColor}20, ${task.categoryColor}08)` : `hsla(${hue}, 70%, ${20 + (task.aiScore / 100) * 15}%, 0.12)`,
            border: `1px solid ${isActive ? task.categoryColor + "60" : `hsla(${hue}, 70%, 40%, 0.18)`}`,
            borderRadius: 10, padding: "12px 14px", transition: "all 0.2s"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: t.text, lineHeight: 1.3, flex: 1 }}>{task.name}</span>
              <AutomationBadge score={task.aiScore} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: t.barBg, overflow: "hidden" }}>
                <div style={{ width: `${task.aiScore}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${task.categoryColor}90, ${task.categoryColor})`, transition: "width 0.6s ease" }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: task.categoryColor, fontFamily: "'DM Mono', monospace", minWidth: 36, textAlign: "right" as const }}>{task.aiScore}%</span>
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 6 }}>Complexity: {"\u2588".repeat(task.complexity)}{"\u2591".repeat(10 - task.complexity)} {"\u00B7"} {task.frequency}</div>
          </div>
        )
      })}
    </div>
  )
}

function TaskDetail({ task, onClose, t, scenario }: { task: ComputedTask; onClose: () => void; t: ThemeColors; scenario: string }) {
  const level = getLevel(task.aiScore)
  const sc = SCENARIO_CONFIGS[scenario]
  return (
    <div style={{ background: t.bgSurface, border: `1px solid ${task.categoryColor}30`, borderRadius: 16, padding: 28, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${task.categoryColor}, transparent)` }} />
      <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: t.barBg, border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>{"\u00D7"}</button>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: task.categoryColor, letterSpacing: "0.1em", marginBottom: 6 }}>{task.categoryName.toUpperCase()}</div>
        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: t.text }}>{task.name}</h3>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: t.textSecondary, lineHeight: 1.6 }}>{task.desc}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div style={{ background: t.bgCard, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em", marginBottom: 10 }}>AI AUTOMATION POTENTIAL</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: level.color, fontFamily: "'DM Mono', monospace" }}>{task.aiScore}</span>
            <span style={{ fontSize: 16, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>/ 100</span>
          </div>
          <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: t.barBg, overflow: "hidden" }}><div style={{ width: `${task.aiScore}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${level.color}80, ${level.color})` }} /></div>
          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: level.color }}>{level.label}</div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{level.desc}</div>
        </div>
        <div style={{ background: t.bgCard, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em", marginBottom: 10 }}>TASK PROFILE</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: t.textMuted, marginBottom: 3 }}>COMPLEXITY</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, display: "flex", gap: 2 }}>{Array.from({ length: 10 }, (_, i) => <div key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: i < task.complexity ? task.categoryColor : t.barBg, opacity: i < task.complexity ? 0.5 + (i / 10) * 0.5 : 1 }} />)}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "'DM Mono', monospace" }}>{task.complexity}/10</span>
              </div>
            </div>
            <div><div style={{ fontSize: 10, color: t.textMuted, marginBottom: 3 }}>FREQUENCY</div><span style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary }}>{task.frequency}</span></div>
            <div><div style={{ fontSize: 10, color: t.textMuted, marginBottom: 3 }}>TOOLING</div><div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>{task.tools.map(tl => <span key={tl} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: t.tagBg, color: t.tagText }}>{tl}</span>)}</div></div>
          </div>
        </div>
        <div style={{ background: `${sc.color}08`, borderRadius: 12, padding: 16, border: `1px solid ${sc.color}20` }}>
          <div style={{ fontSize: 10, color: sc.color, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>SCENARIO {"\u2014"} {sc.label.toUpperCase()}</div>
          <div style={{ fontSize: 12, color: t.textSecondary, lineHeight: 1.5, marginBottom: 10 }}>Under <strong style={{ color: sc.color }}>{sc.label}</strong> adoption, this skill shifts from <strong style={{ color: getLevel(task.baseAiScore).color }}>{getLevel(task.baseAiScore).label}</strong> to <strong style={{ color: level.color }}>{level.label}</strong>.</div>
          <div style={{ fontSize: 11, color: t.textMuted }}><div>Urgency: <strong style={{ color: sc.color }}>{sc.urgency}</strong></div><div>Window: <strong style={{ color: sc.color }}>{sc.timeline}</strong></div><div>Risk: <strong style={{ color: sc.color }}>{sc.riskToRole}</strong></div></div>
        </div>
      </div>
      <div style={{ background: t.bgCard, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em", marginBottom: 12 }}>SUB-SKILL BREAKDOWN {"\u2014"} AGENTIC AI OPPORTUNITY MAP</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
          {task.subtasks.map((st, i) => { const sub = clamp(Math.round(task.aiScore + (Math.sin(i * 2.5) * 18)), 5, 98); const sl = getLevel(sub); return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8, background: t.bgSurface }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: t.textSecondary, fontFamily: "'DM Mono', monospace", minWidth: 20 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 12, color: t.text, flex: 1 }}>{st}</span>
              <div style={{ width: 80, height: 4, borderRadius: 2, background: t.barBg, overflow: "hidden" }}><div style={{ width: `${sub}%`, height: "100%", borderRadius: 2, background: sl.color }} /></div>
              <span style={{ fontSize: 11, fontWeight: 600, color: sl.color, fontFamily: "'DM Mono', monospace", minWidth: 30, textAlign: "right" as const }}>{sub}%</span>
            </div>
          ) })}
        </div>
      </div>
    </div>
  )
}

function SummaryStats({ tasks, t }: { tasks: ComputedTask[]; t: ThemeColors }) {
  const total = tasks.length
  const avgAi = Math.round(tasks.reduce((a, tk) => a + tk.aiScore, 0) / total)
  const fullAuto = tasks.filter(tk => tk.aiScore >= 85).length
  const humanLed = tasks.filter(tk => tk.aiScore < 40).length
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
      {[
        { label: "Total Skills", value: String(total), sub: "mapped & assessed", color: "#00E5A0" },
        { label: "Avg AI Score", value: `${avgAi}%`, sub: "automation potential", color: "#00B4FF" },
        { label: "Full Auto Ready", value: String(fullAuto), sub: "tasks \u2265 85%", color: "#A855F7" },
        { label: "Human-Led", value: String(humanLed), sub: "tasks < 40%", color: "#FF6B6B" },
      ].map(s => (
        <div key={s.label} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: s.color }} />
          <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.08em", marginBottom: 6 }}>{s.label.toUpperCase()}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: 12, color: t.textFaint, marginTop: 4 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  )
}

function MethodologyPanel({ t, isOpen, onToggle }: { t: ThemeColors; isOpen: boolean; onToggle: () => void }) {
  return (
    <div style={{ background: t.methodBg, border: `1px solid ${t.border}`, borderRadius: 14, marginBottom: 24, overflow: "hidden" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "none", border: "none", cursor: "pointer", color: t.text }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 14 }}>{"\u{1F4D0}"}</span><span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em" }}>METHODOLOGY & HOW TO READ THIS ASSESSMENT</span></div>
        <span style={{ fontSize: 16, transition: "transform 0.3s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", color: t.textMuted }}>{"\u25BE"}</span>
      </button>
      {isOpen && (
        <div style={{ padding: "0 20px 20px", fontSize: 13, color: t.textSecondary, lineHeight: 1.7 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: t.text }}>What you{"'"}re seeing</h4>
              <p style={{ margin: 0 }}>This atlas maps <strong>every skill</strong> performed by an experienced Consumer Lending Analyst. Skills are organized into 6 domains, each as a radar chart showing AI automation potential (colored) vs complexity (white).</p>
              <h4 style={{ margin: "14px 0 8px", fontSize: 13, fontWeight: 700, color: t.text }}>AI Score (0{"\u2013"}100%)</h4>
              <p style={{ margin: 0 }}>Each skill is scored on automation readiness factoring: data availability, decision repeatability, regulatory sensitivity, judgment requirements, and tooling maturity. The scenario selector shifts scores by adoption speed.</p>
              <h4 style={{ margin: "14px 0 8px", fontSize: 13, fontWeight: 700, color: t.text }}>Real World Simulation</h4>
              <p style={{ margin: 0 }}>Uses <strong>Realtime LLM-as-judge scoring</strong>: live web search for peer lender AI signals, then Claude evaluates each domain. Free demo results available; live runs use token baskets ({CONFIG.BASKET_PRICE} for {CONFIG.BASKET_SIZE} simulations).</p>
            </div>
            <div>
              <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: t.text }}>5-tier classification</h4>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                {[{ r: "85\u2013100%", l: "Full Automation", d: "End-to-end AI, minimal oversight", c: "#00E5A0" }, { r: "70\u201384%", l: "High Automation", d: "AI performs, humans review", c: "#00B4FF" }, { r: "55\u201369%", l: "Augmented", d: "AI co-pilots, human decides", c: "#FFB800" }, { r: "40\u201354%", l: "AI-Assisted", d: "AI handles repetitive parts", c: "#FF8C42" }, { r: "0\u201339%", l: "Human-Led", d: "Judgment, relationships, nuance", c: "#FF6B6B" }].map(l => (
                  <div key={l.l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: l.c, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, color: l.c, fontSize: 11, minWidth: 55 }}>{l.r}</span>
                    <span style={{ fontSize: 11.5, color: t.textSecondary }}><strong>{l.l}</strong> {"\u2014"} {l.d}</span>
                  </div>
                ))}
              </div>
              <h4 style={{ margin: "14px 0 8px", fontSize: 13, fontWeight: 700, color: t.text }}>How to use</h4>
              <p style={{ margin: 0, fontSize: 12.5 }}>Click any domain radar to filter. Click any skill card to drill into sub-skills. Use scenario toggles + Real World Simulation for the most complete picture.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GlobalHeatmap({ tasks, t }: { tasks: ComputedTask[]; t: ThemeColors }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, color: t.textMuted, letterSpacing: "0.1em", marginBottom: 10 }}>AUTOMATION HEATMAP {"\u2014"} ALL {tasks.length} SKILLS</div>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 3, marginBottom: 8 }}>
        {[...tasks].sort((a, b) => b.aiScore - a.aiScore).map(tk => {
          const r = tk.aiScore >= 70 ? 0 : tk.aiScore >= 40 ? Math.round(255 * (1 - (tk.aiScore - 40) / 30)) : 255
          const g = tk.aiScore >= 70 ? Math.round(180 + (tk.aiScore - 70) * 2.5) : tk.aiScore >= 40 ? Math.round(180 * ((tk.aiScore - 40) / 30)) : 60
          return <div key={tk.id} title={`${tk.name}: ${tk.aiScore}%`} style={{ width: 18, height: 18, borderRadius: 3, background: `rgba(${r},${g},0,0.7)`, border: `1px solid ${t.gridLine}` }} />
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 9, color: t.textMuted }}>
        <span>Human-Led</span>
        <div style={{ display: "flex", gap: 1 }}>{[20, 35, 50, 65, 80, 95].map(v => <div key={v} style={{ width: 14, height: 8, borderRadius: 1, background: v >= 70 ? `rgba(0,${180 + (v - 70) * 2.5},0,0.7)` : v >= 40 ? `rgba(${Math.round(255 * (1 - (v - 40) / 30))},${Math.round(180 * ((v - 40) / 30))},0,0.7)` : "rgba(255,60,0,0.7)" }} />)}</div>
        <span>Full Auto</span>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════ */

export default function ConsumerLendingAnalystApp() {
  const [scenario, setScenario] = useState("moderate")
  const [isDark, setIsDark] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<ComputedTask | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [methodOpen, setMethodOpen] = useState(false)
  const [simResults, setSimResults] = useState<SimScoring | null>(null)

  const t = useTheme(isDark)
  const sc = SCENARIO_CONFIGS[scenario]

  const allTasks: ComputedTask[] = useMemo(() => CATEGORIES.flatMap(c => c.tasks.map(tk => {
    const scenarioScore = clamp(tk.aiScore + sc.modifier, 5, 98)
    const simDelta = simResults?.domains?.[c.id]?.delta || 0
    return { ...tk, baseAiScore: tk.aiScore, aiScore: clamp(scenarioScore + simDelta, 5, 98), category: c.id, categoryName: c.name, categoryColor: c.color }
  })), [scenario, simResults, sc.modifier])

  const categoriesWithTasks = useMemo(() => CATEGORIES.map(c => ({ ...c, computedTasks: allTasks.filter(tk => tk.category === c.id) })), [allTasks])

  const displayTasks = selectedCategory ? allTasks.filter(tk => tk.category === selectedCategory) : allTasks
  const filtered = searchTerm ? displayTasks.filter(tk => tk.name.toLowerCase().includes(searchTerm.toLowerCase()) || tk.desc.toLowerCase().includes(searchTerm.toLowerCase())) : displayTasks

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif", transition: "background 0.4s, color 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .crm-app * { box-sizing: border-box; }
        .crm-app ::-webkit-scrollbar { width: 6px; }
        .crm-app ::-webkit-scrollbar-track { background: transparent; }
        .crm-app ::-webkit-scrollbar-thumb { background: ${t.gridLine}; border-radius: 3px; }
      `}</style>

      <div className="crm-app">
        {/* HEADER */}
        <div style={{ background: t.headerBg, borderBottom: `1px solid ${t.border}`, padding: "28px 36px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00E5A0", boxShadow: "0 0 12px #00E5A060" }} />
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", color: "#00E5A0" }}>AGENTIC AI ASSESSMENT FRAMEWORK</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: t.text, lineHeight: 1.2 }}>Consumer Lending Analyst</h1>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: t.textSecondary }}>
                Complete skill atlas & AI automation readiness {"\u00B7"} {allTasks.length} skills {"\u00B7"} {CATEGORIES.length} domains
                {simResults && <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 4, background: "#A855F720", color: "#A855F7", fontSize: 10, fontWeight: 700 }}>SIMULATION ACTIVE</span>}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ padding: "7px 14px", borderRadius: 8, background: t.bgCard, border: `1px solid ${t.border}`, fontSize: 11, color: t.textSecondary }}>{"\u{1F4B3}"} Consumer Lending</div>
              <div style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", fontSize: 11, color: "#00E5A0", fontWeight: 600 }}>CFPB / Basel / EBA</div>
              <button onClick={() => setIsDark(!isDark)} style={{ padding: "7px 14px", borderRadius: 8, background: t.bgCard, border: `1px solid ${t.border}`, fontSize: 13, cursor: "pointer", color: t.text, display: "flex", alignItems: "center", gap: 6 }}>
                {isDark ? "\u2600\uFE0F" : "\u{1F319}"} <span style={{ fontSize: 11 }}>{isDark ? "Light" : "Dark"}</span>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "stretch", gap: 10, flexWrap: "wrap" as const }}>
            {Object.entries(SCENARIO_CONFIGS).map(([key, cfg]) => {
              const active = scenario === key
              return (
                <button key={key} onClick={() => { setScenario(key); setSelectedTask(null) }} style={{
                  flex: "1 1 0", minWidth: 200, padding: "14px 18px", borderRadius: 12, cursor: "pointer",
                  background: active ? `${cfg.color}12` : t.bgCard, border: `1.5px solid ${active ? cfg.color + "80" : t.border}`,
                  textAlign: "left" as const, position: "relative", overflow: "hidden", transition: "all 0.25s", color: t.text
                }}>
                  {active && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2.5, background: cfg.color }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: active ? cfg.color : t.text }}>{cfg.label}</span>
                    {active && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: cfg.color + "20", color: cfg.color, fontWeight: 700 }}>ACTIVE</span>}
                  </div>
                  <div style={{ fontSize: 11, color: t.textSecondary, lineHeight: 1.4 }}>{cfg.tagline}</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 10, color: t.textMuted }}>
                    <span>Urgency: <strong style={{ color: active ? cfg.color : t.textSecondary }}>{cfg.urgency}</strong></span>
                    <span>Window: <strong style={{ color: active ? cfg.color : t.textSecondary }}>{cfg.timeline}</strong></span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ padding: "28px 36px 0" }}>
          <MethodologyPanel t={t} isOpen={methodOpen} onToggle={() => setMethodOpen(!methodOpen)} />
          <SimulationPanel t={t} scenario={scenario} onSimResults={setSimResults} />
          <SummaryStats tasks={allTasks} t={t} />
          <GlobalHeatmap tasks={allTasks} t={t} />

          <div style={{ fontSize: 12, color: t.textMuted, letterSpacing: "0.1em", marginBottom: 12 }}>
            DOMAIN RADAR {"\u2014"} CLICK TO FILTER
            {simResults && <span style={{ marginLeft: 8, color: "#A855F7", fontWeight: 700 }}>{"\u00B7"} SIMULATION DELTAS APPLIED</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
            {categoriesWithTasks.map(cat => (
              <CategoryRadar key={cat.id} category={cat} tasks={cat.computedTasks}
                isSelected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                t={t} simDelta={simResults?.domains?.[cat.id]?.delta ?? null} />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" as const }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
              <input type="text" placeholder="Search skills..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 16px 10px 36px", borderRadius: 10, background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: t.textMuted }}>{"\u2315"}</span>
            </div>
            <div style={{ fontSize: 12, color: t.textMuted }}>
              Showing {filtered.length} of {allTasks.length} skills
              {selectedCategory && <span onClick={() => setSelectedCategory(null)} style={{ marginLeft: 8, color: "#00E5A0", cursor: "pointer", textDecoration: "underline" }}>Clear filter</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: sc.color, background: sc.color + "10", padding: "5px 12px", borderRadius: 6, border: `1px solid ${sc.color}25` }}>
              <span>{sc.icon}</span><span style={{ fontWeight: 700 }}>{sc.label} scenario</span><span style={{ color: t.textMuted }}>{"\u00B7"} scores {sc.modifier > 0 ? "+" : ""}{sc.modifier}%</span>
            </div>
          </div>

          <HeatmapGrid tasks={filtered} onSelect={setSelectedTask} selectedId={selectedTask?.id} t={t} />

          {selectedTask && <div style={{ marginTop: 20 }}><TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} t={t} scenario={scenario} /></div>}

          <div style={{ marginTop: 32, padding: 24, background: t.bgCard, borderRadius: 14, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em", marginBottom: 14 }}>AUTOMATION CLASSIFICATION FRAMEWORK</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {[
                { range: "85\u2013100%", label: "Full Automation", desc: "Agentic AI executes end-to-end", color: "#00E5A0" },
                { range: "70\u201384%", label: "High Automation", desc: "AI performs, human reviews", color: "#00B4FF" },
                { range: "55\u201369%", label: "Augmented", desc: "AI co-pilots the workflow", color: "#FFB800" },
                { range: "40\u201354%", label: "AI-Assisted", desc: "AI handles repetitive parts", color: "#FF8C42" },
                { range: "0\u201339%", label: "Human-Led", desc: "Judgment, relationships, creativity", color: "#FF6B6B" },
              ].map(l => (
                <div key={l.label} style={{ padding: "12px 14px", borderRadius: 8, background: `${l.color}08`, border: `1px solid ${l.color}20` }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: l.color, fontFamily: "'DM Mono', monospace" }}>{l.range}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: t.text, marginTop: 4 }}>{l.label}</div>
                  <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{l.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 40, padding: "20px 36px", background: t.footerBg, borderTop: `1px solid ${t.border}`, textAlign: "center" as const }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, marginBottom: 4 }}>Agentic AI Job Role Assessment Framework {"\u00B7"} Consumer Lending Analyst v1.0</div>
          <div style={{ fontSize: 11, color: t.textMuted }}>{"\u00A9"} {new Date().getFullYear()} Tarry Singh. All rights reserved.</div>
        </div>
      </div>
    </div>
  )
}
