# 📊 DICCIONARIO DE DATOS - SISTEMA SGMM
# Sistema de Gestión de Gastos Médicos Mayores

## 🎯 OBJETIVO
Documentar todas las entidades, campos, relaciones y reglas de negocio del sistema SGMM para mantener consistencia en el desarrollo y evitar inconsistencias entre código y base de datos.

## 📋 CONVENCIONES DE NOMENCLATURA

### **Entidades Principales**
- **EMPLOYEES**: Colaboradores/Empleados del sistema
- **DEPENDENTS**: Dependientes de los colaboradores
- **COMPANIES**: Compañías (Siegfried, Weser, etc.)
- **RELATIONSHIP_TYPES**: Tipos de parentesco
- **DOCUMENTS**: Documentos adjuntos (actas de nacimiento, etc.)
- **AUDIT_TRAILS**: Trazabilidad de acciones
- **PRIVACY_ACCEPTANCES**: Aceptaciones de aviso de privacidad

### **Patrones de Nomenclatura**
- **Tablas**: `snake_case` en plural (employees, dependents)
- **Campos**: `snake_case` (employee_id, created_at)
- **IDs**: `snake_case` con sufijo `_id` (employee_id, company_id)
- **Fechas**: `snake_case` con sufijo temporal (created_at, updated_at, deleted_at)
- **Estados**: `snake_case` (status, is_active)
- **Enums**: `UPPER_SNAKE_CASE` (ACTIVE, INACTIVE, M, F)

---

## 🏢 TABLA: COMPANIES

### **Propósito**
Almacenar información de las compañías que utilizan el sistema SGMM.

### **Campos**

| Campo | Tipo | Restricciones | Descripción | Ejemplo |
|-------|------|---------------|-------------|---------|
| `id` | VARCHAR(50) | PK, NOT NULL | Identificador único de la compañía | `company-sr-001` |
| `name` | VARCHAR(255) | NOT NULL | Nombre completo de la compañía | `Siegfried Rhein` |
| `code` | VARCHAR(10) | UNIQUE, NOT NULL | Código único de la compañía | `SR`, `WP` |
| `logo_url` | VARCHAR(500) | NULLABLE | URL del logo de la compañía | `https://drive.google.com/...` |
| `favicon_url` | VARCHAR(500) | NULLABLE | URL del favicon | `https://drive.google.com/...` |
| `primary_color` | VARCHAR(7) | DEFAULT '#1f2937' | Color primario de la marca | `#1f2937` |
| `secondary_color` | VARCHAR(7) | DEFAULT '#374151' | Color secundario | `#374151` |
| `accent_color` | VARCHAR(7) | DEFAULT '#3b82f6' | Color de acento | `#3b82f6` |
| `neutral_color` | VARCHAR(7) | DEFAULT '#6b7280' | Color neutro | `#6b7280` |
| `font_primary` | VARCHAR(50) | DEFAULT 'Arial' | Fuente primaria | `Arial`, `Roboto` |
| `font_secondary` | VARCHAR(50) | DEFAULT 'Arial' | Fuente secundaria | `Arial`, `Roboto` |
| `custom_css` | TEXT | NULLABLE | CSS personalizado | `.custom-header { ... }` |
| `active` | BOOLEAN | DEFAULT TRUE | Si la compañía está activa | `true`, `false` |
| `brand_updated_at` | TIMESTAMP | NULLABLE | Última actualización de marca | `2025-01-15 10:30:00` |
| `brand_updated_by` | VARCHAR(50) | NULLABLE | Quien actualizó la marca | `admin-user-001` |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación | `2025-01-15 09:00:00` |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Fecha de última actualización | `2025-01-15 10:30:00` |
| `deleted_at` | TIMESTAMP | NULLABLE | Fecha de eliminación lógica | `NULL` |
| `deleted_by` | VARCHAR(50) | NULLABLE | Quien eliminó el registro | `admin-user-001` |

### **Reglas de Negocio**
- El `code` debe ser único y no puede cambiar una vez creado
- Solo se puede hacer soft delete (nunca eliminación física)
- Los colores deben estar en formato hexadecimal válido
- Las URLs deben ser válidas y accesibles

