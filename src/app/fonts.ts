import {
  Gloock,
  IBM_Plex_Sans,
  IBM_Plex_Serif,
  IBM_Plex_Mono,
} from "next/font/google"

// UI chrome (nav, buttons, controls) — completes the IBM Plex superfamily
// alongside Serif (body) + Mono (labels), replacing Inter so the whole
// site shares one type voice with the Dispatches Synaptic register.
export const synapticSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

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
