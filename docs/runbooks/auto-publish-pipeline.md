# Runbook · Auto-publish pipeline

**Purpose:** turn the manual "open editor → paste → click Suggest → click Publish" loop into a self-driving pipeline. A daily article appears in `~/Documents/Claude/Projects/Tarry-Blogs/` (written by a separate Claude-Cowork scheduled task); a local LaunchAgent picks it up; the studio ingests + auto-suggests frontmatter + creates a preview; Tarry receives an email with two CTAs — *Preview in editor* or *Publish now*. One click on the latter publishes the Dispatch to `main` and the live site within ~90 s.

This runbook covers the **one-time setup** + operating modes + failure modes for the pipeline shipped in *Sprint — auto-publish pipeline*.

---

## Five-layer architecture

```
[~/Documents/Claude/Projects/Tarry-Blogs/]
            │  *.md (new file appears daily)
            ▼
1. LaunchAgent ── scripts/ingest/watch-tarry-blogs.mjs
   polls every 60 s, picks up .md, signs body, POSTs to ingest
            │
            ▼
2. POST /api/studio/ingest
   verify HMAC → parse → aiFrontmatter → upsertDraft → mint token
            │
            ▼
3. Resend ── sendApprovalEmail()
   studio-voice "preview ready" email with two CTAs
            │  Tarry clicks "Publish now"
            ▼
4. GET /api/studio/approve?token=…
   verify token → load draft → publishDispatch → deleteDraft
            │
            ▼
5. Commit on main → Vercel auto-deploy → /blog/<slug> live in ~90 s
```

---

## Required environment variables (4 new)

**On Vercel (`tarrysingh-com-zdmb`, Production + Preview + Development):**

| Var | Purpose | How to generate |
|---|---|---|
| `STUDIO_INGEST_SECRET` | HMAC shared with the local watcher | `openssl rand -hex 32` (64 hex chars) |
| `STUDIO_APPROVAL_SECRET` | HMAC for one-click email tokens | `openssl rand -hex 32` (different value from above) |
| `RESEND_API_KEY` | Direct Resend SDK key | Mint at https://resend.com → API Keys → New API Key. Independent of the CRM's Resend key. |
| `STUDIO_APPROVAL_EMAIL` *(optional)* | Recipient override | Defaults to `tarry.singh@deepkapha.com` if unset. |
| `STUDIO_APPROVAL_FROM` *(optional)* | Sender override | Defaults to `Studio · Dispatches <studio@tarrysingh.com>`. Requires `tarrysingh.com` to be verified on Resend (Domains → Add → DNS records). |

**On Tarry's Mac (in `~/.tarrysingh-watch.env`, gitignored + chmod 600):**

```bash
STUDIO_INGEST_URL=https://www.tarrysingh.com/api/studio/ingest
STUDIO_INGEST_SECRET=<paste the SAME value as on Vercel>
# optional overrides:
# STUDIO_WATCH_DIR=/Users/tarrysingh/Documents/Claude/Projects/Tarry-Blogs
# STUDIO_WATCH_INTERVAL_SECONDS=60
```

---

## Setup procedure (one-time, ~10 min)

### 1. Mint the two HMAC secrets

```bash
openssl rand -hex 32   # → copy for STUDIO_INGEST_SECRET
openssl rand -hex 32   # → copy for STUDIO_APPROVAL_SECRET
```

### 2. Add the four env vars to Vercel

Vercel → `tarrysingh-com-zdmb` → Settings → Environment Variables → New → paste each value → tick Development + Preview + Production → Save. Then redeploy (small commit or "Redeploy" in the UI).

### 3. Verify Resend sender domain

`tarrysingh.com` must be verified on Resend so the `studio@tarrysingh.com` From address is accepted. Resend dashboard → Domains → Add `tarrysingh.com` → add the SPF / DKIM / DMARC records to the DNS provider (Vercel domain settings, since the apex is hosted on Vercel) → wait for verification (5–30 min).

