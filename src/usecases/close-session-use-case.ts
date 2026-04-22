import type { IWorkoutPlanRepository } from "../domain/workout-plan.js";
import type { IWorkoutSessionRepository } from "../domain/workout-session.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../errors/errors.js";

interface InputDTO {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
}

interface OutputDTO {
  sessionId: string;
}

export class CloseSessionUseCase {
  constructor(
    private workoutPlanRepository: IWorkoutPlanRepository,
    private workoutSessionRepository: IWorkoutSessionRepository,
  ) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    const workoutPlan = await this.workoutPlanRepository.findById(
      input.workoutPlanId,
    );

    if (!workoutPlan) {
      throw new NotFoundError("Workout plan not found");
    }

    if (workoutPlan.userId !== input.userId) {
      throw new ForbiddenError(
        "You do not have permission to close this session",
      );
    }

    const workoutDay = workoutPlan.workoutDays.find(
      (d) => d.id === input.workoutDayId,
    );

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    const session = await this.workoutSessionRepository.findById(
      input.sessionId,
    );

    if (!session) {
      throw new NotFoundError("Session not found");
    }

    if (session.completedAt !== null) {
      throw new BadRequestError("Session is already closed");
    }

    const result = await this.workoutSessionRepository.completeSession(
      input.sessionId,
    );

    return { sessionId: result.id };
  }
}
