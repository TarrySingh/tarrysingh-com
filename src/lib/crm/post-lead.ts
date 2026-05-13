import { randomUUID } from "node:crypto"
import { signPayload } from "./sign"
import type { LeadPayloadV1, LeadCore, LeadContext, LeadSource } from "./types"

export interface PostLeadResult {
  ok: boolean
  /** "delivered" → CRM 2xx · "deduped" → CRM 200 with deduped:true ·
   *  "logged" → no CRM_WEBHOOK_URL configured, payload only logged ·
   *  "failed" → unreachable / 5xx / signature rejected. */
  outcome: "delivered" | "deduped" | "logged" | "failed"
  eventId: string
  /** Non-empty only when outcome === "failed". */
  error?: string
  /** Echo of the CRM response body when available, for debugging. */
  crmResponse?: unknown
}

interface BuildPayloadInput {
  source: LeadSource
  lead: LeadCore
  context?: LeadContext
}

function buildPayload({
  source,
  lead,
  context,
}: BuildPayloadInput): LeadPayloadV1 {
  return {
    version: "v1",
    eventId: randomUUID(),
    ts: new Date().toISOString(),
    source,
    lead,
    context,
  }
}

/**
 * Post a Lead payload to RealAI-CRM at /api/webhooks/tarrysingh,
 * HMAC-signed with CRM_WEBHOOK_SECRET. Always returns a result —
 * never throws — so the calling route handler can render a clean
 * success-or-soft-fail page without try/catch noise.
 *
 * Failure-mode strategy:
 *   - CRM_WEBHOOK_URL missing  → outcome="logged", ok=true. We log the
 *     payload as a structured line so it can be replayed by hand.
 *     The caller still sees ok=true and shows the user a success
 *     state, because losing a subscriber over a missing env var is
 *     worse than logging.
 *   - Network / 5xx / signature rejected → outcome="failed", ok=false.
 *     The caller decides whether to surface this to the user
 *     ("something snagged") or swallow it.
 *   - 2xx with deduped:true → outcome="deduped", ok=true. Idempotency
 *     handled on the CRM side via eventId — re-posting the same
 *     event in the dedup window is a no-op.
 */
export async function postLeadToCrm(
  input: BuildPayloadInput,
): Promise<PostLeadResult> {
  const payload = buildPayload(input)
  const url = process.env.CRM_WEBHOOK_URL
  const secret = process.env.CRM_WEBHOOK_SECRET

  if (!url || !secret) {
    console.log(
      JSON.stringify({
        tag: "crm.lead.unconfigured_log_only",
        eventId: payload.eventId,
        source: payload.source,
        email: payload.lead.email,
        context: payload.context,
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
        "X-Tarrysingh-Signature": `sha256=${signature}`,
        "User-Agent": "tarrysingh-com/dispatches",
      },
      body: raw,
      // Force Node fetch, no edge caching.
      cache: "no-store",
    })
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "crm.lead.network_error",
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
    // CRM may return non-JSON on hard errors (e.g. 503 HTML).
  }

  if (!res.ok) {
    console.error(
      JSON.stringify({
        tag: "crm.lead.crm_error",
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

  const deduped =
    typeof crmBody === "object" &&
    crmBody !== null &&
    "deduped" in crmBody &&
    (crmBody as { deduped?: boolean }).deduped === true

  return {
    ok: true,
    outcome: deduped ? "deduped" : "delivered",
    eventId: payload.eventId,
    crmResponse: crmBody,
  }
}
