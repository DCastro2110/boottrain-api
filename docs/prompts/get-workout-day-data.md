# Get Workout Day Data

## Goal

Create route, use case and repository for getting workout day data.

## Technical requirements:

- Get the following data of the workout day:
  - weekDay: string (sunday, monday, tuesday, wednesday, thursday, friday, saturday)
  - name: string (name of the workout day)
  - estimatedDurationInSeconds: number
  - numberOfExercises: number
  - coverImageUrl
  - isCompleted: boolean
  - workoutExercises: array of objects with the following properties:
    - name: string (name of the exercise)
    - reps: number
    - sets: number
    - description: string
    - estimatedDurationInSeconds: number
