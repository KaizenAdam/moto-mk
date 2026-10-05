-- Map pins for /service-centres. Null until an admin places the pin
-- (Admin -> Service centres -> Set location); unplaced centres are listed
-- under the map rather than pinned at a guessed spot. Both or neither.
alter table public.service_centres
  add column lat double precision check (lat between -90 and 90),
  add column lng double precision check (lng between -180 and 180),
  add constraint service_centres_lat_lng_together check ((lat is null) = (lng is null));
