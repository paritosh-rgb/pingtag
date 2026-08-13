insert into public.tags (code, status)
values
  ('PING-TEST-001', 'available'),
  ('PING-TEST-002', 'available'),
  ('PING-TEST-003', 'available')
on conflict (code) do nothing;
