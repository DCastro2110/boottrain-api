import fastifyCors from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import { fastify } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";

import { authRoutes } from "./routes/auth.route.js";
import { workoutPlanRoutes } from "./routes/workout-plan.route.js";

const app = fastify({
  logger: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(fastifyCors, {
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
        url: "http://localhost:3000",
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

await app.register(authRoutes);
await app.register(workoutPlanRoutes, { prefix: "workout-plan" });

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
  const port = Number(process.env.PORT) || 3000;

  await app.listen({ port });

  app.log.info(`Server listening at http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
