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

## Protected route: /curriculumvitae/dossier

`/curriculumvitae/dossier/*` and `/api/cv/download/*` are the gated layer of the executive profile. The public teaser (`/curriculumvitae`), the access page and the privacy notice stay open. Content for the gated layer lives only in the private local folder `~/Documents/GitHub/tarrysingh-cv-private` and is uploaded to a private Supabase Storage bucket; it is never committed.

How access works:
- A recruiter gets a per-person code (`TS-XXXX-XXXX-XXXX`, Crockford base32) that Tarry issues with `npm run cv:grant -- issue --name ... --firm ...`. The code is printed once; only `HMAC-SHA256(code, CV_CODE_PEPPER)` is stored in `profile_grants`.
- `POST /api/cv/redeem` checks the code and sets a signed session cookie (`__Host-cv_session`, or `cv_session` in local http dev): HttpOnly, Secure, SameSite=Lax, value `{gid, exp, v}` + HMAC with `CV_SESSION_SECRET`, lifetime `min(grant expiry, 7 days)`.
- `src/middleware.ts` is the FIRST gate (Edge): verifies the cookie, otherwise redirects to `/curriculumvitae/access`. It denies when `CV_ACCESS_ENABLED` is not `"true"` or the session secret is missing, and stamps `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: private, no-store`. It returns before the `sim_user_id` logic, so the gated area sets no other cookie.
- The authoritative check is `getDossierAccess()` in `src/lib/cv/access/server.ts`. Every gated page and the download route call it; it re-reads the grant from Supabase on every request, so revocation (`npm run cv:grant -- revoke <id|ref>`) is immediate. A middleware bypass alone exposes nothing. New gated pages must call it and render nothing without it.
- Downloads are stamped per reader (footer on every page, PDF Subject/Keywords carry the grant ref) and logged. Master PDFs are in the private bucket, never in `public/`.

Rules:
- Env vars (dkailab project only, never committed; Preview and Production use different `CV_SESSION_SECRET` values): `CV_ACCESS_ENABLED`, `CV_SESSION_SECRET`, `CV_CODE_PEPPER`, `CV_IP_SALT`, `CV_STORAGE_BUCKET`, `CV_NOTIFY_EMAIL`. `.env.example` documents the keys only. Secrets must be at least 32 characters or access fails closed.
- Kill switch: `CV_ACCESS_ENABLED=false` closes the whole gated layer (including redeem and the request form). Rotating `CV_SESSION_SECRET` signs everyone out.
- `CV_DEV_PREVIEW=1` grants a fake preview reader for local work and is honoured only when `NODE_ENV=development` and `VERCEL` is unset. Never set it on Vercel.
- Links into the gated area must use `prefetch={false}` (or a plain `<a>`), so prefetches do not create fake views.
- Do not recreate or apply anything against another Supabase project. The tables and the `cv-private` bucket come from `supabase/migrations/003_profile_access.sql`.
- Local tools: `npm run cv:grant` (issue, revoke, list, requests), `npm run cv:upload` (gated.json and master PDFs to the bucket), `npm run cv:test` (access unit tests). The code pepper in `.env.local` must equal the one on the deployment the codes are for.
