import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { HomeInfoRepository } from "../db/home-info-repository.js";
import { auth } from "../lib/auth.js";
import { HomeInfoResponseSchema } from "../schemas/home-info.schemas.js";
import { ErrorSchema } from "../schemas/RouteSchemas.js";
import { GetHomeInfoUseCase } from "../usecases/get-home-info-use-case.js";

const homeInfoRepository = new HomeInfoRepository();
const getHomeInfoUseCase = new GetHomeInfoUseCase(homeInfoRepository);

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

        const output = await getHomeInfoUseCase.execute({
          userId: session.user.id,
        });

        return reply.status(200).send(output);
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
