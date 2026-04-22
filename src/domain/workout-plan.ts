import type { weekDays } from "../../generated/prisma/enums.js";
import type { tx } from "../types/utils.js";

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

export interface IWorkoutPlanRepository {
  create(
    data: {
      userId: string;
      name: string;
      description: string;
      workoutDays: {
        name: string;
        isRestDay: boolean;
        weekDay: weekDays;
        estimatedDurationInSeconds: number;
        workoutExercises: {
          name: string;
          restTimeInSeconds: number;
          order: number;
          sets: number;
          reps: number;
        }[];
      }[];
    },
    tx?: tx,
  ): Promise<{
    id: string;
  }>;
  findById(id: string, tx?: tx): Promise<IWorkoutPlan | null>;
  findTheActive(userId: string, tx?: tx): Promise<IWorkoutPlan | null>;
  setInactive(id: string, tx?: tx): Promise<void>;
  findWorkoutDayById(
    workoutPlanId: string,
    workoutDayId: string,
    tx?: tx,
  ): Promise<{
    id: string;
    name: string;
    weekDay: weekDays;
    estimatedDurationInSeconds: number;
    numberOfExercises: number;
    coverImageUrl: string | null;
    workoutExercises: Array<{
      name: string;
      reps: number;
      sets: number;
      description: string | null;
      estimatedDurationInSeconds: number | null;
    }>;
  } | null>;
}
