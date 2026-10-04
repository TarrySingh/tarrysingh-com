import "server-only"

import { cache } from "react"
import { cookies, headers } from "next/headers"
import { createServiceClient } from "@/lib/supabase/server"
import { grantRef, hashIp, UUID_RE } from "./codes"
import { isDevPreview, readAccessConfig, sessionCookieName } from "./env"
import { clientIp, countryOf, uaShort } from "./request-meta"
import { verifySession } from "./session"

/**
 * Executive profile · server-side access checks (Node runtime).
 *
 * CONTRACT (other modules import exactly these names):
 *   getDossierAccess()  the authoritative check for the gated layer: verifies
 *                       the session cookie AND re-loads the grant from
 *                       Supabase on every request (revocation is immediate;
 *                       React cache() only dedupes calls within one request).
 *                       Returns null when access is not allowed, for any
 *                       reason, including missing configuration (fail closed).
 *   hasScope()          scope test against a DossierAccess.
 *   logEvent()          append-only access log; never throws.
 *
 * The middleware is a first gate only. A middleware bypass alone exposes
 * nothing, because every gated page and the download route call this.
 */

export type DossierAccess = {
  grantId: string
  /** Short public reference printed on watermarks, e.g. "G-7Q4M". */
  ref: string
  label: string | null
  recruiterName: string | null
  firm: string | null
  scopes: string[]
  /** ISO timestamp: the earlier of the grant expiry and the session expiry. */
  expiresAt: string
}

export type ProfileEventKind =
  | "redeem_ok"
  | "redeem_fail"
  | "view"
  | "download"
  | "request"
  | "revoke"
  | "lockout"

const DEV_GRANT_ID = "dev"

/** Fake grant for local preview. Only ever built when isDevPreview() holds. */
function devPreviewAccess(): DossierAccess {
  return {
    grantId: DEV_GRANT_ID,
    ref: "G-DEV0",
    label: "Local preview",
    recruiterName: "Preview Reader",
    firm: "Preview Search Partners",
    scopes: ["dossier", "cases", "pdf:exec-cv", "pdf:one-pager", "pdf:board-bio"],
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }
}

type GrantAccessRow = {
  id: string
  label: string | null
  recruiter_name: string | null
  firm: string | null
  scopes: string[] | null
  expires_at: string
  revoked_at: string | null
}

async function resolveAccess(): Promise<DossierAccess | null> {
  try {
    if (isDevPreview(process.env)) return devPreviewAccess()

    const cfg = readAccessConfig(process.env)
    if (!cfg) return null

    const jar = await cookies()
    const session = await verifySession(
      jar.get(sessionCookieName(process.env))?.value,
      cfg.sessionSecret,
    )
    if (!session || !UUID_RE.test(session.gid)) return null

    const { data, error } = await createServiceClient()
      .from("profile_grants")
      .select("id, label, recruiter_name, firm, scopes, expires_at, revoked_at")
      .eq("id", session.gid)
      .maybeSingle()
    if (error || !data) return null
    const grant = data as GrantAccessRow
    if (grant.revoked_at) return null
    const grantExpMs = Date.parse(grant.expires_at)
    if (!(grantExpMs > Date.now())) return null

    return {
      grantId: grant.id,
      ref: grantRef(grant.id),
      label: grant.label,
      recruiterName: grant.recruiter_name,
      firm: grant.firm,
      scopes: grant.scopes ?? [],
      expiresAt: new Date(Math.min(grantExpMs, session.exp * 1000)).toISOString(),
    }
  } catch {
    return null
  }
}

export const getDossierAccess: () => Promise<DossierAccess | null> = cache(resolveAccess)

export function hasScope(access: DossierAccess, scope: string): boolean {
  return access.scopes.includes(scope)
}

export async function logEvent(
  kind: ProfileEventKind,
  detail: { grantId?: string | null; artefact?: string | null; path?: string | null } = {},
): Promise<void> {
  try {
    const cfg = readAccessConfig(process.env)
    if (!cfg) return
    // The local preview grant has no database row.
    if (detail.grantId && !UUID_RE.test(detail.grantId)) return

    const h = await headers()
    const { error } = await createServiceClient()
      .from("profile_events")
      .insert({
        grant_id: detail.grantId ?? null,
        kind,
        artefact: detail.artefact ? detail.artefact.slice(0, 80) : null,
        path: detail.path ? detail.path.slice(0, 200) : null,
        ip_hash: await hashIp(clientIp(h), cfg.ipSalt),
        ua_short: uaShort(h),
        country: countryOf(h),
      })
    if (error) {
      console.error(JSON.stringify({ tag: "cv.log_event_failed", kind, message: error.message }))
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "cv.log_event_failed",
        kind,
        message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      }),
    )
  }
}
