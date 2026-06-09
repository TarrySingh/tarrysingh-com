"use client"

import type { CSSProperties } from "react"
import { Nav, ChapterRail, Reveal } from "@/components/humanoid/shell"
import { SectionMap, MarketModel } from "@/components/humanoid/charts"

// Phase-1 vertical slice: shell + hero + the ToC (#map) + Market Sizing (#market).
// The remaining 13 sections + their components land next, behind this same shell.
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
          <p className="lede">
            The whole story — the narrative, the data, and the workshop — in one canvas.{" "}
            <span className="accent">Built to be explored, not just read.</span>
          </p>
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

      <section className="band" id="market" style={{ "--chap": "var(--c-cyan)" } as CSSProperties}>
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">02 · Market Sizing · Interactive</div>
            <h2 className="sec-h">The forecasts disagree by 6×. Model it yourself.</h2>
            <p className="sec-sub">Drag the 2025 base and growth rate, or load an analyst scenario, and watch the 2035 projection move. The spread isn&apos;t disagreement about the destination — it&apos;s uncertainty about timing.</p>
          </Reveal>
          <Reveal><MarketModel /></Reveal>
        </div>
      </section>
    </>
  )
}
