# 📝 CONVENCIONES DE NOMENCLATURA - EVALUATION 360 PLATFORM

**Fecha**: 11 de Octubre 2025  
**Propósito**: Referencia rápida para evitar errores de nomenclatura  
**Estado**: ACTIVO - CONSULTAR SIEMPRE

---

## 🎯 REGLA FUNDAMENTAL

El proyecto usa **diferentes convenciones** según el contexto:

| Contexto | Convención | Ejemplo |
|----------|------------|---------|
| **Tablas DB** | `snake_case` PLURAL | `tenants`, `campaigns`, `employees` |
| **Campos DB** | `snake_case` | `tenant_id`, `is_active`, `created_at` |
| **Modelos Prisma** | PLURAL | `prisma.campaigns`, `prisma.users` |
| **Queries Prisma** | `snake_case` | `where: { tenant_id: 1 }` |
| **Interfaces TS** | `PascalCase` | `CampaignData`, `TenantConfig` |
| **Propiedades TS** | `camelCase` o `snake_case` | Ver sección |

---

## 📋 TABLAS Y CAMPOS PRINCIPALES

### Tablas del Sistema:

| Tabla | Schema | Campos Clave |
|-------|--------|--------------|
| `tenants` | `shared_tenant` | `tenant_id`, `tenant_key`, `tenant_name`, `is_active` |
| `users` | `shared_auth` | `tenant_id`, `is_active`, `last_login`, `password_hash` |
| `employees` | `shared_employees` | `tenant_id`, `is_active`, `manager_email`, `employee_id` |
| `campaigns` | `softskills_data` | `tenant_id`, `period_year`, `employee_emails`, `spheres_configuration` |
| `evaluation_assignments` | `softskills_data` | `tenant_id`, `assignment_status`, `evaluado_email`, `manager_email` |
| `evaluation_sessions` | `softskills_data` | `assignment_id`, `reviewer_email`, `reviewer_type`, `is_completed` |
| `evaluation_periods` | `softskills_config` | `period_name`, `is_active`, `is_completed`, `year` |
| `sessions` | `shared_auth` | `user_id`, `token_hash`, `expires_at`, `ip_address` |

---

## ✅ CONVENCIÓN PRISMA CLIENT

### Modelos (PLURAL):
```typescript
✅ prisma.campaigns
✅ prisma.users  
✅ prisma.employees
✅ prisma.tenants
✅ prisma.evaluation_assignments
✅ prisma.evaluation_periods
✅ prisma.evaluation_sessions
✅ prisma.softskills_evaluations

❌ prisma.campaign
❌ prisma.user
❌ prisma.employee
❌ prisma.evaluationAssignment
```

### Campos en Queries (snake_case):
```typescript
// ✅ CORRECTO
where: {
  tenant_id: 1,
  is_active: true,
  period_year: 2025
}

data: {
  employee_emails: ['user@example.com'],
  assignments_created: 0,
  created_at: new Date()
}

// ❌ INCORRECTO - Causará error TypeScript
where: {
  tenantId: 1,           // ❌ Propiedad no existe
  isActive: true,        // ❌ Propiedad no existe
  periodYear: 2025       // ❌ Propiedad no existe
}
```

### Acceso a Resultados (snake_case):
```typescript
const campaign = await prisma.campaigns.findFirst({...});

// ✅ CORRECTO
console.log(campaign.tenant_id);
console.log(campaign.is_active);
console.log(campaign.created_at);

// ❌ INCORRECTO - Propiedad undefined
console.log(campaign.tenantId);   // undefined
console.log(campaign.isActive);   // undefined
```

---

## 🔄 MAPEO DE CAMPOS COMUNES

### Campos de Auditoría:
| Campo DB | Uso en Prisma |
|----------|---------------|
| `created_at` | `created_at: new Date()` |
| `updated_at` | `updated_at: new Date()` |
| `created_by` | `created_by: req.user.email` |
| `updated_by` | `updated_by: req.user.email` |

### Campos de Relación:
| Campo DB | Uso en Prisma |
|----------|---------------|
| `tenant_id` | `tenant_id: req.tenant.id` |
| `user_id` | `user_id: userId` |
| `campaign_id` | `campaign_id: campaignId` |
| `assignment_id` | `assignment_id: assignmentId` |

