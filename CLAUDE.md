# CLAUDE.md - Engineering rules (authoritative)

This file is the single source of truth for how code is written in this repository.
A violation is a defect, not a style preference. The Cursor rules in `.cursor/rules/`
are always-on companions and never contradict this file. Product documentation lives
in `docs/` (see `docs/product/`).

**Stack:** Next.js (App Router, latest) - **server-first** - TypeScript (strict) -
PostgreSQL via Drizzle ORM - pnpm - Vitest. Authentication is **Google Workspace SSO only**.
Single application (not a monorepo); this may change if a second surface is added.

---

## 1. Language & naming

- **English only** for code, identifiers, comments, commit messages, API/error
  messages, and error codes. **French** for product documentation (`docs/`) and for
  **UI copy** (professional French, correct diacritics).
- **No emoji** and **no em dash (`—`, U+2014)** anywhere - code, comments, or UI.
  Use `-`, `:`, or reword. Missing values render as `-` or `N/A`.
- Files: `kebab-case.ts` for modules/utilities; `PascalCase.tsx` for React components;
  tests `*.test.ts` / `*.spec.ts`.
- Identifiers: `PascalCase` for types/classes/enums/components; `camelCase` for
  functions/variables; `SCREAMING_SNAKE_CASE` only for real compile-time constants.
  Allowed abbreviations: `id`, `url`, `api`, `db`.
- **Named exports** everywhere, except where the framework requires a default export
  (Next.js `page.tsx`, `layout.tsx`, `route.ts`, `middleware.ts`, config files).

## 2. TypeScript

- `tsconfig.json` is the strictest reasonable configuration. **Never** relax it.
- **Never `any`** - use `unknown` plus narrowing. **Avoid `!`** (non-null assertion) -
  handle null/undefined, or justify with `// SAFETY: <reason>`.
- Prefer `readonly` for values that are not mutated.
- Use **discriminated unions** for states and results; never parallel boolean flags.
- Use **branded types** for IDs and money (`type EmployeeId = string & { __brand: 'EmployeeId' }`,
  amounts in minor units). Use `satisfies` to constrain literals; `as` only after a
  runtime guard.
- No magic numbers/strings - promote to named constants or enums.
- Composition over inheritance.

## 3. Zod at every boundary

Validate all untrusted input with Zod, and infer internal types from the schema
(`z.infer`):

- Server Action arguments and form data.
- Route Handler request bodies, query params, and dynamic route params.
- Responses from external APIs.
- Environment variables - parsed **once** at startup in `src/lib/env.ts`. Never read
  `process.env.X` scattered through business logic.

Objects that act as API/response contracts use `.strict()` to catch field leaks.

## 4. Architecture (server-first)

- **Server Components by default.** Add `'use client'` only for genuine interactivity
  (state, effects, event handlers, browser APIs). Push client boundaries to the leaves.
- One file, one responsibility. Keep files focused; a growing file signals it does too much.
- **Transport stays thin.** Server Actions and Route Handlers do: parse (Zod) -> invoke a
  server/action function -> serialize. **No business logic in the transport layer.**
- `src/lib/<feature>/` layering (mirror the file-suffix convention):
  - `*-server.ts` - data reads for Server Components (owns Drizzle queries).
  - `*-actions.ts` - Server Actions / mutations (`'use server'`), one entry point each,
    Zod input, typed output with an explicit failure variant (discriminated union / Result).
  - `*-schemas.ts` - Zod schemas and inferred types.
  - `*-display.ts` - pure formatting/presentation helpers (no I/O).
  - `*-permissions.ts` - authorization predicates.
- **Only** `*-server.ts` / `*-actions.ts` (and `src/lib/db`) touch Drizzle. Components
  never import the query builder.
- **Fail loudly** - never swallow errors silently. Use structured logging (Pino); no
  `console.log` in committed code (`console.error` for genuine diagnostics only).

## 5. Authentication & confidentiality (product-critical)

- **Google Workspace SSO only.** Reject logins outside the allowed domain(s)
  (`GOOGLE_ALLOWED_DOMAINS`). No local passwords.
- **Authorization is enforced server-side, always.** Sensitive data (salaries, loaded
  cost, reference TJM, margin) is **filtered before serialization** - never sent to an
  unauthorized role and hidden only in the UI (field-level **and** row-level).
- The same access rules apply to **exports**: a forbidden column is removed from the
  file, not just masked.
- Every read of a sensitive field and every RH/finance mutation is written to an
  append-only **audit log** (actor, role, timestamp, target).
- Never place personal or sensitive data in URLs/query strings. Secrets stay server-side.

## 6. Data & Drizzle

- Schema in `src/lib/db/schema/`; a single Drizzle client in `src/lib/db`.
- All schema changes go through **migrations** (`pnpm db:generate` then `pnpm db:migrate`),
  one migration per logical change, descriptive name. Do not hand-edit generated SQL.
