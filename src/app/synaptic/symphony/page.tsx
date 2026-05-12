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

      <main className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12 lg:px-24">
        <header className="space-y-6">
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

        <Hairline className="my-16" />

        <footer className="mt-32 text-center">
          <ItalicCaption className="mx-auto max-w-2xl">
            Same substrate. Different harmonies.
          </ItalicCaption>
        </footer>
      </main>
    </>
  )
}
