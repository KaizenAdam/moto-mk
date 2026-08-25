create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0
);

alter table public.listing_photos enable row level security;

-- Readable wherever the parent listing is readable.
create policy "listing_photos_read" on public.listing_photos
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_photos.listing_id
        and (l.status = 'active' or l.seller_id = (select auth.uid()))
    )
  );

-- Writable only by the listing's owner.
create policy "listing_photos_owner_write" on public.listing_photos
  for all using (
    exists (
      select 1 from public.listings l
      where l.id = listing_photos.listing_id
        and l.seller_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_photos.listing_id
        and l.seller_id = (select auth.uid())
    )
  );
