# Get Stats Feature - Implementation Tasks

## Subtask List

### 1. Create domain interface for stats repository

Create `src/domain/stats.ts` with `IStatsRepository` interface defining the contract for fetching workout sessions by user and date range.

**Acceptance Criteria:**

- File exists at `src/domain/stats.ts`
- Exports `IStatsRepository` interface
- Interface includes `findByUserIdAndDateRange` method signature with proper types

### 2. Create stats repository implementation

Create `src/db/stats-repository.ts` implementing `IStatsRepository` with Prisma queries.

**Acceptance Criteria:**

- File exists at `src/db/stats-repository.ts`
- Implements `IStatsRepository`
- Uses shared `tx` type for transaction support
- Maps Prisma result to plain objects

### 3. Create GetStats use case

Create `src/usecases/get-stats-use-case.ts` with input/output DTOs and business logic.

**Acceptance Criteria:**

- File exists at `src/usecases/get-stats-use-case.ts`
- Exports `GetStatsUseCase` class
- InputDTO and OutputDTO interfaces defined
- Validates startDate is before endDate
- Calculates total sessions, total duration, completion percent
- Returns properly shaped OutputDTO

### 4. Create stats route

Create `src/routes/stats.route.ts` with GET `/stats` endpoint.

**Acceptance Criteria:**

- File exists at `src/routes/stats.route.ts`
- Route: `GET /stats?startDate=<>&endDate=<>`
- Query params validated with Zod
- Auth check returns 401 if no session
- Returns 200 with stats on success
- Error handling returns 400 for invalid dates

### 5. Register route in index.ts

Add the stats route to the Fastify app in `src/index.ts`.

**Acceptance Criteria:**

- `stats.route.ts` is imported with `.js` extension
- Route is registered with the app
- Typecheck passes (`pnpm tsc --noEmit`)
- Lint passes (`pnpm eslint .`)

---

## Implementation Order

1. **Subtask 1** - Domain interface (no dependencies)
2. **Subtask 2** - Repository implementation (depends on 1)
3. **Subtask 3** - Use case (depends on 2)
4. **Subtask 4** - Route (depends on 3)
5. **Subtask 5** - Route registration (depends on 4)

## Critical Dependencies and Risks

- **Prisma schema**: WorkoutSession model must have `id`, `userId`, `startedAt`, `completedAt` fields
- **Auth setup**: Better Auth must be configured with `auth.api.getSession` working correctly
- **Date timezone**: Must handle timezone consistently (store as UTC, return as ISO 8601)
