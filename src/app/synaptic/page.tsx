import Image from "next/image"
import Link from "next/link"
import visionBanner from "@proposals/SYMPHONY/plates/plate-I-vision.png"
import coverPlanisphere from "@proposals/SYMPHONY/plates/plate-II-cover-planisphere.png"
import chipPlate from "@proposals/MEMPHIS/plates/plate-I-chip.png"
import { Cartouche } from "@/components/editorial/Cartouche"
import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { SmallCaps } from "@/components/editorial/SmallCaps"
import { VisionHorizon } from "@/components/synaptic/VisionHorizon"
import { ChokepointPlate } from "@/components/synaptic/ChokepointPlate"
import { EngineRoomPlate } from "@/components/synaptic/EngineRoomPlate"
import { Software3Plate } from "@/components/synaptic/Software3Plate"
import { PlateCarousel } from "@/components/synaptic/PlateCarousel"

export const metadata = {
  title:
    "Synaptic Cartography — The Engine Room · The Chokepoint Paradox · SYMPHONY · tarrysingh.com",
  description:
    "A studio of deep-tech proposals and long-form field guides presented as museum-grade interactive plates: THE ENGINE ROOM — a 30,000-word field manual on loop and harness engineering with fifteen instruments — and THE CHOKEPOINT PARADOX — a ~45,000-word field guide to Europe's tech-sovereignty failure with ~40 instruments — alongside SYMPHONY and MEMPHIS, two EIC Pathfinder 2026 submissions, and the SOFTWARE 3.0 gallery.",
}

const proseStyle = {
  color: "var(--ink-cool)",
  fontSize: "var(--text-body)",
  lineHeight: 1.7,
  maxWidth: "62ch",
} as const

const sectionHeading = {
  color: "var(--ink)",
  fontSize: "2.4rem",
  lineHeight: 1.1,
  margin: 0,
  letterSpacing: "var(--track-display)",
} as const

const PARTNERS = [
  { href: "/synaptic/symphony/ramaswamy", name: "Sri Ramaswamy", role: "Newcastle · O2 lead", color: "#e5a896" },
  { href: "/synaptic/symphony/siciliano", name: "Bruno Siciliano", role: "CREATE-PRISMA · O3 lead", color: "#6cb4c2" },
  { href: "/synaptic/symphony/tarry", name: "Tarry Singh", role: "Real AI · Coordinator", color: "#f4c482" },
  { href: "/synaptic/symphony/uprobotics", name: "UP Robotics", role: "Zagreb · industrial demonstrator", color: "#a698d4" },
] as const

