import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

const userId = "KZQpnFy2nVaOk09soqZEnySI2HOdzwqr";

async function main() {
  const existingPlans = await prisma.workoutPlan.findMany({ where: { userId }, include: { workoutDays: { include: { workoutExercises: true } } } });

  for (const plan of existingPlans) {
    for (const day of plan.workoutDays) {
      await prisma.userWorkoutExerciseSession.deleteMany({
        where: { userWorkoutSession: { workoutDayId: day.id } },
      });
      await prisma.workoutSession.deleteMany({ where: { workoutDayId: day.id } });
      await prisma.workoutExercise.deleteMany({ where: { workoutDayId: day.id } });
    }
    await prisma.workoutDay.deleteMany({ where: { workoutPlanId: plan.id } });
  }
  await prisma.workoutPlan.deleteMany({ where: { userId } });

  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      userId,
      name: "Full Body Strength Program",
      description: "Complete 4-day workout program focusing on strength and muscle building",
      isActive: true,
      workoutDays: {
        create: [
          {
            name: "Upper Body Push",
            weekDay: "MONDAY",
            isRestDay: false,
            estimatedDurationInSeconds: 4500,
            coverImageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
            workoutExercises: {
              create: [
                {
                  name: "Bench Press",
                  sets: 4,
                  reps: 8,
                  restTimeInSeconds: 120,
                  order: 1,
                  description: "Flat barbell bench press for chest development",
                  estimatedDurationInSeconds: 600,
                },
                {
                  name: "Overhead Press",
                  sets: 4,
                  reps: 8,
                  restTimeInSeconds: 120,
                  order: 2,
                  description: "Standing barbell overhead press",
                  estimatedDurationInSeconds: 480,
                },
                {
                  name: "Incline Dumbbell Press",
                  sets: 3,
                  reps: 10,
                  restTimeInSeconds: 90,
                  order: 3,
                  description: "30-degree incline press for upper chest",
                  estimatedDurationInSeconds: 360,
                },
                {
                  name: "Tricep Dips",
                  sets: 3,
                  reps: 12,
                  restTimeInSeconds: 60,
                  order: 4,
                  description: "Parallel bar dips for triceps",
                  estimatedDurationInSeconds: 300,
                },
                {
                  name: "Lateral Raises",
                  sets: 3,
                  reps: 15,
                  restTimeInSeconds: 45,
                  order: 5,
                  description: "Dumbbell side raises for medial deltoids",
                  estimatedDurationInSeconds: 240,
                },
              ],
            },
          },
          {
            name: "Upper Body Pull",
            weekDay: "WEDNESDAY",
            isRestDay: false,
            estimatedDurationInSeconds: 4200,
            coverImageUrl: "https://images.unsplash.com/photo-1534368786749-b63e27c4e7f1?w=800",
            workoutExercises: {
              create: [
                {
                  name: "Deadlift",
                  sets: 4,
                  reps: 6,
                  restTimeInSeconds: 180,
                  order: 1,
                  description: "Conventional barbell deadlift",
                  estimatedDurationInSeconds: 720,
                },
                {
                  name: "Barbell Rows",
                  sets: 4,
                  reps: 8,
                  restTimeInSeconds: 120,
                  order: 2,
                  description: "Bent over barbell rows for back thickness",
                  estimatedDurationInSeconds: 540,
                },
                {
                  name: "Pull-Ups",
                  sets: 4,
                  reps: 8,
                  restTimeInSeconds: 120,
                  order: 3,
                  description: "Weighted or bodyweight pull-ups",
                  estimatedDurationInSeconds: 360,
                },
                {
                  name: "Face Pulls",
                  sets: 3,
                  reps: 15,
                  restTimeInSeconds: 60,
                  order: 4,
                  description: "Cable face pulls for rear deltoids",
                  estimatedDurationInSeconds: 240,
                },
                {
                  name: "Barbell Curls",
                  sets: 3,
                  reps: 10,
                  restTimeInSeconds: 60,
                  order: 5,
                  description: "Standing barbell curls for biceps",
                  estimatedDurationInSeconds: 270,
                },
              ],
            },
          },
          {
            name: "Rest Day",
            weekDay: "FRIDAY",
            isRestDay: true,
            estimatedDurationInSeconds: 0,
            workoutExercises: {
              create: [],
            },
          },
          {
            name: "Lower Body",
            weekDay: "SATURDAY",
            isRestDay: false,
            estimatedDurationInSeconds: 4800,
            coverImageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800",
            workoutExercises: {
              create: [
                {
                  name: "Squats",
                  sets: 4,
                  reps: 6,
                  restTimeInSeconds: 180,
                  order: 1,
                  description: "Back squats for quad development",
                  estimatedDurationInSeconds: 720,
                },
                {
                  name: "Romanian Deadlifts",
                  sets: 4,
                  reps: 8,
                  restTimeInSeconds: 120,
                  order: 2,
                  description: "Stiff leg deadlifts for hamstrings",
                  estimatedDurationInSeconds: 540,
                },
                {
                  name: "Leg Press",
                  sets: 3,
                  reps: 10,
                  restTimeInSeconds: 90,
                  order: 3,
                  description: "Machine leg press for quads",
                  estimatedDurationInSeconds: 360,
                },
                {
                  name: "Leg Curls",
                  sets: 3,
                  reps: 12,
                  restTimeInSeconds: 60,
                  order: 4,
                  description: "Lying leg curls for hamstrings",
                  estimatedDurationInSeconds: 270,
                },
                {
                  name: "Calf Raises",
                  sets: 4,
                  reps: 15,
                  restTimeInSeconds: 45,
                  order: 5,
                  description: "Standing calf raises",
                  estimatedDurationInSeconds: 240,
                },
                {
                  name: "Plank",
                  sets: 3,
                  reps: 1,
                  restTimeInSeconds: 60,
                  order: 6,
                  description: "60 second core plank hold",
                  estimatedDurationInSeconds: 180,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      workoutDays: {
        include: {
          workoutExercises: true,
        },
      },
    },
  });

  console.log("Created workout plan:", workoutPlan.id);
  console.log("Workout days:", workoutPlan.workoutDays.length);

  const now = new Date();
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - now.getDay() - 6);
  lastMonday.setHours(9, 0, 0, 0);

  const lastWednesday = new Date(lastMonday);
  lastWednesday.setDate(lastMonday.getDate() + 2);

  const lastSaturday = new Date(lastMonday);
  lastSaturday.setDate(lastMonday.getDate() + 5);

  for (const day of workoutPlan.workoutDays) {
    if (day.isRestDay) continue;

    let sessionDate: Date;
    if (day.weekDay === "MONDAY") sessionDate = lastMonday;
    else if (day.weekDay === "WEDNESDAY") sessionDate = lastWednesday;
    else if (day.weekDay === "SATURDAY") sessionDate = lastSaturday;
    else continue;

    const session = await prisma.workoutSession.create({
      data: {
        userId,
        workoutDayId: day.id,
        startedAt: sessionDate,
        completedAt: new Date(sessionDate.getTime() + day.estimatedDurationInSeconds * 1000),
      },
    });

    for (const exercise of day.workoutExercises) {
      const baseTime = sessionDate.getTime() + (exercise.order - 1) * 600000;
      for (let set = 0; set < exercise.sets; set++) {
        await prisma.userWorkoutExerciseSession.create({
          data: {
            userWorkoutSessionId: session.id,
            completedAt: new Date(baseTime + set * 120000),
          },
        });
      }
    }

    console.log(`Created session for ${day.name} on ${sessionDate.toDateString()}`);
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });