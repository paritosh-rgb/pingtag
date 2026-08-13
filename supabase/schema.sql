create extension if not exists pgcrypto;

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  society_name text,
  status text not null default 'available' check (status in ('available', 'activated', 'disabled')),
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  vehicle_number text not null,
  phone_number text not null,
  address text,
  society_name text,
  flat_number text,
  tag_id uuid not null unique references public.tags(id),
  qr_token text not null unique,
  scan_url text not null,
  contact_preference text not null default 'push',
  subscription jsonb,
  qr_data_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  reason text not null,
  message text not null,
  location_lat numeric(9, 6),
  location_lng numeric(9, 6),
  location_accuracy integer,
  location_label text,
  location_source text,
  created_at timestamptz not null default now()
);

create table if not exists public.tag_scans (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  scanned_at timestamptz not null default now()
);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null unique references public.alerts(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  guest_token text not null unique,
  expires_at timestamptz not null default (now() + interval '48 hours'),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender text not null check (sender in ('owner', 'scanner')),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;
alter table public.vehicles enable row level security;
alter table public.alerts enable row level security;
alter table public.tag_scans enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "public can read tag availability" on public.tags;
create policy "public can read tag availability" on public.tags for select using (true);

drop policy if exists "owners read their vehicles" on public.vehicles;
create policy "owners read their vehicles" on public.vehicles for select to authenticated using (auth.uid() = owner_id);
drop policy if exists "owners insert their vehicles" on public.vehicles;
create policy "owners insert their vehicles" on public.vehicles for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "owners update their vehicles" on public.vehicles;
create policy "owners update their vehicles" on public.vehicles for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "owners activate available tags" on public.tags;
create policy "owners activate available tags" on public.tags for update to authenticated using (status = 'available') with check (status = 'activated');

drop policy if exists "public can create alerts" on public.alerts;
create policy "public can create alerts" on public.alerts for insert to anon, authenticated with check (true);
drop policy if exists "owners read their alerts" on public.alerts;
create policy "owners read their alerts" on public.alerts for select to authenticated using (exists (select 1 from public.vehicles where vehicles.id = alerts.vehicle_id and vehicles.owner_id = auth.uid()));
drop policy if exists "public can record tag scans" on public.tag_scans;
create policy "public can record tag scans" on public.tag_scans for insert to anon, authenticated with check (true);
drop policy if exists "owners read their tag scans" on public.tag_scans;
create policy "owners read their tag scans" on public.tag_scans for select to authenticated using (exists (select 1 from public.vehicles where vehicles.id = tag_scans.vehicle_id and vehicles.owner_id = auth.uid()));
drop policy if exists "owners read their chat threads" on public.chat_threads;
create policy "owners read their chat threads" on public.chat_threads for select to authenticated using (exists (select 1 from public.vehicles where vehicles.id = chat_threads.vehicle_id and vehicles.owner_id = auth.uid()));
drop policy if exists "owners read their chat messages" on public.chat_messages;
create policy "owners read their chat messages" on public.chat_messages for select to authenticated using (exists (select 1 from public.chat_threads join public.vehicles on vehicles.id = chat_threads.vehicle_id where chat_threads.id = chat_messages.thread_id and vehicles.owner_id = auth.uid()));

create or replace view public.public_vehicle_tags
with (security_invoker = false)
as
select id, vehicle_number, society_name, flat_number, qr_token, scan_url
from public.vehicles;

grant select on public.public_vehicle_tags to anon, authenticated;

-- The app's server route currently projects only public vehicle fields before returning them.
-- Do not expose the vehicles table directly to untrusted clients in production.
