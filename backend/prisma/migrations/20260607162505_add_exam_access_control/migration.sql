-- CreateEnum
CREATE TYPE "ExamVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "access_password_hash" TEXT,
ADD COLUMN     "visibility" "ExamVisibility" NOT NULL DEFAULT 'PRIVATE';

-- CreateTable
CREATE TABLE "exam_students" (
    "id" SERIAL NOT NULL,
    "exam_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_students_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_students_exam_id_student_id_key" ON "exam_students"("exam_id", "student_id");

-- AddForeignKey
ALTER TABLE "exam_students" ADD CONSTRAINT "exam_students_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_students" ADD CONSTRAINT "exam_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
