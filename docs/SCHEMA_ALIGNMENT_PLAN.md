# 🗄️ PLAN DE ALINEACIÓN DE ESQUEMA DE BD vs HISTORIAS DE USUARIO

## 🎯 OBJETIVO
Alinear el esquema de base de datos propuesto con las historias de usuario identificadas, implementando las tablas y campos faltantes para soportar toda la funcionalidad requerida.

---

## 📊 ANÁLISIS: ESQUEMA PROPUESTO vs ESQUEMA ACTUAL

### **✅ TABLAS YA IMPLEMENTADAS EN SCHEMA.PRISMA**

| Tabla | Estado | Campos Faltantes | HU Relacionada |
|-------|--------|------------------|----------------|
| `Company` | ✅ **COMPLETA** | Ninguno | HU-005, HU-006, HU-007 |
| `Employee` | ✅ **COMPLETA** | Ninguno | HU-001, HU-002, HU-003 |
| `Dependent` | ✅ **COMPLETA** | Ninguno | HU-003, HU-004 |
| `RelationshipType` | ✅ **COMPLETA** | Ninguno | HU-003 |
| `Document` | ✅ **COMPLETA** | Ninguno | HU-003, HU-009 |
| `PrivacyAcceptance` | ✅ **COMPLETA** | Ninguno | HU-003, HU-008 |
| `AuditLog` | ✅ **COMPLETA** | Ninguno | HU-008 |
| `UserSession` | ✅ **COMPLETA** | Ninguno | HU-001 |
| `AdminUser` | ✅ **COMPLETA** | Ninguno | HU-005, HU-008 |

### **❌ TABLAS FALTANTES EN SCHEMA.PRISMA**

| Tabla | Estado | HU Relacionada | Impacto |
|-------|--------|----------------|---------|
| `SystemConfig` | ❌ **FALTANTE** | HU-003, HU-009 | Sin configuración del sistema |
| `Report` | ❌ **FALTANTE** | HU-006, HU-007 | Sin registro de reportes generados |

### **❌ VISTAS SQL FALTANTES**

| Vista | Estado | HU Relacionada | Impacto |
|-------|--------|----------------|---------|
| `v_employees_consolidated` | ❌ **FALTANTE** | HU-005 | Sin vista consolidada para RH |
| `v_insurer_report` | ❌ **FALTANTE** | HU-006 | Sin datos para reporte aseguradora |
| `v_payroll_deductions` | ❌ **FALTANTE** | HU-007 | Sin datos para reporte nóminas |

---

## 🎯 PLAN DE IMPLEMENTACIÓN POR HISTORIAS DE USUARIO

### **HU-001: Autenticación SAML** ✅ **COMPLETA**
**Estado**: ✅ **NO REQUIERE CAMBIOS EN SCHEMA**
- **Tablas necesarias**: `Employee`, `UserSession`
- **Estado actual**: ✅ Ambas implementadas correctamente
- **Acción**: Ninguna

---

### **HU-002: Ver información personal** ✅ **COMPLETA**
**Estado**: ✅ **NO REQUIERE CAMBIOS EN SCHEMA**
- **Tablas necesarias**: `Employee`, `Dependent`, `RelationshipType`
- **Estado actual**: ✅ Todas implementadas correctamente
- **Acción**: Ninguna

---

### **HU-003: Agregar dependiente** ⚠️ **PARCIALMENTE COMPLETA**
**Estado**: ⚠️ **REQUIERE IMPLEMENTACIÓN DE FUNCIONALIDAD**

**Tablas necesarias**:
- ✅ `Dependent` - Implementada
- ✅ `PrivacyAcceptance` - Implementada  
- ✅ `Document` - Implementada
- ❌ `SystemConfig` - **FALTANTE**

**GAPS IDENTIFICADOS**:

1. **❌ Tabla `SystemConfig` no existe**
   - **Campos necesarios**: `max_dependents_per_employee`, `max_file_size_mb`, `allowed_file_types`
   - **Impacto**: Sin validaciones de límites
   - **Acción**: Crear tabla y migración

