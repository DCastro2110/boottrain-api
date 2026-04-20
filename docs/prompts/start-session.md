# Start Session

## Goal

Create route, use case and repository for starting a workout session. This route will be called when the user starts a workout session. It will return the id of the started session.

## Technical requirements:

- Create a route `POST /workout-plans/<workoutPlanId>/workout-days/<workoutDayId>/sessions`.
- Create a use case `StartSessionUseCase` that will be called by the route. This use case will call the repository to start the session.
- Create a repository called WorkoutSessionRepository with a method `startSession(workoutPlanId: string, workoutDayId: string): Promise<void>` that will start the session in the database.
- The session should be started by creating a new entry in the `workout_sessions` table with the current timestamp as the start time and null as the end time.
- The route should return a 201 status code if the session was started successfully, or an appropriate error code if there was an issue
- Ensure that the user is authenticated and authorized to start a session for the specified workout plan and workout day.
- Ensure that the workout plan and workout day exist before attempting to start a session. If either does not exist, return a 404 error code.
- Handle any potential errors that may occur during the process, such as database errors or validation errors, and return appropriate error codes and messages to the client.
- Follow the strructure and conventions of the existing codebase for consistency.
