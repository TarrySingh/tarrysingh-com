# Claude / AI agent notes for `tarrysingh-com`

## ⚠️ Deploy target rules (READ BEFORE ANY VERCEL ACTION)

This repo must **ONLY** deploy to the **DK AI Lab (`dkailab`) Pro team** on Vercel.

| | |
|---|---|
| Team slug | `dkailab` |
| Team ID | `team_vNY634Hu3FvyCbrZDNxWywUt` |
| Project slug | `tarrysingh-com-zdmb` |
| Project ID | `prj_tj12Oa33L58ZXFPw51NukG5lP2Ht` |
| Custom domain | `tarrysingh.com` / `www.tarrysingh.com` |

A previous `dev-loks-projects/tarrysingh-com` hobby duplicate was deleted on 2026-04-17 because it was mirroring every push and polluting deploys. **Do not recreate it.**

Before any `vercel` CLI call in this repo, verify:
```bash
cat .vercel/project.json   # must show orgId=team_vNY634Hu3FvyCbrZDNxWywUt
vercel whoami              # must be logged into an account with DKAILab access
```

If you see `projectId=prj_5fU8LBpPxxaGlXyhlNJiFaPPtPSl` anywhere — STOP. That was the old hobby project and it should no longer exist.

## Secrets

Both `PANORAIMA_USER` and `PANORAIMA_PASS` env vars are set on the DK AI Lab project across Development / Preview / Production. Never commit the values. `.env.example` documents the keys only.

## Protected route

`/experiments/panoraima/*` is HTTP-Basic-Auth-gated via `src/middleware.ts`. The middleware:
- Reads `PANORAIMA_USER` / `PANORAIMA_PASS` env vars
- Fails **closed** (401) when either is missing
- Adds `X-Robots-Tag: noindex, nofollow` on all responses
- Does **not** affect any other routes (existing `sim_user_id` cookie logic is preserved)

The experiment card on `/experiments` must use a plain `<a>` tag (not Next.js `<Link>`) so its prefetch doesn't trigger the browser auth prompt before the user clicks.

## Data pipeline (out of this repo)

PANORAIMA JSON is regenerated in the sibling repo `~/Documents/GitHub/panoraima/` via `scripts/refresh-panoraima.sh`. That script copies the output JSON into `src/lib/panoraima/timeline_data.json` here.

## Node

- `package.json` engines: `22.x`
- Vercel project node override: `22.x`
- Do not upgrade to 24.x on Vercel without package.json matching.
