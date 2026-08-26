import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import { createServiceClient } from "@/lib/supabase/server"

/**
 * Membership and permissions for the PANORAIMA consortium dashboard.
 *
 * Server-side only: it reaches Supabase through the service-role client, so
 * it must never be imported by a client component or by middleware (which
 * runs on the Edge runtime). Middleware makes its decision from the signed
 * session cookie alone, which is why the role travels inside that cookie.
 */

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>

export const MEMBERS_TABLE = "panoraima_members"
export const LOGIN_TOKENS_TABLE = "panoraima_login_tokens"

export type PanoraimaRole = "admin" | "member"

export type PanoraimaMember = {
  id: string
  email: string
  display_name: string | null
  role: PanoraimaRole
  disabled: boolean
  invited_by: string | null
  created_at: string
  last_login_at: string | null
  invited_at: string | null
  has_password?: boolean
}

/* ------------------------------------------------------------------ *
 * Permissions
 *
 * One table, deliberately. Members are view-only for now; widening that
 * is a matter of adding an action to the member list rather than hunting
 * for role checks scattered through components and routes.
 * ------------------------------------------------------------------ */

export type PanoraimaAction =
  | "view"             // read the dashboard
  | "generate_report"  // the CREATE UPDATE REPORT tool
  | "manage_members"   // add, disable and remove people

const PERMISSIONS: Record<PanoraimaRole, PanoraimaAction[]> = {
  admin: ["view", "generate_report", "manage_members"],
  member: ["view"],
}

export function can(
  role: PanoraimaRole | null | undefined,
  action: PanoraimaAction,
): boolean {
  if (!role) return false
  return PERMISSIONS[role]?.includes(action) ?? false
}

/**
 * Emails listed in PANORAIMA_ADMIN_EMAILS are always treated as admin, even
 * if the database row says otherwise. This is a deliberate lockout guard: it
 * guarantees a way back in if the members table is ever mis-edited.
 */
export function resolveRole(
  email: string,
  storedRole: PanoraimaRole,
): PanoraimaRole {
  const allow = (process.env.PANORAIMA_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  if (allow.includes(email.trim().toLowerCase())) return "admin"
  return storedRole
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

/* ------------------------------------------------------------------ *
 * Passwords (optional — set by the member after magic-link onboarding)
 * ------------------------------------------------------------------ */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const derived = await scrypt(password, salt, 64)
  return `scrypt$${salt}$${derived.toString("hex")}`
}

export async function verifyPassword(
  password: string,
  stored: string | null | undefined,
): Promise<boolean> {
  if (!stored) return false
  const [scheme, salt, hex] = stored.split("$")
  if (scheme !== "scrypt" || !salt || !hex) return false
  const derived = await scrypt(password, salt, 64)
  const expected = Buffer.from(hex, "hex")
  if (expected.length !== derived.length) return false
  return timingSafeEqual(derived, expected)
}

/* ------------------------------------------------------------------ *
 * Member queries
 * ------------------------------------------------------------------ */

export async function findMemberByEmail(
  email: string,
): Promise<(PanoraimaMember & { password_hash: string | null }) | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .select("*")
    .eq("email", normaliseEmail(email))
    .maybeSingle()
  if (error) {
    console.error("[panoraima/members] lookup failed:", error.message)
    return null
  }
  return data ?? null
}

export async function listMembers(): Promise<PanoraimaMember[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .select("id,email,display_name,role,disabled,invited_by,created_at,last_login_at,invited_at,password_hash")
    .order("created_at", { ascending: true })
  if (error) {
    console.error("[panoraima/members] list failed:", error.message)
    return []
  }
  return (data ?? []).map((row) => {
    const { password_hash, ...rest } = row as PanoraimaMember & {
      password_hash: string | null
    }
    return { ...rest, has_password: Boolean(password_hash) }
  })
}

