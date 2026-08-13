-- Run this once on an existing database to enable anonymous alert conversations.
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

alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "owners read their chat threads" on public.chat_threads;
create policy "owners read their chat threads" on public.chat_threads for select to authenticated using (exists (select 1 from public.vehicles where vehicles.id = chat_threads.vehicle_id and vehicles.owner_id = auth.uid()));

drop policy if exists "owners read their chat messages" on public.chat_messages;
create policy "owners read their chat messages" on public.chat_messages for select to authenticated using (exists (select 1 from public.chat_threads join public.vehicles on vehicles.id = chat_threads.vehicle_id where chat_threads.id = chat_messages.thread_id and vehicles.owner_id = auth.uid()));
