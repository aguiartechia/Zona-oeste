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

## Remediação Formal Verification (2026-09-24)

### BLOCKER 2 — RLS `profiles_public` (Option A)

- **Ficheiro novo:** `supabase/migrations/20260924170000_entry3_fix_profiles_public.sql`
- **Nome aplicado (MCP `apply_migration`):** `entry3_fix_profiles_public`
- **Stamp remoto:** `20260924162016` (drift vs timestamp do ficheiro `20260924170000` — normal: o stamp remoto é o momento de aplicação via MCP, não o prefixo do ficheiro no repo)
- **Stamp da migração original remota:** `20260920151422` (`entry3_municipalities_profiles`) vs ficheiro `20260920160000_…` — mesmo tipo de drift, documentado aqui
- **Escolha:** Option A — recriar a vista com `security_invoker=false` + `security_barrier=true` (privilegios do owner da vista). Continua a omitir `locality` e a filtrar `deleted_at is null` + onboarding completo.
- **Porquê:** com `security_invoker=true`, o `REVOKE ALL` em `profiles` para `anon` bloqueava o acesso à tabela subjacente e a vista falhava para anónimos.
- **Verificação (read-only):** `anon` SELECT em `profiles_public` OK; `anon` sem SELECT em `profiles`/`locality`; `municipalities` legível; `authenticated` sem GRANT de coluna `locality` (dono via `get_own_profile()`).
- Option B **não** foi usada.

### BLOCKER 1 — CI branch trigger

- `.github/workflows/ci.yml` `on.push.branches` passou a incluir `entry-3-auth-profile` (além de `main`, `master`, `entry-2-foundation`).

### BLOCKER 3 — perfil / sessão (confirmação, sem alteração de código)

- Leituras de `profiles` na app são de dono/sessão (`app/perfil`, `app/actions/profile`, middleware onboarding) — não há leituras públicas que devam usar `profiles_public` nesta ENTRY.
- `proxy.ts` → `lib/supabase/middleware.ts`: gate de onboarding incompleto → `/onboarding`; perfil completo em `/onboarding` → `/perfil`.
- Magic link: mensagem genérica + cooldown 60s (`MAGIC_LINK_COOLDOWN_SECONDS`).
- Soft-delete: policies SELECT excluem `deleted_at`; sem policy DELETE para end users.
