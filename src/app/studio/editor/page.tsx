import type { Metadata } from "next"
import { StudioEditor } from "@/components/studio/StudioEditor"
import { DEFAULT_FRONTMATTER } from "@/lib/studio/types"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "New Dispatch · Studio",
  robots: { index: false, follow: false },
}

export default function NewDispatchPage() {
  return (
    <StudioEditor
      initialSlug={null}
      initialFrontmatter={DEFAULT_FRONTMATTER}
      initialBody=""
    />
  )
}
