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

// Sprint 5.6 — local FLUX via ComfyUI defaults.
const DEFAULT_LOCAL_COMFY_URL = "http://127.0.0.1:8188"
const DEFAULT_LOCAL_CKPT = "flux1-schnell-fp8.safetensors"
const COMFY_POLL_TIMEOUT_MS = 180_000 // local is slower (30–90s typical on M-series)
const COMFY_POLL_INTERVAL_MS = 1_500

export async function generateHero(
  prompt: string,
): Promise<HeroGenResult | HeroGenError> {
  const provider = (process.env.STUDIO_IMAGE_GEN_PROVIDER || DEFAULT_PROVIDER).toLowerCase()

  if (provider === "replicate") {
    return generateHeroReplicate(prompt)
  }
  if (provider === "local-comfy") {
    return generateHeroLocalComfy(prompt)
  }

  return {
    ok: false,
    error: "image_gen_provider_unknown",
    debug: `STUDIO_IMAGE_GEN_PROVIDER="${provider}" is not implemented. Set to "replicate", "local-comfy", or leave unset.`,
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

// ────────────────────────────────────────────────────────────────────
// Sprint 5.6 — Local FLUX via ComfyUI
//
// ComfyUI runs as a local HTTP server (default http://127.0.0.1:8188)
// and accepts workflow JSON via POST /prompt. Output filenames are
// retrieved by polling /history/<prompt_id> until the entry exists +
// has status.completed = true, then fetched via /view?filename=...&type=output.
//
// This provider is for development-side hero generation when the
// editor is running locally (npm run dev) on the same Mac as ComfyUI.
// Production Vercel deployments can't reach localhost; for cloud
// generation, keep STUDIO_IMAGE_GEN_PROVIDER unset or set to replicate.
//
// Tunnel-it-out-with-Tailscale is a future Sprint 5.6.1 if needed.
// ────────────────────────────────────────────────────────────────────

const FLUX_SCHNELL_WORKFLOW = (
  prompt: string,
  width: number,
  height: number,
  seed: number,
  ckptName: string,
): Record<string, unknown> => ({
  "1": {
    class_type: "CheckpointLoaderSimple",
    inputs: { ckpt_name: ckptName },
  },
  "2": {
    class_type: "CLIPTextEncode",
    inputs: { text: prompt, clip: ["1", 1] },
  },
  "3": {
    class_type: "CLIPTextEncode",
    inputs: { text: "", clip: ["1", 1] },
  },
  "4": {
    class_type: "EmptyLatentImage",
    inputs: { width, height, batch_size: 1 },
  },
  "5": {
    class_type: "KSampler",
    inputs: {
      seed,
      steps: 4, // flux-schnell needs ~4 steps
      cfg: 1.0, // schnell-specific
      sampler_name: "euler",
      scheduler: "simple",
      denoise: 1.0,
      model: ["1", 0],
      positive: ["2", 0],
      negative: ["3", 0],
      latent_image: ["4", 0],
    },
  },
  "6": {
    class_type: "VAEDecode",
    inputs: { samples: ["5", 0], vae: ["1", 2] },
  },
  "7": {
    class_type: "SaveImage",
    inputs: { filename_prefix: "studio_hero", images: ["6", 0] },
  },
})

function aspectToWidthHeight(aspect: string): [number, number] {
  // FLUX prefers multiples of 16. Common hero ratios:
  switch (aspect) {
    case "16:9":
      return [1024, 576]
    case "3:2":
      return [1024, 688]
    case "4:3":
      return [1024, 768]
    case "1:1":
      return [1024, 1024]
    case "9:16":
      return [576, 1024]
    default:
      return [1024, 576]
  }
}

interface ComfyHistoryEntry {
  outputs?: Record<string, { images?: Array<{ filename: string; subfolder: string; type: string }> }>
  status?: { completed?: boolean; status_str?: string }
}

async function generateHeroLocalComfy(
  prompt: string,
): Promise<HeroGenResult | HeroGenError> {
  const baseUrl = (
    process.env.STUDIO_LOCAL_COMFY_URL || DEFAULT_LOCAL_COMFY_URL
  ).replace(/\/$/, "")
  const ckptName = process.env.STUDIO_LOCAL_COMFY_CKPT || DEFAULT_LOCAL_CKPT
  const aspectRatio = process.env.STUDIO_IMAGE_GEN_ASPECT || DEFAULT_ASPECT
  const [width, height] = aspectToWidthHeight(aspectRatio)
  const seed = Math.floor(Math.random() * 1_000_000_000)

  const start = Date.now()

  // 1. POST workflow to /prompt.
  const workflow = FLUX_SCHNELL_WORKFLOW(prompt, width, height, seed, ckptName)
  let createRes: Response
  try {
    createRes = await fetch(`${baseUrl}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: workflow, client_id: "tarrysingh-studio" }),
    })
  } catch (err) {
    return {
      ok: false,
      error: "image_gen_local_unreachable",
      debug: `Could not reach ComfyUI at ${baseUrl}. Is the server running? (${err instanceof Error ? err.message : String(err)})`,
    }
  }

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => "")
    return {
      ok: false,
      error: "image_gen_create_failed",
      debug: `${createRes.status}: ${errText.slice(0, 500)}`,
    }
  }

  let promptResp: { prompt_id?: string; node_errors?: unknown }
  try {
    promptResp = (await createRes.json()) as { prompt_id?: string; node_errors?: unknown }
  } catch {
    return { ok: false, error: "image_gen_invalid_response" }
  }

  if (!promptResp.prompt_id) {
    return {
      ok: false,
      error: "image_gen_create_failed",
      debug: `ComfyUI returned no prompt_id. node_errors=${JSON.stringify(promptResp.node_errors ?? null).slice(0, 500)}`,
    }
  }

  const promptId = promptResp.prompt_id

  // 2. Poll /history/<prompt_id> until completed.
  const pollStart = Date.now()
  let entry: ComfyHistoryEntry | undefined
  while (Date.now() - pollStart < COMFY_POLL_TIMEOUT_MS) {
    await sleep(COMFY_POLL_INTERVAL_MS)
    try {
      const hRes = await fetch(`${baseUrl}/history/${encodeURIComponent(promptId)}`)
      if (!hRes.ok) continue
      const data = (await hRes.json()) as Record<string, ComfyHistoryEntry>
      const candidate = data[promptId]
      if (candidate && candidate.status?.completed) {
        entry = candidate
        break
      }
    } catch {
      // transient error; keep polling
    }
  }

  if (!entry) {
    return { ok: false, error: "image_gen_timeout" }
  }

  // 3. Pull the first image output.
  const images = entry.outputs
    ? Object.values(entry.outputs).flatMap((node) => node.images ?? [])
    : []
  const firstOutput = images.find((i) => i.type === "output") ?? images[0]
  if (!firstOutput) {
    return {
      ok: false,
      error: "image_gen_no_output_url",
      debug: `ComfyUI history had no image outputs. status=${entry.status?.status_str ?? "unknown"}`,
    }
  }

  const viewUrl = `${baseUrl}/view?filename=${encodeURIComponent(firstOutput.filename)}&subfolder=${encodeURIComponent(firstOutput.subfolder || "")}&type=${encodeURIComponent(firstOutput.type)}`

  let imgRes: Response
  try {
    imgRes = await fetch(viewUrl)
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

  const contentType = imgRes.headers.get("content-type") || "image/png"
  const bytes = Buffer.from(await imgRes.arrayBuffer())

  return {
    ok: true,
    bytes,
    contentType,
    provider: "local-comfy",
    model: ckptName,
    promptUsed: prompt,
    durationMs: Date.now() - start,
  }
}
