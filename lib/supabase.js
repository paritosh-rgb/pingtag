import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && key);

export function getSupabase(accessToken) {
  if (!supabaseConfigured) return null;

  return createClient(url, key, {
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const schemaSql = `
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  status text not null default 'available' check (status in ('available', 'activated', 'disabled')),
  created_at timestamptz not null default now()
);

create table public.vehicles (
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

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  reason text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;
alter table public.tags enable row level security;
alter table public.alerts enable row level security;
create policy "owners manage their vehicles" on public.vehicles for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners can activate available tags" on public.tags for select using (true);
create policy "authenticated owners activate available tags" on public.tags for update to authenticated using (status = 'available') with check (status = 'activated');
create policy "public scan can read vehicle display fields" on public.vehicles for select using (true);
create policy "public scan can create alerts" on public.alerts for insert with check (true);
create policy "owners read their alerts" on public.alerts for select using (exists (select 1 from public.vehicles where vehicles.id = alerts.vehicle_id and vehicles.owner_id = auth.uid()));
`;
