-- AlterTable
ALTER TABLE "exams" ADD COLUMN "pass_percentage" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "exam_attempts" ADD COLUMN "tab_focus_losses" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "system_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "site_name" TEXT NOT NULL DEFAULT 'Examify Assessment Engine',
    "contact_email" TEXT NOT NULL DEFAULT 'support@examify.com',
    "registration_open" BOOLEAN NOT NULL DEFAULT true,
    "proctoring_enforced" BOOLEAN NOT NULL DEFAULT true,
    "tab_focus_warnings" INTEGER NOT NULL DEFAULT 3,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- Seed singleton settings row
INSERT INTO "system_settings" ("id", "updated_at")
VALUES (1, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
