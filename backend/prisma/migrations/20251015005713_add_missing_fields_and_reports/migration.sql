/*
  Warnings:

  - Made the column `login_count` on table `employees` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "dependents" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_first_time" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "employees" ALTER COLUMN "login_count" SET NOT NULL;

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT,
    "report_type" TEXT NOT NULL,
    "report_name" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "file_path" TEXT,
    "file_size" INTEGER,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "generated_by" TEXT NOT NULL,
    "parameters" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_employee_id_idx" ON "reports"("employee_id");

-- CreateIndex
CREATE INDEX "reports_report_type_idx" ON "reports"("report_type");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_generated_at_idx" ON "reports"("generated_at");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
