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

**Apple Silicon precheck — confirm arm64 Homebrew exists.** If you migrated from an Intel Mac, your Homebrew is at `/usr/local/` and is x86_64 (Rosetta). PyTorch dropped Intel macOS wheels after 2.2.x, so an Intel-Homebrew Python caps you at torch 2.2.x — which is too old for current ComfyUI. **You need arm64 Homebrew at `/opt/homebrew/`.**

```bash
file $(which python3.12) 2>/dev/null || echo "python3.12 not yet installed"
```

If the output says `x86_64` (or python3.12 is not yet installed and you came from an Intel Mac), install arm64 Homebrew first:

```bash
arch                                  # confirm shell is arm64
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/opt/homebrew/bin/brew shellenv)"
```

The installer auto-detects your arm64 shell and lays Homebrew down at `/opt/homebrew/`. It coexists fine with the older `/usr/local/` install; nothing is broken or removed.

Once arm64 Homebrew is up, the full plain-copy-paste install (no inline comments — zsh's `interactive_comments` can be off on some configs, which makes the `#` get parsed as a command argument):

```bash
cd ~
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
/opt/homebrew/bin/brew install python@3.12
file /opt/homebrew/bin/python3.12
/opt/homebrew/bin/python3.12 -m venv venv
source venv/bin/activate
python -c "import platform; print(platform.machine())"
pip install --upgrade pip
pip install -r requirements.txt
pip install --no-cache-dir torch torchvision torchaudio
pip install "numpy<2"
```

The `file` and `platform.machine()` lines are smoke-tests. Expected output:
- `file /opt/homebrew/bin/python3.12` → `Mach-O 64-bit executable arm64`
- `print(platform.machine())` → `arm64`

If either says `x86_64`, your venv is using the wrong Python — `rm -rf venv` and rebuild with the explicit `/opt/homebrew/bin/python3.12` path.

**Why each step matters:**

- **arm64 Homebrew at `/opt/homebrew/`** — Intel Macs use `/usr/local/` Homebrew; M-series Macs need `/opt/homebrew/`. If you migrated from Intel, both exist and `which python3.12` may resolve to the x86_64 one, which limits PyTorch to ≤ 2.2.x. Caught 2026-05-15 during the first install — pip's compatible wheel tags showed `x86_64 / intel / universal2` only, no `arm64`. Use the explicit `/opt/homebrew/bin/python3.12` path until you're sure your PATH puts arm64 first.
- `brew install python@3.12` — PyTorch wheels stop at Python 3.12 (as of 2026-05). System `python3` on macOS resolves to 3.13/3.14 in newer installs; that triggers `ERROR: No matching distribution found for torch`.
- `python3.12 -m venv venv` — pin the venv to 3.12 explicitly, not `python3`.
- `pip install --upgrade torch torchvision torchaudio` — ComfyUI's bundled `comfy_kitchen` requires `torch.library.custom_op` which was added in PyTorch 2.4. The requirements.txt doesn't always pin torch high enough; the explicit upgrade pulls the latest stable (~2.7/2.8 in May 2026) with Apple Silicon MPS support. Without this, `python main.py` crashes with *"AttributeError: module 'torch.library' has no attribute 'custom_op'"*. Caught 2026-05-15 during the first install.
- `pip install "numpy<2"` — PyTorch's compiled extensions were built against NumPy 1.x; pip auto-installs NumPy 2.4.5 (latest) which is ABI-incompatible. **Run this LAST** — if you upgrade torch after, it may re-pull NumPy 2.x. Without the pin, `python main.py` crashes on `import torch` with *"A module that was compiled using NumPy 1.x cannot be run in NumPy 2.4.5"*. Caught 2026-05-15 during the first install.

On Apple Silicon the requirements.txt installs the right PyTorch with MPS (Metal) acceleration automatically. No CUDA needed.

### 2. Download the FLUX schnell checkpoint

The all-in-one fp8 .safetensors weighs **~16 GB** (verified during the first install; earlier docs said 12 GB) and includes the UNet + CLIP + VAE so the studio's workflow doesn't need separate loaders.

```bash
# Inside ComfyUI/
cd models/checkpoints

# Download the fp8 quantised all-in-one. ~16 GB. Save as the exact
# filename the studio adapter expects (override via STUDIO_LOCAL_COMFY_CKPT
# if you prefer a different file).
curl -L -o flux1-schnell-fp8.safetensors \
  "https://huggingface.co/Comfy-Org/flux1-schnell/resolve/main/flux1-schnell-fp8.safetensors"
```

If `curl` rate-limits, do it through your browser; Hugging Face occasionally requires you to accept the model card before download (FLUX schnell is non-commercial-friendly but you may need to click through).

**RAM sizing note.** The fp8 checkpoint needs ~16 GB unified RAM to load comfortably. On a 32 GB+ M-series Mac it's fine. On a 16 GB Mac the fp8 swaps heavily; use a GGUF-quantised variant instead — `flux1-schnell-Q4_K_S.gguf` (~6 GB) runs cleanly on 16 GB. To use a GGUF you'll also need `ComfyUI-GGUF` custom nodes installed (one extra `git clone` into `custom_nodes/`).

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

## Auto-start ComfyUI on login (recommended)

Once the manual run in step 3 has worked at least once, set up a **LaunchAgent** so macOS keeps ComfyUI running 24/7. Set-and-forget: ~200 MB RAM idle, the 16 GB model loads on first request, unloads under memory pressure. The studio UI just talks to `127.0.0.1:8188` whenever — no need to keep a terminal open.

### Install

```bash
# 1. Copy the template into LaunchAgents/
cp docs/runbooks/com.tarrysingh.studio.comfy.plist.example \
   ~/Library/LaunchAgents/com.tarrysingh.studio.comfy.plist

# 2. Replace USERNAME with your macOS short username everywhere in the file.
#    Get the short username:
whoami
# Then either edit the file by hand, or run (BSD sed — works on macOS):
USER_SHORT=$(whoami)
sed -i '' "s/USERNAME/$USER_SHORT/g" \
  ~/Library/LaunchAgents/com.tarrysingh.studio.comfy.plist

# 3. Load it. ComfyUI starts immediately + every subsequent login.
launchctl load ~/Library/LaunchAgents/com.tarrysingh.studio.comfy.plist

# 4. Verify it's running.
curl http://127.0.0.1:8188/system_stats | jq .  # should return JSON
launchctl list | grep com.tarrysingh.studio.comfy   # should show a PID
tail -f ~/Library/Logs/studio-comfy.log              # stream the logs
```

If `launchctl list` shows a PID of `-` or non-zero exit status, check the log file — usually a path mismatch (USERNAME not substituted, or ComfyUI lives somewhere other than `~/ComfyUI`).

### Common ops

| Need | Command |
|---|---|
| Stop ComfyUI temporarily | `launchctl unload ~/Library/LaunchAgents/com.tarrysingh.studio.comfy.plist` |
| Start again | `launchctl load ~/Library/LaunchAgents/com.tarrysingh.studio.comfy.plist` |
| Restart (after updating ComfyUI or weights) | `launchctl kickstart -k gui/$(id -u)/com.tarrysingh.studio.comfy` |
| Permanently remove | `launchctl unload …plist && rm ~/Library/LaunchAgents/com.tarrysingh.studio.comfy.plist` |
| Stream logs | `tail -f ~/Library/Logs/studio-comfy.log` |
| Check if running | `launchctl list \| grep comfy` or `curl 127.0.0.1:8188/system_stats` |

### What this gives you

- **No terminal needed.** Close every terminal, restart your Mac — ComfyUI is back on `127.0.0.1:8188` within a few seconds of login.
- **Auto-restart on crash.** `KeepAlive = true` means if ComfyUI's Python process dies for any reason, macOS restarts it within 10 s.
- **Centralised logs.** Everything goes to `~/Library/Logs/studio-comfy.log` — no scrollback to lose.
- **Studio editor stays simple.** The `image-gen.ts` adapter just hits `localhost:8188`. When ComfyUI is up (which is "always" with the LaunchAgent), gen works. When it's not (e.g. you've manually `launchctl unload`-ed for maintenance), the editor surfaces `image_gen_local_unreachable` with the actual error body.

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
| `ERROR: No matching distribution found for torch>=2.5` with available versions capped at 2.2.x | x86_64 Python (Rosetta Homebrew at `/usr/local/`). PyTorch dropped Intel macOS wheels after 2.2.x. Confirm with `file $(which python3.12)` — if it says `x86_64`, that's the cause. | Install arm64 Homebrew at `/opt/homebrew/` (see Apple Silicon precheck), rebuild venv with `/opt/homebrew/bin/python3.12`. |
| `ERROR: No matching distribution found for torch` during pip install | Python too new (3.13+); PyTorch wheels stop at 3.12 as of 2026-05 | `brew install python@3.12` then `rm -rf venv && python3.12 -m venv venv` and reinstall. |
| `python main.py` crashes on `import torch` with *"A module that was compiled using NumPy 1.x cannot be run in NumPy 2.4.5"* | NumPy 2.x ABI break — PyTorch's compiled extensions were built against NumPy 1.x | `pip install "numpy<2"` inside the venv. The previous-step `pip install -r requirements.txt` doesn't pin NumPy. |
| `python main.py` crashes deep in `comfy_kitchen` with *"AttributeError: module 'torch.library' has no attribute 'custom_op'"* | Torch too old — ComfyUI's `comfy_kitchen` needs `torch.library.custom_op` from PyTorch 2.4+ | `pip install --upgrade torch torchvision torchaudio` inside the venv. Re-run `pip install "numpy<2"` after if the torch upgrade re-pulled NumPy 2.x. |
| `ERROR: Invalid requirement: '#': Expected package name at the start of dependency specifier` | Pasted a multi-line block that had `#` comments inline; zsh's `interactive_comments` is off, so pip got `#` as an argument | Re-run the command without the trailing comment, or `setopt interactive_comments` in `~/.zshrc` once. |
| `image_gen_local_unreachable` | ComfyUI not running, or different port | Start ComfyUI; check port matches `STUDIO_LOCAL_COMFY_URL`. |
| `image_gen_create_failed` with node_errors mentioning the checkpoint | FLUX schnell .safetensors not in `models/checkpoints/`, or filename mismatch | Move/rename to `flux1-schnell-fp8.safetensors`, or set `STUDIO_LOCAL_COMFY_CKPT` to whatever you have. |
| `image_gen_timeout` | First-run model loading > 180 s, or Mac is under heavy load | Run ComfyUI once before starting `npm run dev` so the model is already loaded; or close memory-hungry apps. On 16 GB Macs the fp8 checkpoint may swap badly — switch to GGUF (see RAM sizing note in step 2). |
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
