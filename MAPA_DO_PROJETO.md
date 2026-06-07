# MAPA DO PROJETO — GYM Tracker v1.0.0
> Cole este arquivo no início de cada chat para economizar tokens.

## Funcionalidade → Arquivo

| Funcionalidade | Arquivo |
|---|---|
| Entrada do app / redirect | `app/page.tsx` |
| Tela de login (PV / GI + PIN) | `app/login/page.tsx` |
| Shell do treino (layout + BottomNav) | `app/treino/layout.tsx` |
| Terça-feira (Push) | `app/treino/terca/page.tsx` |
| Quarta-feira (Legs) | `app/treino/quarta/page.tsx` |
| Quinta-feira (Pull) | `app/treino/quinta/page.tsx` |
| Tela de Progresso | `app/treino/progresso/page.tsx` |
| Root layout + PWA meta + QueryProvider | `app/layout.tsx` |
| CSS global + dark theme | `app/globals.css` + `shared/theme.css` |
| Cores e variáveis CSS | `shared/theme.css` |
| Card de exercício (inputs, copy btn, PR) | `components/ExerciseCard.tsx` |
| Lógica do dia de treino (save, toggle PV/GI) | `components/WorkoutDayClient.tsx` |
| Bottom navigation | `components/BottomNav.tsx` |
| Timer de descanso (FAB) | `components/RestTimer.tsx` |
| Gráfico e histórico de progresso | `components/ProgressClient.tsx` |
| Contexto de sessão (client) | `components/SessionProvider.tsx` |
| React Query provider | `components/QueryProvider.tsx` |
| Auth: login, logout, getSession | `lib/auth.ts` |
| Server Action: salvar log de treino | `lib/actions/save-log.ts` |
| Server Action: buscar logs | `lib/actions/get-logs.ts` |
| Server Action: login (wrapper) | `lib/actions/login-action.ts` |
| Supabase client (browser) | `lib/supabase/client.ts` |
| Supabase client (server) | `lib/supabase/server.ts` |
| Dados dos exercícios + frases motivacionais | `lib/workout-data.ts` |
| Tipos TypeScript | `types/index.ts` |
| Proteção de rotas | `middleware.ts` |
| Schema SQL + RLS + seed | `supabase/schema.sql` |
| Variáveis de ambiente | `.env.local` |
| Manifest PWA | `public/manifest.json` |

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS v4
- shadcn/ui · React Query · Zod
- Supabase (Postgres + auth via PIN)
- Deploy: Vercel

## Setup (uma vez)

1. `supabase/schema.sql` no SQL Editor do Supabase
2. Inserir usuários com PINs hashados (ver schema.sql)
3. `.env.local` ← URL + anon key do Supabase
4. `npm run dev` → localhost:3000

## Usuários

| ID | Nome | PIN padrão |
|---|---|---|
| `pv` | PV | 1234 |
| `gi` | GI | 5678 |

> PINs padrão — mudar após primeiro login rodando o SQL de UPDATE.

## Regras de Negócio

- PV e GI treinam Terça (Push), Quarta (Legs) e Quinta (Pull)
- Ambos veem os dados um do outro (read-only toggle na topbar)
- Só o usuário logado pode salvar seus próprios dados
- Peso corporal pode ser logado separadamente na tela de Progresso
- Novo PR é detectado automaticamente e exibido com badge 🏆

## Versão

v1.0.0 — Junho 2026
