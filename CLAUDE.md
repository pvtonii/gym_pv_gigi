@AGENTS.md

# GYM Tracker — CLAUDE.md

## O que é este projeto
App de acompanhamento de treinos para dois usuários: **PV** e **GI**.
Registra pesos por exercício e sessão. Ambos veem dados um do outro (read-only). Segue Melhores Práticas v1.0 + v3.

## Stack
Next.js 14 · Tailwind CSS v4 · shadcn/ui · Supabase · Vercel

## Paleta de cores
Definida em `shared/theme.css` via CSS variables. **Nunca hardcode cores nas telas.**
- `--accent-pv: #00e5ff` (cyan = PV)
- `--accent-gi: #ff4081` (rose = GI)
- `--bg: #0d0f14` · `--card: #1a1d24`

## Antes de codar
1. Ler `MAPA_DO_PROJETO.md` para ir direto no arquivo certo
2. Seguir Melhores Práticas v3 para layout PWA (body, nav, safe-area)
3. Nunca `height: 100dvh` no body — usar `min-height: 100vh`
4. BottomNav SEMPRE fora do `#app` (filho direto do body)

## Padrões
- Server Actions em `lib/actions/`
- Dados fixos dos exercícios em `lib/workout-data.ts`
- Auth via cookie HttpOnly em `lib/auth.ts`
- Validação com Zod em todas as Server Actions
- Cores só em CSS variables (theme.css)

## Versão atual
v1.0.0
