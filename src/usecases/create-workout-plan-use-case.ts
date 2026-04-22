import type { weekDays } from "../../generated/prisma/enums.js";
import type { IWorkoutPlanRepository } from "../domain/workout-plan.js";
import prisma from "../lib/db.js";
import type { tx } from "../types/utils.js";

interface InputDTO {
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
}

interface OutputDTO {
  workoutPlanId: string;
}

export class CreateWorkoutPlanUseCase {
  constructor(private workoutPlanRepository: IWorkoutPlanRepository) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    const haveAnActiveWorkoutPlan =
      await this.workoutPlanRepository.findTheActive(input.userId);

    const result = await prisma.$transaction(async (tx: tx) => {
      if (haveAnActiveWorkoutPlan) {
        await this.workoutPlanRepository.setInactive(
          haveAnActiveWorkoutPlan.id,
          tx,
        );
      }

      const newWorkoutPlan = await this.workoutPlanRepository.create(
        {
          userId: input.userId,
          name: input.name,
          description: input.description,
          workoutDays: input.workoutDays.map((workoutDay) => ({
            name: workoutDay.name,
            isRestDay: workoutDay.isRestDay,
            weekDay: workoutDay.weekDay,
            estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
            workoutExercises: workoutDay.workoutExercises.map(
              (workoutExercise) => ({
                name: workoutExercise.name,
                restTimeInSeconds: workoutExercise.restTimeInSeconds,
                order: workoutExercise.order,
                sets: workoutExercise.sets,
                reps: workoutExercise.reps,
              }),
            ),
          })),
        },
        tx,
      );

      return {
        workoutPlanId: newWorkoutPlan.id,
      };
    });

    return result;
  }
}
