import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { WorkoutSessionRepository } from "../db/workout-session-repository.js";
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
      try {
        const { startDate, endDate } = request.query;

        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
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
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "BAD_REQUEST"
        ) {
          return reply.status(400).send({
            error: error.message,
            code: "BAD_REQUEST",
          });
        }

        app.log.error(error);
        reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
