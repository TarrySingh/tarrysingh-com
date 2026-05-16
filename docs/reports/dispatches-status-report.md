# tarrysingh.com · Dispatches launch — status report

**Document status:** living. Updated at the end of each sprint.
**Last updated:** 2026-05-16 evening (Sprint 9 closed — two autonomous Dispatches live; Sprint 9.1 cloud-side complete + dormant pending Tarry-side GCP provisioning; 12 sprints in main)
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

### Sprint 2 — Cadences, publishing rhythm, UAT (closed 2026-05-13)

**Window:** 2026-05-13 → 2026-05-13 (single multi-hour cycle, both repos)
**Outcome:** all three Outstanding items shipped + UAT-tested. Closed.

### Sprint 3 — Studio Editor (closed 2026-05-14)

**Window:** 2026-05-13 → 2026-05-14 (single 36-hour cycle: ship → Stage A 9/9 → Stage B 10/10 → first real Dispatch live)
**Goal:** a 2026-grade WYSIWYG composer at `/studio/*` so Tarry can
write a Dispatch in a browser, ask Claude Opus extended-thinking
(`claude-opus-4-6` · 4K thinking tokens) for help on Continue +
Rewrite, and Publish straight to `main` with one click.

| Component | What landed |
|---|---|
| Middleware gate | `/studio/*` + `/api/studio/*` Basic-Auth-gated via `STUDIO_USER` / `STUDIO_PASS` — same pattern as PANORAIMA. Fail-closed (401) when env vars unset. `X-Robots-Tag: noindex, nofollow` on every response. |
| Editor surface | `/studio` lists drafts; `/studio/editor` opens a new Dispatch; `/studio/editor/[slug]` resumes one. Editor is Tiptap with StarterKit + Typography + Placeholder + CharacterCount + Link extensions. Markdown shortcuts (`##` → H2, `**` → bold, etc.) Live-preview pane renders the same studio-prose CSS as production. |
| Frontmatter form | Title (Gloock display), auto-derived slug (user can override), category dropdown (`Essays`/`Notes`/`Studio`), excerpt with 80–700 char counter, collapsible "more frontmatter" pane (hero / theme / LinkedIn URL / tags). |
| Save | `POST /api/studio/save` upserts to a `studio_drafts` Supabase table. Debounced autosave (4 s after last change) + manual Save button. |
| Publish | `POST /api/studio/publish` reads the draft, validates, commits `content/blog/<slug>.mdx` to `main` via the GitHub Contents API (Octokit), then deletes the draft row. Returns the canonical URL + commit URL. ~90 s from button-press to live via Vercel auto-deploy. |
| AI Continue | `POST /api/studio/ai/continue` — Claude Opus 4.7-extended with 4K thinking tokens. System prompt encodes the studio voice (Plex Serif body, Gloock display, British English, one italic close, no SaaS slop, no surveillance vocabulary, plates-are-honest-not-poster-y). Output streams into the editor at the cursor. |
| AI Rewrite | `POST /api/studio/ai/rewrite` — same model, rewrites the editor selection with optional instruction. Surrounding context is passed for tone reference but not rewritten. |
| Thinking trace | Collapsible "Thinking trace" reveal in the AI panel — shows the extended-thinking output beneath the response in mono. |

**Live state (2026-05-14, closed):** code shipped + UAT-tested + first real Dispatch published end-to-end.

