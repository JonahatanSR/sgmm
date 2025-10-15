# 📝 CONVENCIONES DE NOMENCLATURA - SISTEMA SGMM

**Fecha**: 15 de Enero 2025  
**Propósito**: Referencia rápida para evitar errores de nomenclatura  
**Estado**: ACTIVO - CONSULTAR SIEMPRE

---

## 🎯 REGLA FUNDAMENTAL

El proyecto SGMM usa **diferentes convenciones** según el contexto:

| Contexto | Convención | Ejemplo |
|----------|------------|---------|
| **Tablas DB** | `snake_case` PLURAL | `employees`, `dependents`, `companies` |
| **Campos DB** | `snake_case` | `employee_id`, `is_active`, `created_at` |
| **Modelos Prisma** | PLURAL | `prisma.employees`, `prisma.dependents` |
| **Queries Prisma** | `snake_case` | `where: { employee_id: "3619" }` |
| **Interfaces TS** | `PascalCase` | `EmployeeData`, `DependentInfo` |
| **Propiedades TS** | `camelCase` o `snake_case` | Ver sección |

---

## 📋 TABLAS Y CAMPOS PRINCIPALES

### Tablas del Sistema SGMM:

| Tabla | Campos Clave |
|-------|--------------|
| `employees` | `id`, `employee_number`, `email`, `full_name`, `company_id`, `is_active` |
| `dependents` | `id`, `dependent_seq`, `employee_id`, `first_name`, `paternal_last_name` |
| `companies` | `id`, `name`, `code`, `logo_url`, `primary_color`, `is_active` |
| `relationship_types` | `id`, `name`, `display_order`, `is_active` |
| `audit_trails` | `id`, `employee_id`, `dependent_id`, `action`, `table_name`, `actor_id` |
| `privacy_acceptances` | `id`, `employee_id`, `dependent_id`, `acceptance_type`, `privacy_version` |
| `documents` | `id`, `employee_id`, `dependent_id`, `document_type`, `file_path` |
| `user_sessions` | `id`, `employee_id`, `session_token`, `ip_address`, `expires_at` |
| `admin_users` | `id`, `email`, `role`, `company_id`, `is_active` |
| `reports` | `id`, `employee_id`, `report_type`, `generated_at`, `status` |
| `system_config` | `key`, `value`, `description`, `value_type`, `updated_by` |

---

## ✅ CONVENCIÓN PRISMA CLIENT

### Modelos (PLURAL):
```typescript
✅ prisma.employees
✅ prisma.dependents
✅ prisma.companies
✅ prisma.relationship_types
✅ prisma.audit_trails
✅ prisma.privacy_acceptances
✅ prisma.documents
✅ prisma.user_sessions
✅ prisma.admin_users
✅ prisma.reports
✅ prisma.system_config

❌ prisma.employee
❌ prisma.dependent
❌ prisma.company
❌ prisma.auditTrail
```

### Campos en Queries (snake_case):
```typescript
// ✅ CORRECTO
where: {
  employee_id: "3619",
  is_active: true,
  company_id: "company-sr-001"
}

data: {
  first_name: "Jonahatan",
  paternal_last_name: "Angeles",
  maternal_last_name: "Rosas",
  created_at: new Date()
}

// ❌ INCORRECTO - Causará error TypeScript
where: {
  employeeId: "3619",           // ❌ Propiedad no existe
  isActive: true,              // ❌ Propiedad no existe
  companyId: "company-sr-001"  // ❌ Propiedad no existe
}
```

### Acceso a Resultados (snake_case):
```typescript
const employee = await prisma.employees.findFirst({...});

// ✅ CORRECTO
console.log(employee.employee_number);
console.log(employee.full_name);
console.log(employee.created_at);

// ❌ INCORRECTO - Propiedad undefined
console.log(employee.employeeNumber);   // undefined
console.log(employee.fullName);         // undefined
```

---

## 🔄 MAPEO DE CAMPOS COMUNES SGMM

