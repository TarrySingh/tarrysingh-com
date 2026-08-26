import { headers } from "next/headers"
import PanoraimaSessionBar from "@/components/panoraima/PanoraimaSessionBar"

/**
 * Wraps every dashboard page so the session controls are available
 * throughout. The role comes from middleware, which has already verified the
 * signed session cookie.
 */
export default async function PanoraimaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const h = await headers()
  const role = h.get("x-panoraima-role") === "admin" ? "admin" : "member"
  const email = h.get("x-panoraima-email") || ""

  return (
    <>
      {children}
      <PanoraimaSessionBar role={role} email={email} />
    </>
  )
}
