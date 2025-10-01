-- Add columns with nullable state for backfill
ALTER TABLE "dependents" ADD COLUMN IF NOT EXISTS "dependent_seq" INTEGER;
ALTER TABLE "dependents" ADD COLUMN IF NOT EXISTS "dependent_id" TEXT;
ALTER TABLE "dependents" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- Backfill dependent_seq using row_number per employee
WITH ranked AS (
  SELECT d.id,
         e.employee_number,
         ROW_NUMBER() OVER (PARTITION BY d.employee_id ORDER BY d.created_at ASC, d.id ASC) AS rn
  FROM "dependents" d
  JOIN "employees" e ON e.id = d.employee_id
)
UPDATE "dependents" d
SET dependent_seq = r.rn,
    dependent_id = r.employee_number || '-a' || LPAD(r.rn::text, 2, '0')
FROM ranked r
WHERE r.id = d.id AND (d.dependent_seq IS NULL OR d.dependent_id IS NULL);

-- Enforce NOT NULL after backfill
ALTER TABLE "dependents" ALTER COLUMN "dependent_seq" SET NOT NULL;
ALTER TABLE "dependents" ALTER COLUMN "dependent_id" SET NOT NULL;

-- Indexes and uniqueness
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'dependents_dependent_id_key'
  ) THEN
    CREATE UNIQUE INDEX "dependents_dependent_id_key" ON "dependents"("dependent_id");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'dependents_employee_id_dependent_seq_idx'
  ) THEN
    CREATE INDEX "dependents_employee_id_dependent_seq_idx" ON "dependents"("employee_id", "dependent_seq");
  END IF;
END $$;





