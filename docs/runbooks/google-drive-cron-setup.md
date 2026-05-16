# Google Drive cron — setup runbook (Sprint 9.1)

This is the one-time setup Tarry runs to switch the auto-publish
pipeline from "local LaunchAgent only" to "Vercel cron polling
Google Drive" — so daily Dispatches keep flowing even when the
Mac is off, asleep, or travelling.

The cloud code is already shipped (commits `258043d`, `a3ff798`,
`b1238fe` on main). What's needed below is provisioning a Google
service account, sharing the Drive folder with it, and pasting the
credentials onto Vercel.

> **Time estimate:** ~15 min end-to-end. Most of it is clicking
> through the Google Cloud Console.

---

## Architecture recap

```
Vercel Cron (every 15 min)
    ↓
GET /api/cron/ingest-drive
  - auth: Authorization: Bearer ${CRON_SECRET}  (auto-injected by Vercel)
  - list Drive folder via service-account JWT
  - filter to YYYY-MM-DD_*.md
  - skip files whose modifiedTime ≤ studio_drive_ingest_log row
  - for each new file:
      processArticle()  →  draft + AI frontmatter + approval email
      record in studio_drive_ingest_log
    ↓
Same approval email + one-click publish as Sprint 9.
```

The local LaunchAgent stays loaded as a belt-and-braces. Both can
run; the `studio_drafts.slug` uniqueness + the `studio_drive_ingest_log`
row mean the second-mover sees "already done" and no-ops.

---

## Step 1 — Apply the Supabase migration

Open the Supabase SQL editor for the tarrysingh-com project and run
the contents of `docs/migrations/2026-05-16-studio-drive-ingest-log.sql`.
This creates the `studio_drive_ingest_log` table.

Verify with:
```sql
select count(*) from studio_drive_ingest_log;
```
Should return `0`.

---

## Step 2 — Google Cloud project + service account

1. Open https://console.cloud.google.com — sign in with the Google
   account that owns the `tarry-daily-blogs` Drive folder.
2. **Create a project** (top dropdown → "New Project"):
   - Name: `tarrysingh-com-drive-cron` (or pick anything; this is
     the GCP project that owns the service account credentials, not
     the Google Workspace).
3. **Enable the Drive API** for the project:
   - APIs & Services → Library → search "Google Drive API" → Enable.
4. **Create a service account**:
   - IAM & Admin → Service Accounts → Create service account.
   - Name: `tarrysingh-drive-poller`
   - ID: auto-fills as `tarrysingh-drive-poller`
   - Skip "Grant this service account access to project" (the SA
     doesn't need project-level roles — its only power comes from
     the Drive-folder share in Step 3).
   - Skip "Grant users access to this service account".
   - Click Done.
5. **Mint a JSON key**:
   - Open the service account → Keys tab → Add key → Create new key
     → JSON.
   - The browser downloads `tarrysingh-com-drive-cron-XXXX.json`.
   - **Keep this file private** — it's an RSA key that can read any
     Drive resource shared with the service account email.

---

## Step 3 — Share the Drive folder with the service account

1. Open the JSON file you downloaded; copy the value of `client_email`
   (looks like `tarrysingh-drive-poller@…iam.gserviceaccount.com`).