### **Relaciones**
- `COMPANIES (1) ←→ (N) EMPLOYEES`
- `COMPANIES (1) ←→ (N) ADMIN_USERS`

---

## 👤 TABLA: EMPLOYEES

### **Propósito**
Almacenar información de los colaboradores/empleados que acceden al sistema.

### **Campos**

| Campo | Tipo | Restricciones | Descripción | Ejemplo |
|-------|------|---------------|-------------|---------|
| `id` | VARCHAR(50) | PK, NOT NULL | Número de empleado | `3619` |
| `google_id` | VARCHAR(255) | UNIQUE, NULLABLE | ID de Google AD | `google-user-123456` |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email corporativo | `jonahatan.angeles@siegfried.com.mx` |
| `full_name` | VARCHAR(255) | NOT NULL | Nombre completo | `Jonahatan Angeles Rosas` |
| `first_name` | VARCHAR(100) | NULLABLE | Nombre(s) | `Jonahatan` |
| `paternal_last_name` | VARCHAR(100) | NULLABLE | Apellido paterno | `Angeles` |
| `maternal_last_name` | VARCHAR(100) | NULLABLE | Apellido materno | `Rosas` |
| `birth_date` | DATE | NULLABLE | Fecha de nacimiento | `1990-05-20` |
| `gender` | CHAR(1) | CHECK (M/F) | Sexo | `M`, `F` |
| `hire_date` | DATE | NOT NULL | Fecha de ingreso | `2020-01-15` |
| `company_id` | VARCHAR(50) | FK, NOT NULL | ID de la compañía | `company-sr-001` |
| `department` | VARCHAR(100) | NULLABLE | Departamento | `Tecnología` |
| `position` | VARCHAR(100) | NULLABLE | Posición | `Desarrollador Senior` |
| `policy_number` | VARCHAR(100) | NULLABLE | Número de póliza | `POL-2025-3619` |
| `status` | VARCHAR(20) | DEFAULT 'ACTIVE' | Estado del empleado | `ACTIVE`, `INACTIVE` |
| `last_login` | TIMESTAMP | NULLABLE | Último login | `2025-01-15 14:30:00` |
| `login_count` | INTEGER | DEFAULT 0 | Contador de logins | `25` |
| `last_ip_address` | VARCHAR(45) | NULLABLE | Última IP | `192.168.1.100` |
| `last_user_agent` | TEXT | NULLABLE | Último user agent | `Mozilla/5.0...` |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación | `2025-01-15 09:00:00` |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Fecha de actualización | `2025-01-15 14:30:00` |
| `deleted_at` | TIMESTAMP | NULLABLE | Eliminación lógica | `NULL` |
| `deleted_by` | VARCHAR(50) | NULLABLE | Quien eliminó | `admin-user-001` |

### **Reglas de Negocio**
- El `id` es el número de empleado y debe ser único
- El `email` debe ser válido y único en el sistema
- El `google_id` se obtiene del SAML de Google Workspace
- Solo se puede hacer soft delete
- El `status` puede ser ACTIVE o INACTIVE
- El `gender` solo acepta 'M' o 'F'

### **Relaciones**
- `EMPLOYEES (N) ←→ (1) COMPANIES`
- `EMPLOYEES (1) ←→ (N) DEPENDENTS`
- `EMPLOYEES (1) ←→ (N) AUDIT_TRAILS`
- `EMPLOYEES (1) ←→ (N) PRIVACY_ACCEPTANCES`
- `EMPLOYEES (1) ←→ (N) DOCUMENTS`
- `EMPLOYEES (1) ←→ (N) USER_SESSIONS`

---

## 👨‍👩‍👧‍👦 TABLA: DEPENDENTS

### **Propósito**
Almacenar información de los dependientes de los colaboradores.

### **Campos**

