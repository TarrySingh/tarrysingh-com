-- Sprint 5.5 — reader-side subscribe-nudge event counters
--
-- Surveillance-free measurement: aggregate counts only, no per-reader
-- trails. The studio reads weekly aggregates like
--
--   SELECT nudge_type, event, COUNT(*) FROM nudge_events
--   WHERE created_at > now() - interval '7 days'
--   GROUP BY 1, 2;
--
-- so it can answer "which nudge actually moved the subscribe rate"
-- without ever knowing which reader did what.
--
-- No analytics SDK. No GA/Plausible. No cookies tied to events.
-- Just count(*) on a row that the subscribe-form POST already writes.
--
-- Schema:
--   nudge_type — one of {passkey, returning-reader, reading-milestone,
--                        highlight-share, exit-intent, footer-card}
--   slug       — Dispatch slug when the nudge is post-scoped; null when
--                site-wide (e.g. returning-reader on /blog)
--   event      — one of {view, submit, dismiss}
--   created_at — server timestamp (no IP, no UA)

CREATE TABLE IF NOT EXISTS nudge_events (
  id          bigserial PRIMARY KEY,
  nudge_type  text NOT NULL,
  slug        text,
  event       text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nudge_events_type_event_idx
  ON nudge_events (nudge_type, event, created_at);

CREATE INDEX IF NOT EXISTS nudge_events_slug_idx
  ON nudge_events (slug, created_at)
  WHERE slug IS NOT NULL;
