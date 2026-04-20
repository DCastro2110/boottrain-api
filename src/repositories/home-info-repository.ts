import prisma from "../lib/db.js";
import type {
  HomeInfoDay,
  HomeInfoDayStatus,
  IHomeInfoRepository,
  InputDTO,
  OutputDTO,
} from "../usecases/get-home-info-use-case.js";

const orderedWeekDays: HomeInfoDay[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const startOfDay = (date: Date): Date => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const addDays = (date: Date, days: number): Date => {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
};

const formatIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getWeekWindowFromToday = (
  today: Date,
): { startsAt: Date; endsAt: Date } => {
  const weekStartsAt = startOfDay(addDays(today, -today.getDay()));
  const weekEndsAt = addDays(weekStartsAt, 7);

  return {
    startsAt: weekStartsAt,
    endsAt: weekEndsAt,
  };
};

const calculateFireSequence = (
  completedDates: Set<string>,
  today: Date,
): number => {
  const todayDate = startOfDay(today);
  const todayKey = formatIsoDate(todayDate);

  let currentDate = completedDates.has(todayKey)
    ? todayDate
    : addDays(todayDate, -1);
  let sequence = 0;

  for (;;) {
    const currentDateKey = formatIsoDate(currentDate);

    if (!completedDates.has(currentDateKey)) {
      break;
    }

    sequence += 1;
    currentDate = addDays(currentDate, -1);
  }

  return sequence;
};

export class HomeInfoRepository implements IHomeInfoRepository {
  private prismaClient = prisma;

  async findByUserId(input: InputDTO): Promise<OutputDTO> {
    const now = new Date();
    const today = startOfDay(now);
    const { startsAt: weekStartsAt, endsAt: weekEndsAt } =
      getWeekWindowFromToday(today);
    const todayWeekDay = orderedWeekDays[today.getDay()];

    if (!todayWeekDay) {
      return {
        weekConsistency: orderedWeekDays.map((day) => ({
          day,
          status: "not_completed",
        })),
        fireSequence: 0,
        todayWorkoutDay: null,
      };
    }

    const endOfToday = addDays(today, 1);

    const [activeWorkoutPlan, weekSessions, completedSessionsHistory] =
      await Promise.all([
        this.prismaClient.workoutPlan.findFirst({
          where: {
            userId: input.userId,
            isActive: true,
          },
          select: {
            id: true,
            workoutDays: {
              select: {
                id: true,
                name: true,
                isRestDay: true,
                weekDay: true,
                estimatedDurationInSeconds: true,
                coverImageUrl: true,
                _count: {
                  select: {
                    workoutExercises: true,
                  },
                },
              },
            },
          },
        }),
        this.prismaClient.workoutSession.findMany({
          where: {
            userId: input.userId,
            startedAt: {
              gte: weekStartsAt,
              lt: weekEndsAt,
            },
            workoutDay: {
              workoutPlan: {
                userId: input.userId,
                isActive: true,
              },
            },
          },
          select: {
            workoutDayId: true,
            startedAt: true,
            completedAt: true,
            workoutDay: {
              select: {
                weekDay: true,
              },
            },
          },
        }),
        this.prismaClient.workoutSession.findMany({
          where: {
            userId: input.userId,
            completedAt: {
              not: null,
            },
            startedAt: {
              lt: endOfToday,
            },
          },
          select: {
            startedAt: true,
          },
        }),
      ]);

    const completedDates = new Set<string>();

    for (const session of weekSessions) {
      if (!session.completedAt) {
        continue;
      }

      const sessionDate = startOfDay(session.startedAt);
      completedDates.add(formatIsoDate(sessionDate));
    }

    const completedHistoryDates = new Set<string>();

    for (const session of completedSessionsHistory) {
      const sessionDate = startOfDay(session.startedAt);
      completedHistoryDates.add(formatIsoDate(sessionDate));
    }

    const weekConsistency: OutputDTO["weekConsistency"] = orderedWeekDays.map(
      (day, dayIndex) => {
        const currentDate = addDays(weekStartsAt, dayIndex);
        const currentDateKey = formatIsoDate(currentDate);
        const hasCompletedWorkout = completedDates.has(currentDateKey);

        let status: HomeInfoDayStatus = "not_completed";

        if (hasCompletedWorkout) {
          status = "completed";
        } else if (currentDate < today) {
          status = "missed";
        }

        return {
          day,
          status,
        };
      },
    );

    const fireSequence = calculateFireSequence(completedHistoryDates, today);

    const todayPlanWorkoutDay =
      activeWorkoutPlan?.workoutDays.find(
        (workoutDay) => (workoutDay.weekDay as HomeInfoDay) === todayWeekDay,
      ) ?? null;

    const todayDate = formatIsoDate(today);
    const isTodayWorkoutDayCompleted = weekSessions.some(
      (session) =>
        session.workoutDayId === todayPlanWorkoutDay?.id &&
        session.completedAt !== null &&
        formatIsoDate(startOfDay(session.startedAt)) === todayDate,
    );

    return {
      weekConsistency,
      fireSequence,
      todayWorkoutDay: todayPlanWorkoutDay
        ? {
            date: todayDate,
            name: todayPlanWorkoutDay.name,
            estimatedDurationInSeconds:
              todayPlanWorkoutDay.estimatedDurationInSeconds,
            numberOfExercises: todayPlanWorkoutDay._count.workoutExercises,
            coverImageUrl: todayPlanWorkoutDay.coverImageUrl,
            isCompleted: isTodayWorkoutDayCompleted,
          }
        : null,
    };
  }
}
