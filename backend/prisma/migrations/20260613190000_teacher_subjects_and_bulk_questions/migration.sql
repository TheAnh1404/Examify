-- Add default question weight used when composing new exams
ALTER TABLE "questions" ADD COLUMN "default_point" DECIMAL(65,30) NOT NULL DEFAULT 1.0;

-- Register the subjects each teacher is allowed to teach
CREATE TABLE "teacher_subjects" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "assigned_by" INTEGER,
    "note" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_subjects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "teacher_subjects_teacher_id_subject_id_key"
ON "teacher_subjects"("teacher_id", "subject_id");

ALTER TABLE "teacher_subjects"
ADD CONSTRAINT "teacher_subjects_teacher_id_fkey"
FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teacher_subjects"
ADD CONSTRAINT "teacher_subjects_subject_id_fkey"
FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teacher_subjects"
ADD CONSTRAINT "teacher_subjects_assigned_by_fkey"
FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserve current behavior for existing teachers. Admin can refine these assignments later.
INSERT INTO "teacher_subjects" ("teacher_id", "subject_id", "note")
SELECT teacher."id", subject."id", 'Migrated from existing teacher access'
FROM "users" teacher
CROSS JOIN "subjects" subject
WHERE teacher."role" = 'TEACHER'
ON CONFLICT ("teacher_id", "subject_id") DO NOTHING;
