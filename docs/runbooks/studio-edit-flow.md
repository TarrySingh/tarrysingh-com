# Studio edit-and-publish flow

**Status:** reference
**Last verified:** 2026-05-31 — after the `slug_already_exists` /
frontmatter-allowlist fixes (commits around `1937a3e` → `965f121`).
**Scope:** the exact sequence of events, and the files involved, when you
create or edit a Dispatch in the Studio editor and push it to `/blog`.

---

## The model: two stores

Everything below is just moving content between two places.

| Store | What it is | Lives in |
|---|---|---|
| **Scratch pad** | In-progress drafts and edits — one row per slug (`frontmatter`, `body`, `updatedAt`). | Supabase table `studio_drafts` |
| **The wall** | The canonical, published Dispatch. The source of truth. | Git `main` → `content/blog/<slug>.mdx` |

**Vercel deploys `main`.** So "go live" / "update live" = *commit to git*;
Vercel rebuilds and serves the result at `/blog/<slug>`. The public blog
page never reads Supabase — only the bundled `.mdx` files.

Editing a published post is therefore a round trip: **pull the wall copy
into the scratch pad → edit the scratch pad → commit it back to the wall.**

---

## Lifecycle

### 1 · Open the editor — `/studio/editor/<slug>`

`src/app/studio/editor/[slug]/page.tsx` (server component, `force-dynamic`):

1. `getDraft(slug)` — is there already a scratch-pad row?
2. If **not**, `reopenPublished(slug)` reads `content/blog/<slug>.mdx` off
   the bundled filesystem, parses frontmatter + body, and **upserts a draft
   row** flagged `was_published = true`.
3. Either way, if `isPublished(slug)` is true (the `.mdx` exists on disk),
   force `frontmatter.was_published = true`. *This is the truth-source step
   — it makes the decision independent of how the draft row got there.*
4. Renders `<StudioEditor initialSlug initialFrontmatter initialBody />`.

### 2 · In the editor — `src/components/studio/StudioEditor.tsx` (client)

- The header reads **● LIVE POST** and the button says **UPDATE LIVE** iff
  `frontmatter.was_published === true`. A brand-new draft shows neither →
  the button says **PUBLISH**.
- **Autosave** (debounced): `POST /api/studio/save` `{slug, frontmatter, body}`.
  Your work persists to the scratch pad continuously.

### 3 · `POST /api/studio/save` — `src/app/api/studio/save/route.ts`

- `parseFrontmatter(...)` validates and rebuilds the frontmatter, then
  `upsertDraft(...)` writes the row to Supabase.
- ⚠️ **`parseFrontmatter` is an allowlist.** Every `DispatchFrontmatter`
  field the editor can set *must* be copied here or it is silently dropped
  on save. This is what bit us: `was_published`, `series`, and `cover` were
  missing, so they never reached the DB. Keep this list in sync with
  `DispatchFrontmatter`.

### 4 · Click UPDATE LIVE → `onPublish()`

- Saves once more, then — since the post is already public — **skips the
  confirm dialog** and calls `POST /api/studio/publish` `{slug}`.
- (For a new **PUBLISH**, it *does* confirm first, because it exposes a new
  public URL.)

### 5 · `POST /api/studio/publish` — `src/app/api/studio/publish/route.ts`

1. `getDraft(slug)` → the latest scratch-pad copy.
2. Validate `title` / `excerpt`.
3. `allowOverwrite = frontmatter.was_published === true || (await isPublished(slug))`
   — **reality-based**, so a live post updates even if the flag is ever
   missing.
4. `publishDispatch({ slug, frontmatter, body, allowOverwrite })`.

### 6 · `publishDispatch` — `src/lib/studio/publish.ts` (the git commit)

1. `octokit.repos.getContent(content/blog/<slug>.mdx, ref=main)` — exists?
   - exists **+ allowOverwrite** → take its `sha` (update branch)
   - exists **+ not allowed** → `slug_already_exists`
   - 404 → create branch
2. `buildMdx(frontmatter, body)` serializes the `.mdx`. This is its own
   allowlist (`src/lib/studio/serialize.ts`) — it strips `was_published`
   (editor-only) and forces `draft: false`.
3. `octokit.repos.createOrUpdateFileContents(... sha ...)` → **one commit to
   `main`**, authored as *Tarry Singh*. Message: `feat(blog): update <slug>`
   (or `publish <slug>` for a new post).

### 7 · Cleanup + return (back in the publish route)

