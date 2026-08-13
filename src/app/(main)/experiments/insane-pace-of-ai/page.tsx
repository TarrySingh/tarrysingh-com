import type { Metadata } from "next"
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google"
import Dashboard from "./Dashboard"
import { NewsletterFooter } from "@/components/blog/NewsletterFooter"
import "./styles.css"

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
