import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Space_Grotesk, Geist, IBM_Plex_Mono } from "next/font/google"
import "./humanoid.css"

// The three reference fonts, self-hosted via next/font and exposed as the
// CSS variables the scoped design system reads (--font-ha-display / -sans / -mono).
const haDisplay = Space_Grotesk({ subsets: ["latin"], variable: "--font-ha-display", display: "swap" })
const haSans = Geist({ subsets: ["latin"], variable: "--font-ha-sans", display: "swap" })
const haMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ha-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "The Humanoid Ascendancy · Interactive Field Guide",
  description:
    "An interactive field guide to the humanoid robotics industry, market models, a clickable value chain, a supply-chain war map, ROI labs, and a hands-on workshop. By Tarry Singh.",
  openGraph: {
    title: "The Humanoid Ascendancy · Interactive Field Guide",
    description:
      "The whole story of embodied AI, narrative, live data tools, and a workshop, in one explorable canvas. By Tarry Singh.",
    type: "website",
  },
}

export default function HumanoidLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`ha-root ${haDisplay.variable} ${haSans.variable} ${haMono.variable}`}>
      {children}
    </div>
  )
}
