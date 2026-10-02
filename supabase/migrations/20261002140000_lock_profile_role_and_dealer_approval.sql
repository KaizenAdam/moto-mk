-- Applied 2 Oct 2026 via execute_sql (apply_migration timed out), with the
-- version row inserted into supabase_migrations.schema_migrations by hand.
-- The policy change was applied as `alter policy` (same result as the
-- drop/create below, which the MCP tool stalls on).

-- 1. profiles_owner_update let a user update ANY column of their own row,
-- including account_type — so anyone could make themselves 'admin' (and
-- private.is_admin() reads exactly that column). Column-level grants close
-- it: users may only edit name/phone/town. account_type, id and created_at
-- are no longer writable through the Data API at all; role changes happen
-- only in security-definer code (the dealer-approval trigger below).
revoke update on public.profiles from anon, authenticated;
grant update (name, phone, town) on public.profiles to authenticated;

-- 2. dealer_requests_owner_insert only checked profile_id, so a user could
-- insert a request already marked 'approved'. New requests must be pending.
alter policy "dealer_requests_owner_insert" on public.dealer_requests
  with check (profile_id = (select auth.uid()) and status = 'pending');

-- 3. Approving a dealer request never actually made the user a dealer.
-- Do it in the same statement as the approval; rejecting a previously
-- approved request reverts it. Never touches an admin.
create or replace function public.apply_dealer_request_decision()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $fn$
begin
  if new.status is distinct from old.status then
    if new.status = 'approved' then
      update public.profiles set account_type = 'dealer'
       where id = new.profile_id and account_type = 'user';
    elsif old.status = 'approved' then
      update public.profiles set account_type = 'user'
       where id = new.profile_id and account_type = 'dealer';
    end if;
  end if;
  return new;
end;
$fn$;

revoke execute on function public.apply_dealer_request_decision() from public, anon, authenticated;

create trigger dealer_requests_apply_decision
  after update on public.dealer_requests
  for each row execute function public.apply_dealer_request_decision();
