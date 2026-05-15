# Runbook · local FLUX via ComfyUI

**Purpose:** generate Studio Editor hero images on your own Mac instead of paying Replicate per call. Sprint 5.6 deliverable. Zero per-image cost; the GPU electricity stays on your desk.

The studio's `image-gen.ts` adapter has two providers wired:
- `replicate` (default, ~$0.003/image, works from production Vercel)
- `local-comfy` (this runbook, ~30–90 s/image on M-series, free, dev-mode only)

This runbook covers the **one-time setup** of ComfyUI + FLUX schnell + the env switch so `npm run dev` → "✨ Generate hero" routes to localhost instead of Replicate.

---

## What you're installing

1. **ComfyUI** — an HTTP server that runs Stable Diffusion / FLUX workflows locally. Listens on `http://127.0.0.1:8188` by default. The studio adapter talks to two of its endpoints: `POST /prompt` and `GET /history/<id>`.
2. **FLUX.1 [schnell] checkpoint** — black-forest-labs's fast variant (~4 steps, cfg 1.0, ~12 GB on disk). The fp8 quantised version runs comfortably on a 16 GB Mac.

---

## Setup procedure (one-time, ~30 min)

### 1. Clone + install ComfyUI

```bash
# Pick a stable home — somewhere outside the tarrysingh-com repo.
cd ~
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# Python 3.10+ recommended. Use venv to keep deps isolated.
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

On Apple Silicon the requirements.txt installs the right PyTorch with MPS (Metal) acceleration automatically. No CUDA needed.

### 2. Download the FLUX schnell checkpoint

The all-in-one fp8 .safetensors weighs ~12 GB and includes the UNet + CLIP + VAE so the studio's workflow doesn't need separate loaders.

```bash
# Inside ComfyUI/
cd models/checkpoints

# Download the fp8 quantised all-in-one. ~12 GB. Save as the exact
# filename the studio adapter expects (override via STUDIO_LOCAL_COMFY_CKPT
# if you prefer a different file).
curl -L -o flux1-schnell-fp8.safetensors \
  "https://huggingface.co/Comfy-Org/flux1-schnell/resolve/main/flux1-schnell-fp8.safetensors"
```

If `curl` rate-limits, do it through your browser; Hugging Face occasionally requires you to accept the model card before download (FLUX schnell is non-commercial-friendly but you may need to click through).

### 3. Run ComfyUI

```bash
# From ComfyUI/, with venv still active:
python main.py --listen 127.0.0.1 --port 8188
```

You should see:
```
Starting server
To see the GUI go to: http://127.0.0.1:8188
```

Open the GUI once in a browser to confirm the model loads. You don't need to interact with it — the studio adapter posts workflows directly to the API.

### 4. Wire the studio editor

In the `tarrysingh-com` repo, add to **`.env.local`** (not `.env.example` — `.env.local` is gitignored and dev-only):

```bash
STUDIO_IMAGE_GEN_PROVIDER=local-comfy
# Optional overrides (defaults shown):
# STUDIO_LOCAL_COMFY_URL=http://127.0.0.1:8188
# STUDIO_LOCAL_COMFY_CKPT=flux1-schnell-fp8.safetensors
# STUDIO_IMAGE_GEN_ASPECT=16:9
```

Then:
```bash
npm run dev
# Open http://localhost:3000/studio/editor in your browser.
# Click "✨ Generate hero" — should route to ComfyUI, not Replicate.
```

Watch the ComfyUI terminal: you'll see model loading on the first call (~5–15 s warm-up), then sampler steps (~30–60 s for the actual gen on an M2 / M3 Pro). The studio's adapter polls for up to 180 s.

---

## Operating modes

The studio works in three modes, depending on `.env.local` / Vercel env config:

| Mode | When | `STUDIO_IMAGE_GEN_PROVIDER` | Cost | Hardware |
|---|---|---|---|---|
| **Local** | `npm run dev` at your desk with ComfyUI running | `local-comfy` | $0 / image | Your Mac's GPU |
| **Cloud** | `npm run dev` while traveling, or production Vercel | `replicate` | ~$0.003 / image | Replicate's GPUs |
| **Hybrid** | Vercel prod = replicate; dev = local-comfy | (varies per env) | mostly $0 | Mostly your Mac |

The clean separation: `.env.local` overrides on dev only; Vercel's project env vars apply in prod. Set them as you like.

---

## Smoke test

```bash
# 1. ComfyUI is up:
curl http://127.0.0.1:8188/system_stats | jq .

# 2. Studio adapter happy-path. Run a quick generate from the editor
#    and watch ComfyUI's stdout for sampler progress bars.

# 3. If the editor returns image_gen_local_unreachable:
#    — Confirm ComfyUI is on port 8188 (not 8189 or something else)
#    — Confirm npm run dev is also localhost (same machine)
#    — Confirm .env.local has STUDIO_IMAGE_GEN_PROVIDER=local-comfy
#    — Restart `npm run dev` after editing .env.local (Next.js caches env)
```

---

## Failure modes + fixes

| Symptom | Cause | Fix |
|---|---|---|
| `image_gen_local_unreachable` | ComfyUI not running, or different port | Start ComfyUI; check port matches `STUDIO_LOCAL_COMFY_URL`. |
| `image_gen_create_failed` with node_errors mentioning the checkpoint | FLUX schnell .safetensors not in `models/checkpoints/`, or filename mismatch | Move/rename to `flux1-schnell-fp8.safetensors`, or set `STUDIO_LOCAL_COMFY_CKPT` to whatever you have. |
| `image_gen_timeout` | First-run model loading > 180 s, or Mac is under heavy load | Run ComfyUI once before starting `npm run dev` so the model is already loaded; or close memory-hungry apps. |
| Output quality looks worse than Replicate | Different sampler / steps / cfg config — the workflow defaults to flux-schnell-recommended (4 steps, cfg 1.0, euler / simple). Tweaking these in `image-gen.ts:FLUX_SCHNELL_WORKFLOW` will diverge from the studio voice. | Leave the defaults; if you need a different style, set `STUDIO_LOCAL_COMFY_CKPT` to a different FLUX variant (flux-dev for higher quality at 20+ steps). |
| Image too small / wrong ratio | `STUDIO_IMAGE_GEN_ASPECT` controls dimensions; supported: 16:9 (default), 3:2, 4:3, 1:1, 9:16. FLUX requires multiples of 16. | Set the env var to one of the listed ratios. |

---

## Why this is the right "kill SaaS" move

Sprint 1 → 5 killed four pieces of SaaS rent: blog CMS, newsletter platform, analytics, image hosting. Each replacement is *thin* — the underlying cost was platform tax, not compute, so replacing the platform is replacing a markup.

Image generation is different: the cost **is** compute. Replicate at $0.003/image is GPU electricity + orchestration markup, not platform rent. You can't kill the compute, but you can move it onto hardware you already own. That's what this runbook does.

For Tarry's volume (~10 heroes/month), the savings are pennies per year. The win isn't financial; it's *not adding another vendor to the tab* and keeping the studio's compute footprint on your own desk when you're at it.

When you're traveling without your Mac, Replicate's $0.003 is the right fallback. Don't be ideological about pennies.

---

*Last reviewed: 2026-05-15 (Sprint 5.6 ship).*
