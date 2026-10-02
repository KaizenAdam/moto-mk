-- Step 3: listing descriptions and contacting the seller.

-- 1. Free-text description. Capped so a listing page stays a listing page.
alter table public.listings add column description text;
alter table public.listings
  add constraint listings_description_length check (description is null or char_length(description) <= 3000);

-- The re-review trigger must cover every column a buyer reads, or a seller
-- can change it after approval unseen. Description is one now.
create or replace function public.require_rereview_on_edit()
returns trigger
language plpgsql
set search_path = public, private
as $fn$
begin
  if old.status = 'active' and new.status = 'active' and not private.is_admin()
     and (new.title, new.make, new.model, new.year, new.engine_cc, new.engine_type,
          new.licence_category, new.riding_style, new.mileage_km, new.town, new.description)
         is distinct from
         (old.title, old.make, old.model, old.year, old.engine_cc, old.engine_type,
          old.licence_category, old.riding_style, old.mileage_km, old.town, old.description)
  then
    new.status := 'pending';
  end if;
  return new;
end;
$fn$;

-- 2. A seller's phone is private (profiles has no public read). Buyers get
-- it only through this function: signed in, and only for a listing they
-- can see anyway (active, their own, or they're an admin). Signed-out
-- visitors and scrapers get nothing. Security definer so it can read the
-- one column it returns without opening profiles up.
create or replace function public.get_seller_contact(p_listing_id uuid)
returns table (name text, phone text)
language sql
stable
security definer
set search_path = public, private
as $fn$
  select p.name, p.phone
    from public.listings l
    join public.profiles p on p.id = l.seller_id
   where l.id = p_listing_id
     and (select auth.uid()) is not null
     and (l.status = 'active' or l.seller_id = (select auth.uid()) or private.is_admin());
$fn$;

revoke execute on function public.get_seller_contact(uuid) from public, anon;
grant execute on function public.get_seller_contact(uuid) to authenticated;
