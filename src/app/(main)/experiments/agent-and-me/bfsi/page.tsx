"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Lock, ArrowRight, TrendingUp, Shield, BarChart3, Wallet, Building2, Cpu, Users, Megaphone, Scale, HeartHandshake, Calculator, Briefcase, ChevronDown, ChevronUp } from "lucide-react"

interface JobRole {
  id: string
  name: string
  tagline: string
  icon: string
  taskCount: number
  avgScore: number
  status: "active" | "coming_soon"
  section: string
}

const SECTIONS = [
  { id: "credit_lending", name: "Credit & Lending", icon: TrendingUp, color: "#00E5A0" },
  { id: "risk_compliance", name: "Risk & Compliance", icon: Shield, color: "#FF6B6B" },
  { id: "trading_markets", name: "Trading & Capital Markets", icon: BarChart3, color: "#A855F7" },
  { id: "wealth_retail", name: "Wealth & Retail Banking", icon: Wallet, color: "#F59E0B" },
  { id: "insurance", name: "Insurance", icon: HeartHandshake, color: "#3B82F6" },
  { id: "tech_data", name: "Technology & Data", icon: Cpu, color: "#06B6D4" },
  { id: "operations", name: "Operations", icon: Building2, color: "#8B5CF6" },
  { id: "finance_accounting", name: "Finance & Accounting", icon: Calculator, color: "#10B981" },
  { id: "hr", name: "Human Resources", icon: Users, color: "#EC4899" },
  { id: "marketing", name: "Marketing & Communications", icon: Megaphone, color: "#F97316" },
  { id: "legal", name: "Legal & Governance", icon: Scale, color: "#64748B" },
]

