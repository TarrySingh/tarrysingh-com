import { NextRequest, NextResponse } from "next/server"
import { getFileAtCommit } from "@/lib/studio/history"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/studio/history/file?slug=<slug>&sha=<sha>
 *
 * Returns `content/blog/<slug>.mdx` as it existed at the given commit
 * SHA. Used by the editor's history pane to render side-by-side
 * comparisons + to populate the "preview at this commit" view.
 *
 * (Not a dynamic [sha] route — query params keep the URL flat and
 * the auth middleware matcher single-prefix.)
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim()
  const sha = req.nextUrl.searchParams.get("sha")?.trim()
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "missing_slug" },
      { status: 400 },
    )
  }
  if (!sha) {
    return NextResponse.json(
      { ok: false, error: "missing_sha" },
      { status: 400 },
    )
  }
  // Defensive: SHAs are 40 hex chars (long) or 7 (short). Reject obvious garbage.
  if (!/^[a-f0-9]{4,64}$/i.test(sha)) {
    return NextResponse.json(
      { ok: false, error: "invalid_sha" },
      { status: 400 },
    )
  }
  const result = await getFileAtCommit(slug, sha)
  if (!result.ok) {
    const status =
      result.error === "github_unconfigured"
        ? 503
        : result.error === "not_found"
          ? 404
          : 502
    return NextResponse.json(result, { status })
  }
  return NextResponse.json(result)
}
