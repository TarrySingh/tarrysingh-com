/**
 * Executive profile · signed session token (Edge-safe: Web Crypto only).
 *
 * Token = base64url(JSON {gid, exp, v}) + "." + base64url(HMAC-SHA256).
 * The HMAC key is CV_SESSION_SECRET; the signed message is domain-separated
 * so the same secret could never validate a code hash or an IP hash.
 * Verification uses crypto.subtle.verify, which compares in constant time.
 */

import { SESSION_VERSION } from "./env"

export type SessionPayload = {
  /** Grant id (uuid). */
  gid: string
  /** Expiry, seconds since the Unix epoch. */
  exp: number
  /** Token format version. */
  v: number
}

const MAX_TOKEN_LENGTH = 600
const DOMAIN = "cv-session-v1."
const encoder = new TextEncoder()

function toBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) return null
  const padded =
    text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4)
  try {
    const binary = atob(padded)
    const out = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
    return out
  } catch {
    return null
  }
}

function hmacKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage,
  )
}

/** Signs a session payload. Throws if the secret is empty. */
export async function signSession(
  payload: SessionPayload,
  secret: string,
): Promise<string> {
  if (!secret) throw new Error("session secret missing")
  const body = toBase64Url(
    encoder.encode(JSON.stringify({ gid: payload.gid, exp: payload.exp, v: payload.v })),
  )
  const key = await hmacKey(secret, ["sign"])
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(DOMAIN + body))
  return `${body}.${toBase64Url(new Uint8Array(mac))}`
}

/**
 * Returns the payload for a genuine, unexpired, current-version token, and
 * null for anything else (missing, malformed, tampered, wrong secret,
 * expired). Never throws.
 */
export async function verifySession(
  token: string | undefined | null,
  secret: string | undefined | null,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<SessionPayload | null> {
  try {
    if (!token || !secret) return null
    if (token.length > MAX_TOKEN_LENGTH) return null
    const parts = token.split(".")
    if (parts.length !== 2) return null
    const [body, signature] = parts
    const sigBytes = fromBase64Url(signature)
    if (!sigBytes || sigBytes.length !== 32) return null

    const key = await hmacKey(secret, ["verify"])
    const genuine = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as BufferSource,
      encoder.encode(DOMAIN + body),
    )
    if (!genuine) return null

    const jsonBytes = fromBase64Url(body)
    if (!jsonBytes) return null
    const parsed: unknown = JSON.parse(new TextDecoder().decode(jsonBytes))
    if (typeof parsed !== "object" || parsed === null) return null
    const { gid, exp, v } = parsed as Record<string, unknown>
    if (typeof gid !== "string" || gid.length === 0 || gid.length > 64) return null
    if (typeof exp !== "number" || !Number.isInteger(exp)) return null
    if (v !== SESSION_VERSION) return null
    if (exp <= nowSeconds) return null
    return { gid, exp, v }
  } catch {
    return null
  }
}
