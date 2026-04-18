import z from "zod";

import { weekDays } from "../../generated/prisma/enums.js";

const WeekConsistencyDaySchema = z.enum(weekDays);

const WeekConsistencyStatusSchema = z.enum([
  "completed",
  "not_completed",
  "missed",
]);

const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const HomeInfoResponseSchema = z.object({
  weekConsistency: z
    .array(
      z.object({
        day: WeekConsistencyDaySchema,
        status: WeekConsistencyStatusSchema,
      }),
    )
    .length(7),
  fireSequence: z.int().min(0),
  todayWorkoutDay: z
    .object({
      date: IsoDateSchema,
      name: z.string(),
      estimatedDurationInSeconds: z.int().min(0),
      numberOfExercises: z.int().min(0),
      coverImageUrl: z.string().nullable(),
      isCompleted: z.boolean(),
    })
    .nullable(),
});

export type HomeInfoResponse = z.infer<typeof HomeInfoResponseSchema>;
