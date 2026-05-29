"use client"

import { useEffect, useState } from "react"

/**
 * Dispatches v2 — "The Read" reading rail.
 *
 * Two ergonomics in one client island, rendered INSIDE <article
 * id="read-root"> so its fixed children inherit the --read-* tokens
 * (CSS custom properties inherit through the DOM regardless of
 * position:fixed):
 *
 *   1. A slim top progress bar (always visible) tracking scroll depth.
 *   2. An auto-TOC in the left margin (xl+ only, where there's room
 *      outside the max-w-3xl column) built from the server-rendered
 *      rehypeSlug headings, with active-heading highlight via
 *      IntersectionObserver.
 *
 * Zero authoring work — it reads whatever h2/h3 the post already has.
 */

interface Heading {
  id: string
  text: string
  level: 2 | 3
}

export function ReadRail() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const root = document.querySelector(".prose-tarry")
    if (!root) return

    const els = Array.from(
      root.querySelectorAll("h2[id], h3[id]"),
    ) as HTMLElement[]
    setHeadings(
      els.map((h) => ({
        id: h.id,
        // Strip the appended autolink anchor glyph if present.
        text: (h.textContent ?? "").replace(/[#¶→]+\s*$/, "").trim(),
        level: h.tagName === "H3" ? 3 : 2,
      })),
    )

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id)
      },
      { rootMargin: "0px 0px -68% 0px", threshold: 0 },
    )
    els.forEach((h) => io.observe(h))

    let raf = 0
    function onScroll() {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const doc = document.documentElement
        const scrollable = doc.scrollHeight - window.innerHeight
        setProgress(
          scrollable > 0
            ? Math.min(1, Math.max(0, window.scrollY / scrollable))
            : 0,
        )
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener("scroll", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      {/* Top progress rail. */}
      <div
        aria-hidden="true"
        className="fixed left-0 top-0 z-40 h-[3px]"
        style={{
          width: `${progress * 100}%`,
          background: "var(--read-accent, #b45309)",
          transition: "width 90ms linear",
        }}
      />

      {/* Left-margin auto-TOC — xl+ only (needs gutter outside the 768px column). */}
      {headings.length > 1 ? (
        <nav
          aria-label="On this page"
          className="hidden xl:block fixed top-32 z-30"
          style={{
            left: "max(1.5rem, calc((100vw - 768px) / 2 - 220px))",
            width: "190px",
          }}
        >
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em]"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              color: "var(--read-fg-soft, rgba(13,27,61,0.42))",
            }}
          >
            On this page
          </p>
          <ul
            className="max-h-[60vh] space-y-2 overflow-y-auto border-l"
            style={{ borderColor: "var(--read-hair, rgba(13,27,61,0.12))" }}
          >
            {headings.map((h) => (
              <li
                key={h.id}
                style={{ paddingLeft: h.level === 3 ? "1.4rem" : "0.85rem" }}
              >
                <a
                  href={`#${h.id}`}
                  className="block text-[12px] leading-snug transition-colors"
                  style={{
                    fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                    color:
                      activeId === h.id
                        ? "var(--read-accent, #b45309)"
                        : "var(--read-fg-soft, rgba(13,27,61,0.5))",
                  }}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </>
  )
}
