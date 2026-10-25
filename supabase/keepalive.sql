-- Heartbeat for .github/workflows/keep-supabase-awake.yml.
-- Run once in Supabase > SQL Editor. Safe to re-run.
-- The table has RLS on and no policies, so the anon key can only touch it
-- through keepalive(), which writes one fixed row and nothing else.

create table if not exists public.keepalive (
  id int primary key,
  pinged_at timestamptz not null default now()
);
alter table public.keepalive enable row level security;

create or replace function public.keepalive()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  insert into public.keepalive (id, pinged_at) values (1, now())
  on conflict (id) do update set pinged_at = now()
  returning pinged_at;
$$;

revoke all on function public.keepalive() from public;
grant execute on function public.keepalive() to anon;
