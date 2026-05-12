import Image from "next/image"
import chipPlate from "@proposals/MEMPHIS/plates/plate-I-chip.png"
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

      <footer className="syn-column pb-24 pt-32 text-center">
        <ItalicCaption className="mx-auto max-w-2xl">
          Memory and computation, co-localised.
        </ItalicCaption>
      </footer>
    </>
  )
}
