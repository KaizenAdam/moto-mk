-- profiles: one row per auth user, owner-only on the base table.
-- Public read is exposed only through the public_profiles view below.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  town text,
  account_type text not null default 'user' check (account_type in ('user','dealer','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_owner_select" on public.profiles
  for select using ((select auth.uid()) = id);

create policy "profiles_owner_insert" on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "profiles_owner_update" on public.profiles
  for update using ((select auth.uid()) = id);

-- Public view: only the columns that are safe for anyone to read.
-- Views run with the creator's privileges by default (no security_invoker),
-- so this bypasses RLS on the base table by design, exposing exactly the
-- three columns selected here — nothing else on profiles is reachable
-- without being the row's owner.
create view public.public_profiles as
  select id, name, town, account_type from public.profiles;

grant select on public.public_profiles to anon, authenticated;

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
