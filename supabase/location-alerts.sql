alter table public.alerts
  add column if not exists location_lat numeric(9, 6),
  add column if not exists location_lng numeric(9, 6),
  add column if not exists location_accuracy integer;

alter table public.alerts
  drop constraint if exists alerts_location_pair_check;

alter table public.alerts
  add constraint alerts_location_pair_check
  check ((location_lat is null and location_lng is null) or (location_lat between -90 and 90 and location_lng between -180 and 180));
