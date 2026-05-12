import { ItalicCaption } from "@/components/editorial/ItalicCaption"
import { SmallCaps } from "@/components/editorial/SmallCaps"

export default function SymphonyPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-6 py-16 sm:px-12 lg:px-24">
      <SmallCaps as="p">Synaptic Cartography · Plate II</SmallCaps>
      <ItalicCaption className="mt-6">
        A page is forthcoming.
      </ItalicCaption>
    </main>
  )
}
