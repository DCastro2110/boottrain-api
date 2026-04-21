# Home Info Refactor

## Goal

Refactor home info route, use case and repositoy for separe the logic of getting the home info for the user and the logic of getting the home info for the workout plan. This will allow us to have a more modular and maintainable codebase.

## Technical requirements:

- Modify the route `GET /home-info`to `GET /home-info/<date>` to get the home info for a specific date.
- All logic should be put in the use case `GetHomeInfoUseCase` and not in the repository. The repository should only be responsible for getting the data from the database and not for any business logic.
- The use case should call the repository to get the home info for the user and the home info for the workout plan, and then combine the results to return the final home info for the user.
- Ensure that the user is authenticated and authorized to get the home info for the specified date.
- Handle any potential errors that may occur during the process, such as database errors or validation errors, and return appropriate error codes and messages to the client.
- Follow the structure and conventions of the existing codebase for consistency.
