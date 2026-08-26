export {
  PANORAIMA_COOKIE,
  PANORAIMA_LOGIN_PATH,
  PANORAIMA_LOGOUT_PATH,
} from "./authConstants"
import { PANORAIMA_COOKIE as COOKIE_NAME } from "./authConstants"

/**
 * Signed session cookie for the PANORAIMA consortium dashboard.
 *
 * The cookie carries who you are and what you may do, so middleware can gate
 * a request on the Edge runtime without touching the database. It is
 * base64url(JSON payload) + "." + HMAC-SHA256(payload). There is no session
 * store: the signature is the proof.
 *
 * The signing key derives from PANORAIMA_PASS, so rotating that password
 * invalidates every outstanding session and no extra environment variable
 * has to be provisioned.
 *
 * Web Crypto is used rather than node:crypto because middleware runs on the
 * Edge runtime; the same helpers therefore work in middleware and in routes.
 */

export type PanoraimaRole = "admin" | "member"

export type SessionPayload = {
  /** Login identity. The legacy shared credential logs in as "shared". */
  email: string
  role: PanoraimaRole
  /** Unix seconds. */
  exp: number
}

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days
const KEY_CONTEXT = "panoraima.session.v2"

/** Identity recorded for anyone who signs in with the shared credential. */
export const SHARED_CREDENTIAL_IDENTITY = "shared"

function keyMaterial(): string | null {
  const pass = process.env.PANORAIMA_PASS
  if (!pass) return null
  return `${KEY_CONTEXT}:${pass}`
}

function b64urlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ""
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function b64urlDecode(input: string): string | null {
  try {
    const padded = input.replace(/-/g, "+").replace(/_/g, "/")
    const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4))
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

async function hmac(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/** Length-checked, constant-time-ish comparison of two hex digests. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function createSessionToken(
  identity: { email: string; role: PanoraimaRole },
): Promise<string | null> {
  const secret = keyMaterial()
  if (!secret) return null
  const payload: SessionPayload = {
    email: identity.email,
    role: identity.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }
  const encoded = b64urlEncode(JSON.stringify(payload))
  const sig = await hmac(encoded, secret)
  return `${encoded}.${sig}`
}

/** Returns the payload when the cookie is well-formed, unexpired and signed. */
export async function readSessionToken(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null
  const secret = keyMaterial()
  if (!secret) return null
  const dot = token.lastIndexOf(".")
  if (dot < 1) return null
  const encoded = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = await hmac(encoded, secret)
  if (!safeEqual(sig, expected)) return null
  const json = b64urlDecode(encoded)
  if (!json) return null
  try {
    const payload = JSON.parse(json) as SessionPayload
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
      return null
    }
    if (payload.role !== "admin" && payload.role !== "member") return null
    return payload
  } catch {
    return null
  }
}

/** Convenience wrapper for callers that only need a yes or no. */
export async function verifySessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  return (await readSessionToken(token)) !== null
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: SESSION_TTL_SECONDS,
  path: "/",
}

export { COOKIE_NAME }
