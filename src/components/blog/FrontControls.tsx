"use client"

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { SERIES, type SeriesKey } from "@/lib/blog/series"

/**
 * Dispatches v2 — "The Front" controls (client island).
 *
 * Renders category + series chips, a search box and the Load-more control,
 * and filters the SERVER-RENDERED cards by toggling display on every
 * [data-card] element. The cards stay server-rendered so the page keeps its
 * SEO text and the PlateCover canvases never re-mount on a keystroke.
 *
 * All three controls live in ONE island on purpose. They compose into a single
 * visibility decision (category AND series AND query, then capped by the page
 * size), and two islands each writing el.style.display would race.
 *
 * The Load-more button is portalled to #blog-loadmore, under the grid, because
 * that is where a reader expects it. The state stays here.
 */

const CATS = ["All", "Essays", "Notes", "Studio"] as const
type Cat = (typeof CATS)[number]

/** Cards revealed initially, and added per click. */
const PAGE = 12

export function FrontControls({
  activeSeries,
  gridTotal,
}: {
  /** Series keys that have at least one post (drives which chips show). */
  activeSeries: SeriesKey[]
  /** How many cards are in the main grid, for the "showing X of Y" line. */
  gridTotal: number
}) {
  const [cat, setCat] = useState<Cat>("All")
  const [series, setSeries] = useState<SeriesKey | "all">("all")
  const [query, setQuery] = useState("")
  const [limit, setLimit] = useState(PAGE)
  const [matched, setMatched] = useState(gridTotal)
  // Notes live in their own rail and are not paged, but they still count as
  // results: filtering to Notes used to read "No dispatches match" while a
  // Note was plainly on screen.
  const [noteHits, setNoteHits] = useState(0)
  const [slot, setSlot] = useState<HTMLElement | null>(null)

  useEffect(() => setSlot(document.getElementById("blog-loadmore")), [])

  const terms = useMemo(
    () => query.toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  )

  // A narrowed result set should start from the top, not from wherever the
  // reader had paged to.
  useEffect(() => setLimit(PAGE), [cat, series, query])

  useEffect(() => {
    let shown = 0
    let hits = 0
    let notes = 0
    document.querySelectorAll<HTMLElement>("[data-card]").forEach((el) => {
      const okCat = cat === "All" || el.getAttribute("data-category") === cat
      const okSeries = series === "all" || el.getAttribute("data-series") === series
      // Every term must appear somewhere in the card's haystack, so extra
      // words narrow rather than widen.
      const hay = el.getAttribute("data-search") ?? ""
      const okQuery = terms.every((t) => hay.includes(t))
      const match = okCat && okSeries && okQuery

      // Only the main grid pages. The Notes rail is short and paging it would
      // make the sidebar jump for no reason.
      if (el.getAttribute("data-card") === "grid") {
        if (match) hits++
        const within = match && shown < limit
        if (within) shown++
        el.style.display = within ? "" : "none"
      } else {
        if (match) notes++
        el.style.display = match ? "" : "none"
      }
    })
    setMatched(hits)
    setNoteHits(notes)
  }, [cat, series, terms, limit])

  const visible = Math.min(limit, matched)
  const more = Math.max(0, matched - visible)
  const filtered = cat !== "All" || series !== "all" || terms.length > 0

  const mono = {
    fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
  } as const

  function chipClass(active: boolean) {
    return [
      "inline-flex h-8 items-center rounded-full border px-3 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c98e4f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1828]",
      active
        ? "border-[#c98e4f] bg-[#c98e4f]/15 text-[#f4c482]"
        : "border-[rgba(246,234,208,0.18)] text-[rgba(246,234,208,0.6)] hover:text-[#f6ead0] hover:border-[rgba(246,234,208,0.4)]",
    ].join(" ")
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {CATS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={chipClass(cat === c)}
            style={mono}
          >
            {c}
          </button>
        ))}
      </div>

      {activeSeries.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-[10px] uppercase tracking-[0.22em] text-[rgba(246,234,208,0.55)]"
            style={mono}
          >
            Series
          </span>
          <button
            type="button"
            onClick={() => setSeries("all")}
            aria-pressed={series === "all"}
            className={chipClass(series === "all")}
            style={mono}
          >
            All
          </button>
          {activeSeries.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSeries(k)}
              aria-pressed={series === k}
              className={chipClass(series === k)}
              style={mono}
            >
              {SERIES[k].name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1 sm:max-w-sm">
          <label htmlFor="blog-search" className="sr-only">
            Search dispatches by title, summary or tag
          </label>
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("")
            }}
            placeholder="Search dispatches"
            autoComplete="off"
            className="h-9 w-full rounded-full border bg-transparent pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-[rgba(246,234,208,0.35)] focus:border-[#c98e4f] focus-visible:ring-2 focus-visible:ring-[#c98e4f]/40"
            style={{
              ...mono,
              borderColor: "rgba(246,234,208,0.18)",
              color: "#f6ead0",
              fontSize: "12px",
            }}
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            fill="none"
            stroke="rgba(246,234,208,0.45)"
            strokeWidth="1.6"
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M13 13l4 4" strokeLinecap="round" />
          </svg>
        </div>

        <p
          aria-live="polite"
          className="text-[10px] uppercase tracking-[0.22em]"
          style={{ ...mono, color: "rgba(246,234,208,0.55)" }}
        >
          {matched === 0 && noteHits === 0
            ? "No dispatches match"
            : matched === 0
              ? `${noteHits} in Notes`
              : `Showing ${visible} of ${matched}${filtered ? " matching" : ""}`}
        </p>

        {filtered ? (
          <button
            type="button"
            onClick={() => {
              setCat("All")
              setSeries("all")
              setQuery("")
            }}
            className="text-[10px] uppercase tracking-[0.22em] underline underline-offset-4 transition-colors hover:text-[#f4c482]"
            style={{ ...mono, color: "rgba(246,234,208,0.55)" }}
          >
            Clear
          </button>
        ) : null}
      </div>

      {slot && more > 0
        ? createPortal(
            <button
              type="button"
              onClick={() => setLimit((n) => n + PAGE)}
              className="mx-auto mt-12 flex h-10 items-center rounded-full border px-6 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors hover:border-[#c98e4f] hover:text-[#f4c482] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c98e4f]"
              style={{
                ...mono,
                borderColor: "rgba(246,234,208,0.22)",
                color: "rgba(246,234,208,0.75)",
              }}
            >
              Load {Math.min(PAGE, more)} more
            </button>,
            slot,
          )
        : null}
    </div>
  )
}
