import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "The Chokepoint Paradox — Europe Holds the Key, Washington Owns the Lock · Synaptic",
  description:
    "A field guide to the machine that transfers Europe's wealth, talent and IP to the US and China — and the narrow door still open. The companion instrument gallery to the essay. Current to July 2026.",
  // Work-in-progress flagship: keep it out of the index until it ships.
  robots: { index: false, follow: false },
}

export default function ChokepointParadoxLayout({ children }: { children: ReactNode }) {
  return <div className="syn-root syn-chokepoint min-h-screen">{children}</div>
}