- Parameterized queries only. Repositories / `*-server.ts` own DB access.

## 7. Route Handlers & response shapes

- Group routes by audience via App Router segments/route groups (e.g. `(app)` authed,
  `(public)`, `api/`). Keep a thin transport layer.
- List responses wrap pagination: `{ items, page, pageSize, totalItems, totalPages, sort, filters }`.
  Detail responses return the full resource plus relations/computed fields. Create/update
  return the resource after the operation.
- Stable error codes (`timesheet.period_locked`, `expense.envelope_exceeded`) plus a
  human-readable English message; the client branches on the code. Semantic HTTP status
  (200/201/204/400/401/403/404/409/422/429/500). Never "200 OK with an error field".

## 8. UI / UX

- Calm, professional, "banking-grade" French voice. No emoji, no em dash.
- Every screen handles four states explicitly: **loading, empty, success, error**.
  Distinguish "empty" from "no results after filtering".
- **Destructive or state-changing actions** require a confirmation dialog (cancel +
  confirm, danger styling). Mutations disable their trigger and show a loading state;
  errors are surfaced (contextual copy, never a bare "An error occurred").
- Forms: React Hook Form + Zod resolver, validation on blur, a summary on submit,
  accessible labels.
- Tables/lists are **server-driven** (pagination, search, column sort); filter state is
  reflected in the **URL** (deep-linkable). Sort direction is visible.
- Deterministic rendering: same input, same output. No random ordering or jitter.

## 9. Testing (Vitest)

- **AAA only** - Arrange, Act, Assert as three separated blocks. Test names in English
  describe behavior (`it('rejects a timesheet entry on a locked period')`), never `test1`.
- **PostgreSQL is not mocked** - use an isolated test database (`DATABASE_URL_TEST`) with
  transactional rollback or schema reset between tests. Assert against **persisted DB
  state** after every write, not the HTTP/return value alone.
- **External systems are mocked** (Google OAuth, email, Slack, any third-party HTTP).
- Validate responses with the **same Zod schemas** as the runtime contract.
- Cover happy path, every failure path, weird paths (concurrency, retries, partial state),
  and edge cases. Coverage gate (server/logic in `src/lib`): >=80% lines/statements/functions,
  > =70% branches before a PR. A red test blocks the change.
- Edit tests in the **same change** as the behavior/schema they cover.

## 10. Comments & documentation

- Comments only at these levels: file, class, function/method, and non-obvious blocks.
  No inline comments restating obvious code.
- Forbidden: conversational tone, jokes, emoji, em dash, decorative banners, and
  `TODO`/`FIXME` without a ticket reference.
- JSDoc (module-level) for any file with significant logic; JSDoc on public/non-trivial
  functions when params/return/contract are not self-evident.
- Do not create Markdown under `docs/` or the repo root unless explicitly requested. When
  behavior changes, update the relevant canonical doc in the same change set.

## 11. Commits & branches

- **Conventional Commits**: `type(scope): subject` - types `feat|fix|refactor|docs|chore|test|perf|style|ci|build|setup`.
  Subject in English, imperative, lowercase, <=72 chars, no trailing period. Body explains
  the "why".
- **No AI footprint** - no `Co-Authored-By` AI trailers, no "Generated with ..." lines.
  (The `commit-msg` hook strips AI co-author trailers as a backstop.)
- No micro-commits; each commit is a logically complete change with green checks.
- Feature branches from **`develop`** (not `main`), named `<type>/<short-description>`.
- **Never commit, push, or force-push without explicit approval.**

## 12. Verification gate (before "done" / PR)

All must pass from the repo root: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`,
`pnpm test`, and for a PR `pnpm test:coverage`. Never `--no-verify`. Never `@ts-ignore`,
`@ts-expect-error`, or `eslint-disable` to force a pass; rare, justified suppressions carry
`// SAFETY: <reason>`. Before a non-trivial change, read the full files and up/downstream
call sites; make minimal, task-scoped diffs (no opportunistic refactors).

## 13. Tooling

- **pnpm only** (`pnpm add`, `pnpm add -D`). Never npm or yarn.
- Local PostgreSQL runs in **DBngin**; point `DATABASE_URL` (and `DATABASE_URL_TEST`)
  at your DBngin instance. No Docker.
- Prefer the hex-line MCP tools for file operations; Bash is for runtime commands.

## 14. Decision framework

When rules or trade-offs collide, decide in this order:
**Security -> Standards compliance -> Correctness -> Simplicity -> Necessity ->
Maintainability -> Performance.**
Principles: Standards First, YAGNI, KISS, DRY (one source of truth per concept),
Consumer-First design, No Legacy Code, Security by Design.
