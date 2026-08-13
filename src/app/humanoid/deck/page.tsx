import type { Metadata } from "next"
import "./deck.css"
import { DeckViewer } from "@/components/humanoid/deck/DeckViewer"

export const metadata: Metadata = {
  title: "The State of Humanoid Robotics · The Full Deck · The Humanoid Ascendancy",
  description:
    "The complete State of Humanoid Robotics report, rebuilt as native interactive pages, present-mode, keyboard-driven, with the data live. By Tarry Singh.",
  robots: { index: false }, // un-hide when the full manifest ships (Phase C)
}

export default function DeckPage() {
  return <DeckViewer />
}
