/**
 * Wire protocol for posts from tarrysingh-com → RealAI-CRM at
 * /api/integrations/linkedin/syndicate. The CRM side stores the
 * LinkedIn OAuth tokens (this site never sees them) and calls
 * LinkedIn's ugcPosts v2 API on behalf of the user.
 *
 * Mirror this file in realai-crm if the receiver wants a strong
 * type. If a field changes here, change it there.
 */

export type SyndicationVisibility = "PUBLIC" | "CONNECTIONS"

export interface SyndicationPayloadV1 {
  version: "v1"
  /** Idempotency key — must be stable per blog post + revision. The
   *  CRM dedups on this. Format: `dispatches:<slug>:<isoDate>`. */
  eventId: string
  /** ISO 8601 of when this syndication request was created. */
  ts: string
  /** Always "dispatches" — distinguishes from any future syndication
   *  source (e.g. proposals, the synaptic plate library). */
  source: "dispatches"
  /** The post being syndicated. */
  post: {
    slug: string
    title: string
    /** ~1-paragraph summary, ≤ 700 characters. LinkedIn's
     *  ugcPosts shareCommentary cap is 3000 chars, but Dispatches
     *  excerpts are intentionally shorter to leave room for the
     *  closing "→ tarrysingh.com/blog/<slug>" line. */
    excerpt: string
    url: string
    category: "Essays" | "Notes" | "Studio"
    tags: string[]
  }
  options?: {
    visibility?: SyndicationVisibility
    /** Append this exact string to the end of the LinkedIn post
     *  body, after a blank line. Defaults to the canonical URL. */
    closingLine?: string
  }
}

export interface SyndicationResult {
  ok: boolean
  outcome:
    | "delivered" // CRM 2xx, LinkedIn returned a postUrn
    | "deduped" // CRM 200 deduped:true — already posted this eventId
    | "logged" // No CRM_WEBHOOK_URL — payload only logged
    | "failed" // Network or upstream rejection
  eventId: string
  /** Set when outcome === "delivered". LinkedIn's URN identifier. */
  postUrn?: string
  /** Set when outcome === "delivered". The shareable URL. */
  postUrl?: string
  /** Set when outcome === "failed". A short machine-readable error. */
  error?: string
  crmResponse?: unknown
}