### Campos de Auditoría:
| Campo DB | Uso en Prisma |
|----------|---------------|
| `created_at` | `created_at: new Date()` |
| `updated_at` | `updated_at: new Date()` |
| `deleted_at` | `deleted_at: new Date()` (soft delete) |
| `created_by` | `created_by: req.user.employee_number` |
| `deleted_by` | `deleted_by: req.user.employee_number` |

### Campos de Relación:
| Campo DB | Uso en Prisma |
|----------|---------------|
| `employee_id` | `employee_id: "3619"` |
| `dependent_id` | `dependent_id: "3619-a01"` |
| `company_id` | `company_id: "company-sr-001"` |
| `relationship_type_id` | `relationship_type_id: 1` |

### Campos de Estado:
| Campo DB | Uso en Prisma |
|----------|---------------|
| `status` | `status: "ACTIVE"` |
| `is_active` | `is_active: true` |
| `is_first_time` | `is_first_time: true` |

### Campos de Configuración:
| Campo DB | Uso en Prisma |
|----------|---------------|
| `employee_number` | `employee_number: "3619"` |
| `dependent_seq` | `dependent_seq: 1` |
| `privacy_version` | `privacy_version: "v1.0"` |

---

## ⚠️ ERRORES COMUNES SGMM

### Error 1: Modelo Singular
```typescript
❌ await prisma.employee.findMany()
✅ await prisma.employees.findMany()
```

### Error 2: camelCase en Queries
```typescript
❌ where: { employeeId: "3619", isActive: true }
✅ where: { employee_id: "3619", is_active: true }
```

### Error 3: Acceso a Campo Inexistente
```typescript
const employee = await prisma.employees.findFirst({...});

❌ employee.employeeNumber    // undefined
✅ employee.employee_number   // string

❌ employee.fullName          // undefined  
✅ employee.full_name         // string
```

### Error 4: ID Compuesto Incorrecto
```typescript
// Para dependientes, usar ID compuesto
❌ dependent.id = "12345"
✅ dependent.id = "3619-a01"  // employee_number + sequence
```

---

## 🔍 VALIDACIÓN ANTES DE CODIFICAR

**Checklist Obligatorio SGMM**:
1. [ ] ¿Verifiqué el nombre PLURAL del modelo en `schema.prisma`?
2. [ ] ¿Verifiqué el nombre snake_case de los campos en `schema.prisma`?
3. [ ] ¿Usé snake_case en mi query `where` / `data`?
4. [ ] ¿Mi código compila sin errores de TypeScript?
5. [ ] ¿Usé employee_number como ID estándar para empleados?
6. [ ] ¿Usé ID compuesto para dependientes (3619-a01)?

**Comando para verificar**:
```bash
# Ver schema de una tabla específica
grep -A 30 "model employees" backend/prisma/schema.prisma

# Compilar para verificar errores
cd backend && npx tsc --noEmit
```

---

## 📚 REFERENCIA RÁPIDA POR MÓDULO SGMM

### Auth Module:
- `prisma.employees` → `employee_number`, `email`, `full_name`, `company_id`
- `prisma.user_sessions` → `employee_id`, `session_token`, `expires_at`

### Employees Module:
- `prisma.employees` → `employee_number`, `first_name`, `paternal_last_name`, `maternal_last_name`
- `prisma.companies` → `id`, `name`, `code`, `primary_color`

### Dependents Module:
- `prisma.dependents` → `dependent_seq`, `employee_id`, `first_name`, `relationship_type_id`
- `prisma.relationship_types` → `name`, `display_order`

### Documents Module:
- `prisma.documents` → `employee_id`, `dependent_id`, `document_type`, `file_path`
- `prisma.privacy_acceptances` → `employee_id`, `dependent_id`, `acceptance_type`

### Audit Module:
- `prisma.audit_trails` → `employee_id`, `dependent_id`, `action`, `table_name`, `actor_id`

