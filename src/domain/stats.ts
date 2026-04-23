import type { tx } from "../types/utils.js";

export interface IWorkoutSessionStats {
  id: string;
  userId: string;
  workoutDayId: string;
  startedAt: Date;
  completedAt: Date | null;
}

export interface IStatsRepository {
  findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    tx?: tx,
  ): Promise<IWorkoutSessionStats[]>;
}
