# Diccionario de Datos - Sistema SGMM

## Arquitectura de Contenedores

### Servicios Docker
- **sgmm_postgres**: Base de datos principal con volumen persistente
- **sgmm_redis**: Cache y sesiones con volumen persistente  
- **sgmm_backend**: API Node.js con health checks
- **sgmm_frontend**: Nginx sirviendo React build
- **sgmm_migration**: Init container para migraciones DB

### Volúmenes Persistentes
- **postgres_data**: Datos de PostgreSQL (`/var/lib/postgresql/data`)
- **redis_data**: Datos de Redis (`/data`)
- **uploads_data**: Archivos subidos (`/app/uploads`)
- **logs_data**: Logs de aplicación (`/app/logs`)

### Red y Puertos
- **Red interna**: `sgmm_network` (bridge)
- **Puertos externos**: 3000 (API), 8080 (Frontend), 5432 (DB), 6379 (Redis)
- **Puertos internos**: Comunicación entre containers

### SOP de Reinicio Seguro
- **Orden recomendado**: Postgres → Redis → Backend → Frontend
- **Reinicio sin caída**:
  - Dev: `docker-compose -f docker-compose.dev.yml up -d --build frontend`
  - Prod: `docker-compose up -d --build frontend`
- **Evitar**: `docker-compose down` completo salvo mantenimiento; provoca `ERR_CONNECTION_REFUSED` temporal.
- **Health checks**:
  - API: `curl http://localhost:8080/api/health`
  - DB: `docker inspect -f '{{.State.Health.Status}}' sgmm_postgres*`
  - Redis: `docker inspect -f '{{.State.Health.Status}}' sgmm_redis*`

## Convenciones Generales

### Nomenclatura Base de Datos
- **Tablas**: `snake_case` en plural (employees, dependents)
- **Columnas**: `snake_case` (first_name, birth_date)
- **Claves primarias**: `id` (UUID)
- **Claves foráneas**: `{tabla_singular}_id` (employee_id, company_id)
- **Timestamps**: `created_at`, `updated_at`, `deleted_at`

### Paleta de Branding (por compañía)
- Máximo 4 colores por compañía para consistencia:
  - `primary_color` (UI principal)
  - `secondary_color` (UI secundaria)
  - `accent_color` (botones/links)
  - `neutral_color` (texto/bordes)
- Tipografías: `font_primary`, `font_secondary`
- Se aplican como CSS variables (`--color-primary`, `--color-secondary`, `--color-accent`, `--color-neutral`) y pueden editarse en `/admin/branding`.

### Nomenclatura Código
- **Servicios**: `PascalCase + Service` (EmployeeService)
- **Controladores**: `camelCase + Controller` (employeeController)
- **Repositorios**: `camelCase + Repository` (employeeRepository)
- **Modelos/Tipos**: `PascalCase` (Employee, Company)
- **Variables**: `camelCase` (employeeData, companyId)

## Entidades de Dominio

### Employee (Colaborador)
**Propósito**: Almacenar información personal y laboral de colaboradores
**Contexto**: Datos base para SGMM, sincronizados desde Google AD

| Campo | Tipo | Descripción | Origen |
|-------|------|-------------|---------|
| `id` | UUID | Identificador único del colaborador | Sistema |
| `google_id` | String | ID del directorio de Google (nullable) | Google AD |
| `employee_number` | String | Número de empleado único | Google AD |
| `email` | String | Correo electrónico corporativo | Google AD |
| `full_name` | String | Nombre completo para mostrar | Google AD |
| `first_name` | String | Nombre(s) - editable por usuario | Manual |
| `paternal_last_name` | String | Apellido paterno - editable | Manual |
| `maternal_last_name` | String | Apellido materno - editable | Manual |
| `birth_date` | Date | Fecha de nacimiento | Manual |
| `gender` | Enum | 'M' \| 'F' - Género | Manual |
| `hire_date` | Date | Fecha de contratación | Google AD |
| `company_id` | UUID | Referencia a compañía | Google AD |
| `department` | String | Departamento organizacional | Google AD |
| `position` | String | Puesto de trabajo | Google AD |
| `org_unit_path` | String | Ruta organizacional de Google | Google AD |
| `policy_number` | String | Número de póliza SGMM | Sistema |
| `status` | Enum | 'active' \| 'inactive' - Estado laboral | Google AD |
| `created_at` | Timestamp | Fecha de creación del registro | Sistema |
| `updated_at` | Timestamp | Última modificación | Sistema |

