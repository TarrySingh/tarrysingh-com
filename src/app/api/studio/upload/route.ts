import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { createServiceClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// Vercel default body limit is 4.5 MiB on serverless functions, but
// uploads via FormData stream — this is the per-route timeout, not size.
export const maxDuration = 30

const BUCKET = process.env.STUDIO_UPLOADS_BUCKET || "studio-uploads"
const MAX_BYTES = 8 * 1024 * 1024 // 8 MiB — matches the bucket policy

// Mirror of the bucket's allowed_mime_types — duplicated here so we
// can return a friendly 415 instead of letting Supabase reject after
// the upload has already streamed.
const ALLOWED_MIMES = new Set<string>([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "image/avif",
])

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
  "image/avif": "avif",
}

/**
 * POST /api/studio/upload
 *
 * Accepts a multipart form with a single `file` field. Validates MIME +
 * size, content-addresses the filename via sha256, uploads to the
 * `studio-uploads` Supabase Storage bucket via the service-role client,
 * and returns the public CDN URL.
 *
 * Auth is handled upstream by the Basic-Auth middleware on /api/studio/*.
 *
 * Body (multipart/form-data):
 *   file: File (required)
 *   alt:  string (optional) — alt text echoed back so the client can
 *                              insert it into the markdown image tag.
 *
 * Returns: { ok, url, filename, size, sha256, contentType, alt? }
 */
export async function POST(req: NextRequest) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_multipart" },
      { status: 400 },
    )
  }

  const file = form.get("file")
  const alt = typeof form.get("alt") === "string" ? (form.get("alt") as string) : undefined

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "missing_file", hint: "POST a multipart/form-data body with a `file` field." },
      { status: 400 },
    )
  }

  if (!ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json(
      {
        ok: false,
        error: "unsupported_media_type",
        hint: `Allowed: ${Array.from(ALLOWED_MIMES).join(", ")}. Received: ${file.type || "(none)"}.`,
        contentType: file.type,
      },
      { status: 415 },
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: "file_too_large",
        hint: `Max ${MAX_BYTES} bytes (8 MiB). Received ${buffer.byteLength} bytes.`,
        size: buffer.byteLength,
      },
      { status: 413 },
    )
  }

  // Content-addressed filename. Same bytes always resolve to the same
  // CDN URL — that means dropping the same image twice doesn't double
  // the storage bill, and the URL is permanent.
  const sha256 = createHash("sha256").update(buffer).digest("hex")
  const ext = EXT_BY_MIME[file.type] ?? "bin"
  const safeOriginal = (file.name || "upload")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "") // strip original extension; we'll re-add the canonical one
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  const filename = `${sha256.slice(0, 16)}-${safeOriginal || "upload"}.${ext}`

  let supabase
  try {
    supabase = createServiceClient()
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "storage_unconfigured",
        hint: "Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY on the Vercel project.",
        debug: process.env.STUDIO_AI_DEBUG === "1" ? (err instanceof Error ? err.message : String(err)) : undefined,
      },
      { status: 503 },
    )
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable", // safe — filename is content-addressed
      upsert: true, // same hash = same file = no-op, not a duplicate row
    })

  if (uploadError) {
    console.error(
      JSON.stringify({
        tag: "studio.upload.error",
        bucket: BUCKET,
        filename,
        size: buffer.byteLength,
        error: uploadError.message,
      }),
    )
    return NextResponse.json(
      {
        ok: false,
        error: "upload_failed",
        debug: process.env.STUDIO_AI_DEBUG === "1" ? uploadError.message : undefined,
      },
      { status: 502 },
    )
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  const url = publicData?.publicUrl

  if (!url) {
    return NextResponse.json(
      { ok: false, error: "public_url_unavailable" },
      { status: 502 },
    )
  }

  return NextResponse.json({
    ok: true,
    url,
    filename,
    size: buffer.byteLength,
    sha256,
    contentType: file.type,
    ...(alt ? { alt } : {}),
  })
}
