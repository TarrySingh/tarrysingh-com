import type { Metadata } from "next"
import PanoraimaAccount from "@/components/panoraima/PanoraimaAccount"

export const metadata: Metadata = {
  title: "Your account — PANORAIMA",
  robots: { index: false, follow: false },
}

/** Middleware has already established a session; the API enforces identity. */
export default function PanoraimaAccountPage() {
  return <PanoraimaAccount />
}
