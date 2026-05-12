import Image from "next/image"
import chipPlate from "@proposals/MEMPHIS/plates/plate-I-chip.png"
import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { SmallCaps } from "@/components/editorial/SmallCaps"

export default function MemphisPage() {
  return (
    <>
      <figure className="relative w-full">
        <Image
          src={chipPlate}
          alt="MEMPHIS Plate I — a hippocampal-memristive chip plate: amber and rose memristor cells over a ceramic substrate with a silicon die, set in the MEMPHIS warm-midnight palette."
          priority
          sizes="100vw"
          placeholder="blur"
          className="block h-auto w-full"
        />
      </figure>

      <header className="syn-column space-y-6 pt-24">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-1">
          <SmallCaps>Plate I</SmallCaps>
          <SmallCaps>Anno 2026</SmallCaps>
          <SmallCaps>Chip · Hippocampal-memristive</SmallCaps>
        </div>
        <h1
          className="syn-display"
          style={{
            fontSize: "var(--text-display)",
            color: "var(--ink)",
            lineHeight: 0.95,
            margin: 0,
          }}
        >
          MEMPHIS
        </h1>
        <ItalicCaption className="max-w-3xl">
          A hippocampal · memristive · neuromorphic architecture — memory
          and computation co-localised on a self-organising substrate
          driven by two-phase replay dynamics.
        </ItalicCaption>
      </header>

      <div className="syn-column">
        <Hairline className="my-16" />
      </div>

      <section className="syn-column space-y-8">
        <SmallCaps>I · The core breakthrough</SmallCaps>
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          The core breakthrough of MEMPHIS lies in the integration of
          hippocampal-inspired computational principles with a
          self-organising memristive hardware substrate, enabling a new
          class of ultra-low-power, adaptive computing systems in which
          memory and computation are co-localised.
        </p>
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          This is a fundamental departure from conventional architectures,
          in which processing and memory sit on opposite sides of a bus.
          MEMPHIS implements a two-phase computational paradigm — online
          event-driven processing for real-time interaction; offline
          replay-driven consolidation for memory optimisation — inside
          the same physical system.
        </p>
        <ItalicCaption className="max-w-3xl">
          The decisive validation: a small-scale memristive spiking network
          (CA3-CA1) performs associative recall and replay-driven
          consolidation, improving task performance after offline
          processing without further external input.
        </ItalicCaption>
      </section>

      <footer className="syn-column pb-24 pt-32 text-center">
        <ItalicCaption className="mx-auto max-w-2xl">
          Memory and computation, co-localised.
        </ItalicCaption>
      </footer>
    </>
  )
}
