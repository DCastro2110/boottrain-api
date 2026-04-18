import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { weekDays } from "../../generated/prisma/enums.js";
import { auth } from "../lib/auth.js";
import { WorkoutPlanRepository } from "../repositories/workout-plan-repository.js";
import { CreateWorkoutPlanUseCase } from "../usecases/create-workout-plan-use-case.js";

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
        401: z.object({
          error: z.string(),
          code: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
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
    },
  });
};
