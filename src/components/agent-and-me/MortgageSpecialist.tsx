"use client"

import { useState, useMemo, useCallback, useEffect, type ReactNode } from "react"

/* ═══════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════ */

const CONFIG = {
  BASKET_SIZE: 5,
  BASKET_PRICE: "$5",
  PRICE_PER_SIM: "$1",
  ROLE_SLUG: "mortgage-specialist",
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
  local: { label: "Lenders in My Region", icon: "\u{1F4CD}", searchHint: "Netherlands mortgage hypotheek ING ABN AMRO Rabobank", desc: "AI adoption trends among Dutch & Benelux mortgage lenders" },
  europe: { label: "Lenders in Europe", icon: "\u{1F1EA}\u{1F1FA}", searchHint: "European mortgage lending automation AI trends EU housing", desc: "AI adoption across major European mortgage lenders" },
  global: { label: "Lenders Worldwide", icon: "\u{1F30D}", searchHint: "global mortgage industry automation US UK Asia fintech", desc: "Global mortgage AI adoption \u2014 US, UK, Asia leaders" }
}

const CATEGORIES: CategoryDef[] = [
  {
    id: "application_intake", name: "Application & Intake", icon: "\u25C6", color: "#00E5A0",
    tasks: [
      { id: "app_processing", name: "Application Processing & Triage", desc: "Receive and categorize mortgage applications by product type, priority, and completeness. Route to appropriate underwriting queue based on loan amount, property type, and borrower profile.", aiScore: 85, complexity: 4, frequency: "Daily", tools: ["Encompass", "Calyx", "Byte", "Blend"], subtasks: ["Application intake", "Completeness check", "Priority routing", "Queue assignment", "Status tracking"] },
      { id: "doc_collection", name: "Document Collection & Verification", desc: "Collect and verify required documentation: pay stubs, W-2s, tax returns, bank statements, gift letters. Cross-reference documents for consistency and detect potential fraud indicators.", aiScore: 88, complexity: 5, frequency: "Daily", tools: ["Encompass", "DocuSign", "Ocrolus", "ICE"], subtasks: ["Document checklist", "OCR extraction", "Consistency verification", "Fraud screening", "Missing doc follow-up"] },
      { id: "income_verify", name: "Income & Employment Verification", desc: "Verify borrower income through employer VOE, tax transcripts (4506-C), bank statement analysis for standard W-2 and salaried borrowers. Coordinate with The Work Number and payroll verification services.", aiScore: 82, complexity: 6, frequency: "Daily", tools: ["The Work Number", "Plaid", "Finicity", "DU"], subtasks: ["VOE processing", "Tax transcript review", "Rental income calc", "Trending income", "VOE follow-up"] },
      { id: "self_employed", name: "Self-Employed Borrower Analysis", desc: "Complex income calculation for self-employed borrowers: Schedule C/K-1/1120S analysis, P&L review, business tax return interpretation, cash flow analysis, declining income trending, and business stability assessment.", aiScore: 42, complexity: 10, frequency: "Daily", tools: ["Encompass", "LoanBeam", "Excel", "Tax forms"], subtasks: ["Schedule C analysis", "K-1 interpretation", "P&L review", "Business stability check", "Declining income trending"] },
      { id: "kyc_checks", name: "Identity & KYC Checks", desc: "Verify borrower identity through SSN validation, OFAC screening, fraud consortium checks (LexisNexis), and cross-reference with credit bureau identity verification services.", aiScore: 90, complexity: 3, frequency: "Daily", tools: ["LexisNexis", "OFAC", "Equifax ID", "FraudGuard"], subtasks: ["SSN validation", "OFAC screening", "Identity verification", "Fraud alert check"] },
      { id: "eligibility", name: "Loan Program Eligibility Screening", desc: "Match borrower profile against available loan programs: Conventional, FHA, VA, USDA, Jumbo, Non-QM. Screen for credit score, DTI, LTV, and property eligibility requirements per program.", aiScore: 82, complexity: 5, frequency: "Daily", tools: ["DU", "LP", "GUS", "Encompass"], subtasks: ["Program matching", "Eligibility rules", "Guideline overlay check", "Product comparison"] },
      { id: "asset_verify", name: "Asset Verification & Reserve Analysis", desc: "Verify liquid assets, retirement accounts, and gift funds. Calculate required reserves (2-12 months PITIA depending on program). Trace large deposits, verify gift fund transfers, assess asset depletion for qualifying.", aiScore: 80, complexity: 6, frequency: "Per Application", tools: ["Plaid", "Finicity", "Encompass", "DU"], subtasks: ["Bank statement review", "Large deposit sourcing", "Gift fund verification", "Reserve calculation", "Asset depletion analysis"] },
      { id: "prequal", name: "Pre-Qualification Letter Generation", desc: "Generate pre-qualification and pre-approval letters based on preliminary credit review, income analysis, and estimated property value. Calculate maximum purchase price scenarios.", aiScore: 92, complexity: 3, frequency: "Daily", tools: ["Encompass", "LendingPad", "Custom templates"], subtasks: ["Income estimate", "Credit pull", "Max purchase calc", "Letter generation", "Expiration tracking"] },
    ]
  },
  {
    id: "property_valuation", name: "Property & Valuation", icon: "\u25B2", color: "#00B4FF",
    tasks: [
      { id: "avm", name: "Automated Valuation Models (AVM)", desc: "Run automated property valuations using comparable sales data, tax assessments, and ML models. Evaluate confidence scores and determine when full appraisal is required vs. AVM/desktop appraisal.", aiScore: 80, complexity: 6, frequency: "Per Application", tools: ["Collateral Analytics", "CoreLogic", "Black Knight", "HouseCanary"], subtasks: ["AVM ordering", "Confidence scoring", "Cascade logic", "Waiver determination", "Value reconciliation"] },
      { id: "appraisal_review", name: "Appraisal Review & Reconciliation", desc: "Review full appraisal reports for compliance with USPAP standards, comparable selection quality, adjustments reasonableness, and condition/quality ratings. Flag inconsistencies with AVM or prior valuations.", aiScore: 55, complexity: 8, frequency: "Per Application", tools: ["Mercury", "UCDP", "Fannie Mae CU", "CoreLogic"], subtasks: ["USPAP compliance check", "Comp selection review", "Adjustment analysis", "Condition assessment", "Reconsideration of value"] },
      { id: "title_search", name: "Title Search & Lien Review", desc: "Review title commitments for clear ownership, existing liens, easements, and encumbrances. Identify issues requiring resolution: subordination agreements, lien releases, boundary disputes. Coordinate with title companies.", aiScore: 75, complexity: 5, frequency: "Per Application", tools: ["SoftPro", "RamQuest", "First American", "Stewart Title"], subtasks: ["Title commitment review", "Lien search", "Judgment review", "Exception clearing", "Title insurance commitment"] },
      { id: "flood_hazard", name: "Flood Zone & Environmental Risk", desc: "Determine property flood zone classification using FEMA flood maps. Identify special flood hazard areas requiring mandatory flood insurance. Assess environmental hazards and climate risk per evolving standards.", aiScore: 95, complexity: 2, frequency: "Per Application", tools: ["CoreLogic Flood", "ServiceLink", "FEMA NFIP", "Arturo"], subtasks: ["Flood zone lookup", "LOMA review", "Insurance requirement", "Life-of-loan tracking", "Climate risk flag"] },
      { id: "comp_analysis", name: "Comparable Property Analysis", desc: "Analyze recent comparable sales to support property valuation. Evaluate location adjustments, time adjustments, feature comparisons, and market trends. Challenge or support appraisal conclusions.", aiScore: 72, complexity: 7, frequency: "Per Application", tools: ["MLS", "CoreLogic", "Redfin API", "MISMO"], subtasks: ["Comp search", "Adjustment grid", "Market trend analysis", "Distance analysis", "Paired sales analysis"] },
      { id: "insurance_verify", name: "Property Insurance Verification", desc: "Verify adequate hazard/homeowner's insurance coverage, confirm mortgagee clause, review condo/PUD master policies, ensure flood insurance compliance, track insurance binder receipt before closing.", aiScore: 82, complexity: 4, frequency: "Per Application", tools: ["Encompass", "Insurance tracking systems", "Carrier portals"], subtasks: ["Coverage verification", "Mortgagee clause check", "Condo master policy review", "Flood insurance confirm", "Binder tracking"] },
    ]
  },
  {
    id: "underwriting_decision", name: "Underwriting & Decisioning", icon: "\u25CF", color: "#FF6B6B",
    tasks: [
      { id: "dti_calc", name: "Debt-to-Income Ratio Calculation", desc: "Calculate front-end and back-end DTI ratios. Include all qualifying debts: revolving, installment, student loans, alimony, child support. Apply program-specific DTI limits and compensating factors.", aiScore: 95, complexity: 3, frequency: "Per Application", tools: ["DU", "LP", "Encompass", "Excel"], subtasks: ["Debt identification", "Payment calculation", "Income qualification", "Ratio computation", "Compensating factor review"] },
      { id: "credit_analysis", name: "Credit History & Score Analysis", desc: "Analyze tri-merge credit reports: evaluate payment history patterns, utilization trends, derogatory events (BK, foreclosure, short sale), authorized user tradelines, and rapid rescore opportunities.", aiScore: 78, complexity: 6, frequency: "Per Application", tools: ["DU", "LP", "CreditXpert", "Equifax/Experian/TU"], subtasks: ["Tri-merge review", "Derogatory analysis", "Tradeline evaluation", "Rescore simulation", "Credit explanation letters"] },
      { id: "fraud_detection", name: "Fraud Detection & Red Flag Analysis", desc: "Review files for potential fraud indicators: identity fraud, income misrepresentation, occupancy fraud, property flipping schemes, straw buyers. Apply red flag checklists per FinCEN and SAR filing guidance.", aiScore: 55, complexity: 8, frequency: "Per Application", tools: ["LexisNexis", "FraudGuard", "CoreLogic", "Encompass"], subtasks: ["Red flag checklist", "Income consistency review", "Occupancy verification", "Flip analysis", "SAR determination"] },
      { id: "risk_layering", name: "Risk Layering Assessment", desc: "Evaluate cumulative risk factors: low credit score combined with high LTV, limited reserves, non-owner occupied, cash-out refinance. Apply risk overlay matrices and compensating factor frameworks.", aiScore: 45, complexity: 9, frequency: "Per Application", tools: ["DU", "LP", "Internal overlays", "Risk matrices"], subtasks: ["Risk factor identification", "Overlay application", "Compensating factors", "Cumulative risk scoring", "Exception justification"] },
      { id: "exception_override", name: "Exception & Override Decisioning", desc: "Review applications requiring underwriter exceptions or overrides to standard guidelines. Document compensating factors, obtain appropriate approval authority, maintain audit trail for QC review.", aiScore: 28, complexity: 10, frequency: "Weekly", tools: ["Encompass", "Internal workflows", "Exception logs"], subtasks: ["Exception identification", "Compensating factor docs", "Authority routing", "Risk justification", "Audit documentation"] },
      { id: "ltv_analysis", name: "Loan-to-Value & PMI Analysis", desc: "Calculate LTV, CLTV, and HCLTV ratios. Determine PMI requirements, pricing adjustments (LLPAs), and eligibility by LTV tier. Coordinate with PMI companies (MGIC, Radian, Arch, Essent) for loan-level pricing.", aiScore: 88, complexity: 4, frequency: "Per Application", tools: ["Encompass", "DU", "LP", "MGIC/Radian"], subtasks: ["Value determination", "LTV calculation", "PMI ordering", "LLPA pricing", "Subordinate lien analysis"] },
      { id: "conditional_approval", name: "Conditional Approval & Stipulations", desc: "Issue conditional loan approvals with specific conditions (prior-to-doc, prior-to-close, prior-to-fund). Track condition satisfaction, manage condition expiration, escalate outstanding items.", aiScore: 46, complexity: 8, frequency: "Per Application", tools: ["Encompass", "Workflow tools", "DocuSign"], subtasks: ["Condition list creation", "Priority classification", "Satisfaction review", "Expiration tracking", "Clear-to-close determination"] },
      { id: "nonqm_underwriting", name: "Non-QM / Non-Agency Underwriting", desc: "Underwrite non-qualified mortgage products: bank statement programs (12/24 month), DSCR investor loans, asset depletion, foreign national programs. Apply specialized guidelines outside GSE frameworks.", aiScore: 35, complexity: 9, frequency: "Weekly", tools: ["Encompass", "Non-QM matrices", "Bank statement calculators"], subtasks: ["Bank statement income calc", "DSCR computation", "Asset depletion calc", "Investor guidelines", "Non-QM compliance"] },
    ]
  },
  {
    id: "compliance_regulatory", name: "Compliance & Regulatory", icon: "\u25C7", color: "#FFB800",
    tasks: [
      { id: "fair_lending", name: "Fair Lending & Discrimination Testing", desc: "Perform fair lending analysis on approval/denial rates across protected classes. Monitor HMDA data quality, conduct regression analysis for pricing disparities, maintain fair lending risk assessments.", aiScore: 70, complexity: 8, frequency: "Quarterly", tools: ["ComplianceEase", "HMDA Tools", "Statistical packages"], subtasks: ["HMDA analysis", "Regression testing", "Denial rate review", "Pricing disparity", "Remediation planning"] },
      { id: "trid_respa", name: "TRID / RESPA Compliance Checks", desc: "Ensure compliance with TILA-RESPA Integrated Disclosures: Loan Estimate timing, Changed Circumstance documentation, Closing Disclosure accuracy, tolerance violation monitoring.", aiScore: 82, complexity: 6, frequency: "Per Application", tools: ["ComplianceEase", "Encompass", "RegCheck", "Mavent"], subtasks: ["LE timing check", "CD accuracy review", "Tolerance monitoring", "Changed circumstance docs", "Fee validation"] },
      { id: "qm_atr", name: "QM / ATR Rule Verification", desc: "Verify Qualified Mortgage and Ability-to-Repay compliance: points and fees test, DTI documentation, residual income analysis, General QM/Safe Harbor determination.", aiScore: 85, complexity: 5, frequency: "Per Application", tools: ["ComplianceEase", "Encompass", "QM calculators"], subtasks: ["Points & fees test", "QM eligibility check", "ATR documentation", "Safe Harbor determination", "Rate spread calculation"] },
      { id: "aml_screening", name: "Anti-Money Laundering Screening", desc: "Screen mortgage applications for money laundering indicators: unusual source of funds, structuring patterns, suspicious activity reporting (SAR). Monitor large cash deposits and gift fund trails.", aiScore: 88, complexity: 4, frequency: "Per Application", tools: ["LexisNexis", "OFAC", "FinCEN", "Internal AML tools"], subtasks: ["Source of funds review", "Cash deposit analysis", "Gift fund verification", "SAR determination", "OFAC re-screening"] },
      { id: "gse_compliance", name: "GSE / Agency Guideline Compliance", desc: "Ensure loans meet Fannie Mae, Freddie Mac, FHA, VA, or USDA delivery requirements. Verify selling guide compliance, rep & warrant exposure, and investor-specific overlays.", aiScore: 75, complexity: 7, frequency: "Per Application", tools: ["AllRegs", "Fannie Mae Guide", "FHA Handbook", "VA Lender Handbook"], subtasks: ["Selling guide check", "Overlay compliance", "Rep & warrant review", "Delivery checklist", "Defect remediation"] },
      { id: "guideline_updates", name: "Guideline Interpretation & Policy Updates", desc: "Stay current with investor guideline changes, regulatory updates, and industry bulletins. Interpret new requirements, update internal procedures, train junior staff on policy changes.", aiScore: 38, complexity: 7, frequency: "Weekly", tools: ["AllRegs", "Agency bulletins", "Compliance newsletters"], subtasks: ["Bulletin review", "Impact assessment", "Procedure updates", "Staff communication", "Training delivery"] },
    ]
  },
  {
    id: "closing_postclose", name: "Closing & Post-Close", icon: "\u2B21", color: "#A855F7",
    tasks: [
      { id: "closing_docs", name: "Closing Document Preparation", desc: "Prepare and review closing document packages: mortgage/deed of trust, promissory note, closing disclosure, title documents, insurance binders. Coordinate with settlement agents and attorneys.", aiScore: 80, complexity: 5, frequency: "Per Application", tools: ["Encompass", "DocMagic", "Ellie Mae", "SoftPro"], subtasks: ["Doc package generation", "Accuracy review", "Settlement coordination", "Signing appointment", "e-Closing setup"] },
      { id: "final_uw", name: "Final Underwriting Review", desc: "Conduct final review before funding: verify no material changes, re-pull credit (if required), confirm condition satisfaction, check for intervening liens, validate CD accuracy. Sign clear-to-close.", aiScore: 35, complexity: 9, frequency: "Per Application", tools: ["Encompass", "Credit bureaus", "Title company"], subtasks: ["Change verification", "Credit refresh", "Condition clearance", "Lien check", "Final sign-off"] },
      { id: "funding", name: "Funding & Disbursement Processing", desc: "Process loan funding: verify wire instructions, confirm clear-to-fund conditions, authorize disbursement, coordinate recording, manage dry/wet funding per state requirements.", aiScore: 78, complexity: 5, frequency: "Per Application", tools: ["Encompass", "Wire systems", "Title company portals"], subtasks: ["CTC verification", "Wire authorization", "Recording confirmation", "Funding reconciliation", "Post-fund audit"] },
      { id: "postclose_qc", name: "Post-Close QC & Audit", desc: "Perform post-close quality control reviews: re-verify income/employment, property value validation, compliance re-check, early payment default monitoring, defect trending.", aiScore: 72, complexity: 7, frequency: "Monthly", tools: ["ACES QC", "Encompass", "Sampling tools", "MetaSource"], subtasks: ["Sample selection", "Re-verification", "Compliance re-check", "Defect classification", "Trend reporting"] },
      { id: "loan_boarding", name: "Loan Boarding & Servicing Transfer", desc: "Board closed loans to servicing systems or transfer to investor servicers. Validate data integrity across systems, set up escrow accounts, configure payment schedules.", aiScore: 85, complexity: 4, frequency: "Per Application", tools: ["Black Knight MSP", "Sagent", "FICS", "Encompass"], subtasks: ["Data mapping", "System boarding", "Escrow setup", "Payment config", "Welcome letter generation"] },
      { id: "lo_coordination", name: "Loan Officer Coordination & Communication", desc: "Communicate conditions, deficiencies, and approval decisions to loan officers. Explain denial reasons, suggest alternative structuring, coordinate rush reviews, manage escalation requests.", aiScore: 30, complexity: 7, frequency: "Daily", tools: ["Encompass", "Email", "Phone", "Teams/Slack"], subtasks: ["Condition explanation", "Denial communication", "Structure alternatives", "Rush coordination", "Escalation handling"] },
    ]
  },
  {
    id: "portfolio_strategic", name: "Portfolio & Strategic", icon: "\u2605", color: "#FF69B4",
    tasks: [
      { id: "pipeline_mgmt", name: "Pipeline Management & Rate Lock", desc: "Manage mortgage pipeline: track applications through stages, monitor lock expirations, manage rate lock extensions, hedge pipeline interest rate risk, forecast pull-through rates.", aiScore: 70, complexity: 6, frequency: "Daily", tools: ["Encompass", "Optimal Blue", "Hedge Analytics", "Excel"], subtasks: ["Pipeline tracking", "Lock management", "Extension processing", "Pull-through forecasting", "Hedge reporting"] },
      { id: "secondary_pricing", name: "Secondary Market Pricing", desc: "Set competitive loan pricing based on secondary market execution: TBA pricing, SRP calculations, LLPA grids, margin optimization. Monitor competitor pricing and market movements.", aiScore: 65, complexity: 8, frequency: "Daily", tools: ["Optimal Blue", "Polly", "Mortech", "Bloomberg"], subtasks: ["TBA pricing", "SRP calculation", "LLPA application", "Margin analysis", "Competitor monitoring"] },
      { id: "investor_delivery", name: "Investor Delivery & Whole Loan Trading", desc: "Package and deliver loans to GSEs or whole loan buyers. Manage best-execution analysis, mandatory vs. best-efforts delivery, pair-off calculations, and delivery tolerances.", aiScore: 58, complexity: 8, frequency: "Monthly", tools: ["Encompass", "Fannie Mae portal", "Freddie Mac portal"], subtasks: ["Best execution", "Pool creation", "Delivery scheduling", "Pair-off management", "Purchase advice reconciliation"] },
      { id: "loss_mitigation", name: "Loss Mitigation & Workout", desc: "Manage delinquent mortgage accounts: evaluate for forbearance, modification, short sale, or deed-in-lieu. Run NPV waterfall analysis, comply with CFPB servicing rules.", aiScore: 50, complexity: 9, frequency: "Monthly", tools: ["Black Knight MSP", "LoanSphere", "Sagent", "CFPB tools"], subtasks: ["Delinquency triage", "Modification waterfall", "NPV analysis", "Forbearance plans", "CFPB compliance"] },
      { id: "renovation_construction", name: "Renovation & Construction Loan Review", desc: "Underwrite FHA 203k, Fannie Mae HomeStyle, and construction-to-permanent loans. Review contractor bids, feasibility studies, draw schedules, and as-completed value assessments.", aiScore: 38, complexity: 9, frequency: "Weekly", tools: ["Encompass", "HUD consultants", "Contractor docs"], subtasks: ["Feasibility review", "Contractor verification", "Draw schedule setup", "As-completed value", "Budget analysis"] },
      { id: "market_analysis", name: "Market Trend Analysis & Forecasting", desc: "Analyze mortgage market trends: origination volumes, rate environment impact, refinance wave modeling, purchase market forecasting, geographic concentration risk, vintage performance analysis.", aiScore: 62, complexity: 7, frequency: "Quarterly", tools: ["MBA DataBook", "CoreLogic", "Black Knight", "Tableau"], subtasks: ["Volume forecasting", "Rate sensitivity", "Geographic analysis", "Vintage tracking", "Competitive intelligence"] },
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
  { key: "collect", label: "Collecting banking AI evidence", icon: "\u{1F4E1}" },
  { key: "score", label: "LLM-as-judge scoring domains", icon: "\u{1F9E0}" },
  { key: "done", label: "Simulation complete", icon: "\u2705" },
]

function getDemoResults(): SimResults {
  return {
    evidence: "Demo mode: In production, this performs live web search via Anthropic API to find real-world AI adoption evidence at peer banks.",
    scoring: {
      domains: {
        core_modeling: { realWorldScore: 65, evidence: "ML-based PD models gaining traction at tier-1 banks.", confidence: "medium", delta: 5 },
        data_analytics: { realWorldScore: 82, evidence: "Data pipeline automation is widespread across all bank tiers.", confidence: "high", delta: 8 },
        validation_governance: { realWorldScore: 38, evidence: "Regulators remain cautious; human oversight mandated.", confidence: "high", delta: -5 },
        reporting_comm: { realWorldScore: 60, evidence: "Automated reporting dashboards being adopted.", confidence: "medium", delta: 3 },
        implementation: { realWorldScore: 70, evidence: "MLOps and CI/CD for models becoming standard.", confidence: "medium", delta: 6 },
        strategic: { realWorldScore: 35, evidence: "Strategic risk decisions remain firmly human-led.", confidence: "high", delta: -3 },
      },
      overallInsight: "AI adoption in mortgage underwriting is accelerating in document processing and compliance checks but remains constrained by exception-based decisioning and relationship-driven activities.",
      topSignal: "Major banks investing in AI/ML platforms for credit scoring and monitoring automation.",
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
    // Check for Stripe purchase redirect
    const params = new URLSearchParams(window.location.search)
    if (params.get("purchase") === "success") {
      // Refresh balance after successful purchase
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
      await new Promise(r => setTimeout(r, 500)) // brief visual pause

      setResults(data)
      setPhase("done")
      onSimResults(data.scoring)

      // Refresh token balance from server
      fetchTokenBalance().then(b => setTokens(b))
    } catch (err) {
      console.error("[simulation] Error:", err)
      // Fallback to demo on error
      const demo = getDemoResults()
      demo.fromCache = false
      demo.evidence = "Live API unavailable \u2014 showing demo results. " + (demo.evidence || "")
      setResults(demo)
      setPhase("done")
      onSimResults(demo.scoring)
      // Still deduct locally as fallback
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
        window.location.href = data.url // Redirect to Stripe Checkout
        return
      }
    } catch {
      // Stripe unavailable — fall through to demo mode
    }
    // Demo fallback: simulate purchase locally
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
            <strong style={{ color: t.text }}>Realtime LLM Scoring:</strong> This simulation searches the live web for real-world evidence of AI adoption in mortgage underwriting at peer banks, then uses Claude as an LLM-as-judge to re-score each domain based on actual market signals.
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
                    Each simulation performs 2 live AI API calls with real-time web search to score your role against peer banks. That{"'"}s just {CONFIG.PRICE_PER_SIM} per simulation.
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
      <div style={{ fontSize: 12, color: t.textMuted, textAlign: "center" as const, marginTop: 4 }}>{tasks.length} tasks</div>
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
          <div style={{ fontSize: 12, color: t.textSecondary, lineHeight: 1.5, marginBottom: 10 }}>Under <strong style={{ color: sc.color }}>{sc.label}</strong> adoption, this task shifts from <strong style={{ color: getLevel(task.baseAiScore).color }}>{getLevel(task.baseAiScore).label}</strong> to <strong style={{ color: level.color }}>{level.label}</strong>.</div>
          <div style={{ fontSize: 11, color: t.textMuted }}><div>Urgency: <strong style={{ color: sc.color }}>{sc.urgency}</strong></div><div>Window: <strong style={{ color: sc.color }}>{sc.timeline}</strong></div><div>Risk: <strong style={{ color: sc.color }}>{sc.riskToRole}</strong></div></div>
        </div>
      </div>
      <div style={{ background: t.bgCard, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em", marginBottom: 12 }}>SUB-TASK BREAKDOWN {"\u2014"} AGENTIC AI OPPORTUNITY MAP</div>
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
        { label: "Total Tasks", value: String(total), sub: "mapped & assessed", color: "#00E5A0" },
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
              <p style={{ margin: 0 }}>This atlas maps <strong>every task</strong> performed by an experienced Mortgage Specialist / Underwriter. Tasks are organized into 6 domains, each as a radar chart showing AI automation potential (colored) vs complexity (white).</p>
              <h4 style={{ margin: "14px 0 8px", fontSize: 13, fontWeight: 700, color: t.text }}>AI Score (0{"\u2013"}100%)</h4>
              <p style={{ margin: 0 }}>Each task is scored on automation readiness factoring: data availability, decision repeatability, regulatory sensitivity, judgment requirements, and tooling maturity. The scenario selector shifts scores by adoption speed.</p>
              <h4 style={{ margin: "14px 0 8px", fontSize: 13, fontWeight: 700, color: t.text }}>Real World Simulation</h4>
              <p style={{ margin: 0 }}>Uses <strong>Realtime LLM-as-judge scoring</strong>: live web search for peer bank AI signals, then Claude evaluates each domain. Free demo results available; live runs use token baskets ({CONFIG.BASKET_PRICE} for {CONFIG.BASKET_SIZE} simulations).</p>
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
              <p style={{ margin: 0, fontSize: 12.5 }}>Click any domain radar to filter. Click any task card to drill into sub-tasks. Use scenario toggles + Real World Simulation for the most complete picture.</p>
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
      <div style={{ fontSize: 12, color: t.textMuted, letterSpacing: "0.1em", marginBottom: 10 }}>AUTOMATION HEATMAP {"\u2014"} ALL {tasks.length} TASKS</div>
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

export default function MortgageSpecialistApp() {
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
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: t.text, lineHeight: 1.2 }}>Mortgage Specialist / Underwriter</h1>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: t.textSecondary }}>
                Complete task atlas & AI automation readiness {"\u00B7"} {allTasks.length} tasks {"\u00B7"} {CATEGORIES.length} domains
                {simResults && <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 4, background: "#A855F720", color: "#A855F7", fontSize: 10, fontWeight: 700 }}>SIMULATION ACTIVE</span>}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ padding: "7px 14px", borderRadius: 8, background: t.bgCard, border: `1px solid ${t.border}`, fontSize: 11, color: t.textSecondary }}>{"\u{1F3E6}"} Residential Lending</div>
              <div style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", fontSize: 11, color: "#00E5A0", fontWeight: 600 }}>Fannie Mae / Basel</div>
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
              <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 16px 10px 36px", borderRadius: 10, background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: t.textMuted }}>{"\u2315"}</span>
            </div>
            <div style={{ fontSize: 12, color: t.textMuted }}>
              Showing {filtered.length} of {allTasks.length} tasks
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
          <div style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, marginBottom: 4 }}>Agentic AI Job Role Assessment Framework {"\u00B7"} Mortgage Specialist / Underwriter v1.0</div>
          <div style={{ fontSize: 11, color: t.textMuted }}>{"\u00A9"} {new Date().getFullYear()} Tarry Singh. All rights reserved.</div>
        </div>
      </div>
    </div>
  )
}
