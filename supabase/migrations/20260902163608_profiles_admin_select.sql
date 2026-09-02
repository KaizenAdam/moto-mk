-- profiles_owner_select was the only SELECT policy on the base table —
-- unlike listings_read and dealer_requests_select, it never got an admin
-- arm. An admin building a "list every user" view otherwise cannot see
-- anything beyond the three columns public_profiles exposes to anyone.
-- Merged into one policy (not a second permissive one) per this project's
-- own multiple_permissive_policies lesson.
drop policy "profiles_owner_select" on public.profiles;

create policy "profiles_select" on public.profiles
  for select using ((select auth.uid()) = id or private.is_admin());
