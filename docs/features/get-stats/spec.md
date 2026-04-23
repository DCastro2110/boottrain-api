# Feature: Get Workout Stats

## Overview

Provides workout session statistics for a user within a specified date range. The endpoint accepts query parameters for start and end dates, calculates aggregate stats, and returns detailed session-level data.

## Goals

- Allow users to retrieve their workout session statistics for a date range
- Provide aggregate metrics: total sessions, total duration
- Include completion/conclusion statistics (percentage of sessions completed)
- Return detailed per-session data for further analysis

## Scope

### In Scope

- `GET /stats?startDate=<startDate>&endDate=<endDate>` endpoint
- Date validation (format, start before end)
- Repository method to fetch sessions by date range
- Use case with business logic for stats calculation
- Response schema with total count, total duration, completion rate, and session list

### Out of Scope

- Pagination of session list
- Filtering by other criteria (workout day, exercise type, etc.)
- Historical comparison or trends
- Export functionality (CSV, PDF, etc.)

## Requirements

### Functional Requirements

- FR-1: Route accepts `startDate` and `endDate` as required query parameters (ISO 8601 date format: `YYYY-MM-DD`)
- FR-2: Validate date format; return 400 if invalid
- FR-3: Validate startDate is before endDate; return 400 if not
- FR-4: Require authenticated user; return 401 if no session
- FR-5: Fetch all workout sessions for the authenticated user where `startedAt` falls within the date range (inclusive on both ends)
- FR-6: Calculate total number of sessions
- FR-7: Calculate total duration by summing `(completedAt - startedAt)` for completed sessions only
- FR-8: Calculate completion percentage: `(completed sessions / total sessions) * 100`
- FR-9: Return list of sessions with `sessionId`, `startedAt`, `endedAt` (null if not completed)
- FR-10: Return 200 with stats object on success

### Non-Functional Requirements

- NFR-1: Response time < 500ms for typical queries (up to 365 days range)
- NFR-2: Dates are stored and returned in ISO 8601 format with timezone
- NFR-3: Duration returned in seconds for precision

## Technical Approach

### Route Layer (`src/routes/stats.route.ts`)

- Fastify route with `z.coerce.date()` for query parameter parsing
- Zod schema validates query: `{ startDate: z.string(), endDate: z.string() }`
- Auth check via Better Auth session
- Delegates to `GetStatsUseCase`

### Use Case Layer (`src/usecases/get-stats-use-case.ts`)

- InputDTO: `{ userId: string, startDate: Date, endDate: Date }`
- OutputDTO: `{ totalSessions: number, totalDurationInSeconds: number, completionPercent: number, sessions: Array<{ sessionId: string, startedAt: Date, endedAt: Date | null }> }`
- Validates date range logic
- Calls repository to fetch sessions
- Calculates aggregates

### Repository Layer

The existing `WorkoutSessionRepository` will be extended with a new method `findByUserIdAndDateRange` to fetch sessions within a date range. No new repository class is needed.

## Data Models / API Contracts

### Request

```
GET /stats?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <session_token>
```

### Success Response (200)

```json
{
  "totalSessions": 12,
  "totalDurationInSeconds": 21600,
  "completionPercent": 83.33,
  "sessions": [
    {
      "sessionId": "uuid-1",
      "startedAt": "2024-01-01T09:00:00Z",
      "endedAt": "2024-01-01T09:45:00Z"
    },
    {
      "sessionId": "uuid-2",
      "startedAt": "2024-01-03T10:00:00Z",
      "endedAt": null
    }
  ]
}
```

### Error Responses

- `401 Unauthorized`: Missing or invalid session
- `400 Bad Request`: Invalid date format or startDate >= endDate

## Dependencies

- `fastify` (API server)
- `zod` (validation)
- `prisma` (database ORM)
- `better-auth` (authentication)
- `dayjs` (date handling, optional)

## Open Questions

- Should `totalDurationInSeconds` include only completed sessions or all sessions? (Decision: completed sessions only, as `completedAt` is required for accurate duration)
- What should `completionPercent` be when there are zero sessions? (Decision: return 0)
- Should sessions be sorted? (Decision: by `startedAt` ascending)
