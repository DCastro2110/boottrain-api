import z from "zod";

import { weekDays } from "../../generated/prisma/enums.js";

const WeekConsistencyDaySchema = z.enum(Object.values(weekDays));

const WeekConsistencyStatusSchema = z.enum([
  "completed",
  "not_completed",
  "missed",
]);

export const HomeInfoDaySchema = WeekConsistencyDaySchema;
export type HomeInfoDay = z.infer<typeof HomeInfoDaySchema>;

export const HomeInfoDayStatusSchema = WeekConsistencyStatusSchema;
export type HomeInfoDayStatus = z.infer<typeof HomeInfoDayStatusSchema>;

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
  fireSequence: z.number().min(0),
  todayWorkoutDay: z
    .object({
      date: IsoDateSchema,
      name: z.string(),
      estimatedDurationInSeconds: z.number().min(0),
      numberOfExercises: z.number().min(0),
      coverImageUrl: z.string().nullable(),
      isCompleted: z.boolean(),
    })
    .nullable(),
});

export type HomeInfoResponse = z.infer<typeof HomeInfoResponseSchema>;
