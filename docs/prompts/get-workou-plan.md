# Get Workout Plan

## Goal

Create route, use case and repository for getting workout plan data.

## Technical requirements

- Create a route `GET /workout-plans/<workoutPlanId>`.
- Create a use case `GetWorkoutPlanUseCase` that will be called by the route. This use case will call the repository to get the workout plan data.
- Create a method inside WorkoutPlanRepository called `getById(id: string): Promise<WorkoutPlan>` that will get the workout plan data from the database.
- The route should return a 200 status code if the workout plan was retrieved successfully, or an appropriate error code if there was an issue.

## Business logic

- Ensure that the user is authenticated and authorized to get the workout plan data for the specified workout plan.
- If Workout plan with the specified id does not exist, return a 404 error code.
- Handle any potential errors that may occur during the process, such as database errors or validation errors, and return appropriate error codes and messages to the client.
- Follow the structure and conventions of the existing codebase for consistency.
