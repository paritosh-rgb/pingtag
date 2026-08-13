-- Run this once on an existing database to assign printed tags to society batches.
alter table public.tags
  add column if not exists society_name text;

create or replace view public.public_vehicle_tags
with (security_invoker = false)
as
select
  vehicles.id,
  vehicles.vehicle_number,
  coalesce(vehicles.society_name, tags.society_name) as society_name,
  vehicles.flat_number,
  vehicles.qr_token,
  vehicles.scan_url
from public.vehicles
join public.tags on tags.id = vehicles.tag_id;

grant select on public.public_vehicle_tags to anon, authenticated;
