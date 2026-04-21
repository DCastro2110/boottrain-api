# Close Session

## Goal

Create route, use case and repository for closing a workout session. This route will be called when the user finishes a workout session. It will return the id of the closed session.

## Technical requirements:

- Create a route `PATCH /workout-plans/<workoutPlanId>/workout-days/<workoutDayId>/sessions/<sessionId>`.

## Validations

- Ensure that the user is authenticated and authorized to close a session for the specified workout plan, workout day, and session.
- Ensure that the workout plan, workout day, and session exist before attempting to close the session. If any of them do not exist, return a 404 error code.
- Ensure that the session is currently open (i.e., it has a start time but no end time) before attempting to close it. If the session is already closed, return a 400 error code with an appropriate message.
- Handle any potential errors that may occur during the process, such as database errors or validation errors, and return appropriate error codes and messages to the client.
