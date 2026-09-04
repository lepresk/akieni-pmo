# AGENTS.md - Project map

Machine-facing entry point. Engineering rules are authoritative in `CLAUDE.md`; the
always-on Cursor rules live in `.cursor/rules/`. Product spec: `docs/product/`.

## Stack

- **Next.js** (App Router, latest), **server-first** (Server Components + Server Actions).
- **TypeScript** strict (`tsconfig.json`).
- **PostgreSQL** via **Drizzle ORM** (`drizzle.config.ts`, schema in `src/lib/db/schema`).
- **pnpm** workspaces-free single app. **Vitest** for tests.
- Auth: **Google Workspace SSO only**.

## Layout (target)

- `src/app/` - App Router. Route groups by audience: `(app)` authenticated, `(public)`,
  and `api/` route handlers. Per route: `page.tsx`, `layout.tsx`, `loading.tsx`,
  `error.tsx`, `not-found.tsx` as needed.
- `src/components/<feature>/` - feature-grouped components (`kebab-case.tsx`).
- `src/components/ui/` - reusable design-system primitives (Button, DataTable, MonoLabel, …).
- `src/hooks/` - `use-*.ts` client hooks.
- `src/lib/<feature>/` - `*-server.ts` (reads), `*-actions.ts` (mutations), `*-schemas.ts`
  (Zod), `*-display.ts` (pure formatting), `*-permissions.ts` (authorization).
- `src/lib/db/` - Drizzle client + `schema/`. `src/lib/env.ts` - Zod-parsed env (once).
- `src/lib/auth/` - Google Workspace session and RBAC.
- `test/` - Vitest specs (`test/**/*.{test,spec}.ts(x)`), `test/component/**` uses jsdom.

## Commands

- `pnpm dev` - run the app (port 3000).
- `pnpm build` / `pnpm start` - production build / serve.
- `pnpm lint` / `pnpm typecheck` / `pnpm format` / `pnpm format:check`.
- `pnpm test` / `pnpm test:coverage`.
- PostgreSQL runs locally in **DBngin** (no Docker); set `DATABASE_URL` accordingly.
- `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:studio` / `pnpm db:push`.

## Critical rules (see CLAUDE.md for detail)

- English for code/comments/commits; French for `docs/` and UI copy. No emoji, no em dash.
- Zod at every boundary; env parsed once in `src/lib/env.ts`.
- Server-side authorization (field + row level), including exports. Sensitive data
  (salaries, loaded cost, reference TJM, margin) never reaches an unauthorized role.
- Thin transport; business logic in `*-actions.ts` / `*-server.ts`. Only those touch Drizzle.
- Conventional commits, from `develop`, no AI footprint, never push without approval.
- Verification gate green before done: lint + format:check + typecheck + test (+ coverage for PR).
