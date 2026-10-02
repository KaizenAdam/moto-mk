-- Step 2 hardening. Applied via execute_sql (see CLAUDE.md on why).

-- 1. A seller could get a listing approved and then rewrite it (different
-- bike, different town) without anyone looking again. Any change to what
-- the listing describes sends an active listing back to pending. Price is
-- deliberately exempt: dropping the price is normal and shouldn't hide the
-- listing for a day. Fires after listings_enforce_activation (alphabetical),
-- which only blocks moves *to* active, so the two don't interfere.
create or replace function public.require_rereview_on_edit()
returns trigger
language plpgsql
set search_path = public, private
as $fn$
begin
  if old.status = 'active' and new.status = 'active' and not private.is_admin()
     and (new.title, new.make, new.model, new.year, new.engine_cc, new.engine_type,
          new.licence_category, new.riding_style, new.mileage_km, new.town)
         is distinct from
         (old.title, old.make, old.model, old.year, old.engine_cc, old.engine_type,
          old.licence_category, old.riding_style, old.mileage_km, old.town)
  then
    new.status := 'pending';
  end if;
  return new;
end;
$fn$;

create trigger listings_require_rereview
  before update on public.listings
  for each row execute function public.require_rereview_on_edit();

-- Same for photos: adding or swapping a photo on a live listing needs a
-- fresh look. Removing one doesn't. Runs as the caller, who must own the
-- listing anyway for listing_photos' own policies to have let them in.
create or replace function public.require_rereview_on_photo_change()
returns trigger
language plpgsql
set search_path = public, private
as $fn$
begin
  if not private.is_admin() then
    update public.listings set status = 'pending'
     where id = new.listing_id and status = 'active';
  end if;
  return new;
end;
$fn$;

create trigger listing_photos_require_rereview
  after insert or update on public.listing_photos
  for each row execute function public.require_rereview_on_photo_change();

-- 2. Reason shown to the seller when an admin rejects a listing.
alter table public.listings add column rejection_reason text;

-- 3. Server-side sanity checks (the form's min/max are only a browser hint).
alter table public.listings
  add constraint listings_price_positive check (price_eur > 0),
  add constraint listings_year_range check (year is null or year between 1900 and 2100),
  add constraint listings_mileage_nonneg check (mileage_km is null or mileage_km >= 0),
  add constraint listings_cc_nonneg check (engine_cc is null or engine_cc >= 0);

-- 4. The photo bucket accepted any file of any size. Images only, 10 MB max.
update storage.buckets
   set file_size_limit = 10485760,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
 where id = 'listing-photos';
