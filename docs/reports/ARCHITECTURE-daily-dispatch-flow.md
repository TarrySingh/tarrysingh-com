# Daily Dispatch — Mac-on vs Mac-off flow

How a single article gets from "idea" to `/blog/<slug>` live, in both
operational modes. The system is designed so Mac state changes *which
path runs*, not *whether the system works*. Both modes converge on
the same Supabase draft + approval email, you click Publish from
anywhere, article goes live.

---

## Shared backbone (runs in both modes)

```
Studio · /studio/brief/<date>?token=…     (you, any device)
   │
   │  optionally type a brief Mon–Sat evening
   ▼
Supabase · studio_daily_briefs              ← canonical source of truth
   │
   ├─ best-effort PATCH _brief-<date>.md  ──► Drive folder (for Cowork to read tomorrow)
   │  (SA can modify owner-other files;
   │   CREATE silently no-ops — backup
   │   writer's Supabase fallback covers it)
   ▼
[evening ends · morning begins]
```

Vercel crons in play across both modes:

| Cron | When (UTC) | When (Amsterdam, CEST) | What it does |
|---|---|---|---|
| `/api/cron/daily-brief-prompt` | `0 21 * * *` + `0 22 * * *` | 23:00 | Sends Yes/No brief-prompt email |
| `/api/cron/ingest-drive` | `*/15 * * * *` | every 15 min | Polls Drive folder → ingests new `YYYY-MM-DD_*.md` → studio_drafts |
| `/api/cron/backup-writer` | `45 8 * * *` + `45 9 * * *` | 10:45 | Mac-off backup: generates article if no Drive article today |
| `/api/cron/heartbeat` | `30 10 * * *` | 12:30 | Silent-failure detector + healthchecks.io ping |

---

## Mode A — Mac ON (Cowork's day)

```
~09:00 Amsterdam ── Cowork (Mac) starts:
                       reads _brief-<today>.md from Drive via MCP
                       (if exists + non-empty → overrides §3 rotation)
                       runs §3 rotation otherwise
                                │
                                │ ~45–90 min research + write loop
                                ▼
~09:45–10:30 ── Cowork uploads YYYY-MM-DD_<slug>.md to Drive folder
                       (file owned by Tarry, in My Drive)
                                │
                                ▼
~10:00–10:45 ── Drive cron's 15-min tick picks up the new file
                       calls processArticle():
                       1. parseDailyArticle → slug + title + body
                       2. dedup check: any draft with frontmatter.date = today?
                                       → no → proceed
                       3. aiFrontmatter → category + excerpt + tags
                       4. upsertDraft → studio_drafts row
                       5. mint approval token, sendApprovalEmail
                                │
                                ▼
~10:01–10:46 ── Approval email lands in your inbox
                       Subject: "Preview ready · <title>"
                       Body: Publish-now CTA + Preview-in-editor CTA

~10:45 Amsterdam ── Backup writer fires
                       lists Drive folder, sees today's article exists
                       → skipped: "article_already_exists"
                       → no second email
```

What you do: open email anywhere → click **Publish now** → approve
route runs (Vercel) → Octokit commits `content/blog/<slug>.mdx` to
main → trashes Drive source + brief file → Vercel auto-deploys main →
live at `/blog/<slug>` ~90 s later.

---

## Mode B — Mac OFF (Vercel takes over)

```
~09:00 Amsterdam ── Cowork would have run, but Mac is off
                                │
                                │ silence
                                ▼
~10:45 Amsterdam ── /api/cron/backup-writer fires
                       lists Drive folder, no YYYY-MM-DD_<today>_*.md exists
                       reads brief:
                         1st: _brief-<today>.md from Drive (best-effort)
                         2nd: studio_daily_briefs.brief from Supabase
                              (fallback — covers silent Drive mirror failures)
                                │
                                ▼
~10:45–10:48 ── aiBackupWriter() runs:
                       Anthropic SDK · claude-opus-4-7 · web_search tool
                       3-5 search queries, citation-grounded research
                       writes 1,400–1,600 word article with H1 + footer
                                │
                                ▼
~10:48 ── processArticle() called directly (bypasses Drive entirely
                       because SA has no storage quota to CREATE files)
                       1. parseDailyArticle (works on the H1 we generated)
                       2. dedup check — no existing draft today
                       3. aiFrontmatter
                       4. upsertDraft
                       5. mint token, sendApprovalEmail
                                │
                                ▼
~10:48 ── Approval email lands in your inbox · ~$0.30–0.50 in API costs
```

