# Sprint 3 — Studio Editor UAT results

**Status:** Stage A complete · Stage B pending Tarry-side
**Last updated:** 2026-05-13 (Stage A actuals filled in)
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

## Stage B — Editorial / browser UAT (Tarry)

| # | Step | Expected | Actual | Pass / Fail |
|---|---|---|---|---|
| B1 | Open `/studio` + log in | Drafts list page renders in studio aesthetic | *pending Tarry* | ☐ |
| B2 | Click "+ New Dispatch" | Editor opens, title focused, slug auto-derives | *pending Tarry* | ☐ |
| B3 | Type title + 100-word body with markdown shortcuts | Headings + bold + blockquote render correctly; counters update | *pending Tarry* | ☐ |
| B4 | Wait 5s for autosave | Save badge: Saving → Saved; row in Supabase | *pending Tarry* | ☐ |
| B5 | Click Preview | Side-by-side panel matches production blog rendering | *pending Tarry* | ☐ |
| B6 | AI Continue from cursor | 1–3 studio-voice paragraphs append; thinking trace > 0 chars | *pending Tarry* | ☐ |
| B7 | AI Rewrite with instruction | Selection replaced with rewritten passage | *pending Tarry* | ☐ |
| B8 | Reload the page | Editor reopens at `/studio/editor/<slug>`; draft persists | *pending Tarry* | ☐ |
| B9 | (Optional) Publish a real Dispatch | ✓ Published banner; live at `/blog/<slug>` in ~90s; RSS updated | *pending Tarry — optional* | ☐ |
| B10 | Return to /studio | Published draft removed from the list | *pending Tarry — optional* | ☐ |

### Screenshots / notes (Stage B)

*Tarry to fill in.*

---

## Follow-up issues (from Stage A)

| ID | Severity | Step | What broke | Proposed fix | Tracked in |
|---|---|---|---|---|---|
| SP3-01 | medium | Step 0 (initial) | Default model id `claude-opus-4-5-20250929` doesn't exist in SDK 0.79.0 / Anthropic API. | Switch default to `claude-opus-4-6`. Documented in `.env.example`. | Fixed in PR #7. |
| SP3-02 | high | A6 (first attempt) | Generic `ai_call_failed` returned with no upstream detail; Vercel runtime log truncated the real error past ~30 chars. | Add `STUDIO_AI_DEBUG=1` env flag that surfaces the upstream message + actual model id in the API response. Off by default. | Fixed in PR #8. |
| SP3-03 | medium | A6 (root cause) | `ANTHROPIC_API_KEY` on `tarrysingh-com-zdmb` Vercel project was the pre-rotation key; new key minted at console.anthropic.com hadn't been propagated here. | Rotate-and-propagate procedure: every key rotation in console.anthropic.com must update every Vercel project using the key in the same session. Add a row to a future operational runbook. | Future task — runbook item. |

---

## Sign-off

| Reviewer | Date | Outcome | Notes |
|---|---|---|---|
| Claude (Stage A technical) | 2026-05-13 | **PASS** | 9/9 wire-level steps green; 3 issues caught + fixed mid-flight (model id, debug surface, API key). Voice on both AI calls reads as the studio's own — confirms the system prompt is loaded and Opus 4-6 + 4K thinking is producing on-brand output. |
| Tarry Singh (Stage B editorial) | *pending* | *pending* | Awaiting Stage B in-browser run. |

Once Stage B is signed: update the Sprint 3 row in
[`dispatches-status-report.md`](./dispatches-status-report.md) from
*in progress* to *closed* and clear `STUDIO_AI_DEBUG=1` from the
Vercel project.

— *the studio · the test ran, the truth is filed.*
