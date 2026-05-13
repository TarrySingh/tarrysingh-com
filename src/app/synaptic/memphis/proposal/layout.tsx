import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "MEMPHIS · The full proposal · Synaptic Cartography",
  description:
    "The complete MEMPHIS proposal: hippocampal-memristive neuromorphic architecture, five §1.2.2 advances, the CA3-CA1 decisive validation, real-world applications, and the investment thesis for funders and VCs.",
}

export default function MemphisProposalLayout({
  children,
}: {
  children: ReactNode
}) {
  return <div className="syn-root syn-memphis min-h-screen">{children}</div>
}
