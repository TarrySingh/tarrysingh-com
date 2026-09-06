"use client"

import { useState } from "react"
import { Lock, ArrowRight, FlaskConical, Users, BookOpen, Network } from "lucide-react"
import type { MC102Data, MC102Article } from "@/lib/panoraima/types"

const COMMUNITY_COLOR: Record<string, string> = {
  "government / MTI": "#B23E22",
  "NGO / opposition": "#1F6F5C",
  "transparency / FOI": "#1C7293",
  unclassified: "#8A8F98",
}

/* ------------------------------------------------------------------ corpus */

export function CorpusPanel({ articles, meta }: { articles: MC102Article[]; meta: MC102Data["meta"] }) {
  const [filter, setFilter] = useState<string | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const shown = filter ? articles.filter(a => a.community === filter) : articles

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Chip label={`All ${meta.n_articles}`} active={!filter} onClick={() => setFilter(null)} />
        {meta.communities.map(c => (
          <Chip
            key={c.name}
            label={`${c.name} · ${c.articles}`}
            color={COMMUNITY_COLOR[c.name]}
            active={filter === c.name}
            onClick={() => setFilter(filter === c.name ? null : c.name)}
          />
        ))}
      </div>

      <ul className="space-y-1.5">
        {shown.map(a => (
          <li key={a.id} className="rounded-xl border border-[#DCDDE1] bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(open === a.id ? null : a.id)}
              aria-expanded={open === a.id}
              className="w-full text-left px-4 py-3 hover:bg-[#FAFAFB] transition-colors"
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-1.5 w-2 h-2 rounded-[2px] flex-shrink-0"
                  style={{ background: COMMUNITY_COLOR[a.community] ?? "#8A8F98" }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[#16181D] leading-snug">{a.headline}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-[#767C87]">
                    {a.date} · {a.n_sentences} sentences
                  </p>
                </div>
                <ArrowRight
                  className={`h-4 w-4 flex-shrink-0 text-[#B6BAC2] transition-transform ${open === a.id ? "rotate-90" : ""}`}
                />
              </div>
            </button>
            {open === a.id && (
              <ol className="border-t border-[#EDEDEF] bg-[#FAFAFB] px-4 py-3 space-y-2">
                {a.sentences.map((s, k) => (
                  <li key={s.uid} className="flex gap-2.5 text-[13px] leading-relaxed">
                    <span className="font-mono text-[10px] text-[#B6BAC2] pt-1 w-6 flex-shrink-0">
                      {String(k + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[#3F434C]">
                      {s.text}
                      {s.in_sample && (
                        <span className="ml-2 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] bg-white border border-[#DCDDE1] text-[#767C87]">
                          sampled{s.iaa ? " · 2×" : ""}
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
      <p className="mb-5 max-w-3xl text-[14px] leading-relaxed text-[#444B5A]">
        Five conditions, each probing a documented failure mode. They are built and
        runnable. None can be <em>scored</em> until the gold standard exists, because a
        score is a comparison and there is currently nothing to compare against.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {data.conditions.map((c, i) => (
          <article key={c.key} className="rounded-xl border border-[#DCDDE1] bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#F2F3F5] font-mono text-[11px] font-bold text-[#5B616B]">
                {i + 1}
              </span>
              <h3 className="text-[15px] font-bold text-[#16181D]">{c.name}</h3>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-[#3F434C]">{c.tests}</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[#767C87] italic">{c.expect}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#FAFAFB] px-2 py-1 font-mono text-[10.5px] text-[#8A8F98] border border-[#EDEDEF]">
              <FlaskConical className="h-3 w-3" />
              {c.state}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- agreement */

export function AgreementPanel({ data }: { data: MC102Data }) {
  return (
    <div className="max-w-3xl">
      <Pending
        icon={<Users className="h-4 w-4" />}
        title="Inter-annotator agreement"
        body={
          <>
            <p>
              {data.meta.iaa_subset} of the {data.meta.sample_size} sampled sentences are
              flagged for double coding. Once a second annotator has labelled them
              independently, this panel reports Krippendorff&rsquo;s alpha, the confusion
              matrix, and the per-label breakdown.
            </p>
            <p className="mt-3">
              We are not showing a placeholder number. Published argument-mining corpora
              report agreement between roughly 0.30 and 0.60, and one widely used corpus
              reports 0.60 for comments and forum posts against 0.09 for articles and
              blogs. This corpus is news articles, so that lower figure is the relevant
              comparison. Whatever ours turns out to be sets the ceiling on what any model
              can achieve here.
            </p>
          </>
        }
      />
    </div>
  )
}

/* ------------------------------------------------------------- conflict map */

export function ConflictPanel({ data }: { data: MC102Data }) {
  return (
    <div className="max-w-3xl">
      <Pending
        icon={<Network className="h-4 w-4" />}
        title="Conflict landscape"
        body={
          <>
            <p>
              The applied payoff: an argument graph across the three communities, showing
              which claims attack which, and where the debate actually joins rather than
              talks past itself.
            </p>
            <p className="mt-3">
              It needs the relation pass, not just the labels. Support and attack links are
              the optional second stage of the annotation, so this is the last panel to
              fill and the one most likely to be thin. If the relation pass does not
              happen, this stays empty rather than being reconstructed from co-occurrence,
              which would look like an argument graph without being one.
            </p>
          </>
        }
      />
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
    <div className="max-w-3xl space-y-5">
      <div className="rounded-xl border border-[#DCDDE1] bg-white overflow-hidden">
        <div className="border-b border-[#EDEDEF] bg-[#FAFAFB] px-4 py-2.5">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#5B616B]">
            <BookOpen className="h-3 w-3" /> Datasheet
          </span>
        </div>
        <dl className="divide-y divide-[#EDEDEF]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-col sm:flex-row gap-1 sm:gap-4 px-4 py-2.5">
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#767C87] sm:w-44 flex-shrink-0">{k}</dt>
              <dd className="text-[13px] text-[#16181D]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-xl border border-[#F0CFC6] bg-[#FBEAE5] p-4">
        <h3 className="text-[14px] font-bold text-[#7A2A16]">Known limitations</h3>
        <ol className="mt-2.5 space-y-2 text-[13px] leading-relaxed text-[#7A2A16] list-decimal pl-4">
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

/* ------------------------------------------------------------------ shared */

function Pending({ icon, title, body }: { icon: React.ReactNode; title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#DCDDE1] bg-white p-5">
      <div className="flex items-center gap-2 text-[#5B616B]">
        {icon}
        <h3 className="text-[15px] font-bold text-[#16181D]">{title}</h3>
        <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-[#F2F3F5] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#767C87]">
          <Lock className="h-3 w-3" /> awaiting data
        </span>
      </div>
      <div className="mt-3 text-[13.5px] leading-relaxed text-[#3F434C]">{body}</div>
    </div>
  )
}

function Chip({ label, count, color, active, onClick }: { label: string; count?: number; color?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em] transition-colors ${
        active ? "bg-[#16181D] text-white border-[#16181D]" : "bg-white text-[#3F434C] border-[#DCDDE1] hover:border-[#16181D]/40"
      }`}
    >
      {color && <span className="w-1.5 h-1.5 rounded-[2px]" style={{ background: color }} aria-hidden />}
      {label}
    </button>
  )
}
