import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title:
    "Software 3.0 — Age of Hyper-Automation · Synaptic Cartography",
  description:
    "An instrument gallery for the age of hyper-automation. The 2040 planisphere, the silver thread, and a dozen interactive plates charting intelligence, energy, the firm, biology and the off-world frontier — the companion observatory to the essay.",
}

export default function Software3Layout({ children }: { children: ReactNode }) {
  return <div className="syn-root syn-software-3 min-h-screen">{children}</div>
}
