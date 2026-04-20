# Feature: Start Session

## Overview

This feature allows authenticated users to start a workout session for a specific workout day within their active workout plan. It creates a new entry in the `workout_sessions` table with the current timestamp as the start time and `null` as the end time (indicating an in-progress session).

## Goals

- Enable users to begin a workout session for a specific workout day
- Ensure proper authentication and authorization (user must own the workout plan)
- Validate that the workout plan and workout day exist and are valid before creating the session
- Prevent starting a session on a rest day (return 400)
- Prevent starting a session for an inactive workout plan (return 400)
- Prevent duplicate active sessions for the same workout day (return 409 if one exists)
- Return appropriate HTTP status codes (201 on success, 400/401/403/404/409/500 on errors)

## Scope

### In Scope

- `POST /workout-plans/<workoutPlanId>/workout-days/<workoutDayId>/sessions` route
- `WorkoutSessionRepository` class with `startSession` method
- `StartSessionUseCase` class
- `IWorkoutSessionRepository` interface
- `IWorkoutSession` domain type
- Authorization check (user must own the workout plan)
- Existence validation for workout plan and workout day
- Rest day validation (400 Bad Request if workout day is a rest day)
- Inactive workout plan validation (400 Bad Request if workout plan is inactive)
- Duplicate session prevention (409 Conflict if session already exists for that day)

### Out of Scope

- Ending/completing a session (different feature)
- Updating session duration or exercises
- Listing sessions
- Session history

## Requirements

### Functional Requirements

- FR-1: Route accepts `workoutPlanId` and `workoutDayId` as path parameters
- FR-2: Route requires authentication (returns 401 if not authenticated)
- FR-3: User must own the workout plan (returns 403 if not authorized)
- FR-4: Workout plan must exist (returns 404 if not found)
- FR-5: Workout day must exist and belong to the workout plan (returns 404 if not found)
- FR-6: No session must exist for this workout day today (returns 409 if a session was already started today)
- FR-7: Should not allow starting a session if the workout day is marked as a rest day (returns 400 Bad Request)
- FR-8: Should not allow starting a session if the workout day is part of an inactive workout plan (returns 400 Bad Request)
- FR-9: Creating a session sets `startedAt` to current timestamp and `completedAt` to `null`
- FR-10: `durationInSeconds` is initialized to `0`
- FR-11: Route returns 201 with `sessionId` on success
- FR-12: Route returns 500 on internal errors

### Non-Functional Requirements

- NFR-1: Use existing repository pattern with Prisma transaction support
- NFR-2: Follow existing route/use case/repository patterns from codebase
- NFR-3: Use Zod for request validation
- NFR-4: Use Better Auth for authentication

## Technical Approach

### Architecture

- **Route**: `src/routes/workout-plan.route.ts` — handles HTTP concerns (auth check, parameter extraction, response formatting)
- **Use Case**: `src/usecases/start-session-use-case.ts` — handles business logic (validation, session creation)
- **Repository**: `src/repositories/workout-session-repository.ts` — handles data persistence
- **Domain Type**: `src/domain/workout-session.ts` — defines `IWorkoutSession` interface
- **Interface**: Defined in use case file following codebase convention

### Data Flow

1. Request arrives at route with `workoutPlanId` and `workoutDayId` path parameters
2. Route extracts session from Better Auth
3. Route creates repository and use case instances
4. Use case validates ownership and existence
5. Use case checks if an active session already exists for this workout day
6. Use case calls repository to create session
7. Repository inserts `WorkoutSession` record with `startedAt = now()` and `completedAt = null`
8. Response returned with session ID

### Error Handling

- `NotFoundError` — thrown when workout plan or workout day not found
- `ForbiddenError` — thrown when user doesn't own the workout plan
- `BadRequestError` — thrown when workout day is a rest day or workout plan is inactive
- `ConflictError` — thrown when an active session already exists for this workout day
- Generic 500 error for unexpected errors

## Data Models / API Contracts

### Request

```
POST /workout-plans/:workoutPlanId/workout-days/:workoutDayId/sessions
Authorization: Bearer <token>
```

### Response (201 Created)

```json
{
  "sessionId": "uuid-string"
}
```

### Error Responses

- `400 Bad Request`: Workout day is a rest day or workout plan is inactive
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't own the workout plan
- `404 Not Found`: Workout plan or workout day not found
- `409 Conflict`: An active session already exists for this workout day
- `500 Internal Server Error`: Unexpected error

### Domain Interface

```typescript
interface IWorkoutSession {
  id: string;
  userId: string;
  workoutDayId: string;
  startedAt: Date;
  completedAt: Date | null;
}
```

## Dependencies

- `src/lib/db.ts` — Prisma client
- `src/types/utils.ts` — `tx` type for transactions
- `src/errors/errors.ts` — `NotFoundError`, `ForbiddenError`, `BadRequestError`, `ConflictError`
- `src/lib/auth.ts` — Better Auth instance
