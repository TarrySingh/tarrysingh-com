"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Layers, FileText, FlaskConical, Users, Network, BookOpen, SlidersHorizontal } from "lucide-react"
import type { MC102Data } from "@/lib/panoraima/types"
import MC102Console from "./MC102Console"
import { CorpusPanel, ConditionsPanel, AgreementPanel, ConflictPanel, MethodPanel } from "./MC102Panels"

const TABS = [
  { key: "console", label: "Label it yourself", icon: SlidersHorizontal },
  { key: "corpus", label: "Corpus", icon: FileText },
  { key: "conditions", label: "Conditions", icon: FlaskConical },
  { key: "agreement", label: "Agreement", icon: Users },
  { key: "conflict", label: "Conflict map", icon: Network },
  { key: "method", label: "Method", icon: BookOpen },
] as const

type TabKey = (typeof TABS)[number]["key"]

export default function MC102Explorer({ data }: { data: MC102Data }) {
  const [tab, setTab] = useState<TabKey>("console")
  const m = data.meta

  return (
    <div className="relative min-h-screen bg-[#F7F8FA]">
      {/* hero */}
      <section className="bg-[#16181D] pt-20 md:pt-24 pb-28">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Link
              href="/experiments/panoraima/wps/wp4"
              className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              WP4
            </Link>
            <Link
              href="/experiments/panoraima/wps"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              All WPs
            </Link>
          </div>

          <span className="font-mono text-[12px] font-bold tracking-[0.14em] text-[#4FB3D9]">
            {m.code}
          </span>
          <h1 className="mt-2 text-3xl md:text-[42px] font-bold tracking-tight text-white leading-[1.08] max-w-3xl">
            {m.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] md:text-base leading-relaxed text-white/70">
            The lesson argues that argument mining promises to recover <em>why</em> people hold
            positions, and that it does this reliably only in narrow settings. This tool tests
            that claim on a real corpus instead of repeating other people&rsquo;s numbers.
          </p>

          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
            <Stat n={m.n_articles} label="articles" />
            <Stat n={m.n_sentences} label="sentences" />
            <Stat n={m.communities.length - 1} label="discourse communities" />
            <Stat n={`${m.year_min}–${m.year_max}`} label="span" />
          </div>
        </div>
      </section>

      {/* honesty callout, pinned over the hero */}
      <div className="relative z-10 -mt-20 max-w-7xl mx-auto px-5 md:px-8">
        <div className="rounded-2xl border border-[#F0CFC6] bg-[#FBEAE5] px-5 py-4">
          <h2 className="text-[15px] font-bold text-[#7A2A16]">
            This tool shows measured results and gaps. It does not fill the gaps.
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#7A2A16] max-w-4xl">
            The corpus is real and the model predictions are real. The gold standard is not
            here yet: {m.sample_size} sentences are with Dorottya Egres for annotation, and{" "}
            {m.iaa_subset} of those need a second annotator before agreement can be computed.
            Until then there are no F1 scores and no agreement figure on this page, because
            both are comparisons and there is nothing yet to compare against. Neither is
            estimated, modelled, or filled in with a plausible-looking number.
          </p>
        </div>
      </div>

      {/* tabs */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 mt-7">
        <div role="tablist" aria-label="MC-102 sections" className="flex flex-wrap gap-1.5 border-b border-[#DCDDE1] pb-3">
          {TABS.map(t => {
            const Icon = t.icon
            const on = tab === t.key
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={on}
                aria-controls={`panel-${t.key}`}
                id={`tab-${t.key}`}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[11.5px] font-bold uppercase tracking-[0.08em] transition-colors ${
                  on ? "bg-[#16181D] text-white" : "text-[#5B616B] hover:bg-[#EDEEF0]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className="py-7 pb-24"
        >
          {tab === "console" && (
            <>
              <p className="mb-5 max-w-3xl text-[14px] leading-relaxed text-[#444B5A]">
                Pick a sentence, decide what it is, and commit. Only then does the panel open
                and show what the model said. Choosing first is the point: it is much harder
                to believe a model is obviously right once you have had to make the call
                yourself and found it difficult.
              </p>
              <MC102Console articles={data.articles} />
            </>
          )}
          {tab === "corpus" && <CorpusPanel articles={data.articles} meta={m} />}
          {tab === "conditions" && <ConditionsPanel data={data} />}
          {tab === "agreement" && <AgreementPanel data={data} />}
          {tab === "conflict" && <ConflictPanel data={data} />}
          {tab === "method" && <MethodPanel data={data} />}
        </div>
      </div>
    </div>
  )
}

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div>
      <p className="font-mono text-[26px] font-bold text-white leading-none">{n}</p>
      <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/45">{label}</p>
    </div>
  )
}
