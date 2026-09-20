# ENTRY-1 — Architecture Contract

**Projeto:** Zona Oeste Trocas  
**Gate:** ENTRY-1 — concluído (decisões bloqueadas)

## Decisões bloqueadas

| Tema | Decisão |
|------|----------|
| Geo piloto | Caldas da Rainha / Alcobaça / Torres Vedras |
| Auth | Magic link — **mais tarde** (sem auth na landing ENTRY-2) |
| Listagens | Públicas — **mais tarde** |
| Frontend | Next.js App Router + TypeScript + Tailwind CSS |
| UI kit | shadcn/ui |
| Backend / dados | Supabase (URL + anon key via `NEXT_PUBLIC_*`; sem secrets no repo) |
| Deploy | Vercel (futuro; não configurado neste scaffold) |
| Idioma UI | pt-PT |
| Mobile | Mobile-first |

## Contratos de ambiente

- `NEXT_PUBLIC_SUPABASE_URL` — placeholder em `.env.example`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — placeholder em `.env.example`
- Sem service role no cliente; sem `.env` com segredos no git

## Qualidade

- CI: lint + `tsc --noEmit` + build em push/PR
- Alias de imports: `@/*`

## Fora de contrato (ENTRY-2)

- Integração real Supabase / Vercel APIs
- Clone/push remoto (push feito pelo humano depois)