What you do: identical to Mode A — click Publish from any device.

---

## Convergence point

After either path:

```
Approval email
   │
   ▼  click Publish
GET /api/studio/approve?token=…
   │
   ├─ verify HMAC token (72-h TTL)
   ├─ getDraft from studio_drafts
   ├─ publishDispatch() → Octokit commits content/blog/<slug>.mdx
   ├─ deleteDraft from Supabase
   ├─ deleteFilesBySlugInFolder (trash article source in Drive · PATCH trashed=true)
   └─ deleteFileByNameInFolder _brief-<today>.md (trash brief in Drive)
   │
   ▼
git push to main on Vercel · auto-deploy · ~90 s
   │
   ▼
LIVE at https://www.tarrysingh.com/blog/<slug>
```

---

## What happens in degenerate cases

| Scenario | What runs | What you see |
|---|---|---|
| Mac on + brief filed | Cowork uses brief → article → email | One email, brief-shaped article |
| Mac on + no brief | Cowork runs §3 rotation → article → email | One email, rotation article |
| Mac off + brief filed | Backup writer uses brief (Drive or Supabase) | One email, brief-shaped article |
| Mac off + no brief | Backup writer runs §3 rotation | One email, rotation article |
| Cowork races backup writer (rare, post-fix) | First writer creates draft, second hits `duplicate` dedup → skip | One email |
| All systems fail | Heartbeat at 12:30 Amsterdam emails "no Dispatch today" | Alert email instead of article email |
| Heartbeat itself dies | healthchecks.io grace window expires | External email from healthchecks.io |
| You don't click Publish | Draft sits in studio_drafts; you can publish later from /studio/editor | Article doesn't go live until you click |

---

## Decision logs — why each piece exists

**Why `_brief-<date>.md` lives in Drive at all** — because Cowork on Mac
can only read Drive via its MCP (no HTTP fetch). The Drive mirror is
the *only* way Cowork sees the brief. Backup writer doesn't need
Drive because it can read Supabase directly.

**Why backup writer bypasses Drive on the write side** — Google service
accounts have zero personal storage quota. SA can PATCH (modify)
files owned by Tarry but cannot POST (create) new ones in his My
Drive. Going straight to Supabase removes the SA dependency entirely
on the write path.

**Why backup writer fires at 10:45 Amsterdam, not 09:00** — gives
Cowork 105 minutes head start (09:00 → 10:45). Cowork's full research
+ write cycle takes 45–90 min; by 10:45 it's either done (Drive
article exists → backup writer no-ops) or genuinely not running
(Mac off → backup writer takes over).

**Why three monitoring layers** — defence in depth.
LaunchAgent alert catches "watcher tried and failed".
Heartbeat catches "nothing happened today regardless of why".
healthchecks.io catches "heartbeat itself never ran".
All three would have to die simultaneously to silence you.

**Why we keep a CHANGELOG** — git commits are granular; humans need a
single doc that says "as of <date> the wiring is X, and we landed
on this design because Y". See `docs/reports/CHANGELOG-dispatches.md`.

---

## What still needs cloud-side investigation (open thread)

**Weekly digest** — `/api/digest/this-week.json` is healthy and returns
the correct posts for any ISO week. The broadcast cadence
("Tarrysingh Weekly Dispatches") lives on the `realai-crm` repo —
Sunday 09:00 UTC. Last Sunday (2026-05-17) the cadence didn't reach
the inbox; tracked in a separate realai-crm Claude session because
that's where the cron + subscriber state + send logs live.
