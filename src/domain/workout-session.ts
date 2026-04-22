export interface IWorkoutSession {
  id: string;
  userId: string;
  workoutDayId: string;
  startedAt: Date;
  completedAt: Date | null;
}

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