2. **❌ Campo `is_first_time` en `Dependent`**
   - **Estado**: No existe en schema actual
   - **Impacto**: No se puede validar primera vez
   - **Acción**: Agregar campo a tabla `Dependent`

3. **❌ Campo `created_by` en `Dependent`**
   - **Estado**: No existe en schema actual
   - **Impacto**: Sin trazabilidad de creación
   - **Acción**: Agregar campo a tabla `Dependent`

---

### **HU-004: Dar de baja dependiente** ✅ **COMPLETA**
**Estado**: ✅ **NO REQUIERE CAMBIOS EN SCHEMA**
- **Tablas necesarias**: `Dependent`, `AuditLog`
- **Estado actual**: ✅ Ambas implementadas correctamente
- **Acción**: Ninguna

---

### **HU-005: Vista consolidada de colaboradores** ❌ **FALTANTE**
**Estado**: ❌ **REQUIERE VISTA SQL**

**GAPS IDENTIFICADOS**:

1. **❌ Vista `v_employees_consolidated` no existe**
   - **Campos necesarios**: 
     - `employee_id`, `employee_number`, `full_name`, `email`
     - `company_id`, `company_name`, `employee_status`
     - `total_dependents`, `active_dependents`, `inactive_dependents`
     - `extra_dependents`, `last_activity`
   - **Impacto**: Sin vista consolidada para RH
   - **Acción**: Crear vista SQL en migración

---

### **HU-006: Generar reporte para aseguradora** ❌ **FALTANTE**
**Estado**: ❌ **REQUIERE VISTA SQL Y TABLA**

**GAPS IDENTIFICADOS**:

1. **❌ Vista `v_insurer_report` no existe**
   - **Campos necesarios**:
     - Empleado: `colaborador_id`, `apellido_paterno`, `apellido_materno`, `nombre`, `fecha_nacimiento`, `sexo`, `edad`
     - Dependiente: `dependiente_compuesto_id`, `dep_nombre`, `dep_apellido_paterno`, `dep_fecha_nacimiento`, `dep_sexo`, `dep_edad`, `parentesco`
   - **Impacto**: Sin datos para reporte aseguradora
   - **Acción**: Crear vista SQL en migración

2. **❌ Tabla `Report` no existe**
   - **Campos necesarios**: `id`, `employee_id`, `report_type`, `generated_at`, `generated_by`, `file_path`, `status`
   - **Impacto**: Sin registro de reportes generados
   - **Acción**: Crear tabla y migración

---

### **HU-007: Generar reporte de deducciones de nómina** ❌ **FALTANTE**
**Estado**: ❌ **REQUIERE VISTA SQL**

**GAPS IDENTIFICADOS**:

1. **❌ Vista `v_payroll_deductions` no existe**
   - **Campos necesarios**:
     - `colaborador_id`, `apellido_paterno`, `apellido_materno`, `nombre`, `correo_electronico`
     - `total_dependientes`, `dependientes_extra`, `company_id`
   - **Impacto**: Sin datos para reporte nóminas
   - **Acción**: Crear vista SQL en migración

---

### **HU-008: Audit trail de acciones** ✅ **COMPLETA**
**Estado**: ✅ **NO REQUIERE CAMBIOS EN SCHEMA**
- **Tablas necesarias**: `AuditLog`
- **Estado actual**: ✅ Implementada correctamente
- **Acción**: Ninguna

---

### **HU-009: Gestión de archivos** ✅ **COMPLETA**
**Estado**: ✅ **NO REQUIERE CAMBIOS EN SCHEMA**
- **Tablas necesarias**: `Document`
- **Estado actual**: ✅ Implementada correctamente
- **Acción**: Ninguna

---

## 📋 PLAN DE IMPLEMENTACIÓN DETALLADO

### **FASE 1: COMPLETAR TABLAS FALTANTES (1 día)**

