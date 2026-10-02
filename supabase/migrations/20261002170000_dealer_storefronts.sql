-- Dealer storefronts: one public page per approved dealer at /dealers/<slug>.

-- URL-safe slug from a business name. Macedonian Cyrillic is transliterated
-- first (multi-letter sounds before the single-letter translate), so
-- "Мото Центар Охрид" becomes "moto-centar-ohrid", not "".
create or replace function private.slugify(input text)
returns text
language sql
immutable
set search_path = private, public
as $fn$
  select coalesce(nullif(trim(both '-' from regexp_replace(
    translate(
      replace(replace(replace(replace(replace(replace(replace(replace(replace(
        lower(input),
        'ж', 'zh'), 'ч', 'ch'), 'ш', 'sh'), 'џ', 'dzh'), 'љ', 'lj'), 'њ', 'nj'),
        'ѕ', 'dz'), 'ѓ', 'gj'), 'ќ', 'kj'),
      'абвгдезијклмнопрстуфхц', 'abvgdezijklmnoprstufhc'),
    '[^a-z0-9]+', '-', 'g')), ''), 'dealer');
$fn$;

create table public.dealers (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 80),
  business_name text not null check (char_length(business_name) between 1 and 120),
  town text,
  address text,
  -- The business line — public on the storefront, unlike a profile phone.
  phone text,
  about text check (about is null or char_length(about) <= 2000),
  -- false when the dealer approval is revoked: the page disappears but
  -- the dealer's edits are kept if they're approved again.
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dealers enable row level security;

-- Public read of live storefronts; a dealer always sees their own, admins all.
create policy "dealers_read" on public.dealers
  for select using (active or profile_id = (select auth.uid()) or private.is_admin());

-- Dealers edit their own storefront. No insert/delete policy: rows are
-- created and deactivated only by the approval trigger below.
create policy "dealers_owner_update" on public.dealers
  for update using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- Supabase's default privileges give anon/authenticated ALL on every new
-- table, which would make the column list below meaningless (verified: a
-- dealer could change their own slug and active flag). Start from nothing.
revoke all on public.dealers from anon, authenticated;
grant select on public.dealers to anon, authenticated;
-- Column-level: slug (the URL) and active (the approval) are not theirs to change.
grant update (business_name, town, address, phone, about) on public.dealers to authenticated;

create trigger dealers_set_updated_at
  before update on public.dealers
  for each row execute function public.set_updated_at();

-- Approval now also opens (or re-opens) the storefront; revoking closes it.
create or replace function public.apply_dealer_request_decision()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $fn$
declare
  base text;
  candidate text;
  n int := 1;
begin
  if new.status is distinct from old.status then
    if new.status = 'approved' then
      update public.profiles set account_type = 'dealer'
       where id = new.profile_id and account_type = 'user';

      if exists (select 1 from public.dealers where profile_id = new.profile_id) then
        update public.dealers set active = true where profile_id = new.profile_id;
      else
        base := private.slugify(new.business_name);
        candidate := base;
        while exists (select 1 from public.dealers where slug = candidate) loop
          n := n + 1;
          candidate := base || '-' || n;
        end loop;
        insert into public.dealers (profile_id, slug, business_name, address, phone, town)
        select new.profile_id, candidate, new.business_name, new.address, new.phone, p.town
          from public.profiles p where p.id = new.profile_id;
      end if;
    elsif old.status = 'approved' then
      update public.profiles set account_type = 'user'
       where id = new.profile_id and account_type = 'dealer';
      update public.dealers set active = false where profile_id = new.profile_id;
    end if;
  end if;
  return new;
end;
$fn$;

-- Backfill: dealers approved before storefronts existed.
insert into public.dealers (profile_id, slug, business_name, address, phone, town)
select distinct on (r.profile_id)
       r.profile_id, private.slugify(r.business_name), r.business_name, r.address, r.phone, p.town
  from public.dealer_requests r
  join public.profiles p on p.id = r.profile_id
 where r.status = 'approved' and p.account_type = 'dealer'
 order by r.profile_id, r.created_at desc
on conflict do nothing;
