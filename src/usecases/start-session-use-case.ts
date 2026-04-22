import type { IWorkoutPlanRepository } from "../domain/workout-plan.js";
import type { IWorkoutSession } from "../domain/workout-session.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../errors/errors.js";

export interface IWorkoutSessionRepository {
  startSession(workoutDayId: string, userId: string): Promise<{ id: string }>;
  findByWorkoutDayId(workoutDayId: string): Promise<IWorkoutSession[]>;
  findByWorkoutDayIdAndStartedAt(
    workoutDayId: string,
    date: Date,
  ): Promise<IWorkoutSession | null>;
  findById(id: string): Promise<IWorkoutSession | null>;
  completeSession(id: string): Promise<{ id: string }>;
  findOpenSessionInCurrentWeek(
    workoutDayId: string,
    userTimezone: string,
  ): Promise<IWorkoutSession | null>;
}

interface InputDTO {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
}

interface OutputDTO {
  sessionId: string;
}

export class StartSessionUseCase {
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

    if (!workoutPlan.isActive) {
      throw new BadRequestError(
        "Cannot start a session for an inactive workout plan",
      );
    }

    if (workoutPlan.userId !== input.userId) {
      throw new ForbiddenError(
        "You do not have permission to start a session for this workout plan",
      );
    }

    const workoutDay = workoutPlan.workoutDays.find(
      (d) => d.id === input.workoutDayId,
    );

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    if (workoutDay.isRestDay) {
      throw new BadRequestError("Cannot start a session on a rest day");
    }

    const today = new Date();
    const existingSessionToday =
      await this.workoutSessionRepository.findByWorkoutDayIdAndStartedAt(
        input.workoutDayId,
        today,
      );

    if (existingSessionToday) {
      throw new ConflictError(
        "A session already exists for this workout day today",
      );
    }

    const result = await this.workoutSessionRepository.startSession(
      input.workoutDayId,
      input.userId,
    );

    return { sessionId: result.id };
  }
}
