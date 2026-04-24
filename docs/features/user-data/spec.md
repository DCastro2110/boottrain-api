# Feature: User Data

## Overview

Provide the AI with access to user-specific data (height, weight, age, fitness level, body fat percentage) for personalized workout plans and nutrition advice.

## Goals

- Enable storage and retrieval of user biometric data
- Support personalized workout and nutrition recommendations
- Follow existing codebase patterns for consistency

## Scope

### In Scope

- Add user biometric fields to database schema
- Create PUT `/users/{userId}` endpoint for updating user data
- Create GET `/users/{userId}` endpoint for retrieving user data
- Implement use cases for update and retrieve operations
- Implement repository for database interactions

### Out of Scope

- Authentication logic (handled by Better Auth)
- AI integration or recommendation generation
- Historical tracking of weight changes

## Requirements

### Functional Requirements

- FR-1: User can update their profile with height (cm), weight (grams), age (years), fitness level, and body fat percentage
- FR-2: User can retrieve their stored profile data
- FR-3: All endpoints require authentication (session-based)
- FR-4: User can only access/modify their own data (userId from session must match)
- FR-5: Fitness level is restricted to: "beginner", "intermediate", "advanced"
- FR-6: Body fat percentage is an integer between 0 and 100

### Non-Functional Requirements

- NFR-1: Response times should be under 200ms for typical requests
- NFR-2: Follow existing error handling patterns with proper HTTP status codes
- NFR-3: Input validation using Zod schemas

## Technical Approach

### Database Schema Changes (Prisma)

Add to the `User` model in `prisma/schema.prisma`:

- `height`: Int (centimeters) - nullable
- `weight`: Int (grams) - nullable
- `age`: Int (years) - nullable
- `fitnessLevel`: enum ("beginner", "intermediate", "advanced") - nullable
- `bodyFatPercentage`: Int (0-100) - nullable

Create a new enum `fitnessLevel` for the fitness level field.

### API Endpoints

#### PUT `/users/{userId}`

Updates user biometric data.

**Request:**
- Params: `userId` (uuid)
- Body:
  ```json
  {
    "height": number,        // int, centimeters, min: 1
    "weight": number,        // int, grams, min: 1
    "age": number,            // int, years, min: 0
    "fitnessLevel": "beginner" | "intermediate" | "advanced",
    "bodyFatPercentage": number  // int, 0-100
  }
  ```

**Response:**
- 200: `{ "userId": "uuid" }`
- 401: Unauthorized
- 403: Forbidden (trying to update another user's data)
- 404: User not found
- 500: Internal Server Error

#### GET `/users/{userId}`

Retrieves user biometric data.

**Request:**
- Params: `userId` (uuid)

**Response:**
- 200:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "name": "string | null",
    "height": "number | null",
    "weight": "number | null",
    "age": "number | null",
    "fitnessLevel": "beginner" | "intermediate" | "advanced" | null,
    "bodyFatPercentage": "number | null",
    "image": "string | null"
  }
  ```
- 401: Unauthorized
- 403: Forbidden (trying to access another user's data)
- 404: User not found
- 500: Internal Server Error

### Use Case Interfaces

#### IUpdateUserDataUseCase

```typescript
interface InputDTO {
  userId: string;
  height?: number;
  weight?: number;
  age?: number;
  fitnessLevel?: "beginner" | "intermediate" | "advanced";
  bodyFatPercentage?: number;
}

interface OutputDTO {
  userId: string;
}
```

#### IGetUserDataUseCase

```typescript
interface InputDTO {
  userId: string;
}

interface OutputDTO {
  id: string;
  email: string;
  name: string | null;
  height: number | null;
  weight: number | null;
  age: number | null;
  fitnessLevel: "beginner" | "intermediate" | "advanced" | null;
  bodyFatPercentage: number | null;
  image: string | null;
}
```

### Repository Interface (IUserRepository)

```typescript
interface IUserRepository {
  findById(id: string): Promise<IUserData | null>;
  update(
    id: string,
    data: {
      height?: number;
      weight?: number;
      age?: number;
      fitnessLevel?: "beginner" | "intermediate" | "advanced";
      bodyFatPercentage?: number;
    },
  ): Promise<{ id: string }>;
}

interface IUserData {
  id: string;
  email: string;
  name: string | null;
  height: number | null;
  weight: number | null;
  age: number | null;
  fitnessLevel: "beginner" | "intermediate" | "advanced" | null;
  bodyFatPercentage: number | null;
  image: string | null;
}
```

### File Structure

```
src/
  domain/
    user.ts              # IUserRepository, IUserData interfaces
  db/
    user-repository.ts  # UserRepository implements IUserRepository
  usecases/
    update-user-data-use-case.ts
    get-user-data-use-case.ts
  routes/
    user.route.ts       # PUT /users/{userId}, GET /users/{userId}
  index.ts              # Register user routes
```

### Error Handling

Follow existing patterns:
- `NotFoundError` (code: "NOT_FOUND") - 404
- `ForbiddenError` (code: "FORBIDDEN") - 403 when userId mismatch
- `UnauthorizedError` (code: "UNAUTHORIZED") - 401 when no session

## Dependencies

- Prisma (existing)
- Zod (existing)
- Better Auth (existing)
- Fastify (existing)