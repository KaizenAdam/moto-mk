create table public.dealer_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  address text,
  phone text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.dealer_requests enable row level security;

create policy "dealer_requests_owner_insert" on public.dealer_requests
  for insert with check (profile_id = (select auth.uid()));

create policy "dealer_requests_owner_select" on public.dealer_requests
  for select using (profile_id = (select auth.uid()));

-- Security definer: lets a non-admin's policy check "am I admin" without
-- being blocked by profiles' own owner-only RLS, and avoids any risk of
-- cross-table RLS recursion.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and account_type = 'admin'
  );
$$;

create policy "dealer_requests_admin_update" on public.dealer_requests
  for update using (public.is_admin())
  with check (public.is_admin());
