-- Caught by two-mock-user verification: Postgres RLS requires a row to be
-- visible under a SELECT policy before UPDATE/DELETE can target it — the
-- admin-only UPDATE policy alone let an admin's UPDATE match zero rows for
-- requests they don't own, because dealer_requests_owner_select only
-- covers the requester's own rows. Admins need to see every request to
-- review/approve it at all, so add that visibility explicitly.
create policy "dealer_requests_admin_select" on public.dealer_requests
  for select using (private.is_admin());
