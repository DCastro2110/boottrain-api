# Feature: Home Info API

## Overview

Implement a new Home Info feature that returns user-specific dashboard data for the current week and current day, following existing project patterns used by `create-workout-plan` (route + use case + repository abstraction + Prisma repository implementation).

The feature provides:

1. Weekly consistency (Sunday → Saturday) with per-day completion status.
2. Fire sequence (consecutive completed days).
3. Today’s workout day summary (if available), including completion state.

## Goals

- Expose a single API endpoint that aggregates the data needed for the app home screen.
- Reuse existing architecture and coding conventions for maintainability.
- Ensure deterministic week-based calculations and strict response typing/validation.
- Add missing DB schema fields (if needed) via Prisma migration.

## Scope

### In Scope

- New route in `src/routes/` for Home Info.
- New use case in `src/usecases/` encapsulating feature logic.
- New repository interface + Prisma repository implementation in `src/repositories/`.
- Querying active workout plan, workout days, exercises, and workout sessions.
- Weekly consistency computation for the current week (Sunday to Saturday).
- Fire sequence computation from consistency data.
- Today workout day payload generation.
- Prisma schema/migration update if `coverImageUrl` (or other required field) is missing.
- Registering the route in `src/index.ts`.
- Verification via project-standard commands (`pnpm tsc --noEmit`, `pnpm eslint .`).

### Out of Scope

- Historical analytics beyond current week.
- New auth mechanisms (existing Better Auth session flow will be reused).
- UI/client changes.
- Background jobs/caching layers.
- Major refactor of existing workout domain structure.

## Requirements

### Functional Requirements

- FR-1: Expose authenticated endpoint for Home Info (recommended `GET /home-info`).
- FR-2: Reject unauthenticated requests with `401` and existing `ErrorSchema`.
- FR-3: Return `weekConsistency` as exactly 7 items ordered Sunday→Saturday.
- FR-4: Each week item must contain:
  - `day`: one of `sunday | monday | tuesday | wednesday | thursday | friday | saturday`
  - `status`: one of `completed | not_completed | missed`
- FR-5: Determine day status from current week workout sessions:
  - `completed`: at least one completed session (`completedAt != null`) for that day.
  - `missed`: day is before “today” in current week and not completed.
  - `not_completed`: today/future day in current week without completion.
- FR-6: Return `fireSequence` as integer representing consecutive completed days.
- FR-7: Fire sequence should be computed from week consistency by scanning backward from today within current week until first non-completed day.
- FR-8: Return `todayWorkoutDay` with:
  - `date` (`YYYY-MM-DD`)
  - `name`
  - `estimatedDurationInSeconds`
  - `numberOfExercises`
  - `coverImageUrl`
  - `isCompleted`
- FR-9: If no active workout plan or no workout day mapped for today, endpoint must still return valid payload with:
  - `weekConsistency`: 7 items with `not_completed/missed` by time logic
  - `fireSequence`: `0`
  - `todayWorkoutDay`: `null`
- FR-10: Use existing route/use case/repository organization and import conventions (ESM `.js` imports, strict typing, Zod response schemas).

### Non-Functional Requirements

- NFR-1 (Performance): Query strategy should avoid N+1 reads (single aggregate Prisma query or minimal bounded query set).
- NFR-2 (Security): Endpoint must rely on Better Auth session retrieval and never leak other users’ data.
- NFR-3 (Correctness): Week boundary and day mapping must be deterministic (Sunday-start week), with explicit timezone handling.
- NFR-4 (Maintainability): Follow current architectural pattern (`I...Repository` interface in use case file + concrete repository class).
- NFR-5 (Quality): Must pass typecheck and lint in repository standards.

## Technical Approach

1. **Route Layer**
   - Add `src/routes/home-info.route.ts`.
   - Implement authenticated `GET /` route under prefix `home-info`.
   - Use Zod response schema for 200/401/500 similar to `workout-plan.route.ts`.

2. **Use Case Layer**
   - Add `src/usecases/create-home-info-use-case.ts` (name aligned with prompt; internally behaves as query/use-case).
   - Define `InputDTO` (`userId`) and `OutputDTO` (`weekConsistency`, `fireSequence`, `todayWorkoutDay`).
   - Define `IHomeInfoRepository` interface in same file (project pattern).

3. **Repository Layer**
   - Add `src/repositories/home-info-repository.ts`.
   - Implement Prisma-backed methods to fetch:
     - Active workout plan + workout days for user.
     - Current week sessions grouped by day.
     - Today workout day and exercise count.
   - Keep DB logic in repository; compute mapping/streak in use case.

4. **Date/Week Logic**
   - Use `dayjs` consistently with explicit week start at Sunday.
   - Compute current week dates (7-day map) and today index.
   - Map workout day by `weekDays` enum to lowercase API day string.
   - Save the date in UTC and compute week/day logic based on UTC

5. **Schema Update (if needed)**
   - Add `coverImageUrl String?` to `WorkoutDay` in Prisma schema (if absent).
   - Create migration and regenerate Prisma client.

6. **App Registration**
   - Register new route in `src/index.ts` with prefix `home-info`.

7. **Verification**
   - Run:
     - `pnpm tsc --noEmit`
     - `pnpm eslint .`

## Data Models / API Contracts

### API Response (200)

```json
{
  "weekConsistency": [
    { "day": "sunday", "status": "not_completed" },
    { "day": "monday", "status": "completed" },
    { "day": "tuesday", "status": "missed" },
    { "day": "wednesday", "status": "not_completed" },
    { "day": "thursday", "status": "not_completed" },
    { "day": "friday", "status": "not_completed" },
    { "day": "saturday", "status": "not_completed" }
  ],
  "fireSequence": 1,
  "todayWorkoutDay": {
    "date": "2026-04-18",
    "name": "Push Day",
    "estimatedDurationInSeconds": 2700,
    "numberOfExercises": 6,
    "coverImageUrl": "https://...",
    "isCompleted": false
  }
}
```

## Dependencies

- `fastify`, `fastify-type-provider-zod`, `zod`
- `better-auth` (`auth.api.getSession`, `fromNodeHeaders`)
- Prisma client in `src/lib/db.ts`
- `dayjs`
- `ErrorSchema` in `src/schemas/RouteSchemas.ts`
- `weekDays` enum from generated Prisma enums
