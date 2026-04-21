import type { IWorkoutSession } from "../domain/workout-session.js";
import prisma from "../lib/db.js";
import type { tx } from "../types/utils.js";
import type { IWorkoutSessionRepository } from "../usecases/start-session-use-case.js";

export class WorkoutSessionRepository implements IWorkoutSessionRepository {
  private prismaClient = prisma;

  async startSession(
    workoutDayId: string,
    userId: string,
    tx?: tx,
  ): Promise<{ id: string }> {
    const client = tx ?? this.prismaClient;

    const session = await client.workoutSession.create({
      data: {
        workoutDayId,
        userId,
        startedAt: new Date(),
        completedAt: null,
      },
    });

    return { id: session.id };
  }

  async findByWorkoutDayId(
    workoutDayId: string,
    tx?: tx,
  ): Promise<IWorkoutSession[]> {
    const client = tx ?? this.prismaClient;

    const sessions = await client.workoutSession.findMany({
      where: {
        workoutDayId,
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      workoutDayId: session.workoutDayId,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    }));
  }

  async findByWorkoutDayIdAndStartedAt(
    workoutDayId: string,
    date: Date,
    tx?: tx,
  ): Promise<IWorkoutSession | null> {
    const client = tx ?? this.prismaClient;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const session = await client.workoutSession.findFirst({
      where: {
        workoutDayId,
        startedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      userId: session.userId,
      workoutDayId: session.workoutDayId,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    };
  }

  async findById(id: string, tx?: tx): Promise<IWorkoutSession | null> {
    const client = tx ?? this.prismaClient;

    const session = await client.workoutSession.findUnique({
      where: { id },
    });

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      userId: session.userId,
      workoutDayId: session.workoutDayId,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    };
  }

  async completeSession(id: string, tx?: tx): Promise<{ id: string }> {
    const client = tx ?? this.prismaClient;

    const session = await client.workoutSession.update({
      where: { id },
      data: { completedAt: new Date() },
    });

    return { id: session.id };
  }
}