| Campo | Tipo | Restricciones | Descripción | Ejemplo |
|-------|------|---------------|-------------|---------|
| `id` | VARCHAR(50) | PK, NOT NULL | ID único del dependiente | `3619-a01` |
| `dependent_seq` | INTEGER | NOT NULL | Secuencia del dependiente | `1`, `2`, `3` |
| `employee_id` | VARCHAR(50) | FK, NOT NULL | ID del empleado titular | `3619` |
| `first_name` | VARCHAR(100) | NOT NULL | Nombre(s) | `María` |
| `paternal_last_name` | VARCHAR(100) | NOT NULL | Apellido paterno | `Angeles` |
| `maternal_last_name` | VARCHAR(100) | NULLABLE | Apellido materno | `García` |
| `birth_date` | DATE | NOT NULL | Fecha de nacimiento | `2015-03-10` |
| `gender` | CHAR(1) | NOT NULL, CHECK (M/F) | Sexo | `F` |
| `relationship_type_id` | INTEGER | FK, NOT NULL | Tipo de parentesco | `1` (Hijo) |
| `policy_start_date` | DATE | NOT NULL | Inicio de póliza | `2025-01-01` |
| `policy_end_date` | DATE | NULLABLE | Fin de póliza | `2025-12-31` |
| `status` | VARCHAR(20) | DEFAULT 'ACTIVE' | Estado del dependiente | `ACTIVE`, `INACTIVE` |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación | `2025-01-15 09:00:00` |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Fecha de actualización | `2025-01-15 14:30:00` |
| `deleted_at` | TIMESTAMP | NULLABLE | Eliminación lógica | `NULL` |
| `deleted_by` | VARCHAR(50) | NULLABLE | Quien eliminó | `3619` |
| `created_by` | VARCHAR(50) | NOT NULL | Quien creó | `3619` |

### **Reglas de Negocio**
- El `id` debe ser único y seguir formato `{employee_number}-{sequence}`
- El `dependent_seq` debe ser único por empleado (1, 2, 3...)
- El `birth_date` es obligatorio para calcular edad
- El `policy_end_date` se llena cuando se da de baja
- Solo se puede hacer soft delete
- El primer dependiente es gratuito, los siguientes tienen costo

### **Relaciones**
- `DEPENDENTS (N) ←→ (1) EMPLOYEES`
- `DEPENDENTS (N) ←→ (1) RELATIONSHIP_TYPES`
- `DEPENDENTS (1) ←→ (N) AUDIT_TRAILS`
- `DEPENDENTS (1) ←→ (N) PRIVACY_ACCEPTANCES`
- `DEPENDENTS (1) ←→ (N) DOCUMENTS`

---

## 🔗 TABLA: RELATIONSHIP_TYPES

### **Propósito**
Definir los tipos de parentesco válidos para los dependientes.

### **Campos**

| Campo | Tipo | Restricciones | Descripción | Ejemplo |
|-------|------|---------------|-------------|---------|
| `id` | SERIAL | PK, NOT NULL | ID único auto-increment | `1`, `2`, `3` |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Nombre del parentesco | `Hijo`, `Hija` |
| `display_order` | INTEGER | DEFAULT 0 | Orden de visualización | `1`, `2`, `3` |
| `active` | BOOLEAN | DEFAULT TRUE | Si está activo | `true`, `false` |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación | `2025-01-15 09:00:00` |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Fecha de actualización | `2025-01-15 09:00:00` |

### **Datos Iniciales**
```sql
INSERT INTO relationship_types (name, display_order) VALUES
('Hijo', 1),
('Hija', 2),
('Cónyuge', 3),
('Concubino', 4),
('Concubina', 5),
('Padre', 6),
('Madre', 7);
```

### **Reglas de Negocio**
- Los tipos son predefinidos y no se pueden crear dinámicamente
- Solo se pueden desactivar, no eliminar
- El `display_order` determina el orden en formularios

---

## 📁 TABLA: DOCUMENTS

### **Propósito**
Almacenar información de documentos adjuntos (actas de nacimiento, etc.).

### **Campos**

