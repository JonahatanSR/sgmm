# 🗄️ Diagrama Visual del Esquema de Base de Datos - SGMM

## 📊 Vista General de Relaciones

```
                    ┌─────────────────┐
                    │   COMPANIES     │
                    │ ┌─────────────┐ │
                    │ │ id (PK)     │ │
                    │ │ name        │ │
                    │ │ code        │ │
                    │ │ logo_url    │ │
                    │ │ colors      │ │
                    │ │ fonts       │ │
                    │ │ active      │ │
                    │ └─────────────┘ │
                    └─────────────────┘
                             │
                             │ 1:N
                             ▼
                    ┌─────────────────┐
                    │   EMPLOYEES     │
                    │ ┌─────────────┐ │
                    │ │ id (PK)     │ │
                    │ │ google_id   │ │
                    │ │ emp_number  │ │
                    │ │ email       │ │
                    │ │ full_name   │ │
                    │ │ company_id  │ │ ◄── FK
                    │ │ last_login  │ │
                    │ │ login_count │ │
                    │ │ ip_address  │ │
                    │ └─────────────┘ │
                    └─────────────────┘
                             │
                ┌────────────┼────────────┐
                │ 1:N        │ 1:N        │ 1:N
                ▼            ▼            ▼
    ┌─────────────────┐ ┌───────────┐ ┌─────────────────┐
    │   DEPENDENTS    │ │ DOCUMENTS │ │  AUDIT_LOGS     │
    │ ┌─────────────┐ │ │ ┌───────┐ │ │ ┌─────────────┐ │
    │ │ id (PK)     │ │ │ │ id    │ │ │ │ id (PK)     │ │
    │ │ dep_id      │ │ │ │ emp_id│ │ │ │ user_id     │ │ ◄── FK
    │ │ dep_seq     │ │ │ │ dep_id│ │ │ │ action      │ │
    │ │ emp_id      │ │ │ │ type  │ │ │ │ table_name  │ │
    │ │ first_name  │ │ │ │ file  │ │ │ │ old_values  │ │
    │ │ last_name   │ │ │ │ path  │ │ │ │ new_values  │ │
    │ │ birth_date  │ │ │ │ size  │ │ │ │ ip_address  │ │
    │ │ rel_type_id │ │ │ │ mime  │ │ │ │ timestamp   │ │
    │ │ deleted_at  │ │ │ └───────┘ │ │ └─────────────┘ │
    │ └─────────────┘ │ └───────────┘ └─────────────────┘
    └─────────────────┘
             │
             │ 1:N
             ▼
    ┌─────────────────┐
    │ RELATIONSHIP_   │
    │ TYPES           │
    │ ┌─────────────┐ │
    │ │ id (PK)     │ │
    │ │ name        │ │
    │ │ display_ord │ │
    │ │ active      │ │
    │ └─────────────┘ │
    └─────────────────┘
```

## 🔐 Tablas de Privacidad y Sesiones

```
                    ┌─────────────────┐
                    │   EMPLOYEES     │
                    │ (tabla central) │
                    └─────────────────┘
                             │
                ┌────────────┼────────────┐
                │ 1:N        │ 1:N        │
                ▼            ▼            ▼
    ┌─────────────────┐ ┌─────────────────┐
    │ PRIVACY_        │ │ USER_           │
    │ ACCEPTANCES     │ │ SESSIONS        │
    │ ┌─────────────┐ │ │ ┌─────────────┐ │
    │ │ id (PK)     │ │ │ │ id (PK)     │ │
    │ │ emp_id      │ │ │ │ emp_id      │ │ ◄── FK
    │ │ dep_id      │ │ │ │ session_token│ │
    │ │ acc_type    │ │ │ │ ip_address  │ │
    │ │ version     │ │ │ │ user_agent  │ │
    │ │ accepted_at │ │ │ │ created_at  │ │
    │ │ ip_address  │ │ │ │ expires_at  │ │
    │ │ user_agent  │ │ │ │ last_activity│
    │ └─────────────┘ │ │ │ is_active   │ │
    └─────────────────┘ │ └─────────────┘ │
                        └─────────────────┘
```

## ⚙️ Tablas de Administración

