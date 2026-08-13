"use client"

/**
 * V34 — THE GIANT FACTORY (the "from-scratch giants" bubble map), interactive.
 *
 * A reconstruction of the widely-shared chart: public, from-scratch companies
 * under 50 years old with a $10bn+ valuation, area ∝ value, grouped by region.
 * The US mints hundreds; "<50 years old" quietly disqualifies most of Europe's
 * champions (SAP 1972, the luxury and industrial houses), leaving a handful.
 *
 * Toggle to "The next wave" and the same machine runs again: the new AI / space
 * / defence cohort is, once more, overwhelmingly American — China the other
 * pole — while Europe's next generation is a rounding error.
 *
 * INTERACTIVE: tap (or keyboard-select) any bubble for a detail card —
 * valuation, public/private, sector, why it matters, and its source (every
 * figure carries a citation, for the Source Ledger).
 *
 * Honesty: public = solid (market cap); private = ringed/dashed (last funding
 * round). Figures approximate and labelled. SpaceX is public as of its
 * Jun-2026 IPO (the largest in history). Values verified mid-2026.
 */

import { useMemo, useRef, useState } from "react"

import { PlateFrame, useReadMode } from "./read-chart-kit"
import { cpPalette } from "./chokepoint-kit"

type Co = {
  name: string
  v: number // valuation, $bn
  priv?: boolean // private → ringed/dashed
  sector: string
  note: string // one-line "why it matters"
  src?: string // citation for the Source Ledger
}

// ── TODAY · 2024 ────────────────────────────────────────────────────────────
// Public, from scratch, < 50 years old, $10bn+ market cap (~2024).
const US_2024: Co[] = [
  { name: "Apple", v: 3400, sector: "Consumer tech", note: "The most valuable company ever built." },
  { name: "Nvidia", v: 5140, sector: "AI compute", note: "The picks-and-shovels monopoly of the AI boom · and now the world's most valuable company.", src: "https://companiesmarketcap.com/nvidia/marketcap/" },
  { name: "Microsoft", v: 3100, sector: "Software & cloud", note: "Azure + the OpenAI alliance." },
  { name: "Alphabet", v: 2100, sector: "Search & AI", note: "Google, DeepMind, Waymo." },
  { name: "Amazon", v: 1900, sector: "Commerce & cloud", note: "AWS funds everything else." },
  { name: "Meta", v: 1300, sector: "Social & AI", note: "Llama, the open-weight counterweight." },
  { name: "Broadcom", v: 1760, sector: "Semiconductors", note: "Custom AI silicon for the hyperscalers.", src: "https://companiesmarketcap.com/broadcom/marketcap/" },
  { name: "Tesla", v: 1512, sector: "EV & robotics", note: "Cars today, Optimus + autonomy tomorrow.", src: "https://companiesmarketcap.com/tesla/marketcap/" },
  { name: "UnitedHealth", v: 520, sector: "Healthcare", note: "" },
  { name: "Home Depot", v: 400, sector: "Retail", note: "" },
  { name: "Costco", v: 400, sector: "Retail", note: "" },
  { name: "Oracle", v: 380, sector: "Enterprise cloud", note: "The surprise AI-cloud comeback." },
  { name: "Netflix", v: 360, sector: "Media", note: "" },
  { name: "Salesforce", v: 320, sector: "Enterprise SaaS", note: "" },
  { name: "T-Mobile", v: 250, sector: "Telecom", note: "" },
  { name: "Adobe", v: 230, sector: "Creative software", note: "" },
  { name: "ServiceNow", v: 200, sector: "Enterprise SaaS", note: "" },
  { name: "Qualcomm", v: 190, sector: "Semiconductors", note: "" },
  { name: "Blackstone", v: 190, sector: "Asset management", note: "" },
  { name: "Booking", v: 170, sector: "Travel", note: "" },
  { name: "Uber", v: 160, sector: "Mobility", note: "" },
  { name: "BlackRock", v: 150, sector: "Asset management", note: "" },
  { name: "Micron", v: 110, sector: "Memory", note: "HBM · the other AI bottleneck." },
  { name: "Airbnb", v: 90, sector: "Travel", note: "" },
]
const EU_2024: Co[] = [
  { name: "ASML", v: 320, sector: "Semiconductor tools", note: "The one machine the world can't replace · and the whole point of this essay." },
  { name: "Spotify", v: 75, sector: "Media", note: "Europe's rare consumer-software champion." },
  { name: "Adyen", v: 50, sector: "Fintech", note: "" },
  { name: "argenx", v: 45, sector: "Biotech", note: "" },
  { name: "Wise", v: 14, sector: "Fintech", note: "" },
  { name: "Nexi", v: 12, sector: "Fintech", note: "" },
  { name: "Just Eat", v: 12, sector: "Delivery", note: "" },
  { name: "Delivery H.", v: 11, sector: "Delivery", note: "" },
]

