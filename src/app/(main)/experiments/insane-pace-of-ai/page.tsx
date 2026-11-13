import type { Metadata } from "next"
import localFont from "next/font/local"
import Dashboard from "./Dashboard"
import { NewsletterFooter } from "@/components/blog/NewsletterFooter"
import "./styles.css"

const instrumentSerif = localFont({
  src: [
    { path: "../../../../fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../../fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
})

const geist = localFont({
  src: [{ path: "../../../../fonts/geist-latin-wght-normal.woff2", weight: "300 700", style: "normal" }],
  variable: "--font-geist",
  display: "swap",
})

const geistMono = localFont({
  src: [{ path: "../../../../fonts/geist-mono-latin-wght-normal.woff2", weight: "400 600", style: "normal" }],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "The Insane Pace of AI · Q1 2026 Executive Dashboard",
  description:
    "A 75-section executive research dashboard on the state of AI in April 2026. Capability, cost, capital, geopolitics, compute, energy, IP, safety, regulation, strategy, across twenty dimensions of acceleration.",
  openGraph: {
    title: "The Insane Pace of AI · Q1 2026",
    description: "Executive research dashboard · 75 sections · Real AI Inc.",
    type: "article",
  },
}

export default function Page() {
  return (
    <div className={`${instrumentSerif.variable} ${geist.variable} ${geistMono.variable}`}>
      <Dashboard />
      <NewsletterFooter />
    </div>
  )
}
