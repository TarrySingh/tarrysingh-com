-- Sprint 9.1 — Google Drive cron ingest log
--
-- The Vercel-cron-triggered /api/cron/ingest-drive route polls a
-- Google Drive folder for new daily-article markdown files. Once a
-- file has been processed (parsed → AI frontmatter → upserted as a
-- draft + approval email sent), we record the (file_id, modifiedTime)
-- pair here so a second cron tick the same hour doesn't re-ingest
-- the same file.
--
-- We deliberately do NOT use `studio_drafts.slug` as the idempotency
-- gate because:
--   - the draft is DELETED after Tarry clicks "Publish now", so a
--     follow-up cron tick would see no draft for that slug and try
--     to re-ingest the same Drive file → second email
--   - one Drive file can legitimately mutate after upload (Cowork
--     might edit + re-save), and we want re-ingest only if
--     modifiedTime advances past what we last saw
--
-- One row per Drive file_id. modifiedTime is the high-water mark.

create table if not exists studio_drive_ingest_log (
  file_id            text primary key,
  filename           text not null,
  slug               text,
  -- ISO-8601 string straight from Drive's `modifiedTime` field; kept
  -- as text so re-querying via Drive's `q` filter doesn't trip on
  -- timezone round-trips.
  modified_time_iso  text not null,
  -- "ingested" = draft upserted + email queued; "skipped" = filter
  -- said no (e.g. doesn't match YYYY-MM-DD_); "failed" = anything
  -- the pipeline returned. Lets the runbook grep one column.
  status             text not null check (status in ('ingested','skipped','failed')),
  email_id           text,
  failure_reason     text,
  first_seen_at      timestamptz not null default now(),
  last_seen_at       timestamptz not null default now()
);

create index if not exists studio_drive_ingest_log_last_seen_idx
  on studio_drive_ingest_log (last_seen_at desc);

-- Same posture as studio_drafts — single-user, service-role only,
-- no RLS needed.
alter table studio_drive_ingest_log disable row level security;

comment on table studio_drive_ingest_log is
  'Idempotency log for /api/cron/ingest-drive (Sprint 9.1). One row per Google Drive file_id; modified_time_iso is the high-water mark so we re-ingest only if Cowork updates the file.';
