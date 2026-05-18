import { error } from "node:console";

import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import { fastifySwagger } from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import { fromNodeHeaders } from "better-auth/node";
import { fastify } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "./lib/auth.js";
import { registerErrorHandler } from "./lib/error-handler.js";
import { aiRoutes } from "./routes/ai.route.js";
import { authRoutes } from "./routes/auth.route.js";
import { homeInfoRoutes } from "./routes/home-info.route.js";
import { statsRoutes } from "./routes/stats.route.js";
import { userRoutes } from "./routes/user.route.js";
import { workoutPlanRoutes } from "./routes/workout-plan.route.js";

const app = fastify({
  logger: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(fastifyRateLimit, {
  max: 60,
  timeWindow: "1 minute",
  ban: 3,
  onBanReach(req, key) {
    error(`IP ${key} has been banned for exceeding the rate limit.`);
    const headers = fromNodeHeaders(req.headers);

    auth.api.revokeSessions({ headers: headers }).catch((err) => {
      error(`Failed to revoke sessions for IP ${key}:`, err);
    });
  },
});

await app.register(fastifyCors, {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
});
await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "BooTrain API",
      description:
        "API documentation for BooTrain, a simple training platform.",
      version: "1.0.0",
    },
    servers: [
      {
        url: process.env.API_URL!,
        description: "Local development server",
      },
    ],
  },
  transform: jsonSchemaTransform,
});

await app.register(fastifyApiReference, {
  routePrefix: "/docs",
  configuration: {
    sources: [
      {
        title: "Authentication API",
        url: "/api/auth/open-api/generate-schema",
        slug: "auth-api",
      },
      {
        title: "BooTrain API",
        url: "/swagger.json",
        slug: "bootrain-api",
      },
    ],
  },
});

app.setNotFoundHandler(
  {
    preHandler: app.rateLimit({
      max: 4,
      timeWindow: "1 minute",
    }),
  },
  function (request, reply) {
    reply.code(404).send({
      error: "Not Found",
      code: "NOT_FOUND",
    });
  },
);

registerErrorHandler(app);

await app.register(authRoutes);
await app.register(homeInfoRoutes, { prefix: "home-info" });
await app.register(statsRoutes, { prefix: "stats" });
await app.register(userRoutes, { prefix: "users" });
await app.register(workoutPlanRoutes, { prefix: "workout-plan" });
await app.register(aiRoutes, { prefix: "ai" });

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/swagger.json",
  schema: {
    hide: true,
  },
  handler: async (request, reply) => {
    const openApiSpec = app.swagger();
    reply.send(openApiSpec);
  },
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/",
  schema: {
    response: {
      200: z.object({
        message: z.string(),
      }),
    },
  },
  handler: async () => {
    return { message: "Hello, World!" };
  },
});

try {
  const port = Number(process.env.PORT) || 8080;

  await app.listen({ port });

  app.log.info(`Server listening at http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
