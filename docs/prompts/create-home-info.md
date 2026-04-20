# Create Home Info

## Goal

Create route, use case and repository for creating home info.

## Technical requirements:

- Get the consistency of the user in the week. Read WorkoutDaySession starting on sunday and ending on saturday. You should return an array with an object for each day of the week with the following properties:
  - day: string (sunday, monday, tuesday, wednesday, thursday, friday, saturday)
  - status: string (completed, not_completed, missed)
- Get the fire sequence of the user. You should return the number of consective days that the user has completed their workout sessions. For example, if the user completed their workout sessions on monday, tuesday and wednesday the fire sequence is 3. If the the user miss thursday and completed on friday, the fire sequence is 1.
- Get the data of today WorkouDay. You should return the following properties:
  - date: string (2024-01-01)
  - name: string (name of the workout day)
  - estimatedDurationInSeconds: number
  - numberOfExercises: number
  - coverImageUrl
  - isCompleted: boolean

## Rules

- You should follow the same structure and patterns used in the create-workout-plan
- If miss any field in the database schema, you can add it and create a migration for it.
