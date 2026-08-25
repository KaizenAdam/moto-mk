-- 1. set_updated_at was missing a locked search_path (advisor WARN).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. is_admin() was flagged because, living in `public`, it's auto-exposed
-- by PostgREST as a directly-callable RPC (/rest/v1/rpc/is_admin) for any
-- signed-in or anonymous caller. It only needs to be callable *from inside
-- the RLS policy that uses it* — so move it to a `private` schema, which
-- PostgREST never exposes, per Supabase's own documented pattern for this
-- exact situation. `authenticated`/`anon` still need USAGE+EXECUTE so the
-- policy check itself keeps working.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

drop policy "dealer_requests_admin_update" on public.dealer_requests;
drop function public.is_admin();

create function private.is_admin()
returns boolean
language sql
security definer
set search_path = private, public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and account_type = 'admin'
  );
$$;

grant execute on function private.is_admin() to anon, authenticated;

create policy "dealer_requests_admin_update" on public.dealer_requests
  for update using (private.is_admin())
  with check (private.is_admin());

-- 3. handle_new_user() is only ever invoked by the auth.users trigger —
-- it has no business being callable directly as a public RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 4. listing_photos had two permissive SELECT policies doing overlapping
-- work (listing_photos_read, and listing_photos_owner_write's "for all"
-- implicitly including select) — Postgres evaluates every matching
-- permissive policy per query, so this doubled the check for no benefit
-- (listing_photos_read already covers the owner's own rows). Split the
-- write policy into insert/update/delete only.
drop policy "listing_photos_owner_write" on public.listing_photos;

create policy "listing_photos_owner_insert" on public.listing_photos
  for insert with check (
    exists (select 1 from public.listings l where l.id = listing_photos.listing_id and l.seller_id = (select auth.uid()))
  );

create policy "listing_photos_owner_update" on public.listing_photos
  for update using (
    exists (select 1 from public.listings l where l.id = listing_photos.listing_id and l.seller_id = (select auth.uid()))
  );

create policy "listing_photos_owner_delete" on public.listing_photos
  for delete using (
    exists (select 1 from public.listings l where l.id = listing_photos.listing_id and l.seller_id = (select auth.uid()))
  );

-- 5. Missing covering indexes on FK columns (advisor INFO).
create index if not exists dealer_requests_profile_id_idx on public.dealer_requests(profile_id);
create index if not exists listing_photos_listing_id_idx on public.listing_photos(listing_id);
create index if not exists listings_seller_id_idx on public.listings(seller_id);
create index if not exists saved_listings_listing_id_idx on public.saved_listings(listing_id);
