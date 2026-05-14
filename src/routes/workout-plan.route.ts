import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { weekDays } from "../../generated/prisma/enums.js";
import { WorkoutPlanRepository } from "../db/workout-plan-repository.js";
import { WorkoutSessionRepository } from "../db/workout-session-repository.js";
import {
  UnauthorizedError,
} from "../errors/errors.js";
import { auth } from "../lib/auth.js";
import { ErrorSchema } from "../schemas/RouteSchemas.js";
import { CloseSessionUseCase } from "../usecases/close-session-use-case.js";
import { CreateWorkoutPlanUseCase } from "../usecases/create-workout-plan-use-case.js";
import { GetAllWorkoutPlansUseCase } from "../usecases/get-all-workout-plans.use-case.js";
import { GetWorkoutDayUseCase } from "../usecases/get-workout-day-use-case.js";
import { GetWorkoutPlanUseCase } from "../usecases/get-workout-plan-use-case.js";
import { StartSessionUseCase } from "../usecases/start-session-use-case.js";

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
            weekDay: z.enum(Object.values(weekDays)),
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
      const { name, description, workoutDays } = request.body;
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        throw new UnauthorizedError("Unauthorized");
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

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:workoutPlanId",
    schema: {
      params: z.object({
        workoutPlanId: z.uuid(),
      }),
      response: {
        200: z.object({
          id: z.uuid(),
          name: z.string(),
          description: z.string(),
          isActive: z.boolean(),
          workoutDays: z.array(
            z.object({
              id: z.uuid(),
              name: z.string(),
              isRestDay: z.boolean(),
              weekDay: z.enum(Object.values(weekDays)),
              coverImageUrl: z.string().nullable(),
              estimatedDurationInSeconds: z.number(),
              workoutExercises: z.array(
                z.object({
                  id: z.uuid(),
                  name: z.string(),
                  restTimeInSeconds: z.number(),
                  order: z.number(),
                  sets: z.number(),
                  reps: z.number(),
                }),
              ),
            }),
          ),
        }),
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { workoutPlanId } = request.params;

      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        throw new UnauthorizedError("Unauthorized");
      }

      const workoutPlanRepository = new WorkoutPlanRepository();
      const getWorkoutPlanUseCase = new GetWorkoutPlanUseCase(
        workoutPlanRepository,
      );

      const result = await getWorkoutPlanUseCase.execute({
        userId: session.user.id,
        workoutPlanId,
      });

      reply.status(200).send(result.workoutPlan);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      response: {
        200: z.array(
          z.object({
            id: z.uuid(),
            name: z.string(),
            description: z.string(),
            isActive: z.boolean(),
            workoutDays: z.array(
              z.object({
                id: z.string().uuid(),
                name: z.string(),
                weekDay: z.enum(Object.values(weekDays)),
                estimatedDurationInSeconds: z.number(),
                coverImageUrl: z.string().nullable(),
                workoutExercises: z.array(
                  z.object({
                    name: z.string(),
                    reps: z.number(),
                    sets: z.number(),
                    description: z.string().nullable(),
                    estimatedDurationInSeconds: z.number().nullable(),
                  }),
                ),
              }),
            ),
          }),
        ),
        401: ErrorSchema,
        403: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        throw new UnauthorizedError("Unauthorized");
      }

      const workoutPlanRepository = new WorkoutPlanRepository();
      const getAllWorkoutPlansUseCase = new GetAllWorkoutPlansUseCase(
        workoutPlanRepository,
      );
      const result = await getAllWorkoutPlansUseCase.execute(session.user.id);

      reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:workoutPlanId/workout-days/:workoutDayId/sessions",
    schema: {
      params: z.object({
        workoutPlanId: z.string().uuid(),
        workoutDayId: z.string().uuid(),
      }),
      response: {
        201: z.object({
          sessionId: z.string().uuid(),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { workoutPlanId, workoutDayId } = request.params;

      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        throw new UnauthorizedError("Unauthorized");
      }

      const workoutPlanRepository = new WorkoutPlanRepository();
      const workoutSessionRepository = new WorkoutSessionRepository();
      const startSessionUseCase = new StartSessionUseCase(
        workoutPlanRepository,
        workoutSessionRepository,
      );

      const result = await startSessionUseCase.execute({
        userId: session.user.id,
        workoutPlanId,
        workoutDayId,
      });

      reply.status(201).send({ sessionId: result.sessionId });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:workoutPlanId/workout-days/:workoutDayId/sessions/:sessionId",
    schema: {
      params: z.object({
        workoutPlanId: z.string().uuid(),
        workoutDayId: z.string().uuid(),
        sessionId: z.string().uuid(),
      }),
      response: {
        201: z.object({
          sessionId: z.string().uuid(),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { workoutPlanId, workoutDayId, sessionId } = request.params;

      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        throw new UnauthorizedError("Unauthorized");
      }

      const workoutPlanRepository = new WorkoutPlanRepository();
      const workoutSessionRepository = new WorkoutSessionRepository();
      const closeSessionUseCase = new CloseSessionUseCase(
        workoutPlanRepository,
        workoutSessionRepository,
      );

      const result = await closeSessionUseCase.execute({
        userId: session.user.id,
        workoutPlanId,
        workoutDayId,
        sessionId,
      });

      reply.status(201).send({ sessionId: result.sessionId });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:workoutPlanId/workout-days/:workoutDayId",
    schema: {
      params: z.object({
        workoutPlanId: z.string().uuid(),
        workoutDayId: z.string().uuid(),
      }),
      response: {
        200: z.object({
          weekDay: z.enum(Object.values(weekDays)),
          name: z.string(),
          estimatedDurationInSeconds: z.number(),
          numberOfExercises: z.number(),
          coverImageUrl: z.string().nullable(),
          workoutSessionId: z.string().nullable(),
          workoutExercises: z.array(
            z.object({
              name: z.string(),
              reps: z.number(),
              sets: z.number(),
              description: z.string(),
              estimatedDurationInSeconds: z.number(),
            }),
          ),
        }),
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { workoutPlanId, workoutDayId } = request.params;

      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        throw new UnauthorizedError("Unauthorized");
      }

      const workoutPlanRepository = new WorkoutPlanRepository();
      const workoutSessionRepository = new WorkoutSessionRepository();
      const getWorkoutDayUseCase = new GetWorkoutDayUseCase(
        workoutPlanRepository,
        workoutSessionRepository,
      );

      const result = await getWorkoutDayUseCase.execute({
        userId: session.user.id,
        workoutPlanId,
        workoutDayId,
        userTimezone: (session as unknown as { timezone: string }).timezone,
      });

      reply.status(200).send(result);
    },
  });
};