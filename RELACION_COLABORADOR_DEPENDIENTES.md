# 🔗 Relación Colaborador-Dependientes en SGMM

## 📊 Estructura de la Relación

### **Relación Principal: 1:N (Uno a Muchos)**

```
┌─────────────────────────────────────────────────────────────────┐
│                         EMPLOYEE (Colaborador)                 │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)           │ cmf3e3rbk0007d89x8vy17ejl                 │
│ employee_number   │ SR-001                                     │
│ full_name         │ Juan Pérez García                          │
│ email             │ test.employee@siegfried.com.mx             │
│ company_id        │ company-sr-001                             │
│ hire_date         │ 2024-01-01                                 │
│ status            │ ACTIVE                                     │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N (Un empleado puede tener muchos dependientes)
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DEPENDENT (Dependientes)                 │
├─────────────────────────────────────────────────────────────────┤
│ employee_id (FK)  │ cmf3e3rbk0007d89x8vy17ejl                 │ ◄── CONECTA CON EMPLOYEE
│ dependent_seq     │ 1, 2, 3... (secuencia por empleado)        │
│ dependent_id      │ SR-001-DEP-001, SR-001-DEP-002...          │
│ first_name        │ María, Carlos...                           │
│ paternal_last_name│ Pérez, Pérez...                            │
│ maternal_last_name│ González, González...                      │
│ birth_date        │ 1990-05-15, 2015-03-22...                 │
│ gender            │ F, M                                       │
│ relationship_type_id │ 1, 2, 3... (referencia a tipos)        │
│ policy_start_date │ 2024-01-01                                 │
│ status            │ ACTIVE                                     │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ N:1 (Muchos dependientes, un tipo de relación)
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RELATIONSHIP_TYPE (Tipos de Parentesco)      │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)           │ 1, 2, 3, 4, 5                             │
│ name              │ Cónyuge, Hijo, Hija, Padre, Madre          │
│ display_order     │ 1, 2, 3, 4, 5                             │
│ active            │ true                                       │
└─────────────────────────────────────────────────────────────────┘
```

## 🔍 Ejemplo Práctico de la Relación

### **Colaborador: Juan Pérez García (SR-001)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMPLEADO: Juan Pérez García                  │
│                    Número: SR-001                               │
│                    Email: test.employee@siegfried.com.mx        │
└─────────────────────────────────────────────────────────────────┘
                                    │
                        ┌───────────┼───────────┐
                        │           │           │
                        ▼           ▼           ▼
        ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
        │   DEPENDIENTE #1    │ │   DEPENDIENTE #2    │ │   DEPENDIENTE #3    │
        │                     │ │                     │ │                     │
        │ Secuencia: 1        │ │ Secuencia: 2        │ │ Secuencia: 3        │
        │ ID: SR-001-DEP-001  │ │ ID: SR-001-DEP-002  │ │ ID: SR-001-DEP-003  │
        │ Nombre: María       │ │ Nombre: Carlos      │ │ Nombre: [Futuro]    │
        │ Parentesco: Hijo    │ │ Parentesco: Cónyuge │ │ Parentesco: [Futuro]│
        │ Género: F           │ │ Género: M           │ │ Género: [Futuro]    │
        │ Nacimiento:         │ │ Nacimiento:         │ │ Nacimiento:         │
        │ 1990-05-15          │ │ 2015-03-22          │ │ [Futuro]            │
        └─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

## 📋 Campos Clave de la Relación

### **1. Conexión Principal:**
- **`employees.id`** (PK) ← **`dependents.employee_id`** (FK)
- **Relación:** Un empleado puede tener muchos dependientes

### **2. Identificación Única:**
- **`dependent_seq`**: Secuencia del dependiente (1, 2, 3... por empleado)
- **`dependent_id`**: ID único global (formato: `{employee_number}-DEP-{seq}`)
- **Ejemplo:** `SR-001-DEP-001`, `SR-001-DEP-002`, `SR-002-DEP-001`

### **3. Parentesco:**
- **`relationship_type_id`** (FK) → **`relationship_types.id`** (PK)
- **Tipos disponibles:**
  - `1` = Cónyuge
  - `2` = Hijo  
  - `3` = Hija
  - `4` = Padre
  - `5` = Madre

## 🔧 Consultas Típicas

### **1. Obtener todos los dependientes de un empleado:**
```sql
SELECT d.*, rt.name as parentesco
FROM dependents d
JOIN relationship_types rt ON d.relationship_type_id = rt.id
WHERE d.employee_id = 'cmf3e3rbk0007d89x8vy17ejl'
ORDER BY d.dependent_seq;
```

### **2. Contar dependientes por empleado:**
```sql
SELECT 
    e.employee_number,
    e.full_name,
    COUNT(d.id) as total_dependientes
FROM employees e
LEFT JOIN dependents d ON e.id = d.employee_id
WHERE d.status = 'ACTIVE' OR d.id IS NULL
GROUP BY e.id, e.employee_number, e.full_name;
```

### **3. Buscar dependientes por parentesco:**
```sql
SELECT 
    e.full_name as empleado,
    d.first_name || ' ' || d.paternal_last_name as dependiente,
    rt.name as parentesco
FROM employees e
JOIN dependents d ON e.id = d.employee_id
JOIN relationship_types rt ON d.relationship_type_id = rt.id
WHERE rt.name = 'Hijo' AND d.status = 'ACTIVE';
```

## 📊 Datos de Ejemplo Actuales

### **Empleados:**
| ID | Número | Nombre | Email |
|----|--------|--------|-------|
| cmf3e3rbk0007d89x8vy17ejl | SR-001 | Juan Pérez García | test.employee@siegfried.com.mx |
| cmf3e3rbk0008d89x8vy17ejm | SR-002 | Jonahatan Angeles | jonahatan.angeles@siegfried.com.mx |
| dev-user-001 | DEV-001 | Usuario de Desarrollo | dev@sgmm.local |

### **Dependientes:**
| Empleado | Secuencia | ID Dependiente | Nombre | Parentesco | Género |
|----------|-----------|----------------|--------|------------|--------|
| SR-001 | 1 | SR-001-DEP-001 | María Pérez | Hijo | F |
| SR-001 | 2 | SR-001-DEP-002 | Carlos Pérez | Cónyuge | M |
| SR-002 | 1 | SR-002-DEP-001 | Ana Angeles | Hijo | F |

## 🎯 Características Importantes

### **✅ Ventajas del Diseño:**

1. **Escalabilidad**: Un empleado puede tener ilimitados dependientes
2. **Trazabilidad**: Cada dependiente tiene ID único y secuencia
3. **Flexibilidad**: Tipos de parentesco configurables
4. **Integridad**: Relaciones foráneas garantizan consistencia
5. **Auditoría**: Campos de timestamps para seguimiento

### **🔒 Reglas de Negocio:**

1. **Secuencia única**: `dependent_seq` es único por empleado
2. **ID único global**: `dependent_id` es único en toda la base de datos
3. **Soft delete**: Campo `deleted_at` para eliminación lógica
4. **Estado activo**: Campo `status` para control de estado
5. **Parentesco válido**: Solo tipos de relación existentes

### **🚀 Funcionalidades del Sistema:**

1. **Formulario de dependientes**: Captura todos los campos necesarios
2. **Validación de parentesco**: Solo tipos válidos permitidos
3. **Generación automática**: `dependent_id` y `dependent_seq` automáticos
4. **Aviso de privacidad**: Obligatorio para cada dependiente
5. **Auditoría completa**: Registro de todos los cambios

## 🎉 Conclusión

**La relación colaborador-dependientes está perfectamente diseñada:**

- ✅ **Relación 1:N** bien implementada
- ✅ **Campos únicos** para identificación
- ✅ **Tipos de parentesco** normalizados
- ✅ **Trazabilidad completa** garantizada
- ✅ **Escalabilidad** preparada para crecimiento
- ✅ **Integridad referencial** mantenida

**El sistema permite gestionar eficientemente la relación entre colaboradores y sus dependientes con total trazabilidad y cumplimiento legal.**

