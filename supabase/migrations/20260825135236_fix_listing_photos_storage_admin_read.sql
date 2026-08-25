-- listing_photos_storage_read never got the OR private.is_admin() clause
-- that listing_photos_read (the table-row policy) already has from the
-- listing-moderation phase — an admin could see a pending listing's photo
-- rows but not actually load the image bytes. Same bug class as the
-- dealer_requests/listings SELECT-visibility issues found earlier, just at
-- the Storage layer.
drop policy "listing_photos_storage_read" on storage.objects;

create policy "listing_photos_storage_read" on storage.objects
  for select using (
    bucket_id = 'listing-photos'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and (l.status = 'active' or l.seller_id = (select auth.uid()) or private.is_admin())
    )
  );
