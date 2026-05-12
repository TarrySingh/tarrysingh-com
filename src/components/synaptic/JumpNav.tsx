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
