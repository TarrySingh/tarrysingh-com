import { createSign } from "node:crypto"

/**
 * Sprint 9.1 — minimal Google Drive REST client for the auto-publish
 * cron. Uses a service-account JWT → access-token exchange → REST
 * call flow, intentionally avoiding the `googleapis` dependency
 * (which bundles every Google client we don't use).
 *
 * The cron only needs two surfaces:
 *   1. List files in a specific folder with `modifiedTime` filtering
 *      so we can poll for "newer than last seen" without scanning the
 *      whole folder every tick.
 *   2. Download a single file's raw bytes (UTF-8 markdown).
 *
 * Env (read at call-time, not module-load, so Vercel preview/prod can
 * share config without runtime crashes when one var is missing):
 *
 *   GOOGLE_DRIVE_SA_CLIENT_EMAIL     service-account email
 *                                      (e.g. tarrysingh-drive-poller@…iam.gserviceaccount.com)
 *   GOOGLE_DRIVE_SA_PRIVATE_KEY      PEM-encoded RSA private key from the
 *                                      service-account JSON; newlines may
 *                                      be `\n` literal (Vercel UI does that)
 *                                      and are normalised here.
 *   GOOGLE_DRIVE_INGEST_FOLDER_ID    folder ID to poll (the Cowork target)
 */

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
const DRIVE_API = "https://www.googleapis.com/drive/v3"
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3"
// Full `drive` scope so the SA can write to the shared folder. The
// folder was created by Tarry and shared with the SA as Editor; the
// narrower `drive.file` scope wouldn't apply because the folder
// isn't SA-owned.
const SCOPE = "https://www.googleapis.com/auth/drive"
// JWT lifetime per Google's spec is 3600 s max. Cache the access
// token in-module so successive cron invocations within the same
// warm Lambda reuse it instead of round-tripping every tick.
const TOKEN_LIFETIME_SECONDS = 3600
const TOKEN_SAFETY_WINDOW_SECONDS = 60

interface CachedToken {
  accessToken: string
  expiresAtMs: number
}
let cachedToken: CachedToken | null = null

export interface DriveConfig {
  clientEmail: string
  privateKey: string
  folderId: string
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  /** ISO 8601 string, e.g. "2026-05-16T17:14:23.456Z". */
  modifiedTime: string
  /** Drive-side md5; useful for de-dup if Tarry re-uploads identical bytes. */
  md5Checksum?: string
  size?: string
}

export type DriveError =
  | { ok: false; error: "missing_env"; var: string }
  | { ok: false; error: "auth_failed"; debug: string }
  | { ok: false; error: "drive_request_failed"; status: number; debug: string }
  | { ok: false; error: "private_key_malformed"; debug: string }

