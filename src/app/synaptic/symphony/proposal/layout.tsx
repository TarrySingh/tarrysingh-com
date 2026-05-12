import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title:
    "SYMPHONY · The full proposal · Synaptic Cartography",
  description:
    "The complete SYMPHONY proposal: problem, solution, novelty, evidence, objectives, consortium, industry applications, go-to-market strategy, IP / JV path, EIC Transition follow-on, and the investment thesis for funders and VCs.",
}

export default function SymphonyProposalLayout({
  children,
}: {
  children: ReactNode
}) {
  return <div className="syn-root syn-symphony min-h-screen">{children}</div>
}
