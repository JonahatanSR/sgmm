# 🗄️ ESQUEMA COMPLETO DE BASE DE DATOS - SGMM

## 📊 TABLAS PRINCIPALES

### 1. **EMPLOYEES (Colaboradores)**
```sql
CREATE TABLE employees (
  id VARCHAR(50) PRIMARY KEY,                    -- employee_number (ej: "3619")
  google_id VARCHAR(255) UNIQUE,                 -- ID de Google AD
  email VARCHAR(255) UNIQUE NOT NULL,            -- Email corporativo
  full_name VARCHAR(255) NOT NULL,               -- Nombre completo
  first_name VARCHAR(100),                       -- Nombre(s)
  paternal_last_name VARCHAR(100),               -- Apellido paterno
  maternal_last_name VARCHAR(100),               -- Apellido materno
  birth_date DATE,                               -- Fecha de nacimiento
  gender CHAR(1) CHECK (gender IN ('M', 'F')),  -- Sexo
  hire_date DATE NOT NULL,                       -- Fecha de ingreso
  company_id VARCHAR(50) NOT NULL,               -- FK a companies
  department VARCHAR(100),                       -- Departamento
  position VARCHAR(100),                         -- Posición
  policy_number VARCHAR(100),                    -- Número de póliza
  status VARCHAR(20) DEFAULT 'ACTIVE',           -- ACTIVE/INACTIVE
  last_login TIMESTAMP,                          -- Último login
  login_count INTEGER DEFAULT 0,                 -- Contador de logins
  last_ip_address VARCHAR(45),                   -- Última IP
  last_user_agent TEXT,                          -- Último user agent
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,                          -- Soft delete
  deleted_by VARCHAR(50)                         -- Quien eliminó
);

-- Índices
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_deleted ON employees(deleted_at);
```

### 2. **DEPENDENTS (Dependientes)**
```sql
CREATE TABLE dependents (
  id VARCHAR(50) PRIMARY KEY,                    -- dependent_id (ej: "3619-a01")
  dependent_seq INTEGER NOT NULL,                -- Secuencia (1, 2, 3...)
  employee_id VARCHAR(50) NOT NULL,              -- FK a employees
  first_name VARCHAR(100) NOT NULL,              -- Nombre(s)
  paternal_last_name VARCHAR(100) NOT NULL,      -- Apellido paterno
  maternal_last_name VARCHAR(100),               -- Apellido materno
  birth_date DATE NOT NULL,                      -- Fecha de nacimiento
  gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')), -- Sexo
  relationship_type_id INTEGER NOT NULL,         -- FK a relationship_types
  policy_start_date DATE NOT NULL,               -- Inicio de póliza
  policy_end_date DATE,                          -- Fin de póliza (baja)
  status VARCHAR(20) DEFAULT 'ACTIVE',           -- ACTIVE/INACTIVE
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,                          -- Soft delete
  deleted_by VARCHAR(50),                        -- Quien eliminó
  created_by VARCHAR(50) NOT NULL,               -- Quien creó
  
  -- Constraints
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (relationship_type_id) REFERENCES relationship_types(id),
  UNIQUE(employee_id, dependent_seq)
);

-- Índices
CREATE INDEX idx_dependents_employee ON dependents(employee_id);
CREATE INDEX idx_dependents_status ON dependents(status);
CREATE INDEX idx_dependents_relationship ON dependents(relationship_type_id);
CREATE INDEX idx_dependents_deleted ON dependents(deleted_at);
```

### 3. **COMPANIES (Compañías)**
```sql
CREATE TABLE companies (
  id VARCHAR(50) PRIMARY KEY,                    -- company_id (ej: "company-sr-001")
  name VARCHAR(255) NOT NULL,                    -- Nombre de la compañía
  code VARCHAR(10) UNIQUE NOT NULL,              -- Código (SR, WP)
  logo_url VARCHAR(500),                         -- URL del logo
  favicon_url VARCHAR(500),                      -- URL del favicon
  primary_color VARCHAR(7) DEFAULT '#1f2937',    -- Color primario
  secondary_color VARCHAR(7) DEFAULT '#374151',  -- Color secundario
  accent_color VARCHAR(7) DEFAULT '#3b82f6',     -- Color de acento
  neutral_color VARCHAR(7) DEFAULT '#6b7280',    -- Color neutro
  font_primary VARCHAR(50) DEFAULT 'Arial',      -- Fuente primaria
  font_secondary VARCHAR(50) DEFAULT 'Arial',    -- Fuente secundaria
  custom_css TEXT,                               -- CSS personalizado
  active BOOLEAN DEFAULT TRUE,                   -- Activa
  brand_updated_at TIMESTAMP,
  brand_updated_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,                          -- Soft delete
  deleted_by VARCHAR(50)
);

-- Índices
CREATE INDEX idx_companies_code ON companies(code);
CREATE INDEX idx_companies_active ON companies(active);
```

