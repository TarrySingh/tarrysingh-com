import { NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { getPost } from "@/lib/blog/posts"
import { syndicateToLinkedIn } from "@/lib/linkedin/syndicate"

export const runtime = "nodejs"

/**
 * Trigger a LinkedIn syndication for an existing Dispatches post.
 *
 * Auth: a deploy-only shared secret in the
 * `X-Tarrysingh-Admin-Token` header, compared in constant time to
 * `LINKEDIN_ADMIN_TOKEN`. This is not user-facing — the endpoint is
 * called by:
 *
 *   - the publish hook (a separate script or GitHub Action that
 *     iterates new content/blog/*.mdx commits), or
 *   - Tarry manually via `curl -X POST -H "X-Tarrysingh-Admin-Token: …"
 *     https://tarrysingh.com/api/integrations/linkedin/syndicate
 *     -d '{"slug":"…"}'`
 *
 * Fail-closed: 503 if either secret env var is missing, 401 if the
 * header doesn't match.
 *
 * The endpoint reads the post from content/blog/<slug>.mdx,
 * forwards an HMAC-signed SyndicationPayloadV1 to RealAI-CRM at
 * LINKEDIN_SYNDICATION_URL. The CRM holds the LinkedIn OAuth token
 * and dispatches the actual ugcPosts call.
 */

interface SyndicateBody {
  slug?: unknown
  eventId?: unknown
  visibility?: unknown
  closingLine?: unknown
}

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

  let body: SyndicateBody
  try {
    body = (await req.json()) as SyndicateBody
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

  const visibility =
    body.visibility === "PUBLIC" || body.visibility === "CONNECTIONS"
      ? body.visibility
      : undefined

  const closingLine =
    typeof body.closingLine === "string" && body.closingLine.length > 0
      ? body.closingLine
      : undefined

  const eventId =
    typeof body.eventId === "string" && body.eventId.length > 0
      ? body.eventId
      : `dispatches:${post.slug}:${post.date}`

  const result = await syndicateToLinkedIn({
    post,
    eventId,
    visibility,
    closingLine,
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error ?? "syndication_failed",
        eventId: result.eventId,
      },
      { status: 502 },
    )
  }

  return NextResponse.json({
    ok: true,
    outcome: result.outcome,
    eventId: result.eventId,
    postUrn: result.postUrn,
    postUrl: result.postUrl,
  })
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405 },
  )
}
