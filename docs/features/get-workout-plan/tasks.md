# Get Workout Plan - Implementation Tasks

## Task List

1. **[x] (done - committed)** Create `GetWorkoutPlanUseCase` use case
2. **[x] (done - committed)** Add `GET /workout-plans/:workoutPlanId` route
3. **[x] (done - committed)** Verify TypeScript compilation

---

## Task 1: Create `GetWorkoutPlanUseCase` use case

**Description:** Create the use case that fetches a workout plan by ID and validates ownership.

**File to create:**

- `src/usecases/get-workout-plan-use-case.ts`

**Logic Flow:**

1. Accept `{ userId, workoutPlanId }` as input
2. Call `workoutPlanRepository.findById(workoutPlanId)`
3. If not found, throw `NotFoundError("Workout plan not found")`
4. If found but `userId` does not match, throw `ForbiddenError("You do not have permission to access this workout plan")`
5. Return `{ workoutPlan }` (the full workout plan data)

**Required Imports:**

- `NotFoundError`, `ForbiddenError` from `../errors/errors.js`
- `IWorkoutPlanRepository` from `./create-workout-plan-use-case.js`

**Acceptance Criteria:**

- [ ] Use case accepts `{ userId, workoutPlanId }` as input
- [ ] Throws `NotFoundError` if workout plan not found
- [ ] Throws `ForbiddenError` if user does not own the workout plan
- [ ] Returns the full workout plan data on success

---

## Task 2: Add `GET /workout-plans/:workoutPlanId` route

**Description:** Add the GET route to `workout-plan.route.ts` following the existing pattern.

**File to modify:**

- `src/routes/workout-plan.route.ts`

**Route:**

```
GET /workout-plans/:workoutPlanId
```

**Schema:**

```typescript
params: z.object({
  workoutPlanId: z.string().uuid(),
}),
response: {
  200: z.object({ ... }), // full workout plan
  401: ErrorSchema,
  403: ErrorSchema,
  404: ErrorSchema,
  500: ErrorSchema,
},
```

**Handler Logic:**

1. Extract `workoutPlanId` from `request.params`
2. Get auth session via `auth.api.getSession({ headers: fromNodeHeaders(request.headers) })`
3. If no session, return 401
4. Instantiate repository and use case
5. Call `getWorkoutPlanUseCase.execute({ userId: session.user.id, workoutPlanId })`
6. On success, return 200 with workout plan data
7. Map errors appropriately

**Acceptance Criteria:**

- [ ] Route registered with GET method
- [ ] UUID validation for `workoutPlanId`
- [ ] 401 if no session
- [ ] 403 for forbidden access
- [ ] 404 if not found
- [ ] Returns full workout plan data on success

---

## Task 3: Verify TypeScript compilation

**Description:** Run `pnpm tsc --noEmit` to ensure all new code compiles.

**Command:**

```bash
pnpm tsc --noEmit
```

**Acceptance Criteria:**

- [ ] No TypeScript errors
- [ ] No import/reference errors
- [ ] All type checks pass
