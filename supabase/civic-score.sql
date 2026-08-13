-- Run this once on an existing database to enable private Civic Score tracking.
create table if not exists public.tag_scans (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  scanned_at timestamptz not null default now()
);

alter table public.tag_scans enable row level security;

drop policy if exists "public can record tag scans" on public.tag_scans;
create policy "public can record tag scans" on public.tag_scans for insert to anon, authenticated with check (true);

drop policy if exists "owners read their tag scans" on public.tag_scans;
create policy "owners read their tag scans" on public.tag_scans for select to authenticated using (exists (select 1 from public.vehicles where vehicles.id = tag_scans.vehicle_id and vehicles.owner_id = auth.uid()));