export async function addMember(opts: {
  email: string
  role: PanoraimaRole
  displayName?: string | null
  invitedBy?: string | null
}): Promise<{ ok: true; member: PanoraimaMember } | { ok: false; error: string }> {
  const supabase = createServiceClient()
  const email = normaliseEmail(opts.email)
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "That does not look like an email address." }
  }
  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .insert({
      email,
      role: opts.role,
      display_name: opts.displayName ?? null,
      invited_by: opts.invitedBy ?? null,
    })
    .select("id,email,display_name,role,disabled,invited_by,created_at,last_login_at,invited_at")
    .single()
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That email is already on the list." }
    }
    console.error("[panoraima/members] insert failed:", error.message)
    return { ok: false, error: "Could not add that member." }
  }
  return { ok: true, member: data as PanoraimaMember }
}

export async function setMemberRole(
  id: string,
  role: PanoraimaRole,
): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase.from(MEMBERS_TABLE).update({ role }).eq("id", id)
  if (error) console.error("[panoraima/members] role update failed:", error.message)
  return !error
}

export async function setMemberDisabled(
  id: string,
  disabled: boolean,
): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase.from(MEMBERS_TABLE).update({ disabled }).eq("id", id)
  if (error) console.error("[panoraima/members] disable failed:", error.message)
  return !error
}

export async function removeMember(id: string): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase.from(MEMBERS_TABLE).delete().eq("id", id)
  if (error) console.error("[panoraima/members] delete failed:", error.message)
  return !error
}

export async function markInvited(email: string): Promise<void> {
  const supabase = createServiceClient()
  await supabase
    .from(MEMBERS_TABLE)
    .update({ invited_at: new Date().toISOString() })
    .eq("email", normaliseEmail(email))
}

export async function findMemberById(
  id: string,
): Promise<PanoraimaMember | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .select("id,email,display_name,role,disabled,invited_by,created_at,last_login_at,invited_at")
    .eq("id", id)
    .maybeSingle()
  if (error) {
    console.error("[panoraima/members] lookup by id failed:", error.message)
    return null
  }
  return (data as PanoraimaMember) ?? null
}

export async function touchLastLogin(email: string): Promise<void> {
  const supabase = createServiceClient()
  await supabase
    .from(MEMBERS_TABLE)
    .update({ last_login_at: new Date().toISOString() })
    .eq("email", normaliseEmail(email))
}

export async function setMemberPassword(
  email: string,
  password: string,
): Promise<boolean> {
  const supabase = createServiceClient()
  const password_hash = await hashPassword(password)
  const { error } = await supabase
    .from(MEMBERS_TABLE)
    .update({ password_hash })
    .eq("email", normaliseEmail(email))
  if (error) console.error("[panoraima/members] password set failed:", error.message)
  return !error
}

/* ------------------------------------------------------------------ *
 * Magic-link tokens — single use, short lived, stored only as a hash
 * ------------------------------------------------------------------ */

/** Sign-in links are short lived; invite links must survive an inbox. */
export const SIGNIN_TTL_MINUTES = 30
export const INVITE_TTL_MINUTES = 7 * 24 * 60

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

export async function createLoginToken(
  email: string,
  ttlMinutes: number = SIGNIN_TTL_MINUTES,
): Promise<string | null> {
  const supabase = createServiceClient()
  const token = randomBytes(32).toString("base64url")
  const expires = new Date(Date.now() + ttlMinutes * 60 * 1000)
  const { error } = await supabase.from(LOGIN_TOKENS_TABLE).insert({
    email: normaliseEmail(email),
    token_hash: sha256(token),
    expires_at: expires.toISOString(),
  })
  if (error) {
    console.error("[panoraima/members] token insert failed:", error.message)
    return null
  }
  return token
}

/** Returns the email the token belongs to, and burns it. */
export async function consumeLoginToken(token: string): Promise<string | null> {
  const supabase = createServiceClient()
  const hash = sha256(token)
  const { data, error } = await supabase
    .from(LOGIN_TOKENS_TABLE)
    .select("id,email,expires_at,used_at")
    .eq("token_hash", hash)
    .maybeSingle()
  if (error || !data) return null
  if (data.used_at) return null
  if (new Date(data.expires_at).getTime() < Date.now()) return null
  await supabase
    .from(LOGIN_TOKENS_TABLE)
    .update({ used_at: new Date().toISOString() })
    .eq("id", data.id)
  return data.email as string
}
