# 🗺️ MAPEO DE DATOS - GENERACIÓN DE PDFs

## 🎯 OBJETIVO
Mapear todos los campos de base de datos necesarios para la generación de PDFs, siguiendo las convenciones del proyecto SGMM.

---

## 📊 MAPEO COMPLETO DE DATOS

### **1. DATOS DEL COLABORADOR (TITULAR)**

#### **Fuente**: Tabla `employees` (DATA_DICTIONARY.md líneas 69-118)

| Campo PDF | Campo BD | Tipo | Descripción | Ejemplo |
|-----------|----------|------|-------------|---------|
| `employeeNumber` | `employee_number` | VARCHAR(50) | Número de empleado | `"3619"` |
| `fullName` | `full_name` | VARCHAR(255) | Nombre completo | `"Jonahatan Angeles Rosas"` |
| `firstName` | `first_name` | VARCHAR(100) | Nombre(s) | `"Jonahatan"` |
| `paternalLastName` | `paternal_last_name` | VARCHAR(100) | Apellido paterno | `"Angeles"` |
| `maternalLastName` | `maternal_last_name` | VARCHAR(100) | Apellido materno | `"Rosas"` |
| `email` | `email` | VARCHAR(255) | Email corporativo | `"jonahatan.angeles@siegfried.com.mx"` |
| `birthDate` | `birth_date` | DATE | Fecha de nacimiento | `"1990-05-20"` |
| `age` | **CALCULADO** | NUMBER | Edad calculada | `34` |
| `gender` | `gender` | CHAR(1) | Sexo | `"M"` |
| `hireDate` | `hire_date` | DATE | Fecha de ingreso | `"2020-01-15"` |
| `department` | `department` | VARCHAR(100) | Departamento | `"Tecnología"` |
| `position` | `position` | VARCHAR(100) | Posición | `"Desarrollador Senior"` |
| `policyNumber` | `policy_number` | VARCHAR(100) | Número de póliza | `"POL-2025-3619"` |
| `status` | `status` | VARCHAR(20) | Estado del empleado | `"ACTIVE"` |

#### **Query Prisma**:
```typescript
const employee = await prisma.employees.findFirst({
  where: { 
    employee_number: employeeNumber,
    deleted_at: null,
    status: 'ACTIVE'
  },
  include: {
    company: true
  }
});
```

---

### **2. DATOS DE LA COMPAÑÍA**

#### **Fuente**: Tabla `companies` (DATA_DICTIONARY.md líneas 28-67)

| Campo PDF | Campo BD | Tipo | Descripción | Ejemplo |
|-----------|----------|------|-------------|---------|
| `companyName` | `name` | VARCHAR(255) | Nombre de la compañía | `"Siegfried Rhein"` |
| `companyCode` | `code` | VARCHAR(10) | Código de la compañía | `"SR"` |
| `logoUrl` | `logo_url` | VARCHAR(500) | URL del logo | `"https://drive.google.com/..."` |
| `primaryColor` | `primary_color` | VARCHAR(7) | Color primario | `"#1f2937"` |
| `secondaryColor` | `secondary_color` | VARCHAR(7) | Color secundario | `"#374151"` |

#### **Query Prisma**:
```typescript
const company = await prisma.companies.findFirst({
  where: { 
    id: employee.company_id,
    active: true
  }
});
```

---

### **3. DATOS DE DEPENDIENTES**

#### **Fuente**: Tabla `dependents` + `relationship_types` (DATA_DICTIONARY.md líneas 120-162)

| Campo PDF | Campo BD | Tipo | Descripción | Ejemplo |
|-----------|----------|------|-------------|---------|
| `dependentId` | `id` | VARCHAR(50) | ID del dependiente | `"3619-a01"` |
| `dependentSeq` | `dependent_seq` | INTEGER | Secuencia | `1` |
| `firstName` | `first_name` | VARCHAR(100) | Nombre(s) | `"María"` |
| `paternalLastName` | `paternal_last_name` | VARCHAR(100) | Apellido paterno | `"Angeles"` |
| `maternalLastName` | `maternal_last_name` | VARCHAR(100) | Apellido materno | `"García"` |
| `fullName` | **CALCULADO** | STRING | Nombre completo | `"María Angeles García"` |
| `birthDate` | `birth_date` | DATE | Fecha de nacimiento | `"2015-03-10"` |
| `age` | **CALCULADO** | NUMBER | Edad calculada | `9` |
| `gender` | `gender` | CHAR(1) | Sexo | `"F"` |
| `relationshipType` | `relationship_types.name` | VARCHAR(100) | Parentesco | `"Hija"` |
| `policyStartDate` | `policy_start_date` | DATE | Inicio de póliza | `"2025-01-01"` |
| `policyEndDate` | `policy_end_date` | DATE | Fin de póliza | `"2025-12-31"` |
| `status` | `status` | VARCHAR(20) | Estado | `"ACTIVE"` |
| `isFirstTime` | `is_first_time` | BOOLEAN | Primera vez | `true` |

