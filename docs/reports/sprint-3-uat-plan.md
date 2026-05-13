# Sprint 3 — Studio Editor UAT plan

**Status:** ready · awaiting Step 0 (Tarry-side env-var update)
**Last updated:** 2026-05-13
**Parent docs:** [`dispatches-status-report.md`](./dispatches-status-report.md) · [`sprint-4-plus-roadmap.md`](./sprint-4-plus-roadmap.md)
**Test report (filled-in after the run):** [`sprint-3-uat-results.md`](./sprint-3-uat-results.md)

The Studio Editor MVP shipped on 2026-05-13 via PR #6 + PR #7 (AI
model name fix). This document is the acceptance plan that earns
the *technical-complete* sign-off on the Sprint 3 row of the main
status report. Stage A is technical and runs via curl + the
production API; Stage B is editorial and only Tarry can run it.

The voice: tight. Each step is one TL;DR line + an *Expected*
outcome. Long-form explanations live below in the **Step rationale**
section — readers who want context jump there; readers who just
want to run the test stay above.

---

## Step 0 — Pre-UAT (Tarry, before Stage A)

Update `STUDIO_AI_MODEL` env var on the `tarrysingh-com-zdmb` Vercel
project. The model id I shipped as the v1 default
(`claude-opus-4-5-20250929`) doesn't exist; the SDK 0.79.0's typed
model list goes up to `claude-opus-4-6`. Caught by the production
runtime log: `POST /api/studio/ai/continue → 502 studio.ai.continue_error`.

**Action:** Vercel → tarrysingh-com-zdmb → Settings → Environment
Variables → either:

