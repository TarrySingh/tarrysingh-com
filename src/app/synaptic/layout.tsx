import type { ReactNode } from "react"
import { SynapticSiteNav } from "@/components/synaptic/SiteNav"

/**
 * Shared parent layout for every /synaptic route. Renders the
 * back-to-tarrysingh.com pill once at the top-left of the viewport;
 * child layouts continue to set their own .syn-root + project
 * palette class on the page wrapper.
 */
export default function SynapticTreeLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      <SynapticSiteNav />
      {children}
    </>
  )
}
