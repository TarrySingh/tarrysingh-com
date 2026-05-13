# Cross-repo handover: realai-crm · Sprint 2 — cadences

**Audience:** A Claude session (or human engineer) starting fresh in
the sibling repo at `~/Documents/GitHub/realai-crm/`.

**Goal:** Ship the receiving side of three pieces, in order:

1. **The Sprint-1 P3 receiver** that hasn't landed yet — webhook at
   `/api/webhooks/tarrysingh` that auto-enrols every new subscriber
   into a "Tarrysingh Welcome" cadence.
2. **A second cadence — "Tarrysingh Monthly Roundup"** — one email
   per month rolling up that month's Dispatches.
3. **An admin tool for UAT fast-forward** — a one-shot CLI / API
   that nudges a `CadenceStepExecution.scheduledAt` to fire in ~10
   minutes, so the day-5 / day-14 emails can be UAT-tested in
   one sitting.

After all three: flip the env vars on both Vercel projects (`realai-crm` and `tarrysingh-com-zdmb`) and replay any subscribers captured in log-only mode on the tarrysingh-com side.

This brief is self-contained — read it without context from the
tarrysingh-com session.

---

## What's already shipped on the tarrysingh-com side

- `POST /api/newsletter/subscribe` builds a `LeadPayloadV1`, HMAC-SHA256-signs it with `CRM_WEBHOOK_SECRET`, and posts to `${CRM_WEBHOOK_URL}/api/webhooks/tarrysingh` with header `X-Tarrysingh-Signature: sha256=<hex>`.
- When `CRM_WEBHOOK_URL` is unset (current state), the handler logs the payload as a structured JSON line tagged `crm.lead.unconfigured_log_only` and returns 200 to the visitor.
- `POST /api/newsletter/unsubscribe` sends a `source: "unsubscribe"` event using the same signing pipeline.
- A one-click unsubscribe page at `/blog/unsubscribe?e=<email>&t=<token>` verifies an HMAC token against `CRM_UNSUBSCRIBE_TOKEN_SECRET` before firing.

**Live source on the tarrysingh-com side:** `src/lib/crm/*` and `src/app/api/newsletter/*`. Wire-protocol contract in `src/lib/crm/types.ts`.

---

## Deliverable 1 — Webhook receiver + Tarrysingh Welcome cadence

This is the existing brief at
`docs/cross-repo/realai-crm-tarrysingh-webhook.md` in the
tarrysingh-com repo. **Read that file first** — it has the full
clone-from-earthscan instructions, env vars, and three pre-written
email bodies for the Welcome cadence (Plex Serif voice, one italic
close per email, signed "T.").

Minimum acceptance:

