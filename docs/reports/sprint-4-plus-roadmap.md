# Sprint 4+ roadmap — Studio Editor v2 and beyond

**Status:** planning · maintained alongside the main status report
**Last updated:** 2026-05-14 (Sprint 3 closed; Sprint 4.5 + Sprint 5.5 added — theme/tags surface, reader-side subscribe nudges)
**Parent doc:** [`dispatches-status-report.md`](./dispatches-status-report.md)
**Repo:** [github.com/TarrySingh/tarrysingh-com](https://github.com/TarrySingh/tarrysingh-com)

Sprint 3 shipped a Studio Editor MVP that earns its keep on day one:
a Tiptap-based composer behind Basic Auth, Claude Opus extended-thinking
(`claude-opus-4-6` · 4K thinking tokens) on Continue + Rewrite,
one-click Publish-to-main via Octokit. Seven core features were
deliberately deferred to keep the MVP honest; Stage B UAT then
surfaced two small frontmatter-surface gaps (theme · tags) plus a
new reader-side track (subscribe-nudges). This document plans them
out in execution order.

The voice of the planning: short. Each item gets four short
paragraphs — *what*, *shape*, *estimate*, *dependencies*. No
roadmap-deck slop.

---

## Sequence at a glance

| Sprint | Deliverable | Weight | Why this order |
|---|---|---|---|
| **Sprint 4** | AI-suggested frontmatter · Image upload (Supabase Storage) | ~3 days | Both are small + standalone; image upload unblocks Sprint 5. |
| **Sprint 4.5** | Frontmatter surface — `theme: studio` palette variant · `tags` row under post header · `/blog/tag/<tag>` index | ~1 day | Tiny finish-the-job pass: both fields are *parsed* already (SP3-08, SP3-09 in the UAT results); only the rendering is missing. Drop in before image work to keep voice momentum. |
| **Sprint 5** | AI-rendered hero images | ~4 days | Depends on image upload (Sprint 4). High creative leverage per Dispatch. |
| **Sprint 5.5** | Reader-side subscribe nudges (writer-track #1) — six experiments | ~2–3 days | Independent of Studio Editor work. First reader-side track in the backlog — earns the studio its subscribers without surveillance affordances. Pairs naturally with the Sprint 4.5 tags surface for tag-aware nudges. |
| **Sprint 6** | Mobile-first writing UX | ~3 days | Independent. The first long flight or train write-session forces it. |
| **Sprint 7** | Version-history surface | ~3 days | Independent. Reads from git via Octokit. Becomes valuable once 10+ Dispatches exist. |
| **Sprint 8** | Linked editing for the Synaptic plate library | ~5–7 days | The largest lift. Plates are hand-coded SVG components; "edit copy in the studio" needs a shape contract per plate. |
| **Sprint 9+ (defer)** | Real-time collaborative editing | ~5 days | Single-user editor — multiplayer is not on the critical path. Revisit only if a guest writer joins. |

What follows is the per-item breakdown.

---

## Sprint 4 — AI-suggested frontmatter + Image upload

### 4.1 AI-suggested frontmatter

**What.** After the body has 200+ words, a "Suggest frontmatter"
button asks Claude to propose `category`, `excerpt`, and `tags`
from the prose. The author accepts, edits, or rejects each
suggestion. Removes the most-skipped step in publishing.

**Shape.** New AI route `POST /api/studio/ai/frontmatter` that
takes `{title, body}` and returns
`{category: "Essays|Notes|Studio", excerpt: string, tags: string[]}`
through the existing `aiContinue()` / `aiRewrite()` plumbing in
`src/lib/studio/ai.ts`. Uses a tighter system prompt that mandates
JSON output (`response_format`-style instruction, no schema
validation needed for v1). The editor surfaces a "Suggest"
button next to each frontmatter field; one click overwrites with
diff-highlight; another click accepts. Token budget: 1500
thinking, 512 output.

**Estimate.** Half a day. Mostly a new API route + three small UI
buttons in `FrontmatterForm`.

**Dependencies.** None. Builds on Sprint 3's AI plumbing
unchanged.

### 4.2 Image upload (Supabase Storage)

**What.** Drag-and-drop, paste-from-clipboard, or click-to-pick
an image in the editor. The image uploads to Supabase Storage,
returns a CDN URL, and inserts as a Markdown image at the
cursor. The published `.mdx` references the CDN URL.

**Shape.** Use the existing Supabase project (we already have it
in `src/lib/supabase/server.ts`). New bucket: `studio-uploads`
(public-read, write-via-service-role). New route
`POST /api/studio/upload` that:
1. Reads the multipart body (Next 15 supports `req.formData()`),
2. Validates: ≤ 8 MB; image/* MIME types; PNG / JPG / WebP / SVG;
3. Generates a content-addressed filename: `<sha256>-<original-name>.<ext>`,
4. Uploads via `supabase.storage.from("studio-uploads").upload(...)`,
5. Returns `{ url: "https://<project>.supabase.co/storage/v1/object/public/studio-uploads/<filename>", width, height }`.

The Tiptap editor gets the official `@tiptap/extension-image`
extension. We wire its `onDrop` / `onPaste` callbacks to call
`/api/studio/upload` with the file and insert the returned URL
on success.

For crop: out of MVP scope here too. Crop happens in the host
OS preview/screenshot tool (or in Sprint 5's AI-rendered flow).
v1 just accepts whatever the author dropped.

**Estimate.** 1.5 days. Most of the work is the storage bucket
setup, the upload endpoint, and binding to Tiptap.

**Dependencies.**
- New Supabase bucket: `studio-uploads`, public-read policy.
- `SUPABASE_STORAGE_BUCKET=studio-uploads` env var on `tarrysingh-com-zdmb` (optional — defaults work).
- The Sprint 3 auth gate already covers `/api/studio/*`, so no new auth.

---

## Sprint 4.5 — Frontmatter surface (theme + tags)

The Studio Editor *parses* `theme` and `tags` from frontmatter, but
neither field is rendered yet on the post or the blog index. Both
were caught at Stage B post-B8 and filed as SP3-08 + SP3-09 in
`sprint-3-uat-results.md`. This is a tiny finish-the-job sprint —
1 day total, two small deliverables.

### 4.5.1 `theme: studio` palette variant

**What.** When `frontmatter.theme === "studio"`, the post renders
on the cream-paper + indigo + copper palette (the same palette
used on `/synaptic/*`), instead of the default editorial-white
palette used by the existing two seed posts. The author opts in
per-Dispatch; the default stays neutral.

**Shape.** In `src/app/(main)/blog/[slug]/page.tsx`, branch on
`post.frontmatter.theme` and apply either the default class
chain or a `theme-studio` class on the article root. Tokens
live in `src/styles/themes.css` (new file). Two variants only
for v1: `default` (current look) and `studio` (cream paper +
midnight indigo body + copper hairline rules).

**Estimate.** 2–3 h. Most of the work is restraint — keep the
studio variant from drifting into something flashier than the
existing `/synaptic/*` plates.

**Dependencies.** None.

### 4.5.2 Tags surface

**What.** Render `frontmatter.tags` as a Plex Mono small-caps row
under the post header (and a small `· tag` chip row at the foot
of each `/blog` index card). Bonus: a per-tag index at
`/blog/tag/<tag>` showing every Dispatch tagged with that tag.

**Shape.** Three small changes:
1. **Post header** — under the existing `category · date · reading-time`
   line, add a `tags?.length ? <TagsRow tags={tags} /> : null` block.
   The component renders each tag as a Plex Mono uppercase chip
   linking to `/blog/tag/<slug>`.
2. **Index card** — the existing `/blog` card gains a discreet
   `tags?.slice(0, 3)` row below the excerpt.
3. **Per-tag index** — new route `/blog/tag/[tag]/page.tsx` that
   reuses the existing `/blog` index component, filtered.
   Updates `sitemap.xml` to include the per-tag pages.

**Estimate.** 4–5 h. Mostly UI + a small sitemap addition.

**Dependencies.** None. Tags are already in frontmatter.

### 4.5.3 Studio AI follow-up

While the surface is live, run one quick QA pass: open the published
Dispatch in the editor, add `theme: studio`, add three tags, click
Save, watch the production reload, confirm both surfaces render
correctly. This is the Sprint 4.5 acceptance test.

---

## Sprint 5 — AI-rendered hero images

**What.** A "Generate hero" button in the frontmatter form. Claude
proposes a prompt aligned with the studio voice; the prompt fires
an image-generation API; the resulting image lands in Supabase
Storage; the URL goes into `frontmatter.hero`. The flow takes ~20
seconds and produces a 1600×900 editorial-grade hero that matches
the cream-paper + indigo + copper palette without breaking voice.

**Shape.** Two-step pipeline.
1. **Prompt synthesis.** New route `POST /api/studio/ai/hero-prompt`
   takes `{title, excerpt, category}`, returns a prompt of 60–100
   words enforcing the studio palette (cream `#fbf7ec`, indigo
   `#0d1b3d`, copper `#b45309`), the editorial-illustration register
   (no photoreal humans, no SaaS gradients, no pixar-cute), and the
   aspect ratio (16:9).
2. **Image generation.** Adapter pattern at
   `src/lib/studio/image-gen.ts` with a default
   `Replicate`-backed provider (SDXL or FLUX.1 [schnell] for speed),
   alternative providers: Anthropic-hosted image gen if/when
   available, OpenAI Images API, Imagen API. The first run uses
   FLUX.1 [schnell] (~5 s / 1024×576, then upscale via Real-ESRGAN
   to 1600×900). Env: `REPLICATE_API_TOKEN`.
3. The generated image flows through Sprint 4's `/api/studio/upload`
   path, so it lands in Supabase Storage with the same content-
   addressing.

The editor UI shows the generated hero inline with three buttons:
**Use it**, **Regenerate**, **Edit prompt**. The third opens the
prompt textbox for manual tuning.

**Estimate.** 3–4 days. Most of it is provider-comparison work
(does FLUX or SDXL produce better editorial-illustration output?
Test a basket of 20 prompts on both, pick the winner) and prompt
engineering for studio-voice consistency.

**Dependencies.**
- Sprint 4.2 (image upload) — the generated PNG/WebP goes through that pipe.
- `REPLICATE_API_TOKEN` (or whichever provider wins) on Vercel.
- Budget consideration: FLUX.1 [schnell] is ~$0.003/image, SDXL ~$0.005. Negligible at one hero per Dispatch.

---

## Sprint 5.5 — Reader-side subscribe nudges (writer-track #1)

**What.** The first reader-side track in the backlog. Sprint 1
shipped a McKinsey-style static newsletter card + bottom-right
Peek slide-up. Sprint 5.5 layers six small experiments on top —
each designed to earn its subscriber the way the studio earns
its words: by being interesting, not by being loud. **No dark
patterns. No surveillance affordances.** The newsletter pipeline
remains tracking-pixel-off, click-tracking-off (Sprint 2 rule).

Six experiments, each a separate increment that ships independently.

### 5.5.1 AI-personalised footer card

**What.** When a reader reaches the foot of a Dispatch, a
contextual card surfaces — written by Claude in the studio voice,
referencing the *specific argument* of the piece they just read.
Not "subscribe for more like this." More like *"If the argument
held — Tuesday's Dispatch carries it forward. Cream paper,
no tracking pixels, one click."*

**Shape.** Build-time generation, not runtime — keeps the page
static. A new step in `scripts/blog/promote.mjs`: when a Dispatch
ships, fire `POST /api/studio/ai/nudge-card` with the post body;
Claude returns a 60–90 word card; that card is baked into the
`.mdx` as a closing block. Token budget: 1500 thinking, 200
output. Tone-locked by the studio system prompt.

**Estimate.** 1 day. The API route is small; the prompt-engineering
pass is most of the cost.

**Dependencies.** None. Builds on Sprint 3's AI plumbing unchanged.

### 5.5.2 Reading-progress milestone nudge

**What.** As a reader passes 60 % of a long Dispatch (>1500
words), a small inline nudge surfaces at the next paragraph
break — *"You've made it through the middle. The argument
turns from here. If you want the next one in your inbox: …"*
with a single-input form. Fires once per session per Dispatch.

**Shape.** New `<ReadingMilestoneNudge>` client component that
mounts on long posts only. Uses IntersectionObserver on a target
paragraph at the 60 % offset; on first crossing, slides the
nudge in. localStorage flag `tch:nudge:<slug>` prevents repeat
shows. Subscribe POST hits the existing `/api/newsletter/subscribe`
endpoint — same HMAC bridge, same fail-safe log-only fallback,
zero new auth.

**Estimate.** Half a day. One component + a small instrumentation
in `blog/[slug]/page.tsx`.

**Dependencies.** None.

### 5.5.3 Highlight-to-share

**What.** When a reader selects ≥ 15 chars of text in a Dispatch,
a small floating chip surfaces above the selection — *"Share
this line"* (one click → opens a clean intent URL with the
quote + canonical URL pre-filled, no tracking params; default
target = LinkedIn share intent with the studio voice intact).
Optional: *"Quote in next Roundup"* button that POSTs the
selection to a new `/api/digest/reader-quotes` endpoint, queueing
the quote (with consented attribution) for possible inclusion
in the Monthly Roundup.

**Shape.** New `<HighlightToShare>` client component using
`document.onselectionchange`. The chip is Plex Mono small-caps,
copper underline — same visual register as the studio. The
quote-to-Roundup endpoint stores `{quote, sourceSlug, optionalEmail}`
in a new Supabase table `reader_quotes` (no email by default —
that field surfaces only if the reader explicitly opts to be
credited). Plain client-side highlight → share fires zero
network calls until the user clicks.

**Estimate.** 1 day. Component + endpoint + table.

**Dependencies.** Supabase write access (already in place).

### 5.5.4 Quiet exit-intent (desktop only, scroll-up only)

**What.** Most "exit-intent" pop-ups are dark patterns. This one
isn't. On desktop only, if a reader scrolls up rapidly from
≥ 80 % of a Dispatch toward the top (signalling "I'm leaving
but want to remember"), a discreet inline pill slides in at the
top-right corner: *"Bookmark this — or take the studio with
you."* Two CTAs: a copy-to-clipboard share link, and a Subscribe
field. Fires once per browser, ever (localStorage `tch:exit-intent:fired`).

**Shape.** New `<QuietExitIntent>` client component. Watches
`scrollY` velocity; trips only on rapid upward scroll from deep
reading position. No mouse-leave detection (that's the dark-pattern
variant). No mobile equivalent — on mobile, the existing Peek
already does the job. localStorage flag is permanent until the
reader subscribes or explicitly dismisses.

**Estimate.** Half a day.

**Dependencies.** None.

### 5.5.5 Second-visit recognizer

**What.** A returning reader on their 2nd or 3rd visit (anonymous,
no auth) sees a single subtle line at the top of `/blog`: *"You've
been here before. The next Dispatch — Tuesday, no spam."* with
a single-line subscribe form. Detects 2nd-visit via a long-life
first-party cookie set on first arrival. No cross-site tracking.
No fingerprinting.

**Shape.** Middleware sets `tch:visit-count` cookie (HTTP-only,
SameSite=Lax, 365-day expiry). `/blog/page.tsx` reads the cookie
on render, branches the hero copy on count ∈ {1, 2, 3+}. After
subscribe, the cookie flips to `tch:subscribed=1` and the line
permanently disappears (replaced by the published-cadence line
*"Next plate ships <date>."*).

**Estimate.** Half a day. Cookie logic + a single `<ReturningReaderHero>`
component.

**Dependencies.** None.

### 5.5.6 Passkey-style subscribe pill (mobile)

**What.** On mobile, the bottom-right Peek slide-up gains a
WebAuthn / native autofill hint so that on Safari iOS, the
email field surfaces the system's "Sign in with Apple" /
hidden-relay flow. Two taps from "I want this" to subscribed.
No password. No account. The hidden-relay email lives in
RealAI-CRM as the canonical `CrmContact.email`; if the reader
later unsubscribes, the relay flow on Apple's side honours it.

**Shape.** Add `autocomplete="email webauthn"` + `inputmode="email"`
to the subscribe input. The native autofill chip surfaces over
the keyboard. On iOS 17+, "Hide My Email" surfaces alongside.
This is *one HTML attribute change* — the studio's job is to
make the path easy, not to build a passkey runtime.

**Estimate.** 1 hour. Almost entirely a one-attribute change
plus a small label adjustment.

**Dependencies.** None.

### 5.5 — Sequencing + measurement

Run the six experiments in this order, not all at once:

1. **5.5.6 first** (one hour; lowest cost; mobile path improves immediately).
2. **5.5.5** (second-visit recognizer — cookie infra benefits later experiments).
3. **5.5.1** (AI-personalised footer card — high-leverage per Dispatch).
4. **5.5.2** (reading-progress milestone — pairs well with the AI footer).
5. **5.5.3** (highlight-to-share — adds reader voice to the studio).
6. **5.5.4** (quiet exit-intent — last because it's the riskiest
   on a voice-and-aesthetics axis; ship only if the prior five
   have moved the subscribe rate honestly).

**Measurement (no surveillance).** Server-side counters only.
Each nudge endpoint increments a Supabase row counter
`{nudgeType, slug, date}`. The studio reads aggregate counts
weekly — never per-reader trails. No analytics SDK. No GA.
No Plausible. Just `count(*)` on the same database row that
the subscribe-form POST already writes to.

**Acceptance criterion (for all six).** Each experiment is
allowed to ship only if a 1-paragraph dispatch-voice description
of *why a reader would subscribe through this nudge* can be
written without using a single verb from {convert, optimise,
acquire, capture, monetise}. If the description can't be
written, the experiment doesn't ship. The studio earns its
subscribers; it does not harvest them.

**Dependencies.**
- All six route through the existing `/api/newsletter/subscribe`
  pipeline — no new auth, no new HMAC keys.
- Sprint 4.5 tags surface unlocks a per-tag variant of 5.5.1
  ("more like this tag"); ship 4.5 first or accept that 5.5.1
  is tagless for the first iteration.

---

## Sprint 6 — Mobile-first writing UX

**What.** The Studio Editor is desktop-only in v1. Sprint 6 makes
it usable on a phone (writing a Dispatch while travelling, or a
quick edit between meetings). The bar: a 750-word draft is
comfortable on a 6.7-inch screen; toolbar collapses into a sticky
chip-row; frontmatter pane moves below the canvas, not beside it.

**Shape.**
- **Responsive grid.** The current `lg:grid-cols-[1fr_1fr]` becomes
  a stack on mobile; preview is a toggle in the header, not a
  side pane.
- **Touch-friendly toolbar.** Currently there's no formatting
  toolbar — markdown shortcuts handle it (`##` → H2 etc.). On
  mobile, autocorrect breaks markdown shortcuts on most keyboards.
  Solution: a sticky bottom toolbar with H2 / H3 / bold / italic /
  blockquote / code / link / undo / redo, surfaced only on
  `pointer: coarse` media queries.
- **Larger tap targets.** All buttons grow to 44×44 minimum
  (Apple's HIG floor).
- **Mobile-safe AI panel.** The AI panel becomes a bottom-sheet
  on mobile (slides up from below) rather than a side rail.
- **Save badge becomes inline.** Top header keeps Save + Publish
  + Preview; "saved X seconds ago" goes inline below the canvas
  to free header space.

**Estimate.** 2–3 days. Mostly CSS work + a few component
restructures.

**Dependencies.** None. Pure UI sprint.

---

## Sprint 7 — Version-history surface

**What.** Every Publish creates a commit on `main`. Every edit
post-publish is another commit. A version-history sidebar in the
editor shows the last 20 commits for a given `content/blog/<slug>.mdx`,
lets the author click a commit to view the diff, and offers a
"Revert to this version" action that creates a new commit
restoring the older content.

**Shape.**
- New route `GET /api/studio/history?slug=<slug>` reads
  `octokit.repos.listCommits({path: "content/blog/<slug>.mdx"})`
  and returns `{commits: [{sha, message, author, date, htmlUrl}]}`.
- New route `GET /api/studio/history/[sha]?slug=<slug>` returns
  the file contents at that commit via
  `octokit.repos.getContent({ref: sha})`.
- New route `POST /api/studio/revert` creates a new commit on
  `main` restoring the content of an older commit.
- Editor sidebar: collapsible "History" pane showing the list,
  diff-rendering, revert button.

This piggybacks on the existing `STUDIO_GITHUB_TOKEN` — no new
auth.

**Estimate.** 2–3 days. The diff renderer is the trickiest piece
(`diff2html` or hand-rolled side-by-side).

**Dependencies.**
- `STUDIO_GITHUB_TOKEN` (already in Sprint 3).
- One small UX call: do we surface drafts-in-progress in the
  same pane (history of `studio_drafts.body` over time)? Probably
  not — Supabase doesn't track row history. Stick to git history
  of `main` content.

---

## Sprint 8 — Linked editing for the Synaptic plate library

**What.** Today, the nine Synaptic Cartography plates
(`src/components/synaptic/{ChipPlate,Ca3Ca1Circuit,StdpWindow,
TwoPhaseDynamics,EnergyGradient,VisionHorizon,RamaswamyCortexHero,
SicilianoArmHero,HominisHero,UpRoboticsFactoryHero}.tsx`) carry
their copy + accent palette + cartouche text inline in the React
source. Editing those values means editing the .tsx files.

Sprint 8 extracts that *copy + tokens* surface into a separate
data layer (JSON in `proposals/<PROJECT>/plate-data.json` or rows
in a Supabase `synaptic_plates` table) and builds a sibling editor
at `/studio/plates` that lets Tarry tune:

- Plate marker (`PLATE V`, era `MMXXVI`, fig number `FIG. 1.2.b`)
- Title (Gloock display)
- Side-panel headline + body
- Cartouche text
- Accent colour (one of the studio palette tokens)
- Per-plate parameters where they exist (e.g. the StdpWindow
  curve τ values; the ChipPlate awake/sleep period)

The React plate components consume the JSON/DB at build time,
so the editor doesn't change the rendering pipeline — just the
data.

**Shape.**
- **Data extraction phase.** For each of the 9 plates, identify
  the copy + parameter surface (this is a careful read-the-source
  pass — each plate has different shape). Produce a per-plate
  TypeScript schema in `src/lib/synaptic/plate-schemas.ts`.
- **Storage.** Supabase table `synaptic_plates (slug pkey, schema_version, data jsonb, updated_at)` populated from the
  current `.tsx` defaults during the migration.
- **Editor.** `/studio/plates` lists the 9 plates; `/studio/plates/<slug>`
  is a schema-driven form (each field type renders the right
  input — text, textarea, colour picker, number slider for
  parameters).
- **Build-time bake-in.** The plate components import
  `getPlateData(slug)` which is statically resolved at build time
  via a build step that snapshots the Supabase table into a JSON
  file in `src/lib/synaptic/plate-snapshots.json`. Vercel build
  fetches the snapshot. No runtime DB call.
- **Publish.** "Save" updates Supabase + triggers a Vercel deploy
  via Deploy Hook (Vercel-side webhook).

**Estimate.** 5–7 days. The data-extraction phase is meticulous
(each plate is different). The schema-driven form is one good
component. The build-time bake is small.

**Dependencies.**
- Vercel Deploy Hook URL on `tarrysingh-com-zdmb` (new
  `VERCEL_DEPLOY_HOOK_PLATES` env var).
- Decision point during the data-extraction phase: do we
  introduce per-plate version history here, or rely on the
  Sprint 7 git surface? (The git surface only covers
  `content/blog/`, not `src/components/synaptic/`. So we'd need
  to extend Sprint 7 to also list commits affecting the plate
  snapshot file.)

**Open question.** Should there be an *AI on the plate*? E.g.
"rewrite the side-panel headline tighter," "suggest a copper
accent variant," "draft a one-italic-close for this cartouche."
Probably yes — the existing Continue/Rewrite plumbing maps
cleanly onto plate copy fields. Add as a Sprint 8.5 increment
after the surface is real.

---

## Sprint 9+ (deferred) — Real-time collaborative editing

**What.** Two browsers editing the same Dispatch see each
other's cursors and changes in real time. Useful when a guest
writer joins, or when reviewing with an editor.

**Shape.** Tiptap + Y.js + a sync provider (Tiptap Cloud, or
Liveblocks, or self-hosted y-websocket on Fly.io). Y.js handles
CRDT-based conflict-free merging.

**Estimate.** 4–5 days end-to-end including the sync provider
setup and the auth model (how do you authorise a second user
into a single-user-by-default editor?).

**Dependencies.** A second human writer. As of 2026-05-13, this
is a single-user editor. No real driver for multiplayer.

**Decision rule.** Build this when at least one of:
- A guest writer joins the Dispatches list and wants to draft
  pieces collaboratively;
- Tarry wants the spouse / a friend / an editor to edit live
  during a coaching session;
- A trusted reviewer requests inline-comment support (Tiptap
  comments are easier with Y.js as the substrate).

Until one of those fires, the cost-benefit doesn't pencil out.

---

## What we're not building (explicit no)

- **Full Notion-clone block menu.** Tiptap's markdown shortcuts
  cover the common cases. A slash-command block menu is a
  reasonable v3 increment if a real use case appears, but
  Tarry's content is dense prose with the occasional table or
  code fence — not blocks.
- **Multi-language UI.** The studio is in English.
- **A marketing CMS-style draft-review-approval workflow.** This
  is a one-person studio.
- **WordPress-style plugins / themes / customisability.** The
  voice is the voice; the styling is the styling.
- **A standalone "AI agent" that writes Dispatches autonomously.**
  AI is an assistant on Continue + Rewrite + Frontmatter +
  Hero — never an author. The byline is Tarry's; AI is the
  apprentice.

---

## Maintenance

Update this file at the close of each future sprint with:

- A "Sprint N — shipped" section moved from this roadmap into
  the main `dispatches-status-report.md`,
- The next deliverable promoted to the top of the queue,
- Any new items added by Tarry as the studio evolves.

— *the roadmap is alive; the document is honest about what's next.*
