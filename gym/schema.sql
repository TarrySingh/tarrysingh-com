-- Dedicated stronger-gym Supabase project. Applied 2026-11-05.
create table public.gym_records (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 kind text not null check (kind in ('workout','measurement')),
 occurred_at timestamptz not null,
 payload jsonb not null check (jsonb_typeof(payload) = 'object'),
 created_at timestamptz not null default now()
);
alter table public.gym_records enable row level security;
revoke all on public.gym_records from public, anon, authenticated;
grant select, insert, update, delete on public.gym_records to authenticated;
create policy gym_select_own on public.gym_records for select to authenticated using ((select auth.uid()) = user_id);
create policy gym_insert_own on public.gym_records for insert to authenticated with check ((select auth.uid()) = user_id);
create policy gym_update_own on public.gym_records for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy gym_delete_own on public.gym_records for delete to authenticated using ((select auth.uid()) = user_id);
create index gym_records_user_kind_date on public.gym_records(user_id, kind, occurred_at desc);