#### **Bloque 1.1: Tabla SystemConfig**
```sql
-- Crear tabla system_config
CREATE TABLE system_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  value_type VARCHAR(20) DEFAULT 'STRING',
  updatable_by_role VARCHAR(50) DEFAULT 'SUPER_ADMIN',
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(50) NOT NULL
);

-- Insertar configuraciones iniciales
INSERT INTO system_config (key, value, description, updated_by) VALUES
('max_dependents_per_employee', '10', 'Máximo número de dependientes por empleado', 'system'),
('max_file_size_mb', '5', 'Tamaño máximo de archivo en MB', 'system'),
('allowed_file_types', '["pdf","jpg","jpeg","png"]', 'Tipos de archivo permitidos', 'system'),
('session_timeout_hours', '24', 'Timeout de sesión en horas', 'system'),
('privacy_policy_version', 'v1.0', 'Versión actual del aviso de privacidad', 'system'),
('privacy_policy_url', 'https://sgmm.portalapps.mx/privacy-policy', 'URL del aviso de privacidad', 'system');
```

#### **Bloque 1.2: Tabla Report**
```sql
-- Crear tabla reports
CREATE TABLE reports (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50),
  report_type VARCHAR(50) NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  generated_by VARCHAR(50) NOT NULL,
  file_path VARCHAR(500),
  file_size INTEGER,
  google_drive_file_id VARCHAR(255),
  google_drive_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'COMPLETED',
  parameters JSONB,
  error_message TEXT,
  
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CHECK (report_type IN ('INSURER', 'PAYROLL_DEDUCTIONS')),
  CHECK (status IN ('GENERATING', 'COMPLETED', 'FAILED'))
);
```

#### **Bloque 1.3: Campos faltantes en Dependent**
```sql
-- Agregar campos faltantes a dependents
ALTER TABLE dependents ADD COLUMN is_first_time BOOLEAN DEFAULT FALSE;
ALTER TABLE dependents ADD COLUMN created_by VARCHAR(50) NOT NULL DEFAULT 'system';
ALTER TABLE dependents ADD COLUMN deleted_by VARCHAR(50);
```

---

### **FASE 2: CREAR VISTAS SQL (1 día)**

#### **Bloque 2.1: Vista consolidada para RH**
```sql
-- Crear vista consolidada de empleados
CREATE VIEW v_employees_consolidated AS
SELECT 
  e.id as employee_id,
  e.employee_number,
  e.full_name,
  e.email,
  e.company_id,
  c.name as company_name,
  e.status as employee_status,
  e.deleted_at as employee_deleted_at,
  COUNT(d.id) as total_dependents,
  COUNT(CASE WHEN d.status = 'ACTIVE' AND d.deleted_at IS NULL THEN 1 END) as active_dependents,
  COUNT(CASE WHEN d.status = 'INACTIVE' OR d.deleted_at IS NOT NULL THEN 1 END) as inactive_dependents,
  COUNT(CASE WHEN d.status = 'ACTIVE' AND d.deleted_at IS NULL THEN 1 END) - 1 as extra_dependents,
  MAX(al.timestamp) as last_activity,
  e.created_at,
  e.updated_at
FROM employees e
LEFT JOIN companies c ON e.company_id = c.id
LEFT JOIN dependents d ON e.id = d.employee_id
LEFT JOIN audit_logs al ON e.id = al.employee_id
WHERE e.deleted_at IS NULL
GROUP BY e.id, e.employee_number, e.full_name, e.email, e.company_id, c.name, e.status, e.deleted_at, e.created_at, e.updated_at;
```

