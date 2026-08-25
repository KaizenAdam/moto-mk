create table public.saved_listings (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, listing_id)
);

alter table public.saved_listings enable row level security;

create policy "saved_listings_owner_all" on public.saved_listings
  for all using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
