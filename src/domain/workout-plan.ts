import type { weekDays } from "../../generated/prisma/enums.js";

export interface IWorkoutPlan {
  id: string;
  name: string;
  description: string;
  userId: string;
  isActive: boolean;
  workoutDays: {
    id: string;
    name: string;
    isRestDay: boolean;
    weekDay: weekDays;
    estimatedDurationInSeconds: number;
    workoutExercises: {
      id: string;
      name: string;
      restTimeInSeconds: number;
      order: number;
      sets: number;
      reps: number;
    }[];
  }[];
}
