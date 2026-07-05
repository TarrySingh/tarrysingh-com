import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "The Engine Room · Loop & Harness Engineering · Synaptic",
  description:
    "A 30,000-word engineering field manual on loop and harness engineering: the two layers that decide whether a model ever does useful work. Fifteen interactive instruments, from a hobbyist's .claude folder to a frontier training run to a self-driving lab.",
  // Work-in-progress flagship: out of the index until it ships.
  robots: { index: false, follow: false },
}

export default function LoopHarnessLayout({ children }: { children: ReactNode }) {
  // The essay reader (page.tsx) owns <article id="read-root"> and its
  // data-read-mode surface + the light/dark toggle. We keep .syn-loop for its
  // --lh-* palette vars but drop .syn-root's fixed graphite background so the
  // reader's --read-bg drives the surface and the toggle can flip the whole page.
  return <div className="syn-loop">{children}</div>
}
