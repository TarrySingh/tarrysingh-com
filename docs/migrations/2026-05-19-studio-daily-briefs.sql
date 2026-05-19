-- Sprint follow-up — daily-brief prompt loop.
--
-- Every evening at 23:00 Europe/Amsterdam the /api/cron/daily-brief-prompt
-- route emails Tarry asking whether he wants to shape tomorrow's
-- Dispatch. Yes → fills a small form whose contents get saved here.
-- Cowork's morning prompt fetches /api/studio/brief/today and folds
-- the brief into its instructions before writing.
--
-- One row per Amsterdam-local target date.

create table if not exists studio_daily_briefs (
  -- The Amsterdam-local date the brief is intended for, YYYY-MM-DD.
  -- Cowork's morning run fetches the row matching today's date.
  for_date         text primary key,
  -- pending → prompt email sent, no decision yet
  -- yes     → Tarry submitted a brief
  -- no      → Tarry explicitly declined
  decision         text not null check (decision in ('pending','yes','no')) default 'pending',
  -- The brief text Tarry typed in the form. Empty when decision != 'yes'.
  brief            text not null default '',
  -- When the evening prompt email was sent for this date.
  prompt_sent_at   timestamptz not null default now(),
  -- When Tarry decided (clicked Yes-submit or No-decline).
  decided_at       timestamptz
);

create index if not exists studio_daily_briefs_prompt_sent_idx
  on studio_daily_briefs (prompt_sent_at desc);

alter table studio_daily_briefs disable row level security;

comment on table studio_daily_briefs is
  'Daily-brief prompt loop. One row per Amsterdam-local target date. Used by /api/cron/daily-brief-prompt + /api/studio/brief/* + Cowork morning fetch.';
