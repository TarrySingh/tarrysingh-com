"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Download, FileText, Settings2 } from "lucide-react"
import Link from "next/link"
import { NAV } from "./nav"
import { Tag } from "./primitives"
import Tweaks from "./Tweaks"
import {
  Section01_Cover, Section02_TOC, Section03_ExecSummary, Section04_KeyMetrics,
  Section05_ChapterAccel, Section06_ModelEfficiency, Section07_CostPerf,
  Section08_Users, Section09_CorpAdoption, Section10_Benchmarks,
} from "./sections/sections-01-10"
import {
  Section11_Loops, Section12_TechBreakthroughs, Section13_Multimodal,
  Section14_Agentic, Section15_Convergence, Section16_Maturity,
  Section17_ChapterGeo, Section18_Sovereign, Section19_USChina, Section20_RestAndBridge,
} from "./sections/sections-11-20"
import {
  Section21_ChapterRegional,
  Section22_US, Section23_China, Section24_EU, Section25_UK,
  Section26_ME, Section27_India, Section28_ROW,
  Section29_RegionalCompare, Section30_HOMINIS, Section31_RealBusiness,
  Section32_ChapterInvest, Section33_InvestFlows, Section34_TopRecipients,
  Section35_SectorBreak, Section36_BusinessFunc,
  Section37_ChapterCompute, Section38_Hardware, Section39_DataCenters, Section40_Quantum,
} from "./sections/sections-21-40"
import {
  Section41_Energy, Section42_Renewables, Section43_Efficiency, Section44_Edge,
  Section45_ChapterIP, Section46_IPCases, Section47_IPRegional, Section48_IPStrategy,
  Section49_ChapterSafety, Section50_Risks, Section51_Mitigations, Section52_Principles, Section53_Responsible,
  Section54_ChapterReg, Section55_RegTimeline, Section56_RegStance, Section57_EUAct, Section58_GlobalPolicy,
  Section59_Compliance, Section60_SocietalGood,
} from "./sections/sections-41-60"
import {
  Section61_ChapterStrategy, Section62_Principles, Section63_CXOPlaybook,
  Section64_PolicyPlaybook, Section65_SocietalGood, Section66_Workforce,
  Section67_Scenarios, Section68_Conclusion, Section69_ChapterAppendix,
  Section70_AccelTable, Section71_Milestones, Section72_Methodology,
  Section73_Glossary, Section74_References, Section75_Colophon,
} from "./sections/sections-61-75"

const PPTX_MAILTO =
  "mailto:tarry.singh@gmail.com" +
  "?subject=" + encodeURIComponent("Insane Pace of AI, PPTX version request") +
  "&body=" + encodeURIComponent(
    "Hi Tarry,\n\nI'd like the PPTX version of the Q1 2026 Insane Pace of AI executive dashboard. Please share the paid option / invoice details.\n\nThanks,\n"
  )