// ── THE NEXT WAVE · 2026 ─────────────────────────────────────────────────────
// The AI / space / defence / robotics cohort. SpaceX public (Jun-2026 IPO);
// the rest mostly private (ringed) at last-round valuations. Values verified
// in the mid-2026 sweep; treat as approximate.
const US_NEXT: Co[] = [
  { name: "SpaceX", v: 2100, sector: "Space · defence · AI", note: "The largest IPO in history (Jun 2026) · and now a conglomerate: it absorbed xAI (Feb) and bought Cursor for $60bn (Jun). Starship, Starlink, Grok, all under one roof.", src: "https://www.cnbc.com/2026/06/12/spacex-stock-jumps-2-trillion.html" },
  { name: "Anthropic", v: 965, priv: true, sector: "Frontier AI", note: "Claude · a near-trillion-dollar private lab (Series H, May 2026).", src: "https://www.anthropic.com/news/series-h" },
  { name: "OpenAI", v: 852, priv: true, sector: "Frontier AI", note: "ChatGPT · the consumer-AI default; an IPO is being prepared.", src: "https://www.cnbc.com/2026/03/31/openai-funding-round-ipo.html" },
  { name: "Stripe", v: 159, priv: true, sector: "Fintech infra", note: "Payment rails for the internet economy.", src: "https://www.cnbc.com/2026/02/24/stripe-value-stock-sale-tender-offer.html" },
  { name: "Databricks", v: 134, priv: true, sector: "Data & AI", note: "The lakehouse · enterprise AI's data plane.", src: "https://www.cnbc.com/2026/02/09/databricks-completes-5-billion-funding-round-with-2-billion-in-debt.html" },
  { name: "Scale AI", v: 74, priv: true, sector: "AI data", note: "Training-data and eval backbone.", src: "https://www.premieralts.com/companies/scale-ai" },
  { name: "Anduril", v: 61, priv: true, sector: "Defence tech", note: "Autonomous defence; the Lattice OS (Series H, May 2026).", src: "https://www.bloomberg.com/news/articles/2026-05-13/anduril-valued-at-61-billion-in-round-led-by-thrive-andreessen" },
  { name: "Cerebras", v: 51, sector: "AI compute", note: "Wafer-scale inference silicon · public since its 2026 IPO.", src: "https://finance.yahoo.com/quote/CBRS/" },
  { name: "Thinking Machines", v: 50, priv: true, sector: "Frontier AI", note: "Mira Murati's research lab (Series B, Mar 2026).", src: "https://www.startuphub.ai/ai-news/ai-figures/2026/figure-mira-murati-company-financial-breakdown-2026-06-02" },
  { name: "Ramp", v: 44, priv: true, sector: "Fintech", note: "AI-native finance automation (Series F, Jun 2026).", src: "https://techcrunch.com/2026/06/04/ramp-raises-750m-at-44b-valuation-as-investors-hunger-for-fintechs-with-an-ai-story/" },
  { name: "Figure", v: 39, priv: true, sector: "Humanoid robotics", note: "General-purpose humanoid workers.", src: "https://www.figure.ai/news/series-c" },
  { name: "SSI", v: 32, priv: true, sector: "Frontier AI", note: "Sutskever's single-product superintelligence lab.", src: "https://www.startuphub.ai/ai-news/ai-figures/2026/figure-ilya-sutskever-ssi-financial-breakdown-2026-06-06" },
  { name: "Perplexity", v: 20, priv: true, sector: "AI search", note: "The answer-engine taking aim at Google (Series E, Jun 2026).", src: "https://www.cnbc.com/2026/06/09/perplexity-ipo-2028-as-anthropic-openai-prepare-listings.html" },
  { name: "Sierra", v: 16, priv: true, sector: "Agentic AI", note: "Bret Taylor's enterprise AI agents (Series E, May 2026).", src: "https://www.cnbc.com/2026/05/04/bret-taylor-sierra-fundraise-openai.html" },
  { name: "Shield AI", v: 13, priv: true, sector: "Defence tech", note: "Autonomous aircraft (Hivemind) · up 140% after a USAF deal.", src: "https://techcrunch.com/2026/03/26/defense-startup-shield-ai-lands-12-7b-valuation-up-140-after-u-s-air-force-deal/" },
  { name: "Physical Int.", v: 11, priv: true, sector: "Robotics AI", note: "Foundation models for robots (ex-DeepMind founders).", src: "https://www.bloomberg.com/news/articles/2026-03-27/ex-deepmind-staffers-robotics-startup-in-talks-for-11-billion-valuation" },
  { name: "Neuralink", v: 10, priv: true, sector: "Neurotech", note: "Brain–computer interface.", src: "https://neuralink.com/updates/neuralink-raises-650m-series-e/" },
  { name: "Groq", v: 7, priv: true, sector: "AI compute", note: "LPU inference · speed as the moat.", src: "https://groq.com/newsroom/groq-raises-750-million-as-inference-demand-surges" },
  { name: "Relativity", v: 4, priv: true, sector: "Space", note: "3D-printed rockets.", src: "https://finance.yahoo.com/quote/RESP.PVT/" },
]
const CN_NEXT: Co[] = [
  { name: "ByteDance", v: 600, priv: true, sector: "Social & AI", note: "TikTok / Douyin · a private giant; a Jun-2026 secondary put it at a record ~$600bn.", src: "https://www.scmp.com/tech/big-tech/article/3349337/bytedance-valuation-surges-record-high-over-us600b-proposed-equity-sale-sources" },
  { name: "Tencent", v: 499, sector: "Internet & gaming", note: "WeChat · the everything app.", src: "https://www.bloomberg.com/quote/700:HK" },
  { name: "Alibaba", v: 200, sector: "Commerce & cloud", note: "Qwen · China's open-weight frontier." },
  { name: "BYD", v: 150, sector: "EV", note: "The EV maker outselling Tesla (market cap approximate)." },
  { name: "PDD", v: 130, sector: "Commerce", note: "Pinduoduo / Temu.", src: "https://companiesmarketcap.com/pinduoduo/marketcap/" },
  { name: "Meituan", v: 95, sector: "Local services", note: "" },
  { name: "Xiaomi", v: 90, sector: "Hardware & EV", note: "" },
]
const EU_NEXT: Co[] = [
  { name: "Mistral", v: 20, priv: true, sector: "Frontier AI", note: "Europe's one credible frontier lab (Series D €3bn, Jun 2026).", src: "https://www.bloomberg.com/news/articles/2026-06-12/france-s-mistral-in-funding-talks-at-about-20-billion-valuation" },
  { name: "Helsing", v: 18, priv: true, sector: "Defence AI", note: "The continent's defence-AI hope (Series E $1.2bn, May 2026).", src: "https://techcrunch.com/2026/05/11/daniel-ek-backed-defense-tech-helsing-to-raise-1-2b-at-18b-valuation/" },
  { name: "Wayve", v: 10, priv: true, sector: "Autonomous driving", note: "" },
  { name: "Aleph α", v: 5, priv: true, sector: "Frontier AI", note: "" },
]
// India — the fourth pole: a from-scratch new-economy + IT cohort that now
// rivals Europe's. Jio's IPO was filed Jun 2026; several listed in 2024-26.
const IN_NEXT: Co[] = [
  { name: "Jio Platforms", v: 157, priv: true, sector: "Telecom & digital", note: "Reliance's digital arm · IPO filed Jun 2026, expected ~$133–180bn.", src: "https://www.businesstoday.in/markets/ipo-corner/story/jio-platforms-ipo-all-eyes-on-reliance-agm-2026-on-19-june-issue-valuation-expectations-537207-2026-06-16" },
  { name: "HDFC Bank", v: 127, sector: "Banking", note: "India's largest private bank (founded 1994).", src: "https://companiesmarketcap.com/hdfc-bank/marketcap/" },
  { name: "Bharti Airtel", v: 122, sector: "Telecom", note: "The South-Asian + African carrier (founded 1995).", src: "https://companiesmarketcap.com/inr/bharti-airtel/marketcap/" },
  { name: "Infosys", v: 51, sector: "IT services", note: "The original Indian software champion.", src: "https://companiesmarketcap.com/infosys/marketcap/" },
  { name: "Flipkart", v: 36, priv: true, sector: "E-commerce", note: "Walmart-owned; the home-grown Amazon rival.", src: "https://tracxn.com/d/companies/flipkart" },
  { name: "Eternal", v: 29, sector: "Delivery & commerce", note: "Zomato's parent · food + quick-commerce (Blinkit).", src: "https://companiesmarketcap.com/inr/eternal-zomato/marketcap/" },
  { name: "Groww", v: 15, sector: "Fintech", note: "The retail-investing platform that IPO'd in 2026.", src: "https://finance.yahoo.com/quote/GROWW.NS/" },
  { name: "PhonePe", v: 12, priv: true, sector: "Fintech", note: "India's dominant UPI payments app.", src: "https://tracxn.com/d/companies/phonepe" },
  { name: "Nykaa", v: 10, sector: "E-commerce", note: "Beauty + fashion commerce.", src: "https://companiesmarketcap.com/inr/nykaa/marketcap/" },
  { name: "Meesho", v: 9, sector: "E-commerce", note: "Social commerce for the next 500M users (IPO 2026).", src: "https://finance.yahoo.com/quote/MEESHO.NS/" },
]

