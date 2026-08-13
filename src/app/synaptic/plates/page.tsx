import Image from "next/image"
import Link from "next/link"
import coverPlanisphere from "@proposals/SYMPHONY/plates/plate-II-cover-planisphere.png"
import chipPlate from "@proposals/MEMPHIS/plates/plate-I-chip.png"
import { SmallCaps } from "@/components/editorial/SmallCaps"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { ChokepointPlate } from "@/components/synaptic/ChokepointPlate"
import { EngineRoomPlate } from "@/components/synaptic/EngineRoomPlate"
import { Software3Plate } from "@/components/synaptic/Software3Plate"
import { ExpandablePlate } from "@/components/synaptic/ExpandablePlate"

export const metadata = {
  title: "The Plate Room · Synaptic Cartography · tarrysingh.com",
  description:
    "Every Synaptic Cartography plate, up close, The Engine Room, The Chokepoint Paradox, Software 3.0, Symphony and Memphis. Click any plate to expand it full-screen, or enter to read.",
}

const svgCover = "absolute inset-0 h-full w-full"

const PLATES = [
  {
    href: "/synaptic/loop-harness",
    kicker: "Plate V · the field manual",
    title: "THE ENGINE ROOM",
    tagline: "Loop & Harness Engineering",
    accent: "#53e08c",
    accentHi: "#8df0b4",
    frameBg: "#070d0e",
    cover: <EngineRoomPlate className={svgCover} />,
  },
  {
    href: "/synaptic/chokepoint-paradox",
    kicker: "Plate IV · the field guide",
    title: "THE CHOKEPOINT PARADOX",
    tagline: "Europe holds the key; Washington owns the lock",
    accent: "#46c7d6",
    accentHi: "#7fd4e0",
    frameBg: "#07111c",
    cover: <ChokepointPlate className={svgCover} />,
  },
  {
    href: "/synaptic/software-3",
    kicker: "Plate III · the gallery",
    title: "SOFTWARE 3.0",
    tagline: "The age of hyper-automation, mapped to 2040",
    accent: "#e8a44a",
    accentHi: "#f4c482",
    frameBg: "#0d0a14",
    cover: <Software3Plate className={svgCover} />,
  },
  {
    href: "/synaptic/symphony",
    kicker: "Plate II · the planisphere",
    title: "SYMPHONY",
    tagline: "A neuromimetic knowledge substrate for software",
    accent: "#a698d4",
    accentHi: "#c8b8ff",
    frameBg: "#0d1027",
    cover: (
      <Image
        src={coverPlanisphere}
        alt="SYMPHONY, the cover planisphere."
        fill
        placeholder="blur"
        sizes="(min-width: 1024px) 560px, 100vw"
        className="object-cover"
      />
    ),
  },
  {
    href: "/synaptic/memphis",
    kicker: "Plate I · the chip",
    title: "MEMPHIS",
    tagline: "A hippocampal · memristive · neuromorphic architecture",
    accent: "#e8b87a",
    accentHi: "#f4c482",
    frameBg: "#0c1524",
    cover: (
      <Image
        src={chipPlate}
        alt="MEMPHIS, the hippocampal-memristive chip plate."
        fill
        placeholder="blur"
        sizes="(min-width: 1024px) 560px, 100vw"
        className="object-cover"
      />
    ),
  },
]

export default function PlateRoomPage() {
  return (
    <div className="syn-root min-h-screen">
      <div className="syn-column pb-32 pt-24">
        <header className="space-y-4 pb-16 text-center">
          <SmallCaps>The plate room</SmallCaps>
          <h1
            className="syn-display mx-auto"
            style={{
              fontSize: "clamp(40px, 6vw, 84px)",
              letterSpacing: "0.04em",
              color: "var(--ink)",
              lineHeight: 1,
              margin: 0,
            }}
          >
            Every plate, up close
          </h1>
          <ItalicCaption className="mx-auto max-w-2xl">
            Five cartographies from a studio that takes its time. Click any
            plate to open it full-screen; enter to read the work behind it.
          </ItalicCaption>
        </header>

        <div className="grid gap-x-10 gap-y-16 lg:grid-cols-2">
          {PLATES.map((p) => (
            <figure key={p.href} className="flex flex-col">
              <ExpandablePlate label={p.title} accent={p.accentHi} frameBg={p.frameBg}>
                {p.cover}
              </ExpandablePlate>
              <figcaption className="pt-6">
                <SmallCaps>{p.kicker}</SmallCaps>
                <h2
                  className="syn-display mt-2"
                  style={{
                    fontSize: "2rem",
                    color: "var(--ink)",
                    lineHeight: 1.05,
                    letterSpacing: "var(--track-display)",
                    margin: 0,
                  }}
                >
                  {p.title}
                </h2>
                <p className="syn-italic-caption mt-2" style={{ color: p.accentHi }}>
                  {p.tagline}
                </p>
                <Link
                  href={p.href}
                  className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition-opacity hover:opacity-80"
                  style={{
                    fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                    color: p.accentHi,
                  }}
                >
                  Enter →
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link
            href="/synaptic"
            className="text-[11px] font-semibold uppercase tracking-[0.28em] transition-opacity hover:opacity-80"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              color: "var(--ink-dim)",
            }}
          >
            ← Back to the studio
          </Link>
        </div>
      </div>
    </div>
  )
}