| Campo | Tipo | Restricciones | Descripción | Ejemplo |
|-------|------|---------------|-------------|---------|
| `id` | VARCHAR(50) | PK, NOT NULL | ID único del documento | `doc-3619-a01-001` |
| `employee_id` | VARCHAR(50) | FK, NOT NULL | ID del empleado | `3619` |
| `dependent_id` | VARCHAR(50) | FK, NULLABLE | ID del dependiente | `3619-a01` |
| `document_type` | VARCHAR(50) | NOT NULL | Tipo de documento | `BIRTH_CERTIFICATE` |
| `original_filename` | VARCHAR(255) | NOT NULL | Nombre original | `acta_nacimiento_maria.pdf` |
| `stored_filename` | VARCHAR(255) | NOT NULL | Nombre en storage | `doc-3619-a01-001.pdf` |
| `file_path` | VARCHAR(500) | NOT NULL | Ruta en Google Drive | `/SGMM/Documents/3619/` |
| `file_size` | INTEGER | NOT NULL, CHECK ≤5MB | Tamaño en bytes | `2048576` |
| `mime_type` | VARCHAR(100) | NOT NULL | Tipo MIME | `application/pdf` |
| `google_drive_file_id` | VARCHAR(255) | NULLABLE | ID en Google Drive | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` |
| `google_drive_url` | VARCHAR(500) | NULLABLE | URL de Google Drive | `https://drive.google.com/...` |
| `upload_ip` | VARCHAR(45) | NOT NULL | IP de subida | `192.168.1.100` |
| `uploaded_by` | VARCHAR(50) | NOT NULL | Quien subió | `3619` |
| `uploaded_at` | TIMESTAMP | DEFAULT NOW() | Cuándo se subió | `2025-01-15 14:30:00` |
| `is_first_time` | BOOLEAN | DEFAULT FALSE | Primera vez del dependiente | `true`, `false` |

### **Reglas de Negocio**
- Máximo 5MB por archivo
- Solo acepta PDF, JPG, JPEG, PNG
- Obligatorio para dependientes en primera vez
- Se almacena en Google Drive con estructura organizada
- El `is_first_time` determina si es obligatorio subir documento

### **Tipos de Documento**
- `BIRTH_CERTIFICATE`: Acta de nacimiento
- `MARRIAGE_CERTIFICATE`: Acta de matrimonio
- `IDENTIFICATION`: Identificación oficial

---

## 🔐 TABLA: AUDIT_TRAILS

### **Propósito**
Registrar todas las acciones realizadas en el sistema para auditoría.

### **Campos**

| Campo | Tipo | Restricciones | Descripción | Ejemplo |
|-------|------|---------------|-------------|---------|
| `id` | VARCHAR(50) | PK, NOT NULL | ID único del registro | `audit-001` |
| `employee_id` | VARCHAR(50) | FK, NOT NULL | ID del empleado | `3619` |
| `dependent_id` | VARCHAR(50) | FK, NULLABLE | ID del dependiente | `3619-a01` |
| `action` | VARCHAR(50) | NOT NULL | Acción realizada | `CREATE`, `UPDATE` |
| `table_name` | VARCHAR(50) | NOT NULL | Tabla afectada | `employees`, `dependents` |
| `record_id` | VARCHAR(50) | NOT NULL | ID del registro | `3619`, `3619-a01` |
| `old_values` | JSONB | NULLABLE | Valores anteriores | `{"name": "Juan"}` |
| `new_values` | JSONB | NULLABLE | Valores nuevos | `{"name": "Juan Carlos"}` |
| `actor_id` | VARCHAR(50) | NOT NULL | Quien hizo la acción | `3619` |
| `actor_role` | VARCHAR(50) | NOT NULL | Rol del actor | `EMPLOYEE`, `HR_ADMIN` |
| `actor_email` | VARCHAR(255) | NULLABLE | Email del actor | `jonahatan.angeles@siegfried.com.mx` |
| `ip_address` | VARCHAR(45) | NOT NULL | IP de la acción | `192.168.1.100` |
| `user_agent` | TEXT | NULLABLE | User agent | `Mozilla/5.0...` |
| `timestamp` | TIMESTAMP | DEFAULT NOW() | Cuándo ocurrió | `2025-01-15 14:30:00` |

### **Tipos de Acción**
- `CREATE`: Creación de registro
- `UPDATE`: Actualización de registro
- `DELETE`: Eliminación lógica
- `LOGIN`: Inicio de sesión
- `LOGOUT`: Cierre de sesión
- `UPLOAD`: Subida de archivo
- `DOWNLOAD`: Descarga de archivo

### **Roles de Actor**
- `EMPLOYEE`: Colaborador
- `HR_ADMIN`: Administrador de RH
- `SUPER_ADMIN`: Super administrador

