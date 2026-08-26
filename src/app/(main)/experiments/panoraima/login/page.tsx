import type { Metadata } from "next"
import PanoraimaLoginForm from "@/components/panoraima/PanoraimaLoginForm"

export const metadata: Metadata = {
  title: "Sign in — PANORAIMA Consortium Dashboard",
  robots: { index: false, follow: false },
}

const DEFAULT_NEXT = "/experiments/panoraima"

/**
 * Only same-origin paths inside the dashboard are accepted, so a crafted
 * ?next= cannot bounce a signed-in visitor to another site.
 */
function safeNext(raw: string | undefined): string {
  if (!raw) return DEFAULT_NEXT
  if (!raw.startsWith(DEFAULT_NEXT)) return DEFAULT_NEXT
  if (raw.startsWith("//")) return DEFAULT_NEXT
  return raw
}

export default async function PanoraimaLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  return <PanoraimaLoginForm next={safeNext(next)} />
}
