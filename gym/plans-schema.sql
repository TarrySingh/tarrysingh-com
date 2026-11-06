-- Per-user session templates. The initial programme is built into the client.
create table public.gym_plans (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  sessions jsonb not null check (jsonb_typeof(sessions) = 'object'),
  custom_exercises jsonb not null default '[]'::jsonb check (jsonb_typeof(custom_exercises) = 'array')
);
alter table public.gym_plans enable row level security;
revoke all on public.gym_plans from public, anon, authenticated;
grant select, insert, update, delete on public.gym_plans to authenticated;
create policy gym_plans_select on public.gym_plans for select to authenticated using ((select auth.uid()) = user_id);
create policy gym_plans_insert on public.gym_plans for insert to authenticated with check ((select auth.uid()) = user_id);
create policy gym_plans_update on public.gym_plans for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy gym_plans_delete on public.gym_plans for delete to authenticated using ((select auth.uid()) = user_id);
