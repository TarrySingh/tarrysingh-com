-- Studio Editor — drafts table
--
-- The Studio Editor at /studio/* persists Dispatch drafts here while
-- Tarry is writing them. Publish reads the row, commits the .mdx
-- straight to main via the GitHub Contents API, then deletes the row.
--
-- Apply via the Supabase SQL editor or `supabase migration apply`.

create table if not exists studio_drafts (
  slug         text primary key,
  frontmatter  jsonb not null,
  body         text  not null default '',
  updated_at   timestamptz not null default now()
);

create index if not exists studio_drafts_updated_at_idx
  on studio_drafts (updated_at desc);

-- The Studio Editor is single-user. Reads + writes go through the
-- service role key from the Next.js API routes — RLS isn't relied on.
-- Keep RLS off here unless we expose this table to anon clients in
-- the future.
alter table studio_drafts disable row level security;

comment on table studio_drafts is
  'Dispatch drafts persisted by /studio/* (single-user editor; Basic-Auth gated). On publish, /api/studio/publish reads the row, commits content/blog/<slug>.mdx to main via GitHub Contents API, then deletes.';
