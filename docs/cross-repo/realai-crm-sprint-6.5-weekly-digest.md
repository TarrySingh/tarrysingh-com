# Cross-repo: realai-crm Sprint 6.5 — weekly digest endpoint

**Goal:** ship `GET /api/digest/this-week.json` so the realai-crm-side
**Tarrysingh Weekly Dispatches** broadcast cron has a data source to pull
the past week's blog posts from every Sunday at 09:00 UTC.

**Status:** implementation shipped on this branch (`claude/sprint-6.5-weekly-digest`).
Merge to `main` when ready — Vercel auto-deploys.

**Companion spec on the realai-crm side:**
`realai-crm/docs/crm/sprints/sprint-6.5/Sprint-6.5-Plan.md` (commit `0f47473`).

---

## What this brief covers

This is **D1** of the 4-deliverable Sprint 6.5 plan:

| # | Owner | Status |
|---|---|---|
| **D1 — `/api/digest/this-week.json`** | tarrysingh-com (this repo) | ✅ implemented on this branch |
| D2 — Weekly Dispatches broadcast cron | realai-crm | in progress |
| D3 — `CadenceStep.transactional` flag for transactional Welcome | realai-crm | ✅ shipped (commit `0c5ee4d`) |
| D4 — Deactivate Welcome Steps 2 + 3 | realai-crm | ✅ shipped (commit `0c5ee4d`) |

---

## What landed in this commit

### New file
`src/app/api/digest/this-week/route.ts` — verbatim clone of
`this-month/route.ts`, with `monthBoundsUtc` → `weekBoundsUtc`.

### Wire-protocol contract

```http
GET https://tarrysingh.com/api/digest/this-week.json

→ 200 OK
{
  "week":          "Week 20, 2026 · 11 May – 17 May",
  "weekIso":       "2026-W20",
  "publishedFrom": "2026-05-11T00:00:00.000Z",
  "publishedTo":   "2026-05-17T23:59:59.999Z",
  "posts": [
    {
      "slug":               "why-i-rebuilt-this-site-around-a-studio",
      "title":              "Why I rebuilt this site around a studio",
      "excerpt":            "After thirty years of building...",
      "url":                "https://tarrysingh.com/blog/why-i-rebuilt-this-site-around-a-studio",
      "category":           "Essays",
      "date":               "2026-05-15",
      "readingTimeMinutes": 6
    }
    /* …up to 12 posts… */
  ]
}
```

### Identical to the monthly endpoint
- Same post shape (slug / title / excerpt / url / category / date / readingTimeMinutes)
- Same `getAllPosts()` data source from `src/lib/blog/posts.ts`
- Same 1-hour edge cache (`Cache-Control: public, max-age=3600, s-maxage=3600`)
- Same `force-dynamic` runtime so the `?week=YYYY-Www` override works at request time

### Differences from the monthly endpoint
- **Bounds**: ISO 8601 week (Monday 00:00 UTC → Sunday 23:59:59.999 UTC)
- **Default**: current ISO week, calculated via the shift-to-Thursday trick (week 1 of a year contains its first Thursday)
- **Override**: `?week=YYYY-Www` instead of `?month=YYYY-MM`
- **Human label**: `Week 20, 2026 · 11 May – 17 May` instead of `May 2026`
- **Max posts per response**: 12 (same cap as monthly — unlikely to be hit weekly)

---

## Empty-week behaviour

Empty week returns `{ ..., posts: [] }`, **not 4xx**. The realai-crm cron
renders an italic "Quiet week in the studio — back next Sunday." fallback
when posts is empty. This is intentional — a quiet week is normal, not
an error.

---

## Verification

After this branch lands on main:

```bash
# Current week
curl -s https://tarrysingh.com/api/digest/this-week.json | jq .

# Specific week
curl -s 'https://tarrysingh.com/api/digest/this-week.json?week=2026-W20' | jq .

# Invalid week → 422
curl -s -w "\n%{http_code}\n" 'https://tarrysingh.com/api/digest/this-week.json?week=garbage'
# expected: {"ok":false,"error":"invalid_week_param","expected":"YYYY-Www"} 422
```

---

## Cross-repo coordination

- **realai-crm cron schedule**: `0 9 * * 0` (Sunday 09:00 UTC ≈ 11:00 Amsterdam CEST)
- **Cron env override**: realai-crm reads `TARRYSINGH_DIGEST_URL_WEEKLY` (default `https://tarrysingh.com/api/digest/this-week.json`)
- **Failure mode**: if this endpoint returns 5xx, the realai-crm cron writes a `CrmActivity` NOTE row and skips that week's send — no broken email goes out
- **No env vars to set on tarrysingh-com-zdmb side** — endpoint is public + cached

---

## Sign-off

When this branch is merged to main + the next Vercel deploy goes live, ping
the realai-crm session (or me) so we can verify the endpoint + flip the
`TARRYSINGH_DIGEST_URL_WEEKLY` env var on realai-crm production from any
stub to the real URL.
