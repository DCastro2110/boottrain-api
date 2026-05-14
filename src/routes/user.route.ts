import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { UserRepository } from "../db/user-repository.js";
import { NotFoundError } from "../errors/errors.js";
import { auth } from "../lib/auth.js";
import { ErrorSchema } from "../schemas/RouteSchemas.js";
import { GetUserDataUseCase } from "../usecases/get-user-data-use-case.js";
import { UpdateUserDataUseCase } from "../usecases/update-user-data-use-case.js";

const fitnessLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

const userResponseSchema = z.object({
  email: z.string(),
  name: z.string().nullable(),
  height: z.number().nullable(),
  weight: z.number().nullable(),
  age: z.number().nullable(),
  fitnessLevel: fitnessLevelSchema.nullable(),
  bodyFatPercentage: z.number().nullable(),
  image: z.string().nullable(),
});

const updateUserBodySchema = z.object({
  name: z.string().max(100).optional(),
  height: z.number().min(1).max(300).optional(),
  weight: z.number().min(1).optional(),
  age: z.number().min(0).max(120).optional(),
  fitnessLevel: fitnessLevelSchema.optional(),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  image: z.url().optional(),
});

export const userRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:userId",
    schema: {
      params: z.object({
        userId: z.string(),
      }),
      response: {
        200: userResponseSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { userId } = request.params;
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        if (session.user.id !== userId) {
          return reply.status(403).send({
            error: "Forbidden",
            code: "FORBIDDEN",
          });
        }

        const userRepository = new UserRepository();
        const getUserDataUseCase = new GetUserDataUseCase(userRepository);

        const output = await getUserDataUseCase.execute({
          userId,
        });

        return reply.status(200).send(output);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND",
          });
        }

        app.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:userId",
    schema: {
      params: z.object({
        userId: z.string().uuid(),
      }),
      body: updateUserBodySchema,
      response: {
        200: z.object({
          userId: z.string(),
        }),
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { userId } = request.params;
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        if (session.user.id !== userId) {
          return reply.status(403).send({
            error: "Forbidden",
            code: "FORBIDDEN",
          });
        }

        const userRepository = new UserRepository();
        const updateUserDataUseCase = new UpdateUserDataUseCase(userRepository);

        const output = await updateUserDataUseCase.execute({
          userId,
          ...request.body,
        });

        return reply.status(200).send(output);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND",
          });
        }

        app.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
