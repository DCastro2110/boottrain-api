export interface IWorkoutSession {
  id: string;
  userId: string;
  workoutDayId: string;
  startedAt: Date;
  completedAt: Date | null;
}
