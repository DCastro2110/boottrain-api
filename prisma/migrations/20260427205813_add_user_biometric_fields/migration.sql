-- CreateEnum
CREATE TYPE "FitnessLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "bodyFatPercentage" INTEGER,
ADD COLUMN     "fitnessLevel" "FitnessLevel",
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "weight" INTEGER;
