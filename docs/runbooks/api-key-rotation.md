# Runbook · API key rotation

**Purpose:** every key rotation in a third-party provider's console
must propagate to **every Vercel project that uses the key** in the
same session. The Sprint 3 UAT (issue **SP3-03**) caught this when a
rotated `ANTHROPIC_API_KEY` worked fine in one project but broke
`tarrysingh-com-zdmb`'s Studio Editor with `401 invalid x-api-key`.

This is a checklist runbook. Read it whenever you rotate a key in
any provider console. **Run the checklist top-to-bottom in one
session** — partial rotation creates silent failures hours later.

---

## Providers + keys this site relies on

| Provider | Key env var(s) | Used by |
|---|---|---|
| Anthropic | `ANTHROPIC_API_KEY` | `/api/simulation`, `/api/studio/ai/{continue,rewrite}` |
| Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | `/api/simulation`, `/api/studio/{save,publish,drafts}` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `/api/stripe/*` |
| GitHub | `STUDIO_GITHUB_TOKEN` (fine-grained PAT) | `/api/studio/publish` |
| Mapbox | `NEXT_PUBLIC_MAPBOX_TOKEN` | `/jobs/*`, `/experiments/panoraima/*` |
| RealAI-CRM (shared HMAC secrets) | `CRM_WEBHOOK_SECRET`, `LINKEDIN_SYNDICATION_SECRET` (must match the CRM-side keys) | `/api/newsletter/subscribe`, `/api/integrations/linkedin/syndicate` |

Tarry's Vercel projects that use one or more of these keys:

- **`tarrysingh-com-zdmb`** (team `dkailab`) — the main site
- **`mklaar`** — separate project, may share Supabase
- **`realai-crm`** — the CRM, holds the matching half of the shared HMAC secrets

When a key rotates, propagate it to **every project in the list
that uses it**, not just the one you happen to be testing.

---

## Procedure (run every time you rotate)

1. **Identify the new key.** In the provider console, mint or
   reveal the new value. Don't paste it anywhere yet — copy to
   clipboard only.

2. **Identify all consumers.** Cross-reference the table above
   and `.env.example`. If a project isn't listed but might use
   the key, grep its repo:

   ```bash
   for repo in tarrysingh-com mklaar realai-crm; do
     echo "── $repo ──"
     grep -r "$KEY_NAME" "$HOME/Documents/GitHub/$repo" --include="*.env.example" --include="*.ts" --include="*.tsx" --include="*.mjs" --include="README.md" 2>/dev/null
   done
   ```

3. **Update Vercel — every project, every environment.** For each
   consuming project on Vercel:

   ```text
   Vercel → <project> → Settings → Environment Variables
     → find the key
     → Edit
     → paste the new value
     → tick Development + Preview + Production
     → Save
   ```

   Do this for **all** environments. Some keys (Supabase, Anthropic)
   are shared across all three; some (Stripe live vs. test, GitHub
   PAT scoped to repo) may differ.

4. **Redeploy.** Push a small commit or click "Redeploy" in the
   Vercel UI for each project. New env vars only take effect on
   fresh deployments.

5. **Smoke-test every consumer.** Hit one route per project that
   uses the key, in production:

   - Anthropic → `POST https://www.tarrysingh.com/api/studio/ai/continue` (set `STUDIO_AI_DEBUG=1` first; clear after).
   - Supabase → `GET https://www.tarrysingh.com/api/studio/drafts` (200 + JSON).
   - GitHub → publish a tiny test draft via the Studio Editor (then revert with a `git rm` commit).
   - Stripe → check `/api/stripe/webhook` accepts a test event.
   - CRM webhook secret → `POST` an HMAC-signed test event to `https://crm.realai.eu/api/webhooks/tarrysingh` and verify 200.

6. **Revoke the old key.** After all smoke tests pass, go back to
   the provider console and revoke the previous key. **Not before**
   — until smoke tests pass, the old key is your rollback path.

7. **Log the rotation.** Append one line to
   `docs/runbooks/_rotation-log.md` with the date, provider, and
   reason (compromise, scheduled, vendor-forced). Two-line audit
   trail beats three-month forensic archaeology.

---

## What goes wrong (and the fix)

| Symptom | Likely cause | Fix |
|---|---|---|
| `401 invalid x-api-key` on a single project | Forgot to propagate to that project. | Step 3 again for the missed project; redeploy. |
| New key works locally, fails in production | Set only on Development, not Production. | Step 3 with all three environments ticked. |
| Webhook signature mismatches between two repos | One side updated `CRM_WEBHOOK_SECRET`, the other still has the old. | Both Vercel projects must hold the same HMAC secret. Update in lock-step. |
| Vercel deploy uses the old key | The redeploy in step 4 didn't trigger or hit a cache. | "Redeploy" without "Use existing build cache" ticked. |
| Stripe webhook accepts everything (bad) | `STRIPE_WEBHOOK_SECRET` rotated but Stripe-side endpoint still points at the old secret. | Update the endpoint in Stripe dashboard → Developers → Webhooks. |

---

## SP3-03 specifically — what happened, what the fix earned us

**2026-05-13.** Tarry rotated `ANTHROPIC_API_KEY` at console.anthropic.com,
updated `mklaar` and `agentify` projects, but didn't update
`tarrysingh-com-zdmb`. Sprint 3 UAT Stage A failed at A6 (AI Continue)
with the generic `ai_call_failed`. Vercel runtime log truncated the
real message. Caught only after shipping PR #8 (the `STUDIO_AI_DEBUG=1`
debug-surface fix) which surfaced `401 invalid x-api-key` in the
response body. Fresh key pasted into `tarrysingh-com-zdmb` Dev/Preview/Prod;
redeploy; A6 → A10 all PASS.

The fix earned:

- `STUDIO_AI_DEBUG=1` flag (off by default, surfaces upstream errors on demand). Useful for every future AI-pipeline diagnosis.
- This runbook. So the next rotation doesn't repeat the same gap.
- An item in the Sprint 4+ roadmap: a one-line script that lists all consumer projects for any given env-var name, so step 2 of this procedure is automated rather than manual.

---

*Last reviewed: 2026-05-13 (Sprint 3 close).*