- [ ] `POST /api/webhooks/tarrysingh` with a valid HMAC-signed `LeadPayloadV1 v1` returns 200 with `{ok: true, deduped: false, contactId, autoEnroll: {enrolled: true}}`.
- [ ] Duplicate `eventId` within 24 h → `{deduped: true}`.
- [ ] Same email, new `eventId` → `{deduped: false, autoEnroll: {reason: "already_enrolled"}}`.
- [ ] `source: "unsubscribe"` upserts `CadenceUnsubscribe` (idempotent on email).
- [ ] Three `CadenceStep` rows for "Tarrysingh Welcome" at `dayOffset = 0, 5, 14`, each with the body copy from the original handover brief.
- [ ] Bodies use the `email/templates/tarrysingh-welcome-{1,2,3}.mdx` (or equivalent in the CRM's template system) — **no SaaS gloss, no tracking pixel, no click-tracking**.

---

## Deliverable 2 — Tarrysingh Monthly Roundup cadence

New work. A second cadence in RealAI-CRM that runs on the first
Monday of each month at 09:00 CET. **One email per active
subscriber per month, summarising that month's Dispatches.**

### Shape

```
Cadence: Tarrysingh Monthly Roundup
  Schedule:       cron — 0 9 1-7 * 1   (first Monday of every month, 09:00 server TZ)
  Recipients:     all CrmContact where
                    – owner = TARRYSINGH_WEBHOOK_OWNER_USER_ID,
                    – status != ARCHIVED,
                    – not in CadenceUnsubscribe.
  Send-window:    rate-limit to 50/min so Resend doesn't tarpit.
  Body source:    GET https://tarrysingh.com/api/digest/this-month.json
                    (built as part of Sprint 2 on the tarrysingh-com side)
  Subject line:   `Dispatches · <Month> <Year> roundup`
                    (e.g. "Dispatches · June 2026 roundup")
  From:           Tarry Singh <dispatches@realai.eu>
                    (or whatever the existing welcome cadence uses)
  Reply-to:       tarry@realai.eu (real human)
  Track:          open-tracking OFF, click-tracking OFF
                    (studio voice rule — no surveillance affordances)
```

### Digest endpoint shape (built on the tarrysingh-com side, ready by the time you need it)

```http
GET https://tarrysingh.com/api/digest/this-month.json

→ 200 OK
{
  "month": "June 2026",
  "monthIso": "2026-06",
  "publishedFrom": "2026-06-01T00:00:00.000Z",
  "publishedTo":   "2026-06-30T23:59:59.999Z",
  "posts": [
    {
      "slug": "why-i-rebuilt-this-site-around-a-studio",
      "title": "Why I rebuilt this site around a studio",
      "excerpt": "After thirty years of building...",
      "url": "https://tarrysingh.com/blog/why-i-rebuilt-this-site-around-a-studio",
      "category": "Essays",
      "date": "2026-06-04",
      "readingTimeMinutes": 6
    },
    /* …up to 8 posts… */
  ]
}
```

### Body template (Plex Serif voice — copy verbatim)

```mdx
{intro}

{#each posts}
## {this.title}

{this.excerpt}

→ Read it: {this.url}
{/each}

{#if posts.length === 0}
*No new Dispatches went up this month. The studio is between
plates — back next week.*
{/if}

{closing}

— T.
```

Suggested intro/closing variations by month-count:

| posts in the month | intro                                                                 | closing                                                          |
|-------------------|------------------------------------------------------------------------|------------------------------------------------------------------|
| 0                 | "A short letter this month, because nothing new is on the wall yet." | "Back next month. The plates always catch up."                   |
| 1–2               | "A handful of Dispatches went up this month."                          | "If any of them lands, reply to this email. The list is small."  |
| 3+                | "A busier month than usual. Five Dispatches went up. Pick one."         | "If a particular thread is more useful to you than the others, reply and tell me. The list stays small enough to read every one." |

### Acceptance criteria

- [ ] Cadence published, active, scheduled cron correct (first Monday 09:00).
- [ ] Recipients list derived live (not snapshotted) from the contact table at send time, filtered against `CadenceUnsubscribe`.
- [ ] Endpoint fetch succeeds against `https://tarrysingh.com/api/digest/this-month.json`; if 5xx or empty, the cadence aborts and writes a `CrmActivity` note rather than sending broken email.
- [ ] Open-tracking and click-tracking disabled.
- [ ] `List-Unsubscribe` and `List-Unsubscribe-Post: One-Click` headers carry a valid signed unsubscribe URL (use the same secret RFC 8058 setup as the Welcome cadence).
- [ ] Test sends to **three** inboxes (one Apple Mail, one Gmail web, one Outlook web/desktop) render cleanly — no broken tables, no clipped excerpts.
- [ ] On `posts.length === 0`, the "between plates" copy fires correctly. (UAT this by clearing the test digest endpoint to return an empty array.)

---

## Deliverable 3 — UAT fast-forward admin tool

UAT for the Welcome cadence would otherwise take 14 days. Build a
**deploy-only admin tool** so Tarry (or his Claude session) can
fast-forward day-5 and day-14 sends to fire within ~10 minutes.

### Option A — small CLI script in the CRM repo

```bash
# realai-crm/scripts/admin/fast-forward-cadence.ts
ts-node scripts/admin/fast-forward-cadence.ts \
  --email uat-stage-a@tarrysingh.com \
  --cadence "Tarrysingh Welcome" \
  --steps 2,3 \
  --to-now-plus 10m
```

The script:

1. Looks up the `CrmContact` by `email`.
2. Looks up the active `CadenceEnrollment` for the named cadence.
3. Finds the `CadenceStepExecution` rows for step numbers 2 and 3.
4. Updates `scheduledAt = Date.now() + 10*60*1000`.
5. Logs the changes to a `CrmActivity` row tagged `admin.fast_forward` so the audit trail survives.

### Option B — API endpoint (admin-token gated)

```
POST https://crm.realai.eu/api/admin/cadence/fast-forward
  Headers: X-Realai-Admin-Token: <secret>
  Body: { email, cadenceName, stepNumbers: number[], offsetMinutes: number }
  → 200 { ok: true, updated: [{stepNumber, oldScheduledAt, newScheduledAt}] }
```

Option B is more convenient (no CRM-repo checkout needed) but
needs a fresh admin-token env var. Either is fine — recommend B
unless the existing CRM admin tooling already exposes step
manipulation through the UI.

**Restoration:** After UAT, restore the original `scheduledAt` by
re-running the same tool with the original offset. Document this
in the UAT log.

### Acceptance criteria

- [ ] Tool changes `scheduledAt` for arbitrary step executions.
- [ ] Audit `CrmActivity` row written for every change.
- [ ] Cron picks up the fast-forwarded execution within the next 5-minute window and dispatches via Resend.
- [ ] Original offsets restorable after UAT.

---

## Env var matrix — both Vercel projects

After Deliverable 1 + 2 + 3 are live in the CRM and tested, set
these on the corresponding Vercel project:

### `realai-crm` (project `realai-crm`, team unknown — check `.vercel/project.json`)

| Key | Value | Used by |
|---|---|---|
| `TARRYSINGH_WEBHOOK_SECRET` | `openssl rand -hex 32` | HMAC verification on `/api/webhooks/tarrysingh`. |
| `TARRYSINGH_WEBHOOK_OWNER_USER_ID` | Tarry's CRM user id | Owner for contacts created from tarrysingh.com signups. |
| `TARRYSINGH_AUTO_ENROLL_CADENCE_ID` | UUID of the "Tarrysingh Welcome" cadence | Auto-enrol target. |
| `REALAI_ADMIN_TOKEN` (if Option B above) | `openssl rand -hex 32` | Admin fast-forward endpoint. |

### `tarrysingh-com-zdmb` (team `dkailab`)

| Key | Value | Used by |
|---|---|---|
| `CRM_WEBHOOK_URL` | `https://crm.realai.eu/api/webhooks/tarrysingh` | Newsletter subscribe forward. |
| `CRM_WEBHOOK_SECRET` | **Same value as** `TARRYSINGH_WEBHOOK_SECRET` above | HMAC signing. |
| `CRM_UNSUBSCRIBE_TOKEN_SECRET` | `openssl rand -hex 32` (fresh, different from CRM_WEBHOOK_SECRET) | One-click unsubscribe token signing. |

Set on **Development**, **Preview**, and **Production**. Redeploy
the tarrysingh-com project (push any commit to main or click
"Redeploy" in Vercel) so the env change takes effect.

---

## Replay procedure — subscribers captured during the gap window

Subscribers who signed up while `CRM_WEBHOOK_URL` was unset are
logged on the tarrysingh-com Vercel project as structured JSON
lines tagged `crm.lead.unconfigured_log_only`. Replay them by hand
after the CRM receiver is live:

```bash
vercel logs --project tarrysingh-com-zdmb --since=2026-05-01 \
  | grep crm.lead.unconfigured_log_only \
  | jq .
```

For each line, post a `LeadPayloadV1` to the CRM endpoint (with
the matching HMAC signature) using a fresh `eventId` (the original
eventId may have been replayed already; using a new one is safer
since the CRM dedups on it):

```bash
curl -X POST https://crm.realai.eu/api/webhooks/tarrysingh \
  -H "Content-Type: application/json" \
  -H "X-Tarrysingh-Signature: sha256=$SIG" \
  -d "$PAYLOAD"
```

The CRM upserts by `email`, so even if the same email is replayed,
no duplicate `CrmContact` is created. The `autoEnroll` block will
report `already_enrolled` on the second hit.

---

## Out of scope for this brief

- **LinkedIn syndication receiver.** A separate brief exists at
  `docs/cross-repo/realai-crm-linkedin-syndication.md` for that;
  it's not blocking Sprint 2 acceptance.
- **Quarterly executive emails / "best of the year" cadences.**
  Future sprints.
- **Webhook signature key rotation procedure.** Documented in the
  Welcome handover brief; covered there.

---

## Sign-off

Each acceptance criterion should be marked off in the
**Dispatches launch status report** at
`tarrysingh-com/docs/reports/dispatches-status-report.md` as the
session lands them. The report is the single source of UAT truth
across both repos.
