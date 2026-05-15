/**
 * Image generation adapter for the Studio Editor's hero-image button
 * (Sprint 5). One provider implemented (`replicate`, FLUX.1 [schnell]
 * by default); the interface is provider-agnostic so future backends
 * (OpenAI Images, Imagen, Anthropic-hosted gen when it ships) plug
 * in behind the same `generateHero(prompt)` call.
 *
 * Defaults:
 *   - Provider: replicate                      (override: STUDIO_IMAGE_GEN_PROVIDER)
 *   - Model:    black-forest-labs/flux-schnell (override: STUDIO_IMAGE_GEN_MODEL)
 *   - Aspect:   16:9                            (override: STUDIO_IMAGE_GEN_ASPECT)
 *   - Format:   webp                            (override: STUDIO_IMAGE_GEN_FORMAT)
 *
 * Cost: FLUX.1 [schnell] ~$0.003/image as of 2026-05. Negligible at
 * one hero per Dispatch. Fail-closed when REPLICATE_API_TOKEN unset.
 */

export interface HeroGenResult {
  ok: true
  bytes: Buffer
  contentType: string
  provider: string
  model: string
  promptUsed: string
  durationMs: number
}

export interface HeroGenError {
  ok: false
  error: string
  debug?: string
}

const DEFAULT_PROVIDER = "replicate"
const DEFAULT_MODEL = "black-forest-labs/flux-schnell"
const DEFAULT_ASPECT = "16:9"
const DEFAULT_FORMAT = "webp"

const POLL_TIMEOUT_MS = 45_000
const POLL_INTERVAL_MS = 1_000

export async function generateHero(
  prompt: string,
): Promise<HeroGenResult | HeroGenError> {
  const provider = (process.env.STUDIO_IMAGE_GEN_PROVIDER || DEFAULT_PROVIDER).toLowerCase()

  if (provider === "replicate") {
    return generateHeroReplicate(prompt)
  }

  return {
    ok: false,
    error: "image_gen_provider_unknown",
    debug: `STUDIO_IMAGE_GEN_PROVIDER="${provider}" is not implemented. Set to "replicate" or leave unset.`,
  }
}

async function generateHeroReplicate(
  prompt: string,
): Promise<HeroGenResult | HeroGenError> {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return {
      ok: false,
      error: "image_gen_unconfigured",
      debug: "REPLICATE_API_TOKEN is not set on the Vercel project.",
    }
  }

  const model = process.env.STUDIO_IMAGE_GEN_MODEL || DEFAULT_MODEL
  const aspectRatio = process.env.STUDIO_IMAGE_GEN_ASPECT || DEFAULT_ASPECT
  const outputFormat = process.env.STUDIO_IMAGE_GEN_FORMAT || DEFAULT_FORMAT
  const start = Date.now()

  // Replicate has two API patterns: official "models" predictions
  // (POST /v1/models/{owner}/{model}/predictions) and the older
  // "versions" predictions. The newer pattern is cleaner — pin the
  // model by slug rather than tracking version hashes.
  let createUrl = `https://api.replicate.com/v1/models/${model}/predictions`
  if (model.includes(":")) {
    // Caller already passed `owner/model:hash` — use the /predictions
    // endpoint with `version` parameter instead.
    createUrl = `https://api.replicate.com/v1/predictions`
  }

  const createBody: Record<string, unknown> = {
    input: {
      prompt,
      aspect_ratio: aspectRatio,
      output_format: outputFormat,
      output_quality: 92,
      num_outputs: 1,
      // NOTE: keep this set minimal. Replicate's predictions endpoint
      // rejects ANY unknown input key with 422 — caught at Sprint 5 UAT
      // 2026-05-15. flux-schnell's documented inputs are: prompt,
      // aspect_ratio, num_outputs, output_format, output_quality, seed,
      // disable_safety_checker. SDXL would use different keys; the
      // provider switch is the place to fork the input schema.
    },
  }
  if (model.includes(":")) {
    createBody.version = model.split(":")[1]
  }

  let createRes: Response
  try {
    createRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        // "Prefer: wait" lets Replicate hold the connection open until
        // the prediction is done (up to ~60s). For flux-schnell that
        // usually means a single round-trip, no polling. Falls back to
        // the polling path below if we get back a non-final status.
        Prefer: "wait=30",
      },
      body: JSON.stringify(createBody),
    })
  } catch (err) {
    return {
      ok: false,
      error: "image_gen_network_error",
      debug: err instanceof Error ? err.message : String(err),
    }
  }

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => "")
    console.error(
      JSON.stringify({
        tag: "studio.image_gen.create_failed",
        provider: "replicate",
        model,
        status: createRes.status,
        error: errText.slice(0, 500),
      }),
    )
    return {
      ok: false,
      error: "image_gen_create_failed",
      debug: `${createRes.status}: ${errText.slice(0, 500)}`,
    }
  }

  let prediction: PredictionResponse
  try {
    prediction = (await createRes.json()) as PredictionResponse
  } catch {
    return { ok: false, error: "image_gen_invalid_response" }
  }

  // Poll if the wait-prefer didn't return a final state.
  if (prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled") {
    const pollStart = Date.now()
    while (Date.now() - pollStart < POLL_TIMEOUT_MS) {
      await sleep(POLL_INTERVAL_MS)
      try {
        const r = await fetch(prediction.urls.get, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!r.ok) {
          return {
            ok: false,
            error: "image_gen_poll_failed",
            debug: `${r.status}: ${await r.text().catch(() => "")}`,
          }
        }
        prediction = (await r.json()) as PredictionResponse
      } catch (err) {
        return {
          ok: false,
          error: "image_gen_poll_network_error",
          debug: err instanceof Error ? err.message : String(err),
        }
      }
      if (
        prediction.status === "succeeded" ||
        prediction.status === "failed" ||
        prediction.status === "canceled"
      ) {
        break
      }
    }
  }

  if (prediction.status !== "succeeded") {
    return {
      ok: false,
      error:
        prediction.status === "starting" || prediction.status === "processing"
          ? "image_gen_timeout"
          : "image_gen_failed",
      debug: prediction.error ?? prediction.status,
    }
  }

  // Output is either a string URL (one model variant) or an array
  // of URLs (most). Take the first.
  const rawOutput = prediction.output
  const outputUrl = Array.isArray(rawOutput)
    ? (rawOutput[0] as string | undefined)
    : typeof rawOutput === "string"
      ? rawOutput
      : undefined

  if (!outputUrl) {
    return { ok: false, error: "image_gen_no_output_url" }
  }

  // Download the bytes so we can re-upload to Supabase.
  let imgRes: Response
  try {
    imgRes = await fetch(outputUrl)
  } catch (err) {
    return {
      ok: false,
      error: "image_gen_download_network_error",
      debug: err instanceof Error ? err.message : String(err),
    }
  }
  if (!imgRes.ok) {
    return {
      ok: false,
      error: "image_gen_download_failed",
      debug: `${imgRes.status}: ${imgRes.statusText}`,
    }
  }

  const contentType = imgRes.headers.get("content-type") || `image/${outputFormat}`
  const bytes = Buffer.from(await imgRes.arrayBuffer())

  return {
    ok: true,
    bytes,
    contentType,
    provider: "replicate",
    model,
    promptUsed: prompt,
    durationMs: Date.now() - start,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface PredictionResponse {
  id: string
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled"
  urls: { get: string; cancel: string }
  output?: string | string[] | null
  error?: string | null
}