const ROLES: JobRole[] = [
  // Credit & Lending
  { id: "credit-risk-modeler", name: "Credit Risk Modeler", tagline: "PD/LGD/EAD modeling, Basel IRB, IFRS 9", icon: "📊", taskCount: 42, avgScore: 62, status: "active", section: "credit_lending" },
  { id: "mortgage-specialist", name: "Mortgage Specialist / Underwriter", tagline: "Underwriting, affordability, property valuation, compliance", icon: "🏠", taskCount: 42, avgScore: 68, status: "active", section: "credit_lending" },
  { id: "consumer-lending-analyst", name: "Consumer Lending Analyst", tagline: "Personal loans, auto finance, credit cards, BNPL, scorecards", icon: "💳", taskCount: 34, avgScore: 70, status: "active", section: "credit_lending" },
  { id: "commercial-credit-analyst", name: "Commercial Credit Analyst", tagline: "Corporate lending, financial spreads, covenants", icon: "🏢", taskCount: 30, avgScore: 55, status: "coming_soon", section: "credit_lending" },
  { id: "credit-portfolio-manager", name: "Credit Portfolio Manager", tagline: "Concentration risk, portfolio analytics, stress testing", icon: "📈", taskCount: 26, avgScore: 61, status: "coming_soon", section: "credit_lending" },
  { id: "collections-recovery", name: "Collections & Recovery Specialist", tagline: "Delinquency management, workout strategies, NPL", icon: "🔄", taskCount: 24, avgScore: 72, status: "coming_soon", section: "credit_lending" },
  { id: "loan-officer", name: "Loan Officer / Originator", tagline: "Application processing, decisioning, disbursement", icon: "📋", taskCount: 22, avgScore: 75, status: "coming_soon", section: "credit_lending" },

  // Risk & Compliance
  { id: "market-risk-analyst", name: "Market Risk Analyst", tagline: "VaR, stress testing, trading book risk", icon: "📉", taskCount: 30, avgScore: 60, status: "coming_soon", section: "risk_compliance" },
  { id: "operational-risk-manager", name: "Operational Risk Manager", tagline: "RCSA, incident management, BCP", icon: "⚠️", taskCount: 28, avgScore: 52, status: "coming_soon", section: "risk_compliance" },
  { id: "liquidity-risk-analyst", name: "Liquidity Risk Analyst", tagline: "LCR/NSFR, cash flow forecasting, contingency funding", icon: "💧", taskCount: 24, avgScore: 58, status: "coming_soon", section: "risk_compliance" },
  { id: "compliance-officer", name: "Compliance Officer (AML/KYC)", tagline: "Anti-money laundering, sanctions screening, CDD", icon: "🛡️", taskCount: 34, avgScore: 70, status: "coming_soon", section: "risk_compliance" },
  { id: "regulatory-reporting", name: "Regulatory Reporting Analyst", tagline: "COREP, FINREP, Fed reporting, data quality", icon: "📑", taskCount: 26, avgScore: 73, status: "coming_soon", section: "risk_compliance" },
  { id: "internal-auditor", name: "Internal Auditor", tagline: "Audit planning, testing, issue tracking", icon: "🔍", taskCount: 28, avgScore: 56, status: "coming_soon", section: "risk_compliance" },
  { id: "fraud-detection-analyst", name: "Fraud Detection Analyst", tagline: "Transaction monitoring, pattern analysis, SAR filing", icon: "🚨", taskCount: 30, avgScore: 76, status: "coming_soon", section: "risk_compliance" },
  { id: "model-validation-analyst", name: "Model Validation Analyst", tagline: "Independent model review, SR 11-7, ECB TRIM, challenger models", icon: "✅", taskCount: 30, avgScore: 50, status: "coming_soon", section: "risk_compliance" },
  { id: "stress-testing-analyst", name: "Stress Testing Analyst", tagline: "CCAR/DFAST, EBA stress tests, scenario design, satellite models", icon: "🌪️", taskCount: 28, avgScore: 55, status: "coming_soon", section: "risk_compliance" },

  // Trading & Capital Markets
  { id: "quantitative-analyst", name: "Quantitative Analyst (Quant)", tagline: "Pricing models, algo development, backtesting", icon: "🧮", taskCount: 32, avgScore: 48, status: "coming_soon", section: "trading_markets" },
  { id: "fixed-income-trader", name: "Fixed Income Trader", tagline: "Bond trading, yield curve, duration management", icon: "💰", taskCount: 26, avgScore: 52, status: "coming_soon", section: "trading_markets" },
  { id: "equity-research-analyst", name: "Equity Research Analyst", tagline: "Company analysis, DCF models, sector coverage", icon: "🔬", taskCount: 28, avgScore: 65, status: "coming_soon", section: "trading_markets" },
  { id: "derivatives-analyst", name: "Derivatives Analyst / Structurer", tagline: "Options, swaps, Greeks, exotic structures, client solutions", icon: "⚡", taskCount: 30, avgScore: 45, status: "coming_soon", section: "trading_markets" },
  { id: "treasury-alm", name: "Treasury / ALM Analyst", tagline: "Asset-liability management, interest rate risk, FTP", icon: "🏛️", taskCount: 26, avgScore: 57, status: "coming_soon", section: "trading_markets" },
  { id: "investment-banking-analyst", name: "Investment Banking Analyst", tagline: "M&A advisory, ECM/DCM, financial modeling, pitch books", icon: "🏦", taskCount: 32, avgScore: 48, status: "coming_soon", section: "trading_markets" },
  { id: "trade-finance-specialist", name: "Trade Finance Specialist", tagline: "Letters of credit, guarantees, supply chain finance, documentary", icon: "🚢", taskCount: 26, avgScore: 65, status: "coming_soon", section: "trading_markets" },

  // Wealth & Retail
  { id: "relationship-manager", name: "Relationship Manager", tagline: "Private banking, portfolio advisory, HNW clients", icon: "🤝", taskCount: 28, avgScore: 45, status: "coming_soon", section: "wealth_retail" },
  { id: "financial-advisor", name: "Financial Advisor / Planner", tagline: "Retirement planning, tax optimization, estate", icon: "🎯", taskCount: 30, avgScore: 50, status: "coming_soon", section: "wealth_retail" },
  { id: "retail-product-manager", name: "Retail Banking Product Manager", tagline: "Account products, pricing, digital channels", icon: "📱", taskCount: 26, avgScore: 62, status: "coming_soon", section: "wealth_retail" },
  { id: "payment-systems", name: "Payment Systems Analyst", tagline: "SWIFT, SEPA, real-time payments, settlement", icon: "💸", taskCount: 24, avgScore: 68, status: "coming_soon", section: "wealth_retail" },

  // Insurance (expanded from 2 to 5 roles)
  { id: "actuarial-analyst", name: "Actuarial Analyst", tagline: "Reserving, pricing, capital modeling, Solvency II, mortality tables", icon: "📐", taskCount: 32, avgScore: 52, status: "coming_soon", section: "insurance" },
  { id: "insurance-underwriter", name: "Insurance Underwriter", tagline: "Risk assessment, policy terms, premium setting", icon: "📝", taskCount: 28, avgScore: 63, status: "coming_soon", section: "insurance" },
  { id: "claims-analyst", name: "Claims Analyst / Adjuster", tagline: "Claims processing, fraud detection, settlement, subrogation", icon: "📋", taskCount: 26, avgScore: 72, status: "coming_soon", section: "insurance" },
  { id: "insurance-product-manager", name: "Insurance Product Manager", tagline: "Product design, pricing strategy, regulatory approval, distribution", icon: "🎁", taskCount: 24, avgScore: 55, status: "coming_soon", section: "insurance" },
  { id: "insurance-risk-manager", name: "Insurance Risk Manager", tagline: "Solvency II, catastrophe modeling, reinsurance optimization", icon: "🛡️", taskCount: 28, avgScore: 48, status: "coming_soon", section: "insurance" },

  // Technology & Data (added Data Scientist)
  { id: "data-engineer", name: "Data Engineer (Banking)", tagline: "ETL pipelines, data lakes, regulatory data", icon: "🔧", taskCount: 30, avgScore: 72, status: "coming_soon", section: "tech_data" },
  { id: "cloud-architect", name: "IT / Cloud Architect", tagline: "Infrastructure, migration, hybrid cloud", icon: "☁️", taskCount: 28, avgScore: 65, status: "coming_soon", section: "tech_data" },
  { id: "cybersecurity-analyst", name: "Cybersecurity Analyst", tagline: "Threat detection, incident response, pen testing", icon: "🔒", taskCount: 32, avgScore: 68, status: "coming_soon", section: "tech_data" },
  { id: "core-banking-developer", name: "Software Engineer (Core Banking)", tagline: "Core systems, APIs, microservices, Temenos/FIS", icon: "💻", taskCount: 34, avgScore: 60, status: "coming_soon", section: "tech_data" },
  { id: "bi-analyst", name: "Business Intelligence Analyst", tagline: "Dashboards, MIS reporting, data visualization", icon: "📊", taskCount: 24, avgScore: 78, status: "coming_soon", section: "tech_data" },
  { id: "data-scientist", name: "Data Scientist / ML Engineer", tagline: "Machine learning, NLP, predictive models, AI deployment", icon: "🤖", taskCount: 30, avgScore: 58, status: "coming_soon", section: "tech_data" },

  // Operations (added Business Analyst)
  { id: "back-office-ops", name: "Back Office Operations", tagline: "Trade settlement, reconciliation, confirmations", icon: "⚙️", taskCount: 26, avgScore: 80, status: "coming_soon", section: "operations" },
  { id: "contact-center-agent", name: "Customer Service Agent", tagline: "Contact center, complaints, service requests", icon: "🎧", taskCount: 22, avgScore: 82, status: "coming_soon", section: "operations" },
  { id: "process-improvement", name: "Process Improvement / Transformation Analyst", tagline: "Lean, agile, automation, digital transformation", icon: "🔄", taskCount: 24, avgScore: 70, status: "coming_soon", section: "operations" },
  { id: "procurement-specialist", name: "Procurement Specialist", tagline: "Vendor management, RFPs, contract negotiation", icon: "📦", taskCount: 22, avgScore: 65, status: "coming_soon", section: "operations" },
  { id: "business-analyst", name: "Business Analyst", tagline: "Requirements gathering, process mapping, UAT, stakeholder liaison", icon: "📐", taskCount: 26, avgScore: 62, status: "coming_soon", section: "operations" },

  // Finance & Accounting
  { id: "management-accountant", name: "Management Accountant", tagline: "Cost allocation, budgeting, variance analysis", icon: "📒", taskCount: 26, avgScore: 70, status: "coming_soon", section: "finance_accounting" },
  { id: "fpa-analyst", name: "FP&A Analyst", tagline: "Forecasting, financial planning, board packs", icon: "📊", taskCount: 24, avgScore: 72, status: "coming_soon", section: "finance_accounting" },
  { id: "tax-specialist", name: "Tax Specialist", tagline: "Corporate tax, transfer pricing, regulatory filings", icon: "🏛️", taskCount: 22, avgScore: 58, status: "coming_soon", section: "finance_accounting" },

  // Human Resources
  { id: "hr-business-partner", name: "HR Business Partner", tagline: "Workforce planning, employee relations, HRIS", icon: "👥", taskCount: 24, avgScore: 55, status: "coming_soon", section: "hr" },
  { id: "recruiter", name: "Talent Acquisition / Recruiter", tagline: "Sourcing, screening, employer branding", icon: "🎯", taskCount: 22, avgScore: 74, status: "coming_soon", section: "hr" },
  { id: "learning-development", name: "L&D Specialist", tagline: "Training programs, competency frameworks, LMS", icon: "🎓", taskCount: 20, avgScore: 68, status: "coming_soon", section: "hr" },

  // Marketing & Communications
  { id: "digital-marketing", name: "Digital Marketing Manager", tagline: "SEO/SEM, social media, campaign analytics", icon: "📣", taskCount: 26, avgScore: 78, status: "coming_soon", section: "marketing" },
  { id: "product-marketing", name: "Product Marketing Manager", tagline: "Positioning, competitive intel, campaign strategy", icon: "🚀", taskCount: 24, avgScore: 68, status: "coming_soon", section: "marketing" },
  { id: "corporate-comms", name: "Corporate Communications", tagline: "Press releases, investor relations, crisis comms", icon: "📰", taskCount: 22, avgScore: 62, status: "coming_soon", section: "marketing" },

  // Legal & Governance
  { id: "legal-counsel", name: "Legal Counsel (Banking)", tagline: "Regulatory law, contracts, litigation support", icon: "⚖️", taskCount: 26, avgScore: 42, status: "coming_soon", section: "legal" },
  { id: "corporate-secretary", name: "Corporate Secretary", tagline: "Board governance, filings, policy management", icon: "📜", taskCount: 20, avgScore: 60, status: "coming_soon", section: "legal" },
  { id: "esg-analyst", name: "ESG / Sustainable Finance Analyst", tagline: "EU Taxonomy, SFDR, climate risk, green bonds, impact reporting", icon: "🌱", taskCount: 26, avgScore: 50, status: "coming_soon", section: "legal" },
]

