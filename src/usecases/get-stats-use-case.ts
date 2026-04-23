import type { IWorkoutSessionRepository } from "../domain/workout-session.js";
import { BadRequestError } from "../errors/errors.js";

interface InputDTO {
  userId: string;
  startDate: Date;
  endDate: Date;
}

interface OutputDTO {
  totalSessions: number;
  totalDurationInSeconds: number;
  completionPercent: number;
  sessions: {
    sessionId: string;
    startedAt: Date;
    endedAt: Date | null;
  }[];
}

export class GetStatsUseCase {
  constructor(private workoutSessionRepository: IWorkoutSessionRepository) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    if (input.startDate >= input.endDate) {
      throw new BadRequestError("startDate must be before endDate");
    }

    const sessions =
      await this.workoutSessionRepository.findByUserIdAndDateRange(
        input.userId,
        input.startDate,
        input.endDate,
      );

    const totalSessions = sessions.length;

    let totalDurationInSeconds = 0;
    let completedCount = 0;

    for (const session of sessions) {
      if (session.completedAt !== null) {
        const durationMs =
          session.completedAt.getTime() - session.startedAt.getTime();
        totalDurationInSeconds += Math.floor(durationMs / 1000);
        completedCount++;
      }
    }

    const completionPercent =
      totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0;

    return {
      totalSessions,
      totalDurationInSeconds,
      completionPercent,
      sessions: sessions.map((session) => ({
        sessionId: session.id,
        startedAt: session.startedAt,
        endedAt: session.completedAt,
      })),
    };
  }
}
