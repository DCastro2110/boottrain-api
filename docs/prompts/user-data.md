# User Data

## Goal

The goal of this prompt is to provide the AI with access to user-specific data, such as height, weight, age, fitness level, and percentage of body fat. This information can be used to generate personalized workout plans, nutrition advice, and other fitness-related recommendations.

## Technical Specification

- Add to the user schema the following fields:
  - `height`: number (in centimeters)
  - `weight`: number (in grams)
  - `age`: number (in years)
  - `fitnessLevel`: enum ("beginner", "intermediate", "advanced")
  - `bodyFatPercentage`: integer (0-100)
- Create an API endpoint to update the user's data: `PUT /users/{userId}`
- Create an API endpoint to retrieve the user's data: `GET /users/{userId}`
- Create a use case for each operation (update and retrieve user data) that interacts with the database to perform the necessary actions.
- Follow the example of the existing use cases and API routes in the codebase to maintain consistency.