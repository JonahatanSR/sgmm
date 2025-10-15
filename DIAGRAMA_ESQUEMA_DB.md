# Diagrama del Esquema de Base de Datos - SGMM

## 📊 Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    COMPANIES                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id (PK) │ name │ code │ logo_url │ favicon_url │ colors │ fonts │ css │ active │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   EMPLOYEES                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id(PK) │ google_id │ employee_number │ email │ full_name │ first_name │         │
│ paternal_last_name │ maternal_last_name │ birth_date │ gender │ hire_date │     │
│ company_id(FK) │ department │ position │ org_unit_path │ policy_number │        │
│ status │ last_login │ login_count │ last_ip_address │ last_user_agent │        │
│ created_at │ updated_at                                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                        ┌───────────┼───────────┐
                        │ 1:N       │ 1:N       │ 1:N
                        ▼           ▼           ▼
        ┌─────────────────────┐ ┌─────────────┐ ┌─────────────────────┐
        │     DEPENDENTS      │ │  DOCUMENTS  │ │    AUDIT_LOGS       │
        ├─────────────────────┤ ├─────────────┤ ├─────────────────────┤
        │ id(PK) │ dependent_id│ │ id(PK) │    │ │ id(PK) │ user_id(FK)│
        │ dependent_seq │     │ │ employee_id │ │ user_role │ action   │
        │ employee_id(FK) │   │ │ dependent_id│ │ table_name │ record_id│
        │ first_name │        │ │ document_type│ │ old_values │ new_values│
        │ paternal_last_name │ │ original_filename│ │ ip_address │ user_agent│
        │ maternal_last_name │ │ stored_filename │ │ timestamp          │
        │ birth_date │ gender │ │ file_path │     └─────────────────────┘
        │ relationship_type_id│ │ file_size │
        │ policy_start_date │ │ mime_type │
        │ policy_end_date │   │ upload_ip │
        │ deleted_at │ status │ uploaded_at │
        │ created_at │ updated_at │           │
        └─────────────────────┘ └─────────────┘
                    │
                    │ 1:N
                    ▼
        ┌─────────────────────┐
        │ RELATIONSHIP_TYPES  │
        ├─────────────────────┤
        │ id(PK) │ name │     │
        │ display_order │     │
        │ active                │
        └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                               PRIVACY & SESSIONS                               │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PRIVACY_ACCEPTANCES                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id(PK) │ employee_id(FK) │ dependent_id(FK) │ acceptance_type │ privacy_version │
│ accepted_at │ ip_address │ user_agent │ created_at                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ N:1
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 EMPLOYEES                                      │
│                         (relación ya mostrada arriba)                          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                USER_SESSIONS                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id(PK) │ employee_id(FK) │ session_token │ ip_address │ user_agent │          │
│ created_at │ expires_at │ last_activity │ is_active                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ N:1
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 EMPLOYEES                                      │
│                         (relación ya mostrada arriba)                          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ADMINISTRATION TABLES                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                ADMIN_USERS                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id(PK) │ email │ role │ company_id(FK) │ otp_secret │ otp_enabled │           │
│ last_login │ failed_attempts │ locked_until │ active │ created_by │ created_at │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ N:1
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 COMPANIES                                      │
│                         (relación ya mostrada arriba)                          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                               SYSTEM_CONFIG                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│ key(PK) │ value │ description │ value_type │ updatable_by_role │ updated_at │   │
│ updated_by                                                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              COMMUNICATION TABLES                              │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EMAIL_TEMPLATES                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id(PK) │ company_id(FK) │ name │ category │ subject │ body_html │ body_text │   │
│ variables │ active │ created_by │ created_at                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EMAIL_CAMPAIGNS                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id(PK) │ company_id(FK) │ template_id(FK) │ name │ recipient_criteria │        │
│ scheduled_at │ sent_at │ status │ total_recipients │ emails_sent │           │
│ emails_failed │ created_by │ created_at                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                               PDF_TEMPLATES                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id(PK) │ company_id(FK) │ template_type │ name │ config_json │ custom_css │     │
│ header_config │ footer_config │ version │ active │ created_by │ created_at     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📋 Análisis de Normalización

### ✅ NORMALIZACIÓN CORRECTA (3NF - Tercera Forma Normal)

#### **1. Primera Forma Normal (1NF) ✅**
- ✅ Todos los campos contienen valores atómicos
- ✅ No hay grupos repetitivos
- ✅ Cada tabla tiene una clave primaria única

#### **2. Segunda Forma Normal (2NF) ✅**
- ✅ Todos los atributos dependen completamente de la clave primaria
- ✅ No hay dependencias parciales
- ✅ Ejemplo: `relationship_types` separado de `dependents`

#### **3. Tercera Forma Normal (3NF) ✅**
- ✅ No hay dependencias transitivas
- ✅ Ejemplo: `companies` separado de `employees`
- ✅ Datos normalizados correctamente

### 🎯 RELACIONES BIEN DISEÑADAS

#### **Relaciones 1:N (Uno a Muchos) ✅**
- `companies` → `employees` (1 empresa, muchos empleados)
- `employees` → `dependents` (1 empleado, muchos dependientes)
- `employees` → `documents` (1 empleado, muchos documentos)
- `employees` → `audit_logs` (1 empleado, muchos logs)
- `employees` → `privacy_acceptances` (1 empleado, muchas aceptaciones)
- `employees` → `user_sessions` (1 empleado, muchas sesiones)

#### **Relaciones N:1 (Muchos a Uno) ✅**
- `dependents` → `relationship_types` (muchos dependientes, 1 tipo)
- `dependents` → `documents` (muchos documentos pueden ser de dependientes)

#### **Claves Foráneas Correctas ✅**
- ✅ Todas las relaciones tienen claves foráneas apropiadas
- ✅ Cascada configurada correctamente (ON DELETE CASCADE)
- ✅ Índices en claves foráneas para rendimiento

### 🔧 CAMPOS DE TRAZABILIDAD ✅

#### **Auditoría Completa:**
- ✅ `created_at`, `updated_at` en todas las tablas principales
- ✅ `audit_logs` para cambios de datos
- ✅ `privacy_acceptances` para cumplimiento legal
- ✅ `user_sessions` para seguridad
- ✅ Campos de login en `employees`

#### **Soft Delete:**
- ✅ `deleted_at` en `dependents` para eliminación lógica
- ✅ `status` fields para estados activos/inactivos

### 📊 ÍNDICES OPTIMIZADOS ✅

#### **Índices de Rendimiento:**
- ✅ Claves primarias (automáticas)
- ✅ Claves foráneas
- ✅ Campos de búsqueda frecuente (`email`, `employee_number`)
- ✅ Índices compuestos (`employee_id`, `dependent_seq`)
- ✅ Índices de fecha (`expires_at`, `accepted_at`)

### 🎉 CONCLUSIÓN DE NORMALIZACIÓN

**✅ LA BASE DE DATOS ESTÁ CORRECTAMENTE NORMALIZADA**

- **3NF cumplida** completamente
- **Relaciones bien diseñadas** sin redundancia
- **Integridad referencial** garantizada
- **Rendimiento optimizado** con índices apropiados
- **Trazabilidad completa** para auditoría y cumplimiento
- **Escalabilidad** preparada para crecimiento

**No se requieren cambios en la normalización actual.**

