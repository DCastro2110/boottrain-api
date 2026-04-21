# Close Session - Implementation Tasks

## Task List

1. **[x] (done - committed)** Add `completeSession` method to repository
2. **[x] (done - committed)** Create `CloseSessionUseCase` use case
3. **[x] (done - committed)** Add `PATCH` route to close session
4. **[x] (done - committed)** Verify TypeScript compilation

---

## Task 1: Add `completeSession` method to repository

**Description:** Add the `completeSession` method to `WorkoutSessionRepository` that updates a session's `completedAt` timestamp. Also update the `IWorkoutSessionRepository` interface in `start-session-use-case.ts` to include this new method.

**Files to modify:**

- `src/repositories/workout-session-repository.ts` - add `completeSession` method
- `src/usecases/start-session-use-case.ts` - add method signature to interface

**Acceptance Criteria:**

- `completeSession(id: string, tx?: tx): Promise<{ id: string }>` method exists
- Uses Prisma `update` to set `completedAt: new Date()`
- Follows existing repository pattern with optional transaction parameter

---

## Task 2: Create `CloseSessionUseCase` use case

**Description:** Create the use case that contains all business logic for closing a session. Must validate ownership, existence, and session state (open vs closed).

**File to create:**

- `src/usecases/close-session-use-case.ts`

**Interface (to be added to repository interface):**

```typescript
completeSession(id: string, tx?: tx): Promise<{ id: string }>;
```

**Acceptance Criteria:**

- Use case accepts `{ userId, workoutPlanId, workoutDayId, sessionId }` as input
- Throws `NotFoundError` if workout plan not found
- Throws `ForbiddenError` if user does not own the workout plan
- Throws `NotFoundError` if workout day not found in plan
- Throws `NotFoundError` if session not found
- Throws `BadRequestError` if session is already closed (`completedAt !== null`)
- Calls `workoutSessionRepository.completeSession()` on success
- Returns `{ sessionId: string }`

---

## Task 3: Add `PATCH` route to close session

**Description:** Add the PATCH route to `workout-plan.route.ts` following the existing pattern. Include auth check, error mapping, and thin handler.

**File to modify:**

- `src/routes/workout-plan.route.ts`

**Route:**

```
PATCH /:workoutPlanId/workout-days/:workoutDayId/sessions/:sessionId
```

**Acceptance Criteria:**

- Params schema uses UUID validation for all three IDs
- Response schema includes 201, 400, 401, 403, 404, 500 status codes
- Auth check returns 401 if no session
- All error types mapped to appropriate HTTP codes
- Route instantiates repos and use case, calls execute, returns sessionId

---

## Task 4: Verify TypeScript compilation

**Description:** Run the TypeScript compiler to ensure all new code compiles without errors.

**Command:**

```bash
pnpm tsc --noEmit
```

**Acceptance Criteria:**

- No TypeScript errors for new files
- No import/reference errors
- All type checks pass