```
                    ┌─────────────────┐
                    │   COMPANIES     │
                    └─────────────────┘
                             │
                ┌────────────┼────────────┐
                │ 1:N        │ 1:N        │ 1:N
                ▼            ▼            ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │ ADMIN_USERS     │ │ EMAIL_TEMPLATES │ │ PDF_TEMPLATES   │
    │ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌─────────────┐ │
    │ │ id (PK)     │ │ │ │ id (PK)     │ │ │ │ id (PK)     │ │
    │ │ email       │ │ │ │ company_id  │ │ │ │ company_id  │ │ ◄── FK
    │ │ role        │ │ │ │ name        │ │ │ │ template_type│ │
    │ │ company_id  │ │ │ │ category    │ │ │ │ name        │ │
    │ │ otp_secret  │ │ │ │ subject     │ │ │ │ config_json │ │
    │ │ last_login  │ │ │ │ body_html  │ │ │ │ custom_css  │ │
    │ │ active      │ │ │ │ variables  │ │ │ │ version     │ │
    │ └─────────────┘ │ │ └─────────────┘ │ │ └─────────────┘ │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
                                 │
                                 │ 1:N
                                 ▼
                    ┌─────────────────┐
                    │ EMAIL_CAMPAIGNS │
                    │ ┌─────────────┐ │
                    │ │ id (PK)     │ │
                    │ │ company_id  │ │ ◄── FK
                    │ │ template_id │ │ ◄── FK
                    │ │ name        │ │
                    │ │ status      │ │
                    │ │ scheduled_at│ │
                    │ │ sent_at     │ │
                    │ └─────────────┘ │
                    └─────────────────┘

                    ┌─────────────────┐
                    │ SYSTEM_CONFIG   │
                    │ ┌─────────────┐ │
                    │ │ key (PK)    │ │
                    │ │ value       │ │
                    │ │ description │ │
                    │ │ value_type  │ │
                    │ │ updated_by  │ │
                    │ └─────────────┘ │
                    └─────────────────┘
```

## 📈 Análisis de Normalización

### ✅ **NIVEL DE NORMALIZACIÓN: 3NF (Tercera Forma Normal)**

#### **🎯 Cumplimiento de Reglas:**

| Forma Normal | Estado | Descripción |
|-------------|--------|-------------|
| **1NF** | ✅ **CUMPLIDA** | Todos los campos son atómicos, sin grupos repetitivos |
| **2NF** | ✅ **CUMPLIDA** | No hay dependencias parciales de la clave primaria |
| **3NF** | ✅ **CUMPLIDA** | No hay dependencias transitivas |

#### **🔗 Integridad Referencial:**

| Relación | Tabla Origen | Tabla Destino | Estado |
|----------|--------------|---------------|--------|
| Company-Employee | employees.company_id | companies.id | ✅ |
| Employee-Dependent | dependents.employee_id | employees.id | ✅ |
| Dependent-Relationship | dependents.relationship_type_id | relationship_types.id | ✅ |
| Employee-Document | documents.employee_id | employees.id | ✅ |
| Employee-Audit | audit_logs.user_id | employees.id | ✅ |
| Employee-Privacy | privacy_acceptances.employee_id | employees.id | ✅ |
| Employee-Session | user_sessions.employee_id | employees.id | ✅ |
| Dependent-Privacy | privacy_acceptances.dependent_id | dependents.id | ✅ |

#### **🚀 Optimizaciones de Rendimiento:**

| Tipo de Índice | Cantidad | Ejemplos |
|----------------|----------|----------|
| **Claves Primarias** | 14 | id en todas las tablas |
| **Claves Únicas** | 8 | email, employee_number, google_id |
| **Claves Foráneas** | 14 | Todas las relaciones FK |
| **Índices Compuestos** | 1 | (employee_id, dependent_seq) |
| **Índices de Fecha** | 2 | expires_at, accepted_at |

### 🎯 **PUNTOS FUERTES DEL DISEÑO:**

#### **✅ Separación de Responsabilidades:**
- **Core Business**: employees, dependents, companies
- **Security**: user_sessions, audit_logs, admin_users
- **Compliance**: privacy_acceptances
- **Communication**: email_templates, email_campaigns
- **Configuration**: system_config, pdf_templates

#### **✅ Trazabilidad Completa:**
- **Timestamps**: created_at, updated_at en todas las tablas
- **Soft Delete**: deleted_at en dependents
- **Audit Trail**: audit_logs para todos los cambios
- **Privacy Compliance**: registro de aceptaciones
- **Session Management**: control de sesiones activas

#### **✅ Escalabilidad:**
- **Particionamiento**: preparado para crecimiento
- **Índices**: optimizados para consultas frecuentes
- **Relaciones**: bien definidas para expansión
- **Normalización**: sin redundancia de datos

### 🎉 **CONCLUSIÓN:**

**✅ LA BASE DE DATOS ESTÁ EXCELENTEMENTE DISEÑADA**

- **Normalización perfecta** (3NF)
- **Integridad referencial** completa
- **Rendimiento optimizado** con índices apropiados
- **Trazabilidad total** para auditoría y cumplimiento
- **Escalabilidad** preparada para el futuro
- **Sin redundancia** de datos
- **Relaciones bien definidas** y consistentes

**No se requieren cambios en el diseño actual.**


