import { NextRequest, NextResponse } from "next/server"
import { listHistory } from "@/lib/studio/history"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/studio/history?slug=<slug>
 *
 * Returns the last 20 commits that touched `content/blog/<slug>.mdx`
 * on main. Sprint 7 deliverable.
 *
 * Returns:
 *   200 { ok: true, commits: HistoryCommit[] }
 *   400 { ok: false, error: "missing_slug" }
 *   404 { ok: false, error: "not_found" }    — file or repo path doesn't exist
 *   502 { ok: false, error: "github_api_error" }
 *   503 { ok: false, error: "github_unconfigured" }
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim()
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "missing_slug", hint: "Pass ?slug=<dispatch-slug>." },
      { status: 400 },
    )
  }
  const result = await listHistory(slug)
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
