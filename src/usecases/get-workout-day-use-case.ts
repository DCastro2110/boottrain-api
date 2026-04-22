import type { weekDays } from "../../generated/prisma/enums.js";
import type { IWorkoutPlanRepository } from "../domain/workout-plan.js";
import { ForbiddenError, NotFoundError } from "../errors/errors.js";
import type { IWorkoutSessionRepository } from "./start-session-use-case.js";

interface InputDTO {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  userTimezone: string;
}

interface OutputDTO {
  weekDay: weekDays;
  name: string;
  estimatedDurationInSeconds: number;
  numberOfExercises: number;
  coverImageUrl: string | null;
  workoutSessionId: string | null;
  workoutExercises: Array<{
    name: string;
    reps: number;
    sets: number;
    description: string;
    estimatedDurationInSeconds: number;
  }>;
}

export class GetWorkoutDayUseCase {
  constructor(
    private workoutPlanRepository: IWorkoutPlanRepository,
    private workoutSessionRepository: IWorkoutSessionRepository,
  ) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    const workoutDay = await this.workoutPlanRepository.findWorkoutDayById(
      input.workoutPlanId,
      input.workoutDayId,
    );

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    const workoutPlan = await this.workoutPlanRepository.findById(
      input.workoutPlanId,
    );

    if (!workoutPlan || workoutPlan.userId !== input.userId) {
      throw new ForbiddenError(
        "You do not have permission to access this workout day",
      );
    }

    const openSession =
      await this.workoutSessionRepository.findOpenSessionInCurrentWeek(
        input.workoutDayId,
        input.userTimezone,
      );

    return {
      weekDay: workoutDay.weekDay,
      name: workoutDay.name,
      estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
      numberOfExercises: workoutDay.numberOfExercises,
      coverImageUrl: workoutDay.coverImageUrl,
      workoutSessionId: openSession?.id ?? null,
      workoutExercises: workoutDay.workoutExercises.map((exercise) => ({
        name: exercise.name,
        reps: exercise.reps,
        sets: exercise.sets,
        description: exercise.description ?? "",
        estimatedDurationInSeconds: exercise.estimatedDurationInSeconds ?? 0,
      })),
    };
  }
}