### Dependent (Dependiente)
**Propósito**: Almacenar información de dependientes para cobertura SGMM
**Contexto**: Familiares cubiertos por la póliza del colaborador

| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|--------------|
| `id` | UUID | Identificador único del dependiente | Sistema |
| `dependent_id` | String | Identificador visible por negocio | Único global; formato `employee_number-aNN` (ej. `3619-a01`) |
| `dependent_seq` | Integer | Secuencia por colaborador | Incremental por `employee_id`; no se recicla |
| `employee_id` | UUID | FK al colaborador titular | Required |
| `first_name` | String | Nombre(s) del dependiente | Required, min 2 chars |
| `paternal_last_name` | String | Apellido paterno | Required |
| `maternal_last_name` | String | Apellido materno | Optional |
| `birth_date` | Date | Fecha de nacimiento | Required, <= fecha actual |
| `gender` | Enum | 'M' \| 'F' - Género | Required |
| `relationship_type_id` | Integer | FK a tipo de relación | Required |
| `policy_start_date` | Date | Inicio de cobertura | Auto: hire_date o fecha alta |
| `policy_end_date` | Date | Fin de cobertura (nullable) | Set on soft delete |
| `deleted_at` | Timestamp | Baja lógica del dependiente | Set on soft delete |
| `status` | Enum | 'active' \| 'inactive' - Estado | Default: active |
| `created_at` | Timestamp | Fecha de alta | Sistema |
| `updated_at` | Timestamp | Última modificación | Sistema |

Notas y restricciones:
- `dependent_id` es único a nivel sistema; se genera con el `employee_number` + `-aNN`.
- `dependent_seq` es incremental por `employee_id`. Se garantiza índice compuesto `(employee_id, dependent_seq)`.
- Las bajas son lógicas: se setean `status = INACTIVE`, `policy_end_date` y `deleted_at`.

### Company (Compañía)
**Propósito**: Configuración multi-tenant con branding personalizable
**Contexto**: Separación de datos y personalización por empresa