- **Delete `STUDIO_AI_MODEL`** across Dev / Preview / Prod — the new
  default (`claude-opus-4-6`, shipped in PR #7) fires automatically; or
- **Set `STUDIO_AI_MODEL = claude-opus-4-6`** explicitly across Dev /
  Preview / Prod.

Then trigger a redeploy (push any commit, or Vercel UI "Redeploy").

**Expected:** Vercel build green within ~90 s; `/api/studio/ai/continue`
no longer returns 502.

---

## Stage A — Wire-level UAT (Claude, via curl)

Run in order; abort on the first failure.

| # | Step | Expected |
|---|------|----------|
| A1 | Confirm production carries the post-fix deploy. `curl -I https://www.tarrysingh.com/studio` (no auth). | `HTTP/2 401`, `WWW-Authenticate: Basic realm="Studio"` header present. |
| A2 | Auth-with-creds. `curl -u "studio:<PASS>" https://www.tarrysingh.com/studio`. | `200`. Body contains `Studio · Dispatches` and `Where the next plate is on the desk.` |
| A3 | Drafts list — empty state. `curl -u "studio:<PASS>" https://www.tarrysingh.com/api/studio/drafts`. | `{"ok":true,"drafts":[]}` (or contains the leftover UAT draft from earlier run; that's fine, we clean up). |
| A4 | Save a UAT draft via API. `POST /api/studio/save` with `slug=uat-sprint-3-studio`, full frontmatter, ~200-word body. | `{"ok":true,"slug":"uat-sprint-3-studio","savedAt":"<iso>"}`. |
| A5 | Drafts list — one row. `GET /api/studio/drafts`. | `drafts.length === 1`, slug + frontmatter match. |
| A6 | AI Continue. `POST /api/studio/ai/continue` with `beforeCursor` ≈ the body so far, `afterCursor=""`. | `{"ok":true,"output":"<markdown>","thinking":"<text>","inputTokens":N,"outputTokens":N}`. `output` is 1–3 paragraphs of studio-voice prose. `thinking` length > 0 (extended thinking active). |
| A7 | AI Rewrite. `POST /api/studio/ai/rewrite` with `selection="<a sentence>"` + optional `instruction`. | `{"ok":true,"output":"<rewritten>","thinking":"<text>"}`. `output` is the rewritten passage (not echoing original). |
| A8 | Publish — fail-closed when slug already exists. Update an existing live post slug to test conflict path. Skip if there's no easy target (we don't want to clutter `main`). | `{"ok":false,"error":"slug_already_exists"}` with HTTP `409`. (Optional.) |
| A9 | Delete UAT draft. `curl -X DELETE -u "studio:<PASS>" "https://www.tarrysingh.com/api/studio/save?slug=uat-sprint-3-studio"`. | `{"ok":true,"slug":"uat-sprint-3-studio"}`. |
| A10 | Drafts list — back to empty. | `drafts.length === 0`. |

Each step's actual outcome captured in `sprint-3-uat-results.md`
with pass/fail + the raw response.

---

## Stage B — Editorial / browser UAT (Tarry, in a browser)

| # | Step | Expected |
|---|------|----------|
| B1 | Open `https://www.tarrysingh.com/studio` in a desktop browser. Log in with `studio` / `<PASS>`. | Drafts list page renders. Cream-paper backdrop, Plex Mono "Studio · Dispatches" label, Gloock display title, gold-pill "+ New Dispatch" button. |
| B2 | Click "+ New Dispatch". | Editor opens at `/studio/editor`. Title input focused. Slug auto-derives as you type. Category dropdown shows Essays / Notes / Studio. |
| B3 | Type a title and a 100-word body. Use markdown shortcuts (`##`, `**`, `*`, `>`). | Headings render in Gloock. Bold/italic apply. Blockquote gets a copper hairline border. Word + reading-time counters update in the sticky header. |
| B4 | Wait 5 seconds. | Save badge in header transitions: *Saving…* → *Saved*. A row appears in the Supabase `studio_drafts` table (verify via the Supabase dashboard, or by re-loading `/studio`). |
| B5 | Click "Preview". | Side-by-side preview pane appears on the right. The rendered title, excerpt, and body match the editorial CSS of `/blog/<existing-post>` (Gloock display, Plex Serif body, gold link underline). |
| B6 | Place the cursor at the end of the body. Click "Continue from cursor". | AI panel reports "Thinking…" then "Continue from cursor" again. 1–3 paragraphs append at the cursor in studio voice (Plex Serif, British English, one italic close style). Open the "Thinking trace" reveal — 4K-budget thinking output visible in mono. |
| B7 | Select a sentence. Type a brief instruction in the rewrite input ("tighter, drop the hedge"). Click "Rewrite selection". | Selected sentence replaced with the rewritten version. Original disappears. |
| B8 | Reload the page (Cmd-R / F5). | Editor reopens at `/studio/editor/<slug>`. Title, body, frontmatter all persist. Saved-at timestamp updates. |
| B9 | (Optional, real Dispatch) Write a real short Dispatch — 300–500 words. Click "Publish". Confirm the prompt. | Header banner shows ✓ Published with the live URL + commit URL. ~90 s later, visit `https://www.tarrysingh.com/blog/<slug>` and see the post live. The post also appears in `/blog/rss.xml` (once Vercel rebuilds the static feed). |
| B10 | Return to `/studio`. | Drafts list no longer shows the published Dispatch — Supabase row deleted by the publish handler. |

Stage B's only required steps are B1–B8. B9 is the optional "first real Dispatch" step that earns full sign-off — but it's also Tarry's call whether to do that now or use the next-scheduled Dispatch from the editorial calendar.

---

## Acceptance criteria

Sprint 3 closes when:

- All of Stage A passes (A1–A10).
- All of Stage B's required steps pass (B1–B8).
- The UAT results template (`sprint-3-uat-results.md`) is filled in with actual outcomes, regenerated to `.docx`, and committed.
- The main status report's Sprint 3 row in the Sign-off table moves from *in progress* to *closed*.

If any step fails: log the actual response in the results doc, file a follow-up issue, and either fix-and-retry within the sprint or defer the failure to Sprint 4 with explicit scope notes.

---

## Step rationale (long-form, only if you want it)

### Why Step 0 first

The Anthropic SDK 0.79.0's `Model` type union doesn't include
`claude-opus-4-5-20250929`. When my code passes that to
`messages.create({ model: ... })`, the API returns a model-not-found
error, caught by the catch block in `aiContinue()` / `aiRewrite()`,
surfacing as `ai_call_failed` to the API consumer and `502` to the
client. Until the env var is corrected or cleared, every AI request
fails the same way. Hence Step 0 gates the whole UAT.

### Why Stage A precedes Stage B

Stage A verifies the wire-level contract: auth gate, persistence,
AI invocation, deletion. Pure machine signal — no human in the loop.
If anything's broken there, Stage B will fail in the browser too,
but the diagnosis is harder. Stage A catches it cheaply.

### Why Stage B has B9 as optional

Publishing a real Dispatch is the most informative test — it
exercises the entire pipeline including the Octokit commit-to-main
path, Vercel auto-deploy, RSS + sitemap refresh. But it's also a
real publish, irreversible without a follow-up `git rm` commit. The
editorial calendar already has the next planned Dispatch queued for
2026-05-16; B9 is best done at that natural moment rather than
producing a throwaway UAT-titled post.

### Why no Stage C (mobile)

Mobile-first writing UX is deferred to Sprint 6 per the
[Sprint 4+ roadmap](./sprint-4-plus-roadmap.md). The Sprint 3 MVP
is desktop-only by design.

---

## After the run — test report

Once Stages A + B complete, the test report lives in
`sprint-3-uat-results.md` (template ships alongside this plan). Fill
in the *actual outcome* column for each step, plus any
follow-up issues, and regenerate the `.docx` via
`npm run reports:uat-results:docx`. The filled-in report is the
artefact that earns the Sprint 3 sign-off in
`dispatches-status-report.md`.

— *the studio · run the test, file the truth.*