### Reports Module:
- `prisma.reports` → `employee_id`, `report_type`, `generated_at`, `status`
- `prisma.system_config` → `key`, `value`, `description`, `value_type`

---

## 🎯 CONVENCIONES ESPECÍFICAS SGMM

### IDs Estándar:
- **Empleados**: `employee_number` (ej: "3619")
- **Dependientes**: ID compuesto `{employee_number}-{sequence}` (ej: "3619-a01")
- **Compañías**: `company_id` (ej: "company-sr-001")

### Campos de Google AD:
- `google_id`: ID de Google AD
- `email`: Email corporativo (dominio autorizado)
- `first_name`, `paternal_last_name`, `maternal_last_name`: Campos separados
- `full_name`: Nombre completo concatenado

### Campos de Archivos:
- `original_filename`: Nombre original del archivo
- `stored_filename`: Nombre en storage
- `file_path`: Ruta en Google Drive
- `google_drive_file_id`: ID en Google Drive
- `is_first_time`: Primera vez del dependiente

### Campos de Auditoría:
- `actor_id`: Quien hizo la acción (employee_number)
- `actor_role`: Rol del actor (EMPLOYEE, HR_ADMIN, SUPER_ADMIN)
- `actor_email`: Email del actor
- `ip_address`: IP de la acción
- `user_agent`: User agent del navegador

---

## 🚨 CASOS ESPECIALES SGMM

### Soft Delete:
```typescript
// ✅ CORRECTO - Soft delete
await prisma.dependents.update({
  where: { id: "3619-a01" },
  data: { 
    deleted_at: new Date(),
    deleted_by: req.user.employee_number
  }
});

// ❌ INCORRECTO - Nunca usar delete físico
❌ await prisma.dependents.delete({ where: { id: "3619-a01" } })
```

### ID Compuesto para Dependientes:
```typescript
// ✅ CORRECTO - Generar ID compuesto
const dependentId = `${employeeNumber}-${sequence.toString().padStart(2, '0')}`;
// Resultado: "3619-a01", "3619-a02", etc.

// ❌ INCORRECTO - ID simple
❌ const dependentId = "12345";
```

### Búsqueda por Employee Number:
```typescript
// ✅ CORRECTO - Buscar por employee_number
const employee = await prisma.employees.findFirst({
  where: { employee_number: "3619" }
});

// ❌ INCORRECTO - Buscar por ID interno
❌ const employee = await prisma.employees.findFirst({
  where: { id: "clx1234567890" }
});
```

---

**Última Actualización**: 15 de Enero 2025  
**Versión**: 1.0  
**Estado**: ACTIVO - CONSULTAR SIEMPRE ANTES DE ESCRIBIR QUERIES PRISMA

---

## 🔍 RESOLUCIÓN DE INCONSISTENCIAS SGMM

**CUANDO HAY INCONSISTENCIA ENTRE DOCUMENTACIÓN Y TYPESCRIPT GENERADO**:

### **Metodología de Resolución SGMM**:
1. **Evaluar impacto** (bajo/medio/alto)
2. **Evaluar complejidad** (simple/media/compleja)  
3. **Evaluar riesgo** (mínimo/medio/alto)
4. **Decidir**: Si impacto bajo Y complejidad simple → Estándares industria
5. **Decidir**: Si impacto medio/alto O complejidad media/compleja → DATA_DICTIONARY.md
6. **Documentar**: Crear `/docs/DECISION_LOG_[MODULO].md`
7. **Integrar**: Actualizar documentación oficial
8. **Aplicar**: Type assertions temporales si es necesario

### **Casos Específicos SGMM**:
- **Employee ID**: Siempre usar `employee_number` como ID estándar
- **Dependent ID**: Siempre usar ID compuesto `{employee_number}-{sequence}`
- **Soft Delete**: Siempre usar `deleted_at` en lugar de eliminación física
- **Audit Trail**: Siempre registrar acciones en `audit_trails`
