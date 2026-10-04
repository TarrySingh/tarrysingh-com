import "server-only"

/**
 * Executive profile · server-side access checks (Node runtime).
 *
 * CONTRACT (other modules import exactly these names):
 *   getDossierAccess()  the authoritative check for the gated layer: verifies
 *                       the session cookie AND re-loads the grant from
 *                       Supabase on every call (revocation is immediate).
 *                       Returns null when access is not allowed, for any
 *                       reason, including missing configuration (fail closed).
 *   hasScope()          scope test against a DossierAccess.
 *   logEvent()          append-only access log; never throws.
 *
 * STUB: the bodies are implemented by the access build step.
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

export async function getDossierAccess(): Promise<DossierAccess | null> {
  return null
}

export function hasScope(access: DossierAccess, scope: string): boolean {
  return access.scopes.includes(scope)
}

export async function logEvent(
  _kind: ProfileEventKind,
  _detail: { grantId?: string | null; artefact?: string | null; path?: string | null } = {},
): Promise<void> {}
