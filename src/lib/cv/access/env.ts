/**
 * Executive profile · access configuration (Edge-safe, no Node-only imports).
 *
 * Shared by the middleware (Edge), the API routes and server components
 * (Node) and the local CLI. Everything here FAILS CLOSED: when the kill
 * switch is off or any secret is missing or weak, the readers return null
 * and the callers deny access.
 */

export type Env = Record<string, string | undefined>

/** Cookie name over HTTPS (Vercel, production builds). */
export const SESSION_COOKIE_SECURE = "__Host-cv_session"
/** Cookie name in local http development, where "__Host-" would be rejected. */
export const SESSION_COOKIE_DEV = "cv_session"

export const SESSION_VERSION = 1
export const MAX_SESSION_SECONDS = 7 * 24 * 60 * 60
export const MIN_SECRET_LENGTH = 32
export const DEFAULT_BUCKET = "cv-private"

/** Version of the recruiter privacy notice stored with each access request. */
export const PRIVACY_NOTICE_VERSION = "2026-10"

export const ACCESS_PATH = "/curriculumvitae/access"
export const DOSSIER_PATH = "/curriculumvitae/dossier"

/** Every scope a grant can carry (the CLI validates against this). */
export const KNOWN_SCOPES = [
  "dossier",
  "cases",
  "pdf:exec-cv",
  "pdf:one-pager",
  "pdf:long-bio",
  "pdf:board-bio",
] as const

export type AccessConfig = {
  sessionSecret: string
  codePepper: string
  ipSalt: string
  bucket: string
}

const strong = (v: string | undefined): v is string =>
  typeof v === "string" && v.length >= MIN_SECRET_LENGTH

/** The kill switch. Anything other than the exact string "true" is closed. */
export function accessEnabled(env: Env = process.env): boolean {
  return env.CV_ACCESS_ENABLED === "true"
}

/**
 * NODE_ENV. When `env` is the live process.env this reads the literal
 * `process.env.NODE_ENV`, which Next inlines at build time in BOTH the Node
 * and Edge runtimes (a dynamic `env.NODE_ENV` read is not guaranteed to
 * exist in the Edge sandbox, and the middleware and the routes must agree
 * on the cookie name).
 */
function nodeEnv(env: Env): string | undefined {
  return env === process.env ? process.env.NODE_ENV : env.NODE_ENV
}

/** Session cookie name for this runtime. */
export function sessionCookieName(env: Env = process.env): string {
  return nodeEnv(env) === "production" ? SESSION_COOKIE_SECURE : SESSION_COOKIE_DEV
}

export function sessionCookieBase(env: Env = process.env) {
  return {
    httpOnly: true as const,
    secure: nodeEnv(env) === "production",
    sameSite: "lax" as const,
    path: "/",
  }
}

/** Middleware needs only the switch and the session secret. */
export function readSessionSecret(env: Env = process.env): string | null {
  if (!accessEnabled(env)) return null
  return strong(env.CV_SESSION_SECRET) ? env.CV_SESSION_SECRET : null
}

/** Full configuration for the Node-side routes. Null = closed. */
export function readAccessConfig(env: Env = process.env): AccessConfig | null {
  if (!accessEnabled(env)) return null
  const { CV_SESSION_SECRET, CV_CODE_PEPPER, CV_IP_SALT } = env
  if (!strong(CV_SESSION_SECRET) || !strong(CV_CODE_PEPPER) || !strong(CV_IP_SALT)) {
    return null
  }
  return {
    sessionSecret: CV_SESSION_SECRET,
    codePepper: CV_CODE_PEPPER,
    ipSalt: CV_IP_SALT,
    bucket: env.CV_STORAGE_BUCKET?.trim() || DEFAULT_BUCKET,
  }
}

/**
 * Local preview of the gated layer without Supabase. Allowed ONLY when all
 * three hold: CV_DEV_PREVIEW=1, NODE_ENV=development and VERCEL unset.
 * `next build` inlines NODE_ENV=production, so the branch is dead code in
 * every deployed bundle.
 */
export function isDevPreview(env: Env = process.env): boolean {
  return (
    env.CV_DEV_PREVIEW === "1" &&
    nodeEnv(env) === "development" &&
    !env.VERCEL
  )
}