#### **Bloque 2.2: Vista para reporte de aseguradora**
```sql
-- Crear vista para reporte de aseguradora
CREATE VIEW v_insurer_report AS
SELECT 
  e.employee_number as colaborador_id,
  e.paternal_last_name as apellido_paterno,
  e.maternal_last_name as apellido_materno,
  e.first_name as nombre,
  e.birth_date as fecha_nacimiento,
  e.gender as sexo,
  EXTRACT(YEAR FROM AGE(e.birth_date)) as edad,
  CONCAT(e.employee_number, '-', d.dependent_id) as dependiente_compuesto_id,
  d.first_name as dep_nombre,
  d.paternal_last_name as dep_apellido_paterno,
  d.maternal_last_name as dep_apellido_materno,
  d.birth_date as dep_fecha_nacimiento,
  d.gender as dep_sexo,
  EXTRACT(YEAR FROM AGE(d.birth_date)) as dep_edad,
  rt.name as parentesco
FROM employees e
LEFT JOIN dependents d ON e.id = d.employee_id AND d.deleted_at IS NULL AND d.status = 'ACTIVE'
LEFT JOIN relationship_types rt ON d.relationship_type_id = rt.id
WHERE e.deleted_at IS NULL AND e.status = 'ACTIVE'
ORDER BY e.employee_number, d.dependent_seq;
```

#### **Bloque 2.3: Vista para reporte de deducciones de nómina**
```sql
-- Crear vista para reporte de deducciones de nómina
CREATE VIEW v_payroll_deductions AS
SELECT 
  e.employee_number as colaborador_id,
  e.paternal_last_name as apellido_paterno,
  e.maternal_last_name as apellido_materno,
  e.first_name as nombre,
  e.email as correo_electronico,
  COUNT(d.id) as total_dependientes,
  (COUNT(d.id) - 1) as dependientes_extra,
  e.company_id
FROM employees e
INNER JOIN dependents d ON e.id = d.employee_id AND d.deleted_at IS NULL AND d.status = 'ACTIVE'
WHERE e.deleted_at IS NULL AND e.status = 'ACTIVE'
GROUP BY e.id, e.employee_number, e.paternal_last_name, e.maternal_last_name, e.first_name, e.email, e.company_id
HAVING COUNT(d.id) >= 2
ORDER BY dependientes_extra DESC;
```

---

### **FASE 3: ACTUALIZAR SCHEMA.PRISMA (1 día)**

#### **Bloque 3.1: Agregar modelos faltantes**
```prisma
model SystemConfig {
  key             String    @id
  value           String
  description     String?
  value_type      String    @default("STRING")
  updatable_by_role String  @default("SUPER_ADMIN")
  updated_at      DateTime  @default(now())
  updated_by      String

  @@map("system_config")
}

model Report {
  id                    String    @id @default(cuid())
  employee_id           String?
  report_type           String
  generated_at          DateTime  @default(now())
  generated_by          String
  file_path             String?
  file_size             Int?
  google_drive_file_id  String?
  google_drive_url      String?
  status                String    @default("COMPLETED")
  parameters            Json?
  error_message         String?

  // Relations
  employee              Employee? @relation(fields: [employee_id], references: [id], onDelete: Cascade)

  @@map("reports")
}
```

#### **Bloque 3.2: Actualizar modelo Dependent**
```prisma
model Dependent {
  id                  String           @id @default(cuid())
  dependent_id        String           @unique
  dependent_seq       Int
  employee_id         String
  first_name          String
  paternal_last_name  String
  maternal_last_name  String?
  birth_date          DateTime
  gender              Gender
  relationship_type_id Int
  policy_start_date   DateTime
  policy_end_date     DateTime?
  deleted_at          DateTime?
  status              DependentStatus  @default(ACTIVE)
  is_first_time       Boolean          @default(false)
  created_at          DateTime         @default(now())
  updated_at          DateTime         @updatedAt
  created_by          String           @default("system")
  deleted_by          String?

  // Relations
  employee            Employee         @relation(fields: [employee_id], references: [id], onDelete: Cascade)
  relationship_type   RelationshipType @relation(fields: [relationship_type_id], references: [id])
  documents           Document[]
  privacy_acceptances PrivacyAcceptance[]
  audit_logs          AuditLog[]

  @@map("dependents")
}
```

