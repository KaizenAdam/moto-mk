-- Advisor flagged owner+admin as two separate permissive policies per
-- action (Postgres must evaluate both per row). Same semantics, one policy.
drop policy "listings_read" on public.listings;
drop policy "listings_admin_select" on public.listings;
create policy "listings_read" on public.listings
  for select using (
    status = 'active' or seller_id = (select auth.uid()) or private.is_admin()
  );

drop policy "listings_owner_update" on public.listings;
drop policy "listings_admin_update" on public.listings;
create policy "listings_update" on public.listings
  for update using (
    seller_id = (select auth.uid()) or private.is_admin()
  );

drop policy "dealer_requests_owner_select" on public.dealer_requests;
drop policy "dealer_requests_admin_select" on public.dealer_requests;
create policy "dealer_requests_select" on public.dealer_requests
  for select using (
    profile_id = (select auth.uid()) or private.is_admin()
  );