- `deleteDraft(slug)` — best-effort; clears the scratch-pad row so it leaves
  the dashboard.
- `deleteFilesBySlugInFolder(slug)` — best-effort; unlinks the Drive source
  file so the daily backup writer doesn't re-ingest it.
- Returns `{ blogUrl, commitUrl }`.

### 8 · Vercel

The push to `main` triggers a Vercel rebuild; `/blog/<slug>` reflects the
edit in ~90 s.

---

## Diagram

```mermaid
flowchart TD
  A["/studio/editor/[slug]"] -->|getDraft / reopenPublished| B[("Supabase studio_drafts")]
  A -->|was_published = isPublished(slug)| C[StudioEditor]
  C -->|autosave · POST /api/studio/save| B
  C -->|Update Live · POST /api/studio/publish| D[publish route]
  D -->|getDraft| B
  D -->|allowOverwrite = was_published OR isPublished| E[publishDispatch]
  E -->|getContent → sha → createOrUpdateFileContents| F[("git main · content/blog/&lt;slug&gt;.mdx")]
  D -->|on success| G[deleteDraft + Drive cleanup]
  F -->|push| H[Vercel rebuild]
  H --> I["/blog/&lt;slug&gt; live"]
```

---

## Key files

| File | Role |
|---|---|
| `src/app/studio/page.tsx` | Dashboard. Lists scratch-pad drafts; **hides any already live on `/blog`** (`isPublished`). |
| `src/app/studio/editor/[slug]/page.tsx` | Editor loader. `getDraft` → `reopenPublished` → forces `was_published` from `isPublished`. |
| `src/components/studio/StudioEditor.tsx` | Editor UI. Autosave, `onPublish`, the Publish-vs-Update-live label. |
| `src/app/api/studio/save/route.ts` | Persists a draft. **`parseFrontmatter` allowlist** — keep in sync with `DispatchFrontmatter`. |
| `src/app/api/studio/publish/route.ts` | Orchestrates publish: `getDraft` → `allowOverwrite` → `publishDispatch` → cleanup. |
| `src/lib/studio/publish.ts` | `publishDispatch` — the Octokit commit + create/update branching. |
| `src/lib/studio/reopen.ts` | `reopenPublished` (pull `.mdx` → draft) and `isPublished` (truth source). |
| `src/lib/studio/drafts-store.ts` | Supabase CRUD: `getDraft` / `listDrafts` / `upsertDraft` / `deleteDraft`. |
| `src/lib/studio/serialize.ts` | `buildMdx` — frontmatter allowlist → committed `.mdx` (strips `was_published`). |
| `src/lib/studio/types.ts` | `DispatchFrontmatter`, `DispatchTheme`, the `was_published` flag. |
| `src/middleware.ts` | Basic-Auth gate on `/studio/*` + `/api/studio/*`. |

---

## The `was_published` flag — why it exists

`was_published` is an **editor-only** flag (never written to the `.mdx`).
Its only job is to tell the publish path "this is an in-place update, not a
fresh publish," so `publishDispatch` runs the update branch instead of
rejecting the slug. Because it can be dropped on the editor→save→DB round
trip, **the publish route no longer trusts it alone** — it ORs it with a
live filesystem check (`isPublished`). The flag now mostly drives the UI
label; the commit decision is reality-based.

---

## Failure modes

| Error | Cause | Now |
|---|---|---|
| `slug_already_exists` | The file exists on `main` and overwrite wasn't allowed. | Only fires for a **genuinely new** post whose slug collides with a live one. Editing a live post always updates (allowOverwrite is reality-based). |
| Silent loss of `series` / `cover` on edit | `parseFrontmatter` allowlist didn't copy those fields. | Fixed — the allowlist now carries them. **Any new `DispatchFrontmatter` field must be added there too.** |
| `draft_not_found` | Publish fired with no scratch-pad row (e.g. publish before save). | `onPublish` always `save()`s first. |
| `github_unconfigured` | `STUDIO_GITHUB_TOKEN` missing on Vercel. | — |
| Stale draft lingers in dashboard | `deleteDraft` is best-effort and didn't run. | Dashboard hides already-live drafts; they self-clean on the next Update Live. |

---

## Auth

`/studio/*` and `/api/studio/*` are Basic-Auth-gated by `src/middleware.ts`.
The only exceptions are the HMAC-signed `ingest` and `approve` routes used
by the auto-publish pipeline (see `auto-publish-pipeline.md`). Every Studio
commit is authored as **Tarry Singh**, not the bot.
