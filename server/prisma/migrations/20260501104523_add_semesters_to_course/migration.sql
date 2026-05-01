-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('assignment', 'test');

-- AlterTable
ALTER TABLE "assignment" ADD COLUMN     "semester_number" INTEGER,
ADD COLUMN     "subject_code" TEXT,
ADD COLUMN     "type" "AssignmentType" NOT NULL DEFAULT 'assignment';

-- AlterTable
ALTER TABLE "course" ADD COLUMN     "semesters" JSONB;

-- CreateTable
CREATE TABLE "money_request" (
    "id" TEXT NOT NULL,
    "from_user_id" TEXT NOT NULL,
    "to_user_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "money_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam" (
    "exam_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "semester_number" INTEGER NOT NULL,
    "subject_name" VARCHAR(100) NOT NULL,
    "subject_code" VARCHAR(50) NOT NULL,
    "topic" VARCHAR(150) NOT NULL,
    "exam_date" DATE NOT NULL,
    "total_marks" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_pkey" PRIMARY KEY ("exam_id")
);

-- CreateTable
CREATE TABLE "exam_result" (
    "exam_result_id" SERIAL NOT NULL,
    "exam_id" INTEGER NOT NULL,
    "student_id" TEXT NOT NULL,
    "marks_obtained" DECIMAL(8,2) NOT NULL,
    "remark" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_result_pkey" PRIMARY KEY ("exam_result_id")
);

-- CreateIndex
CREATE INDEX "money_request_from_user_id_idx" ON "money_request"("from_user_id");

-- CreateIndex
CREATE INDEX "money_request_to_user_id_idx" ON "money_request"("to_user_id");

-- CreateIndex
CREATE INDEX "exam_course_id_semester_number_subject_code_idx" ON "exam"("course_id", "semester_number", "subject_code");

-- CreateIndex
CREATE INDEX "exam_result_student_id_created_at_idx" ON "exam_result"("student_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "exam_result_exam_id_student_id_key" ON "exam_result"("exam_id", "student_id");

-- CreateIndex
CREATE INDEX "assignment_course_id_type_idx" ON "assignment"("course_id", "type");

-- AddForeignKey
ALTER TABLE "money_request" ADD CONSTRAINT "money_request_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "money_request" ADD CONSTRAINT "money_request_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam" ADD CONSTRAINT "exam_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam" ADD CONSTRAINT "exam_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_result" ADD CONSTRAINT "exam_result_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exam"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_result" ADD CONSTRAINT "exam_result_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
