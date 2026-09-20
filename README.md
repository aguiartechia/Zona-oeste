# Zona Oeste Trocas

Plataforma local de trocas e anúncios para a região Oeste de Portugal.

**Repositório oficial:** https://github.com/aguiartechia/Zona-oeste

## Estado dos gates

| Gate | Estado |
|------|--------|
| ENTRY-0 Discovery | Feito |
| ENTRY-1 Architecture Contract | Feito |
| ENTRY-2 Foundation (este scaffold) | Em curso / entregue |

Ver `docs/ENTRY-0-DISCOVERY-SUMMARY.md`, `docs/ENTRY-1-ARCHITECTURE-CONTRACT.md` e `docs/FOUNDATION.md`.

## Decisões bloqueadas (resumo)

- **Geo piloto:** Caldas da Rainha / Alcobaça / Torres Vedras
- **Auth:** magic link (mais tarde; sem auth nesta landing)
- **Listagens:** públicas (mais tarde)
- **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Vitest + Playwright + Supabase (cliente a ligar depois) + Vercel (deploy futuro)

## Arquitectura de pastas

| Pasta | Papel |
|-------|--------|
| `app/` | Next.js App Router — UI e rotas |
| `domain/` | Domínio puro (sem Next/React/Supabase) |
| `application/` | Use-cases / orquestração |
| `infrastructure/` | Adaptadores externos (placeholders) |
| `components/` | Componentes UI (shadcn) |
| `lib/` | Utilitários |

## Como correr

Pré-requisitos: Node.js 20+ e npm.

```bash
cp .env.example .env.local
# (opcional por agora) preencher NEXT_PUBLIC_SUPABASE_* quando houver projeto

npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Servir build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run test` | Vitest (unit / smoke) |
| `npm run test:e2e` | Playwright (e2e smoke em `/`) |

## UI / shadcn

shadcn/ui inicializado com preset **base-nova**. Componente `Button` em `components/ui/button.tsx`. Tailwind v4 via `app/globals.css`.

```bash
npx shadcn@latest add <component>
```

## Ambiente (futuro)

- Apenas `.env.example` no repositório (placeholders vazios: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Não fazer commit de `.env` / `.env.local` nem de chaves reais.
- Sem configuração real de Supabase ou Vercel nesta fundação.

## CI

`.github/workflows/ci.yml` em push/PR: `npm ci` → lint → typecheck → test (Vitest) → build. **Sem deploy.**

## Próximos passos (após ENTRY-2)

1. Ligar remoto GitHub e fazer push inicial (fora deste scaffold).
2. Provisionar Supabase e preencher variáveis locais.
3. Implementar auth (magic link) e listagens públicas conforme contrato ENTRY-1.
