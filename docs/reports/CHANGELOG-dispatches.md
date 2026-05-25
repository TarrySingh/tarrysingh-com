# Dispatches pipeline — changelog & architecture record

Single source of truth for what the daily-Dispatch publish pipeline does,
how it's wired, and what decisions we landed on. Update this whenever
the wiring changes.

---

## Current architecture (as of 2026-05-22)

**Pure cloud-resident.** Mac state does not affect whether a Dispatch
ships. Cowork is now a "nice-to-have when laptop is on", not a dependency.

```
                  Brief flow                              Article flow
                  ─────────────                           ─────────────

Form submit (any device)                      Cowork (Mac, optional)
   │                                              │
   ├─ Supabase studio_daily_briefs (canonical)    └─ writes article ────┐
   │                                                                     │
   └─ Drive _brief-<date>.md (Cowork transport,                          │
      best-effort, retries 3×)                  Backup writer (Vercel)   │
                                                09:45 Amsterdam (DST-safe)
                                                  │                      │
                                                  ├─ no Drive article? → │
                                                  │  read brief from     │
                                                  │  Drive 1st,          │
                                                  │  Supabase 2nd →      │
                                                  │  generate via        │
                                                  │  Anthropic + web_search ─→ studio_drafts
                                                  │  (bypasses Drive entirely)
                                                  │
                                                  └─ Drive article exists? no-op
                                                                         │
                                                          Drive cron (Vercel, 15-min)
                                                                         │
                                                                         ▼
                                                                  studio_drafts
                                                                         │
                                                                         ▼
                                                                  Approval email
                                                                  (Resend, studio voice)
                                                                         │
                                                                         ▼
                                                          You click Publish (anywhere)
                                                                         │
                                                                         ▼
                                                  Approve route (Vercel)
                                                    ├─ commit content/blog/<slug>.mdx to main (Octokit)
                                                    ├─ delete draft (Supabase)
                                                    ├─ trash article source in Drive (PATCH trashed:true)
                                                    └─ trash _brief-<date>.md in Drive
                                                                         │
                                                                         ▼
                                                  Vercel auto-deploys main → live at /blog/<slug>
```

**Monitoring layers (3 independent):**

1. **LaunchAgent alert** (Mac-side, fires when local watcher hits N=3 consecutive failures)
2. **Heartbeat cron** (Vercel, 10:30 UTC daily) — checks studio_drafts + GitHub commits; emails "no Dispatch today" if both zero
3. **healthchecks.io watchdog** (external) — emails if the heartbeat itself stops firing

All three failure paths must die simultaneously to silence you.

**Brief loop (evening prompt → next-morning article):**

- 21:00/22:00 UTC daily → `/api/cron/daily-brief-prompt` checks Amsterdam-local hour, fires once at 23:00 Amsterdam → email asking about tomorrow's Dispatch
- You click Yes (form opens, token-authed) or No (one-click decline)
- Yes submit → Supabase row + best-effort Drive mirror (retries 3×)
- Cowork reads the Drive file at 09:00 the next morning; the backup writer falls back to Supabase if the Drive mirror failed silently

---

## Session log

### 2026-05-19 evening · brief-prompt loop shipped

- New table `studio_daily_briefs` (Supabase). One row per Amsterdam-local target date.
- `/api/cron/daily-brief-prompt` — DST-safe (fires both 21+22 UTC, route checks Amsterdam hour).
- `/studio/brief/<date>?token=...` — token-authed form.
- `/api/studio/brief/submit` + `/api/studio/brief/decline` — store decision in Supabase, fire Drive mirror best-effort.
- `/api/studio/brief/today?token=...` — endpoint Cowork reads for the brief.
- Heartbeat (`/api/cron/heartbeat`, 10:30 UTC) — silent-failure detector emails "no Dispatch today" if both studio_drafts and GitHub commits are zero today.
- healthchecks.io external watchdog (`HEARTBEAT_PING_URL` env) — third layer for "what if the heartbeat itself dies?"

### 2026-05-20 morning · Cowork can't HTTP-GET the brief

- Cowork's only web tool is `web_search`, not direct fetch. The token-authed `/api/studio/brief/today` endpoint returned 401 / empty for Cowork because search engines can't reach token-protected APIs.
- Pivot: Drive-file transport. Submit endpoint mirrors the brief into `_brief-<date>.md` in the same Drive folder Cowork already reads every morning. Cowork's §0 prompt updated to read via Drive MCP instead of HTTP.
- Discovered later: SA cannot CREATE files in user-owned folders (zero storage quota), only PATCH existing ones. The brief mirror's PATCH path works; first-time CREATE silently fails.

### 2026-05-20 evening · brief loop validated end-to-end

- First brief filed: Meta-surveillance / Reuters story.
- Cowork manually re-run after I seeded `_brief-2026-05-20.md` via Tarry-auth MCP.
- Cowork wrote `2026-05-20_monitoring-old-deal-extraction-new.md` — published.
- Discovered: SA can't DELETE owner-other files either (also quota). Switched all SA "delete" ops to PATCH `{trashed: true}` (editors can trash, just not permanent-delete).
- Approve route extended to also trash `_brief-<date>.md` alongside the article source.

### 2026-05-22 morning · Mac-off day exposed Cowork dependency

