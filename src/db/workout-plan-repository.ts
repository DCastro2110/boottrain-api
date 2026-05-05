import type { IWorkoutPlanRepository } from "../domain/workout-plan.js";
import prisma from "../lib/db.js";
import type { tx } from "../types/utils.js";

type CreateData = Parameters<IWorkoutPlanRepository["create"]>[0];

export class WorkoutPlanRepository implements IWorkoutPlanRepository {
  private prismaClient = prisma;

  async create(data: CreateData, tx?: tx) {
    const client = tx ?? this.prismaClient;

    const newWorkoutPlan = await client.workoutPlan.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        workoutDays: {
          create: data.workoutDays.map((workoutDay) => ({
            name: workoutDay.name,
            isRestDay: workoutDay.isRestDay,
            weekDay: workoutDay.weekDay,
            estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
            workoutExercises: {
              create: workoutDay.workoutExercises.map((workoutExercise) => ({
                name: workoutExercise.name,
                restTimeInSeconds: workoutExercise.restTimeInSeconds,
                order: workoutExercise.order,
                sets: workoutExercise.sets,
                reps: workoutExercise.reps,
              })),
            },
          })),
        },
      },
    });

    return {
      id: newWorkoutPlan.id,
    };
  }

  async findTheActive(userId: string, tx?: tx) {
    const client = tx ?? this.prismaClient;

    const activeWorkoutPlan = await client.workoutPlan.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        workoutDays: {
          include: {
            workoutExercises: true,
          },
        },
      },
    });

    if (!activeWorkoutPlan) {
      return null;
    }

    return {
      id: activeWorkoutPlan.id,
      name: activeWorkoutPlan.name,
      description: activeWorkoutPlan.description,
      userId: activeWorkoutPlan.userId,
      isActive: activeWorkoutPlan.isActive,
      workoutDays: activeWorkoutPlan.workoutDays.map((workoutDay) => ({
        id: workoutDay.id,
        name: workoutDay.name,
        coverImageUrl: workoutDay.coverImageUrl,
        isRestDay: workoutDay.isRestDay,
        weekDay: workoutDay.weekDay,
        estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
        workoutExercises: workoutDay.workoutExercises.map(
          (workoutExercise) => ({
            id: workoutExercise.id,
            name: workoutExercise.name,
            restTimeInSeconds: workoutExercise.restTimeInSeconds,
            order: workoutExercise.order,
            sets: workoutExercise.sets,
            reps: workoutExercise.reps,
          }),
        ),
      })),
    };
  }

  async setInactive(id: string, tx?: tx) {
    const client = tx ?? this.prismaClient;

    await client.workoutPlan.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }

  async findById(id: string, tx?: tx) {
    const client = tx ?? this.prismaClient;

    const workoutPlan = await client.workoutPlan.findUnique({
      where: {
        id,
      },
      include: {
        workoutDays: {
          include: {
            workoutExercises: true,
          },
        },
      },
    });

    if (!workoutPlan) {
      return null;
    }

    return {
      id: workoutPlan.id,
      name: workoutPlan.name,
      description: workoutPlan.description,
      userId: workoutPlan.userId,
      isActive: workoutPlan.isActive,
      workoutDays: workoutPlan.workoutDays.map((workoutDay) => ({
        id: workoutDay.id,
        name: workoutDay.name,
        coverImageUrl: workoutDay.coverImageUrl,
        isRestDay: workoutDay.isRestDay,
        weekDay: workoutDay.weekDay,
        estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
        workoutExercises: workoutDay.workoutExercises.map(
          (workoutExercise) => ({
            id: workoutExercise.id,
            name: workoutExercise.name,
            restTimeInSeconds: workoutExercise.restTimeInSeconds,
            order: workoutExercise.order,
            sets: workoutExercise.sets,
            reps: workoutExercise.reps,
          }),
        ),
      })),
    };
  }

  async findWorkoutDayById(
    workoutPlanId: string,
    workoutDayId: string,
    tx?: tx,
  ) {
    const client = tx ?? this.prismaClient;

    const workoutPlan = await client.workoutPlan.findUnique({
      where: {
        id: workoutPlanId,
      },
      include: {
        workoutDays: {
          where: {
            id: workoutDayId,
          },
          include: {
            workoutExercises: true,
          },
        },
      },
    });

    if (!workoutPlan) {
      return null;
    }

    const workoutDay = workoutPlan.workoutDays[0];

    if (!workoutDay) {
      return null;
    }

    return {
      id: workoutDay.id,
      name: workoutDay.name,
      weekDay: workoutDay.weekDay,
      estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
      numberOfExercises: workoutDay.workoutExercises.length,
      coverImageUrl: workoutDay.coverImageUrl,
      workoutExercises: workoutDay.workoutExercises.map((workoutExercise) => ({
        name: workoutExercise.name,
        reps: workoutExercise.reps,
        sets: workoutExercise.sets,
        description: workoutExercise.description,
        estimatedDurationInSeconds:
          workoutExercise.estimatedDurationInSeconds ?? 0,
      })),
    };
  }

  async getAllWorkoutPlansByUserId(userId: string, tx?: tx) {
    const client = tx ?? this.prismaClient;

    const workoutPlans = await client.workoutPlan.findMany({
      where: {
        userId,
      },
      include: {
        workoutDays: {
          include: {
            workoutExercises: true,
          },
        },
      },
    });

    return workoutPlans.map((workoutPlan) => ({
      id: workoutPlan.id,
      name: workoutPlan.name,
      userId: workoutPlan.userId,
      description: workoutPlan.description,
      isActive: workoutPlan.isActive,
      workoutDays: workoutPlan.workoutDays.map((workoutDay) => ({
        id: workoutDay.id,
        name: workoutDay.name,
        weekDay: workoutDay.weekDay,
        estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
        coverImageUrl: workoutDay.coverImageUrl,
        workoutExercises: workoutDay.workoutExercises.map(
          (workoutExercise) => ({
            name: workoutExercise.name,
            reps: workoutExercise.reps,
            sets: workoutExercise.sets,
            description: workoutExercise.description,
            estimatedDurationInSeconds:
              workoutExercise.estimatedDurationInSeconds ?? 0,
          }),
        ),
      })),
    }));
  }
}
