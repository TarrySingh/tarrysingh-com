import { NextRequest, NextResponse } from "next/server"
import { revertToCommit } from "@/lib/studio/history"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

interface RevertBody {
  slug?: unknown
  sha?: unknown
}

/**
 * POST /api/studio/revert
 *
 * Creates a NEW commit on main that restores
 * `content/blog/<slug>.mdx` to its state at `sha`. Does not rewrite
 * history (the original commits stay). Vercel auto-deploys.
 *
 * Body: { slug, sha }
 * Returns: { ok, newCommitSha, newCommitUrl } on success.
 *          409 { ok: false, error: "no_change" } if the revert
 *          would produce the same content as currently on main.
 */
export async function POST(req: NextRequest) {
  let payload: RevertBody
  try {
    payload = (await req.json()) as RevertBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const slug = typeof payload.slug === "string" ? payload.slug.trim() : ""
  const sha = typeof payload.sha === "string" ? payload.sha.trim() : ""

  if (!slug) {
    return NextResponse.json({ ok: false, error: "missing_slug" }, { status: 400 })
  }
  if (!sha || !/^[a-f0-9]{4,64}$/i.test(sha)) {
    return NextResponse.json({ ok: false, error: "missing_or_invalid_sha" }, { status: 400 })
  }

  const result = await revertToCommit(slug, sha)
  if (!result.ok) {
    const status =
      result.error === "github_unconfigured"
        ? 503
        : result.error === "not_found"
          ? 404
          : result.error === "no_change"
            ? 409
            : 502
    return NextResponse.json(result, { status })
  }
  return NextResponse.json(result)
}
