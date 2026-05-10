-- CreateEnum
CREATE TYPE "Framework" AS ENUM ('IELTS', 'CEFR', 'TOEFL', 'CAMBRIDGE', 'DUOLINGO', 'GENERAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SkillType" ADD VALUE 'MIXED';
ALTER TYPE "SkillType" ADD VALUE 'USE_OF_ENGLISH';

-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "framework" "Framework" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "level" TEXT;