---

## 🔒 TABLA: PRIVACY_ACCEPTANCES

### **Propósito**
Registrar las aceptaciones del aviso de privacidad.

### **Campos**

| Campo | Tipo | Restricciones | Descripción | Ejemplo |
|-------|------|---------------|-------------|---------|
| `id` | VARCHAR(50) | PK, NOT NULL | ID único | `privacy-001` |
| `employee_id` | VARCHAR(50) | FK, NOT NULL | ID del empleado | `3619` |
| `dependent_id` | VARCHAR(50) | FK, NULLABLE | ID del dependiente | `3619-a01` |
| `acceptance_type` | VARCHAR(20) | NOT NULL, CHECK | Tipo de aceptación | `EMPLOYEE`, `DEPENDENT` |
| `privacy_version` | VARCHAR(10) | DEFAULT 'v1.0' | Versión del aviso | `v1.0`, `v1.1` |
| `accepted_at` | TIMESTAMP | DEFAULT NOW() | Cuándo aceptó | `2025-01-15 14:30:00` |
| `ip_address` | VARCHAR(45) | NOT NULL | IP de aceptación | `192.168.1.100` |
| `user_agent` | TEXT | NOT NULL | User agent | `Mozilla/5.0...` |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación | `2025-01-15 14:30:00` |

### **Reglas de Negocio**
- Obligatorio antes de crear/actualizar dependientes
- Se registra IP y user agent para trazabilidad
- Versión del aviso para futuras actualizaciones
- Una aceptación por empleado/dependiente

---

## 🔑 TABLA: USER_SESSIONS

### **Propósito**
Gestionar las sesiones de usuario autenticadas.

### **Campos**

| Campo | Tipo | Restricciones | Descripción | Ejemplo |
|-------|------|---------------|-------------|---------|
| `id` | VARCHAR(50) | PK, NOT NULL | ID único de sesión | `session-001` |
| `employee_id` | VARCHAR(50) | FK, NOT NULL | ID del empleado | `3619` |
| `session_token` | VARCHAR(255) | UNIQUE, NOT NULL | Token JWT | `eyJhbGciOiJIUzI1NiIs...` |
| `ip_address` | VARCHAR(45) | NOT NULL | IP de sesión | `192.168.1.100` |
| `user_agent` | TEXT | NULLABLE | User agent | `Mozilla/5.0...` |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Inicio de sesión | `2025-01-15 09:00:00` |
| `expires_at` | TIMESTAMP | NOT NULL | Expiración | `2025-01-16 09:00:00` |
| `last_activity` | TIMESTAMP | DEFAULT NOW() | Última actividad | `2025-01-15 14:30:00` |
| `is_active` | BOOLEAN | DEFAULT TRUE | Sesión activa | `true`, `false` |

### **Reglas de Negocio**
- Sesiones expiran en 24 horas por defecto
- Solo una sesión activa por empleado
- Se actualiza `last_activity` en cada request
- Se puede invalidar manualmente

---

## 👥 TABLA: ADMIN_USERS

### **Propósito**
Gestionar usuarios administrativos del sistema.

### **Campos**

| Campo | Tipo | Restricciones | Descripción | Ejemplo |
|-------|------|---------------|-------------|---------|
| `id` | VARCHAR(50) | PK, NOT NULL | ID único del admin | `admin-001` |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email del admin | `admin@siegfried.com.mx` |
| `role` | VARCHAR(50) | NOT NULL, CHECK | Rol del admin | `HR_ADMIN`, `SUPER_ADMIN` |
| `company_id` | VARCHAR(50) | FK, NULLABLE | ID de la compañía | `company-sr-001` |
| `otp_secret` | VARCHAR(255) | NULLABLE | Secret para 2FA | `JBSWY3DPEHPK3PXP` |
| `otp_enabled` | BOOLEAN | DEFAULT FALSE | 2FA habilitado | `true`, `false` |
| `last_login` | TIMESTAMP | NULLABLE | Último login | `2025-01-15 14:30:00` |
| `failed_attempts` | INTEGER | DEFAULT 0 | Intentos fallidos | `0`, `1`, `2` |
| `locked_until` | TIMESTAMP | NULLABLE | Bloqueado hasta | `2025-01-15 15:30:00` |
| `active` | BOOLEAN | DEFAULT TRUE | Usuario activo | `true`, `false` |
| `created_by` | VARCHAR(50) | NULLABLE | Quien creó | `super-admin-001` |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de creación | `2025-01-15 09:00:00` |

