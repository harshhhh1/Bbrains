-- AlterEnum
ALTER TYPE "LogCategory" ADD VALUE 'LEVELS';

-- AlterTable
ALTER TABLE "announcement" ADD COLUMN     "type" VARCHAR(20) NOT NULL DEFAULT 'user';
