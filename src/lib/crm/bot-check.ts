import type { LeadBotCheck } from "./types"

/**
 * Server-side reader for the `botCheck` object the signup forms send.
 *
 * The site never rejects on these signals: the realai-crm receiver
 * decides (soft mode until TARRYSINGH_BOT_CHECK_ENFORCE=true). This
 * only makes sure what we forward has the contract's types and a
 * bounded size, so a hand-built request cannot push junk or a
 * megabyte string through to the CRM.
 *
 * Rules (mirroring the earthscan reference defaults):
 *   - not a plain object (absent, null, array, string)  -> undefined,
 *     and the lead goes out with no botCheck at all
 *   - turnstileToken / hp: a string is kept, cut to its cap; any other
 *     type becomes ''. Cutting a filled honeypot keeps it non-empty,
 *     so the bot signal survives
 *   - elapsedMs: a finite number >= 0 is kept as sent; anything else
 *     becomes 0. Our forms always send a real number, so only a
 *     hand-built request lands here, and the CRM's timing layer then
 *     flags it instead of skipping the check
 */

/** Cloudflare caps a Turnstile response token at 2048 characters. */
export const TURNSTILE_TOKEN_MAX = 2048

/** A honeypot only needs to be non-empty to count; keep a little. */
export const HONEYPOT_MAX = 256

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function cappedString(v: unknown, max: number): string {
  return typeof v === "string" ? v.slice(0, max) : ""
}

export function readBotCheck(raw: unknown): LeadBotCheck | undefined {
  if (!isPlainObject(raw)) return undefined
  const elapsed = raw.elapsedMs
  return {
    turnstileToken: cappedString(raw.turnstileToken, TURNSTILE_TOKEN_MAX),
    hp: cappedString(raw.hp, HONEYPOT_MAX),
    elapsedMs:
      typeof elapsed === "number" && Number.isFinite(elapsed) && elapsed >= 0
        ? elapsed
        : 0,
  }
}
