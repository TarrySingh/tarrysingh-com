-- Sprint 8 — Synaptic plate-library linked editing.
--
-- Per-plate (and per-page) content drafts. The canonical content
-- lives in `src/lib/synaptic/<plate-id>-content.ts` files (committed
-- to git). This table holds in-progress edits from /studio/synaptic.
--
-- Publish flow promotes the draft: writes the .ts file back via
-- Octokit commit-to-main, deletes this row, Vercel redeploys.
-- Plates on the live site read ONLY from the files (no DB on the
-- request path). Mirrors `studio_drafts` + `publishDispatch`.

create table if not exists synaptic_plate_drafts (
  -- Plate or page id matching the registry (e.g. "chip-plate",
  -- "symphony-page"). Treated as a slug — kebab-case, [a-z0-9-].
  plate_id     text primary key,
  -- Full PlateContent shape serialised. Schema lives in
  -- src/lib/synaptic/types.ts. Validated by the API route before
  -- upsert.
  content      jsonb not null,
  updated_at   timestamptz not null default now()
);

create index if not exists synaptic_plate_drafts_updated_at_idx
  on synaptic_plate_drafts (updated_at desc);

-- Same posture as studio_drafts — single-user, service-role only,
-- no RLS needed.
alter table synaptic_plate_drafts disable row level security;

comment on table synaptic_plate_drafts is
  'In-progress copy edits for the Synaptic plate library (Sprint 8). Canonical source is src/lib/synaptic/<plate>-content.ts; this table holds drafts until /studio/synaptic Publish promotes the change back to the file via Octokit.';
