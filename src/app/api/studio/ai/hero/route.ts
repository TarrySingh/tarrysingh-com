import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { aiHeroPrompt } from "@/lib/studio/ai"
import { generateHero } from "@/lib/studio/image-gen"
import { createServiceClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// Claude prompt synth (~10s) + Replicate FLUX schnell (~5-15s) +
// download + upload + getPublicUrl = comfortably under 60 s.
export const maxDuration = 60

const BUCKET = process.env.STUDIO_UPLOADS_BUCKET || "studio-uploads"

interface HeroBody {
  title?: unknown
  excerpt?: unknown
  category?: unknown
  customPrompt?: unknown
}

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
}

/**
 * POST /api/studio/ai/hero
 *
 * End-to-end hero-image generation. Two-step pipeline behind one call:
 *
 *   1. If `customPrompt` is given, use it. Otherwise:
 *      aiHeroPrompt({title, excerpt, category}) → studio-voice
 *      editorial-illustration prompt.
 *   2. generateHero(prompt) → raw image bytes (default FLUX schnell
 *      on Replicate, ~5 s, ~$0.003/image).
 *   3. Upload bytes to the studio-uploads Supabase Storage bucket
 *      under `hero/<sha256>-hero.<ext>` (separates AI-generated heroes
 *      from user-pasted in-body images).
 *   4. Return the public CDN URL + the prompt that produced it.
 *
 * Auth: inherited from the middleware gate on /api/studio/*.
 *
 * Body: { title, excerpt?, category?, customPrompt? }
 * Returns:
 *   { ok, url, prompt, model, durationMs, bytesUploaded, contentType,
 *     thinking? (when prompt was synthesised, not custom) }
 */
export async function POST(req: NextRequest) {
  let payload: HeroBody
  try {
    payload = (await req.json()) as HeroBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const title = typeof payload.title === "string" ? payload.title : ""
  const excerpt = typeof payload.excerpt === "string" ? payload.excerpt : undefined
  const category =
    payload.category === "Essays" || payload.category === "Notes" || payload.category === "Studio"
      ? payload.category
      : undefined
  const customPrompt =
    typeof payload.customPrompt === "string" && payload.customPrompt.trim().length > 0
      ? payload.customPrompt.trim()
      : undefined

  if (!customPrompt && !title.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_context",
        hint: "Provide a title (and optionally an excerpt and category) so Claude can synthesise a hero prompt — or pass customPrompt directly.",
      },
      { status: 422 },
    )
  }

  // 1. Prompt synthesis (skipped if customPrompt provided).
  let prompt: string
  let thinking: string | undefined
  if (customPrompt) {
    prompt = customPrompt
  } else {
    const synth = await aiHeroPrompt({ title, excerpt, category })
    if (!synth.ok) {
      const status = synth.error === "ai_unconfigured" ? 503 : 502
      return NextResponse.json(synth, { status })
    }
    prompt = synth.prompt
    thinking = synth.thinking
  }

  // 2. Generate.
  const gen = await generateHero(prompt)
  if (!gen.ok) {
    const status = gen.error === "image_gen_unconfigured" ? 503 : 502
    return NextResponse.json(gen, { status })
  }

  // 3. Upload bytes to Supabase Storage.
  let supabase
  try {
    supabase = createServiceClient()
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "storage_unconfigured",
        debug:
          process.env.STUDIO_AI_DEBUG === "1"
            ? err instanceof Error
              ? err.message
              : String(err)
            : undefined,
      },
      { status: 503 },
    )
  }

  const sha256 = createHash("sha256").update(gen.bytes).digest("hex")
  const ext = EXT_BY_MIME[gen.contentType] ?? "webp"
  // Hero filenames live under a `hero/` prefix so the bucket listing
  // can distinguish AI-generated heroes from drop-pasted body images.
  // Content-addressed — same prompt → same seed → identical bytes →
  // same filename → upsert no-op.
  const filename = `hero/${sha256.slice(0, 16)}-hero.${ext}`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filename, gen.bytes, {
    contentType: gen.contentType,
    cacheControl: "public, max-age=31536000, immutable",
    upsert: true,
  })

  if (uploadError) {
    console.error(
      JSON.stringify({
        tag: "studio.hero.upload_error",
        bucket: BUCKET,
        filename,
        size: gen.bytes.byteLength,
        error: uploadError.message,
      }),
    )
    return NextResponse.json(
      {
        ok: false,
        error: "hero_upload_failed",
        debug: process.env.STUDIO_AI_DEBUG === "1" ? uploadError.message : undefined,
      },
      { status: 502 },
    )
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  const url = publicData?.publicUrl
  if (!url) {
    return NextResponse.json({ ok: false, error: "public_url_unavailable" }, { status: 502 })
  }

  return NextResponse.json({
    ok: true,
    url,
    prompt,
    model: gen.model,
    provider: gen.provider,
    durationMs: gen.durationMs,
    bytesUploaded: gen.bytes.byteLength,
    contentType: gen.contentType,
    sha256,
    ...(thinking ? { thinking } : {}),
  })
}
