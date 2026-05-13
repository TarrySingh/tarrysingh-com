import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Tarry Singh · Real AI · Coordinator · SYMPHONY",
  description:
    "Tarry Singh — founder of Real AI, coordinator of SYMPHONY. Three decades across data and AI delivery at industrial scale. Builds the Hominis foundation-model programme on EuroHPC allocation time at Leonardo / CINECA. Leads Objectives O1 and O4.",
}

export default function TarryLayout({ children }: { children: ReactNode }) {
  return <div className="syn-root syn-symphony min-h-screen">{children}</div>
}
