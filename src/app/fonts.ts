import localFont from "next/font/local"

// Self-hosted (src/fonts, Fontsource 5.3.0, SIL OFL 1.1) so the build never
// fetches from Google Fonts; a failed fetch used to fail the Vercel build.

// UI chrome (nav, buttons, controls) — completes the IBM Plex superfamily
// alongside Serif (body) + Mono (labels), replacing Inter so the whole
// site shares one type voice with the Dispatches Synaptic register.
export const synapticSans = localFont({
  src: [
    { path: "../fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/ibm-plex-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
})

export const synapticDisplay = localFont({
  src: [{ path: "../fonts/gloock-latin-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-display",
  display: "swap",
})

export const synapticSerif = localFont({
  src: [
    { path: "../fonts/ibm-plex-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/ibm-plex-serif-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/ibm-plex-serif-latin-600-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
})

export const synapticMono = localFont({
  src: [
    { path: "../fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-mono-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
})