Until this is done, emails fall back to Resend's `onboarding@resend.dev` shared sender if you set `STUDIO_APPROVAL_FROM=Studio · Dispatches <onboarding@resend.dev>` temporarily.

### 4. Mint a Resend API key + set it on Vercel

Resend → API Keys → New → name `tarrysingh-com-studio` → scope: Sending → copy → paste as `RESEND_API_KEY` on Vercel.

### 5. Set up the local env file + LaunchAgent

```bash
# 5.1 Pull main so the runbook + plist template are local
cd ~/Documents/GitHub/tarrysingh-com
git pull origin main

# 5.2 Write the secret to a chmod-600 env file (NOT committed; gitignored)
cat > ~/.tarrysingh-watch.env <<EOF
STUDIO_INGEST_URL=https://www.tarrysingh.com/api/studio/ingest
STUDIO_INGEST_SECRET=<paste the SAME hex you set on Vercel>
EOF
chmod 600 ~/.tarrysingh-watch.env

# 5.3 Install the LaunchAgent
cp docs/runbooks/com.tarrysingh.studio.blog-watch.plist.example \
   ~/Library/LaunchAgents/com.tarrysingh.studio.blog-watch.plist
sed -i '' "s/USERNAME/$(whoami)/g" \
   ~/Library/LaunchAgents/com.tarrysingh.studio.blog-watch.plist
launchctl load ~/Library/LaunchAgents/com.tarrysingh.studio.blog-watch.plist

# 5.4 Verify it's running
launchctl list | grep blog-watch    # PID non-zero, exit status 0
tail -f ~/Library/Logs/studio-blog-watch.log
# Expect: {"ts":"…","level":"info","msg":"watcher_start","watchDir":"…","url":"…","intervalSeconds":60}
```

### 6. Smoke-test end-to-end

Drop a test article into `~/Documents/Claude/Projects/Tarry-Blogs/`:

```bash
cat > ~/Documents/Claude/Projects/Tarry-Blogs/2026-05-16_pipeline-smoke-test.md <<'EOF'
# Pipeline smoke test

*By Tarry Singh — May 16, 2026*

This is a synthetic test article for the auto-publish pipeline smoke test.
Once the pipeline picks it up and the email arrives, this becomes a real
post on /blog/pipeline-smoke-test. We'll remove it via git rm immediately
after the smoke confirms the round-trip works. The studio's voice should
survive the round-trip: Plex Serif body, Gloock heading, copper hairlines,
no SaaS slop verbs anywhere in the auto-suggested frontmatter.

If this paragraph gets to the rendered /blog page, every layer worked.
Watcher fired. Ingest route accepted the HMAC signature. Anthropic
returned a clean frontmatter suggestion. Supabase upserted the draft.
Resend delivered the email. Token verified. publishDispatch committed
the .mdx to main. Vercel deployed. /blog/<slug> renders.

If it doesn't, the log file under ~/Library/Logs/studio-blog-watch.log
tells you which layer broke.
EOF
```

Then within 60 s the watcher picks it up, the email arrives within ~30 s of that, you click *Publish now*, and within ~90 s `/blog/pipeline-smoke-test` is live. Once confirmed, `git rm content/blog/pipeline-smoke-test.mdx` + delete the source file to clean up.

---

## Operating modes

| Mode | When | What happens |
|---|---|---|
| **Idle** | No new files in watch dir | Watcher polls every 60 s, finds nothing, sleeps. ~0% CPU. |
| **Ingest** | New .md appears | Watcher detects via mtime, signs body, POSTs to `/api/studio/ingest`. ~3–15 s round-trip (AI call dominates). |
| **Approval-pending** | Email sent, awaiting Tarry's click | Draft sits in Supabase. Approval token valid for 72 h. After expiry, draft persists; publish manually via `/studio/editor/<slug>`. |
| **Publishing** | Tarry clicked *Publish now* | `/api/studio/approve` verifies token → `publishDispatch()` commits to main → draft row deleted. Returns "✓ Published" HTML page. ~3–8 s. |
| **Live** | Vercel auto-deploy complete | `/blog/<slug>` is on the production site. ~90 s after the commit on main. |

