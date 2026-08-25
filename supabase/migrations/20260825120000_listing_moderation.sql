-- 1. New listings default to pending review; add pending/rejected to the
-- allowed set.
alter table public.listings drop constraint listings_status_check;
alter table public.listings add constraint listings_status_check
  check (status in ('active','sold','draft','removed','pending','rejected'));
alter table public.listings alter column status set default 'pending';

-- 2. Same lesson as dealer_requests: an admin-only UPDATE is meaningless if
-- the admin can never see (and thus target) the row in the first place.
-- listings_read only covers 'active' or the seller's own rows, so a
-- pending/draft/rejected listing is invisible to an admin without this.
create policy "listings_admin_select" on public.listings
  for select using (private.is_admin());

-- Also: there was no UPDATE policy at all for a non-owner, so an admin
-- could not have updated *any* listing regardless of the trigger below —
-- listings_owner_update only matches seller_id = auth.uid(). Add the
-- admin counterpart (no explicit WITH CHECK needed; it defaults to the
-- USING expression, same style as the owner policy).
create policy "listings_admin_update" on public.listings
  for update using (private.is_admin());

-- Follow-on of the same fix: extend listing_photos visibility so an admin
-- reviewing a pending listing can also see its photos.
drop policy "listing_photos_read" on public.listing_photos;
create policy "listing_photos_read" on public.listing_photos
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_photos.listing_id
        and (l.status = 'active' or l.seller_id = (select auth.uid()) or private.is_admin())
    )
  );

-- 3. Only an admin can transition a listing's status to 'active'. Scoped to
-- an actual transition (old <> new) so an unrelated field edit that simply
-- resends the current status isn't blocked.
create or replace function public.enforce_listing_activation()
returns trigger
language plpgsql
set search_path = public, private
as $$
begin
  if new.status = 'active' and old.status is distinct from new.status and not private.is_admin() then
    raise exception 'Only an admin can approve a listing (set status to active)';
  end if;
  return new;
end;
$$;

create trigger listings_enforce_activation
  before update on public.listings
  for each row execute function public.enforce_listing_activation();
