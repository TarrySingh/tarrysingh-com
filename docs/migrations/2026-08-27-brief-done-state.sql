-- Allow decision = 'done' on studio_daily_briefs.
--
-- 'done' marks a brief as CONSUMED. It exists because the backup writer now
-- writes an unconsumed brief even when a rotation article already exists for
-- the day; without a terminal state that brief stays 'yes' and fires again the
-- next morning, producing a duplicate.
--
-- Applied to production 2026-08-27. Recorded here because the code path
-- setBriefDecision(date, 'done') throws against the old constraint, which
-- would leave the brief 'yes' and silently reintroduce the duplicate.
alter table studio_daily_briefs
  drop constraint if exists studio_daily_briefs_decision_check;

alter table studio_daily_briefs
  add constraint studio_daily_briefs_decision_check
  check (decision = any (array['pending'::text, 'yes'::text, 'no'::text, 'done'::text]));
