-- Admin-authored marketing content (rally/track-day/group-ride listings),
-- no per-row ownership or moderation lifecycle like listings has — public
-- read, admin-only write. Kept as three separate write policies rather
-- than one `for all` so it doesn't double up with the select policy
-- (multiple_permissive_policies, same lesson learned on other tables).
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date,
  location text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events_public_read" on public.events
  for select using (true);

create policy "events_admin_insert" on public.events
  for insert with check (private.is_admin());

create policy "events_admin_update" on public.events
  for update using (private.is_admin());

create policy "events_admin_delete" on public.events
  for delete using (private.is_admin());
