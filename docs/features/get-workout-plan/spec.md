# Feature: Get Workout Plan

## Overview

Create a route, use case, and repository method for retrieving workout plan data by ID. The feature allows authenticated users to fetch a specific workout plan they own.

## Goals

- Provide an API endpoint to retrieve workout plan details by ID
- Enforce authentication and ownership authorization
- Follow existing codebase conventions for consistency
- Reuse existing `findById` method in `WorkoutPlanRepository`

## Scope

### In Scope

- New route: `GET /workout-plans/:workoutPlanId`
- New use case: `GetWorkoutPlanUseCase`
- Reuse of existing `WorkoutPlanRepository.findById()` method
- Proper error handling with appropriate status codes
- Authentication check using Better Auth session

### Out of Scope

- Creating new repository methods (reuse existing `findById`)
- Pagination or filtering
- Updating workout plans
- Deleting workout plans

## Requirements

### Functional Requirements

- FR-1: Route accepts `workoutPlanId` as URL parameter (UUID format)
- FR-2: Route authenticates user via Better Auth session
- FR-3: Route validates `workoutPlanId` is a valid UUID (returns 400 if invalid)
- FR-4: Use case fetches workout plan using `WorkoutPlanRepository.findById()`
- FR-5: Use case verifies the workout plan belongs to the authenticated user (returns 403 if not)
- FR-6: Use case returns 404 if workout plan does not exist
- FR-7: Route returns 200 with full workout plan data on success

### Non-Functional Requirements

- NFR-1: Follow existing route/use case/repository patterns
- NFR-2: Use explicit return types on all public methods
- NFR-3: Handle database errors with generic 500 response
- NFR-4: Use ESM imports with explicit `.js` extensions

## Technical Approach

### Route

```
GET /workout-plans/:workoutPlanId
Parameters:
  - workoutPlanId: UUID (path param)
Headers:
  - Authorization: session token
Responses:
  - 200: Workout plan data
  - 400: Invalid UUID format
  - 401: Unauthorized (no session)
  - 403: Forbidden (not owner)
  - 404: Workout plan not found
  - 500: Internal server error
```

### Use Case Flow

1. Extract `userId` from session
2. Validate `workoutPlanId` is UUID
3. Call repository `findById(workoutPlanId)`
4. If not found, throw NOT_FOUND error
5. If found but `userId` does not match, throw FORBIDDEN error
6. Return workout plan data

### Data Flow

```
Request → Route → GetWorkoutPlanUseCase → WorkoutPlanRepository.findById() → Prisma → DB
```

## Data Models / API Contracts

### Request

- Method: `GET`
- URL: `/workout-plans/:workoutPlanId`
- Headers: `Authorization: Bearer <session_token>`

### Response (200 OK)

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "userId": "uuid",
  "isActive": "boolean",
  "workoutDays": [
    {
      "id": "uuid",
      "name": "string",
      "isRestDay": "boolean",
      "weekDay": "MONDAY | TUESDAY | ...",
      "estimatedDurationInSeconds": "number",
      "workoutExercises": [
        {
          "id": "uuid",
          "name": "string",
          "restTimeInSeconds": "number",
          "order": "number",
          "sets": "number",
          "reps": "number"
        }
      ]
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
- `Better Auth` for session management
- `WorkoutPlanRepository` (existing `findById` method)
- `IWorkoutPlan` interface from `src/domain/workout-plan.ts`
- `tx` type from `src/types/utils.ts`

## Open Questions

- None at this time. All patterns are established in the existing codebase.
