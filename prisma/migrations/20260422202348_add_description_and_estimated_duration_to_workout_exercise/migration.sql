/*
  Warnings:

  - You are about to drop the column `durationInSeconds` on the `WorkoutSession` table. All the data in the column will be lost.
  - Added the required column `timezone` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkoutExercise" ADD COLUMN     "description" TEXT,
ADD COLUMN     "estimatedDurationInSeconds" INTEGER;

-- AlterTable
ALTER TABLE "WorkoutSession" DROP COLUMN "durationInSeconds";

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "timezone" TEXT NOT NULL;