### **Roles**
- `HR_ADMIN`: Administrador de RH (solo su compañía)
- `SUPER_ADMIN`: Super administrador (todas las compañías)

---

## 📊 TABLA: REPORTS

### **Propósito**
Registrar los reportes generados en el sistema.

### **Campos**

| Campo | Tipo | Restricciones | Descripción | Ejemplo |
|-------|------|---------------|-------------|---------|
| `id` | VARCHAR(50) | PK, NOT NULL | ID único del reporte | `report-001` |
| `employee_id` | VARCHAR(50) | FK, NULLABLE | ID del empleado | `3619` |
| `report_type` | VARCHAR(50) | NOT NULL, CHECK | Tipo de reporte | `INSURER`, `PAYROLL_DEDUCTIONS` |
| `generated_at` | TIMESTAMP | DEFAULT NOW() | Cuándo se generó | `2025-01-15 14:30:00` |
| `generated_by` | VARCHAR(50) | NOT NULL | Quien lo generó | `admin-001` |
| `file_path` | VARCHAR(500) | NULLABLE | Ruta del archivo | `/reports/insurer-2025-01-15.xlsx` |
| `file_size` | INTEGER | NULLABLE | Tamaño del archivo | `1048576` |
| `google_drive_file_id` | VARCHAR(255) | NULLABLE | ID en Google Drive | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` |
| `google_drive_url` | VARCHAR(500) | NULLABLE | URL de Google Drive | `https://drive.google.com/...` |
| `status` | VARCHAR(20) | DEFAULT 'COMPLETED', CHECK | Estado del reporte | `GENERATING`, `COMPLETED`, `FAILED` |
| `parameters` | JSONB | NULLABLE | Parámetros del reporte | `{"company_id": "company-sr-001"}` |
| `error_message` | TEXT | NULLABLE | Mensaje de error | `Error al generar reporte` |

### **Tipos de Reporte**
- `INSURER`: Reporte para aseguradora
- `PAYROLL_DEDUCTIONS`: Reporte de deducciones de nómina

---

## ⚙️ TABLA: SYSTEM_CONFIG

### **Propósito**
Configuraciones del sistema que pueden ser modificadas.

### **Campos**

| Campo | Tipo | Restricciones | Descripción | Ejemplo |
|-------|------|---------------|-------------|---------|
| `key` | VARCHAR(100) | PK, NOT NULL | Clave de configuración | `max_dependents_per_employee` |
| `value` | TEXT | NOT NULL | Valor de configuración | `10` |
| `description` | TEXT | NULLABLE | Descripción | `Máximo número de dependientes por empleado` |
| `value_type` | VARCHAR(20) | DEFAULT 'STRING', CHECK | Tipo de valor | `STRING`, `NUMBER`, `BOOLEAN`, `JSON` |
| `updatable_by_role` | VARCHAR(50) | DEFAULT 'SUPER_ADMIN', CHECK | Rol que puede actualizar | `HR_ADMIN`, `SUPER_ADMIN` |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Fecha de actualización | `2025-01-15 14:30:00` |
| `updated_by` | VARCHAR(50) | NOT NULL | Quien actualizó | `admin-001` |

### **Configuraciones Iniciales**
```sql
INSERT INTO system_config (key, value, description, updated_by) VALUES
('max_dependents_per_employee', '10', 'Máximo número de dependientes por empleado', 'system'),
('max_file_size_mb', '5', 'Tamaño máximo de archivo en MB', 'system'),
('allowed_file_types', '["pdf","jpg","jpeg","png"]', 'Tipos de archivo permitidos', 'system'),
('session_timeout_hours', '24', 'Timeout de sesión en horas', 'system'),
('privacy_policy_version', 'v1.0', 'Versión actual del aviso de privacidad', 'system'),
('privacy_policy_url', 'https://sgmm.portalapps.mx/privacy-policy', 'URL del aviso de privacidad', 'system');
```