const K = 1.15 // radius = sqrt(value) * K

type Placed = Co & { x: number; y: number; r: number; region: "us" | "eu" | "cn" | "in" }

function packCluster(cos: Co[], cx: number, cy: number, region: "us" | "eu" | "cn" | "in"): Placed[] {
  const items = cos
    .map((c) => ({ ...c, r: Math.sqrt(c.v) * K, x: cx, y: cy, region }))
    .sort((a, b) => b.r - a.r)
  const placed: Placed[] = []
  for (const it of items) {
    if (placed.length === 0) {
      placed.push(it)
      continue
    }
    let best: { x: number; y: number } | null = null
    let bestD = Infinity
    for (const pp of placed) {
      const gap = pp.r + it.r + 1.4
      for (let a = 0; a < 360; a += 5) {
        const rad = (a * Math.PI) / 180
        const x = pp.x + gap * Math.cos(rad)
        const y = pp.y + gap * Math.sin(rad)
        let ok = true
        for (const q of placed) {
          const dx = x - q.x
          const dy = y - q.y
          if (dx * dx + dy * dy < (q.r + it.r - 0.6) ** 2) {
            ok = false
            break
          }
        }
        if (!ok) continue
        const d = (x - cx) ** 2 + (y - cy) ** 2
        if (d < bestD) {
          bestD = d
          best = { x, y }
        }
      }
    }
    placed.push({ ...it, x: best ? best.x : cx, y: best ? best.y : cy })
  }
  return placed
}

