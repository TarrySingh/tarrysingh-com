import { NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { getPost } from "@/lib/blog/posts"

export const runtime = "nodejs"

/**
 * Dry-run preview of what would be syndicated to LinkedIn for a
 * given Dispatches post — same auth as /syndicate, returns the
 * proposed payload without calling the CRM.
 *
 * Useful before a real publish: lets Tarry sanity-check the
 * shareCommentary copy + closing line before the post fires.
 */

interface PreviewBody {
  slug?: unknown
  visibility?: unknown
  closingLine?: unknown
}

const SITE = "https://tarrysingh.com"
const SHARE_COMMENTARY_MAX = 3000

function adminTokenMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

function renderShareCommentary(
  title: string,
  excerpt: string,
  category: string,
  closingLine: string,
): string {
  const head = `${title}\n\n${excerpt}\n\n${closingLine}`
  const tag = ` · #${category.toLowerCase()} · #dispatches`
  return (head + tag).slice(0, SHARE_COMMENTARY_MAX)
}

export async function POST(req: NextRequest) {
  const adminToken = process.env.LINKEDIN_ADMIN_TOKEN
  if (!adminToken) {
    return NextResponse.json(
      { ok: false, error: "syndication_unconfigured" },
      { status: 503 },
    )
  }

  if (
    !adminTokenMatches(
      req.headers.get("x-tarrysingh-admin-token"),
      adminToken,
    )
  ) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    )
  }

  let body: PreviewBody
  try {
    body = (await req.json()) as PreviewBody
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    )
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : ""
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return NextResponse.json(
      { ok: false, error: "invalid_slug" },
      { status: 422 },
    )
  }

  const post = await getPost(slug)
  if (!post) {
    return NextResponse.json(
      { ok: false, error: "post_not_found" },
      { status: 404 },
    )
  }

  const closingLine =
    typeof body.closingLine === "string" && body.closingLine.length > 0
      ? body.closingLine
      : `→ ${SITE}/blog/${post.slug}`

  const visibility =
    body.visibility === "PUBLIC" || body.visibility === "CONNECTIONS"
      ? body.visibility
      : "PUBLIC"

  const shareCommentary = renderShareCommentary(
    post.title,
    post.excerpt,
    post.category,
    closingLine,
  )

  return NextResponse.json({
    ok: true,
    preview: {
      slug: post.slug,
      title: post.title,
      visibility,
      shareCommentary,
      shareCommentaryLength: shareCommentary.length,
      proposedEventId: `dispatches:${post.slug}:${post.date}`,
      postUrl: `${SITE}/blog/${post.slug}`,
    },
  })
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405 },
  )
}