### 4. **RELATIONSHIP_TYPES (Tipos de Parentesco)**
```sql
CREATE TABLE relationship_types (
  id SERIAL PRIMARY KEY,                         -- Auto-increment
  name VARCHAR(100) UNIQUE NOT NULL,             -- Nombre del parentesco
  display_order INTEGER DEFAULT 0,               -- Orden de visualización
  active BOOLEAN DEFAULT TRUE,                   -- Activo
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Datos iniciales
INSERT INTO relationship_types (name, display_order) VALUES
('Hijo', 1),
('Hija', 2),
('Cónyuge', 3),
('Concubino', 4),
('Concubina', 5),
('Padre', 6),
('Madre', 7);
```

## 🔐 AUDIT TRAIL Y PRIVACIDAD

### 5. **AUDIT_TRAILS (Auditoría)**
```sql
CREATE TABLE audit_trails (
  id VARCHAR(50) PRIMARY KEY,                    -- CUID
  employee_id VARCHAR(50) NOT NULL,              -- FK a employees
  dependent_id VARCHAR(50),                      -- FK a dependents (opcional)
  action VARCHAR(50) NOT NULL,                   -- CREATE, UPDATE, DELETE, LOGIN, etc.
  table_name VARCHAR(50) NOT NULL,               -- employees, dependents, etc.
  record_id VARCHAR(50) NOT NULL,                -- ID del registro afectado
  old_values JSONB,                              -- Valores anteriores
  new_values JSONB,                              -- Valores nuevos
  actor_id VARCHAR(50) NOT NULL,                 -- Quien hizo la acción
  actor_role VARCHAR(50) NOT NULL,               -- EMPLOYEE, HR_ADMIN, SUPER_ADMIN
  actor_email VARCHAR(255),                      -- Email del actor
  ip_address VARCHAR(45) NOT NULL,               -- IP de la acción
  user_agent TEXT,                               -- User agent
  timestamp TIMESTAMP DEFAULT NOW(),             -- Cuándo ocurrió
  
  -- Constraints
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (dependent_id) REFERENCES dependents(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_audit_employee ON audit_trails(employee_id);
CREATE INDEX idx_audit_dependent ON audit_trails(dependent_id);
CREATE INDEX idx_audit_action ON audit_trails(action);
CREATE INDEX idx_audit_table ON audit_trails(table_name);
CREATE INDEX idx_audit_timestamp ON audit_trails(timestamp);
CREATE INDEX idx_audit_actor ON audit_trails(actor_id);
```

### 6. **PRIVACY_ACCEPTANCES (Aceptaciones de Privacidad)**
```sql
CREATE TABLE privacy_acceptances (
  id VARCHAR(50) PRIMARY KEY,                    -- CUID
  employee_id VARCHAR(50) NOT NULL,              -- FK a employees
  dependent_id VARCHAR(50),                      -- FK a dependents (opcional)
  acceptance_type VARCHAR(20) NOT NULL,          -- EMPLOYEE o DEPENDENT
  privacy_version VARCHAR(10) DEFAULT 'v1.0',   -- Versión del aviso
  accepted_at TIMESTAMP DEFAULT NOW(),           -- Cuándo aceptó
  ip_address VARCHAR(45) NOT NULL,               -- IP de aceptación
  user_agent TEXT NOT NULL,                      -- User agent
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (dependent_id) REFERENCES dependents(id) ON DELETE CASCADE,
  CHECK (acceptance_type IN ('EMPLOYEE', 'DEPENDENT'))
);

-- Índices
CREATE INDEX idx_privacy_employee ON privacy_acceptances(employee_id);
CREATE INDEX idx_privacy_dependent ON privacy_acceptances(dependent_id);
CREATE INDEX idx_privacy_type ON privacy_acceptances(acceptance_type);
CREATE INDEX idx_privacy_version ON privacy_acceptances(privacy_version);
```

## 📁 GESTIÓN DE ARCHIVOS

