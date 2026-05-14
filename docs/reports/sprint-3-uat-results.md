# Sprint 3 — Studio Editor UAT results

**Status:** Stage A + Stage B both PASS · Sprint 3 closed
**Last updated:** 2026-05-14 (Stage B B1–B10 filled in; sign-off table closed; Sprint 3 closed)
**Parent docs:** [`sprint-3-uat-plan.md`](./sprint-3-uat-plan.md) · [`dispatches-status-report.md`](./dispatches-status-report.md)

This is the running results doc that pairs with the UAT plan. As
each step runs, the *Actual outcome* column gets filled in, the
*Pass / Fail* column gets ticked, and any follow-up issues land
at the bottom. Re-generate the `.docx` after each run via
`npm run reports:uat-results:docx`.

---

## Run identity

| Field | Value |
|---|---|
| Run date | 2026-05-13 |
| Run by | Claude (Stage A) · Tarry (Stage B pending) |
| Production commit SHA at Stage A start | `c731b25` (Sprint 2 closeout) — followed by PR #6 (Sprint 3 ship), PR #7 (model name fix), PR #8 (debug-surface). Final SHA at Stage A pass: `d486f7d`. |
| Vercel deployment id at Stage A pass | `dpl_CkAALcaiTNympuWQajQA3xSY1xCX` (production / branch main) |
| `STUDIO_AI_MODEL` env value | `claude-opus-4-6` (initially set to bogus `claude-opus-4-5-20250929`; Tarry corrected) |
| `STUDIO_AI_DEBUG` env value | `1` during Stage A (clear after Stage B closes) |

---

## Step 0 — Pre-UAT (Tarry)

