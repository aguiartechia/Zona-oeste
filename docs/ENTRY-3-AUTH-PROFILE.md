# ENTRY-3 — Auth (magic link) + Profile

## Rotas (pt-PT)

| URL | Ficheiro | Notas |
|-----|----------|--------|
| `/entrar` | `app/entrar/page.tsx` | Form magic link (`useActionState`) |
| `/auth/callback` | `app/auth/callback/route.ts` | Troca `code` → sessão; `allowlistRedirect` |
| `/onboarding` | `app/onboarding/page.tsx` | Nome + município (+ bio/freguesia) |
| `/perfil` | `app/perfil/page.tsx` | Editar perfil + logout |

Protecção: `proxy.ts` → `lib/supabase/middleware.ts` (sessão + onboarding incompleto → `/onboarding`).

## Camadas

- **domain/profile.ts** — `validateEmail`, `validateDisplayName`, `isProfileComplete`, `allowlistRedirect`, `toPublicProfile`
- **application/auth.ts** — cooldown, mensagem genérica, parse email
- **application/profile.ts** — parse onboarding / update
- **app/actions/** — server actions (Supabase + cookies)
- **lib/supabase/** — browser/server/middleware clients (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- **lib/observability.ts** — `logEvent` (JSON sem emails/PII)

## Privacidade (SQL)

Migração `supabase/migrations/20260920160000_entry3_municipalities_profiles.sql`:

- Vista `profiles_public` sem `locality`
- `get_own_profile()` SECURITY DEFINER para o dono ler `locality`
- `REVOKE` de `locality` em SELECT directo para `authenticated`/`anon`

## Observabilidade

Eventos: `auth.magic_link_requested`, `auth.logout`, `auth.callback`, `profile.created`, `profile.updated`, `onboarding.completed`.

## Testes

- Unit: `domain/profile.test.ts`, `application/auth.test.ts` (cooldown)
- E2E smoke: `/` e `/entrar` (sem OTP completo)
