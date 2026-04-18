/*
  Warnings:

  - Made the column `description` on table `WorkoutPlan` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WorkoutPlan" ALTER COLUMN "description" SET NOT NULL;
