/**
 * Executive profile · code redemption (framework-free core).
 *
 * attemptRedeem() hashes the typed code, finds the grant, checks it is
 * current, bumps the redemption counter and mints the signed session token.
 * It talks to storage only through the small GrantStore interface, so the
 * rules are unit-tested with an in-memory store; the route supplies the
 * Supabase-backed store.
 *
 * Every failure is reported with a reason for the access log, but the route
 * turns all of them into the same generic response.
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import { hashCode, normaliseCode, timingSafeEqual } from "./codes"
import type { AccessConfig } from "./env"
import { MAX_SESSION_SECONDS, SESSION_VERSION } from "./env"
import { signSession } from "./session"

export type GrantRow = {
  id: string
  code_hash: string
  label: string | null
  recruiter_name: string | null
  recruiter_email: string | null
  firm: string | null
  scopes: string[]
  max_redemptions: number
  redemptions: number
  expires_at: string
  revoked_at: string | null
}

export const GRANT_COLUMNS =
  "id, code_hash, label, recruiter_name, recruiter_email, firm, scopes, max_redemptions, redemptions, expires_at, revoked_at"

export interface GrantStore {
  findByCodeHash(hash: string): Promise<GrantRow | null>
  /** Bumps redemptions by one only if it still equals `expected` and the grant is not revoked. */
  bumpRedemptions(id: string, expected: number): Promise<boolean>
}

export type RedeemFailure =
  | "malformed"
  | "unknown"
  | "revoked"
  | "expired"
  | "exhausted"
  | "contended"

export type RedeemOutcome =
  | {
      ok: true
      grant: GrantRow
      firstRedemption: boolean
      token: string
      /** Cookie lifetime in seconds. */
      maxAgeSeconds: number
    }
  | { ok: false; reason: RedeemFailure; grantId: string | null }

const MAX_ATTEMPTS = 3

export async function attemptRedeem(
  store: GrantStore,
  cfg: Pick<AccessConfig, "codePepper" | "sessionSecret">,
  rawCode: unknown,
  nowMs: number = Date.now(),
): Promise<RedeemOutcome> {
  const normalised = normaliseCode(rawCode)
  if (!normalised) return { ok: false, reason: "malformed", grantId: null }
  const hash = await hashCode(normalised, cfg.codePepper)

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const grant = await store.findByCodeHash(hash)
    if (!grant || !timingSafeEqual(grant.code_hash, hash)) {
      return { ok: false, reason: "unknown", grantId: null }
    }
    if (grant.revoked_at) return { ok: false, reason: "revoked", grantId: grant.id }
    const grantExpMs = Date.parse(grant.expires_at)
    if (!(grantExpMs > nowMs)) return { ok: false, reason: "expired", grantId: grant.id }
    if (grant.redemptions >= grant.max_redemptions) {
      return { ok: false, reason: "exhausted", grantId: grant.id }
    }

    if (!(await store.bumpRedemptions(grant.id, grant.redemptions))) continue

    const nowSeconds = Math.floor(nowMs / 1000)
    const exp = Math.min(Math.floor(grantExpMs / 1000), nowSeconds + MAX_SESSION_SECONDS)
    const token = await signSession(
      { gid: grant.id, exp, v: SESSION_VERSION },
      cfg.sessionSecret,
    )
    return {
      ok: true,
      grant,
      firstRedemption: grant.redemptions === 0,
      token,
      maxAgeSeconds: Math.max(1, exp - nowSeconds),
    }
  }
  return { ok: false, reason: "contended", grantId: null }
}

/** Supabase-backed store (service role). */
export function supabaseGrantStore(db: SupabaseClient): GrantStore {
  return {
    async findByCodeHash(hash) {
      const { data, error } = await db
        .from("profile_grants")
        .select(GRANT_COLUMNS)
        .eq("code_hash", hash)
        .maybeSingle()
      if (error) throw new Error(`grant lookup failed: ${error.message}`)
      return (data as GrantRow | null) ?? null
    },
    async bumpRedemptions(id, expected) {
      const { data, error } = await db
        .from("profile_grants")
        .update({ redemptions: expected + 1 })
        .eq("id", id)
        .eq("redemptions", expected)
        .is("revoked_at", null)
        .select("id")
      if (error) throw new Error(`grant update failed: ${error.message}`)
      return (data?.length ?? 0) === 1
    },
  }
}
