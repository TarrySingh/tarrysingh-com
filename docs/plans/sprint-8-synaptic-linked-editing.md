# Sprint 8 — Synaptic plate-library linked editing

**Status:** Plan (pre-execution). Tarry's read + decisions wanted before I write code.
**Author:** Claude Code session, 2026-05-17.
**Estimate:** 5–7 days (matches the roadmap entry).

---

## 1 · What this sprint earns

Today the twenty plates under `src/components/synaptic/` are hand-coded React/SVG. Editing the copy on any one of them — annotation titles, body paragraphs, hover captions, the surrounding essay sentences in `src/app/synaptic/*/page.tsx` — means opening the TSX file, finding the literal string, editing it, committing, pushing.

Sprint 8 closes that loop: Tarry edits plate copy in `/studio/synaptic`, sees a live preview of the plate re-rendering, clicks Publish, and the change ships to production via the same commit-to-main GitHub-Contents-API path Sprint 9 already uses for Dispatches.

Plates stay interactive TSX (the design system memory rule). Only the **copy slots** become editable. SVG geometry, animation, palette, and layout stay code.

---

## 2 · Surface area, measured

```
src/components/synaptic/   20 plate components, 8,278 lines total
                            largest: StdpWindow 592, ComprehensionGap 587, ChipPlate 562
src/lib/synaptic/          2 existing data files (chipplate-data.ts, planisphere-data.ts)
                            — the right pattern, just two plates use it
src/app/synaptic/*/page.tsx 10 essay pages around the plates,
                            avg ~200 lines, symphony index is 741
```

`<text>` / `<tspan>` SVG nodes per plate range 2 → 20. Average ~10. Plus the page-level prose around each plate (~5–15 paragraphs per page).

Total editable copy across the library: **estimated ~280 text slots** (plate annotations) + **~80 prose paragraphs** (page essays). Roughly the volume of one Sunday Essay × 360, but typed into structured slots.

---

## 3 · The contract — what becomes editable

Each plate exposes a **typed schema** of its editable slots. The plate code imports a typed `getPlateContent(plateId)` helper that returns the slot values. Geometry, palette, animation all stay in the TSX.

ChipPlate already does this — `CHIP_ANNOTATIONS` in `src/lib/synaptic/chipplate-data.ts` types each annotation as `{id, title, subtitle, body, anchor, color}`. The sprint extends the pattern to every plate.

Three slot categories cover everything I saw in the audit:

| Category | Shape | Examples |
|---|---|---|
| **Annotation** | `{id, title, subtitle, body, anchor?, color?}` | ChipPlate's 6 annotations; ConsortiumGraph node labels |
| **Caption** | `{id, text}` | StdpWindow's hover captions; Planisphere sector copy |
| **Prose block** | `{id, paragraphs: string[]}` | The essay paragraphs in each `src/app/synaptic/*/page.tsx` |

`anchor` and `color` stay code-owned in v1 (out of editor scope). v2 could surface them via the same form.

---

## 4 · Where the content lives — three options

This is the main decision. Recommend **Option C (hybrid)**.

### Option A — file-based (extend the ChipPlate pattern)
- All slots in `src/lib/synaptic/<plate>-content.ts` files
- Edit → commit-to-main → Vercel redeploy → live
- **Pro:** pure git history, zero new infrastructure
- **Con:** every edit is a 90-second redeploy; no preview without rebuilding

### Option B — Supabase-only
- Slots in a `synaptic_plate_content` table
- Plate components fetch at request time
- **Pro:** instant edits, no deploys
- **Con:** adds a DB read to every static-feeling Synaptic page; lose git history of copy edits

### Option C — hybrid, recommended ★
- File-based defaults in `src/lib/synaptic/<plate>-content.ts` (the canonical source, committed to git)
- Supabase `synaptic_plate_drafts` table for in-progress edits
- Editor reads from Supabase if a draft exists, else from the file
- Plate components on the live site read **only** from the file (no DB on the critical path; static pages stay fast)
- "Publish" promotes the draft: writes the file back via Octokit commit-to-main → deletes the draft row → Vercel redeploys
- Same model as `studio_drafts` + `publishDispatch`. Mirrors Sprint 3/9 architecture.