#### **Bloque 3.3: Actualizar modelo Employee**
```prisma
model Employee {
  id                  String        @id @default(cuid())
  google_id           String?       @unique
  employee_number     String        @unique
  email               String        @unique
  full_name           String
  first_name          String?
  paternal_last_name  String?
  maternal_last_name  String?
  birth_date          DateTime?
  gender              Gender?
  hire_date           DateTime
  company_id          String
  department          String?
  position            String?
  org_unit_path       String?
  policy_number       String?
  status              EmployeeStatus @default(ACTIVE)
  // Campos de trazabilidad
  last_login          DateTime?
  login_count         Int           @default(0)
  last_ip_address     String?
  last_user_agent     String?
  created_at          DateTime      @default(now())
  updated_at          DateTime      @updatedAt
  deleted_at          DateTime?
  deleted_by          String?

  // Relations
  company             Company       @relation(fields: [company_id], references: [id], onDelete: Cascade)
  dependents          Dependent[]
  documents           Document[]
  audit_logs          AuditLog[]
  privacy_acceptances PrivacyAcceptance[]
  user_sessions       UserSession[]
  reports             Report[]

  @@map("employees")
}
```

---

## 📊 MÉTRICAS DE PROGRESO

### **Estado Actual del Schema**:
- ✅ **Tablas implementadas**: 9/11 (82%)
- ❌ **Tablas faltantes**: 2/11 (18%)
- ❌ **Vistas SQL faltantes**: 3/3 (100%)
- ❌ **Campos faltantes**: 3 campos en `Dependent`

### **Estado Después de Implementación**:
- ✅ **Tablas implementadas**: 11/11 (100%)
- ✅ **Vistas SQL implementadas**: 3/3 (100%)
- ✅ **Campos faltantes**: 0/3 (100%)

### **Cobertura de Historias de Usuario**:
- ✅ **HU completamente soportadas**: 6/9 (67%)
- ⚠️ **HU parcialmente soportadas**: 1/9 (11%)
- ❌ **HU no soportadas**: 2/9 (22%)

### **Después de Implementación**:
- ✅ **HU completamente soportadas**: 9/9 (100%)
- ❌ **HU no soportadas**: 0/9 (0%)

---

## 🎯 CRONOGRAMA DE IMPLEMENTACIÓN

### **Día 1: Tablas y Campos Faltantes**
- [ ] Crear tabla `system_config`
- [ ] Crear tabla `reports`
- [ ] Agregar campos faltantes a `dependents`
- [ ] Insertar configuraciones iniciales
- [ ] Generar migración Prisma

### **Día 2: Vistas SQL**
- [ ] Crear vista `v_employees_consolidated`
- [ ] Crear vista `v_insurer_report`
- [ ] Crear vista `v_payroll_deductions`
- [ ] Validar vistas con datos de prueba
- [ ] Generar migración Prisma

### **Día 3: Actualización de Schema**
- [ ] Actualizar `schema.prisma` con nuevos modelos
- [ ] Actualizar modelos existentes
- [ ] Regenerar cliente Prisma
- [ ] Validar tipos TypeScript
- [ ] Tests de integración

---

## 🚨 VALIDACIONES CRÍTICAS

### **Antes de Implementar**:
- [ ] Backup de base de datos actual
- [ ] Verificar que no hay datos en producción
- [ ] Validar que migraciones son reversibles

### **Durante la Implementación**:
- [ ] Ejecutar migraciones en orden correcto
- [ ] Validar que vistas SQL funcionan
- [ ] Verificar que tipos Prisma son correctos

### **Después de Implementar**:
- [ ] Tests de integración con nuevas tablas
- [ ] Validar que vistas retornan datos correctos
- [ ] Verificar que no se rompió funcionalidad existente

---

*Plan creado el: 15 de Enero 2025*
*Basado en análisis de esquema propuesto vs historias de usuario*
*Próxima actualización: Al completar cada fase*
