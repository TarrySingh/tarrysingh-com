import { Gloock, IBM_Plex_Serif, IBM_Plex_Mono } from "next/font/google"

export const synapticDisplay = Gloock({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
})

export const synapticSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
})

export const synapticMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
})
