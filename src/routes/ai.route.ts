import { generateText, tool } from "ai";
import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { weekDays } from "../../generated/prisma/enums.js";
import { UserRepository } from "../db/user-repository.js";
import { WorkoutPlanRepository } from "../db/workout-plan-repository.js";
import { ForbiddenError } from "../errors/errors.js";
import { auth } from "../lib/auth.js";
import { CreateWorkoutPlanUseCase } from "../usecases/create-workout-plan-use-case.js";
import { GetUserDataUseCase } from "../usecases/get-user-data-use-case.js";
import { UpdateUserDataUseCase } from "../usecases/update-user-data-use-case.js";

const aiRoutes = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      hide: true,
    },
    async handler(request, reply) {
      const result = await generateText({
        prompt: "Create a workout plan for me.",
        model: "openai/gpt-4o-mini",
        system: "You are a helpful assistant.",
        tools: {
          createWorkoutPlan: tool({
            description:
              "Create a workout plan based on the user's goals and preferences.",
            inputSchema: z.object({
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
            execute: async (input) => {
              const session = await auth.api.getSession({
                headers: fromNodeHeaders(request.headers),
              });

              if (!session) {
                throw new ForbiddenError("Unauthorized");
              }

              const workoutPlanRepository = new WorkoutPlanRepository();
              const createWorkoutPlanUseCase = new CreateWorkoutPlanUseCase(
                workoutPlanRepository,
              );

              await createWorkoutPlanUseCase.execute({
                userId: session.user.id,
                name: input.name,
                description: input.description,
                workoutDays: input.workoutDays.map((day) => ({
                  name: day.name,
                  isRestDay: day.isRestDay,
                  weekDay: day.weekDay,
                  estimatedDurationInSeconds: day.estimatedDurationInSeconds,
                  workoutExercises: day.workoutExercises.map((exercise) => ({
                    name: exercise.name,
                    restTimeInSeconds: exercise.restTimeInSeconds,
                    order: exercise.order,
                    sets: exercise.sets,
                    reps: exercise.reps,
                  })),
                })),
              });
            },
          }),
          getWorkoutPlans: tool({
            description: "Get all workout plans of the user.",
            inputSchema: z.object({}),
            execute: async () => {
              const session = await auth.api.getSession({
                headers: fromNodeHeaders(request.headers),
              });

              if (!session) {
                throw new ForbiddenError("Unauthorized");
              }
              const workoutPlanRepository = new WorkoutPlanRepository();
              const workoutPlans =
                await workoutPlanRepository.getAllWorkoutPlansByUserId(
                  session.user.id,
                );

              return workoutPlans.map((plan) => ({
                id: plan.id,
                name: plan.name,
                description: plan.description,
                workoutDays: plan.workoutDays.map((day) => ({
                  id: day.id,
                  name: day.name,
                  weekDay: day.weekDay,
                  estimatedDurationInSeconds: day.estimatedDurationInSeconds,
                  workoutExercises: day.workoutExercises.map((exercise) => ({
                    name: exercise.name,
                    sets: exercise.sets,
                    reps: exercise.reps,
                  })),
                })),
              }));
            },
          }),
          getUserData: tool({
            description: "Get user data.",
            inputSchema: z.object({}),
            execute: async () => {
              const session = await auth.api.getSession({
                headers: fromNodeHeaders(request.headers),
              });

              if (!session) {
                throw new ForbiddenError("Unauthorized");
              }

              const userRepsoitory = new UserRepository();
              const getUserDataUseCase = new GetUserDataUseCase(userRepsoitory);

              const userData = await getUserDataUseCase.execute({
                userId: session.user.id,
              });

              return {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                height: userData.height,
                weight: userData.weight,
                age: userData.age,
                fitnessLevel: userData.fitnessLevel,
                bodyFatPercentage: userData.bodyFatPercentage,
                image: userData.image,
              };
            },
          }),
          updateUserData: tool({
            description: "Update user data.",
            inputSchema: z.object({
              name: z.string().max(100).optional(),
              height: z.number().min(0).optional(),
              weight: z.number().min(0).optional(),
              age: z.number().min(0).optional(),
              fitnessLevel: z
                .enum(["beginner", "intermediate", "advanced"])
                .optional(),
              bodyFatPercentage: z.number().min(0).max(100).optional(),
              image: z.url().optional(),
            }),
            execute: async (input) => {
              const session = await auth.api.getSession({
                headers: fromNodeHeaders(request.headers),
              });

              if (!session) {
                throw new ForbiddenError("Unauthorized");
              }

              const userRepsoitory = new UserRepository();
              const updateUserDataUseCase = new UpdateUserDataUseCase(
                userRepsoitory,
              );

              await updateUserDataUseCase.execute({
                userId: session.user.id,
                name: input.name,
                height: input.height,
                weight: input.weight,
                age: input.age,
                fitnessLevel: input.fitnessLevel,
                bodyFatPercentage: input.bodyFatPercentage,
                image: input.image,
              });
            },
          }),
        },
      });

      reply.header("Content-Type", "text/plain; charset=utf-8");
      return reply.send(result);
    },
  });
};

export { aiRoutes };
