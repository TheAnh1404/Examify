-- CreateEnum
CREATE TYPE "ClassroomStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "classrooms" ADD COLUMN     "banner_url" TEXT,
ADD COLUMN     "status" "ClassroomStatus" NOT NULL DEFAULT 'ACTIVE';