| Sub-step | Expected | Actual | Pass / Fail |
|---|---|---|---|
| 0a. STUDIO_AI_MODEL env var corrected | Either unset, or set to `claude-opus-4-6` (or newer Opus). | Set to `claude-opus-4-6` (after a brief experiment with `claude-opus-4-7` which the Anthropic API didn't recognise — reverted). | ☑ |
| 0b. Vercel redeploy completes | Production build green; latest commit live. | `dpl_CkAALcaiTNympuWQajQA3xSY1xCX` READY · production · branch main. | ☑ |
| 0c. ANTHROPIC_API_KEY corrected | Active, non-rotated key set on Dev/Preview/Prod. | Tarry had rotated keys at console.anthropic.com but hadn't updated this Vercel project. Caught by Stage A — surfaced as `401 invalid x-api-key` via the `STUDIO_AI_DEBUG=1` debug response. Replaced with fresh key. | ☑ |

**Step 0 verdict:** PASS (after three small corrections — env model name, API key, debug flag for diagnosis).

---

## Stage A — Wire-level UAT

| # | Step | Expected | Actual | Pass / Fail |
|---|---|---|---|---|
| A1 | `/studio` no-auth | 401 + `WWW-Authenticate: Basic realm="Studio"` | `HTTP/2 401`, `cache-control: no-store` (auth header present). | ☑ |
| A2 | `/studio` with-auth | 200 + page renders | `200`. Page body served. | ☑ |
| A3 | `/api/studio/drafts` empty | `{ok:true, drafts:[]}` | `{"ok":true,"drafts":[]}`. (Cleaned a leftover from the earlier failed run first.) | ☑ |
| A4 | `POST /api/studio/save` UAT draft | `{ok:true, slug, savedAt}` | `{"ok":true,"slug":"uat-sprint-3-studio","savedAt":"2026-05-13T21:32:19.160Z"}`. | ☑ |
| A5 | `/api/studio/drafts` one row | `drafts.length === 1` | `count: 1, slug: uat-sprint-3-studio`. | ☑ |
| A6 | `POST /api/studio/ai/continue` | `{ok:true, output, thinking, tokens}` · `thinking.length > 0` | First run: `ai_call_failed` (bogus model). After Step 0 corrections + PR #8 debug surface: `ok:true, modelUsed:claude-opus-4-6, inputTokens:505, outputTokens:278, thinkingLen:265 chars, outputLen:1011 chars`. Voice is unmistakably studio (Plex Serif rhythm, em-dash, "rehearsal in public," "the necessary silence between measurements"). | ☑ |
| A7 | `POST /api/studio/ai/rewrite` | `{ok:true, output, thinking}` · output ≠ input | `ok:true, inputTokens:521, outputTokens:48, thinkingLen:65 chars`. Output: "The studio runs on slow craft, not output. Everything here follows from that single constraint — *remember it.*" — instruction was *"tighter; drop the hedge; keep one short italic close"* → "very, very important to remember this" became "*remember it.*". Followed the instruction precisely. | ☑ |
| A8 | Publish 409 conflict (optional) | `{ok:false, error:"slug_already_exists"}` 409 | Skipped — optional per the plan; not exercised. | N/A |
| A9 | `DELETE /api/studio/save?slug=uat-...` | `{ok:true, slug}` | `{"ok":true,"slug":"uat-sprint-3-studio"}`. | ☑ |
| A10 | `/api/studio/drafts` empty | `drafts.length === 0` | `{"ok":true,"drafts":[]}`. | ☑ |

**Stage A verdict:** 9/9 PASS · A8 skipped per plan.

### Raw outputs (Stage A)

#### A6 — AI Continue (first 700 chars of output)

> Most of what passes for volume is rehearsal in public — drafts published sideways, hoping frequency substitutes for rigour. It does not. A single paragraph, properly loaded, does more structural work than a twelve-part series that restates its thesis in every instalment. The constraint is not productivity; the constraint is knowing when the sentence is finished.
>
> Slow craft asks you to sit with the discomfort of having nothing to show for a Tuesday. The studio whiteboard stays half-empty. The commit log goes quiet. This is not waste — it is the necessary silence between measurements, the interval in which the argument either holds or collapses under its own weight.
>
> Publication is a conseque[…]

#### A7 — AI Rewrite (full output)

> The studio runs on slow craft, not output. Everything here follows from that single constraint — *remember it.*

Instruction was *"tighter; drop the hedge; keep one short italic close"*. The hedge ("very, very important to remember this") was dropped; the close was kept as a single italic phrase (*"remember it."*) — exactly the studio's one-italic-close convention.

---

## Stage B — Editorial / browser UAT (Tarry, 2026-05-14)

| # | Step | Expected | Actual | Pass / Fail |
|---|---|---|---|---|
| B1 | Open `/studio` + log in | Drafts list page renders in studio aesthetic | Drafts list page rendered as expected — cream paper, "Studio · Dispatches" mono label, Gloock "Where the next plate is on the desk" headline, gold "+ New Dispatch" pill. | ☑ |
| B2 | Click "+ New Dispatch" | Editor opens, title focused, slug auto-derives | Editor opened at `/studio/editor`; title input focused; slug + category + excerpt + body all present; AI panel below carries the corrected "Claude Opus · 4K extended thinking" label (PR #11). | ☑ |
| B3 | Type title + 100-word body with markdown shortcuts | Headings + bold + blockquote render correctly; counters update | Title shown in Gloock display; slug auto-derived from title; word + reading-time counters updated in the sticky header; markdown shortcuts (`##` → H2, `**bold**`, `> quote`) all rendered correctly inside the editor. | ☑ |
| B4 | Wait 5s for autosave | Save badge: Saving → Saved; row in Supabase | **Caught two real bugs mid-flight.** First attempt: autosave never fired (badge stayed at "Ready"). Manual Save Draft worked though. Root cause #1 — stale-closure in `triggerAutosave` → shipped fix (PR #12). Retried: autosave fired but, on a subsequent refresh, the saved body had been **erased** in Supabase. Root cause #2 — `useEffect` on `[frontmatter, slug]` triggered autosave on initial mount, before the Tiptap editor had hydrated the saved content; the silent autosave wrote `body=""` and overwrote the prior manual save. Shipped fix (PR #13): autosave now only fires from real user input (editor.update + setFm + setSlug — no mount-firing useEffect); plus a belt-and-braces guard in `save()` that no-ops a silent autosave when the body is empty on an existing draft. Final pass after re-creation: badge transitioned Ready → Saving… → Saved exactly as designed; Supabase row persisted across page refresh. | ☑ |
| B5 | Click Preview | Side-by-side panel matches production blog rendering | Side-by-side preview pane rendered correctly. Plex Serif body, Gloock heading, gold-underlined links, copper-hairline blockquote — pixel-identical to the production blog post styling. | ☑ |
| B6 | AI Continue from cursor | 1–3 studio-voice paragraphs append; thinking trace > 0 chars | AI panel transitioned to "Thinking…", returned within ~30 s, appended 1–3 paragraphs in studio voice (no SaaS slop, British English, em-dash punctuation). Thinking-trace reveal showed extended-thinking output in mono as designed. | ☑ |
| B7 | AI Rewrite with instruction | Selection replaced with rewritten passage | Selected a sentence + provided a "tighten" instruction → button → "Thinking…" → selection replaced in place with the rewritten passage. Original wording removed cleanly (no echo). | ☑ |
| B8 | Reload the page | Editor reopens at `/studio/editor/<slug>`; draft persists | After PR #13 fix, full reload landed back on `/studio/editor/<slug>` with title, body (including AI-generated content from B6/B7) and frontmatter all persisted. Save badge correctly started at "Ready" (no mount-firing autosave). | ☑ |
| B9 | (Optional) Publish a real Dispatch | ✓ Published banner; live at `/blog/<slug>` in ~90s; RSS updated | **Tarry published "Four Weeks That Bent the AI Arc"** (slug `four-weeks-that-bent-the-ai-arc`) end-to-end via the Publish button. Octokit commit landed on `main` (commit `36c3357` — `feat(blog): publish four-weeks-that-bent-the-ai-arc`). Vercel auto-deployed; `https://www.tarrysingh.com/blog/four-weeks-that-bent-the-ai-arc` → 200. RSS feed and post title both confirmed. | ☑ |
| B10 | Return to /studio | Published draft removed from the list | Drafts table at `studio_drafts` queried post-publish — `count: 0` remaining. Publish handler correctly deleted the draft row after committing to main. | ☑ |

### Side-quests caught during Stage B (all fixed mid-flight)

| Caught at | Fix | PR |
|---|---|---|
| B2 — UI labelled the AI "Claude Opus 4.7-extended" but the env was set to `claude-opus-4-6`. | Dropped the version from the label entirely; now reads "Claude Opus · 4K extended thinking". | #11 |
| B4 — autosave silently aborted (stale-closure). | Routed `save()` through a `useRef` so the debounced timer always calls the latest closure. | #12 |
| B4 — autosave wrote empty body on mount, overwriting the saved draft. | Removed the mount-firing `useEffect`; autosave now only triggers from real user input. Added a belt-and-braces guard. | #13 |
| Post-B4 — no UI way to delete a draft (only the curl-only DELETE endpoint that A9 used). | Added a trash button on each card in `/studio` with a confirm prompt; deletes via the existing endpoint. | #14 |

The cycle that took Stage B from "code shipped" to "real Dispatch live on `/blog`" ran across four fixes in under an hour. The UAT plan + results template earned their keep — every fix carries a clear "caught at <step>" trail in the commit log.

---

## Follow-up issues (from Stage A + Stage B)

| ID | Severity | Step | What broke | Proposed fix | Tracked in |
|---|---|---|---|---|---|
| SP3-01 | medium | Step 0 (initial) | Default model id `claude-opus-4-5-20250929` doesn't exist in SDK 0.79.0 / Anthropic API. | Switch default to `claude-opus-4-6`. Documented in `.env.example`. | Fixed in PR #7. |
| SP3-02 | high | A6 (first attempt) | Generic `ai_call_failed` returned with no upstream detail; Vercel runtime log truncated the real error past ~30 chars. | Add `STUDIO_AI_DEBUG=1` env flag that surfaces the upstream message + actual model id in the API response. Off by default. | Fixed in PR #8. |
| SP3-03 | medium | A6 (root cause) | `ANTHROPIC_API_KEY` on `tarrysingh-com-zdmb` Vercel project was the pre-rotation key; new key minted at console.anthropic.com hadn't been propagated here. | Rotate-and-propagate procedure: every key rotation in console.anthropic.com must update every Vercel project using the key in the same session. | Filed at `docs/runbooks/api-key-rotation.md`. |
| SP3-04 | low | B2 | UI label "Claude Opus 4.7-extended · 4K thinking" — aspirational; actual model was `claude-opus-4-6`. | Drop the version from the label entirely; new label "Claude Opus · 4K extended thinking" honest regardless of which Opus is configured. | Fixed in PR #11. |
| SP3-05 | high | B4 | Autosave never fired — stale-closure inside `triggerAutosave`. | Route `save()` through a `useRef` so the debounced timer always calls the latest closure. | Fixed in PR #12. |
| SP3-06 | critical | B4 | Autosave fired on **page mount**, before Tiptap had hydrated the saved content; empty body overwrote the prior manual save in Supabase. **Wiped a 387-word draft live.** | Remove the mount-firing `useEffect`; autosave only triggers from real user input. Plus a belt-and-braces guard: silent autosave on an existing draft with empty body is a no-op. | Fixed in PR #13. |
| SP3-07 | low | Post-B4 | No UI affordance to delete a draft — only the curl-only DELETE endpoint. | Add a trash button on each `/studio` card with confirm prompt; uses the existing endpoint. | Fixed in PR #14. |
| SP3-08 | low | post-B8 | `theme: studio` frontmatter parsed but not visually applied in the blog post template. | Wire the studio palette variant into the post template. | Filed in Sprint 4+ roadmap (Sprint 4.5). |
| SP3-09 | low | post-B8 | `tags` frontmatter parsed but not rendered on the post or blog index. | Surface tags as Plex Mono small-caps under the post header; future `/blog/tag/<tag>` index. | Filed in Sprint 4+ roadmap (Sprint 4.5). |

---

## Sign-off

| Reviewer | Date | Outcome | Notes |
|---|---|---|---|
| Claude (Stage A technical) | 2026-05-13 | **PASS** | 9/9 wire-level steps green; 3 issues caught + fixed mid-flight (model id, debug surface, API key). Voice on both AI calls reads as the studio's own — confirms the system prompt is loaded and Opus 4-6 + 4K thinking is producing on-brand output. |
| Tarry Singh (Stage B editorial) | 2026-05-14 | **PASS** | All 10 in-browser steps green (B9 + B10 exercised end-to-end via the first real Dispatch — *"Four Weeks That Bent the AI Arc"* now live at `/blog/four-weeks-that-bent-the-ai-arc`). Four fixes shipped mid-flight (PRs #11–#14: aspirational UI label dropped, autosave stale-closure fixed, autosave-on-mount overwrite fixed, trash button added) — every fix traced cleanly to the step that caught it. Sprint 3 closed. |

**Post-close housekeeping:**

- [x] Sprint 3 row in [`dispatches-status-report.md`](./dispatches-status-report.md) moved from *in progress* → *closed*.
- [ ] **Tarry:** clear `STUDIO_AI_DEBUG=1` from `tarrysingh-com-zdmb` Vercel project (Dev / Preview / Prod). Triggers automatic redeploy.

— *the studio · the test ran, the truth is filed.*
