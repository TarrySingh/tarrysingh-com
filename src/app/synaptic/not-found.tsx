import Link from "next/link"
import { ArrowRight } from "lucide-react"

const doors: Array<{ href: string; label: string; hint: string }> = [
  {
    href: "/synaptic",
    label: "Series home",
    hint: "the Synaptic Cartography reading room",
  },
  {
    href: "/synaptic/symphony",
    label: "SYMPHONY",
    hint: "Plate II, the planisphere",
  },
  {
    href: "/synaptic/memphis",
    label: "MEMPHIS",
    hint: "Plate I, the chip",
  },
  {
    href: "/",
    label: "tarrysingh.com",
    hint: "step out of the studio, back to the main site",
  },
]

export const metadata = {
  title: "Plate not on the wall · Synaptic Cartography",
  description:
    "This plate is not currently hanging in the Synaptic Cartography series. Step back to the reading room.",
  robots: { index: false, follow: false },
}

export default function SynapticNotFound() {
  return (
    <div
      className="syn-root relative min-h-screen overflow-hidden"
      style={{
        // Studio midnight palette inherits from globals.css .syn-root,
        // but we set a strong fallback so this page is correct even if
        // the parent CSS layer hasn't loaded yet.
        background:
          "radial-gradient(ellipse at 50% 30%, #1a1d4a 0%, #0d1027 60%, #060816 100%)",
        color: "#f6ead0",
      }}
    >
      <main className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-start justify-center px-6 pt-28 pb-20 lg:px-10">
        {/* Cartouche row */}
        <div className="mb-10 flex w-full items-center gap-4">
          <span
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              letterSpacing: "0.34em",
              fontSize: "10.5px",
              textTransform: "uppercase",
              color: "rgba(232,184,122,0.9)",
              fontWeight: 600,
            }}
          >
            Plate not on the wall
          </span>
          <span
            className="h-px flex-1"
            style={{ background: "rgba(232,184,122,0.25)" }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              letterSpacing: "0.28em",
              fontSize: "10.5px",
              textTransform: "uppercase",
              color: "rgba(246,234,208,0.55)",
            }}
          >
            № 404 · Reading-room note
          </span>
        </div>

        {/* Display title */}
        <h1
          style={{
            fontFamily: "var(--font-display), 'Gloock', serif",
            fontSize: "clamp(2.6rem, 7vw, 4.6rem)",
            lineHeight: "1.05",
            color: "#f6ead0",
          }}
        >
          This plate is not
          <br />
          <span style={{ color: "rgba(232,184,122,0.95)" }}>
            currently hung.
          </span>
        </h1>

        {/* Body */}
        <p
          className="mt-8 max-w-2xl"
          style={{
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            fontSize: "1.075rem",
            lineHeight: "1.78",
            color: "rgba(246,234,208,0.78)",
          }}
        >
          The series lives at <em>/synaptic</em>, MEMPHIS, SYMPHONY, and the
          plates that will follow them. The address you tried isn&apos;t a
          plate in the current rotation. Step back to the reading room and
          choose another piece, or return to the main site.
        </p>

        {/* Doors */}
        <div className="mt-12 w-full">
          <div className="mb-5 flex items-center gap-3">
            <span
              className="h-px w-10"
              style={{ background: "rgba(232,184,122,0.6)" }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                letterSpacing: "0.32em",
                fontSize: "10.5px",
                textTransform: "uppercase",
                color: "rgba(246,234,208,0.7)",
                fontWeight: 600,
              }}
            >
              Step back into
            </span>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {doors.map((door) => (
              <li key={door.href}>
                <Link
                  href={door.href}
                  className="group flex items-start justify-between gap-4 rounded-xl p-5 transition-all duration-200"
                  style={{
                    background: "rgba(13,16,39,0.5)",
                    border: "1px solid rgba(232,184,122,0.22)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }}
                >
                  <span className="min-w-0">
                    <span
                      className="block"
                      style={{
                        fontFamily:
                          "var(--font-display), 'Gloock', serif",
                        fontSize: "1.05rem",
                        color: "#f6ead0",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {door.label}
                    </span>
                    <span
                      className="mt-1 block"
                      style={{
                        fontFamily:
                          "var(--font-serif), 'IBM Plex Serif', serif",
                        fontSize: "0.92rem",
                        lineHeight: "1.6",
                        color: "rgba(246,234,208,0.62)",
                      }}
                    >
                      {door.hint}
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-1 h-4 w-4 flex-shrink-0 transition-all group-hover:translate-x-0.5"
                    style={{ color: "rgba(232,184,122,0.8)" }}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Italic close */}
        <p
          className="mt-14 max-w-2xl italic"
          style={{
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            fontSize: "0.95rem",
            lineHeight: "1.7",
            color: "rgba(246,234,208,0.55)",
          }}
        >
          The studio re-hangs its walls often. A plate that&apos;s away today
          is usually back, in a different frame, next month.
        </p>

        {/* Footer cartouche */}
        <div className="mt-14 w-full">
          <div className="flex items-center gap-4">
            <div
              className="h-px flex-1"
              style={{ background: "rgba(232,184,122,0.18)" }}
            />
            <span
              style={{
                fontFamily:
                  "var(--font-mono), 'IBM Plex Mono', monospace",
                letterSpacing: "0.32em",
                fontSize: "10px",
                textTransform: "uppercase",
                color: "rgba(246,234,208,0.45)",
              }}
            >
              Synaptic Cartography · reading-room bulletin · 404
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "rgba(232,184,122,0.18)" }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