Hybrid wins because Synaptic pages are SEO-critical and visited regularly; they shouldn't pay a Supabase round-trip per request. But Tarry shouldn't have to commit-and-redeploy to A/B a title.

---

## 5 · The editor — `/studio/synaptic`

New routes, mirroring `/studio` for Dispatches:

```
/studio/synaptic                              index — list of plates with last-touched dates
/studio/synaptic/[plate-id]                   editor for one plate
/studio/synaptic/[plate-id]/preview           full-page preview (the actual /synaptic page rendered with draft slots)
```

**Editor UI** — a structured form, NOT a freeform Markdown editor. Plate copy is typed slots, not paragraphs of essay. One section per slot category:

- **Annotations** — table of rows; each row is a form for `{title, subtitle, body}` with character-count hints.
- **Captions** — flat list of `{id, text}` rows.
- **Prose blocks** — for essay paragraphs around the plate: per-block textarea with paragraph-count + word-count.

Right pane: live preview of the plate (and surrounding essay) rendered with the in-progress edits. Iframe pointing at `?previewDraft=1` on the actual route. Tarry sees changes as he types.

**No Tiptap here.** The Studio Editor's Tiptap is for free-form Dispatch bodies. Plate copy is structured. Different tool. (Also avoids dragging Tiptap into the synaptic bundle.)

**Publish flow** — same Octokit commit pattern as `publishDispatch`. Commits the regenerated `src/lib/synaptic/<plate>-content.ts` file to main. Vercel auto-redeploys.

---

## 6 · Sequencing — the 5–7 day breakdown

| Day | Work |
|---|---|
| **Day 1** | Data extraction (1/20) end-to-end for ChipPlate as the reference. Extract every other text node from the TSX into the existing `chipplate-data.ts`; refactor the plate to render from data. Establishes the shape contract + the renderer pattern. |
| **Day 1 PM** | Supabase migration `synaptic_plate_drafts`. Server helper `src/lib/synaptic/content-store.ts` with `getPlateContent` / `getPlateDraft` / `upsertPlateDraft` / `deletePlateDraft`. |
| **Day 2** | Bulk extraction (5/20 plates). Mechanical work — copy strings into the per-plate data file, refactor JSX to read from data, smoke each plate visually on its page. |
| **Day 3** | Bulk extraction (10/20 more). |
| **Day 4 AM** | Final extraction (4/20 remaining) + audit pass: grep every `src/components/synaptic/*.tsx` for stray string literals. |
| **Day 4 PM** | Page-level prose extraction — convert hardcoded `<p>` blocks in `src/app/synaptic/*/page.tsx` to read from `src/lib/synaptic/<page>-prose.ts` files. |
| **Day 5 AM** | `/studio/synaptic` index page + per-plate editor route. Form UI for the three slot categories. |
| **Day 5 PM** | Live-preview iframe wiring. `?previewDraft=1` server-side reading from Supabase instead of the file when present. |
| **Day 6 AM** | Publish flow — Octokit commit that regenerates the typed `.ts` file from the draft. Reuse `src/lib/studio/publish.ts` primitives. |
| **Day 6 PM** | UAT pass — Tarry edits a plate title, hits Publish, verifies redeploy lands the change. |
| **Day 7** | Polish + docs. Update README + status report + roadmap. Runbook for "how to add a new plate to the library". |

Realistic landing: **~6 days** with the mechanical extraction work being the bulk of it. Editor + publish flow is ~1.5 days of fresh code.

---

## 7 · New files this sprint creates