---

## Failure modes + fixes

| Symptom | Cause | Fix |
|---|---|---|
| LaunchAgent log shows `missing_env: STUDIO_INGEST_URL` | `~/.tarrysingh-watch.env` not present or unreadable | Re-create the env file per step 5.2; `chmod 600`; `launchctl kickstart -k gui/$(id -u)/com.tarrysingh.studio.blog-watch` |
| Watcher logs `ingest_failed` with `status: 401, body: { error: "bad_signature" }` | Mac's `STUDIO_INGEST_SECRET` and Vercel's value diverged (one got rotated) | Sync them. The hex MUST match exactly. |
| Watcher logs `ingest_failed` with `status: 422, body: { error: "no_h1_title" }` | Source article doesn't have `# Title` on line 1 | Update the Claude-Cowork scheduled task's template so the H1 is the first line. |
| Watcher logs `ingest_failed` with `status: 422, body: { error: "body_too_short" }` | Article body under 50 words after H1 + byline strip | Source article is too short. Adjust the template or the minimum threshold. |
| Approval email never arrives | `RESEND_API_KEY` unset OR `tarrysingh.com` sender domain not verified on Resend | Check Vercel runtime logs for `studio.email.send_error` or `studio.email.send_exception` tags. Verify domain on Resend; redeploy. |
| Email arrives, click `Publish now` → "Approval signature invalid" | `STUDIO_APPROVAL_SECRET` rotated between mint-token and verify-token | Don't rotate without redeploy + re-ingestion. Once rotated, the existing email's token is dead; re-ingest by `touch` on the source file. |
| Email arrives, click `Publish now` → "This approval link has expired" | More than 72 h passed | Publish manually via `/studio/editor/<slug>` — the draft is still in Supabase. Or `touch` the source file to trigger re-ingestion (creates a new approval email). |
| Click `Publish now` → "This Dispatch is already live" (409) | Slug already exists on main (re-publish of the same source file) | Expected if you re-touch a source file after it's been published. Delete the published .mdx via `git rm` if you want a re-publish under the same slug. |
| Watcher logs `ingest_already_exists` (409) | Watcher re-fired on a file that's already in `studio_drafts` | Expected, harmless. Watcher marks it seen and moves on. |

---

## Why this design

### Why HMAC for ingest, not Basic Auth

The LaunchAgent is unattended; embedding `STUDIO_USER`/`STUDIO_PASS` in a local env file means a leaked Mac is a leaked studio. Per-route HMAC scopes the blast radius — a leaked `STUDIO_INGEST_SECRET` can only ingest articles (not publish, not edit, not read other drafts).

### Why one-click email approval, not just "preview"

The whole point of the sprint is to remove friction. The email gives both paths: *Preview in editor* opens the studio for review, *Publish now* skips it. Tarry's choice at the moment. The 72-h TTL means a forgotten preview doesn't sit there forever.

### Why Resend direct, not proxy through realai-crm

The CRM's Resend integration handles cadence broadcasts — multi-recipient, multi-step, with enrollment tracking. This is a single transactional email per Dispatch. Different concerns. Direct Resend on tarrysingh-com is one new dep (~25 KB), one new API key, zero cross-repo coupling.

### Why 50-word body minimum

Catches the edge case where the Claude-Cowork task writes a stub file (e.g. on a quiet day) — better to surface a 422 in the watcher log than create a 30-word "Dispatch" draft that needs manual cleanup.

---

*Last reviewed: 2026-05-16 (Sprint auto-publish ship).*
