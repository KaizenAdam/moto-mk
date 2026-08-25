-- Close the insert-time gap: listings_owner_insert's WITH CHECK never
-- restricted status, so a non-admin could insert a new listing with
-- status='active' directly and skip the pending-default queue entirely.
-- Same rule as the update case (hard error, not silent coercion), fired
-- from the same trigger function rather than duplicating the check —
-- TG_OP = 'INSERT' short-circuits before OLD is referenced, since OLD
-- doesn't exist on insert.
create or replace function public.enforce_listing_activation()
returns trigger
language plpgsql
set search_path = public, private
as $$
begin
  if new.status = 'active'
     and (tg_op = 'INSERT' or old.status is distinct from new.status)
     and not private.is_admin() then
    raise exception 'Only an admin can approve a listing (set status to active)';
  end if;
  return new;
end;
$$;

drop trigger listings_enforce_activation on public.listings;
create trigger listings_enforce_activation
  before insert or update on public.listings
  for each row execute function public.enforce_listing_activation();
