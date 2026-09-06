"use client"

import { useState } from "react"
import Link from "next/link"
import type { MC102Data } from "@/lib/panoraima/types"
import MC102Console from "./MC102Console"
import { CorpusPanel, ConditionsPanel, AgreementPanel, ConflictPanel, MethodPanel } from "./MC102Panels"
import type { MC102GraphSummary } from "./MC102Panels"
import s from "./mc102.module.css"

const TABS = [
  { key: "console", label: "Label it yourself" },
  { key: "corpus", label: "Corpus" },
  { key: "conditions", label: "Conditions" },
  { key: "agreement", label: "Agreement" },
  { key: "conflict", label: "Conflict map" },
  { key: "method", label: "Method" },
] as const

type TabKey = (typeof TABS)[number]["key"]

export default function MC102Explorer({
  data,
  graph,
}: {
  data: MC102Data
  graph?: MC102GraphSummary
}) {
  const [tab, setTab] = useState<TabKey>("console")
  const m = data.meta

  return (
    <div className={s.lab}>
      <div className={s.wrap} style={{ paddingTop: "5.5rem", paddingBottom: "2rem" }}>
        <p className={s.eyebrow}>
          <Link href="/experiments/panoraima/wps/wp4" style={{ color: "inherit" }}>
            ← WP4
          </Link>
          {`  ·  ${m.code}`}
        </p>
        <h1 className={s.h1}>{m.title}</h1>
        <p className={s.lede}>
          The lesson argues that argument mining promises to recover <em>why</em> people hold
          positions, and that it delivers on that only in narrow settings. This tool tests the
          claim on a real corpus instead of repeating other people&rsquo;s numbers.
        </p>

        <div className={s.statRow} style={{ marginTop: "1.5rem" }}>
          <Stat n={m.n_articles} label="articles" />
          <Stat n={m.n_sentences} label="sentences" />
          <Stat n={m.communities.length - 1} label="discourse communities" />
          <Stat n={`${m.year_min}–${m.year_max}`} label="span" />
        </div>

        <div className={s.callout} style={{ marginTop: "1.5rem" }}>
          <h2>This tool shows measured results and gaps. It does not fill the gaps.</h2>
          <p>
            The corpus is real and the model predictions are real. The gold standard is not
            here yet: {m.sample_size} sentences are with Dorottya Egres for annotation, and{" "}
            {m.iaa_subset} of those need a second annotator before agreement can be computed.
            Until then there are no F1 scores and no agreement figure on this page, because
            both are comparisons and there is nothing yet to compare against. Neither is
            estimated, modelled, or filled in with a plausible-looking number.
          </p>
        </div>
      </div>

      <div className={s.wrap} style={{ paddingBottom: "4rem" }}>
        <div role="tablist" aria-label="MC-102 sections" className={s.tabs}>
          {TABS.map(t => (
            <button
              key={t.key} role="tab" id={`tab-${t.key}`}
              aria-selected={tab === t.key} aria-controls={`panel-${t.key}`}
              className={s.tab} onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}
             style={{ paddingTop: "1.6rem" }}>
          {tab === "console" && (
            <>
              <p className={s.lede} style={{ marginBottom: "1.2rem", fontSize: "0.95rem" }}>
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
          {tab === "conflict" && <ConflictPanel summary={graph} />}
          {tab === "method" && <MethodPanel data={data} />}
        </div>
      </div>
    </div>
  )
}

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div>
      <p className={s.statN}>{n}</p>
      <p className={s.statL}>{label}</p>
    </div>
  )
}
