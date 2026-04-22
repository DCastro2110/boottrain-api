import type { weekDays } from "../../generated/prisma/enums.js";
import type { IWorkoutExercise } from "./workout-exercise.js";

export interface IWorkoutDay {
  id: string;
  name: string;
  isRestDay: boolean;
  weekDay: weekDays;
  estimatedDurationInSeconds: number;
  workoutExercises: IWorkoutExercise[];
}
