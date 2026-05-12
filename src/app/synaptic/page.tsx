import Image from "next/image"
import Link from "next/link"
import visionBanner from "@proposals/SYMPHONY/plates/plate-I-vision.png"
import coverPlanisphere from "@proposals/SYMPHONY/plates/plate-II-cover-planisphere.png"
import chipPlate from "@proposals/MEMPHIS/plates/plate-I-chip.png"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { SmallCaps } from "@/components/editorial/SmallCaps"

export const metadata = {
  title:
    "Synaptic Cartography — SYMPHONY and MEMPHIS · tarrysingh.com",
  description:
    "Two Horizon-Europe deep-tech proposals presented as museum plates: SYMPHONY — a neuromimetic knowledge substrate for software — and MEMPHIS — a hippocampal-inspired memristive neuromorphic chip.",
}

export default function SynapticPage() {
  return (
    <div className="syn-root min-h-screen">
      <header className="syn-column pb-12 pt-24 text-center">
        <SmallCaps>The series</SmallCaps>
        <h1
          className="syn-display mt-6"
          style={{
            fontSize: "var(--text-display)",
            color: "var(--ink)",
            lineHeight: 0.95,
            letterSpacing: "var(--track-display)",
            margin: 0,
          }}
        >
          Synaptic Cartography
        </h1>
        <ItalicCaption className="mx-auto mt-6 max-w-3xl">
          A planisphere and an anatomy of two ideas that should not yet
          exist.
        </ItalicCaption>
      </header>

      <figure className="mx-auto lg:max-w-[90vw]">
        <Image
          src={visionBanner}
          alt="Synaptic Cartography vision banner — the panoramic Plate I that anchors the series, set in the studio's midnight-indigo palette."
          sizes="(min-width: 1280px) 90vw, 100vw"
          placeholder="blur"
          priority
          className="block h-auto w-full"
        />
      </figure>

      <section className="syn-column pt-24">
        <div className="grid gap-10 lg:grid-cols-2">
          <Link
            href="/synaptic/symphony"
            className="syn-symphony group block focus-visible:outline-none"
          >
            <figure>
              <Image
                src={coverPlanisphere}
                alt="Plate II — SYMPHONY cover planisphere, the hero of /synaptic/symphony."
                sizes="(min-width: 1024px) 45vw, 100vw"
                placeholder="blur"
                className="block h-auto w-full rounded-[var(--radius-card)] transition-opacity group-hover:opacity-90"
              />
              <figcaption className="pt-5">
                <SmallCaps>Plate II</SmallCaps>
                <h2
                  className="syn-display mt-2"
                  style={{
                    fontSize: "2.5rem",
                    color: "var(--ink)",
                    lineHeight: 1,
                    letterSpacing: "var(--track-display)",
                    margin: 0,
                  }}
                >
                  SYMPHONY <span style={{ color: "var(--symphony-violet)" }}>→</span>
                </h2>
                <p
                  style={{
                    color: "var(--ink-cool)",
                    marginTop: "0.75rem",
                    lineHeight: 1.5,
                  }}
                >
                  A neuromimetic knowledge substrate for software systems —
                  multi-scale neuromodulation and low-bandwidth shared
                  control for task-adaptive code comprehension.
                </p>
              </figcaption>
            </figure>
          </Link>

          <Link
            href="/synaptic/memphis"
            className="syn-memphis group block focus-visible:outline-none"
          >
            <figure>
              <Image
                src={chipPlate}
                alt="Plate I (MEMPHIS) — the hippocampal-memristive chip plate, hero of /synaptic/memphis."
                sizes="(min-width: 1024px) 45vw, 100vw"
                placeholder="blur"
                className="block h-auto w-full rounded-[var(--radius-card)] transition-opacity group-hover:opacity-90"
              />
              <figcaption className="pt-5">
                <SmallCaps>Plate I · MEMPHIS</SmallCaps>
                <h2
                  className="syn-display mt-2"
                  style={{
                    fontSize: "2.5rem",
                    color: "var(--ink)",
                    lineHeight: 1,
                    letterSpacing: "var(--track-display)",
                    margin: 0,
                  }}
                >
                  MEMPHIS <span style={{ color: "var(--memphis-amber)" }}>→</span>
                </h2>
                <p
                  style={{
                    color: "var(--ink-cool)",
                    marginTop: "0.75rem",
                    lineHeight: 1.5,
                  }}
                >
                  A hippocampal · memristive · neuromorphic architecture.
                  Memory and computation co-localised on a self-organising
                  substrate driven by two-phase replay dynamics.
                </p>
              </figcaption>
            </figure>
          </Link>
        </div>
      </section>

      <footer className="syn-column pb-24 pt-32 text-center">
        <ItalicCaption className="mx-auto max-w-2xl">
          Plates from a studio that takes its time.
        </ItalicCaption>
      </footer>
    </div>
  )
}
