import { google, type GoogleLanguageModelOptions } from "@ai-sdk/google";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { fromNodeHeaders } from "better-auth/node";
import console from "console";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { weekDays } from "../../generated/prisma/enums.js";
import { UserRepository } from "../db/user-repository.js";
import { WorkoutPlanRepository } from "../db/workout-plan-repository.js";
import { ForbiddenError } from "../errors/errors.js";
import { auth } from "../lib/auth.js";
import {
  clearStreamActive,
  isStreamActive,
  setStreamActive,
} from "../lib/redis.js";
import { CreateWorkoutPlanUseCase } from "../usecases/create-workout-plan-use-case.js";
import { GetUserDataUseCase } from "../usecases/get-user-data-use-case.js";
import { UpdateUserDataUseCase } from "../usecases/update-user-data-use-case.js";

const SYSTEM_PROMPT = `Você é um personal trainer virtual especialista em montagem de planos de treino personalizados.

## Personalidade
- Tom amigável, motivador e acolhedor.
- Linguagem simples e direta, sem jargões técnicos. Seu público principal são pessoas leigas em musculação.
- Respostas curtas e objetivas.

## Regras de Interação

1. **SEMPRE** chame a tool \`getUserTrainData\` antes de qualquer interação com o usuário. Isso é obrigatório.
2. Se o usuário **não tem dados cadastrados** (retornou null):
   - Pergunte nome, peso (kg), altura (cm), idade e % de gordura corporal (inteiro de 0 a 100, onde 100 = 100%).
   - Faça perguntas simples e diretas, tudo em uma única mensagem.
   - Após receber os dados, salve com a tool \`updateUserTrainData\`. **IMPORTANTE**: converta o peso de kg para gramas (multiplique por 1000) antes de salvar.
3. Se o usuário **já tem dados cadastrados**: cumprimente-o pelo nome de forma amigável.

## Criação de Plano de Treino

Quando o usuário quiser criar um plano de treino:
- Pergunte o objetivo, quantos dias por semana ele pode treinar e se tem restrições físicas ou lesões.
- Poucas perguntas, simples e diretas.
- O plano DEVE ter exatamente 7 dias (MONDAY a SUNDAY).
- Dias sem treino devem ter: \`isRest: true\`, \`exercises: []\`, \`estimatedDurationInSeconds: 0\`.
- Chame a tool \`createWorkoutPlan\` para salvar o plano.

### Divisões de Treino (Splits)

Escolha a divisão adequada com base nos dias disponíveis:
- **2-3 dias/semana**: Full Body ou ABC (A: Peito+Tríceps, B: Costas+Bíceps, C: Pernas+Ombros)
- **4 dias/semana**: Upper/Lower (recomendado, cada grupo 2x/semana) ou ABCD (A: Peito+Tríceps, B: Costas+Bíceps, C: Pernas, D: Ombros+Abdômen)
- **5 dias/semana**: PPLUL — Push/Pull/Legs + Upper/Lower (superior 3x, inferior 2x/semana)
- **6 dias/semana**: PPL 2x — Push/Pull/Legs repetido

### Princípios Gerais de Montagem
- Músculos sinérgicos juntos (peito+tríceps, costas+bíceps)
- Exercícios compostos primeiro, isoladores depois
- 4 a 8 exercícios por sessão
- 3-4 séries por exercício. 8-12 reps (hipertrofia), 4-6 reps (força)
- Descanso entre séries: 60-90s (hipertrofia), 2-3min (compostos pesados)
- Evitar treinar o mesmo grupo muscular em dias consecutivos
- Nomes descritivos para cada dia (ex: "Superior A - Peito e Costas", "Descanso")

### Auxiliando o usuário a fazer exercícios
- Use a tools de busca para encontrar vídeos de execução dos exercícios prescritos, se o usuário pedir ajuda para entender como fazer um exercício.

### Imagens de Capa (coverImageUrl)

SEMPRE forneça um \`coverImageUrl\` para cada dia de treino. Escolha com base no foco muscular:

**Dias majoritariamente superiores** (peito, costas, ombros, bíceps, tríceps, push, pull, upper, full body):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL

**Dias majoritariamente inferiores** (pernas, glúteos, quadríceps, posterior, panturrilha, legs, lower):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgCHaUgNGronCvXmSzAMs1N3KgLdE5yHT6Ykj
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO85RVu3morROwZk5NPhs1jzH7X8TyEvLUCGxY

Alterne entre as duas opções de cada categoria para variar. Dias de descanso usam imagem de superior.`;

const aiRoutes = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      hide: true,
    },
    async handler(request, reply) {
      const { messages }: { messages: UIMessage[] } =
        request.body as unknown as { messages: UIMessage[] };

      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        throw new ForbiddenError("Unauthorized");
      }

      const userId = session.user.id;
      if (await isStreamActive(userId).catch(() => false)) {
        return reply.status(409).send({
          error: "Another request is already being processed.",
          code: "STREAM_IN_PROGRESS",
        });
      }

      await setStreamActive(userId).catch(() => {
        app.log.warn("Redis unavailable, proceeding without locking stream.");
        return false;
      });

      try {
        const result = streamText({
          prompt: await convertToModelMessages(messages),
          model: google("gemini-2.5-flash"),
          providerOptions: {
            google: {
              structuredOutputs: false,
            } satisfies GoogleLanguageModelOptions,
          },
          stopWhen: stepCountIs(5),
          system: SYSTEM_PROMPT,
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
                const userRepsoitory = new UserRepository();
                const getUserDataUseCase = new GetUserDataUseCase(
                  userRepsoitory,
                );

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
          onError: (error: unknown) => {
            console.error("Error in tool execution:", error);
          },
        });

        const response = result.toUIMessageStreamResponse({
          onError: () => {
            clearStreamActive(userId).catch(console.error);
            return "Um erro ocorreu ao processar sua solicitação. Por favor, tente novamente.";
          },
          onFinish: () => {
            clearStreamActive(userId).catch(console.error);
          },
        });

        reply.status(response.status);
        response.headers.forEach((value, key) => {
          reply.header(key, value);
        });

        return reply.send(response);
      } catch (error) {
        clearStreamActive(userId).catch(console.error);
        console.error("Error in AI processing:", error);
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  });
};

export { aiRoutes };