| Campo | Tipo | Descripción | Uso |
|-------|------|-------------|-----|
| `id` | UUID | Identificador único de compañía | Sistema |
| `name` | String | Nombre comercial completo | Display, reportes |
| `code` | String | Código corto único (ej: "SR", "WP") | URLs, archivos |
| `logo_url` | String | URL del logo corporativo | Headers, PDFs |
| `favicon_url` | String | URL del favicon (opcional) | Browser tabs |
| `primary_color` | String | Color primario hex (#RRGGBB) | CSS variables |
| `secondary_color` | String | Color secundario hex | CSS variables |
| `accent_color` | String | Color de acento hex | Buttons, links |
| `neutral_color` | String | Color neutral hex | Text, borders |
| `font_primary` | String | Fuente principal (ej: "Arial") | Headings |
| `font_secondary` | String | Fuente secundaria | Body text |
| `custom_css` | Text | CSS personalizado adicional | Advanced styling |
| `active` | Boolean | Estado de la compañía | Filter queries |
| `brand_updated_at` | Timestamp | Última actualización de branding | Cache invalidation |
| `brand_updated_by` | UUID | Admin que modificó branding | Audit trail |
| `created_at` | Timestamp | Fecha de creación | Sistema |

### Document (Documento)
**Propósito**: Gestión de archivos adjuntos (actas de nacimiento)
**Contexto**: Tracking de documentos requeridos por aseguradora

| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|--------------|
| `id` | UUID | Identificador único del documento | Sistema |
| `employee_id` | UUID | FK al colaborador propietario | Required |
| `dependent_id` | UUID | FK al dependiente (nullable) | Null = doc del titular |
| `document_type` | Enum | 'birth_certificate' - Tipo de documento | Required |
| `original_filename` | String | Nombre original del archivo | Display purposes |
| `stored_filename` | String | Nombre en storage | File system reference |
| `file_path` | String | Ruta completa del archivo | Storage location |
| `file_size` | Integer | Tamaño en bytes | Validation, cleanup |
| `mime_type` | String | Tipo MIME (application/pdf) | Validation |
| `upload_ip` | String | IP de quien subió el archivo | Security audit |
| `uploaded_at` | Timestamp | Fecha de carga | Sistema |

### RelationshipType (Tipo Parentesco)
**Propósito**: Catálogo de tipos de relación familiar
**Contexto**: Validación y display de relaciones dependiente-titular

| Campo | Tipo | Descripción | Ejemplos |
|-------|------|-------------|----------|
| `id` | Integer | Identificador numérico secuencial | 1, 2, 3... |
| `name` | String | Nombre del parentesco | "Hijo", "Hija", "Cónyuge" |
| `display_order` | Integer | Orden de visualización | Sorting en selects |
| `active` | Boolean | Disponible para selección | Hide deprecated |

### AuditLog (Log de Auditoría)
**Propósito**: Rastro de cambios para compliance y debugging
**Contexto**: Tracking de todas las operaciones administrativas

| Campo | Tipo | Descripción | Uso |
|-------|------|-------------|-----|
| `id` | UUID | Identificador único del log | Sistema |
| `user_id` | String | ID del usuario que hizo el cambio | Employee ID o Admin email |
| `user_role` | Enum | Rol del usuario | 'EMPLOYEE' \| 'HR_ADMIN' \| 'SUPER_ADMIN' |
| `action` | Enum | Tipo de operación | 'CREATE' \| 'UPDATE' \| 'DELETE' |
| `table_name` | String | Tabla afectada | employees, dependents, etc. |
| `record_id` | String | ID del registro modificado | Para linking |
| `old_values` | JSON | Valores antes del cambio | Nullable en CREATE |
| `new_values` | JSON | Valores después del cambio | Objeto: `{ after: {...}, changes: [{ field, before, after }] }` |
| `ip_address` | String | IP de origen de la operación | Security tracking |
| `user_agent` | String | Browser/client información | Context |
| `timestamp` | Timestamp | Momento exacto de la operación | Sistema |

## Entidades de Sistema

### SystemConfig (Configuración Sistema)
**Propósito**: Configuraciones dinámicas del sistema
**Contexto**: Settings modificables sin redeployment

| Campo | Tipo | Descripción | Ejemplos |
|-------|------|-------------|----------|
| `key` | String | Clave única de configuración | 'renewal_deadline', 'max_file_size' |
| `value` | String | Valor de la configuración | '2024-11-30', '5242880' |
| `description` | String | Descripción legible | 'Fecha límite renovación SGMM' |
| `value_type` | Enum | Tipo del valor | 'string' \| 'number' \| 'boolean' \| 'date' |
| `updatable_by_role` | Enum | Rol mínimo para modificar | 'HR_ADMIN' \| 'SUPER_ADMIN' |
| `updated_at` | Timestamp | Última modificación | Cache invalidation |
| `updated_by` | String | Quien hizo el cambio | Audit |

Claves actuales relevantes:
- `max_dependents` (NUMBER): Límite de dependientes activos por colaborador (default 10).

### AdminUser (Usuario Administrativo)
**Propósito**: Gestión de usuarios con roles administrativos
**Contexto**: Control de acceso a paneles HR y Super Admin

| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|--------------|
| `id` | UUID | Identificador único | Sistema |
| `email` | String | Email corporativo único | Valid email format |
| `role` | Enum | 'HR_ADMIN' \| 'SUPER_ADMIN' | Required |
| `company_id` | UUID | FK a compañía (nullable) | Null = SUPER_ADMIN |
| `otp_secret` | String | Secreto para 2FA (encrypted) | Security |
| `otp_enabled` | Boolean | Si tiene 2FA activo | Default: false |
| `last_login` | Timestamp | Último acceso exitoso | Monitoring |
| `failed_attempts` | Integer | Intentos fallidos consecutivos | Security |
| `locked_until` | Timestamp | Bloqueo temporal (nullable) | Security |
| `active` | Boolean | Estado del usuario | Default: true |
| `created_by` | UUID | Admin que creó la cuenta | Audit |
| `created_at` | Timestamp | Fecha de creación | Sistema |

## Entidades de Comunicaciones

### EmailTemplate (Plantilla Email)
**Propósito**: Templates reutilizables para comunicaciones
**Contexto**: Sistema de notificaciones y campañas HR

| Campo | Tipo | Descripción | Variables |
|-------|------|-------------|-----------|
| `id` | UUID | Identificador único | Sistema |
| `company_id` | UUID | FK a compañía | Multi-tenant |
| `name` | String | Nombre identificativo | 'Recordatorio renovación' |
| `category` | Enum | Categoría del template | 'reminder' \| 'notification' \| 'campaign' |
| `subject` | String | Asunto del correo | Acepta variables {{VAR}} |
| `body_html` | Text | Cuerpo en HTML | Template con variables |
| `body_text` | Text | Cuerpo en texto plano | Fallback |
| `variables` | JSON | Variables disponibles | ['FULL_NAME', 'DEADLINE'] |
| `active` | Boolean | Disponible para uso | Default: true |
| `created_by` | UUID | Admin creador | Audit |
| `created_at` | Timestamp | Fecha de creación | Sistema |

### EmailCampaign (Campaña Email)
**Propósito**: Envíos masivos de correo con targeting
**Contexto**: Comunicaciones dirigidas de HR

| Campo | Tipo | Descripción | Uso |
|-------|------|-------------|-----|
| `id` | UUID | Identificador único | Sistema |
| `company_id` | UUID | FK a compañía | Scope |
| `template_id` | UUID | FK a plantilla usada | Reference |
| `name` | String | Nombre de la campaña | 'Renovación Q4 2024' |
| `recipient_criteria` | JSON | Filtros de destinatarios | Query conditions |
| `scheduled_at` | Timestamp | Cuándo enviar (nullable) | Null = inmediato |
| `sent_at` | Timestamp | Cuándo se envió (nullable) | Execution time |
| `status` | Enum | Estado de la campaña | 'draft' \| 'scheduled' \| 'sent' \| 'failed' |
| `total_recipients` | Integer | Cantidad de destinatarios | Stats |
| `emails_sent` | Integer | Correos enviados exitosamente | Stats |
| `emails_failed` | Integer | Correos fallidos | Stats |
| `created_by` | UUID | HR que creó la campaña | Audit |
| `created_at` | Timestamp | Fecha de creación | Sistema |

## Entidades PDF

### PDFTemplate (Plantilla PDF)
**Propósito**: Configuración de templates PDF personalizables
**Contexto**: Reportes y formatos con branding corporativo

| Campo | Tipo | Descripción | Configuración |
|-------|------|-------------|---------------|
| `id` | UUID | Identificador único | Sistema |
| `company_id` | UUID | FK a compañía | Branding context |
| `template_type` | Enum | Tipo de template | 'employee_report' \| 'renewal_form' |
| `name` | String | Nombre descriptivo | 'Formato renovación SR' |
| `config_json` | JSON | Campos y layout activos | Customizable by HR |
| `custom_css` | Text | CSS personalizado adicional | Advanced styling |
| `header_config` | JSON | Configuración de header | Logo, título, fecha |
| `footer_config` | JSON | Configuración de footer | Company info, page number |
| `version` | Integer | Versión del template | Versioning |
| `active` | Boolean | Template disponible | Default: true |
| `created_by` | UUID | Admin creador | Audit |
| `created_at` | Timestamp | Fecha de creación | Sistema |

## Tipos y Enums

### EmployeeStatus
```typescript
enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
```

### DependentStatus
```typescript
enum DependentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
```

### UserRole
```typescript
enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  HR_ADMIN = 'HR_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}
```

### DocumentType
```typescript
enum DocumentType {
  BIRTH_CERTIFICATE = 'birth_certificate'
  // Extensible para otros tipos
}
```

### AuditAction
```typescript
enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT'
}
```

### EmailCampaignStatus
```typescript
enum EmailCampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}
```

## Patrones de Nombres

### Servicios
- `EmployeeService` - Gestión de colaboradores
- `DependentService` - Gestión de dependientes
- `DocumentService` - Manejo de archivos
- `BrandingService` - Configuración visual
- `EmailService` - Envío de correos
- `PDFService` - Generación de PDFs
- `AuditService` - Logging de cambios
- `AuthService` - Autenticación

### Repositorios
- `employeeRepository` - Data access para employees
- `companyRepository` - Data access para companies
- `documentRepository` - Data access para documents

### Controladores
- `employeeController` - Endpoints de colaborador
- `hrController` - Endpoints de HR Admin
- `adminController` - Endpoints de Super Admin
- `publicController` - Endpoints públicos (login, health)

### Utilidades
- `pdf-generator.util` - Generación de PDFs
- `email-sender.util` - Envío de emails
- `file-uploader.util` - Manejo de uploads
- `date-formatter.util` - Formateo de fechas
- `color-validator.util` - Validación de colores

### Constantes
- `API_ROUTES` - Rutas de endpoints
- `ERROR_CODES` - Códigos de error
- `DEFAULT_COLORS` - Paleta por defecto
- `FILE_LIMITS` - Límites de archivos
- `EMAIL_TEMPLATES` - Templates base

## Endpoints actuales (REST)

### Público/Salud
- GET `/api/health`

### Colaborador
- GET `/api/employees/:id`
- PUT `/api/employees/:id`
- GET `/api/collaborator/:id/summary`

### Dependientes
- GET `/api/employees/:employeeId/dependents` (activos)
- GET `/api/employees/:employeeId/dependents/inactive` (histórico)
- POST `/api/employees/:employeeId/dependents` (alta; valida `birth_date <= hoy`)
- GET `/api/dependents/:id`
- PUT `/api/dependents/:id` (edición; valida `birth_date <= hoy`)
- DELETE `/api/dependents/:id` (baja lógica; set `policy_end_date`, `deleted_at`)
- POST `/api/dependents/:id/restore` (restaurar; respeta `dependent_id`/`dependent_seq`)

### Catálogos
- GET `/api/relationship-types`
- GET `/api/companies`

### Auditoría
- GET `/api/admin/audit` (incluye `new_values.changes`)

### Admin (Branding)
- GET `/api/companies` (listado)
- PUT `/api/companies/:id/branding` (actualizar `primary_color`, `secondary_color`, `accent_color`, `neutral_color`, `font_primary`, `font_secondary`)

## Trazabilidad Vista ↔ Endpoints ↔ Entidades

| Vista/Sección | Acción principal | Endpoints | Entidades | Eventos de auditoría esperados |
|---|---|---|---|---|
| `/panel` (RH) | Cargar compañías y buscar colaborador | GET `/api/companies` · GET `/api/employees/search?query&companyId` | Company, Employee | N/A (lectura) |
| `/panel` (RH) | Ver detalle colaborador | GET `/api/collaborator/:id/summary` | Employee, Dependent | N/A (lectura) |
| `/panel` (RH) | Baja dependiente | DELETE `/api/dependents/:id` | Dependent, AuditLog | DELETE dependent: `status=INACTIVE`, set `policy_end_date`, `deleted_at` |
| `/panel` (RH) | Restaurar dependiente | POST `/api/dependents/:id/restore` | Dependent, AuditLog | UPDATE dependent: `status=ACTIVE`, `deleted_at=null` |
| `/panel` (RH) | Editar dependiente | GET `/api/dependents/:id` · PUT `/api/dependents/:id` | Dependent, AuditLog | UPDATE dependent: diffs por campo en `new_values.changes` |
| `/collaborator/:id` | Ver tablero principal | GET `/api/collaborator/:id/summary` | Employee, Dependent | N/A (lectura) |
| `/collaborator/:id` | Descargar formato | GET `/api/pdf/renewal-form?employeeId=:id` | (Generación PDF) | N/A (generación; auditar si se requiere) |
| `/collaborator/:id/edit` | Editar colaborador | GET `/api/employees/:id` · PUT `/api/employees/:id` | Employee, AuditLog | UPDATE employee: diffs por campo en `new_values.changes` |
| `/dependents/new/:employeeId` | Alta dependiente | POST `/api/employees/:employeeId/dependents` | Dependent, RelationshipType, AuditLog | CREATE dependent: genera `dependent_id`/`dependent_seq` |
| `/dependents/:id/edit` | Editar dependiente | GET `/api/dependents/:id` · PUT `/api/dependents/:id` | Dependent, AuditLog | UPDATE dependent: diffs por campo |
| Formularios (selects) | Obtener parentescos | GET `/api/relationship-types` | RelationshipType | N/A (lectura) |
| `/admin/audit` | Auditoría administrativa | GET `/api/admin/audit` | AuditLog | N/A (lectura) |
| `/admin/branding` | Personalizar branding compañía | GET `/api/companies` · PUT `/api/companies/:id/branding` | Company | UPDATE company: cambios de `*_color`/fuentes |