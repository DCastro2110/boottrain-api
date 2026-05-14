import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { HomeInfoRepository } from "../db/home-info-repository.js";
import { UnauthorizedError } from "../errors/errors.js";
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
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        throw new UnauthorizedError("Unauthorized");
      }

      const output = await getHomeInfoUseCase.execute({
        userId: session.user.id,
      });

      return reply.status(200).send(output);
    },
  });
};