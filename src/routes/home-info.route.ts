import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { auth } from "../lib/auth.js";
import {
  type HomeInfoResponse,
  HomeInfoResponseSchema,
} from "../schemas/home-info.schemas.js";
import { ErrorSchema } from "../schemas/RouteSchemas.js";

const placeholderWeekConsistency: HomeInfoResponse["weekConsistency"] = [
  { day: "SUNDAY", status: "not_completed" },
  { day: "MONDAY", status: "not_completed" },
  { day: "TUESDAY", status: "not_completed" },
  { day: "WEDNESDAY", status: "not_completed" },
  { day: "THURSDAY", status: "not_completed" },
  { day: "FRIDAY", status: "not_completed" },
  { day: "SATURDAY", status: "not_completed" },
];

export const homeInfoRoutes = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      response: {
        200: HomeInfoResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        return reply.status(200).send({
          weekConsistency: placeholderWeekConsistency,
          fireSequence: 0,
          todayWorkoutDay: null,
        });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
