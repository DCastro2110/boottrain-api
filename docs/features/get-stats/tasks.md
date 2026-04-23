# Get Stats Feature - Implementation Tasks

## Subtask List

### 1. Add findByUserIdAndDateRange method to WorkoutSessionRepository

Add a new method `findByUserIdAndDateRange` to the existing `WorkoutSessionRepository` class that fetches all workout sessions for a user within a date range.

**Acceptance Criteria:**

- [x] Method exists in `src/db/workout-session-repository.ts`
- [x] Method signature: `findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date, tx?: tx): Promise<IWorkoutSession[]>`
- [x] Returns sessions where `startedAt` is within the date range (inclusive on both ends)
- [x] Sessions are sorted by `startedAt` ascending
- [x] Interface updated in `src/domain/workout-session.ts`

### 2. Create GetStats use case

Create `src/usecases/get-stats-use-case.ts` with input/output DTOs and business logic. This use case orchestrates the stats calculation using the existing `WorkoutSessionRepository`.

**Acceptance Criteria:**

- [x] File exists at `src/usecases/get-stats-use-case.ts`
- [x] Exports `GetStatsUseCase` class
- [x] InputDTO and OutputDTO interfaces defined
- [x] Validates startDate is before endDate
- [x] Calculates total sessions, total duration, completion percent
- [x] Returns properly shaped OutputDTO
- [x] Uses existing `WorkoutSessionRepository` to fetch data

### 3. Create stats route

Create `src/routes/stats.route.ts` with GET `/stats` endpoint.

**Acceptance Criteria:**

- [x] File exists at `src/routes/stats.route.ts`
- [x] Route: `GET /stats?startDate=<>&endDate=<>`
- [x] Query params validated with Zod
- [x] Auth check returns 401 if no session
- [x] Returns 200 with stats on success
- [x] Error handling returns 400 for invalid dates

### 4. Register route in index.ts

Add the stats route to the Fastify app in `src/index.ts`.

**Acceptance Criteria:**

- [x] `stats.route.ts` is imported with `.js` extension
- [x] Route is registered with the app
- [x] Typecheck passes (`pnpm tsc --noEmit`)
- [x] Lint passes (`pnpm eslint .`)

---

## Implementation Order

1. **Subtask 1** - Add method to WorkoutSessionRepository (no new files)
2. **Subtask 2** - GetStats use case (depends on 1)
3. **Subtask 3** - Stats route (depends on 2)
4. **Subtask 4** - Route registration (depends on 3)

## Critical Dependencies and Risks

- **Prisma schema**: WorkoutSession model must have `id`, `userId`, `startedAt`, `completedAt` fields
- **Auth setup**: Better Auth must be configured with `auth.api.getSession` working correctly
- **Date timezone**: Must handle timezone consistently (store as UTC, return as ISO 8601)
