# Get Stats

## Goal

Create route, use case and repository for getting stats of all user's workout sessions according to the start and end date provided by the user. The stats should include the total number of sessions, total duration of all sessions, and conclusion stats.

## Technical requirements:

- The route should accept start and end dates as query parameters.
- The use case should validate the dates and ensure they are in the correct format.
  - Start date should be before end date.
- The repository should fetch the relevant workout sessions from the database based on the provided dates.
- The stats should be calculated and returned in a structured format.
- Create a route `GET /stats?startDate=<startDate>&endDate=<endDate>`.
- The response should include:
  - Total number of sessions.
  - Total duration of all sessions.
  - Conclusion percents.
  - A list with the stats for each session, including session id, startedAt, endedAt.

    ```ts
    sessions: {
      sessionId: string;
      status: WeekConsistencyStatusSchema;
      endedAt: Date;
    }
    (Record < session - date, any > []);
    ```
