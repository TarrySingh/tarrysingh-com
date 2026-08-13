import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title:
    "SYMPHONY, A Neuromimetic Knowledge Substrate for Software Systems · Synaptic Cartography",
  description:
    "Multi-scale neuromodulation and low-bandwidth shared control for task-adaptive code comprehension. An EIC Pathfinder 2026 proposal.",
}

export default function SymphonyLayout({
  children,
}: {
  children: ReactNode
}) {
  return <div className="syn-root syn-symphony min-h-screen">{children}</div>
}
