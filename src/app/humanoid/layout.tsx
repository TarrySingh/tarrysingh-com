import type { Metadata } from "next"
import type { ReactNode } from "react"
import localFont from "next/font/local"
import "./humanoid.css"

// The three reference fonts, self-hosted from src/fonts via next/font/local and exposed as the
// CSS variables the scoped design system reads (--font-ha-display / -sans / -mono).
const haDisplay = localFont({
  src: [{ path: "../../fonts/space-grotesk-latin-wght-normal.woff2", weight: "300 700", style: "normal" }],
  variable: "--font-ha-display",
  display: "swap",
})
const haSans = localFont({
  src: [{ path: "../../fonts/geist-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-ha-sans",
  display: "swap",
})
const haMono = localFont({
  src: [
    { path: "../../fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../fonts/ibm-plex-mono-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
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
