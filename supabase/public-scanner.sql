create or replace view public.public_vehicle_tags
with (security_invoker = false)
as
select
  id,
  vehicle_number,
  society_name,
  flat_number,
  qr_token,
  scan_url
from public.vehicles;

grant select on public.public_vehicle_tags to anon, authenticated;
