import fastifyCors from "@fastify/cors";
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
import { URL } from "url";
import { z } from "zod";

import { weekDays } from "../generated/prisma/enums.js";
import { auth } from "./lib/auth.js";
import { WorkoutPlanRepository } from "./repositories/workout-plan-repository.js";
import { CreateWorkoutPlanUseCase } from "./usecases/create-workout-plan-use-case.js";

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

app.withTypeProvider<ZodTypeProvider>().route({
  method: "POST",
  url: "/workout-plans",
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

app.route({
  method: ["GET", "POST"],
  schema: {
    hide: true,
  },
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);

      const headers = fromNodeHeaders(request.headers);

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });

      const response = await auth.handler(req);

      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
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
