import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { StudioEditor } from "@/components/studio/StudioEditor"
import { getDraft } from "@/lib/studio/drafts-store"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Edit Dispatch — Studio",
  robots: { index: false, follow: false },
}

export default async function EditDispatchPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const draft = await getDraft(slug)
  if (!draft) notFound()

  return (
    <StudioEditor
      initialSlug={draft.slug}
      initialFrontmatter={draft.frontmatter}
      initialBody={draft.body}
    />
  )
}
