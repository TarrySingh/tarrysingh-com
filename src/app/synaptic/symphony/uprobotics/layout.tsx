import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "UP Robotics · Zagreb · Industrial demonstrator · SYMPHONY",
  description:
    "UP Robotics — industrial-automation demonstrator partner. The Croatian engineering shop whose production-system codebase the O1 extraction pipeline and the O4 benchmark have to survive contact with.",
}

export default function UpRoboticsLayout({ children }: { children: ReactNode }) {
  return <div className="syn-root syn-symphony min-h-screen">{children}</div>
}