| Path | Purpose |
|---|---|
| `src/lib/synaptic/<plate-id>-content.ts` × 18 new | Typed slot data per plate (ChipPlate + Planisphere already exist) |
| `src/lib/synaptic/<page-id>-prose.ts` × 10 | Essay prose per `/synaptic/*` page |
| `src/lib/synaptic/types.ts` | `PlateContent`, `Annotation`, `Caption`, `ProseBlock` shapes |
| `src/lib/synaptic/content-store.ts` | Supabase helper — draft CRUD |
| `src/lib/synaptic/registry.ts` | `PLATE_REGISTRY` — id → display-name + slot-schema map; powers the editor index |
| `docs/migrations/2026-05-17-synaptic-plate-drafts.sql` | Supabase migration |
| `src/app/studio/synaptic/page.tsx` | Editor index — list plates + last touched |
| `src/app/studio/synaptic/[plateId]/page.tsx` | Per-plate editor with structured form + live preview iframe |
| `src/app/api/studio/synaptic/draft/route.ts` | Save/load draft (Basic-Auth gated) |
| `src/app/api/studio/synaptic/publish/route.ts` | Commit regenerated content file to main |
| `src/components/studio/PlateEditor.tsx` | The form-based editor component |
| `src/components/studio/PlatePreview.tsx` | Iframe wrapper |

Plus middleware patch (already covered — `/api/studio/*` is gated).

---

## 8 · Deliberate non-goals

- **Plate geometry / animation editing.** Out of scope. The plates are interactive TSX (per the design system memory rule); only copy is editable.
- **AI-suggested plate copy.** Could be a Sprint 8.1 — "ask Claude to tighten this annotation". Not v1.
- **Anchor / color editing.** Stays code-owned in v1; surfacing in the form is mechanical and can follow.
- **Plate versioning UI.** History pane parity with Sprint 7 is a nice-to-have, not blocking. Each publish lands a git commit; that's already a version history.
- **Multi-user editing.** Studio is single-user.

---

## 9 · Risks + open questions

| Risk | Mitigation |
|---|---|
| Mechanical extraction breaks a plate visually | After each extraction, smoke that plate's page in dev; commit one plate at a time. |
| Live-preview iframe is slow or flickers | Debounce the form → preview-iframe postMessage; only repaint on `blur` not `change`. |
| Supabase down → editor unusable | Plates live in files; editor surfaces "drafts unavailable" but doesn't take the site down. |
| Tarry's existing TSX edits collide with draft rows | First load wins — if a TSX file has been edited since the draft was created, the editor warns + offers to discard the stale draft. |

**Decisions Tarry needs to make** before I execute:

1. **Content storage**: confirm hybrid (Option C) vs pure file (A) vs pure DB (B)?
2. **Page essay prose**: include in this sprint, or split to Sprint 8.1?
3. **Publish atomicity**: one publish per plate (recommended — same as a Dispatch) or batch (publish multiple draft plates in one commit)?
4. **Extract order**: alphabetical, or start with the plates Tarry edits most? Recommended start: ChipPlate (already half-extracted) → Planisphere (also half-extracted) → SymphonyStudio / Memphis hero plates (high-traffic) → the rest.

---

## 10 · Acceptance criteria

Sprint 8 closes when **all** are true:

- [ ] Every plate component in `src/components/synaptic/` reads its copy from `src/lib/synaptic/<plate>-content.ts`. No literal user-facing strings in JSX.
- [ ] Every `src/app/synaptic/*/page.tsx` reads its essay prose from `src/lib/synaptic/<page>-prose.ts`. No literal `<p>` user-facing strings.
- [ ] `/studio/synaptic` lists all 20 plates + 10 essay pages, sortable by last-touched.
- [ ] Per-plate editor renders structured form + live preview iframe.
- [ ] Save draft → reload → draft persists.
- [ ] Publish → new commit on main rewrites the content file → Vercel ships in ~90 s → the change is live on the public Synaptic page.
- [ ] All existing plate functionality still works (interactivity, hover states, animations).
- [ ] README + roadmap + status report updated.
- [ ] Runbook documents "how to add a new plate to the library" (extract from TSX → register → editor picks it up automatically).
