import { weekDays } from "../../generated/prisma/enums.js";
import type { IWorkoutPlanRepository } from "../domain/workout-plan.js";
import { ForbiddenError, NotFoundError } from "../errors/errors.js";

interface InputDTO {
  userId: string;
  workoutPlanId: string;
}

interface OutputDTO {
  workoutPlan: {
    id: string;
    name: string;
    description: string;
    userId: string;
    isActive: boolean;
    workoutDays: Array<{
      id: string;
      name: string;
      isRestDay: boolean;
      coverImageUrl: string | null;
      weekDay: weekDays;
      estimatedDurationInSeconds: number;
      workoutExercises: Array<{
        id: string;
        name: string;
        restTimeInSeconds: number;
        order: number;
        sets: number;
        reps: number;
      }>;
    }>;
  };
}

export class GetWorkoutPlanUseCase {
  constructor(private workoutPlanRepository: IWorkoutPlanRepository) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    const workoutPlan = await this.workoutPlanRepository.findById(
      input.workoutPlanId,
    );

    if (!workoutPlan) {
      throw new NotFoundError("Workout plan not found");
    }

    if (workoutPlan.userId !== input.userId) {
      throw new ForbiddenError(
        "You do not have permission to access this workout plan",
      );
    }

    return { workoutPlan };
  }
}
