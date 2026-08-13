create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone_number text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.create_pingtag_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, phone_number)
  values (new.id, new.raw_user_meta_data ->> 'phone_number');
  return new;
end;
$$;

drop trigger if exists on_pingtag_auth_user_created on auth.users;
create trigger on_pingtag_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_pingtag_profile();

alter table public.profiles enable row level security;
drop policy if exists "owners read their profile" on public.profiles;
create policy "owners read their profile" on public.profiles for select to authenticated using (auth.uid() = id);

-- In Supabase Authentication settings, keep Phone provider disabled.
-- The server uses the service-role Admin API to create confirmed users.