#### **Query Prisma**:
```typescript
const dependents = await prisma.dependents.findMany({
  where: { 
    employee_id: employeeNumber,
    deleted_at: null,
    status: 'ACTIVE'
  },
  include: {
    relationship_type: true
  },
  orderBy: {
    dependent_seq: 'asc'
  }
});
```

---

### **4. DATOS CALCULADOS**

#### **Campos que requieren cálculo**:

| Campo | Cálculo | Descripción | Ejemplo |
|-------|---------|-------------|---------|
| `employeeAge` | `EXTRACT(YEAR FROM AGE(birth_date))` | Edad del empleado | `34` |
| `dependentAge` | `EXTRACT(YEAR FROM AGE(birth_date))` | Edad del dependiente | `9` |
| `dependentFullName` | `first_name + ' ' + paternal_last_name + ' ' + maternal_last_name` | Nombre completo | `"María Angeles García"` |
| `totalDependents` | `COUNT(dependents)` | Total de dependientes | `3` |
| `activeDependents` | `COUNT(dependents WHERE status = 'ACTIVE')` | Dependientes activos | `3` |
| `extraDependents` | `totalDependents - 1` | Dependientes extra (costo) | `2` |
| `generationDate` | `NOW()` | Fecha de generación | `"2025-01-15 14:30:00"` |

---

## 🔧 IMPLEMENTACIÓN DE MAPEO

### **1. Interface TypeScript**

```typescript
// types/pdf.types.ts
export interface CollaboratorPDFData {
  // Datos del colaborador
  employee: {
    employeeNumber: string;
    fullName: string;
    firstName: string;
    paternalLastName: string;
    maternalLastName: string;
    email: string;
    birthDate: string;
    age: number;
    gender: string;
    hireDate: string;
    department: string;
    position: string;
    policyNumber: string;
    status: string;
  };
  
  // Datos de la compañía
  company: {
    companyName: string;
    companyCode: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
  };
  
  // Datos de dependientes
  dependents: Array<{
    dependentId: string;
    dependentSeq: number;
    firstName: string;
    paternalLastName: string;
    maternalLastName: string;
    fullName: string;
    birthDate: string;
    age: number;
    gender: string;
    relationshipType: string;
    policyStartDate: string;
    policyEndDate: string;
    status: string;
    isFirstTime: boolean;
  }>;
  
  // Datos calculados
  calculated: {
    totalDependents: number;
    activeDependents: number;
    extraDependents: number;
    generationDate: string;
  };
}
```

### **2. Servicio de Mapeo**

