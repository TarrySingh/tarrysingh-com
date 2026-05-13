import Image from "next/image"
import Link from "next/link"
import visionBanner from "@proposals/SYMPHONY/plates/plate-I-vision.png"
import coverPlanisphere from "@proposals/SYMPHONY/plates/plate-II-cover-planisphere.png"
import chipPlate from "@proposals/MEMPHIS/plates/plate-I-chip.png"
import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { SmallCaps } from "@/components/editorial/SmallCaps"
import { VisionHorizon } from "@/components/synaptic/VisionHorizon"

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

      <div className="mx-auto print:hidden lg:max-w-[90vw]">
        <VisionHorizon />
      </div>
      <figure className="mx-auto hidden print:block lg:max-w-[90vw]">
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

      {/* Deep-dive entry points */}
      <section className="syn-column space-y-10 pt-32">
        <div className="space-y-3 text-center">
          <SmallCaps>Inside SYMPHONY</SmallCaps>
          <h2
            className="syn-display"
            style={{
              fontSize: "2.4rem",
              color: "var(--ink)",
              lineHeight: 1.1,
              letterSpacing: "var(--track-display)",
              margin: 0,
            }}
          >
            Read the consortium one face at a time
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/synaptic/symphony/ramaswamy", name: "Sri Ramaswamy", role: "Newcastle · O2 lead", color: "#e5a896" },
            { href: "/synaptic/symphony/siciliano", name: "Bruno Siciliano", role: "CREATE-PRISMA · O3 lead", color: "#6cb4c2" },
            { href: "/synaptic/symphony/tarry", name: "Tarry Singh", role: "Real AI · Coordinator", color: "#f4c482" },
            { href: "/synaptic/symphony/uprobotics", name: "UP Robotics", role: "Zagreb · industrial demonstrator", color: "#a698d4" },
          ].map((p) => (
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
              <SmallCaps className="block" >{p.role}</SmallCaps>
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

        <div className="grid gap-4 pt-2 sm:grid-cols-2">
          <Link
            href="/synaptic/symphony/proposal"
            className="group block rounded-2xl border p-6 transition-opacity hover:opacity-90"
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
            <SmallCaps>The full proposal</SmallCaps>
            <h3
              className="syn-display mt-3"
              style={{
                fontSize: "1.6rem",
                color: "var(--symphony-amber-hi)",
                lineHeight: 1.1,
                letterSpacing: "var(--track-display)",
                margin: 0,
              }}
            >
              Problem · solution · novelty · go-to-market · funder brief →
            </h3>
            <p
              className="syn-small-caps mt-3"
              style={{ color: "var(--ink-dim)" }}
            >
              12 sections · read on the web
            </p>
          </Link>
          <a
            href="/dossiers/Symphony-Additional-Information-Dossier.docx"
            download
            className="group block rounded-2xl border p-6 transition-opacity hover:opacity-90"
            style={{
              borderColor: "rgba(200,180,255,0.35)",
              background:
                "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <SmallCaps>The EU dossier</SmallCaps>
            <h3
              className="syn-display mt-3"
              style={{
                fontSize: "1.6rem",
                color: "var(--symphony-violet-hi)",
                lineHeight: 1.1,
                letterSpacing: "var(--track-display)",
                margin: 0,
              }}
            >
              Download the 25-page submission ↓
            </h3>
            <p
              className="syn-small-caps mt-3"
              style={{ color: "var(--ink-dim)" }}
            >
              .docx · 7.6 MB · EIC Pathfinder 2026
            </p>
          </a>
        </div>
      </section>

      <div className="syn-column">
        <Hairline className="my-16" />
      </div>

      <footer className="syn-column pb-24 pt-8 text-center">
        <ItalicCaption className="mx-auto max-w-2xl">
          Plates from a studio that takes its time.
        </ItalicCaption>
      </footer>
    </div>
  )
}
