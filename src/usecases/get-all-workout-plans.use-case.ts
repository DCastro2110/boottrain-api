import type { IWorkoutPlanRepository } from "../domain/workout-plan.js";
import { ForbiddenError } from "../errors/errors.js";

export class GetAllWorkoutPlansUseCase {
  constructor(private workoutPlanRepository: IWorkoutPlanRepository) {}

  async execute(userId: string) {
    const workoutPlans =
      await this.workoutPlanRepository.getAllWorkoutPlansByUserId(userId);

    if (workoutPlans.length === 0 || !workoutPlans[0]) {
      return [];
    }

    if (workoutPlans[0].userId !== userId) {
      throw new ForbiddenError(
        "You do not have permission to access these workout plans",
      );
    }

    return workoutPlans;
  }
}
