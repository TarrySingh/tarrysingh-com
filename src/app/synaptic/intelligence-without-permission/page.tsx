import type { Metadata } from "next"
import Image from "next/image"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getManuscript } from "@/lib/synaptic/intelligence-without-permission/manuscript"
import { sources } from "@/lib/synaptic/intelligence-without-permission/sources"
import { Reader } from "@/components/synaptic/intelligence-without-permission/Reader"
import { Figure } from "@/components/synaptic/intelligence-without-permission/Figure"
import { InstrumentDirectory } from "@/components/synaptic/intelligence-without-permission/InstrumentDirectory"
import "./article.css"

export const metadata: Metadata = {
  title: "Intelligence Without Permission — Synaptic · Tarry Singh",
  description: "What happens to universities, research departments and entire industries when advanced intellectual work becomes widely available? A visual essay by Tarry Singh.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.tarrysingh.com/synaptic/intelligence-without-permission" },
  openGraph: { url: "https://www.tarrysingh.com/synaptic/intelligence-without-permission", publishedTime: "2026-09-09", authors: ["Tarry Singh"], title: "Intelligence Without Permission", description: "The end of intellectual exclusivity. A 40,000-word visual essay by Tarry Singh.", images: [{ url: "/synaptic/intelligence-without-permission/editorial-cover.webp", width: 1672, height: 941, alt: "A research chamber opens into a widening lattice of light" }], type: "article" },
  twitter: { card: "summary_large_image", title: "Intelligence Without Permission", images: ["/synaptic/intelligence-without-permission/editorial-cover.webp"] },
}

function Source({ id }: { id: string }) {
  const source = sources[id]
  if (!source) throw new Error(`Unknown article source: ${id}`)
  return <sup className="iwp-citation"><a href={`#source-${id}`} aria-label={`Source ${id}: ${source.title}`}>{id.slice(1)}</a></sup>
}

export default function IntelligenceWithoutPermission() {
  const manuscript = getManuscript()
  return <main className="iwp" id="iwp-top">
    <a className="iwp-skip" href="#iwp-manuscript">Skip to the essay</a>
    <header className="iwp-hero">
      <div className="iwp-hero-art"><Image src="/synaptic/intelligence-without-permission/editorial-cover.webp" alt="Conceptual editorial artwork: a research chamber opening into a lattice of shared intelligence." fill sizes="100vw" priority /></div>
      <div className="iwp-hero-rule"><span>Synaptic / Field studies</span><span>Research edition · September 2026</span></div>
      <p className="iwp-eyebrow">The end of intellectual exclusivity</p>
      <h1>Intelligence<br />Without<br /><em>Permission.</em></h1>
      <div className="iwp-hero-bottom"><p>When anyone can attempt work once reserved for the world’s great research institutions, who gets to decide what happens next?</p><div className="iwp-byline"><span>An essay by</span><strong>Tarry Singh</strong><span>{manuscript.words.toLocaleString("en-US")} words · {manuscript.figureCount} figures</span></div></div>
      <p className="iwp-draft">Research edition · 18 sections · 38 figures, including 10 interactive 3D laboratories. Narrative word count excludes captions and references. Evidence cut-off: 9 September 2026.</p>
      <a className="iwp-download" href="/synaptic/intelligence-without-permission/intelligence-without-permission.md" download>Download the reading copy (.md) ↓</a>
      <a className="iwp-enter" href="#chapter-prologue">Enter the essay <span aria-hidden="true">↓</span></a>
      <span className="iwp-art-credit">Cover: AI-generated conceptual artwork. Scientific figures use the methods identified alongside them.</span>
    </header>
    <InstrumentDirectory />
    <aside className="iwp-visual-index" id="iwp-visual-index"><details><summary><span>Browse all 38 illustrations</span><span>2D + 3D / open index ↓</span></summary><ol>{manuscript.figures.map(figure=><li key={figure.id}><a href={`#figure-${figure.id}`}><span>{figure.id.slice(1)}</span>{figure.title}<small>{figure.dimension}</small></a></li>)}</ol></details></aside>
    <Reader chapters={manuscript.chapters.map(({ id, title, words }) => ({ id, title, words }))} />
    <article id="iwp-manuscript">
      {manuscript.chapters.map((chapter, index) => <section className="iwp-chapter" id={`chapter-${chapter.id}`} key={chapter.id}>
        <header className="iwp-chapter-heading"><p><span>{chapter.id === "prologue" || chapter.id === "coda" ? chapter.id : `Chapter ${chapter.id}`}</span><span>{Math.ceil(chapter.words / 220)} minute read</span></p><h2>{chapter.title}</h2></header>
        <div className={`iwp-prose ${index === 0 ? "iwp-opening" : ""}`}><MDXRemote source={chapter.source} components={{ Figure, Source }} /></div>
      </section>)}
    </article>
    <section className="iwp-bibliography" id="iwp-sources"><p className="iwp-eyebrow">The evidence is part of the argument</p><h2>Sources &amp; reading notes</h2><p>Research cut-off: 9 September 2026. Company announcements, original papers, formal artefacts and the author’s scenarios carry different kinds of evidence. A link records provenance; it is not a claim of independent replication. The bibliography includes sources for both narrative and figures.</p><ol>{Object.entries(sources).sort(([a],[b])=>Number(a.slice(1))-Number(b.slice(1))).map(([id, source]) => <li id={`source-${id}`} key={id}><span>{id.slice(1).padStart(2, "0")}</span><div><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><p>{source.note}</p></div></li>)}</ol></section>
    <footer className="iwp-footer"><span>Tarry Singh / Synaptic</span><a href="#iwp-top">Back to the beginning ↑</a></footer>
  </main>
}
