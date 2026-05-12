import Image from "next/image"
import coverPlate from "@proposals/SYMPHONY/plates/plate-II-cover-planisphere.png"
import { Hairline } from "@/components/editorial/Hairline"
import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { SmallCaps } from "@/components/editorial/SmallCaps"

export default function SymphonyPage() {
  return (
    <>
      <figure className="relative w-full">
        <Image
          src={coverPlate}
          alt="SYMPHONY cover plate — a planisphere of the neuromimetic code substrate, with a violet task-baton sweeping twelve sectors of code knowledge."
          priority
          sizes="100vw"
          placeholder="blur"
          className="block h-auto w-full"
        />
      </figure>

      <header className="syn-column space-y-6 pt-24">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-1">
          <SmallCaps>Plate II</SmallCaps>
          <SmallCaps>Anno 2026</SmallCaps>
          <SmallCaps>Cover · Planisphere</SmallCaps>
        </div>
        <h1
          className="syn-display"
          style={{
            fontSize: "var(--text-display)",
            color: "var(--ink)",
            lineHeight: 0.95,
            margin: 0,
          }}
        >
          SYMPHONY
        </h1>
        <ItalicCaption className="max-w-3xl">
          A neuromimetic knowledge substrate for software systems —
          multi-scale neuromodulation and low-bandwidth shared control for
          task-adaptive code comprehension.
        </ItalicCaption>
      </header>

      <div className="syn-column">
        <Hairline className="my-16" />
      </div>

      <section className="syn-column space-y-8">
        <SmallCaps>I · The long-term vision</SmallCaps>
        <p
          style={{
            color: "var(--ink-cool)",
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            maxWidth: "62ch",
          }}
        >
          SYMPHONY will establish the first neuromimetic knowledge substrate
          for software systems: a computational representation of code in which
          the elements of a software system — modules, functions, data flows,
          contracts, tests, commit history, design decisions — are encoded as
          nodes in a multi-scale network whose activation patterns are
          reconfigured, on demand, by task-specific neuromodulatory signals.
        </p>
        <ItalicCaption className="max-w-3xl">
          In plain terms — a code representation that behaves less like a
          document to be re-read and more like a nervous system that
          foregrounds the structures relevant to the engineer&rsquo;s current
          task.
        </ItalicCaption>
      </section>

      <footer className="syn-column pb-24 pt-32 text-center">
        <ItalicCaption className="mx-auto max-w-2xl">
          Same substrate. Different harmonies.
        </ItalicCaption>
      </footer>
    </>
  )
}
