# Feature: Close Session

## Overview

Create a route, use case, and repository method for closing an existing workout session. This feature is called when a user finishes a workout and will return the ID of the closed session.

## Goals

- Allow authenticated users to close an open workout session
- Validate that the session exists and is currently open before closing
- Ensure proper authorization (user owns the workout plan)
- Return the closed session ID on success

## Scope

### In Scope

- PATCH route at `/workout-plans/:workoutPlanId/workout-days/:workoutDayId/sessions/:sessionId`
- `completeSession` method in `WorkoutSessionRepository`
- `CloseSessionUseCase` with authorization and validation logic
- Error handling with appropriate HTTP status codes

### Out of Scope

- Modifying session data other than `completedAt`
- Bulk session operations
- Session history or analytics

## Requirements

### Functional Requirements

- FR-1: Route must accept `workoutPlanId`, `workoutDayId`, and `sessionId` as UUID parameters
- FR-2: Route must authenticate user via Better Auth session
- FR-3: Route must validate user owns the workout plan (authorization)
- FR-4: Route must verify the workout plan exists; return 404 if not found
- FR-5: Route must verify the workout day exists under the plan; return 404 if not found
- FR-6: Route must verify the session exists; return 404 if not found
- FR-7: Route must verify session is currently open (has `startedAt` but no `completedAt`); return 400 if already closed
- FR-8: Route must set `completedAt` to current timestamp on success and return the session ID

### Non-Functional Requirements

- NFR-1: Follow existing repository pattern with transaction support (`tx` parameter)
- NFR-2: Use existing error classes (`NotFoundError`, `ForbiddenError`, `BadRequestError`)
- NFR-3: Keep route thin; business logic in use case
- NFR-4: Follow project import conventions (ESM, `.js` extensions)

## Technical Approach

### Architecture

```
Route (workout-plan.route.ts)
  └─> CloseSessionUseCase
        ├─> WorkoutPlanRepository (findById for ownership check)
        └─> WorkoutSessionRepository (findById + completeSession)
```

### Data Flow

1. Route extracts auth session and route params
2. Route instantiates repos and use case, calls execute
3. Use case fetches workout plan, validates ownership
4. Use case fetches workout day, validates it belongs to plan
5. Use case fetches session, validates it belongs to day and is open
6. Use case calls repository to close session (set `completedAt`)
7. Use case returns `{ sessionId: string }`
8. Route maps errors and returns appropriate HTTP responses

### Repository Method

```typescript
// In WorkoutSessionRepository
async completeSession(id: string, tx?: tx): Promise<{ id: string }> {
  const client = tx ?? this.prismaClient;
  const session = await client.workoutSession.update({
    where: { id },
    data: { completedAt: new Date() },
  });
  return { id: session.id };
}
```

### Interface Update

The `IWorkoutSessionRepository` interface in `start-session-use-case.ts` will need a new method:

```typescript
completeSession(id: string, tx?: tx): Promise<{ id: string }>;
```

## API Contract

### Request

```
PATCH /workout-plans/:workoutPlanId/workout-days/:workoutDayId/sessions/:sessionId
```

**Parameters:**

- `workoutPlanId` (path, UUID)
- `workoutDayId` (path, UUID)
- `sessionId` (path, UUID)
- `Authorization` header (Bearer token from Better Auth)

### Response

**201 Created:**

```json
{
  "sessionId": "uuid"
}
```

**400 Bad Request:**

```json
{
  "error": "Session is already closed",
  "code": "BAD_REQUEST"
}
```

**401 Unauthorized:**

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**403 Forbidden:**

```json
{
  "error": "You do not have permission to close this session",
  "code": "FORBIDDEN"
}
```

**404 Not Found:**

```json
{
  "error": "Workout plan not found" | "Workout day not found" | "Session not found",
  "code": "NOT_FOUND"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal Server Error",
  "code": "INTERNAL_SERVER_ERROR"
}
```

## Dependencies

- Existing `WorkoutSessionRepository` (extend with `completeSession`)
- Existing `WorkoutPlanRepository` (reuse for ownership check)
- Existing error classes from `src/errors/errors.ts`
- Existing `tx` type from `src/types/utils.ts`

## Open Questions

None at this time.
