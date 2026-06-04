"use client"

import { useEffect, useState } from "react"

type Section = { id: string; label: string }

export function JumpNav({
  sections,
  accentVar = "--symphony-violet-hi",
}: {
  sections: ReadonlyArray<Section>
  accentVar?: string
}) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
            break
          }
        }
      },
      { rootMargin: "-30% 0px -55% 0px" },
    )
    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [sections])

  return (
    <nav
      aria-label="In-page navigation"
      className="fixed bottom-8 right-8 z-50 hidden flex-col gap-1 rounded-[var(--radius-card)] border px-4 py-3 shadow-xl lg:flex print:hidden"
      style={{
        borderColor: "var(--panel-edge)",
        backgroundColor: "rgba(13, 16, 39, 0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {sections.map((s) => {
        const isActive = active === s.id
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => {
              const el = document.getElementById(s.id)
              if (!el) return
              e.preventDefault()
              // On the tall syn pages the <html> element is the scroller, but a
              // bare #fragment link (and CSS scroll-behavior:smooth over a very
              // long distance) does not reliably move it. Force an instant jump
              // on the scrolling element — proven robust across these pages.
              const scroller = (document.scrollingElement ||
                document.documentElement) as HTMLElement
              const top =
                el.getBoundingClientRect().top + scroller.scrollTop - 16
              const prev = scroller.style.scrollBehavior
              scroller.style.scrollBehavior = "auto"
              scroller.scrollTop = top
              scroller.style.scrollBehavior = prev
              setActive(s.id)
              window.history.replaceState(null, "", `#${s.id}`)
            }}
            className="syn-mono py-0.5 transition-colors"
            style={{
              color: isActive
                ? `var(${accentVar})`
                : "var(--ink-dim)",
              fontSize: "0.72rem",
              letterSpacing: "var(--track-mono)",
              textTransform: "uppercase",
            }}
          >
            {s.label}
          </a>
        )
      })}
    </nav>
  )
}