```typescript
// services/PDFDataMapper.ts
export class PDFDataMapper {
  static async mapCollaboratorData(employeeNumber: string): Promise<CollaboratorPDFData> {
    // Obtener datos del empleado
    const employee = await prisma.employees.findFirst({
      where: { 
        employee_number: employeeNumber,
        deleted_at: null,
        status: 'ACTIVE'
      },
      include: {
        company: true,
        dependents: {
          where: {
            deleted_at: null,
            status: 'ACTIVE'
          },
          include: {
            relationship_type: true
          },
          orderBy: {
            dependent_seq: 'asc'
          }
        }
      }
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    // Mapear datos del empleado
    const employeeData = {
      employeeNumber: employee.employee_number,
      fullName: employee.full_name,
      firstName: employee.first_name || '',
      paternalLastName: employee.paternal_last_name || '',
      maternalLastName: employee.maternal_last_name || '',
      email: employee.email,
      birthDate: employee.birth_date?.toISOString().split('T')[0] || '',
      age: this.calculateAge(employee.birth_date),
      gender: employee.gender || '',
      hireDate: employee.hire_date.toISOString().split('T')[0],
      department: employee.department || '',
      position: employee.position || '',
      policyNumber: employee.policy_number || '',
      status: employee.status
    };

    // Mapear datos de la compañía
    const companyData = {
      companyName: employee.company.name,
      companyCode: employee.company.code,
      logoUrl: employee.company.logo_url || '',
      primaryColor: employee.company.primary_color,
      secondaryColor: employee.company.secondary_color
    };

    // Mapear datos de dependientes
    const dependentsData = employee.dependents.map(dep => ({
      dependentId: dep.id,
      dependentSeq: dep.dependent_seq,
      firstName: dep.first_name,
      paternalLastName: dep.paternal_last_name,
      maternalLastName: dep.maternal_last_name || '',
      fullName: `${dep.first_name} ${dep.paternal_last_name} ${dep.maternal_last_name || ''}`.trim(),
      birthDate: dep.birth_date.toISOString().split('T')[0],
      age: this.calculateAge(dep.birth_date),
      gender: dep.gender,
      relationshipType: dep.relationship_type.name,
      policyStartDate: dep.policy_start_date.toISOString().split('T')[0],
      policyEndDate: dep.policy_end_date?.toISOString().split('T')[0] || '',
      status: dep.status,
      isFirstTime: dep.is_first_time
    }));

    // Datos calculados
    const calculatedData = {
      totalDependents: dependentsData.length,
      activeDependents: dependentsData.filter(d => d.status === 'ACTIVE').length,
      extraDependents: Math.max(0, dependentsData.length - 1),
      generationDate: new Date().toISOString()
    };

    return {
      employee: employeeData,
      company: companyData,
      dependents: dependentsData,
      calculated: calculatedData
    };
  }

  private static calculateAge(birthDate: Date | null): number {
    if (!birthDate) return 0;
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age;
  }
}
```

---

## 📋 VALIDACIONES DE DATOS

### **Validaciones Obligatorias**

| Campo | Validación | Mensaje de Error |
|-------|------------|------------------|
| `employeeNumber` | Debe existir y estar activo | "Empleado no encontrado o inactivo" |
| `fullName` | No puede estar vacío | "Nombre completo requerido" |
| `email` | Debe ser válido | "Email inválido" |
| `birthDate` | Debe ser fecha válida | "Fecha de nacimiento inválida" |
| `company` | Debe existir | "Compañía no encontrada" |
| `dependents` | Al menos uno requerido | "Se requiere al menos un dependiente" |

### **Validaciones de Negocio**

| Regla | Validación | Mensaje de Error |
|-------|------------|------------------|
| **Límite de dependientes** | Máximo 10 | "Excede el límite de dependientes" |
| **Dependientes activos** | Al menos uno activo | "Se requiere al menos un dependiente activo" |
| **Fechas válidas** | Fechas de nacimiento válidas | "Fecha de nacimiento inválida" |
| **Parentescos válidos** | Tipos de parentesco válidos | "Parentesco inválido" |

---

## 🔍 QUERIES OPTIMIZADAS

### **Query Principal Optimizada**

```typescript
// Query optimizada para obtener todos los datos necesarios
const collaboratorData = await prisma.employees.findFirst({
  where: { 
    employee_number: employeeNumber,
    deleted_at: null,
    status: 'ACTIVE'
  },
  include: {
    company: {
      select: {
        name: true,
        code: true,
        logo_url: true,
        primary_color: true,
        secondary_color: true
      }
    },
    dependents: {
      where: {
        deleted_at: null,
        status: 'ACTIVE'
      },
      include: {
        relationship_type: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        dependent_seq: 'asc'
      }
    }
  }
});
```

### **Índices Recomendados**

```sql
-- Índices para optimizar queries
CREATE INDEX idx_employees_number_status ON employees(employee_number, status, deleted_at);
CREATE INDEX idx_dependents_employee_status ON dependents(employee_id, status, deleted_at);
CREATE INDEX idx_companies_active ON companies(active);
```

---

## 📊 MÉTRICAS DE RENDIMIENTO

### **Tiempos Objetivo**
- **Query de datos**: < 500ms
- **Mapeo de datos**: < 100ms
- **Total de obtención**: < 600ms

### **Optimizaciones**
- **Índices**: En campos de búsqueda frecuente
- **Select específico**: Solo campos necesarios
- **Caché**: Para datos de compañía (cambian poco)
- **Lazy loading**: Para dependientes si son muchos

---

*Mapeo realizado el: 15 de Enero 2025*
*Basado en DATA_DICTIONARY.md y DATABASE_SCHEMA_COMPLETE.md*
*Próxima actualización: Al completar implementación*