2. In the Google Drive web UI, navigate to the `tarry-daily-blogs`
   folder (https://drive.google.com/drive/folders/1NZ0GQ0_h8gItriWMLUrRkNiZV8Hlg0yC).
3. Right-click → Share.
4. Paste the service-account email into the people field.
5. Permission: **Viewer** is enough — the cron only needs read.
6. Uncheck "Notify people" (the SA can't receive email anyway).
7. Send.

---

## Step 4 — Vercel env vars

Open the DK AI Lab `tarrysingh-com-zdmb` project on Vercel
(https://vercel.com/dkailab/tarrysingh-com-zdmb/settings/environment-variables).

Add each var to **Production**, **Preview**, and **Development**:

| Var | Value |
|---|---|
| `GOOGLE_DRIVE_SA_CLIENT_EMAIL` | The `client_email` from the JSON file |
| `GOOGLE_DRIVE_SA_PRIVATE_KEY` | The `private_key` from the JSON file — paste verbatim, with the literal `\n` newlines intact. The runtime normalises both `\n` and real newlines. |
| `GOOGLE_DRIVE_INGEST_FOLDER_ID` | `1NZ0GQ0_h8gItriWMLUrRkNiZV8Hlg0yC` |
| `CRON_SECRET` | A random 32+ char hex string. Generate: `openssl rand -hex 32` |
| `SITE_ORIGIN` | `https://www.tarrysingh.com` (so email links don't fall back to *.vercel.app) |

Then **redeploy** Production (or wait for the next push). Vercel only
attaches `CRON_SECRET` to cron-triggered requests once the variable
exists at deploy time.

---

## Step 5 — Smoke test the auth + folder share

Once the redeploy is live, hit the smoke endpoint:

```bash
export CRON_SECRET="<paste value here>"
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  'https://www.tarrysingh.com/api/cron/ingest-drive?ping=1' | jq .
```

Expected response:
```json
{
  "ok": true,
  "drive": {
    "ok": true,
    "folderId": "1NZ0GQ0_h8gItriWMLUrRkNiZV8Hlg0yC",
    "visibleFiles": 5
  },
  "lastIngestedModifiedTime": null
}
```

Failure modes you might see and what they mean:

| `error` | What it means | Fix |
|---|---|---|
| `unauthorized` | Bearer mismatch | Re-paste `CRON_SECRET`, redeploy |
| `missing_env` with `var=...` | One of the SA env vars unset | Set it on Vercel + redeploy |
| `private_key_malformed` | PEM didn't parse | Re-copy the `private_key` value; check `\n` survived |
| `auth_failed` | Token endpoint refused the JWT | Usually system clock skew; retry. If persistent: SA was deleted upstream |
| `drive_request_failed` `status=404` | Folder ID typo or folder not shared with the SA | Re-share folder in Step 3 |
| `drive_request_failed` `status=403` | Drive API not enabled on the GCP project | Step 2.3 |
| `visibleFiles: 0` | Folder share didn't take | Re-do Step 3; check the SA email in the Drive share dialog |

---

## Step 6 — First real ingest

Trigger the cron manually (still GET, but no `?ping=1`):

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  'https://www.tarrysingh.com/api/cron/ingest-drive' | jq .
```

Expected: a `results` array with one entry per dated file in the
folder. Already-ingested files (via the local LaunchAgent) will show
up here too because their `file_id` isn't in the log yet — but
`processArticle` will return a parse-stage failure or an upsert
conflict via `studio_drafts.slug`. To avoid that double-email
situation on first run, you can pre-seed the log:

```sql
-- one-time pre-seed: claim every existing file_id at the current
-- modifiedTime so the cron only processes NEW files going forward.
-- Run this AFTER `?ping=1` works, BEFORE the unfiltered tick.
insert into studio_drive_ingest_log
  (file_id, filename, slug, modified_time_iso, status)
values
  ('<file_id_1>', '<filename_1>', null, '<modifiedTime_iso_1>', 'skipped'),
  ('<file_id_2>', '<filename_2>', null, '<modifiedTime_iso_2>', 'skipped');
```

The `?ping=1` response above lists `visibleFiles` so you can iterate
through them with a fuller list call (run `pageSize=20` to get them
all in one shot if you want):

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  'https://www.tarrysingh.com/api/cron/ingest-drive?ping=1'
```

(The current `?ping=1` only returns the count, not the IDs — if you
need the IDs to pre-seed, the simpler path is to skip pre-seeding
and accept that the cron's first real run will re-email any
already-published article whose draft is gone. The local LaunchAgent
has already drained the May 14 + May 15 articles, so the worst case
is one to two duplicate emails.)

---

## Step 7 — Verify the schedule fires

Vercel's cron dashboard lives at:
https://vercel.com/dkailab/tarrysingh-com-zdmb/crons

After the first deployment containing `vercel.json`, the cron
appears here with its next-fire time. Logs are in the regular
Function logs panel (filter by `/api/cron/ingest-drive`).

Successful tick log line:
```json
{"tag":"studio.cron.tick","processed":1,"ingested":1,"durationMs":18432,"sinceIso":"2026-05-16T16:22:21.000Z"}
```

---

## Step 8 — (Optional) Disable the local LaunchAgent

Once the Drive cron has run successfully for a couple of days and
Tarry's confident, the local watcher can be unloaded:

```bash
launchctl unload ~/Library/LaunchAgents/com.tarrysingh.studio.blog-watch.plist
```

Leave the plist file on disk so it's easy to re-load if the Drive
path needs investigation. Keeping both running is also fine — they
race, the loser of each article is logged as `skipped_unchanged` or
hits the `studio_drafts` slug conflict and is a no-op.

---

## Operating cost

The cron fires every 15 min = 96 ticks/day. Each tick:

- ~1 Drive API call (`files.list`) — free tier is 1 B requests/day,
  not a concern.
- For each new file: 1 download + 1 Anthropic call (Opus extended-
  thinking, ~4K input + ~512 output) + 1 Resend send.

Drive API: free. Resend: 1 transactional/day. Anthropic: ~$0.05–0.10/day
on average across the active period. Vercel cron invocations: well
within the Pro plan's included function executions.

---

## Failure modes that wake you up at 03:00

| Symptom | Likely cause | First check |
|---|---|---|
| No email for 2+ days, cron logs show `processed:0` | Cowork didn't write to Drive | Drive folder by hand |
| Email arrives but is the SAME article twice | Log row didn't commit on success | Supabase `studio_drive_ingest_log` query |
| `ai_unconfigured` 503 in cron logs | `ANTHROPIC_API_KEY` missing on Vercel | Vercel env vars panel |
| `email_send_failed` with `domain not verified` | Resend domain config regressed | Resend dashboard → `tarrysingh.com` apex verification |
| `private_key_malformed` after a working period | Vercel UI mangled the multiline value on an env-var edit | Re-paste from the JSON file |
