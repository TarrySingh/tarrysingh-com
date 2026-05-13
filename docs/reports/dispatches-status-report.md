# tarrysingh.com · Dispatches launch — status report

**Document status:** living. Updated at the end of each sprint.
**Last updated:** 2026-05-13
**Editor of record:** Tarry Singh · maintained by Claude Code sessions
**Repo:** [github.com/TarrySingh/tarrysingh-com](https://github.com/TarrySingh/tarrysingh-com)

---

## Executive summary

In a single multi-day sprint (S1) we shipped a complete editorial
microsite layer on top of the existing tarrysingh.com:

- **Synaptic Cartography** studio — interactive plates, partner
  spreads, proposal deep-dives, atmospheric backdrop, persistent
  back-to-home pill, museum-grade 404s.
- **Dispatches** — an MDX blog at `/blog`, RSS feed, sitemap,
  editorial type system (Gloock + IBM Plex Serif + IBM Plex Mono),
  Shiki-highlighted code, automatic heading anchors, two seed posts.
- **Newsletter pipeline** — McKinsey-style DISPATCHES static card
  + bottom-right Peek slide-up across the entire main site,
  HMAC-signed bridge to RealAI-CRM, fail-safe log-only fallback,
  one-click unsubscribe page with RFC 8058 List-Unsubscribe-Post
  compatibility.
- **Permanent redirects** from legacy `/symphony` and `/memphis`
  to `/synaptic/*` (sub-paths preserved).
- **LinkedIn syndication API** (admin-gated) on this side, with a
  500-line cross-repo handover brief for the realai-crm receiver.
- **Canonical README** — 412-line studio handbook replacing the
  create-next-app boilerplate.

**All routes pass an end-to-end production smoke test on
`www.tarrysingh.com`.** Newsletter and LinkedIn API endpoints fail
closed (503 + log-only) until the corresponding receivers in
`realai-crm` are deployed.

**What's not yet live:**

1. The RealAI-CRM **Tarrysingh Welcome cadence** (3 emails over 14 days, queued for every new subscriber).
2. A **Monthly Roundup cadence** — one email per month to all subscribers, summarising recent posts.
3. A **blog publishing cadence** — discipline + tooling so a new post ships every ~3 days.
4. End-to-end **UAT** of the three above, against real subscribers.

This report tracks all of the above as the sprint sequence
continues.

---

## Sprint history

### Sprint 1 — Microsites + Newsletter MVP

**Window:** late April → 2026-05-13
**Outcome:** all P1–P4 surfaces shipped to production. README + cross-repo briefs filed.

| Phase | What landed | Production state |
|------|--------------|------------------|
| P1 — Blog (Dispatches) plumbing | MDX + Shiki + gray-matter + reading-time deps; blog lib (posts.ts, mdx-components.tsx, shiki.ts); `/blog`, `/blog/[slug]`, `/blog/rss.xml`; two seed posts; `Dispatches` link in Navbar + Footer; sitemap + robots | Live |
| P2 — McKinsey-style CTA | `NewsletterCard` (wide + compact), `NewsletterFooter` wrapper, `NewsletterPeek` slide-up at 60 % page-scroll; mounted on home, blog, every experiment, jobs | Live |
| P3 — RealAI-CRM bridge (tarrysingh-com side) | HMAC-SHA256 client lib (`src/lib/crm/*`); `/api/newsletter/subscribe` and `/api/newsletter/unsubscribe` with fail-safe log-only fallback; `/blog/unsubscribe` editorial confirmation page; `.env.example` keys; cross-repo handover brief at `docs/cross-repo/realai-crm-tarrysingh-webhook.md` | Live (log-only) |
| P4 — LinkedIn syndication (tarrysingh-com side) | `src/lib/linkedin/{types,syndicate}.ts`; `/api/integrations/linkedin/{syndicate,preview}` admin-gated routes; cross-repo handover brief at `docs/cross-repo/realai-crm-linkedin-syndication.md` | Live (log-only) |
| Polish | Editorial McKinsey 404 + studio-palette 404 with catch-all; permanent redirects `/symphony` + `/memphis` → `/synaptic/*`; ESLint flat-config FlatCompat fix; next-mdx-remote 5 → 6 CVE bump; tailwind ESM-import fix | Live |
| Docs | Canonical README rewrite; sprint reports under `docs/reports/`; cross-repo briefs under `docs/cross-repo/` | Live |

**Commits to main:** ~30 micro-commits via two rebase-merged PRs (#2, #3). Production URL behaves consistently with local + preview builds.

### Sprint 2 — Cadences, publishing rhythm, UAT (in progress)

**Window:** 2026-05-13 → TBD
**Goal:** the three outstanding work items below, each acceptance-criteria-driven.

See *Outstanding work* and *UAT plan*.

---

## Production state — confirmed by smoke test

Verified 2026-05-13 against `www.tarrysingh.com`:

| Surface | Behaviour | Status |
|---------|-----------|--------|
| `/symphony` → `/synaptic/symphony` (308) | redirect, sub-paths preserved | ✅ |
| `/memphis` → `/synaptic/memphis` (308) | redirect, sub-paths preserved | ✅ |
| `/`, `/about`, `/experiments`, `/synaptic`, `/synaptic/symphony`, `/synaptic/memphis`, `/blog`, `/jobs` | 200 | ✅ 8/8 |
| `/blog/why-i-rebuilt-this-site-around-a-studio` | 200, full MDX render | ✅ |
| `/blog/notes-on-drawing-a-chip-that-sleeps` | 200, full MDX render | ✅ |
| `/blog/rss.xml` | 200, valid RSS 2.0 XML, both seed posts present | ✅ |
| `/sitemap.xml`, `/robots.txt` | 200, valid XML/TXT | ✅ |
| `/blog/unsubscribe` (no params) | 200, editorial fallback card | ✅ |
| `/this-page-doesnt-exist` | 404 + cream-paper editorial "*This plate has wandered.*" | ✅ |
| `/synaptic/missing-plate` | 404 + midnight indigo "*This plate is not currently hung.*" | ✅ |
| `POST /api/newsletter/subscribe` (good email) | 200 + `{outcome: "logged"}` (CRM URL unset) | ✅ |
| `POST /api/newsletter/subscribe` (bad email) | 422 `invalid_email` | ✅ |
| `GET /api/newsletter/subscribe` | 405 method_not_allowed | ✅ |
| `POST /api/newsletter/unsubscribe` (secret unset) | 503 `unsubscribe_unconfigured` (fail closed) | ✅ |
| `POST /api/integrations/linkedin/preview` (no admin token) | 503 `syndication_unconfigured` (fail closed) | ✅ |

**Visual verification (manual, by Tarry):** redirect + blog content
confirmed in browser. 404 colour split confirmed (cream main / blue
synaptic). Static newsletter card confirmed visible on home + blog.
Peek confirmed working after scroll on long-form pages.

---

## Outstanding work — Sprint 2

Three deliverables, each with hard acceptance criteria, each
UAT-tested before sign-off.

### Outstanding 1 — Blog publishing cadence (target: one post every 3 days)

**What this is.** Not a hard cron — a discipline + tooling layer
that makes shipping a Dispatch every three days the path of least
resistance.

**What needs to exist:**

1. **A drafts directory** — `content/blog/_drafts/<slug>.mdx`,
   git-ignored from the live tree, served only in dev. The post
   lives here while it's being written.

2. **A small `npm run blog:new <slug>` script** — scaffolds the
   frontmatter (title, today's date, default category, empty
   excerpt and body) so the author doesn't fight YAML every time.

3. **A `npm run blog:promote <slug>` script** — moves the file
   from `_drafts/` to `content/blog/`, validates frontmatter,
   bumps the date to today, runs `npm run build`, and (if a CRM
   webhook + LinkedIn syndication URL are set) prints the curl
   command to fire the syndicate endpoint manually after the
   Vercel build is live.

4. **A `npm run blog:audit <slug>` script** — runs the
   `content-audit` skill checks programmatically (voice
   consistency, British English, forbidden-words list, citation
   hygiene, one italic close per page). Output a pass/fail report.

5. **A short editorial calendar** in `docs/editorial/calendar.md`
   listing the next 6–8 Dispatches by slug + working title +
   target ship date. Updated whenever a piece moves status.

6. **Optional: a GitHub Action** that on every push to main with
   a new file under `content/blog/*.mdx`, fires the LinkedIn
   syndication endpoint with the admin token (deploy-scoped).

**Acceptance criteria:**

- [ ] `npm run blog:new my-slug` creates `content/blog/_drafts/my-slug.mdx` with valid frontmatter and a placeholder body.
- [ ] `npm run blog:audit my-slug` returns a structured report (issues + counts) and exits non-zero on any error-level finding.
- [ ] `npm run blog:promote my-slug` moves the file, validates, and prints the next-steps cheat-sheet.
- [ ] `docs/editorial/calendar.md` exists and lists ≥ 6 forthcoming Dispatches with target dates.
- [ ] Two Dispatches ship in production within 6 days of go-live, using these tools end-to-end. (One every three days.)
- [ ] Both new Dispatches appear in `/blog`, RSS feed, sitemap, and (if CRM is live) trigger the welcome cadence dormancy reset for re-engaged subscribers.

**Dependencies:** none. Can ship without CRM being live.

### Outstanding 2 — Monthly Roundup cadence (in `realai-crm`)

**What this is.** A second cadence in RealAI-CRM (alongside the
existing "Tarrysingh Welcome" 3-email sequence). One email per
month to every active subscriber, summarising the Dispatches
published that month.

**Shape of the cadence:**

- **Trigger:** monthly, the first Monday of each month at 09:00 CET.
- **Recipients:** every `CrmContact` enrolled in the `Tarrysingh
  Welcome` cadence whose `CadenceUnsubscribe` is null.
- **Body:** opening line + 2–4 Dispatch summaries (each =
  Gloock-style title + Plex Serif excerpt + read-more link) +
  closing italic + List-Unsubscribe footer.
- **Generation:** the CRM fetches `https://tarrysingh.com/blog/rss.xml`
  (or, better, a future `/api/digest/this-month.json` endpoint on
  tarrysingh-com that returns a clean JSON digest), renders the
  email through a templating step in RealAI-CRM, and dispatches
  via Resend.

**Acceptance criteria:**

- [ ] CRM has a published cadence named `Tarrysingh Monthly Roundup`.
- [ ] Cadence pulls the last 30 days of Dispatches from a digest endpoint on tarrysingh-com (build a `/api/digest/this-month.json` route here as part of this work).
- [ ] Subject line is templated: `Dispatches · <Month> roundup` (e.g. `Dispatches · May 2026 roundup`).
- [ ] Body renders cleanly in Apple Mail, Gmail web, Outlook (web + desktop). Verified by sending to three test addresses.
- [ ] `List-Unsubscribe` and `List-Unsubscribe-Post: One-Click` headers point at the tarrysingh-com unsubscribe endpoint.
- [ ] Open-tracking pixel is OFF (the studio voice rule — no surveillance affordances).
- [ ] Click-tracking is OFF for the same reason. (Resend can do both — we choose neither.)
- [ ] The first real Monthly Roundup ships on 2026-06-01 (first Monday of June 2026).

**Dependencies:**

- The `Tarrysingh Welcome` cadence (Outstanding 3) must exist first — the Monthly Roundup recipients list is derived from its enrollment.
- A `/api/digest/this-month.json` endpoint on tarrysingh-com — small new route that returns the same data RSS does, in JSON shape.

### Outstanding 3 — `Tarrysingh Welcome` cadence in `realai-crm` + auto-enrol on subscribe

**What this is.** The end of the Sprint-1 P3 work. The tarrysingh-com
side already POSTs HMAC-signed `LeadPayloadV1` events to
`https://crm.realai.eu/api/webhooks/tarrysingh`. That receiver
doesn't exist yet. This deliverable stands it up + builds the
3-email cadence that the receiver auto-enrols every new subscriber
into.

**Shape:** documented in full at
`docs/cross-repo/realai-crm-tarrysingh-webhook.md`:

1. Clone `realai-crm/src/app/api/webhooks/earthscan/route.ts` →
   `tarrysingh/route.ts` (three sed substitutions).
2. Set three env vars on the `realai-crm` Vercel project:
   `TARRYSINGH_WEBHOOK_SECRET`,
   `TARRYSINGH_WEBHOOK_OWNER_USER_ID`,
   `TARRYSINGH_AUTO_ENROLL_CADENCE_ID`.
3. Build the `Tarrysingh Welcome` cadence in the CRM UI — three
   steps over 14 days, body copy already written in the handover
   brief (Plex-Serif voice, one italic close per email, signed
   "T.").

**Acceptance criteria:**

- [ ] `POST https://crm.realai.eu/api/webhooks/tarrysingh` with a valid HMAC-signed `LeadPayloadV1 v1` returns 200 with `{ok: true, deduped: false, contactId, autoEnroll: {enrolled: true}}`.
- [ ] Posting a duplicate `eventId` within 24 h returns `{deduped: true}`.
- [ ] Posting a new event with the same email returns `{deduped: false, autoEnroll: {enrolled: false, reason: "already_enrolled"}}`.
- [ ] Posting `source: "unsubscribe"` upserts `CadenceUnsubscribe` (idempotent on email).
- [ ] `Tarrysingh Welcome` cadence is published and active, with three `CadenceStep` rows at `dayOffset = 0, 5, 14`.
- [ ] Subscribing on `www.tarrysingh.com` with a fresh email results in:
  - Email 1 received within 10 min of signup.
  - Email 2 received 5 days later.
  - Email 3 received 14 days later.
  - Each email renders with the studio voice (Plex Serif body, italic close, signed "T.").
- [ ] Clicking the unsubscribe link in any email halts subsequent emails immediately (verified by checking that the next scheduled `CadenceStepExecution` flips to `SKIPPED_UNSUBSCRIBED`).
- [ ] Re-subscribing after an unsubscribe does NOT re-enrol unless the user explicitly opts in again. (The CRM check is `globally_unsubscribed`.)

**Dependencies:** none on this side. Pure realai-crm work +
Vercel env vars on both repos.

---

## UAT plan

Two-stage. **Stage A (technical)** verifies wire-level behaviour
end-to-end; **Stage B (editorial)** verifies the experience as a
real subscriber would see it.

### Stage A — Technical UAT (Tarry + Claude)

Per deliverable, runnable as a checklist.

#### A.1 Blog publishing cadence

- [ ] Run `npm run blog:new uat-stage-a` → file exists in `_drafts/`.
- [ ] Write a 200-word body in the file.
- [ ] Run `npm run blog:audit uat-stage-a` → reports pass (or expected warnings only).
- [ ] Run `npm run blog:promote uat-stage-a` → file moves, build runs, deploys to Vercel preview.
- [ ] Verify `/blog/uat-stage-a` returns 200 in preview.
- [ ] Verify `/blog/rss.xml` contains the new post.
- [ ] Verify `/sitemap.xml` contains the new post URL.
- [ ] Merge to main. Verify production carries the change within 2 min.
- [ ] Delete the UAT post (`git rm`, commit, push). Verify removal propagates within 2 min.

#### A.2 Monthly Roundup cadence

- [ ] Implement the `/api/digest/this-month.json` endpoint on tarrysingh-com.
- [ ] Verify response shape against a documented schema.
- [ ] Build the cadence in realai-crm UI; verify it renders the email body from the digest correctly using three sample dispatch slugs.
- [ ] Send the cadence to three test inboxes (Apple Mail, Gmail web, Outlook).
- [ ] Confirm `List-Unsubscribe` header carries a valid token.
- [ ] Confirm the unsubscribe link halts the cadence for that recipient.

#### A.3 Tarrysingh Welcome cadence

- [ ] Build out the realai-crm side per the handover brief.
- [ ] Set env vars on both Vercel projects.
- [ ] Subscribe with a fresh test email on `www.tarrysingh.com`.
- [ ] Verify email 1 arrives within 10 min.
- [ ] Confirm `CrmContact` row exists in CRM with correct tags + source.
- [ ] Verify email 2 arrives at day-5.
- [ ] Verify email 3 arrives at day-14.
- [ ] Click unsubscribe in email 2; verify email 3 does NOT arrive.
- [ ] Re-subscribe; verify the contact is upserted but NOT re-enrolled (because `CadenceUnsubscribe` exists).
- [ ] Manually clear the unsubscribe row in CRM; subscribe again; verify enrolment fires.

### Stage B — Editorial UAT (Tarry alone)

- [ ] Read all three welcome emails on a phone screen. Each must read as one human voice, not a SaaS funnel.
- [ ] Read the first Monthly Roundup on a phone screen. The 4 dispatch summaries must render with the right typographic rhythm — Plex Serif body, italic close, no broken lines.
- [ ] Subscribe with your own personal address on a fresh device. Verify the welcome arrives in the inbox (not spam/promotions tab).
- [ ] Open the welcome on Outlook desktop. Verify the body renders without weird table-rendering artefacts.

---

## Risks & open questions

| Risk / question | Mitigation |
|------------------|------------|
| Resend deliverability — first sends from `crm.realai.eu` may land in spam | Set SPF / DKIM / DMARC on `realai.eu` ahead of UAT. Send the first 50 emails one at a time. |
| LinkedIn `w_member_social` scope requires manual approval at the developer-app review stage | Submit the LinkedIn app review while Outstanding 1 + 2 + 3 are in progress. |
| Newsletter cadence subject lines and bodies may need iteration after Stage B | Treat copy as v1; revisit after the first Monthly Roundup ships. |
| Subscribers captured during the gap window (CRM not yet live) need replay | Greppable in Vercel runtime logs by `crm.lead.unconfigured_log_only`. Replay procedure documented in handover brief. |
| `/api/digest/this-month.json` doesn't exist yet — required for Outstanding 2 | Build as part of Outstanding 2. Tracked in the editorial calendar. |
| The blog tooling scripts (`blog:new`, `blog:promote`, `blog:audit`) don't exist yet — required for Outstanding 1 | Build as part of Outstanding 1. |

---

## Glossary · quick links

| Need | Where |
|------|-------|
| Repo handbook | `README.md` |
| Deploy contract + Vercel rules | `CLAUDE.md` |
| Cross-repo brief: newsletter receiver in realai-crm | `docs/cross-repo/realai-crm-tarrysingh-webhook.md` |
| Cross-repo brief: LinkedIn dispatcher in realai-crm | `docs/cross-repo/realai-crm-linkedin-syndication.md` |
| Newsletter pipeline source | `src/lib/crm/`, `src/components/blog/`, `src/app/(main)/blog/unsubscribe/` |
| Blog reader + MDX components | `src/lib/blog/`, `src/app/(main)/blog/` |
| LinkedIn syndication source | `src/lib/linkedin/`, `src/app/api/integrations/linkedin/` |
| Synaptic plate library spec | `docs/synaptic/10-plate-library.md` |

---

## Sign-off

| Sprint | Date | Signed |
|--------|------|--------|
| Sprint 1 — Microsites + Newsletter MVP | 2026-05-13 | Tarry Singh ✓ (smoke test passed) |
| Sprint 2 — Cadences & publishing rhythm | pending | — |

— *the studio*
