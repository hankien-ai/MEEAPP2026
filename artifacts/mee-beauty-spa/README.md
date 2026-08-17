# MEE BEAUTY SPA

MEE BEAUTY SPA is a responsive spa-management application shell for daily branch operations. The first version is intentionally an empty, polished foundation: all major modules are reachable and visually functional, while business rules and production persistence are introduced progressively.

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS and shadcn/ui primitives
- Wouter for route navigation
- Supabase-ready client boundary for PostgreSQL, Storage, and Realtime
- Vercel-compatible static build

## Folder structure

```text
src/
├── components/       shared shell, primitives, and UI components
├── data/             clearly separated Vietnamese demo data
├── pages/            dashboard, customers, catalog, and operations pages
├── services/         demo reads and Supabase boundary
└── types/            domain types for future data access
```

## Routes

`/dashboard`, `/customers`, `/customers/:id`, `/catalog`, `/catalog/services`, `/catalog/products`, `/packages`, `/pos`, `/staff`, `/staff/commissions`, `/attendance`, `/loyalty`, `/reports`, `/booking`, `/expenses`, and `/settings`.

The root route `/` opens the dashboard. Development mode uses a visible `DEV ADMIN` context and bypasses authentication; no production authentication is implemented yet.

## Install and run

```bash
pnpm install
pnpm --filter @workspace/mee-beauty-spa run dev
```

## Environment variables

Copy `.env.example` to `.env.local` and provide:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The Supabase client is created lazily by `src/services/supabase.ts`. The shell remains usable with empty values because current screens intentionally use local demo data.

## Build and deploy

```bash
pnpm --filter @workspace/mee-beauty-spa run typecheck
pnpm --filter @workspace/mee-beauty-spa run build
```

The output is a Vite static build suitable for Vercel. Configure the two `VITE_SUPABASE_*` variables in the Vercel project when real Supabase-backed modules are introduced.

## Roadmap

Implement customers first, then service/product catalog, packages, POS, staff and commissions, attendance, loyalty, reports, booking, authentication, permissions, and Supabase RLS. Keep domain rules in module services/hooks rather than presentation components.