---

## 🔍 VISTAS PRINCIPALES

### **Vista: v_employees_consolidated**
**Propósito**: Vista consolidada para RH con información de empleados y dependientes.

**Campos**:
- `employee_id`, `employee_number`, `full_name`, `email`
- `company_id`, `company_name`, `employee_status`
- `total_dependents`, `active_dependents`, `inactive_dependents`
- `extra_dependents` (calculado: total - 1)
- `last_activity`, `created_at`, `updated_at`

### **Vista: v_insurer_report**
**Propósito**: Reporte para aseguradora con empleados y dependientes.

**Campos**:
- Empleado: `colaborador_id`, `apellido_paterno`, `apellido_materno`, `nombre`, `fecha_nacimiento`, `sexo`, `edad`
- Dependiente: `dependiente_compuesto_id`, `dep_nombre`, `dep_apellido_paterno`, `dep_apellido_materno`, `dep_fecha_nacimiento`, `dep_sexo`, `dep_edad`, `parentesco`

### **Vista: v_payroll_deductions**
**Propósito**: Reporte de deducciones de nómina para empleados con dependientes extra.

**Campos**:
- `colaborador_id`, `apellido_paterno`, `apellido_materno`, `nombre`, `correo_electronico`
- `total_dependientes`, `dependientes_extra`, `company_id`

---

## 📋 REGLAS DE NEGOCIO PRINCIPALES

### **Autenticación y Autorización**
1. **SAML**: Solo empleados con email corporativo pueden autenticarse
2. **Sesiones**: Máximo 24 horas de duración
3. **Roles**: EMPLOYEE, HR_ADMIN, SUPER_ADMIN
4. **Acceso**: Empleados solo ven sus propios datos

### **Gestión de Dependientes**
1. **Límite**: Máximo 10 dependientes por empleado
2. **Primer dependiente**: Gratuito (pago de la compañía)
3. **Dependientes extra**: Costo deducido de nómina
4. **Primera vez**: Upload obligatorio de acta de nacimiento
5. **Privacidad**: Aceptación obligatoria antes de guardar

### **Documentos**
1. **Tamaño máximo**: 5MB por archivo
2. **Tipos permitidos**: PDF, JPG, JPEG, PNG
3. **Almacenamiento**: Google Drive con estructura organizada
4. **ID compuesto**: `{employee_number}-{dependent_id}` para relación

### **Auditoría**
1. **Trazabilidad completa**: Todas las acciones se registran
2. **Información capturada**: Quién, qué, cuándo, dónde, cómo
3. **Retención**: Datos de auditoría no se eliminan
4. **Acceso**: Solo administradores pueden ver audit trails

### **Reportes**
1. **On-demand**: Se generan dinámicamente, no se almacenan
2. **Tipos**: Aseguradora y deducciones de nómina
3. **Filtros**: Por compañía, fecha, estado
4. **Exportación**: Excel, PDF, CSV

---

## 🚨 VALIDACIONES CRÍTICAS

### **Integridad de Datos**
- **Email único**: No puede haber emails duplicados
- **Employee number único**: Cada empleado tiene un número único
- **Dependent sequence único**: Por empleado, no puede repetirse
- **Foreign keys**: Todas las relaciones deben ser válidas

### **Seguridad**
- **Soft delete**: Nunca eliminación física de datos
- **Audit trail**: Todas las acciones se registran
- **Privacidad**: Aceptación obligatoria
- **Sesiones**: Timeout automático

### **Rendimiento**
- **Índices**: En campos de búsqueda frecuente
- **Consultas**: Optimizadas para reportes
- **Archivos**: Almacenamiento externo (Google Drive)

---

## 📝 NOTAS DE IMPLEMENTACIÓN

1. **Este diccionario es la fuente de verdad** para el desarrollo
2. **Cualquier cambio** debe reflejarse aquí primero
3. **Validaciones** deben implementarse según estas reglas
4. **Reportes** deben usar las vistas definidas
5. **Auditoría** es obligatoria para todas las operaciones CRUD

---

*Última actualización: 2025-01-15*
*Versión: 1.0*
*Responsable: Equipo de Desarrollo SGMM*
