-- ENTRY-3: municipalities + profiles (auth.users linked)
-- Apply via Supabase CLI/dashboard when ready. SQL file only in-repo (no remote apply from app).
--
-- Locality privacy: RLS is row-level only. locality must NEVER be readable via public/anon
-- SELECT on profiles, nor via authenticated SELECT on other users' rows.
-- Public reads → profiles_public view. Owner locality → get_own_profile() SECURITY DEFINER.

-- ---------------------------------------------------------------------------
-- municipalities
-- ---------------------------------------------------------------------------
create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

insert into public.municipalities (slug, name)
values
  ('caldas-da-rainha', 'Caldas da Rainha'),
  ('alcobaca', 'Alcobaça'),
  ('torres-vedras', 'Torres Vedras')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  bio text null,
  avatar_url text null,
  municipality_id uuid not null references public.municipalities (id),
  parish text null,
  locality text null,
  onboarding_completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create index if not exists profiles_municipality_id_idx
  on public.profiles (municipality_id);

create index if not exists profiles_onboarding_completed_at_idx
  on public.profiles (onboarding_completed_at)
  where deleted_at is null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.municipalities enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Municipalities are publicly readable" on public.municipalities;
create policy "Municipalities are publicly readable"
  on public.municipalities
  for select
  to anon, authenticated
  using (true);

-- Row-level: completed non-deleted rows visible (columns still restricted by GRANT below)
drop policy if exists "Public can read completed profiles" on public.profiles;
create policy "Public can read completed profiles"
  on public.profiles
  for select
  to anon, authenticated
  using (
    deleted_at is null
    and onboarding_completed_at is not null
  );

drop policy if exists "Owner can select own profile" on public.profiles;
create policy "Owner can select own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Owner can insert own profile" on public.profiles;
create policy "Owner can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Owner can update own profile" on public.profiles;
create policy "Owner can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No DELETE policy for end users — soft-delete via update of deleted_at only.

-- Public view without locality
create or replace view public.profiles_public
with (security_invoker = true)
as
select
  id,
  display_name,
  bio,
  avatar_url,
  municipality_id,
  parish,
  created_at
from public.profiles
where deleted_at is null
  and onboarding_completed_at is not null;

-- ---------------------------------------------------------------------------
-- Column privileges: prevent locality leakage
-- ---------------------------------------------------------------------------
revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;

-- Public API reads must use profiles_public (no locality)
grant select on public.profiles_public to anon, authenticated;
grant select on public.municipalities to anon, authenticated;

-- Authenticated may SELECT non-locality columns on profiles (still gated by RLS).
-- locality is NOT granted — owner reads locality only via get_own_profile().
grant select (
  id,
  display_name,
  bio,
  avatar_url,
  municipality_id,
  parish,
  onboarding_completed_at,
  created_at,
  updated_at,
  deleted_at
) on public.profiles to authenticated;

grant insert, update on public.profiles to authenticated;

-- Owner full row including locality (SECURITY DEFINER bypasses column REVOKE for caller)
create or replace function public.get_own_profile()
returns setof public.profiles
language sql
security definer
set search_path = public
stable
as $$
  select * from public.profiles where id = auth.uid();
$$;

revoke all on function public.get_own_profile() from public;
grant execute on function public.get_own_profile() to authenticated;
