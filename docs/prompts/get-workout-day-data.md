# Get Workout Day Data

## Goal

Create route, use case and repository for getting workout day data.

## Technical requirements:

### Better Auth

- Create a field in session called timezone that will store the time zone of the user when the session was started. This will allow us to get the workout day data for the correct date based on the user's time zone.
  - Use Better Auth MCP to setup this field in the session and to get the user's time zone when starting a session.

### API

- Create a route `GET /workout-plans/<workoutPlanId>/workout-days/<workoutDayId>`.
- Get the following data of the workout day:
  - weekDay: string (sunday, monday, tuesday, wednesday, thursday, friday, saturday)
  - name: string (name of the workout day)
  - estimatedDurationInSeconds: number
  - numberOfExercises: number
  - coverImageUrl: string
  - workoutSessionId: string (id of the workout session if there is an open session for this workout day, otherwise null)
  - workoutExercises: array of objects with the following properties:
    - name: string (name of the exercise)
    - reps: number
    - sets: number
    - description: string
    - estimatedDurationInSeconds: number
- For find the workout session, you should look for a session that has the same workout day id and the startedAt is in the same week as the current date. You can use the date-fns library to compare the dates.

````ts
prisma.workoutSession.findFirst({
  where: {
    workoutDayId,
    startedAt: {
      gte: dayjs().startOf('year'),
      lte: dayjs().endOf('month'),
    },
  },
});
```

````
