import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { synapticDisplay, synapticSerif, synapticMono } from "./fonts"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://tarrysingh.com"),
  title: "Tarry Singh — Entrepreneur & AI Strategist",
  description:
    "Entrepreneur and technologist with over 30 years of experience building and scaling technology ventures across multiple industries and geographies.",
  icons: {
    icon: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.className} ${synapticDisplay.variable} ${synapticSerif.variable} ${synapticMono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
