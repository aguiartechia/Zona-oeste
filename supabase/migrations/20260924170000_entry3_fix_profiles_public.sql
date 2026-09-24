-- Fix: profiles_public with security_invoker=true fails for anon because
-- REVOKE ALL on profiles from anon blocks underlying table access.
-- Recreate as owner-privileged view (security_invoker=false) + security_barrier.
-- Still omits locality; still filters soft-deleted and incomplete onboarding.

drop view if exists public.profiles_public;

create view public.profiles_public
with (security_barrier = true, security_invoker = false)
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

grant select on public.profiles_public to anon, authenticated;

-- Keep locality locked: anon must not SELECT profiles columns including locality
revoke all on public.profiles from anon;
-- authenticated: keep existing column grants WITHOUT locality (re-assert)
revoke all on public.profiles from authenticated;
grant select (
  id, display_name, bio, avatar_url, municipality_id, parish,
  onboarding_completed_at, created_at, updated_at, deleted_at
) on public.profiles to authenticated;
grant insert, update on public.profiles to authenticated;
