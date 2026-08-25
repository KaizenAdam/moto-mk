create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  make text not null,
  model text not null,
  year int,
  engine_cc int,
  engine_type text check (engine_type in ('2-stroke','4-stroke','electric')),
  licence_category text check (licence_category in ('AM','A1','A2','A')),
  riding_style text,
  mileage_km int,
  price_eur numeric(10,2) not null,
  town text,
  status text not null default 'active' check (status in ('active','sold','draft','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.listings enable row level security;

-- Public can see active listings; the seller can always see their own
-- (including drafts) — this is exactly what the two-mock-user test checks.
create policy "listings_read" on public.listings
  for select using (
    status = 'active' or seller_id = (select auth.uid())
  );

create policy "listings_owner_insert" on public.listings
  for insert with check (seller_id = (select auth.uid()));

create policy "listings_owner_update" on public.listings
  for update using (seller_id = (select auth.uid()));

create policy "listings_owner_delete" on public.listings
  for delete using (seller_id = (select auth.uid()));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();
