-- Private bucket: a public bucket skips RLS entirely on GET, which would
-- leak draft-listing photos to anyone with the URL. Objects are uploaded
-- under `{listing_id}/{filename}` so storage.foldername() can recover the
-- listing id for the ownership/visibility check.
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', false)
on conflict (id) do nothing;

create policy "listing_photos_storage_read" on storage.objects
  for select using (
    bucket_id = 'listing-photos'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and (l.status = 'active' or l.seller_id = (select auth.uid()))
    )
  );

create policy "listing_photos_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'listing-photos'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and l.seller_id = (select auth.uid())
    )
  );

create policy "listing_photos_storage_update" on storage.objects
  for update using (
    bucket_id = 'listing-photos'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and l.seller_id = (select auth.uid())
    )
  );

create policy "listing_photos_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'listing-photos'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and l.seller_id = (select auth.uid())
    )
  );
