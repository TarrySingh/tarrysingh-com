import { NextRequest, NextResponse } from "next/server"
import { getDraft, deleteDraft } from "@/lib/studio/drafts-store"
import { publishDispatch } from "@/lib/studio/publish"
import { deleteFilesBySlugInFolder } from "@/lib/drive/client"
import { SLUG_RE } from "@/lib/studio/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30 // GitHub API can take a few seconds

interface PublishBody {
  slug?: unknown
}

/**
 * POST /api/studio/publish
 *
 * Pulls the draft from Supabase, validates its frontmatter, commits
 * the resulting .mdx straight to main via the GitHub API, and on
 * success deletes the draft row.
 *
 * Body: { slug }
 *
 * Failure modes (all fail-closed):
 *   - 503  github_unconfigured   → STUDIO_GITHUB_TOKEN missing
 *   - 422  invalid_slug          → slug doesn't match SLUG_RE
 *   - 404  draft_not_found       → no row in Supabase
 *   - 409  slug_already_exists   → content/blog/<slug>.mdx already on main
 *   - 422  invalid_frontmatter   → title / excerpt empty etc
 *   - 502  github_api_error      → Octokit threw
 *   - 500  save_failed           → Supabase delete error after a successful commit
 *
 * Returns on success:
 *   { ok: true, commitSha, commitUrl, blogUrl }
 */
export async function POST(req: NextRequest) {
  let body: PublishBody
  try {
    body = (await req.json()) as PublishBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : ""
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ ok: false, error: "invalid_slug" }, { status: 422 })
  }

  const draft = await getDraft(slug)
  if (!draft) {
    return NextResponse.json({ ok: false, error: "draft_not_found" }, { status: 404 })
  }

  const fm = draft.frontmatter
  if (!fm.title.trim() || !fm.excerpt.trim()) {
    return NextResponse.json({ ok: false, error: "invalid_frontmatter" }, { status: 422 })
  }

  // If the draft was loaded from an already-published .mdx via the
  // /studio/editor/[slug] reopen path, frontmatter.was_published will
  // be true. publishDispatch then runs the in-place update branch
  // instead of the create branch.
  const result = await publishDispatch({
    slug,
    frontmatter: fm,
    body: draft.body,
    allowOverwrite: fm.was_published === true,
  })

  if (!result.ok) {
    const status =
      result.error === "github_unconfigured" ? 503 :
      result.error === "slug_already_exists" ? 409 :
      result.error === "invalid_input" ? 422 :
      502
    return NextResponse.json(result, { status })
  }

  // Successful commit — best-effort delete the draft row. If the
  // delete fails the post is still live, just leaves a stale row.
  try {
    await deleteDraft(slug)
  } catch (err) {
    console.warn(JSON.stringify({ tag: "studio.publish.draft_delete_failed", slug, error: err instanceof Error ? err.message : String(err) }))
  }

  // Best-effort Drive cleanup — unlink any source file in the
  // tarry-daily-blogs folder matching `*_<slug>.md`. The email-approve
  // route already does this; the studio-editor publish path used not
  // to, which left a stale `YYYY-MM-DD_<slug>.md` in Drive that the
  // backup writer would then mistake for today's article and skip,
  // suppressing the next morning's Dispatch email.
  // Caught on 2026-05-26 when no Dispatch arrived after publishing
  // the previous day's essay via the studio-editor button.
  try {
    const dr = await deleteFilesBySlugInFolder(slug)
    if (!dr.ok) {
      console.warn(JSON.stringify({ tag: "studio.publish.drive_unlink_failed", slug, error: dr.error, debug: "debug" in dr ? dr.debug : undefined }))
    } else {
      console.log(JSON.stringify({ tag: "studio.publish.drive_unlinked", slug, deleted: dr.deleted, names: dr.names }))
    }
  } catch (err) {
    console.warn(JSON.stringify({ tag: "studio.publish.drive_unlink_threw", slug, error: err instanceof Error ? err.message : String(err) }))
  }

  return NextResponse.json(result)
}
