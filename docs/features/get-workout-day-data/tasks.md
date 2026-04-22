# Get Workout Day Data - Implementation Tasks

## Task List

1. **[x] (done - committed)** Add `timezone` field to Better Auth session
2. **[x] (done - committed)** Create `findWorkoutDayById` repository method
3. **[x] (done - committed)** Create `GetWorkoutDayUseCase` use case
4. **[x] (done - committed)** Add `GET /workout-plans/:workoutPlanId/workout-days/:workoutDayId` route
5. **[x] (done - committed)** Verify TypeScript compilation

---

## Task 1: Add `timezone` field to Better Auth session

**Description:** Configure Better Auth to capture and store the user's timezone in the session.

**Files to modify:**

- `src/lib/auth.ts`

**Implementation Details:**

Better Auth allows customizing the session by adding custom fields. Configure the session to include a `timezone` field that captures the user's timezone when the session is created.

**Acceptance Criteria:**

- [ ] Session includes `timezone` field
- [ ] Timezone is captured when session is started
- [ ] Session type is updated to reflect the new field

---

## Task 2: Create `findWorkoutDayById` repository method

**Description:** Add a method to `WorkoutPlanRepository` to fetch a specific workout day with its exercises.

**File to modify:**

- `src/repositories/workout-plan-repository.ts`

**Implementation Details:**

Add a new method `findWorkoutDayById(workoutPlanId, workoutDayId)` that:

1. Finds the workout plan by ID
2. Verifies the workout day exists within that plan
3. Returns workout day data with exercises
4. Returns null if not found

**Acceptance Criteria:**

- [ ] Method accepts `workoutPlanId` and `workoutDayId` as parameters
- [ ] Returns workout day with exercises or null
- [ ] Includes `numberOfExercises` in the return type (computed from workoutExercises length)
- [ ] Handles non-existent workout plan and workout day gracefully

---

## Task 3: Create `GetWorkoutDayUseCase` use case

**Description:** Create the use case that fetches a workout day by ID, validates ownership, and looks up open sessions.

**File to create:**

- `src/usecases/get-workout-day-use-case.ts`

**Implementation Details:**

1. Accept `{ userId, workoutPlanId, workoutDayId }` as input
2. Call `workoutPlanRepository.findWorkoutDayById(workoutPlanId, workoutDayId)`
3. If not found, throw `NotFoundError("Workout day not found")`
4. If found but `userId` does not match, throw `ForbiddenError("You do not have permission to access this workout day")`
5. Check for open session using `workoutSessionRepository.findOpenSessionInCurrentWeek(workoutDayId)`
6. Return workout day data with `workoutSessionId` (null if no open session)

**Required Imports:**

- `NotFoundError`, `ForbiddenError` from `../errors/errors.js`
- `IWorkoutPlanRepository` from `./create-workout-plan-use-case.js`
- `IWorkoutSessionRepository` from `./start-session-use-case.js`
- `dayjs` for date comparison

**Acceptance Criteria:**

- [ ] Use case accepts `{ userId, workoutPlanId, workoutDayId }` as input
- [ ] Throws `NotFoundError` if workout day not found
- [ ] Throws `ForbiddenError` if user does not own the workout plan
- [ ] Returns workout day data with open session info
- [ ] Open session lookup uses dayjs for week comparison

---

## Task 4: Add `GET /workout-plans/:workoutPlanId/workout-days/:workoutDayId` route

**Description:** Add the GET route to `workout-plan.route.ts` following the existing pattern.

**File to modify:**

- `src/routes/workout-plan.route.ts`

**Route:**

```
GET /workout-plans/:workoutPlanId/workout-days/:workoutDayId
```

**Schema:**

```typescript
params: z.object({
  workoutPlanId: z.string().uuid(),
  workoutDayId: z.string().uuid(),
}),
response: {
  200: z.object({
    weekDay: z.enum(weekDays),
    name: z.string(),
    estimatedDurationInSeconds: z.number(),
    numberOfExercises: z.number(),
    coverImageUrl: z.string().nullable(),
    workoutSessionId: z.string().uuid().nullable(),
    workoutExercises: z.array(
      z.object({
        name: z.string(),
        reps: z.number(),
        sets: z.number(),
        description: z.string(),
        estimatedDurationInSeconds: z.number(),
      }),
    ),
  }),
  401: ErrorSchema,
  403: ErrorSchema,
  404: ErrorSchema,
  500: ErrorSchema,
},
```

**Handler Logic:**

1. Extract `workoutPlanId` and `workoutDayId` from `request.params`
2. Get auth session via `auth.api.getSession({ headers: fromNodeHeaders(request.headers) })`
3. If no session, return 401
4. Instantiate repository and use case
5. Call `getWorkoutDayUseCase.execute({ userId: session.user.id, workoutPlanId, workoutDayId })`
6. On success, return 200 with workout day data
7. Map errors appropriately

**Acceptance Criteria:**

- [ ] Route registered with GET method
- [ ] UUID validation for both IDs
- [ ] 401 if no session
- [ ] 403 for forbidden access
- [ ] 404 if not found
- [ ] Returns workout day data with exercises and optional session ID

---

## Task 5: Verify TypeScript compilation

**Description:** Run `pnpm tsc --noEmit` to ensure all new code compiles.

**Command:**

```bash
pnpm tsc --noEmit
```

**Acceptance Criteria:**

- [ ] No TypeScript errors
- [ ] No import/reference errors
- [ ] All type checks pass
