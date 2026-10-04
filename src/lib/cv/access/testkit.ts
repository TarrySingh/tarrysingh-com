/**
 * Test helpers for the access unit tests (not imported by application code).
 */

import Module from "node:module"

/**
 * "server-only" throws outside a React Server Components build. Its own
 * empty stub is what a real build resolves to, so substitute it for tests.
 * Call before importing any module that imports it.
 */
export function stubServerOnly(): void {
  type LoadFn = (request: string, ...rest: unknown[]) => unknown
  const mod = Module as unknown as { _load: LoadFn }
  const original = mod._load
  mod._load = function (this: unknown, request: string, ...rest: unknown[]) {
    if (request === "server-only") return {}
    return original.call(this, request, ...rest)
  }
}

const env = process.env as Record<string, string | undefined>

const MANAGED = [
  "NODE_ENV",
  "VERCEL",
  "CV_DEV_PREVIEW",
  "CV_ACCESS_ENABLED",
  "CV_SESSION_SECRET",
  "CV_CODE_PEPPER",
  "CV_IP_SALT",
  "CV_STORAGE_BUCKET",
  "CV_SOURCE_DIR",
  "CV_NOTIFY_EMAIL",
  "STUDIO_APPROVAL_EMAIL",
  "RESEND_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
]

/**
 * Runs `fn` with exactly `vars` set among the variables the access code
 * reads (everything else in MANAGED is cleared), then restores the lot.
 * Clearing Supabase and Resend keys guarantees a test can never reach a
 * real service.
 */
export async function withEnv(
  vars: Record<string, string | undefined>,
  fn: () => Promise<void>,
): Promise<void> {
  const saved: Record<string, string | undefined> = {}
  for (const k of MANAGED) saved[k] = env[k]
  for (const k of MANAGED) delete env[k]
  for (const [k, v] of Object.entries(vars)) if (v !== undefined) env[k] = v
  try {
    await fn()
  } finally {
    for (const k of MANAGED) {
      if (saved[k] === undefined) delete env[k]
      else env[k] = saved[k]
    }
  }
}

export const LONG_SECRET = "k".repeat(40)

export const FULL_ENV = {
  CV_ACCESS_ENABLED: "true",
  CV_SESSION_SECRET: LONG_SECRET,
  CV_CODE_PEPPER: LONG_SECRET,
  CV_IP_SALT: LONG_SECRET,
}
