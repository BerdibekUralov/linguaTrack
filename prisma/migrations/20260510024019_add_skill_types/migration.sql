-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('WRITING', 'SPEAKING', 'READING', 'LISTENING', 'GRAMMAR', 'VOCABULARY');

-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "skillContent" JSONB,
ADD COLUMN     "skillType" "SkillType" NOT NULL DEFAULT 'WRITING';

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "answers" JSONB,
ADD COLUMN     "autoScore" DOUBLE PRECISION;
