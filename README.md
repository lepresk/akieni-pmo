# Akieni PMO & Finance

Internal **PMO** and **finance** tool for Akieni (services company, Brazzaville). It unifies timesheets, N+1 validation, multi-level projects, capacity, leave, expenses, analytical reporting, and billing.

**Core principle:** timesheets (and project expenses) drive chargeability, margin, budget, landing (EAC), and invoicing.

| | |
| --- | --- |
| Stack | Next.js 15 (App Router, server-first), strict TypeScript, PostgreSQL + Drizzle, pnpm, Vitest |
| Target auth | Google Workspace SSO only (no local passwords) |
| Current auth | Demo role switcher (cookie) until Wave 0 |
| UI copy | French |
| Product spec | [`docs/product/2026-07-30-akieni-pmo-doc-produit.md`](docs/product/2026-07-30-akieni-pmo-doc-produit.md) |
| Engineering rules | [`CLAUDE.md`](CLAUDE.md) (source of truth) · [`AGENTS.md`](AGENTS.md) (repo map) |

---

## Features

Eight roles: Staff, Project Manager (PM), PMO, Manager (N+1), Finance, HR, Direction, Admin. Sensitive data (salaries, loaded cost, reference TJM, margin) is filtered **server-side**.

| Module | Description |
| --- | --- |
| Dashboard | Role-based queue and KPIs |
| Timesheets | Weekly grid (system sensor) |
| Validations | N+1 approve/reject, PM dispute (N+7), period lock |
| Projects | Portfolio + detail (structure, planning, budget, resources, landing) |
| Capacity | Workload plan, overbooking / bench |
| Leave | Requests, calendar, capacity impact |
| Expenses | Purchases / subcontracting and mission costs |
| Team | Directory + employee file (HR/Finance confidentiality) |
| Reporting | Analytical reports (chargeability, margin, landing, etc.) |
| Billing | Time & materials / fixed-price wizard |
| Referentials | Departments, seniority, cost centers, TJM grid |
| Audit | Log of sensitive reads and mutations |
| Notifications | Reminders and alerts |

---

## Roadmap

Delivery by **waves** (complete business loops). Detail: §15 of the [product doc](docs/product/2026-07-30-akieni-pmo-doc-produit.md) (French).

| Wave | Scope | Indicative status |
| --- | --- | --- |
| **0** | Real Google OIDC, hardened server RBAC, real audit log, referentials | Todo (demo session today) |
| **1** | Multi-level projects, HR, creation wizard | In progress / partial |
| **2** | Timesheets, N+1 validation, disputes, period lock | In progress / partial |
| **3** | Capacity & leave | In progress / partial |
| **4** | Budget, expenses, amendments, margin, landing | In progress / partial |
| **5** | Time & materials / fixed-price billing | To consolidate |
| **6** | Reporting & analytics | To consolidate |
| **7** | Scheduled exports, API/BI, advanced notifications | Later |

UI screens already exist; remaining work is mainly **security foundations (Wave 0)**, business fidelity, and hardening flows.

---

## Prerequisites

- **Node.js** >= 22 (see `.nvmrc`)
- **pnpm** 10 (`corepack enable` then `corepack prepare pnpm@10.33.0 --activate`)
- **PostgreSQL** locally via [DBngin](https://dbngin.com) (no Docker)
- Google Cloud OAuth client only when Wave 0 auth is wired

---

## Setup

```bash
# 1. Clone and install
git clone <repo-url> akieni-pmo
cd akieni-pmo
pnpm install

# 2. Environment
cp .env.example .env.local
# Edit .env.local: point DATABASE_URL and DATABASE_URL_TEST at DBngin.
# e.g. postgres://postgres@127.0.0.1:5432/akieni_dev

# 3. Create databases in DBngin (or psql)
#    akieni_dev  and  akieni_test

# 4. Migrations + demo seed
pnpm db:migrate
pnpm db:seed

# 5. Run
pnpm dev
# → http://localhost:3000
```

Switch roles with the top-bar selector (demo mode).

### Useful commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm lint` / `pnpm typecheck` / `pnpm format:check` | Quality gates |
| `pnpm test` / `pnpm test:coverage` | Tests (real Postgres via `DATABASE_URL_TEST`) |
| `pnpm db:generate` | Generate a migration after a schema change |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm build` | Production build |

**Before calling a change done:** `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test` (plus `pnpm test:coverage` for a PR).

---

## Contributing

### Branches

Always branch from `develop` (not `main` for day-to-day work):

```bash
git fetch origin
git checkout develop
git pull origin develop
git checkout -b feat/my-feature
# branch prefixes: feat/ | fix/ | refactor/ | docs/ | chore/ | test/
```

### Commits

[Conventional Commits](https://www.conventionalcommits.org/), English, imperative, ≤ 72 characters:

```text
feat(timesheet): reject entries on a locked period
fix(rbac): hide margin from unauthorized roles
```

Types: `feat` | `fix` | `refactor` | `docs` | `chore` | `test` | `perf` | `style` | `ci` | `build` | `setup`.

No AI trailers (`Co-Authored-By`, “Generated with…”). No `--no-verify`.

### Push and review

```bash
# Local gate
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test

git add -A
git commit -m "$(cat <<'EOF'
feat(scope): short imperative subject

Why this change matters (optional body).
EOF
)"

git push -u origin HEAD
# Open a PR targeting develop (gh pr create or GitHub UI)
```

Never force-push `develop` / `main`. Never commit `.env` or secrets.

### Quick rules

- Code / commits / error messages: **English**. UI copy and `docs/`: **French**.
- No emoji, no em dash (`—`).
- Zod at every boundary; no `any`; auth and confidentiality **always server-side**.
- Minimal, task-scoped diffs. Full detail: [`CLAUDE.md`](CLAUDE.md).

---

## Documentation

| Doc | Contents |
| --- | --- |
| [`docs/product/2026-07-30-akieni-pmo-doc-produit.md`](docs/product/2026-07-30-akieni-pmo-doc-produit.md) | Product spec (screens, RBAC, formulas, roadmap) |
| [`CLAUDE.md`](CLAUDE.md) | Engineering standards |
| [`AGENTS.md`](AGENTS.md) | Repo map for agents / technical onboarding |
| `.env.example` | Expected environment variables |
