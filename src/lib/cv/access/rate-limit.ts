/**
 * Executive profile · rate limits, backed by profile_events and
 * profile_access_requests (so they hold across serverless instances).
 *
 * All helpers take the Supabase client as a parameter and THROW on a
 * database error; callers fail closed.
 */

import type { SupabaseClient } from "@supabase/supabase-js"

export const REDEEM_FAIL_LIMIT = 5
export const REDEEM_WINDOW_MS = 15 * 60 * 1000
/** Global brake: this many failed redemptions in an hour suspends redemption. */
export const GLOBAL_FAIL_LIMIT = 50
export const GLOBAL_WINDOW_MS = 60 * 60 * 1000
export const REQUEST_LIMIT = 3
export const REQUEST_WINDOW_MS = 60 * 60 * 1000

export function overLimit(count: number, limit: number): boolean {
  return count >= limit
}

function since(windowMs: number, nowMs: number): string {
  return new Date(nowMs - windowMs).toISOString()
}

/** Events of one kind inside the window, optionally for one ip_hash. */
export async function countEvents(
  db: SupabaseClient,
  args: { kind: string; ipHash?: string; windowMs: number; nowMs?: number },
): Promise<number> {
  let q = db
    .from("profile_events")
    .select("id", { count: "exact", head: true })
    .eq("kind", args.kind)
    .gte("created_at", since(args.windowMs, args.nowMs ?? Date.now()))
  if (args.ipHash) q = q.eq("ip_hash", args.ipHash)
  const { count, error } = await q
  if (error) throw new Error(`count events failed: ${error.message}`)
  return count ?? 0
}

/** Access requests from one ip_hash inside the window. */
export async function countRequests(
  db: SupabaseClient,
  args: { ipHash: string; windowMs: number; nowMs?: number },
): Promise<number> {
  const { count, error } = await db
    .from("profile_access_requests")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", args.ipHash)
    .gte("created_at", since(args.windowMs, args.nowMs ?? Date.now()))
  if (error) throw new Error(`count requests failed: ${error.message}`)
  return count ?? 0
}
