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

/**
 * Anti-bot signals gathered by the signup forms
 * (src/components/forms/bot-check) and verified by the realai-crm
 * receiver for the newsletter, contact-form and whitepaper sources.
 * The field names are the CRM's contract: do not rename them.
 *   turnstileToken  Cloudflare Turnstile response token; '' when the
 *                   widget is off or produced no token.
 *   hp              honeypot value; '' for a person, non-empty = bot.
 *   elapsedMs       ms between the form mounting and the submit.
 */
export interface LeadBotCheck {
  turnstileToken: string
  hp: string
  elapsedMs: number
}

export interface LeadContext {
  consent?: boolean
  referrer?: string
  message?: string
  whitepaperSlug?: string
  engagement?: string
  tags?: string[]
  utm?: LeadContextUtm
  /** Signup sources only. Never sent with `unsubscribe`. */
  botCheck?: LeadBotCheck
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