function getLevel(score: number) {
  if (score >= 85) return { label: "Full Auto", color: "#00E5A0" }
  if (score >= 70) return { label: "High Auto", color: "#3B82F6" }
  if (score >= 55) return { label: "Augmented", color: "#F59E0B" }
  if (score >= 40) return { label: "Assisted", color: "#F97316" }
  return { label: "Human-Led", color: "#FF6B6B" }
}

export default function BFSIHub() {
  const [search, setSearch] = useState("")
  const [darkMode, setDarkMode] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(SECTIONS.map(s => s.id)))

  const t = darkMode
    ? { bg: "#0F1117", bgCard: "#1A1D2A", bgCardHover: "#222536", border: "rgba(255,255,255,0.08)", text: "#F1F2F6", textSecondary: "#A0A4B8", textMuted: "#6B7280", accent: "#C8A961", green: "#00E5A0", headerBg: "linear-gradient(135deg, #0F1117 0%, #1A1D2A 100%)" }
    : { bg: "#F0F1F3", bgCard: "#FFFFFF", bgCardHover: "#F7F8FA", border: "rgba(0,0,0,0.10)", text: "#1A1D26", textSecondary: "#4A5068", textMuted: "#6B7280", accent: "#B8942E", green: "#059669", headerBg: "linear-gradient(135deg, #F7F8FA 0%, #FFFFFF 100%)" }

  const filtered = ROLES.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.tagline.toLowerCase().includes(search.toLowerCase()) ||
    r.section.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const activeCount = ROLES.filter(r => r.status === "active").length
  const totalTasks = ROLES.reduce((a, r) => a + r.taskCount, 0)

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Breadcrumb */}
      <div style={{ paddingTop: 80, paddingBottom: 8, background: darkMode ? "transparent" : "#F7F8FA" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: t.textMuted }}>
            <Link href="/experiments" style={{ color: t.textMuted, textDecoration: "none" }}>Experiments</Link>
            <span>/</span>
            <Link href="/experiments/agent-and-me" style={{ color: t.textMuted, textDecoration: "none" }}>The Agent & Me</Link>
            <span>/</span>
            <span style={{ color: t.text, fontWeight: 600 }}>BFSI</span>
          </div>
          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <Link href="/experiments/agent-and-me" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: t.textMuted, textDecoration: "none" }}>
              <ArrowLeft size={14} />
              Back to Industry Verticals
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.12em", color: t.green, fontWeight: 700 }}>{"●"} AGENTIC AI ASSESSMENT FRAMEWORK</span>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: t.text, margin: 0, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              BFSI — Banking, Financial Services & Insurance
            </h1>
            <p style={{ fontSize: 15, color: t.textSecondary, marginTop: 8, maxWidth: 700, lineHeight: 1.6 }}>
              Explore AI automation readiness across <strong style={{ color: t.text }}>{ROLES.length} job roles</strong> spanning
              core banking, risk, trading, insurance, and support functions.
              Each role is assessed across 20-35 skills with domain-specific AI scoring.
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bgCard, color: t.text, fontSize: 13, cursor: "pointer", fontWeight: 600 }}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", gap: 24, marginTop: 24, flexWrap: "wrap" }}>
          {[
            { label: "TOTAL ROLES", value: String(ROLES.length), color: t.accent },
            { label: "ACTIVE", value: String(activeCount), color: t.green },
            { label: "TOTAL SKILLS", value: `${totalTasks}+`, color: "#A855F7" },
            { label: "SECTIONS", value: String(SECTIONS.length), color: "#3B82F6" },
          ].map(s => (
            <div key={s.label} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 10, padding: "12px 20px", minWidth: 120, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: s.color }} />
              <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginTop: 24, maxWidth: 480 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
          <input
            type="text"
            placeholder="Search roles, domains, or functions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 16px 12px 40px", borderRadius: 10, background: t.bgCard, border: `1px solid ${t.border}`, color: t.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
          />
        </div>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 64px" }}>
        {SECTIONS.map(section => {
          const sectionRoles = filtered.filter(r => r.section === section.id)
          if (sectionRoles.length === 0) return null
          const Icon = section.icon
          const isExpanded = expandedSections.has(section.id)

          return (
            <div key={section.id} style={{ marginTop: 32 }}>
              <button
                onClick={() => toggleSection(section.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, width: "100%" }}
              >
                <Icon size={18} style={{ color: section.color }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: section.color, letterSpacing: "0.06em" }}>{section.name.toUpperCase()}</span>
                <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 500 }}>({sectionRoles.length})</span>
                <div style={{ flex: 1, height: 1, background: t.border, margin: "0 8px" }} />
                {isExpanded ? <ChevronUp size={16} style={{ color: t.textMuted }} /> : <ChevronDown size={16} style={{ color: t.textMuted }} />}
              </button>

              {isExpanded && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginTop: 16 }}>
                  {sectionRoles.map(role => {
                    const level = getLevel(role.avgScore)
                    const isActive = role.status === "active"

                    const card = (
                      <div
                        key={role.id}
                        style={{
                          background: t.bgCard,
                          border: `1px solid ${isActive ? section.color + "40" : t.border}`,
                          borderRadius: 14,
                          padding: "18px 20px",
                          cursor: isActive ? "pointer" : "default",
                          transition: "all 0.2s",
                          position: "relative",
                          overflow: "hidden",
                          opacity: isActive ? 1 : 0.7,
                        }}
                      >
                        {isActive && (
                          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: `linear-gradient(90deg, ${section.color}, ${section.color}60)` }} />
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                            <span style={{ fontSize: 24 }}>{role.icon}</span>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: t.text, lineHeight: 1.3 }}>{role.name}</div>
                              <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2, lineHeight: 1.4 }}>{role.tagline}</div>
                            </div>
                          </div>
                          {isActive ? (
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#00E5A0", background: "rgba(0,229,160,0.1)", padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(0,229,160,0.2)", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>ACTIVE</span>
                          ) : (
                            <Lock size={14} style={{ color: t.textMuted, flexShrink: 0, marginTop: 4 }} />
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: 11, color: t.textMuted }}>{role.taskCount} skills assessed</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: level.color, fontFamily: "'DM Mono', monospace" }}>{role.avgScore}%</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 2, background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                              <div style={{ width: `${role.avgScore}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${section.color}90, ${section.color})`, transition: "width 0.6s ease" }} />
                            </div>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: level.color, background: level.color + "12", padding: "3px 8px", borderRadius: 5, border: `1px solid ${level.color}25`, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                            {level.label.toUpperCase()}
                          </span>
                        </div>

                        {isActive && (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 12, fontSize: 12, color: section.color, fontWeight: 600 }}>
                            Explore Assessment <ArrowRight size={14} />
                          </div>
                        )}
                        {!isActive && (
                          <div style={{ marginTop: 12, fontSize: 11, color: t.textMuted, fontStyle: "italic" }}>Coming soon</div>
                        )}
                      </div>
                    )

                    return isActive ? (
                      <Link key={role.id} href={`/experiments/agent-and-me/bfsi/${role.id}`} style={{ textDecoration: "none" }}>
                        {card}
                      </Link>
                    ) : (
                      <div key={role.id}>{card}</div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${t.border}`, padding: "24px 0", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>
          Agentic AI Assessment Framework by Tarry Singh — {ROLES.length} roles across {SECTIONS.length} domains
        </p>
      </div>
    </div>
  )
}
