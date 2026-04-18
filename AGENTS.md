# AGENTS.md

## Project snapshot

- Single-package Node API (Fastify + Zod + Prisma + Better Auth), ESM TypeScript.
- Runtime entrypoint: `src/index.ts`.
- No CI workflows or test runner config found in this repo.

## Required toolchain

- Node `24` (see `package.json` engines).
- `pnpm@10.33.0` (packageManager field).

## Setup and run

1. `pnpm install`
2. Start Postgres: `docker compose up -d postgres`
3. Ensure `.env` has `DATABASE_URL` (and optional `PORT`; default is `3000`)
4. Run DB migrations: `pnpm prisma migrate dev`
5. Generate Prisma client: `pnpm prisma generate`
6. Start API: `pnpm dev`

## Verification commands (no scripts defined except `dev`)

- Typecheck: `pnpm tsc --noEmit`
- Lint: `pnpm eslint .`
- Format check/fix: `pnpm prettier . --check` / `pnpm prettier . --write`

## Prisma + DB gotchas

- Prisma schema: `prisma/schema.prisma`
- Prisma migrations: `prisma/migrations`
- Prisma config (`prisma.config.ts`) loads env via `dotenv/config`.
- Prisma client is generated to custom path `generated/prisma` (not default `node_modules` client).
- After any schema change or on fresh clone, run `npx prisma migrate dev` `npx prisma generate` to populate `generated/prisma` before running the app.
- `/generated/prisma` is gitignored; regenerate after clone/schema changes.
- Do not hand-edit `generated/prisma/*`.
- `docker-compose.yml` uses volume mount `/var/lib/postgresql/datas` (repo-specific config).

## Architecture map

- App setup + docs: `src/index.ts`
- Auth passthrough route (`/api/auth/*`): `src/routes/auth.route.ts`
- Workout plan endpoint: `src/routes/workout-plan.route.ts`
- Business logic: `src/usecases/create-workout-plan-use-case.ts`
- Persistence: `src/repositories/workout-plan-repository.ts`
- Shared DB client: `src/lib/db.ts`
- Better Auth config: `src/lib/auth.ts`

## API docs endpoints

- Scalar UI: `/docs`
- Swagger JSON: `/swagger.json`
- Better Auth OpenAPI source: `/api/auth/open-api/generate-schema`

## Code conventions that matter

- ESM with explicit `.js` extensions in TS imports (Nodenext + `verbatimModuleSyntax`).
- ESLint enforces `simple-import-sort` for imports/exports.
- TypeScript is strict (`strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`).
- Prefer `prisma/schema.prisma` as source of truth over `docs/database.mermaid` when they diverge.
- If have doubt about any library, use Context7 MCP.
