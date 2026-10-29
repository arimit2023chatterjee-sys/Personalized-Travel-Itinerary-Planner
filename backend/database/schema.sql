-- Personalized Travel Itinerary Planner
-- Run this in the Supabase SQL editor (Milestone 2).

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  session_id text,
  origin text,
  start_date date,
  end_date date,
  duration_days integer not null check (duration_days between 1 and 21),
  budget_level text not null check (budget_level in ('budget', 'moderate', 'luxury')),
  pace text not null check (pace in ('relaxed', 'balanced', 'packed')),
  travel_styles text[] not null default '{}',
  vibe text,
  companions text,
  dietary text,
  mobility_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  country text not null,
  region text,
  summary text not null,
  tags text[] not null default '{}',
  budget_level text not null check (budget_level in ('budget', 'moderate', 'luxury')),
  min_days integer not null default 3,
  max_days integer not null default 10,
  vibe_scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  session_id text,
  preference_id uuid references public.trip_preferences (id) on delete set null,
  destination_slug text not null,
  title text not null,
  status text not null default 'saved' check (status in ('draft', 'saved', 'exported')),
  itinerary jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trip_preferences_session_idx on public.trip_preferences (session_id);
create index if not exists trips_session_idx on public.trips (session_id);
create index if not exists trips_user_idx on public.trips (user_id);

alter table public.profiles enable row level security;
alter table public.trip_preferences enable row level security;
alter table public.destinations enable row level security;
alter table public.trips enable row level security;

drop policy if exists "public read destinations" on public.destinations;
create policy "public read destinations"
  on public.destinations for select
  using (true);

drop policy if exists "users manage own preferences" on public.trip_preferences;
create policy "users manage own preferences"
  on public.trip_preferences for all
  using (
    auth.uid() = user_id
    or (user_id is null and session_id is not null)
  )
  with check (
    auth.uid() = user_id
    or (user_id is null and session_id is not null)
  );

drop policy if exists "users manage own trips" on public.trips;
create policy "users manage own trips"
  on public.trips for all
  using (
    auth.uid() = user_id
    or (user_id is null and session_id is not null)
  )
  with check (
    auth.uid() = user_id
    or (user_id is null and session_id is not null)
  );

create or replace function public.touch_trip_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trips_updated_at on public.trips;
create trigger trips_updated_at
  before update on public.trips
  for each row execute function public.touch_trip_updated_at();
