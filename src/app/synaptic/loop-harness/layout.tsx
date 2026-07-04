import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "The Engine Room · Loop & Harness Engineering · Synaptic",
  description:
    "A 30,000-word engineering field manual on loop and harness engineering: the two layers that decide whether a model ever does useful work. Fifteen interactive instruments. Under construction.",
  // Work-in-progress flagship: out of the index until it ships.
  robots: { index: false, follow: false },
}

export default function LoopHarnessLayout({ children }: { children: ReactNode }) {
  // data-read-mode="dark": the Engine Room is a dark terminal-graphite room;
  // every instrument reads this and renders its dark palette.
  return (
    <div className="syn-root syn-loop min-h-screen" data-read-mode="dark">
      {children}
    </div>
  )
}
