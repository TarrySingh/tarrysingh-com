/**
 * The Living Report — slide manifest schema.
 *
 * Every native deck page is one `Slide` in a manifest array. The Phase-B
 * extraction fleet emits entries in this shape; the templates render them.
 * Inline stat highlights use `{{...}}` and are rendered in the chapter
 * accent (the McKinsey "blue number", native).
 *
 * `src` traces each page back to its source slide number in the original
 * 375-PNG deck; `replaces` documents curation moves (e.g. one live
 * instrument absorbing a cluster of static chart slides).
 */

export type InstrumentKey =
  | "market-model"
  | "concentration"
  | "war-map"
  | "spec-comparator"
  | "roi"
  | "sankey"
  | "ecosystem"
  | "deploy-timeline"
  | "frameworks"
  | "tech-deep-dive"
  | "app-cases"
  | "growth-drivers"
  | "case-study-map"

export interface SlideBase {
  /** Source slide number in the original 375-slide deck (traceability). */
  src: number
  /** Chapter accent, e.g. "var(--c-cyan)". Defaults to the royal blue. */
  chap?: string
  /** Mono eyebrow line, e.g. "PART I · MARKET LANDSCAPE · 1.2". */
  eyebrow?: string
  /** Workshop slides render blurred behind the gold gate until entitled. */
  locked?: boolean
  /** Curation note, e.g. "Replaces source slides 12–13". Rendered faintly. */
  replaces?: string
}

export interface TitleSlide extends SlideBase {
  kind: "title"
  kicker: string
  title: string
  sub: string
  meta: string
}

export interface DividerSlide extends SlideBase {
  kind: "divider"
  /** The huge ghosted numeral behind the content, e.g. "I". */
  numeral: string
  part: string
  title: string
  topics: { n: string; t: string }[]
}

export interface Bullet {
  lead: string
  text: string
}

export interface BulletsSlide extends SlideBase {
  kind: "bullets"
  title: string
  bullets: Bullet[]
  callout?: { k: string; text: string }
}

export interface StatsSlide extends SlideBase {
  kind: "stats"
  title: string
  stats: { big: string; lab: string }[]
  body?: string[]
  foot?: string
}

export type PanelMark = "+" | "−" | "~"

export interface PanelSide {
  name: string
  tag: string
  accent: string
  rows: { t: string; items: [PanelMark, string][] }[]
  ex?: string
}

export interface TwoPanelSlide extends SlideBase {
  kind: "twoPanel"
  title: string
  sub?: string
  L: PanelSide
  R: PanelSide
}

export interface CaseSlide extends SlideBase {
  kind: "case"
  co: string
  robot: string
  site: string
  task: string
  results: string[]
  roi: string
}

export interface TableSlide extends SlideBase {
  kind: "table"
  title: string
  sub?: string
  columns: string[]
  rows: string[][]
  foot?: string
}

export interface TimelineSlide extends SlideBase {
  kind: "timeline"
  title: string
  sub?: string
  stops: { when: string; what: string; detail: string }[]
}

export interface InstrumentSlide extends SlideBase {
  kind: "instrument"
  title: string
  sub?: string
  instrument: InstrumentKey
}

/**
 * Generic native chart for data slides no live instrument absorbs.
 * Bar, ranked horizontal bars, and donut cover the deck's remaining
 * static-chart grammar; values are the transcribed source figures.
 */
export interface ChartSlide extends SlideBase {
  kind: "chart"
  title: string
  sub?: string
  ctype: "bar" | "hbar" | "donut"
  unit?: string
  data: { label: string; value: number; color?: string; note?: string }[]
  foot?: string
}

export type Slide =
  | TitleSlide
  | DividerSlide
  | BulletsSlide
  | StatsSlide
  | TwoPanelSlide
  | CaseSlide
  | TableSlide
  | TimelineSlide
  | InstrumentSlide
  | ChartSlide

export interface TocGroup {
  label: string
  /** Indices into the manifest array. */
  slides: number[]
}
