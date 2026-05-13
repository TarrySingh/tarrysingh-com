/**
 * Wire protocol for posts from tarrysingh-com → RealAI-CRM at
 * /api/webhooks/tarrysingh. The receiver clones the earthscan
 * contract (LeadPayload v1) — version, eventId, ts, source, lead,
 * context — so this file mirrors the shape earthscan/route.ts in the
 * realai-crm repo expects, no more, no less.
 *
 * Keep this in lock-step with realai-crm's earthscan/tarrysingh
 * route. If you change a field here, change it there.
 */

export type LeadSource =
  | "contact-form"
  | "whitepaper"
  | "newsletter"
  | "book-meeting"
  | "unsubscribe"

export interface LeadCore {
  email: string
  firstName?: string
  lastName?: string
  company?: string
  role?: string
  industry?: string
  companySize?: string
  phone?: string
}

export interface LeadContextUtm {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
}

export interface LeadContext {
  consent?: boolean
  referrer?: string
  message?: string
  whitepaperSlug?: string
  engagement?: string
  tags?: string[]
  utm?: LeadContextUtm
  // Open-ended; receiver tolerates unknown keys.
  [key: string]: unknown
}

export interface LeadPayloadV1 {
  version: "v1"
  eventId: string
  ts: string
  source: LeadSource
  lead: LeadCore
  context?: LeadContext
}
