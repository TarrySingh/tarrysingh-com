"use client"

import { useEffect, useState } from "react"
import { SERIES, type SeriesKey } from "@/lib/blog/series"

/**
 * Dispatches v2 — "The Front" filter bar (client island).
 *
 * Renders category + series chips and filters the server-rendered cards
 * by toggling display on every [data-card] element (matching
 * data-category / data-series). Keeps the heavy cards server-rendered
 * and the plate canvases from re-mounting on filter.
 */

const CATS = ["All", "Essays", "Notes", "Studio"] as const
type Cat = (typeof CATS)[number]

export function FrontControls({
  activeSeries,
}: {
  /** Series keys that have at least one post (drives which chips show). */
  activeSeries: SeriesKey[]
}) {
  const [cat, setCat] = useState<Cat>("All")
  const [series, setSeries] = useState<SeriesKey | "all">("all")

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>("[data-card]")
    cards.forEach((el) => {
      const c = el.getAttribute("data-category")
      const s = el.getAttribute("data-series")
      const okCat = cat === "All" || c === cat
      const okSeries = series === "all" || s === series
      el.style.display = okCat && okSeries ? "" : "none"
    })
  }, [cat, series])

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
    </div>
  )
}
