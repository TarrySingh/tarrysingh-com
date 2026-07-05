import type { Metadata } from "next"
import type { ReactNode } from "react"

const DESCRIPTION =
  "A 30,000-word engineering field manual on loop and harness engineering: the two layers that decide whether a model ever does useful work. Fifteen interactive instruments, from a hobbyist's .claude folder to a frontier training run to a self-driving lab."

export const metadata: Metadata = {
  title: "The Engine Room · Loop & Harness Engineering · Synaptic",
  description: DESCRIPTION,
  // Shipped 2026-07-05 — the flagship is public and search-indexable.
  robots: { index: true, follow: true },
  openGraph: {
    title: "The Engine Room — Loop & Harness Engineering",
    description: DESCRIPTION,
    type: "article",
    url: "https://tarrysingh.com/synaptic/loop-harness",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Engine Room — Loop & Harness Engineering",
    description: DESCRIPTION,
  },
}

export default function LoopHarnessLayout({ children }: { children: ReactNode }) {
  // The essay reader (page.tsx) owns <article id="read-root"> and its
  // data-read-mode surface + the light/dark toggle. We keep .syn-loop for its
  // --lh-* palette vars but drop .syn-root's fixed graphite background so the
  // reader's --read-bg drives the surface and the toggle can flip the whole page.
  return <div className="syn-loop">{children}</div>
}