function readConfig(): DriveConfig | DriveError {
  const clientEmail = process.env.GOOGLE_DRIVE_SA_CLIENT_EMAIL
  const privateKeyRaw = process.env.GOOGLE_DRIVE_SA_PRIVATE_KEY
  const folderId = process.env.GOOGLE_DRIVE_INGEST_FOLDER_ID
  if (!clientEmail) return { ok: false, error: "missing_env", var: "GOOGLE_DRIVE_SA_CLIENT_EMAIL" }
  if (!privateKeyRaw) return { ok: false, error: "missing_env", var: "GOOGLE_DRIVE_SA_PRIVATE_KEY" }
  if (!folderId) return { ok: false, error: "missing_env", var: "GOOGLE_DRIVE_INGEST_FOLDER_ID" }
  // Vercel UI stores newlines as the literal two-char sequence \n.
  // Normalise both forms back to real newlines so node:crypto can
  // parse the PEM. Idempotent.
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n").trim()
  if (!privateKey.includes("BEGIN PRIVATE KEY") && !privateKey.includes("BEGIN RSA PRIVATE KEY")) {
    return {
      ok: false,
      error: "private_key_malformed",
      debug: "Private key does not contain a PEM header. Check Vercel env var has the full PEM block.",
    }
  }
  return { clientEmail, privateKey, folderId }
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

/**
 * Build a JWT signed with the service account's RSA private key,
 * exchange it at the token endpoint for an OAuth2 access token,
 * cache for ~59 minutes.
 */
async function getAccessToken(
  config: DriveConfig,
): Promise<{ ok: true; token: string } | DriveError> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAtMs > now + TOKEN_SAFETY_WINDOW_SECONDS * 1000) {
    return { ok: true, token: cachedToken.accessToken }
  }

  const iat = Math.floor(now / 1000)
  const exp = iat + TOKEN_LIFETIME_SECONDS
  const header = b64url(Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" }), "utf8"))
  const claim = b64url(
    Buffer.from(
      JSON.stringify({
        iss: config.clientEmail,
        scope: SCOPE,
        aud: TOKEN_ENDPOINT,
        iat,
        exp,
      }),
      "utf8",
    ),
  )
  const signingInput = `${header}.${claim}`

  let signature: string
  try {
    const signer = createSign("RSA-SHA256")
    signer.update(signingInput, "utf8")
    signer.end()
    signature = b64url(signer.sign(config.privateKey))
  } catch (err) {
    return {
      ok: false,
      error: "private_key_malformed",
      debug: err instanceof Error ? err.message : String(err),
    }
  }
  const jwt = `${signingInput}.${signature}`

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  })

  let res: Response
  try {
    res = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })
  } catch (err) {
    return {
      ok: false,
      error: "auth_failed",
      debug: err instanceof Error ? err.message : String(err),
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    return {
      ok: false,
      error: "auth_failed",
      debug: `Token endpoint returned ${res.status}: ${text.slice(0, 240)}`,
    }
  }
  const json = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!json.access_token) {
    return {
      ok: false,
      error: "auth_failed",
      debug: "Token response missing access_token.",
    }
  }
  cachedToken = {
    accessToken: json.access_token,
    expiresAtMs: now + (json.expires_in ?? TOKEN_LIFETIME_SECONDS) * 1000,
  }
  return { ok: true, token: json.access_token }
}

/**
 * List markdown files in the configured folder, optionally filtered
 * by `modifiedTime > sinceIso` — that's the high-water mark the cron
 * tracks per Sprint 9.1's idempotency story (see
 * `studio_drive_ingest_log` table).
 *
 * Results are sorted by `modifiedTime` ascending so the cron processes
 * the oldest first and never misses one if the page boundary changes.
 */