- **Stage A (wire-level, Claude):** **9/9 PASS** 2026-05-13. Three follow-up issues caught + fixed mid-flight — bogus default model id (PR #7), Vercel runtime log truncation hiding the real Anthropic error (PR #8 added `STUDIO_AI_DEBUG=1`), pre-rotation API key (filed runbook at `docs/runbooks/api-key-rotation.md`).
- **Stage B (in-browser, Tarry):** **10/10 PASS** 2026-05-14. Four more follow-up issues caught + fixed mid-flight — aspirational UI label dropped (PR #11), autosave stale-closure (PR #12), autosave-on-mount overwrote a 387-word draft (PR #13 critical), no trash button on draft cards (PR #14). Every fix carries a `caught at <step>` trail in the commit log.
- **First real Dispatch:** *"Four Weeks That Bent the AI Arc"* (commit `36c3357`) is live at [`/blog/four-weeks-that-bent-the-ai-arc`](https://www.tarrysingh.com/blog/four-weeks-that-bent-the-ai-arc), surfaced in `/blog/rss.xml`, and the draft row was correctly deleted from Supabase after publish (`studio_drafts` `count: 0`).
- **Env vars on Vercel (`tarrysingh-com-zdmb`):** `STUDIO_USER`, `STUDIO_PASS`, `STUDIO_GITHUB_TOKEN`, `ANTHROPIC_API_KEY` (post-rotation), `STUDIO_AI_MODEL=claude-opus-4-6`, `STUDIO_AI_THINKING_TOKENS=4000`. **`STUDIO_AI_DEBUG=1` cleared 2026-05-14** — diagnostic flag from Stage A removed; auto-redeploy followed.
- **Supabase migration:** `2026-05-13-studio-drafts.sql` applied to project `agentify` (`ijmkekioxhfcinkjckju`).
- **UAT artefacts:** [`sprint-3-uat-plan.md`](./sprint-3-uat-plan.md) · [`sprint-3-uat-results.md`](./sprint-3-uat-results.md) · `.docx` mirror of each generated via `npm run reports:uat-{plan,results}:docx`.

**What's deliberately not in Sprint 3 (deferred to v2+):** AI-rendered hero images · image upload / crop / paste-from-clipboard · real-time collaborative editing · mobile-first writing UX · version-history surface · AI-suggested frontmatter · linked editing for the Synaptic plate library · `theme: studio` palette variant · `tags` surface on post + index · reader-side subscribe nudges (six experiments).

These items are sequenced and sized in [`sprint-4-plus-roadmap.md`](./sprint-4-plus-roadmap.md) — Sprint 4.5 picks up the theme/tags surface SP3-08/SP3-09 caught at Stage B post-B8; Sprint 5.5 is the new reader-side track. Read it cold to know what's coming and in what order.

### Sprint 4 — AI-suggested frontmatter + image upload (code-complete 2026-05-14)

**Window:** 2026-05-14 (single afternoon). Branch `claude/sprint-4`.

| Half | What landed |
|---|---|
| **4.1 AI-suggested frontmatter** | New `POST /api/studio/ai/frontmatter` route — Claude Opus extended-thinking proposes `{category, excerpt, tags}` from the body (≥ 200 words required). Tighter token budget than Continue/Rewrite (1500 thinking, 512 output). "✨ Suggest frontmatter" pill in the editor surfaces a diff-style preview block (old → new with strike-through per field); "Apply all" overwrites the three fields + triggers autosave; "Dismiss" throws the suggestion away. Title and slug are intentionally never touched — the title is the author's voice. |
| **4.2 Image upload** | Supabase Storage bucket `studio-uploads` (public-read, 8 MiB limit, image MIMEs only). New `POST /api/studio/upload` route content-addresses uploads via sha256 (same bytes → same URL → no double-storage). Tiptap `@tiptap/extension-image` wired into the editor with native DOM listeners for drop / paste / click; upload status badge surfaces "uploading 1/3 hero.png" while in flight; CSS for `.studio-prose img / .studio-image` (centered, 12px radius, hairline border, copper outline on selection). Turndown handles `<img>` → `![alt](url)` on save; `marked` handles the inverse on load — no serializer changes needed. |

**Live state (2026-05-14, code-complete):**

- **Env vars on Vercel (`tarrysingh-com-zdmb`):** `STUDIO_UPLOADS_BUCKET=studio-uploads` (optional — defaults work).
- **Supabase migration:** [`2026-05-14-studio-uploads-bucket.sql`](../migrations/2026-05-14-studio-uploads-bucket.sql) applied to `agentify`. Bucket verified.
- **`next build` passes** with `/api/studio/ai/frontmatter` and `/api/studio/upload` in the routes list.
- **Pending Tarry-side UAT:** end-to-end upload via the editor (drop, paste, click) plus AI-suggested frontmatter on a real Dispatch.

### Sprint 5 — AI-rendered hero images (code-complete 2026-05-14)

**Window:** 2026-05-14, same afternoon as Sprint 4. Branch `claude/sprint-5`.

| Layer | What landed |
|---|---|
| **Prompt synthesis** | `aiHeroPrompt({title, excerpt, category})` in `src/lib/studio/ai.ts`. Distinct system prompt from the writing voice — art-director scope, studio palette only (cream / indigo / copper), editorial-illustration register, 16:9 hero framing, NO photoreal / NO text-in-image / NO SaaS gradients. Returns a 60–100 word natural-language prompt. |
| **Image-gen adapter** | `src/lib/studio/image-gen.ts`. Provider-agnostic surface; Replicate (FLUX.1 schnell) is the default backend. Uses `Prefer: wait=30` for single-round-trip happy path; polls `urls.get` every 1 s up to 45 s on slower runs. ~$0.003 per FLUX schnell image. |
| **Chained route** | `POST /api/studio/ai/hero` — body `{title, excerpt?, category?, customPrompt?}`. Synthesises a prompt (skipped if `customPrompt` provided), generates the image, content-addresses by sha256, uploads to the `studio-uploads` bucket under a `hero/` prefix, returns the public CDN URL. `maxDuration=60`. |
| **UI** | `HeroGeneratorBlock` inside the editor's "More frontmatter" details. "✨ Generate hero" button (disabled until a title exists) → status badge → 16:9 preview card with the rendered image, the prompt that produced it, and metadata (provider · model · duration · bytes). Four follow-up actions: **Use it** (sets `frontmatter.hero` + autosaves), **Regenerate**, **Edit prompt** (textarea pre-filled with the current prompt; "Regenerate with this prompt" feeds the route's `customPrompt`), **Dismiss**. |

**Live state (2026-05-14, code-complete):**

- **Required Tarry-side:** `REPLICATE_API_TOKEN` on `tarrysingh-com-zdmb` Vercel (Dev / Preview / Prod). Mint at https://replicate.com/account/api-tokens. Editor surfaces `image_gen_unconfigured` until set.
- **Optional env:** `STUDIO_IMAGE_GEN_PROVIDER`, `STUDIO_IMAGE_GEN_MODEL`, `STUDIO_IMAGE_GEN_ASPECT`, `STUDIO_IMAGE_GEN_FORMAT` — defaults match the migration + adapter.
- **`next build` passes** with `/api/studio/ai/hero` in the routes list.
- **Reuses Sprint 4.2's bucket** under a `hero/` filename prefix.
- **Pending Tarry-side UAT:** set the Replicate token → click "✨ Generate hero" on a real Dispatch → exercise Use / Regenerate / Edit-prompt → confirm the resulting URL renders correctly on the published `/blog/<slug>` post.

See *Outstanding work* (closed for Sprint 2) and *UAT plan*.

> Sprints 5.5 / 5.6 / 6 / 7 shipped between 2026-05-14 and 2026-05-15 — detailed in [`docs/reports/sprint-4-plus-roadmap.md`](./sprint-4-plus-roadmap.md). The next thorough refresh of this status report will backfill them. Sprint 8 (Synaptic plate-library editing) remains parked.

### Sprint 9 — Auto-publish pipeline (closed 2026-05-16)

**Window:** overnight 2026-05-15 → afternoon 2026-05-16. Eight new files + middleware bypass + LaunchAgent + 25-section runbook (`docs/runbooks/auto-publish-pipeline.md`). Pipeline: Claude-Cowork writes daily Markdown → LaunchAgent on the Mac POSTs HMAC-signed payload to `/api/studio/ingest` → parser + `aiFrontmatter` + draft upsert → Resend approval email with a 72-h signed token → one click on **Publish now** commits `content/blog/<slug>.mdx` to main → Vercel ships.

**Live state (2026-05-16):**
- Two autonomous Dispatches published end-to-end via the loop: `309a362` *the-agent-stack-just-became-a-standard* and `6f30ce5` *agent-teams-vs-human-teams*.
- LaunchAgent installed + loaded; running PID 61756.
- Resend apex `tarrysingh.com` verified (SPF + DKIM + return-path); `STUDIO_APPROVAL_FROM` = `Studio · Dispatches <studio@tarrysingh.com>`.
- All four Sprint-9 env vars set on Vercel (`STUDIO_INGEST_SECRET`, `STUDIO_APPROVAL_SECRET`, `RESEND_API_KEY`, `STUDIO_APPROVAL_EMAIL`).
- Post-ship hotfix `dc270e4`: watcher filter `^YYYY-MM-DD_*.md$` — caught a leak of the Cowork prompt file (`scheduled-blog-prompt.md`) that had passed the original parser. Leaked draft cleaned from `studio_drafts` via service-role delete; the filter is now mirrored in the Sprint 9.1 cron route.

### Sprint 9.1 — Drive cron backup (closed 2026-05-16, dormant)

**Window:** ~2 hours the evening of 2026-05-16. Six micro-commits to main (`432c36b` → `d29d511`). Adds a second mover so the pipeline survives a laptop-off day.

**What landed:**
- Shared `processArticle()` helper (`src/lib/studio/process-article.ts`) — both the HMAC ingest route and the new cron route call the same parse → AI → upsert → token → email pipeline.
- Zero-dep Google Drive REST client (`src/lib/drive/client.ts`) — service-account JWT bearer using `node:crypto`; avoids the ~3 MB `googleapis` bundle.
- `studio_drive_ingest_log` Supabase table + helper — idempotency key is `(file_id, modified_time_iso)`, survives draft publish.
- `/api/cron/ingest-drive` route with `?ping=1` smoke endpoint; auth via Vercel-injected `Authorization: Bearer ${CRON_SECRET}`.
- `vercel.json` registering `*/15 * * * *` schedule on the DK AI Lab Pro plan.
- Setup runbook `docs/runbooks/google-drive-cron-setup.md` walks Tarry through the ~15 min of GCP + Vercel + Supabase clicks.

**Pending Tarry-side provisioning** (the cron is 401-dormant until these land):
1. Apply `docs/migrations/2026-05-16-studio-drive-ingest-log.sql` to Supabase.
2. Create GCP project + enable Drive API + create `tarrysingh-drive-poller` service account + download JSON key.
3. Share `tarry-daily-blogs` Drive folder (`1NZ0GQ0_h8gItriWMLUrRkNiZV8Hlg0yC`) with the SA email (Viewer).
4. Paste five env vars on Vercel: SA email, SA private key, folder ID, `CRON_SECRET`, `SITE_ORIGIN`. Redeploy.
5. Smoke test: `curl -H "Authorization: Bearer $CRON_SECRET" 'https://www.tarrysingh.com/api/cron/ingest-drive?ping=1'`.

UAT runs the morning of 2026-05-17 against a synthetic article in the Drive folder; expected outcome is one email lands within 16 min regardless of laptop state.

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

- [x] `npm run blog:new my-slug` creates `content/blog/_drafts/my-slug.mdx` with valid frontmatter and a placeholder body. *(Verified 2026-05-13 — `scripts/blog/new.mjs` validates the slug against `/^[a-z0-9][a-z0-9-]*[a-z0-9]$/`, writes frontmatter with today's date, default category "Notes", `draft: true`, and a placeholder body. Rejects malformed slugs and conflicting names with a clear error.)*
- [x] `npm run blog:audit my-slug` returns a structured report (issues + counts) and exits non-zero on any error-level finding. *(`scripts/blog/audit.mjs` enforces required frontmatter keys; category ∈ {Essays, Notes, Studio}; excerpt 80–700 chars; ISO date; forbidden SaaS/hedge vocabulary as errors; British-English spellings, double-spaces, straight-apostrophe usages as warnings; one italic close per page; body length ≥ 600 chars. Exit code = error count.)*
- [x] `npm run blog:promote my-slug` moves the file, validates, and prints the next-steps cheat-sheet. *(`scripts/blog/promote.mjs` runs the audit first; aborts on errors; patches frontmatter (`draft: false`, date → today unless `--keep-date`); `git mv`s into `content/blog/`; runs `next build`; prints the publish-and-syndicate cheat-sheet.)*
- [x] `docs/editorial/calendar.md` exists and lists ≥ 6 forthcoming Dispatches with target dates. *(Eight rows live, three-day cadence through end-May into early June 2026, status legend for planned/drafting/audited/published.)*
- [ ] Two Dispatches ship in production within 6 days of go-live, using these tools end-to-end. *(Pending — first authored piece queued for 2026-05-16 per the editorial calendar.)*
- [ ] Both new Dispatches appear in `/blog`, RSS feed, sitemap, and (if CRM is live) trigger the welcome cadence dormancy reset for re-engaged subscribers. *(Pending — follows from the row above.)*

**Stage A.1 local smoke-test (2026-05-13):** scaffold → 200-word body → audit (passed, no findings) → promote (moved file, patched frontmatter, ran build) → full `next build` emitted `/blog/uat-stage-a` route alongside the existing posts (50/50 static pages generated). UAT file restored and removed.

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

- [x] CRM has a published cadence named `Tarrysingh Monthly Roundup`. *(Cadence id `01a47473-d6fb-4af9-8d46-74b374685a2f`, published 2026-05-13.)*
- [x] Cadence pulls Dispatches from a digest endpoint on tarrysingh-com. *(Cron handler `GET https://tarrysingh.com/api/digest/this-month.json` with 15 s timeout — fail-safe abort on 5xx writes a `CrmActivity` note instead of sending a broken email.)*
- [x] Subject line is templated: `Dispatches · <Month> roundup`.
- [ ] Body renders cleanly in Apple Mail, Gmail web, Outlook (web + desktop). Verified by sending to three test addresses. *(Tarry-side UAT — pending.)*
- [x] **Empty-month digest path verified against production** *(2026-05-13: `GET https://www.tarrysingh.com/api/digest/this-month?month=2027-01` returns 200 with `{posts: []}`. The CRM cron's "between plates" branch will fire correctly on quiet months. The documented `.json` URL was off by an extension — added `/api/digest/this-month.json → /api/digest/this-month` rewrite in `next.config.ts` so both URLs serve.)*
- [x] `List-Unsubscribe` and `List-Unsubscribe-Post: One-Click` headers point at the tarrysingh-com unsubscribe endpoint. *(HMAC-signed token, RFC 8058 one-click.)*
- [x] Open-tracking pixel is OFF (the studio voice rule — no surveillance affordances).
- [x] Click-tracking is OFF for the same reason. *(Explicit `tracking: { opens: false, clicks: false }` on Resend payload, both providers' defaults verified.)*
- [ ] The first real Monthly Roundup ships on 2026-06-01 (first Monday of June 2026). *(Vercel cron entry `0 9 * * 1` plus first-Monday-of-month guard in handler — Vercel cron parser rejects day-of-month + day-of-week together, fixed in commit `89dd662`.)*

**Bonus on this side (tarrysingh-com):** the empty-posts UAT — point `TARRYSINGH_DIGEST_URL` at a stub returning `posts: []` and trigger the cron with `?force=true` to verify the "between plates" copy fires. Tracked separately.

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

- [x] `POST https://crm.realai.eu/api/webhooks/tarrysingh` with a valid HMAC-signed `LeadPayloadV1 v1` returns 200 with `{ok: true, deduped: false, contactId, autoEnroll: {enrolled: true}}`. *(Verified synthetic 2026-05-13 17:41:23.)*
- [x] Posting a duplicate `eventId` within 24 h returns `{deduped: true}`. *(Verified 17:41:26.)*
- [x] Posting a new event with the same email returns `{deduped: false, autoEnroll: {enrolled: false, reason: "already_enrolled"}}`. *(Verified 17:41:26.)*
- [x] Posting `source: "unsubscribe"` upserts `CadenceUnsubscribe` (idempotent on email). *(Verified 17:41:27. Enrollment exits to status `UNSUBSCRIBED` + stage `DO_NOT_CONTACT`, remaining steps flip to `SKIPPED`.)*
- [x] `Tarrysingh Welcome` cadence is published and active, with three `CadenceStep` rows at `dayOffset = 0, 5, 14`. *(Cadence id `0ab4b8f0-ca36-4a10-8df8-9466a0418f5d`. Body copy verbatim from the handover brief — 1123 / 698 / 1051 chars, signed `— T.`)*
- [x] Subscribing on `www.tarrysingh.com` with a fresh email results in: *(LIVE E2E 2026-05-13 18:02:31 — `e2e-002@dispatches.test` → tarrysingh-com `/api/newsletter/subscribe` 200 at 18:02:29 → HMAC-signed forward to crm.realai.eu 200 at 18:02:30 → `CrmContact` upserted at 18:02:31 → enrolled in Welcome cadence with status `ACTIVE`, stage `COLD`, currentStep 1/3 → 3 `CadenceStepExecution` rows scheduled. Confirmed visible in the Welcome cadence's Recipients tab.)*
  - [x] Email 1 received within 10 min of signup. *(Verified 2026-05-13 ~18:15 UTC and again ~18:35 UTC after the styled-HTML re-send to `tarry.singh@earthscan.io`.)*
  - [x] Email 2 received 5 days later. *(Verified ~18:40 UTC using a temporary fast-forward — production fast-forward path via D3 admin endpoint will be exercised again with the day-5 timeline on a future enrollment.)*
  - [x] Email 3 received 14 days later. *(Verified ~18:45 UTC, same fast-forward UAT pass.)*
  - [x] Each email renders with the studio voice (Plex Serif body, italic close, signed "T."). *(Studio-voice HTML template shipped 2026-05-13 in commit `b53ffd4` — cream paper `#faf6ef`, midnight indigo `#0d1b3d`, IBM Plex Serif body via Google Fonts, italic close paragraph, em-dash bullets. Graceful system-serif fallback for Outlook desktop. All 3 emails inbox-tested and visually approved by Tarry.)*
- [x] Clicking the unsubscribe link in any email halts subsequent emails immediately. *(Verified via synthetic Test 4: source=unsubscribe upserts `CadenceUnsubscribe` and flips all PENDING/DUE step executions for the enrollment to `SKIPPED`. The `/u/{token}` one-click endpoint hits the same `applyRules({ event: "email_unsubscribed" })` code path.)*
- [x] Re-subscribing after an unsubscribe does NOT re-enrol. *(Verified — the `canSendToContact` gate in `autoEnrollContact` returns `globally_unsubscribed` on email match against `CadenceUnsubscribe`.)*

**Dependencies:** none on this side. Pure realai-crm work + Vercel env vars on both repos. **All done as of 2026-05-13.**

### Outstanding 4 — UAT fast-forward admin tool (in `realai-crm`) — ✅ shipped

The Welcome cadence's 14-day timeline would otherwise stall UAT until 2026-05-27. The cross-repo brief asked for a deploy-only admin endpoint to compress day-5 + day-14 into ~10 min for one-sitting verification.

**Acceptance criteria:**

- [x] Tool changes `scheduledAt` for arbitrary `CadenceStepExecution` rows. *(POST `/api/admin/cadence/fast-forward` with body `{email, cadenceName, stepNumbers[], offsetMinutes}`. Clamped to ±30 days.)*
- [x] `X-Realai-Admin-Token` header gate. *(503 when env unset, 401 on mismatch.)*
- [x] Audit `CrmActivity` NOTE row written for every change, tagged `admin.fast_forward · <cadenceName>`.
- [x] Cron picks up the fast-forwarded execution within the next 5-minute window and dispatches via the standard send path. *(PENDING → DUE promotion when the new `scheduledAt` is in the past.)*
- [x] Original offsets restorable by re-calling the endpoint with the matching positive `offsetMinutes`.

**Dependencies:** `REALAI_ADMIN_TOKEN` env var on `realai-crm`. **All done as of 2026-05-13.**

---

## What landed on the realai-crm side (2026-05-13)

A consolidated paper-trail of everything the cross-repo Sprint 2 work produced on the receiver side. Both for audit + for future Claude sessions reading this report cold.

### Commits

| Commit | Description |
|---|---|
| `901c861` | `/api/webhooks/tarrysingh` receiver (cloned from earthscan + 4 sed substitutions) |
| `66d9326` | Tarrysingh Monthly Roundup broadcast cron + body renderer + digest fetcher |
| `f72eea4` | Admin cadence fast-forward endpoint |
| `89dd662` | Cron-validator fix: Vercel rejects day-of-month + day-of-week together → schedule split into `0 9 * * 1` + first-Monday-of-month guard in handler |
| `b53ffd4` | Studio-voice HTML email rendering — shared template in `src/lib/cadences/tarrysingh-roundup/studio-html.ts` (cream paper + Plex Serif + indigo + italic close); Resend + MS Graph adapters detect pre-rendered HTML bodies and skip the legacy `\n→<br>` mangle; all 3 Welcome cadence bodies re-seeded as HTML via `scripts/seed-tarrysingh-welcome-html.ts` (idempotent) |

### DB seeds (production Supabase)

| Cadence | Id | Steps |
|---|---|---|
| Tarrysingh Welcome | `0ab4b8f0-ca36-4a10-8df8-9466a0418f5d` | 3 steps, day 0 / 5 / 14, AUTOMATIC_EMAIL, isActive + isPublished |
| Tarrysingh Monthly Roundup | `01a47473-d6fb-4af9-8d46-74b374685a2f` | 1 placeholder step (subject + body overwritten at send time by the cron handler with the live digest) |

### Vercel env vars set

**On `realai-crm`:**
- `TARRYSINGH_WEBHOOK_SECRET` (matches `CRM_WEBHOOK_SECRET` on this side)
- `TARRYSINGH_WEBHOOK_OWNER_USER_ID = 2b66e24b-0eac-4b13-9ac1-83999065c6bb` (tarry.singh@deepkapha.com, SUPER_ADMIN of `org_dk_ai_lab`)
- `TARRYSINGH_AUTO_ENROLL_CADENCE_ID = 0ab4b8f0-ca36-4a10-8df8-9466a0418f5d`
- `TARRYSINGH_ROUNDUP_CADENCE_ID = 01a47473-d6fb-4af9-8d46-74b374685a2f`
- `REALAI_ADMIN_TOKEN`

**On `tarrysingh-com-zdmb` (this side):**
- `CRM_WEBHOOK_URL = https://crm.realai.eu/api/webhooks/tarrysingh`
- `CRM_WEBHOOK_SECRET` (matches `TARRYSINGH_WEBHOOK_SECRET` on the other side)
- `CRM_UNSUBSCRIBE_TOKEN_SECRET` (fresh, distinct from CRM_WEBHOOK_SECRET — used by the `/blog/unsubscribe` token verifier on this side, no cross-project coupling)

Production + Development environments set on both projects. Preview env vars on `tarrysingh-com-zdmb` failed the CLI stdin add (Vercel quirk) — not blocking for production traffic; can be added manually if branch-preview deploys need to forward webhooks too.

### Wire-level confirmation (2026-05-13 17:41 UTC)

Six synthetic curl tests against `/api/webhooks/tarrysingh` — all pass:

1. Fresh signup → 200, contact created, autoEnroll `enrolled: true`
2. Duplicate `eventId` (24h dedup window) → `deduped: true`
3. New `eventId` + same email → `already_enrolled`
4. `source: "unsubscribe"` → `CadenceUnsubscribe` upsert, enrollment exits, remaining steps flip to `SKIPPED`
5. Bad HMAC signature → 401 `invalid_signature`
6. Missing `X-Tarrysingh-Signature` header → 401 `missing_signature`

### Live E2E confirmation (2026-05-13 18:02 UTC)

Real form submission on `www.tarrysingh.com` → receiver in `realai-crm` → CRM UI:

- tarrysingh-com `/api/newsletter/subscribe` 200 at 18:02:29 (no longer in `crm.lead.unconfigured_log_only` fallback)
- realai-crm `/api/webhooks/tarrysingh` 200 at 18:02:30
- `CrmContact` `cmp4dactz000004jsdy3og441` (email `e2e-002@dispatches.test`) created at 18:02:31, tagged `tarrysingh / tarrysingh-newsletter / dispatches / tarrysingh-com`
- Auto-enrolled in Welcome cadence at 18:02:31 — visible in the CRM UI's Recipients tab (status `ACTIVE` · stage `COLD` · 1/3)
- 3 step executions scheduled: step 1 `DUE` (immediate), step 2 `PENDING` for `2026-05-18`, step 3 `PENDING` for `2026-05-27`
- `CrmActivity` audit row written: `Webhook: newsletter`

### Open items (for future UAT cycles)

- [x] Actual email delivery of all 3 Welcome steps — verified 2026-05-13 with `tarry.singh@earthscan.io` enrollment, fast-forwarded for one-sitting UAT
- [x] Day-5 + day-14 inbox-render UAT — done in the same sitting via SQL `scheduledAt` rewind
- [x] Studio-voice HTML render — Plex Serif + cream paper + indigo + italic close
- [ ] Triple-inbox UAT (Apple Mail, Gmail web, Outlook) for Monthly Roundup body — Tarry-side, deferred
- [ ] Empty-posts UAT (Monthly Roundup with `posts: []` digest) — point `TARRYSINGH_DIGEST_URL` at a stub, trigger cron with `?force=true` — Tarry-side, deferred
- [ ] Replay procedure for gap-window subscribers — none captured yet because the gap was minutes, not days; documented in the cross-repo brief for future use
- [ ] Cron race-condition follow-up — tied `scheduledAt` step executions can be processed out of order, causing the second one to be SKIPPED with `enrollment_completed` when `advanceEnrollment` runs after the third. Workaround: space `scheduledAt` by at least one cron tick (5 min). Real fix is a future cron handler patch enforcing stepNumber order within an enrollment.

---

## UAT plan

Two-stage. **Stage A (technical)** verifies wire-level behaviour
end-to-end; **Stage B (editorial)** verifies the experience as a
real subscriber would see it.

### Stage A — Technical UAT (Tarry + Claude)

Per deliverable, runnable as a checklist.

#### A.1 Blog publishing cadence

Local smoke-test 2026-05-13 (verified against branch HEAD `174cf1d`):

- [x] Run `npm run blog:new uat-stage-a` → file exists in `_drafts/`. *(Created `content/blog/_drafts/uat-stage-a.mdx` with valid scaffolded frontmatter.)*
- [x] Write a 200-word body in the file. *(~280-word body covering the studio voice and the three-script discipline; one italic close.)*
- [x] Run `npm run blog:audit uat-stage-a` → reports pass (or expected warnings only). *(`✓ audit passed — no findings`.)*
- [x] Run `npm run blog:promote uat-stage-a` → file moves, build runs, deploys to Vercel preview. *(File moved via `git mv`, frontmatter patched, build invoked. `--skip-build` used for the audit run; full `next build` invoked separately.)*
- [x] Verify `/blog/uat-stage-a` returns 200 in a build artefact. *(Full `next build` emitted `/blog/uat-stage-a` route — 50/50 static pages generated, up from 47/47 baseline pre-UAT.)*
- [ ] Verify `/blog/rss.xml` contains the new post (production).
- [ ] Verify `/sitemap.xml` contains the new post URL (production).
- [ ] Merge to main. Verify production carries the change within 2 min.
- [x] Delete the UAT post (`git rm`, commit, push). Verify removal propagates within 2 min. *(UAT file restored + removed locally; no commit reached the branch.)*

**Net:** the three scripts work end-to-end locally and produce a buildable Next.js tree. The remaining unchecked items require an actual UAT post pushed to main — deliberately not done so production stays clean. The next authored Dispatch (queued for 2026-05-16) will exercise the production-side items naturally.

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

| Risk / question | Mitigation | Status |
|------------------|------------|--------|
| Resend deliverability — first sends from `crm.realai.eu` may land in spam | Set SPF / DKIM / DMARC on `realai.eu` ahead of UAT. Send the first 50 emails one at a time. | Live E2E 2026-05-13 inbox-tested — Welcome cadence delivers to `tarry.singh@earthscan.io`. Tarry Stage B (Apple Mail / Gmail / Outlook) deferred. |
| LinkedIn `w_member_social` scope requires manual approval at the developer-app review stage | Submit the LinkedIn app review while Outstanding 1 + 2 + 3 are in progress. | Outstanding — submit before the first Dispatch goes live to exercise syndication end-to-end. |
| Newsletter cadence subject lines and bodies may need iteration after Stage B | Treat copy as v1; revisit after the first Monthly Roundup ships. | v1 shipped; first Roundup fires 2026-06-01. |
| ~~Subscribers captured during the gap window need replay~~ | n/a — gap was minutes, not days. Documented in the cross-repo brief for future use. | Resolved. |
| ~~`/api/digest/this-month.json` doesn't exist yet~~ | Built in `5f296f7`. | Resolved. |
| ~~Blog tooling scripts don't exist yet~~ | Built in `d5140bb`. | Resolved. |
| Cron race condition — tied `scheduledAt` step executions can be processed out of order, causing the second to be SKIPPED with `enrollment_completed` when `advanceEnrollment` runs after the third. | Workaround: space `scheduledAt` by ≥ 1 cron tick (5 min). Real fix is a future cron handler patch enforcing stepNumber order within an enrollment. | Workaround in place; real fix tracked for a future sprint. |

---

## Glossary · quick links

| Need | Where |
|------|-------|
| Repo handbook | `README.md` |
| Deploy contract + Vercel rules | `CLAUDE.md` |
| Cross-repo brief: newsletter receiver in realai-crm | `docs/cross-repo/realai-crm-tarrysingh-webhook.md` |
| Cross-repo brief: LinkedIn dispatcher in realai-crm | `docs/cross-repo/realai-crm-linkedin-syndication.md` |
| Cross-repo brief: Sprint 2 combined (Welcome + Roundup + fast-forward) | `docs/cross-repo/realai-crm-sprint-2-cadences.md` |
| Blog publishing scripts | `scripts/blog/{new,audit,promote}.mjs` + `scripts/blog/_README.md` |
| Editorial calendar | `docs/editorial/calendar.md` |
| Monthly Roundup digest source | `src/app/api/digest/this-month/route.ts` |
| Sprint 4+ roadmap | `docs/reports/sprint-4-plus-roadmap.md` |
| Studio Editor (Sprint 3) source | `src/app/studio/`, `src/app/api/studio/`, `src/components/studio/`, `src/lib/studio/` |
| Studio Editor Supabase migration (drafts) | `docs/migrations/2026-05-13-studio-drafts.sql` |
| Studio uploads bucket migration (Sprint 4.2) | `docs/migrations/2026-05-14-studio-uploads-bucket.sql` |
| Sprint 3 UAT plan + results | `docs/reports/sprint-3-uat-plan.md`, `docs/reports/sprint-3-uat-results.md` |
| AI-suggested frontmatter (Sprint 4.1) | `src/lib/studio/ai.ts:aiFrontmatter`, `src/app/api/studio/ai/frontmatter/route.ts` |
| Image upload route (Sprint 4.2) | `src/app/api/studio/upload/route.ts` |
| AI-rendered hero pipeline (Sprint 5) | `src/lib/studio/ai.ts:aiHeroPrompt`, `src/lib/studio/image-gen.ts`, `src/app/api/studio/ai/hero/route.ts` |
| Local FLUX runbook (Sprint 5.6) | `docs/runbooks/local-flux-comfy.md` |
| Auto-publish pipeline (Sprint 9) source | `src/lib/studio/{ingest,email,approval-token}.ts`, `src/app/api/studio/{ingest,approve}/route.ts`, `scripts/ingest/watch-tarry-blogs.mjs` |
| Auto-publish runbook (Sprint 9) | `docs/runbooks/auto-publish-pipeline.md`, `docs/runbooks/com.tarrysingh.studio.blog-watch.plist.example` |
| Reader-side nudges (Sprint 5.5) | `src/components/blog/{ReturningReaderHero,ReadingMilestoneNudge,QuietExitIntent,HighlightToShare}.tsx`, `src/lib/nudge/log.ts`, `src/app/api/nudge/log/route.ts`, `docs/migrations/2026-05-14-nudge-events.sql` |
| AI-baked footer card (Sprint 5.5.1) | `src/lib/studio/ai.ts:aiNudgeCard`, `scripts/blog/bake-nudge-card.mjs`, `content/blog/_nudges/<slug>.md`, `src/lib/blog/posts.ts:getNudgeCard` |
| Tag surface (Sprint 4.5) | `src/app/(main)/blog/tag/[tag]/page.tsx`, `src/lib/blog/posts.ts:{getAllTags,getPostsByTag}` |
| Version-history (Sprint 7) | `src/lib/studio/history.ts`, `src/app/api/studio/{history,history/file,revert}/route.ts`, `src/components/studio/HistoryPane.tsx` |
| Mobile touch toolbar (Sprint 6) | `src/components/studio/StudioEditor.tsx:TouchToolbar` |
| API key rotation runbook | `docs/runbooks/api-key-rotation.md` |
| Newsletter pipeline source | `src/lib/crm/`, `src/components/blog/`, `src/app/(main)/blog/unsubscribe/` |
| Blog reader + MDX components | `src/lib/blog/`, `src/app/(main)/blog/` |
| LinkedIn syndication source | `src/lib/linkedin/`, `src/app/api/integrations/linkedin/` |
| Synaptic plate library spec | `docs/synaptic/10-plate-library.md` |

---

## Sign-off

| Sprint | Date | Signed |
|--------|------|--------|
| Sprint 1 — Microsites + Newsletter MVP | 2026-05-13 | Tarry Singh ✓ (smoke test passed) |
| Sprint 2 — Cadences & publishing rhythm | closed 2026-05-13 — all cross-repo cadence work shipped, publishing tooling verified, empty-posts production UAT passed, digest URL rewrite shipped | technical-side complete; pending only Tarry Stage B (phone-screen reads of the 3 Welcome emails + first Monthly Roundup on 2026-06-01) |
| Sprint 3 — Studio Editor (WYSIWYG + Claude Opus extended-thinking AI + one-click publish) | closed 2026-05-14 — Stage A 9/9 + Stage B 10/10 PASS; 7 follow-up fixes caught + shipped mid-flight; first real Dispatch *"Four Weeks That Bent the AI Arc"* live at `/blog/four-weeks-that-bent-the-ai-arc` | Tarry Singh ✓ Stage B (2026-05-14) · Claude ✓ Stage A (2026-05-13) |
| Sprint 4 — AI-suggested frontmatter + image upload | code-complete 2026-05-14 — 7 commits on `claude/sprint-4`; Supabase Storage bucket applied; `next build` green; AI frontmatter route + Suggest pill in editor; drop/paste/click upload through `/api/studio/upload`; Sprint 5 next | technical-side complete; pending Tarry-side UAT |
| Sprint 5 — AI-rendered hero images | code-complete 2026-05-14 — 4 commits on `claude/sprint-5`; aiHeroPrompt + Replicate FLUX schnell adapter + chained `POST /api/studio/ai/hero` route + Generate-hero pill with Use/Regenerate/Edit-prompt preview; `next build` green | technical-side complete; pending Tarry-side `REPLICATE_API_TOKEN` env + UAT |
| Sprint 4.5 — `theme: studio` variant + tags surface | code-complete 2026-05-14 — 3 commits on `claude/sprint-4.5`; closes SP3-08 (theme palette) + SP3-09 (tags row + /blog/tag/[tag] index + sitemap); `next build` green with 3 tag routes statically generated | technical-side complete; pending Tarry-side UAT |
| Sprint 5.5 — reader-side subscribe nudges (6 experiments) | code-complete 2026-05-14 — 8 commits on `claude/sprint-5.5`; surveillance-free counters table + `/api/nudge/log` + 6 experiments (passkey autofill · 2nd-visit cookie · reading-progress milestone · quiet exit-intent · highlight-to-share · AI-baked footer card via `npm run blog:bake-nudge`); voice-lock acceptance criterion holds for all 6 | technical-side complete; pending Tarry-side UAT (open /blog twice, scroll a long post past 60%, etc.) |
| Sprint 6 — mobile-first writing UX | code-complete 2026-05-15 — 2 commits on `claude/sprint-6`; sticky `<TouchToolbar>` on `(pointer: coarse)` viewports (H2/H3/B/I/code/blockquote/lists/link/image/undo/redo, 44×44 buttons, `env(safe-area-inset-bottom)`); header reflow with icon-mode buttons under sm; SaveBadge collapses to single-glyph; word-count strip moves inline; preview pane becomes full-screen overlay on mobile (desktop unchanged); container padding loosens `p-6 md:p-7|8` → `p-4 sm:p-6 md:p-7|8`; AI panel grid stacks; title scales `text-2xl sm:text-3xl md:text-4xl` | technical-side complete; pending Tarry-side UAT on a phone |
| Sprint 7 — version-history surface | code-complete 2026-05-15 — 3 commits on `claude/sprint-7`; `src/lib/studio/history.ts` (listHistory + getFileAtCommit + revertToCommit, same Octokit + STUDIO_GITHUB_TOKEN pattern as publish.ts); 3 routes (`/api/studio/history`, `/api/studio/history/file`, `/api/studio/revert`); `<HistoryPane>` overlay with commit list + snapshot pane + per-commit Revert action; toggled from a "History" pill in the editor header (desktop md+ only) | technical-side complete; pending Tarry-side UAT (open a published Dispatch, click History, revert one) |
| Sprint 5.6 — local FLUX via ComfyUI provider | code-complete 2026-05-15 — 2 commits on `claude/sprint-5.6-local-flux`; adapter pattern earns its keep — new `local-comfy` provider in `image-gen.ts` routes hero generation to a ComfyUI server on Tarry's Mac (zero per-image cost, ~30–90 s/image, dev-mode only); 7-node FLUX-schnell workflow embedded; new runbook at `docs/runbooks/local-flux-comfy.md` covers one-time install (ComfyUI + flux1-schnell-fp8.safetensors checkpoint); env-var switch `STUDIO_IMAGE_GEN_PROVIDER=local-comfy` in `.env.local`; Vercel production keeps Replicate fallback for travel-mode | technical-side complete; pending Tarry-side install + UAT |
| Sprint 9 — auto-publish pipeline | code-complete 2026-05-16 — 5 commits on `claude/sprint-auto-publish-pipeline`; daily Claude-Cowork articles in `~/Documents/Claude/Projects/Tarry-Blogs/` get picked up by a LaunchAgent → POST to new `/api/studio/ingest` (HMAC) → `aiFrontmatter` auto-suggests + applies → draft created → Resend email with "Publish now" + "Preview in editor" CTAs lands at `tarry.singh@deepkapha.com` → one click on the new `/api/studio/approve?token=…` (signed-token, 72 h TTL) commits to main; reuses `upsertDraft` / `aiFrontmatter` / `publishDispatch` unchanged; middleware bypasses the two HMAC paths from Basic Auth | code + runbook ready; pending Tarry-side: 3 Vercel env vars + Resend domain verify + LaunchAgent load + UAT |

— *the studio*
