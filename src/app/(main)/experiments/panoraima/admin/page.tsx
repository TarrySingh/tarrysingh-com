import type { Metadata } from "next"
import { headers } from "next/headers"
import PanoraimaAdmin from "@/components/panoraima/PanoraimaAdmin"

export const metadata: Metadata = {
  title: "Dashboard access — PANORAIMA",
  robots: { index: false, follow: false },
}

/** Middleware already blocks non-admins; this only needs the signed-in identity. */
export default async function PanoraimaAdminPage() {
  const h = await headers()
  const me = h.get("x-panoraima-email") || "admin"
  return <PanoraimaAdmin me={me} />
}