export default function SynapticPage() {
  return (
    <div className="syn-root min-h-screen">
      {/* studio header */}
      <header className="syn-column pt-16">
        <div className="flex items-start justify-between syn-small-caps" style={{ color: "var(--ink-dim)" }}>
          <div>
            <div style={{ color: "var(--ink)", letterSpacing: "0.2em", fontSize: "0.78rem" }}>
              SYNAPTIC CARTOGRAPHY · MMXXVI
            </div>
            <div className="mt-1">A studio of deep-tech proposals</div>
          </div>
          <div className="text-right">
            <div style={{ color: "var(--ink)", letterSpacing: "0.2em", fontSize: "0.78rem" }}>
              FOLIO 0
            </div>
            <div className="mt-1">EIC Pathfinder 2026</div>
          </div>
        </div>
        <Hairline className="mt-4" />

        {/* title */}
        <div className="mt-14 text-center">
          <SmallCaps>The series</SmallCaps>
          <h1
            className="syn-display mt-6"
            style={{
              fontSize: "clamp(56px, 9vw, 132px)",
              letterSpacing: "0.08em",
              color: "var(--ink)",
              lineHeight: 1,
              margin: 0,
            }}
          >
            Synaptic Cartography
          </h1>
          <ItalicCaption className="mx-auto mt-6 max-w-3xl">
            A planisphere and an anatomy of ideas that should not yet
            exist — rendered as museum-grade interactive plates and bound
            into a coherent body of work.
          </ItalicCaption>
          <p
            className="syn-small-caps mt-3"
            style={{ color: "var(--ink-dim)", letterSpacing: "0.3em" }}
          >
            · five cartographies · the studio grows ·
          </p>
        </div>
      </header>

      {/* interactive vision horizon */}
      <section className="mt-16 print:hidden lg:mx-auto lg:max-w-[90vw]">
        <VisionHorizon />
      </section>
      <figure className="mx-auto hidden print:block lg:max-w-[90vw]">
        <Image
          src={visionBanner}
          alt="Synaptic Cartography vision banner — the panoramic Plate I that anchors the series."
          sizes="(min-width: 1280px) 90vw, 100vw"
          placeholder="blur"
          priority
          className="block h-auto w-full"
        />
      </figure>

      <div className="syn-column">
        <Hairline className="mt-20" />
      </div>

      {/* manifesto */}
      <section className="syn-column space-y-8 pt-20">
        <div className="space-y-3 text-center">
          <SmallCaps>The studio</SmallCaps>
          <h2 className="syn-display mx-auto" style={sectionHeading}>
            What this is for
          </h2>
        </div>
        <p className="mx-auto" style={proseStyle}>
          Synaptic Cartography is an aesthetic of quiet, museum-grade
          scientific illustration applied to the technical content of
          frontier deep-tech proposals. Each plate is built like a
          nineteenth-century anatomical folio — except every line, every
          colour, every data point is interactive. Hover. Click. Scrub the
          curve. The image is the argument.
        </p>
        <p className="mx-auto" style={proseStyle}>
          Two proposals live here. Both target post-von-Neumann
          computing from opposite ends — one on the software side
          (SYMPHONY · a neuromimetic substrate for code), one on the
          hardware side (MEMPHIS · a hippocampal-memristive chip). Both
          are EIC Pathfinder 2026 submissions. Future plates in the
          series will join them as they earn their place.
        </p>
        <ItalicCaption className="mx-auto max-w-3xl text-center">
          The plate is the argument. The argument is the plate.
        </ItalicCaption>
      </section>

      <div className="syn-column">
        <Hairline className="mt-20" />
      </div>

      {/* the plates — an auto-advancing showcase, every plate at full size */}
      <section className="syn-column pt-20">
        <div className="space-y-3 pb-14 text-center">
          <SmallCaps>Five cartographies</SmallCaps>
          <h2 className="syn-display mx-auto" style={sectionHeading}>
            The plates
          </h2>
        </div>

        <PlateCarousel>
          {/* Plate V — The Engine Room */}
          <Link
            href="/synaptic/loop-harness"
            className="syn-loop group block focus-visible:outline-none"
          >
            <figure className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
              <div
                className="relative overflow-hidden rounded-[var(--radius-card)]"
                style={{
                  aspectRatio: "4 / 5",
                  background: "#070d0e",
                  boxShadow:
                    "0 0 0 1px rgba(141,240,180,0.18), 0 22px 70px rgba(0,0,0,0.5)",
                }}
              >
                <EngineRoomPlate className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.01]" />
              </div>
              <figcaption>
                <SmallCaps>Plate V · the field manual</SmallCaps>
                <h3
                  className="syn-display mt-3"
                  style={{
                    fontSize: "clamp(2.2rem, 4vw, 3.1rem)",
                    color: "var(--ink)",
                    lineHeight: 1,
                    letterSpacing: "var(--track-display)",
                    margin: 0,
                  }}
                >
                  THE ENGINE ROOM{" "}
                  <span style={{ color: "#8df0b4" }}>→</span>
                </h3>
                <p className="syn-italic-caption mt-3" style={{ color: "#8fd8b4" }}>
                  Loop &amp; Harness Engineering
                </p>
                <p style={{ color: "var(--ink-cool)", marginTop: "0.9rem", lineHeight: 1.65 }}>
                  Everyone argues about models. Whether a model ever does useful
                  work is decided by two other things: the loop it runs in, and
                  the standing structure that loop runs inside. A 30,000-word
                  field manual, fifteen interactive instruments, every figure
                  citable.
                </p>
                <p className="syn-small-caps mt-5" style={{ color: "var(--ink-dim)" }}>
                  Synaptic Cartography · July 2026
                </p>
              </figcaption>
            </figure>
          </Link>

          {/* Plate IV — The Chokepoint Paradox */}
          <Link
            href="/synaptic/chokepoint-paradox"
            className="syn-chokepoint group block focus-visible:outline-none"
          >
            <figure className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
              <div
                className="relative overflow-hidden rounded-[var(--radius-card)]"
                style={{
                  aspectRatio: "4 / 5",
                  background: "#07111c",
                  boxShadow:
                    "0 0 0 1px rgba(70,199,214,0.18), 0 22px 70px rgba(0,0,0,0.5)",
                }}
              >
                <ChokepointPlate className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.01]" />
              </div>
              <figcaption>
                <SmallCaps>Plate IV · the field guide</SmallCaps>
                <h3
                  className="syn-display mt-3"
                  style={{
                    fontSize: "clamp(2.2rem, 4vw, 3.1rem)",
                    color: "var(--ink)",
                    lineHeight: 1,
                    letterSpacing: "var(--track-display)",
                    margin: 0,
                  }}
                >
                  THE CHOKEPOINT PARADOX{" "}
                  <span style={{ color: "#46c7d6" }}>→</span>
                </h3>
                <p className="syn-italic-caption mt-3" style={{ color: "#7fd4e0" }}>
                  Europe holds the key; Washington owns the lock
                </p>
                <p style={{ color: "var(--ink-cool)", marginTop: "0.9rem", lineHeight: 1.65 }}>
                  The flagship field guide to Europe&rsquo;s tech-sovereignty
                  failure &mdash; the machine that ships a continent&rsquo;s
                  wealth, talent and IP west, and the narrow door still open.
                  Twelve chapters, a coda, and roughly forty bespoke instruments.
                </p>
                <p className="syn-small-caps mt-5" style={{ color: "var(--ink-dim)" }}>
                  Synaptic Cartography · July 2026
                </p>
              </figcaption>
            </figure>
          </Link>

          {/* Plate III — Software 3.0 (landscape cover, letterboxed to the plate frame) */}
          <Link
            href="/synaptic/software-3"
            className="syn-software-3 group block focus-visible:outline-none"
          >
            <figure className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
              <div
                className="relative overflow-hidden rounded-[var(--radius-card)]"
                style={{
                  aspectRatio: "4 / 5",
                  background: "#0d0a14",
                  boxShadow:
                    "0 0 0 1px rgba(232,164,74,0.18), 0 22px 70px rgba(0,0,0,0.5)",
                }}
              >
                <Software3Plate className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.01]" />
              </div>
              <figcaption>
                <SmallCaps>Plate III · the gallery</SmallCaps>
                <h3
                  className="syn-display mt-3"
                  style={{
                    fontSize: "clamp(2.2rem, 4vw, 3.1rem)",
                    color: "var(--ink)",
                    lineHeight: 1,
                    letterSpacing: "var(--track-display)",
                    margin: 0,
                  }}
                >
                  SOFTWARE 3.0{" "}
                  <span style={{ color: "var(--sw3-accent)" }}>→</span>
                </h3>
                <p className="syn-italic-caption mt-3" style={{ color: "var(--sw3-accent-hi)" }}>
                  The age of hyper-automation &mdash; a map to 2040
                </p>
                <p style={{ color: "var(--ink-cool)", marginTop: "0.9rem", lineHeight: 1.65 }}>
                  Fifteen interactive instruments at full size &mdash; the 2040
                  planisphere, the silver thread, the convergence. The living
                  companion to the flagship essay.
                </p>
                <p className="syn-small-caps mt-5" style={{ color: "var(--ink-dim)" }}>
                  Essay companion · June 2026
                </p>
              </figcaption>
            </figure>
          </Link>

          {/* Plate II — SYMPHONY */}
          <Link
            href="/synaptic/symphony"
            className="syn-symphony group block focus-visible:outline-none"
          >
            <figure className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
              <div
                className="relative overflow-hidden rounded-[var(--radius-card)]"
                style={{
                  aspectRatio: "4 / 5",
                  background: "#0d1027",
                  boxShadow:
                    "0 0 0 1px rgba(166,152,212,0.18), 0 22px 70px rgba(0,0,0,0.5)",
                }}
              >
                <Image
                  src={coverPlanisphere}
                  alt="Plate II — SYMPHONY cover planisphere."
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 500px, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption>
                <SmallCaps>Plate II · the planisphere</SmallCaps>
                <h3
                  className="syn-display mt-3"
                  style={{
                    fontSize: "clamp(2.2rem, 4vw, 3.1rem)",
                    color: "var(--ink)",
                    lineHeight: 1,
                    letterSpacing: "var(--track-display)",
                    margin: 0,
                  }}
                >
                  SYMPHONY{" "}
                  <span style={{ color: "var(--symphony-violet)" }}>→</span>
                </h3>
                <p className="syn-italic-caption mt-3" style={{ color: "var(--symphony-violet-hi)" }}>
                  A neuromimetic knowledge substrate for software systems
                </p>
                <p style={{ color: "var(--ink-cool)", marginTop: "0.9rem", lineHeight: 1.65 }}>
                  Multi-scale neuromodulation and low-bandwidth shared control
                  for task-adaptive code comprehension. Twelve interactive
                  plates · the full proposal · the four partners.
                </p>
                <p className="syn-small-caps mt-5" style={{ color: "var(--ink-dim)" }}>
                  EIC Pathfinder 2026 · May 2026
                </p>
              </figcaption>
            </figure>
          </Link>

          {/* Plate I — MEMPHIS */}
          <Link
            href="/synaptic/memphis"
            className="syn-memphis group block focus-visible:outline-none"
          >
            <figure className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
              <div
                className="relative overflow-hidden rounded-[var(--radius-card)]"
                style={{
                  aspectRatio: "4 / 5",
                  background: "#0c1524",
                  boxShadow:
                    "0 0 0 1px rgba(232,184,122,0.18), 0 22px 70px rgba(0,0,0,0.5)",
                }}
              >
                <Image
                  src={chipPlate}
                  alt="Plate I (MEMPHIS) — the hippocampal-memristive chip plate."
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 500px, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption>
                <SmallCaps>Plate I · the chip</SmallCaps>
                <h3
                  className="syn-display mt-3"
                  style={{
                    fontSize: "clamp(2.2rem, 4vw, 3.1rem)",
                    color: "var(--ink)",
                    lineHeight: 1,
                    letterSpacing: "var(--track-display)",
                    margin: 0,
                  }}
                >
                  MEMPHIS{" "}
                  <span style={{ color: "var(--memphis-amber)" }}>→</span>
                </h3>
                <p className="syn-italic-caption mt-3" style={{ color: "var(--memphis-amber-hi)" }}>
                  A hippocampal · memristive · neuromorphic architecture
                </p>
                <p style={{ color: "var(--ink-cool)", marginTop: "0.9rem", lineHeight: 1.65 }}>
                  Memory and computation co-localised on a self-organising
                  substrate driven by two-phase replay dynamics. Five
                  interactive plates · STDP window · CA3 ↔ CA1 circuit.
                </p>
                <p className="syn-small-caps mt-5" style={{ color: "var(--ink-dim)" }}>
                  EIC Pathfinder 2026 · May 2026
                </p>
              </figcaption>
            </figure>
          </Link>
        </PlateCarousel>

        <div className="mt-12 text-center">
          <Link
            href="/synaptic/plates"
            className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] transition-opacity hover:opacity-80"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              color: "var(--ink)",
              borderColor: "rgba(233,242,236,0.2)",
            }}
          >
            See every plate up close →
          </Link>
        </div>
      </section>

      {/* partner pages strip */}
      <section className="syn-column space-y-10 pt-32">
        <div className="space-y-3 text-center">
          <SmallCaps>Inside SYMPHONY</SmallCaps>
          <h2 className="syn-display mx-auto" style={sectionHeading}>
            Read the consortium one face at a time
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PARTNERS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group block rounded-xl border p-5 transition-colors"
              style={{
                borderColor: "rgba(200,180,255,0.18)",
                background:
                  "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <SmallCaps>{p.role}</SmallCaps>
              <h3
                className="syn-display mt-3"
                style={{
                  fontSize: "1.4rem",
                  color: "var(--ink)",
                  lineHeight: 1.15,
                  letterSpacing: "0.04em",
                  margin: 0,
                }}
              >
                {p.name}
              </h3>
              <p
                className="syn-mono mt-3"
                style={{
                  color: p.color,
                  fontSize: "0.72rem",
                  letterSpacing: "var(--track-mono)",
                  textTransform: "uppercase",
                }}
              >
                Read the full page →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* read the dossiers */}
      <section className="syn-column space-y-10 pt-32">
        <div className="space-y-3 text-center">
          <SmallCaps>The complete dossiers</SmallCaps>
          <h2 className="syn-display mx-auto" style={sectionHeading}>
            Read the proposals end-to-end
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/synaptic/symphony/proposal"
            className="block rounded-2xl border p-6 transition-opacity hover:opacity-90"
            style={{
              borderColor: "rgba(255,210,150,0.45)",
              background:
                "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow:
                "0 0 0 1px rgba(255,210,150,0.18), 0 12px 40px rgba(0,0,0,0.45)",
            }}
          >
            <SmallCaps>SYMPHONY · the full proposal</SmallCaps>
            <h3
              className="syn-display mt-3"
              style={{
                fontSize: "1.4rem",
                color: "var(--symphony-amber-hi)",
                lineHeight: 1.15,
                letterSpacing: "var(--track-display)",
                margin: 0,
              }}
            >
              Problem · solution · novelty · go-to-market · funder brief →
            </h3>
            <p className="syn-small-caps mt-3" style={{ color: "var(--ink-dim)" }}>
              12 sections · read on the web
            </p>
          </Link>
          <Link
            href="/synaptic/memphis/proposal"
            className="block rounded-2xl border p-6 transition-opacity hover:opacity-90"
            style={{
              borderColor: "rgba(232,184,122,0.45)",
              background:
                "linear-gradient(180deg, rgba(20,34,59,0.85), rgba(12,24,40,0.92))",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow:
                "0 0 0 1px rgba(232,184,122,0.18), 0 12px 40px rgba(0,0,0,0.45)",
            }}
          >
            <SmallCaps>MEMPHIS · the full proposal</SmallCaps>
            <h3
              className="syn-display mt-3"
              style={{
                fontSize: "1.4rem",
                color: "var(--memphis-amber-hi)",
                lineHeight: 1.15,
                letterSpacing: "var(--track-display)",
                margin: 0,
              }}
            >
              Three breakthroughs · three objectives · investment thesis →
            </h3>
            <p className="syn-small-caps mt-3" style={{ color: "var(--ink-dim)" }}>
              9 sections · v5X content · &lt; 10 fJ per synaptic event
            </p>
          </Link>
        </div>
      </section>

      {/* future plates */}
      <section className="syn-column pt-32">
        <Cartouche title="In the studio" meta="forthcoming plates">
          <p style={{ color: "var(--ink)", lineHeight: 1.6, fontSize: "0.98rem" }}>
            More plates in the Synaptic Cartography series are in
            preparation. Each will earn its place the same way SYMPHONY
            and MEMPHIS did — a defensible scientific claim, a published
            primary source for the mechanism, a real partner who has
            survived contact with the field, and visuals built like the
            inside of a Wellcome Collection folio.
          </p>
          <p
            className="syn-italic-caption mt-4"
            style={{ color: "var(--ink-cool)" }}
          >
            The studio takes its time. The next plate appears when the
            work is ready, not when the calendar asks for it.
          </p>
        </Cartouche>
      </section>

      <div className="syn-column">
        <Hairline className="my-20" />
      </div>

      {/* colophon */}
      <section className="syn-column pb-12">
        <div className="grid gap-8 md:grid-cols-3" style={{ color: "var(--ink-cool)", fontSize: "0.86rem", lineHeight: 1.6 }}>
          <div>
            <SmallCaps>Typography</SmallCaps>
            <p className="mt-2">
              Gloock display serif (project names, large numerals · plate
              roman numerals). IBM Plex Serif (body, italic captions).
              IBM Plex Mono (small-caps tracked labels, axis ticks).
            </p>
          </div>
          <div>
            <SmallCaps>Palette</SmallCaps>
            <p className="mt-2">
              Midnight indigo / cool-navy backgrounds. Cream · amber ·
              rose · teal inks. Symphony accent: lavender-violet
              (task baton). MEMPHIS accent: warm amber (firing memristor).
            </p>
          </div>
          <div>
            <SmallCaps>Editorial rules</SmallCaps>
            <p className="mt-2">
              British English. No emojis. No marketing words. Lead with
              the claim, then evidence, then caveat. Each page ends with
              one italic line. The plate is the argument.
            </p>
          </div>
        </div>
      </section>

      <footer className="syn-column pb-24 pt-12 text-center">
        <ItalicCaption className="mx-auto max-w-2xl">
          Plates from a studio that takes its time.
        </ItalicCaption>
        <p
          className="syn-small-caps mt-8"
          style={{ color: "var(--ink-dim)", letterSpacing: "0.3em" }}
        >
          ·
          <Link
            href="/"
            className="mx-3 hover:opacity-80"
            style={{ color: "var(--symphony-violet-hi)" }}
          >
            tarrysingh.com
          </Link>
          ·
          <Link
            href="/experiments"
            className="mx-3 hover:opacity-80"
            style={{ color: "var(--symphony-violet-hi)" }}
          >
            experiments
          </Link>
          ·
        </p>
      </footer>
    </div>
  )
}
