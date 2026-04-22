# Feature: Get Workout Day Data

## Overview

Create route, use case, and repository method for retrieving workout day data by ID. The feature allows authenticated users to fetch a specific workout day including its exercises and any open workout session for that day.

## Goals

- Provide an API endpoint to retrieve workout day details by ID
- Include open session lookup within the current week
- Add timezone support to the Better Auth session
- Enforce authentication and ownership authorization
- Follow existing codebase conventions for consistency

## Scope

### In Scope

- New route: `GET /workout-plans/:workoutPlanId/workout-days/:workoutDayId`
- New use case: `GetWorkoutDayUseCase`
- New repository method: `findWorkoutDayById` in `WorkoutPlanRepository`
- Add `timezone` field to Better Auth session
- Proper error handling with appropriate status codes
- Authentication check using Better Auth session
- Open session lookup (same week as current date)

### Out of Scope

- Workout day creation/update/deletion
- Pagination or filtering
- Exercise execution tracking

## Requirements

### Functional Requirements

- FR-1: Route accepts `workoutPlanId` and `workoutDayId` as URL parameters (UUID format)
- FR-2: Route authenticates user via Better Auth session
- FR-3: Route validates both IDs are valid UUIDs
- FR-4: Use case fetches workout day using repository method
- FR-5: Use case verifies the workout plan belongs to the authenticated user
- FR-6: Use case returns 404 if workout day does not exist
- FR-7: Route returns 200 with workout day data including open session info
- FR-8: Open session lookup checks for sessions in the same week as current date
- FR-9: Add `timezone` field to Better Auth session

### Non-Functional Requirements

- NFR-1: Follow existing route/use case/repository patterns
- NFR-2: Use explicit return types on all public methods
- NFR-3: Handle database errors with generic 500 response
- NFR-4: Use ESM imports with explicit `.js` extensions
- NFR-5: Use `dayjs` for date comparisons

## Technical Approach

### Session Timezone

1. Extend Better Auth session to include `timezone` field
2. Configure Better Auth to capture user timezone on session creation
3. Store timezone in session for later use

### Route

```
GET /workout-plans/:workoutPlanId/workout-days/:workoutDayId
Parameters:
  - workoutPlanId: UUID (path param)
  - workoutDayId: UUID (path param)
Headers:
  - Authorization: session token
Responses:
  - 200: Workout day data with exercises and optional session ID
  - 400: Invalid UUID format
  - 401: Unauthorized (no session)
  - 403: Forbidden (not owner)
  - 404: Workout day not found
  - 500: Internal server error
```

### Use Case Flow

1. Extract `userId` from session
2. Validate `workoutPlanId` and `workoutDayId` are UUIDs
3. Call repository `findWorkoutDayById(workoutPlanId, workoutDayId)`
4. If not found, throw NOT_FOUND error
5. If found but `userId` does not match, throw FORBIDDEN error
6. Check for open session in current week using `WorkoutSessionRepository`
7. Return workout day data with session ID (null if no open session)

### Data Flow

```
Request → Route → GetWorkoutDayUseCase → WorkoutPlanRepository.findWorkoutDayById() → Prisma → DB
                                                    ↓
                                          WorkoutSessionRepository.findOpenSession()
```

## Data Models / API Contracts

### Request

- Method: `GET`
- URL: `/workout-plans/:workoutPlanId/workout-days/:workoutDayId`
- Headers: `Authorization: Bearer <session_token>`

### Response (200 OK)

```json
{
  "weekDay": "MONDAY | TUESDAY | ...",
  "name": "string",
  "estimatedDurationInSeconds": "number",
  "numberOfExercises": "number",
  "coverImageUrl": "string | null",
  "workoutSessionId": "string | null",
  "workoutExercises": [
    {
      "name": "string",
      "reps": "number",
      "sets": "number",
      "description": "string",
      "estimatedDurationInSeconds": "number"
    }
  ]
}
```

### Error Response

```json
{
  "error": "string",
  "code": "NOT_FOUND | FORBIDDEN | BAD_REQUEST | INTERNAL_SERVER_ERROR"
}
```

## Dependencies

- `Fastify` with `ZodTypeProvider`
- `Better Auth` for session management with timezone extension
- `WorkoutPlanRepository` (new `findWorkoutDayById` method)
- `WorkoutSessionRepository` (existing methods + open session lookup)
- `dayjs` for date handling
- `NotFoundError`, `ForbiddenError` from errors
- `tx` type from `src/types/utils.ts`

## Open Questions

- Better Auth MCP for timezone: Need to verify how to configure Better Auth to capture user timezone on session creation. The MCP tool should provide guidance on session customization.
- Session timezone storage: Determine if timezone should be stored in a session custom field or derived from user settings.
