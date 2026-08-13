import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

const doors: Array<{
  href: string
  label: string
  hint: string
  external?: boolean
}> = [
  {
    href: "/",
    label: "Studio · home",
    hint: "the cover page of tarrysingh.com",
  },
  {
    href: "/synaptic",
    label: "Synaptic Cartography",
    hint: "the plate library, MEMPHIS, SYMPHONY, and the rest of the series",
  },
  {
    href: "/experiments",
    label: "Experiments",
    hint: "the live laboratory, interactive dashboards and analytical microsites",
  },
  {
    href: "/blog",
    label: "Dispatches",
    hint: "quietly written notes and essays from the studio",
  },
]

export const metadata = {
  title: "Plate not found · Tarry Singh",
  description:
    "This plate has wandered off the wall. Step back into the studio and pick another door.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #fbf7ec 0%, #f5efe1 40%, #ece2c8 100%)",
      }}
    >
      {/* Faint paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 18%, rgba(13,16,39,0.6) 0px, transparent 60%), radial-gradient(circle at 78% 72%, rgba(13,16,39,0.45) 0px, transparent 60%)",
        }}
      />

      {/* Top-left tarrysingh.com pill */}
      <nav
        aria-label="Back to tarrysingh.com"
        className="absolute left-5 top-5 z-50"
      >
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-navy-200/70 bg-white/80 px-4 py-2 transition-colors hover:border-gold-400 hover:bg-white"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            fontSize: "10.5px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgb(15, 23, 42)",
          }}
        >
          <span className="text-gold-700 transition-transform duration-200 group-hover:-translate-x-0.5">
            ←
          </span>
          <span>tarrysingh.com</span>
        </Link>
      </nav>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-start justify-center px-6 pt-24 pb-20 lg:px-10">
        {/* Cartouche row */}
        <div className="mb-10 flex w-full items-center gap-4">
          <span
            className="text-[10.5px] font-semibold uppercase text-gold-700"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              letterSpacing: "0.34em",
            }}
          >
            Plate not found
          </span>
          <span className="h-px flex-1 bg-navy-300/40" />
          <span
            className="text-[10.5px] uppercase text-navy-400"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              letterSpacing: "0.28em",
            }}
          >
            № 404 · Cartographer&apos;s note
          </span>
        </div>

        {/* Display title */}
        <h1
          className="text-navy-900 tracking-tight"
          style={{
            fontFamily: "var(--font-display), 'Gloock', serif",
            fontSize: "clamp(2.6rem, 7vw, 4.6rem)",
            lineHeight: "1.05",
          }}
        >
          This plate has
          <br />
          <span className="text-gold-700">wandered.</span>
        </h1>

        {/* Body */}
        <p
          className="mt-8 max-w-2xl text-navy-700"
          style={{
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            fontSize: "1.075rem",
            lineHeight: "1.78",
          }}
        >
          The page you tried to reach is not on the wall. Most likely it was
          moved during a recent re-hang, or the link you followed was drawn
          slightly off. Nothing has been lost, the studio is a small enough
          room that you can step back in and find the right door in seconds.
        </p>

        {/* Doors */}
        <div className="mt-12 w-full">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-gold-400" />
            <span
              className="text-[10.5px] font-semibold uppercase text-navy-500"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                letterSpacing: "0.32em",
              }}
            >
              Try one of these doors
            </span>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {doors.map((door) => (
              <li key={door.href}>
                <Link
                  href={door.href}
                  className="group flex items-start justify-between gap-4 rounded-xl border border-navy-200/70 bg-white/70 p-5 transition-all duration-200 hover:border-gold-400 hover:bg-white hover:shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                >
                  <span className="min-w-0">
                    <span
                      className="block text-base text-navy-900 tracking-tight group-hover:text-gold-700 transition-colors"
                      style={{
                        fontFamily:
                          "var(--font-display), 'Gloock', serif",
                      }}
                    >
                      {door.label}
                    </span>
                    <span
                      className="mt-1 block text-sm text-navy-600 leading-relaxed"
                      style={{
                        fontFamily:
                          "var(--font-serif), 'IBM Plex Serif', serif",
                      }}
                    >
                      {door.hint}
                    </span>
                  </span>
                  {door.external ? (
                    <ArrowUpRight className="mt-1 h-4 w-4 flex-shrink-0 text-navy-400 transition-all group-hover:text-gold-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  ) : (
                    <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-navy-400 transition-all group-hover:text-gold-700 group-hover:translate-x-0.5" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Italic close */}
        <p
          className="mt-14 max-w-2xl text-navy-500 italic"
          style={{
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            fontSize: "0.95rem",
            lineHeight: "1.7",
          }}
        >
          A misplaced plate is rarely a lost one. Try the front door,
          everything important hangs within two clicks of the cover.
        </p>

        {/* Footer cartouche */}
        <div className="mt-14 w-full">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-navy-200/60" />
            <span
              className="text-[10px] uppercase text-navy-400"
              style={{
                fontFamily:
                  "var(--font-mono), 'IBM Plex Mono', monospace",
                letterSpacing: "0.32em",
              }}
            >
              tarrysingh.com · studio bulletin · 404
            </span>
            <div className="h-px flex-1 bg-navy-200/60" />
          </div>
        </div>
      </main>
    </div>
  )
}
