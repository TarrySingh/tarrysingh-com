# Sprint 4+ roadmap — Studio Editor v2 and beyond

**Status:** planning · maintained alongside the main status report
**Last updated:** 2026-05-13 (initial filing)
**Parent doc:** [`dispatches-status-report.md`](./dispatches-status-report.md)
**Repo:** [github.com/TarrySingh/tarrysingh-com](https://github.com/TarrySingh/tarrysingh-com)

Sprint 3 shipped a Studio Editor MVP that earns its keep on day one:
a Tiptap-based composer behind Basic Auth, Claude Opus 4.7-extended
on Continue + Rewrite, one-click Publish-to-main via Octokit. Seven
features were deliberately deferred to keep the MVP honest. This
document plans them out in execution order.

The voice of the planning: short. Each item gets four short
paragraphs — *what*, *shape*, *estimate*, *dependencies*. No
roadmap-deck slop.

---

## Sequence at a glance

| Sprint | Deliverable | Weight | Why this order |
|---|---|---|---|
| **Sprint 4** | AI-suggested frontmatter · Image upload (Supabase Storage) | ~3 days | Both are small + standalone; image upload unblocks Sprint 5. |
| **Sprint 5** | AI-rendered hero images | ~4 days | Depends on image upload (Sprint 4). High creative leverage per Dispatch. |
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
