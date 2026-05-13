import Link from "next/link"

/**
 * Persistent back-to-home pill anchored top-left of the viewport on
 * every /synaptic route. Mono small-caps with a copper hairline, fades
 * into view on the studio backdrop, hidden in print.
 */
export function SynapticSiteNav() {
  return (
    <nav
      aria-label="Back to tarrysingh.com"
      className="fixed left-5 top-5 z-50 print:hidden"
    >
      <Link
        href="/"
        className="group inline-flex items-center gap-2 rounded-full border px-4 py-2 transition-colors"
        style={{
          borderColor: "rgba(232,184,122,0.35)",
          background: "rgba(13,16,39,0.7)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          color: "var(--ink, #f6ead0)",
          fontFamily:
            "var(--font-mono), 'IBM Plex Mono', monospace",
          fontSize: "10.5px",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{ color: "rgba(232,184,122,0.85)" }}
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        >
          ←
        </span>
        <span>tarrysingh.com</span>
      </Link>
    </nav>
  )
}
