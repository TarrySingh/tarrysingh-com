# Synaptic plate-editing flow

**Status:** reference
**Last verified:** 2026-05-31 — editor shipped (commits `0c60162` → `c08fc9c`),
build green on Vercel, routes confirmed Basic-Auth-gated in production.
**Scope:** how `/studio/synaptic` edits the copy that rides on the Synaptic
plate components, and how Publish writes it back to the live site.

---

## The model: two stores (same shape as Dispatches)

| Store | What it is | Lives in |
|---|---|---|
| **Scratch pad** | In-progress copy edits — one row per plate (`content` jsonb, `updated_at`). | Supabase `synaptic_plate_drafts` |
| **The wall** | The canonical copy the live plate renders. | Git `main` → `src/lib/synaptic/<plate>.ts` |

The live site **never reads Supabase** for plates — each plate component
imports its content module directly (e.g. `ChipPlate.tsx` imports
`CHIP_ANNOTATIONS` from `chipplate-data.ts`). So **Publish = commit the
regenerated `.ts` module to `main`**; Vercel redeploys and the plate updates
in ~90 s. Editing is a round trip: file → draft → edit → commit back.

---

## The adapter — why it exists

The foundation (`types.ts`, `content-store.ts`, registry) speaks one
normalized shape, **`PlateContent`** (`displayName`, `ariaLabel`, `hint`, and
`annotations` / `captions` / `prose` slots). But each plate's content module is
**bespoke** (ChipPlate exports a `CHIP_ANNOTATIONS` array; TwoPhaseDynamics
exports flat `TWO_PHASE_*` scalars; …). A **`PlateAdapter`**
(`src/lib/synaptic/editor/adapters.ts`) bridges the two for one plate:

- `load()` — read the committed module → `PlateContent` (editor seed + preview).
- `serialize(content, currentSrc)` — write edited `PlateContent` back into the
  module's source text.

A plate is **editor-ready iff it has an adapter.** The index lists every
registry plate but only opens the ready ones. **Adding a plate = one adapter**
— no UI change.

### Surgical serialization (the safe part)

`serialize()` doesn't regenerate the file from a template — it does **surgical
replacement** via `src/lib/synaptic/editor/serialize.ts`: find one named
`export const`, swap only its value expression, leave every other byte (types,
geometry, compute functions) **identical**. Code-owned fields an annotation
carries — `anchor`, `color`, `id` — are preserved and round-trip through the
draft; the editor only exposes the prose (`title`/`subtitle`/`body`).
`serialize.test.ts` + `adapters.test.ts` prove this against the real
`chipplate-data.ts` (run: `npx tsx src/lib/synaptic/editor/serialize.test.ts`).

---

## Lifecycle

1. **`/studio/synaptic`** — server component lists `PLATE_REGISTRY` grouped by
   project, with editor-ready / extraction-pending status + last-edited stamp.
2. **`/studio/synaptic/[plateId]`** — loads `getPlateDraft(plateId)` ?? the
   adapter's `load()`, renders `<PlateEditor>` with the registry's `slots`.
3. **Edit** — `PlateEditor` (client) is a structured form. Debounced **autosave**
   `PUT /api/studio/synaptic/draft { plateId, content }` → `upsertPlateDraft`.
   The live **copy preview** (`PlatePreview`) re-renders on every keystroke.
4. **Publish** — saves once more, then `POST /api/studio/synaptic/publish
   { plateId }`. `publishPlate()`:
   - `getPlateDraft` → the latest copy;
   - Octokit `getContent` the module (current source + sha);
   - `adapter.serialize(draft.content, currentSrc)`;
   - identical? → clear draft, report **unchanged**;
   - else `createOrUpdateFileContents` → **one commit to `main`**, authored as
     *Tarry Singh*; then best-effort `deletePlateDraft`.
5. **Discard** — `DELETE /api/studio/synaptic/draft` → editor reverts to the
   committed file copy.
6. **Vercel** redeploys `main`; the live plate reflects the edit.

---

## Key files

| File | Role |
|---|---|
| `src/lib/synaptic/editor/serialize.ts` | Surgical `export const` rewriter + TS source-literal printer. Pure, tested. |
| `src/lib/synaptic/editor/adapters.ts` | `PlateAdapter` per plate; `getAdapter` / `isEditorReady`. **Add a plate here.** |
| `src/lib/synaptic/editor/publish.ts` | `publishPlate` — Octokit commit of the regenerated module to `main`. |
| `src/app/api/studio/synaptic/draft/route.ts` | GET / PUT / DELETE draft; lenient `PlateContent` validator. |
| `src/app/api/studio/synaptic/publish/route.ts` | Thin wrapper over `publishPlate`. |
| `src/app/studio/synaptic/page.tsx` | Editor index. |
| `src/app/studio/synaptic/[plateId]/page.tsx` | Per-plate editor loader. |
| `src/components/studio/synaptic/PlateEditor.tsx` | Form + autosave + publish/discard. |
| `src/components/studio/synaptic/PlatePreview.tsx` | Live copy preview (plate palette). |
| `src/lib/synaptic/content-store.ts` | Supabase CRUD (read-only consumer; owned by the extraction work). |
| `src/lib/synaptic/registry.ts` | `PLATE_REGISTRY` — id, displayName, contentPath, slots, group, previewPath. |

---

## Prerequisites

- **DB table.** `synaptic_plate_drafts` must exist in the blog's Supabase
  project (the same one as `studio_drafts`). Apply
  `docs/migrations/2026-05-17-synaptic-plate-drafts.sql`. **Until it exists the
  editor opens read-only against the committed file, autosave is a no-op, and
  Publish is disabled** (the UI says "drafts offline").
- **`STUDIO_GITHUB_TOKEN`** — the same PAT the Dispatch publish flow uses
  (Contents: read & write on `TarrySingh/tarrysingh-com`).

---

## To make another plate editable

1. The extraction lands the plate's content module + registers it in
   `registry.ts` (extraction work).
2. Add a `PlateAdapter` in `adapters.ts`: `load()` assembles `PlateContent`
   from the module's exports; `serialize()` calls `replaceExportInitializer`
   for each editable export. Add it to the `ADAPTERS` map.
3. That's it — the index shows it as editor-ready and the form renders the
   registry's `slots`.

---

## Failure modes

| Symptom | Cause | Behaviour |
|---|---|---|
| "drafts offline" banner, Publish disabled | `synaptic_plate_drafts` missing / Supabase env unset | Editor opens against the committed file; no persistence. Apply the migration. |
| `not_editor_ready` | Plate registered but no adapter | Index shows it disabled; the editor page shows an "extraction pending" notice. |
| `github_unconfigured` | `STUDIO_GITHUB_TOKEN` missing on Vercel | Publish 503s. |
| "No changes vs the published copy" | Serialized output identical to the live file | Draft cleared, nothing committed. |
| `content_missing` | The registry `contentPath` isn't on `main` | Publish 404s. |

---

## Auth

`/studio/*` and `/api/studio/*` are Basic-Auth-gated by `src/middleware.ts`;
the synaptic routes inherit it (verified: all 401 unauthenticated in prod).
Every plate commit is authored as **Tarry Singh**.