function fmtToday(d: Date) {
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase()
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${month} ${day}, ${d.getUTCFullYear()}`
}

export default function Dashboard() {
  const [active, setActive] = useState("s-01")
  const [now, setNow] = useState<Date | null>(null)
  const [accent, setAccent] = useState("#E8542B")
  const [tweaksOpen, setTweaksOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.style.setProperty("--signal", accent)
    }
  }, [accent])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (vis[0]) setActive(vis[0].target.id)
      },
      { threshold: [0.15, 0.3, 0.55], rootMargin: "-20% 0px -50% 0px" }
    )
    document.querySelectorAll(".ipoai-root .section").forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  const jump = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handlePrint = () => {
    window.print()
  }

  const timeStr = now ? now.toISOString().slice(11, 19) + " UTC" : ", "
  const dateStr = now ? fmtToday(now) : ", "

  return (
    <div className="ipoai-root" ref={rootRef}>
      <div className="shell">
        <header className="chrome">
          <div className="chrome-inner">
            <Link
              href="/experiments"
              aria-label="Back to experiments"
              className="ipoai-chrome-btn"
            >
              <ArrowLeft size={12} />
              Back
            </Link>
            <div className="chrome-brand">
              <span className="mark" />
              <span>TARRY&nbsp;SINGH</span>
            </div>
            <div style={{ height: 20, width: 1, background: "var(--rule)" }} />
            <div className="chrome-title">The Insane Pace of <em>Accelerating AI</em></div>
            <Tag tone="signal">Q1 2026 · EXEC</Tag>
            <div className="chrome-meta">
              <span>
                <span className="live-dot" />
                LIVE
              </span>
              <span>{dateStr}</span>
              <span className="chrome-tick">{timeStr}</span>
              <button
                type="button"
                onClick={handlePrint}
                className="ipoai-chrome-btn"
                title="Download this dashboard as a PDF via your browser's print dialog"
              >
                <FileText size={12} />
                PDF
              </button>
              <a
                href={PPTX_MAILTO}
                className="ipoai-chrome-btn ipoai-chrome-btn--paid"
                title="PPTX version available as a paid option · request by email"
              >
                <Download size={12} />
                PPTX
                <span className="ipoai-chrome-btn__tag">$</span>
              </a>
              <button
                type="button"
                onClick={() => setTweaksOpen((v) => !v)}
                className={`ipoai-chrome-btn ${tweaksOpen ? "on" : ""}`}
                aria-pressed={tweaksOpen}
                title="Open the tweaks panel"
              >
                <Settings2 size={12} />
                Tweaks
              </button>
            </div>
          </div>
        </header>

        <aside className="nav" aria-label="Report sections">
          {NAV.map((g) => (
            <div className="nav-group" key={g.group}>
              <div className="nav-group-label">
                <span>{g.group}</span>
                <span>{g.items.length}</span>
              </div>
              {g.items.map((it) => (
                <button
                  key={it.id}
                  className={`nav-item ${active === it.id ? "active" : ""}`}
                  onClick={() => jump(it.id)}
                  aria-current={active === it.id ? "location" : undefined}
                >
                  <span className="num">{it.n}</span>
                  <span>{it.name}</span>
                  <span className="pg">{it.pg}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="main" ref={mainRef}>
          <Section01_Cover />
          <Section02_TOC onJump={jump} />
          <Section03_ExecSummary />
          <Section04_KeyMetrics />
          <Section05_ChapterAccel />
          <Section06_ModelEfficiency />
          <Section07_CostPerf />
          <Section08_Users />
          <Section09_CorpAdoption />
          <Section10_Benchmarks />
          <Section11_Loops />
          <Section12_TechBreakthroughs />
          <Section13_Multimodal />
          <Section14_Agentic />
          <Section15_Convergence />
          <Section16_Maturity />
          <Section17_ChapterGeo />
          <Section18_Sovereign />
          <Section19_USChina />
          <Section20_RestAndBridge />
          <Section21_ChapterRegional />
          <Section22_US />
          <Section23_China />
          <Section24_EU />
          <Section25_UK />
          <Section26_ME />
          <Section27_India />
          <Section28_ROW />
          <Section29_RegionalCompare />
          <Section30_HOMINIS />
          <Section31_RealBusiness />
          <Section32_ChapterInvest />
          <Section33_InvestFlows />
          <Section34_TopRecipients />
          <Section35_SectorBreak />
          <Section36_BusinessFunc />
          <Section37_ChapterCompute />
          <Section38_Hardware />
          <Section39_DataCenters />
          <Section40_Quantum />
          <Section41_Energy />
          <Section42_Renewables />
          <Section43_Efficiency />
          <Section44_Edge />
          <Section45_ChapterIP />
          <Section46_IPCases />
          <Section47_IPRegional />
          <Section48_IPStrategy />
          <Section49_ChapterSafety />
          <Section50_Risks />
          <Section51_Mitigations />
          <Section52_Principles />
          <Section53_Responsible />
          <Section54_ChapterReg />
          <Section55_RegTimeline />
          <Section56_RegStance />
          <Section57_EUAct />
          <Section58_GlobalPolicy />
          <Section59_Compliance />
          <Section60_SocietalGood />
          <Section61_ChapterStrategy />
          <Section62_Principles />
          <Section63_CXOPlaybook />
          <Section64_PolicyPlaybook />
          <Section65_SocietalGood />
          <Section66_Workforce />
          <Section67_Scenarios />
          <Section68_Conclusion />
          <Section69_ChapterAppendix />
          <Section70_AccelTable />
          <Section71_Milestones />
          <Section72_Methodology />
          <Section73_Glossary />
          <Section74_References />
          <Section75_Colophon />

          <div
            style={{
              padding: "32px 56px 60px",
              borderTop: "1px solid var(--rule)",
              fontFamily: "var(--mono)",
              fontSize: 10,
              color: "var(--fg-4)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              display: "flex",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <span>© 2026 TARRY SINGH · ALL RIGHTS RESERVED</span>
            <span>PAGE 075 / 075 · END OF REPORT</span>
            <span>v26.04.21 · NEXT REFRESH MAY 19</span>
          </div>
        </main>
      </div>

      {tweaksOpen && (
        <Tweaks
          accent={accent}
          setAccent={setAccent}
          onClose={() => setTweaksOpen(false)}
          onJump={(id) => {
            jump(id)
            setTweaksOpen(false)
          }}
        />
      )}
    </div>
  )
}
