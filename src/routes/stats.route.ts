import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { WorkoutSessionRepository } from "../db/workout-session-repository.js";
import { UnauthorizedError } from "../errors/errors.js";
import { auth } from "../lib/auth.js";
import { ErrorSchema } from "../schemas/RouteSchemas.js";
import { GetStatsUseCase } from "../usecases/get-stats-use-case.js";

const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const statsRoutes = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/stats",
    schema: {
      querystring: z.object({
        startDate: DateStringSchema,
        endDate: DateStringSchema,
      }),
      response: {
        200: z.object({
          totalSessions: z.number(),
          totalDurationInSeconds: z.number(),
          completionPercent: z.number(),
          sessions: z.array(
            z.object({
              sessionId: z.uuid(),
              startedAt: z.date(),
              endedAt: z.date().nullable(),
            }),
          ),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { startDate, endDate } = request.query;

      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        throw new UnauthorizedError("Unauthorized");
      }

      const workoutSessionRepository = new WorkoutSessionRepository();
      const getStatsUseCase = new GetStatsUseCase(workoutSessionRepository);

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const result = await getStatsUseCase.execute({
        userId: session.user.id,
        startDate: start,
        endDate: end,
      });

      reply.status(200).send(result);
    },
  });
};