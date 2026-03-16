"use client"

import { ThemeProvider } from "@/lib/jobs/theme"

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ThemeProvider>{children}</ThemeProvider>
}
