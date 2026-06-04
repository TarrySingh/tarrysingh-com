"use client"

/**
 * The full deck — a contact-sheet wall of every instrument in the gallery.
 * Label tiles (not live re-renders) that jump to each plate's room.
 */

import { scrollToSection } from "./scrollToSection"

const DECK = [
  { n: "I", title: "The 2040 Planisphere", room: "The instrument", id: "top" },
  { n: "II", title: "The Silver Thread", room: "The overture", id: "thread" },
  { n: "III", title: "Three Eras of Software", room: "Three Eras", id: "eras" },
  { n: "IV", title: "The Long Arc", room: "The Long Arc", id: "long-arc" },
  { n: "V", title: "Compute Price-Performance", room: "Two Curves", id: "curves" },
  { n: "VI", title: "The Cost of Intelligence", room: "Two Curves", id: "curves" },
  { n: "VII", title: "The Energy Scissors", room: "Two Curves", id: "curves" },
  { n: "VIII", title: "The Firm, Morphing", room: "The Firm", id: "firm" },
  { n: "IX", title: "Output per Person", room: "Off the Screen", id: "off-screen" },
  { n: "X", title: "Humanoid Adoption", room: "Off the Screen", id: "off-screen" },
  { n: "XI", title: "Robotaxi Cost / Mile", room: "Off the Screen", id: "off-screen" },
  { n: "XII", title: "The Genome Cost Curve", room: "Biology", id: "biology" },
  { n: "XIII", title: "The Off-World Stack", room: "Off-World", id: "off-world" },
  { n: "XIV", title: "Abundance Projection", room: "Abundance", id: "abundance" },
  { n: "XV", title: "The Convergence", room: "Abundance", id: "abundance" },
] as const

export function FullDeck() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {DECK.map((d) => (
        <button
          key={d.n}
          type="button"
          onClick={() => scrollToSection(d.id)}
          className="group flex flex-col items-start rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5"
          style={{
            borderColor: "var(--sw3-hair)",
            background: "rgba(20, 22, 52, 0.4)",
          }}
        >
          <span
            className="text-[10px] font-semibold tracking-[0.18em]"
            style={{ fontFamily: "var(--font-mono), monospace", color: "var(--sw3-accent)" }}
          >
            {d.n}
          </span>
          <span
            className="mt-1 text-[0.95rem] leading-snug"
            style={{ fontFamily: "var(--font-serif), serif", color: "var(--ink)" }}
          >
            {d.title}
          </span>
          <span
            className="mt-1 text-[10px] uppercase tracking-[0.14em] transition-colors group-hover:text-[color:var(--sw3-accent-hi)]"
            style={{ fontFamily: "var(--font-mono), monospace", color: "var(--ink-dim)" }}
          >
            {d.room} →
          </span>
        </button>
      ))}
    </div>
  )
}