export async function listMarkdownFilesInFolder(options?: {
  /** Skip files modified at or before this ISO timestamp. */
  sinceIso?: string
  /** Max files per call (Drive caps at 1000; we default to 50). */
  pageSize?: number
}): Promise<{ ok: true; files: DriveFile[] } | DriveError> {
  const cfg = readConfig()
  if ("error" in cfg) return cfg

  const tokenRes = await getAccessToken(cfg)
  if ("error" in tokenRes) return tokenRes

  // Drive's q syntax: filter by parent folder + mimeType + modifiedTime.
  // We accept both `text/markdown` and `text/plain` because Google
  // sometimes detects .md as plain text. Service-account uploads from
  // Claude-Cowork land as text/markdown but be defensive.
  const qParts = [
    `'${cfg.folderId}' in parents`,
    "trashed = false",
    "(mimeType = 'text/markdown' or mimeType = 'text/plain' or mimeType = 'application/octet-stream')",
  ]
  if (options?.sinceIso) {
    qParts.push(`modifiedTime > '${options.sinceIso}'`)
  }
  const q = qParts.join(" and ")

  const params = new URLSearchParams({
    q,
    pageSize: String(options?.pageSize ?? 50),
    orderBy: "modifiedTime asc",
    fields: "files(id,name,mimeType,modifiedTime,md5Checksum,size)",
    spaces: "drive",
  })

  const url = `${DRIVE_API}/files?${params.toString()}`
  let res: Response
  try {
    res = await fetch(url, {
      headers: { authorization: `Bearer ${tokenRes.token}` },
    })
  } catch (err) {
    return {
      ok: false,
      error: "drive_request_failed",
      status: 0,
      debug: err instanceof Error ? err.message : String(err),
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    return {
      ok: false,
      error: "drive_request_failed",
      status: res.status,
      debug: text.slice(0, 240),
    }
  }
  const json = (await res.json()) as { files?: DriveFile[] }
  return { ok: true, files: json.files ?? [] }
}

/**
 * Download a single file's raw UTF-8 content. We assume the file is
 * .md (the cron filters by mimeType before calling this) so binary
 * concerns don't apply.
 */
export async function downloadFileContent(
  fileId: string,
): Promise<{ ok: true; content: string } | DriveError> {
  const cfg = readConfig()
  if ("error" in cfg) return cfg

  const tokenRes = await getAccessToken(cfg)
  if ("error" in tokenRes) return tokenRes

  const url = `${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`
  let res: Response
  try {
    res = await fetch(url, {
      headers: { authorization: `Bearer ${tokenRes.token}` },
    })
  } catch (err) {
    return {
      ok: false,
      error: "drive_request_failed",
      status: 0,
      debug: err instanceof Error ? err.message : String(err),
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    return {
      ok: false,
      error: "drive_request_failed",
      status: res.status,
      debug: text.slice(0, 240),
    }
  }
  const content = await res.text()
  return { ok: true, content }
}

/**
 * Health check / smoke test — returns whether the service account can
 * authenticate AND see the folder. Used by the cron's GET handler so
 * Tarry can curl it once after configuring env vars to verify wiring
 * without writing a draft.
 */
export async function pingDrive(): Promise<
  | { ok: true; folderId: string; visibleFiles: number }
  | DriveError
> {
  const cfg = readConfig()
  if ("error" in cfg) return cfg
  const list = await listMarkdownFilesInFolder({ pageSize: 5 })
  if (!list.ok) return list
  return { ok: true, folderId: cfg.folderId, visibleFiles: list.files.length }
}

/**
 * Upsert a small UTF-8 text file in the configured folder by name.
 *
 * Behaviour:
 *   - If a file with `name` already exists in the folder, its content
 *     is replaced (PATCH /upload/.../files/{id}).
 *   - Otherwise a new file is created (POST /upload/.../files).
 *
 * Used by the daily-brief loop to transport Tarry's brief into a
 * place Cowork's Drive MCP can read — Cowork has no direct HTTP fetch,
 * so the brief endpoint mirrors the brief into the same folder Cowork
 * already scans every morning.
 */
export async function upsertTextFileInFolder(args: {
  name: string
  content: string
  mimeType?: string
}): Promise<{ ok: true; fileId: string } | DriveError> {
  const cfg = readConfig()
  if ("error" in cfg) return cfg
  const tokenRes = await getAccessToken(cfg)
  if ("error" in tokenRes) return tokenRes

  const mime = args.mimeType ?? "text/markdown"

  // 1. Look up existing file by name in the folder.
  const lookupParams = new URLSearchParams({
    q: `'${cfg.folderId}' in parents and name = '${args.name.replace(/'/g, "\\'")}' and trashed = false`,
    fields: "files(id,name)",
    pageSize: "5",
  })
  let lookupRes: Response
  try {
    lookupRes = await fetch(`${DRIVE_API}/files?${lookupParams}`, {
      headers: { authorization: `Bearer ${tokenRes.token}` },
    })
  } catch (err) {
    return {
      ok: false,
      error: "drive_request_failed",
      status: 0,
      debug: err instanceof Error ? err.message : String(err),
    }
  }
  if (!lookupRes.ok) {
    const text = await lookupRes.text().catch(() => "")
    return {
      ok: false,
      error: "drive_request_failed",
      status: lookupRes.status,
      debug: text.slice(0, 240),
    }
  }
  const lookupJson = (await lookupRes.json()) as { files?: { id: string }[] }
  const existing = lookupJson.files?.[0]

  // 2. Multipart payload — Drive's combined metadata + media pattern.
  const boundary = `boundary_${Math.random().toString(36).slice(2)}`
  const metadata = existing
    ? { name: args.name, mimeType: mime }
    : { name: args.name, parents: [cfg.folderId], mimeType: mime }
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mime}\r\n\r\n` +
    `${args.content}\r\n` +
    `--${boundary}--`

  const url = existing
    ? `${DRIVE_UPLOAD_API}/files/${encodeURIComponent(existing.id)}?uploadType=multipart`
    : `${DRIVE_UPLOAD_API}/files?uploadType=multipart`
  const method = existing ? "PATCH" : "POST"

  let upRes: Response
  try {
    upRes = await fetch(url, {
      method,
      headers: {
        authorization: `Bearer ${tokenRes.token}`,
        "content-type": `multipart/related; boundary=${boundary}`,
      },
      body,
    })
  } catch (err) {
    return {
      ok: false,
      error: "drive_request_failed",
      status: 0,
      debug: err instanceof Error ? err.message : String(err),
    }
  }
  if (!upRes.ok) {
    const text = await upRes.text().catch(() => "")
    return {
      ok: false,
      error: "drive_request_failed",
      status: upRes.status,
      debug: text.slice(0, 240),
    }
  }
  const json = (await upRes.json()) as { id?: string }
  if (!json.id) {
    return {
      ok: false,
      error: "drive_request_failed",
      status: upRes.status,
      debug: "upload response missing file id",
    }
  }
  return { ok: true, fileId: json.id }
}

/**
 * Delete every file in the folder whose name ends `_<slug>.md` (any
 * date prefix). The publish flow calls this after the .mdx commits
 * to main, so a published article never sits in the source folder
 * waiting for a future cron to re-ingest it.
 */
export async function deleteFilesBySlugInFolder(
  slug: string,
): Promise<{ ok: true; deleted: number; names: string[] } | DriveError> {
  const cfg = readConfig()
  if ("error" in cfg) return cfg
  const tokenRes = await getAccessToken(cfg)
  if ("error" in tokenRes) return tokenRes

  const safeSlug = slug.replace(/'/g, "\\'")
  const lookupParams = new URLSearchParams({
    q: `'${cfg.folderId}' in parents and name contains '_${safeSlug}.md' and trashed = false`,
    fields: "files(id,name)",
    pageSize: "10",
  })
  let lookupRes: Response
  try {
    lookupRes = await fetch(`${DRIVE_API}/files?${lookupParams}`, {
      headers: { authorization: `Bearer ${tokenRes.token}` },
    })
  } catch (err) {
    return {
      ok: false,
      error: "drive_request_failed",
      status: 0,
      debug: err instanceof Error ? err.message : String(err),
    }
  }
  if (!lookupRes.ok) {
    const text = await lookupRes.text().catch(() => "")
    return {
      ok: false,
      error: "drive_request_failed",
      status: lookupRes.status,
      debug: text.slice(0, 240),
    }
  }
  const json = (await lookupRes.json()) as { files?: { id: string; name: string }[] }
  // The `name contains '_<slug>.md'` filter can match unintended files
  // (e.g. a different slug whose name happens to contain ours). Tighten
  // with a regex check that the name ENDS with `_<slug>.md`.
  const suffix = `_${slug}.md`
  const matches = (json.files ?? []).filter((f) => f.name.endsWith(suffix))
  const names: string[] = []
  let deleted = 0
  for (const f of matches) {
    const r = await fetch(`${DRIVE_API}/files/${encodeURIComponent(f.id)}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${tokenRes.token}` },
    })
    if (r.ok || r.status === 204) {
      deleted++
      names.push(f.name)
    }
  }
  return { ok: true, deleted, names }
}

/**
 * Delete any file in the folder matching `name` exactly. No-op if absent.
 * Used by the decline endpoint to clean up a stale brief file.
 */
export async function deleteFileByNameInFolder(
  name: string,
): Promise<{ ok: true; deleted: number } | DriveError> {
  const cfg = readConfig()
  if ("error" in cfg) return cfg
  const tokenRes = await getAccessToken(cfg)
  if ("error" in tokenRes) return tokenRes

  const lookupParams = new URLSearchParams({
    q: `'${cfg.folderId}' in parents and name = '${name.replace(/'/g, "\\'")}' and trashed = false`,
    fields: "files(id)",
    pageSize: "10",
  })
  let lookupRes: Response
  try {
    lookupRes = await fetch(`${DRIVE_API}/files?${lookupParams}`, {
      headers: { authorization: `Bearer ${tokenRes.token}` },
    })
  } catch (err) {
    return {
      ok: false,
      error: "drive_request_failed",
      status: 0,
      debug: err instanceof Error ? err.message : String(err),
    }
  }
  if (!lookupRes.ok) {
    const text = await lookupRes.text().catch(() => "")
    return {
      ok: false,
      error: "drive_request_failed",
      status: lookupRes.status,
      debug: text.slice(0, 240),
    }
  }
  const json = (await lookupRes.json()) as { files?: { id: string }[] }
  const ids = (json.files ?? []).map((f) => f.id)
  let deleted = 0
  for (const id of ids) {
    const r = await fetch(`${DRIVE_API}/files/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${tokenRes.token}` },
    })
    if (r.ok || r.status === 204) deleted++
  }
  return { ok: true, deleted }
}
