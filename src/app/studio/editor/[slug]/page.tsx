import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { StudioEditor } from "@/components/studio/StudioEditor"
import { getDraft } from "@/lib/studio/drafts-store"
import { reopenPublished, isPublished } from "@/lib/studio/reopen"

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
  let draft = await getDraft(slug)

  // No live draft → try the "edit published" path. reopenPublished
  // reads content/blog/<slug>.mdx, parses frontmatter+body, and
  // upserts a draft row marked frontmatter.was_published=true so
  // /api/studio/publish will update the existing file in place rather
  // than reject as slug_already_exists. If the .mdx doesn't exist
  // either, we 404. Either way the editor sees a real draft when it
  // mounts.
  if (!draft) {
    const reopen = await reopenPublished(slug)
    if (reopen.ok) {
      draft = reopen.draft
    } else if (reopen.error === "not_published" || reopen.error === "invalid_slug") {
      notFound()
    } else {
      // parse_failed / save_failed — surface as 404 rather than 500,
      // we don't want to leak server detail to a Basic-Auth-gated page.
      console.error(
        JSON.stringify({
          tag: "studio.editor.reopen_failed",
          slug,
          error: reopen.error,
          debug: reopen.debug,
        }),
      )
      notFound()
    }
  }

  // Truth, not load-path: if the slug is already live on main, this is an
  // in-place update — even when the draft came from getDraft (a lingering
  // pipeline draft, or one predating the was_published flag) rather than
  // the reopen path. Without this, the editor offers "Publish" and the
  // commit fails as slug_already_exists.
  if (!draft.frontmatter.was_published && (await isPublished(slug))) {
    draft = {
      ...draft,
      frontmatter: { ...draft.frontmatter, was_published: true },
    }
  }

  return (
    <StudioEditor
      initialSlug={draft.slug}
      initialFrontmatter={draft.frontmatter}
      initialBody={draft.body}
    />
  )
}