const fmtT = (bn: number) => "$" + (bn / 1000).toFixed(1) + "t"
const fmtV = (bn: number) => (bn >= 1000 ? "$" + (bn / 1000).toFixed(2) + "t" : "$" + bn + "bn")

export function FromScratchGiants() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const [view, setView] = useState<"now" | "next">("now")
  const [sel, setSel] = useState<Placed | null>(null)
  const next = view === "next"

  const usData = useMemo(() => (next ? [...US_2024, ...US_NEXT] : US_2024), [next])
  const euData = useMemo(() => (next ? [...EU_2024, ...EU_NEXT] : EU_2024), [next])

  const us = useMemo(() => packCluster(usData, next ? 320 : 350, next ? 410 : 350, "us"), [usData, next])
  const eu = useMemo(() => packCluster(euData, next ? 905 : 880, next ? 130 : 310, "eu"), [euData, next])
  const cn = useMemo(() => (next ? packCluster(CN_NEXT, 900, 365, "cn") : []), [next])
  const india = useMemo(() => (next ? packCluster(IN_NEXT, 905, 585, "in") : []), [next])

  const usTot = usData.reduce((s, c) => s + c.v, 0)
  const euTot = euData.reduce((s, c) => s + c.v, 0)
  const cnTot = CN_NEXT.reduce((s, c) => s + c.v, 0)
  const inTot = IN_NEXT.reduce((s, c) => s + c.v, 0)
  const ratio = Math.round(usTot / euTot)

  const region = {
    us: { fill: p.leverage, hi: p.leverageHi },
    eu: { fill: p.wonder, hi: p.wonderHi },
    cn: { fill: p.squeeze, hi: p.squeezeHi },
    in: mode === "dark" ? { fill: "#a98fe0", hi: "#c7b4f0" } : { fill: "#6d4ca8", hi: "#8a68c4" },
  }

  // reset selection when toggling view (positions change)
  function setViewSafe(v: "now" | "next") {
    setSel(null)
    setView(v)
  }

  function Bubbles({ data, tone }: { data: Placed[]; tone: { fill: string; hi: string } }) {
    return (
      <>
        {data.map((c, i) => {
          const active = sel?.name === c.name && sel?.region === c.region
          return (
            <g
              key={c.name + i}
              role="button"
              tabIndex={0}
              aria-label={`${c.name}, ${fmtV(c.v)}, ${c.priv ? "private" : "public"}`}
              onClick={() => setSel(active ? null : c)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setSel(active ? null : c)
                }
              }}
              style={{ cursor: "pointer", outline: "none" }}
            >
              <circle
                cx={c.x}
                cy={c.y}
                r={c.r}
                fill={tone.fill}
                fillOpacity={active ? (c.priv ? 0.24 : 0.42) : c.priv ? 0.1 : 0.26}
                stroke={active ? tone.hi : c.priv ? tone.hi : tone.fill}
                strokeWidth={active ? 2.4 : c.priv ? 1.4 : 1}
                strokeDasharray={c.priv ? "3 3" : undefined}
              />
              {c.r > 22 && (
                <text
                  x={c.x}
                  y={c.y + 3}
                  textAnchor="middle"
                  fill={tone.hi}
                  style={{ fontSize: Math.min(13, c.r / 3.4), fontWeight: 700, pointerEvents: "none" }}
                >
                  {c.name}
                </text>
              )}
            </g>
          )
        })}
      </>
    )
  }

  const selTone = sel ? region[sel.region] : null

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V34 · The Giant Factory"
      controls={
        <div className="flex gap-1.5" role="group" aria-label="view">
          {([["now", "Today · 2024"], ["next", "The next wave · 2026"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setViewSafe(k)}
              aria-pressed={view === k}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                padding: "5px 10px",
                borderRadius: 7,
                cursor: "pointer",
                color: view === k ? p.wonderHi : p.soft,
                border: `1px solid ${view === k ? p.wonder : p.hair}`,
                background: "transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      }
      caption={
        <>
          Public, from-scratch companies under 50 years old with a $10bn+ valuation; area ∝ value.
          &ldquo;Under 50&rdquo; quietly disqualifies most of Europe&rsquo;s champions, leaving a handful.{" "}
          <span style={{ color: region.us.hi }}>US</span> ·{" "}
          <span style={{ color: region.eu.hi }}>Europe</span>
          {next && (
            <>
              {" "}·{" "}
              <span style={{ color: region.cn.hi }}>China</span>
              {" "}·{" "}
              <span style={{ color: region.in.hi }}>India</span>
            </>
          )}
          . Solid = public market cap; ringed = private last-round (approximate). SpaceX public since its
          Jun-2026 IPO. <span style={{ color: p.soft }}>Tap any bubble for detail + source.</span>
        </>
      }
    >
      <svg
        viewBox={next ? "0 0 1000 730" : "0 0 1000 640"}
        role="img"
        aria-label="Bubble map of from-scratch US, European and (in the next-wave view) Chinese and Indian companies, area proportional to value; tap a bubble for detail"
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <text x={next ? 300 : 350} y={next ? 56 : 60} textAnchor="middle" fill={region.us.hi} style={{ fontSize: 34, fontWeight: 800, letterSpacing: "0.08em" }}>
          US
        </text>
        <text x={next ? 905 : 880} y={next ? 66 : 200} textAnchor="middle" fill={region.eu.hi} style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.08em" }}>
          EU
        </text>
        {next && (
          <>
            <text x={900} y={296} textAnchor="middle" fill={region.cn.hi} style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.08em" }}>
              CHINA
            </text>
            <text x={905} y={524} textAnchor="middle" fill={region.in.hi} style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.08em" }}>
              INDIA
            </text>
          </>
        )}

        <Bubbles data={us} tone={region.us} />
        <Bubbles data={eu} tone={region.eu} />
        {next && <Bubbles data={cn} tone={region.cn} />}
        {next && <Bubbles data={india} tone={region.in} />}
      </svg>

      {/* Detail card — appears on selection */}
      {sel && selTone ? (
        <div
          className="mt-2 rounded-lg p-3.5"
          style={{ border: `1px solid ${selTone.fill}`, background: p.hair }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-2.5 min-w-0">
              <span style={{ color: selTone.hi, fontSize: 17, fontWeight: 800 }}>{sel.name}</span>
              <span
                style={{ fontFamily: "var(--font-mono), monospace", color: selTone.hi, fontSize: 15, fontWeight: 700 }}
              >
                {fmtV(sel.v)}
              </span>
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  color: sel.priv ? p.muted : selTone.hi,
                  border: `1px solid ${sel.priv ? p.hair : selTone.fill}`,
                }}
              >
                {sel.priv ? "private · last round" : "public · market cap"}
              </span>
            </div>
            <button
              onClick={() => setSel(null)}
              aria-label="Close detail"
              style={{ color: p.soft, fontSize: 16, cursor: "pointer", background: "none", border: "none", lineHeight: 1 }}
            >
              ×
            </button>
          </div>
          <p className="mt-1.5 text-[13.5px]" style={{ color: p.soft, fontFamily: "var(--font-mono), monospace" }}>
            {sel.sector}
          </p>
          {sel.note && (
            <p className="mt-1.5 text-[14px] leading-snug" style={{ color: p.muted, fontFamily: "var(--font-serif), serif" }}>
              {sel.note}
            </p>
          )}
          {sel.src && (
            <a
              href={sel.src}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-[11px]"
              style={{ fontFamily: "var(--font-mono), monospace", color: selTone.hi }}
            >
              source ↗
            </a>
          )}
        </div>
      ) : null}

      {/* totals readout */}
      <div
        className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1 px-1"
        style={{ fontFamily: "var(--font-mono), monospace" }}
      >
        <span style={{ color: region.us.hi, fontSize: 15, fontWeight: 700 }}>US {fmtT(usTot)}</span>
        <span style={{ color: region.eu.hi, fontSize: 15, fontWeight: 700 }}>EU {fmtT(euTot)}</span>
        {next && <span style={{ color: region.cn.hi, fontSize: 15, fontWeight: 700 }}>China {fmtT(cnTot)}</span>}
        {next && <span style={{ color: region.in.hi, fontSize: 15, fontWeight: 700 }}>India {fmtT(inTot)}</span>}
        <span style={{ color: p.muted, fontSize: 13 }}>
          {ratio}× the gap{next ? ", and widening" : ""}
        </span>
      </div>
    </PlateFrame>
  )
}