- Tarry on trip, laptop off-power. Cowork never fired. No article. No email.
- Brief was filed last night (Supabase row exists) but Drive mirror silently failed (SA can't CREATE).
- Architectural fix: **backup writer** on Vercel.
  - `/api/cron/backup-writer` runs at 09:45 Amsterdam (45-min head start for Cowork).
  - If today's `YYYY-MM-DD_*.md` exists in Drive → no-op.
  - Else: read brief (Drive first, Supabase fallback), generate article via Anthropic + `web_search_20250305` tool, write **directly to studio_drafts** via `processArticle()`.
  - Bypasses Drive entirely on the backup path (SA quota issue). The Drive→cron→ingest detour isn't needed.
- Drive client `upsertTextFileInFolder` got 3× retry with backoff to reduce future silent mirror failures.

### 2026-05-22 afternoon · first cloud-only Dispatch

- Curl-fired `/api/cron/backup-writer?force=1` from cottage. ClickUp/SaaS-death brief.
- 93 seconds, 11 inline citations, draft in Supabase, approval email landed.
- Mac was unplugged the entire time. Pure cloud path.

### 2026-05-23 morning · same-day duplicate emails on Mac-on day

- 2026-05-22 Mac-on day produced TWO Dispatch emails (09:47 + 11:01 Amsterdam).
- Root cause: at 09:45 Amsterdam when backup-writer fired, Cowork hadn't finished yet → backup-writer saw no Drive article → wrote its own. Cowork finished ~10:30, Drive cron ingested it at 11:00 → second draft + second email.
- Two-layer fix shipped (`4a65d11`):
  1. **processArticle dedup** — new soft-failure stage `duplicate`. Before upserting a draft, query `studio_drafts` for any row where `frontmatter.date = today (UTC)`. If found with a different slug, return `duplicate` with the existing slug. All three callers (HMAC ingest / Drive cron / backup-writer) map `duplicate` → 200 with `skipped: true`.
  2. **Backup-writer delayed** — moved from 09:45 to 10:45 Amsterdam. Cron schedule `45 7 + 45 8` UTC → `45 8 + 45 9` UTC. Gives Cowork 105 min head start (09:00 → 10:45) vs the previous 45 min.
- Belt and braces: even if Cowork runs past 10:45, the dedup ensures only one draft + one email per day.

---

## Known limitations / future work

1. **SA can't CREATE in My Drive** — affects:
   - `_brief-<date>.md` first-time creation from the form's submit endpoint (silently fails; backup writer's Supabase fallback covers it for the article path, but Cowork on Mac-on days won't see a brief the first time it's filed)
   - **Fix options**: (a) OAuth user delegation (one-time refresh-token setup), (b) Google Apps Script proxy bound to Tarry's account, (c) live with it — backup writer's Supabase fallback means the article still gets written, just from the backup path on first-brief days
2. **Form submit doesn't surface Drive mirror failures to the user** — returns "Filed." even on mirror failure. Could be tightened.
3. **Local LaunchAgent watcher** still active — redundant with Drive cron at this point; can be unloaded for one-less-moving-part.
4. **Drive desktop sync on Mac** — when on, sometimes creates duplicate `.md ` files with trailing spaces (macOS Finder quirk during sync conflicts). Not breaking, just clutter.

---

## Env vars (Vercel, all set)

| Var | Used by |
|---|---|
| `ANTHROPIC_API_KEY` | aiFrontmatter, aiBackupWriter, other studio AI |
| `RESEND_API_KEY` | All transactional emails |
| `STUDIO_APPROVAL_EMAIL` | Override recipient (default: tarry.singh@deepkapha.com) |
| `STUDIO_APPROVAL_FROM` | Sender name + address |
| `STUDIO_INGEST_SECRET` | HMAC for LaunchAgent → /api/studio/ingest + /api/studio/alert |
| `STUDIO_APPROVAL_SECRET` | HMAC for approval tokens + brief tokens |
| `STUDIO_BRIEF_READ_TOKEN` | Bearer for Cowork's brief-fetch (deprecated after Drive pivot but kept for any future direct-HTTP consumer) |
| `STUDIO_GITHUB_TOKEN` | Octokit publish + history reads |
| `STUDIO_GITHUB_OWNER` + `STUDIO_GITHUB_REPO` | Optional overrides |
| `GOOGLE_DRIVE_SA_CLIENT_EMAIL` | SA identity |
| `GOOGLE_DRIVE_SA_PRIVATE_KEY` | SA auth |
| `GOOGLE_DRIVE_INGEST_FOLDER_ID` | `tarry-daily-blogs` folder ID |
| `CRON_SECRET` | Vercel auto-injects to all `/api/cron/*` |
| `SITE_ORIGIN` | Absolute URLs in emails (https://www.tarrysingh.com) |
| `HEARTBEAT_PING_URL` | healthchecks.io unique ping URL |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase access |

---

## Vercel crons (in `vercel.json`)

| Path | Schedule (UTC) | Purpose |
|---|---|---|
| `/api/cron/ingest-drive` | `*/15 * * * *` | Poll Drive folder for new articles, ingest to studio_drafts |
| `/api/cron/heartbeat` | `30 10 * * *` | Silent-failure detector |
| `/api/cron/daily-brief-prompt` | `0 21 * * *` + `0 22 * * *` | Evening brief-prompt email (DST-safe pair) |
| `/api/cron/backup-writer` | `45 7 * * *` + `45 8 * * *` | Mac-off backup article writer (DST-safe pair) |
