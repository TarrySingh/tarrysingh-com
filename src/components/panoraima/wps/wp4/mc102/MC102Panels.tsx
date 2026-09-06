"use client"

import { useState } from "react"
import Link from "next/link"
import type { MC102Data, MC102Article, MC102Graph } from "@/lib/panoraima/types"
import s from "./mc102.module.css"

const COMMUNITY_COLOR: Record<string, string> = {
  "government / MTI": "#8a4b12",
  "NGO / opposition": "#2f5d33",
  "transparency / FOI": "#4a5a8a",
  unclassified: "#8a8f98",
}

export type MC102GraphSummary = {
  themeStats: MC102Graph["themeStats"]
  n_nodes: number
  n_edges: number
  n_cross: number
  note: string
}

/* ------------------------------------------------------------------ corpus */

export function CorpusPanel({ articles, meta }: { articles: MC102Article[]; meta: MC102Data["meta"] }) {
  const [filter, setFilter] = useState<string | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const shown = filter ? articles.filter(a => a.community === filter) : articles

  return (
    <div>
      <div className={s.chips}>
        <button type="button" className={s.chip} aria-pressed={!filter} onClick={() => setFilter(null)}>
          All {meta.n_articles}
        </button>
        {meta.communities.map(c => (
          <button
            key={c.name} type="button" className={s.chip}
            aria-pressed={filter === c.name}
            onClick={() => setFilter(filter === c.name ? null : c.name)}
          >
            <span className={s.swatch} style={{ background: COMMUNITY_COLOR[c.name] ?? "#8a8f98" }} aria-hidden />
            {c.name} · {c.articles}
          </button>
        ))}
      </div>

      <ul style={{ listStyle: "none", margin: "1rem 0 0", padding: 0 }}>
        {shown.map(a => (
          <li key={a.id} className={s.artRow}>
            <button type="button" className={s.artBtn} aria-expanded={open === a.id}
                    onClick={() => setOpen(open === a.id ? null : a.id)}>
              <span className={s.swatch} style={{ background: COMMUNITY_COLOR[a.community] ?? "#8a8f98", marginTop: "0.35rem" }} aria-hidden />
              <span style={{ minWidth: 0 }}>
                <span className={s.artHead}>{a.headline}</span>
                <span className={s.artMeta}>{a.date} · {a.n_sentences} sentences</span>
              </span>
              <span className={s.tick} aria-hidden>{open === a.id ? "−" : "+"}</span>
            </button>
            {open === a.id && (
              <ol className={s.artBody}>
                {a.sentences.map((x, k) => (
                  <li key={x.uid}>
                    <span className={s.railNum}>{String(k + 1).padStart(2, "0")}</span>
                    <span>
                      {x.text}
                      {x.in_sample && (
                        <span className={s.pendingTag} style={{ marginLeft: "0.4rem" }}>
                          sampled{x.iaa ? " · 2×" : ""}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------------- conditions */

export function ConditionsPanel({ data }: { data: MC102Data }) {
  return (
    <div>
      <p className={s.lede} style={{ fontSize: "0.95rem", marginBottom: "1.2rem" }}>
        Five conditions, each probing a documented failure mode. All five have now run
        over the full corpus. None of them yields an <em>accuracy</em>, because accuracy
        is a comparison against the annotator&rsquo;s labels and those have not arrived.
        What they do yield is how much the model&rsquo;s own answers move when the
        conditions change, which needs no gold standard at all.
      </p>
      <div className={s.grid2}>
        {data.conditions.map((c, i) => (
          <article key={c.key} className={s.armCard}>
            <p className={s.armName}>
              {String(i + 1).padStart(2, "0")} · {c.name}
            </p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.88rem", color: "var(--ink-2)" }}>{c.tests}</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.84rem", color: "var(--ink-3)", fontStyle: "italic" }}>{c.expect}</p>
            <p className={s.pendingTag} style={{ marginTop: "0.7rem" }}>{c.state}</p>
            {c.result && (
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.84rem", color: "var(--ink-2)" }}>
                {c.result}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- agreement */

export function AgreementPanel({ data }: { data: MC102Data }) {
  return (
    <div style={{ maxWidth: "52rem" }}>
      <div className={s.pending}>
        <p className={s.pendingHead}>
          Inter-annotator agreement
          <span className={s.pendingTag}>awaiting data</span>
        </p>
        <p>
          {data.meta.iaa_subset} of the {data.meta.sample_size} sampled sentences are
          flagged for double coding. Once a second annotator has labelled them
          independently, this panel reports Krippendorff&rsquo;s alpha, the confusion
          matrix, and the per-label breakdown.
        </p>
        <p>
          We are not showing a placeholder number. Published argument-mining corpora
          report agreement between roughly 0.30 and 0.60, and one widely used corpus
          reports 0.60 for comments and forum posts against 0.09 for articles and blogs.
          This corpus is news articles, so that lower figure is the relevant comparison.
          Whatever ours turns out to be sets the ceiling on what any model can achieve here.
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- conflict map */

export function ConflictPanel({ summary }: { summary?: MC102GraphSummary }) {
  if (!summary) {
    return (
      <div style={{ maxWidth: "52rem" }}>
        <div className={s.pending}>
          <p className={s.pendingHead}>
            Conflict landscape
            <span className={s.pendingTag}>not built</span>
          </p>
          <p>The relation pass has not been run against this corpus yet.</p>
        </div>
      </div>
    )
  }

  const stranded = summary.themeStats.filter(t => t.cross === 0)

  return (
    <div>
      <p className={s.lede} style={{ fontSize: "0.95rem" }}>
        The relation pass ran over the corpus and produced {summary.n_nodes} argumentative
        units joined by {summary.n_edges} links, {summary.n_cross} of which cross between
        the government and NGO camps. Every one of those was drawn by the model, so read
        the table as a description of the model&rsquo;s output, not as a finding about the
        debate.
      </p>

      <div className={s.instrument} style={{ marginTop: "1.2rem", maxWidth: "44rem" }}>
        <div className={s.instrumentHead}>
          <h3 className={s.instrumentTitle}>Engagement by theme</h3>
          <span className={s.instrumentNote}>claims per camp, and links between them</span>
        </div>
        <table className={s.ledger}>
          <thead>
            <tr>
              <th scope="col">Theme</th>
              <th scope="col" className={s.num}>Gov</th>
              <th scope="col" className={s.num}>NGO</th>
              <th scope="col" className={s.num}>Cross-camp</th>
            </tr>
          </thead>
          <tbody>
            {summary.themeStats.map(t => (
              <tr key={t.theme} className={t.cross === 0 ? s.rowMuted : undefined}>
                <td>{t.theme}</td>
                <td className={s.num}>{t.gov}</td>
                <td className={s.num}>{t.ngo}</td>
                <td className={s.num}>{t.cross === 0 ? <span className={s.flag}>none</span> : t.cross}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ maxWidth: "44rem", marginTop: "1rem", fontSize: "0.88rem", color: "var(--ink-2)" }}>
        {stranded.length} of {summary.themeStats.length} themes have no cross-camp link at
        all. Those rows are kept in the table rather than filtered out for being empty: a
        theme one side raises and the other never answers is the shape the corpus actually
        has, and hiding it would make the debate look more joined-up than it was.
      </p>

      <p style={{ marginTop: "1.2rem" }}>
        <Link href="/experiments/panoraima/wps/wp4/mc-102/lab" className={s.action}>
          Open the argument mining lab →
        </Link>
      </p>

      <div className={s.pending} style={{ marginTop: "1.4rem", maxWidth: "52rem" }}>
        <p className={s.pendingHead}>
          The annotator&rsquo;s graph
          <span className={s.pendingTag}>awaiting data</span>
        </p>
        <p>
          Support and attack links are the optional second stage of the human annotation.
          Until that comes back there is one graph here, not two, so nothing on this page
          says whether the model&rsquo;s relations are right — only what they are.
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ method */

export function MethodPanel({ data }: { data: MC102Data }) {
  const rows: [string, string][] = [
    ["Corpus", `${data.meta.corpus_name}, ${data.meta.n_articles} articles, ${data.meta.year_min}–${data.meta.year_max}`],
    ["Source", data.meta.source],
    ["Sentences", `${data.meta.n_sentences}, regex segmentation with abbreviation guards`],
    ["Annotation sample", `${data.meta.sample_size} stratified across three communities`],
    ["Double-coded", `${data.meta.iaa_subset} sentences, for Krippendorff's alpha`],
    ["Gold segmentation", `${data.meta.segmentation_articles} complete articles, boundaries marked by the annotator`],
  ]
  return (
    <div style={{ maxWidth: "52rem", display: "grid", gap: "1.4rem" }}>
      <div className={s.instrument}>
        <div className={s.instrumentHead}>
          <h3 className={s.instrumentTitle}>Datasheet</h3>
        </div>
        <table className={s.ledger}>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <th scope="row" style={{ width: "12rem" }}>{k}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={s.callout}>
        <h2>Known limitations</h2>
        <ol style={{ margin: "0.6rem 0 0", paddingLeft: "1.1rem", fontSize: "0.88rem", color: "var(--ink-2)", display: "grid", gap: "0.5rem" }}>
          <li>
            <strong>It is a translation.</strong> The corpus reached us as a ChatGPT
            translation from Hungarian. Any claim about lexical cues or discourse markers is
            confounded by that. The original has been requested; running both and comparing
            is a planned experiment.
          </li>
          <li>
            <strong>It is small.</strong> {data.meta.n_sentences} sentences supports
            prompt-based evaluation and a gold standard. It does not support fine-tuning,
            and any F1 reported on it carries wide intervals.
          </li>
          <li>
            <strong>The transparency community is thin.</strong> 76 sentences. Cross-community
            results involving it are indicative only.
          </li>
          <li>
            <strong>Community labels are ours, not the author&rsquo;s.</strong> Assigned by
            matching headlines and speakers, for stratification. They are not part of her scheme.
          </li>
          <li>
            <strong>One topic, one country, one language of origin.</strong> Nothing here
            generalises to argument mining at large. That is the point being tested.
          </li>
        </ol>
      </div>
    </div>
  )
}
