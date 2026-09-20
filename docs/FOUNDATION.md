# ENTRY-2 — Foundation setup

Guia curto para o scaffold de fundação (sem auth, listagens, nem config real Supabase/Vercel).

## Pré-requisitos

- Node.js 20+
- npm

## Setup local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abrir http://localhost:3000.

Variáveis `NEXT_PUBLIC_SUPABASE_*` ficam vazias até existir projeto Supabase.

## Scripts

| Script | Função |
|--------|--------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Servir build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (unit) |
| `npm run test:e2e` | Playwright (smoke `/`) |

## Arquitectura de pastas

| Pasta | Papel |
|-------|--------|
| `app/` | Next.js App Router (UI / rotas) |
| `domain/` | Regras puras — **sem** Next/React/Supabase |
| `application/` | Use-cases / orquestração |
| `infrastructure/` | Adaptadores externos (placeholders) |
| `components/` | UI (shadcn) |
| `lib/` | Utilitários partilhados |

## CI

`.github/workflows/ci.yml`: `npm ci` → lint → typecheck → test (Vitest) → build. Sem deploy.

## Gates

- ENTRY-0 / ENTRY-1: docs em `docs/`
- ENTRY-2: este scaffold
- Auth / listagens / Supabase real: depois da fundação

Repo oficial: https://github.com/aguiartechia/Zona-oeste
