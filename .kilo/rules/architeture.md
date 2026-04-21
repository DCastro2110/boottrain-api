# Architeture

## Application Flow

- routes => use cases => repositories => db

### Routes

- Should be organized by resource (e.g. `workout-plan.route.ts`, `auth.route.ts`)
- Handle HTTP concerns: auth checks, parameter extraction, response formatting
- Should be thin, delegating to use cases for business logic.
- Ex:

```ts
export const workoutPlanRoutes = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      body: z.object({
        name: z.string().max(100),
        description: z.string().trim().min(1).max(200),
        workoutDays: z.array(
          z.object({
            name: z.string().max(100),
            isRestDay: z.boolean(),
            weekDay: z.enum(weekDays),
            estimatedDurationInSeconds: z.number().min(0),
            workoutExercises: z.array(
              z.object({
                name: z.string().max(100),
                restTimeInSeconds: z.number().min(0),
                order: z.number().min(0),
                sets: z.number().min(0),
                reps: z.number().min(0),
              }),
            ),
          }),
        ),
      }),
      response: {
        201: z.object({
          workoutPlanId: z.uuid(),
        }),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { name, description, workoutDays } = request.body;
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const workoutPlanRepository = new WorkoutPlanRepository();
        const createWorkoutPlanUseCase = new CreateWorkoutPlanUseCase(
          workoutPlanRepository,
        );

        const output = await createWorkoutPlanUseCase.execute({
          userId: session.user.id,
          name,
          description,
          workoutDays,
        });

        reply.status(201).send(output);
      } catch (error) {
        app.log.error(error);
        reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
```
### Use