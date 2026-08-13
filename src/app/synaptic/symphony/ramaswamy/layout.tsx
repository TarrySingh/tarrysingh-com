import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Sri Ramaswamy · Newcastle · O2 lead · SYMPHONY",
  description:
    "Sri Ramaswamy, chair of computational neuroscience at Newcastle's School of Computing. Third author of Mei, Muller & Ramaswamy (2022), the four-scale neuromodulatory framework SYMPHONY transposes from cortex to code. Leads Objective O2.",
}

export default function RamaswamyLayout({ children }: { children: ReactNode }) {
  return <div className="syn-root syn-symphony min-h-screen">{children}</div>
}
