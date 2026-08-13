import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Bruno Siciliano · CREATE-PRISMA · O3 lead · SYMPHONY",
  description:
    "Bruno Siciliano, director of PRISMA Lab at CREATE / UNINA. ERC Advanced Grant holder, Engelberger laureate. The architectural primary source for SYMPHONY's task-baton: low-bandwidth descending signals reshaping high-DOF controllers. Leads Objective O3.",
}

export default function SicilianoLayout({ children }: { children: ReactNode }) {
  return <div className="syn-root syn-symphony min-h-screen">{children}</div>
}
