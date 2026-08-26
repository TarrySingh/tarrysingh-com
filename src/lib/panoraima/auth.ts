/**
 * Session cookie for the PANORAIMA consortium dashboard.
 *
 * The dashboard used to be gated by HTTP Basic Auth alone, which meant a
 * failed or cancelled login left the visitor staring at the browser's bare
 * "Authentication required." text. We now issue a signed cookie from a real
 * login form instead. Basic Auth still works (bookmarks, curl, scripts), so
 * this is additive rather than a replacement.
 *
 * The cookie is <expiry>.<hmac>. There is no session store: the signature is
 * the proof. The signing key is derived from PANORAIMA_PASS so that rotating
 * the password invalidates every outstanding cookie, and so that no extra
 * environment variable has to be provisioned.
 *
 * Web Crypto is used (not node:crypto) because middleware runs on the Edge
 * runtime; the same helpers therefore work in both places.
 */

export {
  PANORAIMA_COOKIE,
  PANORAIMA_LOGIN_PATH,
  PANORAIMA_LOGOUT_PATH,
} from "./authConstants"

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days
const KEY_CONTEXT = "panoraima.session.v1"

function keyMaterial(): string | null {
  const pass = process.env.PANORAIMA_PASS
  if (!pass) return null
  return `${KEY_CONTEXT}:${pass}`
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

/** Mint a cookie value that stays valid for SESSION_TTL_SECONDS. */
export async function createSessionToken(): Promise<string | null> {
  const secret = keyMaterial()
  if (!secret) return null
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const sig = await hmac(String(exp), secret)
  return `${exp}.${sig}`
}

/** True when the cookie is well-formed, unexpired and correctly signed. */
export async function verifySessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false
  const secret = keyMaterial()
  if (!secret) return false
  const dot = token.indexOf(".")
  if (dot < 1) return false
  const exp = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expNum = Number(exp)
  if (!Number.isFinite(expNum) || expNum * 1000 < Date.now()) return false
  const expected = await hmac(exp, secret)
  return safeEqual(sig, expected)
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: SESSION_TTL_SECONDS,
  path: "/",
}