### 7. **DOCUMENTS (Documentos)**
```sql
CREATE TABLE documents (
  id VARCHAR(50) PRIMARY KEY,                    -- CUID
  employee_id VARCHAR(50) NOT NULL,              -- FK a employees
  dependent_id VARCHAR(50),                      -- FK a dependents (opcional)
  document_type VARCHAR(50) NOT NULL,            -- BIRTH_CERTIFICATE, etc.
  original_filename VARCHAR(255) NOT NULL,       -- Nombre original
  stored_filename VARCHAR(255) NOT NULL,         -- Nombre en storage
  file_path VARCHAR(500) NOT NULL,               -- Ruta en Google Drive
  file_size INTEGER NOT NULL,                    -- Tamaño en bytes
  mime_type VARCHAR(100) NOT NULL,               -- Tipo MIME
  google_drive_file_id VARCHAR(255),             -- ID en Google Drive
  google_drive_url VARCHAR(500),                 -- URL de Google Drive
  upload_ip VARCHAR(45) NOT NULL,                -- IP de subida
  uploaded_by VARCHAR(50) NOT NULL,              -- Quien subió
  uploaded_at TIMESTAMP DEFAULT NOW(),           -- Cuándo se subió
  is_first_time BOOLEAN DEFAULT FALSE,           -- Primera vez del dependiente
  
  -- Constraints
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (dependent_id) REFERENCES dependents(id) ON DELETE CASCADE,
  CHECK (file_size <= 5242880),                  -- Máx 5MB
  CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png'))
);

-- Índices
CREATE INDEX idx_documents_employee ON documents(employee_id);
CREATE INDEX idx_documents_dependent ON documents(dependent_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_drive_id ON documents(google_drive_file_id);
```

## 🔑 SISTEMA DE AUTENTICACIÓN

### 8. **USER_SESSIONS (Sesiones de Usuario)**
```sql
CREATE TABLE user_sessions (
  id VARCHAR(50) PRIMARY KEY,                    -- CUID
  employee_id VARCHAR(50) NOT NULL,              -- FK a employees
  session_token VARCHAR(255) UNIQUE NOT NULL,    -- Token JWT
  ip_address VARCHAR(45) NOT NULL,               -- IP de sesión
  user_agent TEXT,                               -- User agent
  created_at TIMESTAMP DEFAULT NOW(),            -- Inicio de sesión
  expires_at TIMESTAMP NOT NULL,                 -- Expiración
  last_activity TIMESTAMP DEFAULT NOW(),         -- Última actividad
  is_active BOOLEAN DEFAULT TRUE,                -- Sesión activa
  
  -- Constraints
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_sessions_employee ON user_sessions(employee_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_sessions_active ON user_sessions(is_active);
```

### 9. **ADMIN_USERS (Usuarios Administrativos)**
```sql
CREATE TABLE admin_users (
  id VARCHAR(50) PRIMARY KEY,                    -- CUID
  email VARCHAR(255) UNIQUE NOT NULL,            -- Email del admin
  role VARCHAR(50) NOT NULL,                     -- HR_ADMIN, SUPER_ADMIN
  company_id VARCHAR(50),                        -- FK a companies (opcional)
  otp_secret VARCHAR(255),                       -- Secret para 2FA
  otp_enabled BOOLEAN DEFAULT FALSE,             -- 2FA habilitado
  last_login TIMESTAMP,                          -- Último login
  failed_attempts INTEGER DEFAULT 0,             -- Intentos fallidos
  locked_until TIMESTAMP,                        -- Bloqueado hasta
  active BOOLEAN DEFAULT TRUE,                   -- Usuario activo
  created_by VARCHAR(50),                        -- Quien creó el usuario
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  CHECK (role IN ('HR_ADMIN', 'SUPER_ADMIN'))
);

-- Índices
CREATE INDEX idx_admin_email ON admin_users(email);
CREATE INDEX idx_admin_role ON admin_users(role);
CREATE INDEX idx_admin_company ON admin_users(company_id);
```

## 📊 REPORTES Y CONFIGURACIÓN

### 10. **REPORTS (Reportes Generados)**
```sql
CREATE TABLE reports (
  id VARCHAR(50) PRIMARY KEY,                    -- CUID
  employee_id VARCHAR(50),                       -- FK a employees (opcional)
  report_type VARCHAR(50) NOT NULL,              -- INSURER, PAYROLL_DEDUCTIONS
  generated_at TIMESTAMP DEFAULT NOW(),          -- Cuándo se generó
  generated_by VARCHAR(50) NOT NULL,             -- Quien lo generó
  file_path VARCHAR(500),                        -- Ruta del archivo
  file_size INTEGER,                             -- Tamaño del archivo
  google_drive_file_id VARCHAR(255),             -- ID en Google Drive
  google_drive_url VARCHAR(500),                 -- URL de Google Drive
  status VARCHAR(20) DEFAULT 'COMPLETED',        -- GENERATING, COMPLETED, FAILED
  parameters JSONB,                              -- Parámetros del reporte
  error_message TEXT,                            -- Mensaje de error si falló
  
  -- Constraints
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CHECK (report_type IN ('INSURER', 'PAYROLL_DEDUCTIONS')),
  CHECK (status IN ('GENERATING', 'COMPLETED', 'FAILED'))
);

-- Índices
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_generated_at ON reports(generated_at);
```

