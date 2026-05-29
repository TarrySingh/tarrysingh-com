import { NextRequest, NextResponse } from "next/server"
import { getCommitDiff } from "@/lib/studio/history"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/studio/history/diff?slug=<slug>&sha=<sha>
 *
 * Returns the unified diff for content/blog/<slug>.mdx introduced by
 * the given commit — what was added/removed in that publish/update —
 * plus additions/deletions counts. Powers the History pane's diff view.
 *
 * Returns:
 *   200 { ok: true, sha, additions, deletions, status, patch }
 *   400 { ok: false, error: "missing_params" }
 *   404 { ok: false, error: "not_found" }
 *   502 { ok: false, error: "github_api_error" }
 *   503 { ok: false, error: "github_unconfigured" }
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim()
  const sha = req.nextUrl.searchParams.get("sha")?.trim()
  if (!slug || !sha) {
    return NextResponse.json(
      { ok: false, error: "missing_params", hint: "Pass ?slug=<slug>&sha=<commit-sha>." },
      { status: 400 },
    )
  }
  const result = await getCommitDiff(slug, sha)
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
