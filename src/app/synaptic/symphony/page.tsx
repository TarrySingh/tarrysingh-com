import Image from "next/image"
import coverPlate from "@proposals/SYMPHONY/plates/plate-II-cover-planisphere.png"
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
      <main className="mx-auto max-w-[1400px] px-6 py-16 sm:px-12 lg:px-24">
        <SmallCaps as="p">Synaptic Cartography · Plate II</SmallCaps>
        <ItalicCaption className="mt-6">
          A page is forthcoming.
        </ItalicCaption>
      </main>
    </>
  )
}