### 11. **SYSTEM_CONFIG (Configuración del Sistema)**
```sql
CREATE TABLE system_config (
  key VARCHAR(100) PRIMARY KEY,                  -- Clave de configuración
  value TEXT NOT NULL,                           -- Valor
  description TEXT,                              -- Descripción
  value_type VARCHAR(20) DEFAULT 'STRING',       -- STRING, NUMBER, BOOLEAN, JSON
  updatable_by_role VARCHAR(50) DEFAULT 'SUPER_ADMIN', -- Rol que puede actualizar
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(50) NOT NULL,               -- Quien actualizó
  
  -- Constraints
  CHECK (value_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON')),
  CHECK (updatable_by_role IN ('HR_ADMIN', 'SUPER_ADMIN'))
);

-- Configuraciones iniciales
INSERT INTO system_config (key, value, description, updated_by) VALUES
('max_dependents_per_employee', '10', 'Máximo número de dependientes por empleado', 'system'),
('max_file_size_mb', '5', 'Tamaño máximo de archivo en MB', 'system'),
('allowed_file_types', '["pdf","jpg","jpeg","png"]', 'Tipos de archivo permitidos', 'system'),
('session_timeout_hours', '24', 'Timeout de sesión en horas', 'system'),
('privacy_policy_version', 'v1.0', 'Versión actual del aviso de privacidad', 'system'),
('privacy_policy_url', 'https://sgmm.portalapps.mx/privacy-policy', 'URL del aviso de privacidad', 'system');
```

## 🔗 VISTAS Y FUNCIONES

### Vista para RH - Colaboradores Consolidados
```sql
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
  MAX(at.timestamp) as last_activity,
  e.created_at,
  e.updated_at
FROM employees e
LEFT JOIN companies c ON e.company_id = c.id
LEFT JOIN dependents d ON e.id = d.employee_id
LEFT JOIN audit_trails at ON e.id = at.employee_id
WHERE e.deleted_at IS NULL
GROUP BY e.id, e.employee_number, e.full_name, e.email, e.company_id, c.name, e.status, e.deleted_at, e.created_at, e.updated_at;
```

### Vista para Reporte de Aseguradora
```sql
CREATE VIEW v_insurer_report AS
SELECT 
  e.employee_number as colaborador_id,
  e.paternal_last_name as apellido_paterno,
  e.maternal_last_name as apellido_materno,
  e.first_name as nombre,
  e.birth_date as fecha_nacimiento,
  e.gender as sexo,
  EXTRACT(YEAR FROM AGE(e.birth_date)) as edad,
  CONCAT(e.employee_number, '-', d.id) as dependiente_compuesto_id,
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

### Vista para Reporte de Deducciones de Nómina
```sql
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

## 🎯 RELACIONES PRINCIPALES

```
COMPANIES (1) ←→ (N) EMPLOYEES
EMPLOYEES (1) ←→ (N) DEPENDENTS
DEPENDENTS (N) ←→ (1) RELATIONSHIP_TYPES
EMPLOYEES (1) ←→ (N) AUDIT_TRAILS
DEPENDENTS (1) ←→ (N) AUDIT_TRAILS
EMPLOYEES (1) ←→ (N) PRIVACY_ACCEPTANCES
DEPENDENTS (1) ←→ (N) PRIVACY_ACCEPTANCES
EMPLOYEES (1) ←→ (N) DOCUMENTS
DEPENDENTS (1) ←→ (N) DOCUMENTS
EMPLOYEES (1) ←→ (N) USER_SESSIONS
COMPANIES (1) ←→ (N) ADMIN_USERS
EMPLOYEES (1) ←→ (N) REPORTS
```

## 📝 NOTAS IMPORTANTES

1. **Soft Delete**: Todas las tablas principales tienen `deleted_at` para eliminación lógica
2. **Audit Trail**: Todas las acciones se registran en `audit_trails`
3. **Privacidad**: Cada dependiente requiere aceptación de aviso de privacidad
4. **Archivos**: Se almacenan en Google Drive con relación por ID compuesto
5. **Reportes**: Se generan on-demand y se pueden almacenar en Google Drive
6. **Seguridad**: Todas las acciones requieren autenticación y autorización
7. **Trazabilidad**: Cada registro tiene `created_by`, `updated_at`, etc.
