import { randomUUID } from "node:crypto"
import { signPayload } from "@/lib/crm/sign"
import type {
  SyndicationPayloadV1,
  SyndicationResult,
} from "./types"
import type { BlogPostMeta } from "@/lib/blog/posts"

const SITE = "https://tarrysingh.com"

interface SyndicateInput {
  post: BlogPostMeta
  /** Pass an idempotency-stable eventId from the caller if you can
   *  (`dispatches:<slug>:<date>` is the convention). When omitted
   *  we generate a UUID — fine for ad-hoc retries, not fine for
   *  the publish hook because every retry creates a new post. */
  eventId?: string
  visibility?: "PUBLIC" | "CONNECTIONS"
  /** Override the default `→ tarrysingh.com/blog/<slug>` close. */
  closingLine?: string
}

function buildPayload({
  post,
  eventId,
  visibility,
  closingLine,
}: SyndicateInput): SyndicationPayloadV1 {
  return {
    version: "v1",
    eventId: eventId ?? `dispatches:${post.slug}:${randomUUID()}`,
    ts: new Date().toISOString(),
    source: "dispatches",
    post: {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      url: `${SITE}/blog/${post.slug}`,
      category: post.category,
      tags: post.tags ?? [],
    },
    options:
      visibility || closingLine
        ? {
            ...(visibility ? { visibility } : {}),
            ...(closingLine ? { closingLine } : {}),
          }
        : undefined,
  }
}

/**
 * Post a syndication request to RealAI-CRM at
 * /api/integrations/linkedin/syndicate, HMAC-signed with
 * LINKEDIN_SYNDICATION_SECRET. The CRM holds the LinkedIn OAuth
 * access token and calls LinkedIn's ugcPosts v2 API on behalf of
 * the user — this site never sees the token.
 *
 * Always returns a result — never throws. Follows the same
 * fail-safe pattern as `postLeadToCrm`: if CRM env is unset, log
 * the payload and return `outcome: "logged"` so calling code can
 * choose to either retry later or surface a soft success.
 */
export async function syndicateToLinkedIn(
  input: SyndicateInput,
): Promise<SyndicationResult> {
  const payload = buildPayload(input)
  const url = process.env.LINKEDIN_SYNDICATION_URL
  const secret = process.env.LINKEDIN_SYNDICATION_SECRET

  if (!url || !secret) {
    console.log(
      JSON.stringify({
        tag: "linkedin.syndicate.unconfigured_log_only",
        eventId: payload.eventId,
        slug: payload.post.slug,
        title: payload.post.title,
        ts: payload.ts,
      }),
    )
    return { ok: true, outcome: "logged", eventId: payload.eventId }
  }

  const raw = JSON.stringify(payload)
  const signature = signPayload(raw, secret)

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tarrysingh-Linkedin-Signature": `sha256=${signature}`,
        "User-Agent": "tarrysingh-com/dispatches",
      },
      body: raw,
      cache: "no-store",
    })
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "linkedin.syndicate.network_error",
        eventId: payload.eventId,
        url,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
    return {
      ok: false,
      outcome: "failed",
      eventId: payload.eventId,
      error: "network_error",
    }
  }

  let crmBody: unknown = null
  try {
    crmBody = await res.json()
  } catch {
    // CRM may return non-JSON on hard errors.
  }

  if (!res.ok) {
    console.error(
      JSON.stringify({
        tag: "linkedin.syndicate.crm_error",
        eventId: payload.eventId,
        status: res.status,
        body: crmBody,
      }),
    )
    return {
      ok: false,
      outcome: "failed",
      eventId: payload.eventId,
      error: `crm_${res.status}`,
      crmResponse: crmBody,
    }
  }

  const body = crmBody as {
    deduped?: boolean
    postUrn?: string
    postUrl?: string
  } | null

  if (body?.deduped === true) {
    return {
      ok: true,
      outcome: "deduped",
      eventId: payload.eventId,
      postUrn: body.postUrn,
      postUrl: body.postUrl,
      crmResponse: crmBody,
    }
  }

  return {
    ok: true,
    outcome: "delivered",
    eventId: payload.eventId,
    postUrn: body?.postUrn,
    postUrl: body?.postUrl,
    crmResponse: crmBody,
  }
}
