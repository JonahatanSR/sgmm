-- Migración para agregar campos faltantes y tabla de aviso de privacidad
-- Fecha: 2025-10-09
-- Descripción: Agregar campos de trazabilidad y tabla de aceptación de aviso de privacidad

-- 1. Agregar campos faltantes a la tabla dependents
ALTER TABLE "dependents" 
ADD COLUMN IF NOT EXISTS "dependent_id" TEXT,
ADD COLUMN IF NOT EXISTS "dependent_seq" INTEGER,
ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- 2. Crear índices únicos para dependent_id y dependent_seq
CREATE UNIQUE INDEX IF NOT EXISTS "dependents_dependent_id_key" ON "dependents"("dependent_id");
CREATE INDEX IF NOT EXISTS "dependents_employee_id_dependent_seq_idx" ON "dependents"("employee_id", "dependent_seq");

-- 3. Agregar campos de trazabilidad a employees
ALTER TABLE "employees" 
ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "login_count" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "last_ip_address" TEXT,
ADD COLUMN IF NOT EXISTS "last_user_agent" TEXT;

-- 4. Crear tabla de aceptaciones de aviso de privacidad
CREATE TABLE IF NOT EXISTS "privacy_acceptances" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "dependent_id" TEXT,
    "acceptance_type" TEXT NOT NULL, -- 'EMPLOYEE' o 'DEPENDENT'
    "privacy_version" TEXT NOT NULL DEFAULT 'v1.0',
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "privacy_acceptances_pkey" PRIMARY KEY ("id")
);

-- 5. Crear índices para la tabla de aceptaciones
CREATE INDEX IF NOT EXISTS "privacy_acceptances_employee_id_idx" ON "privacy_acceptances"("employee_id");
CREATE INDEX IF NOT EXISTS "privacy_acceptances_dependent_id_idx" ON "privacy_acceptances"("dependent_id");
CREATE INDEX IF NOT EXISTS "privacy_acceptances_acceptance_type_idx" ON "privacy_acceptances"("acceptance_type");

-- 6. Agregar foreign keys para privacy_acceptances
ALTER TABLE "privacy_acceptances" 
ADD CONSTRAINT "privacy_acceptances_employee_id_fkey" 
FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "privacy_acceptances" 
ADD CONSTRAINT "privacy_acceptances_dependent_id_fkey" 
FOREIGN KEY ("dependent_id") REFERENCES "dependents"("id") ON UPDATE CASCADE ON DELETE CASCADE;

-- 7. Crear tabla de sesiones de usuario para mejor trazabilidad
CREATE TABLE IF NOT EXISTS "user_sessions" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL UNIQUE,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    
    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- 8. Crear índices para user_sessions
CREATE INDEX IF NOT EXISTS "user_sessions_employee_id_idx" ON "user_sessions"("employee_id");
CREATE INDEX IF NOT EXISTS "user_sessions_session_token_idx" ON "user_sessions"("session_token");
CREATE INDEX IF NOT EXISTS "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");

-- 9. Agregar foreign key para user_sessions
ALTER TABLE "user_sessions" 
ADD CONSTRAINT "user_sessions_employee_id_fkey" 
FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON UPDATE CASCADE ON DELETE CASCADE;

-- 10. Agregar comentarios para documentación
COMMENT ON TABLE "privacy_acceptances" IS 'Registro de aceptaciones del aviso de privacidad por empleados y dependientes';
COMMENT ON TABLE "user_sessions" IS 'Sesiones activas de usuarios para trazabilidad y seguridad';
COMMENT ON COLUMN "employees"."last_login" IS 'Último login del empleado';
COMMENT ON COLUMN "employees"."login_count" IS 'Número total de logins del empleado';
COMMENT ON COLUMN "employees"."last_ip_address" IS 'Última IP desde la que se logueó';
COMMENT ON COLUMN "employees"."last_user_agent" IS 'Último user agent del navegador';
COMMENT ON COLUMN "dependents"."dependent_id" IS 'ID único del dependiente (formato: EMP-001-DEP-001)';
COMMENT ON COLUMN "dependents"."dependent_seq" IS 'Secuencia del dependiente dentro del empleado';
COMMENT ON COLUMN "dependents"."deleted_at" IS 'Fecha de eliminación lógica (soft delete)';

