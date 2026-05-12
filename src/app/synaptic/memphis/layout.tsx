import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title:
    "MEMPHIS — A Hippocampal · Memristive · Neuromorphic Architecture · Synaptic Cartography",
  description:
    "Memory and computation, co-localised. A neuromorphic chip that co-locates memory and computation through a self-organising memristive substrate driven by hippocampal-inspired two-phase dynamics.",
}

export default function MemphisLayout({
  children,
}: {
  children: ReactNode
}) {
  return <div className="syn-root syn-memphis min-h-screen">{children}</div>
}
