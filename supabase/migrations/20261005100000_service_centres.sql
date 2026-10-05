-- Service centres directory (/service-centres). Admin-curated, public read.
-- Seeded from public directories on 5 Oct 2026; every seeded row is
-- verified = false until someone confirms it by phone.

create table public.service_centres (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  town text not null check (char_length(town) between 1 and 60),
  address text,
  phone text,
  website text check (website is null or website ~ '^https?://'),
  -- Short line shown on the card, e.g. "Official Triumph & Suzuki service".
  specialties text check (specialties is null or char_length(specialties) <= 300),
  -- Where the details came from, for whoever checks them next.
  source_url text,
  -- Confirmed by phone/visit. Unverified entries carry a "call ahead" note.
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_centres enable row level security;

create policy "service_centres_public_read" on public.service_centres
  for select using (true);
create policy "service_centres_admin_insert" on public.service_centres
  for insert with check (private.is_admin());
create policy "service_centres_admin_update" on public.service_centres
  for update using (private.is_admin());
create policy "service_centres_admin_delete" on public.service_centres
  for delete using (private.is_admin());

-- New tables start with ALL for anon/authenticated (see CLAUDE.md).
revoke all on public.service_centres from anon, authenticated;
grant select on public.service_centres to anon, authenticated;
grant insert, update, delete on public.service_centres to authenticated;

create trigger service_centres_set_updated_at
  before update on public.service_centres
  for each row execute function public.set_updated_at();

create index service_centres_town_idx on public.service_centres (town);

-- Seed. A field is only filled where sources agreed; conflicting phone
-- numbers or addresses were left empty rather than guessed.
insert into public.service_centres (name, town, address, phone, website, specialties, source_url) values
  ('Moto Group Service', 'Skopje', 'Sv. Kiril i Metodij 20', '+389 2 312 0706', 'https://www.motogroup.mk/',
   'Official Triumph & Suzuki service. Multi-brand servicing with original parts (BMW, Yamaha, Honda, Kawasaki, KTM, Ducati, Aprilia, Piaggio), diagnostics, tyres, suspension, transport',
   'https://zk.mk/moto-grup-servis'),
  ('Moto Azzurro (Yamaha)', 'Skopje', 'Mitropolit Teodosij Gologanov 51', '+389 2 322 3399', null,
   'Official Yamaha importer and dealer since 1997',
   'https://www.facebook.com/motoazzurro/'),
  ('KTM Macedonia', 'Skopje', 'Skupi 18', null, 'http://www.ktm.mk/',
   'Official KTM importer (Dynamix)',
   'https://motori.com.mk/domashni/ktm-povtorno-vo-makedonija-uvoznik-e-dynamix'),
  ('BMW Motorrad Macedonia', 'Skopje', 'Skupi 18', '071 262 227', null,
   'BMW motorcycles',
   'https://zk.mk/motorcikli-i-skuteri-popravki-i-servis/skopje'),
  ('Aprilia Moto Jove', 'Skopje', 'ul. 1506 br. 3, Momin Potok', '02 3096 353', 'https://motojove.com.mk/',
   'Aprilia; scooter and motorcycle parts and accessories',
   'https://zk.mk/motorcikli-i-skuteri-popravki-i-servis/skopje'),
  ('Sky Moto', 'Skopje', null, '02 3172 462', null,
   'Motorcycles, parts and accessories (Aerodrom)',
   'https://zk.mk/skaj-moto'),
  ('Keko Motors', 'Skopje', 'Todor Changov 83-a', null, null,
   'Motorcycle repair and maintenance (Aerodrom)',
   'https://zk.mk/motorcikli-i-skuteri-popravki-i-servis/skopje'),
  ('Moto Servis Faruk', 'Tetovo', 'Jane Sandanski 42', '070 640 777', null,
   'Motorcycle, scooter and bicycle repairs and parts',
   'https://zk.mk/moto-servis-faruk');
