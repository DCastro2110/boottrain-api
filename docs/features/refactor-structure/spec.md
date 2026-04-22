# Feature: Codebase Structure Refactor

## Overview

Reorganize the codebase to improve maintainability and scalability by:

- Moving Prisma repository implementations from `src/repositories/` to `src/db/`
- Extracting repository interfaces from use cases into domain entity files
- Fixing typos in domain file names
- Updating all imports to reflect the new structure

## Goals

1. **Better separation of concerns**: Repository interfaces belong in domain, not embedded in use cases
2. **Improved naming consistency**: Fix typos (`workou-day.ts` → `workout-day.ts`, `workout-exercice.ts` → `workout-exercise.ts`)
3. **Clearer architecture**: `src/db/` for database access, `src/domain/` for domain interfaces
4. **Reduced coupling**: Use cases should not import interfaces from other use cases

## Scope

### In Scope

- Create `src/db/` folder for Prisma repository implementations
- Move repository implementations from `src/repositories/` to `src/db/`
- Rename repository implementation files to kebab-case (already compliant)
- Fix typos in domain file names
- Move `IWorkoutPlanRepository` interface from `create-workout-plan-use-case.ts` to `workout-plan.ts`
- Move `IWorkoutSessionRepository` interface from `start-session-use-case.ts` to `workout-session.ts`
- Keep `IHomeInfoRepository` interface in `get-home-info-use-case.ts` (home-info is not a domain entity)
- Update imports in all affected files
- Remove `src/repositories/` folder after migration

### Out of Scope

- No changes to business logic
- No changes to API contracts or routes
- No changes to Prisma schema

## Current Structure

```
src/
├── repositories/          # Repository implementations (to be moved)
│   ├── workout-plan-repository.ts
│   ├── workout-session-repository.ts
│   └── home-info-repository.ts
├── domain/                 # Domain entity interfaces
│   ├── workout-plan.ts     # Contains IWorkoutPlan
│   ├── workout-session.ts  # Contains IWorkoutSession
│   ├── workou-day.ts      # TYPO: should be workout-day.ts
│   └── workout-exercice.ts # TYPO: should be workout-exercise.ts
├── usecases/               # Use cases with embedded repository interfaces
│   ├── create-workout-plan-use-case.ts    # Contains IWorkoutPlanRepository
│   ├── start-session-use-case.ts          # Contains IWorkoutSessionRepository
│   ├── get-home-info-use-case.ts          # Contains IHomeInfoRepository (stays here)
│   ├── get-workout-plan-use-case.ts
│   ├── get-workout-day-use-case.ts
│   └── close-session-use-case.ts
├── routes/
│   ├── workout-plan.route.ts   # Imports from src/repositories/
│   └── home-info.route.ts     # Imports from src/repositories/
```

## Target Structure

```
src/
├── db/                     # NEW: Prisma repository implementations
│   ├── workout-plan-repository.ts
│   ├── workout-session-repository.ts
│   └── home-info-repository.ts
├── domain/                 # Domain entity interfaces (includes repository interfaces)
│   ├── workout-plan.ts     # Contains IWorkoutPlan, IWorkoutPlanRepository
│   ├── workout-session.ts  # Contains IWorkoutSession, IWorkoutSessionRepository
│   ├── workout-day.ts      # FIXED: was workou-day.ts
│   └── workout-exercise.ts # FIXED: was workout-exercice.ts
├── usecases/               # Use cases (no embedded repository interfaces)
│   ├── create-workout-plan-use-case.ts
│   ├── start-session-use-case.ts
│   ├── get-home-info-use-case.ts
│   ├── get-workout-plan-use-case.ts
│   ├── get-workout-day-use-case.ts
│   └── close-session-use-case.ts
├── routes/
│   ├── workout-plan.route.ts
│   └── home-info.route.ts
```

## Technical Approach

1. **Phase 1**: Fix domain file typos first (dependencies for later steps)
2. **Phase 2**: Create domain repository interfaces before moving implementations
3. **Phase 3**: Create `src/db/` folder and move repository implementations
4. **Phase 4**: Update all imports across the codebase
5. **Phase 5**: Remove `src/repositories/` folder and verify no broken imports

## Data Flow Changes

**Before**:

```
Routes → Use Cases → (embedded interfaces) → Repositories
                              ↑
              Import interfaces from other use cases
```

**After**:

```
Routes → Use Cases → Domain Interfaces → Repositories
                              ↓
                    (domain files export interfaces)
```

## Dependencies

- All files importing from `src/repositories/` must be updated
- All use cases importing repository interfaces from other use cases must be updated
- ESLint and TypeScript will help verify no broken imports

## Open Questions

1. Where to place `IHomeInfoRepository`?
   - Decision: Keep in `src/usecases/get-home-info-use-case.ts` since home-info is not a domain entity (it's an aggregate view)