### Campos de Estado:
| Campo DB | Uso en Prisma |
|----------|---------------|
| `is_active` | `is_active: true` |
| `is_completed` | `is_completed: false` |

### Campos de Configuración:
| Campo DB | Uso en Prisma |
|----------|---------------|
| `period_year` | `period_year: 2025` |
| `employee_emails` | `employee_emails: ['email1', 'email2']` |
| `spheres_configuration` | `spheres_configuration: {...}` |

---

## ⚠️ ERRORES COMUNES

### Error 1: Modelo Singular
```typescript
❌ await prisma.campaign.findMany()
✅ await prisma.campaigns.findMany()
```

### Error 2: camelCase en Queries
```typescript
❌ where: { tenantId: 1, isActive: true }
✅ where: { tenant_id: 1, is_active: true }
```

### Error 3: Acceso a Campo Inexistente
```typescript
const user = await prisma.users.findFirst({...});

❌ user.isActive        // undefined
✅ user.is_active       // boolean

❌ user.lastLogin       // undefined  
✅ user.last_login      // Date | null
```

---

## 🔍 VALIDACIÓN ANTES DE CODIFICAR

**Checklist Obligatorio**:
1. [ ] ¿Verifiqué el nombre PLURAL del modelo en `schema.prisma`?
2. [ ] ¿Verifiqué el nombre snake_case de los campos en `schema.prisma`?
3. [ ] ¿Usé snake_case en mi query `where` / `data`?
4. [ ] ¿Mi código compila sin errores de TypeScript?

**Comando para verificar**:
```bash
# Ver schema de una tabla específica
grep -A 30 "model campaigns" backend/prisma/schema.prisma

# Compilar para verificar errores
cd backend && npx tsc --noEmit
```

---

## 📚 REFERENCIA RÁPIDA POR MÓDULO

### Auth Module:
- `prisma.tenants` → `tenant_id`, `tenant_key`, `tenant_name`, `is_active`
- `prisma.users` → `tenant_id`, `password_hash`, `is_active`, `last_login`
- `prisma.sessions` → `user_id`, `token_hash`, `expires_at`

### Campaigns Module:
- `prisma.campaigns` → `tenant_id`, `period_year`, `employee_emails`, `spheres_configuration`
- `prisma.employees` → `tenant_id`, `is_active`, `manager_email`, `employee_id`
- `prisma.evaluation_periods` → `period_name`, `is_active`, `year`

### Assignments Module:
- `prisma.evaluation_assignments` → `tenant_id`, `assignment_status`, `evaluado_email`
- `prisma.evaluation_sessions` → `assignment_id`, `is_completed`, `reviewer_type`

---

**Última Actualización**: 14 de Octubre 2025  
**Versión**: 1.1  
**Estado**: ACTIVO - CONSULTAR SIEMPRE ANTES DE ESCRIBIR QUERIES PRISMA

---

## 🔍 RESOLUCIÓN DE INCONSISTENCIAS (DECISIÓN FASE 4)

**CUANDO HAY INCONSISTENCIA ENTRE DOCUMENTACIÓN Y TYPESCRIPT GENERADO**:

### **Caso FASE 4 SOFTSKILLS (14 Oct 2025)**:
- **Inconsistencia**: TypeScript sugiere `softskills_evaluation_id` (singular + _id)
- **DATA_DICTIONARY.md Define**: `softskills_evaluations` (plural) según líneas 643, 776-778
- **Decisión**: USAR DATA_DICTIONARY.md como fuente de verdad
- **Implementación**: Type assertions temporales para resolver inconsistencias
- **Resultado**: 92.5% de errores eliminados, funcionalmente operativo

### **Metodología de Resolución**:
1. **Evaluar impacto** (bajo/medio/alto)
2. **Evaluar complejidad** (simple/media/compleja)  
3. **Evaluar riesgo** (mínimo/medio/alto)
4. **Decidir**: Si impacto bajo Y complejidad simple → Estándares industria
5. **Decidir**: Si impacto medio/alto O complejidad media/compleja → DATA_DICTIONARY.md
6. **Documentar**: Crear `/docs/DECISION_LOG_[MODULO].md`
7. **Integrar**: Actualizar documentación oficial
8. **Aplicar**: Type assertions temporales si es necesario




